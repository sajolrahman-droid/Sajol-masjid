import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  BarChart3,
  Clock,
  RotateCcw,
  Sparkles,
  TrendingUp,
  SlidersHorizontal,
  Info,
  Calendar,
  Compass,
  Zap,
  CheckCircle2,
  Hourglass
} from 'lucide-react';
import { calculatePrayerTimes, toBengaliNumerals, BD_CITIES, formatTimeInBengali } from '../utils/prayerCalculator';
import { Language } from '../types/mosque';

interface PrayerTimeGapAnalyticsCardProps {
  currentTime: Date;
  selectedCity: string;
  isHanafi: boolean;
  language: Language;
}

export type GapCalculationMode = 'shortest' | 'upcoming' | 'elapsed';

interface PrayerGapMetric {
  key: string;
  labelBn: string;
  labelEn: string;
  color: string;
  avgGapHours: number;
  avgGapMinutes: number;
  avgGapDisplay: string;
  avgPrayerTime: string;
  shiftMinutes: number;
  isUpcoming: boolean;
  rawGap: number;
}

export const PrayerTimeGapAnalyticsCard: React.FC<PrayerTimeGapAnalyticsCardProps> = ({
  currentTime,
  selectedCity,
  isHanafi,
  language
}) => {
  const [calculationMode, setCalculationMode] = useState<GapCalculationMode>('shortest');
  const [includeSecondary, setIncludeSecondary] = useState<boolean>(false);

  // Match city data
  const cityData = useMemo(() => {
    return (
      BD_CITIES.find(
        (c) => c.nameBn === selectedCity || c.nameEn.toLowerCase() === selectedCity.toLowerCase()
      ) || BD_CITIES[0]
    );
  }, [selectedCity]);

  // Current time in decimal hours and minutes from midnight
  const nowHours = currentTime.getHours() + currentTime.getMinutes() / 60 + currentTime.getSeconds() / 3600;
  const nowMinutesTotal = currentTime.getHours() * 60 + currentTime.getMinutes();

  // Calculate past week (last 7 days ending today)
  const analyticsData = useMemo(() => {
    const days: Date[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(currentTime);
      d.setDate(d.getDate() - i);
      days.push(d);
    }

    const prayerDefinitions = [
      { key: 'fajr', rawKey: 'fajrRaw', strKey: 'fajr', labelBn: 'ফজর', labelEn: 'Fajr', color: '#10b981', isCore: true },
      { key: 'sunrise', rawKey: 'sunriseRaw', strKey: 'sunrise', labelBn: 'সূর্যোদয়', labelEn: 'Sunrise', color: '#f59e0b', isCore: false },
      { key: 'dhuhr', rawKey: 'dhuhrRaw', strKey: 'dhuhr', labelBn: 'যোহর', labelEn: 'Dhuhr', color: '#3b82f6', isCore: true },
      { key: 'asr', rawKey: 'asrRaw', strKey: 'asr', labelBn: 'আসর', labelEn: 'Asr', color: '#8b5cf6', isCore: true },
      { key: 'maghrib', rawKey: 'maghribRaw', strKey: 'maghrib', labelBn: 'মাগরিব', labelEn: 'Maghrib', color: '#f43f5e', isCore: true },
      { key: 'isha', rawKey: 'ishaRaw', strKey: 'isha', labelBn: 'এশা', labelEn: 'Isha', color: '#6366f1', isCore: true },
      { key: 'tahajjud', rawKey: 'tahajjudRaw', strKey: 'tahajjud', labelBn: 'তাহাজ্জুদ', labelEn: 'Tahajjud', color: '#06b6d4', isCore: false },
      { key: 'sehri', rawKey: 'sehriRaw', strKey: 'sehri', labelBn: 'সাহরি শেষ', labelEn: 'Suhoor', color: '#0ea5e9', isCore: false },
      { key: 'iftar', rawKey: 'iftarRaw', strKey: 'iftar', labelBn: 'ইফতার', labelEn: 'Iftar', color: '#ea580c', isCore: false }
    ];

    const activeDefinitions = prayerDefinitions.filter((p) => includeSecondary || p.isCore);

    // Compute across 7 days for each prayer
    const metrics: PrayerGapMetric[] = activeDefinitions.map((pDef) => {
      let totalGapHours = 0;
      let totalPrayerRawHours = 0;
      const dailyGaps: number[] = [];

      days.forEach((day) => {
        const pTimes = calculatePrayerTimes(day, cityData.lat, cityData.lng, isHanafi) as any;
        const pRaw = Number(pTimes[pDef.rawKey]) || 0;
        totalPrayerRawHours += pRaw;

        let gap = 0;
        if (calculationMode === 'shortest') {
          // Circular shortest distance on 24h clock
          const diff = Math.abs(nowHours - pRaw);
          gap = Math.min(diff, 24 - diff);
        } else if (calculationMode === 'upcoming') {
          // Time remaining until this prayer
          gap = (pRaw - nowHours + 24) % 24;
        } else {
          // Elapsed time since this prayer
          gap = (nowHours - pRaw + 24) % 24;
        }

        totalGapHours += gap;
        dailyGaps.push(gap);
      });

      const avgGapHours = totalGapHours / days.length;
      const avgGapTotalMinutes = Math.round(avgGapHours * 60);
      const gapHours = Math.floor(avgGapTotalMinutes / 60);
      const gapMins = avgGapTotalMinutes % 60;

      const avgRawHours = totalPrayerRawHours / days.length;
      const avgRawH = Math.floor(avgRawHours) % 24;
      const avgRawM = Math.round((avgRawHours - Math.floor(avgRawHours)) * 60);
      const period = avgRawH >= 12 ? 'PM' : 'AM';
      const displayH = avgRawH % 12 === 0 ? 12 : avgRawH % 12;
      const avgTimeString = `${displayH < 10 ? '0' : ''}${displayH}:${avgRawM < 10 ? '0' : ''}${avgRawM} ${period}`;

      // Weekly Shift (Day 0 vs Day 6 in minutes)
      const shiftMinutes = Math.round((dailyGaps[dailyGaps.length - 1] - dailyGaps[0]) * 60 * 10) / 10;

      // Is upcoming or elapsed on current clock
      const isUpcoming = (nowHours <= avgRawHours && avgRawHours - nowHours < 12) || (nowHours > 12 && avgRawHours < nowHours - 12);

      const displayGapStr =
        language === 'bn'
          ? `${toBengaliNumerals(gapHours)} ঘণ্টা ${toBengaliNumerals(gapMins)} মিনিট`
          : `${gapHours}h ${gapMins}m`;

      return {
        key: pDef.key,
        labelBn: pDef.labelBn,
        labelEn: pDef.labelEn,
        color: pDef.color,
        avgGapHours: Math.round(avgGapHours * 100) / 100,
        avgGapMinutes: avgGapTotalMinutes,
        avgGapDisplay: displayGapStr,
        avgPrayerTime: avgTimeString,
        shiftMinutes,
        isUpcoming,
        rawGap: avgGapHours
      };
    });

    // Sort by gap ascending to identify closest prayer
    const sortedByGap = [...metrics].sort((a, b) => a.avgGapHours - b.avgGapHours);
    const closestPrayer = sortedByGap[0];
    const overallAvgGapHours = metrics.reduce((s, m) => s + m.avgGapHours, 0) / (metrics.length || 1);
    const overallAvgH = Math.floor(overallAvgGapHours);
    const overallAvgM = Math.round((overallAvgGapHours - overallAvgH) * 60);

    // Max weekly drift/shift
    const maxShiftPrayer = [...metrics].sort((a, b) => Math.abs(b.shiftMinutes) - Math.abs(a.shiftMinutes))[0];

    return {
      metrics,
      closestPrayer,
      overallAvgDisplay:
        language === 'bn'
          ? `${toBengaliNumerals(overallAvgH)} ঘণ্টা ${toBengaliNumerals(overallAvgM)} মিনিট`
          : `${overallAvgH}h ${overallAvgM}m`,
      maxShiftPrayer,
      daysCount: days.length
    };
  }, [currentTime, cityData, isHanafi, calculationMode, includeSecondary, language, nowHours]);

  const handleReset = () => {
    setCalculationMode('shortest');
    setIncludeSecondary(false);
  };

  // Custom Recharts Tooltip
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data: PrayerGapMetric = payload[0].payload;
    const name = language === 'bn' ? data.labelBn : data.labelEn;

    return (
      <div className="p-3.5 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700 text-xs space-y-2 min-w-56">
        <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }} />
            <span>{name}</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {calculationMode === 'shortest'
              ? 'গড় ব্যবধান'
              : calculationMode === 'upcoming'
              ? 'আসন্ন ওয়াক্ত'
              : 'অতিক্রান্ত ওয়াক্ত'}
          </span>
        </div>

        <div className="space-y-1 pt-0.5 text-[11px]">
          <div className="flex items-center justify-between text-slate-300">
            <span>বর্তমান সময়ের সাথে ব্যবধান:</span>
            <strong className="font-mono text-white text-xs">{data.avgGapDisplay}</strong>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>বিগত ৭ দিনের গড় ওয়াক্ত:</span>
            <strong className="font-mono text-emerald-400">
              {language === 'bn' ? formatTimeInBengali(data.avgPrayerTime) : data.avgPrayerTime}
            </strong>
          </div>

          <div className="flex items-center justify-between text-slate-300">
            <span>সাপ্তাহিক পরিবর্তনের হার:</span>
            <span className={`font-mono font-bold ${data.shiftMinutes >= 0 ? 'text-amber-400' : 'text-blue-400'}`}>
              {data.shiftMinutes > 0 ? '+' : ''}
              {toBengaliNumerals(data.shiftMinutes)} মিনিট
            </span>
          </div>
        </div>

        <div className="pt-1.5 border-t border-slate-800 text-[10px] text-slate-400 flex items-center gap-1">
          <Clock className="w-3 h-3 text-emerald-400" />
          <span>বর্তমান ঘড়ি সময়: {currentTime.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold shadow-md shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>বর্তমান সময়ের সাথে নামাজের গড় ব্যবধান বিশ্লেষণ (Prayer Time Gap Analytics)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                বিগত ৭ দিন
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              বর্তমান সময় ও বিগত সপ্তাহের ওয়াক্তের মধ্যবর্তী সময়ের গড় ব্যবধানের বার চার্ট
            </p>
          </div>
        </div>

        {/* Action Controls & Reset */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
            title="বিশ্লেষণ রিসেট করুন"
          >
            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
            <span>রিসেট</span>
          </button>
        </div>
      </div>

      {/* Analytical KPI Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800">
          <span className="text-[11px] text-indigo-900 dark:text-indigo-300 font-semibold block">
            সবচেয়ে নিকটতম ওয়াক্ত
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: analyticsData.closestPrayer?.color || '#10b981' }}
            />
            <strong className="text-sm font-extrabold text-slate-900 dark:text-white">
              {language === 'bn'
                ? analyticsData.closestPrayer?.labelBn
                : analyticsData.closestPrayer?.labelEn}
            </strong>
          </div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            ব্যবধানে মাত্র {analyticsData.closestPrayer?.avgGapDisplay}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
          <span className="text-[11px] text-emerald-900 dark:text-emerald-300 font-semibold block">
            সার্বিক গড় ব্যবধান
          </span>
          <strong className="text-sm font-extrabold text-emerald-700 dark:text-emerald-300 font-mono block mt-1">
            {analyticsData.overallAvgDisplay}
          </strong>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            ৫ ওয়াক্তের সম্মিলিত গড়
          </span>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800">
          <span className="text-[11px] text-amber-900 dark:text-amber-300 font-semibold block">
            সর্বোচ্চ সাপ্তাহিক বিচ্যুতি
          </span>
          <strong className="text-sm font-extrabold text-slate-900 dark:text-white block mt-1 truncate">
            {language === 'bn'
              ? analyticsData.maxShiftPrayer?.labelBn
              : analyticsData.maxShiftPrayer?.labelEn}
          </strong>
          <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono block mt-0.5">
            {analyticsData.maxShiftPrayer?.shiftMinutes > 0 ? '+' : ''}
            {toBengaliNumerals(analyticsData.maxShiftPrayer?.shiftMinutes || 0)} মিনিট/সপ্তাহ
          </span>
        </div>

        <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold block">
            বর্তমান রেফারেন্স সময়
          </span>
          <strong className="text-sm font-extrabold font-mono text-slate-900 dark:text-white block mt-1">
            {currentTime.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </strong>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
            শহর: {cityData.nameBn}
          </span>
        </div>
      </div>

      {/* Filter and Mode Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1 text-xs">
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {[
            { mode: 'shortest', label: 'ন্যূনতম নিকটবর্তী ব্যবধান', desc: 'Shortest Distance' },
            { mode: 'upcoming', label: 'আসন্ন ওয়াক্তের সময় বাকি', desc: 'Hours Until' },
            { mode: 'elapsed', label: 'অতিক্রান্ত সময়ের ব্যবধান', desc: 'Hours Since' }
          ].map((item) => (
            <button
              key={item.mode}
              type="button"
              onClick={() => setCalculationMode(item.mode as GapCalculationMode)}
              className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer text-xs ${
                calculationMode === item.mode
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {language === 'bn' ? item.label : item.desc}
            </button>
          ))}
        </div>

        {/* Secondary Prayer Toggle */}
        <label className="flex items-center gap-2 cursor-pointer select-none text-slate-700 dark:text-slate-300 font-semibold text-xs">
          <input
            type="checkbox"
            checked={includeSecondary}
            onChange={(e) => setIncludeSecondary(e.target.checked)}
            className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <span>তাহাজ্জুদ, সূর্যোদয় ও সাহরি অন্তর্ভুক্ত করুন</span>
        </label>
      </div>

      {/* Recharts BarChart Visualization */}
      <div className="h-72 sm:h-80 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={analyticsData.metrics}
            margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />

            <XAxis
              dataKey={language === 'bn' ? 'labelBn' : 'labelEn'}
              tick={{ fontSize: 11, fill: '#64748b', fontWeight: 600 }}
              stroke="#cbd5e1"
            />

            <YAxis
              unit={language === 'bn' ? 'ঘ' : 'h'}
              domain={[0, 'auto']}
              tick={{ fontSize: 10, fill: '#64748b' }}
              stroke="#cbd5e1"
            />

            <Tooltip content={<CustomBarTooltip />} />

            <ReferenceLine
              y={analyticsData.closestPrayer?.avgGapHours}
              stroke="#10b981"
              strokeDasharray="4 4"
              label={{
                value: language === 'bn' ? 'নিকটতম ওয়াক্ত' : 'Closest',
                position: 'top',
                fill: '#10b981',
                fontSize: 10,
                fontWeight: 600
              }}
            />

            <Bar dataKey="avgGapHours" radius={[8, 8, 0, 0]} maxBarSize={55}>
              {analyticsData.metrics.map((entry) => (
                <Cell key={entry.key} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Explanatory Footer Note */}
      <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 text-[11px] text-slate-600 dark:text-slate-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>
            প্রতিটি বার বিগত ৭ দিনের গাণিতিক হিসাব নির্দেশ করে — বারগুলোতে মাউস বা আঙুল ছুঁইয়ে বিস্তারিত তথ্য দেখুন।
          </span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
          <Calendar className="w-3 h-3" />
          <span>বিগত ৭ দিনের উপাত্ত বিশ্লেষিত</span>
        </div>
      </div>
    </div>
  );
};
