import { Schema, model } from "mongoose";
import { AddressEntity } from "../entities/AddressEntity";

const AddressSchema = new Schema<AddressEntity>(
  {
    userId: { type: String, required: true },
    mobileNo: { type: Number, required: true },
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
  },
  { timestamps: true }
);

const AddressModel = model<AddressEntity>("Addresses", AddressSchema);
export default AddressModel;
