import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  RotateCw, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  Mic, 
  BookOpen, 
  SkipBack, 
  SkipForward,
  Download,
  CheckCircle2,
  WifiOff,
  Wifi,
  Trash2,
  Languages,
  Radio
} from 'lucide-react';
import { toBengaliNumerals } from '../utils/prayerCalculator';
import { QuranSurahMeta } from '../data/quranIndex';
import { QuranVerse } from '../data/allSurahsData';
import { getSurahAudioUrl, getBengaliAudioUrl, getBengaliAudioFallbacks } from '../utils/quranService';
import { 
  isAudioUrlCached, 
  getCachedAudioBlobUrl, 
  downloadAndCacheAudio, 
  removeCachedAudio 
} from '../utils/offlineQuranAudio';

export type AudioMode = 
  | 'arabic'           // Online stream / Cached MP3 of Arabic Reciter
  | 'bangla_stream'    // Online stream / Cached MP3 of Bengali Translation
  | 'speech_arabic'    // 100% Offline Arabic Ayah-by-Ayah Voice Recitation
  | 'speech_bangla'    // 100% Offline Bengali Ayah-by-Ayah Voice Translation
  | 'speech_both';     // 100% Offline Dual: Arabic Ayah followed by Bengali Meaning

export interface QuranReciter {
  id: string;
  nameBn: string;
  nameEn: string;
}

export const ARABIC_RECITERS: QuranReciter[] = [
  { id: 'ar.alafasy', nameBn: 'মিশারী রাশিদ আল-আফাসী', nameEn: 'Mishary Rashid Alafasy' },
  { id: 'ar.abdulbasitmurattal', nameBn: 'ক্বারী আব্দুল বাসিত', nameEn: 'Abdul Basit Murattal' },
  { id: 'ar.mahermuaiqly', nameBn: 'শায়খ মাহের আল-মুআইক্বলী', nameEn: 'Maher Al Muaiqly' },
  { id: 'ar.saadalghamidi', nameBn: 'সাআদ আল-গামদী', nameEn: 'Saad Al Ghamdi' }
];

interface QuranAudioPlayerProps {
  surah: QuranSurahMeta;
  verses?: QuranVerse[];
  activeVerseId?: number | null;
  onActiveVerseChange?: (verseId: number | null) => void;
  requestedVerseId?: number | null;
  onClearRequestedVerse?: () => void;
  autoScroll?: boolean;
  onToggleAutoScroll?: () => void;
  onCacheStatusChange?: (isCached: boolean) => void;
}

