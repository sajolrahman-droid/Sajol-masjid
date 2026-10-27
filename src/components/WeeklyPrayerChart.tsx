import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  TrendingUp,
  SlidersHorizontal,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import { calculatePrayerTimes, toBengaliNumerals, BD_CITIES } from '../utils/prayerCalculator';
import { Language } from '../types/mosque';

interface WeeklyPrayerChartProps {
  selectedCity: string;
  isHanafi: boolean;
  language: Language;
  onResetCityAndMethod?: () => void;
}

export interface PrayerVisibilityMap {
  fajr: boolean;
  sunrise: boolean;
  dhuhr: boolean;
  asr: boolean;
  maghrib: boolean;
  isha: boolean;
  sehri: boolean;
  iftar: boolean;
}

const DEFAULT_PRAYER_VISIBILITY: PrayerVisibilityMap = {
  fajr: true,
  sunrise: false,
  dhuhr: true,
  asr: true,
  maghrib: true,
  isha: true,
  sehri: false,
  iftar: true
};

// Converts time string e.g. "04:45 AM" or "05:40 PM" to minutes from midnight
const timeToMinutes = (timeStr: string): number => {
  if (!timeStr) return 0;
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] ? match[3].toUpperCase() : null;

  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

// Converts minutes from midnight to formatted AM/PM time
const minutesToFormattedTime = (totalMinutes: number, lang: Language): string => {
  if (totalMinutes === undefined || totalMinutes === null) return '';
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const mins = Math.floor(totalMinutes % 60);
  const period = hours24 >= 12 ? (lang === 'bn' ? 'PM' : 'PM') : (lang === 'bn' ? 'AM' : 'AM');
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  const minStr = mins < 10 ? `0${mins}` : `${mins}`;

  if (lang === 'bn') {
    return `${toBengaliNumerals(hours12)}:${toBengaliNumerals(minStr)} ${period}`;
  }
  return `${hours12}:${minStr} ${period}`;
};

