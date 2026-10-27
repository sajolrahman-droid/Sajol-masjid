import { AppStateData, MosqueSettings, MaktabStudent, MaktabFeePayment, UserPreferences, ThemeMode, FontSize, FontFamily } from '../types/mosque';

export type { UserPreferences };

const STORAGE_KEY = 'mosqueHisab1'; // Preserve existing key from attached file
const PREFERENCES_KEY = 'mosquePreferences';


export const DEFAULT_SETTINGS: MosqueSettings = {
  name: 'বাইতুল আমান জামে মসজিদ',
  location: 'মিরপুর-১০, ঢাকা-১২১৬',
  city: 'ঢাকা',
  lat: 23.8071,
  lng: 90.3686,
  imamName: 'মাওলানা মোহাম্মাদ আব্দুল্লাহ',
  imamPhone: '01711000000',
  muazzinName: 'হাফেজ মো. ইব্রাহীম',
  muazzinPhone: '01811000000',
  bkashNumber: '01914393139 (ব্যক্তিগত)',
  nagadNumber: '01914393139 (মার্চেন্ট)',
  rocketNumber: '019143931397',
  bankName: 'ইসলামী ব্যাংক বাংলাদেশ পিএলসি',
  bankAccount: '2050123456789012',
  bankBranch: 'মিরপুর শাখা',
  bankRouting: '125272834',
  ob: 50000,
  oc: 15200,
  mem: 25,
  pin: '',
  jamatTimes: {
    fajr: '05:15 AM',
    dhuhr: '01:30 PM',
    asr: '04:45 PM',
    maghrib: '05:40 PM',
    isha: '07:30 PM',
    jummah: '01:30 PM'
  },
  features: [
    'মহিলাদের পৃথক নামাজের ব্যবস্থা',
    'উন্নত ওযুখানা ও আধুনিক ওয়াশরুম',
    'শীতাতপ নিয়ন্ত্রিত (AC)',
    'গাড়ি ও মোটরসাইকেল পার্কিং',
    'ইসলামিক পাঠাগার',
    'হুইলচেয়ার র‍্যাম্প ও সুলভ প্রবেশাধিকার'
  ]
};

