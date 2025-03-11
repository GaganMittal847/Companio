import mongoose, { Schema, Document } from 'mongoose';

export interface LoginInterface extends Document {
    mobileNo: number;
    otp:number | null;
    otp_count:number;
  //  source:string;
    timestamp: number;
    responseId: string;
    otp_verified: boolean,
  //  signedUpStatus: string;
}

const LoginSchema: Schema = new Schema({
    mobileNo: { type: Number, required: true },
    otp:{ type: Number},
    otp_count:{ type: Number, required: true ,default:0},
    otp_verified:{ type: Boolean},
   // source: {type: String, require: true},
    timestamp: { type: Number, required: true },
    responseId: { type: String},
  //  signedUpStatus:{type: String}

});

export const LoginEntity = mongoose.model<LoginInterface>(
    'comp_login',
    LoginSchema
);
