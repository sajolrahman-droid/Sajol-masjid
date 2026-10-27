import { Language } from '../types/mosque';

export interface TranslationDictionary {
  appName: string;
  subTitle: string;
  donate: string;
  searchPlaceholder: string;
  tabs: {
    prayers: string;
    qibla: string;
    map: string;
    zikr: string;
    reading: string;
    hadith: string;
    amal: string;
    accounts: string;
  };
  prayerNames: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    tahajjud: string;
    sehri: string;
    iftar: string;
    jummah: string;
  };
  elderlyMode: string;
  fontSize: string;
  normal: string;
  large: string;
  xlarge: string;
  theme: string;
  offlineReady: string;
  copied: string;
  nextPrayer: string;
  timeRemaining: string;
  jamatTime: string;
  developedBy: string;
}

export const TRANSLATIONS: Record<Language, TranslationDictionary> = {
  bn: {
    appName: 'মসজিদ সঙ্গী ও ডিজিটাল হিসাবঘর',
    subTitle: 'নামাজ, কিবলা, আমল, দান ও মসজিদের পূর্ণাঙ্গ হিসাব',
    donate: 'দান করুন',
    searchPlaceholder: 'সূরা, দোআ, হাদিস বা লেনদেন খুঁজুন...',
    tabs: {
      prayers: 'নামাজের সময়',
      qibla: 'কিবলা কম্পাস',
      map: 'মসজিদ ম্যাপ',
      zikr: 'জিকির কাউন্টার',
      reading: 'অফলাইন কুরআন ও দোআ',
      hadith: 'সহীহ হাদিস ও শানে নুযুল',
      amal: 'দৈনিক আমল ও রুটিন',
      accounts: 'মসজিদ হিসাবঘর'
    },
    prayerNames: {
      fajr: 'ফজর',
      sunrise: 'সূর্যোদয়',
      dhuhr: 'যোহর',
      asr: 'আসর',
      maghrib: 'মাগরিব',
      isha: 'এশা',
      tahajjud: 'তাহাজ্জুদ',
      sehri: 'সাহরি শেষ',
      iftar: 'ইফতার',
      jummah: 'জুমুআ'
    },
    elderlyMode: 'বয়স্কদের পাঠ সুবিধা (বড় ফন্ট)',
    fontSize: 'ফন্ট সাইজ',
    normal: 'স্বাভাবিক',
    large: 'বড় (পড়ার উপযোগী)',
    xlarge: 'খুব বড় (সহজ পাঠ্য)',
    theme: 'থিম পরিবর্তন',
    offlineReady: 'সম্পূর্ণ অফলাইন প্রস্তুত',
    copied: 'কপি করা হয়েছে',
    nextPrayer: 'পরবর্তী ওয়াক্ত',
    timeRemaining: 'বাকি সময়',
    jamatTime: 'জামাত শুরু',
    developedBy: 'অ্যাপ নির্মাতা'
  },
  en: {
    appName: 'Mosque Companion & Accounts',
    subTitle: 'Prayer Times, Qibla, Deeds, Donations & Mosque Ledger',
    donate: 'Donate',
    searchPlaceholder: 'Search Surah, Dua, Hadith or Ledger...',
    tabs: {
      prayers: 'Prayer Times',
      qibla: 'Qibla Compass',
      map: 'Mosque Map',
      zikr: 'Tasbih / Zikr',
      reading: 'Quran & Duas',
      hadith: 'Sahih Hadith & Context',
      amal: 'Daily Deeds',
      accounts: 'Accounts & Funds'
    },
    prayerNames: {
      fajr: 'Fajr',
      sunrise: 'Sunrise',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha',
      tahajjud: 'Tahajjud',
      sehri: 'Suhoor Ends',
      iftar: 'Iftar',
      jummah: 'Jummah'
    },
    elderlyMode: 'Senior Reading Mode (Large Font)',
    fontSize: 'Font Size',
    normal: 'Normal',
    large: 'Large (Senior friendly)',
    xlarge: 'Extra Large',
    theme: 'Theme Mode',
    offlineReady: '100% Offline Ready',
    copied: 'Copied to clipboard',
    nextPrayer: 'Next Prayer',
    timeRemaining: 'Time Remaining',
    jamatTime: 'Jamat Time',
    developedBy: 'Developed by'
  },
  ar: {
    appName: 'رفيق المسجد وسجل الحسابات',
    subTitle: 'مواقيت الصلاة، القبلة، الأذكار، التبرع وسجل المسجد',
    donate: 'تبرع للمسجد',
    searchPlaceholder: 'ابحث عن سورة، دعاء، حديث أو معاملة...',
    tabs: {
      prayers: 'مواقيت الصلاة',
      qibla: 'بوصلة القبلة',
      map: 'موقع المسجد',
      zikr: 'عداد التسبيح',
      reading: 'القرآن والأدعية',
      hadith: 'الحديث وأسباب الورود',
      amal: 'الأعمال اليومية',
      accounts: 'حسابات المسجد'
    },
    prayerNames: {
      fajr: 'الفجر',
      sunrise: 'الشروق',
      dhuhr: 'الظهر',
      asr: 'العصر',
      maghrib: 'المغرب',
      isha: 'العشاء',
      tahajjud: 'التهجد',
      sehri: 'الإمساك',
      iftar: 'الإفطار',
      jummah: 'الجمعة'
    },
    elderlyMode: 'وضع كبار السن (خط كبير)',
    fontSize: 'حجم الخط',
    normal: 'عادي',
    large: 'كبير',
    xlarge: 'كبير جداً',
    theme: 'السمة',
    offlineReady: 'يعمل دون إنترنت',
    copied: 'تم النسخ',
    nextPrayer: 'الصلاة القادمة',
    timeRemaining: 'الوقت المتبقي',
    jamatTime: 'وقت الجماعة',
    developedBy: 'تطوير التطبيق'
  }
};
