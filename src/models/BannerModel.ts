import { Schema, model } from "mongoose";
import { BannerEntity } from "../entities/BannerEntity";

const BannerSchema = new Schema<BannerEntity>(
  {
    banners: [
      {
        imageUrl: { type: String, required: true },
        weight: { type: Number, required: true }
      }
    ],
  },
  { timestamps: true }
);

const BannerModel = model<BannerEntity>("Banner", BannerSchema);
export default BannerModel;
