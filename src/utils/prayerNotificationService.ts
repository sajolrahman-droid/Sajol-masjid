import { PrayerNotificationSettings } from '../types/mosque';

const NOTIFICATION_SETTINGS_KEY = 'mosque_prayer_notification_settings';
const TRIGGERED_PRAYERS_KEY = 'mosque_triggered_prayers_log';

export const DEFAULT_PRAYER_NOTIFICATION_SETTINGS: PrayerNotificationSettings = {
  enabled: true,
  soundAlert: true,
  vibrationAlert: true,
  leadTimeMinutes: 0, // 0 = exactly at prayer time
  athanSoundType: 'adhan_melody',
  prayers: {
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
    tahajjud: false,
    sehri: true,
    iftar: true,
    jummah: true
  },
  jummahAlert: {
    enabled: true,
    leadTimeMinutes: 30, // 30 minutes before Jummah on Fridays
    soundType: 'adhan_melody',
    customNote: 'জুমুআর সালাতের প্রস্তুতির সময় হয়েছে (গোসল, মেসওয়াক ও সুরমা ব্যবহার করুন)'
  }
};

/**
 * Load prayer notification settings from localStorage
 */
export function loadPrayerNotificationSettings(): PrayerNotificationSettings {
  try {
    const raw = localStorage.getItem(NOTIFICATION_SETTINGS_KEY);
    if (!raw) return DEFAULT_PRAYER_NOTIFICATION_SETTINGS;
    return {
      ...DEFAULT_PRAYER_NOTIFICATION_SETTINGS,
      ...JSON.parse(raw),
      prayers: {
        ...DEFAULT_PRAYER_NOTIFICATION_SETTINGS.prayers,
        ...(JSON.parse(raw).prayers || {})
      }
    };
  } catch {
    return DEFAULT_PRAYER_NOTIFICATION_SETTINGS;
  }
}

/**
 * Save prayer notification settings to localStorage
 */
export function savePrayerNotificationSettings(settings: PrayerNotificationSettings): void {
  try {
    localStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Failed to save prayer notification settings', err);
  }
}

/**
 * Check if Web Notifications API is supported
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current browser notification permission
 */
export function getNotificationPermission(): 'granted' | 'denied' | 'default' | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<'granted' | 'denied' | 'default' | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      sendTestNotification();
    }
    return perm;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

// Active AudioContext reference to allow stopping active alarms
let activeAudioCtx: AudioContext | null = null;
let activeOscillators: OscillatorNode[] = [];

/**
 * Stop any currently ringing prayer alarm/adhan
 */
export function stopPrayerAlarmSound(): void {
  try {
    activeOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    activeOscillators = [];
    if (activeAudioCtx && activeAudioCtx.state !== 'closed') {
      activeAudioCtx.close().catch(() => {});
      activeAudioCtx = null;
    }
  } catch {}
}

/**
 * Plays an Islamic melodic Adhan or chime alarm using Web Audio API
 * Works 100% offline with zero external audio assets required!
 */
