import { getApproxHijriDate } from './prayerCalculator';
import { IslamicEventInfo } from '../types/mosque';

export interface CalendarIslamicEventItem {
  dateStr: string; // "YYYY-MM-DD"
  gregorianDay: number;
  hijriDay: number;
  hijriMonthBn: string;
  hijriYear: number;
  event: IslamicEventInfo;
}

// Fixed Islamic Calendar Observances (Month: 1=Muharram ... 12=Dhul Hijjah)
export const MAJOR_ISLAMIC_EVENTS: IslamicEventInfo[] = [
  // 1: Muharram
  {
    hijriMonth: 1,
    hijriDay: 1,
    nameBn: 'পবিত্র হিজরি নববর্ষ (১লা মুহাররম)',
    nameEn: 'Islamic New Year',
    nameAr: 'رأس السنة الهجرية',
    significanceBn: 'ইসলামী হিজরি সন গণনা শুরু হয়েছিল হযরত উমর (রা.)-এর আমলে রাসুলুল্লাহ (সা.)-এর ঐতিহাসিক মদিনা হিজরতের বছর থেকে।',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
  },
  {
    hijriMonth: 1,
    hijriDay: 9,
    nameBn: 'তাসুআ (মুহাররমের ৯ তারিখ)',
    nameEn: 'Tasu\'a Fast',
    nameAr: 'تاسوعاء',
    isFastingSunnah: true,
    significanceBn: 'আশুরার রোজার সাথে মিলিয়ে ৯ ও ১০ মুহাররম রোজা রাখা মোস্তাহাব সুন্নাত।',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300'
  },
  {
    hijriMonth: 1,
    hijriDay: 10,
    nameBn: 'পবিত্র আশুরা (১০ই মুহাররম)',
    nameEn: 'Day of Ashura',
    nameAr: 'يوم عاشوراء',
    isFastingSunnah: true,
    significanceBn: 'হযরত মূসা (আ.)-এর ফেরাউনের কবল থেকে মুক্তি এবং কারবালা প্রান্তরে হযরত হুসাইন (রা.)-এর ঐতিহাসিক শাহাদাতের মহিমান্বিত দিন। এদিন রোজা রাখা অতীতের এক বছরের গুনাহ মোচনের কারণ।',
    badgeColor: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300'
  },
  // 2: Safar
  {
    hijriMonth: 2,
    hijriDay: 28,
    nameBn: 'আখেরী চাহার শোম্বা',
    nameEn: 'Akhiri Chahar Shamba',
    nameAr: 'آخر أربعاء من صفر',
    significanceBn: 'সফর মাসের শেষ বুধবার, রাসুলুল্লাহ (সা.) সাময়িক রোগমুক্তি পেয়ে শেষবারের মতো গোসল ও জামাতে উপস্থিত হয়েছিলেন।',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
  },
  // 3: Rabi al-Awwal
  {
    hijriMonth: 3,
    hijriDay: 12,
    nameBn: 'পবিত্র ঈদে মিলাদুন্নবী (সা.)',
    nameEn: 'Mawlid al-Nabi (PBUH)',
    nameAr: 'المولد النبوي الشريف',
    significanceBn: 'মানবজাতির রহমত স্বরূপ বিশ্বনবী হযরত মুহাম্মদ মুস্তফা (সা.)-এর ধরাধামে শুভাগমনের পবিত্র দিবস। সীরাতুন্নবী চর্চা ও দরূদ পাঠের বিশেষ দিন।',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
  },
  // 4: Rabi al-Thani
  {
    hijriMonth: 4,
    hijriDay: 11,
    nameBn: 'ফাতেহা-ই-ইয়াজদাহম',
    nameEn: 'Fateha-i-Yajdaham',
    significanceBn: 'বড়পীর হযরত আব্দুল কাদির জিলানী (রহ.)-এর ওফাত দিবস উপলক্ষে স্মারক দোআ ও আলোচনা।',
    badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border-slate-300'
  },
  // 7: Rajab
  {
    hijriMonth: 7,
    hijriDay: 27,
    nameBn: 'পবিত্র শবে মেরাজ (লাইলাতুল মেরাজ)',
    nameEn: 'Lailat al-Mi\'raj',
    nameAr: 'الإسراء والمعراج',
    significanceBn: 'রাসুলুল্লাহ (সা.)-এর উর্ধ্বাকাশ ভ্রমণ ও মহান রবের সান্নিধ্য লাভ এবং পাঁচ ওয়াক্ত নামাজের তোহফা প্রাপ্তির অবিস্মরণীয় অলৌকিক রজনী।',
    badgeColor: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300'
  },
  // 8: Sha'ban
  {
    hijriMonth: 8,
    hijriDay: 15,
    nameBn: 'পবিত্র শবে বরাত (লাইলাতুল বারাআত)',
    nameEn: 'Lailat al-Bara\'at (Mid-Sha\'ban)',
    nameAr: 'ليلة النصف من شعبان',
    isFastingSunnah: true,
    significanceBn: 'পাপমুক্তির মহিমান্বিত রজনী। বান্দার প্রতি আল্লাহর বিশেষ রহমত ও মাগফিরাত বর্ষণ এবং পরবর্তী দিনের নফল রোজা অত্যন্ত বরকতময়।',
    badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-300'
  },
  // 9: Ramadan
  {
    hijriMonth: 9,
    hijriDay: 1,
    nameBn: 'পবিত্র মাহে রমজান শুরু (১ম রোজা)',
    nameEn: 'First Day of Ramadan',
    nameAr: 'أول أيام رمضان المبارك',
    isFastingSunnah: false,
    significanceBn: 'রহমত, মাগফিরাত ও নাজাতের মাস শুরু। ফরজ সিয়াম ও তারাবীর বরকতময় সূচনা।',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300'
  },
  {
    hijriMonth: 9,
    hijriDay: 17,
    nameBn: 'ঐতিহাসিক বদর দিবস (১৭ই রমজান)',
    nameEn: 'Day of Badr',
    nameAr: 'غزوة بدر الكبرى',
    significanceBn: 'দ্বিতীয় হিজরির ১৭ রমজান সত্য ও মিথ্যার পার্থক্যকারী ঐতিহাসিক বদর যুদ্ধে মুসলমানদের চূড়ান্ত বিজয় অর্জিত হয়েছিল।',
    badgeColor: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 border-teal-300'
  },
  {
    hijriMonth: 9,
    hijriDay: 20,
    nameBn: 'শেষ দশকের এতেকাফ সূচনা',
    nameEn: 'Start of Itikaf',
    nameAr: 'بداية الاعتكاف',
    significanceBn: 'রমজানের শেষ দশকে মসজিদে এতেকাফ করা সুন্নাতে মুয়াক্কাদা কিফায়াহ।',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300'
  },
  {
    hijriMonth: 9,
    hijriDay: 27,
    nameBn: 'পবিত্র শবে কদর (লাইলাতুল কদর)',
    nameEn: 'Laylat al-Qadr',
    nameAr: 'ليلة القدر المباركة',
    significanceBn: 'হাজার মাসের চেয়েও শ্রেষ্ঠ মহা বরকতময় রজনী। এ রাতে পবিত্র কুরআন অবতীর্ণ হয়েছিল। রাত জেগে নফল নামাজ, কুরআন তেলাওয়াত ও দোআ সুন্নাত।',
    badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-400'
  },
  // 10: Shawwal
  {
    hijriMonth: 10,
    hijriDay: 1,
    nameBn: 'পবিত্র ঈদুল ফিতর',
    nameEn: 'Eid al-Fitr',
    nameAr: 'عيد الفطر المبارك',
    significanceBn: 'এক মাস সিয়াম সাধনা শেষে বিশ্ব মুসলিমের প্রধান ধর্মীয় উৎসব ও আনন্দোৎসব। সদকাতুল ফিতর আদায় ও ঈদের নামাজ ওয়াজিব।',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-400 font-bold'
  },
  {
    hijriMonth: 10,
    hijriDay: 2,
    nameBn: 'শাওয়ালের ৬ রোজার সূচনা',
    nameEn: 'Six Fasts of Shawwal',
    isFastingSunnah: true,
    significanceBn: 'রমজানের পর শাওয়াল মাসে ৬টি রোজা রাখা সারা বছর রোজা রাখার সমান সওয়াব বয়ে আনে (সহীহ মুসলিম)।',
    badgeColor: 'bg-teal-50 text-teal-800 dark:bg-teal-950/60 dark:text-teal-300 border-teal-200'
  },
  // 12: Dhul Hijjah
  {
    hijriMonth: 12,
    hijriDay: 1,
    nameBn: 'জিলহজ্জের প্রথম দশক সূচনা',
    nameEn: 'First 10 Days of Dhul Hijjah',
    nameAr: 'عشر ذي الحجة',
    isFastingSunnah: true,
    significanceBn: 'বছরের শ্রেষ্ঠ দশ দিন। এ দিনগুলোতে নেক আমল আল্লাহর নিকট সর্বাধিক প্রিয়। ১-৯ জিলহজ্জ নফল রোজা ও তাকবীরে তাশরিক পাঠ অতীব সওয়াবের।',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
  },
  {
    hijriMonth: 12,
    hijriDay: 8,
    nameBn: 'ইয়াওমুত তারবিয়া (হজের সূচনা)',
    nameEn: 'Day of Tarwiyah',
    significanceBn: 'হাজীদের ইহরাম বেঁধে মিনায় গমনের মাধ্যমে মূল হজের আনুষ্ঠানিকতা শুরু।',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300'
  },
  {
    hijriMonth: 12,
    hijriDay: 9,
    nameBn: 'পবিত্র আরাফাত দিবস ও আরাফার রোজা',
    nameEn: 'Day of Arafah & Fasting',
    nameAr: 'يوم عرفة المبارك',
    isFastingSunnah: true,
    significanceBn: 'হজের প্রধান দিন এবং অ-হাজীদের জন্য আরাফার রোজা রাখা বিগত এক বছর ও আগামী এক বছরের গুনাহ মোচনের কারণ (সহীহ মুসলিম)।',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-400'
  },
  {
    hijriMonth: 12,
    hijriDay: 10,
    nameBn: 'পবিত্র ঈদুল আযহা (কুরবানি)',
    nameEn: 'Eid al-Adha',
    nameAr: 'عيد الأضحى المبارك',
    significanceBn: 'হযরত ইব্রাহীম (আ.) ও ইসমাঈল (আ.)-এর মহান আত্মত্যাগের স্মরণে পশু কুরবানি ও ঈদের জামাত।',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-400 font-bold'
  },
  {
    hijriMonth: 12,
    hijriDay: 11,
    nameBn: 'আইয়ামে তাশরিক (১ম দিন)',
    nameEn: 'Days of Tashreeq',
    significanceBn: 'প্রতি ফরজ নামাজের পর তাকবীরে তাশরিক পাঠ ওয়াজিব। এ দিনগুলোতে রোজা রাখা হারাম।',
    badgeColor: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200'
  }
];

