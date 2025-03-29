import mongoose, { Schema, Document } from 'mongoose';

// TimeSlot Schema for each timeslot (start time, end time, availability)
const TimeSlotSchema: Schema = new Schema({
  startTime: { type: String, required: true }, // e.g., "8:00 AM"
  endTime: { type: String, required: true },   // e.g., "10:00 AM"
  available: { type: Boolean, required: true }, // Whether the seller is available during this slot
});

// Availability schema for each category (days with timeslots)
const CategoryAvailabilitySchema: Schema = new Schema({
  days: [
    {
      date: { type: String, required: true }, // Date in 'YYYY-MM-DD' format
      slots: [TimeSlotSchema], // Corrected slot structure
      available: { type: Boolean, required: true }, // Overall availability for the day
    }
  ],
});

// Seller schema to store seller details and their availability schedules for each category
const CalenderSchema: Schema = new Schema(
  {
    sellerID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    categories: [
      {
        categoryID: { type: String, required: true }, // e.g., "Sports", "Food"
        subCategoryId: { type: String, required: true }, // Corrected casing to match the interface
        weekdaysPrice: { type: Number, required: true },
        weekendsPrice: { type: Number, required: true },
        availability: { type: CategoryAvailabilitySchema, required: true },
      },
    ],
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Define the Document interface for MongoDB
export interface CalenderEntity extends Document {
  sellerID: string;
  name: string;
  categories: {
    categoryID: string;
    subCategoryId: string;
    availability: {
      days: {
        date: string; // Date in 'YYYY-MM-DD' format
        slots: {
          startTime: string;
          endTime: string;
          available: boolean;
        }[];
        available: boolean;
      }[];
    };
    weekdaysPrice: number;
    weekendsPrice: number;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Create and export the Calendar model
export const CalenderModel = mongoose.model<CalenderEntity>('Calender', CalenderSchema);