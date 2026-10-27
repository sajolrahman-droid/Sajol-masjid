import React, { useState } from 'react';
import { Sparkles, X, Share2, Check, BookOpen, Sunrise, Bell, BellOff, ChevronLeft, ChevronRight } from 'lucide-react';
import { DAILY_HADITHS, DailyHadith, getDailyHadith } from '../utils/dailyHadithService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  fajrHadithAlertEnabled: boolean;
  onToggleFajrAlert: (enabled: boolean) => void;
  language?: 'bn' | 'en' | 'ar';
}

export const DailyHadithModal: React.FC<Props> = ({
  isOpen,
  onClose,
  fajrHadithAlertEnabled,
  onToggleFajrAlert,
  language = 'bn',
}) => {
  const initialHadith = getDailyHadith();
  const [currentIndex, setCurrentIndex] = useState(
    DAILY_HADITHS.findIndex(h => h.id === initialHadith.id) || 0
  );
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentHadith: DailyHadith = DAILY_HADITHS[currentIndex] || initialHadith;

  const handleCopy = () => {
    const textToCopy = `🕌 ফজরের দৈনিক হাদিস ও অনুপ্রেরণা:\n\n"${currentHadith.bangla}"\n\n— ${currentHadith.source} (${currentHadith.narrator})\n\n💡 আজকের শিক্ষা: ${currentHadith.morningReflection}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrev = () => {
    setCurrentIndex(prev => (prev > 0 ? prev - 1 : DAILY_HADITHS.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev < DAILY_HADITHS.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Sunrise & Islamic theme */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-white/15 rounded-xl backdrop-blur-xs">
                <Sunrise className="w-6 h-6 text-amber-300 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-emerald-200 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  দৈনিক ভোরের অনুপ্রেরণা
                </span>
                <h3 className="text-lg font-bold">ফজরের সহীহ হাদিস ও প্রাত্যহিক চিন্তা</h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Badge & Topic */}
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              <BookOpen className="w-3 h-3" />
              {currentHadith.topic}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              হাদিস নং {currentIndex + 1} / {DAILY_HADITHS.length}
            </span>
          </div>

          {/* Arabic Matn */}
          <div className="p-4 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-center">
            <p className="font-arabic text-xl md:text-2xl text-amber-950 dark:text-amber-200 leading-relaxed font-semibold">
              {currentHadith.arabic}
            </p>
          </div>

          {/* Bangla & English Translation */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              অনুবাদ ও অর্থ:
            </h4>
            <p className="text-base font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
              "{currentHadith.bangla}"
            </p>
            {language !== 'bn' && (
              <p className="text-xs text-slate-600 dark:text-slate-400 italic">
                "{currentHadith.english}"
              </p>
            )}
          </div>

          {/* Narrator & Source */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">বর্ণনাকারী: </span>
              {currentHadith.narrator}
            </div>
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-200">সূত্র: </span>
              {currentHadith.source}
            </div>
          </div>

          {/* Morning Reflection / Amal takeaway */}
          <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-xs md:text-sm text-emerald-950 dark:text-emerald-200">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-amber-500" />
              আজকের আত্মশুদ্ধি ও শিক্ষা:
            </div>
            <p className="leading-relaxed">{currentHadith.morningReflection}</p>
          </div>

          {/* Automated Post-Fajr Alert Setting Toggle */}
          <div className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {fajrHadithAlertEnabled ? (
                <Bell className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <BellOff className="w-4 h-4 text-slate-400" />
              )}
              <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                প্রতিদিন ফজরের পর স্বয়ংক্রিয় নোটিফিকেশন পাঠান
              </span>
            </div>
            <button
              onClick={() => onToggleFajrAlert(!fajrHadithAlertEnabled)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                fajrHadithAlertEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  fajrHadithAlertEnabled ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={handlePrev}
              title="পূর্ববর্তী হাদিস"
              className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              title="পরবর্তী হাদিস"
              className="p-2 rounded-lg bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              <span>{copied ? 'কপি হয়েছে' : 'শেয়ার / কপি'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
