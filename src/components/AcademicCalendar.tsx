/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  CalendarCheck, 
  CalendarPlus, 
  CalendarDays, 
  Clock, 
  MapPin, 
  Users, 
  AlertCircle, 
  CheckCircle2, 
  BookOpen, 
  Sparkles, 
  Plus, 
  Edit3, 
  Trash2, 
  Filter, 
  Search, 
  Download, 
  Printer, 
  RotateCcw, 
  GraduationCap, 
  Flame, 
  ChevronRight, 
  Info, 
  X,
  Sun,
  Award,
  Flag
} from 'lucide-react';
import { 
  AcademicCalendarEvent, 
  AcademicEventType, 
  AcademicTermType, 
  EventAudienceType 
} from '../types';

interface AcademicCalendarProps {
  events: AcademicCalendarEvent[];
  isAdmin?: boolean;
  onAddEvent?: (event: Omit<AcademicCalendarEvent, 'id' | 'createdAt'>) => void;
  onEditEvent?: (id: string, fields: Partial<AcademicCalendarEvent>) => void;
  onDeleteEvent?: (id: string) => void;
  onResetEvents?: () => void;
}

const EVENT_TYPE_STYLES: Record<AcademicEventType, { bg: string; text: string; border: string; badgeBg: string; label: string }> = {
  Exam: {
    bg: 'bg-red-50/80',
    text: 'text-red-800',
    border: 'border-red-200',
    badgeBg: 'bg-red-600 text-white',
    label: 'Examination / Test'
  },
  Holiday: {
    bg: 'bg-amber-50/80',
    text: 'text-amber-800',
    border: 'border-amber-200',
    badgeBg: 'bg-amber-500 text-slate-900 font-bold',
    label: 'Holiday / Recess'
  },
  Resumption: {
    bg: 'bg-emerald-50/80',
    text: 'text-emerald-900',
    border: 'border-emerald-200',
    badgeBg: 'bg-brand-green text-white',
    label: 'Resumption Date'
  },
  Meeting: {
    bg: 'bg-blue-50/80',
    text: 'text-blue-900',
    border: 'border-blue-200',
    badgeBg: 'bg-blue-600 text-white',
    label: 'Meeting / Orientation'
  },
  Sports: {
    bg: 'bg-teal-50/80',
    text: 'text-teal-900',
    border: 'border-teal-200',
    badgeBg: 'bg-teal-600 text-white',
    label: 'Sports & Athletics'
  },
  Religious: {
    bg: 'bg-purple-50/80',
    text: 'text-purple-900',
    border: 'border-purple-200',
    badgeBg: 'bg-purple-700 text-white',
    label: 'Solemn Mass & Feast'
  },
  Deadline: {
    bg: 'bg-rose-50/80',
    text: 'text-rose-900',
    border: 'border-rose-200',
    badgeBg: 'bg-rose-600 text-white',
    label: 'Academic Deadline'
  },
  Other: {
    bg: 'bg-slate-50',
    text: 'text-slate-800',
    border: 'border-slate-200',
    badgeBg: 'bg-slate-700 text-white',
    label: 'School Activity'
  }
};

