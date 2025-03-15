import { Document } from 'mongoose';

// Enum for Seller Status
export enum SellerStatus {
  ACTIVE = 'Active',
  INACTIVE = 'Inactive',
  PENDING = 'Pending',
}

// Seller Interface
export interface Seller extends Document {
  sellerId: string;
  name: string;
  mobileNo: string;
  profilePic?: string;
  bio?: string;
  categoriesList?: string[];
  subCategoriesList?: string[];
  rating?: string;
  status?: SellerStatus;
  cDt: Date;
  
  // Add the location field to represent GeoJSON Point
  location?: {
    type: 'Point'; // GeoJSON type for a Point
    coordinates: [number, number]; // [longitude, latitude]
  };
}
