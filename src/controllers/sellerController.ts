import { Request, Response } from "express";
import { UserModel } from "../models/UserModel";
import { UserEntity } from "../entities/UserEntity";
import { ApiResponseDto } from "../models/Dto/ApiResponseDto";
import { HttpStatus } from "../constant/constant";

// Get top-rated nearest 50 sellers
export const getListOfSellers = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(HttpStatus.BAD_REQUEST).json(new ApiResponseDto("fail", "Latitude and longitude are required", null, HttpStatus.BAD_REQUEST));
    }

    const sellers = await UserModel.find({
      type: "seller",
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
        },
      },
    },
    {
      name: 1,
      profilePic: 1,
      bio: 1,
      catList: 1,
      subCatList: 1,
      fcmToken: 1,
      media: 1,
      id: 1,
      rating: 1,
      location: 1,
    })
      .sort({ rating: -1 }) // Sort by rating in descending order
      .limit(50) // Limit to top 50 users

    if (sellers.length === 0) {
      return res.status(HttpStatus.NOT_FOUND).json(new ApiResponseDto("failure", "No sellers found within 20 km of the given location",
       undefined, HttpStatus.NOT_FOUND));
    }

    return res.status(HttpStatus.OK).json(new ApiResponseDto("success", "Sellers fetched successfully",
     sellers, HttpStatus.OK));

  } catch (error) {
    console.error(error);
    return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(new ApiResponseDto("failure", "Failed to retrieve sellers",
     undefined, HttpStatus.INTERNAL_SERVER_ERROR));
  }
};