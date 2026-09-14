import React, { useState, useEffect } from 'react';
import { Company, Activity, Meeting, ActiveTab } from './types';
import { StorageService } from './services/storageService';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/views/DashboardView';
import { CompaniesView } from './components/views/CompaniesView';
import { ActivitiesView } from './components/views/ActivitiesView';
import { MeetingsView } from './components/views/MeetingsView';
import { CalendarView } from './components/views/CalendarView';
import { SettingsView } from './components/views/SettingsView';
import { ProtocolsView } from './components/views/ProtocolsView';
import { NewCompanyModal } from './components/modals/NewCompanyModal';
import { NewMeetingModal } from './components/modals/NewMeetingModal';
import { AiAssistantModal } from './components/modals/AiAssistantModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | undefined>(undefined);

  // Modals state
  const [isNewCompanyModalOpen, setIsNewCompanyModalOpen] = useState(false);
  const [isNewMeetingModalOpen, setIsNewMeetingModalOpen] = useState(false);
  const [meetingInitialCompanyId, setMeetingInitialCompanyId] = useState<string | undefined>(undefined);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  // Load data from persistent storage
  const loadData = () => {
    const loadedCompanies = StorageService.getCompanies();
    const loadedActivities = StorageService.getActivities();
    const loadedMeetings = StorageService.getMeetings();

    setCompanies(loadedCompanies);
    setActivities(loadedActivities);
    setMeetings(loadedMeetings);

    if (!selectedCompanyId && loadedCompanies.length > 0) {
      setSelectedCompanyId(loadedCompanies[0].id);
    }
  };

  useEffect(() => {
    loadData();

    // Listen for storage updates
    const handleStorageUpdate = () => {
      loadData();
    };
    window.addEventListener('arel_storage_updated', handleStorageUpdate);
    return () => {
      window.removeEventListener('arel_storage_updated', handleStorageUpdate);
    };
  }, []);

  // Handlers for creating data
  const handleAddCompany = (newCompany: Company) => {
    const updated = StorageService.addCompany(newCompany);
    setCompanies(updated);
    setSelectedCompanyId(newCompany.id);
    setActiveTab('companies');
  };

  const handleAddActivity = (newAct: Activity) => {
    const updated = StorageService.addActivity(newAct);
    setActivities(updated);
    // Also update company stats
    if (newAct.companyId) {
      const comp = companies.find(c => c.id === newAct.companyId);
      if (comp) {
        StorageService.updateCompany(comp.id, {
          stats: {
            ...comp.stats,
            totalActivities: comp.stats.totalActivities + 1,
            attendedStudents: comp.stats.attendedStudents + (newAct.attendedStudents || newAct.targetStudents || 0),
          },
        });
        loadData();
      }
    }
  };

  const handleAddMeeting = (newMeeting: Meeting) => {
    const updated = StorageService.addMeeting(newMeeting);
    setMeetings(updated);
    // Also update company stats
    if (newMeeting.companyId) {
      const comp = companies.find(c => c.id === newMeeting.companyId);
      if (comp) {
        StorageService.updateCompany(comp.id, {
          stats: {
            ...comp.stats,
            totalMeetings: comp.stats.totalMeetings + 1,
          },
        });
        loadData();
      }
    }
  };

  const handleSelectCompany = (comp: Company) => {
    setSelectedCompanyId(comp.id);
    setActiveTab('companies');
  };

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
      />

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
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-[#f8fafc]">
          <div className="max-w-[1600px] mx-auto w-full">
            {activeTab === 'dashboard' && (
              <DashboardView
                companies={companies}
                activities={activities}
                meetings={meetings}
                onNavigateTab={tab => setActiveTab(tab)}
                onSelectCompany={handleSelectCompany}
                onSelectActivity={() => setActiveTab('activities')}
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
                onOpenAiModal={() => setIsAiModalOpen(true)}
                onNavigateTab={tab => setActiveTab(tab)}
              />
            )}

            {activeTab === 'meetings' && (
              <MeetingsView
                companies={companies}
                meetings={meetings}
                onAddMeeting={handleAddMeeting}
                onAddCompany={handleAddCompany}
                onOpenNewMeetingModal={handleOpenMeetingModal}
              />
            )}

            {activeTab === 'calendar' && (
              <CalendarView
                companies={companies}
                activities={activities}
                meetings={meetings}
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

            {activeTab === 'db-sync' && (
              <SettingsView
                companies={companies}
                activities={activities}
                meetings={meetings}
                onDataRefresh={loadData}
                initialSubTab="db"
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                companies={companies}
                activities={activities}
                meetings={meetings}
                onDataRefresh={loadData}
                initialSubTab="db"
              />
            )}
          </div>
        </main>
      </div>

      {/* Global Modals */}
      <NewCompanyModal
        isOpen={isNewCompanyModalOpen}
        onClose={() => setIsNewCompanyModalOpen(false)}
        onSave={handleAddCompany}
      />

      <NewMeetingModal
        isOpen={isNewMeetingModalOpen}
        onClose={() => setIsNewMeetingModalOpen(false)}
        companies={companies}
        initialCompanyId={meetingInitialCompanyId}
        onSave={handleAddMeeting}
      />

      <AiAssistantModal
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
      />
    </div>
  );
}
