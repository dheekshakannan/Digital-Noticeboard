"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Establishes a connection to the MongoDB database using Mongoose.
 * The URI is loaded from environment variables (.env).
 */
const connectDB = async () => {
    try {
        const connString = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/digital_noticeboard';
        console.log(`Connecting to MongoDB at: ${connString}`);
        await mongoose_1.default.connect(connString);
        console.log('MongoDB Database Connected Successfully.');
    }
    catch (error) {
        console.error('Database connection error:', error);
        process.exit(1); // Exit process with failure
    }
};
exports.connectDB = connectDB;
