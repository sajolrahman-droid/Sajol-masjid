import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  BarChart3, 
  PieChart as PieIcon, 
  Activity, 
  ShieldCheck, 
  AlertCircle,
  Calendar,
  Sparkles
} from 'lucide-react';
import { MosqueTransaction, AppStateData } from '../types/mosque';
import { toBengaliNumerals } from '../utils/prayerCalculator';

interface MosqueFinancialVisualSummaryProps {
  appState: AppStateData;
  balance: { b: number; c: number; total: number };
}

// Bengali Month Names
const BANGLA_MONTHS: Record<string, string> = {
  '01': 'জানুয়ারি',
  '02': 'ফেব্রুয়ারি',
  '03': 'মার্চ',
  '04': 'এপ্রিল',
  '05': 'মে',
  '06': 'জুন',
  '07': 'জুলাই',
  '08': 'আগস্ট',
  '09': 'সেপ্টেম্বর',
  '10': 'অক্টোবর',
  '11': 'নভেম্বর',
  '12': 'ডিসেম্বর'
};

const PIE_COLORS_INCOME = [
  '#059669', // Emerald
  '#0d9488', // Teal
  '#0284c7', // Sky
  '#6366f1', // Indigo
  '#8b5cf6', // Purple
  '#10b981', // Green
  '#14b8a6'  // Light Teal
];

const PIE_COLORS_EXPENSE = [
  '#e11d48', // Rose
  '#ea580c', // Orange
  '#d97706', // Amber
  '#dc2626', // Red
  '#be123c', // Deep Rose
  '#f59e0b', // Yellow Amber
  '#c026d3'  // Fuchsia
];

