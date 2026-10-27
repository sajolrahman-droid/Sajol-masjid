import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, 
  MapPin, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellRing,
  BellOff,
  ChevronRight, 
  Edit3, 
  Sun, 
  Moon, 
  Sunrise, 
  Sunset,
  Sparkles,
  Check,
  Smartphone,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Sliders,
  RotateCcw,
  CalendarDays,
  Calendar as CalendarIcon
} from 'lucide-react';
import { WeeklyPrayerChart } from './WeeklyPrayerChart';
import { PrayerTimeGapAnalyticsCard } from './PrayerTimeGapAnalyticsCard';
import { LunarPhaseWidget } from './LunarPhaseWidget';
import { MonthlyPrayerCalendar } from './MonthlyPrayerCalendar';

import { 
  BD_CITIES, 
  calculatePrayerTimes, 
  getNextPrayerInfo, 
  getApproxHijriDate, 
  getFormattedEnglishDate,
  getBengaliCalendarDate,
  calculateQibla,
  toBengaliNumerals, 
  formatTimeInBengali 
} from '../utils/prayerCalculator';
import { MosqueSettings, Language, PrayerNotificationSettings, CalendarCustomNote } from '../types/mosque';
import { TRANSLATIONS } from '../utils/translations';
import {
  loadPrayerNotificationSettings,
  savePrayerNotificationSettings,
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendTestNotification,
  playPrayerAlarmSound,
  triggerPrayerVibration
} from '../utils/prayerNotificationService';

interface PrayerTimesSectionProps {
  settings: MosqueSettings;
  onUpdateJamatTimes: (newTimes: MosqueSettings['jamatTimes']) => void;
  language: Language;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  notificationSettings?: PrayerNotificationSettings;
  onUpdateNotificationSettings?: (newSettings: PrayerNotificationSettings) => void;
  onTriggerTestAlert?: () => void;
  calendarNotes?: CalendarCustomNote[];
  onAddCalendarNote?: (note: Omit<CalendarCustomNote, 'id'>) => void;
  onDeleteCalendarNote?: (id: string) => void;
  onNavigateToQibla?: () => void;
}

