import React, { useState } from 'react';
import { 
  MapPin, 
  Navigation, 
  Phone, 
  MessageSquare, 
  Edit3, 
  Check, 
  ExternalLink, 
  Info, 
  ShieldCheck, 
  Sparkles,
  Layers
} from 'lucide-react';
import { MosqueSettings, Language } from '../types/mosque';
import { TRANSLATIONS } from '../utils/translations';
import { toBengaliNumerals } from '../utils/prayerCalculator';

interface MosqueMapSectionProps {
  settings: MosqueSettings;
  onUpdateSettings: (newSettings: Partial<MosqueSettings>) => void;
  language: Language;
}

export const MosqueMapSection: React.FC<MosqueMapSectionProps> = ({
  settings,
  onUpdateSettings,
  language
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempSettings, setTempSettings] = useState({
    name: settings.name,
    location: settings.location,
    lat: settings.lat,
    lng: settings.lng,
    imamName: settings.imamName,
    imamPhone: settings.imamPhone,
    muazzinName: settings.muazzinName,
    muazzinPhone: settings.muazzinPhone,
  });

  const t = TRANSLATIONS[language];

  const handleSave = () => {
    onUpdateSettings({
      name: tempSettings.name,
      location: tempSettings.location,
      lat: Number(tempSettings.lat) || settings.lat,
      lng: Number(tempSettings.lng) || settings.lng,
      imamName: tempSettings.imamName,
      imamPhone: tempSettings.imamPhone,
      muazzinName: tempSettings.muazzinName,
      muazzinPhone: tempSettings.muazzinPhone,
    });
    setIsEditing(false);
  };

  // Google Maps directions link
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${settings.lat},${settings.lng}`;
  const osmEmbedUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${settings.lng - 0.008}%2C${settings.lat - 0.006}%2C${settings.lng + 0.008}%2C${settings.lat + 0.006}&layer=mapnik&marker=${settings.lat}%2C${settings.lng}`;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Mosque Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/40 mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>স্থানীয় কেন্দ্রীয় জামে মসজিদ</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
              {settings.name}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-1">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{settings.location}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition"
            >
              <Navigation className="w-4 h-4" />
              <span>গুগল ম্যাপে দিকনির্দেশনা (রাস্তা)</span>
            </a>

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 border border-slate-200 dark:border-slate-700"
              title="মসজিদের তথ্য ও অবস্থান পরিবর্তন"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Edit Info Form */}
        {isEditing && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-1.5">
              <Edit3 className="w-4 h-4 text-emerald-600" />
              <span>মসজিদের নাম, ঠিকানা ও অবস্থান সম্পাদনা করুন</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <label>
                <span className="font-semibold text-slate-700 dark:text-slate-300">মসজিদের নাম:</span>
                <input
                  type="text"
                  value={tempSettings.name}
                  onChange={(e) => setTempSettings({ ...tempSettings, name: e.target.value })}
                  className="mt-1 w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-700 dark:text-slate-300">ঠিকানা ও এলাকা:</span>
                <input
                  type="text"
                  value={tempSettings.location}
                  onChange={(e) => setTempSettings({ ...tempSettings, location: e.target.value })}
                  className="mt-1 w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Latitude (অক্ষরেখা):</span>
                <input
                  type="number"
                  step="any"
                  value={tempSettings.lat}
                  onChange={(e) => setTempSettings({ ...tempSettings, lat: Number(e.target.value) })}
                  className="mt-1 w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-700 dark:text-slate-300">Longitude (দ্রাঘিমারেখা):</span>
                <input
                  type="number"
                  step="any"
                  value={tempSettings.lng}
                  onChange={(e) => setTempSettings({ ...tempSettings, lng: Number(e.target.value) })}
                  className="mt-1 w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-700 dark:text-slate-300">ইমাম সাহেবের নাম ও ফোন:</span>
                <input
                  type="text"
                  value={tempSettings.imamName}
                  onChange={(e) => setTempSettings({ ...tempSettings, imamName: e.target.value })}
                  className="mt-1 w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="নাম"
                />
                <input
                  type="tel"
                  value={tempSettings.imamPhone}
                  onChange={(e) => setTempSettings({ ...tempSettings, imamPhone: e.target.value })}
                  className="mt-1.5 w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="মোবাইল নম্বর"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-700 dark:text-slate-300">মুয়াজ্জিন সাহেবের নাম ও ফোন:</span>
                <input
                  type="text"
                  value={tempSettings.muazzinName}
                  onChange={(e) => setTempSettings({ ...tempSettings, muazzinName: e.target.value })}
                  className="mt-1 w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="নাম"
                />
                <input
                  type="tel"
                  value={tempSettings.muazzinPhone}
                  onChange={(e) => setTempSettings({ ...tempSettings, muazzinPhone: e.target.value })}
                  className="mt-1.5 w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="মোবাইল নম্বর"
                />
              </label>
            </div>

            <div className="mt-3 flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                বাতিল
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" /> সংরক্ষণ করুন
              </button>
            </div>
          </div>
        )}

        {/* Interactive Map Embed */}
        <div className="mt-4 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-inner relative h-72 sm:h-96 bg-slate-100 dark:bg-slate-800">
          <iframe
            title="Mosque Location Map"
            src={osmEmbedUrl}
            className="w-full h-full border-0"
            loading="lazy"
          />

          {/* Floating Marker Badge overlay */}
          <div className="absolute top-3 left-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3 py-2 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-xs">
            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span className="text-sm">🕌</span>
              <span>{settings.name}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {toBengaliNumerals(settings.lat.toFixed(4))}° N, {toBengaliNumerals(settings.lng.toFixed(4))}° E
            </div>
          </div>

          {/* Quick link button to open OpenStreetMap */}
          <div className="absolute bottom-3 right-3">
            <a
              href={`https://www.openstreetmap.org/?mlat=${settings.lat}&mlon=${settings.lng}#map=17/${settings.lat}/${settings.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 text-xs font-semibold shadow-md border border-slate-200 dark:border-slate-700 hover:bg-white flex items-center gap-1"
            >
              <ExternalLink className="w-3.5 h-3.5" /> বড় ম্যাপে দেখুন
            </a>
          </div>
        </div>
      </div>

      {/* Mosque Facilities & Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Facilities */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <span>মসজিদের সুযোগ-সুবিধা ও সেবা</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {settings.features.map((feature, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-slate-800/60 border border-emerald-100 dark:border-emerald-950 flex items-center gap-2"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="font-medium text-slate-800 dark:text-slate-200">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contacts */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <Phone className="w-5 h-5 text-emerald-600" />
              <span>ইমাম ও মুয়াজ্জিন সাহেবের যোগাযোগ</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              {/* Imam */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">ইমাম ও খতীব</div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">{settings.imamName}</div>
                  <div className="text-slate-500 dark:text-slate-400">{settings.imamPhone}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${settings.imamPhone}`}
                    className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
                    title="সরাসরি কল করুন"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/88${settings.imamPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white"
                    title="হোয়াটসঅ্যাপে মেসেজ"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Muazzin */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400">মুয়াজ্জিন সাহেব</div>
                  <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">{settings.muazzinName}</div>
                  <div className="text-slate-500 dark:text-slate-400">{settings.muazzinPhone}</div>
                </div>
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${settings.muazzinPhone}`}
                    className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white"
                    title="সরাসরি কল করুন"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                  <a
                    href={`https://wa.me/88${settings.muazzinPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white"
                    title="হোয়াটসঅ্যাপে মেসেজ"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
            জরুরি প্রয়োজনে বা জানাজার তথ্য জানতে সরাসরি ফোন করতে পারেন।
          </div>
        </div>
      </div>
    </div>
  );
};
