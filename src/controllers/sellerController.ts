//import { Router, Request, Response, response, application } from 'express';
import {Router, Request, Response } from "express";
import { UserModel } from "../models/UserModel";
import { ApiResponseDto } from "../models/Dto/ApiResponseDto";
import { HttpStatus } from "../constant/constant";

// Get top-rated nearest 50 sellers

export class SellerController{

  public router: Router;

  constructor() {
      this.router = Router();
      this.configureRoutes();
  }

  private configureRoutes(): void {
     this.router.get('/getListOfSellers', this.getListOfSellers);
   //  this.router.post('/catRegistration', this.categoryRegistration);

  }

  private getListOfSellers = async (req: Request, res: Response) => {
    try {
        console.log("🔹 Incoming request:", JSON.stringify(req.body, null, 2));
        const { location, filter, sortBy } = req.body;

        if (!location || !location.latitude || !location.longitude) {
            console.warn("⚠️ Missing latitude/longitude in request.");
            return res.status(HttpStatus.BAD_REQUEST).json(
                new ApiResponseDto("fail", "Latitude and longitude are required", null, HttpStatus.BAD_REQUEST)
            );
        }

        const { latitude, longitude } = location;
        let sellers;

        if (filter) {
            if (this.requiresAggregation(filter)) {
                // If aggregation is required (price range or calendar filtering)
                const pipeline = this.buildAggregationPipeline(latitude, longitude, filter, sortBy);
                sellers = await UserModel.aggregate(pipeline);
            } else {
                // If no aggregation is required, use simple filtering
                sellers = await UserModel.find(this.getFilteredQuery(filter, latitude, longitude), this.getProjectionFields())
                    .sort(this.getSorting(sortBy))
                    .limit(50);
            }
        } else {
            // No filters, use base query
            sellers = await UserModel.find(this.getBaseQuery(latitude, longitude), this.getProjectionFields())
                .sort(this.getSorting(sortBy))
                .limit(50);
        }

        if (!sellers || sellers.length === 0) {
            console.warn("⚠️ No sellers found.");
            return res.status(HttpStatus.NOT_FOUND).json(
                new ApiResponseDto("failure", "No sellers found within 20 km of the given location", undefined, HttpStatus.NOT_FOUND)
            );
        }

        console.log("✅ Sellers fetched successfully.");
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


    /**
   * Determines whether aggregation is required.
   * Aggregation is needed if filtering by price range or calendar availability.
   * @param filter - The filter object from the request
   * @returns Boolean - true if aggregation is required, otherwise false
   */
  private requiresAggregation(filter: any): boolean {
    return filter.minPrice !== undefined || filter.maxPrice !== undefined || filter.calender !== undefined;
  }

  /**
  * Builds an aggregation pipeline for filtering based on price range and calendar availability.
  * @param latitude - User's latitude
  * @param longitude - User's longitude
  * @param filter - Filters from the request
  * @param sortBy - Sorting criteria
  * @returns Aggregation pipeline array
  */
  private buildAggregationPipeline(latitude: number, longitude: number, filter: any, sortBy: string) {
    const pipeline: any[] = [
        {
            $geoNear: {
                near: { type: "Point", coordinates: [longitude, latitude] },
                distanceField: "distance",
                maxDistance: 20000, // 20km
                spherical: true,
            },
        },
        { $match: this.getFilterConditions(filter) }, // Apply filters dynamically
        {
            $lookup: {
                from: "calenders",
                localField: "id",
                foreignField: "sellerID",
                as: "calendar",
            },
        },
        { $unwind: "$calendar" }, // Flatten calendar data
        { $match: this.getCalendarPriceFilter(filter) }, // Apply price range filter if needed
        { $project: this.getProjectionFields() }, // Select specific fields
        { $sort: this.getSorting(sortBy) }, // Apply sorting
        { $limit: 50 }, // Limit results
    ];
    console.log("📌 Aggregation Pipeline:", JSON.stringify(pipeline, null, 2));
    return pipeline;
  }

  /**
  * Returns the query object for simple filtering (when aggregation is not needed).
  * @param filter - The filter object from the request
  * @param latitude - User's latitude
  * @param longitude - User's longitude
  * @returns MongoDB query object
  */
  private getFilteredQuery(filter: any, latitude: number, longitude: number) {
    const query = {
        type: "seller",
        geoLocation: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                },
                $maxDistance: 20000, // 20km
            },
        },
        ...(filter.catList && { catList: { $in: filter.catList } }),
        ...(filter.subCatList && { subCatList: { $in: filter.subCatList } }),
        ...(filter.gender && { gender: filter.gender }),
        ...(filter.minRating && { rating: { $gte: filter.minRating } }),
    };

    console.log("🔍 Generated filtered query:", JSON.stringify(query, null, 2));
    return query;
  }

  /**
  * Returns the query object for basic searches (when no filters are applied).
  * @param latitude - User's latitude
  * @param longitude - User's longitude
  * @returns MongoDB query object
  */
  private getBaseQuery(latitude: number, longitude: number) {
    return {
        type: "seller",
        geoLocation: {
            $near: {
                $geometry: {
                    type: "Point",
                    coordinates: [longitude, latitude],
                },
                $maxDistance: 20000, // 20km
            },
        },
    };
  }

  /**
  * Returns the filtering conditions for aggregation pipeline.
  * @param filter - The filter object from the request
  * @returns MongoDB query object for `$match`
  */
  private getFilterConditions(filter: any) {
    return {
        ...(filter.catList && { catList: { $in: filter.catList } }),
        ...(filter.subCatList && { subCatList: { $in: filter.subCatList } }),
        ...(filter.gender && { gender: filter.gender }),
        ...(filter.minRating && { rating: { $gte: filter.minRating } }),
    };
  }

  /**
  * Returns the query for filtering calendar-based price range.
  * @param filter - The filter object from the request
  * @returns MongoDB query object for `$match` on calendar data
  */
  private getCalendarPriceFilter(filter: any) {
    if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
        return {
            $or: [
                {
                    "calendar.categories.weekdayPrice": {
                        ...(filter.minPrice !== undefined ? { $gte: filter.minPrice } : {}),
                        ...(filter.maxPrice !== undefined ? { $lte: filter.maxPrice } : {}),
                    },
                },
                {
                    "calendar.categories.weekendPrice": {
                        ...(filter.minPrice !== undefined ? { $gte: filter.minPrice } : {}),
                        ...(filter.maxPrice !== undefined ? { $lte: filter.maxPrice } : {}),
                    },
                },
            ],
        };
    }
    return {};
  }

  /**
  * Returns the projection fields to optimize the query.
  * @returns Projection object
  */
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

    /**
   * Determines sorting logic based on sortBy parameter
   * @param sortBy - Sorting parameter from request
   * @returns MongoDB sorting object
   */
  private getSorting(sortBy?: string): any {
    let sortCriteria;

    switch (sortBy) {
        case "highestRating":
            sortCriteria = { rating: -1 };
            break;
        case "nearest":
            sortCriteria = { "geoLocation.coordinates": 1 };
            break;
        case "newest":
            sortCriteria = { createdAt: -1 };
            break;
        default:
            sortCriteria = { rating: -1 };
    }

    console.log("🧩 Sorting applied:", JSON.stringify(sortCriteria, null, 2));
    return sortCriteria;
  }




}