import React, { useState } from 'react';
import type { Agency, Creator, Deal, Deliverable, DealStage, CreatorRepresentationType, DealNote } from '../types/creatorops';
import { 
  Plus, 
  Trash2, 
  Search,
  Filter,
  Receipt,
  StickyNote,
  Check,
  CalendarPlus,
  X,
  MessageSquare,
  Clock,
  User
} from 'lucide-react';
import { formatINR } from '../lib/format';

interface KanbanBoardProps {
  agency?: Agency;
  deals?: Deal[];
  creators?: Creator[];
  deliverables?: Deliverable[];
  onUpdateDealStage: (dealId: string, newStage: DealStage) => void;
  onUpdateDealNotes?: (dealId: string, notes: string) => void;
  onAddDealNote?: (dealId: string, noteText: string) => void;
  onDeleteDealNote?: (dealId: string, noteId: string) => void;
  onAddActivityLog?: (dealId: string, text: string, author: string) => void;
  onDeleteDeal: (dealId: string) => void;
  onDeleteDeliverable?: (delivId: string) => void;
  onOpenScheduleModal?: (dealId?: string) => void;
  onOpenInvoiceModal?: (creatorId: string, dealId?: string) => void;
  openAddDealModal?: () => void;
  openAddDeliverableModal?: (dealId: string) => void;
  setIsAddDealModalOpen?: (open: boolean) => void;
  searchQuery?: string;
}

const STAGES: DealStage[] = [
  'Inbound',
  'Negotiating',
  'Signed',
  'In Progress',
  'Delivered',
  'Paid'
];

