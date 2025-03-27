import { Document } from 'mongoose';

// Booking Entity Interface
export interface RequestEntity extends Document {
  location: {
    latitude: number;
    longitude: number;
  };
  requestId: string;
  catId: string;
  subCatId: string;
  userId: string;
  companionId: string;
  comments?: string; // Optional
  price: number;
  date: string; // Format: YYYY-MM-DD
  slots: string[];
  finalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
  requestStatus: String;
}
