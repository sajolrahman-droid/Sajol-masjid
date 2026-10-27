import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  BookMarked, 
  Search, 
  Copy, 
  Check, 
  Bookmark, 
  BookmarkCheck, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Filter, 
  Info, 
  Layers, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Award, 
  RotateCcw,
  CheckCircle2,
  Library,
  ArrowLeft,
  FileText,
  Trash2,
  AlertCircle,
  WifiOff,
  RefreshCw,
  Clock,
  ExternalLink
} from 'lucide-react';
import { 
  SAHIH_HADITH_BOOKS, 
  SAHIH_HADITH_COLLECTION, 
  HADITH_TOPICS,
  getBookChapters
} from '../data/hadithData';
import { SahihHadithItem, Language } from '../types/mosque';
import { toBengaliNumerals } from '../utils/prayerCalculator';

interface HadithSectionProps {
  language: Language;
}

// Sihah Sittah canonical books definition for the hadith-api integration
interface SihahBookConfig {
  key: string;
  name: string;
  en: string;
  ar: string;
  bn: string;
  allSahih: boolean;
  authorBn: string;
  deathYearHijri: string;
  totalEstimated: string;
}

const SIHAH_SITTAH_API_BOOKS: SihahBookConfig[] = [
  { key: 'bukhari', name: 'সহীহ আল-বুখারী', en: 'Sahih al-Bukhari', ar: 'ara-bukhari', bn: 'ben-bukhari', allSahih: true, authorBn: 'ইমাম মুহাম্মদ ইবনে ইসমাইল আল-বুখারী (রহ.)', deathYearHijri: '২৫৬ হিজরি', totalEstimated: '৭,৫৬৩' },
  { key: 'muslim', name: 'সহীহ মুসলিম', en: 'Sahih Muslim', ar: 'ara-muslim', bn: 'ben-muslim', allSahih: true, authorBn: 'ইমাম মুসলিম ইবনুল হাজ্জাজ আন-নিশাপুরী (রহ.)', deathYearHijri: '২৬১ হিজরি', totalEstimated: '৭,৫০০' },
  { key: 'abudawud', name: 'সুনান আবু দাউদ', en: 'Sunan Abu Dawud', ar: 'ara-abudawud', bn: 'ben-abudawud', allSahih: false, authorBn: 'ইমাম আবু দাউদ সুলাইমান আস-সিজিস্তানী (রহ.)', deathYearHijri: '২৭৫ হিজরি', totalEstimated: '৫,২৭৪' },
  { key: 'tirmidhi', name: 'জামি‘ আত-তিরমিযী', en: 'Jami at-Tirmidhi', ar: 'ara-tirmidhi', bn: 'ben-tirmidhi', allSahih: false, authorBn: 'ইমাম আবু ঈসা মুহাম্মদ আত-তিরমিযী (রহ.)', deathYearHijri: '২৭৯ হিজরি', totalEstimated: '৩,৯৫৬' },
  { key: 'nasai', name: 'সুনান আন-নাসাঈ', en: 'Sunan an-Nasai', ar: 'ara-nasai', bn: 'ben-nasai', allSahih: false, authorBn: 'ইমাম আহমদ ইবনে শুয়াইব আন-নাসাঈ (রহ.)', deathYearHijri: '৩০৩ হিজরি', totalEstimated: '৫,৭৫৮' },
  { key: 'ibnmajah', name: 'সুনান ইবনু মাজাহ', en: 'Sunan Ibn Majah', ar: 'ara-ibnmajah', bn: 'ben-ibnmajah', allSahih: false, authorBn: 'ইমাম মুহাম্মদ ইবনে ইয়াজিদ ইবনে মাজাহ (রহ.)', deathYearHijri: '২৭৩ হিজরি', totalEstimated: '৪,৩৪১' }
];

const CDN_BASE = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1';

// Bookmarked item schema
interface SavedHadithItem {
  id: string; // book:num
  bookKey: string;
  bookName: string;
  hadithnumber: number;
  arabicnumber?: number | string;
  textAr: string;
  textBn: string;
  grade: string;
  reference?: string;
  savedAt: string;
}

