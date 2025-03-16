import { Request, Response } from 'express';
import { SellerModel } from '../models/SellerModel';
import { Seller } from '../entities/SellerEntity';
import { ApiResponseDto } from '../models/Dto/ApiResponseDto'; 
import { HttpStatus } from '../constant/constant';

// Get sellers within a 20 km range from the given location
// Get top rated nearest 50 sellers
export const getListOfSellers = async (req: Request, res: Response) => {
    try {
      // Extract the latitude and longitude from the request body (or query)
      const { latitude, longitude } = req.body;
      console.log("Request body - ");
      console.log(req.body);
  
      // Validate input
      if (!latitude || !longitude) {
        const response = new ApiResponseDto<string>(
          'failure',
          'Latitude and longitude are required',
          undefined,
          HttpStatus.BAD_REQUEST
        );
        return res.status(HttpStatus.BAD_REQUEST).json(response);
      }
  
      // Define the maximum search distance (20 km converted to meters)
      const maxDistance = 20 * 1000; // 20 kilometers in meters
  
      // Find sellers within the specified range using geospatial query
      const sellers = await SellerModel.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [longitude, latitude] // [longitude, latitude]
            },
            $maxDistance: maxDistance // 20 km in meters
          }
        }
      });
  
      if (sellers.length === 0) {
        const response = new ApiResponseDto<string>(
          'failure',
          'No sellers found within 20 km of the given location',
          undefined,
          HttpStatus.NOT_FOUND
        );
        return res.status(HttpStatus.NOT_FOUND).json(response);
      }
  
      const response = new ApiResponseDto<Seller[]>(
        'success',
        'Sellers fetched successfully',
        sellers,
        HttpStatus.OK
      );
      return res.status(HttpStatus.OK).json(response);
    } catch (error) {
      console.error(error);
  
      const response = new ApiResponseDto<string>(
        'failure',
        'Failed to retrieve sellers',
        undefined,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(response);
    }
  };