export function playPrayerAlarmSound(
  soundType: 'gentle_chime' | 'adhan_melody' | 'soft_bell' = 'adhan_melody'
): { stop: () => void } {
  stopPrayerAlarmSound();

  if (typeof window === 'undefined') return { stop: () => {} };

  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return { stop: () => {} };

    const ctx = new AudioCtx();
    activeAudioCtx = ctx;

    const playTone = (freq: number, start: number, dur: number, gainVal = 0.18, type: OscillatorType = 'sine') => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime + start);

      gain.gain.setValueAtTime(0.001, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(gainVal, ctx.currentTime + start + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
      activeOscillators.push(osc);
    };

    if (soundType === 'adhan_melody') {
      // Islamic Takbeer melodic intervals (D4, G4, A4, B4, C5)
      // "Allahu Akbar, Allahu Akbar" cadence
      const notes = [
        { f: 293.66, t: 0.0, d: 0.5 },  // D4
        { f: 392.00, t: 0.5, d: 0.7 },  // G4
        { f: 440.00, t: 1.2, d: 0.9 },  // A4
        { f: 392.00, t: 2.2, d: 1.1 },  // G4
        // Second call
        { f: 293.66, t: 3.5, d: 0.5 },  // D4
        { f: 392.00, t: 4.0, d: 0.7 },  // G4
        { f: 440.00, t: 4.7, d: 0.9 },  // A4
        { f: 493.88, t: 5.7, d: 1.4 },  // B4
        { f: 440.00, t: 7.2, d: 0.8 },  // A4
        { f: 392.00, t: 8.0, d: 1.8 }   // G4 (resolution)
      ];

      notes.forEach((n) => {
        playTone(n.f, n.t, n.d, 0.22, 'sine');
        // Add subtle octave harmonic for fullness
        playTone(n.f * 2, n.t, n.d * 0.8, 0.06, 'triangle');
      });
    } else if (soundType === 'gentle_chime') {
      // Gentle peaceful multi-tier bell chime (E5, G#5, B5, E6)
      const chimeNotes = [
        { f: 659.25, t: 0.0, d: 1.2 },
        { f: 830.61, t: 0.3, d: 1.2 },
        { f: 987.77, t: 0.6, d: 1.5 },
        { f: 1318.51, t: 0.9, d: 2.2 }
      ];
      chimeNotes.forEach((n) => playTone(n.f, n.t, n.d, 0.2, 'sine'));
    } else {
      // Soft repetitive bell alert
      for (let i = 0; i < 4; i++) {
        playTone(880, i * 0.7, 0.5, 0.2, 'sine');
        playTone(1760, i * 0.7, 0.3, 0.05, 'triangle');
      }
    }

    return {
      stop: stopPrayerAlarmSound
    };
  } catch (err) {
    console.warn('AudioContext playback error:', err);
    return { stop: () => {} };
  }
}

/**
 * Triggers vibration feedback for prayer alert
 */
export function triggerPrayerVibration(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      // Distinctive Islamic notification vibration rhythm
      navigator.vibrate([300, 150, 300, 150, 600]);
    } catch {}
  }
}

/**
 * Send an actual Web Notification using the Notifications API
 */
export function sendPrayerWebNotification(
  title: string,
  body: string,
  tag = 'mosque-prayer-alert'
): boolean {
  if (!isNotificationSupported()) return false;
  if (Notification.permission !== 'granted') return false;

  try {
    const iconUrl = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23059669"><path d="M12 2C8 2 4 6 4 10v12h16V10c0-4-4-8-8-8zm0 2c3.1 0 6 3 6 6v10H6V10c0-3 2.9-6 6-6zm-1 8v4h2v-4h-2z"/></svg>';

    // Try standard Notification
    new Notification(title, {
      body,
      icon: iconUrl,
      badge: iconUrl,
      tag,
      renotify: true,
      requireInteraction: true // Stays visible until user dismisses it
    } as NotificationOptions & { renotify?: boolean; requireInteraction?: boolean });

    return true;
  } catch (err) {
    console.warn('Notification display failed, falling back:', err);
    return false;
  }
}

/**
 * Send test notification to verify setup
 */
export function sendTestNotification(): void {
  const title = 'মসজিদ সঙ্গী: নামাজের এলার্ট সক্রিয়';
  const body = 'আলহামদুলিল্লাহ! আপনার ডিভাইসে নামাজের সময়সূচীর এলার্ট ও নোটিফিকেশন সফলভাবে চালু হয়েছে।';
  sendPrayerWebNotification(title, body, 'test-notification');
  playPrayerAlarmSound('gentle_chime');
  triggerPrayerVibration();
}

/**
 * Check if a prayer notification was already triggered today
 */
export function wasPrayerTriggeredToday(prayerKey: string, leadMinutes: number): boolean {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const key = `${today}_${prayerKey}_${leadMinutes}`;
    const raw = localStorage.getItem(TRIGGERED_PRAYERS_KEY);
    if (!raw) return false;
    const log: string[] = JSON.parse(raw);
    return log.includes(key);
  } catch {
    return false;
  }
}

/**
 * Mark a prayer as triggered today
 */
export function markPrayerAsTriggeredToday(prayerKey: string, leadMinutes: number): void {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const key = `${today}_${prayerKey}_${leadMinutes}`;
    const raw = localStorage.getItem(TRIGGERED_PRAYERS_KEY);
    let log: string[] = raw ? JSON.parse(raw) : [];
    
    // Keep only today's records
    log = log.filter((item) => item.startsWith(today));
    if (!log.includes(key)) {
      log.push(key);
    }
    localStorage.setItem(TRIGGERED_PRAYERS_KEY, JSON.stringify(log));
  } catch {}
}
