/**
 * Daily Islamic Quotes & Hadith Engine
 * Provides post-Fajr daily morning notification and inspiration
 */

export interface DailyHadith {
  id: number;
  arabic: string;
  bangla: string;
  english: string;
  narrator: string;
  source: string;
  grade: string;
  morningReflection: string;
  topic: string;
}

export const DAILY_HADITHS: DailyHadith[] = [
  {
    id: 1,
    arabic: 'مَنْ صَلَّى الْبَرْدَيْنِ دَخَلَ الْجَنَّةَ',
    bangla: 'যে ব্যক্তি দুই শীতল সময়ের নামাজ (ফজর ও আসর) নিয়মিত আদায় করবে, সে জান্নাতে প্রবেশ করবে।',
    english: 'Whoever prays the two cool prayers (Fajr and Asr) will enter Paradise.',
    narrator: 'হযরত আবু মূসা আল-আশআরী (রা.)',
    source: 'সহীহ বুখারী: ৫৭৪, সহীহ মুসলিম: ৬৩৫',
    grade: 'সহীহ',
    morningReflection: 'ভোরের নির্মল সময়ে ফজরের জামাতে উপস্থিত হয়ে দিনটি বরকতময়ভাবে শুরু করার অঙ্গীকার গ্রহণ করুন।',
    topic: 'ফজরের মর্যাদা'
  },
  {
    id: 2,
    arabic: 'اللَّهُمَّ بَارِكْ لأُمَّتِي فِي بُكُورِهَا',
    bangla: 'হে আল্লাহ! আপনি আমার উম্মতকে তার ভোরের কাজে বরকত দান করুন।',
    english: 'O Allah, bless my ummah in their early mornings.',
    narrator: 'হযরত সাখর আল-গামিদী (রা.)',
    source: 'সুনানে আবু দাউদ: ২৬০৬, সুনানে তিরমিযী: ১২১২',
    grade: 'সহীহ',
    morningReflection: 'ভোরবেলায় ঘুম থেকে উঠে হালাল রিজিক অন্বেষণ ও সৎ কর্ম সম্পাদনে বরকত লুকায়িত থাকে।',
    topic: 'ভোরের বরকত'
  },
  {
    id: 3,
    arabic: 'مَنْ صَلَّى صَلاَةَ الصُّبْحِ فَهْوَ فِي ذِمَّةِ اللَّهِ',
    bangla: 'যে ব্যক্তি ফজরের নামাজ আদায় করল, সে সারাদিন আল্লাহর বিশেষ নিরাপত্তা ও আশ্রয়ে চলে গেল।',
    english: 'Whoever prays the morning prayer is in the protection of Allah.',
    narrator: 'হযরত জুনদুব ইবনে আব্দুল্লাহ (রা.)',
    source: 'সহীহ মুসলিম: ৬৫৭',
    grade: 'সহীহ',
    morningReflection: 'সারা দিনের যাবতীয় অনিষ্ট, বিপদ-আপদ ও দুশ্চিন্তা থেকে সুরক্ষার সর্বোত্তম উপায় হলো ফজরের নামাজ।',
    topic: 'আল্লাহর সুরক্ষা'
  },
  {
    id: 4,
    arabic: 'رَكْعَتَا الْفَجْرِ خَيْرٌ مِنَ الدُّنْيَا وَمَا فِيهَا',
    bangla: 'ফজরের দুই রাকাত সুন্নত দুনিয়া ও তার মধ্যে যা কিছু আছে তার চেয়েও উত্তম।',
    english: 'The two rak’ahs before the dawn prayer are better than this world and everything in it.',
    narrator: 'উম্মুল মুমিনীন হযরত আয়েশা (রা.)',
    source: 'সহীহ মুসলিম: ৭২৫',
    grade: 'সহীহ',
    morningReflection: 'দুনিয়ার সকল সম্পদ ক্ষণস্থায়ী, কিন্তু ফজরের দুই রাকাত সুন্নতের সওয়াব চিরস্থায়ী।',
    topic: 'ফজরের সুন্নত'
  },
  {
    id: 5,
    arabic: 'أَفْضَلُ الْجِهَادِ كَلِمَةُ عَدْلٍ عِنْدَ سُلْطَانٍ جَائِرٍ',
    bangla: 'অত্যাচারী শাসকের সামনে সত্য ও ন্যায়ের কথা বলাই সর্বোত্তম জিহাদ।',
    english: 'The most excellent Jihad is that of the word of truth in the presence of a tyrannical ruler.',
    narrator: 'হযরত আবু সাঈদ আল-খুদরী (রা.)',
    source: 'সুনানে আবু দাউদ: ৪৩৪৪',
    grade: 'সহীহ',
    morningReflection: 'সততা ও ন্যায়ের পথে অবিচল থাকার সৎ সাহসই একজন প্রকৃত মুমিনের অলংকার।',
    topic: 'ন্যায়পরায়ণতা'
  },
  {
    id: 6,
    arabic: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى',
    bangla: 'নিশ্চয়ই সকল কাজের ফলাফল নিয়তের উপর নির্ভরশীল এবং প্রত্যেক ব্যক্তি তার নিয়ত অনুযায়ী প্রতিদান পাবে।',
    english: 'Actions are according to intentions, and everyone will get what was intended.',
    narrator: 'হযরত উমর ইবনুল খাত্তাব (রা.)',
    source: 'সহীহ বুখারী: ১, সহীহ মুসলিম: ১৯০৭',
    grade: 'মুত্তাফাকুন আলাইহ',
    morningReflection: 'আজকের দিনের প্রতিটি কর্ম কেবল আল্লাহর সন্তুষ্টির উদ্দেশ্যে করার জন্য আন্তরিক নিয়ত বিশুদ্ধ করুন।',
    topic: 'বিশুদ্ধ নিয়ত'
  },
  {
    id: 7,
    arabic: 'الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ',
    bangla: 'প্রকৃত মুসলিম তো সেই ব্যক্তি, যার জবান ও হাতের অনিষ্ট থেকে অন্য সকল মুসলিম নিরাপদ থাকে।',
    english: 'A true Muslim is the one from whose tongue and hands the Muslims are safe.',
    narrator: 'হযরত আব্দুল্লাহ ইবনে আমর (রা.)',
    source: 'সহীহ বুখারী: ১০, সহীহ মুসলিম: ৪০',
    grade: 'সহীহ',
    morningReflection: 'নিজের কথার মাধ্যমে বা আচরণের দ্বারা কারও মনে কষ্ট না দেওয়ার দৃঢ় সংকল্প গ্রহণ করুন।',
    topic: 'সদ্ব্যবহার'
  },
  {
    id: 8,
    arabic: 'تَبَسُّمُكَ فِي وَجْهِ أَخِيكَ لَكَ صَدَقَةٌ',
    bangla: 'তোমার ভাইয়ের মুখে তাকিয়ে তোমার মৃদু হাসিও একটি সদকা (উত্তম প্রতিদানযোগ্য দান)।',
    english: 'Your smiling in the face of your brother is charity for you.',
    narrator: 'হযরত আবু যর (রা.)',
    source: 'সুনানে তিরমিযী: ১৯৫৬',
    grade: 'সহীহ',
    morningReflection: 'আজ পরিবার, প্রতিবেশী ও মসজিদে সবার সাথে প্রফুল্ল মুখে ও হাসিমুখে কথা বলুন।',
    topic: 'হাসিমুখ ও সদাচার'
  }
];