export const WeeklyPrayerChart: React.FC<WeeklyPrayerChartProps> = ({
  selectedCity,
  isHanafi,
  language,
  onResetCityAndMethod
}) => {
  const [weekOffset, setWeekOffset] = useState<number>(0); // 0 = current week, -1 = prev, +1 = next
  const [visibility, setVisibility] = useState<PrayerVisibilityMap>(DEFAULT_PRAYER_VISIBILITY);

  // Find active city
  const currentCityObj = useMemo(() => {
    return BD_CITIES.find((c) => c.nameBn === selectedCity || c.nameEn.toLowerCase() === selectedCity.toLowerCase()) || BD_CITIES[0];
  }, [selectedCity]);

  // Calculate 7 days of prayer times starting from current week start
  const weeklyData = useMemo(() => {
    const today = new Date();
    // Start date shifted by weekOffset * 7 days
    const baseDate = new Date(today);
    baseDate.setDate(today.getDate() + weekOffset * 7);

    // Get Sunday of that week (or Saturday)
    const dayOfWeek = baseDate.getDay();
    const startDate = new Date(baseDate);
    startDate.setDate(baseDate.getDate() - dayOfWeek);

    const bnDayNames = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
    const enDayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const result = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);

      const pTimes = calculatePrayerTimes(d, currentCityObj.lat, currentCityObj.lng, isHanafi);
      const dayIdx = d.getDay();
      const dateNum = d.getDate();

      const dayLabel = language === 'bn'
        ? `${bnDayNames[dayIdx]} (${toBengaliNumerals(dateNum)})`
        : `${enDayNames[dayIdx]} (${dateNum})`;

      result.push({
        dateObj: d,
        dayLabel,
        rawDate: d.toISOString().slice(0, 10),

        fajr: timeToMinutes(pTimes.fajr),
        fajrStr: pTimes.fajr,

        sunrise: timeToMinutes(pTimes.sunrise),
        sunriseStr: pTimes.sunrise,

        dhuhr: timeToMinutes(pTimes.dhuhr),
        dhuhrStr: pTimes.dhuhr,

        asr: timeToMinutes(pTimes.asr),
        asrStr: pTimes.asr,

        maghrib: timeToMinutes(pTimes.maghrib),
        maghribStr: pTimes.maghrib,

        isha: timeToMinutes(pTimes.isha),
        ishaStr: pTimes.isha,

        sehri: timeToMinutes(pTimes.sehri),
        sehriStr: pTimes.sehri,

        iftar: timeToMinutes(pTimes.iftar),
        iftarStr: pTimes.iftar
      });
    }

    return result;
  }, [weekOffset, currentCityObj, isHanafi, language]);

  // Toggle individual prayer line visibility
  const toggleVisibility = (key: keyof PrayerVisibilityMap) => {
    setVisibility((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Reset Chart Filters and Offset to Default
  const handleResetChart = () => {
    setVisibility(DEFAULT_PRAYER_VISIBILITY);
    setWeekOffset(0);
  };

  // Prayer Config
  const prayerLinesConfig: Array<{
    key: keyof PrayerVisibilityMap;
    labelBn: string;
    labelEn: string;
    color: string;
  }> = [
    { key: 'fajr', labelBn: 'ফজর', labelEn: 'Fajr', color: '#059669' },
    { key: 'sunrise', labelBn: 'সূর্যোদয়', labelEn: 'Sunrise', color: '#d97706' },
    { key: 'dhuhr', labelBn: 'যোহর', labelEn: 'Dhuhr', color: '#2563eb' },
    { key: 'asr', labelBn: 'আসর', labelEn: 'Asr', color: '#7c3aed' },
    { key: 'maghrib', labelBn: 'মাগরিব', labelEn: 'Maghrib', color: '#e11d48' },
    { key: 'isha', labelBn: 'এশা', labelEn: 'Isha', color: '#4f46e5' },
    { key: 'sehri', labelBn: 'সাহরি শেষ', labelEn: 'Suhoor', color: '#0284c7' },
    { key: 'iftar', labelBn: 'ইফতার', labelEn: 'Iftar', color: '#ea580c' }
  ];

  // Custom Recharts Tooltip Component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="p-3 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs space-y-1.5 min-w-44">
        <div className="font-bold text-amber-300 border-b border-slate-700 pb-1 flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5 text-amber-400" />
          <span>{label}</span>
        </div>
        <div className="space-y-1 pt-0.5">
          {payload.map((entry: any) => {
            const config = prayerLinesConfig.find((c) => c.key === entry.dataKey);
            const valMinutes = entry.value;
            const formattedTime = minutesToFormattedTime(valMinutes, language);
            const name = language === 'bn' ? config?.labelBn : config?.labelEn;

            return (
              <div key={entry.dataKey} className="flex items-center justify-between gap-3 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                  <span className="text-slate-300">{name}:</span>
                </div>
                <strong className="font-mono text-white">{formattedTime}</strong>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      {/* Header & Week Offset Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>সাপ্তাহিক নামাজের সময়সূচীর পরিবর্তন (Prayer Time Shift Chart)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                রিচার্টস ভিজ্যুয়ালাইজেশন
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              সূর্য ও ঋতু পরিবর্তনের সাথে নামাজের সময়সূচীর গতিধারা
            </p>
          </div>
        </div>

        {/* Action Controls & Reset Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Week Offset Navigator */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              title="পূর্ববর্তী সপ্তাহ"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-2 font-semibold text-slate-900 dark:text-white whitespace-nowrap text-[11px]">
              {weekOffset === 0
                ? (language === 'bn' ? 'চলতি সপ্তাহ' : 'Current Week')
                : weekOffset > 0
                ? (language === 'bn' ? `+${toBengaliNumerals(weekOffset)} সপ্তাহ` : `+${weekOffset} Week`)
                : (language === 'bn' ? `${toBengaliNumerals(weekOffset)} সপ্তাহ` : `${weekOffset} Week`)}
            </span>

            <button
              type="button"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              className="p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
              title="পরবর্তী সপ্তাহ"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Reset Chart Settings Button */}
          <button
            type="button"
            onClick={handleResetChart}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 border border-slate-200 dark:border-slate-700 transition"
            title="চার্ট ফিল্টার ও সময়কাল রিসেট করুন"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            <span>চার্ট রিসেট</span>
          </button>

          {/* Global City/Method Reset Option */}
          {onResetCityAndMethod && (
            <button
              type="button"
              onClick={onResetCityAndMethod}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center gap-1 border border-emerald-200 dark:border-emerald-800 transition"
              title="স্থান ও মাযহাব রিসেট (ঢাকা, হানাফী)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>লোকেশন রিসেট</span>
            </button>
          )}
        </div>
      </div>

      {/* Interactive Prayer Line Toggles */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-600" />
          <span>প্রদর্শন ফিল্টার:</span>
        </span>

        {prayerLinesConfig.map((cfg) => {
          const active = visibility[cfg.key];
          const name = language === 'bn' ? cfg.labelBn : cfg.labelEn;

          return (
            <button
              key={cfg.key}
              type="button"
              onClick={() => toggleVisibility(cfg.key)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 border ${
                active
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-800 dark:border-white shadow-2xs'
                  : 'bg-slate-50 text-slate-400 dark:bg-slate-800 dark:text-slate-500 border-slate-200 dark:border-slate-700 opacity-60'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: active ? cfg.color : '#94a3b8' }} />
              <span>{name}</span>
              {active ? <Eye className="w-3 h-3 text-emerald-400" /> : <EyeOff className="w-3 h-3 text-slate-400" />}
            </button>
          );
        })}
      </div>

      {/* Recharts LineChart Visualizer */}
      <div className="h-72 sm:h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeklyData} margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
            
            <XAxis
              dataKey="dayLabel"
              tick={{ fontSize: 11, fill: '#64748b' }}
              stroke="#cbd5e1"
            />

            <YAxis
              domain={['auto', 'auto']}
              tickFormatter={(minutes) => minutesToFormattedTime(minutes, language)}
              tick={{ fontSize: 10, fill: '#64748b' }}
              stroke="#cbd5e1"
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
              formatter={(value) => {
                const cfg = prayerLinesConfig.find((c) => c.key === value);
                return (
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">
                    {language === 'bn' ? cfg?.labelBn : cfg?.labelEn}
                  </span>
                );
              }}
            />

            {prayerLinesConfig.map((cfg) => {
              if (!visibility[cfg.key]) return null;

              return (
                <Line
                  key={cfg.key}
                  type="monotone"
                  dataKey={cfg.key}
                  name={cfg.key}
                  stroke={cfg.color}
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: cfg.color, strokeWidth: 2, stroke: '#ffffff' }}
                  activeDot={{ r: 7, strokeWidth: 2, stroke: '#ffffff' }}
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Informational Footer Note */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>
            বর্তমান নির্বাচিত শহর: <strong>{currentCityObj.nameBn} ({currentCityObj.nameEn})</strong> | মাযহাব: <strong>{isHanafi ? 'হানাফী (আসর বিলম্বিত)' : 'শাাফেয়ী/মালেকী/হাম্বলী'}</strong>
          </span>
        </div>
        <span className="text-slate-400 hidden sm:inline">
          দৈনন্দিন কয়েক সেকেন্ড/মিনিটের পরিবর্তন দৃশ্যমান
        </span>
      </div>
    </div>
  );
};
