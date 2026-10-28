/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  NewsItem, SchoolProject, GalleryItem, VideoItem, DocumentItem, 
  StudentResult, ContactMessage, PaymentRecord, SchoolMilestoneStats, 
  DEFAULT_MILESTONE_STATS, StaffMember, SchoolSubject, SchoolSocialHandles, 
  DEFAULT_SOCIAL_HANDLES, HeroSlide, DailyAttendanceRecord, AcademicCalendarEvent,
  DEFAULT_ABOUT_US_IMAGE, DEFAULT_ABOUT_US_BADGE, DEFAULT_HEADER_LOGO
} from './types';
import { INITIAL_NEWS, INITIAL_PROJECTS, INITIAL_GALLERY, INITIAL_VIDEOS, INITIAL_DOCUMENTS, INITIAL_RESULTS, INITIAL_MESSAGES, INITIAL_PAYMENTS, INITIAL_STAFF, INITIAL_SUBJECTS, DEFAULT_HERO_SLIDES, INITIAL_ATTENDANCE_RECORDS, INITIAL_CALENDAR_EVENTS } from './defaultData';
import { isSupabaseConfigured, getSupabaseClient, mapFromDb, mapToDb } from './supabasePortal';
import { buildCumulativeResultFromTerms, syncAllCumulativeResults } from './gradeUtils';

