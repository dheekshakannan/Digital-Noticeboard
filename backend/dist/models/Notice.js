"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Notice = void 0;
const mongoose_1 = require("mongoose");
const attachmentSchema = new mongoose_1.Schema({
    fileName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['image', 'pdf'], required: true }
});
const noticeSchema = new mongoose_1.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    category: {
        type: String,
        enum: ['Academic', 'Examination', 'Placement', 'Events', 'Sports', 'Circulars', 'General Announcements'],
        required: true
    },
    attachments: [attachmentSchema],
    expiryDate: { type: Date, required: true },
    aiSummary: { type: String, default: '' },
    views: { type: Number, default: 0 },
    viewedBy: { type: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }], default: [] },
    createdBy: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});
// Create text index for standard MongoDB keyword searches
noticeSchema.index({ title: 'text', content: 'text' });
exports.Notice = (0, mongoose_1.model)('Notice', noticeSchema);
