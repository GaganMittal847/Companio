// Enum for Seller Status
import { Document } from 'mongoose';

export enum SellerStatus {
    ACTIVE = 'Active',
    INACTIVE = 'Inactive',
    PENDING = 'Pending',
  }

export interface UserEntity extends Document {
    name: string;
    mobileNo: string;
    profilePic: string;
    type: 'buyer' | 'seller';
    fcmToken: string;
    deviceType: string;
    media: string[];
    catList: string[];
    subCatList: string[];
    cDt: Date;
    uDt: Date;
    id: string;
    bio?: string;
    rating?: string;
    status?: SellerStatus;
      // Add the location field to represent GeoJSON Point
    location?: {
    type: 'Point'; // GeoJSON type for a Point
    coordinates: [number, number]; // [longitude, latitude]
    };
}

