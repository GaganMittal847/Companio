export interface BannerEntity extends Document {
    banners: {
      imageUrl: string;
      weight: number;
    }[];
    createdAt?: Date;
    updatedAt?: Date;
  }