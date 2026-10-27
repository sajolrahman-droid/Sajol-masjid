import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, 
  Compass, 
  MapPin, 
  CircleDot, 
  BookOpen, 
  BookMarked,
  CheckCircle2, 
  Landmark,
  Menu,
  X,
  Moon,
  Sun,
  HardDriveDownload,
  Heart,
  ChevronRight,
  Globe
} from 'lucide-react';
import { Language, FontSize, ThemeMode } from '../types/mosque';
import { TRANSLATIONS } from '../utils/translations';

export type TabKey = 'prayers' | 'qibla' | 'map' | 'zikr' | 'reading' | 'hadith' | 'amal' | 'accounts';

interface NavigationProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  language: Language;
  theme?: ThemeMode;
  onThemeChange?: (theme: ThemeMode) => void;
  fontSize?: FontSize;
  onFontSizeChange?: (size: FontSize) => void;
  onOpenBackup?: () => void;
  onOpenDonate?: () => void;
}

interface NavSectionItem {
  key: TabKey;
  label: string;
  shortLabel: string;
  description: string;
  icon: React.ReactNode;
  category: 'worship' | 'scripture' | 'management';
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
  language,
  theme = 'light',
  onThemeChange,
  fontSize = 'normal',
  onFontSizeChange,
  onOpenBackup,
  onOpenDonate
}) => {
  const t = TRANSLATIONS[language];
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const isDark = theme === 'dark' || theme === 'emerald';

  const navItems: NavSectionItem[] = [
    // Category 1: ইবাদত ও সময়
    { 
      key: 'prayers', 
      label: t.tabs.prayers, 
      shortLabel: language === 'bn' ? 'নামাজ' : 'Prayers',
      description: language === 'bn' ? '৫ ওয়াক্ত ও তাহাজ্জুদ সময়সূচী, জামাত কাউন্টডাউন ও আযান এলার্ট' : 'Prayer times & countdown',
      icon: <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      category: 'worship'
    },
    { 
      key: 'qibla', 
      label: t.tabs.qibla, 
      shortLabel: language === 'bn' ? 'কিবলা' : 'Qibla',
      description: language === 'bn' ? 'স্মার্ট কিবলা কম্পাস, ভাইব্রেশন এলাইনমেন্ট ও দিকনির্দেশনা' : 'Haptic Qibla compass',
      icon: <Compass className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      category: 'worship'
    },
    { 
      key: 'zikr', 
      label: t.tabs.zikr, 
      shortLabel: language === 'bn' ? 'তাসবিহ' : 'Tasbih',
      description: language === 'bn' ? 'ডিজিটাল তাসবিহ কাউন্টার ও মাছুর দোআ' : 'Digital tasbih counter',
      icon: <CircleDot className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      category: 'worship'
    },
    // Category 2: কুরআন ও সুন্নাহ
    { 
      key: 'reading', 
      label: t.tabs.reading, 
      shortLabel: language === 'bn' ? 'কুরআন' : 'Quran',
      description: language === 'bn' ? 'সম্পূর্ণ কুরআন শরীফ, অডিও তেলাওয়াত ও দৈনন্দিন দোআ' : 'Quran & Daily Duas',
      icon: <BookOpen className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      category: 'scripture'
    },
    { 
      key: 'hadith', 
      label: t.tabs.hadith, 
      shortLabel: language === 'bn' ? 'হাদিস' : 'Hadith',
      description: language === 'bn' ? 'সহীহ বুখারী, মুসলিম, তিরমিযী ও আবূ দাঊদ হাদিস গ্রন্থ' : 'Sahih Hadith collections',
      icon: <BookMarked className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      category: 'scripture'
    },
    { 
      key: 'amal', 
      label: t.tabs.amal, 
      shortLabel: language === 'bn' ? 'আমল' : 'Amal',
      description: language === 'bn' ? 'দৈনিক ৫ ওয়াক্ত জামাত, সুন্নাত ও আমল ট্র্যাকার' : 'Daily deeds tracker',
      icon: <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      category: 'scripture'
    },
    // Category 3: মসজিদ ও সমাজ
    { 
      key: 'accounts', 
      label: t.tabs.accounts, 
      shortLabel: language === 'bn' ? 'হিসাবঘর' : 'Accounts',
      description: language === 'bn' ? 'মসজিদের আয়-ব্যয় খতিয়ান, অটো-ক্যাটাগরি ও ভিজ্যুয়াল গ্রাফ' : 'Mosque finance ledger',
      icon: <Landmark className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      category: 'management'
    },
    { 
      key: 'map', 
      label: t.tabs.map, 
      shortLabel: language === 'bn' ? 'মসজিদ ম্যাপ' : 'Map',
      description: language === 'bn' ? 'মসজিদ লোকেশন, নিকটস্থ মসজিদ ও দিকদর্শন' : 'Mosque location & map',
      icon: <MapPin className="w-4 h-4 sm:w-4.5 sm:h-4.5" />,
      category: 'management'
    }
  ];

  // Auto-scroll active item into view inside horizontal pill bar on small screens
  useEffect(() => {
    if (scrollContainerRef.current) {
      const activeEl = scrollContainerRef.current.querySelector<HTMLElement>(`[data-nav-key="${activeTab}"]`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  // Primary tabs featured in mobile bottom bar
  const primaryMobileKeys: TabKey[] = ['prayers', 'reading', 'hadith', 'accounts'];
  const isPrimaryTabActive = primaryMobileKeys.includes(activeTab);

  // Group labels
  const categoryLabels = {
    worship: language === 'bn' ? 'দৈনন্দিন ইবাদত ও সময়' : 'Daily Worship & Timing',
    scripture: language === 'bn' ? 'কুরআন ও সুন্নাহ' : 'Quran & Sunnah',
    management: language === 'bn' ? 'মসজিদ ব্যবস্থাপনা' : 'Mosque & Community'
  };

  const handleSelectTab = (key: TabKey) => {
    onTabChange(key);
    setIsMobileDrawerOpen(false);
  };

  const currentTabItem = navItems.find((i) => i.key === activeTab) || navItems[0];

  return (
    <>
      {/* ========================================================
          1. DESKTOP & TABLET NAVIGATION BAR (Sticky below header)
          ======================================================== */}
      <nav 
        aria-label="Main Navigation"
        className="sticky top-[58px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs hidden sm:block transition-colors"
      >
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between gap-1 py-1.5 overflow-x-auto scrollbar-none">
            {/* Logical Category 1: Worship */}
            <div className="flex items-center gap-1 shrink-0">
              {navItems.filter(i => i.category === 'worship').map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleSelectTab(item.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold whitespace-nowrap transition-all select-none cursor-pointer border ${
                      isActive
                        ? 'bg-emerald-700 dark:bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500 shadow-sm shadow-emerald-700/20'
                        : 'text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                    }`}
                    title={item.description}
                  >
                    <span className={isActive ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0 mx-1" aria-hidden="true" />

            {/* Logical Category 2: Scripture & Deeds */}
            <div className="flex items-center gap-1 shrink-0">
              {navItems.filter(i => i.category === 'scripture').map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleSelectTab(item.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold whitespace-nowrap transition-all select-none cursor-pointer border ${
                      isActive
                        ? 'bg-emerald-700 dark:bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500 shadow-sm shadow-emerald-700/20'
                        : 'text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                    }`}
                    title={item.description}
                  >
                    <span className={isActive ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0 mx-1" aria-hidden="true" />

            {/* Logical Category 3: Mosque Management */}
            <div className="flex items-center gap-1 shrink-0">
              {navItems.filter(i => i.category === 'management').map((item) => {
                const isActive = activeTab === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => handleSelectTab(item.key)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs lg:text-sm font-semibold whitespace-nowrap transition-all select-none cursor-pointer border ${
                      isActive
                        ? 'bg-emerald-700 dark:bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500 shadow-sm shadow-emerald-700/20'
                        : 'text-slate-700 dark:text-slate-300 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-white'
                    }`}
                    title={item.description}
                  >
                    <span className={isActive ? 'text-white' : 'text-emerald-700 dark:text-emerald-400'}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* ========================================================
          2. MOBILE HORIZONTAL SUB-NAV STRIP (Direct 1-tap jump)
          ======================================================== */}
      <nav 
        aria-label="Mobile Sections"
        className="sm:hidden sticky top-[57px] z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs"
      >
        <div 
          ref={scrollContainerRef}
          className="flex items-center gap-1.5 overflow-x-auto py-2 px-2.5 scrollbar-none snap-x"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                data-nav-key={item.key}
                onClick={() => handleSelectTab(item.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all snap-start border ${
                  isActive
                    ? 'bg-emerald-700 dark:bg-emerald-600 text-white border-emerald-600 dark:border-emerald-500 shadow-xs ring-2 ring-emerald-500/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60'
                }`}
              >
                <span className={isActive ? 'text-white' : 'text-emerald-600 dark:text-emerald-400'}>
                  {item.icon}
                </span>
                <span>{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ========================================================
          3. MOBILE BOTTOM APP BAR (Fixed thumb-accessible 5 zones)
          ======================================================== */}
      <nav 
        aria-label="Mobile Bottom App Bar"
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] pt-1 px-1 shadow-xl transition-colors"
      >
        <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto">
          {/* Item 1: Prayers */}
          <button
            onClick={() => handleSelectTab('prayers')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              activeTab === 'prayers'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-all ${activeTab === 'prayers' ? 'bg-emerald-100 dark:bg-emerald-950/80 scale-105' : ''}`}>
              <Clock className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight leading-tight mt-0.5">
              {language === 'bn' ? 'নামাজ' : 'Prayers'}
            </span>
          </button>

          {/* Item 2: Quran */}
          <button
            onClick={() => handleSelectTab('reading')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              activeTab === 'reading'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-all ${activeTab === 'reading' ? 'bg-emerald-100 dark:bg-emerald-950/80 scale-105' : ''}`}>
              <BookOpen className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight leading-tight mt-0.5">
              {language === 'bn' ? 'কুরআন' : 'Quran'}
            </span>
          </button>

          {/* Item 3: Hadith */}
          <button
            onClick={() => handleSelectTab('hadith')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              activeTab === 'hadith'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-all ${activeTab === 'hadith' ? 'bg-emerald-100 dark:bg-emerald-950/80 scale-105' : ''}`}>
              <BookMarked className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight leading-tight mt-0.5">
              {language === 'bn' ? 'হাদিস' : 'Hadith'}
            </span>
          </button>

          {/* Item 4: Accounts */}
          <button
            onClick={() => handleSelectTab('accounts')}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
              activeTab === 'accounts'
                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-all ${activeTab === 'accounts' ? 'bg-emerald-100 dark:bg-emerald-950/80 scale-105' : ''}`}>
              <Landmark className="w-5 h-5" />
            </div>
            <span className="text-[10px] tracking-tight leading-tight mt-0.5">
              {language === 'bn' ? 'হিসাব' : 'Accounts'}
            </span>
          </button>

          {/* Item 5: More Menu / Secondary Active Trigger */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
              !isPrimaryTabActive
                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-all ${!isPrimaryTabActive ? 'bg-emerald-100 dark:bg-emerald-950/80 scale-105' : ''}`}>
              {!isPrimaryTabActive ? (
                currentTabItem.icon
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </div>
            <span className="text-[10px] tracking-tight leading-tight mt-0.5 truncate max-w-[64px]">
              {!isPrimaryTabActive ? currentTabItem.shortLabel : (language === 'bn' ? 'আরও মেনু' : 'More')}
            </span>
            {/* Dot indicator if active tab is in More */}
            {!isPrimaryTabActive && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            )}
          </button>
        </div>
      </nav>

      {/* ========================================================
          4. MOBILE COMPREHENSIVE NAVIGATION DRAWER / BOTTOM SHEET
          ======================================================== */}
      {isMobileDrawerOpen && (
        <div 
          role="dialog" 
          aria-modal="true"
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileDrawerOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-t-2xl max-h-[85vh] overflow-y-auto p-4 border-t border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle & Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-800 dark:text-emerald-300 font-bold">
                  🕌
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'bn' ? 'সকল বিভাগ ও সুবিধা' : 'All Sections & Tools'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'bn' ? 'সহজে কাঙ্ক্ষিত বিভাগে প্রবেশ করুন' : 'Tap to navigate seamlessly'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Logical Category 1: Worship */}
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                {categoryLabels.worship}
              </div>
              <div className="space-y-1.5">
                {navItems.filter(i => i.category === 'worship').map((item) => {
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleSelectTab(item.key)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all border ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/40 text-emerald-950 dark:text-emerald-200 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-700 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-emerald-700 dark:text-emerald-400'}`}>
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold truncate">{item.label}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{item.description}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Logical Category 2: Scripture */}
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                {categoryLabels.scripture}
              </div>
              <div className="space-y-1.5">
                {navItems.filter(i => i.category === 'scripture').map((item) => {
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleSelectTab(item.key)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all border ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/40 text-emerald-950 dark:text-emerald-200 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-700 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-emerald-700 dark:text-emerald-400'}`}>
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold truncate">{item.label}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{item.description}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Logical Category 3: Management */}
            <div>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                {categoryLabels.management}
              </div>
              <div className="space-y-1.5">
                {navItems.filter(i => i.category === 'management').map((item) => {
                  const isActive = activeTab === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => handleSelectTab(item.key)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all border ${
                        isActive
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500/40 text-emerald-950 dark:text-emerald-200 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-700 text-white' : 'bg-slate-200/80 dark:bg-slate-700 text-emerald-700 dark:text-emerald-400'}`}>
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-bold truncate">{item.label}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{item.description}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick App Utilities: Dark Mode, Backup & Donate */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {language === 'bn' ? 'সিস্টেম ও অতিরিক্ত সুবিধা' : 'System & Utilities'}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {/* Dark Mode Quick Toggle */}
                {onThemeChange && (
                  <button
                    onClick={() => onThemeChange(isDark ? 'light' : 'dark')}
                    className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      isDark
                        ? 'bg-slate-800 text-amber-300 border-slate-700 hover:border-amber-400/50'
                        : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {isDark ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-400" />
                        <span>লাইট মোড</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-slate-700" />
                        <span>ডার্ক মোড</span>
                      </>
                    )}
                  </button>
                )}

                {/* Cloud Backup Button */}
                {onOpenBackup && (
                  <button
                    onClick={() => {
                      setIsMobileDrawerOpen(false);
                      onOpenBackup();
                    }}
                    className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-750 transition"
                  >
                    <HardDriveDownload className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>ব্যাকআপ</span>
                  </button>
                )}
              </div>

              {/* Donate Button */}
              {onOpenDonate && (
                <button
                  onClick={() => {
                    setIsMobileDrawerOpen(false);
                    onOpenDonate();
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs shadow-sm hover:brightness-105 transition"
                >
                  <Heart className="w-4 h-4 fill-rose-600 text-rose-600" />
                  <span>মসজিদে এককালীন দান করুন</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
