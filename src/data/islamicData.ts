import { SurahItem, DuaItem, HadithItem } from '../types/mosque';

export const SURAH_LIST: SurahItem[] = [
  {
    id: 1,
    nameAr: 'سُورَةُ ٱلْفَاتِحَةِ',
    nameBn: 'সূরা আল-ফাতিহা',
    nameEn: 'Al-Fatihah',
    meaning: 'ভূমিকা / প্রারম্ভিক',
    versesCount: 7,
    revelation: 'মক্কী',
    verses: [
      {
        id: 1,
        ar: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
        pronounce: 'বিসমিল্লাহির রাহমানির রাহিম',
        bn: 'পরম করুণাময় অসীম দয়ালু আল্লাহর নামে শুরু করছি।',
        en: 'In the name of Allah, the Entirely Merciful, the Especially Merciful.'
      },
      {
        id: 2,
        ar: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
        pronounce: 'আলহামদুলিল্লাহি রাব্বিল আলামিন',
        bn: 'সকল প্রশংসা সৃষ্টিকুলের পালনকর্তা আল্লাহরই জন্য।',
        en: '[All] praise is [due] to Allah, Lord of the worlds.'
      },
      {
        id: 3,
        ar: 'الرَّحْمَٰنِ الرَّحِيمِ',
        pronounce: 'আর-রাহমানির রাহিম',
        bn: 'যিনি পরম দয়ালু এবং অতিশয় মেহেরবান।',
        en: 'The Entirely Merciful, the Especially Merciful.'
      },
      {
        id: 4,
        ar: 'مَالِكِ يَوْمِ الدِّينِ',
        pronounce: 'মালিকি ইয়াওমিদ দিন',
        bn: 'যিনি প্রতিফল দিবসের মালিক।',
        en: 'Sovereign of the Day of Recompense.'
      },
      {
        id: 5,
        ar: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
        pronounce: 'ইয়্যাকা না’বুদু ওয়া ইয়্যাকা নাসতা’ঈন',
        bn: 'আমরা কেবল তোমারই ইবাদত করি এবং কেবল তোমারই কাছে সাহায্য প্রার্থনা করি।',
        en: 'It is You we worship and You we ask for help.'
      },
      {
        id: 6,
        ar: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
        pronounce: 'ইহদিনাস সিরাতাল মুসতাকিম',
        bn: 'আমাদের সরল-সঠিক পথ প্রদর্শন করো।',
        en: 'Guide us to the straight path.'
      },
      {
        id: 7,
        ar: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
        pronounce: 'সিরাতাল্লাযিনা আন’আমতা আলাইহিম, গাইরিল মাগদুবি আলাইহিম ওয়ালাদ-দ্বোয়াল্লিন।',
        bn: 'তাদের পথ যাদের তুমি অনুগ্রহ দান করেছ; তাদের পথ নয় যাদের ওপর তোমার গজব পতিত হয়েছে এবং যারা পথভ্রষ্ট হয়েছে।',
        en: 'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.'
      }
    ]
  },
  {
    id: 255,
    nameAr: 'آيَةُ الْكُرْسِيِّ',
    nameBn: 'আয়াতুল কুরসী (সূরা আল-বাকারা: ২৫৫)',
    nameEn: 'Ayat-ul-Kursi',
    meaning: 'মহিমান্বিত সিংহাসনের আয়াত',
    versesCount: 1,
    revelation: 'মাদানী',
    verses: [
      {
        id: 255,
        ar: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَّهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِّنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
        pronounce: 'আল্লাহু লা ইলাহা ইল্লা হুওয়াল হাইয়্যুল ক্বাইয়্যুম, লা তা’খুযুহু সিনাতুঁও ওয়ালা নাওম, লাহু মা ফিস-সামাওয়াতি ওয়ামা ফিল আরদ্ব, মান যাল্লাযী ইয়াসফাউ ইনদাহু ইল্লা বিইযনিহ, ইয়া’লামু মা বাইনা আইদিহিম ওয়ামা খালফাহুম, ওয়ালা ইউহিতুনা বিশাইয়িম মিন ইলমিহি ইল্লা বিমা শাআ, ওয়াসিয়া কুরসিইয়্যুহুস সামাওয়াতি ওয়াল আরদ্ব, ওয়ালা ইয়ায়ুদুহু হিফজুহুমা, ওয়া হুওয়াল আলিয়্যুল আজীম।',
        bn: 'আল্লাহ ছাড়া অন্য কোনো উপাস্য নেই, তিনি চিরঞ্জীব, সবকিছুর ধারক। তাঁকে তন্দ্রা অথবা নিদ্রা স্পর্শ করে না। আকাশমণ্ডলে ও পৃথিবীতে যা কিছু আছে সবই তাঁর। কে আছে যে তাঁর অনুমতি ব্যতীত তাঁর কাছে সুপারিশ করবে? তাদের সম্মুখে ও পশ্চাতে যা কিছু আছে তিনি তা জানেন। তাঁর ইচ্ছানুযায়ী ছাড়া তারা তাঁর জ্ঞানের কিছুই আয়ত্ত করতে পারে না। তাঁর সিংহাসন আকাশ ও পৃথিবীময় পরিব্যাপ্ত, এবং তাদের রক্ষণাবেক্ষণ তাঁকে ক্লান্ত করে না; আর তিনিই সর্বোচ্চ, পরম মহান।',
        en: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of [all] existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is [presently] before them and what will be after them, and they encompass not a thing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.'
      }
    ]
  },
  {
    id: 36,
    nameAr: 'سُورَةُ يسٓ',
    nameBn: 'সূরা ইয়াসীন',
    nameEn: 'Surah Ya-Sin',
    meaning: 'কুরআনের হৃৎপিণ্ড',
    versesCount: 12,
    revelation: 'মক্কী',
    verses: [
      {
        id: 1,
        ar: 'يسٓ',
        pronounce: 'ইয়া-সীন।',
        bn: 'ইয়া-সীন।',
        en: 'Ya, Seen.'
      },
      {
        id: 2,
        ar: 'وَالْقُرْآنِ الْحَكِيمِ',
        pronounce: 'ওয়াল কুর’আনিল হাকীম।',
        bn: 'প্রজ্ঞাময় কুরআনের শপথ,',
        en: 'By the wise Qur’an,'
      },
      {
        id: 3,
        ar: 'إِنَّكَ لَمِنَ الْمُرْسَلِينَ',
        pronounce: 'ইন্নাকা লামিনাল মুরসালীন।',
        bn: 'নিশ্চয় আপনি প্রেরিত রসূলগণের একজন,',
        en: 'Indeed you, [O Muhammad], are from among the messengers,'
      },
      {
        id: 4,
        ar: 'عَلَىٰ صِرَاطٍ مُّسْتَقِيمٍ',
        pronounce: 'আলা সিরাতিম মুস্তাকীম।',
        bn: 'সরল সঠিক পথে প্রতিষ্ঠিত।',
        en: 'On a straight path.'
      },
      {
        id: 5,
        ar: 'تَنزِيلَ الْعَزِيزِ الرَّحِيمِ',
        pronounce: 'তানযীলাল আযীযির রাহীম।',
        bn: 'এ পরাক্রমশালী পরম দয়ালু আল্লাহর অবতারিত,',
        en: '[This is] a revelation of the Exalted in Might, the Merciful.'
      },
      {
        id: 6,
        ar: 'لِتُنذِرَ قَوْمًا مَّا أُنذِرَ آبَاؤُهُمْ فَهُمْ غَافِلُونَ',
        pronounce: 'লিতুনযিরা ক্বাওমাম মা উনযিরা আবা-উহুম ফাহুম গাফিলূন।',
        bn: 'যাতে আপনি এমন এক জাতিকে সতর্ক করেন যাদের পূর্বপুরুষগণকে সতর্ক করা হয়নি, যার কারণে তারা গাফেল।',
        en: 'That you may warn a people whose forefathers were not warned, so they are unaware.'
      },
      {
        id: 7,
        ar: 'لَقَدْ حَقَّ الْقَوْلُ عَلَىٰ أَكْثَرِهِمْ فَهُمْ لَا يُؤْمِنُونَ',
        pronounce: 'লাকাদ হাক্কাল কাওলু আলা আকছারিহিম ফাহুম লা ইউ’মিনূন।',
        bn: 'নিশ্চয় তাদের অধিকাংশের প্রতি আল্লাহর বাণী সাব্যস্ত হয়ে গেছে, ফলে তারা বিশ্বাস স্থাপন করবে না।',
        en: 'Already the word has come into effect upon most of them, so they do not believe.'
      },
      {
        id: 8,
        ar: 'إِنَّا جَعَلْنَا فِي أَعْنَاقِهِمْ أَغْلَالًا فَهِيَ إِلَى الْأَذْقَانِ فَهُم مُّقْمَحُونَ',
        pronounce: 'ইন্না জাআলনা ফী আ’নাক্বিহিম আগলা-লান ফাহিয়া ইলাল আযক্বানি ফাহুম মুকমাহূন।',
        bn: 'আমি তাদের গলায় গলদেশ পর্যন্ত লৌহবেড়ী পরিয়ে দিয়েছি, ফলে তাদের মস্তক ঊর্ধ্বমুখী হয়ে আছে।',
        en: 'Indeed, We have put shackles on their necks, and they are to their chins, so they are with heads [kept] aloft.'
      },
      {
        id: 9,
        ar: 'وَجَعَلْنَا مِن بَيْنِ أَيْدِيهِمْ سَدًّا وَمِنْ خَلْفِهِمْ سَدًّا فَأَغْشَيْنَاهُمْ فَهُمْ لَا يُبْصِرُونَ',
        pronounce: 'ওয়া জাআলনা মিম বাইনি আইদীহিম সাদ্দাউঁ ওয়া মিন খালফিহিম সাদ্দান ফাআগশাইনাহুম ফাহুম লা ইউবসিরূন।',
        bn: 'এবং আমি তাদের সামনে একটি প্রাচীর ও তাদের পেছনে একটি প্রাচীর স্থাপন করেছি, অতঃপর তাদেরকে আবৃত করে দিয়েছি, ফলে তারা দেখতে পায় না।',
        en: 'And We have put before them a barrier and behind them a barrier and covered them, so they do not see.'
      }
    ]
  },
  {
    id: 67,
    nameAr: 'سُورَةُ الْمُلْكِ',
    nameBn: 'সূরা আল-মুলক',
    nameEn: 'Surah Al-Mulk',
    meaning: 'সার্বভৌম কর্তৃত্ব / কবরের আজাব থেকে রক্ষাকারী',
    versesCount: 5,
    revelation: 'মক্কী',
    verses: [
      {
        id: 1,
        ar: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',
        pronounce: 'তাবারাকাল্লাযী বিইয়াদিহিল মুলকু ওয়াহুওয়া আলা কুল্লি শাইয়িন কাদীর।',
        bn: 'কত বরকতময় তিনি যাঁর হাতে সমগ্র রাজত্ব এবং যিনি সর্ববিষয়ে সর্বশক্তিমান।',
        en: 'Blessed is He in whose hand is dominion, and He is over all things competent -'
      },
      {
        id: 2,
        ar: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا ۚ وَهُوَ الْعَزِيزُ الْغَفُورُ',
        pronounce: 'আল্লাযী খালাকাল মাওতা ওয়াল হায়াতা লিইয়াবলুওয়াকুম আইয়্যুকুম আহসানু আমালা, ওয়াহুওয়াল আযীযুল গাফুর।',
        bn: 'যিনি মৃত্যু ও জীবন সৃষ্টি করেছেন তোমাদেরকে পরীক্ষা করার জন্য—কে তোমাদের মধ্যে কর্মে শ্রেষ্ঠ? আর তিনি পরাক্রমশালী, অতি ক্ষমাশীল।',
        en: '[He] who created death and life to test you [as to] which of you is best in deed - and He is the Exalted in Might, the Forgiving -'
      },
      {
        id: 3,
        ar: 'الَّذِي خَلَقَ سَبْعَ سَمَاوَاتٍ طِبَاقًا ۖ مَّا تَرَىٰ فِي خَلْقِ الرَّحْمَٰنِ مِن تَفَاوُتٍ ۖ فَارْجِعِ الْبَصَرَ هَلْ تَرَىٰ مِن فُطُورٍ',
        pronounce: 'আল্লাযী খালাকা সাব’আ সামাওয়া-তিন তিবা-কা, মা তারা ফী খালকির রাহমানি মিন তাফাউত, ফারজিইল বাসারা হাল তারা মিন ফুতূর।',
        bn: 'যিনি স্তরে স্তরে সপ্ত আকাশ সৃষ্টি করেছেন। পরম করুণাময়ের সৃষ্টিতে তুমি কোনো অসামঞ্জস্য দেখতে পাবে না। দৃষ্টি ফিরিয়ে দেখ, কোনো ত্রুটি দেখতে পাও কি?',
        en: '[And] who created seven heavens in layers. You do not see in the creation of the Most Merciful any inconsistency. So return [your] vision [to the sky]; do you see any breaks?'
      }
    ]
  },
  {
    id: 112,
    nameAr: 'سُورَةُ الْإِخْلَاصِ',
    nameBn: 'সূরা আল-ইখলাস',
    nameEn: 'Al-Ikhlas',
    meaning: 'একত্ববাদ',
    versesCount: 4,
    revelation: 'মক্কী',
    verses: [
      {
        id: 1,
        ar: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
        pronounce: 'কুল হুওয়াল্লাহু আহাদ',
        bn: 'বলুন, তিনিই আল্লাহ, একক-অদ্বিতীয়।',
        en: 'Say, "He is Allah, [who is] One.'
      },
      {
        id: 2,
        ar: 'اللَّهُ الصَّمَدُ',
        pronounce: 'আল্লাহুস সামাদ',
        bn: 'আল্লাহ কারো মুখাপেক্ষী নন, সকলেই তাঁর মুখাপেক্ষী।',
        en: 'Allah, the Eternal Refuge.'
      },
      {
        id: 3,
        ar: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
        pronounce: 'লাম ইয়ালিদ ওয়ালাম ইউলাদ',
        bn: 'তাঁর কোনো সন্তান নেই এবং তিনিও কারো সন্তান নন।',
        en: 'He neither begets nor is born,'
      },
      {
        id: 4,
        ar: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
        pronounce: 'ওয়ালাম ইয়াকুল লাহু কুফুওয়ান আহাদ',
        bn: 'এবং তাঁর সমকক্ষ কেউই নেই।',
        en: 'Nor is there to Him any equivalent.'
      }
    ]
  },
  {
    id: 113,
    nameAr: 'سُورَةُ الْفَلَقِ',
    nameBn: 'সূরা আল-ফালাক্ব',
    nameEn: 'Al-Falaq',
    meaning: 'নিশিভোর / প্রত্যুষ',
    versesCount: 5,
    revelation: 'মক্কী',
    verses: [
      {
        id: 1,
        ar: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
        pronounce: 'কুল আ’ঊযু বিরাব্বিল ফালাক্ব',
        bn: 'বলুন, আমি আশ্রয় প্রার্থনা করছি প্রভাতের পালনকর্তার,',
        en: 'Say, "I seek refuge in the Lord of daybreak'
      },
      {
        id: 2,
        ar: 'مِن شَرِّ مَا خَلَقَ',
        pronounce: 'মিন শাররি মা খালাক্ব',
        bn: 'তিনি যা সৃষ্টি করেছেন তার অনিষ্ট হতে,',
        en: 'From the evil of that which He created'
      },
      {
        id: 3,
        ar: 'وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ',
        pronounce: 'ওয়া মিন শাররি গাসিক্বিন ইযা ওয়াক্বাব',
        bn: 'এবং আঁধার রাতের অনিষ্ট হতে যখন তা সমাগত হয়,',
        en: 'And from the evil of darkness when it settles'
      },
      {
        id: 4,
        ar: 'وَمِن شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ',
        pronounce: 'ওয়া মিন শাররিন নাফ্ফা-ছাতি ফিল উক্বাদ',
        bn: 'এবং গ্রন্থিতে ফুঁৎকার দানকারী জাদুকরিদের অনিষ্ট হতে,',
        en: 'And from the evil of the blowers in knots'
      },
      {
        id: 5,
        ar: 'وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
        pronounce: 'ওয়া মিন শাররি হাসিদিন ইযা হাসাদ',
        bn: 'এবং হিংসুকের অনিষ্ট হতে যখন সে হিংসা করে।',
        en: 'And from the evil of an envier when he envies.'
      }
    ]
  },
  {
    id: 114,
    nameAr: 'سُورَةُ النَّاسِ',
    nameBn: 'সূরা আন-নাস',
    nameEn: 'An-Nas',
    meaning: 'মানবজাতি',
    versesCount: 6,
    revelation: 'মক্কী',
    verses: [
      {
        id: 1,
        ar: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ',
        pronounce: 'কুল আ’ঊযু বিরাব্বিন নাস',
        bn: 'বলুন, আমি আশ্রয় প্রার্থনা করছি মানুষের প্রতিপালকের,',
        en: 'Say, "I seek refuge in the Lord of mankind,'
      },
      {
        id: 2,
        ar: 'مَلِكِ النَّاسِ',
        pronounce: 'মালিকিন নাস',
        bn: 'মানুষের অধিপতির,',
        en: 'The Sovereign of mankind.'
      },
      {
        id: 3,
        ar: 'إِلَٰهِ النَّاسِ',
        pronounce: 'ইলাহিন নাস',
        bn: 'মানুষের প্রকৃত মা’বূদের,',
        en: 'The God of mankind,'
      },
      {
        id: 4,
        ar: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
        pronounce: 'মিন শাররিল ওয়াসওয়াসিল খান্নাস',
        bn: 'কুপ্ররোচনা দানকারীর অনিষ্ট হতে, যে সুযোগ বুঝে আত্মগোপন করে,',
        en: 'From the evil of the retreating whisperer -'
      },
      {
        id: 5,
        ar: 'الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ',
        pronounce: 'আল্লাযী ইউওয়াসউইসু ফী সুদূরিন নাস',
        bn: 'যে মানুষের অন্তরে কুমন্ত্রণা দেয়,',
        en: 'Who whispers [evil] into the breasts of mankind -'
      },
      {
        id: 6,
        ar: 'مِنَ الْجِنَّةِ وَالنَّاسِ',
        pronounce: 'মিনাল জিন্নাতি ওয়ান নাস',
        bn: 'জ্বিন ও মানবজাতির মধ্য হতে।',
        en: 'From among the jinn and mankind.'
      }
    ]
  }
];

