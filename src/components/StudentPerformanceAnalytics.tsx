import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
  ReferenceLine
} from 'recharts';
import {
  TrendingUp,
  BarChart3,
  Award,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Download,
  Printer,
  BookOpen,
  Users,
  GraduationCap,
  Search,
  ArrowUpDown,
  RotateCcw,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { StudentResult, SubjectScore } from '../types';
import { computeAcademicMetrics, getGradeFromScore } from '../gradeUtils';

interface StudentPerformanceAnalyticsProps {
  results: StudentResult[];
  onSelectStudentResult?: (result: StudentResult) => void;
}

const GRADE_COLORS: Record<string, string> = {
  A: '#10b981', // Emerald / Green (75 - 100%)
  B: '#3b82f6', // Blue (65 - 74%)
  C: '#f59e0b', // Amber / Gold (50 - 64%)
  D: '#f97316', // Orange (45 - 49%)
  E: '#8b5cf6', // Violet / Purple (40 - 44%)
  F: '#ef4444', // Red / Rose (< 40%)
};

const TIER_COLORS = ['#15803d', '#2563eb', '#d97706', '#ea580c', '#dc2626'];

export const StudentPerformanceAnalytics: React.FC<StudentPerformanceAnalyticsProps> = ({
  results = [],
  onSelectStudentResult
}) => {
  // --- Filter States ---
  const [selectedSession, setSelectedSession] = useState<string>('ALL');
  const [selectedTerm, setSelectedTerm] = useState<string>('ALL');
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedGender, setSelectedGender] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // --- Chart Control States ---
  const [gradeViewMode, setGradeViewMode] = useState<'subjectScores' | 'studentAverages'>('subjectScores');
  const [subjectSortOrder, setSubjectSortOrder] = useState<'desc' | 'asc'>('desc');
  const [activeLeaderboardTab, setActiveLeaderboardTab] = useState<'honorRoll' | 'atRisk'>('honorRoll');

  // --- Dynamic Filter Options Extraction ---
  const sessionOptions = useMemo(() => {
    const sessions = new Set<string>();
    results.forEach(r => {
      if (r.academicSession) sessions.add(r.academicSession);
    });
    return Array.from(sessions).sort().reverse();
  }, [results]);

  const classOptions = ['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'];
  const termOptions = ['1st Term', '2nd Term', '3rd Term', 'Annual Cumulative'];

  // --- Filtered Results Dataset ---
  const filteredResults = useMemo(() => {
    return results.filter(r => {
      if (selectedSession !== 'ALL' && r.academicSession !== selectedSession) return false;
      if (selectedTerm !== 'ALL') {
        if (selectedTerm === 'Annual Cumulative') {
          if (!r.isCumulative && r.term !== 'Annual Cumulative') return false;
        } else {
          if (r.term !== selectedTerm) return false;
        }
      }
      if (selectedClass !== 'ALL' && r.classLevel !== selectedClass) return false;
      if (selectedGender !== 'ALL') {
        const studentGender = (r.gender || 'Male').trim().toLowerCase();
        if (studentGender !== selectedGender.toLowerCase()) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = r.studentName?.toLowerCase().includes(q);
        const matchId = r.studentId?.toLowerCase().includes(q);
        if (!matchName && !matchId) return false;
      }
      return true;
    });
  }, [results, selectedSession, selectedTerm, selectedClass, selectedGender, searchQuery]);

  // --- Computed Evaluation Metrics per Student ---
  const evaluatedStudents = useMemo(() => {
    return filteredResults.map(r => {
      const metrics = computeAcademicMetrics(r.subjectScores || [], r);
      const failedSubjects = (r.subjectScores || []).filter(s => (Number(s.totalScore) || 0) < 40);
      return {
        ...r,
        computedAverage: metrics.terminalAverage,
        computedGPA: metrics.gradePoint,
        grossTotalMarks: metrics.grossTotalMarks,
        accreditedBracket: metrics.accreditedGradeBracket,
        classStanding: metrics.classStanding,
        promotionStatus: metrics.promotionStatus,
        failedSubjectsCount: failedSubjects.length,
        failedSubjectsList: failedSubjects.map(s => s.subject),
        subjectScores: r.subjectScores || []
      };
    });
  }, [filteredResults]);

  // --- Aggregate Summary Statistics ---
  const overallKPIs = useMemo(() => {
    const count = evaluatedStudents.length;
    if (count === 0) {
      return {
        totalEvaluated: 0,
        averageScore: 0,
        averageGPA: 0,
        passRate: 0,
        distinctionCount: 0,
        distinctionRate: 0,
        remedialCount: 0,
        remedialRate: 0,
        highestScore: 0,
        lowestScore: 0
      };
    }

    const sumAverage = evaluatedStudents.reduce((acc, s) => acc + s.computedAverage, 0);
    const sumGPA = evaluatedStudents.reduce((acc, s) => acc + s.computedGPA, 0);
    const passedCount = evaluatedStudents.filter(s => s.computedAverage >= 50).length;
    const distinctionCount = evaluatedStudents.filter(s => s.computedAverage >= 75).length;
    const remedialCount = evaluatedStudents.filter(s => s.computedAverage < 50 || s.failedSubjectsCount >= 2).length;
    const averages = evaluatedStudents.map(s => s.computedAverage);

    return {
      totalEvaluated: count,
      averageScore: Number((sumAverage / count).toFixed(1)),
      averageGPA: Number((sumGPA / count).toFixed(2)),
      passRate: Number(((passedCount / count) * 100).toFixed(1)),
      distinctionCount,
      distinctionRate: Number(((distinctionCount / count) * 100).toFixed(1)),
      remedialCount,
      remedialRate: Number(((remedialCount / count) * 100).toFixed(1)),
      highestScore: Math.max(...averages),
      lowestScore: Math.min(...averages)
    };
  }, [evaluatedStudents]);

  // --- 1. Grade Distribution Chart Data ---
  const gradeDistributionData = useMemo(() => {
    const gradesCount: Record<string, number> = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };

    if (gradeViewMode === 'subjectScores') {
      evaluatedStudents.forEach(student => {
        student.subjectScores.forEach(s => {
          const score = Number(s.totalScore) || 0;
          const { grade } = getGradeFromScore(score);
          if (gradesCount[grade] !== undefined) {
            gradesCount[grade] += 1;
          }
        });
      });
    } else {
      evaluatedStudents.forEach(student => {
        const { grade } = getGradeFromScore(student.computedAverage);
        if (gradesCount[grade] !== undefined) {
          gradesCount[grade] += 1;
        }
      });
    }

    const totalEvaluations = Object.values(gradesCount).reduce((a, b) => a + b, 0) || 1;

    return [
      { grade: 'Grade A', letter: 'A', bracket: '75 - 100%', count: gradesCount.A, percentage: Number(((gradesCount.A / totalEvaluations) * 100).toFixed(1)), label: 'Distinction' },
      { grade: 'Grade B', letter: 'B', bracket: '65 - 74%', count: gradesCount.B, percentage: Number(((gradesCount.B / totalEvaluations) * 100).toFixed(1)), label: 'Very Good' },
      { grade: 'Grade C', letter: 'C', bracket: '50 - 64%', count: gradesCount.C, percentage: Number(((gradesCount.C / totalEvaluations) * 100).toFixed(1)), label: 'Credit Pass' },
      { grade: 'Grade D', letter: 'D', bracket: '45 - 49%', count: gradesCount.D, percentage: Number(((gradesCount.D / totalEvaluations) * 100).toFixed(1)), label: 'Pass' },
      { grade: 'Grade E', letter: 'E', bracket: '40 - 44%', count: gradesCount.E, percentage: Number(((gradesCount.E / totalEvaluations) * 100).toFixed(1)), label: 'Fair Pass' },
      { grade: 'Grade F', letter: 'F', bracket: '< 40%', count: gradesCount.F, percentage: Number(((gradesCount.F / totalEvaluations) * 100).toFixed(1)), label: 'Fail / Remedial' },
    ];
  }, [evaluatedStudents, gradeViewMode]);

  // --- 2. Class-by-Class Comparative Performance Chart Data ---
  const classComparisonData = useMemo(() => {
    return classOptions.map(cls => {
      const classStudents = evaluatedStudents.filter(s => s.classLevel === cls);
      if (classStudents.length === 0) {
        return {
          classLevel: cls,
          averageScore: 0,
          highestScore: 0,
          lowestScore: 0,
          passRate: 0,
          studentCount: 0
        };
      }

      const sumAvg = classStudents.reduce((acc, s) => acc + s.computedAverage, 0);
      const passedCount = classStudents.filter(s => s.computedAverage >= 50).length;
      const classAverages = classStudents.map(s => s.computedAverage);

      return {
        classLevel: cls,
        averageScore: Number((sumAvg / classStudents.length).toFixed(1)),
        highestScore: Math.max(...classAverages),
        lowestScore: Math.min(...classAverages),
        passRate: Number(((passedCount / classStudents.length) * 100).toFixed(1)),
        studentCount: classStudents.length
      };
    });
  }, [evaluatedStudents]);

  // --- 3. Subject Performance Benchmarking Chart Data ---
  const subjectPerformanceData = useMemo(() => {
    const subjectMap = new Map<string, { totalScore: number; count: number; passedCount: number }>();

    evaluatedStudents.forEach(student => {
      student.subjectScores.forEach(s => {
        const subjectName = (s.subject || '').trim();
        if (!subjectName) return;
        const score = Number(s.totalScore) || 0;
        
        const existing = subjectMap.get(subjectName) || { totalScore: 0, count: 0, passedCount: 0 };
        existing.totalScore += score;
        existing.count += 1;
        if (score >= 50) existing.passedCount += 1;
        subjectMap.set(subjectName, existing);
      });
    });

    const list = Array.from(subjectMap.entries()).map(([name, data]) => {
      const avg = Number((data.totalScore / data.count).toFixed(1));
      const passRate = Number(((data.passedCount / data.count) * 100).toFixed(1));
      return {
        subject: name,
        averageScore: avg,
        passRate,
        totalEntries: data.count
      };
    });

    list.sort((a, b) => {
      if (subjectSortOrder === 'desc') {
        return b.averageScore - a.averageScore;
      }
      return a.averageScore - b.averageScore;
    });

    return list;
  }, [evaluatedStudents, subjectSortOrder]);

  // --- 4. Performance Standing Tier Distribution (Pie Chart) ---
  const performanceTierData = useMemo(() => {
    let distinction = 0; // >= 75
    let upperCredit = 0; // 65 - 74
    let credit = 0; // 50 - 64
    let pass = 0; // 40 - 49
    let remedial = 0; // < 40

    evaluatedStudents.forEach(s => {
      const avg = s.computedAverage;
      if (avg >= 75) distinction++;
      else if (avg >= 65) upperCredit++;
      else if (avg >= 50) credit++;
      else if (avg >= 40) pass++;
      else remedial++;
    });

    const total = evaluatedStudents.length || 1;

    return [
      { name: 'Distinction (≥75%)', value: distinction, percent: Number(((distinction / total) * 100).toFixed(1)), color: TIER_COLORS[0] },
      { name: 'Upper Credit (65-74%)', value: upperCredit, percent: Number(((upperCredit / total) * 100).toFixed(1)), color: TIER_COLORS[1] },
      { name: 'Credit Pass (50-64%)', value: credit, percent: Number(((credit / total) * 100).toFixed(1)), color: TIER_COLORS[2] },
      { name: 'Fair Pass (40-49%)', value: pass, percent: Number(((pass / total) * 100).toFixed(1)), color: TIER_COLORS[3] },
      { name: 'Remedial (<40%)', value: remedial, percent: Number(((remedial / total) * 100).toFixed(1)), color: TIER_COLORS[4] },
    ].filter(item => item.value > 0);
  }, [evaluatedStudents]);

  // --- 5. Promotion Status Breakdown ---
  const promotionStatusData = useMemo(() => {
    const counts: Record<string, number> = {
      'Promoted': 0,
      'Promoted on Trial': 0,
      'Repeats Class': 0,
      'Graduated': 0,
      'In Progress / Other': 0
    };

    evaluatedStudents.forEach(s => {
      const status = (s.promotionStatus || '').toLowerCase();
      if (status.includes('promoted to') || status.includes('advancement') || status === 'promoted') {
        counts['Promoted'] += 1;
      } else if (status.includes('trial')) {
        counts['Promoted on Trial'] += 1;
      } else if (status.includes('repeat') || status.includes('not promoted')) {
        counts['Repeats Class'] += 1;
      } else if (status.includes('graduated') || status.includes('passed out')) {
        counts['Graduated'] += 1;
      } else {
        counts['In Progress / Other'] += 1;
      }
    });

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .filter(item => item.count > 0);
  }, [evaluatedStudents]);

  // --- 6. Distinction Honor Roll (Top 10 Students) ---
  const honorRollStudents = useMemo(() => {
    return [...evaluatedStudents]
      .sort((a, b) => b.computedAverage - a.computedAverage)
      .slice(0, 10);
  }, [evaluatedStudents]);

  // --- 7. Academic Remediation Watchlist ---
  const atRiskStudents = useMemo(() => {
    return evaluatedStudents
      .filter(s => s.computedAverage < 50 || s.failedSubjectsCount >= 2)
      .sort((a, b) => a.computedAverage - b.computedAverage);
  }, [evaluatedStudents]);

  // --- Reset All Filters ---
  const handleResetFilters = () => {
    setSelectedSession('ALL');
    setSelectedTerm('ALL');
    setSelectedClass('ALL');
    setSelectedGender('ALL');
    setSearchQuery('');
  };

  // --- Print Performance Report ---
  const handlePrintReport = () => {
    window.print();
  };

  // --- Export Analytics CSV ---
  const handleExportCSV = () => {
    if (evaluatedStudents.length === 0) return;

    const headers = [
      'Student ID',
      'Student Name',
      'Class Level',
      'Academic Session',
      'Term',
      'Gender',
      'Average Score (%)',
      'GPA (5.0)',
      'Gross Total Marks',
      'Accredited Bracket',
      'Class Standing',
      'Promotion Decision',
      'Failed Subjects Count'
    ];

    const rows = evaluatedStudents.map(s => [
      `"${s.studentId}"`,
      `"${s.studentName}"`,
      `"${s.classLevel}"`,
      `"${s.academicSession}"`,
      `"${s.term}"`,
      `"${s.gender || 'Male'}"`,
      s.computedAverage,
      s.computedGPA,
      s.grossTotalMarks,
      `"${s.accreditedBracket || ''}"`,
      `"${s.classStanding || ''}"`,
      `"${s.promotionStatus || ''}"`,
      s.failedSubjectsCount
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HGASS_Performance_Analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header & Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded bg-brand-green/10 flex items-center justify-center text-brand-green">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black font-heading text-brand-green uppercase tracking-tight">
                Student Performance Analytics
              </h2>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                <span>Holy Ghost Academy Secondary School, Awka</span>
                <span aria-hidden="true">·</span>
                <span>Diocesan Assessment Standards</span>
                <span aria-hidden="true">·</span>
                <span>{filteredResults.length} Student Record{filteredResults.length === 1 ? '' : 's'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={evaluatedStudents.length === 0}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            title="Download CSV report of filtered student records"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            type="button"
            onClick={handlePrintReport}
            className="px-3 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-xs font-bold transition flex items-center space-x-1.5 cursor-pointer shadow-xs"
            title="Print performance analytics dossier"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Dossier</span>
          </button>
        </div>
      </div>

      {/* Interactive Scope & Demographic Filter Bar */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-700">
            <Filter className="w-3.5 h-3.5 text-brand-green" />
            <span>Scope & Demographic Filters</span>
          </div>
          {(selectedSession !== 'ALL' || selectedTerm !== 'ALL' || selectedClass !== 'ALL' || selectedGender !== 'ALL' || searchQuery) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-xs text-brand-oxblood hover:underline flex items-center space-x-1 font-semibold cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          
          {/* Session Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Academic Session
            </label>
            <select
              value={selectedSession}
              onChange={(e) => setSelectedSession(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-brand-green focus:outline-hidden"
            >
              <option value="ALL">All Academic Sessions</option>
              {sessionOptions.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Term Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Academic Term
            </label>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-brand-green focus:outline-hidden"
            >
              <option value="ALL">All Terms Combined</option>
              {termOptions.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Class Level Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Class Level
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-brand-green focus:outline-hidden"
            >
              <option value="ALL">All Classes (JSS 1 - SS 3)</option>
              {classOptions.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Gender Selector */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Student Gender
            </label>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-brand-green focus:outline-hidden"
            >
              <option value="ALL">All Genders</option>
              <option value="Male">Male Scholars</option>
              <option value="Female">Female Scholars</option>
            </select>
          </div>

          {/* Student Search */}
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Search Student
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-7 pr-2.5 py-1.5 bg-white border border-slate-200 rounded text-xs font-medium text-slate-800 focus:ring-1 focus:ring-brand-green focus:outline-hidden"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
            </div>
          </div>

        </div>
      </div>

      {/* Executive KPI Performance Metric Cards (Zero-Pill Discipline) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs border-l-3 border-l-brand-green">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Evaluated</span>
            <Users className="w-3.5 h-3.5 text-brand-green" />
          </div>
          <div className="text-xl font-black font-heading text-slate-900">
            {overallKPIs.totalEvaluated}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Student records
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs border-l-3 border-l-blue-600">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Mean Average</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-xl font-black font-heading text-blue-700">
            {overallKPIs.averageScore}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Range: {overallKPIs.lowestScore}% - {overallKPIs.highestScore}%
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs border-l-3 border-l-indigo-600">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Average GPA</span>
            <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className="text-xl font-black font-heading text-indigo-700">
            {overallKPIs.averageGPA} <span className="text-xs font-normal text-slate-400">/ 5.0</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Diocesan scale
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs border-l-3 border-l-emerald-600">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Pass Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-black font-heading text-emerald-700">
            {overallKPIs.passRate}%
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Credit standard (≥50%)
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs border-l-3 border-l-amber-500">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">Distinctions</span>
            <Award className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-black font-heading text-amber-700">
            {overallKPIs.distinctionCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {overallKPIs.distinctionRate}% honors rate
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs border-l-3 border-l-rose-600">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider">At Risk</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-black font-heading text-rose-700">
            {overallKPIs.remedialCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            Requires tutorial
          </div>
        </div>

      </div>

      {/* Main Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* CHART 1: Grade Distribution Across Subjects (BarChart) - Span 7 */}
        <div className="lg:col-span-7 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4 text-brand-green" />
                <h3 className="font-bold text-sm font-heading text-slate-900 uppercase tracking-tight">
                  Academic Grade Distribution
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Frequency and distribution of accredited letter grades (A through F).
              </p>
            </div>

            {/* View Mode Segmented Switch (Interactive Filter Control - Buttons Allowed) */}
            <div className="flex items-center bg-slate-100 p-0.5 rounded text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setGradeViewMode('subjectScores')}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  gradeViewMode === 'subjectScores'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Subject Scores
              </button>
              <button
                type="button"
                onClick={() => setGradeViewMode('studentAverages')}
                className={`px-2.5 py-1 rounded transition cursor-pointer ${
                  gradeViewMode === 'studentAverages'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Student Averages
              </button>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeDistributionData} margin={{ top: 15, right: 15, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="grade"
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded shadow-xl text-xs space-y-1 font-sans border border-slate-700">
                          <div className="font-bold flex items-center justify-between gap-3 text-amber-300">
                            <span>{data.grade} ({data.bracket})</span>
                            <span>{data.label}</span>
                          </div>
                          <div className="text-slate-300 flex items-center justify-between gap-3">
                            <span>Evaluated Count:</span>
                            <span className="font-mono font-bold text-white">{data.count}</span>
                          </div>
                          <div className="text-slate-300 flex items-center justify-between gap-3">
                            <span>Share of Total:</span>
                            <span className="font-mono font-bold text-emerald-400">{data.percentage}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {gradeDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GRADE_COLORS[entry.letter] || '#154734'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Grade Distribution Legend & Breakdown (Zero-Pill Discipline) */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-2 border-t border-slate-100 text-center">
            {gradeDistributionData.map((g) => (
              <div key={g.letter} className="bg-slate-50/80 p-2 rounded border border-slate-100">
                <div className="flex items-center justify-center space-x-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: GRADE_COLORS[g.letter] }}></span>
                  <span className="text-[11px] font-bold text-slate-800">{g.letter}</span>
                </div>
                <div className="text-xs font-black font-mono mt-0.5 text-slate-900">{g.count}</div>
                <div className="text-[9px] text-slate-400">{g.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 2: Performance Standing / Tier Donut (PieChart) - Span 5 */}
        <div className="lg:col-span-5 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-amber-500" />
              <h3 className="font-bold text-sm font-heading text-slate-900 uppercase tracking-tight">
                Academic Standing Tier
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Accredited student classification based on cumulative averages.
            </p>
          </div>

          <div className="h-56 sm:h-64 w-full flex items-center justify-center">
            {performanceTierData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={performanceTierData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {performanceTierData.map((entry, index) => (
                      <Cell key={`tier-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2 rounded shadow-xl text-xs space-y-1 font-sans border border-slate-700">
                            <div className="font-bold text-amber-300">{data.name}</div>
                            <div className="text-slate-300 flex items-center justify-between gap-3">
                              <span>Students:</span>
                              <span className="font-mono font-bold text-white">{data.value}</span>
                            </div>
                            <div className="text-slate-300 flex items-center justify-between gap-3">
                              <span>Percentage:</span>
                              <span className="font-mono font-bold text-emerald-400">{data.percent}%</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                No student evaluated records found for selected criteria.
              </div>
            )}
          </div>

          <div className="p-2.5 bg-slate-50 rounded border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
            <span className="font-semibold">Honors Distinction Standard:</span>
            <span className="font-bold font-mono text-emerald-700">Minimum 75% Overall</span>
          </div>
        </div>

      </div>

      {/* Second Visualizations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* CHART 3: Class-by-Class Comparative Performance (BarChart) - Span 6 */}
        <div className="lg:col-span-6 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-brand-green" />
              <h3 className="font-bold text-sm font-heading text-slate-900 uppercase tracking-tight">
                Class-by-Class Comparative Performance
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Average score and pass rate (%) across Junior & Senior secondary classes.
            </p>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classComparisonData} margin={{ top: 15, right: 15, left: -10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="classLevel"
                  tick={{ fontSize: 11, fill: '#475569', fontWeight: 600 }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#64748b' }}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-2.5 rounded shadow-xl text-xs space-y-1 font-sans border border-slate-700">
                          <div className="font-bold text-brand-yellow font-heading">{data.classLevel} Performance Profile</div>
                          <div className="text-slate-300 flex items-center justify-between gap-3">
                            <span>Students Evaluated:</span>
                            <span className="font-mono font-bold text-white">{data.studentCount}</span>
                          </div>
                          <div className="text-slate-300 flex items-center justify-between gap-3">
                            <span>Class Mean Average:</span>
                            <span className="font-mono font-bold text-emerald-400">{data.averageScore}%</span>
                          </div>
                          <div className="text-slate-300 flex items-center justify-between gap-3">
                            <span>Highest Score in Class:</span>
                            <span className="font-mono font-bold text-amber-300">{data.highestScore}%</span>
                          </div>
                          <div className="text-slate-300 flex items-center justify-between gap-3">
                            <span>Lowest Score in Class:</span>
                            <span className="font-mono font-bold text-rose-300">{data.lowestScore}%</span>
                          </div>
                          <div className="text-slate-300 flex items-center justify-between gap-3">
                            <span>Pass Rate:</span>
                            <span className="font-mono font-bold text-blue-400">{data.passRate}%</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Pass (50%)', fill: '#d97706', fontSize: 10 }} />
                <Bar dataKey="averageScore" fill="#154734" name="Class Average (%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="passRate" fill="#3b82f6" name="Pass Rate (%)" radius={[4, 4, 0, 0]} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: Subject Performance Rankings & Mastery Benchmark - Span 6 */}
        <div className="lg:col-span-6 bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <BookOpen className="w-4 h-4 text-brand-green" />
                <h3 className="font-bold text-sm font-heading text-slate-900 uppercase tracking-tight">
                  Subject Benchmark Rankings
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                School-wide subject averages sorted by performance levels.
              </p>
            </div>

            {/* Sort Order Toggle */}
            <button
              type="button"
              onClick={() => setSubjectSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold transition flex items-center space-x-1 cursor-pointer self-start sm:self-auto"
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>{subjectSortOrder === 'desc' ? 'Highest First' : 'Struggling Subjects First'}</span>
            </button>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {subjectPerformanceData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={subjectPerformanceData.slice(0, 8)}
                  layout="vertical"
                  margin={{ top: 10, right: 20, left: 60, bottom: 10 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="subject"
                    tick={{ fontSize: 10, fill: '#334155', fontWeight: 600 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    width={70}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white p-2.5 rounded shadow-xl text-xs space-y-1 font-sans border border-slate-700">
                            <div className="font-bold text-brand-yellow font-heading">{data.subject}</div>
                            <div className="text-slate-300 flex items-center justify-between gap-3">
                              <span>Subject Average:</span>
                              <span className="font-mono font-bold text-emerald-400">{data.averageScore}%</span>
                            </div>
                            <div className="text-slate-300 flex items-center justify-between gap-3">
                              <span>Pass Rate (≥50%):</span>
                              <span className="font-mono font-bold text-blue-400">{data.passRate}%</span>
                            </div>
                            <div className="text-slate-300 flex items-center justify-between gap-3">
                              <span>Evaluated Submissions:</span>
                              <span className="font-mono font-bold text-white">{data.totalEntries}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine x={50} stroke="#ef4444" strokeDasharray="3 3" label={{ value: '50% Credit', fill: '#ef4444', fontSize: 10 }} />
                  <Bar
                    dataKey="averageScore"
                    name="Subject Mean (%)"
                    radius={[0, 4, 4, 0]}
                  >
                    {subjectPerformanceData.slice(0, 8).map((entry, index) => (
                      <Cell
                        key={`subj-cell-${index}`}
                        fill={entry.averageScore >= 70 ? '#10b981' : entry.averageScore >= 50 ? '#3b82f6' : '#ef4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-10 text-slate-400 text-xs">
                No subject evaluation scores recorded for selected criteria.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Promotion Status Summary & Academic Standing Overview */}
      <div className="bg-white p-4 sm:p-5 rounded-lg border border-slate-200 shadow-xs space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <GraduationCap className="w-4 h-4 text-brand-green" />
            <h3 className="font-bold text-sm font-heading text-slate-900 uppercase tracking-tight">
              Promotion & Academic Progression Distribution
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Diocesan advancement recommendations and terminal academic decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {promotionStatusData.map((p) => {
            const isPromoted = p.name === 'Promoted';
            const isTrial = p.name === 'Promoted on Trial';
            const isRepeat = p.name === 'Repeats Class';
            const isGrad = p.name === 'Graduated';

            return (
              <div
                key={p.name}
                className={`p-3 rounded border text-xs ${
                  isPromoted
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-900'
                    : isTrial
                    ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                    : isRepeat
                    ? 'bg-rose-50/60 border-rose-200 text-rose-900'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold uppercase text-[10px] tracking-wider">{p.name}</span>
                  {isPromoted && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                  {isTrial && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                  {isRepeat && <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />}
                  {isGrad && <Award className="w-3.5 h-3.5 text-blue-600" />}
                </div>
                <div className="text-2xl font-black font-heading mt-1">{p.count}</div>
                <div className="text-[10px] opacity-75 mt-0.5">
                  {((p.count / (evaluatedStudents.length || 1)) * 100).toFixed(1)}% of evaluated scholars
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dual Tables: Academic Distinction Honor Roll vs. Remediation Watchlist */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-xs overflow-hidden">
        
        {/* Tab Selector for Leaderboard vs At-Risk */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-4 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveLeaderboardTab('honorRoll')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeLeaderboardTab === 'honorRoll'
                ? 'border-brand-green text-brand-green bg-white rounded-t-md font-black shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Academic Distinction Honor Roll (Top 10)</span>
            <span className="text-[10px] font-mono text-slate-400">({honorRollStudents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveLeaderboardTab('atRisk')}
            className={`px-4 py-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center space-x-1.5 ${
              activeLeaderboardTab === 'atRisk'
                ? 'border-rose-600 text-rose-700 bg-white rounded-t-md font-black shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
            <span>Academic Remediation Watchlist</span>
            <span className="text-[10px] font-mono text-slate-400">({atRiskStudents.length})</span>
          </button>
        </div>

        {/* Honor Roll Content */}
        {activeLeaderboardTab === 'honorRoll' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <p>Top performing students ranked by terminal percentage average and cumulative GPA.</p>
              <span>Showing top {honorRollStudents.length} scholars</span>
            </div>

            {honorRollStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-slate-50">
                      <th className="py-2.5 px-3 w-12 text-center">Rank</th>
                      <th className="py-2.5 px-3">Student Name & ID</th>
                      <th className="py-2.5 px-3">Class Level</th>
                      <th className="py-2.5 px-3">Term & Session</th>
                      <th className="py-2.5 px-3 text-right">Average (%)</th>
                      <th className="py-2.5 px-3 text-right">GPA (5.0)</th>
                      <th className="py-2.5 px-3">Standing / Honors</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {honorRollStudents.map((student, idx) => (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                          {idx === 0 ? '🥇 1' : idx === 1 ? '🥈 2' : idx === 2 ? '🥉 3' : `#${idx + 1}`}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 uppercase">{student.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            ID: <span className="text-brand-oxblood font-semibold">{student.studentId}</span>
                            <span className="mx-1">·</span>
                            <span>{student.gender || 'Male'}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-700">
                          {student.classLevel}
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          {student.term} ({student.academicSession})
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          {student.computedAverage}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-indigo-700">
                          {student.computedGPA}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="font-semibold text-slate-800">{student.accreditedBracket || 'Distinction'}</span>
                          <span className="block text-[10px] text-slate-400">{student.promotionStatus || 'Advancement'}</span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {onSelectStudentResult && (
                            <button
                              type="button"
                              onClick={() => onSelectStudentResult(student)}
                              className="px-2 py-1 bg-brand-green/10 hover:bg-brand-green hover:text-white text-brand-green rounded text-[10px] font-bold uppercase transition cursor-pointer"
                              title="Open student record in Grade Book Registrar"
                            >
                              Grade Book
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No student records matching criteria.
              </div>
            )}
          </div>
        )}

        {/* Remediation Watchlist Content */}
        {activeLeaderboardTab === 'atRisk' && (
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <p>Students with terminal averages below 50% or multiple failed subjects (&lt;40%) requiring academic intervention.</p>
              <span>{atRiskStudents.length} Student{atRiskStudents.length === 1 ? '' : 's'} flagged</span>
            </div>

            {atRiskStudents.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider bg-rose-50/50">
                      <th className="py-2.5 px-3">Student Details</th>
                      <th className="py-2.5 px-3">Class & Term</th>
                      <th className="py-2.5 px-3 text-right">Average (%)</th>
                      <th className="py-2.5 px-3 text-center">Failing Subjects</th>
                      <th className="py-2.5 px-3">Attendance</th>
                      <th className="py-2.5 px-3">Intervention Protocol</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {atRiskStudents.map((student) => (
                      <tr key={student.id} className="hover:bg-rose-50/30 transition">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 uppercase">{student.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            ID: <span className="text-brand-oxblood font-semibold">{student.studentId}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-semibold text-slate-800">{student.classLevel}</span>
                          <div className="text-[10px] text-slate-500">{student.term} ({student.academicSession})</div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-700">
                          {student.computedAverage}%
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          {student.failedSubjectsCount > 0 ? (
                            <div className="text-[11px] font-semibold text-rose-700">
                              {student.failedSubjectsCount} Failed
                              <div className="text-[10px] text-slate-500 font-normal">
                                ({student.failedSubjectsList.slice(0, 2).join(', ')}{student.failedSubjectsList.length > 2 ? '...' : ''})
                              </div>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400">Low Average Only</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-600">
                          {student.attendance || 'N/A'}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <span className="font-medium text-slate-800 block">
                            {student.computedAverage < 40 ? 'Mandatory Remedial Summer Classes' : 'Extra Tutorial & Parent Conference'}
                          </span>
                          <span className="text-[10px] text-rose-600 font-semibold">
                            {student.promotionStatus || 'Advised for Remedial Evaluation'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {onSelectStudentResult && (
                            <button
                              type="button"
                              onClick={() => onSelectStudentResult(student)}
                              className="px-2 py-1 bg-rose-100 hover:bg-rose-600 hover:text-white text-rose-800 rounded text-[10px] font-bold uppercase transition cursor-pointer"
                              title="Open student record in Grade Book Registrar"
                            >
                              Grade Book
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                Excellent news! Zero students currently fall into the academic remediation alert bracket.
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
};

export default StudentPerformanceAnalytics;
