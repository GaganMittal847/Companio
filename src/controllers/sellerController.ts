import { Router, Request, Response } from "express";
import { UserModel } from "../models/UserModel";
import { CalenderModel } from "../models/CalenderModel";
import { ApiResponseDto } from "../models/Dto/ApiResponseDto";
import { HttpStatus } from "../constant/constant";

export class SellerController {
    public router: Router;

    constructor() {
        this.router = Router();
        this.configureRoutes();
    }

    private configureRoutes(): void {
        this.router.get('/getListOfSellers', this.getListOfSellers);
    }

    private getListOfSellers = async (req: Request, res: Response) : Promise<any> => {
        try {
            console.log("🔹 Incoming request:", JSON.stringify(req.body, null, 2));
            const { location, filter, sortBy } = req.body;

            if (!location || !location.latitude || !location.longitude) {
                return res.status(HttpStatus.BAD_REQUEST).json(
                    new ApiResponseDto("fail", "Latitude and longitude are required", null, HttpStatus.BAD_REQUEST)
                );
            }

            const { latitude, longitude } = location;
            let sellers;
            const users = await UserModel.find({});
            console.log(" Users in the db " + users);

            if (filter) {
                if (this.requiresAggregation(filter)) {
                    console.log(" requiresAggregation for this query");
                    const calenders = await CalenderModel.find({});
                    console.log(" Calender in the db " + calenders);
                    const pipeline = this.buildAggregationPipeline(latitude, longitude, filter, sortBy);
                    sellers = await UserModel.aggregate(pipeline);
                } else {
                    console.log("filter wo Aggregation for this query");
                    sellers = await UserModel.find(this.getFilteredQuery(filter, latitude, longitude), this.getProjectionFields())
                        .sort(this.getSorting(sortBy))
                        .limit(50);
                }
            } else {
                sellers = await this.getSellersWithoutFilter(latitude, longitude, sortBy);
            }

            if (!sellers || sellers.length === 0) {
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

    private async getSellersWithoutFilter(latitude: number, longitude: number, sortBy : string) {
        return await UserModel.find({
            type: "seller",
            geoLocation: {
                $near: {
                    $geometry: { type: "Point", coordinates: [longitude, latitude] },
                    $maxDistance: 80000,
                },
            },
        }, this.getProjectionFields())
            .sort(this.getSorting(sortBy))
            .limit(50);
    }

    private requiresAggregation(filter: any): boolean {
        return filter.minPrice !== undefined || filter.maxPrice !== undefined || filter.dateRange !== undefined;
    }

    private buildAggregationPipeline(latitude: number, longitude: number, filter: any, sortBy: string) {
        const pipeline: any[] = [
            {
                $geoNear: {
                    near: { type: "Point", coordinates: [longitude, latitude] },
                    distanceField: "distance",
                    spherical: true,
                    key: "geoLocation"
                },
            },
            { $match: this.getFilterConditions(filter) },
            {
                $lookup: {
                    from: "calenders",
                    localField: "id",
                    foreignField: "sellerID",
                    as: "calendar",
                },
            },
            { $unwind: "$calendar" },
            { $match: this.getCalendarFilter(filter) },
            { $project: this.getProjectionFields() },
            { $sort: this.getSorting(sortBy) },
            { $limit: 50 },
        ];
        return pipeline;
    }

    private getFilteredQuery(filter: any, latitude: number, longitude: number) {
        console.log("query filter " + filter)

        return {
            type: "seller",
            geoLocation: {
                $near: {
                    $geometry: { type: "Point", coordinates: [longitude, latitude] },
                    $maxDistance: 80000,
                },
            },
            ...(filter.catList && { catList: { $in: filter.catList } }),
            ...(filter.subCatList && { subCatList: { $in: filter.subCatList } }),
            ...(filter.minRating && { rating: { $gte: filter.minRating } }),
        };
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

        if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
            conditions["calendar.categories.weekdayPrice"] = {
                ...(filter.minPrice !== undefined ? { $gte: filter.minPrice } : {}),
                ...(filter.maxPrice !== undefined ? { $lte: filter.maxPrice } : {}),
            };
            conditions["calendar.categories.weekendPrice"] = {
                ...(filter.minPrice !== undefined ? { $gte: filter.minPrice } : {}),
                ...(filter.maxPrice !== undefined ? { $lte: filter.maxPrice } : {}),
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

    private getProjectionFields() {
        return {
            name: 1,
            profilePic: 1,
            bio: 1,
            catList: 1,
            subCatList: 1,
            fcmToken: 1,
            media: 1,
            id: 1,
            rating: 1,
            geoLocation: 1,
        };
    }

    private getSorting(sortBy : string): any {
        const sortOptions: Record<string, any> = {
            highestRating: { rating: -1 },
            nearest: { "geoLocation.coordinates": 1 },
            newest: { createdAt: -1 },
        };
        return sortOptions[sortBy] || { rating: -1 };
    }
}
