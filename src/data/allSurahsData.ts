export interface QuranVerse {
  id: number;
  ar: string;
  pronounce: string;
  bn: string;
  en: string;
}

export interface FullSurahDetail {
  id: number;
  nameAr: string;
  nameBn: string;
  nameEn: string;
  meaning: string;
  versesCount: number;
  revelation: 'মক্কী' | 'মাদানী';
  verses: QuranVerse[];
}

export const OFFLINE_FULL_SURAHS: Record<number, FullSurahDetail> = {
  // Surah 1: Al-Fatihah
  1: {
    id: 1,
    nameAr: 'الفاتحة',
    nameBn: 'সূরা আল-ফাতিহা',
    nameEn: 'Al-Fatihah',
    meaning: 'ভূমিকা / প্রারম্ভিক',
    versesCount: 7,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', pronounce: 'বিসমিল্লাহির রাহমানির রাহিম', bn: 'পরম করুণাময় অসীম দয়ালু আল্লাহর নামে শুরু করছি।', en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.' },
      { id: 2, ar: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', pronounce: 'আলহামদুলিল্লাহি রাব্বিল আলামিন', bn: 'সকল প্রশংসা সৃষ্টিকুলের পালনকর্তা আল্লাহরই জন্য।', en: '[All] praise is [due] to Allah, Lord of the worlds.' },
      { id: 3, ar: 'الرَّحْمَٰنِ الرَّحِيمِ', pronounce: 'আর-রাহমানির রাহিম', bn: 'যিনি পরম দয়ালু এবং অতিশয় মেহেরবান।', en: 'The Entirely Merciful, the Especially Merciful.' },
      { id: 4, ar: 'مَالِكِ يَوْمِ الدِّينِ', pronounce: 'মালিকি ইয়াওমিদ দিন', bn: 'যিনি প্রতিফল দিবসের মালিক।', en: 'Sovereign of the Day of Recompense.' },
      { id: 5, ar: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', pronounce: 'ইয়্যাকা না’বুদু ওয়া ইয়্যাকা নাসতা’ঈন', bn: 'আমরা কেবল তোমারই ইবাদত করি এবং কেবল তোমারই কাছে সাহায্য প্রার্থনা করি।', en: 'It is You we worship and You we ask for help.' },
      { id: 6, ar: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', pronounce: 'ইহদিনাস সিরাতাল মুসতাকিম', bn: 'আমাদের সরল-সঠিক পথ প্রদর্শন করো।', en: 'Guide us to the straight path.' },
      { id: 7, ar: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', pronounce: 'সিরাতাল্লাযিনা আন’আমতা আলাইহিম, গাইরিল মাগদুবি আলাইহিম ওয়ালাদ-দ্বোয়াল্লিন।', bn: 'তাদের পথ যাদের তুমি অনুগ্রহ দান করেছ; তাদের পথ নয় যাদের ওপর তোমার গজব পতিত হয়েছে এবং যারা পথভ্রষ্ট হয়েছে।', en: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.' }
    ]
  },

  // Surah 36: Ya-Sin
  36: {
    id: 36,
    nameAr: 'يس',
    nameBn: 'সূরা ইয়াসীন',
    nameEn: 'Ya-Sin',
    meaning: 'কুরআনের হৃৎপিণ্ড',
    versesCount: 12,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'يسٓ', pronounce: 'ইয়া-সীন।', bn: 'ইয়া-সীন।', en: 'Ya, Seen.' },
      { id: 2, ar: 'وَالْقُرْآنِ الْحَكِيمِ', pronounce: 'ওয়াল কুরআনিল হাকীম।', bn: 'প্রজ্ঞাময় কুরআনের শপথ,', en: 'By the wise Qur\'an,' },
      { id: 3, ar: 'إِنَّكَ لَمِنَ الْمُرْسَلِينَ', pronounce: 'ইন্নাকা লামিনাল মুরসালীন।', bn: 'নিশ্চয় আপনি প্রেরিত রসূলগণের একজন,', en: 'Indeed you, [O Muhammad], are from among the messengers,' },
      { id: 4, ar: 'عَلَىٰ صِرَاطٍ مُّسْتَقِيمٍ', pronounce: 'আলা সিরাতিম মুস্তাকীম।', bn: 'সরল সঠিক পথে প্রতিষ্ঠিত।', en: 'On a straight path.' },
      { id: 5, ar: 'تَنزِيلَ الْعَزِيزِ الرَّحِيمِ', pronounce: 'তানযীলাল আযীযির রাহীম।', bn: 'এ পরাক্রমশালী পরম দয়ালু আল্লাহর অবতারিত,', en: '[This is] a revelation of the Exalted in Might, the Merciful.' },
      { id: 6, ar: 'لِتُنذِرَ قَوْمًا مَّا أُنذِرَ آبَاؤُهُمْ فَهُمْ غَافِلُونَ', pronounce: 'লিতুনযিরা ক্বাওমাম মা উনযিরা আবা-উহুম ফাহুম গাফিলূন।', bn: 'যাতে আপনি এমন এক জাতিকে সতর্ক করেন যাদের পূর্বপুরুষগণকে সতর্ক করা হয়নি, যার কারণে তারা গাফেল।', en: 'That you may warn a people whose forefathers were not warned, so they are unaware.' },
      { id: 7, ar: 'لَقَدْ حَقَّ الْقَوْلُ عَلَىٰ أَكْثَرِهِمْ فَهُمْ لَا يُؤْمِنُونَ', pronounce: 'লাকাদ হাক্কাল কাওলু আলা আকছারিহিম ফাহুম লা ইউ’মিনূন।', bn: 'নিশ্চয় তাদের অধিকাংশের প্রতি আল্লাহর বাণী সাব্যস্ত হয়ে গেছে, ফলে তারা বিশ্বাস স্থাপন করবে না।', en: 'Already the word has come into effect upon most of them, so they do not believe.' },
      { id: 8, ar: 'إِنَّا جَعَلْنَا فِي أَعْنَاقِهِمْ أَغْلَالًا فَهِيَ إِلَى الْأَذْقَانِ فَهُم مُّقْمَحُونَ', pronounce: 'ইন্না জাআলনা ফী আ’নাক্বিহিম আগলা-লান ফাহিয়া ইলাল আযক্বানি ফাহুম মুকমাহূন।', bn: 'আমি তাদের গলায় গলদেশ পর্যন্ত লৌহবেড়ী পরিয়ে দিয়েছি, ফলে তাদের মস্তক ঊর্ধ্বমুখী হয়ে আছে।', en: 'Indeed, We have put shackles on their necks, and they are to their chins, so they are with heads [kept] aloft.' },
      { id: 9, ar: 'وَجَعَلْنَا مِن بَيْنِ أَيْدِيهِمْ سَدًّا وَمِنْ خَلْفِهِمْ سَدًّا فَأَغْشَيْنَاهُمْ فَهُمْ لَا يُبْصِرُونَ', pronounce: 'ওয়া জাআলনা মিম বাইনি আইদীহিম সাদ্দাউঁ ওয়া মিন খালফিহিম সাদ্দান ফাআগশাইনাহুম ফাহুম লা ইউবসিরূন।', bn: 'এবং আমি তাদের সামনে একটি প্রাচীর ও তাদের পেছনে একটি প্রাচীর স্থাপন করেছি, অতঃপর তাদেরকে আবৃত করে দিয়েছি, ফলে তারা দেখতে পায় না।', en: 'And We have put before them a barrier and behind them a barrier and covered them, so they do not see.' },
      { id: 10, ar: 'وَسَوَاءٌ عَلَيْهِمْ أَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ', pronounce: 'ওয়া সাওয়া-উন আলাইহিম আআনযারতাহুম আম লাম তুনযিরহুম লা ইউ\'মিনূন।', bn: 'আপনি তাদেরকে সতর্ক করুন বা না করুন, তাদের পক্ষে উভয়ই সমান; তারা ঈমান আনবে না।', en: 'And it is all the same for them whether you warn them or do not warn them - they will not believe.' },
      { id: 11, ar: 'إِنَّمَا تُنذِرُ مَنِ اتَّبَعَ الذِّكْرَ وَخَشِيَ الرَّحْمَٰنَ بِالْغَيْبِ ۖ فَبَشِّرْهُ بِمَغْفِرَةٍ وَأَجْرٍ كَرِيمٍ', pronounce: 'ইন্নামা তুনযিরু মানিত্তাবাআয যিকরা ওয়া খাশিয়ার রাহমানা বিলগাইবি ফাবাশশিরহু বিমাগফিরাতিউঁ ওয়া আজরিন কারীম।', bn: 'আপনি কেবল তাকেই সতর্ক করতে পারেন, যে উপদেশ মেনে চলে এবং না দেখে দয়াময় আল্লাহকে ভয় করে। অতএব তাকে ক্ষমার ও সম্মানজনক প্রতিদানের সুসংবাদ দিন।', en: 'You can only warn one who follows the message and fears the Most Merciful unseen. So give him good tidings of forgiveness and noble reward.' },
      { id: 12, ar: 'إِنَّا نَحْنُ نُحْيِي الْمَوْتَىٰ وَنَكْتُبُ مَا قَدَّمُوا وَآثَارَهُمْ ۚ وَكُلَّ شَيْءٍ أَحْصَيْنَاهُ فِي إِمَامٍ مُّبِينٍ', pronounce: 'ইন্না নাহনু নুহযিল মাওতা ওয়া নাকতুবু মা কাদ্দামূ ওয়া আছ-রাহুম, ওয়া কুল্লা শাইয়িন আহসাইনা-হু ফী ইমামিম মুবীন।', bn: 'নিশ্চয় আমি মৃতকে জীবিত করি এবং তারা যা অগ্রে প্রেরণ করেছে ও যা পশ্চাতে রেখে গেছে তা লিখে রাখি। আর প্রত্যেক বস্তু আমি এক সুস্পষ্ট কিতাবে সংরক্ষিত রেখেছি।', en: 'Indeed, it is We who bring the dead to life and record what they have put forth and what they left behind, and all things We have enumerated in a clear register.' }
    ]
  },

  // Surah 55: Ar-Rahman
  55: {
    id: 55,
    nameAr: 'الرحمن',
    nameBn: 'সূরা আর-রহমান',
    nameEn: 'Ar-Rahman',
    meaning: 'পরম করুণাময় আল্লাহ',
    versesCount: 13,
    revelation: 'মাদানী',
    verses: [
      { id: 1, ar: 'الرَّحْمَٰنُ', pronounce: 'আর-রাহমান।', bn: 'পরম করুণাময় আল্লাহ,', en: 'The Most Merciful' },
      { id: 2, ar: 'عَلَّمَ الْقُرْآنَ', pronounce: 'আল্লামাল কুরআন।', bn: 'তিনি শিক্ষা দিয়েছেন কুরআন,', en: 'Taught the Qur\'an,' },
      { id: 3, ar: 'خَلَقَ الْإِنسَانَ', pronounce: 'খালাকাল ইনসান।', bn: 'সৃষ্টি করেছেন মানুষ,', en: 'Created human,' },
      { id: 4, ar: 'عَلَّمَهُ الْبَيَانَ', pronounce: 'আল্লামাহুল বায়ান।', bn: 'তাঁকে শিখিয়েছেন ভাব প্রকাশ ও বাকশক্তি।', en: 'Taught him speech.' },
      { id: 5, ar: 'الشَّمْسُ وَالْقَمَرُ بِحُسْبَانٍ', pronounce: 'আশ-শামসু ওয়াল ক্বামারু বিহুসবান।', bn: 'সূর্য ও চন্দ্র সুনির্দিষ্ট হিসাবের অনুবর্তী,', en: 'The sun and the moon move by precise calculation,' },
      { id: 6, ar: 'وَالنَّجْمُ وَالشَّجَرُ يَسْجُدَانِ', pronounce: 'ওয়ান-নাজমু wash-শাজারু ইয়াসজুদান।', bn: 'এবং তৃণলতা ও বৃক্ষরাজি সিজদারত আছে।', en: 'And the stars and trees prostrate.' },
      { id: 7, ar: 'وَالسَّمَاءَ رَفَعَهَا وَوَضَعَ الْمِيزَانَ', pronounce: 'ওয়াস-সামাআ রাফা’আহা ওয়া ওয়াযা’আল মীযান।', bn: 'তিনি আকাশকে করেছেন সমুন্নত এবং স্থাপন করেছেন তুলাদণ্ড / ন্যায়বিচারের মানদণ্ড,', en: 'And the heaven He raised and imposed the balance' },
      { id: 8, ar: 'أَلَّا تَطْغَوْا فِي الْمِيزَانِ', pronounce: 'আল্লা তাতগাও ফিল মীযান।', bn: 'যাতে তোমরা ওজনে ও ন্যায়বিচারে সীমালঙ্ঘন না করো।', en: 'That you not transgress within the balance.' },
      { id: 9, ar: 'وَأَقِيمُوا الْوَزْنَ بِالْقِسْطِ وَلَا تُخْسِرُوا الْمِيزَانَ', pronounce: 'ওয়া আক্বীমুল ওয়াযনা বিলক্বিসতি ওয়ালা তুখসিরুল মীযান।', bn: 'তোমরা সঠিকভাবে ওজন কায়েম রাখো এবং পরিমাপে কম দিয়ো না।', en: 'And establish weight in justice and do not make deficient the balance.' },
      { id: 10, ar: 'وَالْأَرْضَ وَضَعَهَا لِلْأَنَامِ', pronounce: 'ওয়াল আরদ্বা ওয়াযা’আহা লিল আনাম।', bn: 'এবং পৃথিবীকে তিনি জীবজগতের জন্য বিছিয়ে দিয়েছেন,', en: 'And the earth He laid [out] for the creatures.' },
      { id: 11, ar: 'فِيهَا فَاكِهَةٌ وَالنَّخْلُ ذَاتُ الْأَكْمَامِ', pronounce: 'ফীহা ফাকিহাতুঁও ওয়ান-নাখলু যাতুল আকমাম।', bn: 'যাতে রয়েছে ফলমূল এবং আবরণযুক্ত খেজুর গাছ,', en: 'Therein is fruit and palm trees having sheaths [of dates]' },
      { id: 12, ar: 'وَالْحَبُّ ذُو الْعَصْفِ وَالرَّيْحَانُ', pronounce: 'ওয়াল হাব্বু যুল আসফি ওয়ার-রাইহান।', bn: 'আর খোসাবিশিষ্ট শস্যদানা এবং সুবাসিত ফুল ও উদ্ভিদ।', en: 'And grain having husks and scented plants.' },
      { id: 13, ar: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ', pronounce: 'ফাবিআইয়ি আ-লা-ই রাব্বিকুমা তুকায়্যিবান।', bn: 'অতএব (হে জিন ও মানব জাতি!) তোমরা তোমাদের রবের কোন কোন নিয়ামতকে অস্বীকার করবে?', en: 'So which of the favors of your Lord would you deny?' }
    ]
  },

  // Surah 67: Al-Mulk
  67: {
    id: 67,
    nameAr: 'الملك',
    nameBn: 'সূরা আল-মুলক',
    nameEn: 'Al-Mulk',
    meaning: 'সার্বভৌম কর্তৃত্ব / কবরের আজাব থেকে রক্ষাকারী',
    versesCount: 8,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', pronounce: 'তাবারাকাল্লাযী বিইয়াদিহিল মুলকু ওয়াহুওয়া আলা কুল্লি শাইয়িন কাদীর।', bn: 'কত বরকতময় তিনি যাঁর হাতে সমগ্র রাজত্ব এবং যিনি সর্ববিষয়ে সর্বশক্তিমান।', en: 'Blessed is He in whose hand is dominion, and He is over all things competent -' },
      { id: 2, ar: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ', pronounce: 'আল্লাযী খালাকাল মাওতা ওয়াল হায়াতা লিইয়াবলুওয়াকুম আইয়্যুকুম আহসানু আমালা, ওয়াহুওয়াল আযীযুল গাফুর।', bn: 'যিনি সৃষ্টি করেছেন মৃত্যু ও জীবন তোমাদেরকে পরীক্ষা করার জন্য—কে তোমাদের মধ্যে আমলে শ্রেষ্ঠ? আর তিনি পরাক্রমশালী, ক্ষমাশীল।', en: '[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -' },
      { id: 3, ar: 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ', pronounce: 'আল্লাযী খালাকা সাব’আ সামাওয়া-তিন তিবা-কা, মা তারা ফী খালকির রাহমানি মিন তাফাউত, ফারজিইল বাসারা হাল তারা মিন ফুতূর।', bn: 'যিনি স্তরে স্তরে সপ্ত আকাশ সৃষ্টি করেছেন। পরম করুণাময়ের সৃষ্টিতে তুমি কোনো অসামঞ্জস্য দেখতে পাবে না। দৃষ্টি ফিরিয়ে দেখ, কোনো ত্রুটি দেখতে পাও কি?', en: '[And] who created seven heavens in layers. You do not see in the creation of the Most Merciful any inconsistency. So return [your] vision [to the sky]; do you see any breaks?' },
      { id: 4, ar: 'ثُمَّ ارْجِعِ الْبَصَرَ كَرَّتَيْنِ يَنقَلِبْ إِلَيْكَ الْبَصَرُ خَاسِئًا وَهُوَ حَسِيرٌ', pronounce: 'ছুম্মার জিইল বাসারা কাররাতাইনি ইয়ানক্বলিব ইলাইকাল বাসারু খাসিআউঁ ওয়াহুওয়া হাসীর।', bn: 'অতঃপর তুমি বারবার দৃষ্টি ফেরাও; সেই দৃষ্টি ব্যর্থ ও ক্লান্ত-পরিশ্রান্ত হয়ে তোমার দিকে ফিরে আসবে।', en: 'Then return [your] vision twice again. [Your] vision will return to you humbled while it is fatigued.' },
      { id: 5, ar: 'وَلَقَدْ زَيَّنَّا السَّمَاءَ الدُّنْيَا بِمَصَابِيحَ وَجَعَلْنَاهَا رُجُومًا لِّلشَّيَاطِينِ ۖ وَأَعْتَدْنَا لَهُمْ عَذَابَ السَّعِيرِ', pronounce: 'ওয়ালাকাদ যাইয়ান্নাস সামা-আদ দুনইয়া বিমাসা-বীহা ওয়া জাআলনা-হা রুজুমান লিশ-শায়াত্বীন, ওয়া আ’তাদনা লাহুম আযাবাস সাঈর।', bn: 'আমি নিকটবর্তী আকাশকে প্রদীপমালা (নক্ষত্র) দ্বারা সুশোভিত করেছি এবং সেগুলোকে শয়তানদের প্রতি নিক্ষেপের উপকরণ বানিয়েছি, আর তাদের জন্য প্রস্তুত রেখেছি জ্বলন্ত অগ্নির শাস্তি।', en: 'And We have certainly beautified the nearest heaven with stars and have made [from] them what is thrown at the devils and have prepared for them the punishment of the Blaze.' },
      { id: 6, ar: 'وَلِلَّذِينَ كَفَرُوا بِرَبِّهِمْ عَذَابُ جَهَنَّمَ ۖ وَبِئْسَ الْمَصِيرُ', pronounce: 'ওয়ালিল্লাযীনা কাফারূ বিরাব্বিহিম আযাবু জাহান্নামা ওয়াবি’সাল মাসীর।', bn: 'আর যারা তাদের প্রতিপালককে অস্বীকার করে, তাদের জন্য রয়েছে জাহান্নামের শাস্তি; আর কতই না নিকৃষ্ট সেই প্রত্যাবর্তনস্থল!', en: 'And for those who disbelieved in their Lord is the punishment of Hell, and wretched is the destination.' },
      { id: 7, ar: 'إِذَا أُلْقُوا فِيهَا سَمِعُوا لَهَا شَهِيقًا وَهِيَ تَفُورُ', pronounce: 'ইযা উলকূ ফীহা সামিঊ লাহা শাহীক্বাউঁ ওয়াহিয়া তাফূর।', bn: 'যখন তাদেরকে তাতে নিক্ষেপ করা হবে, তখন তারা তার ভয়াবহ গর্জন শুনতে পাবে এবং তা ফুটন্ত অবস্থায় উদ্বেলিত হতে থাকবে।', en: 'When they are thrown into it, they hear from it a [dreadful] inhaling while it boils up.' },
      { id: 8, ar: 'تَكَادُ تَمَيَّزُ مِنَ الْغَيْظِ ۖ كُلَّمَا أُلْقِيَ فِيهَا فَوْجٌ سَأَلَهُمْ خَزَنَتُهَا أَلَمْ يَأْتِكُمْ نَذِيرٌ', pronounce: 'তাকাদু তামাইয়্যাযু মিনাল গাইয, কুল্লামা উলকিয়া ফীহা ফাওজুন সাআলাহুম খাযানাতুহা আলাম ইয়া’তিকুম নাযীর।', bn: 'ক্রোধে জাহান্নাম যেন ফেটে পড়ার উপক্রম হয়। যখনই কোনো দলকে তাতে নিক্ষেপ করা হবে, তার রক্ষীরা তাদেরকে জিজ্ঞেস করবে: "তোমাদের কাছে কি কোনো সতর্ককারী আসেনি?"', en: 'It almost bursts with rage. Every time a company is thrown into it, its keepers ask them, "Did there not come to you a warner?"' }
    ]
  },

  // Surah 93: Ad-Duha
  93: {
    id: 93,
    nameAr: 'الضحى',
    nameBn: 'সূরা আদ-দুহা',
    nameEn: 'Ad-Duha',
    meaning: 'পূর্বাহ্ণ / রৌদ্রোজ্জ্বল প্রহর',
    versesCount: 11,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'وَالضُّحَىٰ', pronounce: 'ওয়াদ দুহা।', bn: 'শপথ পূর্বাহ্নের রৌদ্রোজ্জ্বল প্রহরের,', en: 'By the morning brightness' },
      { id: 2, ar: 'وَاللَّيْلِ إِذَا سَجَىٰ', pronounce: 'ওয়াল্লাইলি ইযা সাজা।', bn: 'এবং শপথ রাতের যখন তা শান্ত ও নিঝুম হয়,', en: 'And [by] the night when it covers with darkness,' },
      { id: 3, ar: 'مَا وَدَّعَكَ رَبُّكَ وَمَا قَلَىٰ', pronounce: 'মা ওয়াদ্দা’আকা রাব্বুকা ওয়ামা ক্বালা।', bn: 'আপনার রব আপনাকে পরিত্যাগ করেননি এবং অসন্তুষ্টও হননি।', en: 'Your Lord has not taken leave of you, [O Muhammad], nor has He detested [you].' },
      { id: 4, ar: 'وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَىٰ', pronounce: 'ওয়ালাল আখিরাতু খাইরুল লাকা মিনাল ঊলা।', bn: 'এবং নিশ্চয় আপনার জন্য পরকাল ইহকালের চেয়ে বহুগুণ শ্রেয়।', en: 'And the Hereafter is better for you than the first [life].' },
      { id: 5, ar: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ', pronounce: 'ওয়ালা সাওফা ইউ’ত্বীকা রাব্বুকা ফাতারদ্বা।', bn: 'এবং অচিরেই আপনার রব আপনাকে এমন প্রাচুর্য দান করবেন যাতে আপনি সন্তুষ্ট হয়ে যাবেন।', en: 'And your Lord is going to give you, and you will be satisfied.' },
      { id: 6, ar: 'أَلَمْ يَجِدْكَ يَتِيمًا فَآوَىٰ', pronounce: 'আলাম ইয়াজিদকা ইয়াতীমান ফাআওয়া।', bn: 'তিনি কি আপনাকে পিতৃহীন এতিম অবস্থায় পাননি? অতঃপর তিনি আশ্রয় দান করেছেন।', en: 'Did He not find you an orphan and give [you] refuge?' },
      { id: 7, ar: 'وَوَجَدَكَ ضَالًّا فَهَدَىٰ', pronounce: 'ওয়া ওয়াজাদাকা দ্বোয়াল্লান ফাহাদা।', bn: 'এবং তিনি আপনাকে পথহারা অবস্থায় পেয়ে সঠিক পথের দিশা দিয়েছেন।', en: 'And He found you lost and guided [you],' },
      { id: 8, ar: 'وَوَجَدَكَ عَائِلًا فَأَغْنَىٰ', pronounce: 'ওয়া ওয়াজাদাকা আ-ইলান ফাআগনা।', bn: 'এবং তিনি আপনাকে নিঃস্ব অবস্থায় পেয়ে অভাবমুক্ত ও ধনী করেছেন।', en: 'And He found you poor and made [you] self-sufficient.' },
      { id: 9, ar: 'فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ', pronounce: 'ফাআম্মাল ইয়াতীমা ফালা তাক্বহার।', bn: 'অতএব আপনি এতিমের প্রতি কঠোর হবেন না,', en: 'So as for the orphan, do not oppress [him].' },
      { id: 10, ar: 'وَأَمَّا السَّائِلَ فَلَا تَنْهَرْ', pronounce: 'ওয়া আম্মাস সা-ইলা ফালা তানহার।', bn: 'এবং সাহায্যপ্রার্থীকে ধমক দেবেন না,', en: 'And as for the petitioner, do not repel [him].' },
      { id: 11, ar: 'وَأَمَّا بِنِعْمَةِ رَبِّكَ فَحَدِّثْ', pronounce: 'ওয়া আম্মা বিনি’মাতি রাব্বিকা ফাহাদ্দিছ।', bn: 'এবং আপনার প্রতিপালকের অনুগ্রহের কথা বারবার প্রচার ও বর্ণনা করুন।', en: 'But as for the favor of your Lord, report [it].' }
    ]
  },

  // Surah 94: Ash-Sharh
  94: {
    id: 94,
    nameAr: 'الشرح',
    nameBn: 'সূরা আল-ইনশিরাহ (আশ-শারহ)',
    nameEn: 'Ash-Sharh',
    meaning: 'বক্ষ প্রশস্তকরণ',
    versesCount: 8,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ', pronounce: 'আলাম নাশরাহ লাকা সাদরাক।', bn: 'আমি কি আপনার বক্ষ আপনার কল্যাণে প্রশস্ত করে দেইনি?', en: 'Did We not expand for you, [O Muhammad], your breast?' },
      { id: 2, ar: 'وَوَضَعْنَا عَنكَ وِزْرَكَ', pronounce: 'ওয়া ওয়াযা’না আনকা উইযরাক।', bn: 'এবং আমি আপনার ওপর থেকে অপসারিত করেছি আপনার গুরুভার,', en: 'And We removed from you your burden' },
      { id: 3, ar: 'الَّذِي أَنقَضَ ظَهْرَكَ', pronounce: 'আল্লাযী আনক্বাদা যাহরাক।', bn: 'যা আপনার পৃষ্ঠদেশকে ভেঙে দিচ্ছিল।', en: 'Which had weighed upon your back' },
      { id: 4, ar: 'وَرَفَعْنَا لَكَ ذِكْرَكَ', pronounce: 'ওয়া রাফা’না লাকা যিকরাক।', bn: 'এবং আমি আপনার মর্যাদাকে সুউচ্চ করেছি।', en: 'And raised high for you your repute.' },
      { id: 5, ar: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا', pronounce: 'ফা ইন্না মাআল উসরি ইউসরা।', bn: 'নিশ্চয় কষ্টের সঙ্গেই রয়েছে স্বস্তি ও স্বাচ্ছন্দ্য।', en: 'For indeed, with hardship [will be] ease.' },
      { id: 6, ar: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا', pronounce: 'ইন্না মাআল উসরি ইউসরা।', bn: 'নিশ্চয় কষ্টের সঙ্গেই রয়েছে স্বস্তি ও প্রাচুর্য।', en: 'Indeed, with hardship [will be] ease.' },
      { id: 7, ar: 'فَإِذَا فَرَغْتَ فَانصَبْ', pronounce: 'ফা ইযা ফারাগতা ফানসাব।', bn: 'অতএব যখনই আপনি কাজ শেষ করেন, তখনই ইবাদতে মনোনিবেশ করুন,', en: 'So when you have finished [your duties], labor hard [in worship].' },
      { id: 8, ar: 'وَإِلَىٰ رَبِّكَ فَارْغَب', pronounce: 'ওয়া ইলা রাব্বিকা ফারগাব।', bn: 'এবং একমাত্র আপনার রবের প্রতি গভীরভাবে আত্মনিয়োগ করুন।', en: 'And to your Lord direct [your] longing.' }
    ]
  },

  // Surah 95: At-Tin
  95: {
    id: 95,
    nameAr: 'التين',
    nameBn: 'সূরা আত-তীন',
    nameEn: 'At-Tin',
    meaning: 'আঞ্জীর / ডুমুর',
    versesCount: 8,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'وَالتِّينِ وَالزَّيْتُونِ', pronounce: 'ওয়াত তীনি ওয়ায যাইতূন।', bn: 'শপথ তীন (ডুমুর) ও যায়তুন (জলপাই)-এর,', en: 'By the fig and the olive' },
      { id: 2, ar: 'وَطُورِ سِينِينَ', pronounce: 'ওয়া তূরি সীনীন।', bn: 'এবং সীনাই পর্বতের,', en: 'And [by] Mount Sinai' },
      { id: 3, ar: 'وَهَٰذَا الْبَلَدِ الْأَمِينِ', pronounce: 'ওয়া হাযাল বালাদিল আমীন।', bn: 'এবং এই নিরাপদ নগরী (মক্কা)-র,', en: 'And [by] this secure city [Makkah],' },
      { id: 4, ar: 'لَقَدْ خَلَقْنَا الْإِنسَانَ فِي أَحْسَنِ تَقْوِيمٍ', pronounce: 'লাকাদ খালাকনাল ইনসানা ফী আহসানি তাক্বওয়ীম।', bn: 'নিশ্চয় আমি মানুষকে সৃষ্টি করেছি সর্বোত্তম সুন্দর গঠনে।', en: 'We have certainly created man in the best of stature;' },
      { id: 5, ar: 'ثُمَّ رَدَدْنَاهُ أَسْفَلَ سَافِلِينَ', pronounce: 'ছুম্মা রাদাদনাহু আসফালা সাফিলীন।', bn: 'অতঃপর আমি তাকে নামিয়ে দিয়েছি হীনতমদের নিম্নতম স্তরে।', en: 'Then We return him to the lowest of the low,' },
      { id: 6, ar: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ فَلَهُمْ أَجْرٌ غَيْرُ مَمْنُونٍ', pronounce: 'ইল্লাল্লাযীনা আমানূ ওয়া আমিলুস সালিহাতি ফালাহুম আজরুন গাইরু মামনূন।', bn: 'কিন্তু তারা ব্যতীত যারা ঈমান এনেছে ও সৎকাজ করেছে; তাদের জন্য রয়েছে নিরবচ্ছিন্ন অনন্ত প্রতিদান।', en: 'Except for those who believe and do righteous deeds, for they will have a reward uninterrupted.' },
      { id: 7, ar: 'فَمَا يُكَذِّبُكَ بَعْدُ بِالدِّينِ', pronounce: 'ফামা ইউকাযযিবুকা বা’দু বিদ্দীন।', bn: 'অতএব এর পর কিসে তোমাকে কর্মফল ও কিয়ামত অস্বীকারে প্ররোচিত করে?', en: 'So what yet causes you to deny the Recompense?' },
      { id: 8, ar: 'أَلَيْسَ اللَّهُ بِأَحْكَمِ الْحَاكِمِينَ', pronounce: 'আলাইসাল্লাহু বিআহকামিল হাকিমীন।', bn: 'আল্লাহ কি সকল বিচারকের সর্বশ্রেষ্ঠ বিচারক নন?', en: 'Is not Allah the most just of judges?' }
    ]
  },

  // Surah 97: Al-Qadr
  97: {
    id: 97,
    nameAr: 'القدر',
    nameBn: 'সূরা আল-কদর',
    nameEn: 'Al-Qadr',
    meaning: 'মহিমান্বিত রজনী / ভাগ্যরজনী',
    versesCount: 5,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'إِنَّا أَنزَلْنَاهُ فِي لَيْلَةِ الْقَدْرِ', pronounce: 'ইন্না আনযালনাহু ফী লাইলাতিল কাদর।', bn: 'নিশ্চয় আমি কুরআনকে অবতীর্ণ করেছি মহিমান্বিত শবে কদরের রাতে।', en: 'Indeed, We sent the Qur\'an down during the Night of Decree.' },
      { id: 2, ar: 'وَمَا أَدْرَاكَ مَا لَيْلَةُ الْقَدْرِ', pronounce: 'ওয়ামা আদরাকা মা লাইলাতুল কাদর।', bn: 'আর আপনি কি জানেন মহিমান্বিত লাইলাতুল কদর কী?', en: 'And what can make you know what is the Night of Decree?' },
      { id: 3, ar: 'لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ', pronounce: 'লাইলাতুল কাদরি খাইরুম মিন আলফি শাহর।', bn: 'লাইলাতুল কদর এক হাজার মাসের চেয়েও শ্রেষ্ঠ ও উত্তম।', en: 'The Night of Decree is better than a thousand months.' },
      { id: 4, ar: 'تَنَزَّلُ الْمَلَائِكَةُ وَالرُّوحُ فِيهَا بِإِذْنِ رَبِّهِم مِّن كُلِّ أَمْرٍ', pronounce: 'তানাযযালুল মালা-ইকাতু ওয়ার-রূহু ফীহা বিইযনি রাব্বিহিম মিন কুল্লি আমর।', bn: 'সে রাতে ফেরেশতাগণ ও জিবরাঈল (আ.) তাদের রবের অনুমতিক্রমে প্রত্যেক কল্যাণময় কাজের নির্দেশ নিয়ে অবতরণ করেন।', en: 'The angels and the Spirit descend therein by permission of their Lord for every matter.' },
      { id: 5, ar: 'سَلَامٌ هِيَ حَتَّىٰ مَطْلَعِ الْفَجْرِ', pronounce: 'সালামুন হিয়া হাত্তা মাতলা’ইল ফাজর।', bn: 'সে রাত পুরোপুরি শান্তি ও নিরাপত্তার, যা ঊষালগ্ন ও ফজর উদয় পর্যন্ত অব্যাহত থাকে।', en: 'Peace it is until the emergence of dawn.' }
    ]
  },

  // Surah 99: Az-Zalzalah
  99: {
    id: 99,
    nameAr: 'الزلزلة',
    nameBn: 'সূরা আয-যালযালাহ',
    nameEn: 'Az-Zalzalah',
    meaning: 'মহা ভূকম্পন',
    versesCount: 8,
    revelation: 'মাদানী',
    verses: [
      { id: 1, ar: 'إِذَا زُلْزِلَتِ الْأَرْضُ زِلْزَالَهَا', pronounce: 'ইযা যুলযিলাতিল আরদ্বু যিলযালাহা।', bn: 'যখন পৃথিবী তার মহা প্রকম্পনে প্রকম্পিত হবে,', en: 'When the earth is shaken with its [final] earthquake' },
      { id: 2, ar: 'وَأَخْرَجَتِ الْأَرْضُ أَثْقَالَهَا', pronounce: 'ওয়া আখরাজাতিল আরদ্বু আছকালাহা।', bn: 'এবং পৃথিবী তার ভেতরের সকল বোঝা বের করে দেবে,', en: 'And the earth discharges its burdens' },
      { id: 3, ar: 'وَقَالَ الْإِنسَانُ مَا لَهَا', pronounce: 'ওয়া ক্বালাল ইনসানু মা লাহা।', bn: 'এবং মানুষ ভীতসন্ত্রস্ত হয়ে বলবে, "এর কী হলো?"', en: 'And man says, "What is [wrong] with it?" -' },
      { id: 4, ar: 'يَوْمَئِذٍ تُحَدِّثُ أَخْبَارَهَا', pronounce: 'ইয়াওমা ইযিন তুহাদ্দিছু আখবারাহা।', bn: 'সেদিন পৃথিবী তার সমুদয় বৃত্তান্ত বর্ণনা করবে,', en: 'That Day, it will report its news' },
      { id: 5, ar: 'بِأَنَّ رَبَّكَ أَوْحَىٰ لَهَا', pronounce: 'বিআন্না রাব্বাকা আওহা লাহা।', bn: 'কারণ আপনার রব তাকে এ নির্দেশ দান করবেন।', en: 'Because your Lord has commanded it.' },
      { id: 6, ar: 'يَوْمَئِذٍ يَصْدُرُ النَّاسُ أَشْتَاتًا لِّيُرَوْا أَعْمَالَهُمْ', pronounce: 'ইয়াওমা ইযিয় ইয়াসদুরুন্নাছু আশতাতাল লিইউরাও আ’মালাহুম।', bn: 'সেদিন মানুষ বিভিন্ন দলে বিভক্ত হয়ে বের হয়ে আসবে, যাতে তাদেরকে তাদের কৃতকর্ম দেখানো যায়।', en: 'That Day, the people will proceed in scattered groups to be shown [the result of] their deeds.' },
      { id: 7, ar: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ', pronounce: 'ফামায় ইয়া’মাল মিছক্বালা যাররাতিন খাইরাইঁ যারাহ।', bn: 'অতএব কেউ অণু পরিমাণ সৎকাজ করলে সে তা দেখতে পাবে,', en: 'So whoever does an atom\'s weight of good will see it,' },
      { id: 8, ar: 'وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ', pronounce: 'ওয়ামায় ইয়া’মাল মিছক্বালা যাররাতিন শাররাইঁ যারাহ।', bn: 'এবং কেউ অণু পরিমাণ অসৎকাজ করলে তাও সে দেখতে পাবে।', en: 'And whoever does an atom\'s weight of evil will see it.' }
    ]
  },

  // Surah 103: Al-Asr
  103: {
    id: 103,
    nameAr: 'العصر',
    nameBn: 'সূরা আল-আসর',
    nameEn: 'Al-Asr',
    meaning: 'মহাকালের শপথ',
    versesCount: 3,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'وَالْعَصْرِ', pronounce: 'ওয়াল আসর।', bn: 'মহাকালের শপথ!', en: 'By time,' },
      { id: 2, ar: 'إِنَّ الْإِنسَانَ لَفِي خُسْرٍ', pronounce: 'ইন্নাল ইনসানা লাফী খুসর।', bn: 'নিশ্চয় সমগ্র মানবজাতি চরম ক্ষতির মধ্যে নিমজ্জিত,', en: 'Indeed, mankind is in loss,' },
      { id: 3, ar: 'إِلَّا الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ', pronounce: 'ইল্লাল্লাযীনা আমানূ ওয়া আমিলুস সালিহাতি ওয়া তাওয়া-সাও বিল হাক্কি ওয়া তাওয়া-সাও বিস সাবর।', bn: 'তারা ব্যতীত যারা ঈমান এনেছে, সৎকাজ করেছে এবং পরস্পরকে সত্যের উপদেশ দিয়েছে ও ধৈর্যের উপদেশ দিয়েছে।', en: 'Except for those who have believed and done righteous deeds and advised each other to truth and advised each other to patience.' }
    ]
  },

  // Surah 105: Al-Fil
  105: {
    id: 105,
    nameAr: 'الفيل',
    nameBn: 'সূরা আল-ফীল',
    nameEn: 'Al-Fil',
    meaning: 'হাতি বাহিনী',
    versesCount: 5,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ', pronounce: 'আলাম তারা কাইফা ফাআলা রাব্বুকা বিআসহাবিল ফীল।', bn: 'আপনি কি দেখেননি আপনার রব হস্তীওয়ালাদের সাথে কীরূপ আচরণ করেছিলেন?', en: 'Have you not considered, [O Muhammad], how your Lord dealt with the companions of the elephant?' },
      { id: 2, ar: 'أَلَمْ يَجْعَلْ كَيْدَهُمْ فِي تَضْلِيلٍ', pronounce: 'আলাম ইয়াজ’আল কাইদাহুম ফী তাদ্বলীল।', bn: 'তিনি কি তাদের চক্রান্ত সম্পূর্ণ ব্যর্থ করে দেননি?', en: 'Did He not make their plan into misguidance?' },
      { id: 3, ar: 'وَأَرْسَلَ عَلَيْهِمْ طَيْرًا أَبَابِيلَ', pronounce: 'ওয়া আরসালা আলাইহিম তাইরান আবাবীল।', bn: 'এবং তিনি তাদের বিরুদ্ধে প্রেরণ করেছিলেন ঝাঁকে ঝাঁকে আবাবিল পাখি,', en: 'And He sent against them birds in flocks,' },
      { id: 4, ar: 'تَرْمِيهِم بِحِجَارَةٍ مِّن سِجِّيلٍ', pronounce: 'তারমীহিম বিহিজারাতিম মিন সিজ্জীল।', bn: 'যারা তাদের ওপর নিক্ষেপ করেছিল পোড়ামাটির পাথরকণা,', en: 'Striking them with stones of hard clay,' },
      { id: 5, ar: 'فَجَعَلَهُمْ كَعَصْفٍ مَّأْكُولٍ', pronounce: 'ফাজাআলাহুম কা’আসফিম মা’কূল।', bn: 'অতঃপর তিনি তাদেরকে চিবানো ভূষির মতো বিধ্বস্ত করে ফেললেন।', en: 'And He made them like eaten straw.' }
    ]
  },

  // Surah 106: Quraish
  106: {
    id: 106,
    nameAr: 'قريش',
    nameBn: 'সূরা কুরাইশ',
    nameEn: 'Quraysh',
    meaning: 'কুরাইশ গোত্র',
    versesCount: 4,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'لِإِيلَافِ قُرَيْشٍ', pronounce: 'লিঈলা-ফি কুরাইশ।', bn: 'কুরাইশদের আসক্তির কারণে,', en: 'For the accustomed security of the Quraysh -' },
      { id: 2, ar: 'إِيلَافِهِمْ رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ', pronounce: 'ঈলা-ফিহিম রিহলাতাশ শিতা-ই ওয়াস সাইফ।', bn: 'শীত ও গ্রীষ্মকালীন বাণিজ্য সফরের অভ্যাসের কারণে,', en: 'Their accustomed security [in] the caravan of winter and summer -' },
      { id: 3, ar: 'فَلْيَعْبُدُوا رَبَّ هَٰذَا الْبَيْتِ', pronounce: 'ফালইয়া’বুদূ রাব্বা হাযাল বাইত।', bn: 'অতএব তারা যেন এই পবিত্র গৃহের (কাবা শরীফ) রবের ইবাদত করে,', en: 'Let them worship the Lord of this House,' },
      { id: 4, ar: 'الَّذِي أَطْعَمَهُم مِّن جُوعٍ وَآمَنَهُم مِّنْ خَوْفٍ', pronounce: 'আল্লাযী আত’আমাহুম মিন জু’ঈউঁ ওয়া আমানাহুম মিন খাওফ।', bn: 'যিনি তাদেরকে ক্ষুধার্ত অবস্থায় অন্ন দান করেছেন এবং ভীতি থেকে দিয়েছেন চির নিরাপত্তা।', en: 'Who has fed them, [saving them] from hunger and made them safe, [saving them] from fear.' }
    ]
  },

  // Surah 107: Al-Ma'un
  107: {
    id: 107,
    nameAr: 'الماعون',
    nameBn: 'সূরা আল-মাউন',
    nameEn: 'Al-Ma\'un',
    meaning: 'নিত্যপ্রয়োজনীয় সাহায্য',
    versesCount: 7,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'أَرَأَيْتَ الَّذِي يُكَذِّبُ بِالدِّينِ', pronounce: 'আরাআইতাল্লাযী ইউকাযযিবু বিদ্দীন।', bn: 'আপনি কি তাকে দেখেছেন, যে বিচার দিবসকে অস্বীকার করে?', en: 'Have you seen the one who denies the Recompense?' },
      { id: 2, ar: 'فَذَٰلِكَ الَّذِي يَدُعُّ الْيَتِيمَ', pronounce: 'ফাযালিকাল্লাযী ইয়াদু’উল ইয়াতীম।', bn: 'সে তো সেই ব্যক্তি, যে এতিমকে কঠোরভাবে তাড়িয়ে দেয়,', en: 'For that is the one who drives away the orphan' },
      { id: 3, ar: 'وَلَا يَحُضُّ عَلَىٰ طَعَامِ الْمِسْكِينِ', pronounce: 'ওয়ালা ইয়াহুদ্দু আলা তা’আমিল মিসকীন।', bn: 'এবং অভাবগ্রস্তকে খাদ্যদানে উৎসাহিত করে না।', en: 'And does not encourage the feeding of the poor.' },
      { id: 4, ar: 'فَوَيْلٌ لِّلْمُصَلِّينَ', pronounce: 'ফাওয়াইলুল লিল মুসল্লীন।', bn: 'অতএব দুর্ভোগ সেইসব নামাজীদের জন্য,', en: 'So woe to those who pray' },
      { id: 5, ar: 'الَّذِينَ هُمْ عَن صَلَاتِهِمْ سَاهُونَ', pronounce: 'আল্লাযীনা হুম আন সালা-তিহিম সাহূন।', bn: 'যারা তাদের নামাজে উদাসীন ও অমনোযোগী,', en: '[But] who are heedless of their prayer -' },
      { id: 6, ar: 'الَّذِينَ هُمْ يُرَاءُونَ', pronounce: 'আল্লাযীনা হুম ইউরা-উন।', bn: 'যারা কেবল লোকদেখানোর জন্য আমল করে,', en: 'Those who make a show [of their deeds]' },
      { id: 7, ar: 'وَيَمْنَعُونَ الْمَاعُونَ', pronounce: 'ওয়া ইয়ামনাউনাল মা’ঊন।', bn: 'এবং নিত্যপ্রয়োজনীয় সামান্য সাহায্যদানেও বাধা প্রদান করে।', en: 'And withhold [simple] assistance.' }
    ]
  },

  // Surah 108: Al-Kawthar
  108: {
    id: 108,
    nameAr: 'الكوثر',
    nameBn: 'সূরা আল-কাওসার',
    nameEn: 'Al-Kawthar',
    meaning: 'অফুরন্ত কল্যাণ ও হাউজে কাওসার',
    versesCount: 3,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ', pronounce: 'ইন্না আ’তাইনা-কাল কাওসার।', bn: 'নিশ্চয় আমি আপনাকে কাওসার (অফুরন্ত কল্যাণ ও সুপেয় নহর) দান করেছি।', en: 'Indeed, We have granted you, [O Muhammad], al-Kawthar.' },
      { id: 2, ar: 'فَصَلِّ لِرَبِّكَ وَانْحَرْ', pronounce: 'ফাসাল্লি লিরাব্বিকা ওয়ানহার।', bn: 'অতএব আপনি আপনার রবের উদ্দেশ্যে নামাজ পড়ুন এবং কোরবানি করুন।', en: 'So pray to your Lord and sacrifice [to Him alone].' },
      { id: 3, ar: 'إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ', pronounce: 'ইন্না শানিআকা হুওয়াল আবতার।', bn: 'নিশ্চয় আপনার শত্রুই নির্বংশ ও লেজকাটা।', en: 'Indeed, your enemy is the one cut off.' }
    ]
  },

  // Surah 109: Al-Kafirun
  109: {
    id: 109,
    nameAr: 'الكافرون',
    nameBn: 'সূরা আল-কাফিরুন',
    nameEn: 'Al-Kafirun',
    meaning: 'অবিশ্বাসী কাফেরগণ',
    versesCount: 6,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'قُلْ يَا أَيُّهَا الْكَافِرُونَ', pronounce: 'কুল ইয়া আইয়্যুহাল কাফিরূন।', bn: 'বলুন: হে অবিশ্বাসী কাফের সম্প্রদায়!', en: 'Say, "O disbelievers,' },
      { id: 2, ar: 'لَا أَعْبُدُ مَا تَعْبُدُونَ', pronounce: 'লা আ’বুদু মা তা’বুদূন।', bn: 'আমি তার ইবাদত করি না যার ইবাদত তোমরা করো,', en: 'I do not worship what you worship.' },
      { id: 3, ar: 'وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ', pronounce: 'ওয়ালা আনতুম আবিদূনা মা আ’বুদ।', bn: 'এবং তোমরাও তাঁর ইবাদতকারী নও যাঁর ইবাদত আমি করি,', en: 'Nor are you worshippers of what I worship.' },
      { id: 4, ar: 'وَلَا أَنَا عَابِدٌ مَّا عَبَدتُّمْ', pronounce: 'ওয়ালা আনা আবিদুম মা আবাদতুম।', bn: 'এবং আমি কখনো তার ইবাদতকারী হব না যার ইবাদত তোমরা করে আসছ,', en: 'Nor will I be a worshipper of what you worship.' },
      { id: 5, ar: 'وَلَا أَنتُمْ عَابِدُونَ مَا أَعْبُدُ', pronounce: 'ওয়ালা আনতুম আবিদূনা মা আ’বুদ।', bn: 'আর তোমরাও তাঁর ইবাদতকারী নও যাঁর ইবাদত আমি করি।', en: 'Nor will you be worshippers of what I worship.' },
      { id: 6, ar: 'لَكُمْ دِينُكُمْ وَلِيَ دِينِ', pronounce: 'লাকুম দীনুকুম ওয়ালিয়া দীন।', bn: 'তোমাদের জন্য তোমাদের ধর্ম এবং আমার জন্য আমার দীন।', en: 'For you is your religion, and for me is my religion."' }
    ]
  },

  // Surah 110: An-Nasr
  110: {
    id: 110,
    nameAr: 'النصر',
    nameBn: 'সূরা আন-নাসর',
    nameEn: 'An-Nasr',
    meaning: 'আল্লাহর সাহায্য ও বিজয়',
    versesCount: 3,
    revelation: 'মাদানী',
    verses: [
      { id: 1, ar: 'إِذَا جَاءَ نَصْرُ اللَّهِ وَالْفَتْحُ', pronounce: 'ইযা জা-আ নাসরুল্লাহি ওয়াল ফাতহ।', bn: 'যখন আল্লাহর সাহায্য ও পরম বিজয় সমাগত হবে,', en: 'When the victory of Allah has come and the conquest,' },
      { id: 2, ar: 'وَرَأَيْتَ النَّاسَ يَدْخُلُونَ فِي دِينِ اللَّهِ أَفْوَاجًا', pronounce: 'ওয়ারাআইতান নাছা ইয়াদখুলূনা ফী দীনিল্লাহি আফওয়াজা।', bn: 'এবং আপনি মানুষকে দলে দলে আল্লাহর দীনে প্রবেশ করতে দেখবেন,', en: 'And you see the people entering into the religion of Allah in multitudes,' },
      { id: 3, ar: 'فَسَبِّحْ بِحَمْدِ رَبِّكَ وَاسْتَغْفِرْهُ ۚ إِنَّهُ كَانَ تَوَّابًا', pronounce: 'ফাসাব্বিহ বিহামদি রাব্বিকা ওয়াসতাগফিরহু, ইন্নাহু কানা তাওয়াবা।', bn: 'তখন আপনি আপনার রবের প্রশংসাসহ পবিত্রতা ঘোষণা করুন এবং তাঁর নিকট ক্ষমা প্রার্থনা করুন; নিশ্চয় তিনি তওবা কবুলকারী।', en: 'Then exalt [Him] with praise of your Lord and ask forgiveness of Him. Indeed, He is ever Accepting of repentance.' }
    ]
  },

  // Surah 111: Al-Masad
  111: {
    id: 111,
    nameAr: 'المسد',
    nameBn: 'সূরা আল-লাহাব (আল-মাসাদ)',
    nameEn: 'Al-Masad',
    meaning: 'খেজুরের আঁশের শক্ত রশি',
    versesCount: 5,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'تَبَّتْ يَدَا أَبِي لَهَبٍ وَتَبَّ', pronounce: 'তাব্বাত ইয়াদা আবী লাহাবিউঁ ওয়াতাব্ব।', bn: 'ধ্বংস হোক আবু লাহাবের দুই হাত এবং সে নিজেও ধ্বংস হোক!', en: 'May the hands of Abu Lahab be ruined, and ruined is he.' },
      { id: 2, ar: 'مَا أَغْنَىٰ عَنْهُ مَالُهُ وَمَا كَسَبَ', pronounce: 'মা আগনা আনহু মালুহু ওয়ামা কাসাব।', bn: 'তার ধন-সম্পদ এবং যা সে অর্জন করেছে তা তার কোনো উপকারে আসেনি।', en: 'His wealth will not avail him or that which he gained.' },
      { id: 3, ar: 'سَيَصْلَىٰ نَارًا ذَاتَ لَهَبٍ', pronounce: 'সাইয়াসলা নারান যাতা লাহাব।', bn: 'অচিরেই সে দগ্ধ হবে লেলিহান অগ্নিশিখায়,', en: 'He will [enter to] burn in a Fire of [blazing] flame' },
      { id: 4, ar: 'وَامْرَأَتُهُ حَمَّالَةَ الْحَطَبِ', pronounce: 'ওয়ামরাআতুহু হাম্মা-লাতাল হাত্বাব।', bn: 'এবং তার স্ত্রীও—যে কাঁটার বোঝা বহনকারী,', en: 'And his wife [as well] - the carrier of firewood.' },
      { id: 5, ar: 'فِي جِيدِهَا حَبْلٌ مِّن مَّسَدٍ', pronounce: 'ফী জীদিহা হাবলুম মিম মাসাদ।', bn: 'তার গলায় থাকবে খেজুরের আঁশের পাকানো শক্ত রশি।', en: 'Around her neck is a rope of [twisted] fiber.' }
    ]
  },

  // Surah 112: Al-Ikhlas
  112: {
    id: 112,
    nameAr: 'الإخلاص',
    nameBn: 'সূরা আল-ইখলাস',
    nameEn: 'Al-Ikhlas',
    meaning: 'একত্ববাদ',
    versesCount: 4,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'قُلْ هُوَ اللَّهُ أَحَدٌ', pronounce: 'কুল হুওয়াল্লাহু আহাদ।', bn: 'বলুন, তিনিই আল্লাহ, একক-অদ্বিতীয়।', en: 'Say, "He is Allah, [who is] One.' },
      { id: 2, ar: 'اللَّهُ الصَّمَدُ', pronounce: 'আল্লাহুস সামাদ।', bn: 'আল্লাহ কারো মুখাপেক্ষী নন, সকলে তাঁর মুখাপেক্ষী।', en: 'Allah, the Eternal Refuge.' },
      { id: 3, ar: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', pronounce: 'লাম ইয়ালিদ ওয়ালাম ইউলাদ।', bn: 'তাঁর কোনো সন্তান নেই এবং তিনিও কারো সন্তান নন।', en: 'He neither begets nor is born,' },
      { id: 4, ar: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', pronounce: 'ওয়ালাম ইয়াকুল লাহু কুফুওয়ান আহাদ।', bn: 'এবং তাঁর সমকক্ষ কেউই নেই।', en: 'Nor is there to Him any equivalent.' }
    ]
  },

  // Surah 113: Al-Falaq
  113: {
    id: 113,
    nameAr: 'الفلق',
    nameBn: 'সূরা আল-ফালাক',
    nameEn: 'Al-Falaq',
    meaning: 'নিশিভোর / প্রত্যুষ',
    versesCount: 5,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ', pronounce: 'কুল আ’ঊযু বিরাব্বিল ফালাক্ব।', bn: 'বলুন, আমি আশ্রয় প্রার্থনা করছি প্রভাতের পালনকর্তার,', en: 'Say, "I seek refuge in the Lord of daybreak' },
      { id: 2, ar: 'مِن شَرِّ مَا خَلَقَ', pronounce: 'মিন শাররি মা খালাক্ব।', bn: 'তিনি যা সৃষ্টি করেছেন তার অনিষ্ট হতে,', en: 'From the evil of that which He created' },
      { id: 3, ar: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ', pronounce: 'ওয়া মিন শাররি গাসিক্বিন ইযা ওয়াক্বাব।', bn: 'এবং আঁধার রাতের অনিষ্ট হতে যখন তা সমাগত হয়,', en: 'And from the evil of darkness when it settles' },
      { id: 4, ar: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ', pronounce: 'ওয়া মিন শাররিন নাফ্ফা-ছাতি ফিল উক্বাদ।', bn: 'এবং গ্রন্থিতে ফুঁৎকার দানকারী জাদুকরিদের অনিষ্ট হতে,', en: 'And from the evil of the blowers in knots' },
      { id: 5, ar: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ', pronounce: 'ওয়া মিন শাররি হাসিদিন ইযা হাসাদ।', bn: 'এবং হিংসুকের অনিষ্ট হতে যখন সে হিংসা করে।', en: 'And from the evil of an envier when he envies.' }
    ]
  },

  // Surah 114: An-Nas
  114: {
    id: 114,
    nameAr: 'الناس',
    nameBn: 'সূরা আন-নাস',
    nameEn: 'An-Nas',
    meaning: 'সমগ্র মানবজাতি',
    versesCount: 6,
    revelation: 'মক্কী',
    verses: [
      { id: 1, ar: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ', pronounce: 'কুল আ’ঊযু বিরাব্বিন নাস।', bn: 'বলুন, আমি আশ্রয় প্রার্থনা করছি মানুষের প্রতিপালকের,', en: 'Say, "I seek refuge in the Lord of mankind,' },
      { id: 2, ar: 'مَلِكِ النَّاسِ', pronounce: 'মালিকিন নাস।', bn: 'মানুষের অধিপতির,', en: 'The Sovereign of mankind.' },
      { id: 3, ar: 'إِلَٰهِ النَّاسِ', pronounce: 'ইলাহিন নাস।', bn: 'মানুষের প্রকৃত মা’বূদের,', en: 'The God of mankind,' },
      { id: 4, ar: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ', pronounce: 'মিন শাররিল ওয়াসওয়াসিল খান্নাস।', bn: 'কুপ্ররোচনা দানকারীর অনিষ্ট হতে, যে সুযোগ বুঝে আত্মগোপন করে,', en: 'From the evil of the retreating whisperer -' },
      { id: 5, ar: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ', pronounce: 'আল্লাযী ইউওয়াসউইসু ফী সুদূরিন নাস।', bn: 'যে মানুষের অন্তরে কুমন্ত্রণা দেয়,', en: 'Who whispers [evil] into the breasts of mankind -' },
      { id: 6, ar: 'مِنَ الْجِنَّةِ وَالنَّاسِ', pronounce: 'মিনাল জিন্নাতি ওয়ান নাস।', bn: 'জ্বিন ও মানবজাতির মধ্য হতে।', en: 'From among the jinn and mankind.' }
    ]
  }
};
