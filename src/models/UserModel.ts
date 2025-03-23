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
    media: { type: [String], required: false }, 
    geoLocation: {
        type: { type: String, enum: ["Point"], required: false, default: "Point" },
        coordinates: { type: [Number], required: false }, // [longitude, latitude]
    },
    catList: { type: [String], required: false }, 
    subCatList: { type: [String], required: false }, 
    age: { type: Number, required: false }, // Fixed type issue (should be `Number`, not `number`)
    gender: { type: String, enum: Object.values(Gender), required: false }, // Enum for gender
    bio: { type: String, required: false }, // Fixed `bio` type (should be `String`, not `[String]`)
    id: { type: String, required: true, unique: true }
});

SignupSchema.index({ geoLocation: '2dsphere' });

export const Counter = mongoose.model('Counter', CounterSchema);
export const UserModel = mongoose.model<UserEntity>('users', SignupSchema);







// import mongoose, { Schema, Document } from 'mongoose';
// import { UserEntity, SellerStatus } from '../entities/UserEntity';


// //import {autoIncrement} from 'mongoose-auto-increment';

// const CounterSchema: Schema = new Schema({
//     modelName: { type: String, required: true },
//     count: { type: Number, required: true, default: 0 },
// });


// const SignupSchema: Schema = new Schema(
// {
//     name: { type: String, required: true },
//     mobileNo: { type: String, required: true },
//     profilePic: { type: String, required: false },
//     type: { type: String, enum: ['buyer', 'seller'], required: true },
//     fcmToken: { type: String, required: false },
//     deviceType: { type: String, required: false },
//     media: { type: [String], required: false }, 
//     catList: { type: [String], required: false }, 
//     subCatList: { type: [String], required: false }, 
//     id: { type: String, required: true, unique: true },
//     rating: { type: String, required: false },
//     status: { type: String, enum: Object.values(SellerStatus), required: false },
//     location: { 
//       type: { type: String, enum: ['Point'], required: false }, // Type is always "Point" for GeoJSON
//       coordinates: { type: [Number], required: false } // Array of numbers [longitude, latitude]
//     },
//     bio: { type: String, required: false, length: 20 },
// },
// { timestamps: true } // Automatically manage createdAt and updatedAt
// );

// export const Counter = mongoose.model('Counter', CounterSchema);


// SignupSchema.index({ location: '2dsphere' });


// export const UserModel = mongoose.model<UserEntity>('users', SignupSchema);