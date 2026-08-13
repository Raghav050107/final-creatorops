import React from 'react';
import type { Agency, Deal, Report } from '../types/creatorops';
import { FileText, ExternalLink, Copy, Check, Plus } from 'lucide-react';
import { formatINR } from '../lib/format';

interface ReportListProps {
  agency: Agency;
  onGenerateReport: (dealId: string) => void;
  onPreviewReport: (report: Report) => void;
}

export const ReportList: React.FC<ReportListProps> = ({
  agency,
  onGenerateReport,
  onPreviewReport
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const completedDeals = agency.deals.filter(d => d.stage === 'Delivered' || d.stage === 'Paid');

  const getDeal = (dealId: string): Deal | undefined => {
    return agency.deals.find(d => d.id === dealId);
  };

  const copyReportLink = (slug: string, reportId: string) => {
    const url = `${window.location.origin}/report/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(reportId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-surface p-4 rounded-xl border border-border shadow-card flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-ink">Shareable Brand Campaign Reports ({agency.reports.length})</h3>
          <p className="text-xs text-ink-muted">Auto-generate clean public report links for brand clients upon campaign completion.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agency.reports.map((report) => {
          const deal = getDeal(report.dealId);
          const dealDeliverables = agency.deliverables.filter(d => d.dealId === report.dealId);
          const totalViews = dealDeliverables.reduce((sum, d) => sum + (d.finalMetrics.views || 0), 0);

          return (
            <div key={report.id} className="bg-surface p-5 rounded-xl border border-border shadow-card space-y-4 hover:shadow-modal transition-all">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-accent bg-indigo-50 px-2 py-0.5 rounded">
                    Public Report
                  </span>
                  <h4 className="text-sm font-bold text-ink mt-1.5">{deal?.brandName} Campaign</h4>
                  <p className="text-[11px] text-ink-muted mt-0.5">Slug: <span className="font-mono">{report.publicSlug}</span></p>
                </div>
                <FileText className="w-5 h-5 text-accent" />
              </div>

              <div className="bg-bg p-3 rounded-lg border border-border text-xs space-y-1">
                <div className="flex justify-between text-ink-muted">
                  <span>Deliverables:</span>
                  <span className="font-bold text-ink">{dealDeliverables.length} items</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Total Views:</span>
                  <span className="font-bold text-ink font-mono">{totalViews.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-ink-muted">
                  <span>Generated:</span>
                  <span className="text-[10px] font-mono">{new Date(report.generatedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1 border-t border-border">
                <button
                  onClick={() => onPreviewReport(report)}
                  className="flex-1 py-1.5 px-3 bg-white hover:bg-slate-50 border border-border text-ink text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => copyReportLink(report.publicSlug, report.id)}
                  className="flex-1 py-1.5 px-3 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors shadow-subtle"
                >
                  {copiedId === report.id ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedId === report.id ? 'Copied!' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-surface p-5 rounded-xl border border-border shadow-card space-y-4">
        <h3 className="text-xs font-bold text-ink uppercase tracking-wider">Generate Report for Completed Deals</h3>
        <div className="space-y-2">
          {completedDeals.map((deal) => {
            const hasReport = agency.reports.some(r => r.dealId === deal.id);
            return (
              <div key={deal.id} className="p-3 bg-bg border border-border rounded-lg flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-ink">{deal.brandName}</h4>
                  <p className="text-[11px] text-ink-muted mt-0.5">{formatINR(deal.value)} • Stage: {deal.stage}</p>
                </div>
                {hasReport ? (
                  <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Report Ready
                  </span>
                ) : (
                  <button
                    onClick={() => onGenerateReport(deal.id)}
                    className="px-3 py-1.5 bg-accent hover:bg-accent-hover text-white text-xs font-semibold rounded-lg shadow-subtle flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Generate Report</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