import { COMPREHENSIVE_DUAS } from './duasData';

export const MASNOON_DUAS: DuaItem[] = COMPREHENSIVE_DUAS;


export const DAILY_HADITHS: HadithItem[] = [
  {
    id: 1,
    topic: 'মসজিদ নির্মাণ',
    narrator: 'উসমান ইবনে আফফান (রা.) থেকে বর্ণিত',
    source: 'সহীহ বুখারী: ৪৫০, সহীহ মুসলিম: ৫৩৩',
    bn: 'রাসূলুল্লাহ (সা.) বলেছেন: "যে ব্যক্তি আল্লাহর সন্তুষ্টির উদ্দেশ্যে একটি মসজিদ নির্মাণ করবে, আল্লাহ তার জন্য জান্নাতে অনুরূপ একটি ঘর তৈরি করবেন।"',
    en: 'The Prophet (ﷺ) said: "Whoever builds a mosque for Allah, Allah will build for him a house like it in Paradise."'
  },
  {
    id: 2,
    topic: 'নামাজ ও ফজিলত',
    narrator: 'আবু হুরায়রা (রা.) থেকে বর্ণিত',
    source: 'সহীহ মুসলিম: ৬৬৬',
    bn: 'রাসূলুল্লাহ (সা.) বলেছেন: "বান্দা যখন সিজদারত থাকে, তখন সে তার রবের সবচেয়ে নিকটবর্তী হয়। অতএব তোমরা সিজদায় বেশি বেশি দুআ করো।"',
    en: 'The Prophet (ﷺ) said: "The nearest a servant comes to his Lord is when he is prostrating itself, so make abundant supplication [then]."'
  },
  {
    id: 3,
    topic: 'দান-সদকার বরকত',
    narrator: 'আবু হুরায়রা (রা.) থেকে বর্ণিত',
    source: 'সহীহ মুসলিম: ২৫৮৮',
    bn: 'রাসূলুল্লাহ (সা.) বলেছেন: "দান-সদকা করার কারণে কখনো কারো ধন-সম্পদ কমে না, এবং যে ব্যক্তি ক্ষমা করে আল্লাহ তার সম্মান বাড়িয়ে দেন।"',
    en: 'The Prophet (ﷺ) said: "Charity does not decrease wealth, and no one forgives another except that Allah increases his honor."'
  },
  {
    id: 4,
    topic: 'পিতা-মাতা ও সদাচরণ',
    narrator: 'আব্দুল্লাহ ইবনে আমর (রা.) থেকে বর্ণিত',
    source: 'জামে তিরমিযী: ১৮৯৯',
    bn: 'রাসূলুল্লাহ (সা.) বলেছেন: "পিতার সন্তুষ্টির মধ্যেই আল্লাহর সন্তুষ্টি নিহিত রয়েছে, এবং পিতার অসন্তুষ্টির মধ্যেই আল্লাহর অসন্তুষ্টি নিহিত রয়েছে।"',
    en: 'The Prophet (ﷺ) said: "The pleasure of the Lord is in the pleasure of the parent, and the displeasure of the Lord is in the displeasure of the parent."'
  },
  {
    id: 5,
    topic: 'জিকিরের শ্রেষ্ঠত্ব',
    narrator: 'আবু হুরায়রা (রা.) থেকে বর্ণিত',
    source: 'সহীহ বুখারী: ৬৪০৭',
    bn: 'রাসূলুল্লাহ (সা.) বলেছেন: "দুটি বাক্য এমন রয়েছে যা জিহ্বায় উচ্চারণে অত্যন্ত সহজ, দাড়িপাল্লায় অত্যন্ত ভারী এবং দয়াময় আল্লাহর কাছে অত্যন্ত প্রিয়: সুবহানাল্লাহি ওয়া বিহামদিহি, সুবহানাল্লাহিল আজীম।"',
    en: 'The Prophet (ﷺ) said: "Two words are light on the tongue, heavy in the Balance, and beloved to the Most Merciful: Subhan Allahi wa bihamdihi, Subhan Allahil Azeem."'
  }
];

