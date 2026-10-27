import React, { useEffect } from 'react';
import { 
  BellRing, 
  VolumeX, 
  Clock, 
  CheckCircle2, 
  MapPin, 
  Sparkles,
  Volume2
} from 'lucide-react';
import { toBengaliNumerals, formatTimeInBengali } from '../utils/prayerCalculator';
import { stopPrayerAlarmSound } from '../utils/prayerNotificationService';

export interface ActivePrayerAlertData {
  prayerKey: string;
  prayerNameBn: string;
  prayerTimeStr: string;
  jamatTimeStr?: string;
  mosqueName: string;
  leadTimeMinutes: number;
}

interface PrayerAlertModalProps {
  alertData: ActivePrayerAlertData | null;
  onDismiss: () => void;
  onNavigateToPrayers: () => void;
}

export const PrayerAlertModal: React.FC<PrayerAlertModalProps> = ({
  alertData,
  onDismiss,
  onNavigateToPrayers
}) => {
  useEffect(() => {
    // When modal mounts or alertData arrives
    return () => {
      stopPrayerAlarmSound();
    };
  }, [alertData]);

  if (!alertData) return null;

  const handleDismiss = () => {
    stopPrayerAlarmSound();
    onDismiss();
  };

  const handleGoToPrayers = () => {
    stopPrayerAlarmSound();
    onDismiss();
    onNavigateToPrayers();
  };

  const isAdvanceAlert = alertData.leadTimeMinutes > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-linear-to-b from-slate-900 via-emerald-950 to-slate-950 text-white rounded-3xl border-2 border-emerald-500/50 shadow-2xl p-6 sm:p-8 text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Background ambient glow */}
        <div className="absolute -top-16 -left-16 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Animated Bell / Mosque Beacon */}
        <div className="relative mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-500/20 border-2 border-emerald-400/60 flex items-center justify-center mb-4 shadow-lg animate-pulse">
          <div className="absolute inset-0 rounded-full bg-emerald-400/10 animate-ping" />
          <BellRing className="w-10 h-10 sm:w-12 sm:h-12 text-amber-400 animate-bounce" />
        </div>

        {/* Alert Title */}
        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-amber-400 text-slate-950 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            {isAdvanceAlert
              ? `${toBengaliNumerals(alertData.leadTimeMinutes)} মিনিট পূর্বে সতর্কতা`
              : 'নামাজের ওয়াক্ত শুরু হয়েছে'}
          </span>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
            {alertData.prayerNameBn}-এর ওয়াক্ত
          </h2>

          <div className="font-arabic text-2xl sm:text-3xl text-emerald-400 font-bold my-1">
            حَيَّ عَلَى الصَّلَاةِ • حَيَّ عَلَى الْفَلَاحِ
          </div>

          <p className="text-xs sm:text-sm text-emerald-200/90 font-medium">
            "নামাজের দিকে এসো, সাফল্যের দিকে এসো"
          </p>
        </div>

        {/* Times card */}
        <div className="my-5 p-4 rounded-2xl bg-white/10 dark:bg-black/30 border border-white/15 backdrop-blur-xs flex items-center justify-around">
          <div>
            <div className="text-[11px] text-emerald-300 font-semibold flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> ওয়াক্ত শুরু
            </div>
            <div className="text-xl sm:text-2xl font-bold font-mono text-white mt-0.5">
              {formatTimeInBengali(alertData.prayerTimeStr)}
            </div>
          </div>

          {alertData.jamatTimeStr && (
            <div className="border-l border-white/20 pl-4">
              <div className="text-[11px] text-amber-300 font-semibold flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" /> মসজিদে জামাত
              </div>
              <div className="text-xl sm:text-2xl font-bold font-mono text-amber-400 mt-0.5">
                {formatTimeInBengali(alertData.jamatTimeStr)}
              </div>
            </div>
          )}
        </div>

        {/* Short Dua / Reminder */}
        <div className="p-3 rounded-xl bg-black/40 border border-emerald-500/20 text-xs text-emerald-100/90 leading-relaxed text-left mb-6">
          <strong className="text-amber-300 block mb-0.5">💡 নামাজের প্রস্তুতি:</strong>
          ধৈর্য ও ইখলাসের সাথে অজু সম্পন্ন করে সময়মতো মসজিদে উপস্থিত হোন। রাসূলুল্লাহ (সা.) বলেছেন: "বান্দা যখন নামাজের উদ্দেশ্যে মসজিদে যায়, তার প্রতি পদক্ষেপে আল্লাহ একটি নেকি দান করেন এবং একটি গোনাহ মাফ করেন।"
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={handleDismiss}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>আলহামদুলিল্লাহ (এলার্ট বন্ধ করুন)</span>
          </button>

          <button
            onClick={handleGoToPrayers}
            className="py-3 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-amber-400" />
            <span>সময়সূচী দেখুন</span>
          </button>
        </div>
      </div>
    </div>
  );
};