/**
 * Returns today's deterministic Hadith based on date
 */
export function getDailyHadith(date: Date = new Date()): DailyHadith {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);
  const index = Math.abs(dayOfYear) % DAILY_HADITHS.length;
  return DAILY_HADITHS[index];
}

/**
 * Checks if current time is within the post-Fajr window (Fajr time up to +2.5 hours)
 * and whether notification hasn't been fired today.
 */
export function shouldTriggerPostFajrHadith(
  fajrTimeStr: string, // e.g. "04:55 AM" or "05:15"
  lastNotifiedDate?: string,
  now: Date = new Date()
): boolean {
  const todayStr = now.toISOString().split('T')[0];
  if (lastNotifiedDate === todayStr) {
    return false; // Already notified today
  }

  if (!fajrTimeStr) return false;

  // Parse fajr time
  const parts = fajrTimeStr.trim().split(/[:\s]/);
  if (parts.length < 2) return false;

  let fajrHours = parseInt(parts[0], 10);
  const fajrMinutes = parseInt(parts[1], 10);
  const isPM = fajrTimeStr.toLowerCase().includes('pm');
  const isAM = fajrTimeStr.toLowerCase().includes('am');

  if (isPM && fajrHours < 12) fajrHours += 12;
  if (isAM && fajrHours === 12) fajrHours = 0;

  const fajrDate = new Date(now);
  fajrDate.setHours(fajrHours, fajrMinutes, 0, 0);

  // Time difference in minutes
  const diffMinutes = (now.getTime() - fajrDate.getTime()) / (1000 * 60);

  // Window: from Fajr azan time until 180 minutes (3 hours) after Fajr
  return diffMinutes >= 0 && diffMinutes <= 180;
}

/**
 * Trigger system notification if permitted
 */
export async function sendHadithNotification(hadith: DailyHadith): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  try {
    if (Notification.permission === 'default') {
      const perm = await Notification.requestPermission();
      if (perm !== 'granted') return false;
    }

    if (Notification.permission === 'granted') {
      new Notification('🕌 ফজরের হাদিস ও আজকের আত্মশুদ্ধি', {
        body: `${hadith.bangla} — ${hadith.source}`,
        icon: '/pwa-192x192.png',
        badge: '/icon.svg',
        tag: 'fajr-daily-hadith',
      });
      return true;
    }
  } catch (err) {
    console.error('Notification trigger error:', err);
  }
  return false;
}
