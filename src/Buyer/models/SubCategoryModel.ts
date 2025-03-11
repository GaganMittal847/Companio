import mongoose, { Schema, Document } from 'mongoose';
import { SubCategoryEntity } from '../entities/SubCategoryEntity';


const SubcategorySchema: Schema = new Schema({
    name: { type: String, required: true },             
    scid: { type: String, required: true, unique: true }, 
    cdt: { type: Date, default: Date.now },             // Default to current timestamp when created
    scpic: { type: String, required: false },            // Optional field for subcategory picture URL or path
    categoryId: { type: String, required: true }        // Reference to the parent category
});

export const SubcategoryModel = mongoose.model<SubCategoryEntity>('Subcategory', SubcategorySchema);
