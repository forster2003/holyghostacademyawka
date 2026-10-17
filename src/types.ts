/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string; // 'Academic', 'Announcement', 'Sports', 'Event'
  imageUrl?: string;
  isPublished: boolean;
}

export interface SchoolProject {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  budget: string;
  startDate: string;
  expectedCompletionDate: string;
  percentageCompletion: number; // 0 to 100
}

export interface GalleryItem {
  id: string;
  imageUrl: string;
  title: string;
  category: string; // 'School Activities', 'Sports', 'Academics', 'Graduation', 'Cultural Events', 'Projects'
  uploadDate: string;
}

export interface VideoItem {
  id: string;
  title: string;
  url: string; // YouTube or Google Drive share link
  description: string;
  uploadDate: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  fileType: string; // 'pdf', 'docx', 'xlsx'
  fileSize: string; // e.g. "2.4 MB"
  uploadDate: string;
  downloadUrl: string; // base64 or object URL
  accessPassword?: string; // Optional security password assigned by admin
}

export interface SubjectScore {
  subject: string;
  ca1Score?: number; // Continuous Assessment 1 (max 20)
  ca2Score?: number; // Continuous Assessment 2 (max 20)
  testScore: number; // Combined CA score (ca1 + ca2, max 40)
  examScore: number; // Examination score (max 60)
  totalScore: number; // ca1 + ca2 + exam = 100
  grade: string; // A, B, C, D, E, F
  remarks: string; // Assessment remark
  // Academic Session Cumulative Fields
  term1Score?: number; // 1st Term total score (max 100)
  term2Score?: number; // 2nd Term total score (max 100)
  term3Score?: number; // 3rd Term total score (max 100)
  cumulativeTotal?: number; // Combined terms total (e.g. max 300)
  cumulativeAverage?: number; // Average percentage score across terms (max 100)
  cumulativeGrade?: string; // Cumulative Grade (A, B, C, D, E, F)
  subjectPosition?: string; // Subject rank in class
}

export interface StudentResult {
  id: string; // result unique ID
  studentId: string; // Student Registration ID (e.g. HGASS/2026/001)
  studentName: string;
  passportPhoto?: string; // Passport photograph (Base64 data URL or Image URL)
  classLevel: string; // e.g. "JSS 1", "SS 2"
  term: string; // "1st Term", "2nd Term", "3rd Term", "Annual Cumulative"
  academicSession: string; // e.g. "2025/2026"
  gender: string; // SEX (Male / Female)
  rollNumber: string;
  position: string; // e.g. "1st of 45" - class placement
  attendance: string; // e.g. "82 of 85 days"
  promotionStatus?: string; // e.g. "Promoted to SS 3", "Promoted to Next Class", "Promoted on Trial", "Repeats Class"
  grossTotalMarks?: number; // Gross accumulated score across all subjects
  terminalAverage?: number; // Terminal average percentage score
  gradePoint?: number; // Grade Point Average (GPA out of 5.0)
  accreditedGradeBracket?: string; // Accredited Grade Bracket (e.g. Distinction, Upper Credit)
  classStanding?: string; // Class Standing / Honor roll
  principalRemarks: string;
  teacherRemarks: string;
  subjectScores: SubjectScore[];
  accessPassword?: string; // Secret password/PIN assigned by admin for this result sheet
  // Cumulative Academic Session metadata
  isCumulative?: boolean; // true if this is an annual/session cumulative record
  term1Average?: number; // 1st Term overall average %
  term2Average?: number; // 2nd Term overall average %
  term3Average?: number; // 3rd Term overall average %
  cumulativeSessionAverage?: number; // Cumulative average % across the entire session
  sessionGrossTotalMarks?: number; // Total gross marks across all subjects
  sessionTotalMaxMarks?: number; // Maximum possible marks across all subjects
  cumulativeAttendance?: string; // Cumulative attendance for the full academic session
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface PaymentRecord {
  id: string;
  referenceNumber: string; // e.g. "HGA-PAY-2026-98124"
  payerName: string;
  payerPhone: string;
  payerEmail: string;
  studentName: string;
  studentId?: string;
  classLevel: string; // e.g. "JSS 1", "SS 2", "Prospective Student", "Alumnus / Donor"
  purpose: string; // 'School Fees / Tuition', 'Boarding & Hostel Fees', 'Admission & Application Form', 'PTA Levy', 'Uniform & Textbooks', 'Diocesan Project Donation', 'Other'
  amount: number; // in Naira (₦)
  paymentDate: string;
  paymentMethod: string; // 'UBA Direct Bank Transfer', 'USSD Transfer', 'Mobile Banking App', 'Bank Branch Teller Deposit', 'POS / Card'
  bankReference: string; // Bank Transaction Ref or Teller Number
  proofImageUrl?: string; // Uploaded receipt image / receipt screenshot
  remarks?: string;
  status: 'Verified' | 'Pending Verification' | 'Rejected';
  createdAt: string;
}

export interface SchoolMilestoneStats {
  enrolledStudents: string; // e.g. "450+" or "500"
  professionalEducators: string; // e.g. "38" or "45"
  exemplaryGraduates: string; // e.g. "1,200+" or "1,500"
  stateAndNationalAwards: string; // e.g. "15" or "20"
}

export const DEFAULT_MILESTONE_STATS: SchoolMilestoneStats = {
  enrolledStudents: '450+',
  professionalEducators: '38',
  exemplaryGraduates: '1,200+',
  stateAndNationalAwards: '15',
};

export type StaffCategory = 'Administrative Board' | 'Academic Staff' | 'Non-Academic Staff';

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  category: StaffCategory;
  qualifications: string;
  image: string;
  desc: string;
  email?: string;
  phone?: string;
}

