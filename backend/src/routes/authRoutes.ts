import { Router } from 'express';
import { login, getMe } from '../controllers/authController';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Route: POST /api/auth/login
router.post('/login', login);

// Route: GET /api/auth/me (Protected - Requires JWT)
router.get('/me', authenticateJWT, getMe);

export default router;
