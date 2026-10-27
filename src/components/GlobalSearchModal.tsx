import React, { useState, useMemo } from 'react';
import { Search, X, BookOpen, Heart, Landmark, ArrowRight, BookMarked, Megaphone } from 'lucide-react';
import { ALL_114_SURAHS } from '../data/quranIndex';
import { MASNOON_DUAS } from '../data/islamicData';
import { SAHIH_HADITH_COLLECTION } from '../data/hadithData';
import { AppStateData, Language } from '../types/mosque';
import { TRANSLATIONS } from '../utils/translations';
import { toBengaliNumerals } from '../utils/prayerCalculator';
import { TabKey } from './Navigation';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  appState: AppStateData;
  language: Language;
  onNavigateTab: (tab: TabKey) => void;
  onSelectSurah?: (surahId: number) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  appState,
  language,
  onNavigateTab,
  onSelectSurah
}) => {
  const [query, setQuery] = useState('');
  const t = TRANSLATIONS[language];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;

    // Search all 114 Surahs
    const matchedSurahs = ALL_114_SURAHS.filter(
      (s) =>
        s.id.toString() === q ||
        toBengaliNumerals(s.id).includes(q) ||
        s.nameBn.toLowerCase().includes(q) ||
        s.nameAr.includes(q) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.meaning.toLowerCase().includes(q)
    );

    // Search Duas
    const matchedDuas = MASNOON_DUAS.filter(
      (d) =>
        d.titleBn.toLowerCase().includes(q) ||
        d.bn.toLowerCase().includes(q) ||
        d.pronounce.toLowerCase().includes(q) ||
        d.category.toLowerCase().includes(q)
    );

    // Search Sahih 6 Hadiths
    const matchedHadiths = SAHIH_HADITH_COLLECTION.filter(
      (h) =>
        h.hadithNumber.toString().includes(q) ||
        toBengaliNumerals(h.hadithNumber).includes(q) ||
        h.topic.toLowerCase().includes(q) ||
        h.banglaMeaning.toLowerCase().includes(q) ||
        h.banglaShanNuzul.toLowerCase().includes(q) ||
        h.bookNameBn.toLowerCase().includes(q) ||
        h.narratorBn.toLowerCase().includes(q) ||
        h.arabicMatn.includes(q)
    );

    // Search Transactions & Donors
    const matchedTx = appState.tx.filter(
      (tx) =>
        tx.name.toLowerCase().includes(q) ||
        tx.cat.toLowerCase().includes(q) ||
        (tx.note && tx.note.toLowerCase().includes(q))
    );

    // Search Pledges
    const matchedPl = appState.pl.filter(
      (p) =>
        p.n.toLowerCase().includes(q) ||
        p.ad.toLowerCase().includes(q) ||
        p.pur.toLowerCase().includes(q)
    );

    // Search Notices
    const matchedNotices = (appState.notices || []).filter(
      (n) =>
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.postedBy.toLowerCase().includes(q)
    );

    return {
      surahs: matchedSurahs,
      duas: matchedDuas,
      hadiths: matchedHadiths,
      tx: matchedTx,
      pl: matchedPl,
      notices: matchedNotices,
      total: matchedSurahs.length + matchedDuas.length + matchedHadiths.length + matchedTx.length + matchedPl.length + matchedNotices.length
    };
  }, [query, appState]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50/70 dark:bg-slate-900/70">
          <Search className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            className="w-full bg-transparent text-base sm:text-lg focus:outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-300 transition"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-4">
          {!query && (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500 space-y-2">
              <Search className="w-10 h-10 mx-auto text-emerald-600/40" />
              <p className="text-sm font-medium">
                {language === 'bn'
                  ? 'সূরা, দোআ, হাদিস, হিসাবের খাতা বা দানকারীর নাম লিখে খুঁজুন'
                  : 'Type to search Surahs, Duas, Hadith, or Mosque finances'}
              </p>
              <div className="flex flex-wrap gap-2 justify-center pt-2">
                {['ইয়াসীন', 'আয়াতুল কুরসী', 'দোআ', 'জুমার দান', 'বিদ্যুৎ বিল', 'হাজী'].map((k) => (
                  <button
                    key={k}
                    onClick={() => setQuery(k)}
                    className="px-2.5 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>
          )}

          {results && results.total === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p className="text-base font-semibold">কোনো ফলাফল পাওয়া যায়নি</p>
              <p className="text-xs mt-1">ভিন্ন শব্দ লিখে আবার চেষ্টা করুন</p>
            </div>
          )}

          {results && results.total > 0 && (
            <>
              {/* Surahs */}
              {results.surahs.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" /> সূরা ও আয়াতসমূহ ({results.surahs.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.surahs.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => {
                          onNavigateTab('reading');
                          if (onSelectSurah) onSelectSurah(s.id);
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 cursor-pointer border border-slate-200 dark:border-slate-800 transition flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span>{s.nameBn}</span>
                            <span className="font-arabic text-emerald-700 dark:text-emerald-400 text-sm">
                              {s.nameAr}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {s.meaning} • {s.revelation}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-emerald-600 shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Duas */}
              {results.duas.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5" /> মাসনূন দোআ ({results.duas.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.duas.map((d) => (
                      <div
                        key={d.id}
                        onClick={() => {
                          onNavigateTab('reading');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 cursor-pointer border border-slate-200 dark:border-slate-800 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-100">
                            {d.titleBn}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                            {d.category}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                          {d.bn}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sahih Hadiths */}
              {results.hadiths.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                    <BookMarked className="w-3.5 h-3.5" /> সহীহ হাদিস ও শানে ওরূদ ({results.hadiths.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.hadiths.map((h) => (
                      <div
                        key={h.id}
                        onClick={() => {
                          onNavigateTab('hadith');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 cursor-pointer border border-slate-200 dark:border-slate-800 transition"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                            <span>{h.bookNameBn}</span>
                            <span className="text-xs text-emerald-600 font-bold">
                              নং {toBengaliNumerals(h.hadithNumber)}
                            </span>
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-medium">
                            {h.topic}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                          {h.banglaMeaning}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mosque Notices */}
              {results.notices && results.notices.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                    <Megaphone className="w-3.5 h-3.5" /> মসজিদের নোটিশ ({results.notices.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.notices.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => {
                          onNavigateTab('accounts');
                          onClose();
                        }}
                        className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 hover:bg-amber-100/60 dark:hover:bg-amber-950/40 cursor-pointer border border-amber-200/70 dark:border-amber-900/40 transition"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {n.title}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 font-semibold shrink-0">
                            {n.priority === 'urgent' ? 'জরুরী' : 'ঘোষণা'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-1">
                          {n.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Transactions in Mosque Accounts */}
              {results.tx.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5" /> মসজিদের হিসাবের এন্ট্রি ({results.tx.length})
                  </h4>
                  <div className="space-y-1.5">
                    {results.tx.map((tx) => (
                      <div
                        key={tx.id}
                        onClick={() => {
                          onNavigateTab('accounts');
                          onClose();
                        }}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 cursor-pointer border border-slate-200 dark:border-slate-800 transition flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-800 dark:text-slate-100">
                            {tx.name || tx.cat}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400">
                            {tx.date} • {tx.cat} • {tx.acc === 'bank' ? 'ব্যাংক' : 'কোষাধ্যক্ষ'}
                          </div>
                        </div>
                        <div className={`font-bold text-sm ${tx.type === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.type === 'in' ? '+' : '-'} ৳ {tx.amt.toLocaleString('bn-BD')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
