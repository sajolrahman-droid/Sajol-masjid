import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  Plus, 
  Trash2, 
  Sparkles, 
  Tag, 
  MapPin, 
  Check, 
  X, 
  BookOpen, 
  Sun, 
  Moon, 
  FileText, 
  CalendarCheck,
  CalendarDays,
  Printer,
  Info
} from 'lucide-react';
import { CalendarCustomNote, IslamicEventInfo, Language } from '../types/mosque';
import { 
  getMonthDaysData, 
  formatDateKey, 
  MAJOR_ISLAMIC_EVENTS 
} from '../utils/islamicEvents';
import { 
  calculatePrayerTimes, 
  toBengaliNumerals, 
  formatTimeInBengali,
  BD_CITIES 
} from '../utils/prayerCalculator';
import { TRANSLATIONS } from '../utils/translations';

interface MonthlyPrayerCalendarProps {
  selectedCity: string;
  isHanafi?: boolean;
  language?: Language;
  notes: CalendarCustomNote[];
  onAddNote: (note: Omit<CalendarCustomNote, 'id'>) => void;
  onDeleteNote: (id: string) => void;
}

const MONTH_NAMES_BN = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const WEEKDAYS_BN = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];
const WEEKDAYS_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const MonthlyPrayerCalendar: React.FC<MonthlyPrayerCalendarProps> = ({
  selectedCity,
  isHanafi = true,
  language = 'bn',
  notes = [],
  onAddNote,
  onDeleteNote
}) => {
  const t = TRANSLATIONS[language];
  const today = new Date();
  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'events' | 'notes'>('all');

  // New Note Form States
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState<CalendarCustomNote['category']>('event');
  const [newNoteTime, setNewNoteTime] = useState('');
  const [newNoteDesc, setNewNoteDesc] = useState('');

  // Find coordinates for prayer calculation
  const cityObj = useMemo(() => {
    return BD_CITIES.find(
      (c) => c.nameBn === selectedCity || c.nameEn.toLowerCase() === selectedCity.toLowerCase()
    ) || BD_CITIES[0];
  }, [selectedCity]);

  // Calendar month days data
  const monthData = useMemo(() => {
    return getMonthDaysData(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  // Map of notes indexed by dateStr "YYYY-MM-DD"
  const notesByDate = useMemo(() => {
    const map: Record<string, CalendarCustomNote[]> = {};
    for (const note of notes) {
      if (!map[note.dateStr]) map[note.dateStr] = [];
      map[note.dateStr].push(note);
    }
    return map;
  }, [notes]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentYear(prev => prev - 1);
      setCurrentMonth(11);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentYear(prev => prev + 1);
      setCurrentMonth(0);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDate(now);
  };

  // Selected date key & details
  const selectedDateStr = formatDateKey(selectedDate);
  const selectedDayNotes = notesByDate[selectedDateStr] || [];
  
  // Day's calculated prayer times
  const selectedDayPrayerTimes = useMemo(() => {
    return calculatePrayerTimes(selectedDate, cityObj.lat, cityObj.lng, isHanafi);
  }, [selectedDate, cityObj, isHanafi]);

  // Selected day's calendar item
  const selectedDayItem = useMemo(() => {
    return monthData.days.find(d => d.dateStr === selectedDateStr) || {
      date: selectedDate,
      dateStr: selectedDateStr,
      dayNumber: selectedDate.getDate(),
      dayOfWeek: selectedDate.getDay(),
      isFriday: selectedDate.getDay() === 5,
      isToday: selectedDateStr === formatDateKey(new Date()),
      hijri: monthData.days[0]?.hijri || { day: 1, monthBn: 'হিজরি', monthAr: '', year: 1448 },
      events: []
    };
  }, [monthData, selectedDateStr, selectedDate]);

  // Create new note
  const handleCreateNoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return;

    onAddNote({
      dateStr: selectedDateStr,
      title: newNoteTitle.trim(),
      category: newNoteCategory,
      time: newNoteTime.trim() || undefined,
      note: newNoteDesc.trim() || undefined,
      addedBy: 'মসজিদ কর্তৃপক্ষ'
    });

    setNewNoteTitle('');
    setNewNoteTime('');
    setNewNoteDesc('');
    setIsNoteModalOpen(false);
  };

  // Quick preset title buttons
  const applyQuickPreset = (title: string, category: CalendarCustomNote['category'], defaultTime?: string) => {
    setNewNoteTitle(title);
    setNewNoteCategory(category);
    if (defaultTime) setNewNoteTime(defaultTime);
  };

  // Month's list of upcoming events & notes for summary
  const monthOverviewItems = useMemo(() => {
    const list: {
      dateStr: string;
      date: Date;
      gregorianDay: number;
      dayOfWeek: number;
      hijriDay: number;
      hijriMonthBn: string;
      type: 'event' | 'note';
      eventData?: IslamicEventInfo;
      noteData?: CalendarCustomNote;
    }[] = [];

    // Add Islamic events
    for (const d of monthData.days) {
      for (const ev of d.events) {
        list.push({
          dateStr: d.dateStr,
          date: d.date,
          gregorianDay: d.dayNumber,
          dayOfWeek: d.dayOfWeek,
          hijriDay: d.hijri.day,
          hijriMonthBn: d.hijri.monthBn,
          type: 'event',
          eventData: ev
        });
      }

      // Add Custom notes for this day
      const dayNotes = notesByDate[d.dateStr] || [];
      for (const n of dayNotes) {
        list.push({
          dateStr: d.dateStr,
          date: d.date,
          gregorianDay: d.dayNumber,
          dayOfWeek: d.dayOfWeek,
          hijriDay: d.hijri.day,
          hijriMonthBn: d.hijri.monthBn,
          type: 'note',
          noteData: n
        });
      }
    }

    return list.sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [monthData, notesByDate]);

  const filteredOverviewItems = useMemo(() => {
    if (activeFilter === 'events') return monthOverviewItems.filter(i => i.type === 'event');
    if (activeFilter === 'notes') return monthOverviewItems.filter(i => i.type === 'note');
    return monthOverviewItems;
  }, [monthOverviewItems, activeFilter]);

  // Category labels and colors
  const categoryMeta: Record<CalendarCustomNote['category'], { label: string; color: string }> = {
    event: { label: 'মাহফিল / অনুষ্ঠান', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' },
    reminder: { label: 'স্মারক / রিমাইন্ডার', color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    milad: { label: 'মিলাদ / দোআ', color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    donation: { label: 'দান / ফান্ড সংগ্রহ', color: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' },
    meeting: { label: 'কমিটি মিটিং', color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300' },
    general: { label: 'সাধারণ নোট', color: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300' }
  };

  // Hijri month representation for the header
  const headerHijriSpan = useMemo(() => {
    const firstDayHijri = monthData.days[0]?.hijri;
    const lastDayHijri = monthData.days[monthData.days.length - 1]?.hijri;
    if (!firstDayHijri || !lastDayHijri) return '';
    if (firstDayHijri.monthBn === lastDayHijri.monthBn) {
      return `${firstDayHijri.monthBn} ${toBengaliNumerals(firstDayHijri.year)} হিজরি`;
    }
    return `${firstDayHijri.monthBn} - ${lastDayHijri.monthBn} ${toBengaliNumerals(firstDayHijri.year)} হিজরি`;
  }, [monthData]);

  return (
    <div className="space-y-4">
      {/* 1. Header Bar with Month-by-Month Navigation & Hijri Context */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300">
                <CalendarDays className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>{MONTH_NAMES_BN[currentMonth]} {toBengaliNumerals(currentYear)}</span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-900">
                    {headerHijriSpan}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{selectedCity} জেলা • হিজরি তারিখ, ইসলামিক দিবস ও মসজিদের নিজস্ব নোট সম্বলিত ক্যালেন্ডার</span>
                </p>
              </div>
            </div>
          </div>

          {/* Month Stepper Buttons */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              title="পূর্ববর্তী মাস"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              onClick={handleJumpToToday}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/70 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-bold border border-emerald-200 dark:border-emerald-800 transition"
              title="বর্তমান মাস ও আজ"
            >
              আজকের দিন
            </button>

            <button
              onClick={handleNextMonth}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition"
              title="পরবর্তী মাস"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 2. Calendar Grid */}
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-center font-bold text-xs py-2.5">
            {WEEKDAYS_BN.map((day, idx) => {
              const isFri = idx === 5;
              return (
                <div 
                  key={day} 
                  className={`flex flex-col items-center justify-center ${
                    isFri ? 'text-amber-700 dark:text-amber-400 font-extrabold' : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span>{day}</span>
                  <span className="text-[10px] font-normal opacity-70">
                    {language === 'en' ? WEEKDAYS_EN[idx] : isFri ? 'জুমা' : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Day Grid Cells */}
          <div className="grid grid-cols-7 bg-white dark:bg-slate-900 auto-rows-fr">
            {/* Empty slots before first day */}
            {Array.from({ length: monthData.firstDayOfWeek }).map((_, i) => (
              <div 
                key={`empty-${i}`} 
                className="min-h-[85px] sm:min-h-[105px] p-1.5 bg-slate-50/40 dark:bg-slate-950/20 border-b border-r border-slate-100 dark:border-slate-800/60"
              />
            ))}

            {/* Days of current month */}
            {monthData.days.map((dayItem) => {
              const isSelected = dayItem.dateStr === selectedDateStr;
              const dayNotes = notesByDate[dayItem.dateStr] || [];
              const hasEvents = dayItem.events.length > 0;
              const hasNotes = dayNotes.length > 0;

              return (
                <div
                  key={dayItem.dateStr}
                  onClick={() => setSelectedDate(dayItem.date)}
                  className={`min-h-[85px] sm:min-h-[105px] p-1.5 sm:p-2 border-b border-r border-slate-100 dark:border-slate-800/70 cursor-pointer transition-all duration-150 flex flex-col justify-between relative group ${
                    isSelected
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/40 ring-2 ring-emerald-500 z-10'
                      : dayItem.isToday
                      ? 'bg-amber-50/70 dark:bg-amber-950/20'
                      : dayItem.isFriday
                      ? 'bg-emerald-50/30 dark:bg-emerald-950/15 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  {/* Top Bar of Cell: Gregorian Date & Hijri Date */}
                  <div className="flex items-start justify-between gap-1">
                    <span 
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        dayItem.isToday 
                          ? 'bg-emerald-600 text-white shadow-xs' 
                          : isSelected
                          ? 'bg-emerald-700 text-white'
                          : dayItem.isFriday
                          ? 'text-amber-800 dark:text-amber-300 font-extrabold'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {toBengaliNumerals(dayItem.dayNumber)}
                    </span>

                    {/* Hijri Day badge */}
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold truncate">
                      {toBengaliNumerals(dayItem.hijri.day)} {dayItem.hijri.monthBn.slice(0, 4)}
                    </span>
                  </div>

                  {/* Badges in Cell */}
                  <div className="mt-1 space-y-1">
                    {/* Islamic Event Badge */}
                    {hasEvents && (
                      <div 
                        title={dayItem.events.map(e => e.nameBn).join(', ')}
                        className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-semibold truncate border ${dayItem.events[0].badgeColor || 'bg-amber-100 text-amber-900 border-amber-300'}`}
                      >
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 mr-1 animate-pulse" />
                        {dayItem.events[0].nameBn}
                      </div>
                    )}

                    {/* Custom Notes Badge */}
                    {hasNotes && (
                      <div 
                        title={`${dayNotes.length}টি কাস্টম নোট সংরক্ষিত`}
                        className="text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-bold truncate bg-blue-50 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200 dark:border-blue-900 flex items-center gap-1"
                      >
                        <FileText className="w-2.5 h-2.5 text-blue-500 shrink-0" />
                        <span className="truncate">{dayNotes[0].title}</span>
                        {dayNotes.length > 1 && (
                          <span className="shrink-0 text-[8px] bg-blue-200 dark:bg-blue-800 px-1 rounded-full">
                            +{dayNotes.length - 1}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom: Jummah indicator or quiet dot */}
                  <div className="mt-auto pt-1 flex items-center justify-between text-[10px] text-slate-400">
                    {dayItem.isFriday ? (
                      <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" /> জুমা
                      </span>
                    ) : (
                      <span />
                    )}

                    {dayItem.isToday && (
                      <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                        আজ
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. Selected Day Detailed Inspector & Custom Notes Panel */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Selected Date Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-xs">
                নির্বাচিত তারিখ
              </span>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {toBengaliNumerals(selectedDayItem.dayNumber)} {MONTH_NAMES_BN[selectedDate.getMonth()]} {toBengaliNumerals(selectedDate.getFullYear())} ({WEEKDAYS_BN[selectedDayItem.dayOfWeek]}বার)
              </h4>
            </div>
            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mt-1">
              🕌 হিজরি: {toBengaliNumerals(selectedDayItem.hijri.day)} {selectedDayItem.hijri.monthBn} {toBengaliNumerals(selectedDayItem.hijri.year)} হিজরি {selectedDayItem.isFriday ? '• পবিত্র জুমাবার' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNoteModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>নোট / কর্মসূচি যোগ করুন</span>
            </button>
          </div>
        </div>

        {/* Selected Day's Prayer Schedule Grid */}
        <div>
          <h5 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            এই দিনের নামাজের ওয়াক্তের সময়সূচী ({selectedCity})
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400 font-medium">সাহরি শেষ</div>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                {formatTimeInBengali(selectedDayPrayerTimes.sehri)}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <div className="text-emerald-700 dark:text-emerald-400 font-medium">ফজর</div>
              <div className="font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
                {formatTimeInBengali(selectedDayPrayerTimes.fajr)}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400 font-medium">সূর্যোদয়</div>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                {formatTimeInBengali(selectedDayPrayerTimes.sunrise)}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                {selectedDayItem.isFriday ? 'জুমুআ' : 'যোহর'}
              </div>
              <div className="font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
                {formatTimeInBengali(selectedDayPrayerTimes.dhuhr)}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <div className="text-emerald-700 dark:text-emerald-400 font-medium">আসর</div>
              <div className="font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
                {formatTimeInBengali(selectedDayPrayerTimes.asr)}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/50">
              <div className="text-amber-800 dark:text-amber-400 font-medium">মাগরিব / ইফতার</div>
              <div className="font-bold text-amber-950 dark:text-amber-200 mt-0.5">
                {formatTimeInBengali(selectedDayPrayerTimes.maghrib)}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/50">
              <div className="text-emerald-700 dark:text-emerald-400 font-medium">এশা</div>
              <div className="font-bold text-emerald-900 dark:text-emerald-200 mt-0.5">
                {formatTimeInBengali(selectedDayPrayerTimes.isha)}
              </div>
            </div>

            <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
              <div className="text-slate-500 dark:text-slate-400 font-medium">তাহাজ্জুদ</div>
              <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                {formatTimeInBengali(selectedDayPrayerTimes.tahajjud)}
              </div>
            </div>
          </div>
        </div>

        {/* Selected Day Islamic Events (if any) */}
        {selectedDayItem.events.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-bold text-amber-800 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              এই দিনের ইসলামিক দিবস ও তাৎপর্য
            </h5>
            <div className="space-y-2">
              {selectedDayItem.events.map((ev, i) => (
                <div 
                  key={i}
                  className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1"
                >
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="font-bold text-amber-950 dark:text-amber-200 text-sm">
                      {ev.nameBn}
                    </span>
                    {ev.isFastingSunnah && (
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold">
                        নফল রোজা সুন্নাত
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-amber-900/90 dark:text-amber-300 leading-relaxed">
                    {ev.significanceBn}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Notes for this Selected Day */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              মসজিদ ও ব্যক্তিগত নোট ({selectedDayNotes.length}টি)
            </h5>
          </div>

          {selectedDayNotes.length === 0 ? (
            <div className="p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
              এই তারিখে এখনও কোনো কাস্টম নোট বা কর্মসূচি যোগ করা হয়নি।{' '}
              <button
                onClick={() => setIsNoteModalOpen(true)}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline ml-1"
              >
                নোট যোগ করুন
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {selectedDayNotes.map((note) => (
                <div 
                  key={note.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex items-start justify-between gap-2"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${categoryMeta[note.category]?.color || 'bg-slate-100 text-slate-800'}`}>
                        {categoryMeta[note.category]?.label || 'নোট'}
                      </span>
                      {note.time && (
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 flex items-center gap-0.5">
                          <Clock className="w-3 h-3" /> {note.time}
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                      {note.title}
                    </div>
                    {note.note && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {note.note}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    title="নোট মুছে ফেলুন"
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950 transition shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 4. Monthly Upcoming Events & Mosque Notes Overview List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-emerald-600" />
              <span>{MONTH_NAMES_BN[currentMonth]} মাসের সমস্ত ইসলামিক দিবস ও কর্মসূচি তালিকা</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              মাসের সকল গুরুত্বপূর্ণ দিবস, সুন্নাত রোজা এবং মসজিদের নিজস্ব নোট একনজরে
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                activeFilter === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              সব ({monthOverviewItems.length})
            </button>
            <button
              onClick={() => setActiveFilter('events')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                activeFilter === 'events'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              ইসলামিক দিবস
            </button>
            <button
              onClick={() => setActiveFilter('notes')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition ${
                activeFilter === 'notes'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              মসজিদ নোট
            </button>
          </div>
        </div>

        {filteredOverviewItems.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            এই মাসে নির্বাচিত ফিল্টারের কোনো আইটেম পাওয়া যায়নি।
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredOverviewItems.map((item, idx) => {
              const isSelected = item.dateStr === selectedDateStr;
              return (
                <div
                  key={`${item.dateStr}-${item.type}-${idx}`}
                  onClick={() => setSelectedDate(item.date)}
                  className={`py-2.5 px-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Date Badge */}
                    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex flex-col items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-800 dark:text-white">
                        {toBengaliNumerals(item.gregorianDay)}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                        {WEEKDAYS_BN[item.dayOfWeek]}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {item.type === 'event' ? item.eventData?.nameBn : item.noteData?.title}
                        </span>
                        {item.type === 'event' && item.eventData?.isFastingSunnah && (
                          <span className="text-[10px] px-2 py-0.2 rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300 font-semibold">
                            সুন্নত রোজা
                          </span>
                        )}
                        {item.type === 'note' && item.noteData && (
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-md ${categoryMeta[item.noteData.category]?.color || 'bg-slate-100 text-slate-800'}`}>
                            {categoryMeta[item.noteData.category]?.label}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                        {toBengaliNumerals(item.hijriDay)} {item.hijriMonthBn} • {item.type === 'event' ? item.eventData?.significanceBn : (item.noteData?.note || 'কাস্টম কর্মসূচি')}
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                      বিস্তারিত
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. Add Custom Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-5 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CalendarIcon className="w-5 h-5 text-emerald-600" />
                <span>নতুন নোট ও কর্মসূচি যোগ করুন</span>
              </h3>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-xs text-emerald-900 dark:text-emerald-200 font-semibold">
              তারিখ: {toBengaliNumerals(selectedDayItem.dayNumber)} {MONTH_NAMES_BN[selectedDate.getMonth()]} {toBengaliNumerals(selectedDate.getFullYear())} ({toBengaliNumerals(selectedDayItem.hijri.day)} {selectedDayItem.hijri.monthBn})
            </div>

            {/* Quick Presets */}
            <div className="mt-3 space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase">দ্রুত নির্বাচন:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => applyQuickPreset('বাদ এশা বিশেষ তাফসির মাহফিল', 'milad', '08:00 PM')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium"
                >
                  তাফসির মাহফিল
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickPreset('মসজিদ পরিচালনা কমিটির মাসিক সাধারণ সভা', 'meeting', '08:30 PM')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium"
                >
                  কমিটি সভা
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickPreset('নফল রোজা ও ইফতার মাহফিল', 'event', '05:30 PM')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium"
                >
                  নফল রোজা
                </button>
                <button
                  type="button"
                  onClick={() => applyQuickPreset('মসজিদ ফান্ড কালেকশন ও দান সংগ্রহ', 'donation', '01:30 PM')}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-medium"
                >
                  ফান্ড কালেকশন
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateNoteSubmit} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  নোট / কর্মসূচির শিরোনাম *
                </label>
                <input
                  type="text"
                  required
                  value={newNoteTitle}
                  onChange={(e) => setNewNoteTitle(e.target.value)}
                  placeholder="যেমন: বাদ মাগরিব বিশেষ দোআ ও মোনাজাত"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={newNoteCategory}
                    onChange={(e) => setNewNoteCategory(e.target.value as CalendarCustomNote['category'])}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-medium focus:outline-emerald-500"
                  >
                    <option value="event">মাহফিল / অনুষ্ঠান</option>
                    <option value="meeting">কমিটি মিটিং</option>
                    <option value="milad">মিলাদ / দোআ</option>
                    <option value="donation">দান / ফান্ড সংগ্রহ</option>
                    <option value="reminder">স্মারক / রিমাইন্ডার</option>
                    <option value="general">সাধারণ নোট</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    সময় (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    value={newNoteTime}
                    onChange={(e) => setNewNoteTime(e.target.value)}
                    placeholder="যেমন: 08:00 PM"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500 font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  বিস্তারিত বিবরণ (ঐচ্ছিক)
                </label>
                <textarea
                  rows={2}
                  value={newNoteDesc}
                  onChange={(e) => setNewNoteDesc(e.target.value)}
                  placeholder="কর্মসূচির বিস্তারিত এজেন্ডা বা নির্দেশিকা..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-emerald-500 font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-sm"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
