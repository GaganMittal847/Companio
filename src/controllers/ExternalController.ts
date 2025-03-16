import { Router, Request, Response, response, application } from 'express';
import dotenv from 'dotenv';
import { Counter, UserModel } from '../models/UserModel';
import { LoginEntity } from '../entities/LoginEntity';
import { ApiResponseDto } from '../models/Dto/ApiResponseDto';
import { ApiResponse, HttpStatus } from '../constant/constant';
import { generateAndReturnToken }  from '../middleware/jwtHelper';
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
       this.router.post('/signUp',this.userSignUp);

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

                    const user = await UserModel.findOne({mobileNo :mobileNumber });

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

        if(!user){

            res.status(400).json({ status : false ,error: "User Not found" });
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
            const c_otp = await LoginEntity.findOne({ mobileNo : mobile_number});
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

            res.json({ message: "Otp sent successfully", status: true,data: otp });
            
        } catch (e) {
            console.error("Error in sending otp", e);
            res.status(500).json({ error: "Failed to send otp", status: "failed" });
        }
    };
    

    private userSignUp = async (req: Request, res: Response): Promise<any>  => {
        try {
            const { name, mobileNo, profilePic, type, fcmToken, deviceType} = req.body;


            if(!name || !mobileNo || !type){
                return res.status(400).json({ message: 'missing field'});
            }
    
            // Check if user already exists
            const existingUser = await UserModel.findOne({ mobileNo : mobileNo , type : type });
            console.log("existingUser" + existingUser);
            if (existingUser) {
                console.log("existingUser" + existingUser);

                return res.status(400).json({ message: 'User already exists' });
            }

            const id = await this.generateUserId();
            // Create new user
            const newUser = new UserModel({ name, mobileNo, profilePic, type, fcmToken, deviceType, id });
            await newUser.save();

            const data = {
                "name" : name,
                "mobileNo" : mobileNo,
                "type": type
            }
            const token = generateAndReturnToken(data);

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

}