const STAGE_COLORS: Record<DealStage, { bg: string; border: string; badge: string }> = {
  'Inbound': { bg: 'bg-slate-50', border: 'border-slate-200', badge: 'bg-slate-200 text-slate-800' },
  'Negotiating': { bg: 'bg-amber-50/50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-900' },
  'Signed': { bg: 'bg-blue-50/50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-900' },
  'In Progress': { bg: 'bg-indigo-50/50', border: 'border-indigo-200', badge: 'bg-indigo-100 text-accent' },
  'Delivered': { bg: 'bg-purple-50/50', border: 'border-purple-200', badge: 'bg-purple-100 text-purple-900' },
  'Paid': { bg: 'bg-emerald-50/50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-900' },
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  agency,
  deals: dealsProp,
  creators: creatorsProp,
  deliverables: deliverablesProp,
  onUpdateDealStage,
  onAddDealNote,
  onDeleteDealNote,
  onDeleteDeal,
  onOpenScheduleModal,
  onOpenInvoiceModal,
  openAddDealModal,
  openAddDeliverableModal,
  setIsAddDealModalOpen,
  searchQuery
}) => {
  const deals = dealsProp || agency?.deals || [];
  const creators = creatorsProp || agency?.creators || [];
  const deliverables = deliverablesProp || agency?.deliverables || [];

  const [searchTerm, setSearchTerm] = useState(searchQuery || '');
  const [selectedCreatorFilter, setSelectedCreatorFilter] = useState<string>('all');
  const [representationFilter, setRepresentationFilter] = useState<'all' | CreatorRepresentationType>('all');

  // Track ID of deal currently open in Notes Modal
  const [activeNotesModalDealId, setActiveNotesModalDealId] = useState<string | null>(null);
  const [newNoteInput, setNewNoteInput] = useState<string>('');

  // Dynamically derive active deal object from latest deals prop array
  const activeNotesModalDeal = deals.find(d => d.id === activeNotesModalDealId) || null;

  // Helper to get note entries array (including legacy string note if present)
  const getNoteEntries = (deal: Deal): DealNote[] => {
    const entries: DealNote[] = deal.notesList ? [...deal.notesList] : [];
    if (deal.notes && deal.notes.trim() !== '') {
      const alreadyPresent = entries.some(e => e.text.trim() === deal.notes?.trim());
      if (!alreadyPresent) {
        entries.push({
          id: `legacy_${deal.id}`,
          date: 'Previous Note',
          author: 'Agency Manager',
          text: deal.notes
        });
      }
    }
    return entries;
  };

  const getNotesCount = (deal: Deal): number => {
    return getNoteEntries(deal).length;
  };

  const filteredDeals = deals.filter(deal => {
    const noteEntries = getNoteEntries(deal);
    const matchesSearch = deal.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          deal.brandContact.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          noteEntries.some(n => n.text.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCreator = selectedCreatorFilter === 'all' || deal.creatorIds.includes(selectedCreatorFilter);

    let matchesRepresentation = true;
    if (representationFilter !== 'all') {
      matchesRepresentation = deal.creatorIds.some(cId => {
        const creator = creators.find(c => c.id === cId);
        return creator?.representationType === representationFilter;
      });
    }

    return matchesSearch && matchesCreator && matchesRepresentation;
  });

  const getDealsForStage = (stage: DealStage) => {
    return filteredDeals.filter(d => d.stage === stage);
  };

  const getStageTotalValue = (stage: DealStage) => {
    return getDealsForStage(stage).reduce((sum, d) => sum + d.value, 0);
  };

  const handleOpenAddDeal = () => {
    if (openAddDealModal) openAddDealModal();
    else if (setIsAddDealModalOpen) setIsAddDealModalOpen(true);
  };

  const handleOpenAddDeliverable = (dealId: string) => {
    if (openAddDeliverableModal) openAddDeliverableModal(dealId);
    else if (onOpenScheduleModal) onOpenScheduleModal(dealId);
  };

  const handleOpenNotesModal = (deal: Deal) => {
    setActiveNotesModalDealId(deal.id);
    setNewNoteInput('');
  };

  const handleAddNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNotesModalDealId || !newNoteInput.trim()) return;

    const trimmedText = newNoteInput.trim();
    const dealId = activeNotesModalDealId;

    if (onAddDealNote) {
      onAddDealNote(dealId, trimmedText);
    } else {
      // Local fallback mutation
      const targetDeal = deals.find(d => d.id === dealId);
      if (targetDeal) {
        if (!targetDeal.notesList) targetDeal.notesList = [];
        targetDeal.notesList.unshift({
          id: `note_${Date.now()}`,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
          author: 'Agency Manager',
          text: trimmedText
        });
      }
    }

    setNewNoteInput('');
  };

  const handleDeleteNoteEntry = (dealId: string, noteId: string) => {
    if (onDeleteDealNote) {
      onDeleteDealNote(dealId, noteId);
    } else {
      const targetDeal = deals.find(d => d.id === dealId);
      if (targetDeal && targetDeal.notesList) {
        targetDeal.notesList = targetDeal.notesList.filter(n => n.id !== noteId);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls Header */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-card flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap flex-1 min-w-0">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search brand deals, contacts, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-bg text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent"
            />
          </div>

          {/* Representation Filter */}
          <div className="flex items-center gap-1 bg-bg p-1 rounded-lg border border-border">
            <button
              onClick={() => setRepresentationFilter('all')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                representationFilter === 'all' ? 'bg-white text-ink shadow-subtle' : 'text-ink-muted'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setRepresentationFilter('In-House Exclusive')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                representationFilter === 'In-House Exclusive' ? 'bg-accent text-white shadow-subtle' : 'text-ink-muted'
              }`}
            >
              🔒 Exclusive
            </button>
            <button
              onClick={() => setRepresentationFilter('Non-Exclusive / Other')}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-colors ${
                representationFilter === 'Non-Exclusive / Other' ? 'bg-slate-900 text-white shadow-subtle' : 'text-ink-muted'
              }`}
            >
              🌐 Others
            </button>
          </div>

          {/* Creator Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-bg px-3 py-1.5 rounded-lg border border-border">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedCreatorFilter}
              onChange={(e) => setSelectedCreatorFilter(e.target.value)}
              className="bg-transparent text-ink text-xs font-semibold focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="all">All Roster Creators</option>
              {creators.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleOpenAddDeal}
          className="py-2 px-4 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg shadow-subtle flex items-center gap-1.5 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Brand Deal</span>
        </button>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 min-w-0">
        {STAGES.map((stage) => {
          const dealsInStage = getDealsForStage(stage);
          const stageTotal = getStageTotalValue(stage);
          const colors = STAGE_COLORS[stage];

          return (
            <div
              key={stage}
              className={`rounded-xl border ${colors.border} ${colors.bg} p-3.5 flex flex-col h-[calc(100vh-220px)] shadow-card min-w-0 overflow-hidden`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60 min-w-0">
                <div className="flex items-center gap-2 min-w-0 truncate">
                  <h4 className="text-xs font-extrabold text-ink uppercase tracking-wider truncate">{stage}</h4>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${colors.badge}`}>
                    {dealsInStage.length}
                  </span>
                </div>
                <span className="text-xs font-bold text-ink font-mono tabular-nums flex-shrink-0 ml-1">
                  {formatINR(stageTotal)}
                </span>
              </div>

              {/* Deal Cards Container */}
              <div className="flex-1 space-y-3.5 overflow-y-auto pr-1 min-w-0">
                {dealsInStage.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-border/60 rounded-lg text-slate-400 text-xs">
                    No deals in {stage}
                  </div>
                ) : (
                  dealsInStage.map((deal) => {
                    const attachedCreators = deal.creatorIds
                      .map(id => creators.find(c => c.id === id))
                      .filter(Boolean);

                    const dealDeliverables = deliverables.filter(d => d.dealId === deal.id);
                    const notesCount = getNotesCount(deal);

                    return (
                      <div
                        key={deal.id}
                        className="bg-white p-4 rounded-xl border border-border shadow-subtle hover:shadow-modal transition-all space-y-3 group min-w-0"
                      >
                        {/* Brand Name & Commercial Value Header */}
                        <div className="flex items-start justify-between gap-2 min-w-0">
                          <div className="min-w-0 flex-1">
                            <h5 className="text-sm font-bold text-ink group-hover:text-accent transition-colors truncate">
                              {deal.brandName}
                            </h5>
                            <p className="text-[11px] text-ink-muted truncate mt-0.5">
                              {deal.brandContact}
                            </p>
                          </div>
                          <span className="text-xs font-extrabold text-ink font-mono tabular-nums bg-bg px-2 py-1 rounded-md border border-border flex-shrink-0">
                            {formatINR(deal.value)}
                          </span>
                        </div>

                        {/* Roster Creators & Commission Cut */}
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100 min-w-0">
                          <div className="flex items-center -space-x-1.5 min-w-0 overflow-hidden">
                            {attachedCreators.map((c) => (
                              <img
                                key={c?.id}
                                src={c?.photoUrl}
                                alt={c?.name}
                                title={`${c?.name} (${c?.representationType || 'In-House Exclusive'})`}
                                className="w-6 h-6 rounded-full border-2 border-white object-cover flex-shrink-0 shadow-subtle"
                                style={{ borderColor: c?.colorCode }}
                              />
                            ))}
                          </div>

                          <span className="text-[10px] text-slate-400 font-mono font-bold flex-shrink-0">
                            {deal.commissionPct}% Cut
                          </span>
                        </div>

                        {/* PLUS SIGN (+) TO ADD DELIVERABLE TO CALENDAR */}
                        <button
                          onClick={() => handleOpenAddDeliverable(deal.id)}
                          className="w-full py-1.5 px-2 bg-indigo-50 hover:bg-accent hover:text-white text-accent text-[11px] font-bold rounded-lg border border-indigo-200 transition-colors flex items-center justify-center gap-1.5 shadow-subtle"
                          title="Click to add a scheduled deliverable for this deal on the calendar"
                        >
                          <CalendarPlus className="w-3.5 h-3.5" />
                          <span>+ Add Deliverable ({dealDeliverables.length})</span>
                        </button>

                        {/* Stage Selector & Action Bar (Notes hidden from face until clicked) */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1.5 min-w-0">
                          <select
                            value={deal.stage}
                            onChange={(e) => onUpdateDealStage(deal.id, e.target.value as DealStage)}
                            className="text-[10px] font-semibold bg-bg border border-border rounded-md px-1.5 py-1 text-ink focus:outline-none focus:border-accent min-w-0 flex-1 max-w-[100px] truncate"
                          >
                            {STAGES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1 flex-shrink-0">
                            {/* DEAL NOTES BUTTON WITH BADGE */}
                            <button
                              onClick={() => handleOpenNotesModal(deal)}
                              title={notesCount > 0 ? `View ${notesCount} deal notes` : "Add deal notes"}
                              className={`relative p-1.5 rounded transition-colors ${
                                notesCount > 0
                                  ? 'text-amber-700 bg-amber-50 hover:bg-amber-100'
                                  : 'text-slate-400 hover:text-amber-700 hover:bg-amber-50'
                              }`}
                            >
                              <StickyNote className="w-4 h-4" />
                              {notesCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-600 text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-subtle">
                                  {notesCount}
                                </span>
                              )}
                            </button>

                            {/* PAYOUT INVOICE BUTTON */}
                            {attachedCreators[0] && onOpenInvoiceModal && (
                              <button
                                onClick={() => onOpenInvoiceModal(attachedCreators[0]!.id, deal.id)}
                                title="Generate Creator Payout Invoice"
                                className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded transition-colors"
                              >
                                <Receipt className="w-4 h-4" />
                              </button>
                            )}

                            {/* DELETE DEAL BUTTON */}
                            <button
                              onClick={() => {
                                if (confirm(`Delete deal with ${deal.brandName}?`)) onDeleteDeal(deal.id);
                              }}
                              title="Delete Deal"
                              className="p-1.5 text-slate-300 hover:text-warn hover:bg-warn-bg rounded transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DEDICATED DEAL NOTES POPUP MODAL */}
      {activeNotesModalDeal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-border flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in duration-150">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-border bg-amber-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                  <StickyNote className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">
                    Notes for {activeNotesModalDeal.brandName}
                  </h3>
                  <p className="text-xs text-ink-muted">
                    Commercial Value: <span className="font-bold text-ink font-mono">{formatINR(activeNotesModalDeal.value)}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveNotesModalDealId(null)}
                className="p-1.5 text-slate-400 hover:text-ink hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content Scroll Area */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1">
              {/* Add New Note Entry Box */}
              <form onSubmit={handleAddNoteSubmit} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Plus className="w-3.5 h-3.5 text-accent" />
                  <span>Add New Note Entry</span>
                </label>
                <textarea
                  rows={3}
                  value={newNoteInput}
                  onChange={(e) => setNewNoteInput(e.target.value)}
                  placeholder="Type notes regarding deliverables, brand guidelines, promo codes, or negotiations..."
                  className="w-full p-2.5 bg-white text-ink text-xs rounded-lg border border-border focus:outline-none focus:border-accent"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!newNoteInput.trim()}
                    className="py-1.5 px-3.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-subtle flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save Note Entry</span>
                  </button>
                </div>
              </form>

              {/* Separated Individual Note Entry Boxes */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span>Saved Note Entries ({getNotesCount(activeNotesModalDeal)})</span>
                </h4>

                {getNoteEntries(activeNotesModalDeal).length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                    <MessageSquare className="w-6 h-6 mx-auto mb-1.5 text-slate-300" />
                    No note entries saved for this deal yet. Add your first note above!
                  </div>
                ) : (
                  getNoteEntries(activeNotesModalDeal).map((note) => (
                    <div
                      key={note.id}
                      className="bg-amber-50/80 p-3.5 rounded-xl border border-amber-200/80 shadow-subtle space-y-2 group/entry transition-all hover:bg-amber-50"
                    >
                      {/* Note Header */}
                      <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                          <User className="w-3.5 h-3.5 text-amber-700" />
                          <span>{note.author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-amber-800/80 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-600" />
                            {note.date}
                          </span>
                          {!note.id.startsWith('legacy') && (
                            <button
                              type="button"
                              onClick={() => handleDeleteNoteEntry(activeNotesModalDeal.id, note.id)}
                              className="opacity-0 group-hover/entry:opacity-100 p-1 text-amber-700 hover:text-warn rounded transition-opacity"
                              title="Delete note entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Note Content Text */}
                      <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                        {note.text}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 bg-slate-50 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setActiveNotesModalDealId(null)}
                className="py-1.5 px-4 bg-white border border-border text-ink hover:bg-slate-100 text-xs font-bold rounded-lg transition-colors"
              >
                Close Notes
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
