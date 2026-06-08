import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, FileText, Image as ImageIcon, ArrowRight, Eye, ShieldAlert } from 'lucide-react';

export interface INotice {
  _id: string;
  title: string;
  content: string;
  category: 'Academic' | 'Examination' | 'Placement' | 'Events' | 'Sports' | 'Circulars' | 'General Announcements';
  attachments: Array<{
    fileName: string;
    fileUrl: string;
    fileType: 'image' | 'pdf';
  }>;
  expiryDate: string;
  aiSummary?: string;
  views: number;
  isAlert: boolean;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface NoticeCardProps {
  notice: INotice;
}

// Category badge color mapping utility
export const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'Academic':
      return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200/60 dark:border-blue-900/40';
    case 'Examination':
      return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200/60 dark:border-rose-900/40';
    case 'Placement':
      return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/40';
    case 'Events':
      return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-900/40';
    case 'Sports':
      return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/40';
    case 'Circulars':
      return 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-900/40';
    default:
      return 'bg-slate-50 dark:bg-slate-900/40 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-800/40';
  }
};

export const NoticeCard: React.FC<NoticeCardProps> = ({ notice }) => {
  // Format Date Helper
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Calculate Days Remaining
  const getDaysRemaining = (expiryDateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDateStr);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return 'Expires tomorrow';
    return `${diffDays} days left`;
  };

  const daysRemaining = getDaysRemaining(notice.expiryDate);
  const isExpiringSoon = daysRemaining === 'Expires today' || daysRemaining === 'Expires tomorrow' || daysRemaining.startsWith('2 ') || daysRemaining.startsWith('3 ');

  // Count attachment types
  const pdfCount = notice.attachments.filter((a) => a.fileType === 'pdf').length;
  const imgCount = notice.attachments.filter((a) => a.fileType === 'image').length;

  // Clean HTML from content for snippet preview
  const getContentSnippet = (htmlContent: string) => {
    const plainText = htmlContent.replace(/<\/?[^>]+(>|$)/g, ' ');
    return plainText.substring(0, 140) + (plainText.length > 140 ? '...' : '');
  };

  const cardBorderClass = notice.isAlert 
    ? 'border-red-500/50 dark:border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.08)] hover:shadow-[0_0_20px_rgba(239,68,68,0.15)] bg-rose-50/10 dark:bg-rose-950/5' 
    : 'border-slate-200/80 dark:border-slate-850 hover:shadow-xl dark:hover:shadow-brand-500/5';

  return (
    <div className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border ${cardBorderClass} transition-all duration-300 hover:-translate-y-1`}>
      <div>
        
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getCategoryStyles(notice.category)}`}>
              {notice.category}
            </span>
            {notice.isAlert && (
              <span className="flex items-center space-x-1.5 px-2.5 py-1 text-[10px] font-extrabold text-rose-600 dark:text-rose-455 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/30 rounded-full">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500 dark:bg-rose-400 inline-block animate-pulse"></span>
                <span>ALERT</span>
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {notice.isPinned && (
              <span className="text-sm" title="Pinned Announcement">📌</span>
            )}
            <div className="flex items-center space-x-1.5 text-xxs font-medium text-slate-400">
              <Eye className="h-3.5 w-3.5" />
              <span>{notice.views} views</span>
            </div>
          </div>
        </div>

        {/* Notice Title */}
        <Link to={`/notice/${notice._id}`}>
          <h3 className="text-base font-bold text-slate-800 dark:text-white line-clamp-2 hover:text-brand-500 dark:hover:text-brand-400 transition-colors duration-200">
            {notice.title}
          </h3>
        </Link>

        {/* Notice Preview Text */}
        <p className="mt-2.5 text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
          {getContentSnippet(notice.content)}
        </p>

      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        
        {/* Dates & Expiry indicators */}
        <div className="flex flex-col space-y-1 text-xxs font-medium">
          <span className="flex items-center text-slate-400">
            <Calendar className="h-3.5 w-3.5 mr-1 text-slate-400" />
            {formatDate(notice.createdAt)}
          </span>
          <span className={`flex items-center ${isExpiringSoon ? 'text-amber-500 font-semibold' : 'text-slate-400'}`}>
            <ShieldAlert className="h-3.5 w-3.5 mr-1" />
            {daysRemaining}
          </span>
        </div>

        {/* Attachments Indicator & CTA */}
        <div className="flex items-center space-x-3.5">
          <div className="flex items-center space-x-1.5 text-slate-400">
            {pdfCount > 0 && (
              <div className="flex items-center text-rose-500/90 dark:text-rose-400/90 hover:scale-105" title={`${pdfCount} PDF Attachment(s)`}>
                <FileText className="h-4 w-4" />
                {pdfCount > 1 && <span className="text-xxs ml-0.5">{pdfCount}</span>}
              </div>
            )}
            {imgCount > 0 && (
              <div className="flex items-center text-sky-500/90 dark:text-sky-400/90 hover:scale-105" title={`${imgCount} Image Attachment(s)`}>
                <ImageIcon className="h-4 w-4" />
                {imgCount > 1 && <span className="text-xxs ml-0.5">{imgCount}</span>}
              </div>
            )}
          </div>
          
          <Link
            to={`/notice/${notice._id}`}
            className="flex items-center text-xs font-bold text-brand-500 dark:text-brand-400 group-hover:translate-x-0.5 transition-transform duration-200"
          >
            <span>Details</span>
            <ArrowRight className="h-3.5 w-3.5 ml-1" />
          </Link>
        </div>

      </div>

    </div>
  );
};