// Helper: Convert Date to "YYYY-MM-DD"
export function formatDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Get all Islamic events and Sunnah fast reminders for a specific date
 */
export function getIslamicEventsForDate(date: Date): IslamicEventInfo[] {
  const hijri = getApproxHijriDate(date);
  const events: IslamicEventInfo[] = [];

  // 1. Check fixed calendar events
  const matchingEvents = MAJOR_ISLAMIC_EVENTS.filter(
    (e) => e.hijriMonth === (getHijriMonthIndex(hijri.monthBn) + 1) && e.hijriDay === hijri.day
  );
  events.push(...matchingEvents);

  // 2. Check Ayyam al-Bidh (13th, 14th, 15th of every lunar month)
  // (Exclude Shawwal 1 and Dhul Hijjah 10-13 when fasting is prohibited)
  const hMonth = getHijriMonthIndex(hijri.monthBn) + 1;
  const isAyyamBidh = (hijri.day === 13 || hijri.day === 14 || hijri.day === 15);
  const isTashreeqOrEid = (hMonth === 10 && hijri.day === 1) || (hMonth === 12 && hijri.day >= 10 && hijri.day <= 13);

  if (isAyyamBidh && !isTashreeqOrEid && matchingEvents.length === 0) {
    events.push({
      hijriMonth: hMonth,
      hijriDay: hijri.day,
      nameBn: `আইয়ামে বীজ-এর সুন্নত রোজা (${hijri.day}ই ${hijri.monthBn})`,
      nameEn: `Ayyam al-Bidh Sunnah Fast (Day ${hijri.day})`,
      nameAr: 'صيام الأيام البيض',
      isFastingSunnah: true,
      significanceBn: 'প্রতি চন্দ্রমাসের ১৩, ১৪ ও ১৫ তারিখ রোজা রাখা সুন্নাত। রাসুলুল্লাহ (সা.) সফরে বা ঘরে থাকাকালে কখনোই এ রোজা ছাড়তেন না।',
      badgeColor: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200'
    });
  }

  // 3. Check Friday (Jummah Mubarak)
  if (date.getDay() === 5 && matchingEvents.length === 0) {
    // If during Ramadan, check if it's Jumatul Wida (last Friday)
    if (hMonth === 9 && hijri.day >= 22) {
      events.push({
        hijriMonth: 9,
        hijriDay: hijri.day,
        nameBn: 'পবিত্র জুমাতুল বিদা (রমজানের শেষ জুমা)',
        nameEn: 'Jumu\'atul Wida',
        nameAr: 'جمعة الوداع',
        significanceBn: 'পবিত্র রমজানুল মোবারকের শেষ জুমা। মসজিদে বিশেষ আলোচনা, তাওবা-ইস্তেগফার ও মোনাজাত।',
        badgeColor: 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border-amber-300'
      });
    }
  }

  return events;
}

