import { Router , Request, Response } from 'express';
import { CategoryModel } from '../models/CategoryModel'; // Import the category model
import { CategoryEntity } from '../entities/CategoryEntity'; // Import the category entity

// Get all categories

export class CategoryController{

  public router: Router;

  constructor() {
      this.router = Router();
      this.configureRoutes();
  }

  private configureRoutes(): void {
     this.router.post('/getCategories', this.getCategories);
     this.router.post('/createCategory', this.createCategory);
     this.router.post('/updateCategory', this.updateCategory);
     this.router.post('/deleteCategory', this.deleteCategory);
  }

    private getCategories = async (req: Request, res: any) => {
      try {
        const categories = await CategoryModel.find();
        return res.status(200).json(categories);
      } catch (error) {
        return res.status(500).json({ message: 'Failed to retrieve categories' });
      }
    };

    // Create a new category
    private createCategory = async (req: Request, res: any) => {
      const { name, cid, cdt, cpic }: CategoryEntity = req.body;  // Assuming CategoryEntity defines the shape of a category

      try {
        const newCategory = new CategoryModel({
          name,
          cid,
          cdt,
          cpic,
        });

        await newCategory.save();
        return res.status(201).json(newCategory);
      } catch (error) {
        return res.status(500).json({ message: 'Failed to create category' });
      }
    };

    // Update an existing category by ID
    private updateCategory = async (req: Request, res: any) => {
      const { cid } = req.params;
      const updateData = req.body;  // Data to update (e.g., name, cdt, cpic)

      try {
        const updatedCategory = await CategoryModel.findByIdAndUpdate(cid, updateData, { new: true });
        
        if (!updatedCategory) {
          return res.status(404).json({ message: 'Category not found' });
        }

        return res.status(200).json(updatedCategory);
      } catch (error) {
        return res.status(500).json({ message: 'Failed to update category' });
      }
    };

    // Delete a category by ID
    private deleteCategory = async (req: Request, res: any) => {
      const { cid } = req.params;

      try {
        const deletedCategory = await CategoryModel.findByIdAndDelete(cid);

        if (!deletedCategory) {
          return res.status(404).json({ message: 'Category not found' });
        }

        return res.status(200).json({ message: 'Category deleted successfully' });
      } catch (error) {
        return res.status(500).json({ message: 'Failed to delete category' });
      }
    };
}