export const PrayerTimesSection: React.FC<PrayerTimesSectionProps> = ({
  settings,
  onUpdateJamatTimes,
  language,
  selectedCity,
  onSelectCity,
  notificationSettings: propNotifSettings,
  onUpdateNotificationSettings: propOnUpdateNotif,
  onTriggerTestAlert,
  calendarNotes = [],
  onAddCalendarNote,
  onDeleteCalendarNote,
  onNavigateToQibla
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'monthly'>('daily');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [isHanafi, setIsHanafi] = useState(true);
  const [isEditingJamat, setIsEditingJamat] = useState(false);
  const [tempJamat, setTempJamat] = useState(settings.jamatTimes);
  const [azanAudioActive, setAzanAudioActive] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Local notification settings state
  const [localNotifSettings, setLocalNotifSettings] = useState<PrayerNotificationSettings>(() => {
    return propNotifSettings || loadPrayerNotificationSettings();
  });

  const notifSettings = propNotifSettings || localNotifSettings;

  const [permState, setPermState] = useState<'granted' | 'denied' | 'default' | 'unsupported'>('default');
  const [testingAlarm, setTestingAlarm] = useState<boolean>(false);

  useEffect(() => {
    setPermState(getNotificationPermission());
  }, []);

  const updateNotifSettings = (updater: (prev: PrayerNotificationSettings) => PrayerNotificationSettings) => {
    const updated = updater(notifSettings);
    setLocalNotifSettings(updated);
    savePrayerNotificationSettings(updated);
    if (propOnUpdateNotif) {
      propOnUpdateNotif(updated);
    }
  };

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermState(res);
  };

  const handleTestNotificationAndAlarm = () => {
    setTestingAlarm(true);
    sendTestNotification();
    if (onTriggerTestAlert) {
      onTriggerTestAlert();
    }
    setTimeout(() => setTestingAlarm(false), 2000);
  };

  const t = TRANSLATIONS[language];

  // Tick clock every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Find city coordinate
  const currentCityObj = useMemo(() => {
    return BD_CITIES.find((c) => c.nameBn === selectedCity || c.nameEn.toLowerCase() === selectedCity.toLowerCase()) || BD_CITIES[0];
  }, [selectedCity]);

  // Calculate prayer times
  const prayerTimes = useMemo(() => {
    return calculatePrayerTimes(currentTime, currentCityObj.lat, currentCityObj.lng, isHanafi);
  }, [currentTime, currentCityObj, isHanafi]);

  // Next prayer info
  const nextInfo = useMemo(() => {
    return getNextPrayerInfo(currentTime, prayerTimes);
  }, [currentTime, prayerTimes]);

  // Hijri date
  const hijri = useMemo(() => {
    return getApproxHijriDate(currentTime);
  }, [currentTime]);

  // English formatted date
  const englishDateText = useMemo(() => {
    return getFormattedEnglishDate(currentTime);
  }, [currentTime]);

  // Bangla Academy Calendar date
  const banglaDate = useMemo(() => {
    return getBengaliCalendarDate(currentTime);
  }, [currentTime]);

  // Qibla angle for selected city
  const cityQiblaAngle = useMemo(() => {
    return calculateQibla(currentCityObj.lat, currentCityObj.lng);
  }, [currentCityObj]);

  // Play test gentle beep/chime
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.5); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 1.3);
      setAzanAudioActive(true);
      setTimeout(() => setAzanAudioActive(false), 2000);
    } catch {
      // AudioContext not allowed without interaction
    }
  };

  const handleSaveJamat = () => {
    onUpdateJamatTimes(tempJamat);
    setIsEditingJamat(false);
  };

  const handleResetJamatDefaults = () => {
    const defaults = {
      fajr: '05:15 AM',
      dhuhr: '01:30 PM',
      asr: '04:45 PM',
      maghrib: '05:50 PM',
      isha: '08:00 PM',
      jummah: '01:30 PM'
    };
    setTempJamat(defaults);
    onUpdateJamatTimes(defaults);
  };

  const handleResetNotifDefaults = () => {
    const defaultNotif: PrayerNotificationSettings = {
      enabled: true,
      soundAlert: true,
      vibrationAlert: true,
      leadTimeMinutes: 0,
      athanSoundType: 'adhan_melody',
      prayers: {
        fajr: true,
        dhuhr: true,
        asr: true,
        maghrib: true,
        isha: true,
        tahajjud: false,
        sehri: false,
        iftar: true
      }
    };
    setLocalNotifSettings(defaultNotif);
    savePrayerNotificationSettings(defaultNotif);
    if (propOnUpdateNotif) propOnUpdateNotif(defaultNotif);
  };

  const prayerRows = [
    {
      key: 'Fajr',
      nameBn: t.prayerNames.fajr,
      nameEn: 'Fajr',
      time: prayerTimes.fajr,
      jamat: settings.jamatTimes.fajr,
      icon: <Sunrise className="w-5 h-5 text-indigo-500" />,
      isNext: nextInfo.nextPrayer === 'Fajr'
    },
    {
      key: 'Dhuhr',
      nameBn: t.prayerNames.dhuhr,
      nameEn: 'Dhuhr',
      time: prayerTimes.dhuhr,
      jamat: settings.jamatTimes.dhuhr,
      icon: <Sun className="w-5 h-5 text-amber-500" />,
      isNext: nextInfo.nextPrayer === 'Dhuhr'
    },
    {
      key: 'Asr',
      nameBn: t.prayerNames.asr,
      nameEn: 'Asr',
      time: prayerTimes.asr,
      jamat: settings.jamatTimes.asr,
      icon: <Sun className="w-5 h-5 text-orange-500" />,
      isNext: nextInfo.nextPrayer === 'Asr'
    },
    {
      key: 'Maghrib',
      nameBn: t.prayerNames.maghrib,
      nameEn: 'Maghrib',
      time: prayerTimes.maghrib,
      jamat: settings.jamatTimes.maghrib,
      icon: <Sunset className="w-5 h-5 text-rose-500" />,
      isNext: nextInfo.nextPrayer === 'Maghrib'
    },
    {
      key: 'Isha',
      nameBn: t.prayerNames.isha,
      nameEn: 'Isha',
      time: prayerTimes.isha,
      jamat: settings.jamatTimes.isha,
      icon: <Moon className="w-5 h-5 text-blue-500" />,
      isNext: nextInfo.nextPrayer === 'Isha'
    },
    {
      key: 'Jummah',
      nameBn: t.prayerNames.jummah,
      nameEn: 'Jummah',
      time: prayerTimes.dhuhr,
      jamat: settings.jamatTimes.jummah,
      icon: <Sparkles className="w-5 h-5 text-emerald-600" />,
      isNext: false,
      isSpecial: true
    }
  ];

  return (
    <div className="space-y-4">
      {/* Top Segmented Mode Switcher: Daily Prayer Times vs Monthly Calendar */}
      <div className="p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between gap-1.5">
        <button
          onClick={() => setViewMode('daily')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            viewMode === 'daily'
              ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>দৈনিক ওয়াক্ত ও সময়সূচী</span>
        </button>

        <button
          onClick={() => setViewMode('monthly')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 sm:py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            viewMode === 'monthly'
              ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-sm'
              : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarDays className="w-4 h-4 text-amber-400" />
          <span>মাসিক ক্যালেন্ডার ও ইসলামিক দিবস</span>
          {calendarNotes.length > 0 && (
            <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-400 text-slate-950">
              {calendarNotes.length}টি নোট
            </span>
          )}
        </button>
      </div>

      {viewMode === 'monthly' ? (
        <MonthlyPrayerCalendar
          selectedCity={selectedCity}
          isHanafi={isHanafi}
          language={language}
          notes={calendarNotes}
          onAddNote={onAddCalendarNote || (() => {})}
          onDeleteNote={onDeleteCalendarNote || (() => {})}
        />
      ) : (
        <>
          {/* Quick link banner to monthly calendar in daily mode */}
          <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-900/40 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="text-slate-700 dark:text-slate-300 truncate">
                চলতি মাসের ইসলামিক দিবস, সুন্নাত রোজা ও মসজিদের কাস্টম নোট দেখতে চান?
              </span>
            </div>
            <button
              onClick={() => setViewMode('monthly')}
              className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shrink-0 transition"
            >
              মাসিক ক্যালেন্ডার খুলুন
            </button>
          </div>

          {/* Hero Card: Current Time & Next Prayer Banner */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-teal-950 text-white p-4 sm:p-6 shadow-xl border border-emerald-700/50">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-44 h-44 rounded-full bg-emerald-500/10 blur-2xl pointer-events-none" />


        {/* Top bar with location, Qibla button, and English + Hijri + Bangla dates */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-4 border-b border-emerald-700/60 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-2 font-medium text-emerald-200">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => onSelectCity(e.target.value)}
                className="bg-emerald-950/70 border border-emerald-600/60 rounded-lg px-2.5 py-1 text-white font-semibold text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-400"
              >
                {BD_CITIES.map((c) => (
                  <option key={c.nameBn} value={c.nameBn} className="bg-slate-900 text-white">
                    {c.nameBn} ({c.nameEn})
                  </option>
                ))}
              </select>
            </div>

            {/* Quick Qibla Badge Button */}
            {onNavigateToQibla && (
              <button
                type="button"
                onClick={onNavigateToQibla}
                className="px-2.5 py-1 rounded-lg bg-amber-400/20 text-amber-300 hover:bg-amber-400/30 border border-amber-400/40 font-bold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
                title="কিবলা কম্পাস খুলুন"
              >
                <span>🧭 কিবলা: {toBengaliNumerals(cityQiblaAngle)}°</span>
                <ChevronRight className="w-3 h-3 text-amber-400" />
              </button>
            )}
          </div>

          {/* All 3 Dates Display: English Date, Hijri Date, Bangla Date */}
          <div className="flex flex-wrap items-center justify-start lg:justify-end gap-1.5 sm:gap-2 text-xs sm:text-sm">
            {/* English Date */}
            <span className="bg-emerald-950/80 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-400/30 font-bold flex items-center gap-1">
              <CalendarIcon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>{englishDateText}</span>
            </span>

            {/* Hijri Date */}
            <span className="bg-emerald-900/90 text-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-500/60 font-bold shadow-xs">
              🕌 {toBengaliNumerals(hijri.day)} {hijri.monthBn} {toBengaliNumerals(hijri.year)} হিজরি
            </span>

            {/* Bangla Date */}
            <span className="bg-amber-950/60 text-amber-200 px-2.5 py-1 rounded-lg border border-amber-500/40 font-semibold">
              🌾 {banglaDate.fullText}
            </span>
          </div>
        </div>

        {/* Next Prayer Countdown Spotlight */}
        <div className="py-4 sm:py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/40">
              <Clock className="w-3.5 h-3.5 animate-spin" /> {t.nextPrayer}
            </span>
            <div className="mt-2 text-2xl sm:text-4xl font-extrabold tracking-tight text-white flex items-baseline gap-2">
              <span>{nextInfo.nextPrayerBn}</span>
              <span className="text-xl sm:text-2xl text-amber-400 font-semibold">
                {formatTimeInBengali(nextInfo.nextTimeStr)}
              </span>
            </div>
            <p className="text-sm text-emerald-200/90 mt-1">
              ওয়াক্ত শুরু হতে বাকি:{' '}
              <strong className="text-white text-base">
                {toBengaliNumerals(nextInfo.hoursRemaining)} ঘণ্টা {toBengaliNumerals(nextInfo.minsRemaining)} মিনিট
              </strong>
            </p>
          </div>

          {/* Clock & Sound reminder */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-emerald-950/60 p-3 rounded-xl border border-emerald-700/50">
            <div>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-emerald-300">
                {toBengaliNumerals(currentTime.toLocaleTimeString('bn-BD'))}
              </div>
              <div className="text-[11px] text-emerald-200/70">
                {currentTime.toLocaleDateString('bn-BD', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                playChime();
              }}
              className={`p-2.5 rounded-xl border transition ${
                soundEnabled 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30' 
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={soundEnabled ? 'আযান সাউন্ড সক্রিয়' : 'সাউন্ড বন্ধ'}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Progress bar to next prayer */}
        <div className="mt-1">
          <div className="w-full bg-emerald-950/80 rounded-full h-2.5 overflow-hidden p-0.5 border border-emerald-700/40">
            <div
              className="bg-gradient-to-r from-emerald-400 to-amber-400 h-full rounded-full transition-all duration-1000"
              style={{ width: `${nextInfo.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-emerald-200/70 mt-1">
            <span>বর্তমান ওয়াক্ত: {nextInfo.currentPrayerBn}</span>
            <span>{toBengaliNumerals(Math.round(nextInfo.progressPercent))}% অতিবাহিত</span>
          </div>
        </div>
      </div>

      {/* Sehri & Iftar Card (especially helpful year-round & for Ramadan/Sunnah fasts) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 border border-amber-200 dark:border-amber-900/40">
          <div className="text-xs font-semibold text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>সাহরির শেষ সময়</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatTimeInBengali(prayerTimes.sehri)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">ফজরের ১০ মি. পূর্বে সতর্কতামূলক</p>
        </div>

        <div className="p-3 sm:p-4 rounded-xl bg-gradient-to-br from-rose-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 border border-rose-200 dark:border-rose-900/40">
          <div className="text-xs font-semibold text-rose-800 dark:text-rose-400 flex items-center gap-1.5">
            <Sunset className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>ইফতারের সময়</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatTimeInBengali(prayerTimes.iftar)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">মাগরিবের সাথে শুরু</p>
        </div>

        <div className="col-span-2 sm:col-span-1 p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
            <Sunrise className="w-4 h-4 text-indigo-600" />
            <span>সূর্যোদয় ও ইশরাক</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-1">
            {formatTimeInBengali(prayerTimes.sunrise)}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">তাহাজ্জুদ: {formatTimeInBengali(prayerTimes.tahajjud)}</p>
        </div>
      </div>

      {/* Lunar Phase & Islamic Calendar Astronomical Tracker Widget */}
      <LunarPhaseWidget
        currentDate={currentTime}
        language={language}
      />

      {/* Main Prayer Times & Local Mosque Jamat Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-200 dark:border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>আজকের ৫ ওয়াক্ত নামাজ ও জামাতের সময়সূচী</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {settings.name} — ওয়াক্ত শুরু ও স্থানীয় মসজিদের জামাত
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditingJamat(!isEditingJamat)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{isEditingJamat ? 'সম্পাদনা বাতিল' : 'জামাতের সময় আপডেট'}</span>
            </button>
          </div>
        </div>

        {/* Jamat Edit Modal/Form if active */}
        {isEditingJamat && (
          <div className="mb-4 p-3.5 bg-emerald-50/70 dark:bg-slate-800/80 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 mb-2">
              মসজিদের জামাতের সময় পরিবর্তন করুন (কমিটি/ইমামের জন্য)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
              {(['fajr', 'dhuhr', 'asr', 'maghrib', 'isha', 'jummah'] as const).map((key) => (
                <label key={key} className="block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{key}:</span>
                  <input
                    type="text"
                    value={tempJamat[key]}
                    onChange={(e) => setTempJamat({ ...tempJamat, [key]: e.target.value })}
                    className="mt-1 w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white font-medium"
                    placeholder="e.g. 05:15 AM"
                  />
                </label>
              ))}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={handleResetJamatDefaults}
                className="px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 rounded-lg hover:bg-rose-100 flex items-center gap-1 border border-rose-200 dark:border-rose-900"
                title="ডিফল্ট জামাত সময়সূচীতে রিসেট করুন"
              >
                <RotateCcw className="w-3.5 h-3.5" /> ডিফল্ট রিসেট
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingJamat(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                >
                  বাতিল
                </button>
                <button
                  onClick={handleSaveJamat}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> সংরক্ষণ করুন
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prayer Time Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 font-semibold">
                <th className="py-2.5 px-3">নামাজের ওয়াক্ত</th>
                <th className="py-2.5 px-3">ওয়াক্ত শুরু</th>
                <th className="py-2.5 px-3 text-right">মসজিদে জামাত</th>
                <th className="py-2.5 px-3 text-center">অবস্থা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-sm">
              {prayerRows.map((row) => (
                <tr
                  key={row.key}
                  className={`transition-colors ${
                    row.isNext
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/40 font-bold text-emerald-950 dark:text-emerald-100'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <td className="py-3 px-3 flex items-center gap-2.5">
                    <span className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {row.icon}
                    </span>
                    <div>
                      <div className="font-bold">{row.nameBn}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                        {row.nameEn}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700 dark:text-slate-300">
                    {formatTimeInBengali(row.time)}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                    {formatTimeInBengali(row.jamat)}
                  </td>
                  <td className="py-3 px-3 text-center">
                    {row.isNext ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-600 text-white animate-pulse">
                        পরবর্তী ওয়াক্ত
                      </span>
                    ) : row.isSpecial ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                        সাপ্তাহিক
                      </span>
                    ) : (
                      <span className="text-slate-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation footnote */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div>
            <span>পদ্ধতি: ইসলামিক ফাউন্ডেশন বাংলাদেশ / করাচি বিশ্ববিদ্যালয় (হানাফী মাযহাব)</span>
          </div>
          <div className="flex items-center gap-2">
            <span>আসরের সময়:</span>
            <button
              onClick={() => setIsHanafi(!isHanafi)}
              className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-200 cursor-pointer"
            >
              {isHanafi ? 'হানাফী (দ্বিগুণ ছায়া)' : 'শাফেঈ / সাধারণ'}
            </button>
          </div>
        </div>
      </div>

      {/* Recharts Weekly Prayer Time Shift Visualization Chart */}
      <WeeklyPrayerChart
        selectedCity={selectedCity}
        isHanafi={isHanafi}
        language={language}
        onResetCityAndMethod={() => {
          onSelectCity('ঢাকা');
          setIsHanafi(true);
        }}
      />

      {/* Recharts Past Week Time Gap Analytical Bar Chart */}
      <PrayerTimeGapAnalyticsCard
        currentTime={currentTime}
        selectedCity={selectedCity}
        isHanafi={isHanafi}
        language={language}
      />

      {/* Local Notification & Prayer Time Alarm Settings Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 shadow-md border border-slate-200 dark:border-slate-800 space-y-5">
        {/* Header with Master Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <BellRing className="w-5 h-5 animate-pulse" />
              </span>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                নামাজের এলার্ম ও লোকাল নোটিফিকেশন সিস্টেম
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Web Notifications API, আযানের সুর ও হ্যাপটিক ভাইব্রেশনের মাধ্যমে প্রতি ওয়াক্তে সময়মতো সতর্কবার্তা
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleResetNotifDefaults}
              className="px-2.5 py-1 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 rounded-lg flex items-center gap-1 border border-rose-200 dark:border-rose-900 transition"
              title="এলার্ম সেটিংস ডিফল্ট অবস্থায় রিসেট করুন"
            >
              <RotateCcw className="w-3 h-3" /> রিসেট
            </button>
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {notifSettings.enabled ? 'এলার্ট সক্রিয়' : 'এলার্ট বন্ধ'}
            </span>
            <button
              onClick={() => updateNotifSettings((s) => ({ ...s, enabled: !s.enabled }))}
              className={`w-12 h-6.5 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                notifSettings.enabled ? 'bg-emerald-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
              }`}
              title={notifSettings.enabled ? 'এলার্ট বন্ধ করুন' : 'এলার্ট চালু করুন'}
            >
              <div className="w-4.5 h-4.5 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>
        </div>

        {/* Browser Permission Banner */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-2.5">
            {permState === 'granted' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
            ) : permState === 'denied' ? (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 sm:mt-0" />
            ) : (
              <Bell className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
            )}
            <div className="text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {permState === 'granted'
                  ? 'ওয়েব নোটিফিকেশন পারমিশন অনুমোদিত (Desktop & Mobile)'
                  : permState === 'denied'
                  ? 'ব্রাউজারে নোটিফিকেশন বন্ধ করা রয়েছে'
                  : 'সিস্টেম নোটিফিকেশনের অনুমতি দিন'}
              </div>
              <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                {permState === 'granted'
                  ? 'ওয়াক্ত শুরু হলে আপনার মোবাইল বা কম্পিউটারের পর্দায় স্বয়ংক্রিয় নোটিফিকেশন পপ-আপ প্রদর্শিত হবে।'
                  : permState === 'denied'
                  ? 'ব্রাউজার সাইট সেটিংসে গিয়ে Notifications অপশনটি Allow করে দিন।'
                  : 'মোবাইল বা পিসিতে ব্যাকগ্রাউন্ড নোটিফিকেশন পেতে অনুমতি বাটনটিতে চাপুন।'}
              </div>
            </div>
          </div>

          {permState !== 'granted' && permState !== 'unsupported' && (
            <button
              onClick={handleRequestPermission}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>অনুমতি দিন (Allow)</span>
            </button>
          )}
        </div>

        {/* Detailed Alarm Settings (Visible when enabled) */}
        {notifSettings.enabled && (
          <div className="space-y-4 pt-1">
            {/* Advance Lead Time Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>🔔 সতর্কবার্তা দেওয়ার সময় (Timing):</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                  {notifSettings.leadTimeMinutes === 0
                    ? 'ঠিক ওয়াক্তের সময়'
                    : `${toBengaliNumerals(notifSettings.leadTimeMinutes)} মিনিট পূর্বে`}
                </span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { val: 0, label: 'ঠিক সময়ে (০ মি.)' },
                  { val: 5, label: '৫ মিনিট পূর্বে' },
                  { val: 10, label: '১০ মিনিট পূর্বে' },
                  { val: 15, label: '১৫ মিনিট পূর্বে' }
                ].map((item) => (
                  <button
                    key={item.val}
                    onClick={() => updateNotifSettings((s) => ({ ...s, leadTimeMinutes: item.val }))}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                      notifSettings.leadTimeMinutes === item.val
                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sound & Melody Options */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-emerald-600" />
                  <span>আযান ও অডিও সুর (Audio Alarm):</span>
                </span>
                <button
                  onClick={() => updateNotifSettings((s) => ({ ...s, soundAlert: !s.soundAlert }))}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition border cursor-pointer ${
                    notifSettings.soundAlert
                      ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-transparent'
                  }`}
                >
                  {notifSettings.soundAlert ? 'শব্দ চালু' : 'নিঃশব্দ (Mute)'}
                </button>
              </div>

              {notifSettings.soundAlert && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'adhan_melody', label: '🕌 তাকবীর ও আযানের সুর' },
                    { id: 'gentle_chime', label: '🔔 মিষ্টি চিম্প সুর' },
                    { id: 'soft_bell', label: '🎵 সফট বেল অ্যালার্ম' }
                  ].map((tune) => (
                    <button
                      key={tune.id}
                      onClick={() => {
                        updateNotifSettings((s) => ({
                          ...s,
                          athanSoundType: tune.id as 'adhan_melody' | 'gentle_chime' | 'soft_bell'
                        }));
                        playPrayerAlarmSound(tune.id as 'adhan_melody' | 'gentle_chime' | 'soft_bell');
                      }}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer ${
                        notifSettings.athanSoundType === tune.id
                          ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {tune.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Haptic Vibration Toggle */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-emerald-600" />
                <span>মোবাইল হ্যাপটিক ভাইব্রেশন (Vibration Alert):</span>
              </span>
              <button
                onClick={() => updateNotifSettings((s) => ({ ...s, vibrationAlert: !s.vibrationAlert }))}
                className={`px-3 py-1 rounded-full text-xs font-bold transition border cursor-pointer ${
                  notifSettings.vibrationAlert
                    ? 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-transparent'
                }`}
              >
                {notifSettings.vibrationAlert ? 'ভাইব্রেশন চালু' : 'বন্ধ'}
              </button>
            </div>

            {/* Individual Prayer Selection Toggles */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>🕌 কোন কোন ওয়াক্তে এলার্ট বাজবে:</span>
                <span className="text-[11px] text-slate-500">ওয়াক্তে ক্লিক করে অন/অফ করুন</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'fajr', label: 'ফজর' },
                  { key: 'dhuhr', label: 'যোহর' },
                  { key: 'asr', label: 'আসর' },
                  { key: 'maghrib', label: 'মাগরিব' },
                  { key: 'isha', label: 'এশা' },
                  { key: 'tahajjud', label: 'তাহাজ্জুদ' },
                  { key: 'sehri', label: 'সাহরি শেষ' },
                  { key: 'iftar', label: 'ইফতার' }
                ].map((item) => {
                  const isChecked = !!notifSettings.prayers[item.key as keyof typeof notifSettings.prayers];
                  return (
                    <button
                      key={item.key}
                      onClick={() =>
                        updateNotifSettings((s) => ({
                          ...s,
                          prayers: {
                            ...s.prayers,
                            [item.key]: !isChecked
                          }
                        }))
                      }
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition border cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-60'
                      }`}
                    >
                      <span>{item.label}</span>
                      <span>{isChecked ? '✓' : '✕'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dedicated Friday Jummah Special Notification Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 dark:from-amber-950/40 dark:via-emerald-950/40 dark:to-teal-950/40 border-2 border-amber-500/40 dark:border-amber-600/50 space-y-3.5 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-extrabold text-lg shadow-sm shrink-0">
                    🕌
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>শুক্রবার জুমুআ বিশেষ রিমাইন্ডার (Friday Jummah Alert)</span>
                      <span className="text-[10px] px-2 py-0.2 rounded-md bg-amber-500 text-slate-950 font-bold">
                        কাস্টম সময়
                      </span>
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300">
                      প্রতি শুক্রবার জুমুআর নামাজের পূর্বে আপনার কাস্টমাইজড আগাম রিমাইন্ডার ও সুন্নাত বার্তা
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateNotifSettings((s) => ({
                        ...s,
                        jummahAlert: {
                          enabled: !(s.jummahAlert?.enabled ?? true),
                          leadTimeMinutes: s.jummahAlert?.leadTimeMinutes || 30,
                          soundType: s.jummahAlert?.soundType || 'adhan_melody',
                          customNote: s.jummahAlert?.customNote || 'জুমুআর সালাতের প্রস্তুতির সময় হয়েছে (গোসল, মেসওয়াক ও সুরমা ব্যবহার করুন)'
                        }
                      }))
                    }
                    className={`px-3 py-1 rounded-full text-xs font-bold transition border cursor-pointer ${
                      (notifSettings.jummahAlert?.enabled ?? true)
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-extrabold shadow-2xs'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400 border-transparent'
                    }`}
                  >
                    {(notifSettings.jummahAlert?.enabled ?? true) ? 'জুমুআ এলার্ট চালু' : 'বন্ধ'}
                  </button>
                </div>
              </div>

              {(notifSettings.jummahAlert?.enabled ?? true) && (
                <div className="space-y-3 pt-2 border-t border-amber-500/30 dark:border-amber-700/30 text-xs">
                  {/* Lead Time Selection */}
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1.5">
                      ⏰ শুক্রবার জুমুআর কত মিনিট পূর্বে রিমাইন্ডার পাবেন:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { val: 15, label: '১৫ মিনিট পূর্বে' },
                        { val: 30, label: '৩০ মিনিট পূর্বে (প্রস্তাবিত)' },
                        { val: 45, label: '৪৫ মিনিট পূর্বে' },
                        { val: 60, label: '৬০ মিনিট (১ ঘণ্টা)' }
                      ].map((item) => {
                        const isSelected = (notifSettings.jummahAlert?.leadTimeMinutes ?? 30) === item.val;
                        return (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() =>
                              updateNotifSettings((s) => ({
                                ...s,
                                jummahAlert: {
                                  enabled: true,
                                  leadTimeMinutes: item.val,
                                  soundType: s.jummahAlert?.soundType || 'adhan_melody',
                                  customNote: s.jummahAlert?.customNote || 'জুমুআর সালাতের প্রস্তুতির সময় হয়েছে'
                                }
                              }))
                            }
                            className={`py-2 px-2.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-2xs'
                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Custom Message / Sunnah Checklist Note */}
                  <div>
                    <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                      📝 শুক্রবারের সুন্নাত ও নোটিফিকেশন বার্তা:
                    </label>
                    <input
                      type="text"
                      value={
                        notifSettings.jummahAlert?.customNote ??
                        'জুমুআর সালাতের প্রস্তুতির সময় হয়েছে (গোসল, মেসওয়াক ও সুরমা ব্যবহার করুন)'
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        updateNotifSettings((s) => ({
                          ...s,
                          jummahAlert: {
                            enabled: true,
                            leadTimeMinutes: s.jummahAlert?.leadTimeMinutes ?? 30,
                            soundType: s.jummahAlert?.soundType || 'adhan_melody',
                            customNote: val
                          }
                        }));
                      }}
                      className="w-full p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-medium"
                      placeholder="জুমুআর সালাতের প্রস্তুতির সুন্নাত বার্তা লিখুন..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Test Action Button */}
            <div className="pt-2 flex justify-end">
              <button
                onClick={handleTestNotificationAndAlarm}
                className={`py-2.5 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition shadow-md flex items-center gap-2 cursor-pointer ${
                  testingAlarm
                    ? 'bg-amber-500 text-slate-950 scale-105'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
                title="টেস্ট নোটিফিকেশন, আযানের সুর ও ভাইব্রেশন পরীক্ষা করুন"
              >
                <BellRing className="w-4 h-4 animate-bounce" />
                <span>{testingAlarm ? 'নোটিফিকেশন পাঠানো হয়েছে...' : '🔔 এলার্ম ও নোটিফিকেশন টেস্ট করুন'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )}
</div>
  );
};


