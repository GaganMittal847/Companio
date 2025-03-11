import { Request, Response, NextFunction } from 'express';

export const checkAuth = (req: Request, res: Response, next: NextFunction) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  // Here you can verify the JWT or check the session
  // For example, using a JWT verification library like `jsonwebtoken`:
  try {
    // Assuming JWT token verification logic here
    // jwt.verify(token, process.env.JWT_SECRET);

    next(); // Token is valid, proceed to the next middleware/route handler
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
