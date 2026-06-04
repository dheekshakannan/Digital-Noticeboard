import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Notice, INotice } from '../models/Notice';
import { generateSummary, smartSearchNotices } from '../config/ai';
import { CustomRequest } from '../middleware/auth';

/**
 * Get all active notices (not expired).
 * Supports category filtering, keyword searches, and Gemini-based semantic Smart Search.
 */
export const getNotices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, search, smart, all } = req.query;
    const now = new Date();

    // Query filter
    const filterQuery: any = {};
    if (all !== 'true') {
      filterQuery.expiryDate = { $gt: now }; // Standard student view shows active notices
    }

    if (category) {
      filterQuery.category = category;
    }

    // Keyword text search (fallback / standard search)
    if (search && smart !== 'true') {
      filterQuery.$text = { $search: search as string };
    }

    let notices = await Notice.find(filterQuery)
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username');

    // If Smart search is activated and we have a search query, run the Gemini parser
    if (search && smart === 'true') {
      console.log(`Running Gemini Smart Search for query: "${search}"`);
      notices = await smartSearchNotices(search as string, notices);
    }

    res.status(200).json({
      success: true,
      count: notices.length,
      data: notices
    });
  } catch (error) {
    console.error('Error fetching notices:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve notices.' });
  }
};

/**
 * Get a specific notice by ID.
 * Increments the views count by 1.
 */
export const getNoticeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const notice = await Notice.findById(req.params.id).populate('createdBy', 'username');
    
    if (!notice) {
      res.status(404).json({ success: false, message: 'Notice not found.' });
      return;
    }

    // Increment view count
    notice.views += 1;
    await notice.save();

    res.status(200).json({
      success: true,
      data: notice
    });
  } catch (error) {
    console.error('Error fetching notice detail:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch notice details.' });
  }
};

/**
 * Create a new notice (Admin only).
 * Triggers Multer upload and generates an AI summary before saving.
 */
export const createNotice = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { title, content, category, expiryDate } = req.body;
    
    if (!title || !content || !category || !expiryDate) {
      res.status(400).json({ success: false, message: 'Please fulfill all required fields (title, content, category, expiryDate).' });
      return;
    }

    // Process files
    const attachments: any[] = [];
    if (req.files && Array.isArray(req.files)) {
      const uploadedFiles = req.files as Express.Multer.File[];
      for (const file of uploadedFiles) {
        const fileType = file.mimetype === 'application/pdf' ? 'pdf' : 'image';
        attachments.push({
          fileName: file.originalname,
          fileUrl: `/uploads/${file.filename}`,
          fileType
        });
      }
    }

    console.log(`Generating AI Summary for notice: "${title}"`);
    const aiSummary = await generateSummary(title, content);

    const newNotice = new Notice({
      title,
      content,
      category,
      expiryDate: new Date(expiryDate),
      attachments,
      aiSummary,
      createdBy: req.user?.id
    });

    await newNotice.save();

    res.status(201).json({
      success: true,
      message: 'Notice posted successfully.',
      data: newNotice
    });
  } catch (error) {
    console.error('Error creating notice:', error);
    res.status(500).json({ success: false, message: 'Failed to create notice.' });
  }
};

/**
 * Update an existing notice (Admin only).
 * Re-triggers AI Summary if content/title changes.
 */
