import mongoose, { Schema, Document } from 'mongoose';
import { CategoryEntity } from '../entities/CategoryEntity';

const CategorySchema: Schema = new Schema({
    name: { type: String, required: true },           
    cid: { type: String, required: true, unique: true }, 
    cdt: { type: Date, default: Date.now },             // Default to current timestamp when created
    cpic: { type: String, required: false }             // Optional field for category picture URL or path
});

export const CategoryModel = mongoose.model<CategoryEntity>('Category', CategorySchema);
