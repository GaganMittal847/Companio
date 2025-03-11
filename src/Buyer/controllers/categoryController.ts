import { Request, Response } from 'express';
import { CategoryModel } from '../models/CategoryModel'; // Import the category model
import { CategoryEntity } from '../entities/CategoryEntity'; // Import the category entity

// Get all categories
export const getCategories = async (req: Request, res: Response) => {
  try {
    const categories = await CategoryModel.find();
    return res.status(200).json(categories);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve categories' });
  }
};

// Create a new category
export const createCategory = async (req: Request, res: Response) => {
  const { name, cid, cdt, cpic }: CategoryEntity = req.body;  // Assuming CategoryEntity defines the shape of a category

  try {

    // Step 1: Find the last category by sorting in descending order of cid and get the first record
    const lastCategory = await CategoryModel.findOne().sort({ cid: -1 });

    // Step 2: Extract the numeric part of the last cid and increment it
    let newCid: string = 'c1';  // Default value if no categories exist yet

    if (lastCategory) {
      const lastCid = lastCategory.cid;
      // Extract the number part of the `cid` (assumes cid is always in the format 'c<number>')
      const lastNumber = parseInt(lastCid.substring(1)); 
      newCid = `c${lastNumber + 1}`; // Increment the number and create a new cid
    }

    // Step 3: Create the new category with the new `cid`
    const newCategory = new CategoryModel({
      name,
      cid: newCid,  // Set the newly generated cid
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
export const updateCategory = async (req: Request, res: Response) => {
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
export const deleteCategory = async (req: Request, res: Response) => {
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
