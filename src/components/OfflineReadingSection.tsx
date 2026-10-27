import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, 
  Heart, 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Search, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Filter, 
  Sparkles, 
  ListOrdered, 
  BookmarkCheck,
  ChevronDown,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { ALL_114_SURAHS, QuranSurahMeta } from '../data/quranIndex';
import { FullSurahDetail } from '../data/allSurahsData';
import { fetchSurahVerses, getSurahAudioUrl } from '../utils/quranService';
import { isAudioUrlCached, QURAN_AUDIO_CACHE_NAME } from '../utils/offlineQuranAudio';
import { QuranAudioPlayer } from './QuranAudioPlayer';
import { DuaAppSection } from './DuaAppSection';
import { toBengaliNumerals } from '../utils/prayerCalculator';

import { Language } from '../types/mosque';


interface OfflineReadingSectionProps {
  initialSurahId?: number;
  language: Language;
}

export const OfflineReadingSection: React.FC<OfflineReadingSectionProps> = ({
  initialSurahId,
  language = 'bn'
}) => {

  const [activeTab, setActiveTab] = useState<'surah' | 'dua'>('surah');
  const [selectedSurahId, setSelectedSurahId] = useState<number>(initialSurahId || 1);
  const [currentSurahDetail, setCurrentSurahDetail] = useState<FullSurahDetail | null>(null);
  const [loadingSurah, setLoadingSurah] = useState<boolean>(false);

  // Filters
  const [surahFilterMode, setSurahFilterMode] = useState<'all' | 'popular' | 'juz30' | 'makki' | 'madani'>('popular');
  const [surahSearchQuery, setSurahSearchQuery] = useState('');

  // Reader Settings
  const [showPronounce, setShowPronounce] = useState<boolean>(true);
  const [showMeaning, setShowMeaning] = useState<boolean>(true);
  const [readerTheme, setReaderTheme] = useState<'default' | 'sepia' | 'dark'>('default');
  const [readerFontSize, setReaderFontSize] = useState<'md' | 'lg' | 'xl'>('lg');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSpeakingVerseId, setActiveSpeakingVerseId] = useState<number | null>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [requestedVerseId, setRequestedVerseId] = useState<number | null>(null);
  const [isSurahAudioCached, setIsSurahAudioCached] = useState<boolean>(false);

  // Check if current Surah audio is cached in 'quran-audio-cache'
  useEffect(() => {
    const url = getSurahAudioUrl(selectedSurahId);
    isAudioUrlCached(url).then(setIsSurahAudioCached);
  }, [selectedSurahId]);

  // Auto-scroll to active playing verse synchronized with audio
  useEffect(() => {
    if (autoScroll && activeSpeakingVerseId) {
      const el = document.getElementById(`verse-${activeSpeakingVerseId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [activeSpeakingVerseId, autoScroll]);

  // Load active Surah verses
  useEffect(() => {
    let isCancelled = false;
    setLoadingSurah(true);

    fetchSurahVerses(selectedSurahId).then((data) => {
      if (!isCancelled) {
        setCurrentSurahDetail(data);
        setLoadingSurah(false);
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [selectedSurahId]);

  const activeSurahMeta = useMemo(() => {
    return ALL_114_SURAHS.find((s) => s.id === selectedSurahId) || ALL_114_SURAHS[0];
  }, [selectedSurahId]);

  // Filtered 114 Surahs list
  const filteredSurahList = useMemo(() => {
    let list = ALL_114_SURAHS;

    if (surahFilterMode === 'popular') {
      list = list.filter((s) => s.isPopular);
    } else if (surahFilterMode === 'juz30') {
      list = list.filter((s) => s.id >= 78);
    } else if (surahFilterMode === 'makki') {
      list = list.filter((s) => s.revelation === 'মক্কী');
    } else if (surahFilterMode === 'madani') {
      list = list.filter((s) => s.revelation === 'মাদানী');
    }

    if (surahSearchQuery.trim()) {
      const q = surahSearchQuery.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.id.toString() === q ||
          toBengaliNumerals(s.id).includes(q) ||
          s.nameBn.toLowerCase().includes(q) ||
          s.nameAr.includes(q) ||
          s.nameEn.toLowerCase().includes(q) ||
          s.meaning.toLowerCase().includes(q)
      );
    }

    return list;
  }, [surahFilterMode, surahSearchQuery]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getReaderStyle = () => {
    if (readerTheme === 'sepia') {
      return 'bg-[#fbf0d9] text-[#433422] border-[#e8d5b5]';
    }
    if (readerTheme === 'dark') {
      return 'bg-slate-950 text-slate-100 border-slate-800';
    }
    return 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border-slate-200 dark:border-slate-800';
  };

  const getArabicSize = () => {
    if (readerFontSize === 'xl') return 'text-3xl sm:text-5xl';
    if (readerFontSize === 'lg') return 'text-2xl sm:text-4xl';
    return 'text-xl sm:text-2xl';
  };

  const getTextSize = () => {
    if (readerFontSize === 'xl') return 'text-lg sm:text-xl';
    if (readerFontSize === 'lg') return 'text-base sm:text-lg';
    return 'text-sm sm:text-base';
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Header & Tab Toggle */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('surah')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'surah'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>পবিত্র কুরআনের ১১৪টি সূরা</span>
          </button>

          <button
            onClick={() => setActiveTab('dua')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'dua'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            <span>দোয়া সমগ্র (দৈনন্দিন আমল)</span>
            <span className="text-[10px] bg-amber-400 text-slate-950 font-extrabold px-1.5 py-0.2 rounded-full">
              ৩৮টি
            </span>
          </button>
        </div>


        {/* Reader Customizer Bar */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Pronunciation toggle */}
          <button
            onClick={() => setShowPronounce(!showPronounce)}
            className={`p-2 rounded-lg text-xs font-semibold border transition flex items-center gap-1 ${
              showPronounce
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
            }`}
            title="বাংলা উচ্চারণ দেখান/লুকান"
          >
            {showPronounce ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            <span className="hidden sm:inline">উচ্চারণ</span>
          </button>

          {/* Meaning toggle */}
          <button
            onClick={() => setShowMeaning(!showMeaning)}
            className={`p-2 rounded-lg text-xs font-semibold border transition flex items-center gap-1 ${
              showMeaning
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
            }`}
            title="বাংলা অর্থ দেখান/লুকান"
          >
            <span className="font-bold text-xs">অর্থ</span>
          </button>

          {/* Reader Theme (Light, Sepia, Dark) */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setReaderTheme('default')}
              className={`w-6 h-6 rounded-md bg-white border border-slate-300 shadow-xs ${
                readerTheme === 'default' ? 'ring-2 ring-emerald-500' : ''
              }`}
              title="সাধারণ মোড"
            />
            <button
              onClick={() => setReaderTheme('sepia')}
              className={`w-6 h-6 rounded-md bg-[#fbf0d9] border border-[#e8d5b5] shadow-xs ${
                readerTheme === 'sepia' ? 'ring-2 ring-amber-600' : ''
              }`}
              title="বই পড়ার মেজাজ (সেপিয়া)"
            />
            <button
              onClick={() => setReaderTheme('dark')}
              className={`w-6 h-6 rounded-md bg-slate-950 border border-slate-700 shadow-xs ${
                readerTheme === 'dark' ? 'ring-2 ring-indigo-400' : ''
              }`}
              title="রাতের অন্ধকার মোড"
            />
          </div>

          {/* Font Size Scaling */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            {(['md', 'lg', 'xl'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setReaderFontSize(s)}
                className={`px-2 py-0.5 rounded text-xs font-bold ${
                  readerFontSize === s
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {s === 'md' ? 'মাঝারি' : s === 'lg' ? 'বড়' : 'খুব বড়'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Surah Reading View */}
      {activeTab === 'surah' && (
        <div className="space-y-4">
          {/* 114 Surahs Filter & Search Directory */}
          <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Category pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {[
                  { key: 'popular', label: 'নিত্য প্রয়োজনীয় ও জনপ্রিয়' },
                  { key: 'juz30', label: '৩০তম পারা (ছোট সূরা)' },
                  { key: 'all', label: 'সকল ১১৪টি সূরা' },
                  { key: 'makki', label: 'মক্কী' },
                  { key: 'madani', label: 'মাদানী' }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setSurahFilterMode(tab.key as typeof surahFilterMode)}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition border ${
                      surahFilterMode === tab.key
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Instant Search Bar */}
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={surahSearchQuery}
                  onChange={(e) => setSurahSearchQuery(e.target.value)}
                  placeholder="সূরার নাম বা নম্বর (যেমন: ৩৬)..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Surah Badges Carousel / Grid */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
              {filteredSurahList.map((surah) => {
                const isSelected = surah.id === selectedSurahId;
                return (
                  <button
                    key={surah.id}
                    onClick={() => setSelectedSurahId(surah.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all shrink-0 min-w-[130px] sm:min-w-[150px] ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-md scale-102'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-emerald-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                      }`}>
                        #{toBengaliNumerals(surah.id)}
                      </span>
                      <span className={`text-[10px] ${isSelected ? 'text-emerald-100' : 'text-slate-400'}`}>
                        {surah.revelation}
                      </span>
                    </div>

                    <div className="font-bold text-xs mt-1 truncate">
                      {surah.nameBn}
                    </div>

                    <div className={`font-arabic text-sm font-semibold truncate ${isSelected ? 'text-amber-200' : 'text-emerald-700 dark:text-emerald-400'}`}>
                      {surah.nameAr}
                    </div>

                    <div className={`text-[10px] truncate mt-0.5 ${isSelected ? 'text-emerald-100 opacity-90' : 'text-slate-500 dark:text-slate-400'}`}>
                      {toBengaliNumerals(surah.versesCount)} টি আয়াত
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Surah Presentation & Verses Reader */}
          {loadingSurah ? (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-emerald-600" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                সূরা লোড হচ্ছে...
              </p>
            </div>
          ) : currentSurahDetail ? (
            <div className={`p-5 sm:p-8 rounded-3xl border shadow-md transition-colors ${getReaderStyle()}`}>
              {/* Surah Header Card */}
              <div className="text-center pb-6 border-b border-current/10">
                <div className="flex flex-wrap items-center justify-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    সূরা নং {toBengaliNumerals(currentSurahDetail.id)} • {currentSurahDetail.revelation} • {toBengaliNumerals(currentSurahDetail.versesCount)} টি আয়াত
                  </span>
                  {isSurahAudioCached ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/40">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>{QURAN_AUDIO_CACHE_NAME}: অফলাইন অডিও প্রস্তুত (বাইট-রেঞ্জ সক্রিয়)</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/30">
                      <span>অডিও: প্লেয়ার থেকে এক ক্লিকে অফলাইনে সেভ করুন</span>
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mt-2">
                  {currentSurahDetail.nameBn}
                </h2>
                <div className="font-arabic text-3xl sm:text-5xl text-emerald-600 dark:text-emerald-400 mt-2 font-bold leading-relaxed">
                  {currentSurahDetail.nameAr}
                </div>
                <p className="text-xs sm:text-sm opacity-80 mt-1">
                  অর্থ: {currentSurahDetail.meaning}
                </p>

                {/* Embedded Quranic Audio Player with progress tracking & controls */}
                <div className="mt-4 text-left">
                  <QuranAudioPlayer 
                    surah={activeSurahMeta} 
                    verses={currentSurahDetail.verses}
                    activeVerseId={activeSpeakingVerseId}
                    onActiveVerseChange={setActiveSpeakingVerseId}
                    requestedVerseId={requestedVerseId}
                    onClearRequestedVerse={() => setRequestedVerseId(null)}
                    autoScroll={autoScroll}
                    onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
                    onCacheStatusChange={setIsSurahAudioCached}
                  />
                </div>

                {/* Bismillah Header (except for Surah At-Tawbah #9) */}
                {currentSurahDetail.id !== 9 && (
                  <div className="font-arabic text-2xl sm:text-3xl text-emerald-700 dark:text-emerald-400 my-6 py-2 border-y border-current/10">
                    بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                  </div>
                )}
              </div>

              {/* Verses Stack */}
              <div className="divide-y divide-current/10 mt-6 space-y-6">
                {currentSurahDetail.verses.map((verse) => {
                  const isCurrentActive = activeSpeakingVerseId === verse.id;
                  return (
                    <div 
                      key={verse.id} 
                      id={`verse-${verse.id}`}
                      className={`pt-6 first:pt-0 space-y-3 group transition-all duration-300 rounded-2xl p-4 ${
                        isCurrentActive
                          ? 'bg-amber-100/80 dark:bg-emerald-950/90 ring-2 ring-amber-400 dark:ring-emerald-400 shadow-lg scale-[1.01]'
                          : 'hover:bg-slate-500/5'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full font-mono text-xs font-bold border transition ${
                            isCurrentActive
                              ? 'bg-amber-400 text-slate-950 border-amber-500 scale-110 shadow-sm'
                              : 'bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                          }`}>
                            {toBengaliNumerals(verse.id)}
                          </span>
                          {isCurrentActive && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-200/70 dark:bg-amber-950/80 border border-amber-400/40 px-2 py-0.5 rounded-full animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                              বর্তমানে পাঠ হচ্ছে
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Play this verse button */}
                          <button
                            onClick={() => setRequestedVerseId(verse.id)}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition border ${
                              isCurrentActive
                                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm'
                                : 'bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                            }`}
                            title={`আয়াত নং ${toBengaliNumerals(verse.id)} থেকে অডিও শুনুন`}
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>শুনুন</span>
                          </button>

                          {/* Copy verse */}
                          <button
                            onClick={() => handleCopy(`${verse.ar}\nউচ্চারণ: ${verse.pronounce}\nঅর্থ: ${verse.bn}`, `v_${verse.id}`)}
                            className="p-1.5 rounded-lg opacity-50 group-hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition"
                            title="আয়াত, উচ্চারণ ও অর্থ কপি করুন"
                          >
                            {copiedId === `v_${verse.id}` ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                    {/* Arabic Text */}
                    <div
                      dir="rtl"
                      className={`font-arabic text-right leading-loose tracking-wide text-emerald-900 dark:text-emerald-100 font-medium ${getArabicSize()}`}
                    >
                      {verse.ar}
                    </div>

                    {/* Pronunciation in Bengali */}
                    {showPronounce && (
                      <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-sm sm:text-base font-semibold">
                        <span className="text-xs uppercase tracking-wider text-amber-800 dark:text-amber-400 block font-bold mb-0.5">
                          উচ্চারণ:
                        </span>
                        {verse.pronounce}
                      </div>
                    )}

                    {/* Meaning in Bengali */}
                    {showMeaning && (
                      <div className={`font-medium leading-relaxed ${getTextSize()}`}>
                        <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">
                          অর্থ:
                        </span>
                        {verse.bn}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Comprehensive Dua App View */}
      {activeTab === 'dua' && (
        <DuaAppSection language={language} />
      )}

    </div>
  );
};
