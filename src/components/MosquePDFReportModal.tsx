import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  X, 
  CheckCircle2, 
  Landmark, 
  Calendar, 
  DollarSign, 
  Award, 
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  ShieldCheck,
  Building2
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AppStateData, Language } from '../types/mosque';
import { toBengaliNumerals } from '../utils/prayerCalculator';

interface MosquePDFReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppStateData;
  language: Language;
  selectedMonthStr: string; // e.g. "2026-10"
  onMonthChange: (month: string) => void;
}

export const MosquePDFReportModal: React.FC<MosquePDFReportModalProps> = ({
  isOpen,
  onClose,
  appState,
  language,
  selectedMonthStr,
  onMonthChange
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [reportTitleNote, setReportTitleNote] = useState('মাসিক আয়-ব্যয়ের হিসাব বিবরণী');
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  // Currency Formatter
  const f = (n: number) => `৳ ${(Number(n) || 0).toLocaleString('bn-BD')}`;

  // Month Bengali Name Helper
  const getMonthNameBn = (ym: string) => {
    if (!ym) return '';
    const [year, month] = ym.split('-');
    const monthNames = [
      'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
      'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
    ];
    const mIdx = parseInt(month, 10) - 1;
    const mBn = monthNames[mIdx] || month;
    const yBn = toBengaliNumerals(year);
    return `${mBn} ${yBn}`;
  };

  // Monthly Transactions Filter
  const monthTxs = appState.tx.filter((t) => t.date.startsWith(selectedMonthStr));
  const monthIncomeTxs = monthTxs.filter((t) => t.type === 'in');
  const monthExpenseTxs = monthTxs.filter((t) => t.type === 'out');

  const totalMonthIncome = monthIncomeTxs.reduce((sum, t) => sum + Number(t.amt), 0);
  const totalMonthExpense = monthExpenseTxs.reduce((sum, t) => sum + Number(t.amt), 0);
  const netMonthlySurplus = totalMonthIncome - totalMonthExpense;

  // Category Summaries
  const incomeCategoryTotals: Record<string, number> = {};
  monthIncomeTxs.forEach((t) => {
    incomeCategoryTotals[t.cat] = (incomeCategoryTotals[t.cat] || 0) + Number(t.amt);
  });

  const expenseCategoryTotals: Record<string, number> = {};
  monthExpenseTxs.forEach((t) => {
    expenseCategoryTotals[t.cat] = (expenseCategoryTotals[t.cat] || 0) + Number(t.amt);
  });

  // Maktab Student Fee & Dues Summary for PDF Report
  const maktabStudents = appState.maktabStudents || [];
  const maktabPayments = appState.maktabPayments || [];
  const activeStudents = maktabStudents.filter((s) => s.status === 'active');
  const maktabMonthPaid = maktabPayments
    .filter((p) => p.month === selectedMonthStr)
    .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const maktabMonthDemand = activeStudents.reduce((sum, s) => sum + (Number(s.monthlyFee) || 0), 0);
  const maktabMonthDues = activeStudents.reduce((sum, st) => {
    const paid = maktabPayments
      .filter((p) => p.studentId === st.id && p.month === selectedMonthStr)
      .reduce((s, p) => s + (Number(p.amount) || 0) + (Number(p.waiverDiscount) || 0), 0);
    return sum + Math.max(0, st.monthlyFee - paid);
  }, 0);
  const maktabDueStudentsCount = activeStudents.filter((st) => {
    const paid = maktabPayments
      .filter((p) => p.studentId === st.id && p.month === selectedMonthStr)
      .reduce((s, p) => s + (Number(p.amount) || 0) + (Number(p.waiverDiscount) || 0), 0);
    return paid < st.monthlyFee;
  }).length;

  // Calculate Overall Balances
  let bankBal = Number(appState.ob) || 0;
  let cashBal = Number(appState.oc) || 0;

  appState.tx.forEach((t) => {
    const a = Number(t.amt) || 0;
    if (t.type === 'in') {
      if (t.acc === 'bank') bankBal += a;
      else cashBal += a;
    } else if (t.type === 'out') {
      if (t.acc === 'bank') bankBal -= a;
      else cashBal -= a;
    } else if (t.type === 'xfer') {
      if (t.acc === 'bank') {
        bankBal -= a;
        cashBal += a;
      } else {
        cashBal -= a;
        bankBal += a;
      }
    }
  });

  const totalBalance = bankBal + cashBal;

  // Generate PDF Handler
  const handleDownloadPDF = async () => {
    if (!printAreaRef.current) return;
    setIsGenerating(true);

    try {
      const element = printAreaRef.current;
      const canvas = await html2canvas(element, {
        scale: 2, // High resolution capturing
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      const fileName = `Mosque_Report_${appState.name || 'Accounts'}_${selectedMonthStr}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('পিডিএফ তৈরিতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsGenerating(false);
    }
  };

  // Native Print Handler
  const handleDirectPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Modal Header Controls */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>পিডিএফ হিসাব রিপোর্ট ডাউনলোড</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                  অফিসিয়াল প্রতিবেদন
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                মসজিদ পরিচালনা কমিটির অনুমোদিত মাসিক আয় ও ব্যয়ের সংক্ষেপ বিবরণী
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition active:scale-95"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>পিডিএফ তৈরি হচ্ছে...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>পিডিএফ ডাউনলোড (PDF)</span>
                </>
              )}
            </button>

            <button
              onClick={handleDirectPrint}
              className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
              title="সরাসরি প্রিন্ট করুন"
            >
              <Printer className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Controls Bar */}
        <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>মাস নির্বাচন:</span>
              <input
                type="month"
                value={selectedMonthStr}
                onChange={(e) => onMonthChange(e.target.value)}
                className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
              />
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-medium">
              <input
                type="checkbox"
                checked={includeSignatures}
                onChange={(e) => setIncludeSignatures(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>কমিটি স্বাক্ষর ব্লক রাখুন</span>
            </label>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400">
            মোট লেনদেন সংখ্যা: <strong className="text-slate-900 dark:text-white">{toBengaliNumerals(monthTxs.length)} টি</strong>
          </div>
        </div>

        {/* Printable Report Document Scroll Container */}
        <div className="p-4 sm:p-6 overflow-y-auto bg-slate-200 dark:bg-slate-950 flex-1 flex justify-center">
          
          {/* Exact A4 Printable Sheet Layout */}
          <div
            ref={printAreaRef}
            id="mosque-pdf-report-content"
            className="w-full max-w-[210mm] bg-white text-slate-900 p-8 sm:p-10 shadow-2xl rounded-sm border border-slate-300 text-xs font-sans space-y-6 print:p-0 print:shadow-none print:max-w-none"
          >
            {/* Top Official Mosque Header */}
            <div className="text-center pb-4 border-b-2 border-emerald-800 space-y-1 relative">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">🕌</span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-emerald-900 tracking-tight">
                  {appState.name || 'বাইতুল আমান জামে মসজিদ'}
                </h1>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {appState.settings?.location || 'মসজিদ এলাকা'}, {appState.settings?.city || 'ঢাকা'}, বাংলাদেশ
              </p>
              
              <div className="mt-2 inline-block px-4 py-1 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-900 font-bold text-sm">
                {reportTitleNote} — {getMonthNameBn(selectedMonthStr)}
              </div>

              <div className="text-[10px] text-slate-400 absolute top-0 right-0 hidden sm:block">
                প্রতিবেদন তারিখ: {toBengaliNumerals(new Date().toISOString().slice(0, 10))}
              </div>
            </div>

            {/* Financial Summary KPI Grid */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-semibold block">চলতি মাসের আয়</span>
                <strong className="text-base font-extrabold text-emerald-700 font-mono block mt-0.5">
                  {f(totalMonthIncome)}
                </strong>
              </div>

              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <span className="text-[11px] text-rose-800 font-semibold block">চলতি মাসের খরচ</span>
                <strong className="text-base font-extrabold text-rose-700 font-mono block mt-0.5">
                  {f(totalMonthExpense)}
                </strong>
              </div>

              <div className={`p-3 rounded-lg border ${
                netMonthlySurplus >= 0 ? 'bg-teal-50 border-teal-200' : 'bg-amber-50 border-amber-200'
              }`}>
                <span className="text-[11px] text-slate-700 font-semibold block">
                  {netMonthlySurplus >= 0 ? 'মাসিক উদ্বৃত্ত' : 'মাসিক ঘাটতি'}
                </span>
                <strong className={`text-base font-extrabold font-mono block mt-0.5 ${
                  netMonthlySurplus >= 0 ? 'text-teal-800' : 'text-amber-800'
                }`}>
                  {f(Math.abs(netMonthlySurplus))}
                </strong>
              </div>

              <div className="p-3 rounded-lg bg-slate-100 border border-slate-300">
                <span className="text-[11px] text-slate-700 font-semibold block">সর্বমোট বর্তমান তহবিল</span>
                <strong className="text-base font-extrabold text-slate-900 font-mono block mt-0.5">
                  {f(totalBalance)}
                </strong>
              </div>
            </div>

            {/* Category Summary Tables Side by Side */}
            <div className="grid grid-cols-2 gap-4">
              {/* Income Categories */}
              <div className="border border-emerald-200 rounded-lg overflow-hidden">
                <div className="bg-emerald-800 text-white font-bold px-3 py-1.5 flex justify-between items-center text-xs">
                  <span>আয়ের খাতসমূহ (Income)</span>
                  <span>মোট: {f(totalMonthIncome)}</span>
                </div>
                <table className="w-full text-left text-[11px] border-collapse">
                  <tbody className="divide-y divide-slate-200">
                    {Object.keys(incomeCategoryTotals).length === 0 ? (
                      <tr>
                        <td colSpan={2} className="p-3 text-center text-slate-400">এই মাসে কোনো আয়ের হিসাব নেই</td>
                      </tr>
                    ) : (
                      Object.entries(incomeCategoryTotals).map(([cat, amt]) => (
                        <tr key={cat} className="hover:bg-slate-50">
                          <td className="p-2 font-medium text-slate-800">{cat}</td>
                          <td className="p-2 text-right font-mono font-bold text-emerald-700">{f(amt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Expense Categories */}
              <div className="border border-rose-200 rounded-lg overflow-hidden">
                <div className="bg-rose-800 text-white font-bold px-3 py-1.5 flex justify-between items-center text-xs">
                  <span>খরচের খাতসমূহ (Expenses)</span>
                  <span>মোট: {f(totalMonthExpense)}</span>
                </div>
                <table className="w-full text-left text-[11px] border-collapse">
                  <tbody className="divide-y divide-slate-200">
                    {Object.keys(expenseCategoryTotals).length === 0 ? (
                      <tr>
                        <td colSpan={2} className="p-3 text-center text-slate-400">এই মাসে কোনো খরচের হিসাব নেই</td>
                      </tr>
                    ) : (
                      Object.entries(expenseCategoryTotals).map(([cat, amt]) => (
                        <tr key={cat} className="hover:bg-slate-50">
                          <td className="p-2 font-medium text-slate-800">{cat}</td>
                          <td className="p-2 text-right font-mono font-bold text-rose-700">{f(amt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Maktab Student Tuition & Dues Overview in PDF */}
            {activeStudents.length > 0 && (
              <div className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/60 text-slate-900 text-[11px] space-y-1">
                <div className="flex justify-between items-center font-bold text-purple-900 border-b border-purple-200 pb-1">
                  <span>মক্তব ও নূরানী মাদ্রাসা বেতন ও বকেয়া খতিয়ান ({getMonthNameBn(selectedMonthStr)})</span>
                  <span className="font-mono text-[10px]">মোট শিক্ষার্থী: {toBengaliNumerals(activeStudents.length)} জন</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2 pt-0.5 text-[10px]">
                  <span>ধার্যকৃত মাসিক ফি: <strong className="font-mono">{f(maktabMonthDemand)}</strong></span>
                  <span>আদায় সম্পন্ন: <strong className="font-mono text-emerald-700">{f(maktabMonthPaid)}</strong></span>
                  <span>বকেয়া পাওনা: <strong className="font-mono text-rose-700">{f(maktabMonthDues)}</strong></span>
                  <span>বকেয়া শিক্ষার্থী: <strong className="text-rose-700">{toBengaliNumerals(maktabDueStudentsCount)} জন</strong></span>
                </div>
              </div>
            )}

            {/* Detailed Monthly Transaction Ledger Table */}
            <div>
              <h3 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-2 text-xs flex justify-between items-center">
                <span>মাসিক বিস্তারিত লেনদেন তালিকা ({getMonthNameBn(selectedMonthStr)})</span>
                <span className="text-[10px] text-slate-500 font-normal">মোট {toBengaliNumerals(monthTxs.length)} টি লেনদেন</span>
              </h3>

              <table className="w-full text-left border-collapse text-[10px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-y border-slate-300">
                    <th className="p-1.5">তারিখ</th>
                    <th className="p-1.5">ধরন</th>
                    <th className="p-1.5">খাত</th>
                    <th className="p-1.5">বিবরণ / দাতার নাম</th>
                    <th className="p-1.5 text-center">হিসাব</th>
                    <th className="p-1.5 text-right">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monthTxs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-slate-400">
                        নির্বাচিত মাসে কোনো লেনদেন সম্পন্ন হয়নি।
                      </td>
                    </tr>
                  ) : (
                    monthTxs.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-1.5 font-mono text-slate-500 whitespace-nowrap">{t.date}</td>
                        <td className="p-1.5 font-semibold">
                          <span className={`px-1 rounded text-[9px] ${
                            t.type === 'in' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {t.type === 'in' ? 'আয়' : 'খরচ'}
                          </span>
                        </td>
                        <td className="p-1.5 font-semibold text-slate-800">{t.cat}</td>
                        <td className="p-1.5 text-slate-700">
                          {t.name} <span className="text-[9px] text-slate-400">{t.note}</span>
                        </td>
                        <td className="p-1.5 text-center text-slate-500">
                          {t.acc === 'bank' ? 'ব্যাংক' : 'নগদ'}
                        </td>
                        <td className={`p-1.5 text-right font-mono font-bold ${
                          t.type === 'in' ? 'text-emerald-700' : 'text-rose-700'
                        }`}>
                          {f(t.amt)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Committee Approval & Signature Block */}
            {includeSignatures && (
              <div className="pt-8 mt-6 border-t-2 border-slate-300">
                <div className="grid grid-cols-4 gap-4 text-center text-[10px] text-slate-700">
                  <div>
                    <div className="border-t border-slate-400 pt-1 font-bold">কোষাধ্যক্ষ (Treasurer)</div>
                    <span className="text-[9px] text-slate-400">স্বাক্ষর ও তারিখ</span>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1 font-bold">সাধারণ সম্পাদক (Secretary)</div>
                    <span className="text-[9px] text-slate-400">স্বাক্ষর ও তারিখ</span>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1 font-bold">সভাপতি (President)</div>
                    <span className="text-[9px] text-slate-400">স্বাক্ষর ও তারিখ</span>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1 font-bold">অডিটর / হিসাব নিরীক্ষক</div>
                    <span className="text-[9px] text-slate-400">অনুমোদনের সীলের স্থান</span>
                  </div>
                </div>
              </div>
            )}

            {/* Document Footer */}
            <div className="pt-3 border-t border-slate-200 text-center text-[9px] text-slate-400 flex justify-between items-center">
              <span>মসজিদ সঙ্গী ও ডিজিটাল হিসাবঘর সিস্টেমে তৈরিকৃত অফিশিয়াল কপি</span>
              <span>পৃষ্ঠা ১ অব ১</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
