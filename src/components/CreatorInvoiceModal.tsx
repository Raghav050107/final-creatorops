import React, { useState, useEffect } from 'react';
import type { Agency } from '../types/creatorops';
import { X, Printer, Receipt, AlertCircle } from 'lucide-react';
import { formatINR } from '../lib/format';

interface CreatorInvoiceModalProps {
  agency: Agency;
  isOpen: boolean;
  onClose: () => void;
  initialCreatorId?: string;
  initialDealId?: string;
}

function numberToWordsINR(num: number): string {
  if (num <= 0) return 'Zero Rupees Only';
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + inWords(n % 10000000) : '');
  }

  return inWords(Math.round(num)) + ' Rupees Only';
}

export const CreatorInvoiceModal: React.FC<CreatorInvoiceModalProps> = ({
  agency,
  isOpen,
  onClose,
  initialCreatorId,
  initialDealId
}) => {
  const [selectedCreatorId, setSelectedCreatorId] = useState<string>(
    initialCreatorId || agency.creators[0]?.id || ''
  );
  
  const creatorDeals = agency.deals.filter(d => d.creatorIds.includes(selectedCreatorId));

  const [selectedDealId, setSelectedDealId] = useState<string>(
    initialDealId && creatorDeals.some(d => d.id === initialDealId)
      ? initialDealId
      : (creatorDeals[0]?.id || '')
  );

  const [invoiceNo, setInvoiceNo] = useState(`INV-${Date.now().toString().slice(-6)}`);
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Banking & Tax Details State (Fully Editable)
  const [pan, setPan] = useState('ABCDE1234F');
  const [accountHolder, setAccountHolder] = useState('');
  const [bankName, setBankName] = useState('HDFC Bank');
  const [bankBranch, setBankBranch] = useState('New Delhi Branch');
  const [accountNo, setAccountNo] = useState('50100234567890');
  const [ifscCode, setIfscCode] = useState('HDFC0001234');
  const [units, setUnits] = useState<number>(1);
  const [sgst, setSgst] = useState<number>(0);
  const [cgst, setCgst] = useState<number>(0);
  const [igst, setIgst] = useState<number>(0);

  useEffect(() => {
    if (initialCreatorId) {
      setSelectedCreatorId(initialCreatorId);
      const filtered = agency.deals.filter(d => d.creatorIds.includes(initialCreatorId));
      if (filtered.length > 0) {
        setSelectedDealId(initialDealId && filtered.some(d => d.id === initialDealId) ? initialDealId : filtered[0].id);
      } else {
        setSelectedDealId('');
      }
    }
  }, [initialCreatorId, initialDealId, agency.deals]);

  const creator = agency.creators.find(c => c.id === selectedCreatorId);
  const deal = agency.deals.find(d => d.id === selectedDealId);

  useEffect(() => {
    if (creator) {
      setAccountHolder(creator.name);
    }
  }, [creator]);

  if (!isOpen) return null;

  const grossDealValue = deal ? deal.value : 0;
  const commissionPct = deal ? deal.commissionPct : 15;
  const unseenCutPct = deal ? (deal.unseenHoursCutPct || 0) : 0;
  const totalCutPct = commissionPct + unseenCutPct;
  const agencyCutAmount = (grossDealValue * totalCutPct) / 100;
  const netRate = grossDealValue - agencyCutAmount;
  
  const baseAmount = netRate * (units || 1);
  const totalAmount = baseAmount + (sgst || 0) + (cgst || 0) + (igst || 0);
  const amountInWords = numberToWordsINR(totalAmount);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-surface rounded-xl border border-border shadow-modal max-w-3xl w-full overflow-hidden my-auto flex flex-col">
        {/* Modal Controls Bar */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50 print:hidden">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-accent" />
            <h3 className="text-sm font-bold text-ink">
              Official Tax Invoice — <span className="text-accent">{creator?.name}</span>
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              disabled={!deal}
              className="py-1.5 px-3.5 bg-accent hover:bg-accent-hover disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-subtle flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button onClick={onClose} className="p-1 text-slate-400 hover:text-ink rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Selection & Details Form Bar */}
        <div className="p-4 bg-bg border-b border-border space-y-3 text-xs print:hidden">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-ink-muted mb-1">
                Select Campaign Deal
              </label>
              {creatorDeals.length === 0 ? (
                <p className="text-xs text-warn font-semibold py-1 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>No active deal assigned</span>
                </p>
              ) : (
                <select
                  value={selectedDealId}
                  onChange={(e) => setSelectedDealId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-border rounded-lg text-xs font-semibold text-ink focus:outline-none focus:border-accent"
                >
                  {creatorDeals.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.brandName} ({formatINR(d.value)})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink-muted mb-1">Invoice Number</label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-border rounded-lg text-xs font-semibold text-ink focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-ink-muted mb-1">Invoice Date</label>
              <input
                type="date"
                value={invoiceDate}
                onChange={(e) => setInvoiceDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-white border border-border rounded-lg text-xs font-semibold text-ink focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-9 gap-2 pt-1 border-t border-border/60">
            <div>
              <label className="block text-[10px] font-bold text-ink-muted mb-0.5">PAN</label>
              <input
                type="text"
                value={pan}
                onChange={(e) => setPan(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-border rounded text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-ink-muted mb-0.5">Bank Name</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-border rounded text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-ink-muted mb-0.5">Bank Branch</label>
              <input
                type="text"
                value={bankBranch}
                onChange={(e) => setBankBranch(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-border rounded text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-ink-muted mb-0.5">Account No</label>
              <input
                type="text"
                value={accountNo}
                onChange={(e) => setAccountNo(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-border rounded text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-ink-muted mb-0.5">IFSC Code</label>
              <input
                type="text"
                value={ifscCode}
                onChange={(e) => setIfscCode(e.target.value)}
                className="w-full px-2 py-1 bg-white border border-border rounded text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-ink-muted mb-0.5">Posts</label>
              <input
                type="number"
                min="1"
                value={units}
                onChange={(e) => setUnits(Number(e.target.value) || 1)}
                className="w-full px-2 py-1 bg-white border border-border rounded text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-ink-muted mb-0.5">SGST (Rs)</label>
              <input
                type="number"
                value={sgst}
                onChange={(e) => setSgst(Number(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-white border border-border rounded text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-ink-muted mb-0.5">CGST (Rs)</label>
              <input
                type="number"
                value={cgst}
                onChange={(e) => setCgst(Number(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-white border border-border rounded text-[11px]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-ink-muted mb-0.5">IGST (Rs)</label>
              <input
                type="number"
                value={igst}
                onChange={(e) => setIgst(Number(e.target.value) || 0)}
                className="w-full px-2 py-1 bg-white border border-border rounded text-[11px]"
              />
            </div>
          </div>
        </div>

        {/* PRINTABLE INVOICE SHEET (MATCHING EXACT PDF FORMAT) */}
        {creatorDeals.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs space-y-2">
            <AlertCircle className="w-8 h-8 text-warn mx-auto" />
            <p className="font-bold text-slate-700 text-sm">{creator?.name} has no assigned brand deals yet.</p>
            <p className="text-slate-500">Assign {creator?.name} to a brand sponsorship deal in the Kanban board to generate an invoice.</p>
          </div>
        ) : (
          <div className="p-10 bg-white text-black space-y-6 font-serif id-printable-invoice select-text">
            
            {/* Centered Underlined Title */}
            <div className="text-center">
              <h1 className="text-2xl font-extrabold underline tracking-wide text-black">
                Invoice
              </h1>
            </div>

            {/* Header Information (Matching PDF Left Alignment & Exact Text) */}
            <div className="text-sm leading-relaxed space-y-0.5 font-sans">
              <p><strong className="font-bold">NAME:</strong> {creator?.name || 'Creator Name'}</p>
              <p><strong className="font-bold">Address:</strong> {creator?.handles?.youtube ? `Channel: ${creator.handles.youtube}` : 'New Delhi, India'}</p>
              <p><strong className="font-bold">Invoice Number:</strong> {invoiceNo}</p>
              <p><strong className="font-bold">Invoice Date:</strong> {invoiceDate}</p>
              <p className="mt-2"><strong className="font-bold">To :</strong></p>
              <p className="font-bold uppercase tracking-wider text-base text-black">UNSEEN HOURS</p>
              <p>Shop No. 5, First Floor</p>
              <p>NA-248, Old No NA-52, Vishnu Garden</p>
              <p>New Delhi Delhi 110018</p>
              <p>India</p>
              <p><strong className="font-bold">GSTIN-</strong> 07AAIFU9605R1ZA</p>
            </div>

            {/* Sub Title */}
            <div className="text-center pt-2 pb-1 font-sans">
              <h2 className="text-sm font-bold uppercase tracking-wider">
                INVOICE FOR SERVICES PROVIDED
              </h2>
            </div>

            {/* Main Table Matching PDF Exact Format & Border */}
            <div className="font-sans">
              <table className="w-full border-2 border-black text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-black font-bold text-black text-center">
                    <th className="p-3 border-r-2 border-black w-14">S.<br />No.</th>
                    <th className="p-3 border-r-2 border-black text-center">Service Description</th>
                    <th className="p-3 border-r-2 border-black w-24 text-center">Units/<br />Posts<br />(Nos.)</th>
                    <th className="p-3 border-r-2 border-black w-28 text-center">Rate<br />(Rs.)</th>
                    <th className="p-3 w-32 text-center">Amount<br />(Rs.)</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Line Item Row */}
                  <tr className="border-b-2 border-black min-h-[140px] align-top">
                    <td className="p-3 border-r-2 border-black text-center font-bold">1</td>
                    <td className="p-3 border-r-2 border-black">
                      <p className="font-bold text-sm text-black">
                        Influencer Marketing Services for {deal?.brandName} Campaign
                      </p>
                      <p className="text-xs text-slate-700 mt-1">
                        Creator Content Creation & Post Promotion ({creator?.name})
                      </p>
                    </td>
                    <td className="p-3 border-r-2 border-black text-center font-bold">{units}</td>
                    <td className="p-3 border-r-2 border-black text-right font-mono font-bold">
                      {netRate.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-mono font-bold">
                      {baseAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>

                  {/* SGST Row */}
                  <tr className="border-b border-black font-sans">
                    <td className="p-2 border-r-2 border-black"></td>
                    <td className="p-2 border-r-2 border-black font-bold text-right pr-4">SGST</td>
                    <td className="p-2 border-r-2 border-black"></td>
                    <td className="p-2 border-r-2 border-black text-center">{sgst}</td>
                    <td className="p-2 text-right font-mono">{sgst > 0 ? sgst.toLocaleString('en-IN') : '0'}</td>
                  </tr>

                  {/* CGST Row */}
                  <tr className="border-b border-black font-sans">
                    <td className="p-2 border-r-2 border-black"></td>
                    <td className="p-2 border-r-2 border-black font-bold text-right pr-4">CGST</td>
                    <td className="p-2 border-r-2 border-black"></td>
                    <td className="p-2 border-r-2 border-black text-center">{cgst}</td>
                    <td className="p-2 text-right font-mono">{cgst > 0 ? cgst.toLocaleString('en-IN') : '0'}</td>
                  </tr>

                  {/* IGST Row */}
                  <tr className="border-b-2 border-black font-sans">
                    <td className="p-2 border-r-2 border-black"></td>
                    <td className="p-2 border-r-2 border-black font-bold text-right pr-4">IGST</td>
                    <td className="p-2 border-r-2 border-black"></td>
                    <td className="p-2 border-r-2 border-black text-center">{igst}</td>
                    <td className="p-2 text-right font-mono">{igst > 0 ? igst.toLocaleString('en-IN') : '0'}</td>
                  </tr>

                  {/* Total & Amount in Words Row */}
                  <tr className="font-bold text-xs bg-slate-50">
                    <td className="p-3 border-r-2 border-black" colSpan={3}>
                      <span className="font-bold uppercase block text-[10px] text-slate-600">Amount (in words)</span>
                      <span className="font-bold text-black text-xs">{amountInWords}</span>
                    </td>
                    <td className="p-3 border-r-2 border-black text-center text-sm font-bold">
                      Total
                    </td>
                    <td className="p-3 text-right font-mono text-sm font-black text-black">
                      Rs {totalAmount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Service Provider & Banking Details Footer (Matching PDF Exact Layout) */}
            <div className="space-y-4 pt-4 text-xs leading-relaxed font-sans border-t border-slate-300">
              <div>
                <p className="font-bold text-sm underline">Service Provider Details:</p>
                <p><strong className="font-bold">PAN:</strong> {pan}</p>
              </div>

              <div>
                <p className="font-bold text-sm underline">Banking Details</p>
                <p><strong className="font-bold">Account Holder Name:</strong> {accountHolder || creator?.name}</p>
                <p><strong className="font-bold">Bank Name :</strong> {bankName}</p>
                <p><strong className="font-bold">Bank Branch :</strong> {bankBranch}</p>
                <p><strong className="font-bold">Account No.:</strong> {accountNo}</p>
                <p><strong className="font-bold">IFSC Code:</strong> {ifscCode}</p>
                <p className="pt-3"><strong className="font-bold">Signature:</strong></p>
                <p className="pt-2"><strong className="font-bold">To</strong></p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};
