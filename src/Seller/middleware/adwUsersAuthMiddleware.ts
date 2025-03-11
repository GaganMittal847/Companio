import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
//import { Log } from "../../helper/Logger";
import { Mongoose } from "mongoose";
import { LoginEntity } from "../entities/LoginEntity";

dotenv.config();

export const authenticateJWT = () => async(req: Request, res: Response, next: NextFunction): Promise<any> => {
    const excludedRoutes = ["/validate"]; // List of routes to exclude from middleware

    // Log the requested path
    console.log(`Requested path:", ${req.path}`);

    // Check if the requested path is in the excluded routes
    if (excludedRoutes.some((route) => req.path.startsWith(route))) {
        return next();
    }

    // Get the token from the Authorization header
    const token = req.header("Authorization")?.split(" ")[1];

    // If there's no token, respond with unauthorized
    if (!token) {
        res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    // Verify the token
    try {
        if (!process.env.ADW_SECRET_KEY) {
            throw new Error("JWT_SECRET is not defined");
        }

        const decoded = jwt.verify(token as string, process.env.ADW_SECRET_KEY);
        (req as any).user = decoded;

        const uid = (req as any).user.uid;
        const userDetails = await LoginEntity.findOne({uid});
    
        // Check if token's issued time (iat) is older than the resetPasswordTimeStamp
        // if (userDetails && userDetails.resetPasswordTimeStamp && (req as any).user.iat * 1000 < userDetails.resetPasswordTimeStamp) {
        //     return res.status(403).json({ message: "Your password has been updated. Please log in again." });
        // }

     //   Log.info("User authenticated:", decoded);
        return next();
    }
    catch (error) {
        console.error("Token verification error:", error);
        res.status(403).json({ message: "Forbidden - Invalid token" });
    }
};