import React from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';

interface Props {
  isOnline: boolean;
  language?: 'bn' | 'en' | 'ar';
}

export const OfflineIndicator: React.FC<Props> = ({ isOnline, language = 'bn' }) => {
  if (isOnline) return null;

  return (
    <div 
      role="status" 
      aria-live="polite"
      className="fixed bottom-16 sm:bottom-6 left-4 right-4 sm:right-auto sm:max-w-md z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-600 text-white shadow-2xl border border-amber-400/50 backdrop-blur-md animate-in slide-in-from-bottom"
    >
      <div className="p-1.5 rounded-xl bg-amber-700/80 shrink-0">
        <WifiOff className="w-5 h-5 text-amber-100" />
      </div>
      <div className="min-w-0 text-xs sm:text-sm">
        <div className="font-bold flex items-center gap-1.5">
          <span>{language === 'bn' ? 'অফলাইন রিডিং ও ব্যবহার মোড' : 'Offline Reading Mode'}</span>
          <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
        </div>
        <p className="text-amber-100/90 text-[11px] sm:text-xs">
          {language === 'bn' 
            ? 'ইন্টারনেট সংযোগ ছাড়াও নামাজের সময়সূচী, কিবলা, কুরআন ও হিসাব নিরাপদ ও সক্রিয় আছে।'
            : 'Prayer schedules, Qibla, Quran and ledger remain fully functional offline.'}
        </p>
      </div>
    </div>
  );
};
