import mongoose, { Schema } from 'mongoose';
import{ RequestStatus, RequestType, BookingRequest } from '../entities/BookingRequestEntity'

// PriceRange Schema
const PriceRangeSchema = new Schema({
  minPrice: { type: Number, required: true },
  maxPrice: { type: Number, required: true },
});

const BookingRequestSchema: Schema = new Schema(
  {
    buyerID: { type: String, required: true },
    categoryId: { type: String, required: true },
    subCategoryId: { type: String, required: true },
    requestType: { type: String, enum: Object.values(RequestType), required: false },
    bookingDate: { type: Date , required: true },
    priceRange: { type: PriceRangeSchema, required: true },
    status: { type: String, enum: Object.values(RequestStatus) }, // Default to 'Created'
    sellerID: { type: String }, // Required for Unicast type
    comments: { type: String }
   // sellerList :[]
  },
  { timestamps: true } // This will automatically add createdAt and updatedAt
);

export const BookingRequestModel = mongoose.model<BookingRequest>('BookingRequest', BookingRequestSchema);

/*
Cycle of a booking request
1. Buyer creates a booking request which can be of 2 types - Direct for a seller (Unicast) or broadcasting to multiple sellers
2. If the request is unicast then it goes to the seller directly which will accept the request or decline it.
3. If the request is broadcasted then it goes to multiple sellers. Many sellers can accept the request.
4. Top 5 accepted sellers will go to buyer again. Among this buyer can select any single buyer and complete the request.


*/