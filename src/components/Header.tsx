import React, { useState } from 'react';
import { 
  Search, 
  Heart, 
  Palette, 
  Globe, 
  WifiOff, 
  Sunrise, 
  ShieldCheck, 
  Type, 
  Check, 
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { Language, FontSize, ThemeMode, FontFamily } from '../types/mosque';
import { TRANSLATIONS } from '../utils/translations';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  mosqueName: string;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  fontFamily: FontFamily;
  onFontFamilyChange: (font: FontFamily) => void;
  theme: ThemeMode;
  onThemeChange: (theme: ThemeMode) => void;
  onOpenSearch: () => void;
  onOpenDonate: () => void;
  onOpenHadith: () => void;
  onOpenBackup: () => void;
  isOnline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  mosqueName,
  language,
  onLanguageChange,
  fontSize,
  onFontSizeChange,
  fontFamily,
  onFontFamilyChange,
  theme,
  onThemeChange,
  onOpenSearch,
  onOpenDonate,
  onOpenHadith,
  onOpenBackup,
  isOnline,
}) => {
  const t = TRANSLATIONS[language];
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);

  const cycleFontSize = () => {
    if (fontSize === 'normal') onFontSizeChange('large');
    else if (fontSize === 'large') onFontSizeChange('xlarge');
    else onFontSizeChange('normal');
  };

  const fontSizeLabels: Record<FontSize, string> = {
    normal: 'A',
    large: 'A+',
    xlarge: 'A++',
  };

  const themeOptions: { id: ThemeMode; nameBn: string; nameEn: string; colorClass: string }[] = [
    { id: 'emerald', nameBn: 'মরু সবুজ (Emerald)', nameEn: 'Emerald Green', colorClass: 'bg-emerald-600' },
    { id: 'amber', nameBn: 'আম্বর গোল্ড (Amber Gold)', nameEn: 'Amber Gold', colorClass: 'bg-amber-600' },
    { id: 'navy', nameBn: 'মিডনাইট নেভি (Midnight)', nameEn: 'Midnight Navy', colorClass: 'bg-blue-900' },
    { id: 'sepia', nameBn: 'সেপিয়া রিডার (Sepia)', nameEn: 'Warm Sepia', colorClass: 'bg-amber-800' },
    { id: 'dark', nameBn: 'ডার্ক মোড (Dark Slate)', nameEn: 'Dark Slate', colorClass: 'bg-slate-900' },
    { id: 'light', nameBn: 'লাইট মোড (Light)', nameEn: 'Clean Light', colorClass: 'bg-slate-100 border border-slate-300' },
  ];

  const fontOptions: { id: FontFamily; labelBn: string; labelEn: string; preview: string }[] = [
    { id: 'siliguri', labelBn: 'হিন্দ শিলিগুড়ি', labelEn: 'Hind Siliguri', preview: 'বিসমিল্লাহির রাহমানির রাহিম' },
    { id: 'noto', labelBn: 'নোটো সান্স বেঙ্গলি', labelEn: 'Noto Sans Bengali', preview: 'বিসমিল্লাহির রাহমানির রাহিম' },
    { id: 'jakarta', labelBn: 'জাকার্তা সান্স', labelEn: 'Plus Jakarta Sans', preview: 'Bismillah - In the Name of Allah' },
    { id: 'amiri', labelBn: 'আমিরি ক্যালিগ্রাফি', labelEn: 'Amiri Arabic / Serif', preview: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ' },
    { id: 'merriweather', labelBn: 'মেরিওয়েদার সেরিফ', labelEn: 'Merriweather Serif', preview: 'বই ও পাঠের জন্য মার্জিত সেরিফ' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-emerald-800 dark:bg-slate-900 text-white shadow-md border-b border-emerald-700/50 dark:border-slate-800 transition-colors">
      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Brand Zone */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-emerald-700/90 dark:bg-emerald-950 flex items-center justify-center text-xl shrink-0 border border-emerald-500/30 shadow-inner">
            🕌
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold truncate tracking-tight text-white">
                {mosqueName || t.appName}
              </h1>
              {!isOnline && (
                <span className="inline-flex items-center gap-1 text-[11px] bg-amber-600 text-white px-2 py-0.5 rounded-full font-semibold">
                  <WifiOff className="w-3 h-3" /> অফলাইন মোড
                </span>
              )}
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-100/80 dark:text-slate-400 truncate">
              {t.subTitle}
            </p>
          </div>
        </div>

        {/* Action Controls & Navigation Utilities */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
          {/* PWA In-App Install Button */}
          <PWAInstallButton language={language} />

          {/* Daily Post-Fajr Hadith Button */}
          <button
            onClick={onOpenHadith}
            className="flex items-center justify-center h-9 px-2.5 rounded-lg bg-emerald-700/70 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-white transition text-xs font-semibold gap-1.5 border border-emerald-600/40 dark:border-slate-700"
            title="আজকের ফজরের হাদিস ও অনুপ্রেরণা"
          >
            <Sunrise className="w-4 h-4 text-amber-300 animate-pulse" />
            <span className="hidden lg:inline text-amber-200">আজকের হাদিস</span>
          </button>

          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center justify-center w-9 h-9 sm:w-auto sm:px-2.5 sm:h-9 rounded-lg bg-emerald-700/70 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-white transition text-xs font-medium gap-1.5 border border-emerald-600/40 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            title={t.searchPlaceholder}
            aria-label="Search across app"
          >
            <Search className="w-4 h-4 text-emerald-200" />
            <span className="hidden md:inline">{language === 'bn' ? 'অনুসন্ধান' : 'Search'}</span>
          </button>

          {/* Typography Font Family Menu Toggle */}
          <div className="relative">
            <button
              onClick={() => {
                setShowFontMenu(!showFontMenu);
                setShowThemeMenu(false);
              }}
              className="flex items-center justify-center w-9 h-9 sm:w-auto sm:px-2.5 sm:h-9 rounded-lg bg-emerald-700/70 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-white transition text-xs font-bold border border-emerald-600/40 dark:border-slate-700 gap-1"
              title="ফন্ট স্টাইল ও টাইপোগ্রাফি পরিবর্তন"
            >
              <Type className="w-4 h-4 text-teal-200" />
              <ChevronDown className="w-3 h-3 text-emerald-300" />
            </button>

            {/* Font Family Dropdown */}
            {showFontMenu && (
              <div 
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setShowFontMenu(false)}
              >
                <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  পছন্দের ফন্ট স্টাইল বেছে নিন
                </div>
                <div className="mt-1 space-y-1">
                  {fontOptions.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => {
                        onFontFamilyChange(font.id);
                        setShowFontMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        fontFamily === font.id
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div>
                        <div>{language === 'bn' ? font.labelBn : font.labelEn}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[170px]">
                          {font.preview}
                        </div>
                      </div>
                      {fontFamily === font.id && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Senior / Elderly Font Size Scaler */}
          <button
            onClick={cycleFontSize}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-700/70 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-white transition text-xs font-bold border border-emerald-600/40 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            title={`${t.fontSize}: ${fontSizeLabels[fontSize]} (ক্লিক করে বড় করুন)`}
            aria-label={`Current font size ${fontSizeLabels[fontSize]}`}
          >
            <span className="text-[13px] tracking-tighter">{fontSizeLabels[fontSize]}</span>
          </button>

          {/* Theme Palette Switcher (6 Themes) */}
          <div className="relative">
            <button
              onClick={() => {
                setShowThemeMenu(!showThemeMenu);
                setShowFontMenu(false);
              }}
              className="flex items-center justify-center w-9 h-9 sm:w-auto sm:px-2.5 sm:h-9 rounded-lg bg-emerald-700/70 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-300 transition text-xs font-semibold border border-emerald-600/40 dark:border-slate-700 gap-1"
              title="রঙিন থিম নির্বাচন (Amber Gold, Midnight Navy, Sepia, Emerald, Dark, Light)"
            >
              <Palette className="w-4 h-4" />
              <ChevronDown className="w-3 h-3 text-emerald-300" />
            </button>

            {/* Themes Dropdown */}
            {showThemeMenu && (
              <div 
                className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-2 z-50 text-slate-800 dark:text-slate-100 animate-in fade-in zoom-in-95"
                onMouseLeave={() => setShowThemeMenu(false)}
              >
                <div className="px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  রঙিন থিম পছন্দ করুন
                </div>
                <div className="mt-1 space-y-1">
                  {themeOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        onThemeChange(opt.id);
                        setShowThemeMenu(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition ${
                        theme === opt.id
                          ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-900 dark:text-emerald-200 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3.5 h-3.5 rounded-full ${opt.colorClass} shrink-0`} />
                        <span>{language === 'bn' ? opt.nameBn : opt.nameEn}</span>
                      </div>
                      {theme === opt.id && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher */}
          <button
            onClick={() => {
              const nextLang: Language = language === 'bn' ? 'en' : language === 'en' ? 'ar' : 'bn';
              onLanguageChange(nextLang);
            }}
            className="flex items-center justify-center h-9 px-2 sm:px-2.5 rounded-lg bg-emerald-700/70 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-white border border-emerald-600/40 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            title="Language / ভাষা পরিবর্তন"
            aria-label="Change Language"
          >
            <Globe className="w-3.5 h-3.5 mr-1 text-emerald-200 shrink-0" />
            <span>{language === 'bn' ? 'বাংলা' : language === 'en' ? 'EN' : 'عربي'}</span>
          </button>

          {/* Secure Backup & Cloud Sync */}
          <button
            onClick={onOpenBackup}
            className="flex items-center justify-center w-9 h-9 rounded-lg bg-emerald-700/70 hover:bg-emerald-600 dark:bg-slate-800 dark:hover:bg-slate-700 text-white transition text-xs font-bold border border-emerald-600/40 dark:border-slate-700"
            title="নিরাপদ ব্যাকআপ ও ক্লাউড সিঙ্ক (AES-256)"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
          </button>

          {/* Donate Primary Action */}
          <button
            onClick={onOpenDonate}
            className="flex items-center gap-1.5 px-3 sm:px-4 h-9 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition active:scale-95 border border-amber-300/40 focus:outline-none focus:ring-2 focus:ring-amber-300"
            aria-label="Donate to Mosque"
          >
            <Heart className="w-4 h-4 fill-rose-600 text-rose-600 animate-pulse" />
            <span>{t.donate}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
