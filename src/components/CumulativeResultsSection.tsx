import React, { useState, useMemo, useRef } from 'react';
import { 
  Award, BookOpen, Calculator, Calendar, Camera, Check, CheckCircle2, 
  Copy, Download, Edit, Eye, FileSpreadsheet, FileText, GraduationCap, 
  Key, Plus, Printer, RefreshCw, Search, ShieldCheck, Sparkles, 
  Trash, User, Users, X, ChevronRight, AlertCircle, ArrowUpRight
} from 'lucide-react';
import { StudentResult, SubjectScore } from '../types';
import { 
  computeCumulativeSubjectMetrics, 
  computeSessionCumulativeMetrics, 
  getGradeFromScore, 
  getNextClassLevel, 
  getSubjectAssessmentRemark, 
  STANDARD_JUNIOR_SUBJECTS, 
  STANDARD_SENIOR_SUBJECTS, 
  STANDARD_PROMOTION_STATUS_OPTIONS, 
  SCHOOL_LOGO_URL, 
  SCHOOL_OFFICIAL_NAME, 
  SCHOOL_MOTTO, 
  SCHOOL_MANAGER_NAME, 
  SCHOOL_OFFICIAL_EMAIL 
} from '../gradeUtils';

interface CumulativeResultsSectionProps {
  results: StudentResult[];
  onAddResult: (item: StudentResult) => void;
  onEditResult?: (id: string, fields: Partial<StudentResult>) => void;
  onDeleteResult: (id: string) => void;
  onSwitchToTerminalRegistrar?: () => void;
}

