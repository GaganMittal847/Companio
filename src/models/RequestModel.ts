import mongoose, { Schema } from 'mongoose';
import { PaymentStatus, RequestEntity, RequestStatus } from '../entities/RequestEntity';

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
    userName: { type: String, required: true},
    companionId: { type: String, required: true },
    comments: { type: String, required: false }, // Optional field
    price: { type: Number, required: true },
    date: { type: String, required: true }, // Stored as 'YYYY-MM-DD'
    slots: {
      type: [
        {
          startTime: { type: String, required: true },
          endTime: { type: String, required: true }
        }
      ],
      required: true
    },
    finalPrice: { type: Number, required: true },
    addressId: { type: String, required: true},
    address: { type: String, required: true },
    requestStatus: {type: String, enum: Object.values(RequestStatus)},
    paymentStatus: { type: String, enum: Object.values(PaymentStatus),}
  },
  { timestamps: true } // Adds createdAt and updatedAt fields automatically
);

// Create and export the Booking model
export const RequestModel = mongoose.model<RequestEntity>('Request', RequestSchema);
