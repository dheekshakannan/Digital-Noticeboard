"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const dns_1 = __importDefault(require("dns"));
// Bypasses local ISP DNS failures by routing SRV record queries through Google's DNS
dns_1.default.setServers(['8.8.8.8', '8.8.4.4']);
const db_1 = require("./config/db");
const authController_1 = require("./controllers/authController");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const noticeRoutes_1 = __importDefault(require("./routes/noticeRoutes"));
const aiRoutes_1 = __importDefault(require("./routes/aiRoutes"));
// Load environment variables from .env file
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Setup Middleware
app.use((0, cors_1.default)({
    origin: '*', // Allow all origins for dev simplicity, can be locked down to specific frontend origins later
    credentials: true
}));
// Body parser middleware (supports JSON payloads and URL encoded bodies)
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve uploaded files statically at /uploads
// In development, the 'uploads' folder resides in 'backend/uploads'
app.use('/uploads', express_1.default.static(path_1.default.resolve(__dirname, '../uploads')));
// Map REST API routers
app.use('/api/auth', authRoutes_1.default);
app.use('/api/notices', noticeRoutes_1.default);
app.use('/api/ai', aiRoutes_1.default);
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date() });
});
// Connect to Database and start server
const startServer = async () => {
    try {
        // 1. Connect database
        await (0, db_1.connectDB)();
        // 2. Seed default admin credentials (if database is empty)
        await (0, authController_1.seedDefaultAdmin)();
        // 3. Start listener
        app.listen(PORT, () => {
            console.log(`====================================================`);
            console.log(`  Digital Noticeboard server running on port ${PORT}`);
            console.log(`  Health Check: http://localhost:${PORT}/health`);
            console.log(`====================================================`);
        });
    }
    catch (error) {
        console.error('Fatal error starting express server:', error);
    }
};
startServer();
