/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomeView from './components/HomeView';
import AboutView from './components/AboutView';
import MissionView from './components/MissionView';
import SubjectsView from './components/SubjectsView';
import ProjectsView from './components/ProjectsView';
import GalleryView from './components/GalleryView';
import ResultsView from './components/ResultsView';
import ContactView from './components/ContactView';
import PaymentView from './components/PaymentView';
import AdminView from './components/AdminView';
import AcademicCalendar from './components/AcademicCalendar';

import { useSchoolStore } from './useSchoolStore';
import { ArrowUp, BookOpen, ShieldCheck, Lock, Key, Download } from 'lucide-react';
import { DocumentItem } from './types';
import { useTheme } from './useTheme';
import { useSeo, PAGE_SEO_MAP } from './useSeo';
import Breadcrumbs from './components/Breadcrumbs';

export default function App() {
  const getInitialPage = (): string => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');
      if (pageParam && PAGE_SEO_MAP[pageParam]) return pageParam;
      const hash = window.location.hash.replace('#', '');
      if (hash && PAGE_SEO_MAP[hash]) return hash;
    }
    return 'home';
  };

  const [currentPage, setCurrentPage] = useState<string>(getInitialPage);
  useSeo(currentPage, setCurrentPage);

  const [adminInitialTab, setAdminInitialTab] = useState<'overview' | 'headerLogo' | 'supabase' | 'slides' | 'aboutUs' | 'news' | 'projects' | 'images' | 'videos' | 'documents' | 'results' | 'analytics' | 'cumulative' | 'attendance' | 'calendar' | 'messages' | 'payments' | 'milestones' | 'staff' | 'subjects' | 'social' | 'seo'>('overview');
  const [adminSearchQuery, setAdminSearchQuery] = useState<string>('');
  const [adminSelectedResultId, setAdminSelectedResultId] = useState<string | null>(null);
  const { theme, isDark, toggleTheme } = useTheme();

  const handleDownloadDocument = (doc: DocumentItem) => {
    if (doc.accessPassword && doc.accessPassword.trim()) {
      const entered = window.prompt(`This file ("${doc.title}") is password-protected by the administration.\nPlease enter the assigned Access Password / PIN:`);
      if (!entered) return;
      if (entered.trim() !== doc.accessPassword.trim()) {
        alert("Incorrect Access Password! Access to this document file is restricted.");
        return;
      }
    }
    const link = document.createElement('a');
    link.href = doc.downloadUrl;
    link.download = doc.title;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Load from school store
  const {
    isLoading,
    news,
    projects,
    gallery,
    videos,
    documents,
    results,
    messages,
    payments,
    staff,
    isAdminLoggedIn,
    stats,
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
    addStaffMember,
    editStaffMember,
    deleteStaffMember,
    addMessage,
    markMessageRead,
    deleteMessage,
    addPayment,
    verifyPayment,
    deletePayment,
    milestoneStats,
    updateMilestoneStats,
    supabaseStatus,
    pushAllLocalToSupabase,
    pullAllFromSupabase,
    disconnectSupabase,
    connectSupabase,
    subjects,
    socialHandles,
    heroSlides,
    addHeroSlide,
    editHeroSlide,
    deleteHeroSlide,
    resetHeroSlides,
    reorderHeroSlides,
    addSubject,
    editSubject,
    deleteSubject,
    resetSubjects,
    updateSocialHandles,
    updateStudentPromotionStatus,
    attendanceRecords,
    saveAttendanceRecords,
    deleteAttendanceRecord,
    clearAttendanceForDateAndClass,
    calendarEvents,
    addCalendarEvent,
    editCalendarEvent,
    deleteCalendarEvent,
    resetCalendarEvents,
    aboutUsImage,
    aboutUsBadge,
    updateAboutUsImage,
    resetAboutUsImage,
    headerLogo,
    updateHeaderLogo,
    resetHeaderLogo,
    syncCumulativeRecords
  } = useSchoolStore();

  const handleScrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderActiveView = () => {
    if (isLoading) {
      return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-green border-t-brand-yellow animate-spin" />
          <p className="text-xs font-semibold text-brand-green uppercase tracking-widest font-sans">
            Loading Academy Portal Resources...
          </p>
        </div>
      );
    }

    switch (currentPage) {
      case 'home':
        return <HomeView news={news} projects={projects} setCurrentPage={setCurrentPage} milestoneStats={milestoneStats} heroSlides={heroSlides} />;
      case 'about':
        return <AboutView staff={staff} aboutImage={aboutUsImage} aboutBadge={aboutUsBadge} />;
      case 'mission':
        return <MissionView />;
      case 'calendar':
        return (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
            {isAdminLoggedIn && (
              <div className="mb-5 p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 bg-amber-100 text-amber-800 rounded-md shrink-0">
                    <ShieldCheck className="w-4 h-4 text-brand-oxblood" />
                  </span>
                  <div>
                    <strong className="font-bold uppercase tracking-wide text-brand-oxblood">Administrator Notice:</strong>
                    <span className="text-slate-600 block sm:inline sm:ml-1">
                      Editing, adding, and deleting academic calendar events is maintained exclusively within the Admin Dashboard.
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAdminInitialTab('calendar');
                    setCurrentPage('admin');
                  }}
                  className="px-3.5 py-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded text-[11px] font-bold uppercase tracking-wider transition cursor-pointer shadow-2xs shrink-0 self-start sm:self-auto"
                >
                  Manage in Admin Dashboard &rarr;
                </button>
              </div>
            )}
            <AcademicCalendar
              events={calendarEvents}
              isAdmin={false}
            />
          </div>
        );
      case 'subjects':
        return <SubjectsView subjects={subjects} />;
      case 'projects':
        return <ProjectsView projects={projects} />;
      case 'gallery':
        return <GalleryView gallery={gallery} videos={videos} />;
      case 'portal':
      case 'results':
        return <ResultsView results={results} onNavigatePage={setCurrentPage} />;
      case 'payment':
        return <PaymentView payments={payments} onAddPayment={addPayment} />;
      case 'contact':
        return <ContactView onSendMessage={addMessage} />;
      case 'admin':
        return (
          <AdminView
            isAdminLoggedIn={isAdminLoggedIn}
            onLogin={loginAdmin}
            onLogout={logoutAdmin}
            stats={stats}
            news={news}
            projects={projects}
            gallery={gallery}
            videos={videos}
            documents={documents}
            results={results}
            attendanceRecords={attendanceRecords}
            onSaveAttendance={saveAttendanceRecords}
            onDeleteAttendanceRecord={deleteAttendanceRecord}
            onClearAttendanceClassDate={clearAttendanceForDateAndClass}
            calendarEvents={calendarEvents}
            onAddCalendarEvent={addCalendarEvent}
            onEditCalendarEvent={editCalendarEvent}
            onDeleteCalendarEvent={deleteCalendarEvent}
            onResetCalendarEvents={resetCalendarEvents}
            messages={messages}
            payments={payments}
            staff={staff}
            subjects={subjects}
            socialHandles={socialHandles}
            heroSlides={heroSlides}
            onAddHeroSlide={addHeroSlide}
            onEditHeroSlide={editHeroSlide}
            onDeleteHeroSlide={deleteHeroSlide}
            onResetHeroSlides={resetHeroSlides}
            onReorderHeroSlides={reorderHeroSlides}
            onAddSubject={addSubject}
            onEditSubject={editSubject}
            onDeleteSubject={deleteSubject}
            onResetSubjects={resetSubjects}
            onUpdateSocialHandles={updateSocialHandles}
            onUpdatePromotionStatus={updateStudentPromotionStatus}
            milestoneStats={milestoneStats}
            updateMilestoneStats={updateMilestoneStats}
            addNews={addNews}
            editNews={editNews}
            deleteNews={deleteNews}
            addProject={addProject}
            editProject={editProject}
            deleteProject={deleteProject}
            addGalleryItem={addGalleryItem}
            editGalleryItem={editGalleryItem}
            deleteGalleryItem={deleteGalleryItem}
            addVideo={addVideo}
            editVideo={editVideo}
            deleteVideo={deleteVideo}
            addDocument={addDocument}
            deleteDocument={deleteDocument}
            addResult={addResult}
            editResult={editResult}
            deleteResult={deleteResult}
            importResultsList={importResultsList}
            addStaffMember={addStaffMember}
            editStaffMember={editStaffMember}
            deleteStaffMember={deleteStaffMember}
            markMessageRead={markMessageRead}
            deleteMessage={deleteMessage}
            onVerifyPayment={verifyPayment}
            onDeletePayment={deletePayment}
            supabaseStatus={supabaseStatus}
            pushAllLocalToSupabase={pushAllLocalToSupabase}
            pullAllFromSupabase={pullAllFromSupabase}
            onDisconnectSupabase={disconnectSupabase}
            onConnectSupabase={connectSupabase}
            aboutUsImage={aboutUsImage}
            aboutUsBadge={aboutUsBadge}
            onUpdateAboutUsImage={updateAboutUsImage}
            onResetAboutUsImage={resetAboutUsImage}
            headerLogo={headerLogo}
            onUpdateHeaderLogo={updateHeaderLogo}
            onResetHeaderLogo={resetHeaderLogo}
            onNavigatePublicPage={(page) => setCurrentPage(page)}
            onSyncCumulative={syncCumulativeRecords}
            initialActiveTab={adminInitialTab}
            initialSearchQuery={adminSearchQuery}
            initialSelectedResultId={adminSelectedResultId || undefined}
          />
        );
      default:
        return <HomeView news={news} projects={projects} setCurrentPage={setCurrentPage} milestoneStats={milestoneStats} />;
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-[#0b1329] text-slate-100' : 'bg-gray-50 text-gray-800'} font-sans flex flex-col justify-between selection:bg-brand-green/25 selection:text-brand-green-dark transition-colors duration-200`}>
      
      {/* 1. Portal Header (Navigation block with Global Search) */}
      <div className="no-print">
        <Header 
          currentPage={currentPage} 
          setCurrentPage={setCurrentPage} 
          isAdminLoggedIn={isAdminLoggedIn}
          onLogout={logoutAdmin}
          headerLogo={headerLogo}
          theme={theme}
          toggleTheme={toggleTheme}
          documents={documents}
          results={results}
          news={news}
          onDownloadDocument={handleDownloadDocument}
          onNavigateAdminTab={(tab, query, resultId) => {
            setAdminInitialTab(tab as any);
            if (query) setAdminSearchQuery(query);
            if (resultId) setAdminSelectedResultId(resultId);
            setCurrentPage('admin');
          }}
          onOpenAdminLogin={() => {
            setCurrentPage('admin');
          }}
        />
      </div>

      {/* Breadcrumb Navigation for Secondary Pages */}
      {currentPage !== 'home' && (
        <div className="bg-white/80 border-b border-slate-200/60 backdrop-blur-xs">
          <Breadcrumbs
            items={
              (PAGE_SEO_MAP[currentPage]?.breadcrumbs.slice(1) || []).map((b, i, arr) => ({
                label: b.name,
                page: i === arr.length - 1 ? undefined : currentPage,
                active: i === arr.length - 1
              }))
            }
            onNavigate={setCurrentPage}
          />
        </div>
      )}

      {/* 2. Main Portal Canvas (Renders selected pages dynamically) */}
      <main className="grow">
        {renderActiveView()}
      </main>

      {/* 3. Document Downloads Drawer (Floating widget only visible in downloads/home/about contexts, is fully integrated) */}
      {currentPage === 'home' && documents.length > 0 && (
        <section className={`${isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-brand-green/5 border-brand-green/10'} border-y py-6 no-print transition-colors`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
            <div className="flex items-center space-x-2.5">
              <span className="p-1.5 bg-brand-green text-white rounded border border-brand-yellow/30">
                <BookOpen className="w-4 h-4 text-brand-yellow" />
              </span>
              <div>
                <h3 className="font-bold text-xs sm:text-sm font-heading text-brand-green uppercase tracking-wide">Downloads & Publications Board</h3>
                <p className="text-[10px] text-slate-400">Access official academic calendars, admissions guidelines, syllabus regulations, and book lists instantly.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {documents.slice(0, 4).map((doc) => (
                <div 
                  key={doc.id} 
                  className={`${isDark ? 'bg-slate-800/90 border-slate-700 hover:border-brand-green/50' : 'bg-white border-slate-200 hover:border-brand-green/30'} p-3 rounded border shadow-2xs flex justify-between items-center text-xs hover:shadow-xs transition`}
                >
                  <div className="space-y-0.5 pr-2">
                    <div className="flex items-center gap-1.5">
                      <p className={`font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'} uppercase line-clamp-1 leading-snug`}>{doc.title}</p>
                      {doc.accessPassword && (
                        <span className="shrink-0 text-amber-700 bg-amber-50 border border-amber-200/80 rounded px-1 py-0.2 text-[8.5px] font-mono flex items-center gap-0.5" title="Password Protected">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Protected</span>
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-slate-400 uppercase font-mono">Format: <span className="font-bold text-brand-green">{doc.fileType}</span>  |  Size: {doc.fileSize}</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => handleDownloadDocument(doc)}
                    className="p-1.5 bg-brand-green hover:bg-brand-green-dark text-white rounded cursor-pointer transition shrink-0 border border-brand-green flex items-center justify-center text-[10px]"
                    title={doc.accessPassword ? "Enter PIN to download" : "Download document"}
                  >
                    {doc.accessPassword ? <Key className="w-3.5 h-3.5 text-brand-yellow" /> : <Download className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. Portal Footer */}
      <div className="no-print">
        <Footer 
          setCurrentPage={setCurrentPage} 
          headerLogo={headerLogo}
          theme={theme}
          toggleTheme={toggleTheme}
          socialHandles={socialHandles}
        />
      </div>

      {/* 5. Floating Back-to-Top Button */}
      <button
        onClick={handleScrollTop}
        className="fixed bottom-6 right-6 z-40 bg-brand-oxblood hover:bg-brand-oxblood-dark text-brand-yellow p-3 rounded-full shadow-lg transition-all border border-brand-yellow/20 hover:scale-105 cursor-pointer no-print flex items-center justify-center"
        aria-label="Back to Top"
        title="Back to Top"
      >
        <ArrowUp className="w-5 h-5" />
      </button>

    </div>
  );
}
