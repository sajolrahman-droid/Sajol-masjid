import React, { useState, useMemo } from 'react';
import { 
  Heart, 
  Volume2, 
  VolumeX, 
  Copy, 
  Check, 
  ChevronDown, 
  Search, 
  Clock, 
  BookOpen, 
  Sparkles,
  Share2
} from 'lucide-react';
import { COMPREHENSIVE_DUAS, DUA_CATEGORIES } from '../data/duasData';
import { DuaItem, Language } from '../types/mosque';

interface DuaAppSectionProps {
  language?: Language;
}

export const DuaAppSection: React.FC<DuaAppSectionProps> = ({ language = 'bn' }) => {
  const [activeCategory, setActiveCategory] = useState<string>('সকল');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [openDuaId, setOpenDuaId] = useState<number | null>(1); // Open first by default
  const [speakingDuaId, setSpeakingDuaId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Filtered duas
  const filteredDuas = useMemo(() => {
    let list = COMPREHENSIVE_DUAS;

    if (activeCategory !== 'সকল') {
      list = list.filter((d) => d.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (d) =>
          d.titleBn.toLowerCase().includes(q) ||
          d.bn.toLowerCase().includes(q) ||
          d.pronounce.toLowerCase().includes(q) ||
          d.ar.includes(q) ||
          (d.somoy && d.somoy.toLowerCase().includes(q)) ||
          d.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [activeCategory, searchQuery]);

  // Audio speech synthesis
  const handleSpeak = (dua: DuaItem, e: React.MouseEvent) => {
    e.stopPropagation();

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('আপনার ব্রাউজারে স্পিচ অডিও সাপোর্ট নেই।');
      return;
    }

    if (speakingDuaId === dua.id) {
      window.speechSynthesis.cancel();
      setSpeakingDuaId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(dua.ar);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.85;

    setSpeakingDuaId(dua.id);

    utterance.onend = () => {
      setSpeakingDuaId(null);
    };

    utterance.onerror = () => {
      setSpeakingDuaId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Copy dua to clipboard
  const handleCopy = (dua: DuaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `${dua.titleBn}\n(${dua.somoy ? `সময়: ${dua.somoy}` : ''})\n\n${dua.ar}\n\nউচ্চারণ: ${dua.pronounce}\n\nঅর্থ: ${dua.bn}\n\nসূত্র: ${dua.ref || 'হাদিস শরিফ'}`;
    navigator.clipboard.writeText(text);
    setCopiedId(dua.id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  // Toggle card open
  const toggleCard = (id: number) => {
    if (speakingDuaId) {
      window.speechSynthesis && window.speechSynthesis.cancel();
      setSpeakingDuaId(null);
    }
    setOpenDuaId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* 1. Header Banner mirroring attached app styling */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-950 text-white p-5 sm:p-7 shadow-xl border border-emerald-700/50 text-center">
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest text-amber-300 bg-amber-400/15 border border-amber-400/30 mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          দৈনন্দিন আমল ও মাসনূন দোয়া
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold font-serif text-white tracking-tight">
          দোয়া সমগ্র
        </h2>
        <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-lg mx-auto">
          ক্লিক করুন — সঠিক আরবি উচ্চারণ শুনুন এবং দৈনন্দিন জীবনের দোআগুলো সহজে পাঠ ও মুখস্থ করুন
        </p>

        {/* Bismillah Calligraphy */}
        <div 
          dir="rtl" 
          className="font-arabic text-xl sm:text-2xl text-amber-300 mt-3 font-semibold select-none"
        >
          بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
        </div>
      </div>

      {/* 2. Search & Category Rail */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="দোয়ার নাম, উচ্চারণ, অর্থ বা উপলক্ষ্য দিয়ে খুঁজুন (যেমন: খাবার, ঘুম, সফর)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              মুছে ফেলুন
            </button>
          )}
        </div>

        {/* Category Horizontal Chips Rail */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none snap-x">
          {DUA_CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer border ${
                  isActive
                    ? 'bg-emerald-700 dark:bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/60 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Dua List Count and Results */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1">
        <span>মোট দোয়া: <strong className="text-slate-800 dark:text-white">{filteredDuas.length}</strong>টি</span>
        <span>স্পিকার বাটনে চাপ দিলে ব্রাউজার আরবি পড়ে শোনাবে</span>
      </div>

      {/* 4. Duas Accordion Cards */}
      {filteredDuas.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800">
          কোনো দোয়া পাওয়া যায়নি। অন্য শব্দ দিয়ে অনুসন্ধান করুন।
        </div>
      ) : (
        <div className="space-y-3">
          {filteredDuas.map((dua) => {
            const isOpen = openDuaId === dua.id;
            const isSpeaking = speakingDuaId === dua.id;
            const isCopied = copiedId === dua.id;

            return (
              <div
                key={dua.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden bg-white dark:bg-slate-900 ${
                  isOpen
                    ? 'border-amber-400 dark:border-amber-600 shadow-md ring-1 ring-amber-400/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                {/* Header row (Clickable) */}
                <div
                  onClick={() => toggleCard(dua.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 tracking-wide">
                        {dua.category}
                      </span>
                      {dua.somoy && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-900">
                          <Clock className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          {dua.somoy}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white truncate">
                      {dua.titleBn}
                    </h3>
                  </div>

                  {/* Actions & Chevron */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleCopy(dua, e)}
                      title="দোয়া কপি করুন"
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    >
                      {isCopied ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center border transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-180 bg-emerald-700 text-white border-emerald-700'
                          : 'border-slate-200 dark:border-slate-700 text-slate-500'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-3.5 animate-in fade-in duration-200">
                    {/* Arabic Text Box */}
                    <div
                      dir="rtl"
                      className="font-arabic text-xl sm:text-2xl text-right leading-loose text-emerald-950 dark:text-emerald-100 p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border-r-4 border-amber-500 border border-amber-200/50 dark:border-amber-900/40"
                    >
                      {dua.ar}
                    </div>

                    {/* Pronunciation */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        উচ্চারণ:
                      </span>
                      <p className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                        {dua.pronounce}
                      </p>
                    </div>

                    {/* Meaning */}
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        অর্থ:
                      </span>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                        {dua.bn}
                      </p>
                    </div>

                    {/* Reference & Occasion footer */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400">
                      <div>
                        {dua.ref ? `সূত্র: ${dua.ref}` : 'সূত্র: সহীহ হাদীস ও মাসনূন আমল'}
                      </div>
                      {dua.somoy && (
                        <div className="font-semibold text-emerald-700 dark:text-emerald-400">
                          আমলের সময়: {dua.somoy}
                        </div>
                      )}
                    </div>

                    {/* Listen Arabic Pronunciation Button */}
                    <button
                      onClick={(e) => handleSpeak(dua, e)}
                      className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition active:scale-98 shadow-sm ${
                        isSpeaking
                          ? 'bg-amber-500 text-slate-950 animate-pulse'
                          : 'bg-emerald-700 hover:bg-emerald-600 text-white'
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-4 h-4" />
                          <span>উচ্চারণ পড়া হচ্ছে... (বন্ধ করতে চাপুন)</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-4 h-4" />
                          <span>আরবি উচ্চারণ শুনুন (অডিও)</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Info */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        💡 স্পিকার বাটনে চাপ দিলে ব্রাউজারের কৃত্রিম বুদ্ধিমত্তা টেক্সট-টু-স্পিচ (TTS) প্রযুক্তি দ্বারা বিশুদ্ধ আরবি উচ্চারণ পড়ে শোনানো হবে (ডিভাইস সাপোর্ট সাপেক্ষে)।
      </div>
    </div>
  );
};
