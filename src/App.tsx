import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  Navigation, 
  TabKey 
} from './components/Navigation';
import { 
  PrayerTimesSection 
} from './components/PrayerTimesSection';
import { 
  QiblaCompass 
} from './components/QiblaCompass';
import { 
  MosqueMapSection 
} from './components/MosqueMapSection';
import { 
  ZikrCounterSection 
} from './components/ZikrCounterSection';
import { 
  OfflineReadingSection 
} from './components/OfflineReadingSection';
import { 
  HadithSection 
} from './components/HadithSection';
import { 
  DailyAmalSection 
} from './components/DailyAmalSection';
import { 
  MosqueAccountsSection 
} from './components/MosqueAccountsSection';
import { 
  DonateModal 
} from './components/DonateModal';
import { 
  GlobalSearchModal 
} from './components/GlobalSearchModal';
import { 
  BackupModal 
} from './components/BackupModal';
import { 
  PrayerAlertModal, 
  ActivePrayerAlertData 
} from './components/PrayerAlertModal';
import { 
  DailyHadithModal 
} from './components/DailyHadithModal';
import { 
  OfflineIndicator 
} from './components/OfflineIndicator';

import { 
  AppStateData, 
  MosqueSettings, 
  MosqueTransaction, 
  Language, 
  FontSize, 
  ThemeMode,
  FontFamily,
  PrayerNotificationSettings,
  CalendarCustomNote
} from './types/mosque';

import { 
  loadAppState, 
  saveAppState, 
  loadPreferences, 
  savePreferences, 
  UserPreferences 
} from './utils/storage';
import { 
  BD_CITIES, 
  calculatePrayerTimes 
} from './utils/prayerCalculator';
import {
  loadPrayerNotificationSettings,
  savePrayerNotificationSettings,
  wasPrayerTriggeredToday,
  markPrayerAsTriggeredToday,
  sendPrayerWebNotification,
  playPrayerAlarmSound,
  triggerPrayerVibration
} from './utils/prayerNotificationService';
import { 
  getDailyHadith, 
  shouldTriggerPostFajrHadith, 
  sendHadithNotification 
} from './utils/dailyHadithService';
import { HardDriveDownload, Heart, Sunrise } from 'lucide-react';

