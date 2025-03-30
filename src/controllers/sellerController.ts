import { Router, Request, Response } from "express";
import { UserModel } from "../models/UserModel";
import { ApiResponseDto } from "../models/Dto/ApiResponseDto";
import { HttpStatus } from "../constant/constant";
import { PipelineStage } from "mongoose"; // Import this at the top
import { CalenderModel } from "../models/CalenderModel";

export class SellerController {
    public router: Router;

    constructor() {
        this.router = Router();
        this.configureRoutes();
    }

    private configureRoutes(): void {
        this.router.post('/getListOfSellers', this.getListOfSellers);
        this.router.get('/getUserDataByID/:userId', this.getUserDataByID);
    }

    private getUserDataByID = async (req: Request, res: Response): Promise<any> => {
        try {
            const { userId } = req.params;
            console.log(`🔹 Fetching user data for ID: ${userId}`);

            // Validate if the user exists
            const user = await UserModel.findOne({id :  userId, type : 'seller'});
            if (!user) {
                return res.status(HttpStatus.NOT_FOUND).json(
                    new ApiResponseDto("fail", "User not found", null, HttpStatus.NOT_FOUND)
                );
            }

            // Fetch calendar data for the user
            const calendar = await CalenderModel.findOne({ sellerID: userId });

            return res.status(HttpStatus.OK).json(
                new ApiResponseDto("success", "User data fetched successfully", { user, calendar }, HttpStatus.OK)
            );
        } catch (error) {
            console.error("❌ Error in getUserDataByID:", error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
                new ApiResponseDto("failure", "Failed to fetch user data", undefined, HttpStatus.INTERNAL_SERVER_ERROR)
            );
        }
    };



    private getListOfSellers = async (req: Request, res: Response): Promise<any> => {
        try {
            console.log("🔹 Incoming request:", JSON.stringify(req.body, null, 2));
            const { location, filter, sortBy } = req.body;

            if (!location?.latitude || !location?.longitude) {
                return res.status(HttpStatus.BAD_REQUEST).json(
                    new ApiResponseDto("fail", "Latitude and longitude are required", null, HttpStatus.BAD_REQUEST)
                );
            }

            const { latitude, longitude } = location;
            let sellers;
            const users = await UserModel.find();
            console.log('Users in the db are ' + users);
            if (filter) {
                if (this.requiresAggregation(filter)) {
                    const calendar = await CalenderModel.find();
                    console.log('Calenders in the db are ' + calendar);
                    sellers = await UserModel.aggregate(this.buildAggregationPipeline(latitude, longitude, filter, sortBy));
                } else {
                    sellers = await this.getSellersWithoutFilter(latitude, longitude, sortBy, filter);
                }
            } else {
                sellers = await this.getSellersWithoutFilter(latitude, longitude, sortBy);
            }

            if (!sellers.length) {
                return res.status(HttpStatus.NOT_FOUND).json(
                    new ApiResponseDto("failure", "No sellers found", undefined, HttpStatus.NOT_FOUND)
                );
            }

            return res.status(HttpStatus.OK).json(
                new ApiResponseDto("success", "Sellers fetched successfully", sellers, HttpStatus.OK)
            );
        } catch (error) {
            console.error("❌ Error in getListOfSellers:", error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
                new ApiResponseDto("failure", "Failed to retrieve sellers", undefined, HttpStatus.INTERNAL_SERVER_ERROR)
            );
        }
    };

    private async getSellersWithoutFilter(latitude: number, longitude: number, sortBy: string, filter?: any) {
        const matchConditions = filter ? this.getFilterConditions(filter) : {};

        return await UserModel.aggregate([
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [longitude, latitude] },
                    distanceField: "distance",
                    spherical: true,
                    key: "geoLocation",
                    // maxDistance: 20000 // 20km in meters
                },
            },
            { $match: matchConditions },
            ...this.getBaseLookupAndProjection(),
            { $sort: this.getSorting(sortBy) },
            { $limit: 50 }
        ]);
    }

    private requiresAggregation(filter: any): boolean {
        return !!(filter.minPrice || filter.maxPrice || filter.dateRange);
    }

    private buildAggregationPipeline(latitude: number, longitude: number, filter: any, sortBy: string): PipelineStage[] {
        
        return [
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [longitude, latitude] },
                    distanceField: "distance",
                    spherical: true,
                    key: "geoLocation",
                    // maxDistance: 20000 // 20km in meters
                },
            },
            { $match: this.getFilterConditions(filter) },
            ...this.getBaseLookupAndProjection(),
            { $match: this.getCalendarFilter(filter) },
            { $sort: this.getSorting(sortBy) },
            { $limit: 50 }
        ];
    }

    private getBaseLookupAndProjection() {
        return [
            {
                $lookup: {
                    from: "calenders",
                    localField: "id",
                    foreignField: "sellerID",
                    as: "calendar",
                },
            },
            { $unwind: { path: "$calendar", preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    name: 1, profilePic: 1, bio: 1, catList: 1, subCatList: 1, fcmToken: 1, media: 1, id: 1, rating: { $toDouble: "$rating" } , geoLocation: 1,
                    "calendar.categories.weekdaysPrice": 1, "calendar.categories.weekendsPrice": 1, "calendar.categories.availability": 1
                }
            }
        ];
    }

    private getFilterConditions(filter: any) {
        return {
            ...(filter.catList && { catList: { $in: filter.catList } }),
            ...(filter.subCatList && { subCatList: { $in: filter.subCatList } }),
            ...(filter.gender && { gender: filter.gender }),
            ...(filter.minRating && { rating: { $gte: filter.minRating } }),
        };
    }

    private getCalendarFilter(filter: any) {
        const conditions: any = {};
        if (filter.minPrice || filter.maxPrice) {
            conditions["calendar.categories.weekdaysPrice"] = {
                ...(filter.minPrice && { $gte: filter.minPrice }),
                ...(filter.maxPrice && { $lte: filter.maxPrice }),
            };
            conditions["calendar.categories.weekendsPrice"] = {
                ...(filter.minPrice && { $gte: filter.minPrice }),
                ...(filter.maxPrice && { $lte: filter.maxPrice }),
            };
        }
        if (filter.dateRange) {
            conditions["calendar.categories.availability.days.date"] = {
                $gte: filter.dateRange.startDate,
                $lte: filter.dateRange.endDate,
            };
        }
        return conditions;
    }

    private getSorting(sortBy: string): any {
        return {
            highestRating: { rating: -1 },
            nearest: { distance: 1 },
            newest: { createdAt: -1 },
        }[sortBy] || { rating: -1 };
    }

}