export const INITIAL_STATE: AppStateData = {
  name: 'বাইতুল আমান জামে মসজিদ',
  ob: 50000,
  oc: 15200,
  mem: 25,
  pin: '',
  tx: [
    // May 2026
    { id: 1715001000000, type: 'in', date: '2026-05-08', cat: 'জুমার দান', name: 'জুমার জামাত দানবাক্স', amt: 22000, acc: 'cash', note: 'জুমার দান' },
    { id: 1715002000000, type: 'in', date: '2026-05-15', cat: 'সদস্যদের দান/চাঁদা', name: 'মাসিক সদস্য চাঁদা', amt: 28500, acc: 'bank', note: 'সদস্যদের মাসিক চাঁদা' },
    { id: 1715003000000, type: 'out', date: '2026-05-28', cat: 'ইমাম/হুজুরের বেতন', name: 'ইমাম সাহেব', amt: 18000, acc: 'bank', note: 'মে মাসের বেতন' },
    { id: 1715004000000, type: 'out', date: '2026-05-28', cat: 'মুয়াজ্জিনের বেতন', name: 'মুয়াজ্জিন সাহেব', amt: 12000, acc: 'cash', note: 'মে মাসের বেতন' },
    { id: 1715005000000, type: 'out', date: '2026-05-29', cat: 'বিদ্যুৎ (কারেন্ট) বিল', name: 'ডেসকো', amt: 5200, acc: 'bank', note: 'কারেন্ট বিল' },

    // June 2026 (Eid al-Adha donations)
    { id: 1718001000000, type: 'in', date: '2026-06-12', cat: 'জুমার দান', name: 'জুমার জামাত দানবাক্স', amt: 24500, acc: 'cash', note: 'জুমার দান' },
    { id: 1718002000000, type: 'in', date: '2026-06-17', cat: 'বিশেষ দান', name: 'ঈদের বিশেষ অনুদান ও চামড়া কালেকশন', amt: 42000, acc: 'cash', note: 'ঈদুল আযহার দান' },
    { id: 1718003000000, type: 'in', date: '2026-06-20', cat: 'সদস্যদের দান/চাঁদা', name: 'সদস্য চাঁদা ফান্ড', amt: 29000, acc: 'bank', note: 'জুন চাঁদা' },
    { id: 1718004000000, type: 'out', date: '2026-06-28', cat: 'ইমাম/হুজুরের বেতন', name: 'ইমাম ও মুয়াজ্জিন বেতন-বোনাস', amt: 35000, acc: 'bank', note: 'জুন বেতন ও ঈদ হাদিয়া' },
    { id: 1718005000000, type: 'out', date: '2026-06-29', cat: 'বিদ্যুৎ (কারেন্ট) বিল', name: 'ডেসকো', amt: 6800, acc: 'bank', note: 'গ্রীষ্মের এসি বিল' },

    // July 2026
    { id: 1721001000000, type: 'in', date: '2026-07-10', cat: 'জুমার দান', name: 'জুমার দানবাক্স', amt: 21500, acc: 'cash', note: 'জুমার দান' },
    { id: 1721002000000, type: 'in', date: '2026-07-18', cat: 'সদস্যদের দান/চাঁদা', name: 'নিয়মিত সদস্য চাঁদা', amt: 31000, acc: 'bank', note: 'জুলাই মাসের চাঁদা' },
    { id: 1721003000000, type: 'out', date: '2026-07-28', cat: 'ইমাম/হুজুরের বেতন', name: 'ইমাম সাহেব', amt: 18000, acc: 'bank', note: 'জুলাই বেতন' },
    { id: 1721004000000, type: 'out', date: '2026-07-28', cat: 'মুয়াজ্জিনের বেতন', name: 'মুয়াজ্জিন সাহেব', amt: 12000, acc: 'cash', note: 'জুলাই বেতন' },
    { id: 1721005000000, type: 'out', date: '2026-07-29', cat: 'বিদ্যুৎ (কারেন্ট) বিল', name: 'ডেসকো', amt: 7200, acc: 'bank', note: 'কারেন্ট বিল' },

    // August 2026
    { id: 1724001000000, type: 'in', date: '2026-08-07', cat: 'জুমার দান', name: 'জুমার দানবাক্স', amt: 23000, acc: 'cash', note: 'জুমার কালেকশন' },
    { id: 1724002000000, type: 'in', date: '2026-08-15', cat: 'সদস্যদের দান/চাঁদা', name: 'সদস্যদের চাঁদা', amt: 30000, acc: 'bank', note: 'আগস্ট চাঁদা' },
    { id: 1724003000000, type: 'in', date: '2026-08-20', cat: 'উন্নয়ন খরচ', name: 'সাউন্ড সিস্টেম সংস্কার অনুদান', amt: 15000, acc: 'cash', note: 'মাইক ও সাউন্ড দান' },
    { id: 1724004000000, type: 'out', date: '2026-08-25', cat: 'উন্নয়ন খরচ', name: 'সাউন্ড ও মাইক সার্ভিসিং', amt: 11500, acc: 'cash', note: 'নতুন এমপ্লিফায়ার ক্রয়' },
    { id: 1724005000000, type: 'out', date: '2026-08-28', cat: 'ইমাম/হুজুরের বেতন', name: 'ইমাম সাহেব', amt: 18000, acc: 'bank', note: 'আগস্ট বেতন' },
    { id: 1724006000000, type: 'out', date: '2026-08-28', cat: 'মুয়াজ্জিনের বেতন', name: 'মুয়াজ্জিন সাহেব', amt: 12000, acc: 'cash', note: 'আগস্ট বেতন' },
    { id: 1724007000000, type: 'out', date: '2026-08-29', cat: 'বিদ্যুৎ (কারেন্ট) বিল', name: 'ডেসকো', amt: 6900, acc: 'bank', note: 'কারেন্ট বিল' },

    // September 2026
    { id: 1727001000000, type: 'in', date: '2026-09-04', cat: 'জুমার দান', name: 'জুমার দানবাক্স', amt: 25000, acc: 'cash', note: 'জুমার দান' },
    { id: 1727002000000, type: 'in', date: '2026-09-12', cat: 'সদস্যদের দান/চাঁদা', name: 'সদস্যদের মাসিক চাঁদা', amt: 32500, acc: 'bank', note: 'সেপ্টেম্বর চাঁদা' },
    { id: 1727003000000, type: 'out', date: '2026-09-28', cat: 'ইমাম/হুজুরের বেতন', name: 'ইমাম সাহেব', amt: 18000, acc: 'bank', note: 'সেপ্টেম্বর বেতন' },
    { id: 1727004000000, type: 'out', date: '2026-09-28', cat: 'মুয়াজ্জিনের বেতন', name: 'মুয়াজ্জিন সাহেব', amt: 12000, acc: 'cash', note: 'সেপ্টেম্বর বেতন' },
    { id: 1727005000000, type: 'out', date: '2026-09-29', cat: 'বিদ্যুৎ (কারেন্ট) বিল', name: 'ডেসকো', amt: 6100, acc: 'bank', note: 'কারেন্ট বিল' },

    // October 2026
    { id: 1729001000000, type: 'in', date: '2026-10-09', cat: 'জুমার দান', name: 'জুমার মুসল্লিদের দানবাক্স', amt: 26800, acc: 'cash', note: 'জুমার জামাত শেষে বাক্স খোলা হয়' },
    { id: 1729002000000, type: 'in', date: '2026-10-15', cat: 'ধান বিক্রি', name: 'আলমগীর রাইস মিল (ধান বিক্রি বাবদ)', amt: 13500, acc: 'bank', note: '১০ মণ ধান বিক্রি' },
    { id: 1729003000000, type: 'in', date: '2026-10-18', cat: 'সদস্যদের দান/চাঁদা', name: 'হাজী মো. রফিকুল ইসলাম ও সদস্যবৃন্দ', amt: 33000, acc: 'bank', note: 'অক্টোবর মাসের নিয়মিত অনুদান' },
    { id: 1729004000000, type: 'in', date: '2026-10-20', cat: 'বিশেষ দান', name: 'আলহাজ্ব শফিকুল ইসলাম', amt: 15000, acc: 'cash', note: 'মসজিদ টাইলস ও রং করার জন্য অনুদান' },
    { id: 1729007000000, type: 'in', date: '2026-10-24', cat: 'বিশেষ দান', name: 'ইঞ্জিনিয়ার মো. কামরুল হাসান', amt: 5000, acc: 'bank', note: 'অনলাইন দান • বিকাশ TrxID: 9K3M821X • মোবাইল: 01711998877' },
    { id: 1729008000000, type: 'in', date: '2026-10-25', cat: 'সাধারণ দান', name: 'নাম প্রকাশে অনিচ্ছুক মুসল্লি', amt: 1000, acc: 'bank', note: 'অনলাইন দান • নগদ মোবাইল: 01911002233' },
    { id: 1729005000000, type: 'out', date: '2026-10-21', cat: 'বিদ্যুৎ (কারেন্ট) বিল', name: 'ডেসকো বিদ্যুৎ অফিস', amt: 6450, acc: 'bank', note: 'সেপ্টেম্বর মাসের বিল পরিশোধ' },
    { id: 1729006000000, type: 'out', date: '2026-10-23', cat: 'উন্নয়ন খরচ', name: 'ওযুখানার পানির পাম্প মেরামত', amt: 4800, acc: 'cash', note: 'নতুন পাম্প যন্ত্রাংশ' }
  ],
  ppl: [
    { id: 1, n: 'হাজী মো. রফিকুল ইসলাম', fatherName: 'মরহুম আব্দুল গফুর', motherName: 'মোসাম্মৎ সালেহা খাতুন', address: 'পশ্চিম পাড়া, ঢাকা', profession: 'ব্যবসায়ী', ph: '01711223344', amt: 2000, regDate: '2026-01-10' },
    { id: 2, n: 'আলহাজ্ব আকরাম হোসেন', fatherName: 'মরহুম মৌলভী ইব্রাহীম', motherName: 'আনোয়ারা বেগম', address: 'উত্তর পাড়া, ঢাকা', profession: 'অবসরপ্রাপ্ত কর্মকর্তা', ph: '01819556677', amt: 1500, regDate: '2026-03-15' },
    { id: 3, n: 'ইঞ্জিনিয়ার মো. সেলিম রেজা', fatherName: 'মো. হাফিজুর রহমান', motherName: 'মাজেদা খাতুন', address: 'পূর্ব পাড়া, ঢাকা', profession: 'সিভিল ইঞ্জিনিয়ার', ph: '01912334455', amt: 3000, regDate: '2026-08-20' },
    { id: 4, n: 'ডা. সাইদুর রহমান', fatherName: 'মরহুম ডা. আব্দুল মান্নান', motherName: 'ফরিদা ইয়াসমিন', address: 'দক্ষিণ পাড়া, ঢাকা', profession: 'চিকিৎসক', ph: '01678123456', amt: 2500, regDate: '2026-10-05' }
  ],
  plan: [
    { id: 1, n: 'দ্বিতীয় তলার ছাদ ঢালাই ও রেলিং', q: 1, r: 350000 },
    { id: 2, n: 'আধুনিক ওযুখানার পানির ফিল্টার ও টাইলস', q: 1, r: 75000 },
    { id: 3, n: 'মসজিদের প্রধান গেট ও লাইটিং স্থাপন', q: 1, r: 45000 }
  ],
  pl: [
    {
      id: 1,
      n: 'মো. হাবিবুর রহমান',
      ad: 'পশ্চিম পাড়া, ঢাকা',
      ph: '01712000000',
      ty: 'cash',
      q: 20000,
      pur: 'মসজিদ নির্মাণ/সম্প্রসারণ',
      dt: '2026-11-15',
      note: 'দ্বিতীয় তলার কাজের সময় প্রদান করবেন',
      got: 5000
    },
    {
      id: 2,
      n: 'হাজী কফিল উদ্দিন মাতব্বর',
      ad: 'দক্ষিণ গ্রাম',
      ph: '01815000000',
      ty: 'dhan',
      q: 20,
      u: 'মণ',
      pur: 'সাধারণ দান',
      dt: '2026-11-30',
      note: 'আমন ধান কাটার পর পৌঁছে দেবেন',
      got: 5
    }
  ],
  ds: [
    {
      id: 1,
      dt: '2026-10-15',
      kg: 400, // 10 mon
      rate: 1350,
      total: 13500,
      buyer: 'আলমগীর রাইস মিল',
      tx: 1729005000000
    }
  ],
  settings: DEFAULT_SETTINGS,
  zikrCounts: {
    subhanallah: 33,
    alhamdulillah: 33,
    allahuakbar: 34
  },
  dailyAmal: {},
  lastAmalDate: '',
  syncKey: 'MOSQUE-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
  notices: [
    {
      id: 1,
      title: 'শুক্রবার জুমুআর পূর্বে মসজিদ বিশেষ পরিচ্ছন্নতা ও জীবাণুমুক্তকরণ কর্মসূচি',
      message: 'সম্মানিত মুসল্লিয়ান, আগামী বৃহস্পতিবার বাদ আছর থেকে এশার পূর্ব পর্যন্ত মসজিদের কার্পেট ভ্যাকুয়াম ধৌতকরণ, ফ্যান, লাইট ও ওযুখানার সামগ্রিক পরিচ্ছন্নতা কর্মসূচি অনুষ্ঠিত হবে। আগ্রহী সকল যুব ও স্বেচ্ছাসেবী মুসল্লীদের সক্রিয় অংশগ্রহণ কামনা করা হচ্ছে।',
      priority: 'urgent',
      category: 'cleaning',
      date: '2026-10-24',
      eventDate: '2026-10-29',
      postedBy: 'মসজিদ পরিচালনা কমিটি',
      isPinned: true
    },
    {
      id: 2,
      title: 'মাসিক সীরাতুন্নবী (সা.) আলোচনা সভা ও বিশেষ দু\'আ মাহফিল',
      message: 'আগামী শুক্রবার জুমুআার নামাজ শেষে মসজিদের প্রধান হলে আন্তর্জাতিক খ্যাতিসম্পন্ন আলেমে দ্বীনের উপস্থিতিতে বিশেষ সীরাত আলোচনা ও মোনাজাত অনুষ্ঠিত হবে। পরিবারসহ উপস্থিত হয়ে সওয়াব হাসিল করুন। নামাজ শেষে হালকা তবাররকের ব্যবস্থা রয়েছে।',
      priority: 'important',
      category: 'event',
      date: '2026-10-22',
      eventDate: '2026-10-30',
      postedBy: 'খতিব ও ইমাম পরিষদ',
      isPinned: true
    },
    {
      id: 3,
      title: 'মসজিদের ২য় তলার আধুনিক ওযুখানা ও টাইলস সংস্কার ফান্ড সংগ্রহ',
      message: 'আলহামদুলিল্লাহ, মসজিদের ২য় তলার ওযুখানার পাইপলাইন ও মার্বেল টাইলস বসানোর কাজ দ্রুত এগিয়ে চলেছে। আগ্রহী মুসল্লী ভাই ও প্রবাসীদের মুক্তহস্তে অনুদান প্রদানের জন্য কোষাধ্যক্ষ মহোদয়ের নিকট জমা দেওয়ার অনুরোধ জানানো যাচ্ছে।',
      priority: 'normal',
      category: 'financial',
      date: '2026-10-18',
      postedBy: 'কোষাধ্যক্ষ ও অর্থ উপকমিটি',
      isPinned: false
    }
  ],
  maktabStudents: [
    {
      id: 1,
      name: 'মুহাম্মদ তাসিন আহমেদ',
      guardianName: 'হাজী মো. লোকমান হোসেন',
      phone: '01711223344',
      roll: '০১',
      classLevel: 'কায়েদা',
      monthlyFee: 500,
      admissionDate: '2026-01-10',
      status: 'active',
      note: 'সকাল ৭:০০ - ৮:০০ শিফট'
    },
    {
      id: 2,
      name: 'মুহাম্মদ রাইয়ান ইসলাম',
      guardianName: 'ইঞ্জিনিয়ার রফিকুল ইসলাম',
      phone: '01819556677',
      roll: '০২',
      classLevel: 'নাজেরা',
      monthlyFee: 800,
      admissionDate: '2026-02-15',
      status: 'active',
      note: 'পারা ৫ তেলাওয়াত চলছে'
    },
    {
      id: 3,
      name: 'ফাতিমা জান্নাত নূর',
      guardianName: 'ডা. শফিকুল ইসলাম',
      phone: '01912334455',
      roll: '০৩',
      classLevel: 'কুরআন শিক্ষা',
      monthlyFee: 600,
      admissionDate: '2026-03-01',
      status: 'active',
      note: 'মহিলা শিক্ষক দ্বারা পরিচালিত ব্যাচ'
    },
    {
      id: 4,
      name: 'আব্দুল্লাহ আল মাহিন',
      guardianName: 'মাওলানা জহিরুল হক',
      phone: '01678123456',
      roll: '০৪',
      classLevel: 'হিফজ বিভাগ',
      monthlyFee: 1000,
      admissionDate: '2026-01-05',
      status: 'active',
      note: '৩ পারা শেষ হয়েছে'
    },
    {
      id: 5,
      name: 'মারিয়াম আক্তার মীম',
      guardianName: 'মো. খোরশেদ আলম',
      phone: '01722889900',
      roll: '০৫',
      classLevel: 'আমপারা',
      monthlyFee: 500,
      admissionDate: '2026-04-12',
      status: 'active',
      note: 'আমপারা শেষ পর্যায়ে'
    },
    {
      id: 6,
      name: 'সায়েম আহমেদ তানভীর',
      guardianName: 'নুরুল ইসলাম মাতব্বর',
      phone: '01933445566',
      roll: '০৬',
      classLevel: 'কায়েদা',
      monthlyFee: 500,
      admissionDate: '2026-05-01',
      status: 'active',
      note: 'হরফ চেনার অনুশীলন চলছে'
    }
  ],
  maktabPayments: [
    {
      id: 1729000100001,
      studentId: 1,
      studentName: 'মুহাম্মদ তাসিন আহমেদ',
      month: '2026-10',
      amount: 500,
      waiverDiscount: 0,
      paidDate: '2026-10-05',
      acc: 'cash',
      receiptNo: 'MKT-26-101',
      collectedBy: 'ইমাম সাহেব',
      note: 'অক্টোবর মাসের বেতন পরিশোধ'
    },
    {
      id: 1729000100002,
      studentId: 3,
      studentName: 'ফাতিমা জান্নাত নূর',
      month: '2026-10',
      amount: 600,
      waiverDiscount: 0,
      paidDate: '2026-10-07',
      acc: 'cash',
      receiptNo: 'MKT-26-102',
      collectedBy: 'ইমাম সাহেব',
      note: 'অক্টোবর মাসের বেতন পরিশোধ'
    },
    {
      id: 1729000100003,
      studentId: 4,
      studentName: 'আব্দুল্লাহ আল মাহিন',
      month: '2026-10',
      amount: 500,
      waiverDiscount: 0,
      paidDate: '2026-10-10',
      acc: 'cash',
      receiptNo: 'MKT-26-103',
      collectedBy: 'মুয়াজ্জিন সাহেব',
      note: 'অক্টোবর মাসের আংশিক বেতন জমা (বাকি ৫০০)'
    }
  ],
  calendarNotes: [

    {
      id: 'note-1',
      dateStr: '2026-10-30',
      title: 'বাদ জুমুআ বিশেষ তাফসির ও সীরাত আলোচনা মাহফিল',
      category: 'milad',
      time: '01:45 PM',
      note: 'বিশিষ্ট আলেমে দ্বীন উপস্থিত থাকবেন, পরিবারসহ উপস্থিতির অনুরোধ। নামাজ শেষে হালকা তবাররক।',
      addedBy: 'ইমাম সাহেব'
    },
    {
      id: 'note-2',
      dateStr: '2026-11-06',
      title: 'মসজিদ পরিচালনা কমিটির মাসিক সাধারণ সভা ও হিসাব পর্যালোচনা',
      category: 'meeting',
      time: '08:00 PM',
      note: 'মসজিদের ২য় তলার কাজ ও ফান্ড সংগ্রহের অগ্রগতি পর্যালোচনা করা হবে।',
      addedBy: 'সেক্রেটারি'
    },
    {
      id: 'note-3',
      dateStr: '2026-11-15',
      title: '২য় তলার ছাদ ঢালাই কাজের উদ্বোধন ও বিশেষ দোয়া',
      category: 'event',
      time: '10:30 AM',
      note: 'সকল দাতা ও মুসল্লী ভাইদের উপস্থিত থাকার বিনীত অনুরোধ রইল।',
      addedBy: 'সভাপতি'
    }
  ],
  prayerLogs: {
    '2026-10-11': { fajr: 'on_time', dhuhr: 'on_time', asr: 'on_time', maghrib: 'on_time', isha: 'on_time' },
    '2026-10-12': { fajr: 'on_time', dhuhr: 'on_time', asr: 'late', maghrib: 'on_time', isha: 'on_time' },
    '2026-10-13': { fajr: 'late', dhuhr: 'on_time', asr: 'on_time', maghrib: 'on_time', isha: 'on_time' },
    '2026-10-14': { fajr: 'on_time', dhuhr: 'on_time', asr: 'on_time', maghrib: 'on_time', isha: 'late' },
    '2026-10-15': { fajr: 'on_time', dhuhr: 'on_time', asr: 'on_time', maghrib: 'on_time', isha: 'on_time' },
    '2026-10-16': { fajr: 'on_time', dhuhr: 'on_time', asr: 'on_time', maghrib: 'on_time', isha: 'on_time' },
    '2026-10-17': { fajr: 'missed', dhuhr: 'on_time', asr: 'on_time', maghrib: 'on_time', isha: 'on_time' },
    '2026-10-18': { fajr: 'on_time', dhuhr: 'on_time', asr: 'late', maghrib: 'on_time', isha: 'on_time' },
    '2026-10-19': { fajr: 'on_time', dhuhr: 'on_time', asr: 'on_time', maghrib: 'on_time', isha: 'on_time' },
    '2026-10-20': { fajr: 'on_time', dhuhr: 'on_time', asr: 'on_time', maghrib: 'on_time', isha: 'missed' },
    '2026-10-21': { fajr: 'on_time', dhuhr: 'on_time', asr: 'on_time', maghrib: 'on_time', isha: 'on_time' },
    '2026-10-22': { fajr: 'late', dhuhr: 'on_time', asr: 'on_time', maghrib: 'on_time', isha: 'on_time' },
    '2026-10-23': { fajr: 'on_time', dhuhr: 'on_time', asr: 'on_time', maghrib: 'on_time', isha: 'on_time' },
    '2026-10-24': { fajr: 'on_time', dhuhr: 'on_time', asr: 'on_time', maghrib: 'on_time', isha: 'on_time' },
    '2026-10-25': { fajr: 'on_time', dhuhr: 'on_time', asr: 'late', maghrib: 'on_time', isha: 'on_time' },
    '2026-10-26': { fajr: 'on_time', dhuhr: 'on_time', asr: 'on_time', maghrib: 'on_time', isha: 'on_time' }
  }
};

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'emerald',
  fontSize: 'large', // Elderly friendly default!
  fontFamily: 'siliguri',
  language: 'bn',
  soundEnabled: true,
  vibrationEnabled: true,
  city: 'ঢাকা',
  notificationsEnabled: true,
  fajrHadithAlertEnabled: true
};

