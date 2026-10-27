import React, { useState, useRef } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  Calendar, 
  ArrowDownRight, 
  ArrowUpRight, 
  Landmark, 
  DollarSign, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Building2,
  Copy,
  Sliders,
  Eye
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AppStateData, Language } from '../types/mosque';
import { toBengaliNumerals } from '../utils/prayerCalculator';

interface MonthlyPDFSummaryGeneratorProps {
  appState: AppStateData;
  language: Language;
  onOpenPDFModal?: (selectedMonth: string) => void;
}

export const MonthlyPDFSummaryGenerator: React.FC<MonthlyPDFSummaryGeneratorProps> = ({
  appState,
  language,
  onOpenPDFModal
}) => {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [includeSignatures, setIncludeSignatures] = useState<boolean>(true);
  const [reportNote, setReportNote] = useState<string>('মাসিক হিসাব বিবরণী');
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  const printSheetRef = useRef<HTMLDivElement>(null);

  // Bengali Currency Formatting
  const f = (n: number) => `৳ ${(Number(n) || 0).toLocaleString('bn-BD')}`;

  // Bengali Month Name Helper
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

  // Filter Monthly Transactions
  const monthTxs = appState.tx.filter((t) => t.date.startsWith(selectedMonth));
  const monthIncomeTxs = monthTxs.filter((t) => t.type === 'in');
  const monthExpenseTxs = monthTxs.filter((t) => t.type === 'out');

  const totalMonthIncome = monthIncomeTxs.reduce((sum, t) => sum + Number(t.amt), 0);
  const totalMonthExpense = monthExpenseTxs.reduce((sum, t) => sum + Number(t.amt), 0);
  const monthlyNet = totalMonthIncome - totalMonthExpense;

  // Category Summaries
  const incomeCategoryTotals: Record<string, number> = {};
  monthIncomeTxs.forEach((t) => {
    incomeCategoryTotals[t.cat] = (incomeCategoryTotals[t.cat] || 0) + Number(t.amt);
  });

  const expenseCategoryTotals: Record<string, number> = {};
  monthExpenseTxs.forEach((t) => {
    expenseCategoryTotals[t.cat] = (expenseCategoryTotals[t.cat] || 0) + Number(t.amt);
  });

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

  // Quick Month Setters
  const setPreviousMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const prevDate = new Date(year, month - 2, 1);
    const prevYm = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(prevYm);
  };

  const setNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const nextDate = new Date(year, month, 1);
    const nextYm = `${nextDate.getFullYear()}-${String(nextDate.getMonth() + 1).padStart(2, '0')}`;
    setSelectedMonth(nextYm);
  };

  // Generate & Download PDF
  const handleDownloadPDF = async () => {
    if (!printSheetRef.current) return;
    setIsGenerating(true);

    try {
      const element = printSheetRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
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

      const safeMosqueName = (appState.name || 'Masjid').replace(/\s+/g, '_');
      const fileName = `Monthly_Financial_Report_${safeMosqueName}_${selectedMonth}.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('PDF Generation Error:', err);
      alert('পিডিএফ তৈরিতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsGenerating(false);
    }
  };

  // Direct Print
  const handlePrint = () => {
    window.print();
  };

  // Copy Summary Text
  const handleCopySummaryText = () => {
    const text = `🕌 ${appState.name || 'মসজিদ'} — আর্থিক বিবরণী (${getMonthNameBn(selectedMonth)})\n` +
      `----------------------------------------\n` +
      `🟢 মোট আয়: ${f(totalMonthIncome)} (${toBengaliNumerals(monthIncomeTxs.length)} টি এন্ট্রি)\n` +
      `🔴 মোট খরচ: ${f(totalMonthExpense)} (${toBengaliNumerals(monthExpenseTxs.length)} টি এন্ট্রি)\n` +
      `📊 ${monthlyNet >= 0 ? 'মাসিক উদ্বৃত্ত' : 'মাসিক ঘাটতি'}: ${f(Math.abs(monthlyNet))}\n` +
      `💰 বর্তমান মোট সার্বিক তহবিল: ${f(totalBalance)}\n` +
      `🏦 ব্যাংক ব্যালেন্স: ${f(bankBal)} | 💵 নগদ ব্যালেন্স: ${f(cashBal)}\n` +
      `----------------------------------------\n` +
      `প্রতিবেদন তারিখ: ${toBengaliNumerals(new Date().toISOString().slice(0, 10))}`;

    navigator.clipboard.writeText(text);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
      
      {/* Component Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>মাসিক অফিশিয়াল প্রিন্টেবল পিডিএফ রিপোর্ট জেনারেটর</span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                PDF & Print
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              মসজিদের সকল আয়, খরচ ও মোট তহবিলের অফিশিয়াল মাসিক বিবরণী প্রিন্ট বা পিডিএফ এ ডাউনলোড করুন
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md transition active:scale-95 shrink-0"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>পিডিএফ প্রসেসিং...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>পিডিএফ ডাউনলোড করুন</span>
              </>
            )}
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition border border-slate-300 dark:border-slate-700 shrink-0"
            title="সরাসরি প্রিন্ট করুন"
          >
            <Printer className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span className="hidden sm:inline">প্রিন্ট করুন</span>
          </button>

          {onOpenPDFModal && (
            <button
              onClick={() => onOpenPDFModal(selectedMonth)}
              className="px-3.5 py-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/80 hover:bg-teal-100 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-200 font-bold text-xs flex items-center gap-1.5 transition border border-teal-200 dark:border-teal-800 shrink-0"
            >
              <Eye className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span>ফুলস্ক্রিন প্রিভিউ</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Controls & Filters Card */}
      <div className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
          
          {/* Month Selection */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>রিপোর্টের মাস নির্বাচন করুন:</span>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={setPreviousMonth}
                className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                title="পূর্ববর্তী মাস"
              >
                ◀
              </button>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={setNextMonth}
                className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                title="পরবর্তী মাস"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Report Subtitle / Note */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>রিপোর্টের শিরোনাম / নোট:</span>
            </label>
            <input
              type="text"
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              placeholder="যেমন: মাসিক জমা-খরচ বিবরণী"
              className="w-full p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-xs"
            />
          </div>

          {/* Options & Copy Quick Actions */}
          <div className="space-y-2 flex flex-col justify-end pt-2 md:pt-0">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={includeSignatures}
                onChange={(e) => setIncludeSignatures(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>কমিটি স্বাক্ষর ব্লক যুক্ত করুন</span>
            </label>

            <button
              type="button"
              onClick={handleCopySummaryText}
              className="w-full py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 transition"
            >
              <Copy className="w-3.5 h-3.5 text-emerald-600" />
              <span>{copySuccess ? 'কপি সম্পন্ন হয়েছে ✓' : 'টেক্সট রিপোর্ট সামারি কপি করুন'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Financial Summary Activity Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Monthly Income */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-300 dark:border-emerald-800/70">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-bold">
            <span>মাসিক মোট আয়</span>
            <ArrowDownRight className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-300 mt-1">
            {f(totalMonthIncome)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            মোট এন্ট্রি: <strong className="font-mono text-emerald-600">{toBengaliNumerals(monthIncomeTxs.length)} টি</strong>
          </div>
        </div>

        {/* Monthly Expense */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-300 dark:border-rose-800/70">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-bold">
            <span>মাসিক মোট খরচ</span>
            <ArrowUpRight className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-rose-700 dark:text-rose-300 mt-1">
            {f(totalMonthExpense)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            মোট এন্ট্রি: <strong className="font-mono text-rose-600">{toBengaliNumerals(monthExpenseTxs.length)} টি</strong>
          </div>
        </div>

        {/* Net Monthly Balance */}
        <div className={`p-4 rounded-2xl border ${
          monthlyNet >= 0
            ? 'bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent border-teal-300 dark:border-teal-800/70'
            : 'bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-amber-300 dark:border-amber-800/70'
        }`}>
          <div className={`flex items-center justify-between text-xs font-bold ${
            monthlyNet >= 0 ? 'text-teal-700 dark:text-teal-400' : 'text-amber-700 dark:text-amber-400'
          }`}>
            <span>{monthlyNet >= 0 ? 'মাসিক নিট উদ্বৃত্ত' : 'মাসিক নিট ঘাটতি'}</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className={`text-xl sm:text-2xl font-extrabold font-mono mt-1 ${
            monthlyNet >= 0 ? 'text-teal-700 dark:text-teal-300' : 'text-amber-700 dark:text-amber-300'
          }`}>
            {monthlyNet >= 0 ? `+${f(monthlyNet)}` : `-${f(Math.abs(monthlyNet))}`}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {monthlyNet >= 0 ? 'আয়ের পরিমাণ খরচের চেয়ে বেশি' : 'খরচ আয়ের চেয়ে বেশি হয়েছে'}
          </div>
        </div>

        {/* Overall Mosque Fund Balance */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-md">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold">
            <span>সর্বমোট বর্তমান তহবিল</span>
            <Landmark className="w-4 h-4" />
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-300 mt-1">
            {f(totalBalance)}
          </div>
          <div className="text-[11px] text-slate-300 mt-1 flex justify-between">
            <span>ব্যাংক: {f(bankBal)}</span>
            <span>নগদ: {f(cashBal)}</span>
          </div>
        </div>
      </div>

      {/* Printable Sheet View Container */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>প্রিন্ট ও পিডিএফের জন্য প্রস্তুত রূপরেখা (A4 Preview)</span>
          </h4>
          <span className="text-[11px] text-slate-500">
            নির্বাচিত মাস: <strong className="text-slate-900 dark:text-white font-bold">{getMonthNameBn(selectedMonth)}</strong>
          </span>
        </div>

        {/* The Exact Sheet that gets converted into PDF */}
        <div className="bg-slate-200 dark:bg-slate-950 p-4 sm:p-6 rounded-2xl overflow-x-auto flex justify-center border border-slate-300 dark:border-slate-800">
          <div
            ref={printSheetRef}
            id="printable-monthly-pdf-sheet"
            className="w-full max-w-[210mm] bg-white text-slate-900 p-8 sm:p-10 shadow-xl rounded-sm border border-slate-300 text-xs font-sans space-y-6 print:p-0 print:shadow-none print:max-w-none shrink-0"
          >
            {/* Header */}
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
                {reportNote} — {getMonthNameBn(selectedMonth)}
              </div>

              <div className="text-[10px] text-slate-400 absolute top-0 right-0 hidden sm:block">
                তারিখ: {toBengaliNumerals(new Date().toISOString().slice(0, 10))}
              </div>
            </div>

            {/* Top Stat Summary Grid */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] text-emerald-800 font-semibold block">চলতি মাসের আয়</span>
                <strong className="text-sm font-extrabold text-emerald-700 font-mono block mt-0.5">
                  {f(totalMonthIncome)}
                </strong>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200">
                <span className="text-[10px] text-rose-800 font-semibold block">চলতি মাসের খরচ</span>
                <strong className="text-sm font-extrabold text-rose-700 font-mono block mt-0.5">
                  {f(totalMonthExpense)}
                </strong>
              </div>

              <div className={`p-2.5 rounded-lg border ${
                monthlyNet >= 0 ? 'bg-teal-50 border-teal-200' : 'bg-amber-50 border-amber-200'
              }`}>
                <span className="text-[10px] text-slate-700 font-semibold block">
                  {monthlyNet >= 0 ? 'মাসিক উদ্বৃত্ত' : 'মাসিক ঘাটতি'}
                </span>
                <strong className={`text-sm font-extrabold font-mono block mt-0.5 ${
                  monthlyNet >= 0 ? 'text-teal-800' : 'text-amber-800'
                }`}>
                  {f(Math.abs(monthlyNet))}
                </strong>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-300">
                <span className="text-[10px] text-slate-700 font-semibold block">সর্বমোট বর্তমান তহবিল</span>
                <strong className="text-sm font-extrabold text-slate-900 font-mono block mt-0.5">
                  {f(totalBalance)}
                </strong>
              </div>
            </div>

            {/* Category Tables Side by Side */}
            <div className="grid grid-cols-2 gap-3">
              {/* Income Categories */}
              <div className="border border-emerald-200 rounded-lg overflow-hidden">
                <div className="bg-emerald-800 text-white font-bold px-2.5 py-1.5 flex justify-between items-center text-[11px]">
                  <span>আয়ের খাতসমূহ (Income)</span>
                  <span>মোট: {f(totalMonthIncome)}</span>
                </div>
                <table className="w-full text-left text-[10px] border-collapse">
                  <tbody className="divide-y divide-slate-200">
                    {Object.keys(incomeCategoryTotals).length === 0 ? (
                      <tr>
                        <td colSpan={2} className="p-2 text-center text-slate-400">কোনো আয়ের হিসাব নেই</td>
                      </tr>
                    ) : (
                      Object.entries(incomeCategoryTotals).map(([cat, amt]) => (
                        <tr key={cat} className="hover:bg-slate-50">
                          <td className="p-1.5 font-medium text-slate-800">{cat}</td>
                          <td className="p-1.5 text-right font-mono font-bold text-emerald-700">{f(amt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Expense Categories */}
              <div className="border border-rose-200 rounded-lg overflow-hidden">
                <div className="bg-rose-800 text-white font-bold px-2.5 py-1.5 flex justify-between items-center text-[11px]">
                  <span>খরচের খাতসমূহ (Expenses)</span>
                  <span>মোট: {f(totalMonthExpense)}</span>
                </div>
                <table className="w-full text-left text-[10px] border-collapse">
                  <tbody className="divide-y divide-slate-200">
                    {Object.keys(expenseCategoryTotals).length === 0 ? (
                      <tr>
                        <td colSpan={2} className="p-2 text-center text-slate-400">কোনো খরচের হিসাব নেই</td>
                      </tr>
                    ) : (
                      Object.entries(expenseCategoryTotals).map(([cat, amt]) => (
                        <tr key={cat} className="hover:bg-slate-50">
                          <td className="p-1.5 font-medium text-slate-800">{cat}</td>
                          <td className="p-1.5 text-right font-mono font-bold text-rose-700">{f(amt)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Detailed Monthly Transaction List */}
            <div>
              <h3 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-1.5 text-[11px] flex justify-between items-center">
                <span>মাসিক বিস্তারিত লেনদেন তালিকা ({getMonthNameBn(selectedMonth)})</span>
                <span className="text-[10px] text-slate-500 font-normal">মোট {toBengaliNumerals(monthTxs.length)} টি লেনদেন</span>
              </h3>

              <table className="w-full text-left border-collapse text-[9px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-y border-slate-300">
                    <th className="p-1">তারিখ</th>
                    <th className="p-1">ধরন</th>
                    <th className="p-1">খাত</th>
                    <th className="p-1">বিবরণ / দাতার নাম</th>
                    <th className="p-1 text-center">হিসাব</th>
                    <th className="p-1 text-right">পরিমাণ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {monthTxs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-3 text-center text-slate-400">
                        এই মাসে কোনো লেনদেন পাওয়া যায়নি।
                      </td>
                    </tr>
                  ) : (
                    monthTxs.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="p-1 font-mono text-slate-500 whitespace-nowrap">{t.date}</td>
                        <td className="p-1 font-semibold">
                          <span className={`px-1 rounded text-[8px] ${
                            t.type === 'in' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {t.type === 'in' ? 'আয়' : 'খরচ'}
                          </span>
                        </td>
                        <td className="p-1 font-semibold text-slate-800">{t.cat}</td>
                        <td className="p-1 text-slate-700">
                          {t.name} <span className="text-[8px] text-slate-400">{t.note}</span>
                        </td>
                        <td className="p-1 text-center text-slate-500">
                          {t.acc === 'bank' ? 'ব্যাংক' : 'নগদ'}
                        </td>
                        <td className={`p-1 text-right font-mono font-bold ${
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

            {/* Committee Signatures Block */}
            {includeSignatures && (
              <div className="pt-6 mt-4 border-t-2 border-slate-300">
                <div className="grid grid-cols-4 gap-3 text-center text-[9px] text-slate-700">
                  <div>
                    <div className="border-t border-slate-400 pt-1 font-bold">কোষাধ্যক্ষ</div>
                    <span className="text-[8px] text-slate-400">স্বাক্ষর ও তারিখ</span>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1 font-bold">সাধারণ সম্পাদক</div>
                    <span className="text-[8px] text-slate-400">স্বাক্ষর ও তারিখ</span>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1 font-bold">সভাপতি</div>
                    <span className="text-[8px] text-slate-400">স্বাক্ষর ও তারিখ</span>
                  </div>
                  <div>
                    <div className="border-t border-slate-400 pt-1 font-bold">হিসাব নিরীক্ষক</div>
                    <span className="text-[8px] text-slate-400">অনুমোদন ও সীল</span>
                  </div>
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="pt-2 border-t border-slate-200 text-center text-[8px] text-slate-400 flex justify-between items-center">
              <span>মসজিদ ডিজিটাল হিসাবঘর সিস্টেমে তৈরিকৃত অফিশিয়াল প্রতিবেদন</span>
              <span>পৃষ্ঠা ১ অব ১</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
