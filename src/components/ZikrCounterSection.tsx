import React, { useState } from 'react';
import { 
  CircleDot, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Vibrate, 
  Sparkles, 
  Award, 
  Plus, 
  Check, 
  Undo2,
  Trash2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { PRESET_ZIKRS } from '../data/islamicData';
import { toBengaliNumerals } from '../utils/prayerCalculator';
import { Language } from '../types/mosque';

interface ZikrCounterSectionProps {
  zikrCounts: Record<string, number>;
  onUpdateCounts: (counts: Record<string, number>) => void;
  language: Language;
}

export const ZikrCounterSection: React.FC<ZikrCounterSectionProps> = ({
  zikrCounts,
  onUpdateCounts,
  language
}) => {
  const [selectedZikrId, setSelectedZikrId] = useState<string>('subhanallah');
  const [targetCount, setTargetCount] = useState<number>(33);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(true);
  const [laps, setLaps] = useState<number>(0);
  const [showResetNotice, setShowResetNotice] = useState<boolean>(false);

  const activeZikr = PRESET_ZIKRS.find((z) => z.id === selectedZikrId) || PRESET_ZIKRS[0];
  const count = zikrCounts[selectedZikrId] || 0;

  // Sound click effect using AudioContext
  const playClickSound = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.09);
    } catch {
      // Audio not allowed
    }
  };

  // Vibration feedback
  const triggerVibrate = (pattern: number | number[]) => {
    if (vibrationEnabled && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {
        // Ignored
      }
    }
  };

  const handleIncrement = () => {
    playClickSound();
    const nextCount = count + 1;
    const newCounts = { ...zikrCounts, [selectedZikrId]: nextCount };
    onUpdateCounts(newCounts);

    // If target reached!
    if (targetCount > 0 && nextCount % targetCount === 0) {
      setLaps((prev) => prev + 1);
      triggerVibrate([50, 40, 100]);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });
    } else {
      triggerVibrate(25);
    }
  };

  const handleDecrement = () => {
    if (count <= 0) return;
    const newCounts = { ...zikrCounts, [selectedZikrId]: count - 1 };
    onUpdateCounts(newCounts);
    triggerVibrate(15);
  };

  // Reset active Zikr counter to 0
  const handleResetCurrent = () => {
    const newCounts = { ...zikrCounts, [selectedZikrId]: 0 };
    onUpdateCounts(newCounts);
    setLaps(0);
    triggerVibrate([30, 20, 30]);
    setShowResetNotice(true);
    setTimeout(() => setShowResetNotice(false), 2200);
  };

  // Reset ALL Zikrs to 0
  const handleResetAll = () => {
    if (confirm(language === 'bn' ? 'আপনি কি সকল জিকিরের সংখ্যা শূন্য (০) করতে চান?' : 'Reset all Zikr counts to 0?')) {
      onUpdateCounts({});
      setLaps(0);
      triggerVibrate([50, 30, 50]);
      setShowResetNotice(true);
      setTimeout(() => setShowResetNotice(false), 2200);
    }
  };

  const progressPercent = targetCount > 0 ? Math.min(100, ((count % targetCount) / targetCount) * 100) : 100;

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Reset Notification Popup */}
      {showResetNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-rose-900 text-white border border-rose-600 px-4 py-2 rounded-full text-xs font-bold shadow-2xl animate-in fade-in slide-in-from-top-2 flex items-center gap-1.5">
          <RotateCcw className="w-4 h-4 animate-spin-slow" />
          <span>কাউন্টার রিসেট করা হয়েছে (০)</span>
        </div>
      )}

      {/* Preset Selector Carousel */}
      <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-2 px-1 text-xs">
          <span className="font-bold text-slate-500 dark:text-slate-400">
            {language === 'bn' ? 'জিকির নির্বাচন করুন:' : 'Select Zikr:'}
          </span>
          <button
            type="button"
            onClick={handleResetAll}
            className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{language === 'bn' ? 'সব রিসেট (০)' : 'Reset All to 0'}</span>
          </button>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {PRESET_ZIKRS.map((zikr) => {
            const isSelected = zikr.id === selectedZikrId;
            const currentCnt = zikrCounts[zikr.id] || 0;

            return (
              <button
                key={zikr.id}
                type="button"
                onClick={() => {
                  setSelectedZikrId(zikr.id);
                  setTargetCount(zikr.target);
                  setLaps(0);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shrink-0 border relative ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span>{zikr.bn}</span>
                  {currentCnt > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      {toBengaliNumerals(currentCnt)}
                    </span>
                  )}
                </div>
                <span className="block text-[10px] opacity-80 font-normal mt-0.5">
                  লক্ষ্য: {toBengaliNumerals(zikr.target)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Big Tactile Tap Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-emerald-800 via-emerald-900 to-teal-950 text-white shadow-2xl border border-emerald-700/60 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 rounded-full bg-emerald-400/10 blur-3xl pointer-events-none" />

        {/* Selected Zikr in Arabic & Bengali */}
        <div className="text-center mb-6">
          <div className="font-arabic text-3xl sm:text-4xl text-amber-300 mb-1 leading-relaxed">
            {activeZikr.ar}
          </div>
          <div className="text-lg sm:text-xl font-bold text-white">
            {activeZikr.bn}
          </div>
          <div className="text-xs text-emerald-200/80 mt-0.5">
            "{activeZikr.meaning}"
          </div>
        </div>

        {/* Big Clickable Circular Counter for seniors */}
        <button
          type="button"
          onClick={handleIncrement}
          className="relative w-52 h-52 sm:w-60 sm:h-60 rounded-full bg-gradient-to-b from-emerald-600 to-emerald-800 shadow-[0_10px_30px_rgba(0,0,0,0.5),inset_0_2px_4px_rgba(255,255,255,0.3)] border-4 border-emerald-400/40 flex flex-col items-center justify-center cursor-pointer active:scale-95 transition select-none group touch-manipulation"
          aria-label="Tap to count Zikr"
        >
          {/* Circular progress track */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1">
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              className="stroke-emerald-950/60"
              strokeWidth="6"
              fill="transparent"
            />
            <circle
              cx="50%"
              cy="50%"
              r="46%"
              className="stroke-amber-400 transition-all duration-300"
              strokeWidth="6"
              strokeDasharray={2 * Math.PI * 115}
              strokeDashoffset={2 * Math.PI * 115 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              fill="transparent"
            />
          </svg>

          <span className="text-xs font-bold uppercase tracking-wider text-emerald-200 group-hover:text-white transition">
            স্পর্শ করুন (ট্যাপ)
          </span>

          <span className="text-5xl sm:text-6xl font-extrabold font-mono text-white my-1 tracking-tight">
            {toBengaliNumerals(count)}
          </span>

          <span className="text-xs font-semibold text-amber-300">
            লক্ষ্য: {toBengaliNumerals(targetCount)} | ল্যাপ: {toBengaliNumerals(laps)}
          </span>
        </button>

        {/* Audio, Vibration, Decrement & RESET AT 0 Controls */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition ${
              soundEnabled
                ? 'bg-emerald-700/80 text-amber-300 border-emerald-500'
                : 'bg-emerald-950/60 text-slate-400 border-emerald-800'
            }`}
            title="সাউন্ড অন/অফ"
          >
            {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>

          <button
            type="button"
            onClick={() => setVibrationEnabled(!vibrationEnabled)}
            className={`p-2.5 rounded-xl border transition ${
              vibrationEnabled
                ? 'bg-emerald-700/80 text-amber-300 border-emerald-500'
                : 'bg-emerald-950/60 text-slate-400 border-emerald-800'
            }`}
            title="ভাইব্রেশন অন/অফ"
          >
            <Vibrate className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleDecrement}
            disabled={count <= 0}
            className="px-3 py-2.5 rounded-xl bg-emerald-700/80 hover:bg-emerald-600 disabled:opacity-40 text-white border border-emerald-500 transition text-xs font-bold flex items-center gap-1"
            title="একটি সংখ্যা কমান (-১)"
          >
            <Undo2 className="w-4 h-4" />
            <span>-১ কমান</span>
          </button>

          {/* Prominent Reset at 0 Button */}
          <button
            type="button"
            onClick={handleResetCurrent}
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white border border-rose-400 transition text-xs font-extrabold flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
            title="কাউন্টার ০ তে রিসেট করুন (Reset to 0)"
          >
            <RotateCcw className="w-4 h-4" />
            <span>রিসেট (০)</span>
          </button>

          <button
            type="button"
            onClick={handleResetAll}
            className="px-3 py-2.5 rounded-xl bg-emerald-950/90 hover:bg-rose-950 text-rose-200 hover:text-rose-100 border border-rose-800/80 transition text-xs font-semibold flex items-center gap-1 cursor-pointer"
            title="সকল জিকিরের সংখ্যা ০ তে রিসেট করুন"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>সব জিকির রিসেট</span>
          </button>
        </div>

        {/* Target Options */}
        <div className="mt-5 pt-4 border-t border-emerald-700/60 w-full flex items-center justify-center gap-2">
          <span className="text-xs text-emerald-200">টার্গেট পরিবর্তন:</span>
          {[33, 100, 1000].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTargetCount(t);
                setLaps(0);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                targetCount === t
                  ? 'bg-amber-400 text-slate-950 font-extrabold shadow-sm'
                  : 'bg-emerald-950/80 text-emerald-200 hover:bg-emerald-900 border border-emerald-700/50'
              }`}
            >
              {toBengaliNumerals(t)}
            </button>
          ))}
        </div>
      </div>

      {/* Virtue Card */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 text-xs sm:text-sm">
        <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-1">
          <Award className="w-4 h-4 text-amber-600" />
          <span>এই জিকিরের ফজিলত ও তাৎপর্য:</span>
        </h4>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
          {activeZikr.virtue}
        </p>
      </div>
    </div>
  );
};