export const PRESET_ZIKRS = [
  {
    id: 'subhanallah',
    ar: 'سُبْحَانَ اللَّهِ',
    bn: 'সুবহানাল্লাহ',
    meaning: 'আল্লাহ অতি পবিত্র ও নিষ্পাপ',
    target: 33,
    virtue: 'প্রতিটি উচ্চারণে জান্নাতে একটি করে গাছ রোপণ করা হয়।'
  },
  {
    id: 'alhamdulillah',
    ar: 'الْحَمْدُ لِلَّهِ',
    bn: 'আলহামদুলিল্লাহ',
    meaning: 'সমস্ত প্রশংসা একমাত্র আল্লাহর জন্য',
    target: 33,
    virtue: 'মিযানের পাল্লা নেকিতে ভরিয়ে দেয়।'
  },
  {
    id: 'allahuakbar',
    ar: 'اللَّهُ أَكْبَرُ',
    bn: 'আল্লাহু আকবার',
    meaning: 'আল্লাহ সর্বশ্রেষ্ঠ ও মহান',
    target: 34,
    virtue: 'আসমান ও জমিনের মধ্যবর্তী শূন্যস্থান সওয়াবে পূর্ণ করে।'
  },
  {
    id: 'lailahaillallah',
    ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    bn: 'লা ইলাহা ইল্লাল্লাহ',
    meaning: 'আল্লাহ ছাড়া কোনো সত্য উপাস্য নেই',
    target: 100,
    virtue: 'সর্বশ্রেষ্ঠ জিকির ও জান্নাতের চাবিকাঠি।'
  },
  {
    id: 'astaghfirullah',
    ar: 'أَسْتَغْفِرُ اللَّهَ',
    bn: 'আস্তাগফিরুল্লাহ',
    meaning: 'আমি আল্লাহর নিকট ক্ষমা প্রার্থনা করছি',
    target: 100,
    virtue: 'দুশ্চিন্তা দূর করে, রিজিক বৃদ্ধি করে ও গোনাহ মোচন করে।'
  },
  {
    id: 'durood',
    ar: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    bn: 'আল্লাহুম্মা সাল্লি আলা মুহাম্মাদ',
    meaning: 'হে আল্লাহ! হযরত মুহাম্মদ (সা.)-এর প্রতি রহমত বর্ষণ করুন',
    target: 100,
    virtue: 'একবার পাঠে আল্লাহ ১০টি রহমত নাজিল করেন ও ১০টি মর্যাদা বৃদ্ধি করেন।'
  },
  {
    id: 'lahawla',
    ar: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    bn: 'লা হাওলা ওয়ালা কুওয়াতা ইল্লা বিল্লাহ',
    meaning: 'আল্লাহর সাহায্য ছাড়া পাপ থেকে বাঁচার ও নেক কাজ করার শক্তি নেই',
    target: 33,
    virtue: 'জান্নাতের অমূল্য রত্নভাণ্ডারের একটি রত্ন।'
  }
];

