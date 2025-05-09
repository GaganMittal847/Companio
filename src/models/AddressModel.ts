import { Schema, model } from "mongoose";
import { AddressEntity } from "../entities/AddressEntity";

const AddressSchema = new Schema<AddressEntity>(
  {
    userId: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    name: {type : String , required: true},
    mobileNo : { type : String , required : true},
    geoLocation: {
      type: { type: String, enum: ["Point"], required: false, default: "Point" },
      coordinates: { type: [Number], required: false }, // [longitude, latitude]
    },
  },
  { timestamps: true }
);

const AddressModel = model<AddressEntity>("Addresses", AddressSchema);
export default AddressModel;
