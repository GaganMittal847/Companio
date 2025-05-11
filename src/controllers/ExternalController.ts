import { Router, Request, Response, response, application } from 'express';
import dotenv from 'dotenv';
import { Counter, UserModel } from '../models/UserModel';
import { LoginEntity } from '../entities/LoginEntity';
import { ApiResponseDto } from '../models/Dto/ApiResponseDto';
import { ApiResponse, HttpStatus } from '../constant/constant';
import { generateAndReturnToken } from '../middleware/jwtHelper';
import { CalenderModel } from '../models/CalenderModel';
import BannerModel from '../models/BannerModel';
import AddressModel from '../models/AddressModel';
//import { SignupModel } from '../config/constant/controllers/models/Entities/UserEntity';


dotenv.config();



export class ExternalController {
    public router: Router;

    constructor() {
        this.router = Router();
        this.configureRoutes();
    }

    private configureRoutes(): void {
        this.router.post('/otp', this.generateOtp);
        this.router.post('/otp/verify', this.verifyOtp);
        this.router.post('/signUp', this.userSignUp);
        this.router.post('/profileSetup', this.profileSetup);
        //  this.router.post('/catRegistration', this.categoryRegistration);
        this.router.post('/updateCalender', this.handleSellerCalender);
        this.router.get('/getSellerCalender', this.getSellerCalender);
        this.router.get('/getBanners', this.getBanners);
        this.router.post('/add/Address', this.addAddress);
        this.router.get('/get/Address', this.getAddress);


    }

