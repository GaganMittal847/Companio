// Seller Model interface
// Seller Model interface
export interface CalenderEntity extends Document {
  sellerID: string;
  name: string;
  categories: {
    categoryID: string;
    availability: {
      days: {
        date: string; // Date in 'YYYY-MM-DD' format
        slot:{
          startTime: string;
          endTime: string;
          available: boolean;
          isLocked: boolean;
        };
        available: boolean;
      }[];
    }[];
    weekdaysPrice: number;
    weekendsPrice: number;
  }[];
  createdAt?: Date;
  updatedAt?: Date;
}
