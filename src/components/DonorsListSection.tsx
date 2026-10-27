import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Search, 
  Filter, 
  X, 
  Receipt, 
  Printer, 
  PlusCircle, 
  Globe, 
  Landmark, 
  Trash2, 
  TrendingUp, 
  FileText,
  Calendar,
  Sparkles,
  PhoneCall,
  Download
} from 'lucide-react';
import { AppStateData, MosqueTransaction, Language } from '../types/mosque';
import { toBengaliNumerals } from '../utils/prayerCalculator';

interface DonorsListSectionProps {
  appState: AppStateData;
  onUpdateAppState: (updater: (prev: AppStateData) => AppStateData) => void;
  language: Language;
  onOpenDonateModal?: () => void;
}

export function getCategoryBadgeStyle(cat: string = '') {
  const category = cat.toLowerCase();
  if (category.includes('যাকাত') || category.includes('zakat')) {
    return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80';
  }
  if (category.includes('সদকা') || category.includes('sadaqah')) {
    return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80';
  }
  if (category.includes('মেরামত') || category.includes('maintenance')) {
    return 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-800/80';
  }
  if (category.includes('উন্নয়ন') || category.includes('নির্মাণ') || category.includes('construction')) {
    return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80';
  }
  if (category.includes('জুম') || category.includes('jummah')) {
    return 'bg-teal-100 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200 dark:border-teal-800/80';
  }
  if (category.includes('সদস্য') || category.includes('member') || category.includes('চাঁদা')) {
    return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-950/80 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800/80';
  }
  if (category.includes('বিশেষ') || category.includes('special')) {
    return 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800/80';
  }
  return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80';
}

