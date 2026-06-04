import { Router, Request, Response } from 'express';
import { generateSummary } from '../config/ai';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

// Route: POST /api/ai/summarize (Admin Protected)
// Takes { title, content } and returns the generated bullet highlights
router.post('/summarize', authenticateJWT, async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, content } = req.body;
    
    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Please provide both title and content fields.' });
      return;
    }
    
    const summary = await generateSummary(title, content);
    res.status(200).json({ 
      success: true, 
      aiSummary: summary 
    });
  } catch (error) {
    console.error('Manual summarization routing error:', error);
    res.status(550).json({ success: false, message: 'Failed to generate AI summary.' });
  }
});

export default router;
