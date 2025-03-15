import mongoose, { Schema } from 'mongoose';
import { SellerStatus, Seller } from '../entities/SellerEntity';

// Seller Schema with Location Coordinates (GeoJSON)
const SellerSchema: Schema = new Schema(
  {
    sellerId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    mobileNo: { type: String, required: true },
    profilePic: { type: String, required: false },
    bio: { type: String, required: false, length: 20 },
    categoriesList: { type: Array, required: false },
    subCategoriesList: { type: Array, required: false },
    rating: { type: String, required: false },
    status: { type: String, enum: Object.values(SellerStatus), required: false },
    location: { 
      type: { type: String, enum: ['Point'], required: true }, // Type is always "Point" for GeoJSON
      coordinates: { type: [Number], required: true }, // Array of numbers [longitude, latitude]
    },
    cDt: { type: Date, default: Date.now },
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt
);

// Create a geospatial index on the location field for geospatial queries
SellerSchema.index({ location: '2dsphere' });

export const SellerModel = mongoose.model<Seller>('Seller', SellerSchema);
