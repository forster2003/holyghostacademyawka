/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, Clock, Check, CheckCircle2, AlertCircle, X, 
  Search, Download, Printer, UserPlus, RefreshCw, 
  UserCheck, Users, FileSpreadsheet, Trash2,
  CalendarCheck, AlertTriangle, Info, Sparkles
} from 'lucide-react';
import { DailyAttendanceRecord, AttendanceStatus, RosterStudent, StudentResult } from '../types';
import { DEFAULT_CLASS_ROSTERS } from '../defaultData';
import { SCHOOL_LOGO_URL, SCHOOL_OFFICIAL_EMAIL } from '../gradeUtils';

interface DailyAttendanceSectionProps {
  attendanceRecords: DailyAttendanceRecord[];
  results?: StudentResult[];
  onSaveAttendance: (records: DailyAttendanceRecord[]) => void;
  onDeleteRecord?: (id: string) => void;
  onClearClassDate?: (date: string, classLevel: string) => void;
}

const CLASS_LEVELS = ['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'] as const;

export function DailyAttendanceSection({
  attendanceRecords,
  results = [],
  onSaveAttendance,
  onDeleteRecord,
  onClearClassDate
}: DailyAttendanceSectionProps) {
  // Navigation & Filter states
  const [activeTab, setActiveTab] = useState<'register' | 'history' | 'studentProfiles'>('register');
  const [selectedDate, setSelectedDate] = useState<string>('2026-09-22');
  const [selectedClass, setSelectedClass] = useState<string>('SS 2');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [academicSession, setAcademicSession] = useState<string>('2025/2026');

  // Custom roster additions saved in localStorage
  const [customRosterStudents, setCustomRosterStudents] = useState<RosterStudent[]>(() => {
    try {
      const stored = localStorage.getItem('hgass_custom_roster');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Working state for the selected class & date
  const [statusMap, setStatusMap] = useState<Record<string, { status: AttendanceStatus; remark: string }>>({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);
  const [saveBanner, setSaveBanner] = useState<string | null>(null);

  // Modals
  const [isAddStudentOpen, setIsAddStudentOpen] = useState<boolean>(false);
  const [newStudentName, setNewStudentName] = useState<string>('');
  const [newStudentId, setNewStudentId] = useState<string>('');
  const [newStudentRoll, setNewStudentRoll] = useState<string>('');
  const [newStudentGender, setNewStudentGender] = useState<'Male' | 'Female'>('Male');

  const [isPrintRegisterOpen, setIsPrintRegisterOpen] = useState<boolean>(false);

  // History filtering
  const [historyClassFilter, setHistoryClassFilter] = useState<string>('ALL');
  const [historySearchQuery, setHistorySearchQuery] = useState<string>('');

  // 1. Build composite roster of students for the selected class
  const classRoster = useMemo(() => {
    const baseRoster: RosterStudent[] = DEFAULT_CLASS_ROSTERS[selectedClass] || [];
    const customInClass = customRosterStudents.filter(s => s.classLevel === selectedClass);
    
    // Also extract distinct students from results if they belong to this class and aren't duplicated
    const fromResults: RosterStudent[] = [];
    results.forEach(r => {
      if (r.classLevel === selectedClass) {
        fromResults.push({
          studentId: r.studentId,
          studentName: r.studentName,
          classLevel: r.classLevel,
          gender: (r.gender === 'Female' ? 'Female' : 'Male'),
          rollNumber: r.rollNumber || '00',
          passportPhoto: r.passportPhoto
        });
      }
    });

    // Merge by unique studentId
    const mergedMap = new Map<string, RosterStudent>();
    baseRoster.forEach(s => mergedMap.set(s.studentId.toUpperCase(), s));
    fromResults.forEach(s => mergedMap.set(s.studentId.toUpperCase(), s));
    customInClass.forEach(s => mergedMap.set(s.studentId.toUpperCase(), s));

    return Array.from(mergedMap.values()).sort((a, b) => {
      const rollA = parseInt(a.rollNumber, 10) || 999;
      const rollB = parseInt(b.rollNumber, 10) || 999;
      if (rollA !== rollB) return rollA - rollB;
      return a.studentName.localeCompare(b.studentName);
    });
  }, [selectedClass, customRosterStudents, results]);

  // 2. Synchronize working state when date or class changes
  useEffect(() => {
    const existingForDateAndClass = attendanceRecords.filter(
      r => r.date === selectedDate && r.classLevel === selectedClass
    );

    const initialMap: Record<string, { status: AttendanceStatus; remark: string }> = {};

    classRoster.forEach(student => {
      const match = existingForDateAndClass.find(
        r => r.studentId.toUpperCase() === student.studentId.toUpperCase()
      );
      if (match) {
        initialMap[student.studentId] = {
          status: match.status,
          remark: match.remark || ''
        };
      } else {
        // Default to 'Present' for rapid roll call
        initialMap[student.studentId] = {
          status: 'Present',
          remark: ''
        };
      }
    });

    setStatusMap(initialMap);
    setHasUnsavedChanges(false);
  }, [selectedDate, selectedClass, classRoster, attendanceRecords]);

  // Status metrics for current class & date
  const metrics = useMemo(() => {
    const total = classRoster.length;
    let present = 0;
    let late = 0;
    let excused = 0;
    let absent = 0;

    classRoster.forEach(student => {
      const st = statusMap[student.studentId]?.status || 'Present';
      if (st === 'Present') present++;
      else if (st === 'Late') late++;
      else if (st === 'Excused') excused++;
      else if (st === 'Absent') absent++;
    });

    const attendanceRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return { total, present, late, excused, absent, attendanceRate };
  }, [classRoster, statusMap]);

  // Handlers for individual student status
  const handleSetStatus = (studentId: string, status: AttendanceStatus) => {
    setStatusMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSetRemark = (studentId: string, remark: string) => {
    setStatusMap(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remark
      }
    }));
    setHasUnsavedChanges(true);
  };

  // Batch actions
  const handleMarkAll = (status: AttendanceStatus) => {
    const newMap: Record<string, { status: AttendanceStatus; remark: string }> = {};
    classRoster.forEach(student => {
      newMap[student.studentId] = {
        status,
        remark: statusMap[student.studentId]?.remark || ''
      };
    });
    setStatusMap(newMap);
    setHasUnsavedChanges(true);
  };

  // Save register
  const handleSaveRegister = () => {
    const nowIso = new Date().toISOString();
    const recordsToSave: DailyAttendanceRecord[] = classRoster.map(student => {
      const curr = statusMap[student.studentId] || { status: 'Present', remark: '' };
      return {
        id: `att-${selectedDate}-${student.studentId.replace(/[^a-zA-Z0-9]/g, '_')}`,
        date: selectedDate,
        studentId: student.studentId,
        studentName: student.studentName,
        classLevel: selectedClass,
        gender: student.gender,
        rollNumber: student.rollNumber,
        status: curr.status,
        remark: curr.remark.trim() || undefined,
        academicSession,
        recordedAt: nowIso,
        recordedBy: 'Admin Registrar'
      };
    });

    onSaveAttendance(recordsToSave);
    setHasUnsavedChanges(false);
    setSaveBanner(`Attendance register finalized successfully for ${selectedClass} on ${selectedDate}. (${metrics.present} Present, ${metrics.late} Late, ${metrics.excused} Excused, ${metrics.absent} Absent)`);
    setTimeout(() => setSaveBanner(null), 5000);
  };

  // Add new student to roster
  const handleAddStudentToRoster = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    const generatedId = newStudentId.trim() || `HGASS/${new Date().getFullYear()}/${Math.floor(100 + Math.random() * 900)}`;
    const newStudent: RosterStudent = {
      studentId: generatedId.toUpperCase(),
      studentName: newStudentName.trim(),
      classLevel: selectedClass,
      gender: newStudentGender,
      rollNumber: newStudentRoll.trim() || String(classRoster.length + 1).padStart(2, '0')
    };

    const updated = [...customRosterStudents, newStudent];
    setCustomRosterStudents(updated);
    try {
      localStorage.setItem('hgass_custom_roster', JSON.stringify(updated));
    } catch {
      // Ignore storage quota
    }

    setNewStudentName('');
    setNewStudentId('');
    setNewStudentRoll('');
    setIsAddStudentOpen(false);
  };

  // Export Daily Register to CSV
  const handleExportCSV = () => {
    const headers = ['Date', 'Academic Session', 'Class Level', 'Roll Number', 'Student ID', 'Student Name', 'Gender', 'Status', 'Remark'];
    const rows = classRoster.map(student => {
      const entry = statusMap[student.studentId] || { status: 'Present', remark: '' };
      return [
        selectedDate,
        academicSession,
        selectedClass,
        student.rollNumber,
        student.studentId,
        `"${student.studentName.replace(/"/g, '""')}"`,
        student.gender,
        entry.status,
        `"${entry.remark.replace(/"/g, '""')}"`
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Attendance_${selectedClass.replace(/\s+/g, '_')}_${selectedDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // History aggregation: group records by Date & Class
  const historySessions = useMemo(() => {
    const grouped = new Map<string, { date: string; classLevel: string; session: string; records: DailyAttendanceRecord[] }>();

    attendanceRecords.forEach(rec => {
      const key = `${rec.date}__${rec.classLevel}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          date: rec.date,
          classLevel: rec.classLevel,
          session: rec.academicSession,
          records: []
        });
      }
      grouped.get(key)!.records.push(rec);
    });

    return Array.from(grouped.values()).sort((a, b) => b.date.localeCompare(a.date));
  }, [attendanceRecords]);

  // Filtered students according to search
  const filteredClassRoster = useMemo(() => {
    if (!searchQuery.trim()) return classRoster;
    const q = searchQuery.toLowerCase();
    return classRoster.filter(s => 
      s.studentName.toLowerCase().includes(q) || 
      s.studentId.toLowerCase().includes(q) ||
      s.rollNumber.includes(q)
    );
  }, [classRoster, searchQuery]);

  // Student-level cumulative attendance rates across all saved records
  const studentCumulativeProfiles = useMemo(() => {
    const map = new Map<string, {
      studentId: string;
      studentName: string;
      classLevel: string;
      gender: string;
      rollNumber: string;
      totalDays: number;
      presentDays: number;
      lateDays: number;
      excusedDays: number;
      absentDays: number;
    }>();

    // Seed from current class roster or all rosters
    classRoster.forEach(s => {
      map.set(s.studentId.toUpperCase(), {
        studentId: s.studentId,
        studentName: s.studentName,
        classLevel: s.classLevel,
        gender: s.gender,
        rollNumber: s.rollNumber,
        totalDays: 0,
        presentDays: 0,
        lateDays: 0,
        excusedDays: 0,
        absentDays: 0
      });
    });

    // Accumulate all recorded dates for this class
    attendanceRecords.forEach(r => {
      if (r.classLevel === selectedClass) {
        const id = r.studentId.toUpperCase();
        if (!map.has(id)) {
          map.set(id, {
            studentId: r.studentId,
            studentName: r.studentName,
            classLevel: r.classLevel,
            gender: r.gender || 'Male',
            rollNumber: r.rollNumber || '00',
            totalDays: 0,
            presentDays: 0,
            lateDays: 0,
            excusedDays: 0,
            absentDays: 0
          });
        }
        const profile = map.get(id)!;
        profile.totalDays++;
        if (r.status === 'Present') profile.presentDays++;
        else if (r.status === 'Late') profile.lateDays++;
        else if (r.status === 'Excused') profile.excusedDays++;
        else if (r.status === 'Absent') profile.absentDays++;
      }
    });

    return Array.from(map.values()).sort((a, b) => a.studentName.localeCompare(b.studentName));
  }, [classRoster, attendanceRecords, selectedClass]);

  // Formatted date string for display
  const formattedSelectedDate = useMemo(() => {
    try {
      const parts = selectedDate.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
        return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      }
    } catch {
      // fallback
    }
    return selectedDate;
  }, [selectedDate]);

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      
      {/* HEADER STRIP */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-brand-green/10 via-emerald-50 to-teal-50/40 p-5 rounded-2xl border border-emerald-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-brand-green text-white rounded-xl shadow-xs">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black font-heading text-brand-green uppercase tracking-tight">
                Daily Student Attendance Tracking Module
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Official diocesan roll call register for recording student presence, tardiness, and excused absences.
              </p>
            </div>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-xs self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'register'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-slate-600 hover:text-brand-green hover:bg-slate-50'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Daily Register</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'history'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-slate-600 hover:text-brand-green hover:bg-slate-50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Attendance History ({historySessions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('studentProfiles')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'studentProfiles'
                ? 'bg-brand-green text-white shadow-xs'
                : 'text-slate-600 hover:text-brand-green hover:bg-slate-50'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Class Profiles</span>
          </button>
        </div>
      </div>

      {/* SAVE BANNER NOTICE */}
      {saveBanner && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2.5 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{saveBanner}</span>
        </div>
      )}

      {/* TAB 1: DAILY ATTENDANCE ROLL CALL REGISTER */}
      {activeTab === 'register' && (
        <div className="space-y-5">
          
          {/* CONTROL STRIP: DATE, CLASS LEVEL, ACADEMIC SESSION */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
              
              {/* Date Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brand-green" />
                  <span>Attendance Date</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden cursor-pointer"
                />
              </div>

              {/* Class Level Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-brand-green" />
                  <span>Class Level</span>
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden cursor-pointer"
                >
                  {CLASS_LEVELS.map(lvl => (
                    <option key={lvl} value={lvl}>{lvl}</option>
                  ))}
                </select>
              </div>

              {/* Academic Session Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Academic Session
                </label>
                <select
                  value={academicSession}
                  onChange={(e) => setAcademicSession(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden cursor-pointer"
                >
                  <option value="2025/2026">2025/2026 Academic Session</option>
                  <option value="2024/2025">2024/2025 Academic Session</option>
                  <option value="2026/2027">2026/2027 Academic Session</option>
                </select>
              </div>

              {/* Action Buttons: Add Student & Print */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(true)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-200"
                  title="Add an enrolled student to this class roster"
                >
                  <UserPlus className="w-3.5 h-3.5 text-slate-600" />
                  <span>Add Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrintRegisterOpen(true)}
                  className="bg-brand-green/10 hover:bg-brand-green/20 text-brand-green py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer border border-brand-green/30"
                  title="Open official printable roll call sheet"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>
              </div>
            </div>

            {/* Date subtitle indicator */}
            <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">{formattedSelectedDate}</span>
                <span>•</span>
                <span className="bg-slate-100 px-2.5 py-0.5 rounded-full font-bold text-slate-600 uppercase tracking-wider text-[11px]">
                  Class: {selectedClass}
                </span>
                <span>•</span>
                <span>{classRoster.length} Students on Roster</span>
              </div>

              {hasUnsavedChanges && (
                <span className="text-amber-700 font-bold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                  Unsaved changes in this register
                </span>
              )}
            </div>
          </div>

          {/* ATTENDANCE KPI SUMMARY CARDS */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* Total Roster */}
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Class Roster</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black font-heading text-slate-800">{metrics.total}</span>
                <span className="text-xs text-slate-400 font-medium">Enrolled</span>
              </div>
            </div>

            {/* Present */}
            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">Present</p>
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black font-heading text-emerald-700">{metrics.present}</span>
                <span className="text-xs text-emerald-600 font-bold">
                  ({metrics.total > 0 ? Math.round((metrics.present / metrics.total) * 100) : 0}%)
                </span>
              </div>
            </div>

            {/* Late */}
            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">Late</p>
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black font-heading text-amber-700">{metrics.late}</span>
                <span className="text-xs text-amber-600 font-bold">
                  ({metrics.total > 0 ? Math.round((metrics.late / metrics.total) * 100) : 0}%)
                </span>
              </div>
            </div>

            {/* Excused */}
            <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Excused</p>
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black font-heading text-blue-700">{metrics.excused}</span>
                <span className="text-xs text-blue-600 font-bold">
                  ({metrics.total > 0 ? Math.round((metrics.excused / metrics.total) * 100) : 0}%)
                </span>
              </div>
            </div>

            {/* Absent */}
            <div className="bg-rose-50/70 p-3.5 rounded-xl border border-rose-200 shadow-xs">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold text-rose-800 uppercase tracking-wider">Absent</p>
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              </div>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black font-heading text-rose-700">{metrics.absent}</span>
                <span className="text-xs text-rose-600 font-bold">
                  ({metrics.total > 0 ? Math.round((metrics.absent / metrics.total) * 100) : 0}%)
                </span>
              </div>
            </div>

            {/* Turnout Rate */}
            <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xs">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Turnout Rate</p>
              <div className="flex items-baseline gap-1.5 mt-1">
                <span className="text-2xl font-black font-heading text-brand-yellow">{metrics.attendanceRate}%</span>
                <span className="text-[10px] text-slate-300">Rate</span>
              </div>
            </div>
          </div>

          {/* BATCH ACTION CONTROLS & SEARCH BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Batch Mark:</span>
              <button
                type="button"
                onClick={() => handleMarkAll('Present')}
                className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Mark All Present
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('Absent')}
                className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Mark All Absent
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('Late')}
                className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Mark All Late
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll('Excused')}
                className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Mark All Excused
              </button>
            </div>

            {/* Search Filter in Current Class */}
            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or roll no..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* MAIN ROLL CALL TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 text-center w-14">Roll</th>
                    <th className="px-4 py-3.5">Student Biodata</th>
                    <th className="px-4 py-3.5 text-center">Attendance Status Selection</th>
                    <th className="px-4 py-3.5">Remarks / Reason / Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredClassRoster.map((student) => {
                    const currentEntry = statusMap[student.studentId] || { status: 'Present', remark: '' };
                    const currentStatus = currentEntry.status;

                    return (
                      <tr 
                        key={student.studentId}
                        className={`transition hover:bg-slate-50/80 ${
                          currentStatus === 'Absent' ? 'bg-rose-50/30' :
                          currentStatus === 'Late' ? 'bg-amber-50/30' :
                          currentStatus === 'Excused' ? 'bg-blue-50/30' : ''
                        }`}
                      >
                        {/* Roll Number */}
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-500">
                          {student.rollNumber}
                        </td>

                        {/* Student Biodata */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-black text-brand-green text-xs shrink-0 overflow-hidden">
                              {student.passportPhoto ? (
                                <img 
                                  src={student.passportPhoto} 
                                  alt={student.studentName} 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                student.studentName.charAt(0)
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 leading-tight">{student.studentName}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[11px] font-mono text-slate-400 font-semibold">{student.studentId}</span>
                                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  student.gender === 'Female' ? 'bg-pink-50 text-pink-700' : 'bg-blue-50 text-blue-700'
                                }`}>
                                  {student.gender}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Status Toggle Buttons */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                            
                            {/* Present Button */}
                            <button
                              type="button"
                              onClick={() => handleSetStatus(student.studentId, 'Present')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
                                currentStatus === 'Present'
                                  ? 'bg-emerald-600 text-white shadow-xs scale-102 ring-2 ring-emerald-600/30'
                                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </button>

                            {/* Late Button */}
                            <button
                              type="button"
                              onClick={() => handleSetStatus(student.studentId, 'Late')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
                                currentStatus === 'Late'
                                  ? 'bg-amber-500 text-white shadow-xs scale-102 ring-2 ring-amber-500/30'
                                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5" />
                              <span>Late</span>
                            </button>

                            {/* Excused Button */}
                            <button
                              type="button"
                              onClick={() => handleSetStatus(student.studentId, 'Excused')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
                                currentStatus === 'Excused'
                                  ? 'bg-blue-600 text-white shadow-xs scale-102 ring-2 ring-blue-600/30'
                                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60'
                              }`}
                            >
                              <Info className="w-3.5 h-3.5" />
                              <span>Excused</span>
                            </button>

                            {/* Absent Button */}
                            <button
                              type="button"
                              onClick={() => handleSetStatus(student.studentId, 'Absent')}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
                                currentStatus === 'Absent'
                                  ? 'bg-rose-600 text-white shadow-xs scale-102 ring-2 ring-rose-600/30'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
                              }`}
                            >
                              <X className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </button>
                          </div>
                        </td>

                        {/* Remarks Input */}
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            placeholder={
                              currentStatus === 'Late' ? 'e.g. Arrived 08:25 AM due to traffic' :
                              currentStatus === 'Excused' ? 'e.g. Clinic appointment note' :
                              currentStatus === 'Absent' ? 'e.g. Unreported absence' :
                              'Optional remark...'
                            }
                            value={currentEntry.remark}
                            onChange={(e) => handleSetRemark(student.studentId, e.target.value)}
                            className="w-full px-3 py-1.5 bg-slate-50/70 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-2 focus:ring-brand-green/30 focus:outline-hidden transition"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredClassRoster.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No students found matching "{searchQuery}" in {selectedClass}.
              </div>
            )}

            {/* ACTION FOOTER */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-500">
                <span className="font-bold text-slate-700">{classRoster.length} Total Students</span> in {selectedClass} • Session: <span className="font-semibold">{academicSession}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="px-3.5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer border border-slate-200 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-500" />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveRegister}
                  className="px-5 py-2.5 bg-brand-green hover:bg-brand-green-dark text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-brand-green/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Attendance Register</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ATTENDANCE HISTORY & LOG DESK */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-heading font-black text-sm text-slate-900 uppercase tracking-tight">
                  Past Attendance Registers Ledger
                </h4>
                <p className="text-[11px] text-slate-500">
                  Review previously finalized daily attendance sessions across all dates and academic arms.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={historyClassFilter}
                onChange={(e) => setHistoryClassFilter(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Class Levels</option>
                {CLASS_LEVELS.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Search date YYYY-MM-DD..."
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-hidden w-44"
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Class Level</th>
                    <th className="px-4 py-3">Recorded Total</th>
                    <th className="px-4 py-3 text-center">Present</th>
                    <th className="px-4 py-3 text-center">Late</th>
                    <th className="px-4 py-3 text-center">Excused</th>
                    <th className="px-4 py-3 text-center">Absent</th>
                    <th className="px-4 py-3 text-center">Turnout</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {historySessions
                    .filter(session => {
                      if (historyClassFilter !== 'ALL' && session.classLevel !== historyClassFilter) return false;
                      if (historySearchQuery && !session.date.includes(historySearchQuery)) return false;
                      return true;
                    })
                    .map((session) => {
                      const total = session.records.length;
                      const present = session.records.filter(r => r.status === 'Present').length;
                      const late = session.records.filter(r => r.status === 'Late').length;
                      const excused = session.records.filter(r => r.status === 'Excused').length;
                      const absent = session.records.filter(r => r.status === 'Absent').length;
                      const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

                      return (
                        <tr key={`${session.date}__${session.classLevel}`} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-mono font-bold text-slate-800">
                            {session.date}
                          </td>
                          <td className="px-4 py-3 font-bold text-brand-green">
                            {session.classLevel}
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-600">
                            {total} Students
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-emerald-700 bg-emerald-50/30">
                            {present}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-amber-700 bg-amber-50/30">
                            {late}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-blue-700 bg-blue-50/30">
                            {excused}
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-rose-700 bg-rose-50/30">
                            {absent}
                          </td>
                          <td className="px-4 py-3 text-center font-black font-mono text-slate-800">
                            {rate}%
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedDate(session.date);
                                  setSelectedClass(session.classLevel);
                                  setActiveTab('register');
                                }}
                                className="px-2.5 py-1 bg-brand-green/10 hover:bg-brand-green/20 text-brand-green rounded text-xs font-bold uppercase transition cursor-pointer"
                              >
                                Open Register
                              </button>

                              {onClearClassDate && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (window.confirm(`Are you sure you want to delete the attendance register for ${session.classLevel} on ${session.date}?`)) {
                                      onClearClassDate(session.date, session.classLevel);
                                    }
                                  }}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                                  title="Delete this daily register"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>

            {historySessions.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No attendance registers recorded yet. Select a class and date above to record the first register.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: STUDENT ATTENDANCE PROFILES & CUMULATIVE STATS */}
      {activeTab === 'studentProfiles' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div>
              <h4 className="font-heading font-black text-sm text-slate-900 uppercase tracking-tight">
                Cumulative Student Attendance Summary ({selectedClass})
              </h4>
              <p className="text-[11px] text-slate-500">
                Audited student turnout breakdown and cumulative attendance percentages across all recorded days in {academicSession}.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Class:</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
              >
                {CLASS_LEVELS.map(lvl => (
                  <option key={lvl} value={lvl}>{lvl}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-center">Roll</th>
                    <th className="px-4 py-3">Student Name & ID</th>
                    <th className="px-4 py-3 text-center">Sessions Logged</th>
                    <th className="px-4 py-3 text-center">Days Present</th>
                    <th className="px-4 py-3 text-center">Days Late</th>
                    <th className="px-4 py-3 text-center">Days Excused</th>
                    <th className="px-4 py-3 text-center">Days Absent</th>
                    <th className="px-4 py-3 text-center">Turnout Rate</th>
                    <th className="px-4 py-3">Status Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentCumulativeProfiles.map((p) => {
                    const rate = p.totalDays > 0 ? Math.round(((p.presentDays + p.lateDays) / p.totalDays) * 100) : 100;
                    return (
                      <tr key={p.studentId} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-center font-mono font-bold text-slate-500">
                          {p.rollNumber}
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900 leading-tight">{p.studentName}</p>
                          <p className="text-[11px] font-mono text-slate-400 font-semibold">{p.studentId}</p>
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-slate-600">
                          {p.totalDays}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-emerald-700 bg-emerald-50/40">
                          {p.presentDays}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-amber-700 bg-amber-50/40">
                          {p.lateDays}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-blue-700 bg-blue-50/40">
                          {p.excusedDays}
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-rose-700 bg-rose-50/40">
                          {p.absentDays}
                        </td>
                        <td className="px-4 py-3 text-center font-black font-mono text-slate-900">
                          {rate}%
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            rate >= 90 ? 'bg-emerald-100 text-emerald-800' :
                            rate >= 75 ? 'bg-blue-100 text-blue-800' :
                            rate >= 60 ? 'bg-amber-100 text-amber-800' :
                            'bg-rose-100 text-rose-800'
                          }`}>
                            {rate >= 90 ? 'Exemplary Attendance' :
                             rate >= 75 ? 'Satisfactory Attendance' :
                             rate >= 60 ? 'Attendance Warning' :
                             'Critical Absence'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD STUDENT TO CLASS ROSTER */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-green/10 text-brand-green rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-slate-900 uppercase">
                    Add Student to {selectedClass} Roster
                  </h4>
                  <p className="text-[11px] text-slate-400">Enroll student into daily attendance roll call.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddStudentOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddStudentToRoster} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chukwudi Pascal Okonkwo"
                  value={newStudentName}
                  onChange={(e) => setNewStudentName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-brand-green/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Student Reg ID</label>
                  <input
                    type="text"
                    placeholder="e.g. HGASS/2026/045"
                    value={newStudentId}
                    onChange={(e) => setNewStudentId(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Roll Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 35"
                    value={newStudentRoll}
                    onChange={(e) => setNewStudentRoll(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:outline-hidden focus:ring-2 focus:ring-brand-green/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">Gender</label>
                <select
                  value={newStudentGender}
                  onChange={(e) => setNewStudentGender(e.target.value as 'Male' | 'Female')}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-hidden cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-xl text-xs font-bold uppercase transition cursor-pointer shadow-sm shadow-brand-green/30"
                >
                  Add Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: PRINTABLE OFFICIAL ATTENDANCE REGISTER */}
      {isPrintRegisterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-slate-200 space-y-6 my-8">
            
            {/* Action Bar */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 print:hidden">
              <div className="flex items-center gap-2">
                <Printer className="w-5 h-5 text-brand-green" />
                <span className="font-heading font-black text-xs text-slate-800 uppercase">
                  Print Preview: Official Daily Roll Call Sheet
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg text-xs font-bold uppercase flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintRegisterOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* PRINTABLE REGISTER CANVAS */}
            <div id="printable-daily-register" className="space-y-6">
              
              {/* Official Header */}
              <div className="text-center pb-4 border-b-2 border-brand-green space-y-1">
                <div className="flex justify-center mb-2">
                  <img src={SCHOOL_LOGO_URL} alt="School Crest" className="h-14 w-auto" referrerPolicy="no-referrer" />
                </div>
                <h2 className="text-lg font-black font-heading text-brand-green uppercase tracking-wider">
                  HOLY GHOST ACADEMY SECONDARY SCHOOL
                </h2>
                <p className="text-[11px] font-serif italic text-slate-600">
                  Affiliated to the Catholic Diocese of Awka • Motto: Discipline and Wisdom
                </p>
                <div className="pt-2">
                  <span className="inline-block px-3 py-0.5 bg-slate-100 border border-slate-200 text-slate-800 text-xs font-black uppercase tracking-widest rounded-md">
                    OFFICIAL DAILY ATTENDANCE ROLL CALL REGISTER
                  </span>
                </div>
              </div>

              {/* Class & Date Meta Table */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">CLASS LEVEL</span>
                  <span className="font-black text-brand-green text-sm">{selectedClass}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">ATTENDANCE DATE</span>
                  <span className="font-bold text-slate-800 text-xs">{selectedDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">ACADEMIC SESSION</span>
                  <span className="font-bold text-slate-800 text-xs">{academicSession}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">TURNOUT STATS</span>
                  <span className="font-bold text-slate-800 text-xs">{metrics.present}P • {metrics.late}L • {metrics.excused}E • {metrics.absent}A</span>
                </div>
              </div>

              {/* Roll Call Table */}
              <table className="w-full text-left text-xs border border-slate-300">
                <thead className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-700">
                  <tr>
                    <th className="p-2 border-r border-slate-300 text-center w-12">Roll</th>
                    <th className="p-2 border-r border-slate-300">Student Name</th>
                    <th className="p-2 border-r border-slate-300 w-28">Student Reg ID</th>
                    <th className="p-2 border-r border-slate-300 text-center w-24">Status</th>
                    <th className="p-2">Official Remark / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {classRoster.map((student) => {
                    const entry = statusMap[student.studentId] || { status: 'Present', remark: '' };
                    return (
                      <tr key={student.studentId}>
                        <td className="p-2 border-r border-slate-200 text-center font-mono font-bold">{student.rollNumber}</td>
                        <td className="p-2 border-r border-slate-200 font-semibold">{student.studentName}</td>
                        <td className="p-2 border-r border-slate-200 font-mono text-[11px] text-slate-600">{student.studentId}</td>
                        <td className="p-2 border-r border-slate-200 text-center font-bold">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase ${
                            entry.status === 'Present' ? 'text-emerald-800 font-black' :
                            entry.status === 'Late' ? 'text-amber-800 font-black' :
                            entry.status === 'Excused' ? 'text-blue-800 font-black' :
                            'text-rose-800 font-black'
                          }`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="p-2 text-slate-600 text-[11px]">{entry.remark || '—'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Verification & Signatures */}
              <div className="pt-8 grid grid-cols-2 gap-8 text-xs">
                <div className="border-t border-slate-300 pt-2 text-center">
                  <p className="font-bold text-slate-800">Form Teacher / Class Master Signature</p>
                  <p className="text-[10px] text-slate-400">Date: {selectedDate}</p>
                </div>
                <div className="border-t border-slate-300 pt-2 text-center">
                  <p className="font-bold text-slate-800">Vice Principal (Academics) Seal</p>
                  <p className="text-[10px] text-slate-400">Holy Ghost Academy Awka</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