export default function AcademicCalendar({
  events = [],
  isAdmin = false,
  onAddEvent,
  onEditEvent,
  onDeleteEvent,
  onResetEvents
}: AcademicCalendarProps) {
  // Filter and search states
  const [selectedTerm, setSelectedTerm] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedAudience, setSelectedAudience] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSession, setSelectedSession] = useState<string>('ALL');
  const [showOnlyUpcoming, setShowOnlyUpcoming] = useState<boolean>(false);

  // Modal states for admin operations
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  // Form input states
  const [formData, setFormData] = useState<{
    title: string;
    eventType: AcademicEventType;
    startDate: string;
    endDate: string;
    term: AcademicTermType;
    academicSession: string;
    targetAudience: EventAudienceType;
    location: string;
    description: string;
    isHighlight: boolean;
  }>({
    title: '',
    eventType: 'Exam',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    term: '1st Term',
    academicSession: '2026/2027',
    targetAudience: 'All Students',
    location: '',
    description: '',
    isHighlight: false
  });

  // Calculate unique sessions available
  const availableSessions = useMemo(() => {
    const set = new Set<string>();
    events.forEach(e => {
      if (e.academicSession) set.add(e.academicSession);
    });
    return Array.from(set).sort().reverse();
  }, [events]);

  // Today reference for date calculations (normalized to 00:00:00)
  const todayStr = useMemo(() => {
    const d = new Date();
    return d.toISOString().split('T')[0];
  }, []);

  // Filtered & Sorted events
  const filteredEvents = useMemo(() => {
    return events.filter(event => {
      if (selectedTerm !== 'ALL' && event.term !== selectedTerm) return false;
      if (selectedType !== 'ALL' && event.eventType !== selectedType) return false;
      if (selectedAudience !== 'ALL' && event.targetAudience !== selectedAudience) return false;
      if (selectedSession !== 'ALL' && event.academicSession !== selectedSession) return false;
      
      const effectiveEndDate = event.endDate || event.startDate;
      if (showOnlyUpcoming && effectiveEndDate < todayStr) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = event.title.toLowerCase().includes(q);
        const matchesDesc = (event.description || '').toLowerCase().includes(q);
        const matchesLoc = (event.location || '').toLowerCase().includes(q);
        const matchesType = event.eventType.toLowerCase().includes(q);
        const matchesAudience = (event.targetAudience || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc && !matchesLoc && !matchesType && !matchesAudience) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => a.startDate.localeCompare(b.startDate));
  }, [events, selectedTerm, selectedType, selectedAudience, selectedSession, showOnlyUpcoming, searchQuery, todayStr]);

  // Next upcoming major event
  const nextUpcomingEvent = useMemo(() => {
    const upcoming = events
      .filter(e => (e.endDate || e.startDate) >= todayStr)
      .sort((a, b) => a.startDate.localeCompare(b.startDate));
    return upcoming[0] || null;
  }, [events, todayStr]);

  // Statistics counters
  const stats = useMemo(() => {
    const total = events.length;
    const exams = events.filter(e => e.eventType === 'Exam').length;
    const holidays = events.filter(e => e.eventType === 'Holiday').length;
    const resumptions = events.filter(e => e.eventType === 'Resumption').length;
    const upcomingCount = events.filter(e => (e.endDate || e.startDate) >= todayStr).length;
    return { total, exams, holidays, resumptions, upcomingCount };
  }, [events, todayStr]);

  // Handle open add modal
  const handleOpenAddModal = () => {
    setEditingEventId(null);
    setFormData({
      title: '',
      eventType: 'Exam',
      startDate: todayStr,
      endDate: '',
      term: '1st Term',
      academicSession: '2026/2027',
      targetAudience: 'All Students',
      location: '',
      description: '',
      isHighlight: false
    });
    setIsFormOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (event: AcademicCalendarEvent) => {
    setEditingEventId(event.id);
    setFormData({
      title: event.title,
      eventType: event.eventType,
      startDate: event.startDate,
      endDate: event.endDate || '',
      term: event.term,
      academicSession: event.academicSession,
      targetAudience: event.targetAudience || 'All Students',
      location: event.location || '',
      description: event.description || '',
      isHighlight: !!event.isHighlight
    });
    setIsFormOpen(true);
  };

  // Handle form submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Please enter a valid title for the academic event.');
      return;
    }
    if (!formData.startDate) {
      alert('Please specify the event start date.');
      return;
    }

    if (editingEventId) {
      onEditEvent?.(editingEventId, {
        title: formData.title.trim(),
        eventType: formData.eventType,
        startDate: formData.startDate,
        endDate: formData.endDate ? formData.endDate : undefined,
        term: formData.term,
        academicSession: formData.academicSession,
        targetAudience: formData.targetAudience,
        location: formData.location.trim() || undefined,
        description: formData.description.trim() || undefined,
        isHighlight: formData.isHighlight
      });
      setFeedbackMessage(`Updated event: "${formData.title}"`);
    } else {
      onAddEvent?.({
        title: formData.title.trim(),
        eventType: formData.eventType,
        startDate: formData.startDate,
        endDate: formData.endDate ? formData.endDate : undefined,
        term: formData.term,
        academicSession: formData.academicSession,
        targetAudience: formData.targetAudience,
        location: formData.location.trim() || undefined,
        description: formData.description.trim() || undefined,
        isHighlight: formData.isHighlight
      });
      setFeedbackMessage(`Scheduled new event: "${formData.title}"`);
    }

    setIsFormOpen(false);
    setEditingEventId(null);
    setTimeout(() => setFeedbackMessage(''), 4000);
  };

  // Confirm delete
  const handleConfirmDelete = (id: string) => {
    onDeleteEvent?.(id);
    setConfirmDeleteId(null);
    setFeedbackMessage('Event removed from academic calendar.');
    setTimeout(() => setFeedbackMessage(''), 3000);
  };

  // Date formatting helpers
  const formatFriendlyDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-GB', {
          weekday: 'short',
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  const getDayAndMonth = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
        const mIdx = parseInt(parts[1]) - 1;
        return {
          day: parts[2],
          month: monthNames[mIdx] || 'DATE',
          year: parts[0]
        };
      }
    } catch {
      // fallback
    }
    return { day: '--', month: 'CAL', year: '2026' };
  };

  const getDaysRemainingText = (startDate: string, endDate?: string) => {
    const now = new Date(todayStr).getTime();
    const start = new Date(startDate).getTime();
    const end = endDate ? new Date(endDate).getTime() : start;

    const oneDay = 1000 * 60 * 60 * 24;

    if (now >= start && now <= end) {
      return { label: 'Ongoing Today', color: 'bg-emerald-600 text-white font-bold animate-pulse' };
    }
    if (now > end) {
      return { label: 'Concluded', color: 'bg-slate-100 text-slate-500' };
    }

    const diffDays = Math.ceil((start - now) / oneDay);
    if (diffDays === 1) {
      return { label: 'Tomorrow', color: 'bg-amber-600 text-white font-bold' };
    }
    if (diffDays <= 7) {
      return { label: `In ${diffDays} days`, color: 'bg-amber-500 text-slate-900 font-bold' };
    }
    if (diffDays <= 30) {
      return { label: `In ${diffDays} days`, color: 'bg-brand-green/10 text-brand-green font-semibold' };
    }
    const diffMonths = Math.round(diffDays / 30);
    return { label: `In ~${diffMonths} mo`, color: 'bg-slate-100 text-slate-600' };
  };

  // Export to iCalendar file (.ics)
  const handleExportIcs = () => {
    if (filteredEvents.length === 0) {
      alert('No events to export with current filters.');
      return;
    }

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Holy Ghost Academy Awka//Academic Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:Holy Ghost Academy Academic Calendar',
      'X-WR-TIMEZONE:Africa/Lagos'
    ];

    filteredEvents.forEach(ev => {
      const dtStart = ev.startDate.replace(/-/g, '');
      const dtEnd = ev.endDate ? ev.endDate.replace(/-/g, '') : dtStart;
      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:hga-cal-${ev.id}@holyghostacademy.ng`);
      icsContent.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`);
      icsContent.push(`DTSTART;VALUE=DATE:${dtStart}`);
      icsContent.push(`DTEND;VALUE=DATE:${dtEnd}`);
      icsContent.push(`SUMMARY:${ev.title}`);
      if (ev.description) {
        icsContent.push(`DESCRIPTION:${ev.description.replace(/\n/g, '\\n')}`);
      }
      if (ev.location) {
        icsContent.push(`LOCATION:${ev.location}`);
      }
      icsContent.push(`CATEGORIES:${ev.eventType},${ev.term}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = `HolyGhostAcademy_Calendar_${selectedTerm === 'ALL' ? 'Session' : selectedTerm}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print schedule
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Identity */}
      <div className="bg-gradient-to-r from-brand-green to-emerald-900 text-white p-6 sm:p-8 rounded-xl shadow-sm border-b-4 border-brand-yellow relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-white/10 text-brand-yellow text-xs font-semibold uppercase tracking-wider backdrop-blur-xs">
              <CalendarDays className="w-3.5 h-3.5" />
              <span>Official Academy Schedule</span>
              <span>•</span>
              <span>Diocese of Awka</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-white uppercase">
              Academic Calendar & Term Dates
            </h1>
            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed font-sans">
              Comprehensive schedule of examination timetables, resumption dates, national & religious holidays, 
              inter-house championships, and speech prize-giving ceremonies.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 no-print">
            {isAdmin && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="px-4 py-2 bg-brand-yellow hover:bg-yellow-400 text-slate-900 rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4 text-slate-900" />
                <span>Add Event</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleExportIcs}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 border border-white/20 cursor-pointer"
              title="Download standard iCalendar file (.ics) for Google Calendar or iPhone"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sync to Calendar (.ics)</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 border border-white/20 cursor-pointer"
              title="Print official academic calendar schedule"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Schedule</span>
            </button>

            {isAdmin && onResetEvents && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all academic calendar events back to the diocesan default schedule? Custom changes will be overwritten.')) {
                    onResetEvents();
                    setFeedbackMessage('Calendar reset to diocesan default schedule.');
                    setTimeout(() => setFeedbackMessage(''), 3000);
                  }
                }}
                className="px-3 py-2 bg-red-800/60 hover:bg-red-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition flex items-center gap-1.5 border border-red-700/50 cursor-pointer"
                title="Reset to default calendar"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Alert */}
        {feedbackMessage && (
          <div className="mt-4 p-3 bg-white text-slate-900 rounded-lg text-xs font-bold flex items-center gap-2 shadow-md animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMessage}</span>
          </div>
        )}
      </div>

      {/* 2. Key Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Scheduled</span>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-xl font-black text-slate-800 font-heading">{stats.total}</h4>
            <Calendar className="w-4 h-4 text-brand-green" />
          </div>
          <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{stats.upcomingCount} upcoming</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-red-100 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider">Exam Series</span>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-xl font-black text-red-700 font-heading">{stats.exams}</h4>
            <BookOpen className="w-4 h-4 text-red-600" />
          </div>
          <span className="text-[10px] text-red-500 font-sans mt-0.5 block">CA tests & terminal finals</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-amber-100 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Holidays & Recess</span>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-xl font-black text-amber-600 font-heading">{stats.holidays}</h4>
            <Sun className="w-4 h-4 text-amber-500" />
          </div>
          <span className="text-[10px] text-amber-600 font-sans mt-0.5 block">Mid-terms & vacation</span>
        </div>

        <div className="bg-white p-3.5 rounded-lg border border-emerald-100 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Resumptions</span>
          <div className="flex items-center justify-between mt-1">
            <h4 className="text-xl font-black text-brand-green font-heading">{stats.resumptions}</h4>
            <Flag className="w-4 h-4 text-brand-green" />
          </div>
          <span className="text-[10px] text-emerald-600 font-sans mt-0.5 block">Boarding & day return</span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-brand-oxblood to-red-950 text-white p-3.5 rounded-lg shadow-2xs flex flex-col justify-between">
          <span className="text-[9px] uppercase font-bold text-amber-300 tracking-wider">Next Key Milestone</span>
          {nextUpcomingEvent ? (
            <div className="mt-1">
              <p className="text-xs font-bold line-clamp-1 text-white">{nextUpcomingEvent.title}</p>
              <div className="flex items-center gap-1.5 text-[10px] text-amber-200 mt-0.5 font-mono">
                <Clock className="w-3 h-3 shrink-0" />
                <span>{nextUpcomingEvent.startDate}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-300 mt-1">All events concluded</p>
          )}
        </div>
      </div>

      {/* 3. Filter Bar & Search Desk */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 no-print">
        {/* Term Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 pb-2 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Academic Term:</span>
          </span>
          {[
            { id: 'ALL', label: 'All Terms' },
            { id: '1st Term', label: '1st Term (Autumn)' },
            { id: '2nd Term', label: '2nd Term (Lent)' },
            { id: '3rd Term', label: '3rd Term (Trinity)' },
            { id: 'Annual', label: 'Annual / Session' }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedTerm(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition cursor-pointer ${
                selectedTerm === tab.id
                  ? 'bg-brand-green text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Secondary Filters Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search exams, holidays, resumptions..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden"
            />
            {searchQuery && (
              <button 
                type="button" 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Event Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Event Types</option>
              <option value="Exam">Examinations & Tests</option>
              <option value="Holiday">Holidays & Recess</option>
              <option value="Resumption">Resumption Dates</option>
              <option value="Religious">Solemn Masses & Religious</option>
              <option value="Sports">Sports & Athletics</option>
              <option value="Meeting">Meetings & Ceremonies</option>
              <option value="Deadline">Deadlines</option>
            </select>
          </div>

          {/* Target Audience Filter */}
          <div>
            <select
              value={selectedAudience}
              onChange={e => setSelectedAudience(e.target.value)}
              className="w-full py-1.5 px-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden cursor-pointer"
            >
              <option value="ALL">All Audiences</option>
              <option value="All Students">All Students</option>
              <option value="Boarding Students">Boarding Students Only</option>
              <option value="Day Students">Day Students Only</option>
              <option value="SS Only">Senior Secondary (SS Only)</option>
              <option value="JSS Only">Junior Secondary (JSS Only)</option>
              <option value="Parents & Guardians">Parents & Guardians</option>
            </select>
          </div>

          {/* Upcoming Toggle */}
          <div className="flex items-center">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showOnlyUpcoming}
                onChange={e => setShowOnlyUpcoming(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-slate-300 text-brand-green focus:ring-brand-green cursor-pointer"
              />
              <span>Show Upcoming Only</span>
            </label>
          </div>
        </div>
      </div>

      {/* 4. Events List View for Students & Parents */}
      <div className="space-y-3">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(event => {
            const dateObj = getDayAndMonth(event.startDate);
            const style = EVENT_TYPE_STYLES[event.eventType] || EVENT_TYPE_STYLES.Other;
            const remaining = getDaysRemainingText(event.startDate, event.endDate);
            const isSingleDay = !event.endDate || event.endDate === event.startDate;

            return (
              <div
                key={event.id}
                className={`bg-white rounded-xl border ${
                  event.isHighlight ? 'border-amber-300 ring-1 ring-amber-200/60 shadow-xs' : 'border-slate-200 hover:border-slate-300 shadow-2xs'
                } p-4 sm:p-5 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
              >
                {/* Left: Date Block & Main Details */}
                <div className="flex items-start gap-4 grow">
                  {/* Calendar Day Badge */}
                  <div className="shrink-0 flex flex-col items-center justify-center w-14 sm:w-16 h-16 sm:h-18 rounded-lg bg-slate-50 border border-slate-200 text-center shadow-2xs overflow-hidden">
                    <span className="w-full py-0.5 bg-brand-green text-white font-mono text-[9px] font-bold tracking-wider uppercase">
                      {dateObj.month}
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-slate-800 font-heading leading-tight pt-1">
                      {dateObj.day}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono pb-1">
                      {dateObj.year}
                    </span>
                  </div>

                  {/* Information block */}
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${style.badgeBg}`}>
                        {style.label}
                      </span>

                      <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${remaining.color}`}>
                        {remaining.label}
                      </span>

                      {event.isHighlight && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          <span>Key Milestone</span>
                        </span>
                      )}

                      <span className="text-[10px] font-semibold text-slate-400 uppercase font-mono">
                        {event.term} ({event.academicSession})
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold font-heading text-slate-900 leading-snug">
                      {event.title}
                    </h3>

                    {/* Dates & Location Line */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-sans">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {formatFriendlyDate(event.startDate)}
                          {!isSingleDay && event.endDate && ` – ${formatFriendlyDate(event.endDate)}`}
                        </span>
                      </div>

                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span>{event.location}</span>
                        </div>
                      )}

                      {event.targetAudience && (
                        <div className="flex items-center gap-1 text-slate-600 font-medium">
                          <Users className="w-3.5 h-3.5 text-brand-green" />
                          <span>{event.targetAudience}</span>
                        </div>
                      )}
                    </div>

                    {/* Description Paragraph */}
                    {event.description && (
                      <p className="text-xs text-slate-600 leading-relaxed pt-0.5 max-w-3xl">
                        {event.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Administrator Action Controls */}
                {isAdmin && (
                  <div className="flex items-center space-x-1.5 self-end sm:self-auto shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 no-print">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(event)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center gap-1"
                      title="Edit event details"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(event.id)}
                      className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg transition cursor-pointer"
                      title="Delete event from calendar"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-12 bg-white rounded-xl border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-700 font-heading">No Scheduled Events Found</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              No academic events matched your current search filters. Try clearing search keywords or selecting "All Terms".
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedTerm('ALL');
                setSelectedType('ALL');
                setSelectedAudience('ALL');
                setSearchQuery('');
                setShowOnlyUpcoming(false);
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 5. Print Official Footer Notice */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-500 leading-relaxed space-y-1">
        <p className="font-bold text-slate-700 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-brand-green" />
          <span>Holy Ghost Academy Awka Official Academic Regulations Note:</span>
        </p>
        <p>
          Event dates are published by the Academic Board under the auspices of the Catholic Diocese of Awka. 
          Boarding students must report on resumption days before 5:00 PM with evidence of full fee settlement. 
          Official WAEC and NECO dates remain subject to external examining council guidelines.
        </p>
      </div>

      {/* 6. ADMIN MODAL: Add / Edit Event Form */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto no-print">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scale-in my-8">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-green text-white rounded-lg">
                  <CalendarPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-heading text-slate-900">
                    {editingEventId ? 'Edit Academic Calendar Event' : 'Add New Academic Calendar Event'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Input official dates for examinations, holidays, resumptions, or ceremonies.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              {/* Event Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., First Continuous Assessment (CA 1) Test Week"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Event Type & Term */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Event Type *
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={e => setFormData({ ...formData, eventType: e.target.value as AcademicEventType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="Exam">Examination / Test Series</option>
                    <option value="Holiday">Holiday / Vacation Recess</option>
                    <option value="Resumption">Resumption Date</option>
                    <option value="Religious">Solemn Mass / Religious Feast</option>
                    <option value="Sports">Sports & Athletic Meet</option>
                    <option value="Meeting">Meeting / Induction Ceremony</option>
                    <option value="Deadline">Academic Deadline</option>
                    <option value="Other">Other School Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Academic Term *
                  </label>
                  <select
                    value={formData.term}
                    onChange={e => setFormData({ ...formData, term: e.target.value as AcademicTermType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="1st Term">1st Term</option>
                    <option value="2nd Term">2nd Term</option>
                    <option value="3rd Term">3rd Term</option>
                    <option value="Annual">Annual / General Session</option>
                  </select>
                </div>
              </div>

              {/* Start Date & End Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    End Date (Optional for single day)
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    min={formData.startDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Session & Target Audience */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Academic Session *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2026/2027"
                    value={formData.academicSession}
                    onChange={e => setFormData({ ...formData, academicSession: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Target Audience
                  </label>
                  <select
                    value={formData.targetAudience}
                    onChange={e => setFormData({ ...formData, targetAudience: e.target.value as EventAudienceType })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="All Students">All Students</option>
                    <option value="Boarding Students">Boarding Students Only</option>
                    <option value="Day Students">Day Students Only</option>
                    <option value="SS Only">Senior Secondary (SS Only)</option>
                    <option value="JSS Only">Junior Secondary (JSS Only)</option>
                    <option value="Parents & Guardians">Parents & Guardians</option>
                    <option value="Staff">Staff Members Only</option>
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Location / Venue
                </label>
                <input
                  type="text"
                  placeholder="e.g. St. Paul Academy Chapel, Central Exam Halls, Sports Complex"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Description & Guidelines */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description & Student Guidelines
                </label>
                <textarea
                  rows={3}
                  placeholder="Instructions for students, fee clearance notices, uniform standards, exam requirements..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans focus:ring-1 focus:ring-brand-green focus:bg-white focus:outline-hidden"
                />
              </div>

              {/* Highlight Checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isHighlight}
                    onChange={e => setFormData({ ...formData, isHighlight: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-brand-green focus:ring-brand-green cursor-pointer"
                  />
                  <span>Mark as Key Milestone (featured with highlight banner on calendar)</span>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-lg text-xs font-bold uppercase tracking-wider transition cursor-pointer shadow-xs"
                >
                  {editingEventId ? 'Save Changes' : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-3">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-5 h-5" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="font-bold text-base font-heading text-slate-900">Delete Calendar Event?</h4>
              <p className="text-xs text-slate-500">
                Are you sure you want to permanently remove this event from the academic calendar?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDelete(confirmDeleteId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs"
              >
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
