/**
 * Astronomical Lunar Phase & Islamic Moon Tracker Engine
 * Accurately estimates lunar phase, illumination percentage, moon age,
 * and tracks key Islamic calendar milestones (Ayyam al-Beed, Hilal sighting, Full Moon).
 */

export type MoonPhaseKey =
  | 'new_moon'
  | 'waxing_crescent'
  | 'first_quarter'
  | 'waxing_gibbous'
  | 'full_moon'
  | 'waning_gibbous'
  | 'last_quarter'
  | 'waning_crescent';

export interface LunarPhaseInfo {
  phaseKey: MoonPhaseKey;
  phaseNameBn: string;
  phaseNameEn: string;
  phaseNameAr: string;
  ageDays: number; // Current lunar age in days (0.0 to 29.53)
  fraction: number; // Cycle fraction (0.0 to 1.0)
  illuminationPercent: number; // 0% to 100%
  isWaxing: boolean;
  isHilal: boolean; // First waxing crescent (new Hijri month marker)
  isAyyamAlBeed: boolean; // Days 13, 14, 15 of Hijri month (White Days)
  isFullMoonBadr: boolean; // Peak full moon
  daysUntilNextFullMoon: number;
  daysUntilNextNewMoon: number;
  approxHijriDay: number; // 1 to 30
  islamicSignificanceBn: string;
  islamicSignificanceEn: string;
  sunnahNoteBn?: string;
  terminatorXRatio: number; // For SVG rendering (-1.0 to 1.0)
}

// Astronomical constants
const SYNODIC_MONTH = 29.53058867; // Mean length of lunar month in solar days
// Known precise reference New Moon epoch: 2024-01-11 11:57 UTC = Julian Date 2460320.998
const REFERENCE_NEW_MOON_JD = 2460320.998;

/**
 * Convert standard JavaScript Date to Astronomical Julian Date
 */
export function getJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * Estimate the current lunar phase and Islamic calendar astronomical properties
 * @param date Target date (defaults to current system time)
 */