    private verifyOtp = async (req: Request, res: Response): Promise<any> => {
        console.log('incoming');

        const apiResponseDto = new ApiResponseDto();

        try {
            const mobileNumber = req.body.mobile_number;
            const otp = req.body.otp;
            const comp_otp = await LoginEntity.findOne({
                mobileNo: mobileNumber,
            });
            if (comp_otp && comp_otp.otp) {
                const actualOtp = comp_otp.otp;
                const actualTimestamp = comp_otp.timestamp;
                const currentTimestamp = Date.now();
                const diffMillis = currentTimestamp - actualTimestamp;
                const diffMinutes = diffMillis / 60000;
                console.log(diffMinutes);

                if (diffMinutes >= 1) {
                    apiResponseDto.status = ApiResponse.ERROR;
                    apiResponseDto.message = ApiResponse.OTP_TIME_LIMIT;
                    apiResponseDto.responseCode = HttpStatus.BAD_REQUEST;
                } else if (otp !== actualOtp) {
                    apiResponseDto.status = ApiResponse.ERROR;
                    apiResponseDto.message = ApiResponse.OTP_INVALID;
                    apiResponseDto.responseCode = HttpStatus.BAD_REQUEST;
                } else {
                    comp_otp.otp_verified = true;
                    comp_otp.otp = null;
                    await comp_otp.save();

                    const user = await UserModel.findOne({ mobileNo: mobileNumber });

                    apiResponseDto.status = ApiResponse.SUCCESS;
                    apiResponseDto.message = ApiResponse.OTP_VERIFIED;
                    apiResponseDto.data = user;
                    apiResponseDto.responseCode = HttpStatus.OK;
                }
            } else {
                apiResponseDto.status = ApiResponse.ERROR;
                apiResponseDto.message = ApiResponse.OTP_NOT_VERIFIED;
                apiResponseDto.responseCode = HttpStatus.NOT_FOUND;
            }
            return res.json(apiResponseDto);
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                status: ApiResponse.ERROR,
                message: "Internal Server Error",
            });
        }
    }

    private generateOtp = async (req: Request, res: Response) => {
        console.log('coming');
        const mobile_number = req.body.mobile;

        const role = req.body.role;

        const user = await UserModel.findOne({
            mobileNo: mobile_number,
            type: role
        });

        if (!user) {

            res.status(400).json({ status: false, error: "User Not found" });
            return;


        }


        //  const type = req.body.type;
        if (!mobile_number || !/^\d{10}$/.test(mobile_number)) {
            res.status(400).json({ error: "Mobile number must be exactly 10 digits" });
            return;
        }



        try {
            const timestamp = new Date();
            const currTimeStamp = timestamp.getTime();
            const otp = Math.floor(Math.random() * 9000) + 1000;
            const c_otp = await LoginEntity.findOne({ mobileNo: mobile_number });
            if (c_otp == null) {
                const lead = new LoginEntity({
                    mobileNo: mobile_number,
                    otp,
                    otp_count: 1,
                    otp_verified: false,
                    timestamp: currTimeStamp,
                });
                await lead.save();
            } else {
                c_otp.otp = otp;
                c_otp.otp_verified = false;
                c_otp.otp_count = c_otp.otp_count ? c_otp.otp_count + 1 : 1;
                c_otp.timestamp = currTimeStamp;
                await c_otp.save();
            }

            res.json({ message: "Otp sent successfully", status: true, data: otp });

        } catch (e) {
            console.error("Error in sending otp", e);
            res.status(500).json({ error: "Failed to send otp", status: "failed" });
        }
    };


    private userSignUp = async (req: Request, res: Response): Promise<any> => {
        try {
            const { name, mobileNo, type, fcmToken, deviceType, profilePic, geoLocation } = req.body;

            if (!name || !mobileNo || !type) {
                return res.status(400).json({ message: 'missing field' });
            }

            // Check if user already exists
            const existingUser = await UserModel.findOne({ mobileNo: mobileNo, type: type });
            console.log("existingUser" + existingUser);
            if (existingUser) {
                console.log("existingUser" + existingUser);

                return res.status(400).json({ message: 'User already exists' });
            }

            const id = "USER" + await this.generateUserId();
            // Create new user
            const newUser = new UserModel({ name, mobileNo, profilePic, type, fcmToken, deviceType, id, geoLocation });
            await newUser.save();

            // const data: {
            //     "token": generateAndReturnToken(newUser);
            // }

            res.status(200).json({ message: 'User signed up successfully', user: newUser });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: 'Internal Server Error', error });
        }
    };

    private async generateUserId(): Promise<any> {
        const counter = await Counter.findOneAndUpdate(
            { modelName: 'Signup' },
            { $inc: { count: 1 } },
            { new: true, upsert: true }
        );
        return counter?.count ?? 1;
    }

    private profileSetup = async (req: Request, res: Response): Promise<any> => {
        try {
            const { userId, age, gender, profilePic, location, bio, catList , subCatList , pronoun , work , language ,media } = req.body;
    
            if (!userId) {
                return res.status(400).json({ message: "userId is required." });
            }
    
            const user = await UserModel.findOne({ id: userId });
            if (!user) {
                return res.status(404).json({ message: "User not found." });
            }
    
            const updates: Partial<typeof user> = {};
    
            if (age !== undefined) updates.age = age;
            if (gender !== undefined) updates.gender = gender;
            if (profilePic !== undefined) updates.profilePic = profilePic;
            if (bio !== undefined) updates.bio = bio;
            updates.catList = catList;
            updates.subCatList = subCatList;

            user.pronoun = pronoun;
            user.work = work;
            user.language = language;
            user.media = media;
    
            if (location?.longitude !== undefined && location?.latitude !== undefined) {
                updates.geoLocation = {
                    type: "Point",
                    coordinates: [location.longitude, location.latitude],
                };
            }
    
            // Update only if there are fields to update
            if (Object.keys(updates).length > 0) {
                Object.assign(user, updates);
                await user.save();
            }
    
            return res.status(200).json({ message: "Profile updated successfully.", user });
        } catch (error: any) {
            console.error("Error in profileSetup:", error);
            return res.status(500).json({ message: "Internal server error.", error: error?.message || "Unknown error" });
        }
    };
    

    // private categoryRegistration = async (req: Request, res: Response): Promise<any> => {

    //     const {userId , catId , subCatId } = req.body;


    // }

    private handleSellerCalender = async (req: Request, res: Response): Promise<any> => {
        try {
            const { sellerID, name, categories } = req.body;
    
            if (!sellerID || !name || !Array.isArray(categories) || categories.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Missing required fields: sellerID, name, or categories"
                });
            }
    
            const incomingCategory = categories[0]; // handling single category at a time
            const { categoryID, subCategoryId } = incomingCategory;
    
            // First check if seller + category exists
            const calendarDoc = await CalenderModel.findOne({
                sellerID,
                'categories.categoryID': categoryID
            });
    
            let updatedCalendar;
    
            if (calendarDoc) {
                // Update specific category in the array
                const categoryIndex = calendarDoc.categories.findIndex(
                    (cat) => cat.categoryID === categoryID 
                );
    
                if (categoryIndex > -1) {
                    calendarDoc.categories[categoryIndex] = {
                        ...calendarDoc.categories[categoryIndex],
                        ...incomingCategory
                    };
                    calendarDoc.name = name;
                    calendarDoc.updatedAt = new Date();
                    updatedCalendar = await calendarDoc.save();
                }
            } else {
                // Check if seller exists without this category
                const sellerDoc = await CalenderModel.findOne({ sellerID });
    
                if (sellerDoc) {
                    // Seller exists, maybe has empty or unrelated categories — add new one
                    sellerDoc.categories = sellerDoc.categories || [];
                    sellerDoc.categories.push(incomingCategory);
                    sellerDoc.name = name;
                    sellerDoc.updatedAt = new Date();
                    updatedCalendar = await sellerDoc.save();
                } else {
                    // Seller doesn't exist — create new document
                    updatedCalendar = await CalenderModel.create({
                        sellerID,
                        name,
                        categories: [incomingCategory],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    });
                }
            }
    
            return res.status(200).json({
                success: true,
                message: "Calendar updated successfully",
                data: updatedCalendar,
            });
    
        } catch (error) {
            console.error("Error updating calendar: ", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    };
    


    private getSellerCalender = async (req: Request, res: Response): Promise<any> => {
        try {
            const { userId, catId, subCatId } = req.body;
           // const calendar = await CalenderModel.find({});

           const calendar = await CalenderModel.findOne({
            sellerID: userId,
            'categories.categoryID': catId
            });

            if (!calendar) {
                return res.status(404).json({ success: false, message: "Calendar not found" });
            }

            return res.status(200).json({ success: true, message: "Calendar retrieved successfully", data: calendar });
        } catch (error) {
            console.error("Error retrieving calendar: ", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    };

    private getBanners = async (req: Request, res: Response): Promise<any> => {
        try {
            const { userId, catId, subCatId } = req.body;

            const banners = await BannerModel.find().sort({ "banners.weight": -1 });

            if (!banners) {
                return res.status(404).json({ success: false, message: "Calendar not found" });
            }

            return res.status(200).json({ success: true, message: "Calendar retrieved successfully", data: banners });
        } catch (error) {
            console.error("Error retrieving calendar: ", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    };

    public addAddress = async (req: Request, res: Response): Promise<any> => {
        try {
            const { userId, address, city, state, postalCode, country , mobileNo , location , name  } = req.body;

            // Validate required fields
            if (!userId || !address || !city || !state || !postalCode || !country || !mobileNo || !location || !name) {
                return res.status(400).json({
                    success: false,
                    message: "All fields (userId, mobileNo, street, city, state, postalCode, country) are required"
                });
            }
            const geoLocation = {
                type: "Point",
                coordinates: [location.longitude, location.latitude],
            };

            const newAddress = new AddressModel({
                userId,
                address,
                city,
                state,
                postalCode,
                country,
                name,
                mobileNo,
                geoLocation
            });

            await newAddress.save();

            return res.status(200).json({ success: true, message: "Address created successfully", data: newAddress });
        } catch (error) {
            console.error("Error creating address: ", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    };


    public getAddress = async (req: Request, res: Response): Promise<any> => {
        try {
            const userId = req.query.userId; // Assuming userId is passed as a URL parameter
            const address = await AddressModel.find({ userId });

            if (!address) {
                return res.status(404).json({ success: false, message: "Address not found" });
            }

            return res.status(200).json({ success: true, message: "Address retrieved successfully", data: address });
        } catch (error) {
            console.error("Error retrieving address: ", error);
            return res.status(500).json({ success: false, message: "Internal Server Error" });
        }
    };
}