export const QuranAudioPlayer: React.FC<QuranAudioPlayerProps> = ({ 
  surah,
  verses = [],
  activeVerseId,
  onActiveVerseChange,
  requestedVerseId,
  onClearRequestedVerse,
  autoScroll = true,
  onToggleAutoScroll,
  onCacheStatusChange
}) => {
  // Audio Mode
  const [audioMode, setAudioMode] = useState<AudioMode>('arabic');
  const [arabicReciterId, setArabicReciterId] = useState<string>('ar.alafasy');
  
  // Audio Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Offline caching status
  const [isOffline, setIsOffline] = useState<boolean>(() => typeof navigator !== 'undefined' ? !navigator.onLine : false);
  const [isCurrentAudioCached, setIsCurrentAudioCached] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);

  // Verse-by-verse speech state
  const [speechVerseIdx, setSpeechVerseIdx] = useState<number>(0);
  const [isSpeechSpeaking, setIsSpeechSpeaking] = useState<boolean>(false);
  const [speechSubPhase, setSpeechSubPhase] = useState<'ar' | 'bn'>('ar'); // For dual mode

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fallbackIndexRef = useRef<number>(0);
  const keepAliveRef = useRef<any>(null);
  const isSpeechCancelledRef = useRef<boolean>(false);
  const pendingSeekSecsRef = useRef<number | null>(null);

  // Online / Offline monitor
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Format seconds to mm:ss in Bengali
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '০০:০০';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    const str = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return toBengaliNumerals(str);
  };

  // Precompute verse timing intervals for synchronized highlighting with audio progress
  const verseTimings = useMemo(() => {
    if (!verses || verses.length === 0) return [];
    const weights = verses.map((v) => {
      const arLen = v.ar ? v.ar.length : 15;
      const bnLen = v.bn ? v.bn.length : 20;
      return arLen * 1.3 + bnLen * 0.9 + 30; // length weight + pause constant
    });
    const totalWeight = weights.reduce((s, w) => s + w, 0) || 1;

    let cumulative = 0;
    return verses.map((v, i) => {
      const startFrac = cumulative / totalWeight;
      cumulative += weights[i];
      const endFrac = cumulative / totalWeight;
      return {
        id: v.id,
        index: i,
        startFrac,
        endFrac,
        verse: v
      };
    });
  }, [verses]);

  // Determine active MP3 audio URL
  const getActiveMp3Url = useCallback(() => {
    if (audioMode === 'bangla_stream') {
      const fallbacks = getBengaliAudioFallbacks(surah.id);
      return fallbacks[fallbackIndexRef.current] || getBengaliAudioUrl(surah.id);
    }
    return getSurahAudioUrl(surah.id, arabicReciterId);
  }, [audioMode, surah.id, arabicReciterId]);

  // Check if current MP3 is cached offline
  const checkCacheStatus = useCallback(async () => {
    if (audioMode === 'speech_arabic' || audioMode === 'speech_bangla' || audioMode === 'speech_both') {
      setIsCurrentAudioCached(true); // Speech is always 100% offline
      onCacheStatusChange?.(true);
      return;
    }
    const targetUrl = getActiveMp3Url();
    const cached = await isAudioUrlCached(targetUrl);
    setIsCurrentAudioCached(cached);
    onCacheStatusChange?.(cached);
  }, [audioMode, getActiveMp3Url, onCacheStatusChange]);

  useEffect(() => {
    checkCacheStatus();
  }, [checkCacheStatus]);

  // Stop Web Speech Synthesis
  const stopSpeech = useCallback(() => {
    isSpeechCancelledRef.current = true;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (keepAliveRef.current) {
      clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
    setIsSpeechSpeaking(false);
  }, []);

  // Stop HTML5 Audio
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  }, []);

  // Download & Cache audio for 100% offline playback
  const handleDownloadOfflineAudio = async () => {
    const url = getActiveMp3Url();
    setIsDownloading(true);
    setDownloadProgress(5);
    setHasError(false);

    try {
      const success = await downloadAndCacheAudio(url, (p) => setDownloadProgress(p));
      if (success) {
        setIsCurrentAudioCached(true);
        onCacheStatusChange?.(true);
      } else {
        setHasError(true);
        setErrorMsg('অডিও ডাউনলোড সম্পন্ন করা যায়নি। আপনি অফলাইন ভয়েস তিলাওয়াত ব্যবহার করতে পারেন।');
      }
    } catch {
      setHasError(true);
      setErrorMsg('ডাউনলোডে ত্রুটি হয়েছে।');
    } finally {
      setIsDownloading(false);
    }
  };

  // Delete cached audio
  const handleDeleteOfflineAudio = async () => {
    const url = getActiveMp3Url();
    await removeCachedAudio(url);
    setIsCurrentAudioCached(false);
    onCacheStatusChange?.(false);
  };

  // Helper to get Best Voice for language
  const getVoiceForLang = (lang: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
    const voices = window.speechSynthesis.getVoices();
    if (lang.startsWith('ar')) {
      return (
        voices.find((v) => v.lang.startsWith('ar') || v.name.toLowerCase().includes('arabic')) || null
      );
    }
    if (lang.startsWith('bn')) {
      return (
        voices.find((v) => v.lang.startsWith('bn') || v.name.toLowerCase().includes('bengali') || v.name.toLowerCase().includes('bangla')) || null
      );
    }
    return null;
  };

  // Speech Recitation: handles Arabic, Bengali, or Dual Mode
  const speakVerse = useCallback((index: number, phase: 'ar' | 'bn' = 'ar') => {
    if (!verses || !verses.length || index >= verses.length) {
      stopSpeech();
      return;
    }

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('আপনার ডিভাইসে স্পিচ সিন্থেসিস সাপোর্ট নেই।');
      return;
    }

    isSpeechCancelledRef.current = false;
    window.speechSynthesis.cancel();

    const verse = verses[index];
    setSpeechVerseIdx(index);
    setSpeechSubPhase(phase);

    if (onActiveVerseChange) {
      onActiveVerseChange(verse.id);
    }

    // Keep-alive interval for Chromium 15s pause bug
    if (!keepAliveRef.current) {
      keepAliveRef.current = setInterval(() => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        }
      }, 10000);
    }

    let textToSpeak = '';
    let speechLang = 'ar-SA';
    let rate = 0.88;

    if (audioMode === 'speech_arabic') {
      textToSpeak = verse.ar;
      speechLang = 'ar-SA';
      rate = 0.85;
    } else if (audioMode === 'speech_bangla') {
      textToSpeak = `আয়াত ${toBengaliNumerals(verse.id)}: ${verse.bn}`;
      speechLang = 'bn-BD';
      rate = 0.95;
    } else if (audioMode === 'speech_both') {
      if (phase === 'ar') {
        textToSpeak = verse.ar;
        speechLang = 'ar-SA';
        rate = 0.85;
      } else {
        textToSpeak = `অর্থ: ${verse.bn}`;
        speechLang = 'bn-BD';
        rate = 0.95;
      }
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = speechLang;
    utterance.rate = playbackRate * rate;

    const matchedVoice = getVoiceForLang(speechLang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      if (isSpeechCancelledRef.current) return;

      if (audioMode === 'speech_both' && phase === 'ar') {
        // Now speak Bengali meaning of same verse
        setTimeout(() => {
          if (!isSpeechCancelledRef.current) {
            speakVerse(index, 'bn');
          }
        }, 350);
      } else {
        // Move to next verse
        if (index + 1 < verses.length) {
          setTimeout(() => {
            if (!isSpeechCancelledRef.current) {
              speakVerse(index + 1, 'ar');
            }
          }, 600);
        } else {
          stopSpeech();
        }
      }
    };

    utterance.onerror = () => {
      if (!isSpeechCancelledRef.current) {
        setIsSpeechSpeaking(false);
      }
    };

    window.speechSynthesis.speak(utterance);
    setIsSpeechSpeaking(true);
  }, [verses, audioMode, onActiveVerseChange, playbackRate, stopSpeech]);

  // Switch Surah or Audio Mode Reset & Setup Audio Element
  useEffect(() => {
    stopSpeech();
    stopAudio();
    fallbackIndexRef.current = 0;
    setCurrentTime(0);
    setDuration(0);
    setHasError(false);
    setErrorMsg('');
    setSpeechVerseIdx(0);

    if (onActiveVerseChange) {
      onActiveVerseChange(verses[0]?.id || 1);
    }

    const isSpeech = audioMode === 'speech_arabic' || audioMode === 'speech_bangla' || audioMode === 'speech_both';
    if (isSpeech) {
      return;
    }

    let isDisposed = false;
    let localBlobUrl: string | null = null;

    const initAudio = async () => {
      const onlineUrl = getActiveMp3Url();
      
      // Step 1: Check if audio is already in offline cache
      const isCached = await isAudioUrlCached(onlineUrl);
      setIsCurrentAudioCached(isCached);
      onCacheStatusChange?.(isCached);

      const cachedBlob = await getCachedAudioBlobUrl(onlineUrl);
      if (isDisposed) return;

      // When offline without active SW controller, use cachedBlob directly.
      // When online or with active SW, onlineUrl allows workbox RangeRequestsPlugin to slice 206 Partial Content.
      let finalSrc = onlineUrl;
      if (!navigator.onLine && cachedBlob) {
        finalSrc = cachedBlob;
        localBlobUrl = cachedBlob;
      } else {
        localBlobUrl = cachedBlob;
      }

      const audio = new Audio(finalSrc);
      audioRef.current = audio;
      audio.volume = isMuted ? 0 : volume;
      audio.playbackRate = playbackRate;
      audio.loop = isLooping;

      audio.onwaiting = () => setIsLoading(true);
      audio.oncanplay = () => {
        setIsLoading(false);
        setHasError(false);
        if (pendingSeekSecsRef.current !== null && audio.duration) {
          const target = Math.min(audio.duration, pendingSeekSecsRef.current);
          pendingSeekSecsRef.current = null;
          try {
            audio.currentTime = target;
          } catch (e) {
            console.warn('Pending seek oncanplay error:', e);
          }
        }
      };
      audio.onplaying = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };
      audio.onpause = () => setIsPlaying(false);
      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
        if (onActiveVerseChange) onActiveVerseChange(null);
      };

      // Progress sync with verse highlighting
      audio.ontimeupdate = () => {
        const cur = audio.currentTime;
        setCurrentTime(cur);
        const dur = audio.duration;
        if (dur && !isNaN(dur) && dur > 0) {
          setDuration(dur);

          if (verseTimings.length > 0 && onActiveVerseChange) {
            const frac = cur / dur;
            const matched = verseTimings.find((vt) => frac >= vt.startFrac && frac < vt.endFrac) 
              || (frac >= 1 ? verseTimings[verseTimings.length - 1] : verseTimings[0]);
            if (matched && matched.id !== activeVerseId) {
              onActiveVerseChange(matched.id);
            }
          }
        }
      };

      audio.onloadedmetadata = () => {
        if (audio.duration && !isNaN(audio.duration)) {
          setDuration(audio.duration);
          if (pendingSeekSecsRef.current !== null) {
            const target = Math.min(audio.duration, pendingSeekSecsRef.current);
            pendingSeekSecsRef.current = null;
            try {
              audio.currentTime = target;
            } catch (e) {
              console.warn('Pending seek onloadedmetadata error:', e);
            }
          }
        }
      };

      audio.onerror = async () => {
        // Dual fallback: If finalSrc was onlineUrl and failed, try cachedBlob!
        if (finalSrc === onlineUrl && cachedBlob && !isDisposed) {
          finalSrc = cachedBlob;
          audio.src = cachedBlob;
          audio.load();
          return;
        }

        // If finalSrc was cachedBlob and failed, try onlineUrl!
        if (finalSrc === cachedBlob && !isDisposed) {
          finalSrc = onlineUrl;
          audio.src = onlineUrl;
          audio.load();
          return;
        }

        // If it's bangla stream, try fallbacks first
        if (audioMode === 'bangla_stream') {
          const fallbacks = getBengaliAudioFallbacks(surah.id);
          if (fallbackIndexRef.current < fallbacks.length - 1) {
            fallbackIndexRef.current += 1;
            audio.src = fallbacks[fallbackIndexRef.current];
            audio.load();
            return;
          }
        }

        // Check if device is offline
        const offline = !navigator.onLine;
        setIsOffline(offline);

        setHasError(true);
        if (offline) {
          setErrorMsg('ইন্টারনেট সংযোগ নেই। আপনি সরাসরি "অফলাইন আরবি কণ্ঠ" বা "অফলাইন বাংলা কণ্ঠ" নির্বাচন করে শুনতে পারবেন।');
        } else {
          setErrorMsg('অনলাইন অডিও লোড করা যায়নি। অফলাইন কণ্ঠ তিলাওয়াত ব্যবহার করতে পারেন।');
        }
        setIsLoading(false);
        setIsPlaying(false);
      };
    };

    initAudio();

    return () => {
      isDisposed = true;
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
      if (localBlobUrl) {
        URL.revokeObjectURL(localBlobUrl);
      }
    };
  }, [surah.id, audioMode, arabicReciterId, getActiveMp3Url, isMuted, volume, playbackRate, isLooping, stopSpeech, stopAudio, verseTimings, onActiveVerseChange, onCacheStatusChange]);

  // Jump to specific verse requested from clicking a verse card
  useEffect(() => {
    if (requestedVerseId !== undefined && requestedVerseId !== null) {
      const match = verseTimings.find((vt) => vt.id === requestedVerseId);
      if (match) {
        const isSpeech = audioMode === 'speech_arabic' || audioMode === 'speech_bangla' || audioMode === 'speech_both';
        if (isSpeech) {
          speakVerse(match.index, 'ar');
        } else if (audioRef.current) {
          if (duration > 0) {
            const targetSecs = match.startFrac * duration;
            try {
              audioRef.current.currentTime = targetSecs;
              setCurrentTime(targetSecs);
            } catch (e) {
              console.warn('Direct seek error:', e);
            }
            if (!isPlaying) {
              audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
                setAudioMode('speech_arabic');
                speakVerse(match.index, 'ar');
              });
            }
          } else {
            // Audio metadata buffering: record pending seek
            pendingSeekSecsRef.current = match.startFrac * 100;
            if (!isPlaying) {
              audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
                setAudioMode('speech_arabic');
                speakVerse(match.index, 'ar');
              });
            }
          }
        } else if (!navigator.onLine || hasError) {
          // If offline and MP3 not loaded, auto-fallback to speech
          setAudioMode('speech_arabic');
          speakVerse(match.index, 'ar');
        }
        if (onActiveVerseChange) {
          onActiveVerseChange(match.id);
        }
      }
      if (onClearRequestedVerse) {
        onClearRequestedVerse();
      }
    }
  }, [requestedVerseId, verseTimings, audioMode, duration, isPlaying, onActiveVerseChange, onClearRequestedVerse, speakVerse, hasError]);

  // Play / Pause Master Toggle with Smart Offline Fallback
  const handleTogglePlay = async () => {
    const isSpeech = audioMode === 'speech_arabic' || audioMode === 'speech_bangla' || audioMode === 'speech_both';

    if (isSpeech) {
      if (isSpeechSpeaking) {
        window.speechSynthesis.pause();
        setIsSpeechSpeaking(false);
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
          setIsSpeechSpeaking(true);
        } else {
          speakVerse(speechVerseIdx, speechSubPhase);
        }
      }
      return;
    }

    // Standard Audio Stream (Arabic or Bangla MP3)
    if (isPlaying) {
      if (audioRef.current) audioRef.current.pause();
      return;
    }

    // Attempting to play MP3
    setHasError(false);
    setIsLoading(true);

    // If device is offline and file is not cached, automatically switch to offline voice engine!
    if (!navigator.onLine && !isCurrentAudioCached) {
      setIsLoading(false);
      const fallbackMode: AudioMode = audioMode === 'arabic' ? 'speech_arabic' : 'speech_bangla';
      setAudioMode(fallbackMode);
      setTimeout(() => {
        speakVerse(speechVerseIdx, 'ar');
      }, 100);
      return;
    }

    if (audioRef.current) {
      try {
        await audioRef.current.play();
        setIsLoading(false);
        setIsPlaying(true);
      } catch (err) {
        console.warn('Audio play failed, checking offline fallback:', err);
        setIsLoading(false);
        // Fallback to offline speech
        const fallbackMode: AudioMode = audioMode === 'arabic' ? 'speech_arabic' : 'speech_bangla';
        setAudioMode(fallbackMode);
        speakVerse(speechVerseIdx, 'ar');
      }
    }
  };

  // Seek bar change
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setCurrentTime(val);
    if (audioRef.current) {
      audioRef.current.currentTime = val;
    }
    if (duration > 0 && verseTimings.length > 0 && onActiveVerseChange) {
      const frac = val / duration;
      const matched = verseTimings.find((vt) => frac >= vt.startFrac && frac < vt.endFrac);
      if (matched) {
        onActiveVerseChange(matched.id);
      }
    }
  };

  // Skip 10 seconds or next verse
  const skip = (seconds: number) => {
    const isSpeech = audioMode === 'speech_arabic' || audioMode === 'speech_bangla' || audioMode === 'speech_both';
    if (isSpeech) {
      const nextIdx = Math.max(0, Math.min(verses.length - 1, speechVerseIdx + (seconds > 0 ? 1 : -1)));
      speakVerse(nextIdx, 'ar');
      return;
    }
    if (!audioRef.current) return;
    const target = Math.min(duration, Math.max(0, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = target;
    setCurrentTime(target);
  };

  // Volume Change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.8;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  // Playback Rate
  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25, 1.5];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    const nextSpeed = speeds[nextIdx];
    setPlaybackRate(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const isSpeechMode = audioMode === 'speech_arabic' || audioMode === 'speech_bangla' || audioMode === 'speech_both';
  const isCurrentlyActive = isSpeechMode ? isSpeechSpeaking : isPlaying;

  // Active verse object currently playing
  const currentPlayingVerse = useMemo(() => {
    if (!activeVerseId) return null;
    return verses.find((v) => v.id === activeVerseId);
  }, [activeVerseId, verses]);

  return (
    <div className="p-4 sm:p-5 rounded-3xl bg-linear-to-r from-emerald-950 via-teal-950 to-slate-900 text-white shadow-xl border border-emerald-700/60 my-4 space-y-4">
      {/* Top Bar: Mode Selector & Surah Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-emerald-800/80">
        <div>
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base">
            <span className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-base shadow-xs shrink-0">
              {audioMode === 'arabic' ? '🕌' : audioMode === 'bangla_stream' ? '🇧🇩' : isSpeechMode ? '🗣️' : '📖'}
            </span>
            <div>
              <span className="font-extrabold">{surah.nameBn}</span>
              <span className="text-amber-300 ml-1.5 font-normal text-xs sm:text-sm">
                ({audioMode === 'arabic' ? 'আরবি ক্বারী তিলাওয়াত' : 
                  audioMode === 'bangla_stream' ? 'বাংলা অনুবাদ অডিও' : 
                  audioMode === 'speech_arabic' ? 'অফলাইন আরবি কণ্ঠ' : 
                  audioMode === 'speech_bangla' ? 'অফলাইন বাংলা কণ্ঠ' : 
                  'আরবি + বাংলা যুগ্ম পাঠ'})
              </span>
            </div>
          </div>
          <div className="text-[11px] text-emerald-200/80 mt-1 flex flex-wrap items-center gap-2">
            <span>সূরা #{toBengaliNumerals(surah.id)} • {toBengaliNumerals(surah.versesCount)} টি আয়াত • {surah.meaning}</span>
            {isOffline && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                <WifiOff className="w-3 h-3" />
                অফলাইন মোড
              </span>
            )}
          </div>
        </div>

        {/* Offline Cache Status & Download Action */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          {!isSpeechMode && (
            isCurrentAudioCached ? (
              <div className="flex items-center gap-1.5 bg-emerald-900/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-xs font-bold text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>অফলাইনে প্রস্তুত</span>
                <button
                  onClick={handleDeleteOfflineAudio}
                  className="ml-1 p-0.5 hover:text-rose-300 cursor-pointer"
                  title="অফলাইন ক্যাশ মুছুন"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleDownloadOfflineAudio}
                disabled={isDownloading}
                className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold px-3 py-1.5 rounded-xl text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                title="ইন্টারনেট ছাড়া সবসময় শুনতে এই সূরার অডিও ডাউনলোড করে রাখুন"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>সেভ হচ্ছে ({toBengaliNumerals(downloadProgress)}%)...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>অফলাইনে সেভ করুন</span>
                  </>
                )}
              </button>
            )
          )}
        </div>
      </div>

      {/* Audio Mode Switcher Buttons */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
        <button
          onClick={() => setAudioMode('arabic')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            audioMode === 'arabic'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'bg-black/30 text-emerald-200 hover:text-white border border-white/10'
          }`}
        >
          <span>🕌 আরবি ক্বারী</span>
        </button>

        <button
          onClick={() => setAudioMode('bangla_stream')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            audioMode === 'bangla_stream'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'bg-black/30 text-emerald-200 hover:text-white border border-white/10'
          }`}
        >
          <span>🇧🇩 বাংলা অনুবাদ</span>
        </button>

        <button
          onClick={() => setAudioMode('speech_arabic')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            audioMode === 'speech_arabic'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'bg-black/30 text-emerald-200 hover:text-white border border-white/10'
          }`}
          title="ইন্টারনেট ছাড়া সরাসরি ডিভাইসের আরবি ভয়েস দিয়ে প্রতি আয়াত তিলাওয়াত"
        >
          <Mic className="w-3.5 h-3.5" />
          <span>আরবি কণ্ঠ (১০০% অফলাইন)</span>
        </button>

        <button
          onClick={() => setAudioMode('speech_bangla')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            audioMode === 'speech_bangla'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'bg-black/30 text-emerald-200 hover:text-white border border-white/10'
          }`}
          title="ইন্টারনেট ছাড়া সরাসরি ডিভাইসের বাংলা ভয়েস দিয়ে প্রতি আয়াতের অনুবাদ"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>বাংলা কণ্ঠ (১০০% অফলাইন)</span>
        </button>

        <button
          onClick={() => setAudioMode('speech_both')}
          className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 cursor-pointer ${
            audioMode === 'speech_both'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'bg-black/30 text-emerald-200 hover:text-white border border-white/10'
          }`}
          title="প্রথমে আরবি আয়াত, এরপর বাংলা অর্থ — অফলাইনে ক্রমান্বয়ে পাঠ"
        >
          <Languages className="w-3.5 h-3.5" />
          <span>আরবি + বাংলা যুগ্ম</span>
        </button>
      </div>

      {/* Reciter Selector (When in Arabic MP3 Mode) */}
      {audioMode === 'arabic' && (
        <div className="flex flex-wrap items-center gap-2 text-xs bg-black/25 p-2 rounded-xl border border-white/10">
          <span className="text-emerald-300 font-bold">ক্বারী:</span>
          {ARABIC_RECITERS.map((rec) => (
            <button
              key={rec.id}
              onClick={() => setArabicReciterId(rec.id)}
              className={`px-2.5 py-1 rounded-lg transition font-semibold cursor-pointer ${
                arabicReciterId === rec.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {rec.nameBn}
            </button>
          ))}
        </div>
      )}

      {/* Offline Speech Mode Info Banner */}
      {isSpeechMode && (
        <div className="bg-emerald-900/40 border border-emerald-500/30 rounded-2xl p-2.5 text-xs text-emerald-200 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>১০০% অফলাইন ভয়েস ইঞ্জিন:</strong> ইন্টারনেট সংযোগ ছাড়াই আয়াতভিত্তিক নির্ভুল তিলাওয়াত ও উচ্চারণ শুনতে পাবেন।
            </span>
          </div>
          <span className="text-amber-300 font-bold shrink-0">
            আয়াত #{toBengaliNumerals(speechVerseIdx + 1)} / {toBengaliNumerals(verses.length)}
          </span>
        </div>
      )}

      {/* Error / Offline Notice */}
      {hasError && (
        <div className="bg-rose-950/60 border border-rose-500/50 rounded-2xl p-3 text-xs text-rose-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            onClick={() => {
              setHasError(false);
              setAudioMode('speech_arabic');
              speakVerse(speechVerseIdx, 'ar');
            }}
            className="px-3 py-1 rounded-xl bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 cursor-pointer shrink-0"
          >
            অফলাইন তিলাওয়াত শুনুন
          </button>
        </div>
      )}

      {/* Currently Highlighted Verse Text Preview */}
      {currentPlayingVerse && (
        <div className="p-3 sm:p-4 rounded-2xl bg-black/40 border border-emerald-500/20 space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-300 font-bold">
            <span>বর্তমানে পাঠ চলছে: আয়াত নং {toBengaliNumerals(currentPlayingVerse.id)}</span>
            {isSpeechMode && (
              <span className="text-emerald-400 font-normal">
                {speechSubPhase === 'ar' ? 'আরবি তিলাওয়াত' : 'বাংলা অর্থ'}
              </span>
            )}
          </div>
          <div dir="rtl" className="font-arabic text-lg sm:text-xl text-right text-emerald-100 font-semibold line-clamp-2">
            {currentPlayingVerse.ar}
          </div>
          <div className="text-xs text-slate-300 line-clamp-1">
            {currentPlayingVerse.bn}
          </div>
        </div>
      )}

      {/* Progress Bar (For MP3 Stream / Cached MP3) */}
      {!isSpeechMode && (
        <div className="space-y-1">
          <input
            type="range"
            min={0}
            max={duration || 100}
            value={currentTime}
            onChange={handleSeek}
            disabled={duration === 0}
            className="w-full h-1.5 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
          />
          <div className="flex justify-between text-[11px] text-emerald-300/80 font-mono">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      )}

      {/* Playback Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        {/* Main Play / Pause & Skip Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Skip -10s / Previous Verse */}
          <button
            onClick={() => skip(-10)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer text-white"
            title={isSpeechMode ? 'পূর্ববর্তী আয়াত' : '১০ সেকেন্ড পেছনে'}
          >
            {isSpeechMode ? <SkipBack className="w-4 h-4" /> : <RotateCcw className="w-4 h-4" />}
          </button>

          {/* Master Play / Pause Button */}
          <button
            onClick={handleTogglePlay}
            disabled={isLoading}
            className="w-12 h-12 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center font-bold shadow-lg hover:scale-105 transition cursor-pointer"
            title={isCurrentlyActive ? 'বিরতি দিন' : 'চালু করুন'}
          >
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-slate-950" />
            ) : isCurrentlyActive ? (
              <Pause className="w-6 h-6 fill-current" />
            ) : (
              <Play className="w-6 h-6 fill-current ml-0.5" />
            )}
          </button>

          {/* Skip +10s / Next Verse */}
          <button
            onClick={() => skip(10)}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer text-white"
            title={isSpeechMode ? 'পরবর্তী আয়াত' : '১০ সেকেন্ড সামনে'}
          >
            {isSpeechMode ? <SkipForward className="w-4 h-4" /> : <RotateCw className="w-4 h-4" />}
          </button>
        </div>

        {/* Speed & Volume Controls */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs">
          {/* Speed cycle */}
          <button
            onClick={cycleSpeed}
            className="px-2.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 font-mono font-bold transition cursor-pointer"
            title="প্লেব্যাক স্পিড পরিবর্তন করুন"
          >
            {playbackRate}x
          </button>

          {/* Volume toggle */}
          <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-2.5 py-1.5 rounded-xl">
            <button onClick={toggleMute} className="cursor-pointer text-emerald-200 hover:text-white">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-emerald-950 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>

          {/* Auto-scroll toggle */}
          {onToggleAutoScroll && (
            <button
              onClick={onToggleAutoScroll}
              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 ${
                autoScroll ? 'bg-emerald-600 text-white' : 'bg-white/10 text-white/60'
              }`}
              title="অডিও চলাকালীন স্বয়ংক্রিয়ভাবে সংশ্লিষ্ট আয়াতে স্ক্রোল করুন"
            >
              <span>অটো-স্ক্রোল</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