// Safe load state
export function loadAppState(): AppStateData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_STATE;
    const parsed = JSON.parse(raw);
    return {
      name: parsed.name || INITIAL_STATE.name,
      ob: Number(parsed.ob) || 0,
      oc: Number(parsed.oc) || 0,
      mem: Number(parsed.mem) || 0,
      pin: parsed.pin || '',
      tx: Array.isArray(parsed.tx) ? parsed.tx : INITIAL_STATE.tx,
      ppl: Array.isArray(parsed.ppl) ? parsed.ppl : INITIAL_STATE.ppl,
      plan: Array.isArray(parsed.plan) ? parsed.plan : INITIAL_STATE.plan,
      pl: Array.isArray(parsed.pl) ? parsed.pl : INITIAL_STATE.pl,
      ds: Array.isArray(parsed.ds) ? parsed.ds : INITIAL_STATE.ds,
      settings: parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : DEFAULT_SETTINGS,
      zikrCounts: parsed.zikrCounts || INITIAL_STATE.zikrCounts,
      dailyAmal: parsed.dailyAmal || {},
      lastAmalDate: parsed.lastAmalDate || '',
      syncKey: parsed.syncKey || INITIAL_STATE.syncKey,
      notices: Array.isArray(parsed.notices) && parsed.notices.length > 0 ? parsed.notices : INITIAL_STATE.notices,
      maktabStudents: Array.isArray(parsed.maktabStudents) && parsed.maktabStudents.length > 0 ? parsed.maktabStudents : INITIAL_STATE.maktabStudents,
      maktabPayments: Array.isArray(parsed.maktabPayments) ? parsed.maktabPayments : (INITIAL_STATE.maktabPayments || []),
      calendarNotes: Array.isArray(parsed.calendarNotes) ? parsed.calendarNotes : INITIAL_STATE.calendarNotes,
      prayerLogs: parsed.prayerLogs || INITIAL_STATE.prayerLogs || {}
    };

  } catch (err) {
    console.error('Failed to load state from localStorage', err);
    return INITIAL_STATE;
  }
}

