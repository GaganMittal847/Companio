import { Router , Request, Response } from 'express';
import { CategoryModel } from '../models/CategoryModel'; // Import the category model
import { CategoryEntity } from '../entities/CategoryEntity'; // Import the category entity
import { HttpStatus } from "../constant/constant";
import { UserModel } from "../models/UserModel";
import { ApiResponseDto } from "../models/Dto/ApiResponseDto";
import  { BookingRequestModel } from "../models/BookingRequestModel"
import { RequestStatus, RequestType, BookingRequest } from '../entities/BookingRequestEntity'



// Get all categories

export class CategoryController{

  public router: Router;

  constructor() {
      this.router = Router();
      this.configureRoutes();
  }

  private configureRoutes(): void {
     this.router.get('/rerquestBooking', this.createUnicastBooking);
  }

  private createUnicastBooking = async (req: Request, res: Response) => {
    try {
        console.log("🔹 Incoming Unicast Booking Request:", JSON.stringify(req.body, null, 2));

        const { buyerID, sellerID, categoryId, subCategoryId, bookingDate, priceRange, comments } = req.body;

        // Validate required fields
        if (!buyerID || !sellerID || !categoryId || !subCategoryId || !bookingDate || !priceRange?.minPrice || !priceRange?.maxPrice) {
            console.warn("⚠️ Missing required fields in request.");
            return res.status(HttpStatus.BAD_REQUEST).json({
                status: "fail",
                message: "All fields (buyerID, sellerID, categoryId, subCategoryId, bookingDate, priceRange) are required",
            });
        }

        // Check if seller exists
        const sellerExists = await UserModel.findOne({ id: sellerID, type: "seller" });
        if (!sellerExists) {
            console.warn("⚠️ Seller not found.");
            return res.status(HttpStatus.NOT_FOUND).json({
                status: "fail",
                message: "Seller not found",
            });
        }

        // Create a new booking request
        const newBooking = new BookingRequestModel({
            buyerID,
            sellerID,
            categoryId,
            subCategoryId,
            requestType: RequestType.UNICAST,
            bookingDate,
            priceRange,
            status: RequestStatus.CREATED,
            comments
        });

        // Save to database
        await newBooking.save();

        console.log("✅ Unicast Booking Request Created Successfully.");
        return res.status(HttpStatus.OK).json(
            new ApiResponseDto("success", "Unicast booking request created successfully", newBooking, HttpStatus.OK)
        );
 
    } catch (error) {
        console.error("❌ Error in createUnicastBooking:", error);
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
            new ApiResponseDto("failure",  "Failed to create booking request", error.messageefined, HttpStatus.INTERNAL_SERVER_ERROR)
        );
    }
};


}