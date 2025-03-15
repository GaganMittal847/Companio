import { Request, Response } from 'express';
import { SubcategoryModel } from '../models/SubCategoryModel'; // Import the subcategory model
import { SubCategoryEntity } from '../entities/SubCategoryEntity'; // Import the subcategory entity

// Get all subcategories
export const getSubcategories = async (req: Request, res: Response) => {
  try {
    const subcategories = await SubcategoryModel.find();
    return res.status(200).json(subcategories);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to retrieve subcategories' });
  }
};

// Create a new subcategory
export const createSubcategory = async (req: Request, res: Response) => {
  const { name, scid, cdt, scpic, categoryId }: SubCategoryEntity = req.body; // Assuming SubCategoryEntity defines the shape of a subcategory

  try {
    const newSubcategory = new SubcategoryModel({
      name,
      scid,
      cdt,
      scpic,
      categoryId,
    });

    await newSubcategory.save();
    return res.status(201).json(newSubcategory);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to create subcategory' });
  }
};

// Update an existing subcategory by ID
export const updateSubcategory = async (req: Request, res: Response) => {
  const { scid } = req.params;
  const updateData = req.body; // Data to update (e.g., name, cdt, scpic, categoryId)

  try {
    const updatedSubcategory = await SubcategoryModel.findByIdAndUpdate(scid, updateData, { new: true });
    
    if (!updatedSubcategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    return res.status(200).json(updatedSubcategory);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update subcategory' });
  }
};

// Delete a subcategory by ID
export const deleteSubcategory = async (req: Request, res: Response) => {
  const { scid } = req.params;

  try {
    const deletedSubcategory = await SubcategoryModel.findByIdAndDelete(scid);

    if (!deletedSubcategory) {
      return res.status(404).json({ message: 'Subcategory not found' });
    }

    return res.status(200).json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete subcategory' });
  }
};