export function estimateLunarPhase(date: Date = new Date()): LunarPhaseInfo {
  const jd = getJulianDate(date);
  const daysSinceRef = jd - REFERENCE_NEW_MOON_JD;
  
  // Calculate cycle fraction [0, 1)
  let fraction = (daysSinceRef / SYNODIC_MONTH) % 1;
  if (fraction < 0) {
    fraction += 1;
  }

  // Age in days (0 to 29.53)
  const ageDays = Math.round(fraction * SYNODIC_MONTH * 10) / 10;

  // Illumination percentage (0 to 100)
  // Phase angle theta from 0 (New Moon) to 2*PI (New Moon)
  const theta = fraction * 2 * Math.PI;
  const illuminationFraction = (1 - Math.cos(theta)) / 2;
  const illuminationPercent = Math.round(illuminationFraction * 100);

  // Waxing or Waning
  const isWaxing = fraction < 0.5;

  // Days until next Full Moon (fraction = 0.5)
  let daysUntilNextFullMoon: number;
  if (fraction < 0.5) {
    daysUntilNextFullMoon = Math.round((0.5 - fraction) * SYNODIC_MONTH * 10) / 10;
  } else {
    daysUntilNextFullMoon = Math.round((1.5 - fraction) * SYNODIC_MONTH * 10) / 10;
  }

  // Days until next New Moon (next Hijri month)
  const daysUntilNextNewMoon = Math.round((1.0 - fraction) * SYNODIC_MONTH * 10) / 10;

  // Approximate Hijri Day based on lunar age (1 to 30)
  let approxHijriDay = Math.floor(ageDays) + 1;
  if (approxHijriDay > 30) approxHijriDay = 30;

  // Determine standard 8 phases
  let phaseKey: MoonPhaseKey;
  let phaseNameBn: string;
  let phaseNameEn: string;
  let phaseNameAr: string;
  let islamicSignificanceBn: string;
  let islamicSignificanceEn: string;
  let sunnahNoteBn: string | undefined;

  // Precise phase classification
  if (fraction < 0.033 || fraction >= 0.967) {
    phaseKey = 'new_moon';
    phaseNameBn = 'নতুন চাঁদ (মহাবিসর্জন / অমাবস্যা)';
    phaseNameEn = 'New Moon';
    phaseNameAr = 'المحاق / القمر الجديد';
    islamicSignificanceBn = 'চাঁদ সূর্যের সাথে মিলিত থাকে। নতুন হিজরি মাসের চাঁদ ওঠার পূর্বাবস্থা।';
    islamicSignificanceEn = 'Conjunction phase before the birth of the new crescent.';
  } else if (fraction < 0.216) {
    phaseKey = 'waxing_crescent';
    phaseNameBn = 'হিলাল / উদীয়মান নবচন্দ্র';
    phaseNameEn = 'Waxing Crescent (Hilal)';
    phaseNameAr = 'الهلال المتزايد';
    islamicSignificanceBn = 'হিলাল দর্শন — নতুন আরবি হিজরি মাসের সূচনা ও বরকতপূর্ণ সময়।';
    islamicSignificanceEn = 'First visible crescent sighting, marking the start of the Islamic month.';
    sunnahNoteBn = 'নতুন চাঁদ দেখলে রাসূলুল্লাহ (ﷺ) বরকত ও শান্তির দু\'আ পড়তেন।';
  } else if (fraction < 0.283) {
    phaseKey = 'first_quarter';
    phaseNameBn = 'প্রথম চতুর্থাংশ (অর্ধচন্দ্র)';
    phaseNameEn = 'First Quarter';
    phaseNameAr = 'التربيع الأول';
    islamicSignificanceBn = 'হিজরি মাসের প্রথম প্রান্তিক অতিক্রমণ (৭-৮ তারিখ)।';
    islamicSignificanceEn = 'First quarter of the Hijri month (Day 7-8).';
  } else if (fraction < 0.467) {
    phaseKey = 'waxing_gibbous';
    phaseNameBn = 'ক্রমবর্ধমান চাঁদ (আইয়ামে বিজের আগমনী)';
    phaseNameEn = 'Waxing Gibbous';
    phaseNameAr = 'الأحدب المتزايد';
    islamicSignificanceBn = 'চাঁদ পূর্ণতার দিকে অগ্রসর হচ্ছে। সামনেই আইয়ামে বিজের বরকতময় দিন।';
    islamicSignificanceEn = 'Moon approaching full illumination before the White Days.';
  } else if (fraction < 0.533) {
    phaseKey = 'full_moon';
    phaseNameBn = 'পূর্ণিমা / বদর (আইয়ামে বিজ)';
    phaseNameEn = 'Full Moon (Badr)';
    phaseNameAr = 'البدر التام';
    islamicSignificanceBn = 'পূর্ণিমার রাত ও আইয়ামে বিজের মূল দিন (১৩, ১৪, ১৫ তারিখ)।';
    islamicSignificanceEn = 'Peak full moon and the blessed White Days (Ayyam al-Beed).';
    sunnahNoteBn = 'আইয়ামে বিজের ৩ দিন (১৩, ১৪ ও ১৫ তারিখ) রোজা রাখা সুন্নতে মুয়াক্কাদা।';
  } else if (fraction < 0.716) {
    phaseKey = 'waning_gibbous';
    phaseNameBn = 'ক্রমহ্রাসমান চাঁদ';
    phaseNameEn = 'Waning Gibbous';
    phaseNameAr = 'الأحدب المتناقص';
    islamicSignificanceBn = 'পূর্ণিমার পরবর্তী পর্যায় (১৬-২১ তারিখ)।';
    islamicSignificanceEn = 'Post-full moon waning period (Days 16-21).';
  } else if (fraction < 0.783) {
    phaseKey = 'last_quarter';
    phaseNameBn = 'শেষ চতুর্থাংশ (অপরাহ্ন অর্ধচন্দ্র)';
    phaseNameEn = 'Last Quarter';
    phaseNameAr = 'التربيع الثاني';
    islamicSignificanceBn = 'হিজরি মাসের তৃতীয় প্রান্তিক (২২-২৩ তারিখ)।';
    islamicSignificanceEn = 'Third quarter of the Hijri month (Days 22-23).';
  } else {
    phaseKey = 'waning_crescent';
    phaseNameBn = 'ক্ষীয়মাণ বাঁকা চাঁদ (মাসের সমাপ্তি)';
    phaseNameEn = 'Waning Crescent';
    phaseNameAr = 'الهلال المتناقص';
    islamicSignificanceBn = 'মাসের শেষ বাঁকা চাঁদ (খুরজুনিল কাদীম)। পরবর্তী মাসের হিলাল অন্বেষণের সময় নিকটবর্তী।';
    islamicSignificanceEn = 'Final crescent of the month. Preparing for next month moon sighting.';
    sunnahNoteBn = 'পবিত্র কুরআন: "অবশেষে সে পুরোনো খেজুর শাখার মতো শুষ্ক বাঁকা হয়ে ফিরে আসে।" (সূরা ইয়াসীন: ৩৯)';
  }

  // Islamic Milestones Flags
  const isHilal = fraction >= 0.033 && fraction <= 0.13;
  const isAyyamAlBeed = approxHijriDay >= 13 && approxHijriDay <= 15;
  const isFullMoonBadr = phaseKey === 'full_moon';

  // Terminator ratio for SVG illumination curvature (-1 to 1)
  // cos(theta): at new moon cos(0)=1, at 1st qtr cos(pi/2)=0, at full moon cos(pi)=-1
  const terminatorXRatio = Math.cos(theta);

  return {
    phaseKey,
    phaseNameBn,
    phaseNameEn,
    phaseNameAr,
    ageDays,
    fraction,
    illuminationPercent,
    isWaxing,
    isHilal,
    isAyyamAlBeed,
    isFullMoonBadr,
    daysUntilNextFullMoon,
    daysUntilNextNewMoon,
    approxHijriDay,
    islamicSignificanceBn,
    islamicSignificanceEn,
    sunnahNoteBn,
    terminatorXRatio
  };
}

/**
 * Standard phases list for visual cycle timeline
 */
export const ALL_LUNAR_PHASES = [
  { key: 'new_moon', nameBn: 'মহাক / অমাবস্যা', nameEn: 'New Moon', fraction: 0.0 },
  { key: 'waxing_crescent', nameBn: 'হিলাল / নবচন্দ্র', nameEn: 'Waxing Crescent', fraction: 0.125 },
  { key: 'first_quarter', nameBn: 'প্রথম চতুর্থাংশ', nameEn: 'First Quarter', fraction: 0.25 },
  { key: 'waxing_gibbous', nameBn: 'ক্রমবর্ধমান', nameEn: 'Waxing Gibbous', fraction: 0.375 },
  { key: 'full_moon', nameBn: 'পূর্ণিমা (বদর)', nameEn: 'Full Moon', fraction: 0.5 },
  { key: 'waning_gibbous', nameBn: 'ক্রমহ্রাসমান', nameEn: 'Waning Gibbous', fraction: 0.625 },
  { key: 'last_quarter', nameBn: 'শেষ চতুর্থাংশ', nameEn: 'Last Quarter', fraction: 0.75 },
  { key: 'waning_crescent', nameBn: 'ক্ষীয়মাণ চাঁদ', nameEn: 'Waning Crescent', fraction: 0.875 }
];
