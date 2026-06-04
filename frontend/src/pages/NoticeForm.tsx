import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  ArrowLeft, Save, Sparkles, Loader2, FileText, 
  Image as ImageIcon, X, UploadCloud, AlertCircle, RefreshCw 
} from 'lucide-react';

const CATEGORIES = [
  'Academic',
  'Examination',
  'Placement',
  'Events',
  'Sports',
  'Circulars',
  'General Announcements'
];

export const NoticeForm: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Academic');
  const [content, setContent] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  
  // Attachments Queues
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>([]);
  const [keptAttachmentUrls, setKeptAttachmentUrls] = useState<string[]>([]);
  
  // States
  const [loading, setLoading] = useState(false);
  const [summaryDraft, setSummaryDraft] = useState('');
  const [summarizing, setSummarizing] = useState(false);
  const [error, setError] = useState('');

  // Fetch data if editing
  useEffect(() => {
    if (user && isEditMode) {
      const fetchNotice = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/notices/${id}`);
          if (response.data.success) {
            const notice = response.data.data;
            setTitle(notice.title);
            setCategory(notice.category);
            setContent(notice.content);
            
            // Format expiry date to YYYY-MM-DD for input picker
            const expDate = new Date(notice.expiryDate);
            const formattedDate = expDate.toISOString().substring(0, 10);
            setExpiryDate(formattedDate);
            
            setExistingAttachments(notice.attachments);
            setKeptAttachmentUrls(notice.attachments.map((att: any) => att.fileUrl));
            setSummaryDraft(notice.aiSummary || '');
          }
        } catch (err: any) {
          console.error('Error fetching notice for edit:', err);
          setError('Failed to retrieve notice details for editing.');
        } finally {
          setLoading(false);
        }
      };

      fetchNotice();
    } else {
      // Set default expiry date (7 days from today) in Create mode
      const defaultExp = new Date();
      defaultExp.setDate(defaultExp.getDate() + 7);
      setExpiryDate(defaultExp.toISOString().substring(0, 10));
    }
  }, [id, isEditMode, user]);

  // Handle live AI summarizer preview
  const handleGenerateSummaryPreview = async () => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill out both the title and description before generating an AI summary.');
      return;
    }

    setSummarizing(true);
    try {
      const response = await api.post('/ai/summarize', { title, content });
      if (response.data.success || response.data.aiSummary) {
        // Handle direct summary response structure
        // If our direct backend calls /ai/summarize, it passes body text
        setSummaryDraft(response.data.aiSummary || response.data);
      } else {
        // API controller helper
        const fallbackText = response.data.summary || response.data;
        setSummaryDraft(fallbackText);
      }
    } catch (err) {
      console.error('Failed to generate summary preview:', err);
      // Run local fallback directly on client if endpoint errored
      generateClientFallbackSummary();
    } finally {
      setSummarizing(false);
    }
  };

  const generateClientFallbackSummary = () => {
    const plainText = content.replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' ').trim();
    const sentences = plainText.split(/(?<=[.!?])\s+/).filter(s => s.length > 5);
    const limit = Math.min(3, sentences.length);
    let fallback = '';
    for (let i = 0; i < limit; i++) {
      fallback += `• ${sentences[i]}\n`;
    }
    setSummaryDraft(fallback.trim());
  };

  // Add files to queue
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Limit file size to 5MB
      const validFiles = filesArray.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          alert(`File "${file.name}" exceeds the 5MB size limit.`);
          return false;
        }
        return true;
      });

      setNewFiles(prev => [...prev, ...validFiles]);
    }
  };

  // Remove file from queue
  const handleRemoveNewFile = (idx: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== idx));
  };

  // Remove existing attachment
  const handleToggleKeepExisting = (url: string) => {
    setKeptAttachmentUrls(prev => 
      prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]
    );
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || !category || !expiryDate) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    // Prepare multi-part FormData
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('category', category);
    formData.append('content', content.trim());
    formData.append('expiryDate', new Date(expiryDate).toISOString());

    // Send the list of existing attachments we want to preserve
    if (isEditMode) {
      formData.append('keepAttachments', JSON.stringify(keptAttachmentUrls));
    }

    // Append newly selected files
    newFiles.forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      if (isEditMode) {
        await api.put(`/notices/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/notices', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error('Error saving notice:', err);
      setError(err.response?.data?.message || 'Failed to submit notice board entry.');
    } finally {
      setLoading(false);
    }
  };

  // Protected route evaluation
  if (authLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="h-6 w-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-xs text-slate-400">Restoring auth credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Header link */}
      <Link
        to="/admin/dashboard"
        className="inline-flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-500 mb-6 group transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        <span>Return to Dashboard</span>
      </Link>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 shadow-lg rounded-3xl p-6 sm:p-8 space-y-6">
        
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-850 dark:text-white">
            {isEditMode ? 'Modify Bulletin Notice' : 'Draft New Campus Notice'}
          </h1>
          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-semibold">
            Deploy official updates, academic files, and assign category filters.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl border border-red-200/50 bg-red-50 text-red-700 dark:bg-red-950/20 dark:border-red-900/40 dark:text-red-400 flex items-center space-x-2.5">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="text-xs font-semibold leading-normal">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Group 1: Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Notice Title */}
            <div className="md:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">
                Notice Title *
              </label>
              <input
                type="text"
                placeholder="e.g. End Semester Examination Time Table - Autumn 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white interactive-transition"
                required
              />
            </div>

            {/* Category selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">
                Notice Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white cursor-pointer interactive-transition"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

          </div>

          {/* Notice Expiry picker */}
          <div className="space-y-1.5 max-w-xs">
            <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">
              Notice Expiry Date *
            </label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white cursor-pointer interactive-transition"
              required
            />
            <span className="block text-[10px] text-slate-400 font-medium">
              Notice will automatically drop off student boards after this date.
            </span>
          </div>

          {/* Description Text Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">
              Notice Announcement Content *
            </label>
            <textarea
              rows={8}
              placeholder="Fulfill notice details clearly here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 dark:text-white leading-relaxed select-text interactive-transition"
              required
            />
          </div>

          {/* Live AI Summarizer preview Panel */}
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-3 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center space-x-2 text-indigo-600 dark:text-indigo-400">
                <Sparkles className="h-4.5 w-4.5" />
                <h4 className="text-xs font-bold uppercase tracking-wider">Gemini AI Summary Preview</h4>
              </div>
              
              <button
                type="button"
                onClick={handleGenerateSummaryPreview}
                disabled={summarizing}
                className="flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xxs font-bold text-indigo-700 bg-indigo-50 dark:text-indigo-300 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-900/40 hover:bg-indigo-100 transition-all cursor-pointer"
              >
                {summarizing ? (
                  <>
                    <RefreshCw className="h-3 w-3 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3" />
                    <span>Draft Summary</span>
                  </>
                )}
              </button>
            </div>

            {summaryDraft ? (
              <div className="p-3 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-850 rounded-xl text-xs text-indigo-950 dark:text-indigo-250 leading-relaxed font-medium whitespace-pre-line select-text">
                {summaryDraft}
              </div>
            ) : (
              <p className="text-[10px] text-slate-400 dark:text-slate-550 font-medium">
                No draft preview generated yet. Click "Draft Summary" above to check how Gemini will bullet-highlight this notice for students. (This will be automatically compiled on submission).
              </p>
            )}
          </div>

          {/* File Attachments Uploader */}
          <div className="space-y-3.5">
            <label className="text-xs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wide">
              Document Attachments (Images & PDFs)
            </label>

            {/* Drag Drop Area */}
            <div className="relative border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-brand-500/50 dark:hover:border-brand-500/40 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/20 dark:bg-slate-950/10 hover:bg-slate-50 dark:hover:bg-slate-950 interactive-transition">
              <input
                type="file"
                multiple
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="h-10 w-10 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-650 dark:text-slate-350">
                Click or drag files here to attach
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                Supports PDF, JPG, PNG, WEBP, GIF up to 5MB each.
              </p>
            </div>

            {/* Retain current files list (In Edit Mode) */}
            {isEditMode && existingAttachments.length > 0 && (
              <div className="space-y-2">
                <span className="block text-xxs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Current Attachments (Uncheck to delete from server)
                </span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {existingAttachments.map((att, idx) => {
                    const keep = keptAttachmentUrls.includes(att.fileUrl);
                    return (
                      <div 
                        key={idx}
                        onClick={() => handleToggleKeepExisting(att.fileUrl)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer select-none transition-colors ${
                          keep 
                            ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-950/10 dark:border-emerald-900/40 text-emerald-850 dark:text-emerald-400 font-semibold' 
                            : 'bg-rose-50/50 border-rose-200 text-rose-850 dark:bg-rose-950/10 dark:border-rose-900/40 dark:text-rose-400 line-through'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          {att.fileType === 'pdf' ? <FileText className="h-4 w-4" /> : <ImageIcon className="h-4 w-4" />}
                          <span className="text-xs truncate">{att.fileName}</span>
                        </div>
                        <input
                          type="checkbox"
                          checked={keep}
                          onChange={() => {}} // Swallowed: Handled by parent click
                          className="rounded accent-emerald-500 h-3.5 w-3.5"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Upload Queue list */}
            {newFiles.length > 0 && (
              <div className="space-y-2">
                <span className="block text-xxs font-bold text-slate-450 dark:text-slate-500 uppercase tracking-widest">
                  Files to Upload ({newFiles.length})
                </span>
                
                <div className="space-y-1.5">
                  {newFiles.map((file, idx) => (
                    <div 
                      key={idx} 
                      className="flex items-center justify-between p-2 px-3 bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-855 rounded-xl"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        {file.type === 'application/pdf' ? (
                          <FileText className="h-4 w-4 text-rose-500" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-sky-500" />
                        )}
                        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium truncate">
                          {file.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => handleRemoveNewFile(idx)}
                        className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-400 hover:text-red-500 cursor-pointer"
                        title="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-150 dark:border-slate-850 flex items-center justify-end space-x-3.5">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-950 text-slate-600 dark:text-slate-350 cursor-pointer"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-brand-500/10 cursor-pointer transition-all duration-200 hover:scale-102 active:scale-98"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" />
                  <span>Submitting bulletin...</span>
                </>
              ) : (
                <>
                  <Save className="h-4.5 w-4.5" />
                  <span>{isEditMode ? 'Update Notice' : 'Post Notice'}</span>
                </>
              )}
            </button>
          </div>

        </form>

      </div>

    </div>
  );
};