export type SubjectCategory = 'Sciences' | 'Arts & Humanities' | 'Commercial' | 'Vocational & Tech' | 'Junior General' | 'Languages';
export type SubjectLevel = 'Junior Secondary (JSS)' | 'Senior Secondary (SSS)' | 'All Levels';

export interface SchoolSubject {
  id: string;
  name: string;
  category: SubjectCategory;
  level: SubjectLevel;
  desc?: string;
  isCore?: boolean;
}

export interface SchoolSocialHandles {
  facebook: string;
  instagram: string;
  twitter: string; // or X
  youtube: string;
  tiktok: string;
  whatsapp: string;
  linkedin: string;
  telegram?: string;
  website?: string;
}

export const DEFAULT_SOCIAL_HANDLES: SchoolSocialHandles = {
  facebook: 'https://facebook.com/holyghostacademyawka',
  instagram: 'https://instagram.com/holyghostacademyawka',
  twitter: 'https://x.com/holyghostawka',
  youtube: 'https://youtube.com/@holyghostacademyawka',
  tiktok: '',
  whatsapp: 'https://wa.me/2349054145339?text=Hello%20Holy%20Ghost%20Academy%2C%20I%20would%20like%20to%20inquire%20about%20admissions.',
  linkedin: ''
};

export interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  badge?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Excused';

export interface DailyAttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  classLevel: string; // "JSS 1", "JSS 2", "JSS 3", "SS 1", "SS 2", "SS 3"
  gender?: 'Male' | 'Female' | string;
  rollNumber?: string;
  status: AttendanceStatus;
  remark?: string;
  academicSession: string; // "2025/2026"
  recordedAt: string; // ISO timestamp
  recordedBy?: string;
}

export interface RosterStudent {
  studentId: string;
  studentName: string;
  classLevel: string;
  gender: 'Male' | 'Female';
  rollNumber: string;
  passportPhoto?: string;
}

export type AcademicEventType = 'Exam' | 'Holiday' | 'Resumption' | 'Meeting' | 'Sports' | 'Religious' | 'Deadline' | 'Other';

export type AcademicTermType = '1st Term' | '2nd Term' | '3rd Term' | 'Annual';

export type EventAudienceType = 'All Students' | 'Day Students' | 'Boarding Students' | 'JSS Only' | 'SS Only' | 'Parents & Guardians' | 'Staff';

export interface AcademicCalendarEvent {
  id: string;
  title: string;
  eventType: AcademicEventType;
  startDate: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
  term: AcademicTermType;
  academicSession: string; // e.g. "2025/2026", "2026/2027"
  description?: string;
  targetAudience?: EventAudienceType;
  location?: string;
  isHighlight?: boolean;
  createdAt: string;
}

export const DEFAULT_ABOUT_US_IMAGE = 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800';
export const DEFAULT_ABOUT_US_BADGE = 'Est. Pentecostal Church';