export const CumulativeResultsSection: React.FC<CumulativeResultsSectionProps> = ({
  results,
  onAddResult,
  onEditResult,
  onDeleteResult,
  onSwitchToTerminalRegistrar
}) => {
  // Navigation inside Cumulative Desk
  const [activeTab, setActiveTab] = useState<'input' | 'registry'>('input');

  // Editing state
  const [editingResultId, setEditingResultId] = useState<string | null>(null);
  const [formSuccessMessage, setFormSuccessMessage] = useState<string>('');
  const [formErrorMessage, setFormErrorMessage] = useState<string>('');

  // Selected student from existing records for quick auto-fill
  const [selectedStudentForAutofill, setSelectedStudentForAutofill] = useState<string>('');

  // Student Identity Fields
  const [studentId, setStudentId] = useState<string>('');
  const [studentName, setStudentName] = useState<string>('');
  const [classLevel, setClassLevel] = useState<string>('SS 2');
  const [academicSession, setAcademicSession] = useState<string>('2025/2026');
  const [gender, setGender] = useState<string>('Male');
  const [rollNumber, setRollNumber] = useState<string>('01');
  const [cumulativeAttendance, setCumulativeAttendance] = useState<string>('250 of 255 Days');
  const [passportPhoto, setPassportPhoto] = useState<string>('');
  const [accessPassword, setAccessPassword] = useState<string>('');

  // Per-Subject Multi-Term Scores Matrix
  const [subjectRows, setSubjectRows] = useState<SubjectScore[]>([
    {
      subject: 'Mathematics',
      term1Score: 82,
      term2Score: 86,
      term3Score: 90,
      cumulativeTotal: 258,
      cumulativeAverage: 86,
      cumulativeGrade: 'A',
      testScore: 35,
      examScore: 55,
      totalScore: 86,
      grade: 'A',
      remarks: 'Distinction'
    },
    {
      subject: 'English Language',
      term1Score: 78,
      term2Score: 80,
      term3Score: 84,
      cumulativeTotal: 242,
      cumulativeAverage: 80.7,
      cumulativeGrade: 'A',
      testScore: 32,
      examScore: 50,
      totalScore: 80.7,
      grade: 'A',
      remarks: 'Excellent'
    },
    {
      subject: 'Physics',
      term1Score: 85,
      term2Score: 88,
      term3Score: 92,
      cumulativeTotal: 265,
      cumulativeAverage: 88.3,
      cumulativeGrade: 'A',
      testScore: 36,
      examScore: 54,
      totalScore: 88.3,
      grade: 'A',
      remarks: 'Distinction'
    },
    {
      subject: 'Chemistry',
      term1Score: 80,
      term2Score: 82,
      term3Score: 88,
      cumulativeTotal: 250,
      cumulativeAverage: 83.3,
      cumulativeGrade: 'A',
      testScore: 34,
      examScore: 52,
      totalScore: 83.3,
      grade: 'A',
      remarks: 'Distinction'
    },
    {
      subject: 'Biology',
      term1Score: 74,
      term2Score: 78,
      term3Score: 82,
      cumulativeTotal: 234,
      cumulativeAverage: 78,
      cumulativeGrade: 'A',
      testScore: 31,
      examScore: 48,
      totalScore: 78,
      grade: 'A',
      remarks: 'Excellent'
    }
  ]);

  // Session Summary Metric Overrides
  const [position, setPosition] = useState<string>('1st of 35');
  const [grossTotalMarks, setGrossTotalMarks] = useState<number | undefined>(undefined);
  const [terminalAverage, setTerminalAverage] = useState<number | undefined>(undefined);
  const [gradePoint, setGradePoint] = useState<number | undefined>(undefined);
  const [accreditedGradeBracket, setAccreditedGradeBracket] = useState<string>('');
  const [classStanding, setClassStanding] = useState<string>('');
  const [promotionStatus, setPromotionStatus] = useState<string>('');

  // Remarks
  const [teacherRemarks, setTeacherRemarks] = useState<string>(
    'Consistently demonstrated superior academic prowess and exemplary conduct across all three terms.'
  );
  const [principalRemarks, setPrincipalRemarks] = useState<string>(
    'Outstanding annual scholastic achievement. High moral discipline and leadership proven. Promotion approved.'
  );

  // Registry Search & Filters
  const [registrySearch, setRegistrySearch] = useState<string>('');
  const [registryClassFilter, setRegistryClassFilter] = useState<string>('All');
  const [registrySessionFilter, setRegistrySessionFilter] = useState<string>('All');

  // Transcript Preview Modal
  const [viewTranscriptRecord, setViewTranscriptRecord] = useState<StudentResult | null>(null);
  const [copiedPin, setCopiedPin] = useState<string | null>(null);

  // Form reference for scrolling
  const formRef = useRef<HTMLFormElement>(null);

  // Filter existing results for distinct students list
  const existingStudents = useMemo(() => {
    const map = new Map<string, { studentId: string; studentName: string; classLevel: string }>();
    results.forEach((r) => {
      if (r.studentId && !map.has(r.studentId)) {
        map.set(r.studentId, {
          studentId: r.studentId,
          studentName: r.studentName,
          classLevel: r.classLevel
        });
      }
    });
    return Array.from(map.values()).sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [results]);

  // All Cumulative Results in Store
  const cumulativeResults = useMemo(() => {
    return results.filter(
      (r) => r.isCumulative === true || r.term === 'Annual Cumulative' || r.term.toLowerCase().includes('cumulative')
    );
  }, [results]);

  // Filtered Cumulative Results for Registry
  const filteredCumulativeResults = useMemo(() => {
    return cumulativeResults.filter((r) => {
      if (registryClassFilter !== 'All' && r.classLevel !== registryClassFilter) return false;
      if (registrySessionFilter !== 'All' && r.academicSession !== registrySessionFilter) return false;
      if (!registrySearch.trim()) return true;
      const q = registrySearch.toLowerCase();
      return (
        r.studentName.toLowerCase().includes(q) ||
        r.studentId.toLowerCase().includes(q) ||
        r.classLevel.toLowerCase().includes(q) ||
        r.academicSession.toLowerCase().includes(q)
      );
    });
  }, [cumulativeResults, registryClassFilter, registrySessionFilter, registrySearch]);

  // Unique sessions available in cumulative results
  const availableSessions = useMemo(() => {
    const set = new Set<string>(['2025/2026', '2026/2027', '2024/2025']);
    results.forEach((r) => {
      if (r.academicSession) set.add(r.academicSession);
    });
    return Array.from(set).sort().reverse();
  }, [results]);

  // Live session metrics calculated from subjectRows
  const liveSessionMetrics = useMemo(() => {
    return computeSessionCumulativeMetrics(subjectRows, {
      classLevel,
      position,
      promotionStatus: promotionStatus || undefined,
      accreditedGradeBracket: accreditedGradeBracket || undefined,
      classStanding: classStanding || undefined
    });
  }, [subjectRows, classLevel, position, promotionStatus, accreditedGradeBracket, classStanding]);

  // Handle row score change (Term 1, 2, or 3)
  const handleScoreChange = (
    index: number,
    termKey: 'term1Score' | 'term2Score' | 'term3Score',
    val: string
  ) => {
    const num = val === '' ? undefined : Math.min(100, Math.max(0, Number(val)));
    const updated = [...subjectRows];
    const row = { ...updated[index], [termKey]: num };

    // Recompute row metrics
    const metrics = computeCumulativeSubjectMetrics(row.term1Score, row.term2Score, row.term3Score);
    row.cumulativeTotal = metrics.cumulativeTotal;
    row.cumulativeAverage = metrics.cumulativeAverage;
    row.cumulativeGrade = metrics.grade;
    row.totalScore = metrics.cumulativeAverage; // Compatible with standard viewers
    row.grade = metrics.grade;
    row.remarks = metrics.remark;

    updated[index] = row;
    setSubjectRows(updated);
  };

  // Handle subject title or custom remarks change
  const handleRowFieldChange = (index: number, field: keyof SubjectScore, value: any) => {
    const updated = [...subjectRows];
    updated[index] = { ...updated[index], [field]: value };
    setSubjectRows(updated);
  };

  // Add a new empty subject row
  const handleAddSubjectRow = () => {
    setSubjectRows((prev) => [
      ...prev,
      {
        subject: '',
        term1Score: 0,
        term2Score: 0,
        term3Score: 0,
        cumulativeTotal: 0,
        cumulativeAverage: 0,
        cumulativeGrade: 'F',
        testScore: 0,
        examScore: 0,
        totalScore: 0,
        grade: 'F',
        remarks: 'Below pass threshold'
      }
    ]);
  };

  // Remove a subject row
  const handleRemoveSubjectRow = (index: number) => {
    if (subjectRows.length <= 1) {
      alert('At least one subject is required for an academic result.');
      return;
    }
    setSubjectRows((prev) => prev.filter((_, i) => i !== index));
  };

  // Load standard curriculum subjects
  const handleLoadCurriculum = (type: 'junior' | 'senior') => {
    const list = type === 'junior' ? STANDARD_JUNIOR_SUBJECTS : STANDARD_SENIOR_SUBJECTS;
    const newRows: SubjectScore[] = list.map((subj) => {
      // Retain existing scores if subject was already present
      const existing = subjectRows.find((r) => r.subject.toLowerCase() === subj.toLowerCase());
      if (existing) return existing;
      return {
        subject: subj,
        term1Score: 0,
        term2Score: 0,
        term3Score: 0,
        cumulativeTotal: 0,
        cumulativeAverage: 0,
        cumulativeGrade: 'F',
        testScore: 0,
        examScore: 0,
        totalScore: 0,
        grade: 'F',
        remarks: 'Pending examination'
      };
    });
    setSubjectRows(newRows);
  };

  // Auto-Pull from existing 1st, 2nd, and 3rd term terminal results
  const handleAutoPullFromTerminalRecords = (targetStudentId?: string) => {
    const sId = (targetStudentId || studentId).trim().toUpperCase();
    if (!sId) {
      alert('Please enter or select a Student ID / Reg No first.');
      return;
    }

    // Find all terminal records matching this student and session
    const matchingRecords = results.filter(
      (r) =>
        r.studentId.trim().toUpperCase() === sId &&
        r.academicSession.trim() === academicSession.trim() &&
        r.term !== 'Annual Cumulative' &&
        !r.isCumulative
    );

    if (matchingRecords.length === 0) {
      alert(
        `No terminal records found for student ${sId} in session ${academicSession}.\nYou can still input the cumulative scores manually below.`
      );
      return;
    }

    // Auto-fill student metadata if not already filled
    const firstRecord = matchingRecords[0];
    if (!studentName) setStudentName(firstRecord.studentName);
    if (!classLevel) setClassLevel(firstRecord.classLevel);
    if (firstRecord.gender) setGender(firstRecord.gender);
    if (firstRecord.rollNumber) setRollNumber(firstRecord.rollNumber);
    if (firstRecord.passportPhoto && !passportPhoto) setPassportPhoto(firstRecord.passportPhoto);
    if (firstRecord.accessPassword && !accessPassword) setAccessPassword(firstRecord.accessPassword);

    // Group subjects across 1st Term, 2nd Term, 3rd Term
    const term1Record = matchingRecords.find((r) => r.term.includes('1st'));
    const term2Record = matchingRecords.find((r) => r.term.includes('2nd'));
    const term3Record = matchingRecords.find((r) => r.term.includes('3rd'));

    // Gather all distinct subjects
    const subjectMap = new Map<string, { term1?: number; term2?: number; term3?: number }>();

    matchingRecords.forEach((rec) => {
      rec.subjectScores?.forEach((sub) => {
        const key = sub.subject.trim();
        if (!subjectMap.has(key)) {
          subjectMap.set(key, {});
        }
        const entry = subjectMap.get(key)!;
        if (rec.term.includes('1st')) entry.term1 = sub.totalScore;
        else if (rec.term.includes('2nd')) entry.term2 = sub.totalScore;
        else if (rec.term.includes('3rd')) entry.term3 = sub.totalScore;
      });
    });

    if (subjectMap.size === 0) {
      alert('Terminal records were found, but no subject scores were registered inside them.');
      return;
    }

    // Construct compiled subject rows
    const compiledRows: SubjectScore[] = Array.from(subjectMap.entries()).map(([subjName, scores]) => {
      const metrics = computeCumulativeSubjectMetrics(scores.term1, scores.term2, scores.term3);
      return {
        subject: subjName,
        term1Score: scores.term1 ?? 0,
        term2Score: scores.term2 ?? 0,
        term3Score: scores.term3 ?? 0,
        cumulativeTotal: metrics.cumulativeTotal,
        cumulativeAverage: metrics.cumulativeAverage,
        cumulativeGrade: metrics.grade,
        testScore: Math.round(metrics.cumulativeAverage * 0.4),
        examScore: Math.round(metrics.cumulativeAverage * 0.6),
        totalScore: metrics.cumulativeAverage,
        grade: metrics.grade,
        remarks: metrics.remark
      };
    });

    setSubjectRows(compiledRows);

    // Calculate term averages if available
    const t1Avg = term1Record ? computeSessionCumulativeMetrics(term1Record.subjectScores).sessionAverage : undefined;
    const t2Avg = term2Record ? computeSessionCumulativeMetrics(term2Record.subjectScores).sessionAverage : undefined;
    const t3Avg = term3Record ? computeSessionCumulativeMetrics(term3Record.subjectScores).sessionAverage : undefined;

    setFormSuccessMessage(
      `Successfully aggregated scores from ${matchingRecords.length} termly report sheet(s) for ${firstRecord.studentName}!`
    );
    setTimeout(() => setFormSuccessMessage(''), 5000);
  };

  // Select existing student handler
  const handleSelectExistingStudent = (sId: string) => {
    setSelectedStudentForAutofill(sId);
    if (!sId) return;

    const matched = results.find((r) => r.studentId === sId);
    if (matched) {
      setStudentId(matched.studentId);
      setStudentName(matched.studentName);
      setClassLevel(matched.classLevel);
      if (matched.gender) setGender(matched.gender);
      if (matched.rollNumber) setRollNumber(matched.rollNumber);
      if (matched.passportPhoto) setPassportPhoto(matched.passportPhoto);
      if (matched.accessPassword) setAccessPassword(matched.accessPassword);

      // Offer auto-pull
      handleAutoPullFromTerminalRecords(matched.studentId);
    }
  };

  // Sync metrics from live calculations
  const handleAutoSyncMetrics = () => {
    setGrossTotalMarks(liveSessionMetrics.sessionGrossTotal);
    setTerminalAverage(liveSessionMetrics.sessionAverage);
    setGradePoint(liveSessionMetrics.gradePoint);
    setAccreditedGradeBracket(liveSessionMetrics.accreditedGradeBracket);
    setClassStanding(liveSessionMetrics.classStanding);
    setPromotionStatus(liveSessionMetrics.promotionStatus);
  };

  // Handle Passport Photo Upload from Device
  const handlePassportUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('Photo size exceeds 2MB limit. Please select an optimized portrait image.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setPassportPhoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Load record into editor
  const handleStartEdit = (record: StudentResult) => {
    setEditingResultId(record.id);
    setStudentId(record.studentId);
    setStudentName(record.studentName);
    setClassLevel(record.classLevel);
    setAcademicSession(record.academicSession);
    setGender(record.gender || 'Male');
    setRollNumber(record.rollNumber || '01');
    setCumulativeAttendance(record.cumulativeAttendance || record.attendance || '250 of 255 Days');
    setPassportPhoto(record.passportPhoto || '');
    setAccessPassword(record.accessPassword || '');

    setPosition(record.position || '1st of 35');
    setGrossTotalMarks(record.sessionGrossTotalMarks || record.grossTotalMarks);
    setTerminalAverage(record.cumulativeSessionAverage || record.terminalAverage);
    setGradePoint(record.gradePoint);
    setAccreditedGradeBracket(record.accreditedGradeBracket || '');
    setClassStanding(record.classStanding || '');
    setPromotionStatus(record.promotionStatus || '');

    setTeacherRemarks(record.teacherRemarks || '');
    setPrincipalRemarks(record.principalRemarks || '');

    if (record.subjectScores && record.subjectScores.length > 0) {
      setSubjectRows(record.subjectScores);
    }

    setActiveTab('input');
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setEditingResultId(null);
    setStudentId('');
    setStudentName('');
    setSelectedStudentForAutofill('');
    setFormSuccessMessage('');
    setFormErrorMessage('');
  };

  // Form Submit: Save or Update Cumulative Record
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrorMessage('');
    setFormSuccessMessage('');

    if (!studentId.trim() || !studentName.trim()) {
      setFormErrorMessage('Please provide both the Student ID and Full Name.');
      return;
    }

    if (subjectRows.length === 0) {
      setFormErrorMessage('Please add at least one subject to this cumulative record.');
      return;
    }

    // Format subjects
    const formattedSubjects: SubjectScore[] = subjectRows.map((row) => {
      const metrics = computeCumulativeSubjectMetrics(row.term1Score, row.term2Score, row.term3Score);
      return {
        subject: row.subject.trim() || 'General Studies',
        term1Score: row.term1Score ?? 0,
        term2Score: row.term2Score ?? 0,
        term3Score: row.term3Score ?? 0,
        cumulativeTotal: metrics.cumulativeTotal,
        cumulativeAverage: metrics.cumulativeAverage,
        cumulativeGrade: metrics.grade,
        testScore: Math.round(metrics.cumulativeAverage * 0.4),
        examScore: Math.round(metrics.cumulativeAverage * 0.6),
        totalScore: metrics.cumulativeAverage,
        grade: metrics.grade,
        remarks: row.remarks || metrics.remark,
        subjectPosition: row.subjectPosition
      };
    });

    const evaluated = computeSessionCumulativeMetrics(formattedSubjects, {
      classLevel,
      position,
      promotionStatus: promotionStatus || undefined,
      accreditedGradeBracket: accreditedGradeBracket || undefined,
      classStanding: classStanding || undefined
    });

    const finalRecord: StudentResult = {
      id: editingResultId || `res-cumul-${Date.now()}`,
      studentId: studentId.trim().toUpperCase(),
      studentName: studentName.trim(),
      passportPhoto: passportPhoto.trim() || undefined,
      classLevel,
      term: 'Annual Cumulative',
      academicSession: academicSession.trim(),
      gender,
      rollNumber: rollNumber.trim(),
      position: position.trim() || `${liveSessionMetrics.promotionStatus}`,
      attendance: cumulativeAttendance.trim() || '250 of 255 Days',
      cumulativeAttendance: cumulativeAttendance.trim() || '250 of 255 Days',
      promotionStatus: promotionStatus.trim() || evaluated.promotionStatus,
      grossTotalMarks: grossTotalMarks !== undefined ? grossTotalMarks : evaluated.sessionGrossTotal,
      sessionGrossTotalMarks: grossTotalMarks !== undefined ? grossTotalMarks : evaluated.sessionGrossTotal,
      terminalAverage: terminalAverage !== undefined ? terminalAverage : evaluated.sessionAverage,
      cumulativeSessionAverage: terminalAverage !== undefined ? terminalAverage : evaluated.sessionAverage,
      gradePoint: gradePoint !== undefined ? gradePoint : evaluated.gradePoint,
      accreditedGradeBracket: accreditedGradeBracket.trim() || evaluated.accreditedGradeBracket,
      classStanding: classStanding.trim() || evaluated.classStanding,
      principalRemarks: principalRemarks.trim() || 'Annual academic session evaluation completed and approved.',
      teacherRemarks: teacherRemarks.trim() || 'Commendable diligence throughout the academic year.',
      subjectScores: formattedSubjects,
      accessPassword: accessPassword.trim() || undefined,
      isCumulative: true,
      sessionTotalMaxMarks: evaluated.sessionTotalMaxMarks
    };

    if (editingResultId && onEditResult) {
      onEditResult(editingResultId, finalRecord);
      setFormSuccessMessage(`Updated cumulative session result for ${finalRecord.studentName} (${finalRecord.studentId}) successfully!`);
    } else {
      onAddResult(finalRecord);
      setFormSuccessMessage(`Published cumulative session record for ${finalRecord.studentName} (${finalRecord.studentId}) successfully!`);
    }

    setEditingResultId(null);
    setTimeout(() => setFormSuccessMessage(''), 6000);
  };

  // Copy PIN
  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2500);
  };

  // Print Transcript
  const handlePrintTranscript = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-brand-green to-teal-900 text-white p-5 rounded-xl shadow-sm border border-emerald-700/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-6">
          <Calculator className="w-56 h-56 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="bg-brand-yellow/20 text-brand-yellow border border-brand-yellow/40 text-[10px] font-black uppercase px-2.5 py-0.5 rounded tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Annual Session Registrar</span>
              </span>
              <span className="text-[11px] text-emerald-200 font-mono">Diocesan Standards</span>
            </div>
            <h3 className="text-lg md:text-xl font-black font-heading uppercase tracking-tight text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-brand-yellow" />
              <span>Cumulative Academic Session Results Section</span>
            </h3>
            <p className="text-xs text-emerald-100 max-w-2xl leading-relaxed">
              Input, compute, and publish the full-year cumulative results of students across <strong>1st Term</strong>, <strong>2nd Term</strong>, and <strong>3rd Term</strong>. Auto-aggregates multi-term weighted averages, cumulative Grade Points (CGPA), diocesan grade brackets, and promotion decisions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {onSwitchToTerminalRegistrar && (
              <button
                type="button"
                onClick={onSwitchToTerminalRegistrar}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 border border-white/30 text-white rounded text-xs font-bold uppercase transition cursor-pointer flex items-center space-x-1"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Terminal Grade Book</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setActiveTab('registry')}
              className={`px-3.5 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center space-x-1.5 shadow-xs ${
                activeTab === 'registry'
                  ? 'bg-brand-yellow text-slate-900 border border-brand-yellow'
                  : 'bg-white text-brand-green hover:bg-emerald-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Cumulative Registry ({cumulativeResults.length})</span>
            </button>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-emerald-700/50">
          <button
            type="button"
            onClick={() => setActiveTab('input')}
            className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'input'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Input Cumulative Result Sheet</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('registry')}
            className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 transition cursor-pointer ${
              activeTab === 'registry'
                ? 'bg-white text-emerald-950 shadow-xs'
                : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cumulative Records & Broadsheet ({cumulativeResults.length})</span>
          </button>
        </div>
      </div>

      {/* Success / Error Banners */}
      {formSuccessMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-3.5 rounded-lg flex items-center justify-between text-xs font-bold animate-fade-in shadow-2xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{formSuccessMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFormSuccessMessage('')}
            className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {formErrorMessage && (
        <div className="bg-rose-50 border border-rose-300 text-rose-900 p-3.5 rounded-lg flex items-center justify-between text-xs font-bold animate-fade-in shadow-2xs">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-rose-700 shrink-0" />
            <span>{formErrorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setFormErrorMessage('')}
            className="text-rose-700 hover:text-rose-950 p-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 1: CUMULATIVE RESULT INPUT FORM                                  */}
      {/* ========================================================================= */}
      {activeTab === 'input' && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          className={`p-4 md:p-5 rounded-xl border transition space-y-4 ${
            editingResultId
              ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/30'
              : 'bg-white border-slate-200 shadow-2xs'
          }`}
        >
          {/* Form Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-200">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-md bg-brand-green/10 text-brand-green">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs md:text-sm font-heading uppercase text-brand-green flex items-center gap-1.5">
                  {editingResultId ? (
                    <span className="text-amber-900 flex items-center gap-1">
                      <Edit className="w-4 h-4 text-amber-700" />
                      <span>Edit Published Cumulative Result Sheet</span>
                    </span>
                  ) : (
                    <span>Input Academic Session Cumulative Result (3-Term Composite)</span>
                  )}
                </h4>
                <p className="text-[10.5px] text-slate-500">
                  Record 1st Term, 2nd Term, and 3rd Term scores per course subject to generate the annual transcript.
                </p>
              </div>
            </div>

            {editingResultId && (
              <div className="flex items-center gap-2">
                <span className="text-[9.5px] font-mono font-bold bg-amber-200 text-amber-950 px-2 py-0.5 rounded uppercase tracking-wider">
                  Editing Active
                </span>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="text-[11px] font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-2 py-0.5 rounded cursor-pointer transition shadow-2xs hover:bg-slate-100"
                >
                  ✕ Cancel Edit
                </button>
              </div>
            )}
          </div>

          {/* Quick Auto-Fill Assistant from Existing Students */}
          <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-emerald-700 shrink-0" />
              <div>
                <label className="block text-[10px] font-bold text-emerald-950 uppercase tracking-wide">
                  Quick Selector: Pull from Enrolled Students
                </label>
                <p className="text-[9.5px] text-emerald-800">
                  Select an enrolled student to automatically populate biodata and pull their 1st, 2nd, and 3rd term terminal scores.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={selectedStudentForAutofill}
                onChange={(e) => handleSelectExistingStudent(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-emerald-300 rounded text-xs font-semibold text-emerald-950 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden cursor-pointer"
              >
                <option value="">-- Choose Registered Student ({existingStudents.length}) --</option>
                {existingStudents.map((s) => (
                  <option key={s.studentId} value={s.studentId}>
                    {s.studentName} ({s.studentId} - {s.classLevel})
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => handleAutoPullFromTerminalRecords()}
                className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-bold uppercase transition cursor-pointer flex items-center space-x-1 shadow-2xs"
                title="Search existing 1st, 2nd, and 3rd term results and aggregate them automatically"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Auto-Pull Scores</span>
              </button>
            </div>
          </div>

          {/* Student Passport and Identity Row */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
            {/* Passport Photo Box */}
            <div className="lg:col-span-3 bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col items-center justify-center text-center space-y-2">
              <div className="relative w-24 h-28 rounded-md border-2 border-brand-green/30 bg-white overflow-hidden shadow-xs flex flex-col items-center justify-center">
                {passportPhoto ? (
                  <>
                    <img
                      src={passportPhoto}
                      alt="Student Portrait"
                      className="w-full h-full object-cover object-top"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-brand-oxblood/95 text-brand-yellow text-[7px] font-black uppercase text-center py-0.5 tracking-wider">
                      HGASS CUMULATIVE
                    </span>
                  </>
                ) : (
                  <div className="p-2 text-slate-400 space-y-1">
                    <Camera className="w-6 h-6 mx-auto text-slate-300" />
                    <span className="text-[7.5px] font-bold uppercase tracking-wider block text-slate-400">
                      Passport Photo
                    </span>
                  </div>
                )}
              </div>

              <div className="w-full space-y-1">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp"
                  onChange={handlePassportUpload}
                  className="block w-full text-[9px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[9px] file:font-bold file:bg-brand-green/10 file:text-brand-green file:cursor-pointer hover:file:bg-brand-green/20"
                />
                <input
                  type="url"
                  placeholder="Or paste photo URL..."
                  value={passportPhoto}
                  onChange={(e) => setPassportPhoto(e.target.value)}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-[9.5px] focus:ring-1 focus:ring-brand-green/35 font-mono"
                />
                {passportPhoto && (
                  <button
                    type="button"
                    onClick={() => setPassportPhoto('')}
                    className="text-[9px] text-red-600 hover:underline font-bold"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>

            {/* Student Biodata Inputs */}
            <div className="lg:col-span-9 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">
                    Student ID / Reg No *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. HGASS/2026/001"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-slate-800 focus:ring-1 focus:ring-brand-green/35"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">
                    Student Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Chinedu Emmanuel Okafor"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-brand-green/35"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">
                    Class Level *
                  </label>
                  <select
                    value={classLevel}
                    onChange={(e) => setClassLevel(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold focus:ring-1 focus:ring-brand-green/35 cursor-pointer"
                  >
                    <option value="JSS 1">JSS 1</option>
                    <option value="JSS 2">JSS 2</option>
                    <option value="JSS 3">JSS 3</option>
                    <option value="SS 1">SS 1</option>
                    <option value="SS 2">SS 2</option>
                    <option value="SS 3">SS 3</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">
                    Academic Session *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2025/2026"
                    value={academicSession}
                    onChange={(e) => setAcademicSession(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-brand-oxblood focus:ring-1 focus:ring-brand-green/35"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">
                    SEX / Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold focus:ring-1 focus:ring-brand-green/35 cursor-pointer"
                  >
                    <option value="Male">Male (M)</option>
                    <option value="Female">Female (F)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">
                    Roll Number / Arm
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 08"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono focus:ring-1 focus:ring-brand-green/35"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">
                    Annual Session Attendance
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 250 of 255 Days"
                    value={cumulativeAttendance}
                    onChange={(e) => setCumulativeAttendance(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-mono focus:ring-1 focus:ring-brand-green/35"
                  />
                </div>

                <div className="space-y-1 bg-amber-50/70 p-1.5 rounded border border-amber-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-[9px] font-bold text-amber-900 uppercase tracking-wide flex items-center gap-1">
                      <Key className="w-2.5 h-2.5 text-amber-700" />
                      <span>Student Access PIN / Password</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setAccessPassword(`HGASS-${Math.floor(1000 + Math.random() * 9000)}`)}
                      className="text-[8.5px] text-brand-green font-bold hover:underline cursor-pointer"
                    >
                      Generate PIN
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. HGASS-PASS-001 (Optional)"
                    value={accessPassword}
                    onChange={(e) => setAccessPassword(e.target.value)}
                    className="w-full px-2 py-1 bg-white border border-amber-300 rounded text-xs font-mono font-bold text-amber-900 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* MULTI-TERM SUBJECT SCORES MATRIX TABLE                               */}
          {/* ===================================================================== */}
          <div className="space-y-2.5 border-t border-slate-200 pt-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h5 className="text-xs font-black font-heading uppercase text-brand-green flex items-center gap-1.5">
                  <Calculator className="w-4 h-4 text-brand-green" />
                  <span>Subject Evaluation Composite (1st, 2nd, 3rd Term & Cumulative)</span>
                </h5>
                <p className="text-[10px] text-slate-500">
                  Input scores out of 100 for each term. Cumulative Total (/300), Cumulative Average (%), Grade, and Remarks calculate automatically.
                </p>
              </div>

              {/* Action Buttons for Loading Curriculum */}
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleLoadCurriculum('junior')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-[9.5px] font-bold transition cursor-pointer"
                  title="Prefill 12 Junior Secondary subjects"
                >
                  + Junior Subjects
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadCurriculum('senior')}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded text-[9.5px] font-bold transition cursor-pointer"
                  title="Prefill 13 Senior Secondary subjects"
                >
                  + Senior Subjects
                </button>
                <button
                  type="button"
                  onClick={handleAddSubjectRow}
                  className="px-2.5 py-1 bg-brand-green hover:bg-brand-green-dark text-white rounded text-[10px] font-bold uppercase transition cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Row</span>
                </button>
              </div>
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-lg shadow-2xs bg-white">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[9.5px] uppercase font-bold tracking-wider">
                    <th className="py-2 px-2 text-center w-8">#</th>
                    <th className="py-2 px-3">Subject Name</th>
                    <th className="py-2 px-2 text-center w-20 bg-blue-50/60 text-blue-900">1st Term (100)</th>
                    <th className="py-2 px-2 text-center w-20 bg-indigo-50/60 text-indigo-900">2nd Term (100)</th>
                    <th className="py-2 px-2 text-center w-20 bg-purple-50/60 text-purple-900">3rd Term (100)</th>
                    <th className="py-2 px-2 text-center w-20 bg-emerald-50 text-emerald-950">Cum. Total</th>
                    <th className="py-2 px-2 text-center w-20 bg-emerald-100 text-emerald-950 font-black">Cum. Avg %</th>
                    <th className="py-2 px-2 text-center w-14">Grade</th>
                    <th className="py-2 px-2 text-center w-20">Rank</th>
                    <th className="py-2 px-3">Assessment Remark</th>
                    <th className="py-2 px-1 text-center w-8">✕</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                  {subjectRows.map((row, index) => {
                    const metrics = computeCumulativeSubjectMetrics(
                      row.term1Score,
                      row.term2Score,
                      row.term3Score
                    );

                    const gradeBadgeBg =
                      metrics.grade === 'A'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : metrics.grade === 'B'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : metrics.grade === 'C'
                        ? 'bg-amber-100 text-amber-800 border-amber-300'
                        : metrics.grade === 'D' || metrics.grade === 'E'
                        ? 'bg-orange-100 text-orange-800 border-orange-300'
                        : 'bg-rose-100 text-rose-800 border-rose-300';

                    return (
                      <tr key={index} className="hover:bg-slate-50/80 transition">
                        <td className="py-1.5 px-2 text-center text-slate-400 font-sans text-[10px]">
                          {index + 1}
                        </td>
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            required
                            placeholder="e.g. Mathematics"
                            value={row.subject}
                            onChange={(e) => handleRowFieldChange(index, 'subject', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-sans text-xs font-semibold text-slate-800 focus:bg-white focus:ring-1 focus:ring-brand-green/35 uppercase"
                          />
                        </td>
                        {/* Term 1 */}
                        <td className="py-1.5 px-1 bg-blue-50/30">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="0"
                            value={row.term1Score !== undefined ? row.term1Score : ''}
                            onChange={(e) => handleScoreChange(index, 'term1Score', e.target.value)}
                            className="w-full px-1 py-1 text-center bg-white border border-blue-200 rounded font-bold text-blue-900 focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        {/* Term 2 */}
                        <td className="py-1.5 px-1 bg-indigo-50/30">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="0"
                            value={row.term2Score !== undefined ? row.term2Score : ''}
                            onChange={(e) => handleScoreChange(index, 'term2Score', e.target.value)}
                            className="w-full px-1 py-1 text-center bg-white border border-indigo-200 rounded font-bold text-indigo-900 focus:ring-1 focus:ring-indigo-500"
                          />
                        </td>
                        {/* Term 3 */}
                        <td className="py-1.5 px-1 bg-purple-50/30">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            placeholder="0"
                            value={row.term3Score !== undefined ? row.term3Score : ''}
                            onChange={(e) => handleScoreChange(index, 'term3Score', e.target.value)}
                            className="w-full px-1 py-1 text-center bg-white border border-purple-200 rounded font-bold text-purple-900 focus:ring-1 focus:ring-purple-500"
                          />
                        </td>
                        {/* Cumulative Total */}
                        <td className="py-1.5 px-2 text-center bg-emerald-50/50 font-bold text-emerald-950">
                          {metrics.cumulativeTotal}
                          <span className="text-[8px] text-slate-400 block font-sans">
                            / {metrics.termsCount * 100}
                          </span>
                        </td>
                        {/* Cumulative Average */}
                        <td className="py-1.5 px-2 text-center bg-emerald-100/70 font-black text-emerald-900 text-xs">
                          {metrics.cumulativeAverage}%
                        </td>
                        {/* Grade */}
                        <td className="py-1.5 px-1 text-center">
                          <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-black border ${gradeBadgeBg}`}>
                            {metrics.grade}
                          </span>
                        </td>
                        {/* Subject Position */}
                        <td className="py-1.5 px-1">
                          <input
                            type="text"
                            placeholder="e.g. 1st"
                            value={row.subjectPosition || ''}
                            onChange={(e) => handleRowFieldChange(index, 'subjectPosition', e.target.value)}
                            className="w-full px-1 py-1 text-center bg-white border border-slate-200 rounded text-[10px] font-sans"
                          />
                        </td>
                        {/* Remarks */}
                        <td className="py-1.5 px-2">
                          <input
                            type="text"
                            placeholder={metrics.remark}
                            value={row.remarks || ''}
                            onChange={(e) => handleRowFieldChange(index, 'remarks', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-sans text-[10px] text-slate-700"
                          />
                        </td>
                        {/* Remove */}
                        <td className="py-1.5 px-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveSubjectRow(index)}
                            className="text-slate-400 hover:text-red-600 p-1 cursor-pointer transition"
                            title="Remove Subject"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ===================================================================== */}
          {/* ANNUAL CUMULATIVE AGGREGATE METRICS STRIP                             */}
          {/* ===================================================================== */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center space-x-2">
                <Award className="w-4 h-4 text-brand-green" />
                <h5 className="text-xs font-bold text-slate-800 uppercase tracking-tight">
                  Academic Session Composite Summary & Standing
                </h5>
              </div>

              <button
                type="button"
                onClick={handleAutoSyncMetrics}
                className="px-2.5 py-1 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green text-[10.5px] font-bold uppercase rounded flex items-center space-x-1 cursor-pointer transition self-start sm:self-auto"
                title="Recalculate and fill with standard diocesan formulas"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-Sync from Subject Rows</span>
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {/* Position */}
              <div className="bg-white p-2 rounded border border-slate-200 space-y-1">
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wide">
                  Session Placement *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1st of 35"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-xs text-slate-800 font-mono"
                />
                <span className="text-[8px] text-slate-400 block">Annual class rank</span>
              </div>

              {/* Gross Total */}
              <div className="bg-white p-2 rounded border border-slate-200 space-y-1">
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wide">
                  Gross Total Marks
                </label>
                <input
                  type="number"
                  placeholder={String(liveSessionMetrics.sessionGrossTotal)}
                  value={grossTotalMarks !== undefined ? grossTotalMarks : ''}
                  onChange={(e) => setGrossTotalMarks(e.target.value === '' ? undefined : Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-xs text-brand-green font-mono"
                />
                <span className="text-[8px] text-slate-400 block font-mono">
                  Live: {liveSessionMetrics.sessionGrossTotal} / {liveSessionMetrics.sessionTotalMaxMarks}
                </span>
              </div>

              {/* Session Average % */}
              <div className="bg-white p-2 rounded border border-slate-200 space-y-1">
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wide">
                  Session Average (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={String(liveSessionMetrics.sessionAverage)}
                  value={terminalAverage !== undefined ? terminalAverage : ''}
                  onChange={(e) => setTerminalAverage(e.target.value === '' ? undefined : Number(e.target.value))}
                  className="w-full px-2 py-1 bg-white border border-slate-200 rounded font-bold text-xs text-brand-green font-mono"
                />
                <span className="text-[8px] text-slate-400 block font-mono">
                  Live: {liveSessionMetrics.sessionAverage}%
                </span>
              </div>

              {/* Cumulative GPA */}
              <div className="bg-white p-2 rounded border border-slate-200 space-y-1">
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wide">
                  Session GPA (5.00)
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder={String(liveSessionMetrics.gradePoint)}
                  value={gradePoint !== undefined ? gradePoint : ''}
                  onChange={(e) => setGradePoint(e.target.value === '' ? undefined : Number(e.target.value))}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-bold text-xs text-brand-oxblood font-mono"
                />
                <span className="text-[8px] text-slate-400 block font-mono">
                  Scale: {liveSessionMetrics.gradePoint} / 5.0
                </span>
              </div>

              {/* Accredited Bracket */}
              <div className="bg-white p-2 rounded border border-slate-200 space-y-1">
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wide">
                  Accredited Bracket
                </label>
                <input
                  type="text"
                  placeholder={liveSessionMetrics.accreditedGradeBracket}
                  value={accreditedGradeBracket}
                  onChange={(e) => setAccreditedGradeBracket(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-semibold text-xs text-slate-800"
                />
                <span className="text-[8px] text-slate-400 block truncate">
                  {liveSessionMetrics.accreditedGradeBracket}
                </span>
              </div>

              {/* Class Standing */}
              <div className="bg-white p-2 rounded border border-slate-200 space-y-1">
                <label className="block text-[8.5px] font-bold text-slate-500 uppercase tracking-wide">
                  Honor Standing
                </label>
                <input
                  type="text"
                  placeholder={liveSessionMetrics.classStanding}
                  value={classStanding}
                  onChange={(e) => setClassStanding(e.target.value)}
                  className="w-full px-2 py-1 bg-slate-50 border border-slate-200 rounded font-semibold text-xs text-slate-800"
                />
                <span className="text-[8px] text-slate-400 block truncate">
                  {liveSessionMetrics.classStanding}
                </span>
              </div>
            </div>

            {/* Promotion Decision Block */}
            <div className="bg-emerald-50/90 p-3 rounded-lg border border-emerald-300 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <label className="block text-[10px] font-black text-emerald-950 uppercase tracking-wide flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-emerald-700" />
                  <span>Annual Promotion Decision (Diocesan Stamp)</span>
                </label>
                <span className="text-[10px] text-emerald-800">
                  Computed Recommendation:{' '}
                  <strong className="underline font-black">{liveSessionMetrics.promotionStatus}</strong>
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <div className="lg:col-span-2">
                  <input
                    type="text"
                    list="cumulative-promotion-presets"
                    placeholder={`e.g. Promoted to ${getNextClassLevel(classLevel)}`}
                    value={promotionStatus}
                    onChange={(e) => setPromotionStatus(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded font-bold text-xs text-emerald-950 placeholder:text-slate-400 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
                  />
                  <datalist id="cumulative-promotion-presets">
                    {STANDARD_PROMOTION_STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt} />
                    ))}
                  </datalist>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPromotionStatus(`Promoted to ${getNextClassLevel(classLevel)}`)}
                    className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-[9.5px] font-bold transition cursor-pointer"
                  >
                    Promote to {getNextClassLevel(classLevel)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromotionStatus(`Promoted on Trial to ${getNextClassLevel(classLevel)}`)}
                    className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[9.5px] font-bold transition cursor-pointer"
                  >
                    Promote on Trial
                  </button>
                  <button
                    type="button"
                    onClick={() => setPromotionStatus(`Repeats ${classLevel}`)}
                    className="px-2 py-1 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded text-[9.5px] font-bold transition cursor-pointer"
                  >
                    Repeat {classLevel}
                  </button>
                  {classLevel === 'SS 3' && (
                    <button
                      type="button"
                      onClick={() => setPromotionStatus('Graduated / Passed Out (Certificate Issued)')}
                      className="px-2 py-1 bg-white hover:bg-blue-100 text-blue-900 border border-blue-300 rounded text-[9.5px] font-bold transition cursor-pointer"
                    >
                      Graduated
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Remarks Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-200 pt-3">
            <div className="space-y-1">
              <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">
                Form Teacher's Annual Cumulative Remarks
              </label>
              <textarea
                rows={2}
                placeholder="A dedicated and disciplined student throughout the academic session..."
                value={teacherRemarks}
                onChange={(e) => setTeacherRemarks(e.target.value)}
                className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-[9.5px] font-bold text-slate-500 uppercase tracking-wide">
                Principal's Official Session Seal & Endorsement
              </label>
              <textarea
                rows={2}
                placeholder="Superior cumulative scholastic outcome. Moral integrity upheld. Advancement ratified."
                value={principalRemarks}
                onChange={(e) => setPrincipalRemarks(e.target.value)}
                className="block w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs focus:ring-1 focus:ring-brand-green/35"
              />
            </div>
          </div>

          {/* Form Submit & Cancel Controls */}
          <div className="flex flex-col sm:flex-row justify-end items-center gap-2 pt-2 border-t border-slate-200">
            {editingResultId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="w-full sm:w-auto px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer"
              >
                Cancel Edit
              </button>
            )}

            <button
              type="submit"
              className={`w-full ${
                editingResultId
                  ? 'sm:flex-1 bg-amber-600 hover:bg-amber-700 border-amber-700'
                  : 'bg-brand-green hover:bg-brand-green-dark border-brand-green'
              } px-5 py-2.5 text-white rounded text-xs font-bold uppercase tracking-wider transition cursor-pointer border shadow-sm flex items-center justify-center space-x-1.5`}
            >
              {editingResultId ? (
                <>
                  <Check className="w-4 h-4 mr-1" />
                  <span>Update Published Cumulative Session Record</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-1 text-brand-yellow" />
                  <span>Save & Publish Cumulative Result Sheet</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: CUMULATIVE RECORDS REGISTRY & BROADSHEET EXPLORER             */}
      {/* ========================================================================= */}
      {activeTab === 'registry' && (
        <div className="space-y-4 animate-fade-in">
          {/* Filter Bar */}
          <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase px-1">Class:</span>
                {['All', 'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setRegistryClassFilter(c)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                      registryClassFilter === c
                        ? 'bg-brand-green text-white shadow-2xs'
                        : 'text-slate-600 hover:bg-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-500 uppercase px-1">Session:</span>
                <select
                  value={registrySessionFilter}
                  onChange={(e) => setRegistrySessionFilter(e.target.value)}
                  className="bg-white px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200"
                >
                  <option value="All">All Sessions</option>
                  {availableSessions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search by student name, ID or class..."
                value={registrySearch}
                onChange={(e) => setRegistrySearch(e.target.value)}
                className="w-full sm:w-64 px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded focus:bg-white focus:ring-1 focus:ring-brand-green/40 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Stats Header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Cumulative Records
              </span>
              <p className="text-lg font-black text-brand-green font-mono">{cumulativeResults.length}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Class Filter Matches
              </span>
              <p className="text-lg font-black text-slate-800 font-mono">{filteredCumulativeResults.length}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
              <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                Active Session
              </span>
              <p className="text-xs font-black text-brand-oxblood font-mono mt-1">{academicSession}</p>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <span className="text-[9.5px] font-bold text-slate-400 uppercase tracking-wider block">
                  Add New Record
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('input')}
                  className="text-xs font-bold text-brand-green hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Open Input Form</span>
                </button>
              </div>
            </div>
          </div>

          {/* Cards List of Cumulative Records */}
          <div className="space-y-2">
            {filteredCumulativeResults.map((rec) => {
              const totalScores = rec.subjectScores?.length || 0;
              return (
                <div
                  key={rec.id}
                  className="bg-white p-3.5 rounded-lg border border-slate-200 hover:border-emerald-300 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="font-bold text-slate-900 uppercase text-sm">{rec.studentName}</h4>
                      <span className="bg-emerald-100 text-emerald-900 font-bold px-2 py-0.5 rounded text-[9.5px] border border-emerald-200 uppercase font-mono">
                        {rec.studentId}
                      </span>
                      <span className="bg-brand-oxblood/10 text-brand-oxblood font-bold px-2 py-0.5 rounded text-[9.5px]">
                        {rec.classLevel}
                      </span>
                      <span className="bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded text-[9.5px]">
                        {rec.academicSession} Session
                      </span>
                      {rec.accessPassword ? (
                        <button
                          type="button"
                          onClick={() => handleCopyPin(rec.accessPassword!)}
                          className="bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[9px] font-mono font-bold hover:bg-amber-100 cursor-pointer flex items-center gap-1"
                          title="Copy Student Access PIN"
                        >
                          <Key className="w-2.5 h-2.5 text-amber-700" />
                          <span>PIN: {rec.accessPassword}</span>
                          {copiedPin === rec.accessPassword && <Check className="w-2.5 h-2.5 text-green-700" />}
                        </button>
                      ) : (
                        <span className="text-[9px] text-slate-400 italic">No PIN</span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[10.5px] text-slate-600 pt-0.5">
                      <span>
                        Rank: <strong className="text-brand-green font-mono">{rec.position}</strong>
                      </span>
                      <span>
                        Average: <strong className="text-brand-green font-mono">{rec.terminalAverage ?? rec.cumulativeSessionAverage}%</strong>
                      </span>
                      <span>
                        GPA: <strong className="text-brand-oxblood font-mono">{rec.gradePoint ?? 'N/A'}</strong>
                      </span>
                      <span>
                        Subjects: <strong className="font-mono">{totalScores}</strong>
                      </span>
                      {rec.promotionStatus && (
                        <span className="bg-emerald-50 text-emerald-900 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                          🎓 {rec.promotionStatus}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1.5 self-end sm:self-auto shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewTranscriptRecord(rec)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded text-xs font-bold uppercase transition cursor-pointer flex items-center space-x-1"
                      title="View Official Transcript / Result Slip"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Transcript</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartEdit(rec)}
                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded text-xs font-bold uppercase transition cursor-pointer flex items-center space-x-1"
                      title="Edit Cumulative Record"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-700" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(`Delete cumulative record for ${rec.studentName} (${rec.studentId})?`)) {
                          onDeleteResult(rec.id);
                        }
                      }}
                      className="p-1.5 border border-slate-200 rounded text-red-600 hover:bg-red-50 cursor-pointer transition"
                      title="Delete Record"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredCumulativeResults.length === 0 && (
              <div className="bg-white p-8 rounded-lg border border-slate-200 text-center space-y-2">
                <Calculator className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600 uppercase">
                  No cumulative session results registered yet.
                </p>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Switch to the "Input Cumulative Result Sheet" tab above to record a student's full session composite across 1st, 2nd, and 3rd terms.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('input')}
                  className="mt-2 px-3.5 py-1.5 bg-brand-green text-white rounded text-xs font-bold uppercase transition cursor-pointer"
                >
                  Create First Cumulative Record
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: OFFICIAL PRINTABLE CUMULATIVE TRANSCRIPT MODAL                */}
      {/* ========================================================================= */}
      {viewTranscriptRecord && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
            {/* Modal Top Bar (Non-print) */}
            <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between no-print">
              <div className="flex items-center space-x-2">
                <span className="p-1 rounded bg-brand-green text-white font-bold">
                  <Award className="w-4 h-4" />
                </span>
                <span className="font-heading font-black text-xs uppercase text-slate-800 tracking-wide">
                  Official Academic Session Cumulative Transcript & Result Slip
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePrintTranscript}
                  className="px-3 py-1 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold uppercase transition cursor-pointer flex items-center space-x-1"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Transcript</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewTranscriptRecord(null)}
                  className="p-1 text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Transcript Document Area */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-slate-800 font-sans">
              {/* Official Diocesan School Crest Header */}
              <div className="border-b-2 border-brand-green pb-4 text-center space-y-1">
                <div className="flex items-center justify-center space-x-3">
                  <img
                    src={SCHOOL_LOGO_URL}
                    alt="HGASS Crest"
                    className="w-16 h-16 object-contain rounded-full border border-brand-green/30"
                  />
                  <div>
                    <h2 className="text-base md:text-lg font-black font-heading text-brand-green uppercase tracking-tight">
                      {SCHOOL_OFFICIAL_NAME}
                    </h2>
                    <p className="text-[10px] font-bold text-brand-oxblood uppercase tracking-wider">
                      {SCHOOL_MOTTO}
                    </p>
                    <p className="text-[9.5px] text-slate-500 font-mono">
                      Pentecostal Church Board, Anambra State • Official Academic Session Cumulative Transcript
                    </p>
                  </div>
                </div>
              </div>

              {/* Student Biodata & Passport Strip */}
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <p>
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Student Name:</span>{' '}
                    <strong className="text-slate-900 font-black text-sm uppercase">
                      {viewTranscriptRecord.studentName}
                    </strong>
                  </p>
                  <p>
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Student ID / Reg No:</span>{' '}
                    <strong className="font-mono text-brand-oxblood font-bold">{viewTranscriptRecord.studentId}</strong>
                  </p>
                  <p>
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Class & Session:</span>{' '}
                    <strong>
                      {viewTranscriptRecord.classLevel} — {viewTranscriptRecord.academicSession} Academic Session (Cumulative)
                    </strong>
                  </p>
                  <p>
                    <span className="text-slate-500 font-bold uppercase text-[10px]">Gender / Roll No:</span>{' '}
                    <span>
                      {viewTranscriptRecord.gender || 'N/A'} • Roll #{viewTranscriptRecord.rollNumber || '01'}
                    </span>
                  </p>
                </div>

                <div className="flex items-center space-x-4">
                  {viewTranscriptRecord.passportPhoto ? (
                    <img
                      src={viewTranscriptRecord.passportPhoto}
                      alt="Student Portrait"
                      className="w-20 h-24 object-cover object-top rounded border-2 border-brand-green shadow-xs"
                    />
                  ) : (
                    <div className="w-20 h-24 rounded border-2 border-dashed border-slate-300 flex items-center justify-center text-center p-1 text-slate-400 text-[8px] uppercase font-bold">
                      No Passport Affixed
                    </div>
                  )}
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <div className="space-y-1.5">
                <h5 className="text-xs font-black font-heading uppercase text-brand-green tracking-wide">
                  Course Subject Cumulative Evaluations (1st Term, 2nd Term, 3rd Term)
                </h5>
                <div className="border border-slate-300 rounded overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse font-sans">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 border-b border-slate-300 text-[9.5px] uppercase font-black">
                        <th className="py-2 px-2 text-center w-8">#</th>
                        <th className="py-2 px-3">Subject Name</th>
                        <th className="py-2 px-2 text-center w-20">1st Term (100)</th>
                        <th className="py-2 px-2 text-center w-20">2nd Term (100)</th>
                        <th className="py-2 px-2 text-center w-20">3rd Term (100)</th>
                        <th className="py-2 px-2 text-center w-20 bg-slate-100 font-black">Cum. Total</th>
                        <th className="py-2 px-2 text-center w-20 bg-emerald-50 text-emerald-950 font-black">Cum. Avg %</th>
                        <th className="py-2 px-2 text-center w-14">Grade</th>
                        <th className="py-2 px-3">Assessment Remark</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-xs font-mono">
                      {viewTranscriptRecord.subjectScores?.map((s, idx) => {
                        const metrics = computeCumulativeSubjectMetrics(s.term1Score, s.term2Score, s.term3Score);
                        return (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="py-1.5 px-2 text-center text-slate-400 font-sans text-[10px]">
                              {idx + 1}
                            </td>
                            <td className="py-1.5 px-3 font-sans font-bold text-slate-800 uppercase">
                              {s.subject}
                            </td>
                            <td className="py-1.5 px-2 text-center">{s.term1Score ?? '—'}</td>
                            <td className="py-1.5 px-2 text-center">{s.term2Score ?? '—'}</td>
                            <td className="py-1.5 px-2 text-center">{s.term3Score ?? '—'}</td>
                            <td className="py-1.5 px-2 text-center font-bold">{metrics.cumulativeTotal}</td>
                            <td className="py-1.5 px-2 text-center font-black text-emerald-900 bg-emerald-50/50">
                              {metrics.cumulativeAverage}%
                            </td>
                            <td className="py-1.5 px-2 text-center font-bold">{metrics.grade}</td>
                            <td className="py-1.5 px-3 font-sans text-[10.5px] text-slate-600">
                              {s.remarks || metrics.remark}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Session Performance Summary Box */}
              <div className="bg-emerald-50/80 p-4 rounded-lg border border-emerald-200 space-y-2 text-xs">
                <h5 className="font-heading font-black text-xs uppercase text-emerald-950">
                  Annual Cumulative Performance Summary
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-sans block">Gross Total Marks</span>
                    <strong className="text-emerald-950 font-bold">
                      {viewTranscriptRecord.grossTotalMarks ?? viewTranscriptRecord.sessionGrossTotalMarks}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-sans block">Session Average</span>
                    <strong className="text-emerald-950 font-black text-sm">
                      {viewTranscriptRecord.terminalAverage ?? viewTranscriptRecord.cumulativeSessionAverage}%
                    </strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-sans block">Session CGPA (5.00)</span>
                    <strong className="text-brand-oxblood font-bold">{viewTranscriptRecord.gradePoint ?? 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-sans block">Session Cohort Position</span>
                    <strong className="text-emerald-950 font-bold">{viewTranscriptRecord.position}</strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200 flex flex-col sm:flex-row justify-between gap-2">
                  <div>
                    <span className="text-[9.5px] font-bold text-emerald-950 uppercase">Accredited Bracket:</span>{' '}
                    <span className="font-semibold text-emerald-900">
                      {viewTranscriptRecord.accreditedGradeBracket || 'Distinction (Honours)'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9.5px] font-bold text-emerald-950 uppercase">Promotion Decision:</span>{' '}
                    <span className="font-black text-emerald-900 underline">
                      {viewTranscriptRecord.promotionStatus || 'Promoted to Next Class'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Endorsements and Official Seals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Form Teacher Remarks:</span>
                  <p className="italic text-slate-700 font-sans">
                    "{viewTranscriptRecord.teacherRemarks || 'Commendable diligence throughout the academic year.'}"
                  </p>
                  <div className="pt-4 border-b border-slate-300 w-48"></div>
                  <span className="text-[9px] text-slate-400 uppercase">Form Teacher Signature & Date</span>
                </div>

                <div className="space-y-1 sm:text-right">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Principal's Official Stamp:</span>
                  <p className="italic text-slate-700 font-sans">
                    "{viewTranscriptRecord.principalRemarks || 'Annual academic session results verified and ratified.'}"
                  </p>
                  <div className="pt-4 border-b border-slate-300 w-48 sm:ml-auto"></div>
                  <span className="text-[9px] text-slate-400 uppercase">
                    {SCHOOL_MANAGER_NAME} • Principal Stamp
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
