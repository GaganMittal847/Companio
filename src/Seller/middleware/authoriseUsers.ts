import { Request, Response, NextFunction } from "express";

import jwt from "jsonwebtoken";

// Interface for Decoded Token

interface DecodedToken {
  userId: string;

  projectId: string;

  module_read: string[];

  module_write: string[];
}

export const authMiddleware =
  () =>
  (req: Request, res: Response, next: NextFunction): void => {
    const excludedRoutes = ["/cms/internal/auth"]; // List of routes to exclude from middleware

    if (excludedRoutes.some((route) => req.path.startsWith(route))) {
      return next();
    }

    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(403).json({ message: "Access denied. No token provided." });

      return;
    }

    try {
      const decoded = jwt.verify(
        token,

        process.env.JWT_SECRET || ""
      ) as DecodedToken;

      (req as any).user = decoded;

      const urlParts = req.originalUrl.split("/").filter((part) => part);

      const module = urlParts[2];

      if (!module) {
        res.status(400).json({ message: "Invalid module in request URL." });

        return;
      }

      const permissionType = req.method === "GET" ? "read" : "write";

      const hasPermission =
        (permissionType === "read" && decoded.module_read.includes(module)) ||
        (permissionType === "write" && decoded.module_write.includes(module));

      if (!hasPermission) {
        res.status(403).json({
          message: `Access denied for ${permissionType} access to ${module}.`,
        });

        return;
      }

      next();
    } catch (error) {
      res.status(401).json({
        message: "Invalid or expired token.",

        error: (error as Error).message,
      });
    }
  };