export const HadithSection: React.FC<HadithSectionProps> = ({ language }) => {
  // Navigation tabs within Hadith Section
  // 'books': Sihah Sittah 6 books explorer
  // 'search': Direct number search
  // 'bookmarks': Saved hadiths & personal notes
  // 'curated': Offline rich hadiths with Shan-e-Nuzul & audio
  const [activeSubTab, setActiveSubTab] = useState<'books' | 'search' | 'bookmarks' | 'curated'>('books');

  // Font sizing
  const [fontSizeLevel, setFontSizeLevel] = useState<'md' | 'lg' | 'xl'>('lg');

  // Copy feedback
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Audio speech synthesis
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [speakingLang, setSpeakingLang] = useState<'bn' | 'ar'>('bn');

  // --- API STATE FOR SIHAH SITTAH LIVE BROWSER ---
  const [infoCache, setInfoCache] = useState<any | null>(null);
  const [isInfoLoading, setIsInfoLoading] = useState<boolean>(false);
  const [infoError, setInfoError] = useState<string | null>(null);

  // Active book in Explorer
  const [explorerBook, setExplorerBook] = useState<SihahBookConfig | null>(null);
  // Active section in Explorer
  const [explorerSectionNo, setExplorerSectionNo] = useState<string | null>(null);
  const [explorerSectionName, setExplorerSectionName] = useState<string>('');
  
  // Section hadiths loading
  const [sectionHadiths, setSectionHadiths] = useState<Array<{
    hadithnumber: number;
    arabicnumber?: number | string;
    textAr: string;
    textBn: string;
    grade: string;
    reference?: any;
  }>>([]);
  const [dedupedCount, setDedupedCount] = useState<number>(0);
  const [isSectionLoading, setIsSectionLoading] = useState<boolean>(false);
  const [sectionError, setSectionError] = useState<string | null>(null);

  // --- DIRECT NUMBER SEARCH STATE ---
  const [searchBookKey, setSearchBookKey] = useState<string>('bukhari');
  const [searchHadithNumber, setSearchHadithNumber] = useState<string>('');
  const [isSearchingNumber, setIsSearchingNumber] = useState<boolean>(false);
  const [searchResultHadith, setSearchResultHadith] = useState<{
    book: SihahBookConfig;
    hadithnumber: number;
    arabicnumber?: number | string;
    textAr: string;
    textBn: string;
    grade: string;
    reference?: any;
    isUnconfirmedSahih?: boolean;
  } | null>(null);
  const [searchNumberError, setSearchNumberError] = useState<string | null>(null);

  // --- LOCALSTORAGE BOOKMARKS & NOTES ---
  const [bookmarks, setBookmarks] = useState<SavedHadithItem[]>(() => {
    try {
      const saved = localStorage.getItem('sahihHadithGhor_bookmarks');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [personalNotes, setPersonalNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('sahihHadithGhor_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [openNoteBoxes, setOpenNoteBoxes] = useState<Record<string, boolean>>({});

  // --- OFFLINE CURATED STATE ---
  const [curatedSelectedBookId, setCuratedSelectedBookId] = useState<string>('bukhari');
  const [curatedSelectedChapter, setCuratedSelectedChapter] = useState<string>('all');
  const [curatedSelectedTopic, setCuratedSelectedTopic] = useState<string>('সকল হাদিস');
  const [curatedSearchQuery, setCuratedSearchQuery] = useState<string>('');
  const [curatedExpandedSanadIds, setCuratedExpandedSanadIds] = useState<Record<string, boolean>>({});

  // Fetch info.min.json for Sihah Sittah metadata
  const fetchInfoCache = useCallback(async () => {
    if (infoCache) return infoCache;
    setIsInfoLoading(true);
    setInfoError(null);
    try {
      const res = await fetch(`${CDN_BASE}/info.min.json`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();
      setInfoCache(data);
      return data;
    } catch (err: any) {
      console.warn('Failed to load Sihah Sittah info:', err);
      setInfoError('ইন্টারনেট সংযোগ বা সার্ভার সংযোগে সমস্যা হয়েছে। আপনি অফলাইন মোডেও নির্বাচিত হাদিস পড়তে পারেন।');
      return null;
    } finally {
      setIsInfoLoading(false);
    }
  }, [infoCache]);

  // Load info on mount or when browsing books
  useEffect(() => {
    if (activeSubTab === 'books' || activeSubTab === 'search') {
      fetchInfoCache();
    }
  }, [activeSubTab, fetchInfoCache]);

  // Helper: Determine if Hadith is authentic (Sahih)
  const verifyIsSahih = useCallback((book: SihahBookConfig, hadithnumber: number, gradesFromEdition?: any[], cache?: any): boolean => {
    if (book.allSahih) return true; // Bukhari and Muslim are unconditionally Sahih
    let grades = gradesFromEdition;
    const currentCache = cache || infoCache;
    if ((!grades || grades.length === 0) && currentCache && currentCache[book.key]) {
      const found = (currentCache[book.key].hadiths || []).find((h: any) => h.hadithnumber === hadithnumber);
      grades = found ? found.grades : null;
    }
    if (!grades || grades.length === 0) return false;
    const texts = grades.map((g: any) => (g.grade || '').toLowerCase());
    const sahihCount = texts.filter((t: string) => t.includes('sahih')).length;
    const weakCount = texts.filter((t: string) => 
      t.includes('daif') || t.includes("da'if") || t.includes('munkar') || 
      t.includes('mawdu') || t.includes('matruk') || t.includes('shadh')
    ).length;
    return sahihCount > 0 && sahihCount >= weakCount;
  }, [infoCache]);

  // Helper: Grade Label
  const getGradeLabel = useCallback((book: SihahBookConfig, hadithnumber: number, gradesFromEdition?: any[], cache?: any): string => {
    if (book.allSahih) return `সহীহ (${book.name})`;
    let grades = gradesFromEdition;
    const currentCache = cache || infoCache;
    if ((!grades || grades.length === 0) && currentCache && currentCache[book.key]) {
      const found = (currentCache[book.key].hadiths || []).find((h: any) => h.hadithnumber === hadithnumber);
      grades = found ? found.grades : null;
    }
    if (!grades || grades.length === 0) return 'সহীহ';
    const zubair = grades.find((g: any) => g.name && g.name.includes('Zubair'));
    const first = zubair || grades[0];
    return `সহীহ (তাহক্বীক্ব: ${first.grade || 'Sahih'})`;
  }, [infoCache]);

  // Open Book -> show chapters
  const handleOpenBook = async (book: SihahBookConfig) => {
    setExplorerBook(book);
    setExplorerSectionNo(null);
    setSectionHadiths([]);
    setDedupedCount(0);
    setSectionError(null);
    if (!infoCache) {
      await fetchInfoCache();
    }
  };

  // Open Section -> load Hadiths
  const handleOpenSection = async (sectionNo: string, sectionTitle: string) => {
    if (!explorerBook) return;
    setExplorerSectionNo(sectionNo);
    setExplorerSectionName(sectionTitle);
    setIsSectionLoading(true);
    setSectionError(null);
    setSectionHadiths([]);
    setDedupedCount(0);

    try {
      const [arRes, bnRes] = await Promise.all([
        fetch(`${CDN_BASE}/editions/${explorerBook.ar}/sections/${sectionNo}.min.json`),
        fetch(`${CDN_BASE}/editions/${explorerBook.bn}/sections/${sectionNo}.min.json`)
      ]);

      if (!arRes.ok || !bnRes.ok) {
        throw new Error(`Failed to load section data (Status: ${arRes.status}/${bnRes.status})`);
      }

      const arData = await arRes.json();
      const bnData = await bnRes.json();

      const bnMap: Record<number, string> = {};
      (bnData.hadiths || []).forEach((h: any) => {
        bnMap[h.hadithnumber] = h.text;
      });

      const cards: Array<{
        hadithnumber: number;
        arabicnumber?: number | string;
        textAr: string;
        textBn: string;
        grade: string;
        reference?: any;
      }> = [];

      const seenText = new Set<string>();
      let hidden = 0;

      (arData.hadiths || []).forEach((h: any) => {
        if (!verifyIsSahih(explorerBook, h.hadithnumber, h.grades, infoCache)) {
          return;
        }

        const norm = (h.text || '').replace(/\s+/g, ' ').trim();
        if (norm && seenText.has(norm)) {
          hidden++;
          return;
        }
        if (norm) seenText.add(norm);

        cards.push({
          hadithnumber: h.hadithnumber,
          arabicnumber: h.arabicnumber,
          textAr: h.text,
          textBn: bnMap[h.hadithnumber] || '(বাংলা অনুবাদ অনলাইন সংস্করণে সংকলনাধীন)',
          reference: h.reference,
          grade: getGradeLabel(explorerBook, h.hadithnumber, h.grades, infoCache)
        });
      });

      setSectionHadiths(cards);
      setDedupedCount(hidden);
    } catch (err: any) {
      console.error(err);
      setSectionError('অধ্যায়ের হাদিস লোড করা যায়নি। ইন্টারনেট সংযোগ পরীক্ষা করে পুনরায় চেষ্টা করুন অথবা অফলাইন সংকলন পড়ুন।');
    } finally {
      setIsSectionLoading(false);
    }
  };

  // Perform Number Search
  const handleExecuteNumberSearch = async () => {
    const num = parseInt(searchHadithNumber.trim(), 10);
    if (isNaN(num) || num < 1) {
      setSearchNumberError('সঠিক হাদিস নম্বর দিন (যেমন: ১, ১০, ৪২)।');
      setSearchResultHadith(null);
      return;
    }

    const targetBook = SIHAH_SITTAH_API_BOOKS.find((b) => b.key === searchBookKey) || SIHAH_SITTAH_API_BOOKS[0];
    setIsSearchingNumber(true);
    setSearchNumberError(null);
    setSearchResultHadith(null);

    try {
      const [arRes, bnRes] = await Promise.all([
        fetch(`${CDN_BASE}/editions/${targetBook.ar}/${num}.min.json`),
        fetch(`${CDN_BASE}/editions/${targetBook.bn}/${num}.min.json`)
      ]);

      if (!arRes.ok || !bnRes.ok) {
        throw new Error('Hadith not found');
      }

      const arData = await arRes.json();
      const bnData = await bnRes.json();

      const h = (arData.hadiths || [])[0];
      const bnH = (bnData.hadiths || [])[0];

      if (!h) {
        setSearchNumberError(`হাদিস নং ${toBengaliNumerals(num)} এই গ্রন্থে খুঁজে পাওয়া যায়নি।`);
        return;
      }

      let currentCache = infoCache;
      if (!currentCache) {
        currentCache = await fetchInfoCache();
      }

      const isConfirmed = verifyIsSahih(targetBook, h.hadithnumber, h.grades, currentCache);
      if (!isConfirmed) {
        setSearchResultHadith({
          book: targetBook,
          hadithnumber: h.hadithnumber,
          arabicnumber: h.arabicnumber,
          textAr: h.text,
          textBn: bnH?.text || '(অনুবাদ সংরক্ষিত)',
          grade: 'অ-সহীহ বা জয়ীফ/যাচাইকৃত নয়',
          reference: h.reference,
          isUnconfirmedSahih: true
        });
        return;
      }

      setSearchResultHadith({
        book: targetBook,
        hadithnumber: h.hadithnumber,
        arabicnumber: h.arabicnumber,
        textAr: h.text,
        textBn: bnH?.text || '(অনলাইন অনুবাদ সংকলনাধীন)',
        reference: h.reference,
        grade: getGradeLabel(targetBook, h.hadithnumber, h.grades, currentCache),
        isUnconfirmedSahih: false
      });
    } catch (err) {
      setSearchNumberError(`হাদিস নম্বর ${toBengaliNumerals(num)} লোড করা যায়নি। নম্বর সঠিক কি না এবং ইন্টারনেট সংযোগ পরীক্ষা করুন।`);
    } finally {
      setIsSearchingNumber(false);
    }
  };

  // Toggle Bookmark for an API hadith
  const handleToggleBookmark = (item: {
    bookKey: string;
    bookName: string;
    hadithnumber: number;
    arabicnumber?: number | string;
    textAr: string;
    textBn: string;
    grade: string;
    reference?: any;
  }) => {
    const key = `${item.bookKey}:${item.hadithnumber}`;
    const exists = bookmarks.some((b) => b.id === key);

    let updated: SavedHadithItem[];
    if (exists) {
      updated = bookmarks.filter((b) => b.id !== key);
    } else {
      let refStr = '';
      if (item.reference && typeof item.reference === 'object') {
        refStr = `কিতাব ${item.reference.book || ''}, হাদিস ${item.reference.hadith || ''}`;
      }
      updated = [
        ...bookmarks,
        {
          id: key,
          bookKey: item.bookKey,
          bookName: item.bookName,
          hadithnumber: item.hadithnumber,
          arabicnumber: item.arabicnumber,
          textAr: item.textAr,
          textBn: item.textBn,
          grade: item.grade,
          reference: refStr,
          savedAt: new Date().toLocaleDateString('bn-BD')
        }
      ];
    }

    setBookmarks(updated);
    try {
      localStorage.setItem('sahihHadithGhor_bookmarks', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Save Personal Note
  const handleSaveNote = (key: string, val: string) => {
    const updated = { ...personalNotes };
    if (val && val.trim()) {
      updated[key] = val.trim();
    } else {
      delete updated[key];
    }
    setPersonalNotes(updated);
    try {
      localStorage.setItem('sahihHadithGhor_notes', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Note Box
  const handleToggleNoteBox = (key: string) => {
    setOpenNoteBoxes((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Copy Hadith Text
  const handleCopyText = (textToCopy: string, identifier: string) => {
    navigator.clipboard.writeText(textToCopy);
    setCopiedId(identifier);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Audio Playback
  const handleSpeak = (text: string, lang: 'bn' | 'ar', id: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('আপনার ব্রাউজারে অডিও স্পিচ সিন্থেসিস সাপোর্ট নেই।');
      return;
    }

    if (speakingId === id && speakingLang === lang) {
      window.speechSynthesis.cancel();
      setSpeakingId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setSpeakingId(id);
    setSpeakingLang(lang);

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang === 'ar' ? 'ar-SA' : 'bn-BD';
    utterance.rate = 0.95;

    utterance.onend = () => setSpeakingId(null);
    utterance.onerror = () => setSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Stop Speech on Unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Dynamic Typography Sizes
  const getArabicClass = () => {
    if (fontSizeLevel === 'md') return 'text-xl sm:text-2xl leading-loose';
    if (fontSizeLevel === 'xl') return 'text-3xl sm:text-4xl leading-loose';
    return 'text-2xl sm:text-3xl leading-loose';
  };

  const getBanglaClass = () => {
    if (fontSizeLevel === 'md') return 'text-sm sm:text-base leading-relaxed';
    if (fontSizeLevel === 'xl') return 'text-lg sm:text-xl leading-relaxed';
    return 'text-base sm:text-lg leading-relaxed';
  };

  // --- FILTERED OFFLINE CURATED HADITHS ---
  const filteredCuratedHadiths = useMemo(() => {
    return SAHIH_HADITH_COLLECTION.filter((item) => {
      if (curatedSelectedBookId !== 'all' && item.bookId !== curatedSelectedBookId) return false;
      if (curatedSelectedChapter !== 'all' && item.chapterBn !== curatedSelectedChapter) return false;
      if (curatedSelectedTopic !== 'সকল হাদিস' && item.topic !== curatedSelectedTopic) return false;
      if (curatedSearchQuery.trim()) {
        const q = curatedSearchQuery.toLowerCase().trim();
        const numBn = toBengaliNumerals(item.hadithNumber);
        const matchNumber = item.hadithNumber.toString().includes(q) || numBn.includes(q);
        const matchText = 
          item.banglaMeaning.toLowerCase().includes(q) ||
          item.banglaShanNuzul.toLowerCase().includes(q) ||
          item.narratorBn.toLowerCase().includes(q) ||
          item.chapterBn.toLowerCase().includes(q) ||
          item.arabicMatn.includes(q) ||
          item.bookNameBn.toLowerCase().includes(q) ||
          item.topic.toLowerCase().includes(q);
        return matchNumber || matchText;
      }
      return true;
    });
  }, [curatedSelectedBookId, curatedSelectedChapter, curatedSelectedTopic, curatedSearchQuery]);

  const curatedBookChapters = useMemo(() => {
    return getBookChapters(curatedSelectedBookId);
  }, [curatedSelectedBookId]);

  return (
    <div className="space-y-6">
      {/* Top Banner - সহীহ হাদিস ঘর — সিহাহ সিত্তাহ */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-5 sm:p-7 shadow-xl border border-emerald-500/20">
        <div className="absolute -right-8 -bottom-10 opacity-10 pointer-events-none">
          <Library className="w-64 h-64 text-emerald-300" />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400 text-slate-950 shadow-xs">
                <Sparkles className="w-3.5 h-3.5" />
                সহীহ হাদিস ঘর — সিহাহ সিত্তাহ
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-emerald-200 border border-white/15">
                ৬টি বিশুদ্ধ কিতাব • শানে ওরূদ • পুনরাবৃত্তি মুক্ত
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              সিহাহ সিত্তাহ হাদিস লাইব্রেরি ও শানে ওরূদ
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 max-w-2xl mt-1 leading-relaxed">
              সহীহ বুখারী, মুসলিম, আবু দাউদ, তিরমিযী, নাসাঈ ও ইবনে মাজাহ থেকে সহীহ হাদিস — আরবি মূল পাঠ, বিশুদ্ধ মূল্যায়ন, বাংলা অনুবাদ ও হাদিস নম্বরসহ।
            </p>
          </div>

          {/* Quick Font Size Controls */}
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/15 self-end sm:self-center shrink-0">
            <span className="text-xs text-white/70 px-2 font-medium">ফন্ট:</span>
            <button
              onClick={() => setFontSizeLevel('md')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                fontSizeLevel === 'md' ? 'bg-amber-400 text-slate-950' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              স্বাভাবিক
            </button>
            <button
              onClick={() => setFontSizeLevel('lg')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                fontSizeLevel === 'lg' ? 'bg-amber-400 text-slate-950' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              বড়
            </button>
            <button
              onClick={() => setFontSizeLevel('xl')}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                fontSizeLevel === 'xl' ? 'bg-amber-400 text-slate-950' : 'text-white/80 hover:bg-white/10'
              }`}
            >
              খুব বড়
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveSubTab('books')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === 'books'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Library className="w-4 h-4" />
          <span>📚 সিহাহ সিত্তাহ কিতাবসমূহ</span>
        </button>

        <button
          onClick={() => setActiveSubTab('search')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === 'search'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Search className="w-4 h-4" />
          <span>🔍 হাদিস নম্বর অনুসন্ধান</span>
        </button>

        <button
          onClick={() => setActiveSubTab('bookmarks')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === 'bookmarks'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Bookmark className="w-4 h-4 fill-current text-amber-500" />
          <span>⭐ সংরক্ষিত ও নোট ({toBengaliNumerals(bookmarks.length)})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('curated')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer shrink-0 ${
            activeSubTab === 'curated'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>📖 নির্বাচিত হাদিস ও শানে ওরূদ (অফলাইন)</span>
        </button>
      </div>

      {/* ========================================================
          SUB-TAB 1: 📚 সিহাহ সিত্তাহ হাদিস কিতাবসমূহ
         ======================================================== */}
      {activeSubTab === 'books' && (
        <div className="space-y-5">
          {/* Authentic Methodology Notice */}
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700/50 rounded-2xl p-4 text-xs sm:text-sm text-amber-950 dark:text-amber-200 leading-relaxed">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-900 dark:text-amber-300">
              <Info className="w-4 h-4 shrink-0" />
              <span>সহীহ হাদিস ও গ্রেডিং নীতি:</span>
            </div>
            <p>
              এই বিভাগে hadith-api (fawazahmed0) থেকে সরাসরি আরবি ও বাংলা হাদিস লাইভ লোড করা হয়, যার মূল ভিত্তি সুন্নাহ.কম ও স্বীকৃত মুহাদ্দিসগণের তাহক্বীক্ব (আলবানী, শুয়াইব আরনাউত, যুবাইর আলী যাই প্রমুখ)। বুখারী ও মুসলিমের সমস্ত হাদিস উম্মতের ঐকমত্যে সহীহ; বাকি চার সুনান গ্রন্থ থেকে কেবল সহীহ তাহক্বীক্বকৃত হাদিসসমূহ প্রদর্শিত হয়। পুনরাবৃত্ত হাদিস স্বয়ংক্রিয়ভাবে বাদ দেওয়া হয়।
            </p>
          </div>

          {/* If error loading info */}
          {infoError && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 rounded-2xl p-4 text-xs sm:text-sm text-rose-800 dark:text-rose-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
                <span>{infoError}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={fetchInfoCache}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition cursor-pointer flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  পুনরায় চেষ্টা
                </button>
                <button
                  onClick={() => setActiveSubTab('curated')}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition cursor-pointer"
                >
                  📖 অফলাইন সংকলন পড়ুন
                </button>
              </div>
            </div>
          )}

          {/* VIEW A: Books Grid (When no book selected) */}
          {!explorerBook && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Library className="w-5 h-5 text-emerald-600" />
                  সিহাহ সিত্তাহ (ছয়টি বিশুদ্ধ হাদিস সংকলন):
                </h2>
                {isInfoLoading && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    তথ্য হালনাগাদ হচ্ছে...
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {SIHAH_SITTAH_API_BOOKS.map((book) => {
                  const meta = infoCache?.[book.key]?.metadata;
                  const totalCount = meta?.last_hadithnumber 
                    ? toBengaliNumerals(meta.last_hadithnumber) 
                    : book.totalEstimated;
                  const sectionsCount = meta?.sections 
                    ? toBengaliNumerals(Object.keys(meta.sections).filter((k) => k !== '0').length) 
                    : null;

                  return (
                    <div
                      key={book.key}
                      onClick={() => handleOpenBook(book)}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-extrabold text-emerald-950 dark:text-emerald-300 group-hover:text-emerald-600 transition">
                              {book.name}
                            </h3>
                            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                              {book.en}
                            </div>
                          </div>
                          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                            book.allSahih 
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {book.allSahih ? 'পূর্ণাঙ্গ সহীহ' : 'সহীহ তাহক্বীক্ব'}
                          </span>
                        </div>

                        <div className="mt-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
                          <div>সংকলক: <strong className="text-slate-800 dark:text-slate-200">{book.authorBn}</strong></div>
                          <div>ওফাত: {book.deathYearHijri}</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs">
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          মোট হাদিস: {totalCount} টি
                        </span>
                        {sectionsCount && (
                          <span className="text-slate-500 dark:text-slate-400">
                            {sectionsCount} টি অধ্যায়
                          </span>
                        )}
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold group-hover:translate-x-1 transition-transform">
                          অধ্যায় দেখুন →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW B: Book Opened -> Chapter / Section List */}
          {explorerBook && !explorerSectionNo && (
            <div className="space-y-4">
              {/* Breadcrumb Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setExplorerBook(null)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>গ্রন্থ তালিকা</span>
                  </button>
                  <span className="text-slate-300 dark:text-slate-600">/</span>
                  <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                    {explorerBook.name} ({explorerBook.en})
                  </span>
                </div>

                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {explorerBook.authorBn}
                </span>
              </div>

              {/* Loading spinner */}
              {isInfoLoading && (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    অধ্যায় ও কিতাব তালিকা প্রস্তুত করা হচ্ছে...
                  </p>
                </div>
              )}

              {/* Sections Grid */}
              {infoCache?.[explorerBook.key]?.metadata?.sections ? (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>অধ্যায় নির্বাচন করুন:</span>
                    <span className="text-slate-500">
                      মোট {toBengaliNumerals(Object.keys(infoCache[explorerBook.key].metadata.sections).filter((k) => k !== '0').length)} টি অধ্যায়
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(infoCache[explorerBook.key].metadata.sections)
                      .filter(([no, title]) => no !== '0' && Boolean(title))
                      .map(([no, title]: [string, any]) => {
                        const details = infoCache[explorerBook.key].metadata.section_details?.[no] || {};
                        const firstNum = details.hadithnumber_first ? toBengaliNumerals(details.hadithnumber_first) : null;
                        const lastNum = details.hadithnumber_last ? toBengaliNumerals(details.hadithnumber_last) : null;

                        return (
                          <div
                            key={no}
                            onClick={() => handleOpenSection(no, title)}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 hover:border-emerald-500 hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                          >
                            <div className="space-y-1">
                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                অধ্যায় {toBengaliNumerals(no)}
                              </span>
                              <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition line-clamp-2">
                                {title}
                              </h4>
                            </div>

                            {firstNum && lastNum && (
                              <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                                <span>হাদিস {firstNum} – {lastNum}</span>
                                <span className="text-emerald-600 font-semibold group-hover:translate-x-0.5 transition-transform">
                                  পড়ুন →
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ) : (
                !isInfoLoading && (
                  <div className="text-center py-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                      অধ্যায় তালিকা পাওয়া যায়নি
                    </p>
                    <button
                      onClick={fetchInfoCache}
                      className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                    >
                      পুনরায় রিফ্রেশ করুন
                    </button>
                  </div>
                )
              )}
            </div>
          )}

          {/* VIEW C: Section Opened -> Hadith Cards List */}
          {explorerBook && explorerSectionNo && (
            <div className="space-y-4">
              {/* Breadcrumb Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                  <button
                    onClick={() => setExplorerBook(null)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    ← গ্রন্থ
                  </button>
                  <button
                    onClick={() => {
                      setExplorerSectionNo(null);
                      setSectionHadiths([]);
                    }}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-200 transition cursor-pointer"
                  >
                    ← অধ্যায় তালিকা
                  </button>
                  <span className="font-extrabold text-emerald-800 dark:text-emerald-300">
                    {explorerBook.name} · {explorerSectionNo}. {explorerSectionName}
                  </span>
                </div>

                <div className="text-xs text-slate-500">
                  {sectionHadiths.length > 0 && (
                    <span>প্রদর্শিত সহীহ হাদিস: <strong>{toBengaliNumerals(sectionHadiths.length)}</strong> টি</span>
                  )}
                </div>
              </div>

              {/* Deduplication Notice */}
              {dedupedCount > 0 && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>
                    🔁 এই অধ্যায়ে <strong>{toBengaliNumerals(dedupedCount)}</strong> টি পুনরাবৃত্ত হাদিস (একই মূল পাঠ্য একাধিক সনদে আসা) স্বয়ংক্রিয়ভাবে বাদ দেওয়া হয়েছে।
                  </span>
                </div>
              )}

              {/* Section Error */}
              {sectionError && (
                <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-300 rounded-2xl p-4 text-xs text-rose-800 dark:text-rose-200 flex items-center justify-between">
                  <span>{sectionError}</span>
                  <button
                    onClick={() => handleOpenSection(explorerSectionNo, explorerSectionName)}
                    className="px-3 py-1 rounded-xl bg-rose-600 text-white font-bold hover:bg-rose-700 cursor-pointer"
                  >
                    পুনরায় চেষ্টা
                  </button>
                </div>
              )}

              {/* Loading State */}
              {isSectionLoading && (
                <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    অধ্যায়ের সহীহ হাদিসসমূহ যাচাই ও লোড করা হচ্ছে...
                  </p>
                </div>
              )}

              {/* Empty state */}
              {!isSectionLoading && sectionHadiths.length === 0 && !sectionError && (
                <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
                  <Info className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    এই অধ্যায়ে সহীহ গ্রেডিংযুক্ত হাদিস পাওয়া যায়নি
                  </p>
                  <p className="text-xs text-slate-500">
                    অন্য অধ্যায় নির্বাচন করে দেখুন অথবা হাদিস নম্বর সার্চ করুন।
                  </p>
                </div>
              )}

              {/* Hadith Cards Render */}
              <div className="space-y-5">
                {sectionHadiths.map((item) => {
                  const itemKey = `${explorerBook.key}:${item.hadithnumber}`;
                  const isMarked = bookmarks.some((b) => b.id === itemKey);
                  const isNoteOpen = !!openNoteBoxes[itemKey];
                  const currentNote = personalNotes[itemKey] || '';
                  const isSpeakingBn = speakingId === itemKey && speakingLang === 'bn';
                  const isSpeakingAr = speakingId === itemKey && speakingLang === 'ar';

                  return (
                    <div
                      key={itemKey}
                      id={`hadith-card-${itemKey.replace(':', '-')}`}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-5 sm:p-7 space-y-4 hover:shadow-lg transition-all"
                    >
                      {/* Top Badges & Actions */}
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-600 text-white shadow-xs">
                            {explorerBook.name}
                          </span>
                          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            হাদিস নং {toBengaliNumerals(item.hadithnumber)}
                          </span>
                          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20">
                            {item.grade}
                          </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5">
                          {/* Speak Bengali */}
                          <button
                            onClick={() => handleSpeak(`${explorerBook.name}, হাদিস ${toBengaliNumerals(item.hadithnumber)}। ${item.textBn}`, 'bn', itemKey)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                              isSpeakingBn
                                ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-sm animate-pulse'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border-slate-200 dark:border-slate-700'
                            }`}
                            title="বাংলা পাঠ শুনুন"
                          >
                            {isSpeakingBn ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-600" />}
                            <span className="hidden sm:inline">বাংলা</span>
                          </button>

                          {/* Speak Arabic */}
                          <button
                            onClick={() => handleSpeak(item.textAr, 'ar', itemKey)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                              isSpeakingAr
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm animate-pulse'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border-slate-200 dark:border-slate-700'
                            }`}
                            title="মূল আরবি হাদিস শুনুন"
                          >
                            {isSpeakingAr ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-teal-600" />}
                            <span className="hidden sm:inline">عربي</span>
                          </button>

                          {/* Bookmark */}
                          <button
                            onClick={() => handleToggleBookmark({
                              bookKey: explorerBook.key,
                              bookName: explorerBook.name,
                              hadithnumber: item.hadithnumber,
                              arabicnumber: item.arabicnumber,
                              textAr: item.textAr,
                              textBn: item.textBn,
                              grade: item.grade,
                              reference: item.reference
                            })}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              isMarked
                                ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            {isMarked ? <BookmarkCheck className="w-3.5 h-3.5 fill-current" /> : <Bookmark className="w-3.5 h-3.5" />}
                            <span className="hidden sm:inline">{isMarked ? 'সংরক্ষিত' : 'সংরক্ষণ'}</span>
                          </button>

                          {/* Personal Note Toggle */}
                          <button
                            onClick={() => handleToggleNoteBox(itemKey)}
                            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                              currentNote 
                                ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-300' 
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border-slate-200 dark:border-slate-700'
                            }`}
                            title="প্রেক্ষাপট বা ব্যক্তিগত নোট যুক্ত করুন"
                          >
                            <FileText className="w-3.5 h-3.5 text-teal-600" />
                            <span className="hidden sm:inline">নোট</span>
                          </button>

                          {/* Copy */}
                          <button
                            onClick={() => handleCopyText(`【${explorerBook.name} - হাদিস নং ${toBengaliNumerals(item.hadithnumber)}】\nমান: ${item.grade}\n\n[আরবি]:\n${item.textAr}\n\n[বাংলা]:\n${item.textBn}\n\n— সহীহ হাদিস ঘর`, itemKey)}
                            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 transition cursor-pointer"
                            title="কপি করুন"
                          >
                            {copiedId === itemKey ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Arabic Matn */}
                      <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                        <div className="flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-400 font-bold uppercase tracking-wider">
                          <span>الحديث الشريف (মূল আরবি পাঠ):</span>
                          <span>{explorerBook.ar}</span>
                        </div>
                        <div
                          dir="rtl"
                          className={`font-arabic text-right tracking-wide text-emerald-950 dark:text-emerald-100 font-semibold ${getArabicClass()}`}
                        >
                          {item.textAr}
                        </div>
                      </div>

                      {/* Bengali Translation */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                          বাংলা অর্থ ও অনুবাদ:
                        </span>
                        <p className={`text-slate-900 dark:text-slate-100 font-medium ${getBanglaClass()}`}>
                          "{item.textBn}"
                        </p>
                      </div>

                      {/* Reference line */}
                      {item.reference && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                          রেফারেন্স: কিতাব {item.reference.book || '—'}, হাদিস {item.reference.hadith || '—'}
                          {item.arabicnumber && item.arabicnumber !== item.hadithnumber && (
                            <span> · আরবি কিতাব নম্বর: {item.arabicnumber}</span>
                          )}
                        </div>
                      )}

                      {/* Personal Note Box */}
                      {isNoteOpen && (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 animate-fadeIn">
                          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                            <span>📝 এই হাদিস সম্পর্কে আপনার ব্যক্তিগত নোট বা প্রাসঙ্গিক ব্যাখ্যা লিখুন:</span>
                            <span className="text-[11px] text-slate-500">স্বয়ংক্রিয়ভাবে ডিভাইসে সংরক্ষিত হয়</span>
                          </label>
                          <textarea
                            defaultValue={currentNote}
                            placeholder="এই হাদিস সম্পর্কে আপনার ব্যক্তিগত চিন্তা, প্রেক্ষাপট বা আমল সংক্রান্ত নোট লিখুন..."
                            onBlur={(e) => handleSaveNote(itemKey, e.target.value)}
                            className="w-full min-h-[70px] p-3 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                          />
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            * নোট: এই ঘরে হাদিসের নিজস্ব কোনো তাফসীর/ব্যাখ্যা দেওয়া নেই — শুধু আপনার ব্যক্তিগত নোট সংরক্ষণের জায়গা।
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SUB-TAB 2: 🔍 হাদিস নম্বর অনুসন্ধান (Direct Number Search)
         ======================================================== */}
      {activeSubTab === 'search' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Search className="w-5 h-5 text-emerald-600" />
              নির্দিষ্ট কিতাব ও হাদিস নম্বর দিয়ে সরাসরি খুঁজুন
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              যেকোনো সিহাহ সিত্তাহ হাদিস কিতাব নির্বাচন করে নির্দিষ্ট হাদিস নম্বর লিখুন। লাইভ ডেটাবেজ থেকে হাদিসের বিশুদ্ধতা তাহক্বীক্ব করে প্রদর্শন করা হবে।
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Select Book */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">কিতাব নির্বাচন করুন:</label>
                <select
                  value={searchBookKey}
                  onChange={(e) => setSearchBookKey(e.target.value)}
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                >
                  {SIHAH_SITTAH_API_BOOKS.map((b) => (
                    <option key={b.key} value={b.key}>
                      {b.name} ({b.en})
                    </option>
                  ))}
                </select>
              </div>

              {/* Number Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">হাদিস নম্বর (ইংরেজি সংখ্যা):</label>
                <input
                  type="number"
                  min="1"
                  value={searchHadithNumber}
                  onChange={(e) => setSearchHadithNumber(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleExecuteNumberSearch()}
                  placeholder="যেমন: 1, 10, 42"
                  className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleExecuteNumberSearch}
                disabled={isSearchingNumber}
                className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSearchingNumber ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>অনুসন্ধান হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>হাদিস দেখুন</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Search Error Message */}
          {searchNumberError && (
            <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 rounded-2xl p-4 text-xs sm:text-sm text-rose-800 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{searchNumberError}</span>
            </div>
          )}

          {/* Search Result Display */}
          {searchResultHadith && (
            <div className="space-y-4">
              {searchResultHadith.isUnconfirmedSahih ? (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 rounded-2xl p-5 text-xs sm:text-sm text-amber-900 dark:text-amber-200 space-y-2">
                  <div className="font-bold flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span>সহীহ তাহক্বীক্ব সংক্রান্ত সতর্কতা:</span>
                  </div>
                  <p>
                    এই হাদিসটি (<strong>{searchResultHadith.book.name}</strong>, নং {toBengaliNumerals(searchResultHadith.hadithnumber)}) উপলব্ধ মুহাদ্দিসগণের তাহক্বীক্ব অনুযায়ী <em>"সহীহ"</em> হিসেবে নিশ্চিত নয়। এই অ্যাপের সহীহ-শুধুমাত্র নীতির কারণে এর মূল পাঠ গোপন রাখা হলো।
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-5 sm:p-7 space-y-4">
                  {/* Top Badges */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-600 text-white">
                        {searchResultHadith.book.name}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        হাদিস নং {toBengaliNumerals(searchResultHadith.hadithnumber)}
                      </span>
                      <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20">
                        {searchResultHadith.grade}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggleBookmark({
                          bookKey: searchResultHadith.book.key,
                          bookName: searchResultHadith.book.name,
                          hadithnumber: searchResultHadith.hadithnumber,
                          arabicnumber: searchResultHadith.arabicnumber,
                          textAr: searchResultHadith.textAr,
                          textBn: searchResultHadith.textBn,
                          grade: searchResultHadith.grade,
                          reference: searchResultHadith.reference
                        })}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>সংরক্ষণ</span>
                      </button>

                      <button
                        onClick={() => handleCopyText(`【${searchResultHadith.book.name} - নং ${toBengaliNumerals(searchResultHadith.hadithnumber)}】\n${searchResultHadith.textAr}\n\n${searchResultHadith.textBn}`, 'search-result')}
                        className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                      >
                        {copiedId === 'search-result' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Arabic Matn */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                    <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                      الحديث الشريف:
                    </div>
                    <div
                      dir="rtl"
                      className={`font-arabic text-right tracking-wide text-emerald-950 dark:text-emerald-100 font-semibold ${getArabicClass()}`}
                    >
                      {searchResultHadith.textAr}
                    </div>
                  </div>

                  {/* Bengali Translation */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                      বাংলা অনুবাদ:
                    </span>
                    <p className={`text-slate-900 dark:text-slate-100 font-medium ${getBanglaClass()}`}>
                      "{searchResultHadith.textBn}"
                    </p>
                  </div>

                  {/* Reference */}
                  {searchResultHadith.reference && (
                    <div className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                      রেফারেন্স: কিতাব {searchResultHadith.reference.book || '—'}, হাদিস {searchResultHadith.reference.hadith || '—'}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SUB-TAB 3: ⭐ সংরক্ষিত হাদিস ও ব্যক্তিগত নোট
         ======================================================== */}
      {activeSubTab === 'bookmarks' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-amber-500 fill-current" />
              আপনার সংরক্ষিত হাদিস ও ব্যক্তিগত প্রেক্ষাপট নোট ({toBengaliNumerals(bookmarks.length)})
            </h2>
          </div>

          {bookmarks.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-3">
              <BookMarked className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
                এখনো কোনো হাদিস সংরক্ষণ করা হয়নি
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                সিহাহ সিত্তাহ হাদিস ব্রাউজার বা হাদিস সার্চ থেকে যেকোনো হাদিসের "সংরক্ষণ" বাটনে চাপুন।
              </p>
              <button
                onClick={() => setActiveSubTab('books')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
              >
                📚 কিতাবসমূহ দেখুন
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookmarks.map((bm) => {
                const noteVal = personalNotes[bm.id] || '';
                const isNoteOpen = !!openNoteBoxes[bm.id];

                return (
                  <div
                    key={bm.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-600 text-white">
                          {bm.bookName}
                        </span>
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          হাদিস নং {toBengaliNumerals(bm.hadithnumber)}
                        </span>
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20">
                          {bm.grade}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleToggleNoteBox(bm.id)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-600" />
                          <span>নোট {noteVal ? 'সম্পাদনা' : 'যোগ'}</span>
                        </button>

                        <button
                          onClick={() => handleCopyText(`【${bm.bookName} - হাদিস নং ${toBengaliNumerals(bm.hadithnumber)}】\n${bm.textAr}\n\n${bm.textBn}`, bm.id)}
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 border border-slate-200 dark:border-slate-700 cursor-pointer"
                        >
                          {copiedId === bm.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleToggleBookmark({
                            bookKey: bm.bookKey,
                            bookName: bm.bookName,
                            hadithnumber: bm.hadithnumber,
                            arabicnumber: bm.arabicnumber,
                            textAr: bm.textAr,
                            textBn: bm.textBn,
                            grade: bm.grade,
                            reference: bm.reference
                          })}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 border border-rose-200 dark:border-rose-800 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>মুছুন</span>
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text */}
                    <div
                      dir="rtl"
                      className={`font-arabic text-right tracking-wide text-emerald-950 dark:text-emerald-100 font-semibold p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 ${getArabicClass()}`}
                    >
                      {bm.textAr}
                    </div>

                    {/* Bengali Text */}
                    <div className="space-y-1">
                      <p className={`text-slate-900 dark:text-slate-100 font-medium ${getBanglaClass()}`}>
                        "{bm.textBn}"
                      </p>
                    </div>

                    {/* Reference */}
                    {bm.reference && (
                      <div className="text-xs text-slate-500">
                        {bm.reference}
                      </div>
                    )}

                    {/* Saved Personal Note Preview */}
                    {noteVal && !isNoteOpen && (
                      <div className="p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 border border-teal-500/20 text-xs text-teal-950 dark:text-teal-200 space-y-1">
                        <strong className="block text-teal-800 dark:text-teal-400">📝 আপনার সংরক্ষিত ব্যক্তিগত নোট:</strong>
                        <p>{noteVal}</p>
                      </div>
                    )}

                    {/* Personal Note Editor */}
                    {isNoteOpen && (
                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                          ব্যক্তিগত নোট বা প্রাসঙ্গিক প্রেক্ষাপট:
                        </label>
                        <textarea
                          defaultValue={noteVal}
                          placeholder="আপনার ব্যক্তিগত ভাবনা বা আমল সংক্রান্ত নোট..."
                          onBlur={(e) => handleSaveNote(bm.id, e.target.value)}
                          className="w-full min-h-[70px] p-3 text-xs sm:text-sm rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          SUB-TAB 4: 📖 নির্বাচিত হাদিস ও শানে ওরূদ (অফলাইন মোড)
         ======================================================== */}
      {activeSubTab === 'curated' && (
        <div className="space-y-6">
          {/* Offline Banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-2xl p-4 text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>১০০% অফলাইন প্রস্তুত:</strong> এই সেকশনের নির্বাচিত ৫০+ প্রামাণ্য হাদিস, আরবি শানে ওরূদ (أسباب الورود), সনদ ও শিক্ষা ইন্টারনেট সংযোগ ছাড়াই সবসময় পড়তে ও শুনতে পারবেন।
              </span>
            </div>
          </div>

          {/* Book Selector Bar */}
          <div className="space-y-2">
            <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Library className="w-4 h-4 text-emerald-600" />
              হাদিসের কিতাব নির্বাচন করুন:
            </label>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-2">
              <button
                onClick={() => {
                  setCuratedSelectedBookId('all');
                  setCuratedSelectedChapter('all');
                }}
                className={`p-3 rounded-2xl text-left transition border cursor-pointer ${
                  curatedSelectedBookId === 'all'
                    ? 'bg-slate-900 text-white dark:bg-emerald-600 border-slate-900 dark:border-emerald-500 shadow-md'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                }`}
              >
                <div className="font-extrabold text-xs sm:text-sm flex items-center justify-between">
                  <span>সকল গ্রন্থ</span>
                  <span className="text-[11px] px-1.5 py-0.2 rounded-md bg-white/20">
                    {toBengaliNumerals(SAHIH_HADITH_COLLECTION.length)}
                  </span>
                </div>
                <div className="text-[10px] opacity-75 mt-0.5">অফলাইন সংকলন</div>
              </button>

              {SAHIH_HADITH_BOOKS.map((book) => {
                const isSelected = curatedSelectedBookId === book.id;
                const bookCount = SAHIH_HADITH_COLLECTION.filter((h) => h.bookId === book.id).length;

                return (
                  <button
                    key={book.id}
                    onClick={() => {
                      setCuratedSelectedBookId(book.id);
                      setCuratedSelectedChapter('all');
                    }}
                    className={`p-3 rounded-2xl text-left transition border cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-700 text-white dark:bg-emerald-600 border-emerald-600 shadow-md scale-[1.02]'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                    }`}
                  >
                    <div className="font-extrabold text-xs sm:text-sm flex items-center justify-between">
                      <span className="line-clamp-1">{book.nameBn}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-md bg-white/20">
                        {toBengaliNumerals(bookCount)}
                      </span>
                    </div>
                    <div className="font-arabic text-[11px] mt-0.5 opacity-80 text-right line-clamp-1">
                      {book.nameAr}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chapter Selector if specific book */}
          {curatedSelectedBookId !== 'all' && curatedBookChapters.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600" />
                অধ্যায় ফিল্টার:
              </label>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                <button
                  onClick={() => setCuratedSelectedChapter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition border cursor-pointer ${
                    curatedSelectedChapter === 'all'
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                  }`}
                >
                  সকল অধ্যায়
                </button>
                {curatedBookChapters.map((chap) => {
                  const count = SAHIH_HADITH_COLLECTION.filter(
                    (h) => h.bookId === curatedSelectedBookId && h.chapterBn === chap
                  ).length;
                  const isSelected = curatedSelectedChapter === chap;

                  return (
                    <button
                      key={chap}
                      onClick={() => setCuratedSelectedChapter(chap)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition border cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs font-bold'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100'
                      }`}
                    >
                      <span>{chap}</span>
                      <span className="text-[10px] px-1 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {toBengaliNumerals(count)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Search bar */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={curatedSearchQuery}
              onChange={(e) => setCuratedSearchQuery(e.target.value)}
              placeholder="হাদিস নম্বর, বিষয়, শানে ওরূদ বা বাংলা অর্থ খুঁজুন..."
              className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Curated Hadiths List */}
          <div className="space-y-6">
            {filteredCuratedHadiths.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
                <BookMarked className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">কোনো হাদিস খুঁজে পাওয়া যায়নি</p>
                <button
                  onClick={() => {
                    setCuratedSearchQuery('');
                    setCuratedSelectedChapter('all');
                    setCuratedSelectedTopic('সকল হাদিস');
                  }}
                  className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 text-white"
                >
                  ফিল্টার রিসেট
                </button>
              </div>
            ) : (
              filteredCuratedHadiths.map((hadith) => {
                const hadithId = `curated-${hadith.id}`;
                const isSpeakingBn = speakingId === hadithId && speakingLang === 'bn';
                const isSpeakingAr = speakingId === hadithId && speakingLang === 'ar';
                const isSanadOpen = !!curatedExpandedSanadIds[hadith.id];

                return (
                  <div
                    key={hadith.id}
                    className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md p-5 sm:p-7 space-y-4 hover:shadow-lg transition-all"
                  >
                    {/* Top Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-emerald-600 text-white shadow-xs">
                          {hadith.bookNameBn}
                        </span>
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          হাদিস নং {toBengaliNumerals(hadith.hadithNumber)}
                        </span>
                        <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-green-500/10 text-green-700 dark:text-green-300 border border-green-500/20">
                          {hadith.grade}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          • {hadith.topic}
                        </span>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleSpeak(`${hadith.bookNameBn}, হাদিস ${toBengaliNumerals(hadith.hadithNumber)}। ${hadith.banglaMeaning}। শানে ওরূদ: ${hadith.banglaShanNuzul}`, 'bn', hadithId)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                            isSpeakingBn ? 'bg-amber-400 text-slate-950 animate-pulse' : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="hidden sm:inline">বাংলা পাঠ</span>
                        </button>

                        <button
                          onClick={() => handleSpeak(hadith.arabicMatn, 'ar', hadithId)}
                          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
                            isSpeakingAr ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800'
                          }`}
                        >
                          <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                          <span className="hidden sm:inline">عربي</span>
                        </button>

                        <button
                          onClick={() => handleCopyText(`【${hadith.bookNameBn} - হাদিস নং ${toBengaliNumerals(hadith.hadithNumber)}】\nঅধ্যায়: ${hadith.chapterBn}\n\n[আরবি]:\n${hadith.arabicMatn}\n\n[শানে ওরূদ]:\n${hadith.arabicShanNuzul}\n\n[বাংলা]:\n${hadith.banglaMeaning}\n\n[প্রেক্ষাপট]:\n${hadith.banglaShanNuzul}`, hadithId)}
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:bg-slate-200 cursor-pointer"
                        >
                          {copiedId === hadithId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Chapter & Narrator */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs sm:text-sm">
                      <div className="text-slate-700 dark:text-slate-300 font-bold">
                        📖 অধ্যায়: <span className="text-emerald-700 dark:text-emerald-400 font-extrabold">{hadith.chapterBn}</span>
                      </div>
                      <div className="text-slate-600 dark:text-slate-400 font-semibold">
                        🎙️ বর্ণনাকারী: <strong className="text-slate-800 dark:text-slate-200">{hadith.narratorBn}</strong>
                      </div>
                    </div>

                    {/* Sanad Accordion */}
                    {hadith.arabicSanad && (
                      <div className="border border-slate-200/60 dark:border-slate-800 rounded-2xl overflow-hidden">
                        <button
                          onClick={() => setCuratedExpandedSanadIds((p) => ({ ...p, [hadith.id]: !p[hadith.id] }))}
                          className="w-full flex items-center justify-between p-2.5 px-3 bg-slate-50 dark:bg-slate-800/50 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <span>📜 সনদ ও বর্ণনাকারী পরম্পরা (الإسناد)</span>
                          {isSanadOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        {isSanadOpen && (
                          <div dir="rtl" className="p-3 bg-white dark:bg-slate-900 font-arabic text-xs sm:text-sm text-slate-600 dark:text-slate-400 text-right leading-relaxed border-t border-slate-200/60">
                            {hadith.arabicSanad}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Arabic Matn */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2">
                      <div className="text-xs font-bold text-emerald-800 dark:text-emerald-400">
                        الحديث الشريف (মূল আরবি পাঠ):
                      </div>
                      <div
                        dir="rtl"
                        className={`font-arabic text-right tracking-wide text-emerald-950 dark:text-emerald-100 font-semibold ${getArabicClass()}`}
                      >
                        {hadith.arabicMatn}
                      </div>
                    </div>

                    {/* Arabic Shan-e-Nuzul (أسباب الورود) */}
                    <div className="p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                          سبب الورود
                        </span>
                        <h4 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-300">
                          আরবি শানে ওরূদ / প্রেক্ষাপট (سبب ورود الحديث):
                        </h4>
                      </div>
                      <div
                        dir="rtl"
                        className="font-arabic text-right text-base sm:text-lg text-amber-950 dark:text-amber-100 leading-relaxed"
                      >
                        {hadith.arabicShanNuzul}
                      </div>
                    </div>

                    {/* Bengali Translation */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs font-extrabold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider block">
                        বাংলা অর্থ ও অনুবাদ:
                      </span>
                      <p className={`text-slate-900 dark:text-slate-100 font-medium ${getBanglaClass()}`}>
                        "{hadith.banglaMeaning}"
                      </p>
                    </div>

                    {/* Bengali Shan-e-Nuzul */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800 space-y-1.5">
                      <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                        📜 শানে ওরূদ ও ঐতিহাসিক পটভূমি (বাংলা ব্যাখ্যা):
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                        {hadith.banglaShanNuzul}
                      </p>
                    </div>

                    {/* Lessons */}
                    {hadith.lessons && hadith.lessons.length > 0 && (
                      <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                          💡 হাদিসের মূল শিক্ষা ও আমলসমূহ:
                        </span>
                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                          {hadith.lessons.map((lesson, idx) => (
                            <li key={idx} className="flex items-start gap-2 bg-slate-100/60 dark:bg-slate-800/40 p-2.5 rounded-xl border border-slate-200/40">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{lesson}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Footer Attribution as requested in the attached app */}
      <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
        <div>
          সহীহ হাদিস ঘর — <strong>Md. Moddasel Hoque</strong> এর জন্য তৈরি · উপাত্ত: hadith-api (fawazahmed0), মূল উৎস সুন্নাহ.কম
        </div>
        <div className="text-[11px] opacity-75">
          সিহাহ সিত্তাহ (৬টি বিশুদ্ধ হাদিস সংকলন) • তাহক্বীক্ব: আলবানী, শুয়াইব আরনাউত, যুবাইর আলী যাই • অফলাইন ও অনলাইন সমন্বিত
        </div>
      </div>
    </div>
  );
};
