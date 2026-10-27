import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  Compass, 
  RotateCw, 
  Navigation2, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Sparkles,
  Smartphone,
  Volume2,
  VolumeX,
  Radio,
  Eye,
  Check,
  HelpCircle,
  X,
  ShieldCheck
} from 'lucide-react';
import { calculateQibla, toBengaliNumerals, BD_CITIES } from '../utils/prayerCalculator';
import { Language } from '../types/mosque';

interface QiblaCompassProps {
  language: Language;
  selectedCity: string;
}

export const QiblaCompass: React.FC<QiblaCompassProps> = ({
  selectedCity
}) => {
  const [deviceHeading, setDeviceHeading] = useState<number>(0);
  const [manualHeading, setManualHeading] = useState<number>(0);
  const [sensorActive, setSensorActive] = useState<boolean>(false);
  const [permissionState, setPermissionState] = useState<'prompt' | 'granted' | 'denied' | 'unsupported'>('prompt');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Accessibility States for Visually Impaired Users
  const [hapticEnabled, setHapticEnabled] = useState<boolean>(true);
  const [audioFeedbackEnabled, setAudioFeedbackEnabled] = useState<boolean>(true);
  const [voiceAssistEnabled, setVoiceAssistEnabled] = useState<boolean>(false);
  const [testActive, setTestActive] = useState<boolean>(false);

  // Calibration Guide Modal State (opens automatically on first load)
  const [showCalibrationModal, setShowCalibrationModal] = useState<boolean>(() => {
    try {
      const seen = localStorage.getItem('qibla_calibration_guide_seen');
      return !seen; // true on first load
    } catch {
      return false;
    }
  });
  const [dontShowAgain, setDontShowAgain] = useState<boolean>(true);

  const handleCloseCalibration = (activateSensors: boolean = false) => {
    setShowCalibrationModal(false);
    if (dontShowAgain) {
      try {
        localStorage.setItem('qibla_calibration_guide_seen', 'true');
      } catch (e) {
        console.error(e);
      }
    }
    if (activateSensors && !sensorActive) {
      requestCompassPermission();
    }
  };

  const prevAlignedRef = useRef<boolean>(false);
  const wasNearRef = useRef<boolean>(false);

  // Match coordinates for selected city
  const cityData = useMemo(() => {
    return BD_CITIES.find((c) => c.nameBn === selectedCity || c.nameEn.toLowerCase() === selectedCity.toLowerCase()) || BD_CITIES[0];
  }, [selectedCity]);

  // Current active coordinates
  const activeLat = userCoords ? userCoords.lat : cityData.lat;
  const activeLng = userCoords ? userCoords.lng : cityData.lng;

  // Exact Qibla angle from North (e.g. Dhaka is ~268.4°)
  const qiblaAngle = useMemo(() => {
    return calculateQibla(activeLat, activeLng);
  }, [activeLat, activeLng]);

  // Active heading (either real sensor or manual slider)
  const currentHeading = sensorActive ? deviceHeading : manualHeading;

  // Relative angle to turn towards Kaaba (0 means pointing straight at Kaaba)
  const relativeAngle = ((qiblaAngle - currentHeading + 360) % 360);
  
  // Alignment thresholds:
  // Exact aligned: within +/- 6 degrees
  const isAligned = Math.abs(relativeAngle) <= 6 || Math.abs(relativeAngle - 360) <= 6;
  // Near aligned (getting close): within +/- 18 degrees
  const isNear = !isAligned && (Math.abs(relativeAngle) <= 18 || Math.abs(relativeAngle - 360) <= 18);

  // Synthesize soft harmonic chime via Web Audio API
  const playAlignmentChime = useCallback(() => {
    if (!audioFeedbackEnabled || typeof window === 'undefined') return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch {
      // Audio autoplay restrictions catch
    }
  }, [audioFeedbackEnabled]);

  // Voice announcement for visually impaired users
  const speakDirectionAnnounce = useCallback((text: string) => {
    if (!voiceAssistEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'bn-BD';
      utter.rate = 1.0;
      window.speechSynthesis.speak(utter);
    } catch {}
  }, [voiceAssistEnabled]);

  // Enhanced Haptic Vibration Loop for Visually Impaired Users
  useEffect(() => {
    const hasVibrator = typeof navigator !== 'undefined' && 'vibrate' in navigator;

    if (isAligned) {
      if (!prevAlignedRef.current) {
        // Just crossed into exact alignment
        if (hapticEnabled && hasVibrator) {
          try {
            // Distinctive double buzz for successful alignment
            navigator.vibrate([140, 70, 140]);
          } catch {}
        }
        playAlignmentChime();
        speakDirectionAnnounce('মাশাআল্লাহ, আপনি ঠিক কিবলামুখী হয়েছেন।');
      }

      // Continuous rhythmic tactile reassurance pulse while holding aligned direction
      // Every 1.3 seconds, pulse twice so a visually impaired person feels they are still on target
      let pulseInterval: ReturnType<typeof setInterval> | null = null;
      if (hapticEnabled && hasVibrator) {
        pulseInterval = setInterval(() => {
          try {
            navigator.vibrate([90, 60, 90]);
          } catch {}
        }, 1300);
      }

      prevAlignedRef.current = true;
      wasNearRef.current = false;

      return () => {
        if (pulseInterval) clearInterval(pulseInterval);
      };
    } else {
      prevAlignedRef.current = false;

      // Proximity tactile cue: when getting close (within 18 degrees)
      if (isNear && !wasNearRef.current) {
        if (hapticEnabled && hasVibrator) {
          try {
            // Gentle short single buzz to signal "approaching Qibla"
            navigator.vibrate(35);
          } catch {}
        }
        wasNearRef.current = true;
      } else if (!isNear) {
        wasNearRef.current = false;
      }
    }
  }, [isAligned, isNear, hapticEnabled, playAlignmentChime, speakDirectionAnnounce]);

  // Test Haptic and Chime immediately
  const handleTestHaptic = () => {
    setTestActive(true);
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([160, 80, 160]);
      } catch {}
    }
    playAlignmentChime();
    speakDirectionAnnounce('হ্যাপটিক ভাইব্রেশন ও অডিও সংকেত সফলভাবে পরীক্ষিত হয়েছে।');
    setTimeout(() => setTestActive(false), 1200);
  };

  // Device orientation handler
  const handleOrientation = useCallback((e: DeviceOrientationEvent) => {
    let heading = 0;
    // iOS Safari webkitCompassHeading provides true north directly
    const webkitHeading = (e as unknown as { webkitCompassHeading?: number }).webkitCompassHeading;
    if (typeof webkitHeading === 'number') {
      heading = webkitHeading;
      setSensorActive(true);
    } else if (e.alpha !== null) {
      // Android / generic alpha
      heading = 360 - e.alpha;
      setSensorActive(true);
    }
    setDeviceHeading(Math.round(heading));
  }, []);

  // Request sensor permission (Required for iOS 13+)
  const requestCompassPermission = async () => {
    try {
      const DeviceOrientationEventAny = window.DeviceOrientationEvent as unknown as {
        requestPermission?: () => Promise<'granted' | 'denied'>;
      };

      if (typeof DeviceOrientationEventAny?.requestPermission === 'function') {
        const response = await DeviceOrientationEventAny.requestPermission();
        if (response === 'granted') {
          setPermissionState('granted');
          window.addEventListener('deviceorientation', handleOrientation, true);
        } else {
          setPermissionState('denied');
        }
      } else if ('ondeviceorientation' in window) {
        // Standard Android / desktop browser
        window.addEventListener('deviceorientation', handleOrientation, true);
        setPermissionState('granted');
      } else {
        setPermissionState('unsupported');
      }
    } catch (err) {
      console.warn('Compass permission error:', err);
      setPermissionState('unsupported');
    }
  };

  useEffect(() => {
    // Try auto-listening if available
    if ('ondeviceorientation' in window) {
      window.addEventListener('deviceorientation', handleOrientation, true);
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation, true);
    };
  }, [handleOrientation]);

  // Request GPS coordinates for maximum precision
  const requestGPS = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        (err) => {
          console.warn('Geolocation error:', err);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    }
  };

  return (
    <div className="space-y-4 max-w-xl mx-auto">
      {/* Accessibility Live Region for Screen Readers (TalkBack / VoiceOver) */}
      <div className="sr-only" role="status" aria-live="polite">
        {isAligned
          ? 'মাশাআল্লাহ! আপনি ঠিক কিবলামুখী আছেন।'
          : `ফোনটি ${relativeAngle > 180 ? 'বামে' : 'ডানে'} আরও ${Math.round(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle)} ডিগ্রি ঘোরান।`}
      </div>

      {/* Top Location & GPS Info Card */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600" />
            <span>কিবলার সঠিক দিক নির্ণয়</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            স্থান: <strong>{userCoords ? 'আপনার সঠিক GPS লোকেশন' : `${cityData.nameBn} (${cityData.nameEn})`}</strong> • কিবলা কোণ:{' '}
            <strong className="text-emerald-700 dark:text-emerald-400">{toBengaliNumerals(qiblaAngle)}° (পশ্চিম-দক্ষিণ)</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowCalibrationModal(true)}
            className="px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 text-xs font-semibold border border-amber-300 dark:border-amber-800/80 hover:bg-amber-100 dark:hover:bg-amber-900/50 flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="সেন্সর নির্ভুল করার ক্যালিব্রেশন নির্দেশিকা দেখুন"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>ক্যালিব্রেশন গাইড</span>
          </button>

          <button
            onClick={requestGPS}
            className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center gap-1 cursor-pointer"
          >
            <Navigation2 className="w-3.5 h-3.5" />
            <span>GPS লোকেশন</span>
          </button>
        </div>
      </div>

      {/* Visually Impaired Tactile / Haptic & Sound Controls Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/80 dark:bg-slate-900 border border-emerald-500/30 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              দৃষ্টিপ্রতিবন্ধী ও স্পর্শভিত্তিক সহায়তা (Haptic Vibration)
            </span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">
            স্পর্শানুভূতি মোড
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-500/15">
          {/* Haptic Vibration Toggle Button */}
          <button
            onClick={() => setHapticEnabled(!hapticEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              hapticEnabled
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title="কিবলামুখী হলে ফোনটি কেঁপে উঠবে"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>ভাইব্রেশন: {hapticEnabled ? 'চালু' : 'বন্ধ'}</span>
          </button>

          {/* Audio Chime Toggle Button */}
          <button
            onClick={() => setAudioFeedbackEnabled(!audioFeedbackEnabled)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              audioFeedbackEnabled
                ? 'bg-teal-600 text-white border-teal-500 shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title="সঠিক দিক এলে মিষ্টি শব্দ করবে"
          >
            {audioFeedbackEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>অডিও বীপ: {audioFeedbackEnabled ? 'চালু' : 'বন্ধ'}</span>
          </button>

          {/* Test Vibration & Audio Button */}
          <button
            onClick={handleTestHaptic}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition border cursor-pointer ${
              testActive
                ? 'bg-amber-500 text-slate-950 border-amber-600 scale-105'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100'
            }`}
            title="ফোনটি ভাইব্রেট করে কিনা পরীক্ষা করুন"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{testActive ? 'স্পর্শ সংকেত বাজছে...' : 'ভাইব্রেশন টেস্ট'}</span>
          </button>
        </div>
      </div>

      {/* Main Compass Dial Card */}
      <div className="p-6 rounded-3xl bg-linear-to-b from-slate-900 to-slate-950 text-white shadow-xl border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Glow & Haptic Indicator if aligned */}
        {isAligned && (
          <div className="absolute inset-0 bg-emerald-500/15 pointer-events-none animate-pulse" />
        )}

        {/* Alignment status banner */}
        <div className="mb-4">
          {isAligned ? (
            <div className="px-4 py-2 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/60 flex items-center gap-2 font-bold text-sm sm:text-base shadow-lg animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>মাশাআল্লাহ! আপনি ঠিক কিবলামুখী আছেন</span>
              {hapticEnabled && <span className="text-xs bg-emerald-400/20 px-2 py-0.5 rounded-full">📳 ভাইব্রেট হচ্ছে</span>}
            </div>
          ) : isNear ? (
            <div className="px-3.5 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/50 text-xs sm:text-sm flex items-center gap-1.5 font-semibold animate-pulse">
              <Radio className="w-4 h-4 text-amber-400 animate-ping" />
              <span>কিবলার খুব কাছাকাছি! সামান্য {relativeAngle > 180 ? 'বামে' : 'ডানে'} ঘোরান</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700 text-xs flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
              <span>
                ফোনটি {relativeAngle > 180 ? 'বামে' : 'ডানে'} আরও{' '}
                <strong className="text-amber-400">
                  {toBengaliNumerals(Math.round(relativeAngle > 180 ? 360 - relativeAngle : relativeAngle))}°
                </strong>{' '}
                ঘোরান
              </span>
            </div>
          )}
        </div>

        {/* Compass Rotating Visual */}
        <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
          {/* Outer dial ring */}
          <div 
            className="absolute inset-0 rounded-full border-4 border-slate-700 shadow-inner flex items-center justify-center transition-transform duration-300"
            style={{ transform: `rotate(${-currentHeading}deg)` }}
          >
            {/* Cardinal Marks */}
            <span className="absolute top-2 text-rose-500 font-extrabold text-sm tracking-wider">উত্তর (N)</span>
            <span className="absolute right-3 text-slate-400 font-bold text-xs">পূর্ব (E)</span>
            <span className="absolute bottom-2 text-slate-400 font-bold text-xs">দক্ষিণ (S)</span>
            <span className="absolute left-3 text-emerald-400 font-bold text-xs">পশ্চিম (W)</span>

            {/* Degree tick markers */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <div
                key={deg}
                className="absolute w-0.5 h-3 bg-slate-600 top-0 origin-bottom"
                style={{
                  transform: `rotate(${deg}deg) translateY(6px)`,
                  transformOrigin: '50% 128px'
                }}
              />
            ))}

            {/* Exact Kaaba Marker on Dial */}
            <div
              className="absolute top-0 origin-bottom flex flex-col items-center"
              style={{
                transform: `rotate(${qiblaAngle}deg)`,
                transformOrigin: '50% 128px'
              }}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-600 border-2 border-amber-300 shadow-lg flex items-center justify-center -mt-3 animate-pulse">
                <span className="text-sm">🕋</span>
              </div>
              <span className="text-[10px] text-amber-300 font-bold mt-1 bg-black/60 px-1 rounded">
                কাবা শরীফ
              </span>
            </div>
          </div>

          {/* Central Needle pointing to Kaaba */}
          <div
            className="absolute w-12 h-44 flex flex-col items-center justify-between transition-transform duration-300 pointer-events-none"
            style={{ transform: `rotate(${relativeAngle}deg)` }}
          >
            {/* Pointer to Kaaba */}
            <div className="flex flex-col items-center">
              <div className="w-0 h-0 border-l-[14px] border-l-transparent border-r-[14px] border-r-transparent border-b-[36px] border-b-emerald-400 filter drop-shadow(0 0 6px #10b981)" />
              <div className="w-3.5 h-12 bg-linear-to-b from-emerald-400 to-emerald-600 rounded-b-sm" />
            </div>

            {/* Center Pivot Point */}
            <div className="w-8 h-8 rounded-full bg-slate-900 border-4 border-amber-400 shadow-lg flex items-center justify-center z-10 -my-4">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            </div>

            {/* Tail needle */}
            <div className="flex flex-col items-center opacity-60">
              <div className="w-2 h-10 bg-slate-500 rounded-t-sm" />
              <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[20px] border-t-slate-500" />
            </div>
          </div>
        </div>

        {/* Degree Readout */}
        <div className="mt-3 text-center">
          <div className="text-3xl font-mono font-extrabold text-emerald-400">
            {toBengaliNumerals(Math.round(currentHeading))}°
          </div>
          <div className="text-xs text-slate-400">
            {sensorActive ? 'মোবাইল সেন্সর সক্রিয়' : 'ম্যানুয়াল ডায়াল মোড'}
          </div>
        </div>

        {/* Sensor activation button for iOS / Android */}
        {!sensorActive && (
          <div className="mt-4 w-full">
            <button
              onClick={requestCompassPermission}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>মোবাইলের কম্পাস সেন্সর সক্রিয় করুন</span>
            </button>
            {permissionState === 'denied' && (
              <p className="text-[11px] text-rose-400 text-center mt-1">
                ব্রাউজার সেটিংসে গিয়ে মোশন সেন্সর পারমিশন অন করুন।
              </p>
            )}
          </div>
        )}

        {/* Manual adjustment slider for desktop / when sensor is unavailable */}
        <div className="mt-4 w-full pt-3 border-t border-slate-800">
          <label className="text-xs text-slate-400 flex items-center justify-between mb-1.5">
            <span>কম্পাস ঘুরিয়ে পরীক্ষা করুন (ম্যানুয়াল ডায়াল):</span>
            <span className="font-mono text-emerald-400">{toBengaliNumerals(manualHeading)}°</span>
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={manualHeading}
            onChange={(e) => {
              setSensorActive(false);
              setManualHeading(Number(e.target.value));
            }}
            className="w-full accent-emerald-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
          />
        </div>
      </div>

      {/* Visually Impaired Guide & Accessibility Instructions */}
      <div className="p-4 rounded-2xl bg-amber-50/90 dark:bg-slate-800/70 border border-amber-300 dark:border-amber-800/50 text-xs sm:text-sm space-y-2">
        <h4 className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
          <Eye className="w-4 h-4 text-amber-600 shrink-0" />
          <span>দৃষ্টিপ্রতিবন্ধী ভাই-বোনদের জন্য স্পর্শ সংকেতের নিয়মাবলী:</span>
        </h4>
        <ul className="list-disc list-inside space-y-1 text-slate-700 dark:text-slate-300 leading-relaxed">
          <li>
            <strong>হাতে নিয়ে ধীরে ধীরে ঘোরান:</strong> ফোনটি হাতের তালুতে সমান্তরাল রেখে নিজের শরীরসহ ডানে বা বামে ধীরে ধীরে ঘুরুন।
          </li>
          <li>
            <strong>কাছাকাছি এলে মৃদু সংকেত:</strong> কিবলার কাছাকাছি (১৮ ডিগ্রির মধ্যে) এলে ফোনটি হালকা একবার কেঁপে সতর্ক করবে।
          </li>
          <li>
            <strong>ঠিক কিবলামুখী হলে দ্বিগুণ ভাইব্রেশন:</strong> যখন আপনি ঠিক কিবলামুখী হবেন, তখন ফোনটি পরপর দুইবার জোরালোভাবে কেঁপে উঠবে এবং মিষ্টি সুর বাজবে।
          </li>
          <li>
            <strong>ধারাবাহিক স্পন্দন:</strong> যতক্ষণ আপনি সঠিক কিবলামুখী ধরে রাখবেন, ততক্ষণ প্রতি ১.৩ সেকেন্ড পর পর ছন্দময় ভাইব্রেশন দিয়ে নিশ্চিত করবে যে আপনার দিক এখনও ঠিক আছে।
          </li>
          <li>
            স্ক্রিন রিডার ব্যবহারকারীদের জন্য স্বয়ংক্রিয় ভয়েস নির্দেশনা (Accessibility Voiceover) সক্রিয় রয়েছে।
          </li>
        </ul>
      </div>
      {/* Calibration Guide Overlay Modal (Appears on first load & re-openable) */}
      {showCalibrationModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="calibration-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-5 sm:p-6 space-y-4 relative animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <h3 id="calibration-modal-title" className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100">
                    কম্পাস সেন্সর ক্যালিব্রেশন সহায়িকা
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    কিবলার শতভাগ নির্ভুল দিক পাওয়ার সহজ পদ্ধতি
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleCloseCalibration(false)}
                className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 transition cursor-pointer"
                title="বন্ধ করুন"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual Figure-8 Motion Graphic Card */}
            <div className="p-4 rounded-2xl bg-linear-to-br from-emerald-900 via-teal-900 to-slate-900 text-white text-center space-y-2 border border-emerald-500/30 shadow-inner">
              <div className="flex items-center justify-center gap-3">
                <div className="relative flex items-center justify-center w-16 h-10 border-2 border-dashed border-amber-300/80 rounded-full animate-pulse">
                  <Smartphone className="w-5 h-5 text-amber-300" />
                </div>
                <span className="text-xl font-mono text-amber-300">⇄</span>
                <div className="relative flex items-center justify-center w-16 h-10 border-2 border-dashed border-amber-300/80 rounded-full animate-pulse">
                  <Smartphone className="w-5 h-5 text-amber-300" />
                </div>
              </div>
              <p className="text-xs sm:text-sm font-bold text-amber-200">
                🔄 ফোনটি বাতাসে ইংরেজি '8' (Figure-8) আকারে ২-৩ বার ঘোরান
              </p>
              <p className="text-[11px] text-emerald-100/80">
                এটি মোবাইলের ম্যাগনেটিক সেন্সরের বিচ্যুতি দূর করে দিকনির্দেশনা নিখুঁত করে
              </p>
            </div>

            {/* 3 Step-by-Step Instructions */}
            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  ১
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-slate-100 block">৮-আকারের মোশন (Figure-8 wave):</strong>
                  ফোনটি হাতে ধরে বাতাসে ইংরেজি '8' অথবা '∞' আকারে ২-৩ বার আলতোভাবে ঢেউয়ের মতো ঘোরান।
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  ২
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-slate-100 block">মেঝের সমান্তরাল (Flat) রাখুন:</strong>
                  কিবলার দিক দেখার সময় ফোনটি খাড়া না রেখে হাতের তালুতে মেঝের সমান্তরাল সোজা রাখুন।
                </div>
              </div>

              <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  ৩
                </div>
                <div className="text-slate-700 dark:text-slate-300">
                  <strong className="text-slate-900 dark:text-slate-100 block">চুম্বক ও মেটাল কেস পরিহার:</strong>
                  ম্যাগনেটিক ফোন কেস, ল্যাপটপ, স্পিকার বা ধাতব বস্তু থেকে অন্তত ২ ফুট দূরে অবস্থান করুন।
                </div>
              </div>
            </div>

            {/* Checkbox: Don't show again */}
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="dontShowAgainCheckbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 accent-emerald-600 cursor-pointer"
              />
              <label htmlFor="dontShowAgainCheckbox" className="text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
                ভবিষ্যতে এই নির্দেশিকা স্বয়ংক্রিয়ভাবে দেখাবেন না
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => handleCloseCalibration(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Compass className="w-4 h-4" />
                <span>সেন্সর চালু ও কিবলা নির্ণয়</span>
              </button>

              <button
                onClick={() => handleCloseCalibration(false)}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm transition cursor-pointer"
              >
                বুঝেছি
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
