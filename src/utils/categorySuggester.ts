/**
 * Smart Auto-Suggestion engine for Mosque Transaction categories
 * Analyzes keywords in transaction note/description (English, Bengali, transliteration)
 */

export interface CategorySuggestionResult {
  category: string;
  matchedKeyword: string;
  type: 'in' | 'out';
  confidence: 'high' | 'medium';
  explanation: string;
}

interface KeywordRule {
  category: string;
  type: 'in' | 'out';
  keywords: string[];
  explanation: string;
}

const KEYWORD_RULES: KeywordRule[] = [
  // --- EXPENSE CATEGORIES ('out') ---
  {
    category: 'বিদ্যুৎ (কারেন্ট) বিল',
    type: 'out',
    keywords: [
      'light bill', 'light', 'electricity', 'electric bill', 'current bill', 'current',
      'power', 'power bill', 'desco', 'nesco', 'dpdc', 'reb', 'meter', 'মিটার',
      'কারেন্ট', 'বিদ্যুৎ', 'কারেন্ট বিল', 'বিদ্যুৎ বিল', 'ডেসকো', 'নেসকো', 'পল্লী বিদ্যুৎ',
      'লাইট বিল', 'মিটার বিল', 'বোর্ড বিল'
    ],
    explanation: 'বিদ্যুৎ বা আলোর বিল সম্পর্কিত কি-ওয়ার্ড পাওয়া গেছে'
  },
  {
    category: 'ইমাম/হুজুরের বেতন',
    type: 'out',
    keywords: [
      'imam', 'hujur', 'khatib', 'pesh imam', 'imam salary', 'salary', 'honorarium',
      'ইমাম', 'হুজুর', 'খতিব', 'ইমামের বেতন', 'হুজুরের বেতন', 'বেতন', 'সম্মানী', 'হাদিয়া',
      'ইমাম সাহেব', 'খতিব সাহেব', 'ইমাম ভাতা'
    ],
    explanation: 'ইমাম বা খতিব সাহেবের বেতন/সম্মানী কি-ওয়ার্ড সনাক্ত হয়েছে'
  },
  {
    category: 'মুয়াজ্জিনের বেতন',
    type: 'out',
    keywords: [
      'muazzin', 'moazzem', 'azaan', 'muazzin salary', 'moazzin',
      'মুয়াজ্জিন', 'মোয়াজ্জিন', 'মুয়াজ্জিনের বেতন', 'মোয়াজ্জিন বেতন', 'মুয়াজ্জিন হাদিয়া', 'আজান'
    ],
    explanation: 'মুয়াজ্জিন সাহেবের বেতন/ভাতা কি-ওয়ার্ড সনাক্ত হয়েছে'
  },
  {
    category: 'গ্যাস বিল',
    type: 'out',
    keywords: [
      'gas', 'gas bill', 'titas', 'titas gas', 'cylinder',
      'গ্যাস', 'গ্যাস বিল', 'তিতাস', 'তিতাস গ্যাস', 'সিলিন্ডার'
    ],
    explanation: 'গ্যাস বিল সম্পর্কিত কি-ওয়ার্ড সনাক্ত হয়েছে'
  },
  {
    category: 'পানি বিল',
    type: 'out',
    keywords: [
      'water', 'water bill', 'wasa', 'wasa bill',
      'পানি', 'পানির বিল', 'ওয়াসা', 'ওয়াসা', 'পানি বিল'
    ],
    explanation: 'পানির বিল সম্পর্কিত কি-ওয়ার্ড সনাক্ত হয়েছে'
  },
  {
    category: 'উন্নয়ন খরচ',
    type: 'out',
    keywords: [
      'construction', 'development', 'renovation', 'repair', 'servicing',
      'tiles', 'paint', 'cement', 'rod', 'brick', 'sand',
      'ac', 'air condition', 'fan', 'sound', 'mike', 'microphone', 'speaker', 'amplifier',
      'carpet', 'mat', 'pump', 'filter', 'pipe', 'bathroom', 'washroom', 'gate', 'roof',
      'টাইলস', 'রং', 'সিমেন্ট', 'রড', 'ইট', 'বালু', 'উন্নয়ন', 'নির্মাণ', 'মেরামত',
      'এসি', 'ফ্যান', 'মাইক', 'সাউন্ড', 'স্পিকার', 'এমপ্লিফায়ার', 'কার্পেট', 'পাম্প',
      'ফিল্টার', 'পাইপ', 'গেট', 'ছাদ ঢালাই', 'ওযুখানার কাজ', 'টয়লেট', 'বাথরুম'
    ],
    explanation: 'মসজিদ উন্নয়ন, নির্মাণ বা মেরামত সামগ্রীর কি-ওয়ার্ড সনাক্ত হয়েছে'
  },
  {
    category: 'মাসিক খরচ',
    type: 'out',
    keywords: [
      'monthly expense', 'cleaning', 'soap', 'harpic', 'tissue', 'broom',
      'মাসিক খরচ', 'পরিষ্কার', 'ঝাড়ু', 'সাবান', 'হারপিক', 'টিস্যু', 'মোবাইল বিল', 'ওয়াইফাই বিল'
    ],
    explanation: 'মাসিক নিয়মিত পরিচ্ছন্নতা ও ইউটিলিটি কি-ওয়ার্ড সনাক্ত হয়েছে'
  },
  {
    category: 'অন্যান্য খরচ',
    type: 'out',
    keywords: [
      'rent', 'office rent', 'land rent', 'fare', 'transport', 'tea', 'refreshment',
      'food', 'snack', 'entertainment', 'other expense', 'misc',
      'ভাড়া', 'অফিস ভাড়া', 'জমি ভাড়া', 'গাড়ি ভাড়া', 'যাতায়াত', 'চা', 'নাস্তা',
      'আপ্যায়ন', 'খাবার', 'অন্যান্য খরচ', 'বিবিধ'
    ],
    explanation: 'ভাড়া বা বিবিধ ব্যয়ের কি-ওয়ার্ড সনাক্ত হয়েছে'
  },

  // --- INCOME CATEGORIES ('in') ---
  {
    category: 'জুমার দান',
    type: 'in',
    keywords: [
      'juma', 'jummah', 'friday', 'box', 'donation box', 'collection', 'friday collection',
      'জুমা', 'জুম্মা', 'শুক্রবার', 'জুমার দান', 'দানবাক্স', 'বাক্স', 'জুমার কালেকশন', 'শুক্রবার দান'
    ],
    explanation: 'জুমার নামাজ বা দানবাক্সের অনুদান কি-ওয়ার্ড সনাক্ত হয়েছে'
  },
  {
    category: 'সদস্যদের দান/চাঁদা',
    type: 'in',
    keywords: [
      'member', 'monthly subscription', 'chanda', 'subscription', 'monthly chanda',
      'সদস্য', 'চাঁদা', 'মাসিক চাঁদা', 'সদস্যদের চাঁদা', 'সদস্য চাঁদা', 'নিয়মিত চাঁদা', 'মাসিক অনুদান'
    ],
    explanation: 'মসজিদ কমিটির সদস্যদের নিয়মিত চাঁদা কি-ওয়ার্ড সনাক্ত হয়েছে'
  },
  {
    category: 'মক্তবের বেতন/ফি',
    type: 'in',
    keywords: [
      'maktab', 'moktob', 'student', 'tuition', 'fee', 'beton', 'chhatro', 'madrasa', 'noorani',
      'মক্তব', 'মক্তবের বেতন', 'ছাত্র বেতন', 'ছাত্রীর বেতন', 'মাদ্রাসার বেতন', 'মক্তব ফি', 'পড়াশোনার ফি', 'নূরানী'
    ],
    explanation: 'মক্তব বা মাদ্রাসার শিক্ষার্থীর বেতন/ফি কি-ওয়ার্ড সনাক্ত হয়েছে'
  },
  {
    category: 'বিশেষ দান',
    type: 'in',
    keywords: [
      'donation', 'special donation', 'special', 'gift', 'sadaqah', 'sadakah', 'manat', 'lump sum',
      'দান', 'বিশেষ দান', 'এককালীন দান', 'অনুদান', 'সদকা', 'মানত', 'হাদিয়া', 'টাইলসের দান', 'এসি দান'
    ],
    explanation: 'এককালীন বা বিশেষ অনুদানের কি-ওয়ার্ড সনাক্ত হয়েছে'
  },
  {
    category: 'যাকাত/ফিতরা',
    type: 'in',
    keywords: [
      'zakat', 'zakah', 'fitra', 'fitrah', 'sadakatul fitr', 'poor fund',
      'যাকাত', 'ফিতরা', 'সদকাতুল ফিতর', 'ফিতরা ফান্ড', 'যাকাত ফান্ড'
    ],
    explanation: 'যাকাত বা ফিতরা অনুদানের কি-ওয়ার্ড সনাক্ত হয়েছে'
  },
  {
    category: 'ধান বিক্রি',
    type: 'in',
    keywords: [
      'paddy', 'dhan', 'rice', 'grain', 'mon', 'kg',
      'ধান', 'ধান বিক্রি', 'আমন ধান', 'বোরো ধান', 'মণ', 'চাল'
    ],
    explanation: 'ধান বিক্রয়লব্ধ আয়ের কি-ওয়ার্ড সনাক্ত হয়েছে'
  },
  {
    category: 'মুসল্লিদের দান',
    type: 'in',
    keywords: [
      'musalli', 'general', 'general donation', 'cash donation', 'casual',
      'মুসল্লি', 'মুসল্লিদের দান', 'সাধারণ দান', 'ওয়াক্তি মুসল্লি', 'হাতে দান'
    ],
    explanation: 'সাধারণ মুসল্লিদের দানের কি-ওয়ার্ড সনাক্ত হয়েছে'
  },
  {
    category: 'অন্যান্য আয়',
    type: 'in',
    keywords: [
      'rent income', 'shop rent', 'rent', 'market rent', 'pond', 'lease', 'other income',
      'দোকান ভাড়া', 'মার্কেট ভাড়া', 'ভাড়া আদায়', 'পুকুর ইজারা', 'জমি ইজারা', 'অন্যান্য আয়', 'ভাড়া'
    ],
    explanation: 'মার্কেট/দোকান ভাড়া বা অন্যান্য আয়ের কি-ওয়ার্ড সনাক্ত হয়েছে'
  }
];

