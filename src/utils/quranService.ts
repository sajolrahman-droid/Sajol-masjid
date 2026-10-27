import { ALL_114_SURAHS, QuranSurahMeta } from '../data/quranIndex';
import { OFFLINE_FULL_SURAHS, FullSurahDetail, QuranVerse } from '../data/allSurahsData';

// Helper to transliterate English romanized pronunciation into readable Bengali phonetics
function convertRomanToBengaliPhonetic(roman: string): string {
  if (!roman) return '';
  // Basic phonetic mapping for Quranic transliterations
  const clean = roman
    .replace(/aa/gi, 'আ')
    .replace(/ee/gi, 'ঈ')
    .replace(/oo/gi, 'ঊ')
    .replace(/kh/gi, 'খ')
    .replace(/gh/gi, 'গ')
    .replace(/sh/gi, 'শ')
    .replace(/th/gi, 'ছ')
    .replace(/dh/gi, 'য')
    .replace(/zh/gi, 'য')
    .replace(/ph/gi, 'ফ')
    .replace(/ch/gi, 'চ')
    .replace(/'/g, '’')
    .replace(/-/g, '-');
  return clean;
}

export async function fetchSurahVerses(surahId: number): Promise<FullSurahDetail> {
  const meta: QuranSurahMeta = ALL_114_SURAHS.find((s) => s.id === surahId) || ALL_114_SURAHS[0];

  // 1. Check local pre-bundled Surahs
  if (OFFLINE_FULL_SURAHS[surahId]) {
    return OFFLINE_FULL_SURAHS[surahId];
  }

  // 2. Check LocalStorage offline cache
  const cacheKey = `quran_surah_cache_${surahId}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed: FullSurahDetail = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.verses) && parsed.verses.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore cache error
  }

  // 3. If online, fetch from Quran Cloud API (Uthmani Arabic + Bengali Muhiuddin Khan + Transliteration)
  if (typeof navigator !== 'undefined' && navigator.onLine) {
    try {
      const res = await fetch(
        `https://api.alquran.cloud/v1/surah/${surahId}/editions/quran-uthmani,bn.bengali,en.transliteration`
      );
      if (res.ok) {
        const json = await res.json();
        if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 2) {
          const arEdition = json.data[0];
          const bnEdition = json.data[1];
          const trEdition = json.data[2] || json.data[0];

          const verses: QuranVerse[] = arEdition.ayahs.map((ayah: { numberInSurah: number; text: string }, idx: number) => {
            const bnText = bnEdition.ayahs[idx]?.text || '';
            const trText = trEdition?.ayahs[idx]?.text || '';
            return {
              id: ayah.numberInSurah,
              ar: ayah.text,
              pronounce: trText ? trText : `${meta.nameBn} - আয়াত ${ayah.numberInSurah}`,
              bn: bnText,
              en: `Surah ${meta.nameEn}, Verse ${ayah.numberInSurah}`
            };
          });

          const fullDetail: FullSurahDetail = {
            id: meta.id,
            nameAr: meta.nameAr,
            nameBn: meta.nameBn,
            nameEn: meta.nameEn,
            meaning: meta.meaning,
            versesCount: meta.versesCount,
            revelation: meta.revelation,
            verses
          };

          // Cache permanently in LocalStorage
          try {
            localStorage.setItem(cacheKey, JSON.stringify(fullDetail));
          } catch {
            // LocalStorage might be full
          }

          return fullDetail;
        }
      }
    } catch (err) {
      console.warn(`Online Quran fetch for Surah ${surahId} failed, falling back to offline mode:`, err);
    }
  }

  // 4. Graceful offline fallback if not yet fetched and network is off
  return {
    id: meta.id,
    nameAr: meta.nameAr,
    nameBn: meta.nameBn,
    nameEn: meta.nameEn,
    meaning: meta.meaning,
    versesCount: meta.versesCount,
    revelation: meta.revelation,
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
        ar: meta.nameAr,
        pronounce: `${meta.nameBn} (পবিত্র কুরআনের ${meta.id} নং সূরা)`,
        bn: `এই সূরাটি ${meta.revelation} এবং এতে মোট ${meta.versesCount} টি আয়াত রয়েছে। এই সূরার মূল অর্থ: "${meta.meaning}"। সম্পূর্ণ আয়াতসমূহ পড়তে ইন্টারনেট সংযোগ চালু করে একবার লোড করুন, পরবর্তীতে তা সবসময় অফলাইনেও থাকবে।`,
        en: `Surah ${meta.nameEn} (${meta.id}), containing ${meta.versesCount} verses.`
      }
    ]
  };
}

// Arabic Reciter Audio Stream URL
export function getSurahAudioUrl(surahId: number, reciterId: string = 'ar.alafasy'): string {
  return `https://cdn.islamic.network/quran/audio-surah/128/${reciterId}/${surahId}.mp3`;
}

// Bengali Audio Translation Stream URL (Islamic Foundation / Bengali Translation)
export function getBengaliAudioUrl(surahId: number): string {
  const padded = surahId.toString().padStart(3, '0');
  return `https://server11.mp3quran.net/bng/${padded}.mp3`;
}

// Fallback mirror streams for Bengali Audio
export function getBengaliAudioFallbacks(surahId: number): string[] {
  const padded = surahId.toString().padStart(3, '0');
  return [
    `https://server11.mp3quran.net/bng/${padded}.mp3`,
    `https://ia800301.us.archive.org/24/items/AlQuranWithBengaliBanglaTranslation-ReciterMisharyRashidAl-Afasy/${padded}.mp3`,
    `https://download.quranicaudio.com/quran/bangla_translations/al-afasy_and_bangla/${padded}.mp3`
  ];
}
