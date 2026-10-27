// Offline Mathematical Prayer Time & Qibla Calculator

// Makkah coordinates for Qibla calculation
const MAKKAH_LAT = 21.422487;
const MAKKAH_LNG = 39.826206;

export interface CityLocation {
  nameBn: string;
  nameEn: string;
  lat: number;
  lng: number;
  offsetMinutes: number; // Offset from standard Dhaka
}

export const BD_CITIES: CityLocation[] = [
  { nameBn: 'ঢাকা', nameEn: 'Dhaka', lat: 23.8103, lng: 90.4125, offsetMinutes: 0 },
  { nameBn: 'চট্টগ্রাম', nameEn: 'Chittagong', lat: 22.3569, lng: 91.7832, offsetMinutes: -5 },
  { nameBn: 'সিলেট', nameEn: 'Sylhet', lat: 24.8949, lng: 91.8687, offsetMinutes: -6 },
  { nameBn: 'রাজশাহী', nameEn: 'Rajshahi', lat: 24.3636, lng: 88.6241, offsetMinutes: 7 },
  { nameBn: 'খুলনা', nameEn: 'Khulna', lat: 22.8456, lng: 89.5403, offsetMinutes: 4 },
  { nameBn: 'বরিশাল', nameEn: 'Barishal', lat: 22.7010, lng: 90.3535, offsetMinutes: 1 },
  { nameBn: 'রংপুর', nameEn: 'Rangpur', lat: 25.7439, lng: 89.2752, offsetMinutes: 6 },
  { nameBn: 'ময়মনসিংহ', nameEn: 'Mymensingh', lat: 24.7471, lng: 90.4203, offsetMinutes: 0 },
  { nameBn: 'কুমিল্লা', nameEn: 'Comilla', lat: 23.4682, lng: 91.1788, offsetMinutes: -3 },
  { nameBn: 'বগুড়া', nameEn: 'Bogra', lat: 24.8465, lng: 89.3778, offsetMinutes: 4 },
  { nameBn: 'কক্সবাজার', nameEn: 'Coxs Bazar', lat: 21.4272, lng: 92.0058, offsetMinutes: -7 },
  { nameBn: 'গাজীপুর', nameEn: 'Gazipur', lat: 23.9999, lng: 90.4203, offsetMinutes: 0 },
  { nameBn: 'নারায়ণগঞ্জ', nameEn: 'Narayanganj', lat: 23.6238, lng: 90.5000, offsetMinutes: 0 }
];

// Helper: calculate Qibla heading in degrees (0-360, where 0=North, 90=East, etc.)
export function calculateQibla(lat: number, lng: number): number {
  const phiK = (MAKKAH_LAT * Math.PI) / 180.0;
  const lambdaK = (MAKKAH_LNG * Math.PI) / 180.0;
  const phi = (lat * Math.PI) / 180.0;
  const lambda = (lng * Math.PI) / 180.0;

  const y = Math.sin(lambdaK - lambda);
  const x = Math.cos(phi) * Math.tan(phiK) - Math.sin(phi) * Math.cos(lambdaK - lambda);

  let qibla = (Math.atan2(y, x) * 180.0) / Math.PI;
  qibla = (qibla + 360) % 360;
  return Math.round(qibla * 10) / 10;
}

