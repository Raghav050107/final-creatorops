import React, { useState } from 'react';
import type { Agency, Creator, Deal, Deliverable, DeliverableStatus, CreatorRepresentationType } from '../types/creatorops';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  CheckCircle2, 
  ExternalLink,
  Download
} from 'lucide-react';
import { createGoogleCalendarEventUrl, downloadICSFile } from '../lib/googleCalendar';

interface UnifiedCalendarProps {
  agency?: Agency;
  deliverables?: Deliverable[];
  creators?: Creator[];
  deals?: Deal[];
  onUpdateDeliverableStatus: (deliverableId: string, status: DeliverableStatus) => void;
  onUpdateDeliverableDetails?: (deliverableId: string, dueDate: string, targetLiveDate: string, liveUrl: string) => void;
  onUpdateDeliverableMetrics?: (deliverableId: string, views: number, likes: number, comments: number) => void;
  onDeleteDeliverable?: (delivId: string) => void;
  onOpenScheduleContentModal?: (targetLiveDate?: string) => void;
  onOpenScheduleModal?: (presetDealIdOrDate?: string, presetTargetLiveDate?: string) => void;
}

export const UnifiedCalendar: React.FC<UnifiedCalendarProps> = ({
  agency,
  deliverables: deliverablesProp,
  creators: creatorsProp,
  deals: dealsProp,
  onUpdateDeliverableStatus,
  onOpenScheduleContentModal,
  onOpenScheduleModal
}) => {
  const deliverables = deliverablesProp || agency?.deliverables || [];
  const creators = creatorsProp || agency?.creators || [];
  const deals = dealsProp || agency?.deals || [];

  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 6, 1)); // Default to July 2026
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'sponsored' | 'organic'>('all');
  const [representationFilter, setRepresentationFilter] = useState<'all' | CreatorRepresentationType>('all');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  const filteredDeliverables = deliverables.filter(item => {
    if (selectedCreatorId !== 'all' && item.creatorId !== selectedCreatorId) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    
    if (representationFilter !== 'all') {
      const creator = creators.find(c => c.id === item.creatorId);
      if (creator?.representationType !== representationFilter) return false;
    }
    return true;
  });

  const getDeliverablesForDate = (dayNumber: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;
    return filteredDeliverables.filter(d => {
      const liveDate = d.targetLiveDate || d.dueDate;
      return liveDate === dateStr;
    });
  };

  const handleExportICS = () => {
    downloadICSFile(filteredDeliverables, creators, deals);
  };

  const handleScheduleClick = (targetLiveDate?: string) => {
    if (onOpenScheduleContentModal) {
      onOpenScheduleContentModal(targetLiveDate);
    } else if (onOpenScheduleModal) {
      onOpenScheduleModal(undefined, targetLiveDate);
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header Controls */}
      <div className="bg-surface p-4 rounded-xl border border-border shadow-card flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-bg p-1 rounded-lg border border-border">
            <button
              onClick={prevMonth}
              className="p-1 text-ink-muted hover:text-ink hover:bg-slate-200 rounded"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-ink px-2 min-w-[120px] text-center font-mono">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-1 text-ink-muted hover:text-ink hover:bg-slate-200 rounded"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={goToToday}
            className="py-1 px-2.5 text-xs font-semibold bg-bg hover:bg-slate-100 border border-border rounded-lg text-ink"
          >
            Today
          </button>
        </div>

        {/* Representation & Creator Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Representation Filter */}
          <div className="flex items-center gap-1 bg-bg p-1 rounded-lg border border-border">
            <button
              onClick={() => setRepresentationFilter('all')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                representationFilter === 'all' ? 'bg-white text-ink shadow-subtle' : 'text-ink-muted'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setRepresentationFilter('In-House Exclusive')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                representationFilter === 'In-House Exclusive' ? 'bg-accent text-white shadow-subtle' : 'text-ink-muted'
              }`}
            >
              🔒 In-House Exclusive
            </button>
            <button
              onClick={() => setRepresentationFilter('Non-Exclusive / Other')}
              className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                representationFilter === 'Non-Exclusive / Other' ? 'bg-slate-900 text-white shadow-subtle' : 'text-ink-muted'
              }`}
            >
              🌐 Non-Exclusive
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 bg-bg p-1 rounded-lg border border-border">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                categoryFilter === 'all' ? 'bg-white text-ink shadow-subtle' : 'text-ink-muted'
              }`}
            >
              All Content
            </button>
            <button
              onClick={() => setCategoryFilter('sponsored')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                categoryFilter === 'sponsored' ? 'bg-accent text-white shadow-subtle' : 'text-ink-muted'
              }`}
            >
              Sponsored
            </button>
            <button
              onClick={() => setCategoryFilter('organic')}
              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                categoryFilter === 'organic' ? 'bg-purple-600 text-white shadow-subtle' : 'text-ink-muted'
              }`}
            >
              Organic
            </button>
          </div>

          {/* Creator Dropdown */}
          <div className="flex items-center gap-1.5 bg-bg px-2.5 py-1.5 rounded-lg border border-border">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedCreatorId}
              onChange={(e) => setSelectedCreatorId(e.target.value)}
              className="bg-transparent text-ink text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all">All Creators ({creators.length})</option>
              {creators.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Export iCal Feed Button */}
          <button
            onClick={handleExportICS}
            title="Download .ics Calendar File for Google / Apple Calendar"
            className="py-1.5 px-3 bg-white hover:bg-slate-50 text-ink border border-border text-xs font-semibold rounded-lg shadow-subtle flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-accent" />
            <span>Export iCal (.ics)</span>
          </button>

          <button
            onClick={() => handleScheduleClick()}
            className="py-1.5 px-3.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg shadow-subtle flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule Content</span>
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-surface rounded-xl border border-border shadow-card overflow-hidden">
        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 border-b border-border bg-bg text-center text-xs font-bold text-ink-muted uppercase tracking-wider py-2.5">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Month Cells Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-border bg-border">
          {/* Empty Padding Cells for Previous Month */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`empty-${index}`} className="bg-bg/40 min-h-[120px] p-2" />
          ))}

          {/* Current Month Days */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNumber = index + 1;
            const deliverablesInDay = getDeliverablesForDate(dayNumber);
            const isToday = 
              dayNumber === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear();

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNumber).padStart(2, '0')}`;

            return (
              <div
                key={`day-${dayNumber}`}
                className={`bg-white min-h-[120px] p-2 flex flex-col justify-between transition-colors hover:bg-slate-50/80 group ${
                  isToday ? 'bg-indigo-50/30' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold font-mono ${
                    isToday
                      ? 'w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center shadow-subtle'
                      : 'text-ink-muted'
                  }`}>
                    {dayNumber}
                  </span>

                  <button
                    onClick={() => handleScheduleClick(dateStr)}
                    className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-accent rounded transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Scheduled Deliverable Items */}
                <div className="space-y-1.5 my-1.5 flex-1 overflow-y-auto max-h-[140px]">
                  {deliverablesInDay.map(deliv => {
                    const creator = creators.find(c => c.id === deliv.creatorId);
                    const deal = deals.find(d => d.id === deliv.dealId);
                    const isOrganic = deliv.category === 'organic';

                    const googleCalUrl = createGoogleCalendarEventUrl(
                      deliv,
                      creator,
                      deal
                    );

                    return (
                      <div
                        key={deliv.id}
                        className={`p-1.5 rounded-lg border text-[11px] space-y-1 shadow-subtle transition-all hover:scale-[1.02] ${
                          isOrganic
                            ? 'bg-purple-50/70 border-purple-200 text-purple-900'
                            : 'bg-white border-border text-ink'
                        }`}
                        style={{ borderLeftColor: creator?.colorCode, borderLeftWidth: '3px' }}
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="font-bold truncate leading-tight block">
                            {deliv.title}
                          </span>
                          <a
                            href={googleCalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Add to Google Calendar"
                            className="text-slate-400 hover:text-accent flex-shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-ink-muted">
                          <span className="font-medium text-slate-700">{creator?.name}</span>
                          <span className="font-mono uppercase text-[9px] px-1 bg-slate-100 rounded">
                            {deliv.platform}
                          </span>
                        </div>

                        {/* Status Switcher */}
                        <div className="pt-1 flex items-center justify-between border-t border-slate-100">
                          <select
                            value={deliv.status}
                            onChange={(e) => onUpdateDeliverableStatus(deliv.id, e.target.value as DeliverableStatus)}
                            className="text-[9px] font-bold bg-transparent border-none text-ink focus:outline-none cursor-pointer"
                          >
                            <option value="Not started">Not started</option>
                            <option value="Draft">Draft</option>
                            <option value="Submitted">Submitted</option>
                            <option value="Approved">Approved</option>
                            <option value="Live">Live</option>
                          </select>

                          {deliv.status === 'Live' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
