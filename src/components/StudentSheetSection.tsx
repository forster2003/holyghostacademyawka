import React, { useState, useMemo } from 'react';
import { 
  GraduationCap, Award, Sparkles, BookOpen, Calendar, User, 
  FileText, Printer, Edit, Trash, Key, Check, Copy, Search, 
  Users, CheckCircle2, ShieldCheck, FileSpreadsheet, Eye, ChevronRight
} from 'lucide-react';
import { StudentResult, SubjectScore } from '../types';
import { 
  computeAcademicMetrics, 
  getNextClassLevel, 
  STANDARD_PROMOTION_STATUS_OPTIONS,
  SCHOOL_OFFICIAL_NAME,
  SCHOOL_MOTTO,
  SCHOOL_MANAGER_NAME,
  SCHOOL_MANAGER_PHOTO,
  getSubjectAssessmentRemark
} from '../gradeUtils';

interface StudentSheetSectionProps {
  results: StudentResult[];
  onEditResult: (result: StudentResult) => void;
  onDeleteResult: (id: string, name: string) => void;
  onUpdatePromotionStatus?: (id: string, newStatus: string) => void;
  onSwitchToRegistrar: () => void;
}

export const StudentSheetSection: React.FC<StudentSheetSectionProps> = ({
  results,
  onEditResult,
  onDeleteResult,
  onUpdatePromotionStatus,
  onSwitchToRegistrar
}) => {
  const [classFilter, setClassFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    results.length > 0 ? results[0].id : null
  );
  const [viewMode, setViewMode] = useState<'sheet' | 'broadsheet'>('sheet');
  const [copiedPin, setCopiedPin] = useState<string | null>(null);

  const classLevels = ['All', 'JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'];

  // Filtered results
  const filteredResults = useMemo(() => {
    return results.filter((res) => {
      const matchesClass = classFilter === 'All' || res.classLevel === classFilter;
      if (!matchesClass) return false;
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        res.studentName.toLowerCase().includes(q) ||
        res.studentId.toLowerCase().includes(q) ||
        (res.gender && res.gender.toLowerCase().includes(q)) ||
        res.term.toLowerCase().includes(q) ||
        res.academicSession.toLowerCase().includes(q)
      );
    });
  }, [results, classFilter, searchQuery]);

  // Selected student
  const activeStudent = useMemo(() => {
    if (selectedStudentId) {
      const found = results.find((r) => r.id === selectedStudentId);
      if (found) return found;
    }
    return filteredResults.length > 0 ? filteredResults[0] : null;
  }, [results, selectedStudentId, filteredResults]);

  // Handle PIN copy
  const handleCopyPin = (pin: string) => {
    navigator.clipboard.writeText(pin);
    setCopiedPin(pin);
    setTimeout(() => setCopiedPin(null), 2500);
  };

  // Print current student sheet
  const handlePrintSheet = () => {
    window.print();
  };

  // Aggregate stats for broadsheet
  const broadsheetStats = useMemo(() => {
    const total = filteredResults.length;
    let maleCount = 0;
    let femaleCount = 0;
    let totalScoreSum = 0;
    filteredResults.forEach((r) => {
      const g = (r.gender || '').toLowerCase();
      if (g.startsWith('f')) femaleCount++;
      else maleCount++;
      const metrics = computeAcademicMetrics(r.subjectScores, r);
      totalScoreSum += metrics.terminalAverage;
    });
    const avgScore = total > 0 ? (totalScoreSum / total).toFixed(1) : '0.0';
    return { total, maleCount, femaleCount, avgScore };
  }, [filteredResults]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Mode Toggle */}
      <div className="bg-linear-to-r from-emerald-900 via-brand-green to-emerald-950 text-white p-5 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Diocesan Registrar Registry</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight uppercase">
              Student Academic Sheet & Broadsheet Section
            </h3>
            <p className="text-xs text-emerald-100/80 max-w-2xl font-light">
              Official academic student records repository for Holy Ghost Academy. Inspect student term sheets, modify promotion statuses, verify continuous assessments (CA1 & CA2), and evaluate cohort broadsheets.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('sheet')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'sheet'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'bg-emerald-800/80 text-white hover:bg-emerald-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Student Sheet Dossier</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('broadsheet')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'broadsheet'
                  ? 'bg-white text-emerald-950 shadow-sm'
                  : 'bg-emerald-800/80 text-white hover:bg-emerald-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Master Broadsheet</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="pt-2 border-t border-emerald-800/60 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Class Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-emerald-200 font-bold uppercase mr-1">Class Cohort:</span>
            {classLevels.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setClassFilter(lvl)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition cursor-pointer ${
                  classFilter === lvl
                    ? 'bg-amber-400 text-slate-950 shadow-2xs'
                    : 'bg-emerald-950/60 text-emerald-200 hover:bg-emerald-950/90 border border-emerald-700/50'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-emerald-300" />
            <input
              type="text"
              placeholder="Search student, ID, SEX..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-xs text-white placeholder:text-emerald-300/70 focus:outline-hidden focus:ring-1 focus:ring-amber-400"
            />
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: INDIVIDUAL STUDENT SHEET DOSSIER */}
      {viewMode === 'sheet' && (
        <div className="space-y-6">
          {/* Student Selector Carousel / Ribbon */}
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-brand-green" />
                <span>Select Student Academic Sheet ({filteredResults.length} Available)</span>
              </span>
              <button
                type="button"
                onClick={onSwitchToRegistrar}
                className="text-xs font-bold text-brand-oxblood hover:underline uppercase flex items-center gap-1 cursor-pointer"
              >
                <span>+ Register New Student Record</span>
              </button>
            </div>

            {filteredResults.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                No student records found matching filter "{classFilter}" or query "{searchQuery}".
              </p>
            ) : (
              <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                {filteredResults.map((r) => {
                  const isSelected = activeStudent?.id === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setSelectedStudentId(r.id)}
                      className={`shrink-0 px-3 py-2 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-emerald-50 border-brand-green ring-2 ring-brand-green/30 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden shrink-0 border border-slate-300 flex items-center justify-center text-slate-600 font-bold text-xs">
                        {r.passportPhoto ? (
                          <img src={r.passportPhoto} alt={r.studentName} className="w-full h-full object-cover" />
                        ) : (
                          r.studentName.charAt(0)
                        )}
                      </div>
                      <div className="space-y-0.5">
                        <p className={`text-xs font-bold leading-tight line-clamp-1 ${
                          isSelected ? 'text-brand-green' : 'text-slate-800'
                        }`}>
                          {r.studentName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          {r.studentId} • <strong className="text-brand-oxblood font-bold">{r.gender || 'SEX: N/A'}</strong>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ACTIVE STUDENT OFFICIAL SHEET */}
          {activeStudent ? (
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden animate-fade-in print:border-none print:shadow-none">
              {/* Action Bar */}
              <div className="bg-slate-50 p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-700 uppercase">Selected Sheet:</span>
                  <span className="px-2.5 py-0.5 bg-brand-green/10 text-brand-green font-black rounded-lg text-xs uppercase font-mono">
                    {activeStudent.studentId}
                  </span>
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 font-bold rounded-lg text-xs uppercase">
                    SEX: {activeStudent.gender || 'Male'}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onEditResult(activeStudent)}
                    className="px-3 py-1.5 bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5 text-amber-700" />
                    <span>Edit in Registrar Form</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintSheet}
                    className="px-3 py-1.5 bg-brand-green text-white hover:bg-brand-green-dark rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Student Sheet</span>
                  </button>

                  {activeStudent.accessPassword && (
                    <button
                      type="button"
                      onClick={() => handleCopyPin(activeStudent.accessPassword!)}
                      className="px-3 py-1.5 bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 cursor-pointer"
                      title="Copy Student Access PIN"
                    >
                      {copiedPin === activeStudent.accessPassword ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700 font-bold">PIN Copied!</span>
                        </>
                      ) : (
                        <>
                          <Key className="w-3.5 h-3.5 text-amber-700" />
                          <span>Copy PIN: {activeStudent.accessPassword}</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onDeleteResult(activeStudent.id, activeStudent.studentName)}
                    className="p-2 text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition cursor-pointer"
                    title="Delete Student Record"
                  >
                    <Trash className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* SHEET CONTENT AREA */}
              <div className="p-6 md:p-8 space-y-6">
                {/* Official Diocesan Header */}
                <div className="text-center space-y-2 border-b-2 border-brand-green/20 pb-6 relative">
                  <div className="mx-auto w-16 h-16 rounded-full bg-brand-green/10 border-2 border-brand-green flex items-center justify-center text-brand-green shadow-xs">
                    <GraduationCap className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black font-heading text-brand-green uppercase tracking-tight">
                      {SCHOOL_OFFICIAL_NAME}
                    </h2>
                    <p className="text-xs font-bold text-brand-oxblood uppercase tracking-wider">
                      Kamali Homes, Ngozika Housing Estate, Awka, Anambra State
                    </p>
                    <p className="text-xs text-slate-600 font-semibold mt-1">
                      Motto: <span className="text-slate-900 font-bold">{SCHOOL_MOTTO}</span>
                    </p>
                    <div className="inline-block mt-2 px-3 py-1 bg-brand-oxblood text-white rounded-full text-[11px] font-black uppercase tracking-widest shadow-2xs">
                      Official Terminal Academic Student Sheet
                    </div>
                  </div>
                </div>

                {/* Bio Particulars & Official Passport Frame */}
                <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center gap-6">
                  {/* Passport Photo */}
                  <div className="shrink-0 flex flex-col items-center">
                    <div className="relative w-28 h-32 rounded-xl border-2 border-brand-green/40 bg-white overflow-hidden shadow-xs flex items-center justify-center">
                      {activeStudent.passportPhoto ? (
                        <img 
                          src={activeStudent.passportPhoto} 
                          alt={activeStudent.studentName} 
                          className="w-full h-full object-cover" 
                        />
                      ) : (
                        <div className="flex flex-col items-center text-slate-400">
                          <User className="w-12 h-12 stroke-[1.5]" />
                          <span className="text-[9px] uppercase font-bold mt-1">No Passport</span>
                        </div>
                      )}
                      <div className="absolute bottom-0 inset-x-0 bg-brand-green/90 text-white text-[8px] font-black uppercase text-center py-0.5">
                        HGASS Certified
                      </div>
                    </div>
                  </div>

                  {/* Student Particulars Table */}
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3.5 w-full">
                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student Full Name</p>
                      <p className="text-sm font-black text-slate-900 uppercase font-heading">{activeStudent.studentName}</p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Student ID / Reg No</p>
                      <p className="text-sm font-mono font-bold text-brand-oxblood">{activeStudent.studentId}</p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-brand-oxblood uppercase tracking-wider">SEX</p>
                      <p className="text-sm font-black text-slate-900 uppercase bg-amber-100/70 text-amber-950 px-2 py-0.5 rounded-md inline-block font-heading">
                        {activeStudent.gender || 'Male'}
                      </p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Cohort</p>
                      <p className="text-sm font-bold text-slate-800">{activeStudent.classLevel}</p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Term</p>
                      <p className="text-xs font-bold text-slate-700">{activeStudent.term}</p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Academic Session</p>
                      <p className="text-xs font-mono font-bold text-slate-700">{activeStudent.academicSession}</p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Roll Number</p>
                      <p className="text-xs font-mono font-bold text-slate-700">{activeStudent.rollNumber}</p>
                    </div>

                    <div className="space-y-0.5">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Placement</p>
                      <p className="text-xs font-black text-brand-green uppercase flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span>{activeStudent.position}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Diocesan Promotion Status & Advancement Banner */}
                {(() => {
                  const metrics = computeAcademicMetrics(activeStudent.subjectScores, activeStudent);
                  const currentPromotion = activeStudent.promotionStatus || metrics.promotionStatus;

                  return (
                    <div className="space-y-3">
                      <div className="border border-emerald-300 bg-linear-to-r from-emerald-50 via-amber-50/50 to-emerald-50 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center space-x-3.5">
                          <div className="w-12 h-12 rounded-full bg-brand-green text-white flex items-center justify-center shrink-0 shadow-xs ring-4 ring-brand-green/10">
                            <GraduationCap className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-brand-oxblood uppercase tracking-widest block">
                              Diocesan Promotion Decision & Terminal Advancement
                            </span>
                            <h4 className="text-base sm:text-lg font-black text-brand-green uppercase tracking-tight font-heading mt-0.5">
                              {currentPromotion}
                            </h4>
                            <p className="text-[11px] text-slate-600 font-medium">
                              Official council academic standing: {metrics.classStanding} ({metrics.accreditedGradeBracket})
                            </p>
                          </div>
                        </div>

                        {/* Quick Promotion Status Updater buttons */}
                        {onUpdatePromotionStatus && (
                          <div className="flex flex-wrap items-center justify-center sm:justify-end gap-1.5 print:hidden">
                            <span className="text-[10px] text-slate-400 font-bold uppercase w-full sm:w-auto text-center sm:text-right">
                              Quick Update:
                            </span>
                            <button
                              type="button"
                              onClick={() => onUpdatePromotionStatus(activeStudent.id, `Promoted to ${getNextClassLevel(activeStudent.classLevel)}`)}
                              className="px-2 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded text-[10px] font-bold transition cursor-pointer"
                            >
                              Promote
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdatePromotionStatus(activeStudent.id, `Promoted on Trial to ${getNextClassLevel(activeStudent.classLevel)}`)}
                              className="px-2 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[10px] font-bold transition cursor-pointer"
                            >
                              Trial
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdatePromotionStatus(activeStudent.id, `Repeats ${activeStudent.classLevel}`)}
                              className="px-2 py-1 bg-white hover:bg-rose-100 text-rose-900 border border-rose-300 rounded text-[10px] font-bold transition cursor-pointer"
                            >
                              Repeats
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Performance Metric Bar */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Gross Total Marks</p>
                          <p className="text-base font-black text-brand-green font-mono mt-0.5">
                            {metrics.grossTotalMarks} <span className="text-xs text-slate-400">/ {metrics.totalMaxMarks}</span>
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Terminal Average Score</p>
                          <p className="text-base font-black text-brand-oxblood font-mono mt-0.5">
                            {metrics.terminalAverage}%
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Grade Point (GPA)</p>
                          <p className="text-base font-black text-blue-900 font-mono mt-0.5">
                            {metrics.gradePoint} <span className="text-xs text-slate-400">/ 5.00</span>
                          </p>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Accredited Grade</p>
                          <p className="text-xs font-black text-brand-green uppercase mt-1">
                            {metrics.accreditedGradeBracket}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Core Scores Table (CA1, CA2, CA Total, Exam, Total, Grade, Remarks) */}
                <div className="overflow-x-auto border border-slate-200 rounded-2xl shadow-2xs">
                  <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
                    <thead className="bg-slate-100">
                      <tr>
                        <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-brand-green font-heading text-[10.5px]">
                          Subject Course
                        </th>
                        <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-slate-600 font-heading text-[10px] text-center" title="Continuous Assessment 1 (Max 20)">
                          CA 1 (20)
                        </th>
                        <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-slate-600 font-heading text-[10px] text-center" title="Continuous Assessment 2 (Max 20)">
                          CA 2 (20)
                        </th>
                        <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-slate-800 font-heading text-[10px] text-center" title="Total Continuous Assessment (Max 40)">
                          Total CA (40)
                        </th>
                        <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-slate-600 font-heading text-[10px] text-center" title="Terminal Examination (Max 60)">
                          Exam (60)
                        </th>
                        <th scope="col" className="px-4 py-3 font-bold uppercase tracking-wider text-brand-green font-heading text-[10.5px] text-center" title="Grand Total (Max 100)">
                          Total (100)
                        </th>
                        <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-slate-600 font-heading text-[10px] text-center">
                          Grade
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-100">
                      {activeStudent.subjectScores.map((score, idx) => {
                        const ca1 = score.ca1Score !== undefined ? score.ca1Score : Math.round((score.testScore || 0) / 2);
                        const ca2 = score.ca2Score !== undefined ? score.ca2Score : ((score.testScore || 0) - ca1);
                        const totalCa = ca1 + ca2;
                        const exam = score.examScore !== undefined ? score.examScore : 0;
                        const total = score.totalScore !== undefined ? score.totalScore : (totalCa + exam);

                        return (
                          <tr key={idx} className="hover:bg-slate-50/70 transition">
                            <td className="px-4 py-3 font-semibold text-slate-800 uppercase tracking-tight">
                              {score.subject}
                            </td>
                            <td className="px-3 py-3 text-center text-slate-600 font-mono text-xs">
                              {ca1}
                            </td>
                            <td className="px-3 py-3 text-center text-slate-600 font-mono text-xs">
                              {ca2}
                            </td>
                            <td className="px-3 py-3 text-center text-slate-800 font-mono font-bold text-xs bg-slate-50/60">
                              {totalCa}
                            </td>
                            <td className="px-3 py-3 text-center text-slate-600 font-mono text-xs">
                              {exam}
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-brand-green font-mono text-sm">
                              {total}
                            </td>
                            <td className="px-3 py-3 text-center font-bold">
                              <span className={`inline-block px-2 py-0.5 rounded text-[11px] uppercase font-bold ${
                                score.grade === 'A' ? 'bg-green-100 text-green-800' :
                                score.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                score.grade === 'C' ? 'bg-indigo-100 text-indigo-800' :
                                score.grade === 'D' ? 'bg-amber-100 text-amber-800' :
                                score.grade === 'E' ? 'bg-orange-100 text-orange-800' :
                                score.grade === 'F' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {score.grade}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Signatures and Attestations */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-200 pt-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                    <p className="text-[10px] font-bold text-brand-green uppercase tracking-wider">Class Teacher’s Assessment</p>
                    <p className="text-xs text-slate-700 italic font-light">"{activeStudent.teacherRemarks}"</p>
                    <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400">
                      <span>Sign: Class Counselor</span>
                      <span className="font-mono">ID: SEC-COUNCIL</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                    <p className="text-[10px] font-bold text-brand-oxblood uppercase tracking-wider">Manager’s Assessment</p>
                    <p className="text-xs text-slate-700 italic font-light">"{activeStudent.principalRemarks}"</p>
                    <div className="pt-2 flex justify-between items-center text-[10px] text-slate-400">
                      <span>Sign: {SCHOOL_MANAGER_NAME}</span>
                      <span className="font-mono">STAMP: HGASS-ADMIN</span>
                    </div>
                  </div>
                </div>

                {/* Footer seal */}
                <div className="text-center pt-4 border-t border-slate-100 text-[10px] text-slate-400 space-y-1">
                  <p>Holy Ghost Academy Secondary School • Kamali Homes, Ngozika Housing Estate, Awka</p>
                  <p className="font-semibold text-brand-green">Motto: {SCHOOL_MOTTO}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
              <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700 uppercase">No Student Selected</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select a student from the ribbon above or register a new student to view their official academic sheet.
              </p>
            </div>
          )}
        </div>
      )}

      {/* VIEW MODE 2: CLASS MASTER BROADSHEET TABLE */}
      {viewMode === 'broadsheet' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-5 animate-fade-in">
          {/* Broadsheet Stats Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h4 className="text-base font-black font-heading text-slate-900 uppercase">
                {classFilter === 'All' ? 'All Classes' : classFilter} Master Academic Broadsheet
              </h4>
              <p className="text-xs text-slate-500">
                Official composite grading schedule evaluating continuous assessment (CA1, CA2) and terminal exam records.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                <span>Total Students:</span>
                <span className="font-mono text-brand-green">{broadsheetStats.total}</span>
              </div>
              <div className="px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <span>Cohort Avg:</span>
                <span className="font-mono text-brand-oxblood">{broadsheetStats.avgScore}%</span>
              </div>
            </div>
          </div>

          {/* Broadsheet Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="min-w-full divide-y divide-slate-200 text-xs text-left">
              <thead className="bg-slate-100">
                <tr>
                  <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-slate-500 font-heading text-[10px]">S/N</th>
                  <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-brand-oxblood font-heading text-[10px]">Reg ID</th>
                  <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-slate-800 font-heading text-[10px]">Student Full Name</th>
                  <th scope="col" className="px-2.5 py-3 font-bold uppercase tracking-wider text-brand-oxblood font-heading text-[10px] text-center">SEX</th>
                  <th scope="col" className="px-2.5 py-3 font-bold uppercase tracking-wider text-slate-600 font-heading text-[10px]">Class</th>
                  <th scope="col" className="px-2.5 py-3 font-bold uppercase tracking-wider text-slate-600 font-heading text-[10px] text-center">Subjects</th>
                  <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-slate-600 font-heading text-[10px] text-center">Gross Marks</th>
                  <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-brand-oxblood font-heading text-[10px] text-center">Avg (%)</th>
                  <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-blue-900 font-heading text-[10px] text-center">GPA</th>
                  <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-brand-green font-heading text-[10px] text-center">Position</th>
                  <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-emerald-800 font-heading text-[10px]">Promotion Status</th>
                  <th scope="col" className="px-3 py-3 font-bold uppercase tracking-wider text-slate-600 font-heading text-[10px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredResults.map((r, index) => {
                  const metrics = computeAcademicMetrics(r.subjectScores, r);
                  const isCurrent = activeStudent?.id === r.id;

                  return (
                    <tr key={r.id} className={`hover:bg-slate-50 transition ${isCurrent ? 'bg-emerald-50/50' : ''}`}>
                      <td className="px-3 py-2.5 font-mono text-slate-400 font-bold">{index + 1}</td>
                      <td className="px-3 py-2.5 font-mono font-bold text-brand-oxblood">{r.studentId}</td>
                      <td className="px-3 py-2.5 font-bold text-slate-900 uppercase">
                        <div className="flex items-center gap-2">
                          <span>{r.studentName}</span>
                          {r.accessPassword && (
                            <span className="text-[9px] font-mono font-bold bg-amber-50 text-amber-900 px-1.5 py-0.2 rounded border border-amber-200">
                              PIN
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-2.5 py-2.5 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                          (r.gender || '').toLowerCase().startsWith('f')
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {r.gender || 'Male'}
                        </span>
                      </td>
                      <td className="px-2.5 py-2.5 font-semibold text-slate-700">{r.classLevel}</td>
                      <td className="px-2.5 py-2.5 text-center font-mono text-slate-600">{r.subjectScores?.length || 0}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-brand-green">{metrics.grossTotalMarks}</td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-brand-oxblood">{metrics.terminalAverage}%</td>
                      <td className="px-3 py-2.5 text-center font-mono font-bold text-blue-900">{metrics.gradePoint}</td>
                      <td className="px-3 py-2.5 text-center font-bold text-brand-green">{r.position}</td>
                      <td className="px-3 py-2.5">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-900">
                          <GraduationCap className="w-3 h-3 text-emerald-700" />
                          <span>{r.promotionStatus || metrics.promotionStatus}</span>
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentId(r.id);
                              setViewMode('sheet');
                            }}
                            className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded text-[10px] font-bold uppercase transition cursor-pointer"
                            title="View Student Sheet"
                          >
                            Sheet
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditResult(r)}
                            className="p-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteResult(r.id, r.studentName)}
                            className="p-1 text-rose-600 hover:bg-rose-50 rounded cursor-pointer"
                            title="Delete"
                          >
                            <Trash className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
