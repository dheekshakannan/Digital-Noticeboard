import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import dns from 'dns';

// Bypasses local ISP DNS failures by routing SRV record queries through Google's DNS
dns.setServers(['8.8.8.8', '8.8.4.4']);
import { connectDB } from './config/db';
import { seedDefaultAdmin } from './controllers/authController';
import authRoutes from './routes/authRoutes';
import noticeRoutes from './routes/noticeRoutes';
import aiRoutes from './routes/aiRoutes';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Setup Middleware
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity, can be locked down to specific frontend origins later
  credentials: true
}));

// Body parser middleware (supports JSON payloads and URL encoded bodies)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically at /uploads
// In development, the 'uploads' folder resides in 'backend/uploads'
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Map REST API routers
app.use('/api/auth', authRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date() });
});

// Connect to Database and start server
const startServer = async () => {
  try {
    // 1. Connect database
    await connectDB();

    // 2. Seed default admin credentials (if database is empty)
    await seedDefaultAdmin();

    // 3. Start listener
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  Digital Noticeboard server running on port ${PORT}`);
      console.log(`  Health Check: http://localhost:${PORT}/health`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Fatal error starting express server:', error);
  }
};

startServer();
