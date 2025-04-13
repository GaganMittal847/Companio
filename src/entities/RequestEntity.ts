import mongoose, { Document } from 'mongoose';

// Enum for Request Status with lifecycle stages
export enum RequestStatus {
  // Buyer Action

  // Unicast Workflow
  SENT_TO_SELLER = 'Sent to Seller',  // When a request is sent to a single seller
  SELLER_ACCEPTED = 'Seller Accepted',  // Seller accepts the unicast request
  SELLER_REJECTED = 'Seller Rejected',  // Seller declines the unicast request

  
  // Broadcast Workflow
  SENT_TO_MULTIPLE_SELLERS = 'Sent to Multiple Sellers',  // Request sent to multiple sellers (broadcast)
  SELLER_ACCEPTED_BROADCAST = 'Seller Accepted (Broadcast)',  // Seller accepts broadcast request
  SELLER_REJECTED_BROADCAST = 'Seller Rejected (Broadcast)',  // Seller rejects broadcast request
  
  // Buyer Final Action
  TOP_SELLERS_SELECTED = 'Top Sellers Selected',  // Top 5 sellers selected by the system
  BUYER_SELECTED_SELLER = 'Buyer Selected Seller',  // Buyer selects one seller from the top sellers
  COMPLETED = 'Completed',  // Booking request is completed
  CANCELLED = 'Cancelled',  // Booking request is cancelled by buyer or seller
}

// Enum for Request Status with lifecycle stages
export enum PaymentStatus {
  PAYMENT_PENDING = 'Pending',
  PAYMENT_COMPLETED = 'Completed'

}
// Booking Entity Interface
export interface RequestEntity extends Document {
  requestID: mongoose.Types.ObjectId; 
  location: {
    latitude: number;
    longitude: number;
  };
  catId: string;
  subCatId: string;
  userId: string;
  companionId: string;
  comments?: string; // Optional
  price: number;
  date: string; // Format: YYYY-MM-DD
  slots: string[];
  finalPrice: number;
  createdAt?: Date;
  updatedAt?: Date;
  addressId?: number;
  address?: string;
  requestStatus: RequestStatus;
  paymentStatus: PaymentStatus;
}
