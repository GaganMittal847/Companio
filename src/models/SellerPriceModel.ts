import mongoose, { Schema, Document } from 'mongoose';
import {SellerPriceEntity} from '../entities/SellerPriceEntity'

// Price Schema for the price array in each category
const PriceSchema: Schema = new Schema({
  subCategoryID: { type: String, required: true },
  weekdays: { type: Number, required: true },
  weekends: { type: Number, required: true },
});

// Category Pricing Schema
const CategoryPricingSchema: Schema = new Schema({
  categoryID: { type: String, required: true },
  Price: { type: [PriceSchema], required: true },
});

// PricingSchema Schema
const SellerPriceSchema: Schema = new Schema(
  {
    sellerID: { type: String, required: true, unique: true },
    categorypricing: { type: [CategoryPricingSchema], required: true },
  },
  { timestamps: true } // Automatically add createdAt and updatedAt
);


// Create and export the Seller model
export const SellerPriceModel = mongoose.model<SellerPriceEntity>('SellerPrice', SellerPriceSchema);
