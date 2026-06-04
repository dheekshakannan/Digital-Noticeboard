import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { getCategoryStyles } from '../components/NoticeCard';
import type { INotice } from '../components/NoticeCard';
import { 
  ArrowLeft, Calendar, Eye, FileText, Image as ImageIcon, Download, 
  Volume2, VolumeX, Play, Pause, Square, Sparkles, DownloadCloud 
} from 'lucide-react';

export const NoticeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [notice, setNotice] = useState<INotice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Gallery Modal
  const [activeImageModal, setActiveImageModal] = useState<string | null>(null);

  // Web Speech API Voice Reader State
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechState, setSpeechState] = useState<'idle' | 'playing' | 'paused'>('idle');
  const [readingSpeed, setReadingSpeed] = useState(1); // 1x default speed
  const [utteranceInstance, setUtteranceInstance] = useState<SpeechSynthesisUtterance | null>(null);

  // Fetch notice details on mount
  useEffect(() => {
    const fetchNotice = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/notices/${id}`);
        if (response.data.success) {
          setNotice(response.data.data);
        }
      } catch (err: any) {
        console.error('Error fetching notice details:', err);
        setError('Notice not found or backend server connection lost.');
      } finally {
        setLoading(false);
      }
    };

    fetchNotice();

    // Check speech synthesis support
    if ('speechSynthesis' in window) {
      setSpeechSupported(true);
    }

    // Cleanup: Cancel speech on page nav/unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [id]);

  // Adjust reading speed in real-time if speaking
  useEffect(() => {
    if (utteranceInstance && speechState === 'playing') {
      // Unfortunately Web Speech API rates cannot always be mutated mid-speech in some browsers
      // To ensure consistency, we stop and restart from the beginning, or just store it for next click.
      // For this project, speed updates are saved for the next utterance start or when resumed.
    }
  }, [readingSpeed, utteranceInstance]);

  // Strip HTML utility to read pure text content
  const getStrippedText = (htmlContent: string) => {
    return htmlContent.replace(/<\/?[^>]+(>|$)/g, ' ').replace(/\s+/g, ' ').trim();
  };

  // Text-To-Speech Handlers
  const startSpeaking = () => {
    if (!notice || !speechSupported) return;

    // If speech is currently paused, we simply resume
    if (speechState === 'paused') {
      window.speechSynthesis.resume();
      setSpeechState('playing');
      return;
    }

    // Otherwise, generate a new utterance
    window.speechSynthesis.cancel(); // Stop any current speech first
    
    const textToRead = `Notice Title: ${notice.title}. Category: ${notice.category}. Announcement: ${getStrippedText(notice.content)}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    
    utterance.rate = readingSpeed;
    
    // Set callback event hooks
    utterance.onend = () => {
      setSpeechState('idle');
      setUtteranceInstance(null);
    };

    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setSpeechState('idle');
      setUtteranceInstance(null);
    };

    setUtteranceInstance(utterance);
    setSpeechState('playing');
    window.speechSynthesis.speak(utterance);
  };

  const pauseSpeaking = () => {
    if (!speechSupported || speechState !== 'playing') return;
    window.speechSynthesis.pause();
    setSpeechState('paused');
  };

  const stopSpeaking = () => {
    if (!speechSupported) return;
    window.speechSynthesis.cancel();
    setSpeechState('idle');
    setUtteranceInstance(null);
  };

  // Render Date Formatter
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Force download cross-origin files by converting to Blob
  const handleDownload = async (fileUrl: string, fileName: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const backendUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') 
        : 'http://localhost:5000';
      const response = await fetch(`${backendUrl}${fileUrl}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download PDF:', error);
      // Fallback: open in new tab
      const backendUrl = import.meta.env.VITE_API_URL 
        ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') 
        : 'http://localhost:5000';
      window.open(`${backendUrl}${fileUrl}`, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-16 mb-8"></div>
        <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3 mb-10"></div>
        <div className="h-28 bg-slate-100 dark:bg-slate-850 rounded-2xl mb-8"></div>
        <div className="space-y-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error || !notice) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <h3 className="text-xl font-bold text-red-500">Notice Load Failed</h3>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{error || 'This notice does not exist.'}</p>
        <Link to="/" className="mt-6 inline-flex items-center text-sm font-semibold text-brand-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Notice Board
        </Link>
      </div>
    );
  }

  const images = notice.attachments.filter(att => att.fileType === 'image');
  const pdfs = notice.attachments.filter(att => att.fileType === 'pdf');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-300">
      
      {/* Back Button */}
      <Link
        to="/"
        className="inline-flex items-center text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-brand-500 dark:hover:text-brand-400 mb-6 group transition-colors"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5 transition-transform duration-200 group-hover:-translate-x-0.5" />
        <span>Back to Board</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Notice Content details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Header Card */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl shadow-sm space-y-4">
            
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3.5 py-1.5 text-xs font-semibold rounded-full border ${getCategoryStyles(notice.category)}`}>
                {notice.category}
              </span>
              <span className="flex items-center text-xxs font-medium text-slate-400">
                <Eye className="h-3.5 w-3.5 mr-1" />
                {notice.views} views
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-850 dark:text-white leading-tight">
              {notice.title}
            </h1>

            <div className="flex items-center text-xxs font-medium text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-3.5">
              <Calendar className="h-4 w-4 mr-1.5" />
              <span>Posted on {formatDate(notice.createdAt)}</span>
            </div>

          </div>

          {/* AI Notice Summarizer (High visual impact box) */}
          {notice.aiSummary && (
            <div className="p-5.5 rounded-3xl border border-indigo-200/60 dark:border-indigo-900/40 bg-gradient-to-tr from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20 shadow-sm relative overflow-hidden">
              <div className="absolute right-0 top-0 w-24 h-24 rounded-full bg-indigo-500/5 blur-2xl"></div>
              
              <div className="flex items-center space-x-2 text-indigo-700 dark:text-indigo-400 mb-3.5">
                <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/50">
                  <Sparkles className="h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h3 className="text-sm font-bold tracking-wide uppercase">AI Bullet Summarizer</h3>
              </div>

              {/* Renders summary as structured bullet list */}
              <div className="text-xs sm:text-sm text-indigo-900/90 dark:text-indigo-200/90 space-y-2.5 font-medium leading-relaxed whitespace-pre-line">
                {notice.aiSummary}
              </div>
            </div>
          )}

          {/* Notice Body Text */}
          <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl shadow-sm">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Official Announcement</h2>
            
            <div 
              className="text-sm sm:text-base text-slate-700 dark:text-slate-350 leading-relaxed font-normal whitespace-pre-wrap select-text"
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />
          </div>

          {/* Image Attachments Gallery */}
          {images.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <ImageIcon className="h-4 w-4 mr-1.5 text-slate-400" />
                Image Attachments ({images.length})
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                {images.map((img, i) => (
                  <div 
                    key={i} 
                    onClick={() => setActiveImageModal(`http://localhost:5000${img.fileUrl}`)}
                    className="relative rounded-2xl border border-slate-200 dark:border-slate-850 overflow-hidden cursor-zoom-in hover:shadow-lg transition-shadow duration-200 bg-slate-100 dark:bg-slate-950 aspect-video group"
                  >
                    <img 
                      src={`http://localhost:5000${img.fileUrl}`} 
                      alt={img.fileName}
                      className="w-full h-full object-cover transform duration-350 group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <span className="px-3 py-1.5 rounded-lg bg-black/60 text-white text-xs font-semibold">
                        Preview
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Audio panel & PDF attachments list */}
        <div className="space-y-6">
          
          {/* AI Voice Reader Module */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl shadow-sm">
            <div className="flex items-center space-x-2 text-brand-500 dark:text-brand-400 mb-4">
              <Volume2 className="h-5 w-5" />
              <h3 className="text-sm font-bold tracking-wide uppercase">AI Voice Reader</h3>
            </div>

            {speechSupported ? (
              <div className="space-y-4">
                <p className="text-xxs text-slate-450 dark:text-slate-500 leading-relaxed font-medium">
                  Listen to this notice read aloud. Adjust reading speeds matching your preference.
                </p>

                {/* Status Indicator */}
                <div className="flex items-center justify-center py-2.5 px-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850/50">
                  <span className="flex items-center text-xs font-bold text-slate-600 dark:text-slate-350">
                    {speechState === 'playing' && (
                      <span className="flex space-x-1.5 mr-2">
                        <span className="w-1.5 h-3.5 bg-brand-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-3.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                        <span className="w-1.5 h-3.5 bg-brand-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                      </span>
                    )}
                    Status: <span className="capitalize text-brand-500 ml-1.5">{speechState}</span>
                  </span>
                </div>

                {/* Control Trigger buttons */}
                <div className="flex items-center justify-center gap-2">
                  {speechState === 'playing' ? (
                    <button
                      onClick={pauseSpeaking}
                      className="p-3 rounded-2xl bg-indigo-500 hover:bg-indigo-600 text-white cursor-pointer shadow-md shadow-indigo-500/10 hover:scale-105 active:scale-95 transition-transform"
                      title="Pause Speech"
                    >
                      <Pause className="h-4.5 w-4.5" />
                    </button>
                  ) : (
                    <button
                      onClick={startSpeaking}
                      className="flex-1 flex items-center justify-center space-x-1.5 px-4.5 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/10 cursor-pointer hover:scale-103 active:scale-97 transition-all duration-200"
                      title="Start Speech"
                    >
                      <Play className="h-4 w-4" />
                      <span>{speechState === 'paused' ? 'Resume' : 'Read Aloud'}</span>
                    </button>
                  )}

                  {speechState !== 'idle' && (
                    <button
                      onClick={stopSpeaking}
                      className="p-3 rounded-2xl border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer hover:scale-105 active:scale-95 transition-all"
                      title="Stop Speech"
                    >
                      <Square className="h-4.5 w-4.5 fill-current" />
                    </button>
                  )}
                </div>

                {/* Speed rate slider */}
                <div className="pt-2">
                  <div className="flex justify-between text-xxs font-bold text-slate-450 dark:text-slate-500 mb-1.5">
                    <span>READING SPEED</span>
                    <span className="text-brand-500 dark:text-brand-400">{readingSpeed}x</span>
                  </div>
                  
                  <input
                    type="range"
                    min="0.5"
                    max="2.0"
                    step="0.1"
                    value={readingSpeed}
                    onChange={(e) => setReadingSpeed(parseFloat(e.target.value))}
                    className="w-full accent-brand-500 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer h-1.5"
                  />
                </div>

              </div>
            ) : (
              <div className="p-3 text-center rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-xs font-medium border border-amber-200/50 dark:border-amber-900/30 flex items-center justify-center space-x-2">
                <VolumeX className="h-4.5 w-4.5" />
                <span>Text-to-speech is unsupported in this browser.</span>
              </div>
            )}
          </div>

          {/* PDF circulars attachments list */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-850 rounded-3xl shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-800 dark:text-white">
              <FileText className="h-5 w-5 text-rose-500" />
              <h3 className="text-sm font-bold tracking-wide uppercase">PDF Attachments</h3>
            </div>

            {pdfs.length > 0 ? (
              <div className="space-y-2">
                {pdfs.map((pdf, idx) => {
                  const backendUrl = import.meta.env.VITE_API_URL 
                    ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') 
                    : 'http://localhost:5000';
                  return (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950 transition-all duration-200 group"
                    >
                      {/* Left side: View Link (File Icon + Name) */}
                      <a
                        href={`${backendUrl}${pdf.fileUrl}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center space-x-2 truncate flex-1 hover:text-brand-500 transition-colors cursor-pointer"
                        title="View PDF"
                      >
                        <FileText className="h-4 w-4 text-rose-500 shrink-0" />
                        <span className="text-xs text-slate-700 dark:text-slate-350 truncate font-medium">
                          {pdf.fileName}
                        </span>
                      </a>
                      
                      {/* Right side: Action Buttons */}
                      <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                        {/* View Button */}
                        <a
                          href={`${backendUrl}${pdf.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-500 hover:border-brand-500/50 hover:bg-brand-50/50 dark:hover:bg-slate-950 transition-all cursor-pointer"
                          title="View PDF in New Tab"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </a>

                        {/* Download Button */}
                        <button
                          onClick={(e) => handleDownload(pdf.fileUrl, pdf.fileName, e)}
                          className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-400 hover:text-brand-500 hover:border-brand-500/50 hover:bg-brand-50/50 dark:hover:bg-slate-950 transition-all cursor-pointer"
                          title="Download PDF"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                <DownloadCloud className="h-7 w-7 text-slate-400 mx-auto mb-2" />
                <p className="text-xxs text-slate-450 dark:text-slate-550 leading-relaxed max-w-[160px] mx-auto font-medium">
                  No reference circulars or PDF files attached to this board notice.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Image Modal Lightbox overlay */}
      {activeImageModal && (
        <div 
          className="fixed inset-0 z-100 flex items-center justify-center bg-black/90 p-4 transition-opacity duration-300"
          onClick={() => setActiveImageModal(null)}
        >
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-xl">
            <img 
              src={activeImageModal} 
              alt="Attachment Modal Full" 
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
            />
            <span className="absolute top-3 right-3 text-white bg-black/60 px-3 py-1 rounded-full text-xxs font-bold cursor-pointer hover:bg-black">
              Close (Click anywhere)
            </span>
          </div>
        </div>
      )}

    </div>
  );
};