// Convert hours decimal to "HH:MM AM/PM" or 24-hr
function formatHours(h: number, use12h = true): string {
  if (isNaN(h)) return '--:--';
  let hours = Math.floor(h);
  let minutes = Math.round((h - hours) * 60);
  if (minutes === 60) {
    hours += 1;
    minutes = 0;
  }
  hours = (hours + 24) % 24;

  if (use12h) {
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayH = hours % 12 === 0 ? 12 : hours % 12;
    return `${displayH.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  }
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

// Calculate Sun position and prayer times using standard astronomical formulas (Hanafi Asr)
export function calculatePrayerTimes(
  date: Date,
  lat = 23.8103,
  lng = 90.4125,
  hanafiAsr = true
) {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Approximate solar declination & equation of time
  const b = (2 * Math.PI * (dayOfYear - 81)) / 365;
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b); // minutes
  const delta = 23.45 * Math.sin((2 * Math.PI * (284 + dayOfYear)) / 365); // degrees
  const deltaRad = (delta * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;

  // Timezone offset in hours
  const timezoneOffsetHours = -date.getTimezoneOffset() / 60; // For BD, usually 6
  // Solar noon
  const solarNoon = 12 + (timezoneOffsetHours * 15 - lng) / 15 - eot / 60;

  // Hour angle helper
  const hourAngle = (angle: number) => {
    const angleRad = (angle * Math.PI) / 180;
    const cosHA =
      (Math.sin(angleRad) - Math.sin(latRad) * Math.sin(deltaRad)) /
      (Math.cos(latRad) * Math.cos(deltaRad));
    if (cosHA > 1 || cosHA < -1) return 0;
    return (Math.acos(cosHA) * 180) / Math.PI / 15;
  };

  // Fajr angle (-18 deg Karachi standard)
  const fajrHA = hourAngle(-18);
  // Sunrise angle (-0.833 deg)
  const sunriseHA = hourAngle(-0.833);
  // Maghrib angle (-0.833 deg)
  const maghribHA = hourAngle(-0.833);
  // Isha angle (-18 deg)
  const ishaHA = hourAngle(-18);

  // Asr shadow multiplier (1 for Shafi, 2 for Hanafi)
  const shadowFactor = hanafiAsr ? 2 : 1;
  const asrAlt =
    (Math.atan(1 / (shadowFactor + Math.tan(Math.abs(latRad - deltaRad)))) * 180) / Math.PI;
  const asrHA = hourAngle(asrAlt);

  const fajrDecimal = solarNoon - fajrHA;
  const sunriseDecimal = solarNoon - sunriseHA;
  const dhuhrDecimal = solarNoon + 2 / 60; // 2 min safety
  const asrDecimal = solarNoon + asrHA;
  const maghribDecimal = solarNoon + maghribHA + 2 / 60;
  const ishaDecimal = solarNoon + ishaHA;
  const tahajjudDecimal = (fajrDecimal - 1.5 + 24) % 24;

  // Sehri ends 10 mins before Fajr for safety
  const sehriDecimal = fajrDecimal - 10 / 60;

  return {
    fajr: formatHours(fajrDecimal),
    fajrRaw: fajrDecimal,
    sunrise: formatHours(sunriseDecimal),
    sunriseRaw: sunriseDecimal,
    dhuhr: formatHours(dhuhrDecimal),
    dhuhrRaw: dhuhrDecimal,
    asr: formatHours(asrDecimal),
    asrRaw: asrDecimal,
    maghrib: formatHours(maghribDecimal),
    maghribRaw: maghribDecimal,
    isha: formatHours(ishaDecimal),
    ishaRaw: ishaDecimal,
    tahajjud: formatHours(tahajjudDecimal),
    tahajjudRaw: tahajjudDecimal,
    sehri: formatHours(sehriDecimal),
    sehriRaw: sehriDecimal,
    iftar: formatHours(maghribDecimal),
    iftarRaw: maghribDecimal,
  };
}

// Convert English numbers to Bengali numerals
export function toBengaliNumerals(val: string | number): string {
  const bnNums = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(val).replace(/\d/g, (d) => bnNums[Number(d)]);
}

// Format prayer time display in Bengali
export function formatTimeInBengali(timeStr: string): string {
  if (!timeStr) return '--:--';
  const parts = timeStr.split(' ');
  const nums = toBengaliNumerals(parts[0]);
  if (parts.length > 1) {
    const ampmBn = parts[1].toLowerCase() === 'am' ? 'সকাল' : 'বিকেল/রাত';
    return `${nums} ${ampmBn}`;
  }
  return nums;
}

// Get Approximate Hijri date
export function getApproxHijriDate(date: Date): { day: number; monthBn: string; monthAr: string; year: number } {
  // Approximate Hijri conversion (using Umm al-Qura standard reference)
  // Reference: Oct 24, 2026 roughly corresponds to Rabi al-Awwal / Rabi al-Thani 1448 AH
  const hijriMonthsBn = [
    'মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি',
    'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান',
    'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ্জ'
  ];
  const hijriMonthsAr = [
    'المحرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
    'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
    'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
  ];

  // Epoch difference calculation
  const jd = Math.floor((date.getTime() / 86400000) + 2440587.5);
  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = (Math.floor((10985 - l2) / 5316)) * (Math.floor((50 * l2) / 17719)) +
            (Math.floor(l2 / 5670)) * (Math.floor((43 * l2) / 15238));
  const l3 = l2 - (Math.floor((30 - j) / 15)) * (Math.floor((17719 * j) / 50)) -
             (Math.floor(j / 16)) * (Math.floor((15238 * j) / 43)) + 29;
  const m = Math.floor((24 * l3) / 709);
  const d = l3 - Math.floor((709 * m) / 24);
  const y = 30 * n + j - 30;

  const monthIdx = Math.max(0, Math.min(11, m - 1));
  return {
    day: d,
    monthBn: hijriMonthsBn[monthIdx],
    monthAr: hijriMonthsAr[monthIdx],
    year: y
  };
}

// Format English date in Bengali
export function getFormattedEnglishDate(date: Date = new Date()): string {
  const monthsBn = [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
  ];
  const daysBn = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];
  
  const dayName = daysBn[date.getDay()];
  const dayNum = toBengaliNumerals(date.getDate());
  const monthName = monthsBn[date.getMonth()];
  const yearNum = toBengaliNumerals(date.getFullYear());

  return `${dayName}, ${dayNum} ${monthName} ${yearNum}`;
}

// Get Revised Bangla Academy Bengali Calendar Date
export function getBengaliCalendarDate(date: Date = new Date()): { day: number; monthBn: string; year: number; fullText: string } {
  const months = [
    'বৈশাখ', 'জ্যৈষ্ঠ', 'আষাঢ়', 'শ্রাবণ', 'ভাদ্র', 'আশ্বিন',
    'কার্তিক', 'অগ্রহায়ণ', 'পৌষ', 'মাঘ', 'ফাল্গুন', 'চৈত্র'
  ];

  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  const day = date.getDate();

  const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

  let banglaMonthIdx = 0;
  let banglaDay = 1;
  const banglaYear = month >= 3 && (month > 3 || day >= 14) ? year - 593 : year - 594;

  if (month === 3 && day >= 14) {
    banglaMonthIdx = 0;
    banglaDay = day - 13;
  } else if (month === 4) {
    if (day < 15) { banglaMonthIdx = 0; banglaDay = day + 17; }
    else { banglaMonthIdx = 1; banglaDay = day - 14; }
  } else if (month === 5) {
    if (day < 15) { banglaMonthIdx = 1; banglaDay = day + 17; }
    else { banglaMonthIdx = 2; banglaDay = day - 14; }
  } else if (month === 6) {
    if (day < 16) { banglaMonthIdx = 2; banglaDay = day + 16; }
    else { banglaMonthIdx = 3; banglaDay = day - 15; }
  } else if (month === 7) {
    if (day < 16) { banglaMonthIdx = 3; banglaDay = day + 16; }
    else { banglaMonthIdx = 4; banglaDay = day - 15; }
  } else if (month === 8) {
    if (day < 16) { banglaMonthIdx = 4; banglaDay = day + 16; }
    else { banglaMonthIdx = 5; banglaDay = day - 15; }
  } else if (month === 9) {
    if (day < 17) { banglaMonthIdx = 5; banglaDay = day + 15; }
    else { banglaMonthIdx = 6; banglaDay = day - 16; }
  } else if (month === 10) {
    if (day < 16) { banglaMonthIdx = 6; banglaDay = day + 15; }
    else { banglaMonthIdx = 7; banglaDay = day - 15; }
  } else if (month === 11) {
    if (day < 16) { banglaMonthIdx = 7; banglaDay = day + 15; }
    else { banglaMonthIdx = 8; banglaDay = day - 15; }
  } else if (month === 0) {
    if (day < 15) { banglaMonthIdx = 8; banglaDay = day + 16; }
    else { banglaMonthIdx = 9; banglaDay = day - 14; }
  } else if (month === 1) {
    if (day < 14) { banglaMonthIdx = 9; banglaDay = day + 17; }
    else { banglaMonthIdx = 10; banglaDay = day - 13; }
  } else if (month === 2) {
    const marchStartChoitra = isLeapYear ? 16 : 15;
    if (day < marchStartChoitra) {
      banglaMonthIdx = 10;
      banglaDay = day + 15 + (isLeapYear ? 1 : 0);
    } else {
      banglaMonthIdx = 11;
      banglaDay = day - (marchStartChoitra - 1);
    }
  } else if (month === 3 && day < 14) {
    banglaMonthIdx = 11;
    banglaDay = day + 17;
  }

  const monthName = months[banglaMonthIdx];
  const fullText = `${toBengaliNumerals(banglaDay)} ${monthName} ${toBengaliNumerals(banglaYear)} বঙ্গাব্দ`;

  return {
    day: banglaDay,
    monthBn: monthName,
    year: banglaYear,
    fullText
  };
}


export interface NextPrayerInfo {
  currentPrayer: string;
  currentPrayerBn: string;
  nextPrayer: string;
  nextPrayerBn: string;
  nextTimeStr: string;
  minutesRemaining: number;
  hoursRemaining: number;
  minsRemaining: number;
  progressPercent: number;
}

export function getNextPrayerInfo(date: Date, rawTimes: {
  fajrRaw: number;
  sunriseRaw: number;
  dhuhrRaw: number;
  asrRaw: number;
  maghribRaw: number;
  ishaRaw: number;
}): NextPrayerInfo {
  const currentHours = date.getHours() + date.getMinutes() / 60 + date.getSeconds() / 3600;

  const prayers = [
    { key: 'Fajr', bn: 'ফজর', time: rawTimes.fajrRaw },
    { key: 'Sunrise', bn: 'সূর্যোদয়', time: rawTimes.sunriseRaw },
    { key: 'Dhuhr', bn: 'যোহর', time: rawTimes.dhuhrRaw },
    { key: 'Asr', bn: 'আসর', time: rawTimes.asrRaw },
    { key: 'Maghrib', bn: 'মাগরিব', time: rawTimes.maghribRaw },
    { key: 'Isha', bn: 'এশা', time: rawTimes.ishaRaw },
  ];

  let current = prayers[prayers.length - 1];
  let next = prayers[0];

  for (let i = 0; i < prayers.length; i++) {
    if (currentHours < prayers[i].time) {
      next = prayers[i];
      current = i === 0 ? prayers[prayers.length - 1] : prayers[i - 1];
      break;
    }
  }

  let diffHours = next.time - currentHours;
  if (diffHours < 0) {
    diffHours += 24;
  }

  const totalMinutes = Math.max(0, Math.round(diffHours * 60));
  const hrs = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  // Calculate elapsed progress between current and next
  let duration = next.time - current.time;
  if (duration <= 0) duration += 24;
  let elapsed = currentHours - current.time;
  if (elapsed < 0) elapsed += 24;
  const progressPercent = Math.min(100, Math.max(0, (elapsed / duration) * 100));

  return {
    currentPrayer: current.key,
    currentPrayerBn: current.bn,
    nextPrayer: next.key,
    nextPrayerBn: next.bn,
    nextTimeStr: formatHours(next.time),
    minutesRemaining: totalMinutes,
    hoursRemaining: hrs,
    minsRemaining: mins,
    progressPercent: Math.round(progressPercent)
  };
}

// Re-export Lunar Phase Estimator & Islamic Moon Tracking Engine
export { estimateLunarPhase, ALL_LUNAR_PHASES } from './lunarCalculator';
export type { LunarPhaseInfo, MoonPhaseKey } from './lunarCalculator';
