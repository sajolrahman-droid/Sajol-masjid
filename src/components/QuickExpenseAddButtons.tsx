import React from 'react';
import {
  Zap,
  UserCheck,
  Volume2,
  Wrench,
  Sparkles,
  Droplets,
  Radio,
  Coffee,
  Check,
  X,
  FastForward,
  PlusCircle
} from 'lucide-react';

export interface QuickExpensePreset {
  id: string;
  nameBn: string;
  nameEn: string;
  category: string;
  payee: string;
  note: string;
  acc: 'cash' | 'bank';
  badge: string;
  colorTheme: {
    badgeBg: string;
    badgeText: string;
    iconBg: string;
    iconColor: string;
    borderActive: string;
  };
}

export const QUICK_EXPENSE_PRESETS: QuickExpensePreset[] = [
  {
    id: 'electricity',
    nameBn: 'বিদ্যুৎ বিল',
    nameEn: 'Electricity Bill',
    category: 'বিদ্যুৎ (কারেন্ট) বিল',
    payee: 'বিদ্যুৎ বিল পরিশোধ (ডেসকো/নেসকো/পল্লী বিদ্যুৎ)',
    note: 'চলতি মাসের বিদ্যুৎ বিল পরিশোধ',
    acc: 'cash',
    badge: 'ইউটিলিটি',
    colorTheme: {
      badgeBg: 'bg-amber-100 dark:bg-amber-950/80',
      badgeText: 'text-amber-800 dark:text-amber-300',
      iconBg: 'bg-amber-100 dark:bg-amber-900/60',
      iconColor: 'text-amber-600 dark:text-amber-400',
      borderActive: 'border-amber-500 ring-2 ring-amber-400 dark:ring-amber-500'
    }
  },
  {
    id: 'imam-salary',
    nameBn: 'ইমামের বেতন',
    nameEn: 'Imam Salary',
    category: 'ইমাম/হুজুরের বেতন',
    payee: 'ইমাম সাহেব',
    note: 'চলতি মাসের ইমাম সাহেবের সম্মানী/বেতন',
    acc: 'cash',
    badge: 'সম্মানী',
    colorTheme: {
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80',
      badgeText: 'text-emerald-800 dark:text-emerald-300',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/60',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
      borderActive: 'border-emerald-500 ring-2 ring-emerald-400 dark:ring-emerald-500'
    }
  },
  {
    id: 'muazzin-salary',
    nameBn: 'মুয়াজ্জিনের বেতন',
    nameEn: 'Muazzin Salary',
    category: 'মুয়াজ্জিনের বেতন',
    payee: 'মুয়াজ্জিন সাহেব',
    note: 'চলতি মাসের মুয়াজ্জিন সাহেবের সম্মানী/বেতন',
    acc: 'cash',
    badge: 'সম্মানী',
    colorTheme: {
      badgeBg: 'bg-blue-100 dark:bg-blue-950/80',
      badgeText: 'text-blue-800 dark:text-blue-300',
      iconBg: 'bg-blue-100 dark:bg-blue-900/60',
      iconColor: 'text-blue-600 dark:text-blue-400',
      borderActive: 'border-blue-500 ring-2 ring-blue-400 dark:ring-blue-500'
    }
  },
  {
    id: 'maintenance',
    nameBn: 'সংস্কার ও মেরামত',
    nameEn: 'Maintenance',
    category: 'উন্নয়ন খরচ',
    payee: 'মসজিদ সংস্কার ও মেরামত',
    note: 'রক্ষণাবেক্ষণ ও জরুরি মেরামত কাজ',
    acc: 'cash',
    badge: 'মেরামত',
    colorTheme: {
      badgeBg: 'bg-orange-100 dark:bg-orange-950/80',
      badgeText: 'text-orange-800 dark:text-orange-300',
      iconBg: 'bg-orange-100 dark:bg-orange-900/60',
      iconColor: 'text-orange-600 dark:text-orange-400',
      borderActive: 'border-orange-500 ring-2 ring-orange-400 dark:ring-orange-500'
    }
  },
  {
    id: 'cleaning',
    nameBn: 'পরিচ্ছন্নতা সামগ্রী',
    nameEn: 'Cleaning Supplies',
    category: 'মাসিক খরচ',
    payee: 'মসজিদ পরিচ্ছন্নতা কর্মী / দোকান',
    note: 'হারপিক, সাবান, ফিনাইল ও ধোলাই খরচ',
    acc: 'cash',
    badge: 'ধোলাই',
    colorTheme: {
      badgeBg: 'bg-teal-100 dark:bg-teal-950/80',
      badgeText: 'text-teal-800 dark:text-teal-300',
      iconBg: 'bg-teal-100 dark:bg-teal-900/60',
      iconColor: 'text-teal-600 dark:text-teal-400',
      borderActive: 'border-teal-500 ring-2 ring-teal-400 dark:ring-teal-500'
    }
  },
  {
    id: 'utilities-water-gas',
    nameBn: 'পানি ও গ্যাস বিল',
    nameEn: 'Water / Gas Bill',
    category: 'পানি বিল',
    payee: 'ওয়াসা / তিতাস গ্যাস',
    note: 'মাসিক পানি ও গ্যাস বিল পরিশোধ',
    acc: 'bank',
    badge: 'ইউটিলিটি',
    colorTheme: {
      badgeBg: 'bg-cyan-100 dark:bg-cyan-950/80',
      badgeText: 'text-cyan-800 dark:text-cyan-300',
      iconBg: 'bg-cyan-100 dark:bg-cyan-900/60',
      iconColor: 'text-cyan-600 dark:text-cyan-400',
      borderActive: 'border-cyan-500 ring-2 ring-cyan-400 dark:ring-cyan-500'
    }
  },
  {
    id: 'sound-system',
    nameBn: 'মাইক ও সাউন্ড',
    nameEn: 'Mic & Sound System',
    category: 'উন্নয়ন খরচ',
    payee: 'সাউন্ড সিস্টেম সার্ভিসিং',
    note: 'মাইক ব্যাটারি, কর্ড ও সাউন্ড সার্ভিসিং',
    acc: 'cash',
    badge: 'সাউন্ড',
    colorTheme: {
      badgeBg: 'bg-purple-100 dark:bg-purple-950/80',
      badgeText: 'text-purple-800 dark:text-purple-300',
      iconBg: 'bg-purple-100 dark:bg-purple-900/60',
      iconColor: 'text-purple-600 dark:text-purple-400',
      borderActive: 'border-purple-500 ring-2 ring-purple-400 dark:ring-purple-500'
    }
  },
  {
    id: 'guest-refreshment',
    nameBn: 'মেহমান আপ্যায়ন',
    nameEn: 'Guest Hospitality',
    category: 'অন্যান্য খরচ',
    payee: 'জুমার খতিব ও মেহমান আপ্যায়ন',
    note: 'খতিব ও মেহমানদের নাস্তা ও হাদিয়া সামগ্রী',
    acc: 'cash',
    badge: 'আপ্যায়ন',
    colorTheme: {
      badgeBg: 'bg-rose-100 dark:bg-rose-950/80',
      badgeText: 'text-rose-800 dark:text-rose-300',
      iconBg: 'bg-rose-100 dark:bg-rose-900/60',
      iconColor: 'text-rose-600 dark:text-rose-400',
      borderActive: 'border-rose-500 ring-2 ring-rose-400 dark:ring-rose-500'
    }
  }
];

