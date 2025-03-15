// Seller Model interface
export interface CalenderEntity extends Document {
    sellerID: string;
    name: string;
    categories: {
      categoryID: string;
      availability: {
        weekdays: { startTime: string, endTime: string, available: boolean }[];
        weekends: { startTime: string, endTime: string, available: boolean }[];
      };
    }[];
    createdAt?: Date;
    updatedAt?: Date;
  }