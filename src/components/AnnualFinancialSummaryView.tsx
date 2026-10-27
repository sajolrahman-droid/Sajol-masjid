import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  BarChart3,
  Scale,
  Minus,
  CheckCircle2,
  AlertTriangle,
  PieChart as PieIcon,
  Layers,
  ArrowRightLeft
} from 'lucide-react';
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
  Area
} from 'recharts';
import { AppStateData, MosqueTransaction, Language } from '../types/mosque';
import { toBengaliNumerals } from '../utils/prayerCalculator';

interface AnnualFinancialSummaryViewProps {
  appState: AppStateData;
  language: Language;
}

const BANGLA_MONTHS_SHORT = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'
];

const BANGLA_MONTHS_FULL = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

export const AnnualFinancialSummaryView: React.FC<AnnualFinancialSummaryViewProps> = ({
  appState,
  language
}) => {
  const currentCalendarYear = new Date().getFullYear();

  // Extract all distinct years available in transactions
  const availableYears = useMemo(() => {
    const yearSet = new Set<number>();
    yearSet.add(currentCalendarYear);

    appState.tx.forEach((t) => {
      if (t.date && t.date.length >= 4) {
        const y = parseInt(t.date.slice(0, 4), 10);
        if (!isNaN(y) && y > 2000 && y < 2100) {
          yearSet.add(y);
        }
      }
    });

    return Array.from(yearSet).sort((a, b) => b - a);
  }, [appState.tx, currentCalendarYear]);

  const [selectedYear, setSelectedYear] = useState<number>(
    availableYears.length > 0 ? availableYears[0] : currentCalendarYear
  );
  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  const prevYear = selectedYear - 1;

  // Currency & number formatters
  const f = (n: number) => `৳ ${(Number(n) || 0).toLocaleString('bn-BD')}`;

  // Group transactions by month for selected year and previous year
  const annualAggregation = useMemo(() => {
    const selYearStr = String(selectedYear);
    const prevYearStr = String(prevYear);

    // Selected year monthly totals
    const selMonthly: { income: number; expense: number; count: number }[] = Array.from(
      { length: 12 },
      () => ({ income: 0, expense: 0, count: 0 })
    );

    // Previous year monthly totals
    const prevMonthly: { income: number; expense: number; count: number }[] = Array.from(
      { length: 12 },
      () => ({ income: 0, expense: 0, count: 0 })
    );

    // Category tracking for both years
    const selCatIncome: Record<string, number> = {};
    const selCatExpense: Record<string, number> = {};
    const prevCatIncome: Record<string, number> = {};
    const prevCatExpense: Record<string, number> = {};

    appState.tx.forEach((t) => {
      if (!t.date || t.date.length < 7) return;
      const year = t.date.slice(0, 4);
      const monthIdx = parseInt(t.date.slice(5, 7), 10) - 1;
      const amt = Number(t.amt) || 0;

      if (monthIdx >= 0 && monthIdx < 12) {
        if (year === selYearStr) {
          if (t.type === 'in') {
            selMonthly[monthIdx].income += amt;
            selMonthly[monthIdx].count += 1;
            selCatIncome[t.cat] = (selCatIncome[t.cat] || 0) + amt;
          } else if (t.type === 'out') {
            selMonthly[monthIdx].expense += amt;
            selMonthly[monthIdx].count += 1;
            selCatExpense[t.cat] = (selCatExpense[t.cat] || 0) + amt;
          }
        } else if (year === prevYearStr) {
          if (t.type === 'in') {
            prevMonthly[monthIdx].income += amt;
            prevMonthly[monthIdx].count += 1;
            prevCatIncome[t.cat] = (prevCatIncome[t.cat] || 0) + amt;
          } else if (t.type === 'out') {
            prevMonthly[monthIdx].expense += amt;
            prevMonthly[monthIdx].count += 1;
            prevCatExpense[t.cat] = (prevCatExpense[t.cat] || 0) + amt;
          }
        }
      }
    });

    // Totals for selected year
    const selTotalIncome = selMonthly.reduce((s, m) => s + m.income, 0);
    const selTotalExpense = selMonthly.reduce((s, m) => s + m.expense, 0);
    const selNetSurplus = selTotalIncome - selTotalExpense;

    // Totals for previous year
    const prevTotalIncome = prevMonthly.reduce((s, m) => s + m.income, 0);
    const prevTotalExpense = prevMonthly.reduce((s, m) => s + m.expense, 0);
    const prevNetSurplus = prevTotalIncome - prevTotalExpense;

    // YoY Percentage calculations
    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) {
        if (curr === 0) return 0;
        return 100; // 100% new growth if prev was zero
      }
      return ((curr - prev) / prev) * 100;
    };

    const incomeGrowthPct = calcGrowth(selTotalIncome, prevTotalIncome);
    const expenseGrowthPct = calcGrowth(selTotalExpense, prevTotalExpense);
    const netGrowthPct = calcGrowth(selNetSurplus, prevNetSurplus);

    // Month by month merged list for chart and comparison table
    const monthlyBreakdown = BANGLA_MONTHS_FULL.map((monthName, idx) => {
      const selInc = selMonthly[idx].income;
      const selExp = selMonthly[idx].expense;
      const selNet = selInc - selExp;

      const prevInc = prevMonthly[idx].income;
      const prevExp = prevMonthly[idx].expense;
      const prevNet = prevInc - prevExp;

      const mIncGrowth = calcGrowth(selInc, prevInc);
      const mExpGrowth = calcGrowth(selExp, prevExp);

      return {
        monthIndex: idx,
        monthName,
        monthShort: BANGLA_MONTHS_SHORT[idx],
        selInc,
        selExp,
        selNet,
        prevInc,
        prevExp,
        prevNet,
        mIncGrowth,
        mExpGrowth
      };
    });

    return {
      selTotalIncome,
      selTotalExpense,
      selNetSurplus,
      prevTotalIncome,
      prevTotalExpense,
      prevNetSurplus,
      incomeGrowthPct,
      expenseGrowthPct,
      netGrowthPct,
      monthlyBreakdown,
      selCatIncome,
      selCatExpense,
      prevCatIncome,
      prevCatExpense
    };
  }, [appState.tx, selectedYear, prevYear]);

  // Helper badge generator for YoY Growth
  const renderGrowthBadge = (
    pct: number,
    type: 'income' | 'expense' | 'surplus'
  ) => {
    const isZero = pct === 0;
    const isPositive = pct > 0;
    const absPct = Math.abs(pct).toFixed(1);
    const bnPct = toBengaliNumerals(absPct);

    // For Income & Surplus: positive is GOOD (green), negative is BAD (rose)
    // For Expense: positive is BAD/HIGHER (amber/rose), negative is GOOD/SAVED (emerald)
    let colorClasses = '';
    let IconComponent = Minus;

    if (isZero) {
      colorClasses = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
      IconComponent = Minus;
    } else if (type === 'income' || type === 'surplus') {
      if (isPositive) {
        colorClasses = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
        IconComponent = ArrowUpRight;
      } else {
        colorClasses = 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800';
        IconComponent = ArrowDownRight;
      }
    } else {
      // Expense
      if (isPositive) {
        colorClasses = 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
        IconComponent = ArrowUpRight;
      } else {
        colorClasses = 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
        IconComponent = ArrowDownRight;
      }
    }

    return (
      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${colorClasses}`}>
        <IconComponent className="w-3.5 h-3.5" />
        <span>
          {isPositive ? '+' : isZero ? '' : '-'}{bnPct}% YoY
        </span>
      </div>
    );
  };

  return (
    <div className="space-y-5">
      {/* HEADER & YEAR SELECTOR BAR */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-inner">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span>বার্ষিক আর্থিক হিসাব ও বর্ষভিত্তিক তুলনা</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
                {toBengaliNumerals(selectedYear)}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              বিগত বছর ({toBengaliNumerals(prevYear)}) এর সাথে বার্ষিক আয়, ব্যয় ও প্রবৃদ্ধির তুলনামূলক বিশ্লেষণ
            </p>
          </div>
        </div>

        {/* Year Selector Buttons */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto overflow-x-auto">
          <span className="text-xs font-semibold text-slate-500 shrink-0">বছর নির্বাচন:</span>
          <div className="flex gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            {availableYears.map((yr) => (
              <button
                key={yr}
                onClick={() => setSelectedYear(yr)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                  selectedYear === yr
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {toBengaliNumerals(yr)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ANNUAL KPI CARDS WITH YOY COMPARISON */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        {/* Annual Income Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>বার্ষিক মোট আয় ({toBengaliNumerals(selectedYear)})</span>
            </span>
            {renderGrowthBadge(annualAggregation.incomeGrowthPct, 'income')}
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
            {f(annualAggregation.selTotalIncome)}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center font-mono">
            <span>{toBengaliNumerals(prevYear)} সালে মোট আয়:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {f(annualAggregation.prevTotalIncome)}
            </span>
          </div>
        </div>

        {/* Annual Expense Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <TrendingDown className="w-4 h-4 text-rose-600" />
              <span>বার্ষিক মোট ব্যয় ({toBengaliNumerals(selectedYear)})</span>
            </span>
            {renderGrowthBadge(annualAggregation.expenseGrowthPct, 'expense')}
          </div>

          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
            {f(annualAggregation.selTotalExpense)}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center font-mono">
            <span>{toBengaliNumerals(prevYear)} সালে মোট ব্যয়:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {f(annualAggregation.prevTotalExpense)}
            </span>
          </div>
        </div>

        {/* Annual Net Surplus / Deficit Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs relative overflow-hidden space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-blue-600" />
              <span>
                {annualAggregation.selNetSurplus >= 0 ? 'বার্ষিক নিট উদ্বৃত্ত' : 'বার্ষিক নিট ঘাটতি'} ({toBengaliNumerals(selectedYear)})
              </span>
            </span>
            {renderGrowthBadge(annualAggregation.netGrowthPct, 'surplus')}
          </div>

          <div className={`text-2xl sm:text-3xl font-extrabold font-mono ${
            annualAggregation.selNetSurplus >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'
          }`}>
            {f(Math.abs(annualAggregation.selNetSurplus))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex justify-between items-center font-mono">
            <span>{toBengaliNumerals(prevYear)} সালে নিট স্থিতি:</span>
            <span className="font-bold text-slate-700 dark:text-slate-300">
              {f(annualAggregation.prevNetSurplus)}
            </span>
          </div>
        </div>
      </div>

      {/* YOY SUMMARY INSIGHT BANNER */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shadow-md space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <h4 className="text-sm font-bold text-amber-300">
            বছরের প্রবৃদ্ধি ও তুলনামূলক সারসংক্ষেপ ({toBengaliNumerals(selectedYear)} বনাম {toBengaliNumerals(prevYear)})
          </h4>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed">
          {toBengaliNumerals(selectedYear)} সালে মসজিদের মোট আয়{' '}
          <strong className="text-emerald-300 font-mono">{f(annualAggregation.selTotalIncome)}</strong>{' '}
          এবং মোট ব্যয় <strong className="text-rose-300 font-mono">{f(annualAggregation.selTotalExpense)}</strong>।{' '}
          {annualAggregation.prevTotalIncome > 0 ? (
            <>
              বিগত বছর ({toBengaliNumerals(prevYear)}) এর তুলনায় আয়{' '}
              <strong className="text-white font-semibold">
                {annualAggregation.incomeGrowthPct >= 0 ? 'বৃদ্ধি পেয়ে' : 'হ্রাস পেয়ে'} {toBengaliNumerals(Math.abs(annualAggregation.incomeGrowthPct).toFixed(1))}%
              </strong>{' '}
              হয়েছে এবং ব্যয়{' '}
              <strong className="text-white font-semibold">
                {annualAggregation.expenseGrowthPct >= 0 ? 'বৃদ্ধি পেয়ে' : 'কমেছে'} {toBengaliNumerals(Math.abs(annualAggregation.expenseGrowthPct).toFixed(1))}%
              </strong>।
            </>
          ) : (
            `বিগত বছর (${toBengaliNumerals(prevYear)}) এর পর্যাপ্ত উপাত্ত নিবন্ধিত নেই।`
          )}
        </p>
      </div>

      {/* RECHARTS COMPARATIVE VISUAL CHART */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-extrabold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              <span>মাসিক আয় ও ব্যয়ের বাৎসরিক চিত্র ({toBengaliNumerals(selectedYear)})</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              জানুয়ারি থেকে ডিসেম্বর পর্যন্ত ১২ মাসের আয় ও খরচের গ্রাফিক্যাল ধারা
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className="flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
              <button
                onClick={() => setChartType('bar')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  chartType === 'bar'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                বার চার্ট
              </button>
              <button
                onClick={() => setChartType('area')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  chartType === 'area'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                এরিয়া চার্ট
              </button>
            </div>
          </div>
        </div>

        <div className="h-72 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart
                data={annualAggregation.monthlyBreakdown}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="monthShort" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`৳ ${Number(value).toLocaleString('bn-BD')}`, '']}
                  labelFormatter={(label) => `মাস: ${label}`}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  formatter={(value) => (value === 'selInc' ? `আয় (${toBengaliNumerals(selectedYear)})` : `ব্যয় (${toBengaliNumerals(selectedYear)})`)}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                />
                <Bar dataKey="selInc" name="selInc" fill="#059669" radius={[4, 4, 0, 0]} />
                <Bar dataKey="selExp" name="selExp" fill="#e11d48" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <AreaChart
                data={annualAggregation.monthlyBreakdown}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorInc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e11d48" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#e11d48" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="monthShort" tick={{ fontSize: 11 }} />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickFormatter={(v) => `৳${(v / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  formatter={(value: any) => [`৳ ${Number(value).toLocaleString('bn-BD')}`, '']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  formatter={(value) => (value === 'selInc' ? `আয় (${toBengaliNumerals(selectedYear)})` : `ব্যয় (${toBengaliNumerals(selectedYear)})`)}
                  wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
                />
                <Area type="monotone" dataKey="selInc" name="selInc" stroke="#059669" fillOpacity={1} fill="url(#colorInc)" />
                <Area type="monotone" dataKey="selExp" name="selExp" stroke="#e11d48" fillOpacity={1} fill="url(#colorExp)" />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* 12-MONTH DETAILED COMPARATIVE BREAKDOWN TABLE */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-base">
            মাসিক বিস্তারিত বিবরণী ({toBengaliNumerals(selectedYear)} বনাম {toBengaliNumerals(prevYear)})
          </h4>
          <span className="text-xs text-slate-500 dark:text-slate-400">
            প্রতীটি মাসের আয়, ব্যয় ও বিগত বছরের সাথে পার্থক্য
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold">
                <th className="py-2.5 px-2">মাস</th>
                <th className="py-2.5 px-2 text-right">আয় ({toBengaliNumerals(selectedYear)})</th>
                <th className="py-2.5 px-2 text-right">ব্যয় ({toBengaliNumerals(selectedYear)})</th>
                <th className="py-2.5 px-2 text-right">নিট স্থিতি</th>
                <th className="py-2.5 px-2 text-right">আয় ({toBengaliNumerals(prevYear)})</th>
                <th className="py-2.5 px-2 text-right">ব্যয় ({toBengaliNumerals(prevYear)})</th>
                <th className="py-2.5 px-2 text-center">আয় প্রবৃদ্ধি</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono">
              {annualAggregation.monthlyBreakdown.map((m) => (
                <tr key={m.monthIndex} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="py-2.5 px-2 font-sans font-bold text-slate-900 dark:text-white">
                    {m.monthName}
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-emerald-600">
                    {f(m.selInc)}
                  </td>
                  <td className="py-2.5 px-2 text-right font-bold text-rose-600">
                    {f(m.selExp)}
                  </td>
                  <td className={`py-2.5 px-2 text-right font-bold ${
                    m.selNet >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'
                  }`}>
                    {f(m.selNet)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-500">
                    {f(m.prevInc)}
                  </td>
                  <td className="py-2.5 px-2 text-right text-slate-500">
                    {f(m.prevExp)}
                  </td>
                  <td className="py-2.5 px-2 text-center font-sans">
                    {m.prevInc > 0 ? (
                      <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                        m.mIncGrowth >= 0
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {m.mIncGrowth >= 0 ? '+' : ''}{toBengaliNumerals(m.mIncGrowth.toFixed(0))}%
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[10px]">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-slate-300 dark:border-slate-700 font-extrabold text-sm bg-slate-50 dark:bg-slate-800/80">
                <td className="py-3 px-2 font-sans text-slate-900 dark:text-white">সর্বমোট</td>
                <td className="py-3 px-2 text-right text-emerald-600 font-mono">
                  {f(annualAggregation.selTotalIncome)}
                </td>
                <td className="py-3 px-2 text-right text-rose-600 font-mono">
                  {f(annualAggregation.selTotalExpense)}
                </td>
                <td className={`py-3 px-2 text-right font-mono ${
                  annualAggregation.selNetSurplus >= 0 ? 'text-blue-600 dark:text-blue-400' : 'text-rose-600'
                }`}>
                  {f(annualAggregation.selNetSurplus)}
                </td>
                <td className="py-3 px-2 text-right text-slate-500 font-mono">
                  {f(annualAggregation.prevTotalIncome)}
                </td>
                <td className="py-3 px-2 text-right text-slate-500 font-mono">
                  {f(annualAggregation.prevTotalExpense)}
                </td>
                <td className="py-3 px-2 text-center font-sans text-xs">
                  {renderGrowthBadge(annualAggregation.incomeGrowthPct, 'income')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* TOP CATEGORY YOY COMPARISON */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Top Income Categories */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>খাতওয়ারি সেরা আয় ({toBengaliNumerals(selectedYear)})</span>
          </h4>

          <div className="space-y-2">
            {Object.entries(annualAggregation.selCatIncome)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([cat, amt]) => {
                const prevAmt = annualAggregation.prevCatIncome[cat] || 0;
                const pctOfTotal = annualAggregation.selTotalIncome > 0
                  ? ((amt / annualAggregation.selTotalIncome) * 100).toFixed(0)
                  : 0;

                return (
                  <div key={cat} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{cat}</span>
                      <span className="font-bold font-mono text-emerald-600">{f(amt)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>মোট আয়ের {toBengaliNumerals(pctOfTotal)}%</span>
                      {prevAmt > 0 && (
                        <span>বিগত বছর: <strong className="font-mono">{f(prevAmt)}</strong></span>
                      )}
                    </div>
                  </div>
                );
              })}
            {Object.keys(annualAggregation.selCatIncome).length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">কোনো আয়ের খাত রেকর্ড করা হয়নি</p>
            )}
          </div>
        </div>

        {/* Top Expense Categories */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-rose-600" />
            <span>খাতওয়ারি প্রধান ব্যয় ({toBengaliNumerals(selectedYear)})</span>
          </h4>

          <div className="space-y-2">
            {Object.entries(annualAggregation.selCatExpense)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 6)
              .map(([cat, amt]) => {
                const prevAmt = annualAggregation.prevCatExpense[cat] || 0;
                const pctOfTotal = annualAggregation.selTotalExpense > 0
                  ? ((amt / annualAggregation.selTotalExpense) * 100).toFixed(0)
                  : 0;

                return (
                  <div key={cat} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/50 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{cat}</span>
                      <span className="font-bold font-mono text-rose-600">{f(amt)}</span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>মোট খরচের {toBengaliNumerals(pctOfTotal)}%</span>
                      {prevAmt > 0 && (
                        <span>বিগত বছর: <strong className="font-mono">{f(prevAmt)}</strong></span>
                      )}
                    </div>
                  </div>
                );
              })}
            {Object.keys(annualAggregation.selCatExpense).length === 0 && (
              <p className="text-xs text-slate-400 py-4 text-center">কোনো খরচের খাত রেকর্ড করা হয়নি</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
