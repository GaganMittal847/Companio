import { Router , Request, Response } from "express";
import { SubcategoryModel } from "../models/SubCategoryModel"; // Import the subcategory model
import { SubCategoryEntity } from "../entities/SubCategoryEntity"; // Import the subcategory entity
import { ApiResponseDto } from "../models/Dto/ApiResponseDto";
import { CategoryModel } from "../models/CategoryModel"; // Import the category model
import { HttpStatus } from "../constant/constant"; // Import HttpStatus



export class SubCategoryController{

  public router: Router;

  constructor() {
      this.router = Router();
      this.configureRoutes();
  }

  private configureRoutes(): void {
     this.router.post('/getSubcategories', this.getSubcategories);
     this.router.post('/createSubcategory', this.createSubcategory);
     this.router.post('/deleteSubcategory', this.deleteSubcategory);
     this.router.post('/updateSubcategory', this.updateSubcategory);
  }

    // Get all subcategories
    private getSubcategories = async (req: Request, res: any) => {
      try {
        const subcategories = await SubcategoryModel.find();
        return res
          .status(HttpStatus.OK)
          .json(new ApiResponseDto("success", "Subcategories retrieved successfully", subcategories, HttpStatus.OK));
      } catch (error) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(new ApiResponseDto("fail", "Failed to retrieve subcategories", null, HttpStatus.INTERNAL_SERVER_ERROR));
      }
    };

    // Create a new subcategory
    private createSubcategory = async (req: Request, res: any) => {
      const { name, scid, cdt, scpic, categoryId }: SubCategoryEntity = req.body;

      try {
        // Check if category exists

        const categoryExists = await CategoryModel.findOne({ cid: categoryId });
        const allCategories = await CategoryModel.find();

        console.log(allCategories)

        if (!categoryExists) {
          console.log("cateogry does not exist")
          return res
            .status(HttpStatus.NOT_FOUND)
            .json(new ApiResponseDto("fail", "Category ID not found", null, HttpStatus.NOT_FOUND));
        }

        const newSubcategory = new SubcategoryModel({
          name,
          scid,
          cdt,
          scpic,
          categoryId,
        });

        await newSubcategory.save();
        return res
          .status(HttpStatus.CREATED)
          .json(new ApiResponseDto("success", "Subcategory created successfully", newSubcategory, HttpStatus.CREATED));
      } catch (error) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(new ApiResponseDto("fail", "Failed to create subcategory", null, HttpStatus.INTERNAL_SERVER_ERROR));
      }
    };

    // Update an existing subcategory by ID
    private updateSubcategory = async (req: Request, res: any) => {
      const { scid } = req.params;
      const updateData = req.body;

      try {
        const updatedSubcategory = await SubcategoryModel.findByIdAndUpdate(scid, updateData, { new: true });

        if (!updatedSubcategory) {
          return res
            .status(HttpStatus.NOT_FOUND)
            .json(new ApiResponseDto("fail", "Subcategory not found", null, HttpStatus.NOT_FOUND));
        }

        return res
          .status(HttpStatus.OK)
          .json(new ApiResponseDto("success", "Subcategory updated successfully", updatedSubcategory, HttpStatus.OK));
      } catch (error) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(new ApiResponseDto("fail", "Failed to update subcategory", null, HttpStatus.INTERNAL_SERVER_ERROR));
      }
    };

    // Delete a subcategory by ID
    private deleteSubcategory = async (req: Request, res: any) => {
      const { scid } = req.params;

      try {
        const deletedSubcategory = await SubcategoryModel.findByIdAndDelete(scid);

        if (!deletedSubcategory) {
          return res
            .status(HttpStatus.NOT_FOUND)
            .json(new ApiResponseDto("fail", "Subcategory not found", null, HttpStatus.NOT_FOUND));
        }

        return res
          .status(HttpStatus.OK)
          .json(new ApiResponseDto("success", "Subcategory deleted successfully", null, HttpStatus.OK));
      } catch (error) {
        return res
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .json(new ApiResponseDto("fail", "Failed to delete subcategory", null, HttpStatus.INTERNAL_SERVER_ERROR));
      }
    };
}
