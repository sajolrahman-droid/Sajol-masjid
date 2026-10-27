import React, { useState, useMemo, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Flame, 
  Award,
  RotateCcw,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { AppStateData, DailyPrayerLog, SalahPunctualityStatus, Language } from '../types/mosque';
import { toBengaliNumerals } from '../utils/prayerCalculator';

interface PrayerPunctualityD3SectionProps {
  appState: AppStateData;
  onUpdateAppState: (updater: (prev: AppStateData) => AppStateData) => void;
  language: Language;
}

const PRAYERS_CONFIG = [
  { key: 'fajr' as const, nameBn: 'ফজর', nameEn: 'Fajr', amalKey: 'fajr_prayer' },
  { key: 'dhuhr' as const, nameBn: 'যোহর', nameEn: 'Dhuhr', amalKey: 'dhuhr_prayer' },
  { key: 'asr' as const, nameBn: 'আসর', nameEn: 'Asr', amalKey: 'asr_prayer' },
  { key: 'maghrib' as const, nameBn: 'মাগরিব', nameEn: 'Maghrib', amalKey: 'maghrib_prayer' },
  { key: 'isha' as const, nameBn: 'এশা', nameEn: 'Isha', amalKey: 'isha_prayer' }
];

export const PrayerPunctualityD3Section: React.FC<PrayerPunctualityD3SectionProps> = ({
  appState,
  onUpdateAppState,
  language
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('14d');
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [selectedLogDate, setSelectedLogDate] = useState<string>(todayStr);
  const [hoveredData, setHoveredData] = useState<{
    dateStr: string;
    onTime: number;
    late: number;
    missed: number;
    pct: number;
    details: DailyPrayerLog;
  } | null>(null);

  // SVG Chart Refs
  const trendSvgRef = useRef<SVGSVGElement | null>(null);
  const trendContainerRef = useRef<HTMLDivElement | null>(null);

  const donutSvgRef = useRef<SVGSVGElement | null>(null);
  const waqtSvgRef = useRef<SVGSVGElement | null>(null);

  // Helper to extract or fallback prayer log for a specific date
  const getLogForDate = (dateStr: string): DailyPrayerLog => {
    const directLog = appState.prayerLogs?.[dateStr];
    if (directLog) return directLog;

    // Fallback: Check dailyAmal if available
    const fallback: DailyPrayerLog = {};
    PRAYERS_CONFIG.forEach((p) => {
      const amalChecked = appState.dailyAmal?.[`${dateStr}_${p.amalKey}`];
      if (amalChecked) {
        fallback[p.key] = 'on_time';
      }
    });
    return fallback;
  };

  // Generate date array for selected range ending today
  const rangeDaysCount = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;

  const datesList = useMemo(() => {
    const list: string[] = [];
    const now = new Date(todayStr);
    for (let i = rangeDaysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      list.push(d.toISOString().slice(0, 10));
    }
    return list;
  }, [rangeDaysCount, todayStr]);

  // Aggregated data per date
  const trendData = useMemo(() => {
    return datesList.map((dStr) => {
      const log = getLogForDate(dStr);
      let onTime = 0;
      let late = 0;
      let missed = 0;

      PRAYERS_CONFIG.forEach((p) => {
        const st = log[p.key];
        if (st === 'on_time') onTime++;
        else if (st === 'late') late++;
        else if (st === 'missed') missed++;
        else {
          // If past date and not marked, treat as missed or unrecorded
          if (dStr < todayStr) {
            missed++;
          }
        }
      });

      const totalRecorded = onTime + late + missed;
      const pct = totalRecorded > 0 ? Math.round((onTime / 5) * 100) : 0;

      return {
        dateStr: dStr,
        onTime,
        late,
        missed,
        pct,
        details: log
      };
    });
  }, [datesList, appState.prayerLogs, appState.dailyAmal, todayStr]);

  // Summary Metrics
  const summary = useMemo(() => {
    let totalOnTime = 0;
    let totalLate = 0;
    let totalMissed = 0;

    trendData.forEach((d) => {
      totalOnTime += d.onTime;
      totalLate += d.late;
      totalMissed += d.missed;
    });

    const totalPrayers = trendData.length * 5;
    const onTimeRate = totalPrayers > 0 ? Math.round((totalOnTime / totalPrayers) * 100) : 0;
    const lateRate = totalPrayers > 0 ? Math.round((totalLate / totalPrayers) * 100) : 0;
    const missedRate = totalPrayers > 0 ? Math.round((totalMissed / totalPrayers) * 100) : 0;

    // Calculate current streak of having >= 4 on-time prayers per day
    let currentStreak = 0;
    for (let i = trendData.length - 1; i >= 0; i--) {
      if (trendData[i].onTime >= 4) {
        currentStreak++;
      } else {
        break;
      }
    }

    return {
      totalPrayers,
      totalOnTime,
      totalLate,
      totalMissed,
      onTimeRate,
      lateRate,
      missedRate,
      currentStreak
    };
  }, [trendData]);

  // Waqt breakdown: For each of 5 prayers, count on-time, late, missed across the range
  const waqtStats = useMemo(() => {
    return PRAYERS_CONFIG.map((p) => {
      let onTime = 0;
      let late = 0;
      let missed = 0;

      datesList.forEach((dStr) => {
        const log = getLogForDate(dStr);
        const st = log[p.key];
        if (st === 'on_time') onTime++;
        else if (st === 'late') late++;
        else if (st === 'missed') missed++;
        else if (dStr < todayStr) missed++;
      });

      const total = datesList.length;
      const pct = total > 0 ? Math.round((onTime / total) * 100) : 0;

      return {
        key: p.key,
        nameBn: p.nameBn,
        nameEn: p.nameEn,
        onTime,
        late,
        missed,
        total,
        pct
      };
    });
  }, [datesList, appState.prayerLogs, appState.dailyAmal, todayStr]);

  // -------------------------------------------------------------
  // D3 CHART 1: Stacked Bar & Punctuality Trend Line
  // -------------------------------------------------------------
  useEffect(() => {
    if (!trendSvgRef.current || !trendContainerRef.current) return;

    const container = trendContainerRef.current;
    const width = container.clientWidth || 600;
    const height = 260;
    const margin = { top: 25, right: 35, bottom: 40, left: 35 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(trendSvgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('width', '100%')
       .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Gradient definitions
    const defs = svg.append('defs');

    // On-Time Gradient
    const onTimeGrad = defs.append('linearGradient')
      .attr('id', 'onTimeGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    onTimeGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981');
    onTimeGrad.append('stop').attr('offset', '100%').attr('stop-color', '#059669');

    // Late Gradient
    const lateGrad = defs.append('linearGradient')
      .attr('id', 'lateGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    lateGrad.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b');
    lateGrad.append('stop').attr('offset', '100%').attr('stop-color', '#d97706');

    // Missed Gradient
    const missedGrad = defs.append('linearGradient')
      .attr('id', 'missedGrad')
      .attr('x1', '0%').attr('y1', '0%')
      .attr('x2', '0%').attr('y2', '100%');
    missedGrad.append('stop').attr('offset', '0%').attr('stop-color', '#f43f5e');
    missedGrad.append('stop').attr('offset', '100%').attr('stop-color', '#e11d48');

    // Scales
    const xScale = d3.scaleBand()
      .domain(trendData.map((d) => d.dateStr))
      .range([0, innerWidth])
      .padding(0.28);

    const yScale = d3.scaleLinear()
      .domain([0, 5])
      .range([innerHeight, 0]);

    const yPctScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerHeight, 0]);

    // Horizontal grid lines
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yScale)
          .ticks(5)
          .tickSize(-innerWidth)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', 'currentColor')
      .attr('stroke-opacity', 0.08)
      .attr('stroke-dasharray', '3 3');

    // Stack data
    const stackGenerator = d3.stack<typeof trendData[0]>()
      .keys(['onTime', 'late', 'missed']);

    const stackedSeries = stackGenerator(trendData);

    const colorMap: Record<string, string> = {
      onTime: 'url(#onTimeGrad)',
      late: 'url(#lateGrad)',
      missed: 'url(#missedGrad)'
    };

    // Draw stacked bars
    stackedSeries.forEach((layer) => {
      g.selectAll(`.bar-${layer.key}`)
        .data(layer)
        .enter()
        .append('rect')
        .attr('class', `bar-${layer.key}`)
        .attr('x', (d) => xScale(d.data.dateStr) || 0)
        .attr('y', (d) => yScale(d[1]))
        .attr('height', (d) => Math.max(0, yScale(d[0]) - yScale(d[1])))
        .attr('width', xScale.bandwidth())
        .attr('rx', 3)
        .attr('fill', colorMap[layer.key])
        .style('cursor', 'pointer')
        .on('mouseenter', (_, d) => {
          setHoveredData(d.data);
        });
    });

    // Punctuality percentage trend line
    const lineGenerator = d3.line<typeof trendData[0]>()
      .x((d) => (xScale(d.dateStr) || 0) + xScale.bandwidth() / 2)
      .y((d) => yPctScale(d.pct))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(trendData)
      .attr('fill', 'none')
      .attr('stroke', '#38bdf8')
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', 'none')
      .attr('d', lineGenerator);

    // Trend points
    g.selectAll('.trend-dot')
      .data(trendData)
      .enter()
      .append('circle')
      .attr('class', 'trend-dot')
      .attr('cx', (d) => (xScale(d.dateStr) || 0) + xScale.bandwidth() / 2)
      .attr('cy', (d) => yPctScale(d.pct))
      .attr('r', 3.5)
      .attr('fill', '#0284c7')
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseenter', (_, d) => {
        setHoveredData(d);
      });

    // X Axis
    const xAxis = d3.axisBottom(xScale)
      .tickFormat((d) => {
        const parts = d.split('-');
        return `${toBengaliNumerals(parts[2])}/${toBengaliNumerals(parts[1])}`;
      });

    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll('text')
      .attr('class', 'text-[10px] fill-slate-500 font-mono')
      .attr('transform', 'rotate(-30)')
      .style('text-anchor', 'end');

    // Y Axis (Left: Prayers count)
    const yAxisLeft = d3.axisLeft(yScale)
      .ticks(5)
      .tickFormat((d) => `${toBengaliNumerals(d.toString())}`);

    g.append('g')
      .call(yAxisLeft)
      .selectAll('text')
      .attr('class', 'text-[10px] fill-slate-500 font-mono');

    // Y Axis (Right: Percentage)
    const yAxisRight = d3.axisRight(yPctScale)
      .ticks(4)
      .tickFormat((d) => `${toBengaliNumerals(d.toString())}%`);

    g.append('g')
      .attr('transform', `translate(${innerWidth},0)`)
      .call(yAxisRight)
      .selectAll('text')
      .attr('class', 'text-[10px] fill-sky-600 dark:fill-sky-400 font-mono font-semibold');

  }, [trendData, timeRange]);

  // -------------------------------------------------------------
  // D3 CHART 2: Overall Donut Chart (সময়মতো vs দেরিতে vs মিসড)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!donutSvgRef.current) return;

    const width = 200;
    const height = 200;
    const radius = Math.min(width, height) / 2 - 10;
    const innerRadius = radius * 0.65;

    const svg = d3.select(donutSvgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('width', width)
       .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${width / 2},${height / 2})`);

    const data = [
      { label: 'সময়মতো', value: summary.totalOnTime || 1, color: '#10b981' },
      { label: 'দেরিতে', value: summary.totalLate, color: '#f59e0b' },
      { label: 'মিসড', value: summary.totalMissed, color: '#f43f5e' }
    ].filter((d) => d.value > 0);

    const pie = d3.pie<{ label: string; value: number; color: string }>()
      .value((d) => d.value)
      .sort(null)
      .padAngle(0.04);

    const arc = d3.arc<d3.PieArcDatum<{ label: string; value: number; color: string }>>()
      .innerRadius(innerRadius)
      .outerRadius(radius)
      .cornerRadius(4);

    const slices = g.selectAll('.slice')
      .data(pie(data))
      .enter()
      .append('path')
      .attr('class', 'slice')
      .attr('d', arc as any)
      .attr('fill', (d) => d.data.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer');

    slices.append('title')
      .text((d) => `${d.data.label}: ${toBengaliNumerals(d.data.value)} ওয়াক্ত`);

    // Center text: Percentage
    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.1em')
      .attr('class', 'text-2xl font-black fill-slate-900 dark:fill-white font-mono')
      .text(`${toBengaliNumerals(summary.onTimeRate)}%`);

    g.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.4em')
      .attr('class', 'text-[11px] font-semibold fill-emerald-600 dark:fill-emerald-400')
      .text('সময়মতো আদায়');

  }, [summary]);

  // -------------------------------------------------------------
  // D3 CHART 3: Horizontal Waqt Comparison Bars
  // -------------------------------------------------------------
  useEffect(() => {
    if (!waqtSvgRef.current) return;

    const width = 340;
    const height = 180;
    const margin = { top: 10, right: 45, bottom: 10, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(waqtSvgRef.current);
    svg.selectAll('*').remove();

    svg.attr('viewBox', `0 0 ${width} ${height}`)
       .attr('width', '100%')
       .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const yScale = d3.scaleBand()
      .domain(waqtStats.map((w) => w.nameBn))
      .range([0, innerHeight])
      .padding(0.3);

    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([0, innerWidth]);

    // Background track
    g.selectAll('.track')
      .data(waqtStats)
      .enter()
      .append('rect')
      .attr('class', 'track')
      .attr('y', (d) => yScale(d.nameBn) || 0)
      .attr('x', 0)
      .attr('width', innerWidth)
      .attr('height', yScale.bandwidth())
      .attr('rx', 4)
      .attr('fill', '#e2e8f0')
      .attr('class', 'fill-slate-100 dark:fill-slate-800');

    // On-Time Bar
    g.selectAll('.on-time-bar')
      .data(waqtStats)
      .enter()
      .append('rect')
      .attr('class', 'on-time-bar')
      .attr('y', (d) => yScale(d.nameBn) || 0)
      .attr('x', 0)
      .attr('width', (d) => xScale(d.pct))
      .attr('height', yScale.bandwidth())
      .attr('rx', 4)
      .attr('fill', (d) => (d.pct >= 80 ? '#10b981' : d.pct >= 60 ? '#3b82f6' : '#f59e0b'));

    // Prayer Label on Y axis
    g.selectAll('.waqt-label')
      .data(waqtStats)
      .enter()
      .append('text')
      .attr('class', 'waqt-label text-xs font-bold fill-slate-700 dark:fill-slate-300')
      .attr('x', -8)
      .attr('y', (d) => (yScale(d.nameBn) || 0) + yScale.bandwidth() / 2 + 4)
      .attr('text-anchor', 'end')
      .text((d) => d.nameBn);

    // Percentage Label on right
    g.selectAll('.waqt-pct')
      .data(waqtStats)
      .enter()
      .append('text')
      .attr('class', 'waqt-pct text-xs font-mono font-bold fill-slate-800 dark:fill-slate-200')
      .attr('x', (d) => xScale(d.pct) + 6)
      .attr('y', (d) => (yScale(d.nameBn) || 0) + yScale.bandwidth() / 2 + 4)
      .text((d) => `${toBengaliNumerals(d.pct)}%`);

  }, [waqtStats]);

  // Handlers for logging prayers
  const handleTogglePrayerStatus = (prayerKey: typeof PRAYERS_CONFIG[0]['key'], currentStatus: SalahPunctualityStatus | undefined) => {
    const nextStatus: SalahPunctualityStatus = 
      currentStatus === 'on_time' ? 'late' : 
      currentStatus === 'late' ? 'missed' : 'on_time';

    onUpdateAppState((prev) => {
      const existingLogs = prev.prayerLogs || {};
      const existingDay = existingLogs[selectedLogDate] || {};
      const updatedDay = {
        ...existingDay,
        [prayerKey]: nextStatus
      };

      // Also keep dailyAmal synchronized
      const pConfig = PRAYERS_CONFIG.find((p) => p.key === prayerKey);
      const updatedAmal = { ...(prev.dailyAmal || {}) };
      if (pConfig) {
        updatedAmal[`${selectedLogDate}_${pConfig.amalKey}`] = (nextStatus === 'on_time');
      }

      return {
        ...prev,
        prayerLogs: {
          ...existingLogs,
          [selectedLogDate]: updatedDay
        },
        dailyAmal: updatedAmal
      };
    });
  };

  const handleMarkAllOnTime = (dateStr: string) => {
    onUpdateAppState((prev) => {
      const existingLogs = prev.prayerLogs || {};
      const updatedDay: DailyPrayerLog = {
        fajr: 'on_time',
        dhuhr: 'on_time',
        asr: 'on_time',
        maghrib: 'on_time',
        isha: 'on_time'
      };

      const updatedAmal = { ...(prev.dailyAmal || {}) };
      PRAYERS_CONFIG.forEach((p) => {
        updatedAmal[`${dateStr}_${p.amalKey}`] = true;
      });

      return {
        ...prev,
        prayerLogs: {
          ...existingLogs,
          [dateStr]: updatedDay
        },
        dailyAmal: updatedAmal
      };
    });
  };

  const currentSelectedLog = getLogForDate(selectedLogDate);

  return (
    <div className="space-y-5">
      {/* SECTION HEADER & TIMEFRAME CHIPS */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>নামাজের সময়ানুবর্তিতা ও ক্বাযা অ্যানালিটিক্স</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-semibold">
                  D3.js
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                ব্যবহারকারীর দৈনিক আমল ও নামাজের ট্রেন্ড বিশ্লেষণ — সময়মতো বনাম ক্বাযা/ছুটে যাওয়া সালাত
              </p>
            </div>
          </div>
        </div>

        {/* Timeframe Chips */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl">
          {(['7d', '14d', '30d'] as const).map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                timeRange === range
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {range === '7d' ? 'বিগত ৭ দিন' : range === '14d' ? 'বিগত ১৪ দিন' : 'বিগত ৩০ দিন'}
            </button>
          ))}
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* On-Time Rate */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>সময়মতো আদায়ের হার</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {toBengaliNumerals(summary.onTimeRate)}%
            </span>
            <span className="text-xs text-slate-400 font-medium">
              ({toBengaliNumerals(summary.totalOnTime)}/{toBengaliNumerals(summary.totalPrayers)})
            </span>
          </div>
          <div className="mt-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>মাশাআল্লাহ! সুন্দর ধারাবাহিকতা</span>
          </div>
        </div>

        {/* Late / Qaza */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>দেরিতে / ক্বাযা আদায়</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-600 dark:text-amber-400">
              {toBengaliNumerals(summary.totalLate)}
            </span>
            <span className="text-xs text-slate-400 font-medium">ওয়াক্ত</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400">
            মোট সালাতের {toBengaliNumerals(summary.lateRate)}%
          </div>
        </div>

        {/* Missed */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>ছুটে যাওয়া সালাত</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
              {toBengaliNumerals(summary.totalMissed)}
            </span>
            <span className="text-xs text-slate-400 font-medium">ওয়াক্ত</span>
          </div>
          <div className="mt-1.5 text-[11px] text-rose-600 dark:text-rose-400 font-medium">
            দ্রুত ক্বাযা আদায়ের নিয়ত রাখুন
          </div>
        </div>

        {/* Current Streak */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>ধারাবাহিকতার স্ট্রিক</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold font-mono text-orange-600 dark:text-orange-400">
              {toBengaliNumerals(summary.currentStreak)}
            </span>
            <span className="text-xs text-slate-400 font-medium">দিন একটানা</span>
          </div>
          <div className="mt-1.5 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>দৈনিক ৪+ ওয়াক্ত সময়মতো</span>
          </div>
        </div>
      </div>

      {/* D3 CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* MAIN D3 TREND CHART (Takes 2 cols on lg) */}
        <div 
          ref={trendContainerRef} 
          className="lg:col-span-2 p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <span>দৈনিক ওয়াক্ত আদায়ের ট্রেন্ড ও সময়ানুবর্তিতা সূচক</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                D3 স্ট্যাকড বার (ওয়াক্ত সংখ্যা) এবং নীল বক্ররেখায় সময়ানুবর্তিতা শতকরা হার (%)
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500"></span>
                <span className="text-slate-600 dark:text-slate-400">সময়মতো</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500"></span>
                <span className="text-slate-600 dark:text-slate-400">দেরিতে</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-rose-500"></span>
                <span className="text-slate-600 dark:text-slate-400">ছুটে যাওয়া</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-0.5 bg-sky-500"></span>
                <span className="text-slate-600 dark:text-slate-400">হার (%)</span>
              </span>
            </div>
          </div>

          {/* D3 Render Target */}
          <div className="w-full overflow-hidden">
            <svg ref={trendSvgRef} className="w-full text-slate-400" />
          </div>

          {/* Hover Details Panel */}
          {hoveredData ? (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs flex flex-wrap items-center justify-between gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-blue-500" />
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  তারিখ: {toBengaliNumerals(hoveredData.dateStr)}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 font-semibold font-mono">
                  {toBengaliNumerals(hoveredData.pct)}% সময়মতো
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-emerald-600 dark:text-emerald-400">সময়মতো: {toBengaliNumerals(hoveredData.onTime)}</span>
                <span>•</span>
                <span className="text-amber-600 dark:text-amber-400">দেরিতে: {toBengaliNumerals(hoveredData.late)}</span>
                <span>•</span>
                <span className="text-rose-600 dark:text-rose-400">ছুটে যাওয়া: {toBengaliNumerals(hoveredData.missed)}</span>
              </div>
            </div>
          ) : (
            <div className="text-[11px] text-slate-400 italic text-center">
              💡 যেকোনো বারে মাউস নিয়ে বিস্তারিত তারিখ ও ওয়াক্ত হিসাব দেখুন
            </div>
          )}
        </div>

        {/* DONUT & MOTIVATION (Takes 1 col on lg) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-blue-600" />
              <span>সার্বিক অনুপাত বিশ্লেষণ</span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              নির্বাচিত সময়কালের নামাজের সামষ্টিক অবস্থান
            </p>
          </div>

          <div className="flex justify-center items-center py-1">
            <svg ref={donutSvgRef} />
          </div>

          {/* Motivational Quote */}
          <div className="p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 text-center space-y-1">
            <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              "إِنَّ الصَّلَاةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَوْقُوتًا"
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400">
              "নিশ্চয়ই নামাজ মুমিনদের ওপর নির্দিষ্ট সময়ে নির্ধারিত ফরজ।" — (সূরা আন-নিসা: ১০৩)
            </p>
          </div>
        </div>
      </div>

      {/* WAQT BY WAQT BREAKDOWN & INTERACTIVE LOGGER */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* WAQT BY WAQT D3 COMPARISON */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>ওয়াক্তভিত্তিক সময়ানুবর্তিতা বিশ্লেষণ</span>
            </h3>
            <span className="text-[11px] text-slate-500">অন-টাইম শতকরা হার</span>
          </div>

          <div className="w-full flex justify-center py-1">
            <svg ref={waqtSvgRef} />
          </div>

          {/* Advice based on lowest score */}
          {(() => {
            const sorted = [...waqtStats].sort((a, b) => a.pct - b.pct);
            const lowest = sorted[0];
            return (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">পরামর্শ: </span>
                  আপনার <strong>{lowest.nameBn}</strong> নামাজের সময়ানুবর্তিতা ({toBengaliNumerals(lowest.pct)}%) তুলনামূলক কম। 
                  {lowest.key === 'fajr' ? ' রাতে জলদি ঘুমাতে যাওয়া ও অ্যালার্ম প্রস্তুত রাখার চেষ্টা করুন।' : ' কাজের ফাঁকে সময়মতো ওযু করে নামাজের জন্য প্রস্তুতি নিন।'}
                </div>
              </div>
            );
          })()}
        </div>

        {/* INTERACTIVE SALAH LOGGING PANEL */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>দৈনিক সালাত ট্র্যাকিং ও লগ ইনপুট</span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                তারিখ নির্বাচন করে ওয়াক্তের স্থিতি আপডেট করুন (ক্লিক করে পরিবর্তন করুন)
              </p>
            </div>

            {/* Date Picker */}
            <div className="flex items-center gap-1.5 text-xs">
              <input
                type="date"
                value={selectedLogDate}
                onChange={(e) => setSelectedLogDate(e.target.value)}
                className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold text-xs"
              />
              <button
                type="button"
                onClick={() => setSelectedLogDate(todayStr)}
                className="px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-semibold"
                title="আজকের তারিখে ফিরুন"
              >
                আজ
              </button>
            </div>
          </div>

          {/* 5 Prayers Quick Toggles */}
          <div className="space-y-2">
            {PRAYERS_CONFIG.map((p) => {
              const currentStatus = currentSelectedLog[p.key];
              return (
                <div
                  key={p.key}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                      {p.nameBn}
                    </span>
                    <span className="text-[11px] text-slate-400 font-sans">
                      ({p.nameEn})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Status Badge & Toggle Button */}
                    <button
                      type="button"
                      onClick={() => handleTogglePrayerStatus(p.key, currentStatus)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                        currentStatus === 'on_time'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : currentStatus === 'late'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : currentStatus === 'missed'
                          ? 'bg-rose-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-300'
                      }`}
                    >
                      {currentStatus === 'on_time' ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>সময়মতো ✓</span>
                        </>
                      ) : currentStatus === 'late' ? (
                        <>
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>দেরিতে ⏱</span>
                        </>
                      ) : currentStatus === 'missed' ? (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          <span>মিসড ✕</span>
                        </>
                      ) : (
                        <span>চিহ্নিত করুন...</span>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Action: Mark all 5 prayers on-time */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-400">
              💡 স্ট্যাটাসে ক্লিক করলে: সময়মতো ➔ দেরিতে ➔ মিসড চক্রাকারে পরিবর্তিত হয়।
            </span>
            <button
              type="button"
              onClick={() => handleMarkAllOnTime(selectedLogDate)}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              সবগুলো সময়মতো সম্পন্ন
            </button>
          </div>
        </div>
      </div>

      {/* RECENT LOG HISTORY TABLE */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            বিগত দিনগুলোর নামাজ লগ বিবরণী
          </h3>
          <span className="text-xs text-slate-500">
            সর্বমোট {toBengaliNumerals(datesList.length)} দিনের হিস্ট্রি
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-2.5 px-3">তারিখ</th>
                <th className="py-2.5 px-2 text-center">ফজর</th>
                <th className="py-2.5 px-2 text-center">যোহর</th>
                <th className="py-2.5 px-2 text-center">আসর</th>
                <th className="py-2.5 px-2 text-center">মাগরিব</th>
                <th className="py-2.5 px-2 text-center">এশা</th>
                <th className="py-2.5 px-3 text-right">সময়মতো হার</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {trendData.slice().reverse().map((row) => {
                const badge = (status: SalahPunctualityStatus | undefined) => {
                  if (status === 'on_time') {
                    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">সময়মতো</span>;
                  }
                  if (status === 'late') {
                    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">দেরিতে</span>;
                  }
                  if (status === 'missed') {
                    return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">মিসড</span>;
                  }
                  return <span className="px-2 py-0.5 rounded text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800">-</span>;
                };

                const isToday = row.dateStr === todayStr;

                return (
                  <tr 
                    key={row.dateStr} 
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer ${
                      selectedLogDate === row.dateStr ? 'bg-emerald-50/50 dark:bg-emerald-950/20' : ''
                    }`}
                    onClick={() => setSelectedLogDate(row.dateStr)}
                  >
                    <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white flex items-center gap-1.5">
                      <span>{toBengaliNumerals(row.dateStr)}</span>
                      {isToday && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold">
                          আজ
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-2 text-center">{badge(row.details.fajr)}</td>
                    <td className="py-2.5 px-2 text-center">{badge(row.details.dhuhr)}</td>
                    <td className="py-2.5 px-2 text-center">{badge(row.details.asr)}</td>
                    <td className="py-2.5 px-2 text-center">{badge(row.details.maghrib)}</td>
                    <td className="py-2.5 px-2 text-center">{badge(row.details.isha)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">
                      <span className={row.pct >= 80 ? 'text-emerald-600' : row.pct >= 60 ? 'text-amber-600' : 'text-rose-600'}>
                        {toBengaliNumerals(row.pct)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
