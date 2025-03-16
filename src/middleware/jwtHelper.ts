import jwt, { SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response } from 'express';
import { GenerateTokenDto } from "../models/Dto/GenerateTokenDto";
//import { GenerateTokenDto } from "../../models/Dto/GenerateTokenDto";

dotenv.config();

/**
 * Generates a JWT token with dynamic payload.
 * @param payload - The dynamic data to encode in the token.
 * @returns {string} - The generated JWT token.
 */
export const generateToken = (payload: Record<string, any>): string => {
    const secret = process.env.ADW_SECRET_KEY;
    const expiresIn = process.env.JWT_EXPIRES_IN;

    if (!secret) {
        throw new Error("JWT_SECRET is not defined in .env file");
    }

    if (!expiresIn) {
        throw new Error("JWT_EXPIRES_IN is not defined in .env file");
    }

    // Explicitly cast expiresIn to the expected type
    const options: SignOptions = { expiresIn: expiresIn as jwt.SignOptions['expiresIn'] };

    return jwt.sign({ ...payload }, secret, options);
};


export const generateAndReturnToken = (user: any): string => {
    const dto: GenerateTokenDto = {
        name: user?.name,
        mobileNo: user?.mobileNo,
        type: user?.type

    };
    return generateToken(dto);
};

