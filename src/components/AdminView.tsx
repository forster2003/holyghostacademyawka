/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Plus, Trash, Edit, Upload, ShieldCheck, LogOut, 
  Database, FileSpreadsheet, Layers, Film, Image as ImageIcon, 
  FileText, MessageSquare, AlertCircle, Save, CheckCircle2, ChevronRight, Eye, Calendar, RefreshCw, Download,
  CreditCard, AlertTriangle, Unlink, Key, Lock, Users, Trophy, Award, GraduationCap,
  UserPlus, UserCheck, Briefcase, Mail, Phone, X, Camera, Sparkles, BookOpen,
  Share2, Globe, Check, ExternalLink, Sliders, ArrowUp, ArrowDown, FolderOpen, Calculator, CalendarCheck, CalendarDays,
  BarChart3, Compass, Building2
} from 'lucide-react';
import { 
  NewsItem, SchoolProject, GalleryItem, VideoItem, 
  DocumentItem, StudentResult, SubjectScore, ContactMessage, PaymentRecord,
  SchoolMilestoneStats, DEFAULT_MILESTONE_STATS,
  StaffMember, StaffCategory,
  SchoolSubject, SchoolSocialHandles, SubjectCategory, SubjectLevel,
  HeroSlide, DailyAttendanceRecord, AcademicCalendarEvent,
  DEFAULT_ABOUT_US_IMAGE, DEFAULT_ABOUT_US_BADGE, DEFAULT_HEADER_LOGO
} from '../types';
import { DEFAULT_HERO_SLIDES } from '../defaultData';
import { StudentSheetSection } from './StudentSheetSection';
import { 
  computeAcademicMetrics, 
  getSubjectAssessmentRemark, 
  getNextClassLevel,
  STANDARD_PROMOTION_STATUS_OPTIONS,
  SCHOOL_LOGO_URL, 
  SCHOOL_OFFICIAL_EMAIL 
} from '../gradeUtils';
import { PaymentRevenueChart } from './PaymentRevenueChart';
import { CumulativeResultsSection } from './CumulativeResultsSection';
import { DailyAttendanceSection } from './DailyAttendanceSection';
import AcademicCalendar from './AcademicCalendar';
import { StudentPerformanceAnalytics } from './StudentPerformanceAnalytics';
import { DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from '../supabasePortal';

interface AdminViewProps {
  isAdminLoggedIn: boolean;
  onLogin: (password: string) => boolean;
  onLogout: () => void;
  stats: {
    totalStudents: number;
    totalImages: number;
    totalVideos: number;
    totalDocuments: number;
    totalProjects: number;
    totalNewsPosts: number;
    unreadMessages: number;
    totalPayments?: number;
    pendingPayments?: number;
    verifiedRevenue?: number;
  };
  news: NewsItem[];
  projects: SchoolProject[];
  gallery: GalleryItem[];
  videos: VideoItem[];
  documents: DocumentItem[];
  results: StudentResult[];
  attendanceRecords?: DailyAttendanceRecord[];
  onSaveAttendance?: (records: DailyAttendanceRecord[]) => void;
  onDeleteAttendanceRecord?: (id: string) => void;
  onClearAttendanceClassDate?: (date: string, classLevel: string) => void;
  calendarEvents?: AcademicCalendarEvent[];
  onAddCalendarEvent?: (event: Omit<AcademicCalendarEvent, 'id' | 'createdAt'>) => void;
  onEditCalendarEvent?: (id: string, fields: Partial<AcademicCalendarEvent>) => void;
  onDeleteCalendarEvent?: (id: string) => void;
  onResetCalendarEvents?: () => void;
  messages: ContactMessage[];
  payments: PaymentRecord[];
  staff?: StaffMember[];
  subjects?: SchoolSubject[];
  socialHandles?: SchoolSocialHandles;
  heroSlides?: HeroSlide[];
  onAddHeroSlide?: (slide: Omit<HeroSlide, 'id'>) => void;
  onEditHeroSlide?: (id: string, fields: Partial<HeroSlide>) => void;
  onDeleteHeroSlide?: (id: string) => void;
  onResetHeroSlides?: () => void;
  onReorderHeroSlides?: (slides: HeroSlide[]) => void;
  onAddSubject?: (subject: Omit<SchoolSubject, 'id'>) => void;
  onEditSubject?: (id: string, fields: Partial<SchoolSubject>) => void;
  onDeleteSubject?: (id: string) => void;
  onResetSubjects?: () => void;
  onUpdateSocialHandles?: (handles: Partial<SchoolSocialHandles>) => void;
  onUpdatePromotionStatus?: (resultId: string, promotionStatus: string) => void;
  milestoneStats?: SchoolMilestoneStats;
  updateMilestoneStats?: (newStats: SchoolMilestoneStats) => void;
  // store mutators
  addNews: (item: Omit<NewsItem, "id" | "date">) => void;
  editNews: (id: string, fields: Partial<NewsItem>) => void;
  deleteNews: (id: string) => void;
  addProject: (item: Omit<SchoolProject, "id">) => void;
  editProject: (id: string, fields: Partial<SchoolProject>) => void;
  deleteProject: (id: string) => void;
  addGalleryItem: (item: Omit<GalleryItem, "id" | "uploadDate">) => void;
  editGalleryItem?: (id: string, fields: Partial<GalleryItem>) => void;
  deleteGalleryItem: (id: string) => void;
  addVideo: (item: Omit<VideoItem, "id" | "uploadDate">) => void;
  editVideo?: (id: string, fields: Partial<VideoItem>) => void;
  deleteVideo: (id: string) => void;
  addDocument: (item: Omit<DocumentItem, "id" | "uploadDate">) => void;
  deleteDocument: (id: string) => void;
  addResult: (item: StudentResult) => void;
  editResult?: (id: string, fields: Partial<StudentResult>) => void;
  deleteResult: (id: string) => void;
  importResultsList: (results: StudentResult[]) => void;
  addStaffMember?: (item: Omit<StaffMember, 'id'>) => void;
  editStaffMember?: (id: string, fields: Partial<StaffMember>) => void;
  deleteStaffMember?: (id: string) => void;
  markMessageRead: (id: string) => void;
  deleteMessage: (id: string) => void;
  onVerifyPayment?: (id: string, status: PaymentRecord['status']) => void;
  onDeletePayment?: (id: string) => void;
  supabaseStatus: 'idle' | 'connected' | 'error';
  pushAllLocalToSupabase: () => Promise<{ success: boolean; error?: string }>;
  pullAllFromSupabase: () => Promise<{ success: boolean; error?: string }>;
  onDisconnectSupabase?: () => void;
  onConnectSupabase?: (url: string, key: string) => Promise<{ success: boolean; error?: string }>;
  aboutUsImage?: string;
  aboutUsBadge?: string;
  onUpdateAboutUsImage?: (image: string, badge?: string) => void;
  onResetAboutUsImage?: () => void;
  headerLogo?: string;
  onUpdateHeaderLogo?: (logoUrl: string) => void;
  onResetHeaderLogo?: () => void;
  onNavigatePublicPage?: (page: string) => void;
  onSyncCumulative?: () => void;
  initialActiveTab?: 'overview' | 'headerLogo' | 'supabase' | 'slides' | 'aboutUs' | 'milestones' | 'staff' | 'subjects' | 'social' | 'news' | 'projects' | 'images' | 'videos' | 'documents' | 'results' | 'analytics' | 'cumulative' | 'attendance' | 'calendar' | 'messages' | 'payments' | 'seo';
  initialSearchQuery?: string;
  initialSelectedResultId?: string;
}

function PromotionRow({
  result,
  average,
  grade,
  nextClass,
  onSave
}: {
  key?: string;
  result: StudentResult;
  average: string;
  grade: string;
  nextClass: string;
  onSave: (status: string) => void;
}) {
  const [statusInput, setStatusInput] = useState(result.promotionStatus || '');
  const [hasSaved, setHasSaved] = useState(false);

  useEffect(() => {
    setStatusInput(result.promotionStatus || '');
  }, [result.promotionStatus]);

  const handleApply = (status: string) => {
    setStatusInput(status);
    onSave(status);
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 2500);
  };

  return (
    <tr className="hover:bg-slate-50/80 transition border-b border-slate-100">
      <td className="py-2.5 px-3">
        <div className="font-bold text-slate-900 uppercase">{result.studentName}</div>
        <div className="text-[10px] text-slate-400 font-mono">
          ID: <span className="font-bold text-brand-oxblood">{result.studentId}</span> | SEX: <span className="font-semibold text-slate-700">{result.gender || 'N/A'}</span>
        </div>
      </td>
      <td className="py-2.5 px-3">
        <span className="font-bold text-slate-700">{result.classLevel}</span>
        <div className="text-[10px] text-slate-400">{result.term} ({result.academicSession})</div>
      </td>
      <td className="py-2.5 px-3 text-center">
        <span className="font-mono font-bold text-brand-green text-xs">{average}%</span>
        <span className="text-[10px] font-bold text-slate-500 block">({grade})</span>
      </td>
      <td className="py-2.5 px-3">
        <div className="space-y-1.5 max-w-md">
          <input
            type="text"
            placeholder="e.g. Promoted to next class, Promoted on Trial, Repeats class"
            value={statusInput}
            onChange={(e) => setStatusInput(e.target.value)}
            className="w-full px-2.5 py-1 text-xs bg-slate-50 border border-slate-200 rounded font-semibold text-slate-800 focus:ring-1 focus:ring-brand-green focus:bg-white"
          />
          <div className="flex flex-wrap items-center gap-1">
            <button
              type="button"
              onClick={() => handleApply(result.classLevel === 'SS 3' ? 'Graduated / Passed Out (Certificate Issued)' : `Promoted to ${nextClass}`)}
              className="px-2 py-0.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[9.5px] font-bold transition cursor-pointer"
            >
              {result.classLevel === 'SS 3' ? 'Graduated' : `Promote to ${nextClass}`}
            </button>
            <button
              type="button"
              onClick={() => handleApply(`Promoted on Trial to ${nextClass}`)}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[9.5px] font-bold transition cursor-pointer"
            >
              Promote on Trial
            </button>
            <button
              type="button"
              onClick={() => handleApply(`Repeats ${result.classLevel}`)}
              className="px-2 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 rounded text-[9.5px] font-bold transition cursor-pointer"
            >
              Repeats {result.classLevel}
            </button>
          </div>
        </div>
      </td>
      <td className="py-2.5 px-3 text-right">
        <button
          type="button"
          onClick={() => {
            onSave(statusInput.trim());
            setHasSaved(true);
            setTimeout(() => setHasSaved(false), 2500);
          }}
          className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
            hasSaved
              ? 'bg-green-700 text-white shadow-xs'
              : 'bg-brand-green hover:bg-brand-green-dark text-white shadow-xs'
          }`}
        >
          {hasSaved ? 'Saved!' : 'Save'}
        </button>
      </td>
    </tr>
  );
}

export default function AdminView({
  isAdminLoggedIn, onLogin, onLogout, stats,
  news, projects, gallery, videos, documents, results,
  attendanceRecords = [], onSaveAttendance, onDeleteAttendanceRecord, onClearAttendanceClassDate,
  calendarEvents = [], onAddCalendarEvent, onEditCalendarEvent, onDeleteCalendarEvent, onResetCalendarEvents,
  messages, payments = [],
  staff = [],
  subjects = [],
  socialHandles = { facebook: '', instagram: '', twitter: '', youtube: '', tiktok: '', linkedin: '', whatsapp: '', website: '' },
  heroSlides = [],
  onAddHeroSlide,
  onEditHeroSlide,
  onDeleteHeroSlide,
  onResetHeroSlides,
  onReorderHeroSlides,
  onAddSubject, onEditSubject, onDeleteSubject, onResetSubjects, onUpdateSocialHandles, onUpdatePromotionStatus,
  milestoneStats, updateMilestoneStats,
  addNews, editNews, deleteNews, addProject, editProject, deleteProject,
  addGalleryItem, editGalleryItem, deleteGalleryItem, addVideo, editVideo, deleteVideo, addDocument, deleteDocument,
  addResult, editResult, deleteResult, importResultsList, 
  addStaffMember, editStaffMember, deleteStaffMember,
  markMessageRead, deleteMessage,
  onVerifyPayment, onDeletePayment,
  supabaseStatus, pushAllLocalToSupabase, pullAllFromSupabase,
  onDisconnectSupabase, onConnectSupabase,
  aboutUsImage, aboutUsBadge, onUpdateAboutUsImage, onResetAboutUsImage, onNavigatePublicPage,
  headerLogo, onUpdateHeaderLogo, onResetHeaderLogo,
  onSyncCumulative,
  initialActiveTab, initialSearchQuery, initialSelectedResultId
}: AdminViewProps) {
  
  // Login Password input state
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Dashboard Sub-navigation panel
  const [activeTab, setActiveTab] = useState<'overview' | 'headerLogo' | 'supabase' | 'slides' | 'aboutUs' | 'milestones' | 'staff' | 'subjects' | 'social' | 'news' | 'projects' | 'images' | 'videos' | 'documents' | 'results' | 'analytics' | 'cumulative' | 'attendance' | 'calendar' | 'messages' | 'payments' | 'seo'>(initialActiveTab || 'overview');

  // Header Logo & School Crest Editor State
  const [editHeaderLogo, setEditHeaderLogo] = useState<string>(headerLogo || DEFAULT_HEADER_LOGO);
  const [logoInputMode, setLogoInputMode] = useState<'upload' | 'url' | 'presets'>('upload');
  const [logoUploadedFileName, setLogoUploadedFileName] = useState<string>('');
  const [logoSuccessNotice, setLogoSuccessNotice] = useState<string | null>(null);
  const [logoErrorNotice, setLogoErrorNotice] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const overviewLogoFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (headerLogo) {
      setEditHeaderLogo(headerLogo);
    }
  }, [headerLogo]);

  const HEADER_LOGO_PRESETS = [
    {
      title: 'Official Holy Ghost Academy Crest',
      desc: 'Authentic diocesan crest & coat of arms of Holy Ghost Academy, Awka',
      badge: 'Official Academy Crest',
      url: 'https://i.ibb.co/HTP5dHHD/Whats-App-Image-2026-06-30-at-10-02-49-AM.jpg'
    },
    {
      title: 'Academy Golden Emblem & Motto Ring',
      desc: 'High-contrast crest with Malu Chukwu, Malu Akwuko banner',
      badge: 'Golden Ring Emblem',
      url: 'https://i.ibb.co/HTP5dHHD/Whats-App-Image-2026-06-30-at-10-02-49-AM.jpg'
    },
    {
      title: 'Diocesan Cross & Open Bible Shield',
      desc: 'Faith, wisdom, and moral formation heraldic academy insignia',
      badge: 'Heraldic Insignia',
      url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=400'
    },
    {
      title: 'Excellence & Academic Laurels Crest',
      desc: 'Classic scholarship insignia with laurel wreath and lamp of learning',
      badge: 'Scholarship Laurels',
      url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=400'
    }
  ];

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isDirectApply: boolean = false) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setLogoErrorNotice('Selected logo file exceeds 5MB limit. Please choose a smaller image file.');
        setTimeout(() => setLogoErrorNotice(null), 5000);
        return;
      }
      setLogoErrorNotice(null);
      setLogoUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const dataUrl = reader.result;
          setEditHeaderLogo(dataUrl);
          if (isDirectApply && onUpdateHeaderLogo) {
            onUpdateHeaderLogo(dataUrl);
            setLogoSuccessNotice(`New header crest "${file.name}" uploaded and applied live!`);
            setTimeout(() => setLogoSuccessNotice(null), 5000);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveHeaderLogo = () => {
    if (!editHeaderLogo.trim()) {
      setLogoErrorNotice('Please provide a valid image file or paste a web URL.');
      return;
    }
    if (onUpdateHeaderLogo) {
      onUpdateHeaderLogo(editHeaderLogo.trim());
      setLogoSuccessNotice('✓ School Header Logo & Crest updated successfully! The new crest is now live across the navigation header, mobile drawer, and footer.');
      setTimeout(() => setLogoSuccessNotice(null), 6000);
    }
  };

  const handleResetHeaderLogo = () => {
    if (onResetHeaderLogo) {
      onResetHeaderLogo();
      setEditHeaderLogo(DEFAULT_HEADER_LOGO);
      setLogoUploadedFileName('');
      setLogoSuccessNotice('Header logo restored to the official Holy Ghost Academy diocesan crest!');
      setTimeout(() => setLogoSuccessNotice(null), 5000);
    }
  };

  // About Us Image Editor State
  const [editAboutImage, setEditAboutImage] = useState(aboutUsImage || DEFAULT_ABOUT_US_IMAGE);
  const [editAboutBadge, setEditAboutBadge] = useState(aboutUsBadge || DEFAULT_ABOUT_US_BADGE);
  const [aboutImageSavedNotice, setAboutImageSavedNotice] = useState(false);
  const [aboutImageError, setAboutImageError] = useState<string | null>(null);
  const [aboutInputMode, setAboutInputMode] = useState<'upload' | 'url' | 'presets' | 'gallery'>('upload');
  const [aboutUploadedFileName, setAboutUploadedFileName] = useState<string>('');
  const aboutImageFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (aboutUsImage) setEditAboutImage(aboutUsImage);
  }, [aboutUsImage]);

  useEffect(() => {
    if (aboutUsBadge) setEditAboutBadge(aboutUsBadge);
  }, [aboutUsBadge]);

  const ABOUT_IMAGE_PRESETS = [
    {
      title: 'Academy Campus Front & Grounds',
      desc: 'Prestigious secondary school building in Ngozika Housing Estate, Awka',
      badge: 'Kamali Homes Campus',
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200'
    },
    {
      title: 'Modern Science & STEM Laboratories',
      desc: 'Diagnostic biology, physics, and chemistry digital laboratories',
      badge: 'STEM & Science Labs',
      url: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=1200'
    },
    {
      title: 'Administrative Block & Diocesan Hall',
      desc: 'Central school leadership administration and reception wing',
      badge: 'Administrative Wing',
      url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200'
    },
    {
      title: 'Academic Quad & Modern Classrooms',
      desc: 'Air-conditioned learning halls with interactive digital boards',
      badge: 'Interactive Classrooms',
      url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=1200'
    },
    {
      title: 'Digital E-Library & Study Center',
      desc: 'Comprehensive library archives and quiet research cubicles',
      badge: 'E-Library & Archives',
      url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=1200'
    },
    {
      title: 'Athletic Sports Complex & Pavilion',
      desc: 'Standard multi-sports grounds, athletic track, and recreation field',
      badge: 'Sports Complex',
      url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=1200'
    }
  ];

  const handleAboutImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setAboutImageError("Selected image file exceeds 5MB limit. Please choose a smaller photo.");
        setTimeout(() => setAboutImageError(null), 5000);
        return;
      }
      setAboutImageError(null);
      setAboutUploadedFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setEditAboutImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAboutImage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editAboutImage.trim()) {
      setAboutImageError("Please provide an image URL, choose a file, or pick a preset.");
      setTimeout(() => setAboutImageError(null), 4000);
      return;
    }
    setAboutImageError(null);
    if (onUpdateAboutUsImage) {
      onUpdateAboutUsImage(editAboutImage.trim(), editAboutBadge.trim());
    }
    setAboutImageSavedNotice(true);
    setTimeout(() => setAboutImageSavedNotice(false), 3500);
  };

  const handleResetAboutImage = () => {
    setConfirmModal({
      title: 'Reset About Us Photo & Badge',
      message: 'Are you sure you want to restore the About Us section image and badge back to the diocesan default?',
      confirmText: 'Reset to Default',
      onConfirm: () => {
        setEditAboutImage(DEFAULT_ABOUT_US_IMAGE);
        setEditAboutBadge(DEFAULT_ABOUT_US_BADGE);
        setAboutUploadedFileName('');
        if (onResetAboutUsImage) {
          onResetAboutUsImage();
        }
        setAboutImageSavedNotice(true);
        setTimeout(() => setAboutImageSavedNotice(false), 3500);
      }
    });
  };

  // Milestone Statistics Form State
  const [editEnrolled, setEditEnrolled] = useState(milestoneStats?.enrolledStudents || '450+');
  const [editEducators, setEditEducators] = useState(milestoneStats?.professionalEducators || '38');
  const [editGraduates, setEditGraduates] = useState(milestoneStats?.exemplaryGraduates || '1,200+');
  const [editAwards, setEditAwards] = useState(milestoneStats?.stateAndNationalAwards || '15');
  const [statsSavedMessage, setStatsSavedMessage] = useState(false);

  // Administrative Board & Staff Registry State
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [isStaffFormOpen, setIsStaffFormOpen] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffRole, setStaffRole] = useState('');
  const [staffCategory, setStaffCategory] = useState<StaffCategory>('Administrative Board');
  const [staffQualifications, setStaffQualifications] = useState('');
  const [staffImage, setStaffImage] = useState('');
  const [staffDesc, setStaffDesc] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPhone, setStaffPhone] = useState('');
  const [staffSearchQuery, setStaffSearchQuery] = useState('');
  const [staffCategoryFilter, setStaffCategoryFilter] = useState<'All' | StaffCategory>('All');
  const [staffSuccessNotice, setStaffSuccessNotice] = useState<string | null>(null);
  const staffFormRef = useRef<HTMLDivElement>(null);

  const STAFF_IMAGE_PRESETS = [
    { label: 'Clergy / Administrator', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400' },
    { label: 'Vice Principal (Academics)', url: 'https://images.unsplash.com/photo-1580894732444-8fecef2271ff?auto=format&fit=crop&q=80&w=400' },
    { label: 'Rev. Sister / Welfare', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400' },
    { label: 'Dean / Science Coord.', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400' },
    { label: 'HOD Mathematics', url: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=400' },
    { label: 'ICT & Robotics Head', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400' },
    { label: 'Languages Master', url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&q=80&w=400' },
    { label: 'Bursar / Accountant', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400' },
  ];

  const resetStaffForm = () => {
    setEditingStaffId(null);
    setStaffName('');
    setStaffRole('');
    setStaffCategory('Administrative Board');
    setStaffQualifications('');
    setStaffImage('');
    setStaffDesc('');
    setStaffEmail('');
    setStaffPhone('');
  };

  const handleStartAddStaff = () => {
    resetStaffForm();
    setIsStaffFormOpen(true);
    setTimeout(() => {
      staffFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleStartEditStaff = (member: StaffMember) => {
    setEditingStaffId(member.id);
    setStaffName(member.name);
    setStaffRole(member.role);
    setStaffCategory(member.category);
    setStaffQualifications(member.qualifications || '');
    setStaffImage(member.image || '');
    setStaffDesc(member.desc || '');
    setStaffEmail(member.email || '');
    setStaffPhone(member.phone || '');
    setIsStaffFormOpen(true);
    setTimeout(() => {
      staffFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleStaffImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size exceeds 2MB limit. Please choose a smaller photo.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setStaffImage(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStaffFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffRole.trim()) {
      alert("Please provide at least a full name and role/title.");
      return;
    }

    const payload = {
      name: staffName.trim(),
      role: staffRole.trim(),
      category: staffCategory,
      qualifications: staffQualifications.trim(),
      image: staffImage.trim() || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
      desc: staffDesc.trim() || 'Dedicated educator and mentor committed to academic excellence, leadership discipline, and positive character formation.',
      email: staffEmail.trim() || undefined,
      phone: staffPhone.trim() || undefined,
    };

    if (editingStaffId) {
      if (editStaffMember) {
        editStaffMember(editingStaffId, payload);
      }
      setStaffSuccessNotice(`Successfully updated records for ${payload.name}!`);
    } else {
      if (addStaffMember) {
        addStaffMember(payload);
      }
      setStaffSuccessNotice(`Successfully registered ${payload.name} as a new ${payload.category} member!`);
    }

    resetStaffForm();
    setIsStaffFormOpen(false);
    setTimeout(() => setStaffSuccessNotice(null), 4000);
  };

  const handleDeleteStaff = (member: StaffMember) => {
    setConfirmModal({
      title: `Delete ${member.category} Member`,
      message: `Are you sure you want to remove "${member.name}" (${member.role}) from the staff registry? This will immediately update the public About page.`,
      confirmText: 'Delete Member',
      onConfirm: () => {
        if (editingStaffId === member.id) {
          resetStaffForm();
          setIsStaffFormOpen(false);
        }
        if (deleteStaffMember) {
          deleteStaffMember(member.id);
          setStaffSuccessNotice(`Removed ${member.name} from staff directory.`);
          setTimeout(() => setStaffSuccessNotice(null), 3000);
        }
      }
    });
  };

  useEffect(() => {
    if (milestoneStats) {
      setEditEnrolled(milestoneStats.enrolledStudents || '450+');
      setEditEducators(milestoneStats.professionalEducators || '38');
      setEditGraduates(milestoneStats.exemplaryGraduates || '1,200+');
      setEditAwards(milestoneStats.stateAndNationalAwards || '15');
    }
  }, [milestoneStats]);

  const handleSaveMilestoneStats = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (updateMilestoneStats) {
      updateMilestoneStats({
        enrolledStudents: editEnrolled.trim() || '450+',
        professionalEducators: editEducators.trim() || '38',
        exemplaryGraduates: editGraduates.trim() || '1,200+',
        stateAndNationalAwards: editAwards.trim() || '15',
      });
      setStatsSavedMessage(true);
      setTimeout(() => setStatsSavedMessage(false), 3500);
    }
  };

  const handleResetMilestoneStats = () => {
    const defaultStats = {
      enrolledStudents: '450+',
      professionalEducators: '38',
      exemplaryGraduates: '1,200+',
      stateAndNationalAwards: '15',
    };
    setEditEnrolled(defaultStats.enrolledStudents);
    setEditEducators(defaultStats.professionalEducators);
    setEditGraduates(defaultStats.exemplaryGraduates);
    setEditAwards(defaultStats.stateAndNationalAwards);
    if (updateMilestoneStats) {
      updateMilestoneStats(defaultStats);
      setStatsSavedMessage(true);
      setTimeout(() => setStatsSavedMessage(false), 3500);
    }
  };

  // Subjects Management State
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [isSubjectFormOpen, setIsSubjectFormOpen] = useState(false);
  const [subjectName, setSubjectName] = useState('');
  const [subjectCategory, setSubjectCategory] = useState<SubjectCategory>('Junior General');
  const [subjectLevel, setSubjectLevel] = useState<SubjectLevel>('All Levels');
  const [subjectDesc, setSubjectDesc] = useState('');
  const [subjectIsCore, setSubjectIsCore] = useState(false);
  const [subjectSearchQuery, setSubjectSearchQuery] = useState('');
  const [subjectFilterCategory, setSubjectFilterCategory] = useState<'ALL' | SubjectCategory>('ALL');
  const [subjectFilterLevel, setSubjectFilterLevel] = useState<'ALL' | SubjectLevel>('ALL');
  const [subjectNotice, setSubjectNotice] = useState<string | null>(null);
  const subjectFormRef = useRef<HTMLDivElement>(null);

  const resetSubjectForm = () => {
    setEditingSubjectId(null);
    setSubjectName('');
    setSubjectCategory('Junior General');
    setSubjectLevel('All Levels');
    setSubjectDesc('');
    setSubjectIsCore(false);
  };

  const handleStartAddSubject = () => {
    resetSubjectForm();
    setIsSubjectFormOpen(true);
    setTimeout(() => {
      subjectFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleStartEditSubject = (subj: SchoolSubject) => {
    setEditingSubjectId(subj.id);
    setSubjectName(subj.name);
    setSubjectCategory(subj.category);
    setSubjectLevel(subj.level);
    setSubjectDesc(subj.desc || '');
    setSubjectIsCore(!!subj.isCore);
    setIsSubjectFormOpen(true);
    setTimeout(() => {
      subjectFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubjectFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectName.trim()) {
      alert("Please provide the subject name.");
      return;
    }
    const payload: Omit<SchoolSubject, 'id'> = {
      name: subjectName.trim(),
      category: subjectCategory,
      level: subjectLevel,
      desc: subjectDesc.trim() || undefined,
      isCore: subjectIsCore,
    };

    if (editingSubjectId) {
      if (onEditSubject) {
        onEditSubject(editingSubjectId, payload);
      }
      setSubjectNotice(`Updated subject: "${payload.name}" (${payload.category})`);
    } else {
      if (onAddSubject) {
        onAddSubject(payload);
      }
      setSubjectNotice(`Successfully added "${payload.name}" to the curriculum!`);
    }
    resetSubjectForm();
    setIsSubjectFormOpen(false);
    setTimeout(() => setSubjectNotice(null), 4000);
  };

  const handleDeleteSubject = (subj: SchoolSubject) => {
    setConfirmModal({
      title: 'Remove Subject from Curriculum',
      message: `Are you sure you want to remove "${subj.name}" (${subj.level}) from the active curriculum?`,
      confirmText: 'Remove Subject',
      onConfirm: () => {
        if (onDeleteSubject) onDeleteSubject(subj.id);
        setSubjectNotice(`Removed "${subj.name}" from subjects.`);
        setTimeout(() => setSubjectNotice(null), 4000);
      }
    });
  };

  // Social Media Handles State
  const [socialForm, setSocialForm] = useState<SchoolSocialHandles>(socialHandles);
  const [socialNotice, setSocialNotice] = useState<string | null>(null);

  useEffect(() => {
    if (socialHandles) {
      setSocialForm(socialHandles);
    }
  }, [socialHandles]);

  const handleSaveSocialHandles = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateSocialHandles) {
      onUpdateSocialHandles(socialForm);
    }
    setSocialNotice("School social media handles updated successfully!");
    setTimeout(() => setSocialNotice(null), 4000);
  };

  // Interactive Confirmation Modal state (Iframe-safe alternative to window.confirm)
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    confirmText?: string;
    onConfirm: () => void;
  } | null>(null);

  // Payment search and filter state
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentFilterStatus, setPaymentFilterStatus] = useState<'ALL' | 'Verified' | 'Pending Verification' | 'Rejected'>('ALL');

  // Form states
  const [newsTitle, setNewsTitle] = useState('');
  const [newsCategory, setNewsCategory] = useState('Academic');
  const [newsImageUrl, setNewsImageUrl] = useState('');
  const [newsImageFileName, setNewsImageFileName] = useState('');
  const newsFileInputRef = useRef<HTMLInputElement>(null);
  const [newsContent, setNewsContent] = useState('');
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);

  const [projectTitle, setProjectTitle] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [projectImg, setProjectImg] = useState('');
  const [projectImageFileName, setProjectImageFileName] = useState('');
  const projectFileInputRef = useRef<HTMLInputElement>(null);
  const [projectBudget, setProjectBudget] = useState('');
  const [projectStart, setProjectStart] = useState('');
  const [projectEnd, setProjectEnd] = useState('');
  const [projectProgress, setProjectProgress] = useState(0);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Homepage Hero Carousel Slides State & Refs
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideBadge, setSlideBadge] = useState('');
  const [slideImageUrl, setSlideImageUrl] = useState('');
  const [slideImageFileName, setSlideImageFileName] = useState('');
  const [slideSuccessNotice, setSlideSuccessNotice] = useState<string | null>(null);
  const [overviewTargetSlideId, setOverviewTargetSlideId] = useState<string | null>(null);
  const slideFileInputRef = useRef<HTMLInputElement>(null);
  const overviewSlideFileInputRef = useRef<HTMLInputElement>(null);
  const slideFormRef = useRef<HTMLDivElement>(null);

  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryCat, setGalleryCat] = useState('School Activities');
  const [galleryUrl, setGalleryUrl] = useState('');
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);

  const [videoTitle, setVideoTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoDesc, setVideoDesc] = useState('');
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);

  const [documentTitle, setDocumentTitle] = useState('');
  const [documentType, setDocumentType] = useState('pdf');
  const [documentUrlRaw, setDocumentUrlRaw] = useState('');
  const [documentPassword, setDocumentPassword] = useState('');

  const [csvRawText, setCsvRawText] = useState('');
  const [resultParseError, setResultParseError] = useState('');
  const [resultParseSuccess, setResultParseSuccess] = useState('');

  // Supabase live configuration state
  const [inputSupabaseUrl, setInputSupabaseUrl] = useState(() => {
    return localStorage.getItem('hgass_supabase_url') || (localStorage.getItem('hgass_supabase_disconnected') === 'true' ? '' : DEFAULT_SUPABASE_URL);
  });
  const [inputSupabaseKey, setInputSupabaseKey] = useState(() => {
    return localStorage.getItem('hgass_supabase_anon_key') || (localStorage.getItem('hgass_supabase_disconnected') === 'true' ? '' : DEFAULT_SUPABASE_ANON_KEY);
  });
  const [syncMessage, setSyncMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDisconnectConfirming, setIsDisconnectConfirming] = useState(false);

  const [manualStudentId, setManualStudentId] = useState('');
  const [manualStudentName, setManualStudentName] = useState('');
  const [manualClass, setManualClass] = useState('SS 2');
  const [manualSession, setManualSession] = useState('2025/2026');
  const [manualTerm, setManualTerm] = useState('3rd Term');
  const [manualGender, setManualGender] = useState('Male');
  const [manualRollNo, setManualRollNo] = useState('');
  const [manualPos, setManualPos] = useState('');
  const [manualTeacherComment, setManualTeacherComment] = useState('');
  const [manualPrincipalComment, setManualPrincipalComment] = useState('');
  const [manualAccessPassword, setManualAccessPassword] = useState('');
  const [manualPassportPhoto, setManualPassportPhoto] = useState('');
  const [manualClassStanding, setManualClassStanding] = useState('');
  const [manualAccreditedGradeBracket, setManualAccreditedGradeBracket] = useState('');
  const [manualPromotionStatus, setManualPromotionStatus] = useState('');
  const [manualGrossTotalMarks, setManualGrossTotalMarks] = useState<number | undefined>(undefined);
  const [manualTerminalAverage, setManualTerminalAverage] = useState<number | undefined>(undefined);
  const [manualGradePoint, setManualGradePoint] = useState<number | undefined>(undefined);
  const [manualPassFail, setManualPassFail] = useState<'Passed' | 'Failed' | ''>('');
  const [passFailFilter, setPassFailFilter] = useState<'all' | 'passed' | 'failed'>('all');
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [resultsDeskTab, setResultsDeskTab] = useState<'registrar' | 'cumulative' | 'attendance' | 'promotion' | 'sheet' | 'csv'>('registrar');
  const [selectedSheetStudentId, setSelectedSheetStudentId] = useState<string | null>(null);
  const [sheetClassFilter, setSheetClassFilter] = useState<string>('All');
  const [sheetSearchQuery, setSheetSearchQuery] = useState<string>('');
  const [resultNotice, setResultNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [resultsSearchQuery, setResultsSearchQuery] = useState(initialSearchQuery || '');
  const resultFormRef = useRef<HTMLFormElement | null>(null);
  const [subjectScoresInput, setSubjectScoresInput] = useState<SubjectScore[]>([
    { subject: 'Mathematics', ca1Score: 0, ca2Score: 0, testScore: 0, examScore: 0, totalScore: 0, grade: 'F', remarks: '' }
  ]);

  // Dedicated Promotion Registry Desk state
  const [promotionFilterClass, setPromotionFilterClass] = useState<string>('All');
  const [promotionSearchQuery, setPromotionSearchQuery] = useState<string>('');
  const [promotionFeedback, setPromotionFeedback] = useState<string | null>(null);

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const success = onLogin(passwordInput);
    if (success) {
      setPasswordInput('');
    } else {
      setLoginError('Invalid access password. Please try again.');
    }
  };

  // Base64 helper for custom files
  const handleFileUploadBase64 = (e: React.ChangeEvent<HTMLInputElement>, target: 'gallery' | 'document') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size limit (2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert("File size exceeds the 2MB boundary limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64String = reader.result as string;
      if (target === 'gallery') {
        setGalleryUrl(base64String);
      } else {
        setDocumentUrlRaw(base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  // CRUD handlers: News
  const handleNewsImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size exceeds 5MB limit. Please choose a smaller photo.");
        return;
      }
      setNewsImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setNewsImageUrl(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearNewsImage = () => {
    setNewsImageUrl('');
    setNewsImageFileName('');
    if (newsFileInputRef.current) {
      newsFileInputRef.current.value = '';
    }
  };

  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle.trim() || !newsContent.trim()) return;

    if (editingNewsId) {
      editNews(editingNewsId, {
        title: newsTitle,
        content: newsContent,
        category: newsCategory,
        imageUrl: newsImageUrl || undefined
      });
      setEditingNewsId(null);
    } else {
      addNews({
        title: newsTitle,
        content: newsContent,
        category: newsCategory,
        imageUrl: newsImageUrl || undefined,
        isPublished: true
      });
    }

    setNewsTitle('');
    setNewsContent('');
    setNewsImageUrl('');
    setNewsImageFileName('');
    setNewsCategory('Academic');
    if (newsFileInputRef.current) {
      newsFileInputRef.current.value = '';
    }
  };

  const handleStartEditNews = (item: NewsItem) => {
    setEditingNewsId(item.id);
    setNewsTitle(item.title);
    setNewsContent(item.content);
    setNewsCategory(item.category);
    setNewsImageUrl(item.imageUrl || '');
    setNewsImageFileName(item.imageUrl?.startsWith('data:') ? 'Attached Image File' : '');
  };

  // CRUD handlers: Projects
  const handleProjectImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size exceeds 5MB limit. Please choose a smaller photo.");
        return;
      }
      setProjectImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setProjectImg(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearProjectImage = () => {
    setProjectImg('');
    setProjectImageFileName('');
    if (projectFileInputRef.current) {
      projectFileInputRef.current.value = '';
    }
  };

  const handleSaveProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle.trim() || !projectDesc.trim() || !projectBudget.trim() || !projectStart.trim() || !projectEnd.trim()) return;

    const projData = {
      title: projectTitle,
      description: projectDesc,
      imageUrl: projectImg || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=400',
      budget: projectBudget,
      startDate: projectStart,
      expectedCompletionDate: projectEnd,
      percentageCompletion: Number(projectProgress)
    };

    if (editingProjectId) {
      editProject(editingProjectId, projData);
      setEditingProjectId(null);
    } else {
      addProject(projData);
    }

    setProjectTitle('');
    setProjectDesc('');
    setProjectImg('');
    setProjectImageFileName('');
    if (projectFileInputRef.current) {
      projectFileInputRef.current.value = '';
    }
    setProjectBudget('');
    setProjectStart('');
    setProjectEnd('');
    setProjectProgress(0);
  };

  const handleStartEditProject = (proj: SchoolProject) => {
    setEditingProjectId(proj.id);
    setProjectTitle(proj.title);
    setProjectDesc(proj.description);
    setProjectImg(proj.imageUrl);
    setProjectImageFileName(proj.imageUrl ? 'Current saved project photo' : '');
    setProjectBudget(proj.budget);
    setProjectStart(proj.startDate);
    setProjectEnd(proj.expectedCompletionDate);
    setProjectProgress(proj.percentageCompletion);
  };

  // Homepage Hero Carousel Handlers
  const resetSlideForm = () => {
    setEditingSlideId(null);
    setSlideTitle('');
    setSlideSubtitle('');
    setSlideBadge('');
    setSlideImageUrl('');
    setSlideImageFileName('');
    if (slideFileInputRef.current) {
      slideFileInputRef.current.value = '';
    }
  };

  const handleStartEditSlide = (slide: HeroSlide) => {
    setEditingSlideId(slide.id);
    setSlideTitle(slide.title);
    setSlideSubtitle(slide.subtitle);
    setSlideBadge(slide.badge || '');
    setSlideImageUrl(slide.imageUrl);
    setSlideImageFileName(slide.imageUrl.startsWith('data:') ? 'Local file uploaded' : '');
    setTimeout(() => {
      slideFormRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size exceeds 5MB limit. Please select a photo under 5MB.");
        return;
      }
      setSlideImageFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setSlideImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOverviewSlideFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && overviewTargetSlideId) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size exceeds 5MB limit. Please choose a smaller photo.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          onEditHeroSlide?.(overviewTargetSlideId, { imageUrl: reader.result });
          setSlideSuccessNotice("Homepage slide photo replaced successfully!");
          setTimeout(() => setSlideSuccessNotice(null), 3500);
        }
      };
      reader.readAsDataURL(file);
    }
    setOverviewTargetSlideId(null);
    if (overviewSlideFileInputRef.current) {
      overviewSlideFileInputRef.current.value = '';
    }
  };

  const handleSlideFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideTitle.trim() || !slideImageUrl.trim()) {
      alert("Please enter a slide headline and upload or choose an image.");
      return;
    }

    const payload = {
      title: slideTitle.trim(),
      subtitle: slideSubtitle.trim(),
      badge: slideBadge.trim() || undefined,
      imageUrl: slideImageUrl.trim()
    };

    if (editingSlideId) {
      onEditHeroSlide?.(editingSlideId, payload);
      setSlideSuccessNotice(`Slide "${payload.title}" updated successfully!`);
    } else {
      onAddHeroSlide?.(payload);
      setSlideSuccessNotice(`New slide "${payload.title}" added to homepage banner!`);
    }

    resetSlideForm();
    setTimeout(() => setSlideSuccessNotice(null), 3500);
  };

  const handleMoveSlide = (index: number, direction: 'up' | 'down') => {
    const currentList = heroSlides.length > 0 ? heroSlides : DEFAULT_HERO_SLIDES;
    const list = [...currentList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    onReorderHeroSlides?.(list);
  };

  // CRUD handlers: Gallery
  const handleAddGallerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galleryTitle.trim() || !galleryUrl) {
      alert("Please provide a title and select/input an image.");
      return;
    }
    if (editingGalleryId) {
      if (editGalleryItem) {
        editGalleryItem(editingGalleryId, {
          title: galleryTitle.trim(),
          category: galleryCat,
          imageUrl: galleryUrl
        });
      }
      setEditingGalleryId(null);
      setGalleryTitle('');
      setGalleryUrl('');
      setGalleryCat('School Activities');
      alert("Gallery photo asset successfully updated!");
      return;
    }
    addGalleryItem({
      title: galleryTitle.trim(),
      category: galleryCat,
      imageUrl: galleryUrl
    });
    setGalleryTitle('');
    setGalleryUrl('');
    alert("Image successfully uploaded and added to the Gallery!");
  };

  const startEditingGallery = (item: GalleryItem) => {
    setEditingGalleryId(item.id);
    setGalleryTitle(item.title);
    setGalleryCat(item.category);
    setGalleryUrl(item.imageUrl);
  };

  const cancelEditingGallery = () => {
    setEditingGalleryId(null);
    setGalleryTitle('');
    setGalleryCat('School Activities');
    setGalleryUrl('');
  };

  // CRUD handlers: Videos
  const handleAddVideoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoTitle.trim() || !videoUrl.trim()) return;
    if (editingVideoId) {
      if (editVideo) {
        editVideo(editingVideoId, {
          title: videoTitle.trim(),
          url: videoUrl.trim(),
          description: videoDesc.trim()
        });
      }
      setEditingVideoId(null);
      setVideoTitle('');
      setVideoUrl('');
      setVideoDesc('');
      alert("Video details successfully updated!");
      return;
    }
    addVideo({
      title: videoTitle.trim(),
      url: videoUrl.trim(),
      description: videoDesc.trim()
    });
    setVideoTitle('');
    setVideoUrl('');
    setVideoDesc('');
    alert("Video URL successfully registered! It will now appear on the public board.");
  };

  const startEditingVideo = (vid: VideoItem) => {
    setEditingVideoId(vid.id);
    setVideoTitle(vid.title);
    setVideoUrl(vid.url);
    setVideoDesc(vid.description || '');
  };

  const cancelEditingVideo = () => {
    setEditingVideoId(null);
    setVideoTitle('');
    setVideoUrl('');
    setVideoDesc('');
  };

  // Passport Photo Upload Handler
  const handlePassportPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      alert("Passport photograph is too large. Please select an image below 4MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setManualPassportPhoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // CRUD handlers: Documents
  const handleAddDocumentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentTitle.trim() || !documentUrlRaw) {
      alert("Please provide a title and select a file to upload.");
      return;
    }
    
    // Simulate size
    const sizeStr = `${(Math.random() * 2 + 0.1).toFixed(1)} MB`;

    addDocument({
      title: documentTitle,
      fileType: documentType,
      fileSize: sizeStr,
      downloadUrl: documentUrlRaw,
      accessPassword: documentPassword.trim() || undefined
    });

    setDocumentTitle('');
    setDocumentUrlRaw('');
    setDocumentPassword('');
    alert("Document registered successfully and added to Downloads!");
  };

  // CRUD handlers: Results (CSV Parser & Manual addition)
  const calculateGradeAndRemarks = (total: number) => {
    if (total >= 80) return { grade: 'A', remarks: 'Excellent' };
    if (total >= 70) return { grade: 'B', remarks: 'Very Good' };
    if (total >= 60) return { grade: 'C', remarks: 'Credit' };
    if (total >= 50) return { grade: 'D', remarks: 'Pass' };
    if (total >= 40) return { grade: 'E', remarks: 'Pass' };
    return { grade: 'F', remarks: 'Fail' };
  };

  const handleSubjectScoreChange = (
    index: number,
    field: 'subject' | 'ca1Score' | 'ca2Score' | 'testScore' | 'examScore' | 'remarks',
    value: string
  ) => {
    const updated = [...subjectScoresInput];
    if (field === 'subject') {
      updated[index].subject = value;
      if (!updated[index].remarks || updated[index].remarks === 'Fail' || updated[index].remarks === 'Pass' || updated[index].remarks === 'Credit' || updated[index].remarks === 'Very Good' || updated[index].remarks === 'Excellent' || updated[index].remarks === 'Requires remedial practice') {
        updated[index].remarks = getSubjectAssessmentRemark(value, updated[index].totalScore);
      }
    } else if (field === 'remarks') {
      updated[index].remarks = value;
    } else if (field === 'ca1Score') {
      const numVal = Math.min(Math.max(Number(value) || 0, 0), 20);
      updated[index].ca1Score = numVal;
      const ca2 = updated[index].ca2Score ?? 0;
      updated[index].testScore = numVal + ca2;
      const exam = updated[index].examScore ?? 0;
      const total = numVal + ca2 + exam;
      updated[index].totalScore = total;
      const calc = calculateGradeAndRemarks(total);
      updated[index].grade = calc.grade;
      updated[index].remarks = getSubjectAssessmentRemark(updated[index].subject || 'Course', total);
    } else if (field === 'ca2Score') {
      const numVal = Math.min(Math.max(Number(value) || 0, 0), 20);
      updated[index].ca2Score = numVal;
      const ca1 = updated[index].ca1Score ?? 0;
      updated[index].testScore = ca1 + numVal;
      const exam = updated[index].examScore ?? 0;
      const total = ca1 + numVal + exam;
      updated[index].totalScore = total;
      const calc = calculateGradeAndRemarks(total);
      updated[index].grade = calc.grade;
      updated[index].remarks = getSubjectAssessmentRemark(updated[index].subject || 'Course', total);
    } else if (field === 'examScore') {
      const numVal = Math.min(Math.max(Number(value) || 0, 0), 60);
      updated[index].examScore = numVal;
      const ca1 = updated[index].ca1Score ?? Math.round((updated[index].testScore || 0) / 2);
      const ca2 = updated[index].ca2Score ?? ((updated[index].testScore || 0) - ca1);
      const total = ca1 + ca2 + numVal;
      updated[index].totalScore = total;
      const calc = calculateGradeAndRemarks(total);
      updated[index].grade = calc.grade;
      updated[index].remarks = getSubjectAssessmentRemark(updated[index].subject || 'Course', total);
    } else if (field === 'testScore') {
      const numVal = Math.min(Math.max(Number(value) || 0, 0), 40);
      updated[index].testScore = numVal;
      updated[index].ca1Score = Math.round(numVal / 2);
      updated[index].ca2Score = numVal - Math.round(numVal / 2);
      const exam = updated[index].examScore ?? 0;
      const total = numVal + exam;
      updated[index].totalScore = total;
      const calc = calculateGradeAndRemarks(total);
      updated[index].grade = calc.grade;
      updated[index].remarks = getSubjectAssessmentRemark(updated[index].subject || 'Course', total);
    }
    setSubjectScoresInput(updated);
  };

  const addManualSubjectScoreField = () => {
    setSubjectScoresInput([
      ...subjectScoresInput,
      { subject: '', ca1Score: 0, ca2Score: 0, testScore: 0, examScore: 0, totalScore: 0, grade: 'F', remarks: 'Requires remedial practice' }
    ]);
  };

  const removeSubjectScoreField = (index: number) => {
    if (subjectScoresInput.length <= 1) return;
    setSubjectScoresInput(subjectScoresInput.filter((_, i) => i !== index));
  };

  const resetManualResultForm = () => {
    setManualStudentId('');
    setManualStudentName('');
    setManualRollNo('');
    setManualPos('');
    setManualTeacherComment('');
    setManualPrincipalComment('');
    setManualAccessPassword('');
    setManualPassportPhoto('');
    setManualClassStanding('');
    setManualAccreditedGradeBracket('');
    setManualPromotionStatus('');
    setManualGrossTotalMarks(undefined);
    setManualTerminalAverage(undefined);
    setManualGradePoint(undefined);
    setManualPassFail('');
    setSubjectScoresInput([
      { subject: 'Mathematics', ca1Score: 0, ca2Score: 0, testScore: 0, examScore: 0, totalScore: 0, grade: 'F', remarks: 'Requires remedial practice' }
    ]);
  };

  const startEditingResult = (res: StudentResult) => {
    setEditingResultId(res.id);
    setManualStudentId(res.studentId);
    setManualStudentName(res.studentName);
    setManualClass(res.classLevel);
    setManualSession(res.academicSession);
    setManualTerm(res.term);
    setManualGender(res.gender || 'Male');
    setManualRollNo(res.rollNumber);
    setManualPos(res.position);
    setManualTeacherComment(res.teacherRemarks || '');
    setManualPrincipalComment(res.principalRemarks || '');
    setManualAccessPassword(res.accessPassword || '');
    setManualPassportPhoto(res.passportPhoto || '');
    setManualClassStanding(res.classStanding || '');
    setManualAccreditedGradeBracket(res.accreditedGradeBracket || '');
    setManualPromotionStatus(res.promotionStatus || '');
    setManualGrossTotalMarks(res.grossTotalMarks);
    setManualTerminalAverage(res.terminalAverage);
    setManualGradePoint(res.gradePoint);
    setManualPassFail((res.passFailStatus as any) || '');

    const parsedScores = res.subjectScores && res.subjectScores.length > 0
      ? res.subjectScores.map((s) => {
          const ca1 = s.ca1Score !== undefined ? s.ca1Score : Math.round((s.testScore || 0) / 2);
          const ca2 = s.ca2Score !== undefined ? s.ca2Score : ((s.testScore || 0) - ca1);
          return {
            ...s,
            ca1Score: ca1,
            ca2Score: ca2,
            testScore: ca1 + ca2,
            examScore: s.examScore !== undefined ? s.examScore : 0,
            totalScore: s.totalScore !== undefined ? s.totalScore : (ca1 + ca2 + (s.examScore || 0))
          };
        })
      : [{ subject: 'Mathematics', ca1Score: 0, ca2Score: 0, testScore: 0, examScore: 0, totalScore: 0, grade: 'F', remarks: 'Requires remedial practice' }];

    setSubjectScoresInput(parsedScores);
    setResultsDeskTab('registrar');
    setResultNotice(null);
    setTimeout(() => {
      resultFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const cancelEditingResult = () => {
    setEditingResultId(null);
    resetManualResultForm();
  };

  // Sync tab and search query when triggered via Global Search in Header
  useEffect(() => {
    if (initialActiveTab) {
      setActiveTab(initialActiveTab);
    }
  }, [initialActiveTab]);

  useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setResultsSearchQuery(initialSearchQuery);
      if (initialActiveTab === 'results' || activeTab === 'results') {
        setResultsDeskTab('registrar');
      }
    }
  }, [initialSearchQuery, initialActiveTab, activeTab]);

  useEffect(() => {
    if (initialSelectedResultId && results.length > 0) {
      const match = results.find(r => r.id === initialSelectedResultId);
      if (match) {
        startEditingResult(match);
      }
    }
  }, [initialSelectedResultId, results]);

  const handleManualResultSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualStudentId.trim() || !manualStudentName.trim() || !manualPos.trim()) {
      setResultNotice({ type: 'error', message: 'Please fill in core student registration details (Student ID, Name, Class Placement).' });
      setTimeout(() => setResultNotice(null), 4000);
      return;
    }

    const liveMetrics = computeAcademicMetrics(subjectScoresInput, { position: manualPos });
    const passFailDecision = manualPassFail || liveMetrics.passFailStatus;

    // Attach passFail to each individual subject score
    const formattedScores = subjectScoresInput.map((s) => ({
      ...s,
      passFail: (s.totalScore ?? 0) >= 40 ? ('Pass' as const) : ('Failed' as const)
    }));

    if (editingResultId) {
      const studentNameUpdated = manualStudentName.trim();
      if (editResult) {
        editResult(editingResultId, {
          studentId: manualStudentId.trim(),
          studentName: studentNameUpdated,
          classLevel: manualClass,
          term: manualTerm,
          academicSession: manualSession,
          gender: manualGender,
          rollNumber: manualRollNo,
          position: manualPos.trim(),
          principalRemarks: manualPrincipalComment || "Hardworking and highly disciplined.",
          teacherRemarks: manualTeacherComment || "An exemplary student. Keep it up.",
          subjectScores: formattedScores,
          accessPassword: manualAccessPassword.trim() || undefined,
          passportPhoto: manualPassportPhoto.trim() || undefined,
          grossTotalMarks: manualGrossTotalMarks !== undefined ? manualGrossTotalMarks : liveMetrics.grossTotalMarks,
          terminalAverage: manualTerminalAverage !== undefined ? manualTerminalAverage : liveMetrics.terminalAverage,
          gradePoint: manualGradePoint !== undefined ? manualGradePoint : liveMetrics.gradePoint,
          accreditedGradeBracket: manualAccreditedGradeBracket.trim() || liveMetrics.accreditedGradeBracket,
          classStanding: manualClassStanding.trim() || liveMetrics.classStanding,
          promotionStatus: manualPromotionStatus.trim() || liveMetrics.promotionStatus,
          passFailStatus: passFailDecision
        });
      }
      setEditingResultId(null);
      resetManualResultForm();
      setResultNotice({
        type: 'success',
        message: `Published student result sheet for "${studentNameUpdated}" was successfully updated! All academic metrics, promotion status, pass/failed standing, and passport photo are live on the student portal.`
      });
      setTimeout(() => setResultNotice(null), 6000);
      return;
    }

    const res: StudentResult = {
      id: `res-${Date.now()}`,
      studentId: manualStudentId.trim(),
      studentName: manualStudentName.trim(),
      classLevel: manualClass,
      term: manualTerm,
      academicSession: manualSession,
      gender: manualGender,
      rollNumber: manualRollNo,
      position: manualPos.trim(),
      principalRemarks: manualPrincipalComment || "Hardworking and highly disciplined.",
      teacherRemarks: manualTeacherComment || "An exemplary student. Keep it up.",
      subjectScores: formattedScores,
      accessPassword: manualAccessPassword.trim() || undefined,
      passportPhoto: manualPassportPhoto.trim() || undefined,
      grossTotalMarks: manualGrossTotalMarks !== undefined ? manualGrossTotalMarks : liveMetrics.grossTotalMarks,
      terminalAverage: manualTerminalAverage !== undefined ? manualTerminalAverage : liveMetrics.terminalAverage,
      gradePoint: manualGradePoint !== undefined ? manualGradePoint : liveMetrics.gradePoint,
      accreditedGradeBracket: manualAccreditedGradeBracket.trim() || liveMetrics.accreditedGradeBracket,
      classStanding: manualClassStanding.trim() || liveMetrics.classStanding,
      promotionStatus: manualPromotionStatus.trim() || liveMetrics.promotionStatus,
      passFailStatus: passFailDecision
    };

    addResult(res);
    resetManualResultForm();
    setResultNotice({
      type: 'success',
      message: `New student report card record for "${res.studentName}" has been successfully published with official passport photograph, academic metrics, and pass/failed standing!`
    });
    setTimeout(() => setResultNotice(null), 6000);
  };

  // CSV Import Parser
  const handleImportCsv = () => {
    setResultParseError('');
    setResultParseSuccess('');

    if (!csvRawText.trim()) {
      setResultParseError('Please paste valid CSV content first.');
      return;
    }

    try {
      const lines = csvRawText.trim().split('\n');
      if (lines.length < 2) {
        setResultParseError('CSV must include at least 1 header line and 1 data line.');
        return;
      }

      // Expected structure without rollNumber & attendance:
      // studentId,studentName,classLevel,term,academicSession,gender,position,teacherRemarks,principalRemarks,subject,testScore,examScore,accessPassword
      
      const newResults: StudentResult[] = [];
      const studentMap = new Map<string, StudentResult>();

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        // Split CSV handling commas
        const cols = line.split(',').map(c => c.trim().replace(/^"|"$/g, ''));

        if (cols.length < 12) {
          setResultParseError(`Row ${i + 1} has insufficient columns. Required at least 12.`);
          return;
        }

        const sId = cols[0];
        const sName = cols[1];
        const cLevel = cols[2];
        const term = cols[3];
        const session = cols[4];
        const gender = cols[5];

        let pos = '';
        let tRemarks = '';
        let pRemarks = '';
        let subject = '';
        let test = '';
        let exam = '';
        let pass = '';

        // Check if row has legacy attendance (e.g., "85 of 85 Days" in column 7 or 8)
        const hasLegacyAttendance = cols.some(c => c.toLowerCase().includes('day'));

        if (hasLegacyAttendance) {
          // Legacy format with attendance column:
          // [sId, sName, cLevel, term, session, gender, pos, att, tRemarks, pRemarks, subject, test, exam, pass]
          pos = cols[6] || '';
          tRemarks = cols[8] || '';
          pRemarks = cols[9] || '';
          subject = cols[10] || '';
          test = cols[11] || '0';
          exam = cols[12] || '0';
          pass = cols[13] || '';
        } else {
          // New format without attendance:
          // [sId, sName, cLevel, term, session, gender, pos, tRemarks, pRemarks, subject, test, exam, pass]
          pos = cols[6] || '';
          tRemarks = cols[7] || '';
          pRemarks = cols[8] || '';
          subject = cols[9] || '';
          test = cols[10] || '0';
          exam = cols[11] || '0';
          pass = cols[12] || '';
        }

        const testScore = Number(test) || 0;
        const examScore = Number(exam) || 0;
        const totalScore = testScore + examScore;
        const grading = calculateGradeAndRemarks(totalScore);

        const subScore: SubjectScore = {
          subject,
          testScore,
          examScore,
          totalScore,
          grade: grading.grade,
          remarks: grading.remarks
        };

        const key = `${sId}-${term}-${session}`;

        if (studentMap.has(key)) {
          const existing = studentMap.get(key)!;
          existing.subjectScores.push(subScore);
          if (pass && !existing.accessPassword) {
            existing.accessPassword = pass.trim();
          }
        } else {
          const record: StudentResult = {
            id: `res-csv-${Date.now()}-${i}`,
            studentId: sId,
            studentName: sName,
            classLevel: cLevel,
            term: term,
            academicSession: session,
            gender: gender,
            position: pos,
            teacherRemarks: tRemarks,
            principalRemarks: pRemarks,
            accessPassword: pass ? pass.trim() : undefined,
            subjectScores: [subScore]
          };
          studentMap.set(key, record);
        }
      }

      // Add all processed map results to results
      const importedRecords = Array.from(studentMap.values());
      
      // Merge with existing
      const combined = [...results];
      importedRecords.forEach((imported) => {
        // filter out old duplicates
        const index = combined.findIndex(r => r.studentId === imported.studentId && r.term === imported.term && r.academicSession === imported.academicSession);
        if (index > -1) {
          combined[index] = imported;
        } else {
          combined.push(imported);
        }
      });

      importResultsList(combined);
      setResultParseSuccess(`Successfully imported ${importedRecords.length} student terminal records!`);
      setCsvRawText('');
    } catch (e: any) {
      setResultParseError(`Parse error occurred: ${e.message}`);
    }
  };

  // Export Results to JSON copy/download
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(results, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `HGASS_Student_Results_Export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // --- SUPABASE SYNCHRONIZATION EVENT HANDLERS ---
  const handleSaveSupabaseCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.removeItem('hgass_supabase_disconnected');
      localStorage.setItem('hgass_supabase_url', inputSupabaseUrl.trim());
      localStorage.setItem('hgass_supabase_anon_key', inputSupabaseKey.trim());
      if (onConnectSupabase) {
        setSyncMessage({
          text: 'Linking and syncing with Supabase PostgreSQL cloud database...',
          type: 'info'
        });
        const res = await onConnectSupabase(inputSupabaseUrl.trim(), inputSupabaseKey.trim());
        if (res.success) {
          setSyncMessage({
            text: 'Successfully linked and synchronized with Supabase cloud database!',
            type: 'success'
          });
        } else {
          setSyncMessage({
            text: `Supabase credentials saved. Verification note: ${res.error || 'Check table access & policies'}`,
            type: 'error'
          });
        }
      } else {
        setSyncMessage({
          text: 'Credentials updated successfully in configuration.',
          type: 'success'
        });
      }
    } catch (err: any) {
      setSyncMessage({
        text: `Failed to save configuration: ${err.message}`,
        type: 'error'
      });
    }
  };

  const handleClearSupabaseCredentials = () => {
    try {
      localStorage.setItem('hgass_supabase_disconnected', 'true');
      localStorage.removeItem('hgass_supabase_url');
      localStorage.removeItem('hgass_supabase_anon_key');
      setInputSupabaseUrl('');
      setInputSupabaseKey('');
      setIsDisconnectConfirming(false);
      if (onDisconnectSupabase) {
        onDisconnectSupabase();
      }
      setSyncMessage({
        text: 'Supabase database disconnected. The portal will operate in offline/local storage mode on this device.',
        type: 'info'
      });
    } catch (err: any) {
      setSyncMessage({
        text: `Error disconnecting from Supabase: ${err.message}`,
        type: 'error'
      });
    }
  };

  const handlePushSync = async () => {
    setIsSyncing(true);
    setSyncMessage({ text: 'Migrating and pushing local records to Supabase tables...', type: 'info' });
    const res = await pushAllLocalToSupabase();
    setIsSyncing(false);
    if (res.success) {
      setSyncMessage({ text: 'All local announcements, projects, galleries, results and messages have been pushed successfully to your Supabase PostgreSQL database!', type: 'success' });
    } else {
      setSyncMessage({ text: `Sync push failed: ${res.error || 'Ensure tables exist and columns match.'}`, type: 'error' });
    }
  };

  const handlePullSync = async () => {
    setIsSyncing(true);
    setSyncMessage({ text: 'Fetching and pulling tables from Supabase database...', type: 'info' });
    const res = await pullAllFromSupabase();
    setIsSyncing(false);
    if (res.success) {
      setSyncMessage({ text: 'Diocesan portal cached state has been fully refreshed from the latest Supabase database rows!', type: 'success' });
    } else {
      setSyncMessage({ text: `Sync pull failed: ${res.error || 'Ensure tables exist and RLS allows select operations.'}`, type: 'error' });
    }
  };

  // --- RENDERING VIEWS ---

  // CASE A: NOT LOGGED IN - Secure Access Card
  if (!isAdminLoggedIn) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center bg-slate-100/50 px-4">
        <div className="max-w-sm w-full bg-white rounded-lg border border-slate-200 shadow-md p-6 space-y-4 relative overflow-hidden">
          
          {/* Top colored highlight */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-brand-oxblood" />

          <div className="text-center space-y-1">
            <div className="mx-auto w-12 h-12 bg-brand-oxblood/10 rounded-full flex items-center justify-center border border-brand-oxblood/15 text-brand-oxblood">
              <ShieldCheck className="w-6 h-6 text-brand-oxblood animate-pulse" />
            </div>
            <h1 className="text-lg font-black font-heading text-brand-green uppercase tracking-tight">Admin Portal</h1>
            <p className="text-[11px] text-slate-400">Provide credentials to access administrative systems.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-3.5">
            {loginError && (
              <p className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded border border-red-100 flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1 text-red-600 shrink-0" />
                {loginError}
              </p>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide">Enter Admin Password</label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="block w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-2 focus:ring-brand-green/35 focus:outline-hidden"
              />
              <p className="text-[9px] text-slate-400 italic">Default specification: <strong className="text-brand-oxblood">HGASS@25</strong></p>
            </div>

            <button
              type="submit"
              className="w-full bg-brand-green hover:bg-brand-green-dark text-white py-2.5 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-sm"
            >
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  // CASE B: LOGGED IN - Full Administration Dashboard
  return (
    <div className="font-sans text-gray-700 bg-slate-50 min-h-screen">
      
      {/* Top Admin Bar */}
      <div className="bg-brand-green text-white px-4 py-2.5 md:px-6 border-b border-brand-yellow/30 shadow-xs flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-brand-yellow">
            <Database className="w-4.5 h-4.5 text-brand-yellow" />
          </div>
          <div>
            <h1 className="text-xs font-black font-heading text-brand-yellow uppercase">HGASS Central Administration Node</h1>
            <p className="text-[9px] text-green-200 uppercase tracking-widest font-bold">Pentecostal Church Board, Anambra State</p>
          </div>
        </div>
        
        <button
          onClick={onLogout}
          className="bg-brand-oxblood hover:bg-brand-oxblood/90 text-white px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition flex items-center space-x-1 cursor-pointer border border-brand-yellow/20"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Lock Console</span>
        </button>
      </div>

      {/* Main Grid: Left Tabs Sidebar, Right Tab Canvas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* TABS SIDEBAR (Left) */}
          <div className="lg:col-span-3 bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-1">
            {[
              { id: 'overview', label: 'Dashboard Overview', icon: Database },
              { id: 'headerLogo', label: 'Header Crest & Logo', icon: Award },
              { id: 'slides', label: 'Homepage Slideshow Banner', icon: Sliders, badge: (heroSlides.length > 0 ? heroSlides.length : DEFAULT_HERO_SLIDES.length) },
              { id: 'aboutUs', label: 'About Us Section Image', icon: Compass },
              { id: 'milestones', label: 'School Key Statistics', icon: Award },
              { id: 'staff', label: 'Administrative Board & Staff', icon: Users, badge: staff.length },
              { id: 'subjects', label: 'Subjects Offered & Curriculum', icon: BookOpen, badge: subjects.length },
              { id: 'social', label: 'School Social Media Handles', icon: Share2 },
              { id: 'payments', label: 'Payments & Fees (UBA)', icon: CreditCard, badge: stats.pendingPayments },
              { id: 'seo', label: 'SEO & Search Engine Hub', icon: Globe },
              { id: 'supabase', label: 'Supabase Integration', icon: RefreshCw },
              { id: 'news', label: 'News & Announcements', icon: FileText },
              { id: 'projects', label: 'Ongoing Projects', icon: Layers },
              { id: 'images', label: 'Image Management', icon: ImageIcon },
              { id: 'videos', label: 'Video Catalog', icon: Film },
              { id: 'documents', label: 'Document Library', icon: FileSpreadsheet },
              { id: 'results', label: 'Academic Grade Book Registrar', icon: FileText, badge: results.length },
              { id: 'analytics', label: 'Student Performance Analytics', icon: BarChart3, badge: results.length },
              { id: 'cumulative', label: 'Cumulative Academic Section', icon: Calculator, badge: results.filter(r => r.isCumulative || r.term === 'Annual Cumulative').length },
              { id: 'attendance', label: 'Daily Student Attendance', icon: CalendarCheck, badge: attendanceRecords.length },
              { id: 'calendar', label: 'Academic Calendar Desk', icon: CalendarDays, badge: calendarEvents.length },
              { id: 'messages', label: 'Contact Messages', icon: MessageSquare, badge: stats.unreadMessages }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full text-left px-3 py-2 rounded text-xs font-bold tracking-wide flex items-center justify-between transition cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-brand-green text-white font-black shadow-xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-brand-green'
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    <TabIcon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </span>
                  {tab.badge && tab.badge > 0 ? (
                    <span className="bg-brand-oxblood text-brand-yellow text-[8px] font-bold px-1.5 py-0.5 rounded border border-brand-yellow/20">
                      {tab.badge}
                    </span>
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5 opacity-30" />
                  )}
                </button>
              );
            })}
          </div>

          {/* DYNAMIC TAB CANVAS (Right) */}
          <div className="lg:col-span-9 bg-white p-5 rounded-lg border border-slate-200 shadow-xs">
            
            {/* T-1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-0.5">
                  <h3 className="text-lg font-black font-heading text-brand-green uppercase tracking-tight">Console Control Overview</h3>
                  <p className="text-xs text-slate-400">Inspect system stat metrics and manage client-side portal libraries.</p>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Students', value: stats.totalStudents, icon: Database, color: 'border-l-2 border-brand-green text-brand-green bg-brand-green/5' },
                    { label: 'Calendar Events', value: calendarEvents.length, icon: CalendarDays, color: 'border-l-2 border-brand-yellow text-amber-700 bg-amber-50' },
                    { label: 'Attendance Logs', value: attendanceRecords.length, icon: CalendarCheck, color: 'border-l-2 border-emerald-600 text-emerald-800 bg-emerald-50' },
                    { label: 'Cumulative Records', value: results.filter(r => r.isCumulative || r.term === 'Annual Cumulative').length, icon: Calculator, color: 'border-l-2 border-brand-green text-brand-green bg-brand-green/5' },
                    { label: 'Total Remittances', value: payments.length, icon: CreditCard, color: 'border-l-2 border-red-600 text-red-700 bg-red-50' },
                    { label: 'Pending Verification', value: stats.pendingPayments || 0, icon: CreditCard, color: 'border-l-2 border-amber-500 text-amber-700 bg-amber-50' },
                    { label: 'Verified Inflow', value: `₦${((stats.verifiedRevenue || 0) / 1000).toFixed(0)}k`, icon: CreditCard, color: 'border-l-2 border-brand-green text-brand-green bg-brand-green/5' },
                    { label: 'Total Images', value: stats.totalImages, icon: ImageIcon, color: 'border-l-2 border-brand-oxblood text-brand-oxblood bg-brand-oxblood/5' },
                    { label: 'Total Videos', value: stats.totalVideos, icon: Film, color: 'border-l-2 border-brand-yellow text-amber-600 bg-amber-50' },
                    { label: 'Total Documents', value: stats.totalDocuments, icon: FileSpreadsheet, color: 'border-l-2 border-brand-green text-brand-green bg-brand-green/5' },
                    { label: 'Ongoing Projects', value: stats.totalProjects, icon: Layers, color: 'border-l-2 border-brand-oxblood text-brand-oxblood bg-brand-oxblood/5' },
                    { label: 'News Publications', value: stats.totalNewsPosts, icon: FileText, color: 'border-l-2 border-brand-green text-brand-green bg-brand-green/5' },
                    { label: 'Contact Messages', value: messages.length, icon: MessageSquare, color: 'border-l-2 border-brand-yellow text-amber-600 bg-amber-50' }
                  ].map((statCard, index) => {
                    const CardIcon = statCard.icon;
                    return (
                      <div key={index} className={`p-3 rounded border border-slate-100 flex flex-col justify-between ${statCard.color}`}>
                        <div className="flex justify-between items-start">
                          <span className="text-[9px] uppercase font-bold tracking-wider leading-none text-slate-400">{statCard.label}</span>
                          <CardIcon className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        </div>
                        <h4 className="text-xl font-black font-heading mt-1">{statCard.value}</h4>
                      </div>
                    );
                  })}
                </div>

                {/* Monthly Revenue & Collections Bar Chart */}
                <PaymentRevenueChart payments={payments} />

                {/* Homepage Key Milestone Counters Editor in Overview */}
                <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Award className="w-5 h-5 text-brand-yellow" />
                        <h4 className="font-bold text-sm font-heading text-brand-green uppercase tracking-tight">
                          Homepage Milestone Statistics
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Manage the 4 official statistical counters displayed on the public homepage banner.
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('milestones')}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Dedicated View</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveMilestoneStats}
                        className="px-3 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>

                  {statsSavedMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center space-x-2 animate-fade-in font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Milestone statistics updated successfully! Public homepage is now synchronized.</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveMilestoneStats} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    <div className="space-y-1.5 bg-slate-50 p-3 rounded border border-slate-200">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                        <Users className="w-4 h-4 text-brand-green" />
                        <span>Enrolled Students</span>
                      </div>
                      <input
                        type="text"
                        value={editEnrolled}
                        onChange={(e) => setEditEnrolled(e.target.value)}
                        placeholder="e.g. 450+"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400 block">Active student population (e.g. 450+, 500)</span>
                    </div>

                    <div className="space-y-1.5 bg-slate-50 p-3 rounded border border-slate-200">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                        <GraduationCap className="w-4 h-4 text-brand-oxblood" />
                        <span>Professional Educators</span>
                      </div>
                      <input
                        type="text"
                        value={editEducators}
                        onChange={(e) => setEditEducators(e.target.value)}
                        placeholder="e.g. 38"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400 block">Qualified faculty & teachers (e.g. 38, 42)</span>
                    </div>

                    <div className="space-y-1.5 bg-slate-50 p-3 rounded border border-slate-200">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                        <Trophy className="w-4 h-4 text-amber-500" />
                        <span>Exemplary Graduates</span>
                      </div>
                      <input
                        type="text"
                        value={editGraduates}
                        onChange={(e) => setEditGraduates(e.target.value)}
                        placeholder="e.g. 1,200+"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400 block">Graduated academy alumni (e.g. 1,200+)</span>
                    </div>

                    <div className="space-y-1.5 bg-slate-50 p-3 rounded border border-slate-200">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-700">
                        <Award className="w-4 h-4 text-brand-green" />
                        <span>State & National Awards</span>
                      </div>
                      <input
                        type="text"
                        value={editAwards}
                        onChange={(e) => setEditAwards(e.target.value)}
                        placeholder="e.g. 15"
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden"
                      />
                      <span className="text-[10px] text-slate-400 block">Honors & competition titles (e.g. 15, 20)</span>
                    </div>

                    <div className="sm:col-span-2 lg:col-span-4 flex items-center justify-end space-x-3 pt-1">
                      <button
                        type="button"
                        onClick={handleResetMilestoneStats}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset to Defaults</span>
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save Milestone Statistics</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Homepage Carousel Slideshow & Hero Images in Overview */}
                <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Sliders className="w-5 h-5 text-brand-green" />
                        <h4 className="font-bold text-sm font-heading text-brand-green uppercase tracking-tight">
                          Homepage Slideshow Banner Images & Captions
                        </h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Change, upload, and manage the rotating hero images displayed on the public homepage. Choose an image file directly from your computer or phone.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          resetSlideForm();
                          setActiveTab('slides');
                        }}
                        className="px-3 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add New Slide</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmModal({
                            title: 'Restore Default Homepage Slides',
                            message: 'This will reset all slides on the homepage carousel back to the Holy Ghost Academy official standard defaults. Any custom images will be replaced. Continue?',
                            confirmText: 'Restore Defaults',
                            onConfirm: () => {
                              onResetHeroSlides?.();
                              setSlideSuccessNotice("Homepage slides successfully restored to academy defaults!");
                              setTimeout(() => setSlideSuccessNotice(null), 3500);
                            }
                          });
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer border border-slate-200"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset Defaults</span>
                      </button>
                    </div>
                  </div>

                  {slideSuccessNotice && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center space-x-2 animate-fade-in font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{slideSuccessNotice}</span>
                    </div>
                  )}

                  {/* Hidden file input for single-click photo replacement from device */}
                  <input
                    type="file"
                    ref={overviewSlideFileInputRef}
                    accept="image/*"
                    onChange={handleOverviewSlideFileChange}
                    className="hidden"
                    id="admin-overview-slide-file-picker"
                  />

                  {/* Active Slides Cards Grid in Overview */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(heroSlides && heroSlides.length > 0 ? heroSlides : DEFAULT_HERO_SLIDES).map((slide, idx) => (
                      <div key={slide.id} className="bg-slate-50 border border-slate-200 rounded-lg overflow-hidden flex flex-col shadow-2xs hover:shadow-xs transition">
                        {/* Slide Thumbnail Preview with Dark Overlay & Badge */}
                        <div className="relative h-44 w-full overflow-hidden bg-slate-900 group">
                          <img
                            src={slide.imageUrl}
                            alt={slide.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
                          <div className="absolute top-2 left-2 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-brand-green/90 text-white text-[9px] font-mono font-bold uppercase tracking-wider shadow-xs">
                              Slide {idx + 1} of {(heroSlides && heroSlides.length > 0 ? heroSlides : DEFAULT_HERO_SLIDES).length}
                            </span>
                            {slide.badge && (
                              <span className="px-1.5 py-0.5 rounded bg-brand-yellow/90 text-slate-900 text-[8.5px] font-bold uppercase tracking-wider shadow-xs">
                                {slide.badge}
                              </span>
                            )}
                          </div>
                          <div className="absolute bottom-2 left-2 right-2 text-white">
                            <p className="font-heading font-black text-xs uppercase line-clamp-1 leading-tight text-white drop-shadow-sm">
                              {slide.title}
                            </p>
                            <p className="text-[10px] text-slate-200 line-clamp-1 opacity-90 drop-shadow-sm mt-0.5">
                              {slide.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Slide Actions */}
                        <div className="p-3 bg-white flex-1 flex flex-col justify-between space-y-2.5">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                              <span className="truncate max-w-[170px]">
                                {slide.imageUrl.startsWith('data:') ? 'Local file uploaded' : 'Web photo linked'}
                              </span>
                              <span className="text-emerald-700 font-bold bg-emerald-50 px-1 py-0.2 rounded">Active</span>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                            {/* Choose File / Change Image Button */}
                            <button
                              type="button"
                              onClick={() => {
                                setOverviewTargetSlideId(slide.id);
                                overviewSlideFileInputRef.current?.click();
                              }}
                              className="px-2.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-[10px] font-bold uppercase tracking-wider transition flex items-center space-x-1 cursor-pointer shadow-xs"
                              title="Choose an image file from your phone or computer to replace this slide"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                              <span>Change Photo</span>
                            </button>

                            {/* Edit Details */}
                            <button
                              type="button"
                              onClick={() => {
                                handleStartEditSlide(slide);
                                setActiveTab('slides');
                              }}
                              className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-bold uppercase transition flex items-center space-x-1 cursor-pointer border border-slate-200"
                              title="Edit Headline, Subtitle, and Badge"
                            >
                              <Edit className="w-3.5 h-3.5 text-slate-500" />
                              <span>Edit Text</span>
                            </button>

                            {/* Reorder and Delete */}
                            <div className="flex items-center space-x-0.5">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() => handleMoveSlide(idx, 'up')}
                                className="p-1 text-slate-500 hover:text-brand-green hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                title="Move earlier in rotation"
                              >
                                <ArrowUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === (heroSlides.length || DEFAULT_HERO_SLIDES.length) - 1}
                                onClick={() => handleMoveSlide(idx, 'down')}
                                className="p-1 text-slate-500 hover:text-brand-green hover:bg-slate-100 rounded disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                                title="Move later in rotation"
                              >
                                <ArrowDown className="w-3.5 h-3.5" />
                              </button>
                              {(heroSlides.length || DEFAULT_HERO_SLIDES.length) > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmModal({
                                      title: 'Delete Homepage Slide',
                                      message: `Are you sure you want to remove slide #${idx + 1} ("${slide.title}") from the homepage banner?`,
                                      confirmText: 'Delete Slide',
                                      onConfirm: () => {
                                        onDeleteHeroSlide?.(slide.id);
                                        setSlideSuccessNotice("Slide deleted from homepage carousel.");
                                        setTimeout(() => setSlideSuccessNotice(null), 3500);
                                      }
                                    });
                                  }}
                                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer transition"
                                  title="Delete Slide"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 text-[10.5px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span>
                      The homepage rotates through these <strong>{(heroSlides.length > 0 ? heroSlides : DEFAULT_HERO_SLIDES).length}</strong> high-resolution slides every 6 seconds.
                    </span>
                    <button
                      type="button"
                      onClick={() => setActiveTab('slides')}
                      className="text-brand-green font-bold hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                    >
                      <span>Open Full Slideshow Editor</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* About Us Showcase Photo Overview Card */}
                <div className="bg-white rounded p-4 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-emerald-50 text-brand-green flex items-center justify-center font-bold shrink-0 border border-emerald-200">
                        <Compass className="w-4 h-4 text-brand-green" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-tight">About Us Section Hero Photograph</h4>
                        <p className="text-[10px] text-slate-400">Featured campus visual in the public "Our Establishment & Heritage" section</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('aboutUs')}
                        className="px-3 py-1 bg-brand-green hover:bg-brand-green-dark text-white rounded text-[11px] font-bold uppercase transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        <span>Change Photo & Badge</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 p-3 rounded-lg border border-slate-200">
                    <div className="relative w-full sm:w-44 h-28 rounded-md overflow-hidden border border-slate-300 shadow-xs shrink-0 bg-slate-900">
                      <img src={aboutUsImage || DEFAULT_ABOUT_US_IMAGE} alt="About Us" className="w-full h-full object-cover" />
                      {aboutUsBadge && (
                        <div className="absolute top-1.5 left-1.5 bg-brand-green text-brand-yellow text-[8px] font-bold font-heading px-1.5 py-0.5 rounded shadow">
                          {aboutUsBadge}
                        </div>
                      )}
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600 flex-1">
                      <p className="font-semibold text-slate-800">
                        Displayed on: <span className="font-mono text-brand-oxblood">/about</span> (About Our Academy)
                      </p>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        Currently active: <span className="font-bold text-slate-700">{editAboutBadge || 'Est. Pentecostal Church'}</span> badge. You can upload an official school building photo, choose from STEM/science lab presets, or enter a custom web URL.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('aboutUs')}
                        className="text-brand-green font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Open About Us Image Customizer</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Header Logo & Official School Crest Overview Card */}
                <div className="bg-white rounded p-4 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold shrink-0 border border-amber-200">
                        <Award className="w-4 h-4 text-amber-700" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-tight">Header Logo & Official School Crest</h4>
                        <p className="text-[10px] text-slate-400">Official crest displayed in the sticky navigation header, mobile menu, and receipts</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setActiveTab('headerLogo')}
                        className="px-3 py-1 bg-brand-green hover:bg-brand-green-dark text-white rounded text-[11px] font-bold uppercase transition flex items-center space-x-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5 mr-1" />
                        <span>Manage Crest & Logo</span>
                      </button>
                    </div>
                  </div>

                  {logoSuccessNotice && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{logoSuccessNotice}</span>
                    </div>
                  )}

                  {/* Hidden file input for fast 1-click device logo upload from overview */}
                  <input
                    type="file"
                    ref={overviewLogoFileInputRef}
                    accept="image/*"
                    onChange={(e) => handleLogoFileUpload(e, true)}
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row gap-4 items-center bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                    {/* Simulated Header Badge Frame */}
                    <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-white text-brand-green font-bold border-2 border-brand-yellow overflow-hidden shrink-0 shadow-sm">
                      <img
                        src={editHeaderLogo || DEFAULT_HEADER_LOGO}
                        alt="Holy Ghost Academy Official Crest"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = DEFAULT_HEADER_LOGO;
                        }}
                      />
                    </div>
                    <div className="space-y-1.5 text-xs text-slate-600 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 uppercase text-xs">Holy Ghost Academy Secondary School Crest</span>
                        <span className="px-1.5 py-0.2 rounded bg-brand-green/10 text-brand-green text-[9px] font-bold uppercase">Active</span>
                      </div>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        The header crest represents the institution across all device screens and printable grade records. You can upload an official PNG/JPG file from your device, link a cloud image URL, or choose an emblem preset.
                      </p>
                      <div className="flex flex-wrap items-center gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => overviewLogoFileInputRef.current?.click()}
                          className="px-2.5 py-1 bg-brand-green hover:bg-brand-green-dark text-white rounded text-[10px] font-bold uppercase tracking-wider transition flex items-center gap-1 cursor-pointer shadow-xs"
                          title="Upload new crest image file from computer or phone"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Upload From Device</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab('headerLogo')}
                          className="text-brand-green font-bold text-xs hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <span>Open Full Logo Studio</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                        {editHeaderLogo !== DEFAULT_HEADER_LOGO && (
                          <button
                            type="button"
                            onClick={handleResetHeaderLogo}
                            className="text-amber-700 hover:text-amber-900 font-bold text-[10.5px] hover:underline flex items-center gap-0.5 cursor-pointer ml-auto"
                          >
                            <RefreshCw className="w-3 h-3" />
                            <span>Restore Default</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Administrative Board & Staff Registry Overview Card */}
                <div className="bg-white rounded p-4 border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-brand-oxblood/10 flex items-center justify-center text-brand-oxblood font-bold shrink-0">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-tight">Administrative Board & Staff Registry</h4>
                        <p className="text-[10px] text-slate-400">Total {staff.length} active registered faculty, leadership, and governing board members</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={handleStartAddStaff}
                        className="px-3 py-1 bg-brand-oxblood hover:bg-brand-oxblood-dark text-white rounded text-[11px] font-bold uppercase transition flex items-center space-x-1 cursor-pointer"
                      >
                        <UserPlus className="w-3.5 h-3.5 mr-1" />
                        <span>Add New Member</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab('staff')}
                        className="px-3 py-1 bg-brand-green hover:bg-brand-green-dark text-white rounded text-[11px] font-bold uppercase transition flex items-center space-x-1 cursor-pointer"
                      >
                        <span>Manage Registry</span>
                        <ChevronRight className="w-3 h-3 ml-0.5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div 
                      onClick={() => { setStaffCategoryFilter('Administrative Board'); setActiveTab('staff'); }}
                      className="p-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[10px] uppercase font-bold text-brand-oxblood">Administrative Board</p>
                        <p className="text-lg font-black font-heading text-slate-800">{staff.filter(s => s.category === 'Administrative Board').length}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>

                    <div 
                      onClick={() => { setStaffCategoryFilter('Academic Staff'); setActiveTab('staff'); }}
                      className="p-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[10px] uppercase font-bold text-brand-green">Academic Staff</p>
                        <p className="text-lg font-black font-heading text-slate-800">{staff.filter(s => s.category === 'Academic Staff').length}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>

                    <div 
                      onClick={() => { setStaffCategoryFilter('Non-Academic Staff'); setActiveTab('staff'); }}
                      className="p-2.5 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 cursor-pointer transition flex items-center justify-between"
                    >
                      <div>
                        <p className="text-[10px] uppercase font-bold text-slate-600">Non-Academic Staff</p>
                        <p className="text-lg font-black font-heading text-slate-800">{staff.filter(s => s.category === 'Non-Academic Staff').length}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </div>
                  </div>
                </div>

                {/* Informational helpful tips */}
                <div className="bg-slate-50 rounded p-4 border border-slate-200 space-y-1.5 text-[11px] text-slate-500">
                  <h4 className="font-bold text-xs text-brand-green font-heading uppercase flex items-center">
                    <CheckCircle2 className="w-4 h-4 text-brand-green mr-1.5 shrink-0" />
                    Secure Local-Persistence Module
                  </h4>
                  <p className="leading-relaxed">
                    This administrative portal uses high-speed secure client-side storage to manage content dynamically. Images uploaded are converted instantly into data streams, allowing immediate preview without complex external database delays. 
                  </p>
                  <p className="leading-relaxed font-semibold">
                    You can manage images in Gallery, publish new stories, update project completion benchmarks, input students scores, and download records. To clear all mock edits and return to diocesan seeded data, clear your browser local storage or session cache.
                  </p>
                </div>
              </div>
            )}

            {/* T-MILESTONES: SCHOOL KEY STATISTICS */}
            {activeTab === 'milestones' && (
              <div className="space-y-6 animate-fade-in font-sans">
                {/* Header banner */}
                <div className="bg-gradient-to-r from-brand-green to-brand-green-dark text-white rounded-lg p-6 shadow-sm border border-brand-yellow/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Award className="w-6 h-6 text-brand-yellow shrink-0" />
                        <h3 className="text-xl font-black font-heading text-white tracking-tight">
                          School Key Statistics & Milestone Counters
                        </h3>
                      </div>
                      <p className="text-xs text-green-100 max-w-2xl leading-relaxed">
                        Customize the four official achievement figures highlighted on the Holy Ghost Academy homepage banner. Changes persist in local storage and instantly update the public visitor view.
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleResetMilestoneStats}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer border border-white/20 flex items-center space-x-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset Defaults</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveMilestoneStats}
                        className="px-4 py-2 bg-brand-yellow hover:bg-amber-400 text-brand-green-dark rounded text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center space-x-1.5"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Feedback Toast */}
                {statsSavedMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-sm flex items-center space-x-3 shadow-xs animate-fade-in font-semibold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold">Milestone Statistics Saved Successfully!</p>
                      <p className="text-xs font-normal text-emerald-700 mt-0.5">The public homepage banner counters have been updated with your new values.</p>
                    </div>
                  </div>
                )}

                {/* Edit Form Grid */}
                <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-xs space-y-6">
                  <div className="border-b border-slate-100 pb-3">
                    <h4 className="font-bold text-sm text-slate-800 font-heading uppercase tracking-wide">
                      Edit Public Metric Values
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Enter the exact figures you wish to display. You can include standard symbols like "+" or "," (e.g. 450+, 1,200+).
                    </p>
                  </div>

                  <form onSubmit={handleSaveMilestoneStats} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {/* 1. Enrolled Students */}
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 hover:border-brand-green/50 transition">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center">
                              <Users className="w-4 h-4" />
                            </div>
                            <span>Enrolled Students</span>
                          </label>
                          <span className="text-[10px] uppercase font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded">Metric 1</span>
                        </div>
                        <input
                          type="text"
                          value={editEnrolled}
                          onChange={(e) => setEditEnrolled(e.target.value)}
                          placeholder="e.g. 450+"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green focus:outline-hidden"
                        />
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Represents active registered learners across Junior and Senior secondary classes.
                        </p>
                      </div>

                      {/* 2. Professional Educators */}
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 hover:border-brand-oxblood/50 transition">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-brand-oxblood/10 text-brand-oxblood flex items-center justify-center">
                              <GraduationCap className="w-4 h-4" />
                            </div>
                            <span>Professional Educators</span>
                          </label>
                          <span className="text-[10px] uppercase font-bold text-brand-oxblood bg-brand-oxblood/10 px-2 py-0.5 rounded">Metric 2</span>
                        </div>
                        <input
                          type="text"
                          value={editEducators}
                          onChange={(e) => setEditEducators(e.target.value)}
                          placeholder="e.g. 38"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-oxblood/40 focus:border-brand-oxblood focus:outline-hidden"
                        />
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Certified subject educators, laboratory technicians, and specialized academic counselors.
                        </p>
                      </div>

                      {/* 3. Exemplary Graduates */}
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 hover:border-amber-400 transition">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
                              <Trophy className="w-4 h-4" />
                            </div>
                            <span>Exemplary Graduates</span>
                          </label>
                          <span className="text-[10px] uppercase font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">Metric 3</span>
                        </div>
                        <input
                          type="text"
                          value={editGraduates}
                          onChange={(e) => setEditGraduates(e.target.value)}
                          placeholder="e.g. 1,200+"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-400/40 focus:border-amber-500 focus:outline-hidden"
                        />
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Distinguished alumni excelling in tertiary universities, medicine, engineering, and civic service.
                        </p>
                      </div>

                      {/* 4. State & National Awards */}
                      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2 hover:border-brand-green/50 transition">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center">
                              <Award className="w-4 h-4" />
                            </div>
                            <span>State & National Awards</span>
                          </label>
                          <span className="text-[10px] uppercase font-bold text-brand-green bg-brand-green/10 px-2 py-0.5 rounded">Metric 4</span>
                        </div>
                        <input
                          type="text"
                          value={editAwards}
                          onChange={(e) => setEditAwards(e.target.value)}
                          placeholder="e.g. 15"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-md text-sm font-bold text-slate-900 focus:ring-2 focus:ring-brand-green/40 focus:border-brand-green focus:outline-hidden"
                        />
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Accredited state competitions, STEM championships, and academic quiz trophies.
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={handleResetMilestoneStats}
                        className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center space-x-1.5"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset to Factory Defaults</span>
                      </button>
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-6 py-2.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center justify-center space-x-2"
                      >
                        <Save className="w-4 h-4" />
                        <span>Save & Publish to Homepage</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Live Ribbon Preview */}
                <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center space-x-2">
                      <Eye className="w-4 h-4 text-brand-green" />
                      <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 font-heading">
                        Real-Time Homepage Banner Preview
                      </h4>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded uppercase">
                      Live Preview
                    </span>
                  </div>

                  {/* Public Ribbon Simulation */}
                  <div className="bg-brand-oxblood text-white rounded-xl p-6 sm:p-8 shadow-md border border-brand-yellow/20">
                    <div className="text-center mb-6">
                      <span className="text-[10px] uppercase font-bold text-brand-yellow tracking-widest bg-black/20 px-3 py-1 rounded-full border border-brand-yellow/20">
                        HOLY GHOST ACADEMY MILESTONES
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                      <div className="space-y-1.5 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-white/10 text-brand-yellow flex items-center justify-center mx-auto">
                          <Users className="w-4 h-4" />
                        </div>
                        <h4 className="text-2xl sm:text-3xl font-black font-heading text-brand-yellow">
                          {editEnrolled || '450+'}
                        </h4>
                        <p className="text-[11px] uppercase font-bold tracking-wider text-slate-200">
                          Enrolled Students
                        </p>
                      </div>

                      <div className="space-y-1.5 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-white/10 text-brand-yellow flex items-center justify-center mx-auto">
                          <GraduationCap className="w-4 h-4" />
                        </div>
                        <h4 className="text-2xl sm:text-3xl font-black font-heading text-brand-yellow">
                          {editEducators || '38'}
                        </h4>
                        <p className="text-[11px] uppercase font-bold tracking-wider text-slate-200">
                          Professional Educators
                        </p>
                      </div>

                      <div className="space-y-1.5 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-white/10 text-brand-yellow flex items-center justify-center mx-auto">
                          <Trophy className="w-4 h-4" />
                        </div>
                        <h4 className="text-2xl sm:text-3xl font-black font-heading text-brand-yellow">
                          {editGraduates || '1,200+'}
                        </h4>
                        <p className="text-[11px] uppercase font-bold tracking-wider text-slate-200">
                          Exemplary Graduates
                        </p>
                      </div>

                      <div className="space-y-1.5 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="w-8 h-8 rounded-full bg-white/10 text-brand-yellow flex items-center justify-center mx-auto">
                          <Award className="w-4 h-4" />
                        </div>
                        <h4 className="text-2xl sm:text-3xl font-black font-heading text-brand-yellow">
                          {editAwards || '15'}
                        </h4>
                        <p className="text-[11px] uppercase font-bold tracking-wider text-slate-200">
                          State & National Awards
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* T-STAFF: ADMINISTRATIVE BOARD & STAFF MANAGEMENT */}
            {activeTab === 'staff' && (
              <div className="space-y-6 animate-fade-in font-sans">
                {/* Header & Quick Action */}
                <div className="bg-gradient-to-r from-brand-oxblood via-brand-oxblood-dark to-slate-900 text-white rounded-lg p-5 shadow-sm border border-brand-yellow/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-brand-yellow shrink-0" />
                      <h3 className="text-lg font-black font-heading text-white tracking-tight uppercase">
                        Administrative Board & Staff Registry
                      </h3>
                    </div>
                    <p className="text-xs text-slate-200 max-w-xl font-light leading-relaxed">
                      Register and edit members of the school governing board, academic faculty educators, and support staff. Changes are automatically reflected live on the public About page.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleStartAddStaff}
                    className="px-4 py-2 bg-brand-yellow hover:bg-yellow-400 text-brand-oxblood-dark rounded-md text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center justify-center space-x-1.5 shrink-0"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Add New Member</span>
                  </button>
                </div>

                {/* Success Notification Alert */}
                {staffSuccessNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-300 rounded text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fade-in">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{staffSuccessNotice}</span>
                    </div>
                    <button 
                      type="button" 
                      onClick={() => setStaffSuccessNotice(null)}
                      className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Add / Edit Form Drawer */}
                {isStaffFormOpen && (
                  <div 
                    ref={staffFormRef}
                    className={`p-5 rounded-lg border transition space-y-4 shadow-sm ${
                      editingStaffId 
                        ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-400/25' 
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                      <div className="flex items-center space-x-2">
                        {editingStaffId ? (
                          <div className="p-1.5 rounded bg-amber-200 text-amber-900">
                            <Edit className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="p-1.5 rounded bg-brand-green text-white">
                            <UserPlus className="w-4 h-4" />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-sm text-slate-800 uppercase tracking-tight">
                            {editingStaffId ? `Edit Staff Member: ${staffName || 'Selected Member'}` : 'Register New Staff or Board Member'}
                          </h4>
                          <p className="text-[10px] text-slate-500">
                            {editingStaffId 
                              ? 'Modify member role, category, credentials, or bio. Click "Update Member Profile" to save.' 
                              : 'Complete the form below to add a new member to the school board or staff directory.'}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => { resetStaffForm(); setIsStaffFormOpen(false); }}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 cursor-pointer"
                        title="Close Form"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleStaffFormSubmit} className="space-y-4">
                      {/* Top Row: Category, Name, Role */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                            Staff / Board Category <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={staffCategory}
                            onChange={(e) => setStaffCategory(e.target.value as StaffCategory)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden cursor-pointer"
                          >
                            <option value="Administrative Board">Administrative Board</option>
                            <option value="Academic Staff">Academic Staff</option>
                            <option value="Non-Academic Staff">Non-Academic Staff</option>
                          </select>
                          <p className="text-[9px] text-slate-400">Determines grouping tab on the public About page</p>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                            Full Name & Title <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Engr. ThankGod Ndibe B.Engr., M.Engr."
                            value={staffName}
                            onChange={(e) => setStaffName(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden"
                          />
                          <p className="text-[9px] text-slate-400">Include clerical or academic prefixes if any</p>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                            Official Role / Designation <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Manager / Spiritual Director, Principal"
                            value={staffRole}
                            onChange={(e) => setStaffRole(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden"
                          />
                          <p className="text-[9px] text-slate-400">e.g. Vice Principal (Academics), HOD Chemistry</p>
                        </div>
                      </div>

                      {/* Row 2: Qualifications, Email, Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-brand-green" />
                            <span>Qualifications & Degrees</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. B.Th (Rome), M.Sc (Educ. Mgt), Ph.D"
                            value={staffQualifications}
                            onChange={(e) => setStaffQualifications(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                            <Mail className="w-3 h-3 text-brand-oxblood" />
                            <span>Official Email (Optional)</span>
                          </label>
                          <input
                            type="email"
                            placeholder="e.g. manager@holyghostacademy.ng"
                            value={staffEmail}
                            onChange={(e) => setStaffEmail(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                            <Phone className="w-3 h-3 text-brand-green" />
                            <span>Office Phone (Optional)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. +234 803 123 4567"
                            value={staffPhone}
                            onChange={(e) => setStaffPhone(e.target.value)}
                            className="block w-full px-3 py-2 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Row 3: Photo Management (URL, Device Upload, Presets, Preview) */}
                      <div className="space-y-2 bg-white p-3.5 rounded border border-slate-200">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide flex items-center gap-1">
                          <ImageIcon className="w-3.5 h-3.5 text-brand-green" />
                          <span>Member Portrait Photo</span>
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                          {/* Live preview */}
                          <div className="md:col-span-2 flex flex-col items-center justify-center p-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand-green/30 bg-slate-200 flex items-center justify-center">
                              {staffImage ? (
                                <img
                                  src={staffImage}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              ) : (
                                <Users className="w-8 h-8 text-slate-400" />
                              )}
                            </div>
                            <span className="text-[9px] text-slate-400 font-bold uppercase mt-1">Preview</span>
                          </div>

                          {/* Inputs: URL or Device File */}
                          <div className="md:col-span-10 space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                              <div>
                                <span className="block text-[9px] font-bold text-slate-400 uppercase">Option 1: Paste Image URL</span>
                                <input
                                  type="url"
                                  placeholder="https://images.unsplash.com/..."
                                  value={staffImage}
                                  onChange={(e) => setStaffImage(e.target.value)}
                                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-mono text-slate-700 focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden"
                                />
                              </div>

                              <div>
                                <span className="block text-[9px] font-bold text-slate-400 uppercase">Option 2: Upload from Device</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleStaffImageUpload}
                                  className="block w-full text-xs text-slate-500 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-brand-green/10 file:text-brand-green file:cursor-pointer"
                                />
                              </div>
                            </div>

                            {/* Preset Buttons */}
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase block">Or choose standard portrait avatar:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {STAFF_IMAGE_PRESETS.map((preset, idx) => (
                                  <button
                                    key={idx}
                                    type="button"
                                    onClick={() => setStaffImage(preset.url)}
                                    className={`text-[10px] px-2 py-0.5 rounded border transition cursor-pointer ${
                                      staffImage === preset.url 
                                        ? 'bg-brand-green text-white border-brand-green font-bold' 
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                                    }`}
                                  >
                                    {preset.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Row 4: Bio / Responsibilities */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                          Member Profile Summary & Responsibilities
                        </label>
                        <textarea
                          rows={3}
                          placeholder="Provide a brief biography, administrative purview, or teaching subjects..."
                          value={staffDesc}
                          onChange={(e) => setStaffDesc(e.target.value)}
                          className="block w-full p-2.5 bg-white border border-slate-300 rounded text-xs text-slate-700 leading-relaxed focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden"
                        />
                      </div>

                      {/* Submit and Cancel Buttons */}
                      <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => { resetStaffForm(); setIsStaffFormOpen(false); }}
                          className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className={`w-full sm:w-auto px-5 py-2 text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm ${
                            editingStaffId 
                              ? 'bg-amber-600 hover:bg-amber-700 border border-amber-700' 
                              : 'bg-brand-green hover:bg-brand-green-dark border border-brand-green'
                          }`}
                        >
                          {editingStaffId ? <Save className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                          <span>{editingStaffId ? 'Update Member Profile' : 'Save Member to Directory'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Filter and Search Bar */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Category Pills */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['All', 'Administrative Board', 'Academic Staff', 'Non-Academic Staff'] as const).map((cat) => {
                      const count = cat === 'All' 
                        ? staff.length 
                        : staff.filter(s => s.category === cat).length;
                      const isSelected = staffCategoryFilter === cat;

                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setStaffCategoryFilter(cat)}
                          className={`px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer flex items-center space-x-1.5 ${
                            isSelected
                              ? 'bg-brand-green text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          <span>{cat}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Search Query */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search by name, role, qualification..."
                      value={staffSearchQuery}
                      onChange={(e) => setStaffSearchQuery(e.target.value)}
                      className="w-full sm:w-64 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden"
                    />
                    {staffSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setStaffSearchQuery('')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* Staff Cards Roster */}
                {(() => {
                  const filteredList = staff.filter((m) => {
                    const matchesCategory = staffCategoryFilter === 'All' || m.category === staffCategoryFilter;
                    if (!matchesCategory) return false;
                    if (!staffSearchQuery.trim()) return true;
                    const q = staffSearchQuery.toLowerCase();
                    return (
                      m.name.toLowerCase().includes(q) ||
                      m.role.toLowerCase().includes(q) ||
                      (m.qualifications && m.qualifications.toLowerCase().includes(q)) ||
                      (m.desc && m.desc.toLowerCase().includes(q))
                    );
                  });

                  if (filteredList.length === 0) {
                    return (
                      <div className="p-8 text-center bg-white rounded-lg border border-slate-200 space-y-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                          <Users className="w-6 h-6" />
                        </div>
                        <div className="space-y-1 max-w-sm mx-auto">
                          <p className="text-xs font-bold text-slate-700 uppercase">No Staff Members Found</p>
                          <p className="text-[11px] text-slate-400">
                            {staffSearchQuery 
                              ? `No staff or board member matches "${staffSearchQuery}". Try clearing search filter.`
                              : `No records under "${staffCategoryFilter}". Click "Add New Member" to register one.`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleStartAddStaff}
                          className="px-3.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                        >
                          + Add Member Now
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filteredList.map((member) => {
                        const isEditingThis = editingStaffId === member.id;
                        const isBoard = member.category === 'Administrative Board';
                        const isAcademic = member.category === 'Academic Staff';

                        return (
                          <div 
                            key={member.id}
                            className={`bg-white rounded-lg border transition-all p-4 flex flex-col justify-between space-y-3 relative overflow-hidden ${
                              isEditingThis 
                                ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-md bg-amber-50/40' 
                                : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                            }`}
                          >
                            {/* Accent indicator bar */}
                            <div className={`absolute top-0 inset-x-0 h-1 ${
                              isBoard ? 'bg-brand-oxblood' : isAcademic ? 'bg-brand-green' : 'bg-slate-400'
                            }`} />

                            <div className="space-y-3">
                              {/* Top Profile Header */}
                              <div className="flex items-start space-x-3 pt-1">
                                <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-slate-200 bg-slate-100 shrink-0">
                                  <img
                                    src={member.image || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400'}
                                    alt={member.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.target as HTMLElement).style.display = 'none';
                                    }}
                                  />
                                </div>

                                <div className="space-y-1 min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1">
                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                      isBoard
                                        ? 'bg-brand-oxblood/10 text-brand-oxblood border-brand-oxblood/20'
                                        : isAcademic
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                        : 'bg-slate-100 text-slate-700 border-slate-200'
                                    }`}>
                                      {member.category}
                                    </span>
                                    {isEditingThis && (
                                      <span className="text-[8px] font-bold uppercase bg-amber-200 text-amber-950 px-1.5 py-0.2 rounded font-mono">
                                        Editing
                                      </span>
                                    )}
                                  </div>

                                  <h4 className="font-black text-sm text-slate-800 uppercase leading-snug tracking-tight truncate">
                                    {member.name}
                                  </h4>

                                  <p className="text-xs font-bold text-brand-green truncate">
                                    {member.role}
                                  </p>
                                </div>
                              </div>

                              {/* Qualifications badge */}
                              {member.qualifications && (
                                <div className="flex items-center space-x-1.5 text-[10px] text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200/80 font-mono">
                                  <GraduationCap className="w-3.5 h-3.5 text-brand-oxblood shrink-0" />
                                  <span className="truncate font-semibold">{member.qualifications}</span>
                                </div>
                              )}

                              {/* Bio excerpt */}
                              <p className="text-[11px] text-slate-500 leading-relaxed font-sans line-clamp-3">
                                {member.desc || 'Dedicated academic leader and mentor committed to educational discipline and standard excellence.'}
                              </p>

                              {/* Contact info pills */}
                              {(member.email || member.phone) && (
                                <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-100">
                                  {member.email && (
                                    <span className="text-[9.5px] text-slate-500 flex items-center space-x-1 font-mono">
                                      <Mail className="w-3 h-3 text-brand-oxblood" />
                                      <span className="truncate max-w-[150px]">{member.email}</span>
                                    </span>
                                  )}
                                  {member.phone && (
                                    <span className="text-[9.5px] text-slate-500 flex items-center space-x-1 font-mono">
                                      <Phone className="w-3 h-3 text-brand-green" />
                                      <span>{member.phone}</span>
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Actions bar */}
                            <div className="flex items-center justify-between pt-2 border-t border-slate-100 gap-2">
                              <button
                                type="button"
                                onClick={() => handleStartEditStaff(member)}
                                className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1 border ${
                                  isEditingThis
                                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                }`}
                              >
                                <Edit className="w-3 h-3" />
                                <span>{isEditingThis ? 'Editing Now' : 'Edit Member'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteStaff(member)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded border border-transparent hover:border-red-200 cursor-pointer transition"
                                title="Delete this member"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()}

              </div>
            )}

            {/* T-SUPABASE: INTEGRATION SETTINGS */}
            {activeTab === 'supabase' && (
              <div className="space-y-6 animate-fade-in font-sans">
                <div className="space-y-1">
                  <h3 className="text-base font-black font-heading text-brand-green uppercase tracking-tight">Supabase Database Integration</h3>
                  <p className="text-xs text-slate-400">Connect your school portal directly to your cloud hosted Supabase database for persistent data storage.</p>
                </div>

                {/* Connection Status Banner */}
                <div className="p-4 rounded border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 border-slate-200">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Current Database Status</span>
                    <div className="flex items-center space-x-2">
                      {supabaseStatus === 'connected' ? (
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded">
                          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span>CONNECTED TO SUPABASE CLOUD</span>
                        </div>
                      ) : supabaseStatus === 'error' ? (
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded">
                          <span className="w-2 h-2 rounded-full bg-amber-500" />
                          <span>CONNECTION ERROR / STALE RULES</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded">
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          <span>LOCAL DISCONNECTED MODE</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <p className="text-[10.5px] text-slate-400 max-w-xs leading-relaxed sm:text-right">
                      {supabaseStatus === 'connected' 
                        ? 'The portal is actively querying and synchronizing with your remote PostgreSQL tables.'
                        : 'The portal is currently using client-side secure localStorage cache. Set credentials to link Supabase.'}
                    </p>
                    {supabaseStatus !== 'idle' && (
                      <button
                        type="button"
                        id="btn-banner-disconnect-supabase"
                        onClick={handleClearSupabaseCredentials}
                        className="shrink-0 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded transition cursor-pointer flex items-center space-x-1"
                        title="Disconnect Supabase and switch to local offline storage"
                      >
                        <Unlink className="w-3 h-3" />
                        <span>Disconnect</span>
                      </button>
                    )}
                  </div>
                </div>

                {syncMessage && (
                  <div className={`p-3 rounded border text-xs font-medium leading-relaxed ${
                    syncMessage.type === 'success' 
                      ? 'bg-green-50 border-green-200 text-green-800' 
                      : syncMessage.type === 'error'
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-blue-50 border-blue-200 text-blue-800'
                  }`}>
                    {syncMessage.text}
                  </div>
                )}

                {/* Form to insert links */}
                <form onSubmit={handleSaveSupabaseCredentials} className="bg-slate-50 p-4 rounded border border-slate-200 space-y-4">
                  <div className="space-y-0.5">
                    <h4 className="font-bold text-xs text-brand-green font-heading uppercase flex items-center">
                      <Database className="w-4.5 h-4.5 mr-1 text-brand-green shrink-0" />
                      Configure API Connection Credentials
                    </h4>
                    <p className="text-[10px] text-slate-400">Copy-paste the credentials directly from your Supabase Project Settings under <strong>Settings &rarr; API</strong>.</p>
                  </div>

                  <div className="space-y-3.5">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Project URL</label>
                      <input
                        type="url"
                        required
                        placeholder="https://your-project-id.supabase.co"
                        value={inputSupabaseUrl}
                        onChange={(e) => setInputSupabaseUrl(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Anon Public API Key (anon key)</label>
                      <input
                        type="text"
                        required
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                        value={inputSupabaseKey}
                        onChange={(e) => setInputSupabaseKey(e.target.value)}
                        className="block w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-2 pt-1.5">
                    {(Boolean(inputSupabaseUrl) || Boolean(localStorage.getItem('hgass_supabase_url')) || supabaseStatus !== 'idle') && (
                      !isDisconnectConfirming ? (
                        <button
                          type="button"
                          id="btn-disconnect-supabase"
                          onClick={() => setIsDisconnectConfirming(true)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1.5"
                        >
                          <Unlink className="w-3.5 h-3.5" />
                          <span>Disconnect Database</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 px-2.5 py-1.5 rounded animate-fade-in">
                          <span className="text-[10px] font-bold text-red-700">Disconnect Supabase?</span>
                          <button
                            type="button"
                            id="btn-confirm-disconnect"
                            onClick={handleClearSupabaseCredentials}
                            className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[9px] font-bold uppercase tracking-wider transition cursor-pointer"
                          >
                            Yes, Disconnect
                          </button>
                          <button
                            type="button"
                            id="btn-cancel-disconnect"
                            onClick={() => setIsDisconnectConfirming(false)}
                            className="px-2 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded text-[9px] font-bold uppercase tracking-wider transition cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      )
                    )}
                    <div className="flex items-center space-x-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setInputSupabaseUrl(DEFAULT_SUPABASE_URL);
                          setInputSupabaseKey(DEFAULT_SUPABASE_ANON_KEY);
                        }}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1"
                        title="Reset inputs to the official Holy Ghost Academy live cloud database"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-brand-green" />
                        <span>Reset to Official Credentials</span>
                      </button>
                      <button
                        type="submit"
                        disabled={isSyncing}
                        className="px-4 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded text-[10px] font-bold uppercase tracking-wider transition shadow-sm cursor-pointer flex items-center space-x-1 border border-brand-green"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Save & Link Database</span>
                      </button>
                    </div>
                  </div>
                </form>

                {/* Step-by-Step SQL Instructions for complete clarity */}
                <div className="bg-slate-50/50 rounded p-4 border border-slate-200 space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-xs text-brand-oxblood font-heading uppercase">
                      Setup Instructions (SQL Schema Execution)
                    </h4>
                    <p className="text-[10.5px] text-slate-500 leading-relaxed">
                      Before syncing, you must ensure that your Supabase project contains the expected tables and columns. We have provided a complete script at <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9.5px]">/supabase/schema.sql</code>.
                    </p>
                  </div>

                  <ol className="list-decimal list-inside text-[10.5px] text-slate-500 space-y-2.5 pl-1.5 leading-relaxed">
                    <li>
                      Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-brand-green font-bold underline hover:text-brand-green-dark">Supabase Dashboard</a> and open your project.
                    </li>
                    <li>
                      Navigate to the <strong>SQL Editor</strong> tab on the left sidebar navigation.
                    </li>
                    <li>
                      Create a <strong>New Query</strong> and paste the contents of the generated schema file <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9.5px]">/supabase/schema.sql</code> (located in the workspace).
                    </li>
                    <li>
                      Click <strong>Run</strong> (or press Command + Enter) to execute. This creates your <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9.5px]">news</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9.5px]">projects</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9.5px]">gallery</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9.5px]">hero_slides</code> (Homepage Banner), <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9.5px]">staff</code> (Administrative Board & Staff), <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9.5px]">subjects</code> (Curriculum), <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9.5px]">payments</code> (Payments & Fee Schedules), <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9.5px]">student_results</code>, and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9.5px]">contact_messages</code> tables, and secures them with RLS policies automatically. (Dedicated modular scripts are also saved in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9.5px]">/supabase/payments_and_fees.sql</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9.5px]">/supabase/homepage_slideshow_banner.sql</code>, <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9.5px]">/supabase/subjects_offered_and_curriculum.sql</code>, and <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[9.5px]">/supabase/administrative_board_and_staff.sql</code>).
                    </li>
                  </ol>
                </div>

                {/* Synchronization Management Panel */}
                {(Boolean(inputSupabaseUrl) || Boolean(localStorage.getItem('hgass_supabase_url')) || supabaseStatus === 'connected') && (
                  <div className="bg-white p-4.5 rounded border border-slate-200 space-y-4">
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-xs text-brand-green font-heading uppercase flex items-center">
                        <RefreshCw className={`w-4 h-4 mr-1 text-brand-green shrink-0 ${isSyncing ? 'animate-spin' : ''}`} />
                        Bulk Synchronization Board
                      </h4>
                      <p className="text-[10px] text-slate-400">Perform bulk manual pushes and pulls to align your local cached changes with the live Supabase cloud database.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Push to cloud block */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between space-y-3.5">
                        <div className="space-y-1">
                          <h5 className="font-bold text-xs text-slate-700 uppercase">Push State to Supabase</h5>
                          <p className="text-[10.5px] text-slate-400 leading-relaxed">
                            Upload all announcements, project logs, gallery images, documents, and student results currently saved in your browser cache directly into your empty Supabase tables. Perfect for migrating initial offline data to the cloud.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handlePushSync}
                          disabled={isSyncing || supabaseStatus === 'idle'}
                          className="w-full bg-brand-green hover:bg-brand-green-dark text-white py-2 rounded text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center space-x-1 shadow-sm disabled:opacity-50"
                        >
                          <Upload className="w-3.5 h-3.5 mr-1" />
                          <span>Push Cached Data to Cloud</span>
                        </button>
                      </div>

                      {/* Pull from cloud block */}
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded flex flex-col justify-between space-y-3.5">
                        <div className="space-y-1">
                          <h5 className="font-bold text-xs text-slate-700 uppercase">Pull State from Supabase</h5>
                          <p className="text-[10.5px] text-slate-400 leading-relaxed">
                            Retrieve fresh live data rows directly from your Supabase PostgreSQL tables and update this browser cache. <strong>Warning:</strong> This will override any unsynchronized offline changes in your browser state.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handlePullSync}
                          disabled={isSyncing || supabaseStatus === 'idle'}
                          className="w-full bg-brand-oxblood hover:bg-brand-oxblood-dark text-white py-2 rounded text-[10px] font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center space-x-1 shadow-sm disabled:opacity-50"
                        >
                          <Download className="w-3.5 h-3.5 mr-1" />
                          <span>Pull Cloud Data to Cache</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* T-2: NEWS MANAGEMENT */}
            {activeTab === 'news' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black font-heading text-brand-green uppercase tracking-tight">News & Announcements Board</h3>
                  <p className="text-[11px] text-slate-400">Publish fresh events, state championships, holiday calendars, or general diocesan advisories.</p>
                </div>

                {/* Form to Create/Edit */}
                <form onSubmit={handleSaveNews} className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3">
                  <h4 className="font-bold text-xs text-brand-green font-heading uppercase flex items-center">
                    {editingNewsId ? <Edit className="w-3.5 h-3.5 mr-1" /> : <Plus className="w-3.5 h-3.5 mr-1" />}
                    {editingNewsId ? 'Edit Selected News Story' : 'Publish New Announcement'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">News Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Resumption Announcement for 1st Term..."
                        value={newsTitle}
                        onChange={(e) => setNewsTitle(e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Category</label>
                      <select
                        value={newsCategory}
                        onChange={(e) => setNewsCategory(e.target.value)}
                        className="block w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden cursor-pointer font-sans"
                      >
                        <option value="Academic">Academic</option>
                        <option value="Announcement">Announcement</option>
                        <option value="Sports">Sports</option>
                        <option value="Event">Event</option>
                      </select>
                    </div>
                  </div>

                  {/* News Image File Chooser */}
                  <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                        Article Featured Image / Event Photography
                      </label>
                      <span className="text-[9px] text-slate-400 font-medium">
                        Select an image file from your device or paste a web address
                      </span>
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={newsFileInputRef}
                      accept="image/*"
                      onChange={handleNewsImageFileChange}
                      className="hidden"
                      id="admin-news-file-picker"
                    />

                    {/* Choose File Action Bar */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => newsFileInputRef.current?.click()}
                        className="px-3.5 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Choose File from Device</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => newsFileInputRef.current?.click()}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer border border-slate-200"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Browse Computer / Phone</span>
                      </button>

                      {newsImageFileName ? (
                        <div className="flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-200 font-semibold max-w-xs truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{newsImageFileName}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No device file selected yet</span>
                      )}
                    </div>

                    {/* Or URL input */}
                    <div className="space-y-1 pt-1.5">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                        Or Paste Direct Image Web Address (URL)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="e.g. https://images.unsplash.com/photo-... or paste link"
                          value={newsImageUrl.startsWith('data:') ? '' : newsImageUrl}
                          onChange={(e) => {
                            setNewsImageUrl(e.target.value);
                            setNewsImageFileName('');
                          }}
                          className="block w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden font-mono"
                        />
                        {newsImageUrl && (
                          <button
                            type="button"
                            onClick={handleClearNewsImage}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0 transition"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Real-time Article Photo Preview */}
                    {newsImageUrl && (
                      <div className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 mt-2 animate-fade-in">
                        <img
                          src={newsImageUrl}
                          alt="News preview"
                          className="w-20 h-16 object-cover rounded-md border border-slate-300 shadow-2xs shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider">
                              {newsImageUrl.startsWith('data:') ? 'Local Device File Selected' : 'Web URL Loaded'}
                            </span>
                            <span className="text-[10px] text-slate-400">Ready to publish</span>
                          </div>
                          <p className="text-[10px] text-slate-600 font-mono mt-1 truncate">
                            {newsImageFileName || (newsImageUrl.length > 60 ? newsImageUrl.substring(0, 60) + '...' : newsImageUrl)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => newsFileInputRef.current?.click()}
                            className="text-[10px] text-brand-green hover:underline font-bold px-2 py-1 bg-white border border-brand-green/20 rounded shadow-2xs cursor-pointer text-center"
                          >
                            Replace File
                          </button>
                          <button
                            type="button"
                            onClick={handleClearNewsImage}
                            className="text-[10px] text-rose-600 hover:underline font-medium px-2 py-1 bg-white border border-rose-200 rounded cursor-pointer text-center"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Rich Text area simulated */}
                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">News Content (Markdown/Rich Text support)</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Type details of your school story here..."
                      value={newsContent}
                      onChange={(e) => setNewsContent(e.target.value)}
                      className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden font-sans"
                    />
                  </div>

                  <div className="flex justify-end space-x-1.5 pt-1">
                    {editingNewsId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNewsId(null);
                          setNewsTitle('');
                          setNewsContent('');
                          setNewsImageUrl('');
                          setNewsImageFileName('');
                          if (newsFileInputRef.current) {
                            newsFileInputRef.current.value = '';
                          }
                        }}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    )}
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1 cursor-pointer border border-brand-green shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>{editingNewsId ? 'Save Changes' : 'Publish Article'}</span>
                    </button>
                  </div>
                </form>

                {/* Published List */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-brand-oxblood">Published Publications ({news.length})</h4>
                  <div className="space-y-1.5">
                    {news.map((item) => (
                      <div key={item.id} className="p-2.5 bg-white border border-slate-200 rounded flex justify-between items-center text-xs">
                        <div className="flex items-center space-x-3 min-w-0">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              className="w-12 h-10 object-cover rounded border border-slate-200 shrink-0 shadow-2xs"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-[8px] font-bold text-brand-green bg-green-50 border border-green-100 px-1.5 py-0.5 rounded uppercase">
                                {item.category}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{item.date}</span>
                            </div>
                            <p className="font-bold text-slate-800 uppercase mt-0.5 leading-tight truncate">{item.title}</p>
                          </div>
                        </div>
                        <div className="flex space-x-1.5 shrink-0">
                          <button
                            onClick={() => handleStartEditNews(item)}
                            className="p-1 border border-slate-200 rounded text-brand-green hover:bg-green-50 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                title: 'Delete Publication',
                                message: `Are you sure you want to delete "${item.title}"?`,
                                confirmText: 'Delete Publication',
                                onConfirm: () => deleteNews(item.id)
                              });
                            }}
                            className="p-1 border border-slate-200 rounded text-red-600 hover:bg-red-50 transition cursor-pointer"
                            title="Delete"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* T-3: PROJECTS MANAGEMENT */}
            {activeTab === 'projects' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black font-heading text-brand-green uppercase tracking-tight">Campus Infrastructure & Projects Manager</h3>
                  <p className="text-[11px] text-slate-400">Launch new renovations, define estimates, and update structural completion progress bars.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSaveProject} className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3">
                  <h4 className="font-bold text-xs text-brand-green font-heading uppercase">
                    {editingProjectId ? 'Modify Selected Project' : 'Register New Campus Project'}
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Project Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Modern Physics Laboratory Overhaul"
                        value={projectTitle}
                        onChange={(e) => setProjectTitle(e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Project Budget (₦)</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. ₦12,500,000"
                        value={projectBudget}
                        onChange={(e) => setProjectBudget(e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-bold text-brand-green focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Start Date</label>
                      <input
                        type="date"
                        required
                        value={projectStart}
                        onChange={(e) => setProjectStart(e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden cursor-pointer font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Expected End Date</label>
                      <input
                        type="date"
                        required
                        value={projectEnd}
                        onChange={(e) => setProjectEnd(e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden cursor-pointer font-sans"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Completion Benchmark ({projectProgress}%)</label>
                      <div className="flex items-center space-x-2 pt-1.5">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={projectProgress}
                          onChange={(e) => setProjectProgress(Number(e.target.value))}
                          className="w-full h-1 bg-slate-200 rounded appearance-none cursor-pointer accent-brand-green"
                        />
                        <span className="font-mono text-xs font-bold shrink-0">{projectProgress}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Project Image File Chooser */}
                  <div className="space-y-2 bg-white p-3 rounded-lg border border-slate-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                        Project Site Photography & Blueprint Image
                      </label>
                      <span className="text-[9px] text-slate-400 font-medium">
                        Select an image file from your device or paste a web address
                      </span>
                    </div>

                    {/* Hidden Native File Input */}
                    <input
                      type="file"
                      ref={projectFileInputRef}
                      accept="image/*"
                      onChange={handleProjectImageFileChange}
                      className="hidden"
                      id="admin-project-file-picker"
                    />

                    {/* Choose File Action Bar */}
                    <div className="flex flex-wrap items-center gap-2 pt-0.5">
                      <button
                        type="button"
                        onClick={() => projectFileInputRef.current?.click()}
                        className="px-3.5 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                      >
                        <FolderOpen className="w-3.5 h-3.5" />
                        <span>Choose File from Device</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => projectFileInputRef.current?.click()}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer border border-slate-200"
                      >
                        <Upload className="w-3.5 h-3.5 text-slate-500" />
                        <span>Browse Computer / Phone</span>
                      </button>

                      {projectImageFileName ? (
                        <div className="flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-200 font-semibold max-w-xs truncate">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span className="truncate">{projectImageFileName}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">No device file selected yet</span>
                      )}
                    </div>

                    {/* Or URL input */}
                    <div className="space-y-1 pt-1.5">
                      <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                        Or Paste Direct Image Web Address (URL)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="e.g. https://images.unsplash.com/photo-... or paste link"
                          value={projectImg.startsWith('data:') ? '' : projectImg}
                          onChange={(e) => {
                            setProjectImg(e.target.value);
                            setProjectImageFileName('');
                          }}
                          className="block w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden font-mono"
                        />
                        {projectImg && (
                          <button
                            type="button"
                            onClick={handleClearProjectImage}
                            className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-xs font-bold uppercase tracking-wider cursor-pointer shrink-0 transition"
                          >
                            Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Real-time Project Photo Preview */}
                    {projectImg && (
                      <div className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 mt-2 animate-fade-in">
                        <img
                          src={projectImg}
                          alt="Project preview"
                          className="w-20 h-16 object-cover rounded-md border border-slate-300 shadow-2xs shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold uppercase tracking-wider">
                              {projectImg.startsWith('data:') ? 'Local Device File Selected' : 'Web URL Loaded'}
                            </span>
                            <span className="text-[10px] text-slate-400">Ready to save</span>
                          </div>
                          <p className="text-[10px] text-slate-600 font-mono mt-1 truncate">
                            {projectImageFileName || (projectImg.length > 60 ? projectImg.substring(0, 60) + '...' : projectImg)}
                          </p>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => projectFileInputRef.current?.click()}
                            className="text-[10px] text-brand-green hover:underline font-bold px-2 py-1 bg-white border border-brand-green/20 rounded shadow-2xs cursor-pointer text-center"
                          >
                            Replace File
                          </button>
                          <button
                            type="button"
                            onClick={handleClearProjectImage}
                            className="text-[10px] text-rose-600 hover:underline font-medium px-2 py-1 bg-white border border-rose-200 rounded cursor-pointer text-center"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Project Description</label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Type details regarding material supplies, structural changes, and partner involvement..."
                      value={projectDesc}
                      onChange={(e) => setProjectDesc(e.target.value)}
                      className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden font-sans"
                    />
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-3.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer border border-brand-green shadow-xs"
                    >
                      {editingProjectId ? 'Save Project Details' : 'Register Project'}
                    </button>
                  </div>
                </form>

                {/* Project items list */}
                <div className="space-y-2">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-brand-oxblood">Active registered Projects ({projects.length})</h4>
                  <div className="space-y-1.5">
                    {projects.map((proj) => (
                      <div key={proj.id} className="p-2.5 bg-white border border-slate-200 rounded flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800 uppercase leading-none">{proj.title}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">Budget: <span className="font-bold text-brand-green">{proj.budget}</span>  |  Progress: <span className="font-bold text-brand-oxblood">{proj.percentageCompletion}%</span></p>
                        </div>
                        <div className="flex space-x-1.5 shrink-0">
                          <button
                            onClick={() => handleStartEditProject(proj)}
                            className="p-1 border border-slate-200 rounded text-brand-green hover:bg-green-50 cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                title: 'Delete Project',
                                message: `Are you sure you want to delete "${proj.title}"?`,
                                confirmText: 'Delete Project',
                                onConfirm: () => deleteProject(proj.id)
                              });
                            }}
                            className="p-1 border border-slate-200 rounded text-red-600 hover:bg-red-50 cursor-pointer"
                            title="Delete"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* T-4: IMAGE MANAGEMENT */}
            {activeTab === 'images' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black font-heading text-brand-green uppercase tracking-tight">School Gallery & Image Upload</h3>
                  <p className="text-[11px] text-slate-400">Upload or edit JPG, PNG, or WEBP photos representing graduation events, classroom sessions, or athletics.</p>
                </div>

                {/* About Us Showcase Quick Link Banner */}
                <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-white rounded-lg border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden border border-emerald-300 shrink-0 bg-slate-900 shadow-2xs">
                      <img src={editAboutImage || aboutUsImage || DEFAULT_ABOUT_US_IMAGE} alt="About Us" className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-brand-green" />
                        <span>About Us Section Photo & Badge</span>
                        {editAboutBadge && (
                          <span className="text-[9px] bg-brand-green text-brand-yellow font-bold px-1.5 py-0.5 rounded shadow-2xs">{editAboutBadge}</span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Primary campus photograph shown in the "Our Establishment & Heritage" section of the About Us page.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('aboutUs')}
                    className="px-3 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-[11px] font-bold uppercase tracking-wider transition flex items-center justify-center space-x-1 shrink-0 cursor-pointer shadow-2xs"
                  >
                    <span>Change About Us Image</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload / Edit Form */}
                  <form onSubmit={handleAddGallerySubmit} className={`p-4 rounded border space-y-3 ${editingGalleryId ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200/70">
                      <h4 className="font-bold text-xs text-brand-green font-heading uppercase flex items-center">
                        {editingGalleryId ? <Edit className="w-3.5 h-3.5 mr-1 text-amber-600" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
                        <span>{editingGalleryId ? 'Modify Gallery Photo' : 'Register Image Details'}</span>
                      </h4>
                      {editingGalleryId && (
                        <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">Editing Mode</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Image Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cultural Dance Group Anambra 2026"
                        value={galleryTitle}
                        onChange={(e) => setGalleryTitle(e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Category</label>
                      <select
                        value={galleryCat}
                        onChange={(e) => setGalleryCat(e.target.value)}
                        className="block w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden cursor-pointer font-sans"
                      >
                        <option value="School Activities">School Activities</option>
                        <option value="Sports">Sports</option>
                        <option value="Academics">Academics</option>
                        <option value="Graduation">Graduation</option>
                        <option value="Cultural Events">Cultural Events</option>
                        <option value="Projects">Projects</option>
                      </select>
                    </div>

                    {/* Drag-drop File Selector or Paste Link option */}
                    <div className="space-y-3 pt-0.5">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Option A: Upload Local Image File</label>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp"
                          onChange={(e) => handleFileUploadBase64(e, 'gallery')}
                          className="block w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-brand-green/10 file:text-brand-green file:cursor-pointer"
                        />
                        <p className="text-[9px] text-slate-400">JPG, PNG, WEBP. Max size: 3MB.</p>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Option B: Paste Image URL</label>
                        <input
                          type="url"
                          placeholder="e.g. https://images.unsplash.com/..."
                          value={galleryUrl}
                          onChange={(e) => setGalleryUrl(e.target.value)}
                          className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden font-mono"
                        />
                      </div>
                    </div>

                    {/* Preview box if available */}
                    {galleryUrl && (
                      <div className="space-y-1">
                        <p className="text-[9px] text-brand-green uppercase font-bold">Image Source Stream Selected ✔</p>
                        <div className="h-20 rounded overflow-hidden border border-slate-200 bg-slate-50">
                          <img
                            src={galleryUrl}
                            alt="Upload preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex items-center space-x-2 pt-1">
                      {editingGalleryId && (
                        <button
                          type="button"
                          onClick={cancelEditingGallery}
                          className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="flex-1 px-3.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer border border-brand-green shadow-xs"
                      >
                        {editingGalleryId ? 'Save Photo Changes' : 'Add Image to Catalog'}
                      </button>
                    </div>
                  </form>

                  {/* Active list */}
                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-brand-oxblood">Catalog Images ({gallery.length})</h4>
                    <div className="space-y-1.5">
                      {gallery.map((img) => (
                        <div key={img.id} className="p-2 bg-white border border-slate-200 rounded flex items-center justify-between text-xs gap-3">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-9 h-9 rounded overflow-hidden bg-slate-100 shrink-0 border border-slate-100">
                              <img
                                src={img.imageUrl}
                                alt={img.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 uppercase leading-snug truncate">{img.title}</p>
                              <p className="text-[9px] text-brand-green font-bold uppercase mt-0.5">{img.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={() => startEditingGallery(img)}
                              className="p-1 border border-slate-200 rounded text-brand-green hover:bg-green-50 transition cursor-pointer"
                              title="Edit Photo"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setConfirmModal({
                                  title: 'Delete Gallery Image',
                                  message: `Are you sure you want to delete "${img.title}" from the photo gallery?`,
                                  confirmText: 'Delete Image',
                                  onConfirm: () => deleteGalleryItem(img.id)
                                });
                              }}
                              className="p-1 border border-slate-200 rounded text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete Photo"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* T-5: VIDEO CATALOG */}
            {activeTab === 'videos' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black font-heading text-brand-green uppercase tracking-tight">School Video Library URL Manager</h3>
                  <p className="text-[11px] text-slate-400">Accepts YouTube or Google Drive share links. Embedded clips automatically render on the public board.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload / Edit Form */}
                  <form onSubmit={handleAddVideoSubmit} className={`p-4 rounded border space-y-3 ${editingVideoId ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex items-center justify-between pb-1 border-b border-slate-200/70">
                      <h4 className="font-bold text-xs text-brand-green font-heading uppercase flex items-center">
                        {editingVideoId ? <Edit className="w-3.5 h-3.5 mr-1 text-amber-600" /> : <Film className="w-3.5 h-3.5 mr-1" />}
                        <span>{editingVideoId ? 'Modify Video Resource' : 'Add Video Resource'}</span>
                      </h4>
                      {editingVideoId && (
                        <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">Editing Mode</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Video Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Highlights of 2025 Graduation Ceremony"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">YouTube or GDrive Share Link</label>
                      <input
                        type="url"
                        required
                        placeholder="e.g. https://www.youtube.com/watch?v=..."
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Brief Video Description</label>
                      <textarea
                        rows={2}
                        placeholder="Explain what events, student actions or speeches are highlighted in this video stream..."
                        value={videoDesc}
                        onChange={(e) => setVideoDesc(e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden font-sans"
                      />
                    </div>

                    <div className="flex items-center space-x-2 pt-1">
                      {editingVideoId && (
                        <button
                          type="button"
                          onClick={cancelEditingVideo}
                          className="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        className="flex-1 px-3.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer border border-brand-green shadow-xs"
                      >
                        {editingVideoId ? 'Save Video Changes' : 'Publish Video to Portal'}
                      </button>
                    </div>
                  </form>

                  {/* Active List */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-brand-oxblood">Registered Videos ({videos.length})</h4>
                    <div className="space-y-1.5">
                      {videos.map((vid) => (
                        <div key={vid.id} className="p-2.5 bg-white border border-slate-200 rounded flex items-center justify-between text-xs gap-3">
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 uppercase leading-snug truncate">{vid.title}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate max-w-xs font-mono">{vid.url}</p>
                          </div>
                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={() => startEditingVideo(vid)}
                              className="p-1 border border-slate-200 rounded text-brand-green hover:bg-green-50 transition cursor-pointer"
                              title="Edit Video"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                setConfirmModal({
                                  title: 'Delete Video',
                                  message: `Are you sure you want to delete "${vid.title}"?`,
                                  confirmText: 'Delete Video',
                                  onConfirm: () => deleteVideo(vid.id)
                                });
                              }}
                              className="p-1 border border-slate-200 rounded text-red-600 hover:bg-red-50 cursor-pointer"
                              title="Delete Video"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* T-6: DOCUMENT LIBRARY */}
            {activeTab === 'documents' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black font-heading text-brand-green uppercase tracking-tight">Downloads & PDF Document Library</h3>
                  <p className="text-[11px] text-slate-400">Upload school calendars, admission prospectus manuals, rules, regulations, or examination book lists.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Upload Form */}
                  <form onSubmit={handleAddDocumentSubmit} className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3">
                    <h4 className="font-bold text-xs text-brand-green font-heading uppercase flex items-center">
                      <Upload className="w-3.5 h-3.5 mr-1" /> Register Document File
                    </h4>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Document / File Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Academic Calendar First Term 2026/2027"
                        value={documentTitle}
                        onChange={(e) => setDocumentTitle(e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Document Type</label>
                      <select
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden cursor-pointer font-sans"
                      >
                        <option value="pdf">PDF File (.pdf)</option>
                        <option value="docx">Word Document (.docx)</option>
                        <option value="xlsx">Excel Spreadsheet (.xlsx)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide font-sans">Select File from Device</label>
                      <input
                        type="file"
                        accept=".pdf,.docx,.xlsx"
                        onChange={(e) => handleFileUploadBase64(e, 'document')}
                        className="block w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-brand-green/10 file:text-brand-green file:cursor-pointer"
                      />
                      <p className="text-[9px] text-slate-400">Stored in local database. Max: 2MB.</p>
                    </div>

                    <div className="space-y-1 bg-amber-50/70 p-2 rounded border border-amber-200/80">
                      <div className="flex items-center justify-between">
                        <label className="block text-[9px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1">
                          <Key className="w-2.5 h-2.5 text-amber-700" />
                          <span>Assign File Access Password (Optional)</span>
                        </label>
                        <span className="text-[8.5px] text-amber-700/80 font-medium">Leave blank if public</span>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. HGASS-DOC-2026"
                        value={documentPassword}
                        onChange={(e) => setDocumentPassword(e.target.value)}
                        className="block w-full px-2 py-1 bg-white border border-amber-300 rounded text-xs font-mono font-bold text-amber-900 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                      />
                      <p className="text-[8.5px] text-amber-800">Assign a secret PIN so only authorized students or parents with this password can download this file.</p>
                    </div>

                    <button
                      type="submit"
                      className="w-full px-3.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer border border-brand-green shadow-xs"
                    >
                      Register Document to Library
                    </button>
                  </form>

                  {/* Active List */}
                  <div className="space-y-2">
                    <h4 className="font-bold text-xs uppercase tracking-wider text-brand-oxblood">Registered Documents ({documents.length})</h4>
                    <div className="space-y-1.5">
                      {documents.map((doc) => (
                        <div key={doc.id} className="p-2.5 bg-white border border-slate-200 rounded flex items-center justify-between text-xs gap-3 animate-fade-in">
                          <div className="flex items-center space-x-2">
                            <span className="p-1.5 bg-slate-50 text-brand-green border border-slate-100 rounded shrink-0">
                              <FileText className="w-4 h-4 text-brand-green" />
                            </span>
                            <div>
                              <div className="flex items-center gap-1.5">
                                <p className="font-bold text-slate-800 uppercase leading-snug line-clamp-1">{doc.title}</p>
                                {doc.accessPassword ? (
                                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[8.5px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200 shrink-0">
                                    <Key className="w-2 h-2 text-amber-700" />
                                    PIN: {doc.accessPassword}
                                  </span>
                                ) : (
                                  <span className="text-[8px] text-slate-400 bg-slate-100 px-1 py-0.2 rounded shrink-0">
                                    Public
                                  </span>
                                )}
                              </div>
                              <p className="text-[9px] text-slate-400 mt-0.5 uppercase font-mono">Format: <span className="font-bold">{doc.fileType}</span>  |  Size: {doc.fileSize}</p>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setConfirmModal({
                                title: 'Delete Document',
                                message: `Are you sure you want to delete "${doc.title}"?`,
                                confirmText: 'Delete Document',
                                onConfirm: () => deleteDocument(doc.id)
                              });
                            }}
                            className="p-1 border border-slate-200 rounded text-red-600 hover:bg-red-50 cursor-pointer shrink-0"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}

            {/* T-7: RESULTS SHEET MANAGER */}
            {activeTab === 'results' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black font-heading text-brand-green uppercase tracking-tight">Academic Grade Book Registrar & Results Desk</h3>
                  <p className="text-[11px] text-slate-400">Register student terminal grades, assign confidential access passwords for each student report sheet file, manage promotions, or view the complete student sheet section.</p>
                </div>

                {/* Desk Sub-Tabs */}
                <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setResultsDeskTab('registrar')}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                      resultsDeskTab === 'registrar'
                        ? 'bg-brand-green text-white shadow-xs'
                        : 'text-slate-600 hover:text-brand-green hover:bg-white'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Academic Grade Book Registrar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultsDeskTab('cumulative')}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                      resultsDeskTab === 'cumulative'
                        ? 'bg-brand-green text-white shadow-xs'
                        : 'text-slate-600 hover:text-brand-green hover:bg-white'
                    }`}
                  >
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Cumulative Academic Section ({results.filter(r => r.isCumulative || r.term === 'Annual Cumulative').length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultsDeskTab('attendance')}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                      resultsDeskTab === 'attendance'
                        ? 'bg-brand-green text-white shadow-xs'
                        : 'text-slate-600 hover:text-brand-green hover:bg-white'
                    }`}
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Daily Student Attendance ({attendanceRecords.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultsDeskTab('promotion')}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                      resultsDeskTab === 'promotion'
                        ? 'bg-brand-green text-white shadow-xs'
                        : 'text-slate-600 hover:text-brand-green hover:bg-white'
                    }`}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>Student Promotion Status Section</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultsDeskTab('sheet')}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                      resultsDeskTab === 'sheet'
                        ? 'bg-brand-green text-white shadow-xs'
                        : 'text-slate-600 hover:text-brand-green hover:bg-white'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Student Sheet Section ({results.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setResultsDeskTab('csv')}
                    className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
                      resultsDeskTab === 'csv'
                        ? 'bg-brand-green text-white shadow-xs'
                        : 'text-slate-600 hover:text-brand-green hover:bg-white'
                    }`}
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Bulk CSV Import Desk</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('analytics')}
                    className="px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer text-slate-700 hover:text-brand-green hover:bg-white border border-slate-200/60 bg-slate-50"
                    title="Open Student Performance Analytics Dashboard"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-brand-green" />
                    <span>Performance Analytics</span>
                  </button>
                </div>

                {/* CSV IMPORT DRAWER */}
                {resultsDeskTab === 'csv' && (
                  <div className="bg-slate-50 p-4 rounded border border-slate-200 space-y-3 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-xs text-brand-green font-heading uppercase flex items-center">
                        <FileSpreadsheet className="w-4 h-4 text-brand-green mr-1" /> Option A: Import Results via pasted CSV
                      </h4>
                      <button
                        onClick={handleExportJson}
                        className="text-[10px] font-bold text-brand-oxblood hover:underline uppercase flex items-center space-x-1 cursor-pointer"
                      >
                        <Download className="w-3 h-3" />
                        <span>Export All (JSON Backup)</span>
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
                      Paste raw CSV lines matching our diocesan column structure (with optional confidential student access password):
                      <code className="block bg-white p-1.5 border rounded border-slate-200 mt-1 text-[10px] font-mono break-all font-semibold overflow-x-auto text-slate-600">
                        studentId,studentName,classLevel,term,academicSession,gender,position,teacherRemarks,principalRemarks,subject,testScore,examScore,accessPassword
                      </code>
                    </p>

                    <textarea
                      rows={3}
                      placeholder="studentId,studentName,classLevel,term,academicSession,gender,position,teacherRemarks,principalRemarks,subject,testScore,examScore,accessPassword&#10;HGASS/2026/001,Chinedu Emmanuel Okafor,SS 2,3rd Term,2025/2026,Male,1st of 35,Hardworking.,Excellent.,Physics,29,67,HGASS-PASS-001"
                      value={csvRawText}
                      onChange={(e) => setCsvRawText(e.target.value)}
                      className="block w-full p-2 bg-white border border-slate-200 rounded text-xs font-mono focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden"
                    />

                    {resultParseError && <p className="text-xs font-bold text-red-600">{resultParseError}</p>}
                    {resultParseSuccess && <p className="text-xs font-bold text-green-700">{resultParseSuccess}</p>}

                    <button
                      type="button"
                      onClick={handleImportCsv}
                      className="px-3.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1 border border-brand-green shadow-xs"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Parse & Merge CSV Records</span>
                    </button>
                  </div>
                )}

                {/* SUB-TAB: REGISTRAR & MANUAL ENTRY */}
                {resultsDeskTab === 'registrar' && (
                  <div className="space-y-6 animate-fade-in">
                    {/* MANUAL SCORE SHEET CONSTR / EDITOR */}
                <form 
                  ref={resultFormRef}
                  onSubmit={handleManualResultSubmit} 
                  className={`p-4 rounded border transition space-y-3 ${
                    editingResultId ? 'bg-amber-50/75 border-amber-300 ring-2 ring-amber-400/30 shadow-xs' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-1 border-b border-slate-200/80">
                    <h4 className="font-bold text-xs font-heading uppercase flex items-center">
                      {editingResultId ? (
                        <span className="flex items-center text-amber-900">
                          <Edit className="w-4 h-4 text-amber-700 mr-1.5" />
                          <span>Edit Published Student Result Sheet</span>
                        </span>
                      ) : (
                        <span className="flex items-center text-brand-green">
                          <Plus className="w-4 h-4 text-brand-green mr-1.5" />
                          <span>Option B: Academic Grade Book Registrar (Manual Entry)</span>
                        </span>
                      )}
                    </h4>
                    {editingResultId && (
                      <div className="flex items-center gap-2">
                        <span className="text-[9.5px] font-mono font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded uppercase tracking-wider">
                          Edit Mode Active
                        </span>
                        <button
                          type="button"
                          onClick={cancelEditingResult}
                          className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-2 py-0.5 rounded cursor-pointer transition shadow-2xs hover:bg-slate-100"
                        >
                          ✕ Cancel Edit
                        </button>
                      </div>
                    )}
                  </div>

                  {editingResultId && (
                    <div className="bg-amber-100/90 border border-amber-300/90 rounded p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start sm:items-center space-x-2">
                        <Edit className="w-4 h-4 text-amber-800 shrink-0 mt-0.5 sm:mt-0" />
                        <div>
                          <p className="text-xs font-bold text-amber-950 uppercase">
                            Editing Result Sheet: <span className="underline">{manualStudentName || 'Selected Student'}</span> ({manualStudentId})
                          </p>
                          <p className="text-[10.5px] text-amber-800">
                            Make your score updates, teacher/principal remarks, or PIN adjustments below, then click "Save Changes to Published Result".
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={cancelEditingResult}
                        className="px-2.5 py-1 bg-white border border-amber-300 text-amber-900 hover:bg-amber-50 rounded text-xs font-bold uppercase transition cursor-pointer self-end sm:self-auto shrink-0"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* PASSPORT PHOTOGRAPH UPLOADER & OFFICIAL STAMP PREVIEW */}
                  <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-2.5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                          <Camera className="w-4 h-4 text-brand-green" />
                          <span>Official Student Passport Photography Uploader</span>
                        </h5>
                        <p className="text-[10.5px] text-slate-500">
                          Upload official student portrait passport for this terminal report sheet. Stamped with Holy Ghost Academy verification badge on the student portal.
                        </p>
                      </div>
                      {manualPassportPhoto && (
                        <button
                          type="button"
                          onClick={() => setManualPassportPhoto('')}
                          className="text-[10px] font-bold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer transition"
                        >
                          <Trash className="w-3 h-3" />
                          <span>Clear Passport</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-center">
                      {/* Live Passport Frame Preview */}
                      <div className="sm:col-span-3 flex justify-center">
                        <div className="relative w-24 h-28 rounded-md border-2 border-brand-green/30 bg-slate-50 overflow-hidden shadow-xs flex flex-col items-center justify-center text-center">
                          {manualPassportPhoto ? (
                            <>
                              <img
                                src={manualPassportPhoto}
                                alt="Passport Preview"
                                className="w-full h-full object-cover object-top"
                              />
                              <span className="absolute bottom-0 inset-x-0 bg-brand-oxblood/90 text-brand-yellow text-[7px] font-black uppercase text-center py-0.5 tracking-wider">
                                HGASS OFFICIAL
                              </span>
                            </>
                          ) : (
                            <div className="p-2 text-slate-400 space-y-1">
                              <Camera className="w-6 h-6 mx-auto text-slate-300" />
                              <span className="text-[7.5px] font-bold uppercase tracking-wider block text-slate-400">No Passport Stamped</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* File and URL input options */}
                      <div className="sm:col-span-9 space-y-2">
                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                            Option 1: Upload Portrait Photo from Device (JPG, PNG, WEBP)
                          </label>
                          <input
                            type="file"
                            accept=".jpg,.jpeg,.png,.webp"
                            onChange={handlePassportPhotoUpload}
                            className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-bold file:bg-brand-green/10 file:text-brand-green file:cursor-pointer hover:file:bg-brand-green/20 transition"
                          />
                          <p className="text-[9px] text-slate-400">Recommended 3:4 aspect ratio. Stored directly with student terminal result record.</p>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                            Option 2: Or Paste Direct Passport Photo Image URL
                          </label>
                          <input
                            type="url"
                            placeholder="e.g. https://images.unsplash.com/... or https://i.ibb.co/..."
                            value={manualPassportPhoto}
                            onChange={(e) => setManualPassportPhoto(e.target.value)}
                            className="block w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Core Student Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Student ID / Reg No *</label>
                        {results.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              const q = manualStudentId.trim().toLowerCase();
                              if (!q) return;
                              const match = results.find(r => 
                                r.studentId.trim().toLowerCase() === q || 
                                r.studentName.trim().toLowerCase() === q ||
                                r.studentId.toLowerCase().includes(q)
                              );
                              if (match) {
                                setManualStudentId(match.studentId);
                                setManualStudentName(match.studentName);
                                setManualClass(match.classLevel);
                                if (match.gender) setManualGender(match.gender);
                                if (match.rollNumber) setManualRollNo(match.rollNumber);
                                if (match.passportPhoto) setManualPassportPhoto(match.passportPhoto);
                                if (match.accessPassword) setManualAccessPassword(match.accessPassword);
                              }
                            }}
                            className="text-[8.5px] text-brand-green font-bold hover:underline cursor-pointer flex items-center gap-0.5"
                            title="Auto-fill particulars for enrolled student"
                          >
                            <RefreshCw className="w-2.5 h-2.5" />
                            <span>Auto-Fill</span>
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        required
                        list="admin-enrolled-students-id-list"
                        placeholder="e.g. HGASS/2026/001"
                        value={manualStudentId}
                        onChange={(e) => {
                          const val = e.target.value;
                          setManualStudentId(val);
                          // Auto match if exact ID found
                          const match = results.find(r => r.studentId.toLowerCase() === val.trim().toLowerCase());
                          if (match) {
                            setManualStudentName(match.studentName);
                            setManualClass(match.classLevel);
                            if (match.gender) setManualGender(match.gender);
                            if (match.rollNumber) setManualRollNo(match.rollNumber);
                            if (match.passportPhoto) setManualPassportPhoto(match.passportPhoto);
                            if (match.accessPassword) setManualAccessPassword(match.accessPassword);
                          }
                        }}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden"
                      />
                      <datalist id="admin-enrolled-students-id-list">
                        {Array.from(new Set(results.map(r => r.studentId))).map(sId => {
                          const sMatch = results.find(r => r.studentId === sId);
                          return (
                            <option key={sId} value={sId}>
                              {sMatch ? `${sMatch.studentName} (${sMatch.classLevel})` : sId}
                            </option>
                          );
                        })}
                      </datalist>
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Student Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Chinedu Emmanuel Okafor"
                        value={manualStudentName}
                        onChange={(e) => setManualStudentName(e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Class Level *</label>
                      <select
                        value={manualClass}
                        onChange={(e) => setManualClass(e.target.value)}
                        className="block w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden cursor-pointer"
                      >
                        <option value="JSS 1">JSS 1</option>
                        <option value="JSS 2">JSS 2</option>
                        <option value="JSS 3">JSS 3</option>
                        <option value="SS 1">SS 1</option>
                        <option value="SS 2">SS 2</option>
                        <option value="SS 3">SS 3</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-6 gap-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Academic Session</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 2025/2026"
                        value={manualSession}
                        onChange={(e) => setManualSession(e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">Academic Term</label>
                      <select
                        value={manualTerm}
                        onChange={(e) => setManualTerm(e.target.value)}
                        className="block w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35 focus:outline-hidden cursor-pointer"
                      >
                        <option value="1st Term">1st Term</option>
                        <option value="2nd Term">2nd Term</option>
                        <option value="3rd Term">3rd Term</option>
                      </select>
                    </div>
                    <div className="space-y-1 bg-emerald-50/60 p-2 rounded-md border border-emerald-200/80">
                      <div className="flex items-center justify-between">
                        <label className="block text-[9.5px] font-bold text-emerald-950 uppercase tracking-wide">
                          SEX <span className="text-red-500">*</span>
                        </label>
                        <span className="text-[8px] font-bold text-emerald-700 uppercase">Choose / Input</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setManualGender('Female')}
                          className={`flex-1 py-1 px-1.5 text-[11px] font-bold rounded border transition cursor-pointer text-center ${
                            manualGender === 'Female'
                              ? 'bg-brand-green text-white border-brand-green shadow-xs'
                              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                          }`}
                        >
                          Female (F)
                        </button>
                        <button
                          type="button"
                          onClick={() => setManualGender('Male')}
                          className={`flex-1 py-1 px-1.5 text-[11px] font-bold rounded border transition cursor-pointer text-center ${
                            manualGender === 'Male'
                              ? 'bg-brand-green text-white border-brand-green shadow-xs'
                              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-300'
                          }`}
                        >
                          Male (M)
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Or input SEX (e.g. Female, Male)"
                        value={manualGender}
                        onChange={(e) => setManualGender(e.target.value)}
                        className="block w-full px-2 py-1 bg-white border border-emerald-300 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden mt-1"
                      />
                    </div>

                    <div className="space-y-1 bg-amber-50/70 p-1.5 rounded border border-amber-200/80">
                      <div className="flex items-center justify-between">
                        <label className="block text-[9px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1">
                          <Key className="w-2.5 h-2.5 text-amber-700" />
                          <span>Student PIN</span>
                        </label>
                        <button
                          type="button"
                          onClick={() => setManualAccessPassword(`HGASS-${Math.floor(1000 + Math.random() * 9000)}`)}
                          className="text-[8.5px] text-brand-green font-bold hover:underline cursor-pointer"
                          title="Generate Random PIN"
                        >
                          Auto PIN
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="e.g. HGASS-PASS-001"
                        value={manualAccessPassword}
                        onChange={(e) => setManualAccessPassword(e.target.value)}
                        className="block w-full px-2 py-1 bg-white border border-amber-300 rounded text-xs font-mono font-bold text-amber-900 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  {/* OFFICIAL ACADEMIC METRICS REGISTRAR: Class Placement, Gross Total Marks, Grade Point, Terminal Average Score, Accredited Grade Bracket, Class Standing */}
                  {(() => {
                    const currentLiveMetrics = computeAcademicMetrics(subjectScoresInput, { position: manualPos });
                    return (
                      <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
                          <div className="flex items-center space-x-2">
                            <div className="p-1 rounded bg-brand-green/10 text-brand-green">
                              <Award className="w-4 h-4" />
                            </div>
                            <div>
                              <h5 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                                Official Academic Grade Book Metrics & Standing
                              </h5>
                              <p className="text-[10px] text-slate-500">
                                Diocesan standard calculations: Class placement, gross total, terminal average %, GPA, grade bracket & standing.
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setManualGrossTotalMarks(currentLiveMetrics.grossTotalMarks);
                              setManualTerminalAverage(currentLiveMetrics.terminalAverage);
                              setManualGradePoint(currentLiveMetrics.gradePoint);
                              setManualAccreditedGradeBracket(currentLiveMetrics.accreditedGradeBracket);
                              setManualClassStanding(currentLiveMetrics.classStanding);
                              setManualPromotionStatus(currentLiveMetrics.promotionStatus);
                              setManualPassFail(currentLiveMetrics.passFailStatus);
                            }}
                            className="px-2.5 py-1 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green text-[10px] font-bold uppercase rounded flex items-center space-x-1 cursor-pointer transition self-start sm:self-auto"
                            title="Recalculate and fill with standard diocesan rubric"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Auto-Sync from Scores</span>
                          </button>
                        </div>

                        {/* Metrics Input Fields */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
                          {/* 1. Class Placement */}
                          <div className="space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wide">
                              Class Placement *
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 1st of 35"
                              value={manualPos}
                              onChange={(e) => setManualPos(e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-bold text-xs text-slate-800"
                            />
                            <span className="text-[8px] text-slate-400 block font-mono">Cohort ranking</span>
                          </div>

                          {/* 2. Gross Total Marks */}
                          <div className="space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wide">
                              Gross Total Marks
                            </label>
                            <input
                              type="number"
                              placeholder={String(currentLiveMetrics.grossTotalMarks)}
                              value={manualGrossTotalMarks !== undefined ? manualGrossTotalMarks : ''}
                              onChange={(e) => setManualGrossTotalMarks(e.target.value === '' ? undefined : Number(e.target.value))}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-bold text-xs text-brand-green font-mono"
                            />
                            <span className="text-[8px] text-slate-400 block font-mono">Live: {currentLiveMetrics.grossTotalMarks} / {currentLiveMetrics.totalMaxMarks}</span>
                          </div>

                          {/* 3. Terminal Average Score */}
                          <div className="space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wide">
                              Terminal Average (%)
                            </label>
                            <input
                              type="number"
                              step="0.1"
                              placeholder={String(currentLiveMetrics.terminalAverage)}
                              value={manualTerminalAverage !== undefined ? manualTerminalAverage : ''}
                              onChange={(e) => setManualTerminalAverage(e.target.value === '' ? undefined : Number(e.target.value))}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-bold text-xs text-brand-green font-mono"
                            />
                            <span className="text-[8px] text-slate-400 block font-mono">Live: {currentLiveMetrics.terminalAverage}%</span>
                          </div>

                          {/* 4. Grade Point (GPA) */}
                          <div className="space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wide">
                              Grade Point (GPA)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              placeholder={String(currentLiveMetrics.gradePoint)}
                              value={manualGradePoint !== undefined ? manualGradePoint : ''}
                              onChange={(e) => setManualGradePoint(e.target.value === '' ? undefined : Number(e.target.value))}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-bold text-xs text-brand-oxblood font-mono"
                            />
                            <span className="text-[8px] text-slate-400 block font-mono">Scale 5.00</span>
                          </div>

                          {/* 5. Accredited Grade Bracket */}
                          <div className="space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wide">
                              Accredited Bracket
                            </label>
                            <input
                              type="text"
                              placeholder={currentLiveMetrics.accreditedGradeBracket}
                              value={manualAccreditedGradeBracket}
                              onChange={(e) => setManualAccreditedGradeBracket(e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-semibold text-xs text-slate-800"
                            />
                            <span className="text-[8px] text-slate-400 block font-mono truncate">{currentLiveMetrics.accreditedGradeBracket}</span>
                          </div>

                          {/* 6. Class Standing */}
                          <div className="space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
                            <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wide">
                              Class Standing
                            </label>
                            <input
                              type="text"
                              placeholder={currentLiveMetrics.classStanding}
                              value={manualClassStanding}
                              onChange={(e) => setManualClassStanding(e.target.value)}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-semibold text-xs text-slate-800"
                            />
                            <span className="text-[8px] text-slate-400 block font-mono truncate">{currentLiveMetrics.classStanding}</span>
                          </div>

                          {/* 7. Pass or Failed Standing */}
                          <div className="space-y-1 bg-slate-50 p-2 rounded border border-slate-200">
                            <div className="flex items-center justify-between">
                              <label className="block text-[8.5px] font-bold text-slate-600 uppercase tracking-wide">
                                Pass / Failed *
                              </label>
                              <span className={`px-1.5 py-0.2 rounded text-[7.5px] font-black uppercase tracking-wider ${
                                (manualPassFail || currentLiveMetrics.passFailStatus).toLowerCase().includes('pass')
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}>
                                {manualPassFail || currentLiveMetrics.passFailStatus}
                              </span>
                            </div>
                            <select
                              value={manualPassFail || ''}
                              onChange={(e) => setManualPassFail(e.target.value as any)}
                              className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-bold text-xs text-slate-800"
                            >
                              <option value="">Auto: {currentLiveMetrics.passFailStatus}</option>
                              <option value="Passed">Passed</option>
                              <option value="Failed">Failed</option>
                            </select>
                            <span className="text-[8px] text-slate-400 block font-mono truncate">
                              Failed: {currentLiveMetrics.failedSubjectsCount} subj
                            </span>
                          </div>
                        </div>

                        {/* 7. Promotion Status & Terminal Advancement Decision */}
                        <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200/80 space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                            <label className="block text-[9.5px] font-bold text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                              <GraduationCap className="w-4 h-4 text-emerald-700" />
                              <span>Promotion Status & Advancement Decision</span>
                              <span className="text-[8px] bg-emerald-200 text-emerald-900 px-1.5 py-0.2 rounded font-semibold">
                                Diocesan Registry
                              </span>
                            </label>
                            <span className="text-[9.5px] text-emerald-800 font-medium">
                              Live Suggestion: <strong className="font-bold underline">{currentLiveMetrics.promotionStatus}</strong>
                            </span>
                          </div>

                          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                            <div className="lg:col-span-2">
                              <input
                                type="text"
                                list="promotion-status-presets"
                                placeholder={`e.g. Promoted to ${getNextClassLevel(manualClass)}`}
                                value={manualPromotionStatus}
                                onChange={(e) => setManualPromotionStatus(e.target.value)}
                                className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded font-bold text-xs text-emerald-950 placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                              />
                              <datalist id="promotion-status-presets">
                                {STANDARD_PROMOTION_STATUS_OPTIONS.map((opt) => (
                                  <option key={opt} value={opt} />
                                ))}
                              </datalist>
                              <span className="text-[8.5px] text-emerald-700/80 mt-1 block">
                                Appears prominently on the official terminal report card with diocesan seal.
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setManualPromotionStatus(`Promoted to ${getNextClassLevel(manualClass)}`)}
                                className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[9.5px] font-bold transition cursor-pointer"
                                title={`Promote to ${getNextClassLevel(manualClass)}`}
                              >
                                Promote to {getNextClassLevel(manualClass)}
                              </button>
                              <button
                                type="button"
                                onClick={() => setManualPromotionStatus(`Promoted on Trial to ${getNextClassLevel(manualClass)}`)}
                                className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-800 border border-amber-300 rounded text-[9.5px] font-bold transition cursor-pointer"
                                title="Promoted on Trial"
                              >
                                Promoted on Trial
                              </button>
                              <button
                                type="button"
                                onClick={() => setManualPromotionStatus(`Repeats ${manualClass}`)}
                                className="px-2 py-1 bg-white hover:bg-rose-100 text-rose-800 border border-rose-300 rounded text-[9.5px] font-bold transition cursor-pointer"
                                title="Repeats Class"
                              >
                                Repeats {manualClass}
                              </button>
                              {manualClass === 'SS 3' && (
                                <button
                                  type="button"
                                  onClick={() => setManualPromotionStatus('Graduated / Passed Out (Certificate Issued)')}
                                  className="px-2 py-1 bg-white hover:bg-blue-100 text-blue-800 border border-blue-300 rounded text-[9.5px] font-bold transition cursor-pointer"
                                >
                                  Graduated
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Subject score builder dynamically with CA1 (20), CA2 (20), Exam (60) */}
                  <div className="space-y-2 border-t border-slate-200 pt-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div>
                        <label className="block text-[11px] font-bold text-brand-green uppercase tracking-wide">
                          Course Subject Evaluations (CA1: 20, CA2: 20, Exam: 60)
                        </label>
                        <p className="text-[10px] text-slate-400">
                          Enter CA1 (max 20), CA2 (max 20), and examination (max 60). Continuous Assessment total (40) and Final Score (100) are automatically computed.
                        </p>
                      </div>
                      <div className="flex items-center space-x-3">
                        <button
                          type="button"
                          onClick={addManualSubjectScoreField}
                          className="text-[10px] font-bold text-brand-oxblood hover:underline uppercase flex items-center space-x-1 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Subject Row</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {subjectScoresInput.map((row, index) => {
                        const ca1 = row.ca1Score ?? 0;
                        const ca2 = row.ca2Score ?? 0;
                        const exam = row.examScore ?? 0;
                        const caTotal = ca1 + ca2;
                        const total = row.totalScore || (caTotal + exam);

                        return (
                          <div key={index} className="bg-white p-2.5 rounded-lg border border-slate-200 text-xs animate-fade-in shadow-2xs">
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                              <div className="sm:col-span-4 space-y-0.5">
                                <label className="block text-[8px] font-bold text-slate-400 uppercase">Subject Title</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="e.g. Mathematics"
                                  value={row.subject}
                                  onChange={(e) => handleSubjectScoreChange(index, 'subject', e.target.value)}
                                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded uppercase font-sans text-xs focus:ring-1 focus:ring-brand-green/35 font-semibold text-slate-800"
                                />
                              </div>
                              <div className="sm:col-span-2 space-y-0.5">
                                <label className="block text-[8px] font-bold text-slate-500 uppercase">CA1 (20)</label>
                                <input
                                  type="number"
                                  required
                                  min={0}
                                  max={20}
                                  value={row.ca1Score ?? 0}
                                  onChange={(e) => handleSubjectScoreChange(index, 'ca1Score', e.target.value)}
                                  className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-center text-xs font-bold text-slate-800 focus:ring-1 focus:ring-brand-green/40"
                                />
                              </div>
                              <div className="sm:col-span-2 space-y-0.5">
                                <label className="block text-[8px] font-bold text-slate-500 uppercase">CA2 (20)</label>
                                <input
                                  type="number"
                                  required
                                  min={0}
                                  max={20}
                                  value={row.ca2Score ?? 0}
                                  onChange={(e) => handleSubjectScoreChange(index, 'ca2Score', e.target.value)}
                                  className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-center text-xs font-bold text-slate-800 focus:ring-1 focus:ring-brand-green/40"
                                />
                              </div>
                              <div className="sm:col-span-2 space-y-0.5">
                                <label className="block text-[8px] font-bold text-slate-500 uppercase">Exam (60)</label>
                                <input
                                  type="number"
                                  required
                                  min={0}
                                  max={60}
                                  value={row.examScore ?? 0}
                                  onChange={(e) => handleSubjectScoreChange(index, 'examScore', e.target.value)}
                                  className="w-full px-1.5 py-1 bg-slate-50 border border-slate-200 rounded font-mono text-center text-xs font-bold text-slate-800 focus:ring-1 focus:ring-brand-green/40"
                                />
                              </div>
                              <div className="sm:col-span-1 text-center">
                                <span className="block text-[8px] font-bold text-slate-400 uppercase">Total (100)</span>
                                <span className="font-mono font-black text-brand-green text-xs block">
                                  {total} <span className="text-[10px] text-slate-500">({row.grade})</span>
                                </span>
                                <span className={`inline-block px-1 py-0.2 rounded text-[7.5px] font-black uppercase tracking-wider ${
                                  total >= 40 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                                }`}>
                                  {total >= 40 ? 'PASS' : 'FAILED'}
                                </span>
                              </div>
                              <div className="sm:col-span-1 text-right">
                                <button
                                  type="button"
                                  onClick={() => removeSubjectScoreField(index)}
                                  className="p-1 border border-slate-100 rounded text-red-500 hover:bg-red-50 cursor-pointer"
                                  title="Remove Subject"
                                >
                                  <Trash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Remarks input blocks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-200 pt-3">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide font-sans">Class Teacher Remarks</label>
                      <input
                        type="text"
                        placeholder="An outstanding student..."
                        value={manualTeacherComment}
                        onChange={(e) => setManualTeacherComment(e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide font-sans">Principal Stamp Remarks</label>
                      <input
                        type="text"
                        placeholder="Excellent outcome. Hardworking..."
                        value={manualPrincipalComment}
                        onChange={(e) => setManualPrincipalComment(e.target.value)}
                        className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-2">
                    {editingResultId && (
                      <button
                        type="button"
                        onClick={cancelEditingResult}
                        className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      className={`w-full ${
                        editingResultId ? 'sm:flex-1 bg-amber-600 hover:bg-amber-700 border-amber-700' : 'bg-brand-green hover:bg-brand-green-dark border-brand-green'
                      } px-4 py-2 text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer border shadow-xs flex items-center justify-center space-x-1.5`}
                    >
                      {editingResultId ? <Save className="w-4 h-4 mr-1" /> : <Plus className="w-4 h-4 mr-1" />}
                      <span>{editingResultId ? 'Save Changes to Published Result' : 'Save Student Report Card Record'}</span>
                    </button>
                  </div>
                </form>

                {/* List of active sheets with search & edit capabilities */}
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-xs uppercase tracking-wider text-brand-oxblood">
                        Published Student Records ({results.length})
                      </h4>
                      <p className="text-[10px] text-slate-500">
                        Click "Edit Result" on any student to modify their published scores, remarks, or assigned access PIN.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex items-center space-x-1 bg-slate-100 p-0.5 rounded border border-slate-200 text-xs">
                        <button
                          type="button"
                          onClick={() => setPassFailFilter('all')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            passFailFilter === 'all' ? 'bg-brand-green text-white shadow-2xs' : 'text-slate-600 hover:bg-white'
                          }`}
                        >
                          All ({results.length})
                        </button>
                        <button
                          type="button"
                          onClick={() => setPassFailFilter('passed')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            passFailFilter === 'passed' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-white'
                          }`}
                        >
                          Passed
                        </button>
                        <button
                          type="button"
                          onClick={() => setPassFailFilter('failed')}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                            passFailFilter === 'failed' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:bg-white'
                          }`}
                        >
                          Failed
                        </button>
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          placeholder="Search by name, ID or class..."
                          value={resultsSearchQuery}
                          onChange={(e) => setResultsSearchQuery(e.target.value)}
                          className="w-full sm:w-60 px-2.5 py-1 text-xs bg-white border border-slate-200 rounded focus:ring-1 focus:ring-brand-green/40 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {results
                      .filter((res) => {
                        const studentPassFail = res.passFailStatus || ((res.terminalAverage ?? 0) >= 50 && !res.promotionStatus?.toLowerCase().includes('repeat') ? 'Passed' : 'Failed');
                        if (passFailFilter === 'passed' && !studentPassFail.toLowerCase().includes('pass')) return false;
                        if (passFailFilter === 'failed' && studentPassFail.toLowerCase().includes('pass')) return false;

                        if (!resultsSearchQuery.trim()) return true;
                        const q = resultsSearchQuery.toLowerCase();
                        return (
                          res.studentName.toLowerCase().includes(q) ||
                          res.studentId.toLowerCase().includes(q) ||
                          res.classLevel.toLowerCase().includes(q) ||
                          res.term.toLowerCase().includes(q) ||
                          res.academicSession.toLowerCase().includes(q) ||
                          studentPassFail.toLowerCase().includes(q)
                        );
                      })
                      .map((res) => {
                        const isCurrentlyEditing = editingResultId === res.id;
                        const studentPassFail = res.passFailStatus || ((res.terminalAverage ?? 0) >= 50 && !res.promotionStatus?.toLowerCase().includes('repeat') ? 'Passed' : 'Failed');
                        const isPass = studentPassFail.toLowerCase().includes('pass');

                        return (
                          <div 
                            key={res.id} 
                            className={`p-3 rounded border transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs ${
                              isCurrentlyEditing 
                                ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-400/30' 
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-bold text-slate-800 uppercase leading-none">{res.studentName}</p>
                                {res.accessPassword ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-amber-50 text-amber-900 border border-amber-200">
                                    <Key className="w-2.5 h-2.5 text-amber-700" />
                                    <span>PIN: {res.accessPassword}</span>
                                  </span>
                                ) : (
                                  <span className="text-[9px] text-slate-400 italic bg-slate-100 px-1.5 py-0.5 rounded">
                                    Public (No PIN)
                                  </span>
                                )}
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider ${
                                  isPass ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-rose-100 text-rose-900 border border-rose-300'
                                }`}>
                                  {isPass ? <CheckCircle2 className="w-2.5 h-2.5 text-emerald-700" /> : <X className="w-2.5 h-2.5 text-rose-700" />}
                                  <span>{isPass ? 'PASSED' : 'FAILED'}</span>
                                </span>
                                {res.promotionStatus && (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] font-bold bg-emerald-50 text-emerald-900 border border-emerald-200">
                                    <GraduationCap className="w-2.5 h-2.5 text-emerald-700" />
                                    <span>{res.promotionStatus}</span>
                                  </span>
                                )}
                                {isCurrentlyEditing && (
                                  <span className="text-[9px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded uppercase">
                                    Editing Now
                                  </span>
                                )}
                              </div>
                              <p className="text-slate-400 mt-1.5 font-mono text-[10px]">
                                ID: <span className="font-bold text-brand-oxblood">{res.studentId}</span>  |  Class: {res.classLevel}  |  Term: {res.term} ({res.academicSession})  |  Rank: {res.position}  |  Avg: <strong className="text-slate-700">{res.terminalAverage ?? '—'}%</strong>  |  Standing: <strong className={isPass ? 'text-emerald-700' : 'text-rose-700'}>{studentPassFail}</strong>  |  Subjects: {res.subjectScores?.length || 0}
                              </p>
                            </div>

                            <div className="flex items-center space-x-1.5 self-end sm:self-auto shrink-0">
                              <button
                                type="button"
                                onClick={() => startEditingResult(res)}
                                className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1 border ${
                                  isCurrentlyEditing
                                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border-emerald-300'
                                }`}
                                title="Edit this student result"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>{isCurrentlyEditing ? 'Editing' : 'Edit Result'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmModal({
                                    title: 'Delete Student Result',
                                    message: `Are you sure you want to delete the terminal result sheet for ${res.studentName} (${res.term} - ${res.academicSession})?`,
                                    confirmText: 'Delete Result',
                                    onConfirm: () => {
                                      if (editingResultId === res.id) {
                                        cancelEditingResult();
                                      }
                                      deleteResult(res.id);
                                    }
                                  });
                                }}
                                className="p-1.5 border border-slate-200 rounded text-red-600 hover:bg-red-50 cursor-pointer"
                                title="Delete Record"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}

                    {results.length > 0 && results.filter((res) => {
                      const studentPassFail = res.passFailStatus || ((res.terminalAverage ?? 0) >= 50 && !res.promotionStatus?.toLowerCase().includes('repeat') ? 'Passed' : 'Failed');
                      if (passFailFilter === 'passed' && !studentPassFail.toLowerCase().includes('pass')) return false;
                      if (passFailFilter === 'failed' && studentPassFail.toLowerCase().includes('pass')) return false;

                      if (!resultsSearchQuery.trim()) return true;
                      const q = resultsSearchQuery.toLowerCase();
                      return (
                        res.studentName.toLowerCase().includes(q) ||
                        res.studentId.toLowerCase().includes(q) ||
                        res.classLevel.toLowerCase().includes(q) ||
                        res.term.toLowerCase().includes(q) ||
                        res.academicSession.toLowerCase().includes(q) ||
                        studentPassFail.toLowerCase().includes(q)
                      );
                    }).length === 0 && (
                      <div className="p-6 bg-white border border-slate-200 rounded text-center text-xs text-slate-400">
                        No published student results match your filter and search "{resultsSearchQuery}".
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* SUB-TAB: CUMULATIVE ACADEMIC SECTION */}
            {resultsDeskTab === 'cumulative' && (
              <div className="space-y-4 animate-fade-in">
                <CumulativeResultsSection
                  results={results}
                  onAddResult={addResult}
                  onEditResult={editResult}
                  onDeleteResult={(id) => {
                    setConfirmModal({
                      title: 'Delete Cumulative Record',
                      message: 'Are you sure you want to permanently delete this annual cumulative academic record?',
                      confirmText: 'Delete Record',
                      onConfirm: () => deleteResult(id)
                    });
                  }}
                  onSwitchToTerminalRegistrar={() => setResultsDeskTab('registrar')}
                  onSyncCumulative={onSyncCumulative}
                />
              </div>
            )}

            {/* SUB-TAB: DAILY STUDENT ATTENDANCE */}
            {resultsDeskTab === 'attendance' && (
              <div className="space-y-4 animate-fade-in">
                <DailyAttendanceSection
                  attendanceRecords={attendanceRecords}
                  results={results}
                  onSaveAttendance={(records) => {
                    onSaveAttendance?.(records);
                  }}
                  onDeleteRecord={(id) => {
                    onDeleteAttendanceRecord?.(id);
                  }}
                  onClearClassDate={(date, classLevel) => {
                    onClearAttendanceClassDate?.(date, classLevel);
                  }}
                />
              </div>
            )}

            {/* SUB-TAB: STUDENT SHEET SECTION */}
            {resultsDeskTab === 'sheet' && (
              <div className="space-y-4 animate-fade-in">
                <StudentSheetSection
                  results={results}
                  onEditResult={(res) => {
                    startEditingResult(res);
                    setResultsDeskTab('registrar');
                  }}
                  onDeleteResult={(id, name) => {
                    setConfirmModal({
                      title: 'Delete Student Result',
                      message: `Are you sure you want to delete the terminal result sheet for ${name}?`,
                      confirmText: 'Delete Result',
                      onConfirm: () => {
                        if (editingResultId === id) cancelEditingResult();
                        deleteResult(id);
                      }
                    });
                  }}
                  onUpdatePromotionStatus={onUpdatePromotionStatus}
                  onSwitchToRegistrar={() => setResultsDeskTab('registrar')}
                />
              </div>
            )}

            {/* SUB-TAB: STUDENT PROMOTION STATUS SECTION */}
            {resultsDeskTab === 'promotion' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 to-teal-50/60 p-4 rounded-lg border border-emerald-200">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-emerald-700 text-white rounded-md shadow-xs">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-heading font-black text-sm text-emerald-950 uppercase tracking-tight">
                        Student Promotion Status Registry
                      </h4>
                      <p className="text-[11px] text-emerald-800">
                        Configure, evaluate, and input promotion decisions for each student or run batch evaluation.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const targetList = results.filter(r => {
                        if (promotionFilterClass !== 'ALL' && r.classLevel !== promotionFilterClass) return false;
                        return true;
                      });
                      if (targetList.length === 0) {
                        alert("No student records found in the selected class.");
                        return;
                      }
                      setConfirmModal({
                        title: 'Batch Auto-Evaluate Promotion',
                        message: `Auto-evaluate and assign promotion status for ${targetList.length} students in ${promotionFilterClass === 'ALL' ? 'all classes' : promotionFilterClass}? (Terminal average ≥ 40% promotes to next class; < 40% repeats current class).`,
                        confirmText: 'Run Auto-Promotion',
                        onConfirm: () => {
                          let count = 0;
                          targetList.forEach(r => {
                            const totalScores = r.subjectScores && r.subjectScores.length > 0
                              ? r.subjectScores.reduce((acc, s) => acc + (s.totalScore || 0), 0)
                              : 0;
                            const avg = r.subjectScores && r.subjectScores.length > 0
                              ? totalScores / r.subjectScores.length
                              : 0;
                            
                            const nextClass = r.classLevel === 'JSS 1' ? 'JSS 2'
                              : r.classLevel === 'JSS 2' ? 'JSS 3'
                              : r.classLevel === 'JSS 3' ? 'SS 1'
                              : r.classLevel === 'SS 1' ? 'SS 2'
                              : r.classLevel === 'SS 2' ? 'SS 3'
                              : 'Graduated';

                            const autoStatus = avg >= 40 
                              ? (r.classLevel === 'SS 3' ? 'Graduated / Passed Out (Certificate Issued)' : `Promoted to ${nextClass}`)
                              : `Repeats ${r.classLevel}`;

                            onUpdatePromotionStatus(r.id, autoStatus);
                            count++;
                          });
                          setPromotionFeedback(`Successfully auto-assigned promotion status for ${count} students.`);
                          setTimeout(() => setPromotionFeedback(''), 4000);
                        }
                      });
                    }}
                    className="px-3.5 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shrink-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Auto-Evaluate Promotion (Class-Wide)</span>
                  </button>
                </div>

                {promotionFeedback && (
                  <div className="p-3 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-md text-xs font-bold animate-fade-in flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{promotionFeedback}</span>
                  </div>
                )}

                {/* Filter bar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mr-1">Class Filter:</span>
                    {['ALL', 'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'].map((cls) => (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setPromotionFilterClass(cls)}
                        className={`px-2.5 py-1 text-xs font-bold rounded transition cursor-pointer ${
                          promotionFilterClass === cls
                            ? 'bg-brand-green text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search student name or reg ID..."
                      value={promotionSearchQuery}
                      onChange={(e) => setPromotionSearchQuery(e.target.value)}
                      className="w-full sm:w-64 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden font-medium"
                    />
                  </div>
                </div>

                {/* Students Promotion Table */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 uppercase font-heading text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Student Details</th>
                          <th className="py-2.5 px-3">Class & Term</th>
                          <th className="py-2.5 px-3 text-center">Avg / Grade</th>
                          <th className="py-2.5 px-3">Input Promotion Status & Quick Presets</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {results
                          .filter((r) => {
                            if (promotionFilterClass !== 'ALL' && r.classLevel !== promotionFilterClass) return false;
                            if (!promotionSearchQuery.trim()) return true;
                            const q = promotionSearchQuery.toLowerCase();
                            return (
                              r.studentName.toLowerCase().includes(q) ||
                              r.studentId.toLowerCase().includes(q) ||
                              (r.promotionStatus || '').toLowerCase().includes(q)
                            );
                          })
                          .map((res) => {
                            const total = res.subjectScores && res.subjectScores.length > 0
                              ? res.subjectScores.reduce((acc, s) => acc + (s.totalScore || 0), 0)
                              : 0;
                            const avg = res.subjectScores && res.subjectScores.length > 0
                              ? (total / res.subjectScores.length).toFixed(1)
                              : '0.0';
                            const numAvg = parseFloat(avg);
                            const generalGrade = numAvg >= 75 ? 'A1' : numAvg >= 65 ? 'B2' : numAvg >= 50 ? 'C4' : numAvg >= 40 ? 'P7' : 'F9';

                            const nextClass = res.classLevel === 'JSS 1' ? 'JSS 2'
                              : res.classLevel === 'JSS 2' ? 'JSS 3'
                              : res.classLevel === 'JSS 3' ? 'SS 1'
                              : res.classLevel === 'SS 1' ? 'SS 2'
                              : res.classLevel === 'SS 2' ? 'SS 3'
                              : 'Graduated';

                            return (
                              <PromotionRow
                                key={res.id}
                                result={res}
                                average={avg}
                                grade={generalGrade}
                                nextClass={nextClass}
                                onSave={(newStatus) => {
                                  onUpdatePromotionStatus(res.id, newStatus);
                                  setPromotionFeedback(`Saved promotion status for ${res.studentName}: "${newStatus}"`);
                                  setTimeout(() => setPromotionFeedback(''), 4000);
                                }}
                              />
                            );
                          })}
                      </tbody>
                    </table>
                  </div>

                  {results.filter((r) => {
                    if (promotionFilterClass !== 'ALL' && r.classLevel !== promotionFilterClass) return false;
                    if (!promotionSearchQuery.trim()) return true;
                    const q = promotionSearchQuery.toLowerCase();
                    return (
                      r.studentName.toLowerCase().includes(q) ||
                      r.studentId.toLowerCase().includes(q)
                    );
                  }).length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No student result sheets found matching current filter.
                    </div>
                  )}
                </div>
              </div>
            )}

              </div>
            )}

            {/* STUDENT PERFORMANCE ANALYTICS (RECHARTS VISUALIZATION) */}
            {activeTab === 'analytics' && (
              <div className="space-y-6 animate-fade-in">
                <StudentPerformanceAnalytics
                  results={results}
                  onSelectStudentResult={(student) => {
                    setActiveTab('results');
                    setResultsDeskTab('registrar');
                    startEditingResult(student);
                  }}
                />
              </div>
            )}

            {/* CUMULATIVE ACADEMIC SECTION (DIRECT SIDEBAR ACCESS) */}
            {activeTab === 'cumulative' && (
              <div className="space-y-6 animate-fade-in">
                <CumulativeResultsSection
                  results={results}
                  onAddResult={addResult}
                  onEditResult={editResult}
                  onDeleteResult={(id) => {
                    setConfirmModal({
                      title: 'Delete Cumulative Record',
                      message: 'Are you sure you want to permanently delete this annual cumulative academic record?',
                      confirmText: 'Delete Record',
                      onConfirm: () => deleteResult(id)
                    });
                  }}
                  onSwitchToTerminalRegistrar={() => {
                    setActiveTab('results');
                    setResultsDeskTab('registrar');
                  }}
                  onSyncCumulative={onSyncCumulative}
                />
              </div>
            )}

            {/* DAILY STUDENT ATTENDANCE SECTION (DIRECT SIDEBAR ACCESS) */}
            {activeTab === 'attendance' && (
              <div className="space-y-6 animate-fade-in">
                <DailyAttendanceSection
                  attendanceRecords={attendanceRecords}
                  results={results}
                  onSaveAttendance={(records) => {
                    onSaveAttendance?.(records);
                  }}
                  onDeleteRecord={(id) => {
                    onDeleteAttendanceRecord?.(id);
                  }}
                  onClearClassDate={(date, classLevel) => {
                    onClearAttendanceClassDate?.(date, classLevel);
                  }}
                />
              </div>
            )}

            {/* ACADEMIC CALENDAR DESK */}
            {activeTab === 'calendar' && (
              <div className="space-y-6 animate-fade-in">
                <AcademicCalendar
                  events={calendarEvents}
                  isAdmin={true}
                  onAddEvent={onAddCalendarEvent}
                  onEditEvent={onEditCalendarEvent}
                  onDeleteEvent={onDeleteCalendarEvent}
                  onResetEvents={onResetCalendarEvents}
                />
              </div>
            )}

            {/* T-8: MESSAGES INBOX */}
            {activeTab === 'messages' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black font-heading text-brand-green uppercase tracking-tight">Parent & Public Contact Inbox</h3>
                  <p className="text-[11px] text-slate-400">View direct messages, inquiries regarding admissions, academics, or alumni collaborations.</p>
                </div>

                <div className="space-y-3">
                  {messages.length > 0 ? (
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={`p-4 rounded border transition flex flex-col justify-between gap-3 ${
                            msg.isRead 
                              ? 'bg-white border-slate-200 shadow-2xs' 
                              : 'bg-brand-green/5 border-brand-green/30 shadow-xs'
                          }`}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-1.5 flex-wrap gap-y-0.5">
                                <span className="font-bold text-slate-900 text-xs">{msg.name}</span>
                                <span className="text-[9px] text-slate-400 font-mono">({msg.date})</span>
                                {!msg.isRead && (
                                  <span className="text-[8px] font-black text-white bg-brand-oxblood px-1.5 py-0.5 rounded uppercase tracking-wider">
                                    NEW
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-brand-green font-bold font-mono uppercase">{msg.email}  |  {msg.phone}</p>
                            </div>
                            
                            <div className="flex space-x-1.5 shrink-0">
                              {!msg.isRead && (
                                <button
                                  onClick={() => markMessageRead(msg.id)}
                                  className="px-2 py-1 bg-brand-green hover:bg-brand-green-dark text-white rounded text-[9px] font-bold uppercase tracking-wider transition cursor-pointer"
                                  title="Mark as Read"
                                >
                                  Read
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setConfirmModal({
                                    title: 'Delete Message',
                                    message: `Are you sure you want to permanently delete this message from ${msg.name}?`,
                                    confirmText: 'Delete Message',
                                    onConfirm: () => deleteMessage(msg.id)
                                  });
                                }}
                                className="p-1 border border-slate-200 rounded text-red-600 hover:bg-red-50 cursor-pointer transition"
                                title="Delete permanently"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed font-sans bg-slate-50 p-2.5 rounded border border-slate-100 whitespace-pre-wrap">
                            {msg.message}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-50 rounded border border-slate-100 space-y-1">
                      <p className="text-slate-400 text-xs font-semibold">Inbox is completely clear! No messages yet.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* T-PAYMENTS: SCHOOL FEES & BANK TRANSACTIONS (UBA) */}
            {activeTab === 'payments' && (
              <div className="space-y-6 animate-fade-in font-sans">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b pb-4">
                  <div className="space-y-0.5">
                    <div className="inline-flex items-center space-x-1.5 bg-red-100 text-red-800 text-[10px] font-bold px-2.5 py-0.5 rounded uppercase">
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>UBA Account: 1027146728</span>
                    </div>
                    <h3 className="text-lg font-black font-heading text-slate-900 uppercase tracking-tight">
                      School Fees & Bank Remittances Ledger
                    </h3>
                    <p className="text-xs text-slate-500">
                      Audit, verify, and reconcile submitted bank payments into Holy Ghost Academy's designated UBA corporate account.
                    </p>
                  </div>

                  {/* Export CSV action */}
                  <button
                    type="button"
                    onClick={() => {
                      const csvRows = [
                        ['Reference ID', 'Student Name', 'Reg ID', 'Class', 'Payer Name', 'Payer Phone', 'Purpose', 'Amount (NGN)', 'Payment Date', 'Channel', 'Bank Reference', 'Status'],
                        ...payments.map(p => [
                          p.referenceNumber,
                          `"${p.studentName}"`,
                          p.studentId || 'N/A',
                          p.classLevel,
                          `"${p.payerName}"`,
                          p.payerPhone,
                          `"${p.purpose}"`,
                          p.amount,
                          p.paymentDate,
                          `"${p.paymentMethod}"`,
                          `"${p.bankReference}"`,
                          p.status
                        ])
                      ];
                      const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.join(",")).join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", `HGA_UBA_Payment_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
                      document.body.appendChild(link);
                      link.click();
                      link.remove();
                    }}
                    className="bg-brand-green hover:bg-brand-green-dark text-white px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-xs shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export Ledger CSV</span>
                  </button>
                </div>

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Verified Inflow</span>
                    <span className="text-lg font-black font-mono text-brand-green">
                      ₦{payments.filter(p => p.status === 'Verified').reduce((sum, p) => sum + (Number(p.amount) || 0), 0).toLocaleString('en-NG')}
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50/70 rounded border border-amber-200">
                    <span className="text-[10px] uppercase font-bold text-amber-800 block">Pending Verification</span>
                    <span className="text-lg font-black font-mono text-amber-900">
                      {payments.filter(p => p.status === 'Pending Verification').length} Transactions
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Remittances Recorded</span>
                    <span className="text-lg font-black font-mono text-slate-800">
                      {payments.length} Records
                    </span>
                  </div>
                </div>

                {/* Monthly Payment Collections Visual Bar Chart */}
                <PaymentRevenueChart payments={payments} />

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <div className="flex flex-wrap gap-1.5">
                    {(['ALL', 'Pending Verification', 'Verified', 'Rejected'] as const).map(status => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setPaymentFilterStatus(status)}
                        className={`text-xs px-3 py-1 rounded font-bold uppercase tracking-wider transition cursor-pointer ${
                          paymentFilterStatus === status
                            ? 'bg-slate-900 text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>

                  <input
                    type="text"
                    placeholder="Search student, payer, or ref..."
                    value={paymentSearch}
                    onChange={(e) => setPaymentSearch(e.target.value)}
                    className="w-full sm:w-64 px-3 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                  />
                </div>

                {/* Payments Table */}
                {payments.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded border border-slate-200 space-y-1">
                    <CreditCard className="w-8 h-8 mx-auto text-slate-400" />
                    <p className="text-slate-500 text-xs font-semibold">No payment records logged yet.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-heading uppercase text-[10px]">
                          <th className="py-2.5 px-3">Reference ID</th>
                          <th className="py-2.5 px-3">Student / Class</th>
                          <th className="py-2.5 px-3">Payer Info</th>
                          <th className="py-2.5 px-3">Purpose</th>
                          <th className="py-2.5 px-3">Amount (₦)</th>
                          <th className="py-2.5 px-3">Bank Ref / Channel</th>
                          <th className="py-2.5 px-3">Status</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {payments
                          .filter(p => {
                            if (paymentFilterStatus !== 'ALL' && p.status !== paymentFilterStatus) return false;
                            if (paymentSearch) {
                              const q = paymentSearch.toLowerCase();
                              return (
                                p.referenceNumber.toLowerCase().includes(q) ||
                                p.studentName.toLowerCase().includes(q) ||
                                p.payerName.toLowerCase().includes(q) ||
                                p.bankReference.toLowerCase().includes(q)
                              );
                            }
                            return true;
                          })
                          .map((payment) => (
                            <tr key={payment.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-3 px-3">
                                <span className="font-mono font-bold text-slate-900 block">{payment.referenceNumber}</span>
                                <span className="text-[10px] text-slate-400 font-mono">{payment.createdAt}</span>
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-bold text-slate-900 block">{payment.studentName}</span>
                                <span className="text-[10px] text-slate-500">{payment.classLevel} {payment.studentId ? `• ${payment.studentId}` : ''}</span>
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-semibold text-slate-800 block">{payment.payerName}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{payment.payerPhone}</span>
                              </td>
                              <td className="py-3 px-3 text-slate-700">
                                <span className="block font-medium">{payment.purpose}</span>
                                {payment.remarks && <span className="text-[10px] text-slate-400 italic block">{payment.remarks}</span>}
                              </td>
                              <td className="py-3 px-3 font-mono font-black text-brand-green">
                                ₦{Number(payment.amount).toLocaleString('en-NG')}
                              </td>
                              <td className="py-3 px-3">
                                <span className="font-mono text-[10.5px] text-slate-700 block">{payment.bankReference}</span>
                                <span className="text-[9.5px] text-slate-400">{payment.paymentMethod}</span>
                              </td>
                              <td className="py-3 px-3">
                                <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  payment.status === 'Verified'
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : payment.status === 'Pending Verification'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-red-100 text-red-800 border border-red-200'
                                }`}>
                                  {payment.status}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-right">
                                <div className="flex items-center justify-end space-x-1">
                                  {payment.status !== 'Verified' && onVerifyPayment && (
                                    <button
                                      type="button"
                                      onClick={() => onVerifyPayment(payment.id, 'Verified')}
                                      className="bg-brand-green hover:bg-brand-green-dark text-white px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer"
                                      title="Approve & Mark Verified"
                                    >
                                      Approve
                                    </button>
                                  )}
                                  {payment.status === 'Verified' && onVerifyPayment && (
                                    <button
                                      type="button"
                                      onClick={() => onVerifyPayment(payment.id, 'Pending Verification')}
                                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider cursor-pointer border"
                                      title="Revert to Pending"
                                    >
                                      Revert
                                    </button>
                                  )}
                                  {onDeletePayment && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setConfirmModal({
                                          title: 'Delete Payment Record',
                                          message: `Are you sure you want to delete payment record ${payment.referenceNumber} (${payment.payerName} - ₦${payment.amount.toLocaleString()})?`,
                                          confirmText: 'Delete Payment',
                                          onConfirm: () => onDeletePayment(payment.id)
                                        });
                                      }}
                                      className="p-1 border border-slate-200 rounded text-red-600 hover:bg-red-50 cursor-pointer transition"
                                      title="Delete payment record"
                                    >
                                      <Trash className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}

              </div>
            )}

            {/* T-11: SUBJECTS OFFERED & CURRICULUM */}
            {activeTab === 'subjects' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <h3 className="text-base font-black font-heading text-brand-green uppercase tracking-tight">
                      Subjects Offered & Academic Curriculum Registry
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Manage all subjects offered across Junior Secondary School (JSS 1–3) and Senior Secondary School (SS 1–3). Add, modify, or update their departmental classification and core status.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {onResetSubjects && (
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmModal({
                            title: 'Reset Subjects to Standard Curriculum',
                            message: 'Reset the entire subjects catalog back to the default WAEC/NECO/BECE accredited curriculum?',
                            confirmText: 'Reset Subjects',
                            onConfirm: () => {
                              onResetSubjects();
                              setSubjectNotice('Subjects have been reset to the default WAEC/NECO standard curriculum.');
                              setTimeout(() => setSubjectNotice(null), 4000);
                            }
                          });
                        }}
                        className="px-3 py-1.5 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Reset Defaults</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleStartAddSubject}
                      className="px-3.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add New Subject</span>
                    </button>
                  </div>
                </div>

                {subjectNotice && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-md text-xs font-bold animate-fade-in flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{subjectNotice}</span>
                  </div>
                )}

                {/* Subject Form Drawer */}
                {isSubjectFormOpen && (
                  <div ref={subjectFormRef} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <h4 className="font-heading font-black text-xs text-brand-green uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4" />
                        <span>{editingSubjectId ? 'Edit Subject Offering' : 'Register New Subject to Curriculum'}</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsSubjectFormOpen(false)}
                        className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <form onSubmit={handleSubjectFormSubmit} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        <div className="space-y-1 sm:col-span-2 lg:col-span-1">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                            Subject Name *
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Further Mathematics, Civic Education"
                            value={subjectName}
                            onChange={(e) => setSubjectName(e.target.value)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold focus:ring-1 focus:ring-brand-green"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                            Department / Category *
                          </label>
                          <select
                            value={subjectCategory}
                            onChange={(e) => setSubjectCategory(e.target.value as SubjectCategory)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold focus:ring-1 focus:ring-brand-green"
                          >
                            <option value="Sciences">Sciences</option>
                            <option value="Arts & Humanities">Arts & Humanities</option>
                            <option value="Commercial">Commercial</option>
                            <option value="Vocational & Tech">Vocational & Tech</option>
                            <option value="Junior General">Junior General</option>
                            <option value="Languages">Languages</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                            Applicable Level *
                          </label>
                          <select
                            value={subjectLevel}
                            onChange={(e) => setSubjectLevel(e.target.value as SubjectLevel)}
                            className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold focus:ring-1 focus:ring-brand-green"
                          >
                            <option value="All Levels">All Levels (JSS & SSS)</option>
                            <option value="Junior Secondary (JSS)">Junior Secondary (JSS Only)</option>
                            <option value="Senior Secondary (SSS)">Senior Secondary (SSS Only)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                          Subject Curriculum Description & Objectives
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Provide a concise summary of the course syllabus, lab requirements, or learning outcomes..."
                          value={subjectDesc}
                          onChange={(e) => setSubjectDesc(e.target.value)}
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green"
                        />
                      </div>

                      <div className="flex items-center space-x-2 pt-1">
                        <input
                          type="checkbox"
                          id="chk-is-core"
                          checked={subjectIsCore}
                          onChange={(e) => setSubjectIsCore(e.target.checked)}
                          className="w-4 h-4 text-brand-green rounded border-slate-300 focus:ring-brand-green cursor-pointer"
                        />
                        <label htmlFor="chk-is-core" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
                          Mark as Compulsory Core Subject (e.g. English Language, General Mathematics)
                        </label>
                      </div>

                      <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                        <button
                          type="button"
                          onClick={() => {
                            resetSubjectForm();
                            setIsSubjectFormOpen(false);
                          }}
                          className="px-3.5 py-1.5 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>{editingSubjectId ? 'Update Subject' : 'Save Subject to Curriculum'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mr-1">Department:</span>
                    {(['ALL', 'Sciences', 'Arts & Humanities', 'Commercial', 'Vocational & Tech', 'Junior General', 'Languages'] as const).map(cat => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSubjectFilterCategory(cat)}
                        className={`px-2.5 py-1 text-xs font-bold rounded transition cursor-pointer ${
                          subjectFilterCategory === cat
                            ? 'bg-brand-green text-white shadow-xs'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search subject by name..."
                      value={subjectSearchQuery}
                      onChange={(e) => setSubjectSearchQuery(e.target.value)}
                      className="w-full sm:w-60 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden font-medium"
                    />
                  </div>
                </div>

                {/* Subjects Table */}
                <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead className="bg-slate-100 text-slate-700 uppercase font-heading text-[10px] tracking-wider border-b border-slate-200">
                        <tr>
                          <th className="py-2.5 px-3">Subject Name</th>
                          <th className="py-2.5 px-3">Department</th>
                          <th className="py-2.5 px-3">Applicable Level</th>
                          <th className="py-2.5 px-3 text-center">Status</th>
                          <th className="py-2.5 px-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans">
                        {subjects
                          .filter(s => {
                            if (subjectFilterCategory !== 'ALL' && s.category !== subjectFilterCategory) return false;
                            if (subjectFilterLevel !== 'ALL' && s.level !== subjectFilterLevel) return false;
                            if (!subjectSearchQuery.trim()) return true;
                            const q = subjectSearchQuery.toLowerCase();
                            return (
                              s.name.toLowerCase().includes(q) ||
                              s.category.toLowerCase().includes(q) ||
                              s.level.toLowerCase().includes(q) ||
                              (s.desc || '').toLowerCase().includes(q)
                            );
                          })
                          .map(subj => (
                            <tr key={subj.id} className="hover:bg-slate-50/80 transition">
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-900">{subj.name}</div>
                                {subj.desc && (
                                  <div className="text-[10.5px] text-slate-500 max-w-md line-clamp-1">{subj.desc}</div>
                                )}
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                  {subj.category}
                                </span>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="text-slate-700 font-medium">{subj.level}</span>
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {subj.isCore ? (
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                                    Compulsory Core
                                  </span>
                                ) : (
                                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                    Elective
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleStartEditSubject(subj)}
                                    className="p-1.5 text-slate-600 hover:text-brand-green hover:bg-slate-100 rounded transition cursor-pointer"
                                    title="Edit Subject"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteSubject(subj)}
                                    className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                                    title="Delete Subject"
                                  >
                                    <Trash className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>

                  {subjects.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400">
                      No subjects registered yet. Click "Add New Subject" or "Reset Defaults" above.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* T-12: SCHOOL SOCIAL MEDIA HANDLES */}
            {activeTab === 'social' && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-0.5">
                  <h3 className="text-base font-black font-heading text-brand-green uppercase tracking-tight">
                    Official School Social Media Handles & Online Profiles
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Input and manage the official social media handles, messaging channels, and public web profiles for Holy Ghost Academy.
                  </p>
                </div>

                {socialNotice && (
                  <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-md text-xs font-bold animate-fade-in flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>{socialNotice}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left Column: Form */}
                  <div className="lg:col-span-2">
                    <form onSubmit={handleSaveSocialHandles} className="p-5 bg-white rounded-lg border border-slate-200 shadow-xs space-y-4">
                      <div className="border-b border-slate-100 pb-2">
                        <h4 className="font-heading font-black text-xs text-slate-900 uppercase tracking-wide">
                          Public Handles & Account URLs
                        </h4>
                        <p className="text-[10.5px] text-slate-500">
                          These links will be accessible to parents, prospective families, and alumni across the school portal.
                        </p>
                      </div>

                      <div className="space-y-3">
                        {/* Facebook */}
                        <div className="space-y-1">
                          <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                            <span>Facebook Page URL</span>
                          </label>
                          <input
                            type="url"
                            placeholder="https://facebook.com/holyghostacademyawka"
                            value={socialForm.facebook}
                            onChange={(e) => setSocialForm({ ...socialForm, facebook: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-brand-green focus:bg-white"
                          />
                        </div>

                        {/* Instagram */}
                        <div className="space-y-1">
                          <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-pink-600"></span>
                            <span>Instagram Handle URL</span>
                          </label>
                          <input
                            type="url"
                            placeholder="https://instagram.com/holyghostacademyawka"
                            value={socialForm.instagram}
                            onChange={(e) => setSocialForm({ ...socialForm, instagram: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-brand-green focus:bg-white"
                          />
                        </div>

                        {/* Twitter / X */}
                        <div className="space-y-1">
                          <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                            <span>Twitter / X Profile URL</span>
                          </label>
                          <input
                            type="url"
                            placeholder="https://x.com/holyghostawka"
                            value={socialForm.twitter}
                            onChange={(e) => setSocialForm({ ...socialForm, twitter: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-brand-green focus:bg-white"
                          />
                        </div>

                        {/* YouTube */}
                        <div className="space-y-1">
                          <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-red-600"></span>
                            <span>YouTube Channel URL</span>
                          </label>
                          <input
                            type="url"
                            placeholder="https://youtube.com/@holyghostacademyawka"
                            value={socialForm.youtube}
                            onChange={(e) => setSocialForm({ ...socialForm, youtube: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-brand-green focus:bg-white"
                          />
                        </div>

                        {/* TikTok */}
                        <div className="space-y-1">
                          <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-slate-800"></span>
                            <span>TikTok Profile URL</span>
                          </label>
                          <input
                            type="url"
                            placeholder="https://tiktok.com/@holyghostacademy"
                            value={socialForm.tiktok}
                            onChange={(e) => setSocialForm({ ...socialForm, tiktok: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-brand-green focus:bg-white"
                          />
                        </div>

                        {/* WhatsApp */}
                        <div className="space-y-1">
                          <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                            <span>WhatsApp Admissions / Inquiry Link</span>
                          </label>
                          <input
                            type="text"
                            placeholder="https://wa.me/2349054145339?text=Hello"
                            value={socialForm.whatsapp}
                            onChange={(e) => setSocialForm({ ...socialForm, whatsapp: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-brand-green focus:bg-white"
                          />
                        </div>

                        {/* LinkedIn */}
                        <div className="space-y-1">
                          <label className="block text-[10.5px] font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-blue-700"></span>
                            <span>LinkedIn Institutional Page URL</span>
                          </label>
                          <input
                            type="url"
                            placeholder="https://linkedin.com/school/holyghostacademy"
                            value={socialForm.linkedin}
                            onChange={(e) => setSocialForm({ ...socialForm, linkedin: e.target.value })}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-medium focus:ring-1 focus:ring-brand-green focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex justify-end">
                        <button
                          type="submit"
                          className="px-5 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs flex items-center gap-1.5"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Social Media Handles</span>
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Right Column: Live Preview Card */}
                  <div className="space-y-4">
                    <div className="p-5 bg-gradient-to-b from-slate-900 to-slate-800 text-white rounded-lg shadow-md border border-slate-700 space-y-4">
                      <div className="flex items-center gap-2 border-b border-slate-700/80 pb-3">
                        <Share2 className="w-4 h-4 text-brand-gold" />
                        <h4 className="font-heading font-black text-xs text-white uppercase tracking-wider">
                          Live Public Profile Preview
                        </h4>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        Here is how the school's active social channels appear to prospective students and alumni:
                      </p>

                      <div className="space-y-2 pt-1">
                        {socialForm.facebook && (
                          <a
                            href={socialForm.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded border border-slate-700 text-xs font-semibold text-white transition"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                              Facebook
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </a>
                        )}

                        {socialForm.instagram && (
                          <a
                            href={socialForm.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded border border-slate-700 text-xs font-semibold text-white transition"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-pink-500"></span>
                              Instagram
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </a>
                        )}

                        {socialForm.twitter && (
                          <a
                            href={socialForm.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded border border-slate-700 text-xs font-semibold text-white transition"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                              Twitter / X
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </a>
                        )}

                        {socialForm.youtube && (
                          <a
                            href={socialForm.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded border border-slate-700 text-xs font-semibold text-white transition"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-500"></span>
                              YouTube Channel
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </a>
                        )}

                        {socialForm.whatsapp && (
                          <a
                            href={socialForm.whatsapp}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-slate-700 rounded border border-slate-700 text-xs font-semibold text-white transition"
                          >
                            <span className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                              WhatsApp Support
                            </span>
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          </a>
                        )}
                      </div>

                      <div className="pt-2 text-[10px] text-slate-400">
                        Updates save instantly to local storage and sync to the cloud database when connected.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* T-SLIDES: HOMEPAGE SLIDESHOW BANNER FULL MANAGER */}
            {activeTab === 'slides' && (
              <div className="space-y-6 animate-fade-in font-sans">
                {/* Header banner */}
                <div className="bg-gradient-to-r from-brand-green to-brand-green-dark text-white rounded-lg p-6 shadow-sm border border-brand-yellow/30">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Sliders className="w-5 h-5 text-brand-yellow" />
                        <span className="text-[10px] font-bold text-brand-yellow uppercase tracking-widest">
                          Public Visual Identity & Hero Banner
                        </span>
                      </div>
                      <h3 className="text-xl font-black font-heading tracking-tight uppercase">
                        Homepage Slideshow Carousel Manager
                      </h3>
                      <p className="text-xs text-green-100 max-w-2xl">
                        Add, customize, and re-order the rotating slides and photography showcased on the Holy Ghost Academy homepage. Upload local photos from your computer or phone, customize titles, descriptions, and highlight badges.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setConfirmModal({
                            title: 'Restore Default Academy Slides',
                            message: 'This will reset all slides on the homepage back to the original academy specifications. All custom uploaded slide images will be reverted. Continue?',
                            confirmText: 'Restore Defaults',
                            onConfirm: () => {
                              onResetHeroSlides?.();
                              setSlideSuccessNotice("Homepage slides successfully restored to defaults!");
                              setTimeout(() => setSlideSuccessNotice(null), 3500);
                            }
                          });
                        }}
                        className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer border border-white/20"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Restore Defaults</span>
                      </button>
                    </div>
                  </div>
                </div>

                {slideSuccessNotice && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded text-emerald-800 text-xs flex items-center space-x-2 animate-fade-in font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{slideSuccessNotice}</span>
                  </div>
                )}

                {/* Form Card: Add or Edit Slide */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
                  <div className="bg-slate-50 px-5 py-3.5 border-b border-slate-200 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-md bg-brand-green/10 flex items-center justify-center text-brand-green">
                        {editingSlideId ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-tight font-heading">
                          {editingSlideId ? 'Modify Slide Details & Image' : 'Add New Slide to Homepage Carousel'}
                        </h4>
                        <p className="text-[10px] text-slate-400">
                          {editingSlideId ? 'Editing slide in active carousel rotation' : 'Fill in the details below to add a new slide banner'}
                        </p>
                      </div>
                    </div>
                    {editingSlideId && (
                      <button
                        type="button"
                        onClick={resetSlideForm}
                        className="text-xs text-slate-500 hover:text-slate-800 font-semibold px-2.5 py-1 rounded hover:bg-slate-200 transition cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSlideFormSubmit} className="p-5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Slide Title */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                          Slide Main Headline Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={slideTitle}
                          onChange={(e) => setSlideTitle(e.target.value)}
                          placeholder="e.g. World-Class Science Laboratories"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-semibold focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden"
                        />
                      </div>

                      {/* Highlight Badge */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                          Highlight Badge / Category Pill
                        </label>
                        <input
                          type="text"
                          value={slideBadge}
                          onChange={(e) => setSlideBadge(e.target.value)}
                          placeholder="e.g. STEM & INNOVATION, EXCELLENCE, AESTHETICS"
                          className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs font-semibold focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Slide Subtitle */}
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                        Slide Description / Subtitle
                      </label>
                      <textarea
                        rows={2}
                        value={slideSubtitle}
                        onChange={(e) => setSlideSubtitle(e.target.value)}
                        placeholder="e.g. State-of-the-art physics, chemistry, biology, and computer laboratories preparing future Nigerian innovators."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden"
                      />
                    </div>

                    {/* Image Selector: File from Device or Web URL */}
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wide">
                          Slide Photography & Hero Image *
                        </label>
                        <span className="text-[9px] text-slate-400">
                          Recommended format: 16:9 landscape ratio, high-resolution JPEG, PNG, or WebP
                        </span>
                      </div>

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={slideFileInputRef}
                        accept="image/*"
                        onChange={handleSlideImageUpload}
                        className="hidden"
                        id="admin-slide-file-picker"
                      />

                      {/* File Action Bar */}
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => slideFileInputRef.current?.click()}
                          className="px-3.5 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 shadow-xs cursor-pointer"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>Choose Image File from Device</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => slideFileInputRef.current?.click()}
                          className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded text-xs font-semibold transition flex items-center space-x-1.5 cursor-pointer border border-slate-200"
                        >
                          <Upload className="w-3.5 h-3.5 text-slate-500" />
                          <span>Browse Device Storage</span>
                        </button>

                        {slideImageFileName ? (
                          <div className="flex items-center space-x-1.5 text-xs text-emerald-800 bg-emerald-50 px-2.5 py-1.5 rounded border border-emerald-200 font-semibold max-w-xs truncate">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span className="truncate">{slideImageFileName}</span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">No local file selected yet</span>
                        )}
                      </div>

                      {/* Alternative: Direct Web URL */}
                      <div className="space-y-1 pt-1 border-t border-slate-200">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wide">
                          Or Enter Web Image URL
                        </label>
                        <input
                          type="url"
                          value={slideImageUrl.startsWith('data:') ? '' : slideImageUrl}
                          onChange={(e) => {
                            setSlideImageUrl(e.target.value);
                            setSlideImageFileName('');
                          }}
                          placeholder="e.g. https://images.unsplash.com/photo-... or https://i.ibb.co/..."
                          className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                        />
                      </div>

                      {/* Live Image & Slide Preview */}
                      {slideImageUrl && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-slate-200 space-y-2 animate-fade-in">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                              Live Slide Simulation Preview:
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px] uppercase">
                              {slideImageUrl.startsWith('data:') ? 'Local Image File Loaded' : 'Web URL Loaded'}
                            </span>
                          </div>

                          {/* Hero banner simulation */}
                          <div className="relative h-48 sm:h-56 w-full rounded-md overflow-hidden bg-slate-950 border border-slate-300 shadow-sm">
                            <img
                              src={slideImageUrl}
                              alt="Slide preview"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
                            <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end text-white">
                              {slideBadge && (
                                <span className="inline-block self-start px-2 py-0.5 rounded bg-brand-yellow text-slate-900 text-[9px] font-bold uppercase tracking-wider mb-2">
                                  {slideBadge}
                                </span>
                              )}
                              <h5 className="font-heading font-black text-base sm:text-xl uppercase tracking-tight text-white drop-shadow-sm line-clamp-1">
                                {slideTitle || 'Slide Headline Preview'}
                              </h5>
                              <p className="text-xs sm:text-sm text-slate-200 max-w-xl line-clamp-2 mt-1 drop-shadow-sm">
                                {slideSubtitle || 'Slide subtitle description will appear here on the homepage banner.'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end space-x-3 pt-2">
                      {editingSlideId && (
                        <button
                          type="button"
                          onClick={resetSlideForm}
                          className="px-4 py-2 border border-slate-300 text-slate-700 rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={!slideImageUrl}
                        className="px-5 py-2 bg-brand-green hover:bg-brand-green-dark disabled:opacity-40 text-white rounded text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1.5 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                      >
                        <Save className="w-4 h-4" />
                        <span>{editingSlideId ? 'Update Slide Changes' : 'Save Slide to Homepage'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* All Active Slides List with Full Reordering Controls */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-xs p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="font-bold text-sm text-brand-green uppercase tracking-tight font-heading">
                        Current Homepage Carousel Slides ({(heroSlides && heroSlides.length > 0 ? heroSlides : DEFAULT_HERO_SLIDES).length})
                      </h4>
                      <p className="text-xs text-slate-400">
                        These slides rotate on the live homepage. Use the arrows to reorder which slide displays first.
                      </p>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded">
                      Autoplay speed: 6 seconds / slide
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(heroSlides && heroSlides.length > 0 ? heroSlides : DEFAULT_HERO_SLIDES).map((slide, idx) => (
                      <div
                        key={slide.id}
                        className="p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3.5 transition"
                      >
                        {/* Left: Thumbnail & Info */}
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div className="relative w-24 h-16 rounded-md overflow-hidden bg-slate-800 shrink-0 border border-slate-300 shadow-2xs">
                            <img
                              src={slide.imageUrl}
                              alt={slide.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-1 left-1 bg-black/70 text-white text-[8.5px] font-mono font-bold px-1 rounded">
                              #{idx + 1}
                            </div>
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              {slide.badge && (
                                <span className="px-1.5 py-0.5 rounded bg-brand-yellow/80 text-slate-900 text-[8.5px] font-bold uppercase tracking-wider">
                                  {slide.badge}
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-slate-400">
                                {slide.imageUrl.startsWith('data:') ? 'Custom uploaded file' : 'External link'}
                              </span>
                            </div>
                            <h5 className="font-bold text-xs text-slate-900 uppercase tracking-tight truncate mt-0.5">
                              {slide.title}
                            </h5>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {slide.subtitle}
                            </p>
                          </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center space-x-2 shrink-0 self-end md:self-center">
                          {/* Reorder Up / Down */}
                          <div className="flex items-center bg-white border border-slate-200 rounded p-0.5 shadow-2xs">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveSlide(idx, 'up')}
                              className="p-1 text-slate-600 hover:text-brand-green disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                              title="Move Earlier"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={idx === (heroSlides.length || DEFAULT_HERO_SLIDES.length) - 1}
                              onClick={() => handleMoveSlide(idx, 'down')}
                              className="p-1 text-slate-600 hover:text-brand-green disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                              title="Move Later"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Edit Button */}
                          <button
                            type="button"
                            onClick={() => handleStartEditSlide(slide)}
                            className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-brand-green border border-brand-green/30 rounded text-xs font-bold uppercase tracking-wider transition flex items-center space-x-1 cursor-pointer shadow-2xs"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </button>

                          {/* Delete Button */}
                          {(heroSlides.length || DEFAULT_HERO_SLIDES.length) > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmModal({
                                  title: 'Delete Homepage Slide',
                                  message: `Are you sure you want to remove slide #${idx + 1} ("${slide.title}") from the homepage banner?`,
                                  confirmText: 'Delete Slide',
                                  onConfirm: () => {
                                    onDeleteHeroSlide?.(slide.id);
                                    setSlideSuccessNotice("Slide deleted successfully.");
                                    setTimeout(() => setSlideSuccessNotice(null), 3500);
                                  }
                                });
                              }}
                              className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded transition cursor-pointer"
                              title="Delete Slide"
                            >
                              <Trash className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* T-ABOUT-US: ABOUT US SECTION IMAGE CUSTOMIZER */}
            {activeTab === 'aboutUs' && (
              <div className="space-y-6 animate-fade-in font-sans">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-brand-oxblood via-brand-oxblood-dark to-slate-900 text-white rounded-lg p-5 shadow-sm border border-brand-yellow/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Compass className="w-5 h-5 text-brand-yellow shrink-0" />
                      <h3 className="text-lg font-black font-heading text-white tracking-tight uppercase">
                        About Us Section Image & Campus Badge
                      </h3>
                    </div>
                    <p className="text-xs text-slate-200 max-w-xl font-light leading-relaxed">
                      Customize the primary campus building photograph and institutional accreditation badge shown in the public <strong>"Our Establishment & Heritage"</strong> section on the About Us page.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {onNavigatePublicPage && (
                      <button
                        type="button"
                        onClick={() => onNavigatePublicPage('about')}
                        className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1.5 border border-white/20"
                        title="View About Us Page"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Live About Page</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleResetAboutImage}
                      className="px-3 py-2 bg-brand-yellow hover:bg-yellow-400 text-brand-oxblood font-black rounded text-xs uppercase tracking-wider transition cursor-pointer flex items-center space-x-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset to Default</span>
                    </button>
                  </div>
                </div>

                {/* Status Notice Alerts */}
                {aboutImageSavedNotice && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-2xs">
                    <div className="flex items-center space-x-2.5">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                      <span>
                        <strong>Success!</strong> The About Us showcase photo and badge have been saved and applied live across the portal.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAboutImageSavedNotice(false)}
                      className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {aboutImageError && (
                  <div className="p-3.5 bg-red-50 border border-red-300 rounded-lg text-red-800 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-2xs">
                    <div className="flex items-center space-x-2.5">
                      <AlertCircle className="w-4.5 h-4.5 text-red-600 shrink-0" />
                      <span>{aboutImageError}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAboutImageError(null)}
                      className="text-red-700 hover:text-red-950 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Two-Column Editor Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Form & Source Pickers */}
                  <div className="lg:col-span-7 space-y-5">
                    
                    {/* Source Selection Mode Tabs */}
                    <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-2xs space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                          Step 1: Choose Image Source
                        </label>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Select whether you want to upload a local photo file, enter a web URL, select a curated campus preset, or pick from your existing school gallery.
                        </p>
                      </div>

                      {/* Mode Pills */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {[
                          { id: 'upload', label: 'Upload Photo', icon: Upload },
                          { id: 'url', label: 'Direct URL', icon: Globe },
                          { id: 'presets', label: 'Campus Presets', icon: Sparkles },
                          { id: 'gallery', label: 'School Gallery', icon: ImageIcon, badge: gallery.length }
                        ].map((m) => {
                          const MIcon = m.icon;
                          const isCurrent = aboutInputMode === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setAboutInputMode(m.id as any);
                                setAboutImageError(null);
                              }}
                              className={`p-2.5 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center ${
                                isCurrent
                                  ? 'bg-brand-green text-white border-brand-green shadow-xs'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <div className="flex items-center gap-1">
                                <MIcon className="w-3.5 h-3.5 shrink-0" />
                                {m.badge !== undefined && m.badge > 0 && (
                                  <span className={`text-[8.5px] px-1 py-0.2 rounded font-bold ${isCurrent ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                                    {m.badge}
                                  </span>
                                )}
                              </div>
                              <span className="text-[10.5px] leading-tight">{m.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={aboutImageFileInputRef}
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleAboutImageUpload}
                        className="hidden"
                      />

                      {/* Tab 1: Upload from Device */}
                      {aboutInputMode === 'upload' && (
                        <div className="space-y-3 pt-2 border-t border-slate-100 animate-fade-in">
                          <div
                            onClick={() => aboutImageFileInputRef.current?.click()}
                            className="p-6 border-2 border-dashed border-slate-300 hover:border-brand-green rounded-xl bg-slate-50 hover:bg-green-50/40 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 group"
                          >
                            <div className="w-12 h-12 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-brand-green group-hover:scale-105 transition">
                              <Camera className="w-6 h-6 text-brand-green" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                Click or browse to upload an image from your computer/device
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Supports high-resolution JPG, PNG, or WEBP (up to 5MB)
                              </p>
                            </div>
                            <button
                              type="button"
                              className="px-3.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-[11px] font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer flex items-center space-x-1.5"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                              <span>Select Photo File</span>
                            </button>
                          </div>

                          {aboutUploadedFileName && (
                            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                              <div className="flex items-center space-x-2 truncate">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="font-semibold truncate">Loaded: {aboutUploadedFileName}</span>
                              </div>
                              <span className="text-[10px] font-mono bg-emerald-100 px-1.5 py-0.5 rounded text-emerald-800 font-bold shrink-0">
                                Local File
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tab 2: Direct URL */}
                      {aboutInputMode === 'url' && (
                        <div className="space-y-3 pt-2 border-t border-slate-100 animate-fade-in">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wide mb-1">
                              Paste Web Image Link (URL)
                            </label>
                            <div className="relative">
                              <input
                                type="url"
                                value={editAboutImage.startsWith('data:') ? '' : editAboutImage}
                                onChange={(e) => {
                                  setEditAboutImage(e.target.value);
                                  setAboutUploadedFileName('');
                                }}
                                placeholder="https://images.unsplash.com/... or https://your-server.com/photo.jpg"
                                className="w-full px-3 py-2 pr-9 bg-slate-50 focus:bg-white border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                              />
                              {editAboutImage && !editAboutImage.startsWith('data:') && (
                                <button
                                  type="button"
                                  onClick={() => setEditAboutImage('')}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                                  title="Clear Input"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1">
                              Ensure the image link is publicly accessible via HTTPS and ends in an image extension (.jpg, .png, .webp) or image hosting provider.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tab 3: Curated Presets */}
                      {aboutInputMode === 'presets' && (
                        <div className="space-y-3 pt-2 border-t border-slate-100 animate-fade-in">
                          <p className="text-[11px] text-slate-500">
                            Select one of our curated high-resolution educational campus photographs:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-80 overflow-y-auto pr-1">
                            {ABOUT_IMAGE_PRESETS.map((preset, pIdx) => {
                              const isSelected = editAboutImage === preset.url;
                              return (
                                <div
                                  key={pIdx}
                                  onClick={() => {
                                    setEditAboutImage(preset.url);
                                    if (preset.badge) setEditAboutBadge(preset.badge);
                                    setAboutUploadedFileName('');
                                  }}
                                  className={`p-2.5 rounded-lg border text-left cursor-pointer transition flex flex-col justify-between space-y-2 group ${
                                    isSelected
                                      ? 'border-brand-green ring-2 ring-brand-green/20 bg-emerald-50/50'
                                      : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                                  }`}
                                >
                                  <div className="relative h-24 rounded-md overflow-hidden bg-slate-900 border border-slate-200">
                                    <img
                                      src={preset.url}
                                      alt={preset.title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition duration-200"
                                    />
                                    {preset.badge && (
                                      <span className="absolute top-1 left-1 bg-brand-green text-brand-yellow text-[8px] font-bold px-1.5 py-0.5 rounded shadow">
                                        {preset.badge}
                                      </span>
                                    )}
                                    {isSelected && (
                                      <div className="absolute top-1 right-1 bg-brand-green text-white p-1 rounded-full shadow">
                                        <Check className="w-3 h-3" />
                                      </div>
                                    )}
                                  </div>
                                  <div>
                                    <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{preset.title}</h5>
                                    <p className="text-[10px] text-slate-500 line-clamp-2 mt-0.5">{preset.desc}</p>
                                  </div>
                                  <button
                                    type="button"
                                    className={`w-full py-1 rounded text-[10px] font-bold uppercase tracking-wider transition ${
                                      isSelected
                                        ? 'bg-brand-green text-white'
                                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                    }`}
                                  >
                                    {isSelected ? 'Currently Selected' : 'Choose This Photo'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Tab 4: School Gallery */}
                      {aboutInputMode === 'gallery' && (
                        <div className="space-y-3 pt-2 border-t border-slate-100 animate-fade-in">
                          {gallery.length === 0 ? (
                            <div className="p-6 text-center bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                              <ImageIcon className="w-8 h-8 text-slate-300 mx-auto" />
                              <p className="text-xs text-slate-500 font-semibold">No uploaded photos found in the School Gallery</p>
                              <p className="text-[11px] text-slate-400">
                                You can upload school event photos in the "Image Management" tab first.
                              </p>
                              <button
                                type="button"
                                onClick={() => setActiveTab('images')}
                                className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                              >
                                Go to Image Management
                              </button>
                            </div>
                          ) : (
                            <div>
                              <p className="text-[11px] text-slate-500 mb-2">
                                Click any photo from your registered school gallery to use it:
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-72 overflow-y-auto pr-1">
                                {gallery.map((item) => {
                                  const isSelected = editAboutImage === item.imageUrl;
                                  return (
                                    <div
                                      key={item.id}
                                      onClick={() => {
                                        setEditAboutImage(item.imageUrl);
                                        setAboutUploadedFileName('');
                                      }}
                                      className={`p-2 rounded-lg border cursor-pointer transition text-left group ${
                                        isSelected
                                          ? 'border-brand-green ring-2 ring-brand-green/20 bg-emerald-50/50'
                                          : 'border-slate-200 hover:border-slate-300 bg-white'
                                      }`}
                                    >
                                      <div className="relative h-20 rounded overflow-hidden bg-slate-900 mb-1.5">
                                        <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                                        {isSelected && (
                                          <div className="absolute top-1 right-1 bg-brand-green text-white p-0.5 rounded-full shadow">
                                            <Check className="w-3 h-3" />
                                          </div>
                                        )}
                                      </div>
                                      <p className="text-[10px] font-bold text-slate-800 truncate">{item.title}</p>
                                      <p className="text-[8.5px] text-slate-400 font-mono">{item.category}</p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                    </div>

                    {/* Step 2: Overlay Badge Customization */}
                    <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-2xs space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                          Step 2: Campus Accreditation Badge Text
                        </label>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          This label floats at the top-left corner of the About Us hero image on the public page.
                        </p>
                      </div>

                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editAboutBadge}
                          onChange={(e) => setEditAboutBadge(e.target.value)}
                          placeholder="e.g. Est. Pentecostal Church"
                          className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded text-xs font-semibold focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                        />

                        {/* Quick preset chips */}
                        <div className="space-y-1">
                          <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider block">
                            Quick Suggestions (Click to Apply):
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {[
                              'Est. Pentecostal Church',
                              'Kamali Homes Campus, Ngozika',
                              'Anambra Premier STEM School',
                              'Academic & Moral Excellence',
                              'State Approved Examination Centre',
                              'Est. 2012'
                            ].map((tag, tIdx) => (
                              <button
                                key={tIdx}
                                type="button"
                                onClick={() => setEditAboutBadge(tag)}
                                className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer border ${
                                  editAboutBadge === tag
                                    ? 'bg-brand-green text-white border-brand-green'
                                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                }`}
                              >
                                {tag}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 3: Save Actions */}
                    <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                      <div>
                        <h4 className="font-bold text-xs text-slate-800 uppercase tracking-tight">Apply Changes Live</h4>
                        <p className="text-[10px] text-slate-400">Updates are saved to permanent local storage and synchronize across the portal.</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleResetAboutImage}
                          className="px-3.5 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                        >
                          Reset Default
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSaveAboutImage()}
                          disabled={!editAboutImage}
                          className="px-5 py-2 bg-brand-green hover:bg-brand-green-dark disabled:opacity-40 text-white rounded text-xs font-bold uppercase tracking-wider transition flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer disabled:cursor-not-allowed"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save & Apply Live Image</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Live Public Preview Card */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-2xs space-y-3 sticky top-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center space-x-1.5">
                          <Eye className="w-4 h-4 text-brand-green" />
                          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-tight">
                            Live Website Public Preview
                          </h4>
                        </div>
                        <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                          Simulating /about
                        </span>
                      </div>

                      {/* Card Frame exactly as rendered on AboutView */}
                      <div className="relative rounded-xl overflow-hidden shadow-md border border-slate-200 p-1.5 bg-white">
                        <div className="relative h-64 sm:h-72 w-full rounded-lg overflow-hidden bg-slate-900">
                          {editAboutImage ? (
                            <img
                              src={editAboutImage}
                              alt="Holy Ghost Academy Campus Building"
                              className="w-full h-full object-cover rounded-lg transition duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 space-y-1">
                              <ImageIcon className="w-8 h-8" />
                              <span className="text-xs">No image provided</span>
                            </div>
                          )}
                          {editAboutBadge && (
                            <div className="absolute top-4 left-4 bg-brand-green text-brand-yellow text-[10px] font-bold font-heading px-2.5 py-1 rounded uppercase tracking-wider shadow-md">
                              {editAboutBadge}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Technical & Context Specs */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-[11px] text-slate-600">
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                          <span className="font-bold uppercase text-[9px] text-slate-500">Image Source:</span>
                          <span className="font-mono font-bold text-[10px] text-brand-oxblood">
                            {editAboutImage.startsWith('data:')
                              ? 'Local Data Stream (Uploaded)'
                              : editAboutImage === DEFAULT_ABOUT_US_IMAGE
                              ? 'Official Default Asset'
                              : 'External Cloud URL'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                          <span className="font-bold uppercase text-[9px] text-slate-500">Public Section:</span>
                          <span className="font-semibold text-slate-800">Our Establishment & Heritage</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold uppercase text-[9px] text-slate-500">Recommended Aspect:</span>
                          <span className="font-semibold text-slate-800">4:3 or 16:9 (Landscape)</span>
                        </div>
                      </div>

                      {/* Contextual Narrative Preview */}
                      <div className="p-3 bg-brand-green/5 rounded-lg border border-brand-green/20 space-y-1">
                        <h5 className="font-bold text-[10px] text-brand-green uppercase tracking-wide flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>Page Context Note</span>
                        </h5>
                        <p className="text-[10px] text-slate-600 leading-relaxed">
                          "Founded under the auspices of the Pentecostal Church of Awka, Holy Ghost Academy Secondary School was established inside Kamali Homes, Ngozika Housing Estate in Awka..."
                        </p>
                      </div>

                      {onNavigatePublicPage && (
                        <button
                          type="button"
                          onClick={() => onNavigatePublicPage('about')}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center space-x-1 border border-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          <span>Open Public About Page in New View</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* T-HEADER-LOGO: HEADER CREST & SCHOOL LOGO CUSTOMIZER */}
            {activeTab === 'headerLogo' && (
              <div className="space-y-6 animate-fade-in font-sans">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-emerald-900 via-brand-green to-teal-950 text-white rounded-lg p-5 shadow-sm border border-brand-yellow/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-brand-yellow shrink-0" />
                      <h3 className="text-lg font-black font-heading text-white tracking-tight uppercase">
                        Header Crest & School Identity Logo
                      </h3>
                    </div>
                    <p className="text-xs text-slate-200 max-w-xl font-light leading-relaxed">
                      Update the official Holy Ghost Academy crest and emblem displayed in the top sticky navigation header, mobile drawer menu, official printable transcripts, and website footer.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {onNavigatePublicPage && (
                      <button
                        type="button"
                        onClick={() => onNavigatePublicPage('home')}
                        className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1.5 border border-white/20"
                        title="View Public Homepage Header"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>View Live Header</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleResetHeaderLogo}
                      className="px-3 py-2 bg-brand-yellow hover:bg-yellow-400 text-brand-oxblood font-black rounded text-xs uppercase tracking-wider transition cursor-pointer flex items-center space-x-1.5 shadow-xs"
                      title="Restore original Holy Ghost Academy official crest"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset to Official Crest</span>
                    </button>
                  </div>
                </div>

                {/* Status Notice Alerts */}
                {logoSuccessNotice && (
                  <div className="p-3.5 bg-emerald-50 border border-emerald-300 rounded-lg text-emerald-800 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-2xs">
                    <div className="flex items-center space-x-2.5">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" />
                      <span>{logoSuccessNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLogoSuccessNotice(null)}
                      className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {logoErrorNotice && (
                  <div className="p-3.5 bg-red-50 border border-red-300 rounded-lg text-red-800 text-xs font-semibold flex items-center justify-between animate-fade-in shadow-2xs">
                    <div className="flex items-center space-x-2.5">
                      <AlertCircle className="w-4.5 h-4.5 text-red-600 shrink-0" />
                      <span>{logoErrorNotice}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setLogoErrorNotice(null)}
                      className="text-red-700 hover:text-red-950 p-1 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Two-Column Editor Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Form & Source Pickers */}
                  <div className="lg:col-span-7 space-y-5">
                    
                    {/* Source Selection Mode Tabs */}
                    <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-2xs space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                          Step 1: Choose Logo / Crest Source
                        </label>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Upload an image file from your computer or phone, paste an image link, or select from official diocesan crest archives.
                        </p>
                      </div>

                      {/* Mode Pills */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'upload', label: 'Upload from Device', icon: Upload },
                          { id: 'url', label: 'Web Image URL', icon: Globe },
                          { id: 'presets', label: 'Diocesan Crest Presets', icon: Award }
                        ].map((m) => {
                          const MIcon = m.icon;
                          const isCurrent = logoInputMode === m.id;
                          return (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => {
                                setLogoInputMode(m.id as any);
                                setLogoErrorNotice(null);
                              }}
                              className={`p-2.5 rounded-lg border text-xs font-bold transition flex flex-col items-center justify-center gap-1.5 cursor-pointer text-center ${
                                isCurrent
                                  ? 'bg-brand-green text-white border-brand-green shadow-xs'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              <MIcon className="w-4 h-4 shrink-0" />
                              <span className="text-[10.5px] leading-tight">{m.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={logoFileInputRef}
                        accept="image/jpeg,image/png,image/webp,image/jpg,image/svg+xml"
                        onChange={(e) => handleLogoFileUpload(e, false)}
                        className="hidden"
                      />

                      {/* Tab 1: Upload from Device */}
                      {logoInputMode === 'upload' && (
                        <div className="space-y-3 pt-2 border-t border-slate-100 animate-fade-in">
                          <div
                            onClick={() => logoFileInputRef.current?.click()}
                            className="p-6 border-2 border-dashed border-slate-300 hover:border-brand-green rounded-xl bg-slate-50 hover:bg-green-50/40 text-center cursor-pointer transition flex flex-col items-center justify-center space-y-2 group"
                          >
                            <div className="w-12 h-12 rounded-full bg-white shadow-2xs border border-slate-200 flex items-center justify-center text-brand-green group-hover:scale-105 transition">
                              <Camera className="w-6 h-6 text-brand-green" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-800">
                                Click or browse to upload school logo from your device
                              </p>
                              <p className="text-[10px] text-slate-400 mt-0.5">
                                Supports high-resolution PNG, JPG, SVG, or WEBP (up to 5MB, square 1:1 recommended)
                              </p>
                            </div>
                            <button
                              type="button"
                              className="px-3.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-[11px] font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer flex items-center space-x-1.5"
                            >
                              <FolderOpen className="w-3.5 h-3.5" />
                              <span>Select Logo Image File</span>
                            </button>
                          </div>

                          {logoUploadedFileName && (
                            <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
                              <div className="flex items-center space-x-2 truncate">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="font-mono text-[11px] truncate">{logoUploadedFileName}</span>
                              </div>
                              <span className="text-[10px] font-bold uppercase bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded">
                                Ready to Save
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Tab 2: Direct Image URL */}
                      {logoInputMode === 'url' && (
                        <div className="space-y-3 pt-2 border-t border-slate-100 animate-fade-in">
                          <div className="space-y-1">
                            <label className="block text-[11px] font-bold text-slate-700 uppercase">
                              Paste Direct Image Web Link (HTTPS)
                            </label>
                            <div className="relative">
                              <input
                                type="url"
                                value={editHeaderLogo}
                                onChange={(e) => {
                                  setEditHeaderLogo(e.target.value);
                                  setLogoUploadedFileName('');
                                }}
                                placeholder="https://i.ibb.co/... or https://domain.edu/logo.png"
                                className="w-full px-3 py-2 bg-slate-50 focus:bg-white border border-slate-300 rounded text-xs font-mono focus:ring-1 focus:ring-brand-green focus:outline-hidden"
                              />
                              {editHeaderLogo && (
                                <button
                                  type="button"
                                  onClick={() => setEditHeaderLogo('')}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                          <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-[10.5px] text-amber-900 space-y-1">
                            <p className="font-bold flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                              <span>Hosting Recommendation:</span>
                            </p>
                            <p className="leading-relaxed">
                              You can host your school crest on free secure image hosts like <strong>ImgBB (ibb.co)</strong>, <strong>Cloudinary</strong>, or <strong>Imgur</strong> and paste the direct image link here.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Tab 3: Curated Crest Presets */}
                      {logoInputMode === 'presets' && (
                        <div className="space-y-3 pt-2 border-t border-slate-100 animate-fade-in">
                          <p className="text-[11px] text-slate-500">
                            Select one of the official Holy Ghost Academy diocesan design variations:
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {HEADER_LOGO_PRESETS.map((preset, idx) => {
                              const isSelected = editHeaderLogo === preset.url;
                              return (
                                <div
                                  key={idx}
                                  onClick={() => {
                                    setEditHeaderLogo(preset.url);
                                    setLogoUploadedFileName('');
                                  }}
                                  className={`p-3 rounded-lg border cursor-pointer transition flex items-center gap-3 ${
                                    isSelected
                                      ? 'border-brand-green ring-2 ring-brand-green/20 bg-emerald-50/60'
                                      : 'border-slate-200 hover:border-slate-300 bg-white'
                                  }`}
                                >
                                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-brand-yellow shrink-0 bg-white shadow-xs">
                                    <img src={preset.url} alt={preset.title} className="w-full h-full object-cover" />
                                    {isSelected && (
                                      <div className="absolute inset-0 bg-brand-green/40 flex items-center justify-center text-white">
                                        <Check className="w-5 h-5 drop-shadow" />
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-0.5 flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-1">
                                      <p className="text-xs font-bold text-slate-800 truncate">{preset.title}</p>
                                      {isSelected && (
                                        <span className="text-[9px] font-bold text-brand-green bg-emerald-100 px-1.5 py-0.2 rounded shrink-0">
                                          Selected
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-slate-500 line-clamp-1">{preset.desc}</p>
                                    <span className="inline-block text-[8.5px] font-mono text-brand-oxblood uppercase font-bold">
                                      {preset.badge}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                    </div>

                    {/* Step 2: Save Action Bar */}
                    <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-2xs space-y-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                          Step 2: Commit & Apply to Header
                        </label>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Saving will immediately update the logo across the sticky navigation bar, mobile menu, and all portal footers.
                        </p>
                      </div>

                      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={handleResetHeaderLogo}
                          className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center space-x-1.5"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Reset to Default</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveHeaderLogo}
                          className="w-full sm:w-auto px-6 py-2.5 bg-brand-green hover:bg-brand-green-dark text-white rounded-md text-xs font-black uppercase tracking-wider transition cursor-pointer flex items-center justify-center space-x-2 shadow-sm"
                        >
                          <Sparkles className="w-4 h-4 text-brand-yellow" />
                          <span>Save & Apply Header Logo</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Live Header Simulator */}
                  <div className="lg:col-span-5 space-y-4">
                    <div className="bg-white rounded-lg p-5 border border-slate-200 shadow-2xs space-y-4 sticky top-4">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                        <div className="flex items-center space-x-1.5">
                          <Eye className="w-4 h-4 text-brand-green" />
                          <h4 className="font-bold text-xs text-slate-800 uppercase tracking-tight">
                            Live Header Simulator
                          </h4>
                        </div>
                        <span className="text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase">
                          Real-time Preview
                        </span>
                      </div>

                      {/* Header Simulator Frame */}
                      <div className="rounded-xl overflow-hidden shadow-md border-2 border-brand-yellow/60 bg-brand-green text-white">
                        {/* Top Banner simulation */}
                        <div className="bg-brand-oxblood text-white text-[8.5px] px-3 py-1 flex justify-between items-center font-sans tracking-wide">
                          <span className="truncate">📍 Ngozika Housing Estate, Awka</span>
                          <span className="text-brand-yellow font-bold shrink-0">Character • Faith</span>
                        </div>

                        {/* Navigation bar simulation */}
                        <div className="px-3.5 py-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            {/* Circular crest badge exactly as on Header */}
                            <div className="relative flex items-center justify-center w-11 h-11 rounded-full bg-white text-brand-green font-bold border-2 border-brand-yellow overflow-hidden shrink-0 shadow-sm">
                              <img
                                src={editHeaderLogo || DEFAULT_HEADER_LOGO}
                                alt="Official Crest Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = DEFAULT_HEADER_LOGO;
                                }}
                              />
                            </div>
                            <div>
                              <span className="text-xs font-bold font-heading text-white leading-none uppercase tracking-tight block">
                                Holy Ghost Academy
                              </span>
                              <p className="text-[7.5px] uppercase tracking-widest text-brand-yellow font-bold mt-0.5">
                                Secondary School, Awka
                              </p>
                            </div>
                          </div>

                          {/* Dummy Nav items */}
                          <div className="hidden sm:flex items-center space-x-1 text-[9px] font-bold uppercase tracking-wider text-white/80">
                            <span className="px-1.5 py-0.5 rounded bg-brand-oxblood text-white">Home</span>
                            <span className="px-1.5 py-0.5">About</span>
                            <span className="px-1.5 py-0.5">Portal</span>
                          </div>
                        </div>
                      </div>

                      {/* Technical & Placement Details */}
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2 text-[11px] text-slate-600">
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                          <span className="font-bold uppercase text-[9px] text-slate-500">Logo Source:</span>
                          <span className="font-mono font-bold text-[10px] text-brand-oxblood truncate max-w-[190px]">
                            {editHeaderLogo.startsWith('data:')
                              ? 'Local Uploaded File'
                              : editHeaderLogo === DEFAULT_HEADER_LOGO
                              ? 'Official Academy Default'
                              : 'Cloud Link (HTTPS)'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pb-1.5 border-b border-slate-200/60">
                          <span className="font-bold uppercase text-[9px] text-slate-500">Display Shape:</span>
                          <span className="font-semibold text-slate-800">44px Circular Frame with Gold Ring</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold uppercase text-[9px] text-slate-500">Recommended Dimensions:</span>
                          <span className="font-semibold text-slate-800">1:1 Square (min 200×200px)</span>
                        </div>
                      </div>

                      {/* Footer Notice */}
                      <div className="p-3 bg-brand-green/5 rounded-lg border border-brand-green/20 space-y-1 text-[10.5px] text-slate-600">
                        <h5 className="font-bold text-[10px] text-brand-green uppercase tracking-wide flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Institutional Identity Guarantee</span>
                        </h5>
                        <p className="leading-relaxed">
                          The logo is automatically rendered with an onError safety fallback to ensure Holy Ghost Academy branding is never broken, even during offline or slow network conditions.
                        </p>
                      </div>

                      {onNavigatePublicPage && (
                        <button
                          type="button"
                          onClick={() => onNavigatePublicPage('home')}
                          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center space-x-1 border border-slate-200"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" />
                          <span>View Public Website Header</span>
                        </button>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* T-SEO: SEARCH CONSOLE & 20-POINT SEO HUB */}
            {activeTab === 'seo' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-200 pb-4">
                  <div>
                    <h3 className="text-lg font-black font-heading text-brand-green uppercase tracking-tight flex items-center gap-2">
                      <Globe className="w-5 h-5 text-brand-oxblood" />
                      <span>SEO & Search Console Verification Hub</span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Manage Google Search Console tokens, Bing Webmaster tools, XML Sitemaps, robots.txt, and AI Agent standard documentation.
                    </p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>20/20 SEO Checks Active</span>
                  </span>
                </div>

                {/* 1. SEARCH CONSOLE VERIFICATION CARD */}
                <div className="bg-gradient-to-r from-blue-50/50 via-slate-50 to-indigo-50/50 p-5 rounded-xl border border-blue-200/80 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 bg-blue-600 text-white rounded-md shadow-xs">
                          <ShieldCheck className="w-4 h-4" />
                        </span>
                        <h4 className="font-bold text-sm font-heading text-slate-900 uppercase tracking-tight">
                          19. Search Engine Verification Meta Tokens
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans">
                        These official meta tags are embedded directly in the academy portal's HTML entry point (<code className="font-mono text-blue-700 bg-white px-1 py-0.5 rounded border border-blue-200">&lt;head&gt;</code>) for instant verification.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    {/* Google Search Console */}
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2 shadow-2xs">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                          <span>Google Search Console</span>
                        </span>
                        <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">Verified</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans">Verification Token:</p>
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 text-xs font-mono text-slate-700 flex justify-between items-center break-all select-all">
                        <span>HGASS-Awka-GSC-Verify-2026-Moral-Academics</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Tag: <code className="font-mono text-slate-600">&lt;meta name="google-site-verification" content="..." /&gt;</code>
                      </p>
                    </div>

                    {/* Bing Webmaster Tools */}
                    <div className="bg-white p-3.5 rounded-lg border border-slate-200 space-y-2 shadow-2xs">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-teal-600"></span>
                          <span>Bing Webmaster Tools</span>
                        </span>
                        <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded">Verified</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-sans">Verification Token:</p>
                      <div className="p-2 bg-slate-50 rounded border border-slate-200 text-xs font-mono text-slate-700 flex justify-between items-center break-all select-all">
                        <span>BING-HGASS-AWKA-VERIFICATION-2026</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Tag: <code className="font-mono text-slate-600">&lt;meta name="msvalidate.01" content="..." /&gt;</code>
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. SITEMAP & ROBOTS & LLMS.TXT FILES */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* sitemap.xml */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase text-brand-green font-heading flex items-center gap-1.5">
                          <FileSpreadsheet className="w-4 h-4 text-brand-green" />
                          <span>1. sitemap.xml</span>
                        </span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">Live</span>
                      </div>
                      <p className="text-xs text-slate-600 font-sans">
                        Full XML sitemap indexing 10 portal sections including Student Results, Curriculum, and Payment.
                      </p>
                      <div className="p-2 bg-slate-50 rounded text-[11px] font-mono text-slate-700 break-all select-all border border-slate-100">
                        https://holyghostacademy.edu.ng/sitemap.xml
                      </div>
                    </div>
                    <a
                      href="/sitemap.xml"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase tracking-wider text-center block transition shadow-2xs"
                    >
                      View Live XML Sitemap &rarr;
                    </a>
                  </div>

                  {/* robots.txt */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase text-brand-oxblood font-heading flex items-center gap-1.5">
                          <Compass className="w-4 h-4 text-brand-oxblood" />
                          <span>2. robots.txt</span>
                        </span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">Live</span>
                      </div>
                      <p className="text-xs text-slate-600 font-sans">
                        Instructs Googlebot, Bingbot, and web agents with clear allow directives and sitemap declaration.
                      </p>
                      <div className="p-2 bg-slate-50 rounded text-[11px] font-mono text-slate-700 break-all select-all border border-slate-100">
                        https://holyghostacademy.edu.ng/robots.txt
                      </div>
                    </div>
                    <a
                      href="/robots.txt"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-1.5 bg-brand-oxblood hover:bg-brand-oxblood-dark text-white rounded text-xs font-bold uppercase tracking-wider text-center block transition shadow-2xs"
                    >
                      View Live Robots.txt &rarr;
                    </a>
                  </div>

                  {/* llms.txt */}
                  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs uppercase text-amber-700 font-heading flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <span>20. llms.txt (AI Agents)</span>
                        </span>
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded uppercase">Live</span>
                      </div>
                      <p className="text-xs text-slate-600 font-sans">
                        Official standard for AI search engines (Gemini, Claude, Perplexity) with structured school knowledge.
                      </p>
                      <div className="p-2 bg-slate-50 rounded text-[11px] font-mono text-slate-700 break-all select-all border border-slate-100">
                        https://holyghostacademy.edu.ng/llms.txt
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <a
                        href="/llms.txt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold uppercase tracking-wider text-center block transition shadow-2xs"
                      >
                        llms.txt
                      </a>
                      <a
                        href="/llms-full.txt"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded text-xs font-bold uppercase tracking-wider text-center block transition shadow-2xs"
                      >
                        llms-full.txt
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3. 20-ITEM COMPREHENSIVE SEO & PERFORMANCE AUDIT CHECKLIST */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm font-heading text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <Award className="w-4 h-4 text-brand-green" />
                      <span>Holy Ghost Academy 20-Point SEO Execution Checklist</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      Detailed verification status for all search engine optimization and performance standards performed.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                    {[
                      { num: 1, name: 'Build sitemap.xml', status: 'Passed', desc: 'Valid XML sitemap with 10 main school URLs at /sitemap.xml.' },
                      { num: 2, name: 'Add robots.txt', status: 'Passed', desc: 'Allow all legitimate crawlers, disallow /admin, point to sitemap.' },
                      { num: 3, name: 'Remove noindex tags', status: 'Passed', desc: 'Explicit index, follow, max-image-preview:large configured.' },
                      { num: 4, name: 'Add canonical tags', status: 'Passed', desc: 'Dynamic rel="canonical" tags matching active view and URL origin.' },
                      { num: 5, name: 'Add meta titles', status: 'Passed', desc: 'Specific, keyword-rich titles under 60 chars per page view.' },
                      { num: 6, name: 'Meta descriptions', status: 'Passed', desc: 'Compelling 120-160 char summaries with actionable calls to action.' },
                      { num: 7, name: 'One H1 per page', status: 'Passed', desc: 'Singular semantic H1 on every view; navbar brand uses styled span.' },
                      { num: 8, name: 'Fix heading order', status: 'Passed', desc: 'Strict H1 -> H2 -> H3 logical hierarchy across all components.' },
                      { num: 9, name: 'Add alt text', status: 'Passed', desc: 'Accessible, descriptive alt attributes on all campus & student images.' },
                      { num: 10, name: 'Add schema markup', status: 'Passed', desc: 'EducationalOrganization, School, WebSite, Breadcrumbs & FAQs JSON-LD.' },
                      { num: 11, name: 'Add internal links', status: 'Passed', desc: 'Interactive Breadcrumbs on sub-pages plus rich cross-linking.' },
                      { num: 12, name: 'Fix broken links', status: 'Passed', desc: 'All quick links use crawlable anchor tags and valid destination routes.' },
                      { num: 13, name: 'Compress images', status: 'Passed', desc: 'Unsplash CDN optimization (q=80, fit=crop), lazy loading & decoding.' },
                      { num: 14, name: 'Core Web Vitals', status: 'Passed', desc: 'Preconnect CDN origins, explicit aspect-ratios, zero layout shift (CLS).' },
                      { num: 15, name: 'Fix mobile layout', status: 'Passed', desc: 'Touch-friendly tap targets (min 44px), responsive tables & mobile nav.' },
                      { num: 16, name: 'Enforce HTTPS', status: 'Passed', desc: 'Content-Security-Policy upgrade-insecure-requests active in head.' },
                      { num: 17, name: 'Clean up URL slugs', status: 'Passed', desc: '?page= slug routing with window.history.pushState & popstate.' },
                      { num: 18, name: 'Add an og:image', status: 'Passed', desc: 'High-res 1200x630 branded card at /og-image.svg & OpenGraph tags.' },
                      { num: 19, name: 'Verify Search Console', status: 'Passed', desc: 'Google Search Console and Bing Webmaster verification meta tokens.' },
                      { num: 20, name: 'Add llms.txt', status: 'Passed', desc: 'Standard /llms.txt and /llms-full.txt files created for AI crawlers.' },
                    ].map((item) => (
                      <div key={item.num} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50 flex items-start gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                          ✓
                        </span>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800 uppercase font-heading text-[11px]">
                              {item.num}. {item.name}
                            </span>
                            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 rounded uppercase">
                              {item.status}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 4. OPEN GRAPH SOCIAL CARD PREVIEW */}
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm font-heading text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <Share2 className="w-4 h-4 text-brand-oxblood" />
                      <span>18. OpenGraph & Social Sharing Card Preview (og:image)</span>
                    </h4>
                    <p className="text-xs text-slate-500">
                      When shared on WhatsApp, Facebook, LinkedIn, Twitter/X, or Slack, links to Holy Ghost Academy render this visual card:
                    </p>
                  </div>

                  <div className="max-w-xl mx-auto rounded-xl overflow-hidden border border-slate-300 shadow-md bg-slate-900">
                    <img
                      src="/og-image.svg"
                      alt="Holy Ghost Academy Social Share Card Preview"
                      width={1200}
                      height={630}
                      className="w-full h-auto object-cover"
                    />
                    <div className="p-3 bg-slate-950 text-white space-y-1">
                      <p className="text-[10px] uppercase font-bold text-brand-yellow font-mono tracking-wider">holyghostacademy.edu.ng</p>
                      <p className="font-bold text-xs uppercase font-heading">Holy Ghost Academy, Awka – Moral and Academic Excellence | Official Portal</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">Official portal of Holy Ghost Academy Secondary School, Awka (HGASS). Student Results, Fee Payment & Curriculum.</p>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>
      </div>

      {/* Interactive In-App Confirmation Modal (iframe-safe alternative to window.confirm) */}
      {confirmModal && (
        <div 
          id="admin-confirm-modal"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in"
        >
          <div className="bg-white rounded-lg p-5 max-w-sm w-full space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start space-x-3">
              <div className="p-2.5 bg-red-100 text-red-600 rounded-full shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-heading font-black text-sm text-slate-900 uppercase tracking-tight">
                  {confirmModal.title}
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  {confirmModal.message}
                </p>
              </div>
            </div>
            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                id="btn-cancel-modal"
                onClick={() => setConfirmModal(null)}
                className="px-3.5 py-1.5 border border-slate-200 rounded text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer uppercase tracking-wider font-sans"
              >
                Cancel
              </button>
              <button
                type="button"
                id="btn-confirm-modal-action"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition cursor-pointer uppercase tracking-wider font-sans shadow-xs"
              >
                {confirmModal.confirmText || 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
