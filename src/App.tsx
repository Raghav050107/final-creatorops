import React, { useState, useEffect } from 'react';
import type { Agency, Creator, Deal, Deliverable, DealStage, DeliverableStatus, Manager, Report } from './types/creatorops';
import { loadAgencyData, saveAgencyData } from './lib/store';
import { api } from './lib/api';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardWidgets } from './components/DashboardWidgets';
import { KanbanBoard } from './components/KanbanBoard';
import { UnifiedCalendar } from './components/UnifiedCalendar';
import { ChannelAnalytics } from './components/ChannelAnalytics';
import { ProposalCalculator } from './components/ProposalCalculator';
import { CreatorRoster } from './components/CreatorRoster';
import { RevenueDashboard } from './components/RevenueDashboard';
import { ReportList } from './components/ReportList';
import { PublicReportView } from './components/PublicReportView';
import { 
  AddCreatorModal, 
  AddDealModal, 
  AddDeliverableModal, 
  YouTubeApiKeyModal, 
  EmailDigestModal 
} from './components/Modals';
import { CreatorInvoiceModal } from './components/CreatorInvoiceModal';
import { AuthModal } from './components/AuthModal';
import { AccountSettingsModal } from './components/AccountSettingsModal';

export const App: React.FC = () => {
  const { user, agency: authAgency } = useAuth();

  const [agency, setAgency] = useState<Agency>(() => loadAgencyData());
  const [activeTab, setActiveTab] = useState<any>('deals');
  const [activeManager, setActiveManager] = useState<Manager>(agency.managers[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [youtubeApiKey, setYoutubeApiKey] = useState<string>(() => localStorage.getItem('youtube_api_key') || '');

  // Modal States
  const [isAddCreatorModalOpen, setIsAddCreatorModalOpen] = useState(false);
  const [isAddDealModalOpen, setIsAddDealModalOpen] = useState(false);
  const [isAddDeliverableModalOpen, setIsAddDeliverableModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const [isEmailDigestModalOpen, setIsEmailDigestModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountSettingsModalOpen, setIsAccountSettingsModalOpen] = useState(false);
  const [selectedInvoiceCreatorId, setSelectedInvoiceCreatorId] = useState<string>('');
  const [selectedInvoiceDealId, setSelectedInvoiceDealId] = useState<string | undefined>();

  // Modal Presets
  const [presetDealIdForDeliverable, setPresetDealIdForDeliverable] = useState<string | undefined>();
  const [presetTargetLiveDate, setPresetTargetLiveDate] = useState<string | undefined>();

  // Public Report State
  const [activePublicReport, setActivePublicReport] = useState<{ report: Report; deal: Deal } | null>(null);

  // Sync with Backend on mount or when authAgency changes
  const fetchLiveWorkspace = async () => {
    try {
      const liveData = await api.getAgencyWorkspace();
      if (liveData && liveData.deals) {
        setAgency(liveData);
        if (liveData.managers && liveData.managers.length > 0) {
          setActiveManager(liveData.managers[0]);
        }
      }
    } catch (err) {
      console.warn('Using local cache:', err);
    }
  };

  useEffect(() => {
    fetchLiveWorkspace();
  }, [authAgency?.id]);

  // Auto-save state updates to localStorage
  useEffect(() => {
    saveAgencyData(agency);
  }, [agency]);

  const overdueDeliverables = agency.deliverables.filter(d => {
    if (d.status === 'Live') return false;
    const targetDate = new Date(d.targetLiveDate || d.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return targetDate < today;
  });

  const overdueCount = overdueDeliverables.length;

  const handleSaveApiKey = (key: string) => {
    setYoutubeApiKey(key);
    localStorage.setItem('youtube_api_key', key);
  };

  const handleSaveCreator = async (newCreatorData: Omit<Creator, 'id' | 'createdAt'>) => {
    const tempId = `c_${Date.now()}`;
    const creator: Creator = {
      ...newCreatorData,
      id: tempId,
      createdAt: new Date().toISOString()
    };

    setAgency(prev => ({
      ...prev,
      creators: [...prev.creators, creator]
    }));

    try {
      const created = await api.createCreator(newCreatorData);
      setAgency(prev => ({
        ...prev,
        creators: prev.creators.map(c => c.id === tempId ? created : c)
      }));
    } catch (err) {
      console.warn('Backend sync failed, saved locally:', err);
    }
  };

  const handleUpdateCreator = async (updatedCreator: Creator) => {
    setAgency(prev => ({
      ...prev,
      creators: prev.creators.map(c => c.id === updatedCreator.id ? updatedCreator : c)
    }));

    try {
      await api.updateCreator(updatedCreator.id, updatedCreator);
    } catch (err) {
      console.warn('Backend sync failed, updated locally:', err);
    }
  };

  const handleDeleteCreator = async (creatorId: string) => {
    setAgency(prev => ({
      ...prev,
      creators: prev.creators.filter(c => c.id !== creatorId),
      deals: prev.deals.map(d => ({
        ...d,
        creatorIds: d.creatorIds.filter(id => id !== creatorId)
      })).filter(d => d.creatorIds.length > 0),
      deliverables: prev.deliverables.filter(del => del.creatorId !== creatorId)
    }));

    try {
      await api.deleteCreator(creatorId);
    } catch (err) {
      console.warn('Backend sync failed, deleted locally:', err);
    }
  };

  const handleSaveDeal = async (newDealData: Omit<Deal, 'id' | 'createdAt' | 'activityLog'>) => {
    const tempId = `deal_${Date.now()}`;
    const deal: Deal = {
      ...newDealData,
      id: tempId,
      activityLog: [
        {
          id: `act_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          author: user?.name || activeManager.name,
          text: `Deal created for ${newDealData.brandName} at ${newDealData.value} INR`
        }
      ],
      createdAt: new Date().toISOString()
    };

    setAgency(prev => ({
      ...prev,
      deals: [deal, ...prev.deals]
    }));

    try {
      const created = await api.createDeal(newDealData);
      setAgency(prev => ({
        ...prev,
        deals: prev.deals.map(d => d.id === tempId ? created : d)
      }));
    } catch (err) {
      console.warn('Backend sync failed, saved locally:', err);
    }
  };

  const handleSaveDealFromProposal = (dealData: { brandName: string; value: number; commissionPct: number; creatorIds: string[]; targetLiveDate: string }) => {
    handleSaveDeal({
      agencyId: agency.id,
      brandName: dealData.brandName,
      brandContact: 'proposal@agency.com',
      value: dealData.value,
      currency: 'INR',
      commissionPct: dealData.commissionPct,
      stage: 'Signed',
      targetLiveDate: dealData.targetLiveDate,
      creatorIds: dealData.creatorIds
    });
    setActiveTab('deals');
  };

  const handleUpdateDealStage = async (dealId: string, newStage: DealStage) => {
    setAgency(prev => ({
      ...prev,
      deals: prev.deals.map(d => {
        if (d.id === dealId) {
          const logItem = {
            id: `act_${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            author: user?.name || activeManager.name,
            text: `Stage changed from ${d.stage} to ${newStage}`
          };
          return {
            ...d,
            stage: newStage,
            activityLog: [logItem, ...d.activityLog]
          };
        }
        return d;
      })
    }));

    try {
      await api.updateDeal(dealId, { stage: newStage });
    } catch (err) {
      console.warn('Backend sync failed, updated locally:', err);
    }
  };

  const handleUpdateDealNotes = (dealId: string, notes: string) => {
    setAgency(prev => ({
      ...prev,
      deals: prev.deals.map(d => d.id === dealId ? { ...d, notes } : d)
    }));
  };

  const handleAddDealNote = async (dealId: string, noteText: string) => {
    const tempId = `note_${Date.now()}`;
    const newNote = {
      id: tempId,
      dealId,
      agencyId: agency.id,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      author: user?.name || activeManager.name,
      text: noteText,
      createdAt: new Date().toISOString()
    };

    setAgency(prev => ({
      ...prev,
      deals: prev.deals.map(d => {
        if (d.id === dealId) {
          return {
            ...d,
            notesList: [newNote, ...(d.notesList || [])]
          };
        }
        return d;
      })
    }));

    try {
      const created = await api.addDealNote(dealId, noteText);
      setAgency(prev => ({
        ...prev,
        deals: prev.deals.map(d => {
          if (d.id === dealId) {
            return {
              ...d,
              notesList: (d.notesList || []).map(n => n.id === tempId ? created : n)
            };
          }
          return d;
        })
      }));
    } catch (err) {
      console.warn('Backend sync failed, saved locally:', err);
    }
  };

  const handleDeleteDealNote = async (dealId: string, noteId: string) => {
    setAgency(prev => ({
      ...prev,
      deals: prev.deals.map(d => {
        if (d.id === dealId) {
          return {
            ...d,
            notesList: (d.notesList || []).filter(n => n.id !== noteId)
          };
        }
        return d;
      })
    }));

    try {
      await api.deleteDealNote(dealId, noteId);
    } catch (err) {
      console.warn('Backend sync failed, deleted locally:', err);
    }
  };

  const handleAddActivityLog = (dealId: string, text: string, author: string) => {
    setAgency(prev => ({
      ...prev,
      deals: prev.deals.map(d => {
        if (d.id === dealId) {
          return {
            ...d,
            activityLog: [
              { id: `act_${Date.now()}`, date: new Date().toISOString().split('T')[0], author, text },
              ...d.activityLog
            ]
          };
        }
        return d;
      })
    }));
  };

  const handleDeleteDeal = async (dealId: string) => {
    setAgency(prev => ({
      ...prev,
      deals: prev.deals.filter(d => d.id !== dealId),
      deliverables: prev.deliverables.filter(del => del.dealId !== dealId)
    }));

    try {
      await api.deleteDeal(dealId);
    } catch (err) {
      console.warn('Backend sync failed, deleted locally:', err);
    }
  };

  const handleSaveDeliverable = async (newDelivData: Omit<Deliverable, 'id' | 'createdAt' | 'finalMetrics'>) => {
    const tempId = `deliv_${Date.now()}`;
    const deliverable: Deliverable = {
      ...newDelivData,
      id: tempId,
      finalMetrics: { views: 0, likes: 0, comments: 0, source: 'manual' },
      createdAt: new Date().toISOString()
    };

    setAgency(prev => ({
      ...prev,
      deliverables: [deliverable, ...prev.deliverables]
    }));

    try {
      const created = await api.createDeliverable(newDelivData);
      setAgency(prev => ({
        ...prev,
        deliverables: prev.deliverables.map(d => d.id === tempId ? created : d)
      }));
    } catch (err) {
      console.warn('Backend sync failed, saved locally:', err);
    }
  };

  const handleUpdateDeliverableStatus = async (deliverableId: string, status: DeliverableStatus) => {
    setAgency(prev => ({
      ...prev,
      deliverables: prev.deliverables.map(d => d.id === deliverableId ? { ...d, status } : d)
    }));

    try {
      await api.updateDeliverable(deliverableId, { status });
    } catch (err) {
      console.warn('Backend sync failed, updated locally:', err);
    }
  };

  const handleDeleteDeliverable = async (delivId: string) => {
    setAgency(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter(d => d.id !== delivId)
    }));

    try {
      await api.deleteDeliverable(delivId);
    } catch (err) {
      console.warn('Backend sync failed, deleted locally:', err);
    }
  };

  const handleUpdateDeliverableDetails = async (deliverableId: string, dueDate: string, targetLiveDate: string, liveUrl: string) => {
    setAgency(prev => ({
      ...prev,
      deliverables: prev.deliverables.map(d => d.id === deliverableId ? { ...d, dueDate, targetLiveDate, liveUrl } : d)
    }));

    try {
      await api.updateDeliverable(deliverableId, { dueDate, targetLiveDate, liveUrl });
    } catch (err) {
      console.warn('Backend sync failed, updated locally:', err);
    }
  };

  const handleUpdateDeliverableMetrics = async (deliverableId: string, views: number, likes: number, comments: number) => {
    const finalMetrics = {
      views,
      likes,
      comments,
      source: 'api' as const,
      lastFetchedAt: new Date().toISOString()
    };

    setAgency(prev => ({
      ...prev,
      deliverables: prev.deliverables.map(d => d.id === deliverableId ? { ...d, finalMetrics } : d)
    }));

    try {
      await api.updateDeliverable(deliverableId, { finalMetrics });
    } catch (err) {
      console.warn('Backend sync failed, updated locally:', err);
    }
  };

  const handleGenerateReport = async (dealId: string) => {
    const deal = agency.deals.find(d => d.id === dealId);
    if (!deal) return;
    const slug = `${deal.brandName.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const report: Report = {
      id: `rep_${Date.now()}`,
      agencyId: agency.id,
      publicSlug: slug,
      dealId,
      generatedAt: new Date().toISOString()
    };

    setAgency(prev => ({
      ...prev,
      reports: [report, ...prev.reports]
    }));

    try {
      await api.createReport(dealId);
    } catch (err) {
      console.warn('Backend sync failed, saved locally:', err);
    }

    setActivePublicReport({ report, deal });
  };

  if (activePublicReport) {
    return (
      <PublicReportView
        deal={activePublicReport.deal}
        creators={agency.creators}
        deliverables={agency.deliverables}
        report={activePublicReport.report}
        onBackToApp={() => setActivePublicReport(null)}
      />
    );
  }

  const getTabTitle = (): string => {
    switch (activeTab) {
      case 'dashboard': return 'Agency Executive Dashboard';
      case 'deals': return 'Brand Deals Kanban Pipeline';
      case 'calendar': return 'Unified Roster & Target Live Calendar';
      case 'analytics': return 'YouTube Channel Performance Analytics (24h, 7d, 30d)';
      case 'calculator': return 'Creator Rate Card & Package Proposal Calculator';
      case 'creators': return 'Creator Roster Directory';
      case 'revenue': return 'Revenue & Agency Commission Analytics';
      case 'reports': return 'Public Brand Reports';
      default: return 'CreatorOps';
    }
  };

  const currentAgencyName = authAgency?.name || agency.name;

  return (
    <div className="flex h-screen bg-bg text-ink overflow-hidden font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        agencyName={currentAgencyName}
        overdueCount={overdueCount}
        openAddCreatorModal={() => setIsAddCreatorModalOpen(true)}
        openAddDealModal={() => setIsAddDealModalOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={getTabTitle()}
          managers={agency.managers}
          activeManager={activeManager}
          setActiveManager={setActiveManager}
          openEmailDigestModal={() => setIsEmailDigestModalOpen(true)}
          openAuthModal={() => setIsAuthModalOpen(true)}
          openAccountSettingsModal={() => setIsAccountSettingsModalOpen(true)}
          overdueCount={overdueCount}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'dashboard' && (
            <DashboardWidgets
              agency={agency}
              onUpdateDeliverableStatus={handleUpdateDeliverableStatus}
              onUpdateDeliverableMetrics={handleUpdateDeliverableMetrics}
              onDeleteDeliverable={handleDeleteDeliverable}
              openAddDealModal={() => setIsAddDealModalOpen(true)}
              openAddCreatorModal={() => setIsAddCreatorModalOpen(true)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'deals' && (
            <KanbanBoard
              agency={agency}
              deals={agency.deals}
              creators={agency.creators}
              deliverables={agency.deliverables}
              onUpdateDealStage={handleUpdateDealStage}
              onUpdateDealNotes={handleUpdateDealNotes}
              onAddDealNote={handleAddDealNote}
              onDeleteDealNote={handleDeleteDealNote}
              onAddActivityLog={handleAddActivityLog}
              onDeleteDeal={handleDeleteDeal}
              onDeleteDeliverable={handleDeleteDeliverable}
              openAddDealModal={() => setIsAddDealModalOpen(true)}
              openAddDeliverableModal={(dealId) => {
                setPresetDealIdForDeliverable(dealId);
                setIsAddDeliverableModalOpen(true);
              }}
              onOpenScheduleModal={(dealId) => {
                setPresetDealIdForDeliverable(dealId);
                setIsAddDeliverableModalOpen(true);
              }}
              onOpenInvoiceModal={(cId, dId) => {
                setSelectedInvoiceCreatorId(cId);
                setSelectedInvoiceDealId(dId);
                setIsInvoiceModalOpen(true);
              }}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'calendar' && (
            <UnifiedCalendar
              agency={agency}
              deliverables={agency.deliverables}
              creators={agency.creators}
              deals={agency.deals}
              onUpdateDeliverableStatus={handleUpdateDeliverableStatus}
              onUpdateDeliverableDetails={handleUpdateDeliverableDetails}
              onUpdateDeliverableMetrics={handleUpdateDeliverableMetrics}
              onDeleteDeliverable={handleDeleteDeliverable}
              onOpenScheduleContentModal={(targetLiveDate) => {
                setPresetTargetLiveDate(targetLiveDate);
                setIsAddDeliverableModalOpen(true);
              }}
              onOpenScheduleModal={(presetDealId, presetDate) => {
                setPresetDealIdForDeliverable(presetDealId);
                setPresetTargetLiveDate(presetDate);
                setIsAddDeliverableModalOpen(true);
              }}
            />
          )}

          {activeTab === 'analytics' && (
            <ChannelAnalytics
              creators={agency.creators}
              youtubeApiKey={youtubeApiKey}
              onOpenApiKeyModal={() => setIsApiKeyModalOpen(true)}
            />
          )}

          {activeTab === 'calculator' && (
            <ProposalCalculator
              agency={agency}
              onSaveDealFromProposal={handleSaveDealFromProposal}
            />
          )}

          {activeTab === 'creators' && (
            <CreatorRoster
              agency={agency}
              onAddCreator={handleSaveCreator}
              onUpdateCreator={handleUpdateCreator}
              onDeleteCreator={handleDeleteCreator}
              onOpenInvoiceModal={(cId) => {
                setSelectedInvoiceCreatorId(cId);
                setSelectedInvoiceDealId(undefined);
                setIsInvoiceModalOpen(true);
              }}
              isAddModalOpen={isAddCreatorModalOpen}
              setIsAddModalOpen={setIsAddCreatorModalOpen}
            />
          )}

          {activeTab === 'revenue' && (
            <RevenueDashboard agency={agency} />
          )}

          {activeTab === 'reports' && (
            <ReportList
              agency={agency}
              onGenerateReport={(dealId) => handleGenerateReport(dealId)}
              onPreviewReport={(report: Report) => {
                const deal = agency.deals.find(d => d.id === report.dealId);
                if (deal) setActivePublicReport({ report, deal });
              }}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <AddCreatorModal
        agencyId={agency.id}
        isOpen={isAddCreatorModalOpen}
        onClose={() => setIsAddCreatorModalOpen(false)}
        onSaveCreator={handleSaveCreator}
      />

      <AddDealModal
        creators={agency.creators}
        isOpen={isAddDealModalOpen}
        onClose={() => setIsAddDealModalOpen(false)}
        onSaveDeal={handleSaveDeal}
      />

      <AddDeliverableModal
        deals={agency.deals}
        creators={agency.creators}
        presetDealId={presetDealIdForDeliverable}
        presetTargetLiveDate={presetTargetLiveDate}
        isOpen={isAddDeliverableModalOpen}
        onClose={() => {
          setIsAddDeliverableModalOpen(false);
          setPresetDealIdForDeliverable(undefined);
          setPresetTargetLiveDate(undefined);
        }}
        onSaveDeliverable={handleSaveDeliverable}
      />

      <YouTubeApiKeyModal
        apiKey={youtubeApiKey}
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        onSaveApiKey={handleSaveApiKey}
      />

      <EmailDigestModal
        overdueDeliverables={overdueDeliverables}
        creators={agency.creators}
        deals={agency.deals}
        isOpen={isEmailDigestModalOpen}
        onClose={() => setIsEmailDigestModalOpen(false)}
      />

      <CreatorInvoiceModal
        agency={agency}
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        initialCreatorId={selectedInvoiceCreatorId}
        initialDealId={selectedInvoiceDealId}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <AccountSettingsModal
        isOpen={isAccountSettingsModalOpen}
        onClose={() => setIsAccountSettingsModalOpen(false)}
      />
    </div>
  );
};
