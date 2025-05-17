import { Document } from 'mongoose';

export interface ChatListUserEmbedEntity {
  Name: string;
  Profilepic?: string;
  id: string;
  Mobile?: string;
}

export interface ChatListEntity extends Document {
  requestid: string;
  LatestMsg?: string;
  Latest_msg_time?: Date;
  Users_array: ChatListUserEmbedEntity[];
  cDt: Date;
}