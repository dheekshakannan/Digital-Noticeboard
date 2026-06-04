import { Router } from 'express';
import { 
  getNotices, 
  getNoticeById, 
  createNotice, 
  updateNotice, 
  deleteNotice, 
  getDashboardStats 
} from '../controllers/noticeController';
import { authenticateJWT } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();

// Public Routes (Students can access these)
router.get('/', getNotices);
router.get('/:id', getNoticeById);

// Admin-Protected Routes (Requires valid JWT)
router.get('/stats/dashboard', authenticateJWT, getDashboardStats);
router.post('/', authenticateJWT, upload.array('attachments', 5), createNotice);
router.put('/:id', authenticateJWT, upload.array('attachments', 5), updateNotice);
router.delete('/:id', authenticateJWT, deleteNotice);

export default router;