export const MosqueFinancialVisualSummary: React.FC<MosqueFinancialVisualSummaryProps> = ({
  appState,
  balance
}) => {
  const [chartView, setChartView] = useState<'bar' | 'area' | 'pie'>('bar');
  const [timeRange, setTimeRange] = useState<'6m' | '12m' | 'all'>('6m');
  const [pieCategoryType, setPieCategoryType] = useState<'in' | 'out'>('in');

  const f = (n: number) => `৳ ${(Number(n) || 0).toLocaleString('bn-BD')}`;

  // Format month string 'YYYY-MM' to readable Bengali 'Month Year'
  const formatMonthLabel = (yearMonth: string, short = false) => {
    const [year, month] = yearMonth.split('-');
    const mName = BANGLA_MONTHS[month] || month;
    if (short) {
      return `${mName.slice(0, 3)} '${toBengaliNumerals(year.slice(2))}`;
    }
    return `${mName} ${toBengaliNumerals(year)}`;
  };

  // Group transactions by month
  const monthlyData = useMemo(() => {
    const monthMap: Record<string, { income: number; expense: number; txCount: number }> = {};

    // Get sorted transactions
    const sortedTxs = [...appState.tx].sort((a, b) => a.date.localeCompare(b.date));

    // Seed last 6 months at minimum if empty
    if (sortedTxs.length === 0) {
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        monthMap[ym] = { income: 0, expense: 0, txCount: 0 };
      }
    } else {
      sortedTxs.forEach((t) => {
        const ym = t.date.slice(0, 7);
        if (!monthMap[ym]) {
          monthMap[ym] = { income: 0, expense: 0, txCount: 0 };
        }
        const amt = Number(t.amt) || 0;
        if (t.type === 'in') {
          monthMap[ym].income += amt;
          monthMap[ym].txCount += 1;
        } else if (t.type === 'out') {
          monthMap[ym].expense += amt;
          monthMap[ym].txCount += 1;
        }
      });
    }

    const allMonths = Object.keys(monthMap).sort();

    // Filter by timeRange
    let filteredMonths = allMonths;
    if (timeRange === '6m') {
      filteredMonths = allMonths.slice(-6);
    } else if (timeRange === '12m') {
      filteredMonths = allMonths.slice(-12);
    }

    return filteredMonths.map((ym) => {
      const inc = monthMap[ym]?.income || 0;
      const exp = monthMap[ym]?.expense || 0;
      const net = inc - exp;
      return {
        monthKey: ym,
        label: formatMonthLabel(ym),
        shortLabel: formatMonthLabel(ym, true),
        income: inc,
        expense: exp,
        net: net,
        savingsRate: inc > 0 ? Math.round((net / inc) * 100) : 0
      };
    });
  }, [appState.tx, timeRange]);

  // Overall Financial Health Analytics
  const healthStats = useMemo(() => {
    const monthsCount = Math.max(1, monthlyData.length);
    const totalInc = monthlyData.reduce((s, m) => s + m.income, 0);
    const totalExp = monthlyData.reduce((s, m) => s + m.expense, 0);
    const avgInc = Math.round(totalInc / monthsCount);
    const avgExp = Math.round(totalExp / monthsCount);
    const netSurplus = totalInc - totalExp;
    const savingsRatio = totalInc > 0 ? (netSurplus / totalInc) * 100 : 0;

    // Runway in months: how many months current total fund can sustain average expenses
    const runwayMonths = avgExp > 0 ? (balance.total / avgExp).toFixed(1) : 'অগণিত';

    // Best month
    const bestMonth = [...monthlyData].sort((a, b) => b.net - a.net)[0];

    // Status evaluation
    let statusLabel = 'স্থিতিশীল (সন্তোষজনক)';
    let statusColor = 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800';
    let statusIcon = <ShieldCheck className="w-4 h-4 text-emerald-600" />;

    if (savingsRatio >= 25 && balance.total > avgExp * 3) {
      statusLabel = 'অত্যন্ত সুদৃঢ় ও উদ্বৃত্ত তহবিল';
      statusColor = 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800';
      statusIcon = <ShieldCheck className="w-4 h-4 text-emerald-600" />;
    } else if (savingsRatio < 0) {
      statusLabel = 'ঘাটতি সতর্কতা (ব্যয় আয়ের চেয়ে বেশি)';
      statusColor = 'text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800';
      statusIcon = <AlertCircle className="w-4 h-4 text-rose-600" />;
    } else if (savingsRatio < 15) {
      statusLabel = 'স্বাভাবিক তবে সঞ্চয় বৃদ্ধি প্রয়োজন';
      statusColor = 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800';
      statusIcon = <Activity className="w-4 h-4 text-amber-600" />;
    }

    return {
      totalInc,
      totalExp,
      avgInc,
      avgExp,
      netSurplus,
      savingsRatio,
      runwayMonths,
      bestMonth,
      statusLabel,
      statusColor,
      statusIcon
    };
  }, [monthlyData, balance.total]);

  // Category breakdown for Pie Chart
  const pieData = useMemo(() => {
    const catMap: Record<string, number> = {};
    const relevantTxs = appState.tx.filter((t) => t.type === pieCategoryType);

    relevantTxs.forEach((t) => {
      const cat = t.cat || (pieCategoryType === 'in' ? 'অন্যান্য আয়' : 'অন্যান্য খরচ');
      catMap[cat] = (catMap[cat] || 0) + Number(t.amt);
    });

    const entries = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // If more than 6 categories, group smaller into 'অন্যান্য'
    if (entries.length > 6) {
      const top5 = entries.slice(0, 5);
      const othersVal = entries.slice(5).reduce((s, e) => s + e.value, 0);
      return [...top5, { name: 'অন্যান্য খাত', value: othersVal }];
    }

    return entries;
  }, [appState.tx, pieCategoryType]);

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const itemData = payload[0]?.payload;
      const inc = itemData?.income || 0;
      const exp = itemData?.expense || 0;
      const net = itemData?.net || 0;

      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-2xl border border-slate-700 text-xs space-y-1.5 min-w-[180px]">
          <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 flex items-center justify-between">
            <span>{itemData?.label || label}</span>
            <span className="text-[10px] font-mono text-slate-400">
              {toBengaliNumerals(itemData?.savingsRate || 0)}% সঞ্চয়
            </span>
          </p>
          <div className="flex justify-between items-center text-emerald-400">
            <span>🟢 মোট আয়:</span>
            <span className="font-mono font-bold">{f(inc)}</span>
          </div>
          <div className="flex justify-between items-center text-rose-400">
            <span>🔴 মোট ব্যয়:</span>
            <span className="font-mono font-bold">{f(exp)}</span>
          </div>
          <div className="border-t border-slate-700/80 pt-1 flex justify-between items-center font-bold">
            <span className={net >= 0 ? 'text-emerald-300' : 'text-rose-300'}>
              {net >= 0 ? '💎 নিট উদ্বৃত্ত:' : '⚠️ নিট ঘাটতি:'}
            </span>
            <span className={`font-mono ${net >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
              {f(Math.abs(net))}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const totalPieVal = pieData.reduce((s, p) => s + p.value, 0);
      const percent = totalPieVal > 0 ? ((item.value / totalPieVal) * 100).toFixed(1) : '0';

      return (
        <div className="bg-slate-900 text-white p-2.5 rounded-xl shadow-xl border border-slate-700 text-xs">
          <p className="font-bold text-slate-200">{item.name}</p>
          <p className="text-emerald-400 font-mono font-bold text-sm mt-0.5">
            {f(item.value)}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            মোট পরিমাণের {toBengaliNumerals(percent)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Title & Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>মাসিক আয় বনাম ব্যয়ের ভিজ্যুয়াল সামারি</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-semibold hidden sm:inline-block">
                  Recharts
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                মসজিদ কমিটির জন্য আর্থিক স্বচ্ছতা ও মাসিক গতিবিধির চার্ট
              </p>
            </div>
          </div>
        </div>

        {/* Filters and View Switchers */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Mode */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setChartView('bar')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                chartView === 'bar'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="বার চার্ট (তুলনামূলক আয়-ব্যয়)"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>মাসিক বার</span>
            </button>
            <button
              onClick={() => setChartView('area')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                chartView === 'area'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="গতিধারা চার্ট (ক্যাশফ্লো ট্রেন্ড)"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>গতিধারা</span>
            </button>
            <button
              onClick={() => setChartView('pie')}
              className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${
                chartView === 'pie'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="খাতভিত্তিক পাই চার্ট"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>খাতভিত্তিক</span>
            </button>
          </div>

          {/* Time Range Filter (for bar and area) */}
          {chartView !== 'pie' && (
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                onClick={() => setTimeRange('6m')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  timeRange === '6m'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ৬ মাস
              </button>
              <button
                onClick={() => setTimeRange('12m')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  timeRange === '12m'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ১ বছর
              </button>
              <button
                onClick={() => setTimeRange('all')}
                className={`px-2.5 py-1.5 rounded-lg transition ${
                  timeRange === 'all'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                সব
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Financial Health Status Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${healthStats.statusColor}`}>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60 shadow-xs">
            {healthStats.statusIcon}
          </div>
          <div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-80">
              মসজিদের আর্থিক স্বাস্থ্য মূল্যায়ন
            </div>
            <div className="text-sm sm:text-base font-extrabold mt-0.5">
              {healthStats.statusLabel}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="bg-white/80 dark:bg-slate-900/70 px-3 py-1.5 rounded-xl border border-current/20 font-medium">
            বর্তমান তহবিল দিয়ে চলবে প্রায়:{' '}
            <strong className="font-mono font-bold text-sm">
              {toBengaliNumerals(healthStats.runwayMonths)}
            </strong>{' '}
            মাস
          </div>
        </div>
      </div>

      {/* 4 Financial Health Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>গড় মাসিক আয়</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-600 mt-1">
            {f(healthStats.avgInc)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            বিগত {toBengaliNumerals(monthlyData.length)} মাসের গড়
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>গড় মাসিক খরচ</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
          </div>
          <div className="text-lg sm:text-xl font-bold font-mono text-rose-600 mt-1">
            {f(healthStats.avgExp)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            বেতন ও ইউটিলিটি সহ
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>সঞ্চয় অনুপাত</span>
            <PiggyBank className="w-3.5 h-3.5 text-indigo-600" />
          </div>
          <div className={`text-lg sm:text-xl font-bold font-mono mt-1 ${
            healthStats.savingsRatio >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'
          }`}>
            {healthStats.savingsRatio > 0 ? '+' : ''}{toBengaliNumerals(healthStats.savingsRatio.toFixed(1))}%
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            মোট আয়ের বিপরীতে উদ্বৃত্ত
          </span>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs">
            <span>মোট নিট উদ্বৃত্ত</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className={`text-lg sm:text-xl font-bold font-mono mt-1 ${
            healthStats.netSurplus >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'
          }`}>
            {f(healthStats.netSurplus)}
          </div>
          <span className="text-[10px] text-slate-400 block mt-0.5">
            নির্বাচিত সময়কালের সমষ্টি
          </span>
        </div>
      </div>

      {/* MAIN CHART CONTAINER */}
      <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 min-h-[340px] flex flex-col justify-center">
        {chartView === 'bar' && (
          <div>
            <div className="flex items-center justify-between mb-3 text-xs px-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                মাসিক আয় ও খরচের তুলনা (টাকা)
              </span>
              <div className="flex items-center gap-4 text-[11px] font-semibold">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <div className="w-3 h-3 rounded bg-emerald-600" />
                  <span>মাসিক আয়</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                  <div className="w-3 h-3 rounded bg-rose-600" />
                  <span>মাসিক খরচ</span>
                </div>
              </div>
            </div>

            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis
                    dataKey="shortLabel"
                    tick={{ fontSize: 11, fill: '#888888' }}
                    axisLine={{ stroke: '#888888', opacity: 0.2 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#888888' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="income"
                    name="আয়"
                    fill="#059669"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="expense"
                    name="ব্যয়"
                    fill="#e11d48"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartView === 'area' && (
          <div>
            <div className="flex items-center justify-between mb-3 text-xs px-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                আর্থিক গতিধারা ও নিট ক্যাশফ্লো (উদ্বৃত্ত বনাম ঘাটতি)
              </span>
              <div className="flex items-center gap-4 text-[11px] font-semibold">
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <div className="w-3 h-3 rounded bg-emerald-500" />
                  <span>মাসিক আয়</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-500">
                  <div className="w-3 h-3 rounded bg-rose-500" />
                  <span>মাসিক ব্যয়</span>
                </div>
              </div>
            </div>

            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={monthlyData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
                >
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} vertical={false} />
                  <XAxis
                    dataKey="shortLabel"
                    tick={{ fontSize: 11, fill: '#888888' }}
                    axisLine={{ stroke: '#888888', opacity: 0.2 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#888888' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="আয়"
                    stroke="#059669"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#incomeGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="ব্যয়"
                    stroke="#e11d48"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#expenseGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {chartView === 'pie' && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs px-2">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {pieCategoryType === 'in' ? 'আয়ের প্রধান খাতভিত্তিক বণ্টন' : 'ব্যয়ের প্রধান খাতভিত্তিক বণ্টন'}
              </span>

              <div className="flex bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setPieCategoryType('in')}
                  className={`px-3 py-1 rounded-md transition ${
                    pieCategoryType === 'in'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  আয়ের খাত
                </button>
                <button
                  onClick={() => setPieCategoryType('out')}
                  className={`px-3 py-1 rounded-md transition ${
                    pieCategoryType === 'out'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300'
                  }`}
                >
                  ব্যয়ের খাত
                </button>
              </div>
            </div>

            {pieData.length === 0 ? (
              <div className="h-[260px] flex items-center justify-center text-slate-400 text-xs">
                কোনো খাতভিত্তিক লেনদেনের তথ্য পাওয়া যায়নি
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-4">
                <div className="w-full h-[260px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              pieCategoryType === 'in'
                                ? PIE_COLORS_INCOME[index % PIE_COLORS_INCOME.length]
                                : PIE_COLORS_EXPENSE[index % PIE_COLORS_EXPENSE.length]
                            }
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Category Legend list */}
                <div className="space-y-2 text-xs">
                  {pieData.map((cat, idx) => {
                    const totalPieVal = pieData.reduce((s, p) => s + p.value, 0);
                    const pct = totalPieVal > 0 ? ((cat.value / totalPieVal) * 100).toFixed(1) : '0';
                    const color =
                      pieCategoryType === 'in'
                        ? PIE_COLORS_INCOME[idx % PIE_COLORS_INCOME.length]
                        : PIE_COLORS_EXPENSE[idx % PIE_COLORS_EXPENSE.length];

                    return (
                      <div
                        key={cat.name}
                        className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full shrink-0"
                            style={{ backgroundColor: color }}
                          />
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {cat.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-slate-900 dark:text-white">
                            {f(cat.value)}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {toBengaliNumerals(pct)}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Monthly Summary Breakdown Table */}
      <div className="space-y-2">
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-600" />
          <span>মাসভিত্তিক পরিসংখ্যান তালিকা ({toBengaliNumerals(monthlyData.length)} মাস)</span>
        </h4>

        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-800">
                <th className="py-2.5 px-3">মাস</th>
                <th className="py-2.5 px-3 text-right">আয়</th>
                <th className="py-2.5 px-3 text-right">ব্যয়</th>
                <th className="py-2.5 px-3 text-right">নিট লাভ/উদ্বৃত্ত</th>
                <th className="py-2.5 px-3 text-center">সঞ্চয় হার</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
              {monthlyData.slice().reverse().map((m) => (
                <tr key={m.monthKey} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200">
                    {m.label}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-600">
                    {f(m.income)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-600">
                    {f(m.expense)}
                  </td>
                  <td className={`py-2.5 px-3 text-right font-mono font-bold ${
                    m.net >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600'
                  }`}>
                    {m.net >= 0 ? `+${f(m.net)}` : `-${f(Math.abs(m.net))}`}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-mono font-bold ${
                      m.savingsRate > 20
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                        : m.savingsRate >= 0
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                    }`}>
                      {m.savingsRate > 0 ? '+' : ''}{toBengaliNumerals(m.savingsRate)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