export function saveAppState(state: AppStateData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to localStorage', err);
  }
}

export function loadPreferences(): UserPreferences {
  try {
    const raw = localStorage.getItem(PREFERENCES_KEY);
    if (!raw) return DEFAULT_PREFERENCES;
    return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function savePreferences(prefs: UserPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch (err) {
    console.error('Failed to save preferences', err);
  }
}

// Backup & Restore utilities
export function exportBackupJSON(data: AppStateData): string {
  return JSON.stringify(data, null, 2);
}

export function importBackupJSON(jsonStr: string): AppStateData {
  const parsed = JSON.parse(jsonStr);
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('অবৈধ ব্যাকআপ ফাইল ফরম্যাট');
  }
  return {
    ...INITIAL_STATE,
    ...parsed,
    tx: Array.isArray(parsed.tx) ? parsed.tx : [],
    ppl: Array.isArray(parsed.ppl) ? parsed.ppl : [],
    plan: Array.isArray(parsed.plan) ? parsed.plan : [],
    pl: Array.isArray(parsed.pl) ? parsed.pl : [],
    ds: Array.isArray(parsed.ds) ? parsed.ds : [],
    maktabStudents: Array.isArray(parsed.maktabStudents) ? parsed.maktabStudents : INITIAL_STATE.maktabStudents,
    maktabPayments: Array.isArray(parsed.maktabPayments) ? parsed.maktabPayments : [],
    calendarNotes: Array.isArray(parsed.calendarNotes) ? parsed.calendarNotes : (INITIAL_STATE.calendarNotes || [])
  };
}