// Convert Bengali month name to 0-indexed month (0 = Muharram)
function getHijriMonthIndex(monthBn: string): number {
  const hijriMonthsBn = [
    'মুহাররম', 'সফর', 'রবিউল আউয়াল', 'রবিউস সানি',
    'জমাদিউল আউয়াল', 'জমাদিউস সানি', 'রজব', 'শাবান',
    'রমজান', 'শাওয়াল', 'জিলকদ', 'জিলহজ্জ'
  ];
  const idx = hijriMonthsBn.indexOf(monthBn);
  return idx !== -1 ? idx : 0;
}

/**
 * Returns all dates in a calendar month with their day data, prayer times and Islamic events
 */
export function getMonthDaysData(year: number, monthIndex: number) {
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, monthIndex, 1).getDay(); // 0 = Sun, 5 = Fri
  const days: {
    date: Date;
    dateStr: string;
    dayNumber: number;
    dayOfWeek: number;
    isFriday: boolean;
    isToday: boolean;
    hijri: { day: number; monthBn: string; monthAr: string; year: number };
    events: IslamicEventInfo[];
  }[] = [];

  const todayStr = formatDateKey(new Date());

  for (let d = 1; d <= daysInMonth; d++) {
    const curDate = new Date(year, monthIndex, d);
    const dateStr = formatDateKey(curDate);
    const hijri = getApproxHijriDate(curDate);
    const events = getIslamicEventsForDate(curDate);

    days.push({
      date: curDate,
      dateStr,
      dayNumber: d,
      dayOfWeek: curDate.getDay(),
      isFriday: curDate.getDay() === 5,
      isToday: dateStr === todayStr,
      hijri,
      events
    });
  }

  return {
    year,
    monthIndex,
    daysInMonth,
    firstDayOfWeek,
    days
  };
}
