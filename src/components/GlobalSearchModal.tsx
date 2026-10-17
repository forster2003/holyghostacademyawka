/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Search, X, FileText, Download, Lock, Key, 
  GraduationCap, Newspaper, ArrowRight, Eye, 
  Sparkles, ShieldCheck, User, Calendar, 
  Award, FileSpreadsheet, ChevronRight, Hash,
  CheckCircle2, Clock
} from 'lucide-react';
import { DocumentItem, StudentResult, NewsItem } from '../types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  isAdminLoggedIn: boolean;
  documents: DocumentItem[];
  results: StudentResult[];
  news: NewsItem[];
  onDownloadDocument?: (doc: DocumentItem) => void;
  onNavigateAdminTab?: (tab: string, query?: string, resultId?: string) => void;
  onOpenAdminLogin?: () => void;
  onNavigatePublicPage?: (page: string) => void;
}

type SearchCategory = 'all' | 'students' | 'documents' | 'news';

export default function GlobalSearchModal({
  isOpen,
  onClose,
  isAdminLoggedIn,
  documents = [],
  results = [],
  news = [],
  onDownloadDocument,
  onNavigateAdminTab,
  onOpenAdminLogin,
  onNavigatePublicPage
}: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [previewStudent, setPreviewStudent] = useState<StudentResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      setQuery('');
      setPreviewStudent(null);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewStudent) {
          setPreviewStudent(null);
        } else if (isOpen) {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, previewStudent, onClose]);

  // Search filtering
  const trimmedQuery = query.trim().toLowerCase();

  const filteredStudents = useMemo(() => {
    if (!trimmedQuery) return results.slice(0, 5);
    return results.filter((res) => {
      const nameMatch = res.studentName?.toLowerCase().includes(trimmedQuery);
      const idMatch = res.studentId?.toLowerCase().includes(trimmedQuery);
      const classMatch = res.classLevel?.toLowerCase().includes(trimmedQuery);
      const termMatch = res.term?.toLowerCase().includes(trimmedQuery);
      const sessionMatch = res.academicSession?.toLowerCase().includes(trimmedQuery);
      const rankMatch = res.position?.toLowerCase().includes(trimmedQuery);
      const promoMatch = res.promotionStatus?.toLowerCase().includes(trimmedQuery);
      const subjectMatch = res.subjectScores?.some(s => s.subject?.toLowerCase().includes(trimmedQuery));
      return nameMatch || idMatch || classMatch || termMatch || sessionMatch || rankMatch || promoMatch || subjectMatch;
    });
  }, [results, trimmedQuery]);

  const filteredDocuments = useMemo(() => {
    if (!trimmedQuery) return documents.slice(0, 5);
    return documents.filter((doc) => {
      const titleMatch = doc.title?.toLowerCase().includes(trimmedQuery);
      const typeMatch = doc.fileType?.toLowerCase().includes(trimmedQuery);
      const dateMatch = doc.uploadDate?.toLowerCase().includes(trimmedQuery);
      const isProtected = trimmedQuery === 'protected' && Boolean(doc.accessPassword);
      const isPublic = trimmedQuery === 'public' && !doc.accessPassword;
      return titleMatch || typeMatch || dateMatch || isProtected || isPublic;
    });
  }, [documents, trimmedQuery]);

  const filteredNews = useMemo(() => {
    if (!trimmedQuery) return news.slice(0, 5);
    return news.filter((item) => {
      const titleMatch = item.title?.toLowerCase().includes(trimmedQuery);
      const catMatch = item.category?.toLowerCase().includes(trimmedQuery);
      const contentMatch = item.content?.toLowerCase().includes(trimmedQuery);
      const dateMatch = item.date?.toLowerCase().includes(trimmedQuery);
      return titleMatch || catMatch || contentMatch || dateMatch;
    });
  }, [news, trimmedQuery]);

  const totalResultsCount = filteredStudents.length + filteredDocuments.length + filteredNews.length;

  const handleOpenStudentInAdmin = (student: StudentResult) => {
    onClose();
    if (onNavigateAdminTab) {
      onNavigateAdminTab('results', student.studentName || student.studentId, student.id);
    }
  };

  const handleOpenDocumentInAdmin = () => {
    onClose();
    if (onNavigateAdminTab) {
      onNavigateAdminTab('documents');
    }
  };

  const handleOpenNewsInAdmin = () => {
    onClose();
    if (onNavigateAdminTab) {
      onNavigateAdminTab('news');
    }
  };

  const handleDownload = (doc: DocumentItem) => {
    if (onDownloadDocument) {
      onDownloadDocument(doc);
    }
  };

  const highlightMatch = (text: string, q: string) => {
    if (!q || !text) return text;
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-amber-200/90 text-amber-950 font-bold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-start justify-center p-3 sm:p-6 sm:pt-14 animate-fade-in font-sans">
      
      {/* Main Palette Container */}
      <div 
        className="w-full max-w-3xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Search Bar */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-brand-green to-brand-green-dark text-white border-b-2 border-brand-yellow/80">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center space-x-2">
              <span className="p-1 rounded bg-white/10 text-brand-yellow">
                <Search className="w-4 h-4" />
              </span>
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider font-heading text-white flex items-center gap-1.5">
                <span>Global Administrative Search</span>
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              {isAdminLoggedIn ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-yellow text-brand-oxblood-dark uppercase tracking-wider shadow-2xs">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Admin Session Active</span>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAdminLogin ? onOpenAdminLogin() : onNavigatePublicPage?.('admin');
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-white/15 hover:bg-white/25 text-white uppercase tracking-wider transition cursor-pointer"
                >
                  <Lock className="w-2.5 h-2.5 text-brand-yellow" />
                  <span>Login as Admin</span>
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                aria-label="Close search"
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search Input Box */}
          <div className="relative">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search across students, registration IDs, official documents, news..."
              className="w-full pl-10 pr-9 py-2.5 bg-white text-slate-800 placeholder-slate-400 text-xs sm:text-sm rounded-lg border-2 border-brand-yellow/60 focus:border-brand-yellow focus:outline-hidden font-medium shadow-inner"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-3 overflow-x-auto text-[11px] font-bold uppercase tracking-wider scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveCategory('all')}
              className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeCategory === 'all'
                  ? 'bg-brand-oxblood text-brand-yellow border border-brand-yellow/40 shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <span>All Results</span>
              <span className="px-1.5 py-0.2 bg-black/25 rounded-full text-[9px] font-mono">
                {totalResultsCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('students')}
              className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeCategory === 'students'
                  ? 'bg-brand-oxblood text-brand-yellow border border-brand-yellow/40 shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Students</span>
              <span className="px-1.5 py-0.2 bg-black/25 rounded-full text-[9px] font-mono">
                {filteredStudents.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('documents')}
              className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeCategory === 'documents'
                  ? 'bg-brand-oxblood text-brand-yellow border border-brand-yellow/40 shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Documents</span>
              <span className="px-1.5 py-0.2 bg-black/25 rounded-full text-[9px] font-mono">
                {filteredDocuments.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCategory('news')}
              className={`px-3 py-1 rounded-md transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                activeCategory === 'news'
                  ? 'bg-brand-oxblood text-brand-yellow border border-brand-yellow/40 shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Newspaper className="w-3.5 h-3.5" />
              <span>News & Events</span>
              <span className="px-1.5 py-0.2 bg-black/25 rounded-full text-[9px] font-mono">
                {filteredNews.length}
              </span>
            </button>
          </div>
        </div>

        {/* Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50/50">
          
          {/* Quick Suggestion Pills when query is empty */}
          {!trimmedQuery && (
            <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs space-y-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-brand-green">
                  <Sparkles className="w-3.5 h-3.5 text-brand-yellow" />
                  <span>Quick Suggested Filter Searches:</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {results.length} students • {documents.length} docs • {news.length} news
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {['SS 2', 'JSS 1', 'Mathematics', 'Academic Calendar', 'Prospectus', 'Exam', 'Sports', 'Graduation'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setQuery(tag);
                      inputRef.current?.focus();
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-brand-green/10 hover:text-brand-green text-slate-700 rounded-md text-xs font-semibold transition cursor-pointer border border-slate-200/80"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* No results notice */}
          {trimmedQuery && totalResultsCount === 0 && (
            <div className="py-12 text-center space-y-3 bg-white rounded-xl border border-dashed border-slate-300 p-6">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  No matching records found for "{query}"
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Try checking spelling, searching by student registration ID (e.g. HGASS/2026/...), or searching with broader keywords like "SS 2", "Calendar", or "PDF".
                </p>
              </div>
              <button
                type="button"
                onClick={() => setQuery('')}
                className="px-3.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Clear Search Filter
              </button>
            </div>
          )}

          {/* SECTION 1: STUDENTS */}
          {(activeCategory === 'all' || activeCategory === 'students') && filteredStudents.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-brand-oxblood flex items-center gap-1.5 font-heading">
                  <GraduationCap className="w-4 h-4 text-brand-green" />
                  <span>Student Registry & Terminal Grade Records ({filteredStudents.length})</span>
                </h3>
                {isAdminLoggedIn && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onNavigateAdminTab?.('results');
                    }}
                    className="text-[10px] font-bold text-brand-green hover:underline uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Grade Book</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {filteredStudents.map((student) => {
                  const avgScore = student.terminalAverage ?? 
                    (student.subjectScores && student.subjectScores.length > 0
                      ? Math.round(student.subjectScores.reduce((acc, s) => acc + (s.totalScore || 0), 0) / student.subjectScores.length)
                      : null);

                  return (
                    <div 
                      key={student.id}
                      className="bg-white p-3 rounded-lg border border-slate-200 hover:border-brand-green/40 hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        {/* Student Photo or Avatar */}
                        {student.passportPhoto ? (
                          <img
                            src={student.passportPhoto}
                            alt={student.studentName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-brand-green/30 shrink-0 shadow-2xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-brand-green/10 text-brand-green font-black flex items-center justify-center shrink-0 border border-brand-green/20 text-xs">
                            {student.studentName.substring(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <h4 className="font-bold text-slate-900 uppercase text-xs sm:text-sm leading-snug">
                              {highlightMatch(student.studentName, trimmedQuery)}
                            </h4>
                            <span className="px-1.5 py-0.2 rounded bg-brand-oxblood/10 text-brand-oxblood font-mono text-[9px] font-black uppercase border border-brand-oxblood/20">
                              {highlightMatch(student.studentId, trimmedQuery)}
                            </span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold text-[9px] uppercase border border-slate-200">
                              {student.classLevel}
                            </span>
                            {student.promotionStatus && (
                              <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 text-[9px] font-bold border border-emerald-200">
                                {student.promotionStatus}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-mono">
                            <span>Term: {student.term} ({student.academicSession})</span>
                            {student.position && <span>• Rank: <strong className="text-slate-700">{student.position}</strong></span>}
                            {avgScore !== null && (
                              <span className="text-brand-green font-bold">
                                • Avg: {avgScore}%
                              </span>
                            )}
                            {student.subjectScores && (
                              <span>• {student.subjectScores.length} Subjects</span>
                            )}
                            {isAdminLoggedIn && student.accessPassword && (
                              <span className="text-amber-800 bg-amber-50 px-1 py-0.2 rounded border border-amber-200 font-bold flex items-center gap-0.5">
                                <Key className="w-2.5 h-2.5" />
                                <span>PIN: {student.accessPassword}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => setPreviewStudent(student)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 border border-slate-200"
                          title="Preview full student scores"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                          <span>Quick Preview</span>
                        </button>

                        {isAdminLoggedIn ? (
                          <button
                            type="button"
                            onClick={() => handleOpenStudentInAdmin(student)}
                            className="px-2.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shadow-2xs"
                            title="Edit this student record in the Registrar Grade Book"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-brand-yellow" />
                            <span>Grade Book</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              onClose();
                              onNavigatePublicPage?.('results');
                            }}
                            className="px-2.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                          >
                            <span>View Sheet</span>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 2: DOCUMENTS */}
          {(activeCategory === 'all' || activeCategory === 'documents') && filteredDocuments.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-brand-oxblood flex items-center gap-1.5 font-heading">
                  <FileSpreadsheet className="w-4 h-4 text-brand-green" />
                  <span>Official Documents & Publications ({filteredDocuments.length})</span>
                </h3>
                {isAdminLoggedIn && (
                  <button
                    type="button"
                    onClick={handleOpenDocumentInAdmin}
                    className="text-[10px] font-bold text-brand-green hover:underline uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <span>Manage Library</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredDocuments.map((doc) => {
                  const isPdf = doc.fileType?.toLowerCase() === 'pdf';
                  const isXlsx = doc.fileType?.toLowerCase() === 'xlsx';

                  return (
                    <div 
                      key={doc.id}
                      className="bg-white p-3 rounded-lg border border-slate-200 hover:border-brand-green/40 hover:shadow-xs transition flex flex-col justify-between gap-2.5 text-xs"
                    >
                      <div className="space-y-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 min-w-0">
                            <span className={`p-1.5 rounded shrink-0 border ${
                              isPdf ? 'bg-red-50 text-red-600 border-red-200' :
                              isXlsx ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                              'bg-blue-50 text-blue-600 border-blue-200'
                            }`}>
                              <FileText className="w-4 h-4" />
                            </span>
                            <div className="min-w-0">
                              <h4 className="font-bold text-slate-800 uppercase line-clamp-1 leading-snug">
                                {highlightMatch(doc.title, trimmedQuery)}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-mono">
                                Format: <span className="font-bold text-brand-green uppercase">{doc.fileType}</span> • Size: {doc.fileSize}
                              </p>
                            </div>
                          </div>

                          {doc.accessPassword ? (
                            <span className="shrink-0 text-amber-700 bg-amber-50 border border-amber-200/80 rounded px-1.5 py-0.5 text-[8.5px] font-mono flex items-center gap-0.5" title="Password Protected">
                              <Lock className="w-2.5 h-2.5" />
                              <span>Protected</span>
                            </span>
                          ) : (
                            <span className="shrink-0 text-slate-500 bg-slate-100 rounded px-1.5 py-0.5 text-[8.5px] uppercase font-bold">
                              Public
                            </span>
                          )}
                        </div>

                        {isAdminLoggedIn && doc.accessPassword && (
                          <div className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200 px-2 py-1 rounded font-mono flex items-center justify-between">
                            <span className="font-bold flex items-center gap-1">
                              <Key className="w-3 h-3 text-amber-700" />
                              <span>Access PIN:</span>
                            </span>
                            <span className="font-black tracking-wider text-amber-950">{doc.accessPassword}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                        <span className="text-[9.5px] text-slate-400 font-mono">
                          {doc.uploadDate || 'Academic Session'}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {isAdminLoggedIn && (
                            <button
                              type="button"
                              onClick={handleOpenDocumentInAdmin}
                              className="px-2 py-1 text-slate-600 hover:text-brand-green rounded text-[10px] font-bold uppercase transition cursor-pointer"
                              title="Manage in Admin"
                            >
                              Manage
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleDownload(doc)}
                            className="px-2.5 py-1 bg-brand-green hover:bg-brand-green-dark text-white rounded text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Download className="w-3 h-3 text-brand-yellow" />
                            <span>Download</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SECTION 3: NEWS & ANNOUNCEMENTS */}
          {(activeCategory === 'all' || activeCategory === 'news') && filteredNews.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                <h3 className="text-xs font-black uppercase tracking-wider text-brand-oxblood flex items-center gap-1.5 font-heading">
                  <Newspaper className="w-4 h-4 text-brand-green" />
                  <span>News & Campus Announcements ({filteredNews.length})</span>
                </h3>
                {isAdminLoggedIn && (
                  <button
                    type="button"
                    onClick={handleOpenNewsInAdmin}
                    className="text-[10px] font-bold text-brand-green hover:underline uppercase flex items-center gap-1 cursor-pointer"
                  >
                    <span>News Desk</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-2.5">
                {filteredNews.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white p-3 rounded-lg border border-slate-200 hover:border-brand-green/40 hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-12 h-12 rounded object-cover border border-slate-200 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-slate-100 text-brand-green flex items-center justify-center shrink-0 border border-slate-200">
                          <Newspaper className="w-5 h-5" />
                        </div>
                      )}

                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-[9px] font-bold font-mono uppercase">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.date}
                          </span>
                          {item.isPublished && (
                            <span className="px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 text-[9px] font-bold uppercase">
                              Published
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-slate-900 uppercase text-xs sm:text-sm leading-snug line-clamp-1">
                          {highlightMatch(item.title, trimmedQuery)}
                        </h4>

                        <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                          {highlightMatch(item.content, trimmedQuery)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigatePublicPage?.('home');
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer"
                      >
                        Read Story
                      </button>

                      {isAdminLoggedIn && (
                        <button
                          type="button"
                          onClick={handleOpenNewsInAdmin}
                          className="px-2.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-[10.5px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                        >
                          <ShieldCheck className="w-3 h-3 text-brand-yellow" />
                          <span>Edit Article</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer shortcuts hint */}
        <div className="p-2.5 sm:p-3 bg-slate-100 border-t border-slate-200 text-slate-500 text-[10px] sm:text-[11px] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center space-x-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[9.5px] font-mono shadow-2xs">ESC</kbd>
              <span>to Close</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white border border-slate-300 rounded text-[9.5px] font-mono shadow-2xs">Ctrl + K</kbd>
              <span>Global Shortcut</span>
            </span>
          </div>

          <div className="flex items-center space-x-1.5 font-medium text-slate-600">
            <span>Holy Ghost Academy Administration Portal</span>
          </div>
        </div>

      </div>

      {/* QUICK STUDENT DETAIL PREVIEW MODAL */}
      {previewStudent && (
        <div 
          className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in font-sans"
          onClick={() => setPreviewStudent(null)}
        >
          <div 
            className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-brand-oxblood text-white p-4 flex items-center justify-between border-b-2 border-brand-yellow">
              <div className="flex items-center space-x-3">
                <span className="p-2 rounded-full bg-white/10 text-brand-yellow">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-sm sm:text-base uppercase tracking-tight font-heading text-white">
                    {previewStudent.studentName}
                  </h3>
                  <p className="text-[10px] text-brand-yellow font-mono">
                    ID: {previewStudent.studentId} • Class: {previewStudent.classLevel} • {previewStudent.term} ({previewStudent.academicSession})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewStudent(null)}
                className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
              {/* Top Summary Card */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Class Placement</span>
                  <span className="text-sm font-black text-brand-oxblood">{previewStudent.position || 'N/A'}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Terminal Average</span>
                  <span className="text-sm font-black text-brand-green">
                    {previewStudent.terminalAverage ? `${previewStudent.terminalAverage}%` : 'Computed'}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Promotion Status</span>
                  <span className="text-xs font-black text-emerald-800 truncate block">
                    {previewStudent.promotionStatus || 'Standard Promotion'}
                  </span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded border border-slate-200">
                  <span className="block text-[9px] uppercase font-bold text-slate-400">Attendance</span>
                  <span className="text-xs font-bold text-slate-700">{previewStudent.attendance || '85 of 85 days'}</span>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="space-y-1.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 font-heading">
                  Subject Performance Breakdown ({previewStudent.subjectScores?.length || 0} Courses)
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden shadow-2xs">
                  <table className="w-full text-left border-collapse text-[11px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold uppercase text-[9.5px] border-b border-slate-200">
                        <th className="py-2 px-3">Subject</th>
                        <th className="py-2 px-2 text-center">CA1 (20)</th>
                        <th className="py-2 px-2 text-center">CA2 (20)</th>
                        <th className="py-2 px-2 text-center">Exam (60)</th>
                        <th className="py-2 px-2 text-center">Total (100)</th>
                        <th className="py-2 px-2 text-center">Grade</th>
                        <th className="py-2 px-3">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {previewStudent.subjectScores?.map((sub, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80">
                          <td className="py-2 px-3 font-semibold text-slate-800 uppercase">{sub.subject}</td>
                          <td className="py-2 px-2 text-center font-mono text-slate-600">{sub.ca1Score ?? '-'}</td>
                          <td className="py-2 px-2 text-center font-mono text-slate-600">{sub.ca2Score ?? '-'}</td>
                          <td className="py-2 px-2 text-center font-mono text-slate-600">{sub.examScore ?? '-'}</td>
                          <td className="py-2 px-2 text-center font-mono font-bold text-brand-oxblood">{sub.totalScore}</td>
                          <td className="py-2 px-2 text-center">
                            <span className={`px-1.5 py-0.5 rounded font-bold font-mono text-[10px] ${
                              sub.grade === 'A' ? 'bg-emerald-100 text-emerald-800' :
                              sub.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                              sub.grade === 'C' ? 'bg-amber-100 text-amber-800' :
                              'bg-rose-100 text-rose-800'
                            }`}>
                              {sub.grade}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600 italic text-[10px]">{sub.remarks || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks */}
              {(previewStudent.teacherRemarks || previewStudent.principalRemarks) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {previewStudent.teacherRemarks && (
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <span className="block text-[9px] font-bold text-slate-400 uppercase">Class Teacher's Remark</span>
                      <p className="text-[11px] text-slate-700 italic mt-0.5">"{previewStudent.teacherRemarks}"</p>
                    </div>
                  )}
                  {previewStudent.principalRemarks && (
                    <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                      <span className="block text-[9px] font-bold text-brand-green uppercase">Principal's Formal Endorsement</span>
                      <p className="text-[11px] text-slate-700 italic mt-0.5">"{previewStudent.principalRemarks}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPreviewStudent(null)}
                className="px-3 py-1.5 bg-white hover:bg-slate-200 text-slate-700 rounded text-xs font-bold uppercase transition cursor-pointer border border-slate-300"
              >
                Close Preview
              </button>

              {isAdminLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    const st = previewStudent;
                    setPreviewStudent(null);
                    handleOpenStudentInAdmin(st);
                  }}
                  className="px-4 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-brand-yellow" />
                  <span>Open in Grade Book & Edit</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewStudent(null);
                    onClose();
                    onNavigatePublicPage?.('results');
                  }}
                  className="px-4 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  View in Official Results Desk
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
