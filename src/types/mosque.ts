export type Language = 'bn' | 'en' | 'ar';
export type FontSize = 'normal' | 'large' | 'xlarge';
export type ThemeMode = 'dark' | 'light' | 'emerald' | 'amber' | 'navy' | 'sepia';
export type FontFamily = 'siliguri' | 'noto' | 'jakarta' | 'amiri' | 'merriweather';

export interface UserPreferences {
  theme: ThemeMode;
  fontSize: FontSize;
  fontFamily: FontFamily;
  language: Language;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  city: string;
  customLat?: number;
  customLng?: number;
  notificationsEnabled: boolean;
  fajrHadithAlertEnabled: boolean;
  lastFajrNotifiedDate?: string;
  offlineReadingCacheReady?: boolean;
}


export interface PrayerTimeData {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  tahajjud: string;
  sehri: string;
  iftar: string;
  dateStr: string;
  hijriStr: string;
  jamatTimes: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    jummah: string;
  };
}

export interface JummahNotificationSettings {
  enabled: boolean;
  leadTimeMinutes: number; // e.g., 15, 30, 45, 60 minutes before Jummah Jamat/Athan
  soundType: 'gentle_chime' | 'adhan_melody' | 'soft_bell';
  customNote?: string;
}

export interface PrayerNotificationSettings {
  enabled: boolean;
  soundAlert: boolean;
  vibrationAlert: boolean;
  leadTimeMinutes: number; // 0 = exactly at prayer time, 5, 10, 15
  athanSoundType: 'gentle_chime' | 'adhan_melody' | 'soft_bell';
  prayers: {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
    tahajjud: boolean;
    sehri: boolean;
    iftar: boolean;
    jummah?: boolean;
  };
  jummahAlert?: JummahNotificationSettings;
}


export interface MosqueTransaction {
  id: number;
  type: 'in' | 'out' | 'xfer';
  date: string;
  cat: string;
  name: string;
  amt: number;
  acc: 'bank' | 'cash';
  note: string;
}

export interface MosqueMember {
  id: number;
  n: string;
  fatherName?: string;
  motherName?: string;
  address?: string;
  profession?: string;
  ph: string;
  amt: number;
  regDate?: string;
}

export interface MosquePledge {
  id: number;
  n: string;
  ad: string;
  ph: string;
  ty: 'cash' | 'dhan';
  q: number;
  u?: string; // 'মণ' or 'কেজি'
  pur: string;
  dt: string;
  note: string;
  got: number;
}

export interface MosquePaddySale {
  id: number;
  dt: string;
  kg: number;
  rate: number;
  total: number;
  buyer: string;
  tx: number;
}

export interface MosquePlanItem {
  id: number;
  n: string;
  q: number;
  r: number;
}

export interface MosqueDonationGoal {
  title: string;
  targetAmount: number;
  scope: 'total_income' | 'month_income' | 'development_cat';
  deadlineDate?: string;
  note?: string;
}

export interface MaktabStudent {
  id: number;
  name: string; // শিক্ষার্থীর নাম
  guardianName: string; // পিতা/অভিভাবক
  phone: string; // মোবাইল নম্বর
  roll: string; // রোল নম্বর
  classLevel: string; // শ্রেণি বা বিভাগ (কায়েদা, আমপারা, নাজেরা, হিফজ, কুরআন শিক্ষা)
  monthlyFee: number; // ধার্যকৃত মাসিক বেতন (টাকা)
  admissionDate: string; // ভর্তির তারিখ
  status: 'active' | 'inactive';
  note?: string;
}

export interface MaktabFeePayment {
  id: number;
  studentId: number;
  studentName: string;
  month: string; // e.g. "2026-10"
  amount: number; // পরিশোধিত টাকা
  waiverDiscount?: number; // মওকুফ বা ছাড়
  paidDate: string; // পরিশোধের তারিখ
  acc: 'cash' | 'bank'; // তহবিল (নগদ বা ব্যাংক)
  receiptNo?: string; // রশিদ বা মেমো নং
  collectedBy?: string; // আদায়কারী
  note?: string;
  txId?: number; // সংযুক্ত মসজিদ লেনদেন আইডি
}