export function useSchoolStore() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [projects, setProjects] = useState<SchoolProject[]>([]);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [results, setResults] = useState<StudentResult[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<DailyAttendanceRecord[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<AcademicCalendarEvent[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [subjects, setSubjects] = useState<SchoolSubject[]>([]);
  const [socialHandles, setSocialHandles] = useState<SchoolSocialHandles>(DEFAULT_SOCIAL_HANDLES);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>(DEFAULT_HERO_SLIDES);
  const [milestoneStats, setMilestoneStats] = useState<SchoolMilestoneStats>(DEFAULT_MILESTONE_STATS);
  const [aboutUsImage, setAboutUsImage] = useState<string>(DEFAULT_ABOUT_US_IMAGE);
  const [aboutUsBadge, setAboutUsBadge] = useState<string>(DEFAULT_ABOUT_US_BADGE);
  const [headerLogo, setHeaderLogo] = useState<string>(DEFAULT_HEADER_LOGO);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [supabaseStatus, setSupabaseStatus] = useState<'idle' | 'connected' | 'error'>('idle');

  // Load and sync from Supabase or localStorage
  useEffect(() => {
    async function loadData() {
      // 1. Initial immediate render from localStorage (fast client-side caching)
      try {
        const storedNews = localStorage.getItem('hgass_news');
        const storedProjects = localStorage.getItem('hgass_projects');
        const storedGallery = localStorage.getItem('hgass_gallery');
        const storedVideos = localStorage.getItem('hgass_videos');
        const storedDocuments = localStorage.getItem('hgass_documents');
        const storedResults = localStorage.getItem('hgass_results');
        const storedMessages = localStorage.getItem('hgass_messages');
        const storedPayments = localStorage.getItem('hgass_payments');
        const storedAuth = localStorage.getItem('hgass_admin_auth');

        if (storedNews) setNews(JSON.parse(storedNews));
        else {
          setNews(INITIAL_NEWS);
          localStorage.setItem('hgass_news', JSON.stringify(INITIAL_NEWS));
        }

        if (storedProjects) setProjects(JSON.parse(storedProjects));
        else {
          setProjects(INITIAL_PROJECTS);
          localStorage.setItem('hgass_projects', JSON.stringify(INITIAL_PROJECTS));
        }

        if (storedGallery) setGallery(JSON.parse(storedGallery));
        else {
          setGallery(INITIAL_GALLERY);
          localStorage.setItem('hgass_gallery', JSON.stringify(INITIAL_GALLERY));
        }

        if (storedVideos) setVideos(JSON.parse(storedVideos));
        else {
          setVideos(INITIAL_VIDEOS);
          localStorage.setItem('hgass_videos', JSON.stringify(INITIAL_VIDEOS));
        }

        if (storedDocuments) setDocuments(JSON.parse(storedDocuments));
        else {
          setDocuments(INITIAL_DOCUMENTS);
          localStorage.setItem('hgass_documents', JSON.stringify(INITIAL_DOCUMENTS));
        }

        if (storedResults) {
          try {
            const parsedResults: StudentResult[] = JSON.parse(storedResults);
            const existingIds = new Set(parsedResults.map((r) => r.id));
            const missingDefaults = INITIAL_RESULTS.filter((r) => !existingIds.has(r.id));
            const combinedResults = [...parsedResults, ...missingDefaults];

            const normalizedResults = combinedResults.map((res) => ({
              ...res,
              subjectScores: (res.subjectScores || []).map((sub) => {
                const ca1 = sub.ca1Score !== undefined ? sub.ca1Score : Math.min(20, Math.round((sub.testScore || 0) * 20 / 30));
                const ca2 = sub.ca2Score !== undefined ? sub.ca2Score : Math.min(20, Math.max(0, (sub.testScore || 0) - ca1));
                const exam = Math.min(60, sub.examScore || 0);
                const total = sub.totalScore !== undefined ? sub.totalScore : (ca1 + ca2 + exam);
                return {
                  ...sub,
                  ca1Score: ca1,
                  ca2Score: ca2,
                  testScore: ca1 + ca2,
                  examScore: exam,
                  totalScore: total,
                };
              })
            }));
            const syncedResults = syncAllCumulativeResults(normalizedResults);
            setResults(syncedResults);
            localStorage.setItem('hgass_results', JSON.stringify(syncedResults));
          } catch {
            const syncedInitial = syncAllCumulativeResults(INITIAL_RESULTS);
            setResults(syncedInitial);
            localStorage.setItem('hgass_results', JSON.stringify(syncedInitial));
          }
        } else {
          const syncedInitial = syncAllCumulativeResults(INITIAL_RESULTS);
          setResults(syncedInitial);
          localStorage.setItem('hgass_results', JSON.stringify(syncedInitial));
        }

        const storedAttendance = localStorage.getItem('hgass_attendance');
        if (storedAttendance) {
          try {
            setAttendanceRecords(JSON.parse(storedAttendance));
          } catch {
            setAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
          }
        } else {
          setAttendanceRecords(INITIAL_ATTENDANCE_RECORDS);
          localStorage.setItem('hgass_attendance', JSON.stringify(INITIAL_ATTENDANCE_RECORDS));
        }

        if (storedMessages) setMessages(JSON.parse(storedMessages));
        else {
          setMessages(INITIAL_MESSAGES);
          localStorage.setItem('hgass_messages', JSON.stringify(INITIAL_MESSAGES));
        }

        if (storedPayments) {
          try {
            const parsedPayments: PaymentRecord[] = JSON.parse(storedPayments);
            const cleanedPayments = parsedPayments.map(p => {
              if (p.purpose === 'Boarding & Hostel Fees' || p.amount === 145000 || p.amount === 165000) {
                return {
                  ...p,
                  purpose: 'School Fees / Tuition',
                  amount: 35000,
                  remarks: (p.remarks || '').replace(/boarding|hostel/gi, 'Tuition') || 'Tuition Fee'
                };
              }
              return p;
            });
            setPayments(cleanedPayments);
            localStorage.setItem('hgass_payments', JSON.stringify(cleanedPayments));
          } catch {
            setPayments(INITIAL_PAYMENTS);
            localStorage.setItem('hgass_payments', JSON.stringify(INITIAL_PAYMENTS));
          }
        } else {
          setPayments(INITIAL_PAYMENTS);
          localStorage.setItem('hgass_payments', JSON.stringify(INITIAL_PAYMENTS));
        }

        const storedStaff = localStorage.getItem('hgass_staff');
        if (storedStaff) {
          try {
            const parsedStaff: StaffMember[] = JSON.parse(storedStaff);
            const migratedStaff = parsedStaff.map(s => {
              if (s.id === 'staff-1' || s.name.includes('Bartholomew') || s.role === 'Manager') {
                return {
                  ...s,
                  name: 'Engr. ThankGod Ndibe B.Engr., M.Engr.',
                  role: 'Manager',
                  image: 'https://i.ibb.co/pj9SBTbc/cccg.jpg',
                  email: 'holyghostacademy@gmail.com',
                  phone: '+234 (0) 905 414 5339',
                  desc: 'Visionary manager and educational administrator driving academic excellence, moral grounding, and global STEM learning standards at Holy Ghost Academy.'
                };
              }
              return s;
            });
            setStaff(migratedStaff);
            localStorage.setItem('hgass_staff', JSON.stringify(migratedStaff));
          } catch {
            setStaff(INITIAL_STAFF);
          }
        } else {
          setStaff(INITIAL_STAFF);
          localStorage.setItem('hgass_staff', JSON.stringify(INITIAL_STAFF));
        }

        const storedMilestones = localStorage.getItem('hgass_milestone_stats');
        if (storedMilestones) {
          try {
            setMilestoneStats({ ...DEFAULT_MILESTONE_STATS, ...JSON.parse(storedMilestones) });
          } catch {
            setMilestoneStats(DEFAULT_MILESTONE_STATS);
          }
        } else {
          setMilestoneStats(DEFAULT_MILESTONE_STATS);
          localStorage.setItem('hgass_milestone_stats', JSON.stringify(DEFAULT_MILESTONE_STATS));
        }

        const storedSubjects = localStorage.getItem('hgass_subjects');
        if (storedSubjects) {
          try {
            setSubjects(JSON.parse(storedSubjects));
          } catch {
            setSubjects(INITIAL_SUBJECTS);
            localStorage.setItem('hgass_subjects', JSON.stringify(INITIAL_SUBJECTS));
          }
        } else {
          setSubjects(INITIAL_SUBJECTS);
          localStorage.setItem('hgass_subjects', JSON.stringify(INITIAL_SUBJECTS));
        }

        const storedSocial = localStorage.getItem('hgass_social_handles');
        if (storedSocial) {
          try {
            setSocialHandles({ ...DEFAULT_SOCIAL_HANDLES, ...JSON.parse(storedSocial) });
          } catch {
            setSocialHandles(DEFAULT_SOCIAL_HANDLES);
            localStorage.setItem('hgass_social_handles', JSON.stringify(DEFAULT_SOCIAL_HANDLES));
          }
        } else {
          setSocialHandles(DEFAULT_SOCIAL_HANDLES);
          localStorage.setItem('hgass_social_handles', JSON.stringify(DEFAULT_SOCIAL_HANDLES));
        }

        const storedSlides = localStorage.getItem('hgass_hero_slides');
        if (storedSlides) {
          try {
            setHeroSlides(JSON.parse(storedSlides));
          } catch {
            setHeroSlides(DEFAULT_HERO_SLIDES);
            localStorage.setItem('hgass_hero_slides', JSON.stringify(DEFAULT_HERO_SLIDES));
          }
        } else {
          setHeroSlides(DEFAULT_HERO_SLIDES);
          localStorage.setItem('hgass_hero_slides', JSON.stringify(DEFAULT_HERO_SLIDES));
        }

        const storedCalendar = localStorage.getItem('hgass_calendar_events');
        if (storedCalendar) {
          try {
            const parsedEvents: AcademicCalendarEvent[] = JSON.parse(storedCalendar);
            const cleanedEvents = parsedEvents.map(ev => {
              if ((ev.targetAudience as any) === 'Boarding Students') {
                return {
                  ...ev,
                  targetAudience: 'All Students' as const,
                  title: ev.title.replace(/Boarding Students/gi, 'All Students'),
                  description: ev.description.replace(/Boarding students/gi, 'All students')
                };
              }
              return ev;
            });
            setCalendarEvents(cleanedEvents);
            localStorage.setItem('hgass_calendar_events', JSON.stringify(cleanedEvents));
          } catch {
            setCalendarEvents(INITIAL_CALENDAR_EVENTS);
            localStorage.setItem('hgass_calendar_events', JSON.stringify(INITIAL_CALENDAR_EVENTS));
          }
        } else {
          setCalendarEvents(INITIAL_CALENDAR_EVENTS);
          localStorage.setItem('hgass_calendar_events', JSON.stringify(INITIAL_CALENDAR_EVENTS));
        }

        const storedAboutImage = localStorage.getItem('hgass_about_image');
        if (storedAboutImage) {
          setAboutUsImage(storedAboutImage);
        } else {
          setAboutUsImage(DEFAULT_ABOUT_US_IMAGE);
          localStorage.setItem('hgass_about_image', DEFAULT_ABOUT_US_IMAGE);
        }

        const storedAboutBadge = localStorage.getItem('hgass_about_badge');
        if (storedAboutBadge) {
          setAboutUsBadge(storedAboutBadge);
        } else {
          setAboutUsBadge(DEFAULT_ABOUT_US_BADGE);
          localStorage.setItem('hgass_about_badge', DEFAULT_ABOUT_US_BADGE);
        }

        const storedHeaderLogo = localStorage.getItem('hgass_header_logo');
        if (storedHeaderLogo) {
          setHeaderLogo(storedHeaderLogo);
        } else {
          setHeaderLogo(DEFAULT_HEADER_LOGO);
          localStorage.setItem('hgass_header_logo', DEFAULT_HEADER_LOGO);
        }

        if (storedAuth === 'true') {
          setIsAdminLoggedIn(true);
        }
      } catch (e) {
        console.error('Failed to parse cached local storage data:', e);
      }

      // 2. Fetch fresh remote streams from Supabase if configured
      if (isSupabaseConfigured()) {
        const supabase = getSupabaseClient();
        if (supabase) {
          try {
            setSupabaseStatus('connected');
            const [
              { data: dbNews, error: errNews },
              { data: dbProjects, error: errProj },
              { data: dbGallery, error: errGal },
              { data: dbVideos, error: errVid },
              { data: dbDocs, error: errDocs },
              { data: dbResults, error: errResults },
              { data: dbMsg, error: errMsg },
              { data: dbStaff, error: errStaff },
              { data: dbPayments, error: errPayments },
              { data: dbSubjects, error: errSubjects },
              { data: dbSlides, error: errSlides }
            ] = await Promise.all([
              supabase.from('news').select('*').order('date', { ascending: false }),
              supabase.from('projects').select('*').order('start_date', { ascending: false }),
              supabase.from('gallery').select('*').order('upload_date', { ascending: false }),
              supabase.from('videos').select('*').order('upload_date', { ascending: false }),
              supabase.from('documents').select('*').order('upload_date', { ascending: false }),
              supabase.from('student_results').select('*'),
              supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
              supabase.from('staff').select('*').order('display_order', { ascending: true }),
              supabase.from('payments').select('*').order('payment_date', { ascending: false }),
              supabase.from('subjects').select('*').order('display_order', { ascending: true }),
              supabase.from('hero_slides').select('*').order('slide_order', { ascending: true })
            ]);

            if (errNews || errProj || errGal || errVid || errDocs || errResults || errMsg || errStaff || errPayments || errSubjects || errSlides) {
              console.warn('Some Supabase select streams errored out. Check table access rules.');
              setSupabaseStatus('error');
            }

            if (!errNews && dbNews && dbNews.length > 0) {
              const mapped = dbNews.map(r => mapFromDb('news', r));
              setNews(mapped);
              localStorage.setItem('hgass_news', JSON.stringify(mapped));
            }
            if (!errProj && dbProjects && dbProjects.length > 0) {
              const mapped = dbProjects.map(r => mapFromDb('projects', r));
              setProjects(mapped);
              localStorage.setItem('hgass_projects', JSON.stringify(mapped));
            }
            if (!errGal && dbGallery && dbGallery.length > 0) {
              const mapped = dbGallery.map(r => mapFromDb('gallery', r));
              setGallery(mapped);
              localStorage.setItem('hgass_gallery', JSON.stringify(mapped));
            }
            if (!errVid && dbVideos && dbVideos.length > 0) {
              const mapped = dbVideos.map(r => mapFromDb('videos', r));
              setVideos(mapped);
              localStorage.setItem('hgass_videos', JSON.stringify(mapped));
            }
            if (!errDocs && dbDocs && dbDocs.length > 0) {
              const mapped = dbDocs.map(r => mapFromDb('documents', r));
              setDocuments(mapped);
              localStorage.setItem('hgass_documents', JSON.stringify(mapped));
            }
            if (!errResults && dbResults && dbResults.length > 0) {
              const mapped = dbResults.map(r => mapFromDb('student_results', r));
              const synced = syncAllCumulativeResults(mapped);
              setResults(synced);
              localStorage.setItem('hgass_results', JSON.stringify(synced));
            }
            if (!errMsg && dbMsg && dbMsg.length > 0) {
              const mapped = dbMsg.map(r => mapFromDb('contact_messages', r));
              setMessages(mapped);
              localStorage.setItem('hgass_messages', JSON.stringify(mapped));
            }
            if (!errStaff && dbStaff && dbStaff.length > 0) {
              const mapped = dbStaff.map(r => mapFromDb('staff', r));
              setStaff(mapped);
              localStorage.setItem('hgass_staff', JSON.stringify(mapped));
            }
            if (!errPayments && dbPayments && dbPayments.length > 0) {
              const mapped = dbPayments.map(r => mapFromDb('payments', r));
              setPayments(mapped);
              localStorage.setItem('hgass_payments', JSON.stringify(mapped));
            }
            if (!errSubjects && dbSubjects && dbSubjects.length > 0) {
              const mapped = dbSubjects.map(r => mapFromDb('subjects', r));
              setSubjects(mapped);
              localStorage.setItem('hgass_subjects', JSON.stringify(mapped));
            }
            if (!errSlides && dbSlides && dbSlides.length > 0) {
              const mapped = dbSlides.map(r => mapFromDb('hero_slides', r));
              setHeroSlides(mapped);
              localStorage.setItem('hgass_hero_slides', JSON.stringify(mapped));
            }
          } catch (e) {
            console.error('Supabase async fetching connection crash:', e);
            setSupabaseStatus('error');
          }
        }
      } else {
        setSupabaseStatus('idle');
      }

      setIsLoading(false);
    }

    loadData();
  }, []);

  // Helper to strip extended columns if remote Supabase table only has legacy core columns
  const stripResultExtendedColumns = (row: any) => {
    return {
      id: row.id,
      student_id: row.student_id,
      student_name: row.student_name,
      class_level: row.class_level,
      academic_session: row.academic_session,
      term: row.term || '1st Term',
      gender: row.gender || 'Male',
      roll_number: row.roll_number || '01',
      position: row.position || '',
      attendance: row.attendance || '',
      principal_remarks: row.principal_remarks || '',
      teacher_remarks: row.teacher_remarks || '',
      subject_scores: row.subject_scores || [],
      access_password: row.access_password || null
    };
  };

  // Sync state writes in the background to Supabase
  const syncWrite = async (table: string, action: 'insert' | 'update' | 'delete', data: any) => {
    if (!isSupabaseConfigured()) return;
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      if (action === 'insert' || action === 'update') {
        const dbData = mapToDb(table, data);
        let { error } = await supabase.from(table).upsert([dbData]);
        if (error && table === 'student_results' && (error.code === 'PGRST204' || error.message?.includes('column'))) {
          console.warn('Supabase student_results table missing extended columns; retrying with core columns');
          const fallbackData = stripResultExtendedColumns(dbData);
          const retryRes = await supabase.from(table).upsert([fallbackData]);
          error = retryRes.error;
        }
        if (error) {
          console.error(`Supabase upsert failure on ${table}:`, error);
          setSupabaseStatus('error');
        } else {
          setSupabaseStatus('connected');
        }
      } else if (action === 'delete') {
        const { error } = await supabase.from(table).delete().eq('id', data);
        if (error) {
          console.error(`Supabase delete failure on ${table}:`, error);
          setSupabaseStatus('error');
        } else {
          setSupabaseStatus('connected');
        }
      }
    } catch (e) {
      console.error(`Supabase transactional sync exception on ${table}:`, e);
      setSupabaseStatus('error');
    }
  };

  // Push all existing local storage elements to blank Supabase schema tables
  const pushAllLocalToSupabase = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase credentials are not set.' };
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Could not connect to Supabase.' };

    try {
      const pushResults = async () => {
        if (results.length === 0) return { error: null };
        const rows = results.map(x => mapToDb('student_results', x));
        let res = await supabase.from('student_results').upsert(rows);
        if (res.error && (res.error.code === 'PGRST204' || res.error.message?.includes('column'))) {
          console.warn('Supabase student_results missing extended columns; retrying with core columns');
          const coreRows = rows.map(r => stripResultExtendedColumns(r));
          res = await supabase.from('student_results').upsert(coreRows);
        }
        return res;
      };

      // Parallel batch uploads
      const uploads = [
        news.length > 0 ? supabase.from('news').upsert(news.map(x => mapToDb('news', x))) : Promise.resolve(),
        projects.length > 0 ? supabase.from('projects').upsert(projects.map(x => mapToDb('projects', x))) : Promise.resolve(),
        gallery.length > 0 ? supabase.from('gallery').upsert(gallery.map(x => mapToDb('gallery', x))) : Promise.resolve(),
        videos.length > 0 ? supabase.from('videos').upsert(videos.map(x => mapToDb('videos', x))) : Promise.resolve(),
        documents.length > 0 ? supabase.from('documents').upsert(documents.map(x => mapToDb('documents', x))) : Promise.resolve(),
        pushResults(),
        messages.length > 0 ? supabase.from('contact_messages').upsert(messages.map(x => mapToDb('contact_messages', x))) : Promise.resolve(),
        staff.length > 0 ? supabase.from('staff').upsert(staff.map((x, idx) => mapToDb('staff', { ...x, display_order: idx + 1 }))) : Promise.resolve(),
        payments.length > 0 ? supabase.from('payments').upsert(payments.map(x => mapToDb('payments', x))) : Promise.resolve(),
        subjects.length > 0 ? supabase.from('subjects').upsert(subjects.map((x, idx) => mapToDb('subjects', { ...x, display_order: idx + 1 }))) : Promise.resolve(),
        heroSlides.length > 0 ? supabase.from('hero_slides').upsert(heroSlides.map((x, idx) => mapToDb('hero_slides', { ...x, slide_order: idx + 1 }))) : Promise.resolve()
      ];

      const responses = await Promise.all(uploads);
      const errors = responses.filter((r: any) => r && r.error);
      if (errors.length > 0) {
        const errorMsg = errors.map((e: any) => e.error.message).join(' | ');
        return { success: false, error: errorMsg };
      }

      setSupabaseStatus('connected');
      return { success: true };
    } catch (err: any) {
      console.error('Push sync failure:', err);
      return { success: false, error: err?.message || 'Network transport failure.' };
    }
  };

  // Pull fresh streams and replace everything
  const pullAllFromSupabase = async (): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured()) return { success: false, error: 'Supabase credentials are not set.' };
    const supabase = getSupabaseClient();
    if (!supabase) return { success: false, error: 'Could not connect to Supabase.' };

    try {
      const [
        { data: dbNews, error: errNews },
        { data: dbProjects, error: errProj },
        { data: dbGallery, error: errGal },
        { data: dbVideos, error: errVid },
        { data: dbDocs, error: errDocs },
        { data: dbResults, error: errResults },
        { data: dbMsg, error: errMsg },
        { data: dbStaff, error: errStaff },
        { data: dbPayments, error: errPayments },
        { data: dbSubjects, error: errSubjects },
        { data: dbSlides, error: errSlides }
      ] = await Promise.all([
        supabase.from('news').select('*').order('date', { ascending: false }),
        supabase.from('projects').select('*').order('start_date', { ascending: false }),
        supabase.from('gallery').select('*').order('upload_date', { ascending: false }),
        supabase.from('videos').select('*').order('upload_date', { ascending: false }),
        supabase.from('documents').select('*').order('upload_date', { ascending: false }),
        supabase.from('student_results').select('*'),
        supabase.from('contact_messages').select('*').order('created_at', { ascending: false }),
        supabase.from('staff').select('*').order('display_order', { ascending: true }),
        supabase.from('payments').select('*').order('payment_date', { ascending: false }),
        supabase.from('subjects').select('*').order('display_order', { ascending: true }),
        supabase.from('hero_slides').select('*').order('slide_order', { ascending: true })
      ]);

      if (errNews || errProj || errGal || errVid || errDocs || errResults || errMsg || errStaff || errPayments || errSubjects || errSlides) {
        throw new Error('Some tables failed to sync. Make sure tables match the SQL schema and RLS allows select.');
      }

      if (dbNews) {
        const mapped = dbNews.map(r => mapFromDb('news', r));
        setNews(mapped);
        localStorage.setItem('hgass_news', JSON.stringify(mapped));
      }
      if (dbProjects) {
        const mapped = dbProjects.map(r => mapFromDb('projects', r));
        setProjects(mapped);
        localStorage.setItem('hgass_projects', JSON.stringify(mapped));
      }
      if (dbGallery) {
        const mapped = dbGallery.map(r => mapFromDb('gallery', r));
        setGallery(mapped);
        localStorage.setItem('hgass_gallery', JSON.stringify(mapped));
      }
      if (dbVideos) {
        const mapped = dbVideos.map(r => mapFromDb('videos', r));
        setVideos(mapped);
        localStorage.setItem('hgass_videos', JSON.stringify(mapped));
      }
      if (dbDocs) {
        const mapped = dbDocs.map(r => mapFromDb('documents', r));
        setDocuments(mapped);
        localStorage.setItem('hgass_documents', JSON.stringify(mapped));
      }
      if (dbResults) {
        const mapped = dbResults.map(r => mapFromDb('student_results', r));
        setResults(mapped);
        localStorage.setItem('hgass_results', JSON.stringify(mapped));
      }
      if (dbMsg) {
        const mapped = dbMsg.map(r => mapFromDb('contact_messages', r));
        setMessages(mapped);
        localStorage.setItem('hgass_messages', JSON.stringify(mapped));
      }
      if (dbStaff) {
        const mapped = dbStaff.map(r => mapFromDb('staff', r));
        setStaff(mapped);
        localStorage.setItem('hgass_staff', JSON.stringify(mapped));
      }
      if (dbPayments) {
        const mapped = dbPayments.map(r => mapFromDb('payments', r));
        setPayments(mapped);
        localStorage.setItem('hgass_payments', JSON.stringify(mapped));
      }
      if (dbSubjects) {
        const mapped = dbSubjects.map(r => mapFromDb('subjects', r));
        setSubjects(mapped);
        localStorage.setItem('hgass_subjects', JSON.stringify(mapped));
      }
      if (dbSlides) {
        const mapped = dbSlides.map(r => mapFromDb('hero_slides', r));
        setHeroSlides(mapped);
        localStorage.setItem('hgass_hero_slides', JSON.stringify(mapped));
      }

      setSupabaseStatus('connected');
      return { success: true };
    } catch (err: any) {
      console.error('Pull sync failed:', err);
      return { success: false, error: err?.message || 'Could not fetch tables' };
    }
  };

  // --- Auth Actions ---
  const loginAdmin = (password: string): boolean => {
    if (password === 'HGASS@25') {
      setIsAdminLoggedIn(true);
      localStorage.setItem('hgass_admin_auth', 'true');
      return true;
    }
    return false;
  };

  const logoutAdmin = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('hgass_admin_auth');
  };

  // --- News Actions ---
  const addNews = (item: Omit<NewsItem, 'id' | 'date'>) => {
    const newItem: NewsItem = {
      ...item,
      id: `news-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
    };
    const updated = [newItem, ...news];
    setNews(updated);
    localStorage.setItem('hgass_news', JSON.stringify(updated));
    syncWrite('news', 'insert', newItem);
  };

  const editNews = (id: string, updatedFields: Partial<NewsItem>) => {
    const updated = news.map(item => item.id === id ? { ...item, ...updatedFields } : item);
    setNews(updated);
    localStorage.setItem('hgass_news', JSON.stringify(updated));
    const target = updated.find(item => item.id === id);
    if (target) syncWrite('news', 'update', target);
  };

  const deleteNews = (id: string) => {
    const updated = news.filter(item => item.id !== id);
    setNews(updated);
    localStorage.setItem('hgass_news', JSON.stringify(updated));
    syncWrite('news', 'delete', id);
  };

  // --- Project Actions ---
  const addProject = (item: Omit<SchoolProject, 'id'>) => {
    const newItem: SchoolProject = {
      ...item,
      id: `proj-${Date.now()}`,
    };
    const updated = [...projects, newItem];
    setProjects(updated);
    localStorage.setItem('hgass_projects', JSON.stringify(updated));
    syncWrite('projects', 'insert', newItem);
  };

  const editProject = (id: string, updatedFields: Partial<SchoolProject>) => {
    const updated = projects.map(item => item.id === id ? { ...item, ...updatedFields } : item);
    setProjects(updated);
    localStorage.setItem('hgass_projects', JSON.stringify(updated));
    const target = updated.find(item => item.id === id);
    if (target) syncWrite('projects', 'update', target);
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter(item => item.id !== id);
    setProjects(updated);
    localStorage.setItem('hgass_projects', JSON.stringify(updated));
    syncWrite('projects', 'delete', id);
  };

  // --- Gallery Actions ---
  const addGalleryItem = (item: Omit<GalleryItem, 'id' | 'uploadDate'>) => {
    const newItem: GalleryItem = {
      ...item,
      id: `gal-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    const updated = [newItem, ...gallery];
    setGallery(updated);
    localStorage.setItem('hgass_gallery', JSON.stringify(updated));
    syncWrite('gallery', 'insert', newItem);
  };

  const editGalleryItem = (id: string, updatedFields: Partial<GalleryItem>) => {
    const updated = gallery.map(item => item.id === id ? { ...item, ...updatedFields } : item);
    setGallery(updated);
    localStorage.setItem('hgass_gallery', JSON.stringify(updated));
    const target = updated.find(item => item.id === id);
    if (target) syncWrite('gallery', 'update', target);
  };

  const deleteGalleryItem = (id: string) => {
    const updated = gallery.filter(item => item.id !== id);
    setGallery(updated);
    localStorage.setItem('hgass_gallery', JSON.stringify(updated));
    syncWrite('gallery', 'delete', id);
  };

  // --- Video Actions ---
  const addVideo = (item: Omit<VideoItem, 'id' | 'uploadDate'>) => {
    const newItem: VideoItem = {
      ...item,
      id: `vid-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    const updated = [newItem, ...videos];
    setVideos(updated);
    localStorage.setItem('hgass_videos', JSON.stringify(updated));
    syncWrite('videos', 'insert', newItem);
  };

  const editVideo = (id: string, updatedFields: Partial<VideoItem>) => {
    const updated = videos.map(item => item.id === id ? { ...item, ...updatedFields } : item);
    setVideos(updated);
    localStorage.setItem('hgass_videos', JSON.stringify(updated));
    const target = updated.find(item => item.id === id);
    if (target) syncWrite('videos', 'update', target);
  };

  const deleteVideo = (id: string) => {
    const updated = videos.filter(item => item.id !== id);
    setVideos(updated);
    localStorage.setItem('hgass_videos', JSON.stringify(updated));
    syncWrite('videos', 'delete', id);
  };

  // --- Document Actions ---
  const addDocument = (item: Omit<DocumentItem, 'id' | 'uploadDate'>) => {
    const newItem: DocumentItem = {
      ...item,
      id: `doc-${Date.now()}`,
      uploadDate: new Date().toISOString().split('T')[0],
    };
    const updated = [newItem, ...documents];
    setDocuments(updated);
    localStorage.setItem('hgass_documents', JSON.stringify(updated));
    syncWrite('documents', 'insert', newItem);
  };

  const deleteDocument = (id: string) => {
    const updated = documents.filter(item => item.id !== id);
    setDocuments(updated);
    localStorage.setItem('hgass_documents', JSON.stringify(updated));
    syncWrite('documents', 'delete', id);
  };

  // --- Result Actions ---
  const addResult = (item: StudentResult) => {
    const cleanStudentId = (item.studentId || '').trim().toUpperCase();
    const cleanTerm = (item.term || '').trim();
    const cleanSession = (item.academicSession || '').trim();

    const baseUpdated = [
      ...results.filter(
        r =>
          r.id !== item.id &&
          !(
            (r.studentId || '').trim().toUpperCase() === cleanStudentId &&
            (r.term || '').trim() === cleanTerm &&
            (r.academicSession || '').trim() === cleanSession
          )
      ),
      item
    ];

    let finalResults = baseUpdated;

    // Automatically link with the Cumulative Results Section:
    // When a termly result is inputted, compile & update the student's Annual Cumulative record!
    if (!item.isCumulative && item.term !== 'Annual Cumulative' && !item.term.toLowerCase().includes('cumulative')) {
      const compiledCumulative = buildCumulativeResultFromTerms(item.studentId, item.academicSession, baseUpdated);
      if (compiledCumulative) {
        const cumIndex = baseUpdated.findIndex(
          r => r.studentId.trim().toUpperCase() === item.studentId.trim().toUpperCase() &&
               r.academicSession.trim() === item.academicSession.trim() &&
               (r.isCumulative || r.term === 'Annual Cumulative')
        );
        if (cumIndex >= 0) {
          finalResults = baseUpdated.map((r, idx) => idx === cumIndex ? compiledCumulative : r);
        } else {
          finalResults = [...baseUpdated, compiledCumulative];
        }
        syncWrite('student_results', 'insert', compiledCumulative);
      }
    }

    setResults(finalResults);
    localStorage.setItem('hgass_results', JSON.stringify(finalResults));
    syncWrite('student_results', 'insert', item);
  };

  const editResult = (id: string, updatedFields: Partial<StudentResult>) => {
    const updated = results.map(item => item.id === id ? { ...item, ...updatedFields } as StudentResult : item);
    const target = updated.find(item => item.id === id);

    let finalResults = updated;
    if (target && !target.isCumulative && target.term !== 'Annual Cumulative' && !target.term.toLowerCase().includes('cumulative')) {
      const compiledCumulative = buildCumulativeResultFromTerms(target.studentId, target.academicSession, updated);
      if (compiledCumulative) {
        const cumIndex = updated.findIndex(
          r => r.studentId.trim().toUpperCase() === target.studentId.trim().toUpperCase() &&
               r.academicSession.trim() === target.academicSession.trim() &&
               (r.isCumulative || r.term === 'Annual Cumulative')
        );
        if (cumIndex >= 0) {
          finalResults = updated.map((r, idx) => idx === cumIndex ? compiledCumulative : r);
        } else {
          finalResults = [...updated, compiledCumulative];
        }
        syncWrite('student_results', 'update', compiledCumulative);
      }
    }

    setResults(finalResults);
    localStorage.setItem('hgass_results', JSON.stringify(finalResults));
    if (target) syncWrite('student_results', 'update', target);
  };

  const deleteResult = (id: string) => {
    const updated = results.filter(item => item.id !== id);
    setResults(updated);
    localStorage.setItem('hgass_results', JSON.stringify(updated));
    syncWrite('student_results', 'delete', id);
  };

  const syncCumulativeRecords = () => {
    const synced = syncAllCumulativeResults(results);
    setResults(synced);
    localStorage.setItem('hgass_results', JSON.stringify(synced));
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const cumRows = synced.filter(r => r.isCumulative || r.term === 'Annual Cumulative').map(r => mapToDb('student_results', r));
        if (cumRows.length > 0) {
          supabase.from('student_results').upsert(cumRows).then(async ({ error }) => {
            if (error && (error.code === 'PGRST204' || error.message?.includes('column'))) {
              console.warn('Supabase student_results missing extended columns; retrying with core columns');
              const coreRows = cumRows.map(r => stripResultExtendedColumns(r));
              const retryRes = await supabase.from('student_results').upsert(coreRows);
              error = retryRes.error;
            }
            if (error) {
              console.error('Supabase cumulative sync error:', error);
            }
          });
        }
      }
    }
  };

  const importResultsList = (resultsList: StudentResult[]) => {
    const syncedList = syncAllCumulativeResults(resultsList);
    setResults(syncedList);
    localStorage.setItem('hgass_results', JSON.stringify(syncedList));

    // Upload in batch to Supabase
    if (isSupabaseConfigured()) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const dbRows = resultsList.map(item => mapToDb('student_results', item));
        supabase.from('student_results').upsert(dbRows).then(async ({ error }) => {
          if (error && (error.code === 'PGRST204' || error.message?.includes('column'))) {
            console.warn('Bulk result import retry with core columns only');
            const coreRows = dbRows.map(r => stripResultExtendedColumns(r));
            const retryRes = await supabase.from('student_results').upsert(coreRows);
            error = retryRes.error;
          }
          if (error) {
            console.error('Bulk result import failure in Supabase:', error);
            setSupabaseStatus('error');
          } else {
            setSupabaseStatus('connected');
          }
        });
      }
    }
  };

  // --- Contact Messages Actions ---
  const addMessage = (message: Omit<ContactMessage, 'id' | 'date' | 'isRead'>) => {
    const newMsg: ContactMessage = {
      ...message,
      id: `msg-${Date.now()}`,
      date: new Date().toLocaleString('en-US', { hour12: true, month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };
    const updated = [newMsg, ...messages];
    setMessages(updated);
    localStorage.setItem('hgass_messages', JSON.stringify(updated));
    syncWrite('contact_messages', 'insert', newMsg);
  };

  const markMessageRead = (id: string) => {
    const updated = messages.map(msg => msg.id === id ? { ...msg, isRead: true } : msg);
    setMessages(updated);
    localStorage.setItem('hgass_messages', JSON.stringify(updated));
    const target = updated.find(msg => msg.id === id);
    if (target) syncWrite('contact_messages', 'update', target);
  };

  const deleteMessage = (id: string) => {
    const updated = messages.filter(msg => msg.id !== id);
    setMessages(updated);
    localStorage.setItem('hgass_messages', JSON.stringify(updated));
    syncWrite('contact_messages', 'delete', id);
  };

  // --- Payment management functions ---
  const addPayment = (paymentData: Omit<PaymentRecord, 'id' | 'referenceNumber' | 'createdAt' | 'status'> & { status?: PaymentRecord['status']; referenceNumber?: string }) => {
    const dateObj = new Date();
    const formattedTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = dateObj.toISOString().split('T')[0];
    const randomCode = Math.floor(10000 + Math.random() * 90000);
    const refNum = paymentData.referenceNumber || `HGA-PAY-${dateObj.getFullYear()}-${randomCode}`;

    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`,
      referenceNumber: refNum,
      status: paymentData.status || 'Pending Verification',
      createdAt: `${formattedDate} ${formattedTime}`
    };

    const updated = [newPayment, ...payments];
    setPayments(updated);
    localStorage.setItem('hgass_payments', JSON.stringify(updated));
    syncWrite('payments', 'insert', newPayment);
    return newPayment;
  };

  const verifyPayment = (id: string, newStatus: PaymentRecord['status']) => {
    const updated = payments.map(p => p.id === id ? { ...p, status: newStatus } : p);
    setPayments(updated);
    localStorage.setItem('hgass_payments', JSON.stringify(updated));
    const target = updated.find(p => p.id === id);
    if (target) syncWrite('payments', 'update', target);
  };

  const deletePayment = (id: string) => {
    const updated = payments.filter(p => p.id !== id);
    setPayments(updated);
    localStorage.setItem('hgass_payments', JSON.stringify(updated));
    syncWrite('payments', 'delete', id);
  };

  // --- Daily Student Attendance Management functions ---
  const saveAttendanceRecords = (recordsToSave: DailyAttendanceRecord[]) => {
    setAttendanceRecords(prev => {
      const map = new Map<string, DailyAttendanceRecord>();
      prev.forEach(r => map.set(`${r.date}__${r.studentId}`, r));
      recordsToSave.forEach(r => map.set(`${r.date}__${r.studentId}`, r));
      const updated = Array.from(map.values());
      localStorage.setItem('hgass_attendance', JSON.stringify(updated));
      return updated;
    });
  };

  const deleteAttendanceRecord = (id: string) => {
    setAttendanceRecords(prev => {
      const updated = prev.filter(r => r.id !== id);
      localStorage.setItem('hgass_attendance', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAttendanceForDateAndClass = (date: string, classLevel: string) => {
    setAttendanceRecords(prev => {
      const updated = prev.filter(r => !(r.date === date && r.classLevel === classLevel));
      localStorage.setItem('hgass_attendance', JSON.stringify(updated));
      return updated;
    });
  };

  // --- Academic Calendar Actions ---
  const addCalendarEvent = (eventData: Omit<AcademicCalendarEvent, 'id' | 'createdAt'>) => {
    const newEvent: AcademicCalendarEvent = {
      ...eventData,
      id: `cal-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    const updated = [newEvent, ...calendarEvents].sort((a, b) => a.startDate.localeCompare(b.startDate));
    setCalendarEvents(updated);
    try {
      localStorage.setItem('hgass_calendar_events', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save calendar event to localStorage:', e);
    }
  };

  const editCalendarEvent = (id: string, fields: Partial<AcademicCalendarEvent>) => {
    const updated = calendarEvents.map(ev => ev.id === id ? { ...ev, ...fields } : ev).sort((a, b) => a.startDate.localeCompare(b.startDate));
    setCalendarEvents(updated);
    try {
      localStorage.setItem('hgass_calendar_events', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update calendar event in localStorage:', e);
    }
  };

  const deleteCalendarEvent = (id: string) => {
    const updated = calendarEvents.filter(ev => ev.id !== id);
    setCalendarEvents(updated);
    try {
      localStorage.setItem('hgass_calendar_events', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete calendar event from localStorage:', e);
    }
  };

  const resetCalendarEvents = () => {
    setCalendarEvents(INITIAL_CALENDAR_EVENTS);
    try {
      localStorage.setItem('hgass_calendar_events', JSON.stringify(INITIAL_CALENDAR_EVENTS));
    } catch (e) {
      console.error('Failed to reset calendar events in localStorage:', e);
    }
  };

  // --- Milestone Statistics Handler ---
  const updateMilestoneStats = (newStats: SchoolMilestoneStats) => {
    setMilestoneStats(newStats);
    try {
      localStorage.setItem('hgass_milestone_stats', JSON.stringify(newStats));
    } catch (e) {
      console.error('Failed to save milestone stats:', e);
    }
  };

  // --- Staff & Administrative Board Actions ---
  const addStaffMember = (item: Omit<StaffMember, 'id'>) => {
    const newMember: StaffMember = {
      ...item,
      id: `staff-${Date.now()}`,
    };
    const updated = [newMember, ...staff];
    setStaff(updated);
    try {
      localStorage.setItem('hgass_staff', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save staff member to localStorage:', e);
    }
    syncWrite('staff', 'insert', newMember);
  };

  const editStaffMember = (id: string, fields: Partial<StaffMember>) => {
    const updated = staff.map(member => member.id === id ? { ...member, ...fields } : member);
    setStaff(updated);
    try {
      localStorage.setItem('hgass_staff', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update staff member in localStorage:', e);
    }
    const target = updated.find(m => m.id === id);
    if (target) syncWrite('staff', 'update', target);
  };

  const deleteStaffMember = (id: string) => {
    const updated = staff.filter(member => member.id !== id);
    setStaff(updated);
    try {
      localStorage.setItem('hgass_staff', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete staff member from localStorage:', e);
    }
    syncWrite('staff', 'delete', id);
  };

  // --- Supabase Disconnect & Connect Handlers ---
  const disconnectSupabase = () => {
    localStorage.removeItem('hgass_supabase_url');
    localStorage.removeItem('hgass_supabase_anon_key');
    setSupabaseStatus('idle');
  };

  const connectSupabase = async (url: string, anonKey: string) => {
    localStorage.setItem('hgass_supabase_url', url.trim());
    localStorage.setItem('hgass_supabase_anon_key', anonKey.trim());
    return await pullAllFromSupabase();
  };

  // --- Subject Actions ---
  const addSubject = (item: Omit<SchoolSubject, 'id'> | SchoolSubject) => {
    const newItem: SchoolSubject = {
      ...item,
      id: 'id' in item && item.id ? item.id : `subj-${Date.now()}`
    };
    const updated = [...subjects, newItem];
    setSubjects(updated);
    try {
      localStorage.setItem('hgass_subjects', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save subject to localStorage:', e);
    }
    syncWrite('subjects', 'insert', newItem);
  };

  const editSubject = (id: string, fields: Partial<SchoolSubject>) => {
    const updated = subjects.map(s => s.id === id ? { ...s, ...fields } : s);
    setSubjects(updated);
    try {
      localStorage.setItem('hgass_subjects', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to update subject in localStorage:', e);
    }
    const target = updated.find(s => s.id === id);
    if (target) syncWrite('subjects', 'update', target);
  };

  const deleteSubject = (id: string) => {
    const updated = subjects.filter(s => s.id !== id);
    setSubjects(updated);
    try {
      localStorage.setItem('hgass_subjects', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete subject from localStorage:', e);
    }
    syncWrite('subjects', 'delete', id);
  };

  const resetSubjects = () => {
    setSubjects(INITIAL_SUBJECTS);
    try {
      localStorage.setItem('hgass_subjects', JSON.stringify(INITIAL_SUBJECTS));
    } catch (e) {
      console.error('Failed to reset subjects in localStorage:', e);
    }
  };

  // --- Social Media Handles Actions ---
  const updateSocialHandles = (handles: Partial<SchoolSocialHandles>) => {
    const updated: SchoolSocialHandles = { ...socialHandles, ...handles };
    setSocialHandles(updated);
    try {
      localStorage.setItem('hgass_social_handles', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save social handles to localStorage:', e);
    }
  };

  // --- Quick Promotion Status Update Action ---
  const updateStudentPromotionStatus = (resultId: string, promotionStatus: string) => {
    editResult(resultId, { promotionStatus });
  };

  // --- Hero Slides Actions ---
  const addHeroSlide = (slideData: Omit<HeroSlide, 'id'>) => {
    const newSlide: HeroSlide = {
      ...slideData,
      id: `slide-${Date.now()}`
    };
    const updated = [...heroSlides, newSlide];
    setHeroSlides(updated);
    try {
      localStorage.setItem('hgass_hero_slides', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save hero slide to localStorage:', e);
    }
    syncWrite('hero_slides', 'insert', newSlide);
  };

  const editHeroSlide = (id: string, slideData: Partial<HeroSlide>) => {
    const updated = heroSlides.map(s => s.id === id ? { ...s, ...slideData } : s);
    setHeroSlides(updated);
    try {
      localStorage.setItem('hgass_hero_slides', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to edit hero slide in localStorage:', e);
    }
    const target = updated.find(s => s.id === id);
    if (target) syncWrite('hero_slides', 'update', target);
  };

  const deleteHeroSlide = (id: string) => {
    const updated = heroSlides.filter(s => s.id !== id);
    setHeroSlides(updated);
    try {
      localStorage.setItem('hgass_hero_slides', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete hero slide from localStorage:', e);
    }
    syncWrite('hero_slides', 'delete', id);
  };

  const resetHeroSlides = () => {
    setHeroSlides(DEFAULT_HERO_SLIDES);
    try {
      localStorage.setItem('hgass_hero_slides', JSON.stringify(DEFAULT_HERO_SLIDES));
    } catch (e) {
      console.error('Failed to reset hero slides in localStorage:', e);
    }
  };

  const reorderHeroSlides = (newOrder: HeroSlide[]) => {
    setHeroSlides(newOrder);
    try {
      localStorage.setItem('hgass_hero_slides', JSON.stringify(newOrder));
    } catch (e) {
      console.error('Failed to reorder hero slides in localStorage:', e);
    }
  };

  // --- About Us Section Actions ---
  const updateAboutUsImage = (newImage: string, newBadge?: string) => {
    setAboutUsImage(newImage);
    try {
      localStorage.setItem('hgass_about_image', newImage);
    } catch (e) {
      console.error('Failed to save about image to localStorage:', e);
    }
    if (newBadge !== undefined) {
      setAboutUsBadge(newBadge);
      try {
        localStorage.setItem('hgass_about_badge', newBadge);
      } catch (e) {
        console.error('Failed to save about badge to localStorage:', e);
      }
    }
  };

  const resetAboutUsImage = () => {
    setAboutUsImage(DEFAULT_ABOUT_US_IMAGE);
    setAboutUsBadge(DEFAULT_ABOUT_US_BADGE);
    try {
      localStorage.setItem('hgass_about_image', DEFAULT_ABOUT_US_IMAGE);
      localStorage.setItem('hgass_about_badge', DEFAULT_ABOUT_US_BADGE);
    } catch (e) {
      console.error('Failed to reset about image in localStorage:', e);
    }
  };

  // --- Header Logo Actions ---
  const updateHeaderLogo = (newLogoUrl: string) => {
    const trimmed = newLogoUrl.trim() || DEFAULT_HEADER_LOGO;
    setHeaderLogo(trimmed);
    try {
      localStorage.setItem('hgass_header_logo', trimmed);
    } catch (e) {
      console.error('Failed to save header logo in localStorage:', e);
    }
  };

  const resetHeaderLogo = () => {
    setHeaderLogo(DEFAULT_HEADER_LOGO);
    try {
      localStorage.setItem('hgass_header_logo', DEFAULT_HEADER_LOGO);
    } catch (e) {
      console.error('Failed to reset header logo in localStorage:', e);
    }
  };

  // Dynamic calculations for Stats
  const stats = {
    totalStudents: results.reduce((acc, current) => {
      if (!acc.includes(current.studentId)) {
        acc.push(current.studentId);
      }
      return acc;
    }, [] as string[]).length || 420,
    totalImages: gallery.length,
    totalVideos: videos.length,
    totalDocuments: documents.length,
    totalProjects: projects.length,
    totalNewsPosts: news.length,
    unreadMessages: messages.filter(m => !m.isRead).length,
    totalPayments: payments.length,
    pendingPayments: payments.filter(p => p.status === 'Pending Verification').length,
    verifiedRevenue: payments.filter(p => p.status === 'Verified').reduce((sum, p) => sum + (Number(p.amount) || 0), 0),
    totalStaff: staff.length,
    totalBoardMembers: staff.filter(s => s.category === 'Administrative Board').length,
    totalSubjects: subjects.length,
    totalCalendarEvents: calendarEvents.length
  };

  return {
    isLoading,
    news,
    projects,
    gallery,
    videos,
    documents,
    results,
    attendanceRecords,
    saveAttendanceRecords,
    deleteAttendanceRecord,
    clearAttendanceForDateAndClass,
    calendarEvents,
    addCalendarEvent,
    editCalendarEvent,
    deleteCalendarEvent,
    resetCalendarEvents,
    messages,
    payments,
    staff,
    subjects,
    socialHandles,
    heroSlides,
    addHeroSlide,
    editHeroSlide,
    deleteHeroSlide,
    resetHeroSlides,
    reorderHeroSlides,
    isAdminLoggedIn,
    supabaseStatus,
    stats,
    milestoneStats,
    updateMilestoneStats,
    aboutUsImage,
    aboutUsBadge,
    updateAboutUsImage,
    resetAboutUsImage,
    headerLogo,
    updateHeaderLogo,
    resetHeaderLogo,
    loginAdmin,
    logoutAdmin,
    addNews,
    editNews,
    deleteNews,
    addProject,
    editProject,
    deleteProject,
    addGalleryItem,
    editGalleryItem,
    deleteGalleryItem,
    addVideo,
    editVideo,
    deleteVideo,
    addDocument,
    deleteDocument,
    addResult,
    editResult,
    deleteResult,
    importResultsList,
    syncCumulativeRecords,
    updateStudentPromotionStatus,
    addStaffMember,
    editStaffMember,
    deleteStaffMember,
    addSubject,
    editSubject,
    deleteSubject,
    resetSubjects,
    updateSocialHandles,
    addMessage,
    markMessageRead,
    deleteMessage,
    addPayment,
    verifyPayment,
    deletePayment,
    pushAllLocalToSupabase,
    pullAllFromSupabase,
    disconnectSupabase,
    connectSupabase
  };
}
