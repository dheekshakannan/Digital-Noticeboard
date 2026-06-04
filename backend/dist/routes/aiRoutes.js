"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ai_1 = require("../config/ai");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Route: POST /api/ai/summarize (Admin Protected)
// Takes { title, content } and returns the generated bullet highlights
router.post('/summarize', auth_1.authenticateJWT, async (req, res) => {
    try {
        const { title, content } = req.body;
        if (!title || !content) {
            res.status(400).json({ success: false, message: 'Please provide both title and content fields.' });
            return;
        }
        const summary = await (0, ai_1.generateSummary)(title, content);
        res.status(200).json({
            success: true,
            aiSummary: summary
        });
    }
    catch (error) {
        console.error('Manual summarization routing error:', error);
        res.status(550).json({ success: false, message: 'Failed to generate AI summary.' });
    }
});
exports.default = router;
