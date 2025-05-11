import mongoose, { Schema, Document } from 'mongoose';
import { UserEntity } from '../entities/UserEntity';

// Enum for Gender
enum Gender {
    MALE = 'male',
    FEMALE = 'female',
    OTHER = 'other'
}

const CounterSchema: Schema = new Schema({
    modelName: { type: String, required: true },
    count: { type: Number, required: true, default: 0 },
});

const SignupSchema: Schema = new Schema({
    name: { type: String, required: true },
    mobileNo: { type: String, required: true },
    profilePic: { type: String, required: false },
    type: { type: String, enum: ['buyer', 'seller'], required: true },
    fcmToken: { type: String, required: false },
    deviceType: { type: String, required: false },
    media: { type: [String] , required: false}, 
    geoLocation: {
        type: { type: String, enum: ["Point"], required: false, default: "Point" },
        coordinates: { type: [Number], required: false }, // [longitude, latitude]
    },
    catList: {
        type: [
          {
            catId: { type: String, required: true },
            catName: { type: String, required: true },
            catImage: { type: String, required: true },
          }
        ],
        required: false
      },
      subCatList: {
        type: [
          {
            catId: { type: String, required: true },
            subCatId: { type: String, required: true },
            subCatName: { type: String, required: true },
            subCatImage: { type: String, required: true },
          }
        ],
        required: false
      },
    age: { type: Number, required: false }, // Fixed type issue (should be `Number`, not `number`)
    gender: { type: String, enum: Object.values(Gender), required: false }, // Enum for gender
    bio: { type: String, required: false }, // Fixed `bio` type (should be `String`, not `[String]`)
    id: { type: String, required: true, unique: true },
    pronoun: { type : String , required : false},
    work: {type : String , required : false},
    language: {type : String , required : false},
    rating: { type: mongoose.Types.Decimal128, required: false, default: 0.0 }, // Added rating as Decimal128
    isLocked: { type: Boolean, default: false },
    lockedAt: { type: Date, default: null },
    lockedUntil: { type: Date, default: null } 
});

SignupSchema.index({ geoLocation: '2dsphere' });

export const Counter = mongoose.model('Counter', CounterSchema);
export const UserModel = mongoose.model<UserEntity>('users', SignupSchema);
