// Seller Model interface
export interface SellerPriceEntity extends Document {
    sellerID: string;
    categorypricing: {
      categoryID: string;
      Price: {
        subCategoryID: string;
        weekdays: number;
        weekends: number;
      }[];
    }[];
    createdAt?: Date;
    updatedAt?: Date;
  }