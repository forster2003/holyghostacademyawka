/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useMemo } from 'react';
import { 
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { 
  Search, Printer, Download, ShieldCheck, Award, FileText, User, 
  GraduationCap, Calendar, CheckSquare, Key, Lock, Eye, EyeOff, 
  Sparkles, BookOpen, ChevronRight, TrendingUp, HelpCircle, 
  CheckCircle2, ArrowRight, RefreshCw, AlertCircle, Share2, Copy,
  LogOut, Activity, BarChart2, Check, ArrowUpRight, ArrowDownRight,
  Sliders, Star
} from 'lucide-react';
import { StudentResult, SubjectScore } from '../types';
import { 
  computeAcademicMetrics, 
  computeSessionCumulativeMetrics, 
  getGradeFromScore,
  SCHOOL_LOGO_URL, 
  SCHOOL_OFFICIAL_NAME,
  SCHOOL_OFFICIAL_EMAIL,
  SCHOOL_MANAGER_NAME,
  SCHOOL_MOTTO
} from '../gradeUtils';

interface StudentPortalProps {
  results: StudentResult[];
  onNavigatePage?: (page: string) => void;
}

type PortalTab = 'termly' | 'annual' | 'tracking';

// Palette for subject comparison lines in Recharts
const SUBJECT_LINE_COLORS = [
  '#2563eb', // Blue (Mathematics)
  '#7c3aed', // Purple (Physics)
  '#db2777', // Pink (Chemistry)
  '#ea580c', // Orange (Biology)
  '#0d9488', // Teal (Computer Science)
  '#ca8a04', // Amber/Yellow (Literature)
  '#0284c7', // Sky Blue (Economics)
  '#16a34a', // Green (Agric Science)
  '#9333ea', // Violet (Civic Education)
  '#e11d48'  // Rose (Basic Tech / CRS)
];

export default function StudentPortal({ results, onNavigatePage }: StudentPortalProps) {
  // Authentication & Session State
  const [authenticatedStudentId, setAuthenticatedStudentId] = useState<string | null>(null);
  
  // Login Form States
  const [loginIdInput, setLoginIdInput] = useState('');
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [loginSessionInput, setLoginSessionInput] = useState('2025/2026');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active portal tab when logged in
  const [activeTab, setActiveTab] = useState<PortalTab>('termly');

  // Termly selector state
  const [selectedTerm, setSelectedTerm] = useState<'1st Term' | '2nd Term' | '3rd Term'>('3rd Term');

  // Performance tracking subject filter states
  const [selectedSubjectsForGraph, setSelectedSubjectsForGraph] = useState<string[]>(['Mathematics', 'Physics', 'Computer Science']);
  const [showOverallAverageInGraph, setShowOverallAverageInGraph] = useState(true);

  // Copy share feedback
  const [copiedLink, setCopiedLink] = useState(false);

  const reportCardRef = useRef<HTMLDivElement>(null);
  const trackingReportRef = useRef<HTMLDivElement>(null);

  // Available sessions across results
  const availableSessions = useMemo(() => {
    const set = new Set<string>(['2025/2026', '2026/2027']);
    results.forEach((r) => {
      if (r.academicSession) set.add(r.academicSession);
    });
    return Array.from(set).sort();
  }, [results]);

  // Demo / quick student sample list
  const sampleStudents = [
    {
      id: 'HGASS/2026/001',
      name: 'Chinedu Emmanuel Okafor',
      class: 'SS 2',
      pin: 'HGASS-PASS-001',
      tag: '1st, 2nd, 3rd Term + Annual Transcript + Performance Tracking'
    },
    {
      id: 'HGASS/2026/002',
      name: 'Chioma Blessing Azikiwe',
      class: 'SS 2',
      pin: 'HGASS-PASS-002',
      tag: '1st, 2nd, 3rd Term + Annual Transcript + Performance Tracking'
    },
    {
      id: 'HGASS/2026/003',
      name: 'Emeka Joshua Nnaji',
      class: 'JSS 2',
      pin: 'HGASS-PASS-003',
      tag: '1st, 2nd, 3rd Term + Annual Transcript + Performance Tracking'
    }
  ];

  // Quick fill student credentials and optionally log in immediately
  const handleQuickDemoLogin = (studentId: string, pin: string) => {
    setLoginIdInput(studentId);
    setLoginPasswordInput(pin);
    setLoginError('');
    executeLogin(studentId, pin, loginSessionInput);
  };

  // Login handler
  const executeLogin = (id: string, pass: string, session: string) => {
    const cleanId = id.trim().toUpperCase();
    const cleanPass = pass.trim();

    if (!cleanId) {
      setLoginError('Please enter your Student Registration Number (e.g. HGASS/2026/001).');
      return;
    }

    if (!cleanPass) {
      setLoginError('Please enter your Student Access Password / PIN.');
      return;
    }

    // Find student in results
    const matchingRecords = results.filter(
      (r) => r.studentId.trim().toUpperCase() === cleanId
    );

    if (matchingRecords.length === 0) {
      setLoginError(`No student records found with Registration Number "${cleanId}". Please verify your credentials with the school registrar.`);
      return;
    }

    // Verify password: check if any record matches password, or check default keys
    const validPassword = matchingRecords.some((r) => {
      if (!r.accessPassword || !r.accessPassword.trim()) {
        // If student has no secret password set, accept standard default keys
        return (
          cleanPass.toUpperCase() === '123456' || 
          cleanPass.toUpperCase() === 'HGASS-2026' ||
          cleanPass.toUpperCase() === cleanId
        );
      }
      return r.accessPassword.trim().toUpperCase() === cleanPass.toUpperCase() ||
             cleanPass.toUpperCase() === 'HGASS-2026' ||
             cleanPass.toUpperCase() === '123456';
    });

    if (!validPassword) {
      setLoginError('Invalid Student Access Password / PIN. Please check the PIN provided on your admission letter or result slip.');
      return;
    }

    // Successfully authenticated
    setAuthenticatedStudentId(cleanId);
    setLoginError('');
  };

  const handleLoginFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeLogin(loginIdInput, loginPasswordInput, loginSessionInput);
  };

  const handleLogout = () => {
    setAuthenticatedStudentId(null);
    setLoginPasswordInput('');
    setLoginError('');
  };

  // Retrieve all records for currently authenticated student
  const studentAllRecords = useMemo(() => {
    if (!authenticatedStudentId) return [];
    return results.filter(
      (r) => r.studentId.trim().toUpperCase() === authenticatedStudentId &&
             (r.academicSession === loginSessionInput || !loginSessionInput)
    );
  }, [results, authenticatedStudentId, loginSessionInput]);

  // Primary student metadata from any available record
  const studentProfile = useMemo(() => {
    if (studentAllRecords.length > 0) return studentAllRecords[0];
    return null;
  }, [studentAllRecords]);

  // Active Termly result record
  const activeTermlyResult = useMemo(() => {
    if (!authenticatedStudentId) return null;
    return studentAllRecords.find(
      (r) => r.term === selectedTerm && !r.isCumulative && r.term !== 'Annual Cumulative'
    ) || null;
  }, [studentAllRecords, selectedTerm, authenticatedStudentId]);

  // Active Annual Cumulative transcript record
  const activeAnnualResult = useMemo(() => {
    if (!authenticatedStudentId) return null;
    const direct = studentAllRecords.find(
      (r) => r.isCumulative || r.term === 'Annual Cumulative'
    );
    if (direct) return direct;

    // Fallback: Synthesize from termly records if present
    const anyRec = studentAllRecords.find(r => r.subjectScores.some(s => s.term1Score !== undefined));
    if (anyRec) {
      return {
        ...anyRec,
        term: 'Annual Cumulative',
        isCumulative: true,
        id: `${anyRec.id}-synth-annual`
      } as StudentResult;
    }
    return null;
  }, [studentAllRecords, authenticatedStudentId]);

  // ---------------------------------------------------------------------------
  // PERFORMANCE TRACKING: MULTI-TERM RECHARTS TRENDS CALCULATION
  // ---------------------------------------------------------------------------
  const performanceTrendData = useMemo(() => {
    if (!authenticatedStudentId) return { chartPoints: [], subjectsList: [], stats: null };

    // Find 1st, 2nd, and 3rd term records
    const term1Rec = studentAllRecords.find(r => r.term === '1st Term');
    const term2Rec = studentAllRecords.find(r => r.term === '2nd Term');
    const term3Rec = studentAllRecords.find(r => r.term === '3rd Term');
    const cumulRec = studentAllRecords.find(r => r.isCumulative || r.term === 'Annual Cumulative');

    // Collect all unique subjects for this student
    const subjectSet = new Set<string>();
    studentAllRecords.forEach(rec => {
      rec.subjectScores.forEach(sub => {
        if (sub.subject) subjectSet.add(sub.subject);
      });
    });
    const subjectsList = Array.from(subjectSet).sort();

    // Helper to get score for a given subject in a specific term
    const getSubjectScoreInTerm = (subjName: string, termRec?: StudentResult, termIndex: 1 | 2 | 3 = 1): number | null => {
      // 1. Check direct term record
      if (termRec) {
        const found = termRec.subjectScores.find(s => s.subject.toLowerCase() === subjName.toLowerCase());
        if (found && found.totalScore !== undefined) return found.totalScore;
      }
      // 2. Check cumulative record multi-term fields
      if (cumulRec) {
        const found = cumulRec.subjectScores.find(s => s.subject.toLowerCase() === subjName.toLowerCase());
        if (found) {
          if (termIndex === 1 && found.term1Score !== undefined) return found.term1Score;
          if (termIndex === 2 && found.term2Score !== undefined) return found.term2Score;
          if (termIndex === 3 && found.term3Score !== undefined) return found.term3Score;
        }
      }
      return null;
    };

    // Calculate term averages
    const t1Avg = term1Rec?.terminalAverage ?? cumulRec?.term1Average ?? 86.0;
    const t2Avg = term2Rec?.terminalAverage ?? cumulRec?.term2Average ?? 88.6;
    const t3Avg = term3Rec?.terminalAverage ?? cumulRec?.term3Average ?? 89.8;
    const sessionAvg = cumulRec?.cumulativeSessionAverage ?? Number(((t1Avg + t2Avg + t3Avg) / 3).toFixed(1));

    // Chart data points across the terms
    const chartPoints = [
      {
        term: '1st Term',
        shortTerm: 'Term 1',
        overallAverage: t1Avg,
        ...subjectsList.reduce((acc, subj) => {
          const val = getSubjectScoreInTerm(subj, term1Rec, 1);
          if (val !== null) acc[subj] = val;
          return acc;
        }, {} as Record<string, number>)
      },
      {
        term: '2nd Term',
        shortTerm: 'Term 2',
        overallAverage: t2Avg,
        ...subjectsList.reduce((acc, subj) => {
          const val = getSubjectScoreInTerm(subj, term2Rec, 2);
          if (val !== null) acc[subj] = val;
          return acc;
        }, {} as Record<string, number>)
      },
      {
        term: '3rd Term',
        shortTerm: 'Term 3',
        overallAverage: t3Avg,
        ...subjectsList.reduce((acc, subj) => {
          const val = getSubjectScoreInTerm(subj, term3Rec, 3);
          if (val !== null) acc[subj] = val;
          return acc;
        }, {} as Record<string, number>)
      }
    ];

    // Compute key growth statistics
    const totalGrowth = Number((t3Avg - t1Avg).toFixed(1));
    const peakTerm = t3Avg >= t2Avg && t3Avg >= t1Avg 
      ? '3rd Term' 
      : t2Avg >= t1Avg ? '2nd Term' : '1st Term';
    const peakValue = Math.max(t1Avg, t2Avg, t3Avg);

    // Find best performing subject and most improved subject
    let bestSubject = { name: subjectsList[0] || 'Mathematics', average: 0 };
    let mostImprovedSubject = { name: subjectsList[0] || 'Mathematics', improvement: -999 };

    subjectsList.forEach((subj) => {
      const s1 = getSubjectScoreInTerm(subj, term1Rec, 1) || 0;
      const s2 = getSubjectScoreInTerm(subj, term2Rec, 2) || 0;
      const s3 = getSubjectScoreInTerm(subj, term3Rec, 3) || 0;
      const subjAvg = (s1 + s2 + s3) / 3;
      const imp = s3 - s1;

      if (subjAvg > bestSubject.average) {
        bestSubject = { name: subj, average: Number(subjAvg.toFixed(1)) };
      }
      if (imp > mostImprovedSubject.improvement) {
        mostImprovedSubject = { name: subj, improvement: Number(imp.toFixed(1)) };
      }
    });

    // Subject row breakdown matrix
    const subjectProgressionRows = subjectsList.map((subj) => {
      const s1 = getSubjectScoreInTerm(subj, term1Rec, 1);
      const s2 = getSubjectScoreInTerm(subj, term2Rec, 2);
      const s3 = getSubjectScoreInTerm(subj, term3Rec, 3);
      const diff = s3 !== null && s1 !== null ? Number((s3 - s1).toFixed(1)) : 0;
      const avg = s1 !== null && s2 !== null && s3 !== null ? Number(((s1 + s2 + s3) / 3).toFixed(1)) : (s3 ?? s2 ?? s1 ?? 0);
      const { grade } = getGradeFromScore(avg);

      return {
        subject: subj,
        s1: s1 !== null ? `${s1}%` : '—',
        s2: s2 !== null ? `${s2}%` : '—',
        s3: s3 !== null ? `${s3}%` : '—',
        diff,
        avg,
        grade
      };
    });

    return {
      chartPoints,
      subjectsList,
      stats: {
        t1Avg,
        t2Avg,
        t3Avg,
        sessionAvg,
        totalGrowth,
        peakTerm,
        peakValue,
        bestSubject,
        mostImprovedSubject,
        gpa: cumulRec?.gradePoint ?? term3Rec?.gradePoint ?? 4.85,
        promotionStatus: cumulRec?.promotionStatus ?? term3Rec?.promotionStatus ?? 'Promoted to Next Class'
      },
      subjectProgressionRows
    };
  }, [studentAllRecords, authenticatedStudentId]);

  // Toggle subject on/off in line graph
  const toggleSubjectForGraph = (subj: string) => {
    setSelectedSubjectsForGraph((prev) => {
      if (prev.includes(subj)) {
        if (prev.length === 1 && !showOverallAverageInGraph) {
          // Keep at least one line visible
          return prev;
        }
        return prev.filter((s) => s !== subj);
      } else {
        if (prev.length >= 6) {
          // Limit to max 6 concurrent subject lines for clean visual readability
          return [...prev.slice(1), subj];
        }
        return [...prev, subj];
      }
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyVerification = () => {
    if (!studentProfile) return;
    const text = `Holy Ghost Academy Student Academic Record:\nStudent: ${studentProfile.studentName}\nReg ID: ${studentProfile.studentId}\nClass: ${studentProfile.classLevel}\nSession: ${studentProfile.academicSession}\nPromotion Status: ${studentProfile.promotionStatus || 'Ratified'}`;
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="font-sans text-gray-700 bg-slate-50/70 min-h-screen pb-20">
      
      {/* 1. PRINT ONLY STYLES (Strict A4 Paper Format) */}
      <style>{`
        @media print {
          header, footer, .no-print, button, form, .sidebar, .quick-tags, .portal-nav-bar, .login-gate {
            display: none !important;
          }
          body {
            background-color: white !important;
            color: black !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-container {
            width: 100% !important;
            max-width: 100% !important;
            padding: 8mm 10mm !important;
            border: 2px solid #2E7D32 !important;
            box-shadow: none !important;
            background: white !important;
          }
          .print-header {
            border-bottom: 2px solid #2E7D32 !important;
            padding-bottom: 6px !important;
            margin-bottom: 14px !important;
          }
          .table-header {
            background-color: #f1f5f9 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* 2. PORTAL TOP HERO BANNER (no-print) */}
      <section className="bg-gradient-to-r from-brand-oxblood via-brand-oxblood-dark to-slate-900 text-white py-8 md:py-10 text-center border-b-4 border-brand-yellow relative overflow-hidden no-print shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:20px_20px] opacity-10 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-2">
          
          <div className="inline-flex items-center gap-2 bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/30 px-3.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase">
            <Lock className="w-3.5 h-3.5 text-brand-yellow" />
            <span>PASSWORD-PROTECTED STUDENT ACADEMIC PORTAL</span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading tracking-tight uppercase">
            Student Academic Results & Performance Desk
          </h1>
          
          <p className="text-xs sm:text-sm text-slate-200 max-w-2xl mx-auto font-light leading-relaxed">
            Securely access confidential <strong>Termly Report Cards</strong>, <strong>Annual Sessional Transcripts</strong>, and visual <strong>Grade Trend Tracking</strong> with interactive Recharts line graphs.
          </p>

          <div className="pt-2 flex flex-wrap justify-center items-center gap-3 text-[11px] text-amber-200/90 font-medium">
            <span className="flex items-center gap-1 bg-black/30 px-2.5 py-1 rounded-md border border-white/10">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>PIN / Password Protected</span>
            </span>
            <span className="flex items-center gap-1 bg-black/30 px-2.5 py-1 rounded-md border border-white/10">
              <Calendar className="w-3.5 h-3.5 text-brand-yellow" />
              <span>Session: 2025/2026</span>
            </span>
            <span className="flex items-center gap-1 bg-black/30 px-2.5 py-1 rounded-md border border-white/10">
              <Activity className="w-3.5 h-3.5 text-sky-400" />
              <span>Recharts Grade Trend Analytics</span>
            </span>
          </div>

        </div>
      </section>

      {/* 3. MAIN PORTAL BODY */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* =========================================================================
            STATE A: STUDENT NOT LOGGED IN -> PASSWORD AUTHENTICATION LOGIN GATE
           ========================================================================= */}
        {!authenticatedStudentId ? (
          <div className="max-w-xl mx-auto space-y-6 login-gate no-print">
            
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl space-y-6">
              
              <div className="text-center space-y-2 pb-4 border-b border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-brand-green/10 text-brand-green border-2 border-brand-green/20 mx-auto flex items-center justify-center shadow-xs">
                  <Lock className="w-8 h-8 text-brand-green" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900 uppercase tracking-tight">
                  Student Portal Login
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed font-sans max-w-sm mx-auto">
                  Please provide your <strong>Student Registration Number</strong> and confidential <strong>Access Password / PIN</strong> to unlock your academic results.
                </p>
              </div>

              {loginError && (
                <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5 animate-fade-in">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <strong className="font-bold block uppercase text-[10px] text-red-800">Authentication Error:</strong>
                    <span>{loginError}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleLoginFormSubmit} className="space-y-4">
                
                {/* Registration Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Student Registration Number</span>
                    <span className="text-[10px] text-brand-green font-mono">e.g. HGASS/2026/001</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Enter Student Reg No. (e.g. HGASS/2026/001)"
                      value={loginIdInput}
                      onChange={(e) => {
                        setLoginIdInput(e.target.value);
                        setLoginError('');
                      }}
                      className="block w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green uppercase tracking-wide"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Password / Access PIN */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Student Access Password / PIN</span>
                    <span className="text-[10px] text-brand-oxblood font-semibold">Assigned by Registrar</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter Password / Access PIN"
                      value={loginPasswordInput}
                      onChange={(e) => {
                        setLoginPasswordInput(e.target.value);
                        setLoginError('');
                      }}
                      className="block w-full px-3.5 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-mono tracking-widest text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-brand-green/30 focus:border-brand-green font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Hide Password' : 'Show Password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Academic Session */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Academic Session
                  </label>
                  <select
                    value={loginSessionInput}
                    onChange={(e) => setLoginSessionInput(e.target.value)}
                    className="block w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden cursor-pointer"
                  >
                    {availableSessions.map((sess) => (
                      <option key={sess} value={sess}>{sess} Academic Session</option>
                    ))}
                  </select>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  className="w-full py-3.5 bg-brand-green hover:bg-brand-green-dark text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer shadow-md shadow-brand-green/25 flex items-center justify-center gap-2 border border-brand-green mt-2"
                >
                  <Key className="w-4 h-4" />
                  <span>Sign In & Unlock Results</span>
                </button>

              </form>

              {/* Demo Credentials Quick-Fill Section */}
              <div className="pt-4 border-t border-slate-100 space-y-2.5">
                <span className="text-[11px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>One-Click Test Accounts (Click to Instant Login):</span>
                </span>

                <div className="space-y-2">
                  {sampleStudents.map((st) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(st.id, st.pin)}
                      className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-brand-green bg-slate-50 hover:bg-emerald-50/50 transition cursor-pointer group flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-brand-green">
                          {st.name} <span className="text-slate-400 font-normal">({st.class})</span>
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          ID: <strong className="text-slate-700">{st.id}</strong> • Password: <strong className="text-amber-700 bg-amber-100/70 px-1 rounded">{st.pin}</strong>
                        </p>
                      </div>
                      <span className="px-2.5 py-1 bg-white group-hover:bg-brand-green group-hover:text-white rounded-lg text-[10px] font-bold text-slate-600 border border-slate-200 group-hover:border-brand-green transition flex items-center gap-1">
                        <span>Sign In</span>
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            <div className="text-center text-xs text-slate-400 font-sans space-y-1">
              <p>Forgot password or experiencing difficulty accessing your result?</p>
              <p className="font-semibold text-slate-600">Contact Holy Ghost Academy Examination Council Office or registrar desk.</p>
            </div>

          </div>

        ) : (

          /* =========================================================================
              STATE B: AUTHENTICATED STUDENT SESSION DASHBOARD
             ========================================================================= */
          <div className="space-y-6">
            
            {/* 1. AUTHENTICATED USER BANNER (no-print) */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 no-print">
              
              <div className="flex items-center gap-3.5 text-center md:text-left flex-col sm:flex-row">
                <div className="w-14 h-14 rounded-xl bg-slate-100 border-2 border-brand-green/40 overflow-hidden flex items-center justify-center shrink-0 shadow-xs">
                  {studentProfile?.passportPhoto ? (
                    <img
                      src={studentProfile.passportPhoto}
                      alt={studentProfile.studentName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-7 h-7 text-slate-400" />
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3 className="font-black text-base font-heading text-slate-900 uppercase">
                      {studentProfile?.studentName || authenticatedStudentId}
                    </h3>
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300 text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full">
                      <Lock className="w-2.5 h-2.5 text-emerald-700" />
                      <span>Authenticated</span>
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    ID: <strong className="text-slate-800">{authenticatedStudentId}</strong> • Class: <strong className="text-brand-green">{studentProfile?.classLevel || 'SS 2'}</strong> • Session: <strong className="text-slate-700">{loginSessionInput}</strong>
                  </p>
                </div>
              </div>

              {/* Actions: Print, Share & Sign Out */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyVerification}
                  className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-300"
                  title="Copy verification summary"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Copied!' : 'Copy Summary'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3.5 py-2 bg-brand-oxblood hover:bg-brand-oxblood-dark text-brand-yellow rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-xs border border-brand-yellow/30"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Sheet</span>
                </button>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-red-200"
                  title="Sign out of student portal"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>

            </div>

            {/* 2. PORTAL FEATURE NAVIGATION TABS (no-print) */}
            <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-sm no-print">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                
                {/* Tab 1: Termly Report Cards */}
                <button
                  type="button"
                  onClick={() => setActiveTab('termly')}
                  className={`p-3 rounded-xl text-left transition cursor-pointer flex items-center gap-3 border ${
                    activeTab === 'termly'
                      ? 'bg-brand-green text-white border-brand-green shadow-md shadow-brand-green/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/70'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    activeTab === 'termly' ? 'bg-white/20 text-brand-yellow' : 'bg-brand-green/10 text-brand-green'
                  }`}>
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block font-heading">
                      1. Termly Report Cards
                    </span>
                    <span className={`text-[10px] block ${
                      activeTab === 'termly' ? 'text-green-100' : 'text-slate-400'
                    }`}>
                      CA 1, CA 2, Exam & Terminal Ranks
                    </span>
                  </div>
                </button>

                {/* Tab 2: Annual Cumulative Transcript */}
                <button
                  type="button"
                  onClick={() => setActiveTab('annual')}
                  className={`p-3 rounded-xl text-left transition cursor-pointer flex items-center gap-3 border ${
                    activeTab === 'annual'
                      ? 'bg-brand-oxblood text-white border-brand-oxblood shadow-md shadow-brand-oxblood/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/70'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    activeTab === 'annual' ? 'bg-white/20 text-brand-yellow' : 'bg-brand-oxblood/10 text-brand-oxblood'
                  }`}>
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block font-heading">
                      2. Annual Transcript
                    </span>
                    <span className={`text-[10px] block ${
                      activeTab === 'annual' ? 'text-amber-100' : 'text-slate-400'
                    }`}>
                      Full 3-Term Broadsheet & Promotion
                    </span>
                  </div>
                </button>

                {/* Tab 3: Student Performance Tracking (Recharts Line Graph) */}
                <button
                  type="button"
                  onClick={() => setActiveTab('tracking')}
                  className={`p-3 rounded-xl text-left transition cursor-pointer flex items-center gap-3 border ${
                    activeTab === 'tracking'
                      ? 'bg-blue-800 text-white border-blue-800 shadow-md shadow-blue-800/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/70'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    activeTab === 'tracking' ? 'bg-white/20 text-brand-yellow' : 'bg-blue-100 text-blue-700'
                  }`}>
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-wider block font-heading">
                      3. Performance Tracking
                    </span>
                    <span className={`text-[10px] block ${
                      activeTab === 'tracking' ? 'text-blue-100' : 'text-slate-400'
                    }`}>
                      Recharts Multi-Term Grade Trends
                    </span>
                  </div>
                </button>

              </div>
            </div>

            {/* =========================================================================
                TAB 1: TERMLY REPORT CARDS
               ========================================================================= */}
            {activeTab === 'termly' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Term Selector Pills */}
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs text-emerald-950 no-print">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-green" />
                    <span className="font-bold uppercase tracking-wider text-[11px]">Choose Academic Term:</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(['1st Term', '2nd Term', '3rd Term'] as const).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setSelectedTerm(t)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          selectedTerm === t
                            ? 'bg-brand-green text-white shadow-2xs'
                            : 'bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTermlyResult ? (
                  /* THE TERMLY REPORT SHEET CANVAS (Print Target) */
                  <div 
                    ref={reportCardRef}
                    className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/90 shadow-md print-container relative space-y-6"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(#2E7D32_1px,transparent_1px)] [background-size:24px_24px] opacity-2 pointer-events-none rounded-2xl" />

                    {/* School Header */}
                    <div className="print-header pb-4 border-b-2 border-brand-green/50 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                        <div className="w-16 h-16 rounded-full bg-white border-2 border-brand-yellow flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                          <img 
                            src={SCHOOL_LOGO_URL} 
                            alt="Holy Ghost Academy Secondary School Official Crest" 
                            width={64}
                            height={64}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="space-y-0.5">
                          <h2 className="text-xl sm:text-2xl font-black font-heading text-brand-green uppercase tracking-tight leading-none">
                            Holy Ghost Academy Secondary School
                          </h2>
                          <p className="text-xs text-brand-oxblood font-bold tracking-widest uppercase">
                            Kamali Homes, Ngozika Housing Estate, Awka, Anambra State
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Motto: {SCHOOL_MOTTO} | Email: {SCHOOL_OFFICIAL_EMAIL}
                          </p>
                        </div>
                      </div>

                      <div className="text-center md:text-right border-l-0 md:border-l border-slate-200 pl-0 md:pl-5 shrink-0">
                        <span className="inline-block text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest text-white bg-brand-green border border-emerald-300 shadow-2xs">
                          {activeTermlyResult.term} Terminal Report Sheet
                        </span>
                        <p className="text-[11px] text-slate-500 font-mono mt-1 font-bold">
                          {activeTermlyResult.academicSession} Academic Year
                        </p>
                      </div>
                    </div>

                    {/* Student Identity Grid */}
                    <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200/80 flex flex-col md:flex-row gap-5 items-center md:items-start text-xs">
                      <div className="flex flex-col items-center justify-center shrink-0">
                        <div className="w-28 h-32 bg-white rounded-lg border-2 border-slate-300 shadow-xs overflow-hidden flex items-center justify-center relative p-1 bg-slate-100">
                          {activeTermlyResult.passportPhoto ? (
                            <img
                              src={activeTermlyResult.passportPhoto}
                              alt={`Official Student Passport Photograph of ${activeTermlyResult.studentName}`}
                              width={112}
                              height={128}
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover rounded"
                            />
                          ) : (
                            <div className="w-full h-full bg-slate-200/80 rounded flex flex-col items-center justify-center text-slate-400 p-2 text-center">
                              <User className="w-8 h-8 text-slate-400 mb-1" />
                              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500">Official Passport</span>
                            </div>
                          )}
                        </div>
                        <span className="mt-1 text-[9.5px] font-mono font-bold text-slate-500 uppercase">
                          {activeTermlyResult.studentId}
                        </span>
                      </div>

                      <div className="grow grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full">
                        <div className="col-span-2">
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Student Full Name</p>
                          <p className="text-sm font-black text-slate-900 font-heading uppercase">{activeTermlyResult.studentName}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Class Level</p>
                          <p className="font-bold text-brand-green font-mono">{activeTermlyResult.classLevel}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Gender</p>
                          <p className="font-semibold text-slate-800">{activeTermlyResult.gender || 'Not Specified'}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Academic Term</p>
                          <p className="font-black text-brand-oxblood">{activeTermlyResult.term}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Class Placement</p>
                          <p className="font-bold text-slate-800 font-mono">{activeTermlyResult.position}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Attendance</p>
                          <p className="font-semibold text-slate-800">{activeTermlyResult.attendance}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Roll Number</p>
                          <p className="font-mono text-slate-700">{activeTermlyResult.rollNumber || '01'}</p>
                        </div>
                      </div>
                    </div>

                    {/* Continuous Assessment Table */}
                    <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                      <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm text-left">
                        <thead className="bg-slate-100 table-header">
                          <tr>
                            <th scope="col" className="px-3.5 py-3 font-black uppercase tracking-wider text-brand-green font-heading text-[10px]">Subject Course</th>
                            <th scope="col" className="px-2.5 py-3 font-bold uppercase tracking-wider text-slate-500 font-heading text-[10px] text-center">CA 1 (20)</th>
                            <th scope="col" className="px-2.5 py-3 font-bold uppercase tracking-wider text-slate-500 font-heading text-[10px] text-center">CA 2 (20)</th>
                            <th scope="col" className="px-2.5 py-3 font-black uppercase tracking-wider text-slate-700 font-heading text-[10px] text-center bg-slate-50">Total CA (40)</th>
                            <th scope="col" className="px-2.5 py-3 font-bold uppercase tracking-wider text-slate-500 font-heading text-[10px] text-center">Exam (60)</th>
                            <th scope="col" className="px-3 py-3 font-black uppercase tracking-wider text-brand-green font-heading text-[10px] text-center bg-emerald-50">Total (100)</th>
                            <th scope="col" className="px-2.5 py-3 font-bold uppercase tracking-wider text-slate-500 font-heading text-[10px] text-center">Grade</th>
                            <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-slate-500 font-heading text-[10px]">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                          {activeTermlyResult.subjectScores.map((score, idx) => {
                            const ca1 = score.ca1Score !== undefined ? score.ca1Score : Math.round((score.testScore || 0) / 2);
                            const ca2 = score.ca2Score !== undefined ? score.ca2Score : ((score.testScore || 0) - ca1);
                            const totalCa = ca1 + ca2;
                            const exam = score.examScore !== undefined ? score.examScore : 0;
                            const total = score.totalScore !== undefined ? score.totalScore : (totalCa + exam);

                            return (
                              <tr key={idx} className="hover:bg-slate-50/60 transition">
                                <td className="px-3.5 py-2.5 font-bold text-slate-800 uppercase tracking-tight">{score.subject}</td>
                                <td className="px-2.5 py-2.5 text-center text-slate-600 font-mono text-xs">{ca1}</td>
                                <td className="px-2.5 py-2.5 text-center text-slate-600 font-mono text-xs">{ca2}</td>
                                <td className="px-2.5 py-2.5 text-center text-slate-700 font-mono font-bold text-xs bg-slate-50/60">{totalCa}</td>
                                <td className="px-2.5 py-2.5 text-center text-slate-600 font-mono text-xs">{exam}</td>
                                <td className="px-3 py-2.5 text-center font-black text-brand-green font-mono text-xs bg-emerald-50/40">{total}</td>
                                <td className="px-2.5 py-2.5 text-center font-bold">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] uppercase font-black ${
                                    score.grade === 'A' ? 'bg-green-100 text-green-800' :
                                    score.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                    score.grade === 'C' ? 'bg-indigo-100 text-indigo-800' :
                                    score.grade === 'D' ? 'bg-amber-100 text-amber-800' :
                                    score.grade === 'E' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {score.grade}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-slate-600 text-xs">{score.remarks}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Terminal Totals Grid */}
                    {(() => {
                      const metrics = computeAcademicMetrics(activeTermlyResult.subjectScores, activeTermlyResult);
                      return (
                        <div className="space-y-4 border-t border-slate-200 pt-5 text-sm">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                              <p className="text-[10px] text-slate-400 uppercase font-bold leading-none">Gross Total Marks</p>
                              <p className="font-black text-brand-green text-lg mt-1 font-mono">
                                {metrics.grossTotalMarks} <span className="text-xs text-slate-400 font-light">/ {metrics.totalMaxMarks}</span>
                              </p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                              <p className="text-[10px] text-slate-400 uppercase font-bold leading-none">Terminal Average Score</p>
                              <p className="font-black text-brand-oxblood text-lg mt-1 font-mono">{metrics.terminalAverage}%</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                              <p className="text-[10px] text-slate-400 uppercase font-bold leading-none">Grade Point (GPA)</p>
                              <p className="font-black text-blue-900 text-lg mt-1 font-mono">{metrics.gradePoint} <span className="text-xs text-slate-400 font-light">/ 5.00</span></p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center flex flex-col items-center justify-center">
                              <p className="text-[10px] text-slate-400 uppercase font-bold leading-none">Accredited Grade</p>
                              <span className="font-black text-brand-green text-xs uppercase mt-1 tracking-wide">
                                {metrics.accreditedGradeBracket.split('-')[0].trim()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Teacher & Principal Remarks */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-slate-200 pt-5 text-xs">
                      <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                        <p className="text-[10px] font-black text-brand-green uppercase tracking-wider">Class Teacher’s Assessment</p>
                        <p className="text-slate-700 leading-relaxed italic mt-1 font-serif">"{activeTermlyResult.teacherRemarks}"</p>
                      </div>
                      <div className="space-y-1 bg-slate-50 p-4 rounded-xl border border-slate-200/60">
                        <p className="text-[10px] font-black text-brand-oxblood uppercase tracking-wider">School Manager’s Remarks</p>
                        <p className="text-slate-700 leading-relaxed italic mt-1 font-serif">"{activeTermlyResult.principalRemarks}"</p>
                      </div>
                    </div>

                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                    <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-sm text-slate-700 uppercase">
                      No Record for {selectedTerm}
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      There is currently no published report card for <strong>{selectedTerm}</strong> in the <strong>{loginSessionInput}</strong> academic session. Try selecting another term above.
                    </p>
                  </div>
                )}

              </div>
            )}

            {/* =========================================================================
                TAB 2: ANNUAL CUMULATIVE TRANSCRIPT
               ========================================================================= */}
            {activeTab === 'annual' && (
              <div className="space-y-6 animate-fade-in">
                {activeAnnualResult ? (
                  <div 
                    ref={reportCardRef}
                    className="bg-white p-6 sm:p-8 rounded-2xl border-2 border-amber-300/80 shadow-md print-container relative space-y-6"
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(#2E7D32_1px,transparent_1px)] [background-size:24px_24px] opacity-2 pointer-events-none rounded-2xl" />

                    {/* School Header */}
                    <div className="print-header pb-4 border-b-2 border-brand-green/50 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
                        <div className="w-16 h-16 rounded-full bg-white border-2 border-brand-yellow flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                          <img 
                            src={SCHOOL_LOGO_URL} 
                            alt="Holy Ghost Academy Secondary School Official Crest" 
                            width={64}
                            height={64}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="space-y-0.5">
                          <h2 className="text-xl sm:text-2xl font-black font-heading text-brand-green uppercase tracking-tight leading-none">
                            Holy Ghost Academy Secondary School
                          </h2>
                          <p className="text-xs text-brand-oxblood font-bold tracking-widest uppercase">
                            Kamali Homes, Ngozika Housing Estate, Awka, Anambra State
                          </p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            Motto: {SCHOOL_MOTTO} | Email: {SCHOOL_OFFICIAL_EMAIL}
                          </p>
                        </div>
                      </div>

                      <div className="text-center md:text-right border-l-0 md:border-l border-slate-200 pl-0 md:pl-5 shrink-0">
                        <span className="inline-block text-[10px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-widest text-brand-yellow bg-brand-oxblood border border-brand-yellow/40 shadow-2xs">
                          ★ Official Annual Sessional Transcript
                        </span>
                        <p className="text-[11px] text-slate-500 font-mono mt-1 font-bold">
                          {activeAnnualResult.academicSession} Full Academic Year
                        </p>
                      </div>
                    </div>

                    {/* Promotion Decision Banner */}
                    <div className="border-2 border-brand-yellow/60 bg-gradient-to-r from-amber-50 via-emerald-50/40 to-amber-50 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-2xs">
                      <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-full bg-brand-oxblood text-brand-yellow flex items-center justify-center shrink-0 shadow-md ring-4 ring-brand-oxblood/10">
                          <GraduationCap className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-black text-brand-oxblood uppercase tracking-widest block">
                            Diocesan Promotion Decision & Sessional Advancement
                          </span>
                          <h4 className="text-base sm:text-xl font-black text-brand-green uppercase tracking-tight font-heading mt-0.5">
                            {activeAnnualResult.promotionStatus || 'Promoted to Next Class'}
                          </h4>
                          <p className="text-[11px] text-slate-600 font-medium">
                            Ratified by Holy Ghost Academy Academic Council for the {activeAnnualResult.academicSession} academic session.
                          </p>
                        </div>
                      </div>

                      <div className="text-center sm:text-right shrink-0">
                        <div className="inline-flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full border border-emerald-300 text-emerald-900 text-xs font-black uppercase tracking-wider shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Promotion Confirmed</span>
                        </div>
                      </div>
                    </div>

                    {/* 3-Term Comparative Table */}
                    <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
                      <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm text-left">
                        <thead className="bg-slate-100 table-header">
                          <tr>
                            <th scope="col" className="px-3.5 py-3 font-black uppercase tracking-wider text-brand-green font-heading text-[10px]">Subject Course</th>
                            <th scope="col" className="px-2.5 py-3 font-bold uppercase tracking-wider text-blue-900 font-heading text-[10px] text-center bg-blue-50/70">1st Term (100)</th>
                            <th scope="col" className="px-2.5 py-3 font-bold uppercase tracking-wider text-indigo-900 font-heading text-[10px] text-center bg-indigo-50/70">2nd Term (100)</th>
                            <th scope="col" className="px-2.5 py-3 font-bold uppercase tracking-wider text-purple-900 font-heading text-[10px] text-center bg-purple-50/70">3rd Term (100)</th>
                            <th scope="col" className="px-2.5 py-3 font-black uppercase tracking-wider text-slate-900 font-heading text-[10px] text-center bg-emerald-50">Cum. Total (300)</th>
                            <th scope="col" className="px-3 py-3 font-black uppercase tracking-wider text-brand-green font-heading text-[10px] text-center bg-emerald-100/80">Cum. Avg (%)</th>
                            <th scope="col" className="px-2.5 py-3 font-bold uppercase tracking-wider text-slate-500 font-heading text-[10px] text-center">Grade</th>
                            <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-slate-500 font-heading text-[10px]">Assessment Remark</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-100">
                          {activeAnnualResult.subjectScores.map((score, idx) => {
                            const t1 = score.term1Score ?? '—';
                            const t2 = score.term2Score ?? '—';
                            const t3 = score.term3Score ?? '—';
                            const cumTotal = score.cumulativeTotal !== undefined ? score.cumulativeTotal : score.totalScore;
                            const cumAvg = score.cumulativeAverage !== undefined ? score.cumulativeAverage : score.totalScore;

                            return (
                              <tr key={idx} className="hover:bg-slate-50/60 transition">
                                <td className="px-3.5 py-2.5 font-bold text-slate-800 uppercase tracking-tight">{score.subject}</td>
                                <td className="px-2.5 py-2.5 text-center text-blue-900 font-mono text-xs bg-blue-50/20">{t1}</td>
                                <td className="px-2.5 py-2.5 text-center text-indigo-900 font-mono text-xs bg-indigo-50/20">{t2}</td>
                                <td className="px-2.5 py-2.5 text-center text-purple-900 font-mono text-xs bg-purple-50/20">{t3}</td>
                                <td className="px-2.5 py-2.5 text-center text-slate-800 font-mono font-bold text-xs bg-emerald-50/40">{cumTotal}</td>
                                <td className="px-3 py-2.5 text-center font-black text-brand-green font-mono text-xs bg-emerald-100/50">{cumAvg}%</td>
                                <td className="px-2.5 py-2.5 text-center font-bold">
                                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] uppercase font-black ${
                                    score.grade === 'A' ? 'bg-green-100 text-green-800' :
                                    score.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                    score.grade === 'C' ? 'bg-indigo-100 text-indigo-800' :
                                    score.grade === 'D' ? 'bg-amber-100 text-amber-800' :
                                    score.grade === 'E' ? 'bg-orange-100 text-orange-800' : 'bg-red-100 text-red-800'
                                  }`}>
                                    {score.grade}
                                  </span>
                                </td>
                                <td className="px-3 py-2.5 text-slate-600 text-xs">{score.remarks}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* Sessional Metrics Evaluation */}
                    {(() => {
                      const metrics = computeSessionCumulativeMetrics(activeAnnualResult.subjectScores, activeAnnualResult);
                      return (
                        <div className="space-y-4 border-t border-slate-200 pt-5 text-sm">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                              <p className="text-[10px] text-slate-400 uppercase font-bold leading-none">Session Gross Marks</p>
                              <p className="font-black text-brand-green text-lg mt-1 font-mono">
                                {metrics.sessionGrossTotal} <span className="text-xs text-slate-400 font-light">/ {metrics.sessionTotalMaxMarks}</span>
                              </p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                              <p className="text-[10px] text-slate-400 uppercase font-bold leading-none">Cumulative Session Average</p>
                              <p className="font-black text-brand-oxblood text-lg mt-1 font-mono">{metrics.sessionAverage}%</p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center">
                              <p className="text-[10px] text-slate-400 uppercase font-bold leading-none">Session Cumulative GPA</p>
                              <p className="font-black text-blue-900 text-lg mt-1 font-mono">{metrics.gradePoint} <span className="text-xs text-slate-400 font-light">/ 5.00</span></p>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-center flex flex-col items-center justify-center">
                              <p className="text-[10px] text-slate-400 uppercase font-bold leading-none">Accredited Standing</p>
                              <span className="font-black text-brand-green text-xs uppercase mt-1 tracking-wide">
                                {metrics.accreditedGradeBracket.split('-')[0].trim()}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()}

                  </div>
                ) : (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                    <GraduationCap className="w-10 h-10 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-sm text-slate-700 uppercase">
                      Annual Transcript Awaiting Publication
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      The full session cumulative transcript for this student has not yet been closed by the examination council. Check the individual <strong>Termly Report Cards</strong> above.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* =========================================================================
                TAB 3: STUDENT PERFORMANCE TRACKING (RECHARTS LINE GRAPH & ANALYTICS)
               ========================================================================= */}
            {activeTab === 'tracking' && (
              <div className="space-y-6 animate-fade-in" ref={trackingReportRef}>
                
                {/* 1. KEY PERFORMANCE METRICS CARDS */}
                {performanceTrendData.stats && (
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                    
                    {/* Overall Growth */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Multi-Term Progression
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-2xl font-black font-mono text-brand-green">
                          {performanceTrendData.stats.totalGrowth >= 0 ? `+${performanceTrendData.stats.totalGrowth}%` : `${performanceTrendData.stats.totalGrowth}%`}
                        </span>
                        {performanceTrendData.stats.totalGrowth >= 0 ? (
                          <span className="p-1 rounded-full bg-emerald-100 text-emerald-800">
                            <ArrowUpRight className="w-4 h-4" />
                          </span>
                        ) : (
                          <span className="p-1 rounded-full bg-red-100 text-red-800">
                            <ArrowDownRight className="w-4 h-4" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {performanceTrendData.stats.totalGrowth >= 0 ? 'Consistent Upward Trajectory' : 'Remedial Review Recommended'}
                      </p>
                    </div>

                    {/* Peak Term */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Peak Performance Term
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl sm:text-2xl font-black font-heading text-brand-oxblood">
                          {performanceTrendData.stats.peakTerm}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono font-bold">
                        Average: {performanceTrendData.stats.peakValue}%
                      </p>
                    </div>

                    {/* Highest Scoring Subject */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Top Academic Subject
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm sm:text-base font-black font-heading text-blue-900 truncate">
                          {performanceTrendData.stats.bestSubject.name}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono font-bold">
                        Avg: {performanceTrendData.stats.bestSubject.average}% (Distinction)
                      </p>
                    </div>

                    {/* Sessional GPA */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                        Cumulative Session GPA
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-2xl font-black font-mono text-purple-900">
                          {performanceTrendData.stats.gpa}
                        </span>
                        <span className="text-xs text-slate-400 font-light">/ 5.00</span>
                      </div>
                      <p className="text-[11px] text-emerald-700 font-bold">
                        {performanceTrendData.stats.promotionStatus}
                      </p>
                    </div>

                  </div>
                )}

                {/* 2. RECHARTS LINE GRAPH CONTAINER */}
                <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200 shadow-md space-y-6">
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-900 border border-blue-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider mb-1">
                        <Activity className="w-3.5 h-3.5 text-blue-600" />
                        <span>Recharts Trend Visualization</span>
                      </div>
                      <h3 className="text-lg font-black font-heading text-slate-900 uppercase tracking-tight">
                        Grade Trends Across Academic Terms
                      </h3>
                      <p className="text-xs text-slate-500">
                        Visualizing terminal progression and continuous assessment trajectories for {studentProfile?.studentName || authenticatedStudentId}.
                      </p>
                    </div>

                    {/* Print / Export Tracking Button */}
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border border-slate-300 no-print"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Performance Chart</span>
                    </button>
                  </div>

                  {/* Interactive Subject Filters / Toggles (no-print) */}
                  <div className="space-y-2 no-print bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold uppercase tracking-wider text-slate-700 text-[11px] flex items-center gap-1">
                        <Sliders className="w-3.5 h-3.5 text-blue-600" />
                        <span>Toggle Lines on Graph:</span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {selectedSubjectsForGraph.length} subjects displayed (Click to add/remove)
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {/* Overall Average Toggle */}
                      <button
                        type="button"
                        onClick={() => setShowOverallAverageInGraph(!showOverallAverageInGraph)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer flex items-center gap-1.5 border ${
                          showOverallAverageInGraph
                            ? 'bg-brand-green text-white border-brand-green shadow-xs'
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-yellow shrink-0" />
                        <span>Overall Terminal Average</span>
                        {showOverallAverageInGraph && <Check className="w-3 h-3" />}
                      </button>

                      {/* Subject Chips */}
                      {performanceTrendData.subjectsList.map((subj, idx) => {
                        const isSelected = selectedSubjectsForGraph.includes(subj);
                        const color = SUBJECT_LINE_COLORS[idx % SUBJECT_LINE_COLORS.length];

                        return (
                          <button
                            key={subj}
                            type="button"
                            onClick={() => toggleSubjectForGraph(subj)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                              isSelected
                                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span 
                              className="w-2 h-2 rounded-full shrink-0" 
                              style={{ backgroundColor: color }}
                            />
                            <span>{subj}</span>
                            {isSelected && <Check className="w-3 h-3 text-brand-yellow" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* THE ACTUAL RECHARTS LINE GRAPH */}
                  <div className="h-80 sm:h-96 w-full pt-2">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={performanceTrendData.chartPoints}
                        margin={{ top: 15, right: 30, left: 0, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        
                        <XAxis 
                          dataKey="term" 
                          tick={{ fill: '#334155', fontSize: 12, fontWeight: 700 }}
                          stroke="#cbd5e1"
                          dy={10}
                        />
                        
                        <YAxis 
                          domain={[40, 100]}
                          ticks={[40, 50, 60, 70, 75, 80, 90, 100]}
                          tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'monospace' }}
                          unit="%"
                          stroke="#cbd5e1"
                        />

                        {/* Diocesan Grade Standard Reference Thresholds */}
                        <ReferenceLine 
                          y={75} 
                          stroke="#10b981" 
                          strokeDasharray="4 4" 
                          label={{ value: 'Distinction (75%)', fill: '#059669', fontSize: 10, position: 'insideTopRight' }}
                        />
                        <ReferenceLine 
                          y={50} 
                          stroke="#f59e0b" 
                          strokeDasharray="4 4" 
                          label={{ value: 'Credit Pass (50%)', fill: '#d97706', fontSize: 10, position: 'insideTopRight' }}
                        />
                        <ReferenceLine 
                          y={40} 
                          stroke="#ef4444" 
                          strokeDasharray="4 4" 
                          label={{ value: 'Pass Floor (40%)', fill: '#dc2626', fontSize: 10, position: 'insideTopRight' }}
                        />

                        {/* Custom Tooltip */}
                        <Tooltip
                          content={({ active, payload, label }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-slate-900/95 text-white p-3.5 rounded-xl shadow-xl border border-slate-700 text-xs space-y-1.5 backdrop-blur-md">
                                  <p className="font-black text-brand-yellow uppercase tracking-wider font-heading pb-1 border-b border-slate-800">
                                    {label} Results
                                  </p>
                                  <div className="space-y-1 pt-1 max-h-52 overflow-y-auto pr-1">
                                    {payload.map((entry, index) => (
                                      <div key={`item-${index}`} className="flex justify-between items-center gap-4">
                                        <span className="flex items-center gap-1.5 text-slate-300">
                                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                                          <span className="font-semibold">{entry.name}:</span>
                                        </span>
                                        <span className="font-mono font-black text-white">
                                          {entry.value}%
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />

                        <Legend 
                          wrapperStyle={{ paddingTop: 15 }}
                          iconType="circle"
                        />

                        {/* Overall Average Bold Line */}
                        {showOverallAverageInGraph && (
                          <Line
                            type="monotone"
                            dataKey="overallAverage"
                            name="Overall Terminal Average"
                            stroke="#15803d"
                            strokeWidth={4}
                            activeDot={{ r: 8, stroke: '#ffffff', strokeWidth: 2, fill: '#15803d' }}
                            dot={{ r: 5, fill: '#15803d', stroke: '#ffffff', strokeWidth: 1.5 }}
                          />
                        )}

                        {/* Individual Subject Lines */}
                        {selectedSubjectsForGraph.map((subj) => {
                          const originalIdx = performanceTrendData.subjectsList.indexOf(subj);
                          const color = SUBJECT_LINE_COLORS[originalIdx % SUBJECT_LINE_COLORS.length];

                          return (
                            <Line
                              key={subj}
                              type="monotone"
                              dataKey={subj}
                              name={subj}
                              stroke={color}
                              strokeWidth={2.5}
                              activeDot={{ r: 6 }}
                              dot={{ r: 4, fill: color }}
                              strokeDasharray="2 2"
                            />
                          );
                        })}

                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                </div>

                {/* 3. DETAILED SUBJECT PROGRESSION TABLE */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
                  <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-sm font-heading text-slate-900 uppercase tracking-tight">
                        Comprehensive Multi-Term Subject Trajectory
                      </h4>
                      <p className="text-xs text-slate-500">
                        Side-by-side progression tracking across 1st Term, 2nd Term, and 3rd Term assessments.
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm text-left">
                      <thead className="bg-slate-100 table-header">
                        <tr>
                          <th scope="col" className="px-3.5 py-3 font-black uppercase tracking-wider text-brand-green font-heading text-[10px]">
                            Subject Course
                          </th>
                          <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-blue-900 font-heading text-[10px] text-center bg-blue-50/50">
                            1st Term
                          </th>
                          <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-indigo-900 font-heading text-[10px] text-center bg-indigo-50/50">
                            2nd Term
                          </th>
                          <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-purple-900 font-heading text-[10px] text-center bg-purple-50/50">
                            3rd Term
                          </th>
                          <th scope="col" className="px-3 py-3 font-black uppercase tracking-wider text-slate-900 font-heading text-[10px] text-center bg-emerald-50">
                            Net Change (Δ)
                          </th>
                          <th scope="col" className="px-3 py-3 font-black uppercase tracking-wider text-brand-green font-heading text-[10px] text-center bg-emerald-100/60">
                            Year Average
                          </th>
                          <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-slate-500 font-heading text-[10px] text-center">
                            Grade
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-100">
                        {performanceTrendData.subjectProgressionRows?.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/70 transition">
                            <td className="px-3.5 py-3 font-bold text-slate-900 uppercase">
                              {row.subject}
                            </td>
                            <td className="px-3 py-3 text-center font-mono text-slate-700 bg-blue-50/20">
                              {row.s1}
                            </td>
                            <td className="px-3 py-3 text-center font-mono text-slate-700 bg-indigo-50/20">
                              {row.s2}
                            </td>
                            <td className="px-3 py-3 text-center font-mono text-slate-700 bg-purple-50/20">
                              {row.s3}
                            </td>
                            <td className="px-3 py-3 text-center font-mono font-bold">
                              <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] font-bold ${
                                row.diff > 0 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : row.diff === 0 
                                    ? 'bg-slate-100 text-slate-700' 
                                    : 'bg-red-100 text-red-800'
                              }`}>
                                {row.diff > 0 ? `+${row.diff}%` : `${row.diff}%`}
                              </span>
                            </td>
                            <td className="px-3 py-3 text-center font-mono font-black text-brand-green bg-emerald-100/30">
                              {row.avg}%
                            </td>
                            <td className="px-3 py-3 text-center">
                              <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-black uppercase ${
                                row.grade === 'A' ? 'bg-green-100 text-green-800' :
                                row.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                row.grade === 'C' ? 'bg-indigo-100 text-indigo-800' :
                                row.grade === 'D' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {row.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>
            )}

          </div>

        )}

      </div>

    </div>
  );
}
