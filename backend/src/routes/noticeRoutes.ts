import { Router } from 'express';
import { 
   getNotices, 
   getNoticeById, 
   createNotice, 
   updateNotice, 
   deleteNotice, 
   getDashboardStats 
} from '../controllers/noticeController';
import { authenticateJWT, requireAdmin } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Public Routes (Students can access these)
router.get('/', getNotices);
router.get('/:id', getNoticeById);

// Admin-Protected Routes (Requires valid JWT and Admin role)
router.get('/stats/dashboard', authenticateJWT, requireAdmin, getDashboardStats);
router.post('/', authenticateJWT, requireAdmin, upload.array('attachments', 5), createNotice);
router.put('/:id', authenticateJWT, requireAdmin, upload.array('attachments', 5), updateNotice);
router.delete('/:id', authenticateJWT, requireAdmin, deleteNotice);

export default router;
