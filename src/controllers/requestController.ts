import { Router , Request, Response } from 'express';
import { CategoryModel } from '../models/CategoryModel';
import { SubcategoryModel } from '../models/SubCategoryModel'; 
import { CategoryEntity } from '../entities/CategoryEntity'; // Import the category entity
import { HttpStatus } from "../constant/constant";
import { UserModel } from "../models/UserModel";
import { ApiResponseDto } from "../models/Dto/ApiResponseDto";
import  { RequestModel } from "../models/RequestModel"
import { RequestStatus, RequestType, BookingRequest } from '../entities/BookingRequestEntity'


// Get all categories

export class RequestController{

  public router: Router;

  constructor() {
      this.router = Router();
      this.configureRoutes();
  }

  private configureRoutes(): void {
     this.router.post('/requestBooking', this.createUnicastBooking);
     this.router.get('/getRequests/:userId', this.getUserRequests);

  }

  //Pending
  //1. Validation of whether the companion is registered with the given catId and SubCatID
  //2. Validation of whether the time slot is available or not
  //3. Validate if the price is correct as per companion profile

  private createUnicastBooking = async (req: Request, res: Response): Promise<any> => {
    try {
        console.log("🔹 Incoming request for createRequest:", JSON.stringify(req.body, null, 2));
        const requestData = req.body;
        const { location, catId, subCatId, userId, companionId, price, date, slots, finalPrice } = req.body;

        // Validate required fields
        if (!location || !location.latitude || !location.longitude) {
            return res.status(HttpStatus.BAD_REQUEST).json(
                new ApiResponseDto("fail", "Valid location with latitude and longitude is required", null, HttpStatus.BAD_REQUEST)
            );
        }
        
        // Validate required fields
        const requiredFields = { catId, subCatId, userId, companionId, price, date, slots, finalPrice };
            for (const [key, value] of Object.entries(requiredFields)) {
                if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
                    return res.status(HttpStatus.BAD_REQUEST).json(
                        new ApiResponseDto("fail", `${key} is required`, null, HttpStatus.BAD_REQUEST)
                    );
                }
            }

        // Check if entities exist in the database
        const validationErrors = await this.validateEntitiesExistence(userId, companionId, catId, subCatId);
        if (validationErrors.length) {
            return res.status(HttpStatus.NOT_FOUND).json(
                new ApiResponseDto("fail", validationErrors.join(", "), null, HttpStatus.NOT_FOUND)
            );
        }

        const newRequest = new RequestModel({
            ...req.body,
            requestStatus: "REQUESTED"
        });
        await newRequest.save();

        return res.status(HttpStatus.OK).json(
            new ApiResponseDto("success", "Request created successfully", newRequest, HttpStatus.OK)
        );
    } catch (error) {
        console.error("❌ Error in createRequest:", error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
            new ApiResponseDto("failure", "Failed to create request", undefined, HttpStatus.INTERNAL_SERVER_ERROR)
        );
    }
  };

  private getUserRequests = async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = req.params;
        console.log(`🔹 Fetching requests for user: ${userId}`);

        if (!userId) {
            return res.status(HttpStatus.BAD_REQUEST).json(
                new ApiResponseDto("fail", "userId is required", null, HttpStatus.BAD_REQUEST)
            );
        }

        // Validate if the user exists
        const userExists = await UserModel.exists({ id: userId, type: "buyer" });

        if (!userExists) {
            return res.status(HttpStatus.NOT_FOUND).json(
                new ApiResponseDto("fail", "User not found", null, HttpStatus.NOT_FOUND)
            );
        }

        const userRequests = await RequestModel.find({ userId });

        if (!userRequests.length) {
            return res.status(HttpStatus.NOT_FOUND).json(
                new ApiResponseDto("fail", "No requests found for this user", null, HttpStatus.NOT_FOUND)
            );
        }

        return res.status(HttpStatus.OK).json(
            new ApiResponseDto("success", "Requests fetched successfully", userRequests, HttpStatus.OK)
        );
    } catch (error) {
        console.error("❌ Error in getUserRequests:", error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
            new ApiResponseDto("failure", "Failed to fetch user requests", undefined, HttpStatus.INTERNAL_SERVER_ERROR)
        );
    }
  };

  private validateEntitiesExistence = async (userId: string, companionId: string, catId: string, subCatId: string): Promise<string[]> => {
    const errors: string[] = [];
    const userExists = await UserModel.exists({ id: userId, type: "buyer" });
    if (!userExists) errors.push("User does not exist");

    const companionExists = await UserModel.exists({ id: companionId, type: "seller"  });
    if (!companionExists) errors.push("Companion does not exist");

    const categoryExists = await CategoryModel.exists({ cid: catId });
    if (!categoryExists) errors.push("Category does not exist");

    const subCategoryExists = await SubcategoryModel.exists({ scid: subCatId });
    if (!subCategoryExists) errors.push("Sub-category does not exist");

    return errors;
  };
}