export default function App() {
  const [appState, setAppState] = useState<AppStateData>(loadAppState);
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);
  const [activeTab, setActiveTab] = useState<TabKey>('prayers');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Modals & Active Alerts
  const [isDonateOpen, setIsDonateOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isBackupOpen, setIsBackupOpen] = useState<boolean>(false);
  const [isHadithModalOpen, setIsHadithModalOpen] = useState<boolean>(false);
  const [selectedSurahId, setSelectedSurahId] = useState<number>(1);
  const [prayerNotifSettings, setPrayerNotifSettings] = useState<PrayerNotificationSettings>(loadPrayerNotificationSettings);
  const [activePrayerAlertData, setActivePrayerAlertData] = useState<ActivePrayerAlertData | null>(null);

  // Auto-save app state whenever it changes
  useEffect(() => {
    saveAppState(appState);
  }, [appState]);

  // Auto-save preferences & apply theme & font size to document
  useEffect(() => {
    savePreferences(preferences);

    const root = document.documentElement;
    // Clear previous theme classes
    root.classList.remove(
      'dark', 
      'light', 
      'theme-emerald', 
      'theme-amber', 
      'theme-navy', 
      'theme-sepia'
    );

    // Apply chosen theme class
    root.classList.add(`theme-${preferences.theme}`);

    // Set dark/light baseline
    const isDark = 
      preferences.theme === 'dark' || 
      preferences.theme === 'navy' || 
      preferences.theme === 'emerald';
      
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.add('light');
    }

    // Apply font size scale, font family, and language attributes
    root.setAttribute('data-font-size', preferences.fontSize || 'large');
    root.setAttribute('data-font-family', preferences.fontFamily || 'siliguri');
    root.setAttribute('lang', preferences.language || 'bn');
    root.setAttribute('dir', preferences.language === 'ar' ? 'rtl' : 'ltr');
  }, [preferences]);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update Settings
  const handleUpdateSettings = (newSettings: Partial<MosqueSettings>) => {
    setAppState((prev) => ({
      ...prev,
      name: newSettings.name || prev.name,
      settings: {
        ...prev.settings,
        ...newSettings
      }
    }));
  };

  // Update Jamat Times
  const handleUpdateJamatTimes = (jamatTimes: MosqueSettings['jamatTimes']) => {
    setAppState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        jamatTimes
      }
    }));
  };

  // Record Donation into Mosque Ledger
  const handleRecordDonation = (newTx: Omit<MosqueTransaction, 'id'>) => {
    setAppState((prev) => ({
      ...prev,
      tx: [
        ...prev.tx,
        {
          id: Date.now(),
          ...newTx
        }
      ]
    }));
  };

  // Toggle Daily Amal
  const handleToggleAmal = (key: string) => {
    setAppState((prev) => ({
      ...prev,
      dailyAmal: {
        ...prev.dailyAmal,
        [key]: !prev.dailyAmal[key]
      }
    }));
  };

  // Update Zikr Counts
  const handleUpdateZikrCounts = (counts: Record<string, number>) => {
    setAppState((prev) => ({
      ...prev,
      zikrCounts: counts
    }));
  };

  // Add Calendar Note
  const handleAddCalendarNote = (newNote: Omit<CalendarCustomNote, 'id'>) => {
    const noteWithId: CalendarCustomNote = {
      id: `note-${Date.now()}`,
      ...newNote
    };
    setAppState((prev) => ({
      ...prev,
      calendarNotes: [...(prev.calendarNotes || []), noteWithId]
    }));
  };

  // Delete Calendar Note
  const handleDeleteCalendarNote = (id: string) => {
    setAppState((prev) => ({
      ...prev,
      calendarNotes: (prev.calendarNotes || []).filter((n) => n.id !== id)
    }));
  };


  // Background Prayer Notification, Alarm Monitor & Post-Fajr Hadith Check
  useEffect(() => {
    const checkPrayerTimes = () => {
      const now = new Date();
      const nowDecimal = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;

      // Find coordinate for current city
      const cityObj = BD_CITIES.find(
        (c) => c.nameBn === preferences.city || c.nameEn.toLowerCase() === preferences.city.toLowerCase()
      ) || BD_CITIES[0];

      const times = calculatePrayerTimes(now, cityObj.lat, cityObj.lng);

      // Automated Post-Fajr Daily Hadith Notification Check
      if (preferences.fajrHadithAlertEnabled) {
        if (shouldTriggerPostFajrHadith(times.fajr, preferences.lastFajrNotifiedDate, now)) {
          const hadith = getDailyHadith(now);
          sendHadithNotification(hadith);
          setIsHadithModalOpen(true);
          const todayStr = now.toISOString().split('T')[0];
          setPreferences((prev) => ({ ...prev, lastFajrNotifiedDate: todayStr }));
        }
      }

      if (!prayerNotifSettings.enabled) return;

      const leadMins = prayerNotifSettings.leadTimeMinutes || 0;
      const leadHours = leadMins / 60;

      const prayerDefs: { 
        key: keyof typeof prayerNotifSettings.prayers; 
        nameBn: string; 
        raw: number; 
        timeStr: string; 
        jamatKey?: keyof typeof appState.settings.jamatTimes 
      }[] = [
        { key: 'fajr', nameBn: 'ফজর', raw: times.fajrRaw, timeStr: times.fajr, jamatKey: 'fajr' },
        { key: 'dhuhr', nameBn: 'যোহর', raw: times.dhuhrRaw, timeStr: times.dhuhr, jamatKey: 'dhuhr' },
        { key: 'asr', nameBn: 'আসর', raw: times.asrRaw, timeStr: times.asr, jamatKey: 'asr' },
        { key: 'maghrib', nameBn: 'মাগরিব', raw: times.maghribRaw, timeStr: times.maghrib, jamatKey: 'maghrib' },
        { key: 'isha', nameBn: 'এশা', raw: times.ishaRaw, timeStr: times.isha, jamatKey: 'isha' },
        { key: 'tahajjud', nameBn: 'তাহাজ্জুদ', raw: times.tahajjudRaw, timeStr: times.tahajjud },
        { key: 'sehri', nameBn: 'সাহরি শেষ', raw: times.sehriRaw, timeStr: times.sehri },
        { key: 'iftar', nameBn: 'ইফতার', raw: times.iftarRaw, timeStr: times.iftar }
      ];

      for (const p of prayerDefs) {
        if (!prayerNotifSettings.prayers[p.key]) continue;

        const targetTime = p.raw - leadHours;
        const diffMinutes = (nowDecimal - targetTime) * 60;

        // Trigger if within [0, 2.5] minutes past target and hasn't triggered today
        if (diffMinutes >= 0 && diffMinutes <= 2.5) {
          if (!wasPrayerTriggeredToday(p.key, leadMins)) {
            markPrayerAsTriggeredToday(p.key, leadMins);

            const jamatStr = p.jamatKey ? appState.settings.jamatTimes[p.jamatKey] : undefined;

            // 1. Audio Alarm
            if (prayerNotifSettings.soundAlert) {
              playPrayerAlarmSound(prayerNotifSettings.athanSoundType);
            }

            // 2. Vibration
            if (prayerNotifSettings.vibrationAlert) {
              triggerPrayerVibration();
            }

            // 3. System Web Notification
            const notifTitle = leadMins > 0 
              ? `${p.nameBn}-এর আর মাত্র ${leadMins} মিনিট বাকি` 
              : `${p.nameBn}-এর ওয়াক্ত শুরু হয়েছে`;
            const notifBody = `ওয়াক্ত: ${p.timeStr}${jamatStr ? ` • জামাত: ${jamatStr}` : ''}। ${appState.name}। নামাজের জন্য ওজু করে মসজিদে যাওয়ার প্রস্তুতি নিন।`;
            sendPrayerWebNotification(notifTitle, notifBody, `prayer-${p.key}`);

            // 4. In-App Interactive Modal
            setActivePrayerAlertData({
              prayerKey: p.key,
              prayerNameBn: p.nameBn,
              prayerTimeStr: p.timeStr,
              jamatTimeStr: jamatStr,
              mosqueName: appState.name,
              leadTimeMinutes: leadMins
            });
            break;
          }
        }
      }

      // Dedicated Friday Jummah Special Alert
      if (now.getDay() === 5 && prayerNotifSettings.jummahAlert?.enabled) {
        const jummahLeadMins = prayerNotifSettings.jummahAlert.leadTimeMinutes || 30;
        const jummahTargetTime = times.dhuhrRaw - (jummahLeadMins / 60);
        const jummahDiffMinutes = (nowDecimal - jummahTargetTime) * 60;

        if (jummahDiffMinutes >= 0 && jummahDiffMinutes <= 2.5) {
          if (!wasPrayerTriggeredToday('jummah_special', jummahLeadMins)) {
            markPrayerAsTriggeredToday('jummah_special', jummahLeadMins);

            if (prayerNotifSettings.soundAlert) {
              playPrayerAlarmSound(prayerNotifSettings.jummahAlert.soundType || 'adhan_melody');
            }
            if (prayerNotifSettings.vibrationAlert) {
              triggerPrayerVibration();
            }

            const customNote = prayerNotifSettings.jummahAlert.customNote || 'জুমুআর সালাতের প্রস্তুতির সময় হয়েছে';
            sendPrayerWebNotification(
              `পবিত্র জুমুআ মোবারক! আর মাত্র ${jummahLeadMins} মিনিট বাকি`,
              `${customNote} • জুমুআ সময়: ${times.dhuhr}`,
              'prayer-jummah-special'
            );

            setActivePrayerAlertData({
              prayerKey: 'jummah',
              prayerNameBn: 'পবিত্র জুমুআ সালাত (বিশেষ রিমাইন্ডার)',
              prayerTimeStr: times.dhuhr,
              jamatTimeStr: appState.settings.jamatTimes.jummah || appState.settings.jamatTimes.dhuhr,
              mosqueName: appState.name,
              leadTimeMinutes: jummahLeadMins
            });
          }
        }
      }
    };

    checkPrayerTimes();
    const interval = setInterval(checkPrayerTimes, 12000);
    return () => clearInterval(interval);
  }, [
    prayerNotifSettings, 
    preferences.city, 
    preferences.fajrHadithAlertEnabled, 
    preferences.lastFajrNotifiedDate, 
    appState.settings, 
    appState.name
  ]);

  const handleTriggerTestAlert = () => {
    setActivePrayerAlertData({
      prayerKey: 'dhuhr',
      prayerNameBn: 'যোহর (টেস্ট এলার্ট)',
      prayerTimeStr: '০১:১৫ PM',
      jamatTimeStr: '০১:৩০ PM',
      mosqueName: appState.name,
      leadTimeMinutes: 0
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <Header
        mosqueName={appState.name}
        language={preferences.language}
        onLanguageChange={(lang) => setPreferences((p) => ({ ...p, language: lang }))}
        fontSize={preferences.fontSize}
        onFontSizeChange={(size) => setPreferences((p) => ({ ...p, fontSize: size }))}
        fontFamily={preferences.fontFamily || 'siliguri'}
        onFontFamilyChange={(font) => setPreferences((p) => ({ ...p, fontFamily: font }))}
        theme={preferences.theme}
        onThemeChange={(th) => setPreferences((p) => ({ ...p, theme: th }))}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenDonate={() => setIsDonateOpen(true)}
        onOpenHadith={() => setIsHadithModalOpen(true)}
        onOpenBackup={() => setIsBackupOpen(true)}
        isOnline={isOnline}
      />

      {/* Navigation Bar (Desktop Segmented Tabs + Mobile Scrollable Strip + Fixed Bottom App Bar) */}
      <Navigation
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        language={preferences.language}
        theme={preferences.theme}
        onThemeChange={(th) => setPreferences((p) => ({ ...p, theme: th }))}
        fontSize={preferences.fontSize}
        onFontSizeChange={(size) => setPreferences((p) => ({ ...p, fontSize: size }))}
        onOpenBackup={() => setIsBackupOpen(true)}
        onOpenDonate={() => setIsDonateOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-28 sm:pb-12">
        {activeTab === 'prayers' && (
          <PrayerTimesSection
            settings={appState.settings}
            onUpdateJamatTimes={handleUpdateJamatTimes}
            language={preferences.language}
            selectedCity={preferences.city}
            onSelectCity={(city) => setPreferences((p) => ({ ...p, city }))}
            notificationSettings={prayerNotifSettings}
            onUpdateNotificationSettings={(newSettings) => setPrayerNotifSettings(newSettings)}
            onTriggerTestAlert={handleTriggerTestAlert}
            calendarNotes={appState.calendarNotes || []}
            onAddCalendarNote={handleAddCalendarNote}
            onDeleteCalendarNote={handleDeleteCalendarNote}
            onNavigateToQibla={() => setActiveTab('qibla')}
          />

        )}

        {activeTab === 'qibla' && (
          <QiblaCompass
            language={preferences.language}
            selectedCity={preferences.city}
          />
        )}

        {activeTab === 'map' && (
          <MosqueMapSection
            settings={appState.settings}
            onUpdateSettings={handleUpdateSettings}
            language={preferences.language}
          />
        )}

        {activeTab === 'zikr' && (
          <ZikrCounterSection
            zikrCounts={appState.zikrCounts}
            onUpdateCounts={handleUpdateZikrCounts}
            language={preferences.language}
          />
        )}

        {activeTab === 'reading' && (
          <OfflineReadingSection
            initialSurahId={selectedSurahId}
            language={preferences.language}
          />
        )}

        {activeTab === 'hadith' && (
          <HadithSection
            language={preferences.language}
          />
        )}

        {activeTab === 'amal' && (
          <DailyAmalSection
            dailyAmal={appState.dailyAmal}
            onToggleAmal={handleToggleAmal}
            language={preferences.language}
          />
        )}

        {activeTab === 'accounts' && (
          <MosqueAccountsSection
            appState={appState}
            onUpdateAppState={(updater) => setAppState((prev) => updater(prev))}
            language={preferences.language}
            onOpenDonateModal={() => setIsDonateOpen(true)}
          />
        )}
      </main>

      {/* Footer with Backup, Cloud Sync, and Credit */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 py-6 text-xs text-center px-4 hidden sm:block">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBackupOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition"
            >
              <HardDriveDownload className="w-4 h-4 text-emerald-600" />
              <span>নিরাপদ ব্যাকআপ ও সিঙ্ক (AES-256)</span>
            </button>

            <button
              onClick={() => setIsHadithModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold hover:bg-emerald-100 transition"
            >
              <Sunrise className="w-4 h-4 text-amber-500" />
              <span>আজকের ফজরের হাদিস</span>
            </button>

            <button
              onClick={() => setIsDonateOpen(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold hover:bg-amber-200 transition"
            >
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
              <span>মসজিদে দান করুন</span>
            </button>
          </div>

          <div className="text-center sm:text-right text-[11px] space-y-0.5">
            <div>
              মসজিদ হিসাবঘর অ্যাপ নির্মাতা: <strong>Md Moddasel Hoque</strong> (Cell: 01914393139)
            </div>
            <div className="opacity-80">
              নামাজের সময়সূচী • কিবলা কম্পাস • জিকির • অফলাইন রিডিং • ডিজিটাল হিসাবঘর
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Offline Indicator */}
      <OfflineIndicator isOnline={isOnline} language={preferences.language} />

      {/* MODALS */}
      <PrayerAlertModal
        alertData={activePrayerAlertData}
        onDismiss={() => setActivePrayerAlertData(null)}
        onNavigateToPrayers={() => {
          setActivePrayerAlertData(null);
          setActiveTab('prayers');
        }}
      />

      <DailyHadithModal
        isOpen={isHadithModalOpen}
        onClose={() => setIsHadithModalOpen(false)}
        fajrHadithAlertEnabled={preferences.fajrHadithAlertEnabled ?? true}
        onToggleFajrAlert={(enabled) => setPreferences((p) => ({ ...p, fajrHadithAlertEnabled: enabled }))}
        language={preferences.language}
      />

      <DonateModal
        isOpen={isDonateOpen}
        onClose={() => setIsDonateOpen(false)}
        settings={appState.settings}
        onRecordDonation={handleRecordDonation}
      />

      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        appState={appState}
        language={preferences.language}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onSelectSurah={(id) => {
          setSelectedSurahId(id);
          setActiveTab('reading');
        }}
      />

      <BackupModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        appState={appState}
        onRestoreState={(restored) => setAppState(restored)}
      />
    </div>
  );
}