export const DonorsListSection: React.FC<DonorsListSectionProps> = ({
  appState,
  onUpdateAppState,
  language,
  onOpenDonateModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'all' | 'online' | 'direct'>('all');
  const [selectedCat, setSelectedCat] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [viewingReceiptTx, setViewingReceiptTx] = useState<MosqueTransaction | null>(null);

  // Filter only Income transactions (type === 'in')
  const allDonations = useMemo(() => {
    return appState.tx.filter((t) => t.type === 'in');
  }, [appState.tx]);

  // Unique categories
  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    allDonations.forEach((t) => {
      if (t.cat) set.add(t.cat);
    });
    return Array.from(set);
  }, [allDonations]);

  // Filtered donation list
  const filteredDonations = useMemo(() => {
    return allDonations.filter((tx) => {
      const isOnline = tx.note?.includes('অনলাইন') || tx.note?.includes('TrxID') || tx.note?.includes('মোবাইল');

      // 1. Source filter
      if (sourceFilter === 'online' && !isOnline) return false;
      if (sourceFilter === 'direct' && isOnline) return false;

      // 2. Category filter
      if (selectedCat !== 'all' && tx.cat !== selectedCat) return false;

      // 3. Month filter
      if (selectedMonth !== 'all') {
        if (!tx.date.startsWith(selectedMonth)) return false;
      }

      // 4. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = tx.name.toLowerCase().includes(q);
        const matchNote = tx.note.toLowerCase().includes(q);
        const matchCat = tx.cat.toLowerCase().includes(q);
        const matchAmt = tx.amt.toString().includes(q);
        if (!matchName && !matchNote && !matchCat && !matchAmt) return false;
      }

      return true;
    });
  }, [allDonations, sourceFilter, selectedCat, selectedMonth, searchQuery]);

  // KPI Calculations
  const stats = useMemo(() => {
    const totalAmt = filteredDonations.reduce((sum, t) => sum + Number(t.amt), 0);
    const onlineCount = allDonations.filter((t) => t.note?.includes('অনলাইন') || t.note?.includes('TrxID') || t.note?.includes('মোবাইল')).length;
    const onlineSum = allDonations
      .filter((t) => t.note?.includes('অনলাইন') || t.note?.includes('TrxID') || t.note?.includes('মোবাইল'))
      .reduce((sum, t) => sum + Number(t.amt), 0);

    const maxAmt = filteredDonations.length > 0 ? Math.max(...filteredDonations.map((t) => Number(t.amt))) : 0;
    const avgAmt = filteredDonations.length > 0 ? Math.round(totalAmt / filteredDonations.length) : 0;

    return {
      totalAmt,
      totalCount: filteredDonations.length,
      onlineCount,
      onlineSum,
      maxAmt,
      avgAmt
    };
  }, [filteredDonations, allDonations]);

  const formatMoney = (amount: number) => {
    return '৳ ' + amount.toLocaleString('bn-BD');
  };

  const formatBengaliDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const monthName = months[monthIdx] || parts[1];
      return `${toBengaliNumerals(parts[2])} ${monthName} ${toBengaliNumerals(parts[0])}`;
    }
    return toBengaliNumerals(dateStr);
  };

  const handleDeleteDonation = (id: number) => {
    if (confirm('আপনি কি নিশ্চিত যে এই অনুদানের এন্ট্রিটি মুছে ফেলতে চান?')) {
      onUpdateAppState((prev) => ({
        ...prev,
        tx: prev.tx.filter((t) => t.id !== id)
      }));
    }
  };

  return (
    <div className="space-y-4">
      {/* SECTION HEADER & QUICK DONATE BUTTON */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-xs">
              <Heart className="w-5 h-5 fill-rose-500/20" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>অনলাইন ও সাধারণ দান এবং দাতা তালিকা</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
                  {toBengaliNumerals(filteredDonations.length)} টি অনুদান
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                মসজিদের তহবিলে প্রাপ্ত সকল অনলাইন অনুদান, দাতার নাম, বিবরণ ও ডিজিটাল রশিদ রেকর্ড
              </p>
            </div>
          </div>
        </div>

        {onOpenDonateModal && (
          <button
            type="button"
            onClick={onOpenDonateModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>নতুন অনলাইন দান করুন</span>
          </button>
        )}
      </div>

      {/* KPI METRIC SUMMARY CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Selected Amount */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>প্রদর্শিত মোট অনুদান</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
            {formatMoney(stats.totalAmt)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            মোট {toBengaliNumerals(stats.totalCount)} টি লেনদেনে প্রাপ্ত
          </div>
        </div>

        {/* Online Donations Total */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>অনলাইন দান (DonateModal)</span>
            <Globe className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold font-mono text-blue-600 dark:text-blue-400">
            {formatMoney(stats.onlineSum)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {toBengaliNumerals(stats.onlineCount)} টি বিকাশ/নগদ অনলাইন এন্ট্রি
          </div>
        </div>

        {/* Highest Single Donation */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>সর্বোচ্চ একক দান</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
            {formatMoney(stats.maxAmt)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            একক সর্বোচ্চ অবদান
          </div>
        </div>

        {/* Average Donation */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>গড় অনুদানের পরিমাণ</span>
            <Landmark className="w-4 h-4 text-teal-600" />
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-extrabold font-mono text-teal-600 dark:text-teal-400">
            {formatMoney(stats.avgAmt)}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            প্রতিটি অনুদানের গড়
          </div>
        </div>
      </div>

      {/* SEARCH BAR & FILTERS */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="দাতার নাম, মোবাইল নম্বর, বা বিবরণ দিয়ে খুঁজুন... (যেমন: কামরুল, বিকাশ, ৩০০০)"
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="মুছুন"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Chips Row */}
        <div className="space-y-2 text-xs">
          {/* Source Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3 h-3 text-emerald-500" />
              উৎস:
            </span>
            <button
              type="button"
              onClick={() => setSourceFilter('all')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                sourceFilter === 'all'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              সকল অনুদান ({toBengaliNumerals(allDonations.length)})
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('online')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition flex items-center gap-1 ${
                sourceFilter === 'online'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Globe className="w-3 h-3" />
              <span>🌐 অনলাইন দানসমূহ ({toBengaliNumerals(stats.onlineCount)})</span>
            </button>
            <button
              type="button"
              onClick={() => setSourceFilter('direct')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${
                sourceFilter === 'direct'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              🏛️ সরাসরি ও ক্যাশ গ্রহণ
            </button>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mr-1">
              দানের খাত:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCat('all')}
              className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition ${
                selectedCat === 'all'
                  ? 'bg-slate-800 text-white dark:bg-slate-200 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              সকল খাত
            </button>
            {categoriesList.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCat(cat)}
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition ${
                  selectedCat === cat
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}

            {(searchQuery !== '' || sourceFilter !== 'all' || selectedCat !== 'all' || selectedMonth !== 'all') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSourceFilter('all');
                  setSelectedCat('all');
                  setSelectedMonth('all');
                }}
                className="ml-auto px-2 py-0.5 rounded text-[11px] text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 font-semibold inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" />
                ফিল্টার রিসেট
              </button>
            )}
          </div>
        </div>
      </div>

      {/* DONATIONS TABLE VIEW */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        {filteredDonations.length === 0 ? (
          <div className="py-12 px-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
              <Heart className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">কোনো অনুদান পাওয়া যায়নি</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              আপনার বর্তমান অনুসন্ধান বা ফিল্টার শর্তের সাথে মিল রেখে কোনো অনুদানের রেকর্ড মেলেনি।
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSourceFilter('all');
                setSelectedCat('all');
                setSelectedMonth('all');
              }}
              className="mt-3 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-xs"
            >
              <X className="w-3.5 h-3.5" />
              ফিল্টার রিসেট করুন
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-2.5 px-3">তারিখ</th>
                  <th className="py-2.5 px-3">দাতার নাম ও ধরণ</th>
                  <th className="py-2.5 px-3">দানের খাত</th>
                  <th className="py-2.5 px-3 text-right">পরিমাণ</th>
                  <th className="py-2.5 px-3">তহবিল / অ্যাকাউন্ট</th>
                  <th className="py-2.5 px-3">বিবরণ / ট্রানজেকশন</th>
                  <th className="py-2.5 px-3 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredDonations.map((tx) => {
                  const isOnline = tx.note?.includes('অনলাইন') || tx.note?.includes('TrxID') || tx.note?.includes('মোবাইল');

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      {/* Date */}
                      <td className="py-3 px-3 font-medium whitespace-nowrap text-slate-600 dark:text-slate-300">
                        {formatBengaliDate(tx.date)}
                      </td>

                      {/* Donor Name */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                          <span>{tx.name}</span>
                          {isOnline && (
                            <span className="text-[10px] px-2 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold shrink-0 flex items-center gap-0.5">
                              <Globe className="w-2.5 h-2.5" /> অনলাইন
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-lg font-bold text-[11px] inline-block ${getCategoryBadgeStyle(tx.cat)}`}>
                          {tx.cat || 'সাধারণ দান'}
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3 text-right font-mono font-extrabold text-sm text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                        {formatMoney(tx.amt)}
                      </td>

                      {/* Account / Channel */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        {tx.acc === 'bank' ? (
                          <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                            <Landmark className="w-3.5 h-3.5 text-blue-600" />
                            ব্যাংক / বিকাশ / নগদ
                          </span>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                            <span>💵</span> কোষাধ্যক্ষ নগদ
                          </span>
                        )}
                      </td>

                      {/* Notes / TrxID */}
                      <td className="py-3 px-3 max-w-xs truncate text-slate-600 dark:text-slate-400 text-[11px]">
                        {tx.note || '-'}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={() => setViewingReceiptTx(tx)}
                          className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1"
                          title="ডিজিটাল রশিদ প্রিন্ট করুন"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>রশিদ</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDonation(tx.id)}
                          className="p-1 rounded text-rose-500 hover:text-rose-700"
                          title="এন্ট্রি মুছুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PRINTABLE DIGITAL RECEIPT MODAL */}
      {viewingReceiptTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden space-y-4 p-6">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  ডিজিটাল অনুদান রশিদ
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingReceiptTx(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Area */}
            <div 
              id="printable-receipt-card"
              className="p-5 rounded-2xl bg-amber-50/70 dark:bg-slate-800/90 border-2 border-dashed border-amber-300 dark:border-amber-800 text-slate-900 dark:text-white space-y-3"
            >
              <div className="text-center border-b border-amber-200 dark:border-slate-700 pb-2">
                <div className="text-xl font-extrabold text-emerald-800 dark:text-emerald-400">
                  🕌 {appState.name}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  অফিশিয়াল দান ও অনুদান গ্রহণ কপি
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  রশিদ নং: R-{viewingReceiptTx.id}
                </div>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">তারিখ:</span>
                  <span className="font-bold">{formatBengaliDate(viewingReceiptTx.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">দাতার নাম:</span>
                  <span className="font-bold text-emerald-700 dark:text-emerald-400">{viewingReceiptTx.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">দানের খাত:</span>
                  <span className="font-bold">{viewingReceiptTx.cat}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">জমাদান মাধ্যম:</span>
                  <span className="font-bold">{viewingReceiptTx.acc === 'bank' ? 'ব্যাংক / বিকাশ / অনলাইন' : 'কোষাধ্যক্ষ ক্যাশ'}</span>
                </div>
                {viewingReceiptTx.note && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">বিবরণ / TrxID:</span>
                    <span className="font-mono text-[11px]">{viewingReceiptTx.note}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2 border-t border-amber-200 dark:border-slate-700 text-sm">
                  <span className="font-bold text-slate-700 dark:text-slate-300">পরিশোধিত মোট:</span>
                  <span className="font-mono font-extrabold text-emerald-700 dark:text-emerald-400 text-base">
                    {formatMoney(viewingReceiptTx.amt)}
                  </span>
                </div>
              </div>

              <div className="text-center pt-2 text-[10px] text-slate-400 italic">
                "আল্লাহ তা'আলা আপনার এই দান কবুল করুন ও উত্তম বিনিময় দান করুন। আমীন।"
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition"
              >
                <Printer className="w-4 h-4" />
                <span>প্রিন্ট করুন</span>
              </button>
              <button
                type="button"
                onClick={() => setViewingReceiptTx(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs"
              >
                বন্ধ করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
