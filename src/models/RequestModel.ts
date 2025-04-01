import mongoose, { Schema } from 'mongoose';
import { RequestEntity } from '../entities/RequestEntity';

// Schema definition
const RequestSchema: Schema = new Schema(
  {
    location: {
      latitude: { type: Number, required: true },
      longitude: { type: Number, required: true },
    },
    requestID: {
      type: Schema.Types.ObjectId,
      auto: true, // MongoDB will auto-generate it
      alias: "_id", // This makes `_id` appear as `requestID`
    },
    catId: { type: String, required: true },
    subCatId: { type: String, required: true },
    userId: { type: String, required: true },
    companionId: { type: String, required: true },
    comments: { type: String, required: false }, // Optional field
    price: { type: Number, required: true },
    date: { type: String, required: true }, // Stored as 'YYYY-MM-DD'
    slots: { type: [String], required: true }, // Array of strings
    finalPrice: { type: Number, required: true },
    requestStatus: {type: String},
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

// Create and export the Booking model
export const RequestModel = mongoose.model<RequestEntity>('Request', RequestSchema);
