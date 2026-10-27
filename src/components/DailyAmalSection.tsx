import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Bell, 
  BellRing, 
  Sparkles, 
  BookOpen, 
  Calendar, 
  Award, 
  Share2, 
  Check 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DAILY_AMAL_ITEMS, DAILY_HADITHS } from '../data/islamicData';
import { toBengaliNumerals } from '../utils/prayerCalculator';
import { Language } from '../types/mosque';

interface DailyAmalSectionProps {
  dailyAmal: Record<string, boolean>;
  onToggleAmal: (key: string) => void;
  language: Language;
}

export const DailyAmalSection: React.FC<DailyAmalSectionProps> = ({
  dailyAmal,
  onToggleAmal
}) => {
  const [notificationGranted, setNotificationGranted] = useState<boolean>(
    typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted'
  );
  const [reminderTime, setReminderTime] = useState<string>('06:00');
  const [hadithIndex, setHadithIndex] = useState<number>(0);
  const [copiedHadith, setCopiedHadith] = useState<boolean>(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const todayStr = new Date().toISOString().slice(0, 10);
  const activeHadith = DAILY_HADITHS[hadithIndex % DAILY_HADITHS.length];

  // Calculate completed score
  const completedCount = DAILY_AMAL_ITEMS.filter((item) => dailyAmal[`${todayStr}_${item.id}`]).length;
  const totalScore = DAILY_AMAL_ITEMS.reduce((sum, item) => {
    return sum + (dailyAmal[`${todayStr}_${item.id}`] ? item.score : 0);
  }, 0);
  const maxScore = DAILY_AMAL_ITEMS.reduce((sum, item) => sum + item.score, 0);
  const progressPercent = Math.round((totalScore / maxScore) * 100);

  // Request browser notification permission
  const requestNotification = async () => {
    if (!('Notification' in window)) {
      setNotificationMsg('আপনার ব্রাউজারে নোটিফিকেশন সাপোর্ট নেই। ইন-অ্যাপ নোটিফিকেশন সক্রিয় করা হয়েছে।');
      setTimeout(() => setNotificationMsg(null), 4000);
      return;
    }

    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        setNotificationGranted(true);
        new Notification('মসজিদ সঙ্গী নোটিফিকেশন চালু হয়েছে', {
          body: 'প্রতিদিন সকাল ও সন্ধ্যায় আপনাকে হাদিস ও নামাজের আমল স্মরণ করিয়ে দেওয়া হবে। ইনশাআল্লাহ!',
          icon: '/favicon.ico'
        });
        setNotificationMsg('নোটিফিকেশন সফলভাবে চালু করা হয়েছে!');
      } else {
        setNotificationMsg('নোটিফিকেশন পারমিশন মেলেনি। সেটিংসে গিয়ে অনুমতি দিন।');
      }
      setTimeout(() => setNotificationMsg(null), 4000);
    } catch {
      setNotificationMsg('ইন-অ্যাপ নোটিফিকেশন চালু রয়েছে।');
      setTimeout(() => setNotificationMsg(null), 4000);
    }
  };

  const handleAmalClick = (itemId: string) => {
    const key = `${todayStr}_${itemId}`;
    const wasChecked = dailyAmal[key];
    onToggleAmal(key);

    if (!wasChecked) {
      if (completedCount + 1 === DAILY_AMAL_ITEMS.length) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const shareHadith = () => {
    const text = `📖 আজকের হাদিস:\n${activeHadith.bn}\n— ${activeHadith.narrator} (${activeHadith.source})`;
    if (navigator.share) {
      navigator.share({ title: 'আজকের হাদিস', text });
    } else {
      navigator.clipboard.writeText(text);
      setCopiedHadith(true);
      setTimeout(() => setCopiedHadith(false), 2000);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Daily Sahih Hadith Card */}
      <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white shadow-xl border border-emerald-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-12 -mt-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between gap-2 pb-3 border-b border-emerald-700/60 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-400 text-slate-950 font-bold text-[10px] px-2 py-0.5">
              আজকের নির্বাচিত সহীহ হাদিস
            </span>
            <span className="font-semibold text-emerald-100">{activeHadith.topic}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setHadithIndex((prev) => (prev + 1) % DAILY_HADITHS.length)}
              className="px-2.5 py-1 rounded-lg bg-emerald-700/60 hover:bg-emerald-600 text-white text-xs border border-emerald-600/50 transition"
            >
              পরবর্তী হাদিস →
            </button>
            <button
              onClick={shareHadith}
              className="p-1.5 rounded-lg bg-emerald-700/60 hover:bg-emerald-600 text-white transition"
              title="শেয়ার বা কপি করুন"
            >
              {copiedHadith ? <Check className="w-4 h-4 text-amber-300" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Hadith Body */}
        <div className="my-5">
          <p className="text-base sm:text-xl font-medium leading-relaxed text-emerald-50">
            {activeHadith.bn}
          </p>
          <div className="mt-3 text-xs sm:text-sm text-amber-300/90 font-medium">
            — {activeHadith.narrator}
          </div>
          <div className="text-[11px] text-emerald-300/80 mt-0.5">
            সূত্র: {activeHadith.source}
          </div>
        </div>
      </div>

      {/* Daily Notification Scheduler Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400 shrink-0">
            <BellRing className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              প্রতিদিনের আমল ও হাদিসের নোটিফিকেশন
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              মোবাইলে দৈনিক রিমাইন্ডার পাবেন যাতে কোনো ওয়াক্ত বা আমল বাদ না পড়ে।
            </p>
            {notificationMsg && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 animate-pulse">
                {notificationMsg}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={requestNotification}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 shadow-sm ${
              notificationGranted
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                : 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>{notificationGranted ? 'নোটিফিকেশন চালু আছে' : 'নোটিফিকেশন সক্রিয় করুন'}</span>
          </button>
        </div>
      </div>

      {/* Daily Amal Checklist Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>দৈনিক আমল ট্র্যাকার</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              তারিখ: {new Date().toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-500 dark:text-slate-400">অর্জিত পয়েন্ট</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {toBengaliNumerals(totalScore)} / {toBengaliNumerals(maxScore)}
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 flex items-center justify-center font-bold text-xs text-slate-800 dark:text-white">
              {toBengaliNumerals(progressPercent)}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full my-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Checklist items */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {DAILY_AMAL_ITEMS.map((item) => {
            const isDone = Boolean(dailyAmal[`${todayStr}_${item.id}`]);
            return (
              <div
                key={item.id}
                onClick={() => handleAmalClick(item.id)}
                className={`p-3.5 rounded-xl border transition cursor-pointer select-none flex items-center justify-between ${
                  isDone
                    ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`transition ${isDone ? 'text-emerald-600 scale-110' : 'text-slate-400'}`}>
                    {isDone ? <CheckCircle2 className="w-5 h-5 fill-emerald-100" /> : <Circle className="w-5 h-5" />}
                  </div>
                  <div>
                    <span className={`text-sm font-semibold ${isDone ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {item.titleBn}
                    </span>
                  </div>
                </div>

                <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                  +{toBengaliNumerals(item.score)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
