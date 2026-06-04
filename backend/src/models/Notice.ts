import { Schema, model, Types } from 'mongoose';

// Define structures for TypeScript compilation
export interface IAttachment {
  fileName: string;
  fileUrl: string; // Static URL path, e.g. /uploads/filename.pdf
  fileType: 'image' | 'pdf';
}

export interface INotice {
  title: string;
  content: string;
  category: 'Academic' | 'Examination' | 'Placement' | 'Events' | 'Sports' | 'Circulars' | 'General Announcements';
  attachments: IAttachment[];
  expiryDate: Date;
  aiSummary?: string;
  views: number;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const attachmentSchema = new Schema<IAttachment>({
  fileName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['image', 'pdf'], required: true }
});

const noticeSchema = new Schema<INotice>({
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
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

// Create text index for standard MongoDB keyword searches
noticeSchema.index({ title: 'text', content: 'text' });

export const Notice = model<INotice>('Notice', noticeSchema);