/**
 * Suggest a category based on note or description text and current transaction type ('in' | 'out')
 */
export function suggestCategoryFromKeyword(
  text: string,
  preferredType: 'in' | 'out'
): {
  topSuggestion: CategorySuggestionResult | null;
  crossTypeSuggestion: CategorySuggestionResult | null;
  allMatching: CategorySuggestionResult[];
} {
  if (!text || text.trim().length < 2) {
    return { topSuggestion: null, crossTypeSuggestion: null, allMatching: [] };
  }

  const cleanText = text.toLowerCase().trim();

  const matches: CategorySuggestionResult[] = [];

  for (const rule of KEYWORD_RULES) {
    for (const kw of rule.keywords) {
      const lowerKw = kw.toLowerCase();
      // Match whole word or exact inclusion
      if (cleanText.includes(lowerKw)) {
        // High confidence if keyword has length >= 4 or matches word boundary
        const isLongKw = lowerKw.length >= 4;
        const confidence: 'high' | 'medium' = isLongKw ? 'high' : 'medium';

        matches.push({
          category: rule.category,
          matchedKeyword: kw,
          type: rule.type,
          confidence,
          explanation: rule.explanation
        });
        break; // Match rule once
      }
    }
  }

  // Same-type matches (e.g. current tab is 'out', and rule is 'out')
  const sameTypeMatches = matches.filter((m) => m.type === preferredType);
  // Sort high confidence first, then longer keyword matches
  sameTypeMatches.sort((a, b) => {
    if (a.confidence === 'high' && b.confidence !== 'high') return -1;
    if (b.confidence === 'high' && a.confidence !== 'high') return 1;
    return b.matchedKeyword.length - a.matchedKeyword.length;
  });

  // Cross-type matches (e.g. user typed 'light bill' in income tab)
  const crossTypeMatches = matches.filter((m) => m.type !== preferredType);
  crossTypeMatches.sort((a, b) => {
    if (a.confidence === 'high' && b.confidence !== 'high') return -1;
    if (b.confidence === 'high' && a.confidence !== 'high') return 1;
    return b.matchedKeyword.length - a.matchedKeyword.length;
  });

  return {
    topSuggestion: sameTypeMatches[0] || null,
    crossTypeSuggestion: sameTypeMatches.length === 0 ? crossTypeMatches[0] || null : null,
    allMatching: matches
  };
}

/**
 * Common quick templates for transaction notes to help elders and mosque committees
 */
export const POPULAR_NOTE_TEMPLATES = {
  in: [
    'জুমার জামাতের দানবাক্স কালেকশন',
    'মাসিক নিয়মিত সদস্য চাঁদা',
    'মসজিদ উন্নয়ন ও টাইলস ক্রয়ের বিশেষ দান',
    '১০ মণ আমন ধান বিক্রয় বাবদ জমা',
    'মক্তবের শিক্ষার্থীদের মাসিক বেতন আদায়',
    'দোকান নং ১ এর মাসিক ভাড়া আদায়'
  ],
  out: [
    'চলতি মাসের বিদ্যুৎ (কারেন্ট) বিল পরিশোধ',
    'সম্মানিত ইমাম সাহেবের মাসিক বেতন ও হাদিয়া',
    'মুয়াজ্জিন সাহেবের মাসিক বেতন',
    'ওযুখানার পানির পাম্প ও ফিল্টার মেরামত',
    'মসজিদের সাউন্ড সিস্টেম ও মাইক সংস্কার'
  ]
};