interface QuickExpenseAddButtonsProps {
  onSelectPreset: (preset: QuickExpensePreset) => void;
  selectedPresetId?: string | null;
  onClearPreset?: () => void;
  variant?: 'full' | 'compact' | 'dashboard';
  className?: string;
}

export const QuickExpenseAddButtons: React.FC<QuickExpenseAddButtonsProps> = ({
  onSelectPreset,
  selectedPresetId,
  onClearPreset,
  variant = 'full',
  className = ''
}) => {
  const getIcon = (id: string, colorClass: string) => {
    switch (id) {
      case 'electricity':
        return <Zap className={`w-4 h-4 ${colorClass}`} />;
      case 'imam-salary':
        return <UserCheck className={`w-4 h-4 ${colorClass}`} />;
      case 'muazzin-salary':
        return <Volume2 className={`w-4 h-4 ${colorClass}`} />;
      case 'maintenance':
        return <Wrench className={`w-4 h-4 ${colorClass}`} />;
      case 'cleaning':
        return <Sparkles className={`w-4 h-4 ${colorClass}`} />;
      case 'utilities-water-gas':
        return <Droplets className={`w-4 h-4 ${colorClass}`} />;
      case 'sound-system':
        return <Radio className={`w-4 h-4 ${colorClass}`} />;
      case 'guest-refreshment':
        return <Coffee className={`w-4 h-4 ${colorClass}`} />;
      default:
        return <FastForward className={`w-4 h-4 ${colorClass}`} />;
    }
  };

  // Dashboard variant: horizontally scrollable quick chips or grid
  if (variant === 'dashboard') {
    return (
      <div className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs ${className}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <FastForward className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>সাধারণ খরচ কুইক অ্যাড (Quick Add Expenses)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-medium">
                  ১-ক্লিক এন্ট্রি
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                যেকোনো খরচে ক্লিক করলে ফরম সরাসরি স্বয়ংক্রিয়ভাবে পূরণ হয়ে যাবে
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {QUICK_EXPENSE_PRESETS.map((preset) => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectPreset(preset)}
                className={`group p-2.5 rounded-xl border text-left transition relative flex items-start gap-2.5 ${
                  isSelected
                    ? `${preset.colorTheme.borderActive} bg-rose-50/70 dark:bg-slate-800`
                    : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/80 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg ${preset.colorTheme.iconBg} flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform`}>
                  {getIcon(preset.id, preset.colorTheme.iconColor)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {preset.nameBn}
                    </span>
                    {isSelected && (
                      <span className="w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate">
                    {preset.nameEn}
                  </span>
                  <div className="mt-1 flex items-center gap-1">
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${preset.colorTheme.badgeBg} ${preset.colorTheme.badgeText}`}>
                      {preset.badge}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono truncate">
                      {preset.category}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Full / In-Form variant: sits on top of Expense form
  return (
    <div className={`p-3.5 rounded-xl bg-slate-50/90 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 ${className}`}>
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-rose-100 dark:bg-rose-900/60 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
            <FastForward className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>কুইক অ্যাড বাটন (Quick Expense Presets)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold">
                স্বয়ংক্রিয় পূরণ
              </span>
            </span>
          </div>
        </div>

        {selectedPresetId && onClearPreset && (
          <button
            type="button"
            onClick={onClearPreset}
            className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 flex items-center gap-1 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900 shadow-2xs transition"
          >
            <X className="w-3 h-3" />
            <span>প্রাক-পূরণ রিসেট</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {QUICK_EXPENSE_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`p-2 rounded-lg border text-left transition relative flex items-center gap-2 ${
                isSelected
                  ? `${preset.colorTheme.borderActive} bg-white dark:bg-slate-900 shadow-xs`
                  : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <div className={`w-7 h-7 rounded-md ${preset.colorTheme.iconBg} flex items-center justify-center shrink-0`}>
                {getIcon(preset.id, preset.colorTheme.iconColor)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] sm:text-xs text-slate-900 dark:text-white truncate">
                    {preset.nameBn}
                  </span>
                  {isSelected && (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[3]" />
                  )}
                </div>
                <div className="flex items-center gap-1 text-[9px] text-slate-500 dark:text-slate-400 truncate">
                  <span>{preset.nameEn}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedPresetId && (
        <div className="mt-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>
              প্রাক-পূরণ সক্রিয়: <strong>{QUICK_EXPENSE_PRESETS.find(p => p.id === selectedPresetId)?.nameBn}</strong> — শুধু টাকার পরিমাণ লিখে সংরক্ষণ করুন।
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
