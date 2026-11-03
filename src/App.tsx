import React, { lazy, Suspense, useState, useEffect } from 'react';
import { Company, Activity, Meeting, CalendarEvent, ActiveTab } from './types';
import { StorageService } from './services/storageService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { LoginView } from './components/LoginView';
import { getCrmNotifications } from './services/notificationService';

const DashboardView = lazy(() => import('./components/views/DashboardView').then(module => ({ default: module.DashboardView })));
const CompaniesView = lazy(() => import('./components/views/CompaniesView').then(module => ({ default: module.CompaniesView })));
const ActivitiesView = lazy(() => import('./components/views/ActivitiesView').then(module => ({ default: module.ActivitiesView })));
const MeetingsView = lazy(() => import('./components/views/MeetingsView').then(module => ({ default: module.MeetingsView })));
const CalendarView = lazy(() => import('./components/views/CalendarView').then(module => ({ default: module.CalendarView })));
const SettingsView = lazy(() => import('./components/views/SettingsView').then(module => ({ default: module.SettingsView })));
const ProtocolsView = lazy(() => import('./components/views/ProtocolsView').then(module => ({ default: module.ProtocolsView })));
const NewCompanyModal = lazy(() => import('./components/modals/NewCompanyModal').then(module => ({ default: module.NewCompanyModal })));
const NewMeetingModal = lazy(() => import('./components/modals/NewMeetingModal').then(module => ({ default: module.NewMeetingModal })));
const AiAssistantModal = lazy(() => import('./components/modals/AiAssistantModal').then(module => ({ default: module.AiAssistantModal })));

