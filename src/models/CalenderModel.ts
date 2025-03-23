import mongoose, { Schema } from 'mongoose';
import { CalenderEntity } from '../entities/CalenderEntity';

// Define the time slot structure
const TimeSlotSchema: Schema = new Schema({
  startTime: { type: String, required: true }, // e.g., "8:00 AM"
  endTime: { type: String, required: true },   // e.g., "10:00 AM"
  available: { type: Boolean, required: true }, // Whether the seller is available during this slot
});

// Availability schema for each category (Sports, Food, etc.)
const CategoryAvailabilitySchema: Schema = new Schema({
  categoryID: { type: String, required: true }, // e.g., "Sports" or "Food"
    weekdays: { type: [TimeSlotSchema], default: [] },
    weekend: { type: [TimeSlotSchema], default: [] },
});

// Seller schema to store seller details and their availability schedules for each category
const CalenderSchema: Schema = new Schema(
  {
    sellerID: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    categories: [
      {
        categoryID: { type: String, required: true }, // e.g., "Sports", "Food"
        subCategoryID: { type: String, required: true },
        weekdayPrice: { type: Number , required: true},
        weekendPrice: { type: Number , required: true},
        availability: { type: CategoryAvailabilitySchema, required: true },
      },
    ],
  },
  { timestamps: true } // Automatically add createdAt and updatedAt fields
);


// Create and export the Seller model
export const CalenderModel = mongoose.model<CalenderEntity>('Calender', CalenderSchema);

/*
example - 
{
  "_id": "some_seller_id",
  "sellerID": "Aditi123",
  "name": "Aditi",
  "categories": [
    {
      "categoryID": "Sports",
      "availability": {
        "weekdays": [
          { "startTime": "8:00 AM", "endTime": "10:00 AM", "available": true },
          { "startTime": "10:00 AM", "endTime": "12:00 PM", "available": false }
        ],
        "weekend": [
          { "startTime": "9:00 AM", "endTime": "11:00 AM", "available": true },
          { "startTime": "11:00 AM", "endTime": "1:00 PM", "available": true }
        ]
      }
    },
    {
      "categoryID": "Food",
      "availability": {
        "weekdays": [
          { "startTime": "8:00 AM", "endTime": "10:00 AM", "available": false },
          { "startTime": "10:00 AM", "endTime": "12:00 PM", "available": true }
        ],
        "weekend": [
          { "startTime": "7:00 AM", "endTime": "9:00 AM", "available": true },
          { "startTime": "9:00 AM", "endTime": "11:00 AM", "available": false }
        ]
      }
    }
  ],
  "createdAt": "2023-03-13T10:00:00Z",
  "updatedAt": "2023-03-13T10:00:00Z"
}

*/
  
