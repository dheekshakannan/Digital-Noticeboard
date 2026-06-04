import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request interface to include our custom user object
export interface CustomRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Middleware function that checks for a JWT in the Authorization header.
 * Decodes and attaches the user details to the request object if valid.
 */
export const authenticateJWT = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET || 'supersecret_noticeboard_key_123!';
    
    try {
      const decoded = jwt.verify(token, secret) as { id: string; role: string };
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(403).json({ success: false, message: 'Forbidden: Invalid or expired token' });
    }
  } else {
    return res.status(401).json({ success: false, message: 'Unauthorized: Access token missing' });
  }
};
