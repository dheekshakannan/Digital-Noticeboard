"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const noticeController_1 = require("../controllers/noticeController");
const auth_1 = require("../middleware/auth");
const upload_1 = require("../middleware/upload");
const router = (0, express_1.Router)();
// Public Routes (Students can access these)
router.get('/', noticeController_1.getNotices);
router.get('/:id', noticeController_1.getNoticeById);
// Admin-Protected Routes (Requires valid JWT)
router.get('/stats/dashboard', auth_1.authenticateJWT, noticeController_1.getDashboardStats);
router.post('/', auth_1.authenticateJWT, upload_1.upload.array('attachments', 5), noticeController_1.createNotice);
router.put('/:id', auth_1.authenticateJWT, upload_1.upload.array('attachments', 5), noticeController_1.updateNotice);
router.delete('/:id', auth_1.authenticateJWT, noticeController_1.deleteNotice);
exports.default = router;
