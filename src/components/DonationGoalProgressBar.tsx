import React, { useState } from 'react';
import { 
  Target, 
  TrendingUp, 
  Edit3, 
  Check, 
  X, 
  Heart, 
  Calendar, 
  Sparkles, 
  RotateCcw, 
  Clock, 
  Award,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { AppStateData, MosqueSettings, MosqueDonationGoal, Language } from '../types/mosque';
import { toBengaliNumerals } from '../utils/prayerCalculator';

interface DonationGoalProgressBarProps {
  appState: AppStateData;
  onUpdateSettings: (newSettings: Partial<MosqueSettings>) => void;
  language: Language;
  onOpenDonate?: () => void;
  className?: string;
}

export const DEFAULT_DONATION_GOAL: MosqueDonationGoal = {
  title: 'মসজিদ সংস্কার, উন্নয়ন ও দ্বিতীয় তলার সম্প্রসারণ তহবিল',
  targetAmount: 500000, // ৳ 5,00,000
  scope: 'total_income',
  deadlineDate: '2026-12-31',
  note: 'আল্লাহর সন্তুষ্টি ও সদকায়ে জারিয়ার নিয়তে আপনার অনুদান প্রদান করুন।'
};

export const DonationGoalProgressBar: React.FC<DonationGoalProgressBarProps> = ({
  appState,
  onUpdateSettings,
  language,
  onOpenDonate,
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);

  // Active goal or default
  const goal: MosqueDonationGoal = appState.settings.donationGoal || DEFAULT_DONATION_GOAL;

  // Form states for editing
  const [tempTitle, setTempTitle] = useState(goal.title);
  const [tempTarget, setTempTarget] = useState<number | ''>(goal.targetAmount);
  const [tempScope, setTempScope] = useState<MosqueDonationGoal['scope']>(goal.scope);
  const [tempDeadline, setTempDeadline] = useState(goal.deadlineDate || '');
  const [tempNote, setTempNote] = useState(goal.note || '');

  // Currency helper
  const f = (n: number) => `৳ ${(Number(n) || 0).toLocaleString('bn-BD')}`;

  // Current month string
  const currentMonthStr = new Date().toISOString().slice(0, 7);

  // Calculate raised amount based on goal scope
  const raisedAmount = React.useMemo(() => {
    if (goal.scope === 'month_income') {
      return appState.tx
        .filter((t) => t.type === 'in' && t.date.startsWith(currentMonthStr))
        .reduce((sum, t) => sum + Number(t.amt), 0);
    } else if (goal.scope === 'development_cat') {
      return appState.tx
        .filter((t) => t.type === 'in' && (t.cat.includes('উন্নয়ন') || t.cat.includes('বিশেষ') || t.cat.includes('ধান')))
        .reduce((sum, t) => sum + Number(t.amt), 0);
    } else {
      // total_income
      return appState.tx
        .filter((t) => t.type === 'in')
        .reduce((sum, t) => sum + Number(t.amt), 0);
    }
  }, [appState.tx, goal.scope, currentMonthStr]);

  const targetAmount = goal.targetAmount || 1;
  const rawPercent = (raisedAmount / targetAmount) * 100;
  const percent = Math.min(100, Math.round(rawPercent));
  const remaining = Math.max(0, targetAmount - raisedAmount);

  // Donor count
  const donorCount = React.useMemo(() => {
    const uniqueDonors = new Set(appState.tx.filter((t) => t.type === 'in' && t.name).map((t) => t.name.trim()));
    return uniqueDonors.size || appState.ppl.length || 1;
  }, [appState.tx, appState.ppl]);

  // Days remaining calculation
  const daysRemaining = React.useMemo(() => {
    if (!goal.deadlineDate) return null;
    const end = new Date(goal.deadlineDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, [goal.deadlineDate]);

  // Save Goal Handler
  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const newGoal: MosqueDonationGoal = {
      title: tempTitle.trim() || DEFAULT_DONATION_GOAL.title,
      targetAmount: Number(tempTarget) || 500000,
      scope: tempScope,
      deadlineDate: tempDeadline,
      note: tempNote.trim()
    };

    onUpdateSettings({
      donationGoal: newGoal
    });
    setIsEditing(false);
  };

  // Preset Goal Selectors
  const handleApplyPreset = (amt: number, titleStr: string) => {
    setTempTarget(amt);
    setTempTitle(titleStr);
  };

  const handleResetToDefault = () => {
    setTempTitle(DEFAULT_DONATION_GOAL.title);
    setTempTarget(DEFAULT_DONATION_GOAL.targetAmount);
    setTempScope(DEFAULT_DONATION_GOAL.scope);
    setTempDeadline(DEFAULT_DONATION_GOAL.deadlineDate || '');
    setTempNote(DEFAULT_DONATION_GOAL.note || '');
  };

  return (
    <div className={`p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 ${className}`}>
      
      {/* Header & Goal Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shrink-0 shadow-md">
            <Target className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
                {goal.title}
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-extrabold border border-emerald-300 dark:border-emerald-800 shrink-0">
                {toBengaliNumerals(percent)}% অর্জিত
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {goal.note || 'মসজিদ কমিটির নির্ধারিত দান সংগ্রহের লক্ষ্যমাত্রা ও অগ্রগতির আপডেট'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          {onOpenDonate && (
            <button
              type="button"
              onClick={onOpenDonate}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
              <span>দান করুন</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setTempTitle(goal.title);
              setTempTarget(goal.targetAmount);
              setTempScope(goal.scope);
              setTempDeadline(goal.deadlineDate || '');
              setTempNote(goal.note || '');
              setIsEditing(!isEditing);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 transition"
            title="লক্ষ্যমাত্রা পরিবর্তন করুন (কমিটির জন্য)"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isEditing ? 'সম্পাদনা বন্ধ' : 'গোল সেট করুন'}</span>
          </button>
        </div>
      </div>

      {/* Editing Form Panel */}
      {isEditing && (
        <form onSubmit={handleSaveGoal} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3 text-xs animate-in fade-in">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
            <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>দান সংগ্রহের নতুন লক্ষ্যমাত্রা সেট করুন (কমিটি প্যানেল):</span>
            </span>
            <button
              type="button"
              onClick={handleResetToDefault}
              className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> ডিফল্ট রিসেট
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="sm:col-span-2">
              <span className="font-semibold text-slate-700 dark:text-slate-300">ক্যাম্পেইন বা প্রকল্পের নাম*:</span>
              <input
                type="text"
                required
                value={tempTitle}
                onChange={(e) => setTempTitle(e.target.value)}
                placeholder="যেমন: দ্বিতীয় তলার ছাদ ঢালাই ও টাইলস তহবিল"
                className="mt-1 w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium"
              />
            </label>

            <label>
              <span className="font-semibold text-slate-700 dark:text-slate-300">লক্ষ্যমাত্রা টাকা (৳)*:</span>
              <input
                type="number"
                min="1000"
                required
                value={tempTarget}
                onChange={(e) => setTempTarget(Number(e.target.value) || '')}
                placeholder="৳ যেমন: ৫,০০,০০০"
                className="mt-1 w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
              />
            </label>

            <label>
              <span className="font-semibold text-slate-700 dark:text-slate-300">হিসাবের পরিধি (Scope):</span>
              <select
                value={tempScope}
                onChange={(e) => setTempScope(e.target.value as MosqueDonationGoal['scope'])}
                className="mt-1 w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
              >
                <option value="total_income">সর্বমোট তহবিল আয় (Total Income)</option>
                <option value="month_income">শুধুমাত্র চলতি মাসের আয় (Monthly Income)</option>
                <option value="development_cat">উন্নয়ন ও বিশেষ দান খাত (Development Fund)</option>
              </select>
            </label>

            <label>
              <span className="font-semibold text-slate-700 dark:text-slate-300">সমাপ্তির তারিখ (অচ্ছিক):</span>
              <input
                type="date"
                value={tempDeadline}
                onChange={(e) => setTempDeadline(e.target.value)}
                className="mt-1 w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </label>

            <label className="sm:col-span-3">
              <span className="font-semibold text-slate-700 dark:text-slate-300">আবেদন বার্তা বা মন্তব্য:</span>
              <input
                type="text"
                value={tempNote}
                onChange={(e) => setTempNote(e.target.value)}
                placeholder="যেমন: দ্বীনের খেদমতে উদার হস্তে দান করুন..."
                className="mt-1 w-full p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </label>
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-semibold">কুইক লক্ষ্যমাত্রা:</span>
              {[
                { amt: 100000, label: '১ লাখ ৳' },
                { amt: 500000, label: '৫ লাখ ৳' },
                { amt: 1000000, label: '১০ লাখ ৳' },
                { amt: 2500000, label: '২৫ লাখ ৳' }
              ].map((p) => (
                <button
                  key={p.amt}
                  type="button"
                  onClick={() => handleApplyPreset(p.amt, `মসজিদ উন্নয়ন প্রকল্প (${p.label})`)}
                  className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 hover:bg-emerald-50 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-[11px] font-bold"
                >
                  {p.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold"
              >
                বাতিল
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" /> সংরক্ষণ করুন
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Main Dynamic Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
            <span>সংগৃহীত:</span>
            <span className="font-mono text-sm sm:text-base">{f(raisedAmount)}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <span>লক্ষ্য:</span>
            <span className="font-mono text-sm sm:text-base text-slate-900 dark:text-white">{f(targetAmount)}</span>
          </div>
        </div>

        {/* Progress Bar Container */}
        <div className="relative w-full h-5 sm:h-6 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-200 dark:border-slate-700/80 shadow-inner">
          {/* Animated Fill Bar */}
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400 transition-all duration-700 shadow-md relative overflow-hidden flex items-center justify-end pr-2"
            style={{ width: `${Math.max(5, percent)}%` }}
          >
            {/* Gloss shine overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
            
            {percent >= 15 && (
              <span className="text-[10px] font-extrabold text-slate-950 font-mono drop-shadow-xs">
                {toBengaliNumerals(percent)}%
              </span>
            )}
          </div>
        </div>

        {/* Milestone Marks */}
        <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400 px-1 pt-0.5">
          <span>০%</span>
          <span>২৫%</span>
          <span>৫০%</span>
          <span>৭৫%</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-bold">১০০% অর্জিত</span>
        </div>
      </div>

      {/* Goal Metrics Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">বাকি প্রয়োজন</span>
          <strong className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400 block mt-0.5">
            {remaining > 0 ? f(remaining) : 'লক্ষ্যমাত্রা পূর্ণ! ✓'}
          </strong>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">মোট দাতা সংখ্যা</span>
          <strong className="text-sm font-bold font-mono text-slate-800 dark:text-slate-200 block mt-0.5">
            {toBengaliNumerals(donorCount)} জন
          </strong>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">হিসাবের পরিধি</span>
          <strong className="text-xs font-bold text-slate-800 dark:text-slate-200 block mt-0.5 truncate">
            {goal.scope === 'month_income'
              ? 'চলতি মাসের আয়'
              : goal.scope === 'development_cat'
              ? 'উন্নয়ন তহবিল'
              : 'সর্বমোট তহবিল'}
          </strong>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">সমাপ্তির সময়সূচী</span>
          <strong className="text-xs font-bold text-emerald-700 dark:text-emerald-400 block mt-0.5 truncate">
            {daysRemaining !== null
              ? `${toBengaliNumerals(daysRemaining)} দিন বাকি`
              : 'চলমান প্রকল্প'}
          </strong>
        </div>
      </div>
    </div>
  );
};