export const updateNotice = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const { title, content, category, expiryDate, keepAttachments } = req.body;
    const noticeId = req.params.id;

    const notice = await Notice.findById(noticeId);
    if (!notice) {
      res.status(404).json({ success: false, message: 'Notice not found.' });
      return;
    }

    // Check if title or content changed to regenerate AI summary
    let updatedSummary = notice.aiSummary;
    if ((title && title !== notice.title) || (content && content !== notice.content)) {
      console.log(`Re-generating AI Summary for notice: "${title || notice.title}"`);
      updatedSummary = await generateSummary(title || notice.title, content || notice.content);
    }

    // Parse existing attachments that should be kept
    let currentAttachments = notice.attachments;
    if (keepAttachments) {
      const keepUrls = JSON.parse(keepAttachments) as string[];
      // Remove files not in the keep list from local disk
      const toDelete = notice.attachments.filter(att => !keepUrls.includes(att.fileUrl));
      for (const file of toDelete) {
        const filepath = path.resolve(__dirname, '../../', file.fileUrl.replace(/^\//, ''));
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
      currentAttachments = notice.attachments.filter(att => keepUrls.includes(att.fileUrl));
    } else {
      // If keepAttachments is omitted, we assume admin is replacing them all
      // Deleting all original attachments from disk
      for (const file of notice.attachments) {
        const filepath = path.resolve(__dirname, '../../', file.fileUrl.replace(/^\//, ''));
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
      currentAttachments = [];
    }

    // Process newly uploaded files
    if (req.files && Array.isArray(req.files)) {
      const uploadedFiles = req.files as Express.Multer.File[];
      for (const file of uploadedFiles) {
        const fileType = file.mimetype === 'application/pdf' ? 'pdf' : 'image';
        currentAttachments.push({
          fileName: file.originalname,
          fileUrl: `/uploads/${file.filename}`,
          fileType
        });
      }
    }

    // Update properties
    notice.title = title || notice.title;
    notice.content = content || notice.content;
    notice.category = category || notice.category;
    notice.expiryDate = expiryDate ? new Date(expiryDate) : notice.expiryDate;
    notice.attachments = currentAttachments;
    notice.aiSummary = updatedSummary;

    await notice.save();

    res.status(200).json({
      success: true,
      message: 'Notice updated successfully.',
      data: notice
    });
  } catch (error) {
    console.error('Error updating notice:', error);
    res.status(500).json({ success: false, message: 'Failed to update notice.' });
  }
};

/**
 * Delete a notice (Admin only).
 * Clears attachments from local disk.
 */
export const deleteNotice = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      res.status(404).json({ success: false, message: 'Notice not found.' });
      return;
    }

    // Unlink (delete) all notice attachments from the server disk storage
    for (const file of notice.attachments) {
      const filepath = path.resolve(__dirname, '../../', file.fileUrl.replace(/^\//, ''));
      if (fs.existsSync(filepath)) {
        try {
          fs.unlinkSync(filepath);
          console.log(`Deleted file from storage: ${file.fileUrl}`);
        } catch (fileErr) {
          console.error(`Failed to delete file from storage: ${filepath}`, fileErr);
        }
      }
    }

    await Notice.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Notice deleted and attachments purged.'
    });
  } catch (error) {
    console.error('Error deleting notice:', error);
    res.status(500).json({ success: false, message: 'Failed to delete notice.' });
  }
};

/**
 * Retrieve Noticeboard Metrics & Statistics for Admin Dashboard.
 */
export const getDashboardStats = async (req: CustomRequest, res: Response): Promise<void> => {
  try {
    const now = new Date();

    // 1. Total Notice Counts
    const totalNotices = await Notice.countDocuments();
    const activeNotices = await Notice.countDocuments({ expiryDate: { $gt: now } });
    const expiredNotices = totalNotices - activeNotices;

    // 2. Total views across all notices
    const viewStats = await Notice.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewStats.length > 0 ? viewStats[0].totalViews : 0;

    // 3. Notices grouped by category
    const categoryGroup = await Notice.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    
    // Map aggregation results to simple key-value structure with zero fallbacks
    const categoriesList = ['Academic', 'Examination', 'Placement', 'Events', 'Sports', 'Circulars', 'General Announcements'];
    const categoryStats = categoriesList.reduce((acc: any, cat) => {
      const found = categoryGroup.find(g => g._id === cat);
      acc[cat] = found ? found.count : 0;
      return acc;
    }, {});

    // 4. Most popular notices (top 5 by views)
    const popularNotices = await Notice.find()
      .sort({ views: -1 })
      .limit(5)
      .select('title category views createdAt');

    res.status(200).json({
      success: true,
      stats: {
        totalNotices,
        activeNotices,
        expiredNotices,
        totalViews,
        categoryStats,
        popularNotices
      }
    });
  } catch (error) {
    console.error('Error aggregating dashboard statistics:', error);
    res.status(500).json({ success: false, message: 'Failed to retrieve stats.' });
  }
};
