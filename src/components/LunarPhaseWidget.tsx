import React, { useState, useMemo } from 'react';
import {
  Moon,
  Sparkles,
  Calendar,
  Info,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Compass,
  Star,
  CheckCircle2,
  Clock
} from 'lucide-react';
import {
  estimateLunarPhase,
  ALL_LUNAR_PHASES,
  LunarPhaseInfo
} from '../utils/lunarCalculator';
import { toBengaliNumerals, getApproxHijriDate } from '../utils/prayerCalculator';
import { Language } from '../types/mosque';

interface LunarPhaseWidgetProps {
  currentDate?: Date;
  language?: Language;
}

export const LunarPhaseWidget: React.FC<LunarPhaseWidgetProps> = ({
  currentDate = new Date(),
  language = 'bn'
}) => {
  // Allow interactive offset to check upcoming/past days in the lunar cycle
  const [dayOffset, setDayOffset] = useState<number>(0);
  const [showDuaModal, setShowDuaModal] = useState<boolean>(false);

  // Compute targeted date based on offset
  const activeDate = useMemo(() => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + dayOffset);
    return d;
  }, [currentDate, dayOffset]);

  // Compute lunar phase info
  const lunarInfo: LunarPhaseInfo = useMemo(() => {
    return estimateLunarPhase(activeDate);
  }, [activeDate]);

  // Compute corresponding Hijri Date
  const hijriDate = useMemo(() => {
    return getApproxHijriDate(activeDate);
  }, [activeDate]);

  // Reset offset to live today
  const handleResetToToday = () => {
    setDayOffset(0);
  };

  /**
   * Dynamic SVG Moon rendering with accurate phase terminator curve
   * R = 40 (circle center at cx=50, cy=50)
   */
  const renderMoonSvg = (size = 110) => {
    const cx = 50;
    const cy = 50;
    const r = 42;

    const { isWaxing, illuminationPercent, fraction } = lunarInfo;

    // Calculate terminator control
    // If illumination is 0% (New Moon): all dark
    // If illumination is 100% (Full Moon): all illuminated
    const isNew = illuminationPercent <= 1;
    const isFull = illuminationPercent >= 99;

    let litPath = '';

    if (isNew) {
      litPath = '';
    } else if (isFull) {
      litPath = `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx} ${cy + r} A ${r} ${r} 0 1 1 ${cx} ${cy - r}`;
    } else {
      // Terminator x radius: r * |1 - 2 * fraction|
      const termRx = Math.abs(r * (1 - 2 * fraction));
      const sweepOuter = isWaxing ? 1 : 0;
      // If fraction < 0.25 or fraction > 0.75 (crescent), inner ellipse sweeps opposite
      const isCrescent = fraction < 0.25 || fraction > 0.75;
      const sweepInner = isWaxing ? (isCrescent ? 0 : 1) : (isCrescent ? 1 : 0);

      // Path from top pole (cx, cy-r) down to bottom pole (cx, cy+r) via outer circle, then back via terminator ellipse
      litPath = `
        M ${cx} ${cy - r}
        A ${r} ${r} 0 0 ${sweepOuter} ${cx} ${cy + r}
        A ${termRx} ${r} 0 0 ${sweepInner} ${cx} ${cy - r}
        Z
      `;
    }

    return (
      <svg
        viewBox="0 0 100 100"
        width={size}
        height={size}
        className="drop-shadow-lg transition-transform duration-500 hover:scale-105 select-none"
      >
        <defs>
          {/* Subtle Outer Glow */}
          <filter id="moonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          {/* Lit Surface Gradient */}
          <radialGradient id="moonLitGradient" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="55%" stopColor="#fef08a" />
            <stop offset="85%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#eab308" />
          </radialGradient>

          {/* Dark Surface Gradient */}
          <radialGradient id="moonDarkGradient" cx="60%" cy="65%" r="65%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="70%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>

          {/* Clip to Moon Circle */}
          <clipPath id="moonClip">
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>

        {/* Ambient Moon Aura */}
        <circle
          cx={cx}
          cy={cy}
          r={r + 3}
          fill="none"
          stroke={isFull ? '#facc15' : '#38bdf8'}
          strokeWidth="1.5"
          strokeOpacity={isFull ? '0.4' : '0.2'}
          filter="url(#moonGlow)"
        />

        {/* Dark Body Base */}
        <circle cx={cx} cy={cy} r={r} fill="url(#moonDarkGradient)" stroke="#334155" strokeWidth="1" />

        {/* Dark side subtle craters */}
        <g clipPath="url(#moonClip)" opacity="0.3">
          <circle cx="36" cy="38" r="7" fill="#020617" />
          <circle cx="62" cy="42" r="10" fill="#020617" />
          <circle cx="48" cy="65" r="8" fill="#020617" />
          <circle cx="68" cy="68" r="5" fill="#020617" />
          <circle cx="30" cy="58" r="4" fill="#020617" />
        </g>

        {/* Illuminated portion */}
        {litPath && (
          <path
            d={litPath}
            fill="url(#moonLitGradient)"
            clipPath="url(#moonClip)"
            filter={illuminationPercent > 80 ? 'url(#moonGlow)' : undefined}
          />
        )}

        {/* Surface textures on lit side */}
        {illuminationPercent > 15 && (
          <g clipPath="url(#moonClip)" opacity="0.12" fill="#713f12">
            <circle cx="42" cy="35" r="6" />
            <circle cx="58" cy="44" r="8" />
            <circle cx="45" cy="62" r="7" />
            <circle cx="62" cy="65" r="5" />
          </g>
        )}

        {/* Outer Rim */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#64748b" strokeWidth="0.8" opacity="0.4" />
      </svg>
    );
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white p-5 sm:p-6 shadow-xl border border-indigo-900/60 transition-all">
      {/* Decorative starry / celestial glow */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      {/* Widget Header with Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-900/60">
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
            <Moon className="w-5 h-5 text-indigo-300" />
          </span>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                <span>চাঁদের দশা ও ইসলামিক হিজরি ক্যালেন্ডার</span>
              </h3>
              {lunarInfo.isHilal && (
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 animate-pulse">
                  🌙 হিলাল / নবচন্দ্র
                </span>
              )}
            </div>
            <p className="text-xs text-indigo-200/70">
              চাঁদের দৃশ্যমান আলোকিত পর্যায়, আইয়ামে বিজ ও আরবি তারিখ পর্যবেক্ষণ
            </p>
          </div>
        </div>

        {/* Date Stepper Controls */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto bg-slate-950/70 p-1 rounded-2xl border border-indigo-900/80">
          <button
            onClick={() => setDayOffset((prev) => prev - 1)}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 transition"
            title="পূর্ববর্তী দিন"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold px-2 font-mono text-indigo-200 whitespace-nowrap">
            {dayOffset === 0
              ? 'আজকের চাঁদ'
              : dayOffset > 0
              ? `+${toBengaliNumerals(dayOffset)} দিন পর`
              : `${toBengaliNumerals(Math.abs(dayOffset))} দিন পূর্বে`}
          </span>

          <button
            onClick={() => setDayOffset((prev) => prev + 1)}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 transition"
            title="পরবর্তী দিন"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {dayOffset !== 0 && (
            <button
              onClick={handleResetToToday}
              className="px-2 py-1 ml-1 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 text-[11px] font-bold text-white transition flex items-center gap-1"
              title="আজকের তারিখে ফিরুন"
            >
              <RotateCcw className="w-3 h-3" />
              <span>আজ</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Body: Moon Graphic + Primary Phase Details */}
      <div className="py-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Left Column: Visual Moon Sphere */}
        <div className="md:col-span-5 flex flex-col items-center justify-center text-center p-3 sm:p-4 rounded-2xl bg-slate-950/50 border border-indigo-900/40">
          <div className="relative mb-2">
            {renderMoonSvg(115)}
            <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-slate-900/90 border border-indigo-500/50 text-[10px] font-mono font-bold text-amber-300 shadow-sm">
              {toBengaliNumerals(lunarInfo.illuminationPercent)}% আলোকিত
            </div>
          </div>

          <div className="mt-1">
            <h4 className="text-base sm:text-lg font-black text-amber-300 tracking-wide">
              {lunarInfo.phaseNameBn}
            </h4>
            <div className="text-xs font-semibold text-indigo-200/90 mt-0.5">
              {lunarInfo.phaseNameEn} • <span className="font-arabic text-amber-200/80">{lunarInfo.phaseNameAr}</span>
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-2 text-[11px] text-slate-400">
            <span>চাঁদের বয়স: <strong className="text-white font-mono">{toBengaliNumerals(lunarInfo.ageDays)} দিন</strong> / ২৯.৫</span>
            <span>•</span>
            <span className="text-emerald-400 font-semibold">
              {lunarInfo.isWaxing ? 'বৃদ্ধি পাচ্ছে (Waxing)' : 'হ্রাস পাচ্ছে (Waning)'}
            </span>
          </div>
        </div>

        {/* Right Column: Islamic Calendar Context & Next Milestones */}
        <div className="md:col-span-7 space-y-3">
          {/* Hijri Date Spotlight Card */}
          <div className="p-3.5 rounded-2xl bg-indigo-900/30 border border-indigo-700/50 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] text-indigo-300 font-medium flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>সংশ্লিষ্ট হিজরি ক্যালেন্ডার তারিখ:</span>
              </span>
              <div className="text-base sm:text-lg font-black text-white">
                {toBengaliNumerals(hijriDate.day)} {hijriDate.monthBn} {toBengaliNumerals(hijriDate.year)} হিজরি
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-arabic text-amber-200/80">
                {hijriDate.monthAr}
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800/60 font-mono">
                চাঁদের {toBengaliNumerals(lunarInfo.approxHijriDay)}ম দিন
              </span>
            </div>
          </div>

          {/* Ayyam al-Beed (White Days) Sunnah Fasting Banner */}
          {lunarInfo.isAyyamAlBeed ? (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950 to-teal-950 border border-emerald-500/50 flex items-start gap-2.5 shadow-md animate-pulse">
              <Star className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5 fill-emerald-400" />
              <div className="text-xs">
                <strong className="text-emerald-300 block font-bold text-xs">
                  🌟 আজ আইয়ামে বিজের বরকতময় দিন (১৩, ১৪ ও ১৫ তারিখ)!
                </strong>
                <p className="text-emerald-100/80 text-[11px] mt-0.5">
                  প্রতি আরবি মাসের ১৩, ১৪ ও ১৫ তারিখে রোজা রাখা সুন্নাতে মুয়াক্কাদা। এটি সারা বছর রোজা রাখার সমান সওয়াব বয়ে আনে।
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-slate-950/40 border border-indigo-900/50 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-slate-300 font-semibold">পরবর্তী আইয়ামে বিজ (১৩, ১৪, ১৫ তারিখ):</span>
                  <p className="text-[11px] text-slate-400">
                    পূর্ণিমার ৩ দিনের মুস্তাহাব সুন্নত রোজা
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs font-black font-mono text-amber-300">
                  {lunarInfo.approxHijriDay < 13
                    ? `আর ${toBengaliNumerals(13 - lunarInfo.approxHijriDay)} দিন বাকি`
                    : `পরবর্তী মাসে`}
                </span>
              </div>
            </div>
          )}

          {/* Quick Stats Grid: Next Full Moon & Next New Moon */}
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            {/* Next Full Moon */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-indigo-900/60">
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>পরবর্তী পূর্ণিমা (বদর):</span>
                <span>🌕</span>
              </div>
              <div className="text-sm font-bold text-white mt-1">
                {lunarInfo.isFullMoonBadr ? (
                  <span className="text-amber-300 font-extrabold">আজ পূর্ণিমার রাত!</span>
                ) : (
                  <span>
                    আর <strong className="text-amber-300 font-mono text-base">{toBengaliNumerals(Math.round(lunarInfo.daysUntilNextFullMoon))}</strong> দিন পর
                  </span>
                )}
              </div>
            </div>

            {/* Next New Moon (Next Hijri Month) */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-indigo-900/60">
              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>পরবর্তী হিজরি নতুন চাঁদ:</span>
                <span>🌙</span>
              </div>
              <div className="text-sm font-bold text-white mt-1">
                <span>
                  আর <strong className="text-emerald-400 font-mono text-base">{toBengaliNumerals(Math.round(lunarInfo.daysUntilNextNewMoon))}</strong> দিন পর
                </span>
              </div>
            </div>
          </div>

          {/* Islamic Significance Note & Du'a trigger */}
          <div className="text-[11px] text-indigo-200/80 bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-900/40 flex items-center justify-between">
            <div className="flex items-center gap-1.5 line-clamp-1">
              <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <span>{lunarInfo.islamicSignificanceBn}</span>
            </div>
            <button
              onClick={() => setShowDuaModal(true)}
              className="text-amber-400 hover:text-amber-300 font-bold whitespace-nowrap ml-2 underline text-[11px]"
            >
              চাঁদ দেখার দু'আ
            </button>
          </div>
        </div>
      </div>

      {/* 8-Phase Cycle Strip */}
      <div className="mt-2 pt-4 border-t border-indigo-900/60">
        <div className="flex items-center justify-between text-xs font-semibold text-indigo-300 mb-2">
          <span>২৯.৫ দিনের চন্দ্র পরিক্রমা ও বর্তমান অবস্থান</span>
          <span className="text-[11px] text-slate-400">
            অগ্রগতি: {toBengaliNumerals(Math.round(lunarInfo.fraction * 100))}%
          </span>
        </div>

        {/* Visual Progress Timeline Bar */}
        <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden mb-3 border border-indigo-900/50">
          <div
            className="bg-gradient-to-r from-indigo-500 via-amber-400 to-indigo-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.max(3, lunarInfo.fraction * 100)}%` }}
          />
        </div>

        {/* 8 Phases Mini Buttons */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 text-center">
          {ALL_LUNAR_PHASES.map((p) => {
            const isCurrent = p.key === lunarInfo.phaseKey;
            return (
              <div
                key={p.key}
                className={`p-2 rounded-xl border text-[10px] transition ${
                  isCurrent
                    ? 'bg-amber-400/20 border-amber-400/60 text-amber-200 shadow-md ring-1 ring-amber-400/50'
                    : 'bg-slate-950/40 border-indigo-900/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-base sm:text-lg mb-0.5">
                  {p.key === 'new_moon' && '🌑'}
                  {p.key === 'waxing_crescent' && '🌒'}
                  {p.key === 'first_quarter' && '🌓'}
                  {p.key === 'waxing_gibbous' && '🌔'}
                  {p.key === 'full_moon' && '🌕'}
                  {p.key === 'waning_gibbous' && '🌖'}
                  {p.key === 'last_quarter' && '🌗'}
                  {p.key === 'waning_crescent' && '🌘'}
                </div>
                <div className={`font-bold truncate ${isCurrent ? 'text-amber-300' : 'text-slate-300'}`}>
                  {p.nameBn}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sunnah Crescent Sighting Du'a Modal */}
      {showDuaModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-700/60 rounded-3xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-indigo-800/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-400/20 text-amber-300">
                  <Star className="w-4 h-4 fill-amber-300" />
                </span>
                <h4 className="text-base font-bold text-white">
                  নতুন চাঁদ (হিলাল) দেখার সুন্নাত দু'আ
                </h4>
              </div>
              <button
                onClick={() => setShowDuaModal(false)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-center space-y-3">
              <div className="text-lg sm:text-xl font-arabic text-amber-300 leading-relaxed dir-rtl" dir="rtl">
                اللَّهُمَّ أَهِلَّهُ عَلَيْنَا بِالأَمْنِ وَالإِيمَانِ، وَالسَّلامَةِ وَالإِسْلامِ، رَبِّي وَرَبُّكَ اللَّهُ
              </div>

              <div className="text-xs text-indigo-200 font-medium">
                <strong>উচ্চারণ:</strong> আল্লাহুম্মা আহিল্লাহু আলাইনা বিল আমনি ওয়াল ঈমান, ওয়াস সালামাতি ওয়াল ইসলাম, রাব্বী ওয়া রাব্বুকাল্লাহ।
              </div>

              <div className="text-xs text-slate-300 border-t border-slate-800 pt-2 text-left">
                <strong>অর্থ:</strong> "হে আল্লাহ! এই চাঁদকে আমাদের ওপর নিরাপত্তা, ঈমান, শান্তি ও ইসলামের সাথে উদিত করুন। (হে চাঁদ!) আমার ও তোমার রব এক আল্লাহ।"
              </div>

              <div className="text-[10px] text-amber-400 font-mono">
                সূত্র: জামে তিরমিযী (৩৪৫১), সুনানে দারেমী (১৭২৪) — হাসান হাদিস
              </div>
            </div>

            <button
              onClick={() => setShowDuaModal(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