export const DAILY_AMAL_ITEMS = [
  { id: 'fajr_prayer', titleBn: 'ফজরের নামাজ জামাতে আদায়', score: 20 },
  { id: 'dhuhr_prayer', titleBn: 'যোহরের নামাজ আদায়', score: 15 },
  { id: 'asr_prayer', titleBn: 'আসরের নামাজ আদায়', score: 15 },
  { id: 'maghrib_prayer', titleBn: 'মাগরিবের নামাজ আদায়', score: 15 },
  { id: 'isha_prayer', titleBn: 'এশার নামাজ জামাতে আদায়', score: 20 },
  { id: 'quran_recite', titleBn: 'কুরআন তিলাওয়াত (সূরা ইয়াসীন বা মুলক)', score: 15 },
  { id: 'morning_zikr', titleBn: 'সকাল ও সন্ধ্যার তাসবীহ/জিকির', score: 10 },
  { id: 'charity_sadaqah', titleBn: 'মসজিদে দান বা গরিবকে সদকা', score: 10 },
  { id: 'dua_parents', titleBn: 'পিতা-মাতার জন্য মাগফিরাতের দুআ', score: 10 },
  { id: 'surah_kahf_jummah', titleBn: 'সূরা আল-কাহাফ পাঠ (জুমার দিন)', score: 10 }
];
