import React, { useState, useEffect } from 'react';
import type { Agency, Creator, Deal, Deliverable, DealStage, DeliverableStatus, Manager } from './types/creatorops';
import { loadAgencyData, saveAgencyData } from './lib/store';
import { api } from './lib/api';
import { CloudSyncEngine } from './lib/cloudSync';
import { useAuth } from './context/AuthContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardWidgets } from './components/DashboardWidgets';
import { KanbanBoard } from './components/KanbanBoard';
import { UnifiedCalendar } from './components/UnifiedCalendar';
import { ProposalCalculator } from './components/ProposalCalculator';
import { CreatorRoster } from './components/CreatorRoster';
import { RevenueDashboard } from './components/RevenueDashboard';
import { 
  AddCreatorModal, 
  AddDealModal, 
  AddDeliverableModal, 
  EmailDigestModal 
} from './components/Modals';
import { CreatorInvoiceModal } from './components/CreatorInvoiceModal';
import { AuthModal } from './components/AuthModal';
import { AuthPage } from './components/AuthPage';
import { AccountSettingsModal } from './components/AccountSettingsModal';
import { SyncModal } from './components/SyncModal';

export const App: React.FC = () => {
  const { user, agency: authAgency, isLoading } = useAuth();

  const [agency, setAgency] = useState<Agency>(() => loadAgencyData());
  const [activeTab, setActiveTab] = useState<any>('deals');
  const [activeManager, setActiveManager] = useState<Manager>(() => agency.managers[0] || {
    id: 'mgr_jordan',
    agencyId: 'agency_unseen_hours_1',
    name: 'Jordan Miller',
    email: 'admin@unseenhours.com',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    role: 'Agency Owner / Talent Director'
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile Drawer State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modal States
  const [isAddCreatorModalOpen, setIsAddCreatorModalOpen] = useState(false);
  const [isAddDealModalOpen, setIsAddDealModalOpen] = useState(false);
  const [isAddDeliverableModalOpen, setIsAddDeliverableModalOpen] = useState(false);
  const [isEmailDigestModalOpen, setIsEmailDigestModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAccountSettingsModalOpen, setIsAccountSettingsModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [selectedInvoiceCreatorId, setSelectedInvoiceCreatorId] = useState<string>('');
  const [selectedInvoiceDealId, setSelectedInvoiceDealId] = useState<string | undefined>();

  // Sync with Backend or Cloud Vault on mount or when user changes
  const fetchLiveWorkspace = async () => {
    if (!user) return;
    try {
      // 1. Try Backend API first
      const liveData = await api.getAgencyWorkspace();
      if (liveData && liveData.deals) {
        setAgency(liveData);
        if (liveData.managers && liveData.managers.length > 0) {
          setActiveManager(liveData.managers[0]);
        }
        return;
      }
    } catch (err) {
      console.warn('Backend server offline, checking Cloud Vault sync:', err);
    }

    // 2. Try Cross-Device Cloud Sync Engine
    try {
      const vaultId = await CloudSyncEngine.findVaultForAccount(user.email);
      if (vaultId) {
        const cloudData = await CloudSyncEngine.pullWorkspace(vaultId);
        if (cloudData && cloudData.agency) {
          setAgency(cloudData.agency);
          if (cloudData.agency.managers && cloudData.agency.managers.length > 0) {
            setActiveManager(cloudData.agency.managers[0]);
          }
        }
      }
    } catch (err) {
      console.warn('Cloud vault sync check error:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLiveWorkspace();
    }
  }, [authAgency?.id, user]);

  // Auto-save state updates to localStorage & Cloud Vault
  useEffect(() => {
    if (user) {
      saveAgencyData(agency);
      CloudSyncEngine.pushWorkspace(user.email, user, agency);
    }
  }, [agency, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-6 font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold tracking-wider uppercase text-slate-300">Loading CreatorOps Workspace...</span>
        </div>
      </div>
    );
  }

  // REQUIRE AUTHENTICATION! SHOW LOGIN PAGE IF NOT LOGGED IN
  if (!user) {
    return <AuthPage />;
  }

  const overdueDeliverables = agency.deliverables.filter(d => {
    if (d.status === 'Live') return false;
    const targetDate = new Date(d.targetLiveDate || d.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return targetDate < today;
  });

  const overdueCount = overdueDeliverables.length;

  const handleSaveCreator = async (newCreatorData: Omit<Creator, 'id' | 'createdAt'>) => {
    const tempId = `c_${Date.now()}`;
    const creator: Creator = {
      ...newCreatorData,
      id: tempId,
      createdAt: new Date().toISOString()
    };

    setAgency(prev => ({
      ...prev,
      creators: [creator, ...prev.creators]
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
      }))
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
      notesList: [],
      activityLog: [
        {
          id: `act_${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          author: user.name,
          text: `Brand deal for ${newDealData.brandName} added by ${user.name}.`
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

  const handleUpdateDealStage = async (dealId: string, stage: DealStage) => {
    setAgency(prev => ({
      ...prev,
      deals: prev.deals.map(d => {
        if (d.id === dealId) {
          return {
            ...d,
            stage,
            activityLog: [
              {
                id: `act_${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                author: user.name,
                text: `Pipeline stage moved to "${stage}".`
              },
              ...d.activityLog
            ]
          };
        }
        return d;
      })
    }));

    try {
      await api.updateDeal(dealId, { stage });
    } catch (err) {
      console.warn('Backend sync failed, updated locally:', err);
    }
  };

  const handleAddDealNote = async (dealId: string, noteText: string) => {
    const tempId = `note_${Date.now()}`;
    const newNote = {
      id: tempId,
      dealId,
      author: user.name,
      text: noteText,
      date: new Date().toISOString().split('T')[0],
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

  const getTabTitle = (): string => {
    switch (activeTab) {
      case 'dashboard': return 'Agency Executive Dashboard';
      case 'deals': return 'Brand Deals Kanban Pipeline';
      case 'calendar': return 'Unified Roster & Target Live Calendar';
      case 'calculator': return 'Creator Rate Card & Package Proposal Calculator';
      case 'creators': return 'Creator Roster Directory';
      case 'revenue': return 'Revenue & Agency Commission Analytics';
      default: return 'CreatorOps';
    }
  };

  const currentAgencyName = authAgency?.name || agency.name;

  return (
    <div className="flex h-screen bg-bg text-ink overflow-hidden font-sans">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        overdueCount={overdueCount}
        agencyName={currentAgencyName}
        openAddCreatorModal={() => setIsAddCreatorModalOpen(true)}
        openAddDealModal={() => setIsAddDealModalOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          title={getTabTitle()}
          managers={agency.managers}
          activeManager={activeManager}
          setActiveManager={setActiveManager}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          openAuthModal={() => setIsAuthModalOpen(true)}
          openAccountSettingsModal={() => setIsAccountSettingsModalOpen(true)}
          openMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          openEmailDigestModal={() => setIsEmailDigestModalOpen(true)}
          openSyncModal={() => setIsSyncModalOpen(true)}
          overdueCount={overdueCount}
        />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
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
              searchQuery={searchQuery}
              onUpdateDealStage={handleUpdateDealStage}
              onAddDealNote={handleAddDealNote}
              onDeleteDealNote={handleDeleteDealNote}
              onAddActivityLog={handleAddActivityLog}
              onDeleteDeal={handleDeleteDeal}
              openAddDealModal={() => setIsAddDealModalOpen(true)}
              onOpenInvoiceModal={(creatorId: string, dealId?: string) => {
                setSelectedInvoiceCreatorId(creatorId);
                setSelectedInvoiceDealId(dealId);
                setIsInvoiceModalOpen(true);
              }}
            />
          )}

          {activeTab === 'calendar' && (
            <UnifiedCalendar
              agency={agency}
              onUpdateDeliverableStatus={handleUpdateDeliverableStatus}
              onUpdateDeliverableDetails={handleUpdateDeliverableDetails}
              onUpdateDeliverableMetrics={handleUpdateDeliverableMetrics}
              onDeleteDeliverable={handleDeleteDeliverable}
              onOpenScheduleModal={() => setIsAddDeliverableModalOpen(true)}
            />
          )}

          {activeTab === 'calculator' && (
            <ProposalCalculator
              agency={agency}
              onSaveDealFromProposal={(data) => handleSaveDeal({
                agencyId: agency.id,
                brandName: data.brandName,
                brandContact: 'partnerships@brand.com',
                value: data.value,
                currency: 'INR',
                commissionPct: data.commissionPct,
                unseenHoursCutPct: data.commissionPct,
                stage: 'Inbound',
                creatorIds: data.creatorIds,
                targetLiveDate: data.targetLiveDate
              })}
            />
          )}

          {activeTab === 'creators' && (
            <CreatorRoster
              agency={agency}
              onAddCreator={handleSaveCreator}
              onUpdateCreator={handleUpdateCreator}
              onDeleteCreator={handleDeleteCreator}
              onOpenInvoiceModal={(creatorId) => {
                setSelectedInvoiceCreatorId(creatorId);
                setSelectedInvoiceDealId(undefined);
                setIsInvoiceModalOpen(true);
              }}
              isAddModalOpen={isAddCreatorModalOpen}
              setIsAddModalOpen={setIsAddCreatorModalOpen}
            />
          )}

          {activeTab === 'revenue' && (
            <RevenueDashboard
              agency={agency}
            />
          )}
        </main>
      </div>

      {/* ALL SYSTEM MODALS */}
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
        isOpen={isAddDeliverableModalOpen}
        onClose={() => setIsAddDeliverableModalOpen(false)}
        onSaveDeliverable={handleSaveDeliverable}
      />

      <EmailDigestModal
        overdueDeliverables={overdueDeliverables}
        creators={agency.creators}
        deals={agency.deals}
        isOpen={isEmailDigestModalOpen}
        onClose={() => setIsEmailDigestModalOpen(false)}
      />

      <CreatorInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
        agency={agency}
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
        managers={agency.managers}
        onRefreshWorkspace={fetchLiveWorkspace}
      />

      <SyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        onRefreshWorkspace={fetchLiveWorkspace}
      />
    </div>
  );
};