export default function App() {
  const [authStatus, setAuthStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(undefined);
  const [selectedActivityId, setSelectedActivityId] = useState<string | undefined>(undefined);

  // Modals state
  const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false);
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [meetingInitialCompanyId, setMeetingInitialCompanyId] = useState<string | undefined>(undefined);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Load data from persistent storage
  const loadData = async () => {
    try {
      await StorageService.initialize();
      const loadedCompanies = StorageService.getCompanies();
      const loadedActivities = StorageService.getActivities();
      const loadedMeetings = StorageService.getMeetings();
      const loadedCalendarEvents = StorageService.getCalendarEvents();

      setCompanies(loadedCompanies);
      setActivities(loadedActivities);
      setMeetings(loadedMeetings);
      setCalendarEvents(loadedCalendarEvents);
      setDataError(null);

      if (!selectedCompanyId && loadedCompanies.length > 0) {
        setSelectedCompanyId(loadedCompanies[0].id);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'CRM verileri yüklenemedi.';
      setDataError(message);
      console.error('Failed to load CRM data', error);
    }
  };

  useEffect(() => {
    let active = true;
    void fetch('/api/auth/me')
      .then(async response => {
        if (!response.ok) throw new Error('Oturum bilgisi alınamadı.');
        return response.json() as Promise<{ authenticated: boolean; username?: string; displayName?: string }>;
      })
      .then(async session => {
        if (!active) return;
        if (!session.authenticated || !session.username) {
          setAuthStatus('unauthenticated');
          return;
        }
        setUsername(session.username);
        setDisplayName(session.displayName || session.username);
        setAuthStatus('authenticated');
        await loadData();
      })
      .catch(error => {
        if (!active) return;
        setAuthNotice(error instanceof Error ? error.message : 'Sunucuya bağlanılamadı.');
        setAuthStatus('unauthenticated');
      });

    const handleStorageUpdate = () => {
      void loadData();
    };
    const handleAuthExpired = () => {
      setAuthStatus('unauthenticated');
      setUsername('');
      setDisplayName('');
      setAuthNotice('Oturumunuz sona erdi. Yeniden giriş yapın.');
    };
    window.addEventListener('arel_storage_updated', handleStorageUpdate);
    window.addEventListener('arel_auth_expired', handleAuthExpired);
    return () => {
      active = false;
      window.removeEventListener('arel_storage_updated', handleStorageUpdate);
      window.removeEventListener('arel_auth_expired', handleAuthExpired);
    };
  }, []);

  const handleLogin = async (loginUsername: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: loginUsername, password }),
    });
    let result: unknown;
    try {
      result = await response.json();
    } catch (error) {
      throw new Error('Sunucudan geçerli giriş yanıtı alınamadı.', { cause: error });
    }
    if (!response.ok) {
      const message = typeof result === 'object' && result !== null && 'error' in result
        && typeof result.error === 'string'
        ? result.error
        : 'Giriş yapılamadı.';
      throw new Error(message);
    }
    if (typeof result !== 'object' || result === null || !('username' in result)
      || typeof result.username !== 'string') {
      throw new Error('Sunucudan geçersiz oturum yanıtı alındı.');
    }
    setUsername(result.username);
    setDisplayName('displayName' in result && typeof result.displayName === 'string'
      ? result.displayName
      : result.username);
    setAuthNotice(null);
    setAuthStatus('authenticated');
    await loadData();
  };

  const handleLogout = async () => {
    const response = await fetch('/api/auth/logout', { method: 'POST' });
    if (!response.ok) {
      setDataError('Güvenli çıkış yapılamadı. Lütfen tekrar deneyin.');
      return;
    }
    setUsername('');
    setDisplayName('');
    setAuthStatus('unauthenticated');
    setAuthNotice(null);
  };

  // Handlers for creating data
  const handleAddCompany = async (newCompany: Company) => {
    try {
      const updated = await StorageService.addCompany(newCompany);
      setCompanies(updated);
      setSelectedCompanyId(newCompany.id);
      setActiveTab('companies');
      setDataError(null);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Firma kaydedilemedi.');
      throw error;
    }
  };

  const handleAddActivity = async (newAct: Activity) => {
    try {
      const updated = await StorageService.addActivity(newAct);
      setActivities(updated);
      if (newAct.companyId) {
        const comp = companies.find(c => c.id === newAct.companyId);
        if (comp) {
          await StorageService.updateCompany(comp.id, {
            stats: {
              ...comp.stats,
              totalActivities: comp.stats.totalActivities + 1,
              attendedStudents: comp.stats.attendedStudents + (newAct.attendedStudents || newAct.targetStudents || 0),
            },
          });
        }
      }
      setDataError(null);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Faaliyet kaydedilemedi.');
      await loadData();
      throw error;
    }
  };

  const handleUpdateActivity = async (id: string, updates: Partial<Activity>) => {
    try {
      const updatedActivities = await StorageService.updateActivity(id, updates);
      setActivities(updatedActivities);
      const activity = updatedActivities.find(item => item.id === id);
      if (activity?.companyId) {
        const company = companies.find(item => item.id === activity.companyId);
        if (company) {
          const companyActivities = updatedActivities.filter(item => item.companyId === company.id && item.status !== 'İptal Edildi');
          await StorageService.updateCompany(company.id, {
            stats: {
              ...company.stats,
              totalActivities: companyActivities.length,
              attendedStudents: companyActivities.reduce((total, item) =>
                total + (item.status === 'Tamamlandı' ? item.attendedStudents ?? 0 : 0), 0),
            },
          });
        }
      }
      setDataError(null);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Faaliyet güncellenemedi.');
      await loadData();
      throw error;
    }
  };

  const handleAddMeeting = async (newMeeting: Meeting) => {
    try {
      const updated = await StorageService.addMeeting(newMeeting);
      setMeetings(updated);
      if (newMeeting.companyId) {
        const comp = companies.find(c => c.id === newMeeting.companyId);
        if (comp) {
          await StorageService.updateCompany(comp.id, {
            stats: {
              ...comp.stats,
              totalMeetings: comp.stats.totalMeetings + 1,
            },
          });
        }
      }
      setDataError(null);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Toplantı kaydedilemedi.');
      await loadData();
      throw error;
    }
  };

  const handleUpdateMeeting = async (id: string, updates: Partial<Meeting>) => {
    try {
      const updatedMeetings = await StorageService.updateMeeting(id, updates);
      setMeetings(updatedMeetings);
      setDataError(null);
    } catch (error) {
      setDataError(error instanceof Error ? error.message : 'Toplantı güncellenemedi.');
      await loadData();
      throw error;
    }
  };

  const handleSelectCompany = (comp: Company) => {
    setSelectedCompanyId(comp.id);
    setActiveTab('companies');
  };

  const handleSelectActivity = (activity: Activity) => {
    setSelectedActivityId(activity.id);
    setActiveTab('activities');
  };

  const handleOpenNotification = (kind: 'activity' | 'meeting', recordId: string) => {
    if (kind === 'activity') setSelectedActivityId(recordId);
    setActiveTab(kind === 'activity' ? 'activities' : 'meetings');
  };

  const notificationCount = getCrmNotifications(activities, meetings).length;
  const handleOpenMeetingModal = (companyId?: string) => {
    setMeetingInitialCompanyId(companyId);
    setIsNewMeetingModalOpen(true);
  };

  const handleOpenActivityModal = (companyId?: string) => {
    if (companyId) {
      setSelectedCompanyId(companyId);
    }
    setActiveTab('activities');
  };

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || companies[0];

  if (authStatus === 'checking') {
    return <div className="min-h-screen bg-[#f8fafc]" aria-label="Oturum kontrol ediliyor" />;
  }
  if (authStatus === 'unauthenticated') {
    return <LoginView notice={authNotice} onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden text-[#1E293B] antialiased">
      {/* Permanent Structural Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={tab => setActiveTab(tab)}
        onNavigate={tab => setActiveTab(tab)}
        openAiModal={() => setIsAiModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        companiesCount={companies.length}
        activitiesCount={activities.length}
        meetingsCount={meetings.length}
        notificationCount={notificationCount}
        username={username}
        displayName={displayName}
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />
      {mobileSidebarOpen && (
        <button type="button" aria-label="Menüyü kapat" onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 md:hidden" />
      )}

      {/* Main App Canvas */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header Bar */}
        <Header
          onOpenAiModal={() => setIsAiModalOpen(true)}
          onNavigateSettings={() => setActiveTab('settings')}
          onOpenNewCompanyModal={() => setIsNewCompanyModalOpen(true)}
          onOpenNewMeetingModal={() => handleOpenMeetingModal()}
          onOpenNewActivityModal={() => setActiveTab('activities')}
          companies={companies}
          onSelectCompany={handleSelectCompany}
          username={username}
          displayName={displayName}
          onLogout={() => { void handleLogout(); }}
          activities={activities}
          meetings={meetings}
          onOpenNotification={handleOpenNotification}
          onToggleSidebar={() => setMobileSidebarOpen(open => !open)}
          mobileSidebarOpen={mobileSidebarOpen}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#f8fafc]">
          {dataError && (
            <div role="alert" className="max-w-[1600px] mx-auto mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {dataError}
            </div>
          )}
          <Suspense fallback={<div className="max-w-[1600px] mx-auto w-full" />}>
          <div className="max-w-[1600px] mx-auto w-full">
            {activeTab === 'dashboard' && (
              <DashboardView
                companies={companies}
                activities={activities}
                meetings={meetings}
                onNavigateTab={tab => setActiveTab(tab)}
                onSelectCompany={handleSelectCompany}
                onSelectActivity={handleSelectActivity}
                onSelectMeeting={() => setActiveTab('meetings')}
              />
            )}

            {activeTab === 'companies' && (
              <CompaniesView
                companies={companies}
                activities={activities}
                meetings={meetings}
                selectedCompanyId={selectedCompanyId}
                onSelectCompany={comp => setSelectedCompanyId(comp.id)}
                onOpenNewCompanyModal={() => setIsNewCompanyModalOpen(true)}
                onOpenNewActivityModal={handleOpenActivityModal}
                onOpenNewMeetingModal={handleOpenMeetingModal}
              />
            )}

            {activeTab === 'activities' && (
              <ActivitiesView
                companies={companies}
                activities={activities}
                onAddActivity={handleAddActivity}
                onUpdateActivity={handleUpdateActivity}
                onOpenAiModal={() => setIsAiModalOpen(true)}
                onNavigateTab={tab => setActiveTab(tab)}
                selectedActivityId={selectedActivityId}
                onClearSelectedActivity={() => setSelectedActivityId(undefined)}
              />
            )}

            {activeTab === 'meetings' && (
              <MeetingsView
                companies={companies}
                meetings={meetings}
                onAddMeeting={handleAddMeeting}
                onUpdateMeeting={handleUpdateMeeting}
                onAddCompany={handleAddCompany}
                onOpenNewMeetingModal={handleOpenMeetingModal}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                companies={companies}
                activities={activities}
                meetings={meetings}
                calendarEvents={calendarEvents}
                onOpenNewActivityModal={() => setActiveTab('activities')}
                onOpenNewMeetingModal={() => handleOpenMeetingModal()}
              />
            )}

            {activeTab === 'protocols' && (
              <ProtocolsView
                companies={companies}
                onSelectCompany={handleSelectCompany}
                onOpenNewCompanyModal={() => setIsNewCompanyModalOpen(true)}
                onNavigateTab={tab => setActiveTab(tab)}
              />
            )}

            {activeTab === 'excel-sync' && (
              <SettingsView
                companies={companies}
                activities={activities}
                meetings={meetings}
                onDataRefresh={loadData}
                initialSubTab="excel"
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                companies={companies}
                activities={activities}
                meetings={meetings}
                onDataRefresh={loadData}
                initialSubTab="profile"
                username={username}
                displayName={displayName}
                onProfileUpdated={setDisplayName}
              />
            )}
          </div>
          </Suspense>
        </main>
      </div>

      {/* Global Modals */}
      {isNewCompanyModalOpen && <Suspense fallback={null}><NewCompanyModal
        isOpen={isNewCompanyModalOpen}
        onClose={() => setIsNewCompanyModalOpen(false)}
        onSave={handleAddCompany}
      /></Suspense>}

      {isNewMeetingModalOpen && <Suspense fallback={null}><NewMeetingModal
        isOpen={isNewMeetingModalOpen}
        onClose={() => setIsNewMeetingModalOpen(false)}
        companies={companies}
        initialCompanyId={meetingInitialCompanyId}
        onSave={handleAddMeeting}
      /></Suspense>}

      {isAiModalOpen && <Suspense fallback={null}><AiAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        companies={companies}
        activities={activities}
        meetings={meetings}
        onAddMeeting={handleAddMeeting}
        onAddActivity={handleAddActivity}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsAiModalOpen(false);
        }}
      /></Suspense>}
    </div>
  );
}
