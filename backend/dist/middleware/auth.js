"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
/**
 * Middleware function that checks for a JWT in the Authorization header.
 * Decodes and attaches the user details to the request object if valid.
 */
const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET || 'supersecret_noticeboard_key_123!';
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            req.user = decoded;
            next();
        }
        catch (err) {
            return res.status(403).json({ success: false, message: 'Forbidden: Invalid or expired token' });
        }
    }
    else {
        return res.status(401).json({ success: false, message: 'Unauthorized: Access token missing' });
    }
};
exports.authenticateJWT = authenticateJWT;
/**
 * Middleware function that checks if the logged-in user is an administrator.
 */
const requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Forbidden: Administrator access required.' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