export interface MosqueSettings {
  name: string;
  location: string;
  city: string;
  lat: number;
  lng: number;
  imamName: string;
  imamPhone: string;
  muazzinName: string;
  muazzinPhone: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  bankName: string;
  bankAccount: string;
  bankBranch: string;
  bankRouting: string;
  ob: number; // opening bank
  oc: number; // opening cash
  mem: number; // target donor count
  pin: string; // lock pin
  jamatTimes: {
    fajr: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
    jummah: string;
  };
  features: string[];
  donationGoal?: MosqueDonationGoal;
}

export type NoticePriority = 'urgent' | 'important' | 'normal';
export type NoticeCategory = 'event' | 'cleaning' | 'maintenance' | 'financial' | 'general';

export interface MosqueNotice {
  id: number;
  title: string;
  message: string;
  priority: NoticePriority;
  category: NoticeCategory;
  date: string;
  postedBy: string;
  isPinned: boolean;
  eventDate?: string;
}

export interface CalendarCustomNote {
  id: string;
  dateStr: string; // Format: "YYYY-MM-DD"
  title: string;
  category: 'event' | 'reminder' | 'milad' | 'donation' | 'meeting' | 'general';
  time?: string;
  note?: string;
  addedBy?: string;
}

export interface IslamicEventInfo {
  nameBn: string;
  nameEn: string;
  nameAr?: string;
  hijriDay: number;
  hijriMonth: number; // 1 to 12
  isFastingSunnah?: boolean;
  significanceBn: string;
  badgeColor?: string;
}

export type SalahPunctualityStatus = 'on_time' | 'late' | 'missed';

export interface DailyPrayerLog {
  fajr?: SalahPunctualityStatus;
  dhuhr?: SalahPunctualityStatus;
  asr?: SalahPunctualityStatus;
  maghrib?: SalahPunctualityStatus;
  isha?: SalahPunctualityStatus;
}

export interface AppStateData {
  name: string;
  ob: number;
  oc: number;
  mem: number;
  pin: string;
  tx: MosqueTransaction[];
  ppl: MosqueMember[];
  plan: MosquePlanItem[];
  pl: MosquePledge[];
  ds: MosquePaddySale[];
  settings: MosqueSettings;
  zikrCounts: Record<string, number>;
  dailyAmal: Record<string, boolean>; // e.g. "2026-10-24_fajr": true
  lastAmalDate: string;
  syncKey: string;
  notices?: MosqueNotice[];
  maktabStudents?: MaktabStudent[];
  maktabPayments?: MaktabFeePayment[];
  calendarNotes?: CalendarCustomNote[];
  prayerLogs?: Record<string, DailyPrayerLog>;
}


export interface SurahItem {
  id: number;
  nameAr: string;
  nameBn: string;
  nameEn: string;
  meaning: string;
  versesCount: number;
  revelation: 'মক্কী' | 'মাদানী';
  verses: {
    id: number;
    ar: string;
    pronounce: string;
    bn: string;
    en: string;
  }[];
}

export interface DuaItem {
  id: number;
  category: string;
  titleBn: string;
  titleEn?: string;
  somoy?: string;
  ar: string;
  pronounce: string;
  bn: string;
  en?: string;
  ref?: string;
}


export interface HadithItem {
  id: number;
  ar?: string;
  bn: string;
  en: string;
  narrator: string;
  source: string;
  topic: string;
}

export interface SahihHadithItem {
  id: string;
  bookId: 'bukhari' | 'muslim' | 'abudawood' | 'tirmidhi' | 'nasai' | 'ibnmajah';
  bookNameBn: string;
  bookNameAr: string;
  hadithNumber: number;
  chapterBn: string;
  chapterAr: string;
  narratorBn: string;
  narratorAr: string;
  arabicSanad?: string;
  arabicMatn: string;
  arabicShanNuzul: string; // سبب ورود الحديث بالعربية (আরবি শানে ওরূদ/নুযুল)
  banglaMeaning: string;
  banglaShanNuzul: string; // শানে ওরূদ / প্রেক্ষাপটের বাংলা বিবরণ
  lessons: string[];
  grade: 'সহীহ' | 'হাসান';
  topic: string;
}

export interface HadithBookInfo {
  id: 'bukhari' | 'muslim' | 'abudawood' | 'tirmidhi' | 'nasai' | 'ibnmajah';
  nameBn: string;
  nameAr: string;
  authorBn: string;
  authorAr: string;
  totalHadith: string;
  chaptersCount: string;
  deathYearHijri: string;
  significanceBn: string;
  methodologyBn?: string;
  accentColor: string;
}

