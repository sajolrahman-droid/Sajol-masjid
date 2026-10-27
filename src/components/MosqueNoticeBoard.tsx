import React, { useState, useMemo } from 'react';
import { 
  Bell, 
  Megaphone, 
  Pin, 
  Plus, 
  Edit3, 
  Trash2, 
  Copy, 
  Check, 
  Search, 
  Calendar, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  User, 
  Share2, 
  Filter,
  X
} from 'lucide-react';
import { 
  MosqueNotice, 
  NoticePriority, 
  NoticeCategory, 
  Language 
} from '../types/mosque';
import { toBengaliNumerals } from '../utils/prayerCalculator';

interface MosqueNoticeBoardProps {
  notices: MosqueNotice[];
  onSaveNotice: (notice: MosqueNotice) => void;
  onDeleteNotice: (id: number) => void;
  onTogglePin: (id: number) => void;
  language: Language;
}

interface NoticeTemplate {
  name: string;
  title: string;
  message: string;
  priority: NoticePriority;
  category: NoticeCategory;
  postedBy: string;
}

const NOTICE_TEMPLATES: NoticeTemplate[] = [
  {
    name: 'মসজিদ পরিচ্ছন্নতা অভিযান',
    title: 'শুক্রবার জুমুআর পূর্বে মসজিদ বিশেষ পরিচ্ছন্নতা ও ধৌতকরণ কর্মসূচি',
    message: 'সম্মানিত মুসল্লিয়ান, আগামী বৃহস্পতিবার বাদ আছর থেকে এশার পূর্ব পর্যন্ত মসজিদের কার্পেট ভ্যাকুয়াম ধৌতকরণ, ফ্যান, লাইট ও ওযুখানার সামগ্রিক পরিচ্ছন্নতা কর্মসূচি অনুষ্ঠিত হবে। আগ্রহী সকল যুব ও স্বেচ্ছাসেবী মুসল্লীদের সক্রিয় অংশগ্রহণ কামনা করা হচ্ছে।',
    priority: 'urgent',
    category: 'cleaning',
    postedBy: 'মসজিদ পরিচালনা কমিটি'
  },
  {
    name: 'সীরাতুন্নবী (সা.) মাহফিল',
    title: 'মাসিক সীরাতুন্নবী (সা.) আলোচনা সভা ও বিশেষ দু\'আ মাহফিল',
    message: 'আগামী শুক্রবার জুমুআার নামাজ শেষে মসজিদের প্রধান হলে বিশিষ্ট ওলামায়ে কেরামের উপস্থিতিতে বিশেষ সীরাত আলোচনা ও মোনাজাত অনুষ্ঠিত হবে। পরিবারসহ উপস্থিত হয়ে সওয়াব হাসিল করুন।',
    priority: 'important',
    category: 'event',
    postedBy: 'খতিব ও ইমাম পরিষদ'
  },
  {
    name: 'এসি ও বৈদ্যুতিক মেরামত',
    title: 'মসজিদের কেন্দ্রীয় এসি সার্ভিসিং ও বৈদ্যুতিক তার সংস্কার কার্যক্রম',
    message: 'সম্মানিত মুসল্লীদের সদয় অবগতির জন্য জানানো যাচ্ছে যে, আগামী শনি ও রবিবার মসজিদের প্রধান নামাজ হলের কেন্দ্রীয় এসি ও লাইটিং লাইন মেরামত করা হবে। সাময়িক অসুবিধার জন্য আন্তরিকভাবে দুঃখিত।',
    priority: 'important',
    category: 'maintenance',
    postedBy: 'মসজিদ রক্ষণাবেক্ষণ কমিটি'
  },
  {
    name: 'উন্নয়ন ফান্ড সংগ্রহ',
    title: 'মসজিদের ২য় তলার আধুনিক ওযুখানা ও টাইলস সংস্কার ফান্ড সংগ্রহ',
    message: 'আলহামদুলিল্লাহ, মসজিদের ২য় তলার ওযুখানার পাইপলাইন ও মার্বেল টাইলস বসানোর কাজ দ্রুত এগিয়ে চলেছে। আগ্রহী মুসল্লী ভাই ও প্রবাসীদের মুক্তহস্তে অনুদান প্রদানের জন্য কোষাধ্যক্ষ মহোদয়ের নিকট জমা দেওয়ার অনুরোধ জানানো যাচ্ছে।',
    priority: 'normal',
    category: 'financial',
    postedBy: 'কোষাধ্যক্ষ ও অর্থ উপকমিটি'
  },
  {
    name: 'সাধারণ পরামর্শ সভা',
    title: 'মসজিদের সার্বিক উন্নয়ন ও আগামী বর্ষপঞ্জি নিয়ে সাধারণ মুসল্লী সমাবেশ',
    message: 'আগামী শুক্রবার বাদ মাগরিব মসজিদের নীচতলায় সকল সাধারণ মুসল্লী ভাইদের নিয়ে একটি উন্মুক্ত মতবিনিময় ও পরামর্শ সভা অনুষ্ঠিত হবে। আপনাদের গঠনমূলক মতামত সাদরে গৃহীত হবে।',
    priority: 'normal',
    category: 'general',
    postedBy: 'মসজিদ পরিচালনা কমিটি'
  }
];

export const MosqueNoticeBoard: React.FC<MosqueNoticeBoardProps> = ({
  notices,
  onSaveNotice,
  onDeleteNotice,
  onTogglePin,
  language
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNoticeId, setEditingNoticeId] = useState<number | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formPriority, setFormPriority] = useState<NoticePriority>('normal');
  const [formCategory, setFormCategory] = useState<NoticeCategory>('general');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formEventDate, setFormEventDate] = useState('');
  const [formPostedBy, setFormPostedBy] = useState('মসজিদ পরিচালনা কমিটি');
  const [formIsPinned, setFormIsPinned] = useState(false);

  // Open modal for new notice
  const handleOpenNew = () => {
    setEditingNoticeId(null);
    setFormTitle('');
    setFormMessage('');
    setFormPriority('urgent');
    setFormCategory('event');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormEventDate('');
    setFormPostedBy('মসজিদ পরিচালনা কমিটি');
    setFormIsPinned(true);
    setIsModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEdit = (n: MosqueNotice) => {
    setEditingNoticeId(n.id);
    setFormTitle(n.title);
    setFormMessage(n.message);
    setFormPriority(n.priority);
    setFormCategory(n.category);
    setFormDate(n.date);
    setFormEventDate(n.eventDate || '');
    setFormPostedBy(n.postedBy || 'মসজিদ পরিচালনা কমিটি');
    setFormIsPinned(n.isPinned);
    setIsModalOpen(true);
  };

  // Apply quick template
  const handleApplyTemplate = (tmpl: NoticeTemplate) => {
    setFormTitle(tmpl.title);
    setFormMessage(tmpl.message);
    setFormPriority(tmpl.priority);
    setFormCategory(tmpl.category);
    setFormPostedBy(tmpl.postedBy);
  };

  // Submit form
  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formMessage.trim()) return;

    const notice: MosqueNotice = {
      id: editingNoticeId || Date.now(),
      title: formTitle.trim(),
      message: formMessage.trim(),
      priority: formPriority,
      category: formCategory,
      date: formDate || new Date().toISOString().slice(0, 10),
      eventDate: formEventDate.trim() || undefined,
      postedBy: formPostedBy.trim() || 'মসজিদ পরিচালনা কমিটি',
      isPinned: formIsPinned
    };

    onSaveNotice(notice);
    setIsModalOpen(false);
  };

  // Copy notice text to clipboard
  const handleCopyNotice = (n: MosqueNotice) => {
    const text = `📢 *${n.title}*\n\n${n.message}\n\n🗓️ তারিখ: ${n.date}${n.eventDate ? `\n⏰ অনুষ্ঠানের তারিখ: ${n.eventDate}` : ''}\n✍️ প্রচারক: ${n.postedBy}\n(মসজিদ নোটিশ বোর্ড)`;
    navigator.clipboard.writeText(text);
    setCopiedId(n.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Category & Priority labels in Bengali
  const categoryMeta: Record<NoticeCategory, { label: string; icon: string }> = {
    cleaning: { label: 'পরিচ্ছন্নতা অভিযান', icon: '🧹' },
    event: { label: 'ইভেন্ট ও মাহফিল', icon: '📅' },
    maintenance: { label: 'মেরামত ও সংস্কার', icon: '🔧' },
    financial: { label: 'তহবিল ও অনুদান', icon: '💰' },
    general: { label: 'সাধারণ নোটিশ', icon: '📢' }
  };

  const priorityMeta: Record<NoticePriority, { label: string; borderClass: string; badgeText: string }> = {
    urgent: {
      label: 'জরুরী বিজ্ঞপ্তি',
      borderClass: 'border-rose-300 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20',
      badgeText: 'জরুরী'
    },
    important: {
      label: 'বিশেষ ঘোষণা',
      borderClass: 'border-amber-300 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20',
      badgeText: 'গুরুত্বপূর্ণ'
    },
    normal: {
      label: 'সাধারণ তথ্য',
      borderClass: 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900',
      badgeText: 'সাধারণ'
    }
  };

  // Filter & Sort: Pinned first, then urgent, then date descending
  const filteredNotices = useMemo(() => {
    return notices
      .filter((n) => {
        if (filterCategory !== 'all' && n.category !== filterCategory) return false;
        if (filterPriority !== 'all' && n.priority !== filterPriority) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = n.title.toLowerCase().includes(q);
          const matchMsg = n.message.toLowerCase().includes(q);
          const matchBy = n.postedBy.toLowerCase().includes(q);
          if (!matchTitle && !matchMsg && !matchBy) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Pinned comes first
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        // Then urgent priority
        const priorityWeight = { urgent: 3, important: 2, normal: 1 };
        const diffPriority = priorityWeight[b.priority] - priorityWeight[a.priority];
        if (diffPriority !== 0) return diffPriority;

        // Then latest date
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [notices, filterCategory, filterPriority, searchQuery]);

  const urgentCount = notices.filter(n => n.priority === 'urgent').length;
  const pinnedCount = notices.filter(n => n.isPinned).length;

  return (
    <div className="space-y-4">
      {/* Top Notice Board Header & Admin Actions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 flex items-center justify-center text-xl shrink-0 border border-amber-300/40">
            📢
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {language === 'bn' ? 'মসজিদ ডিজিটাল নোটিশ বোর্ড' : 'Mosque Digital Notice Board'}
              </h3>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                ({toBengaliNumerals(notices.length)} টি বিজ্ঞপ্তি)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {language === 'bn' 
                ? 'ইভেন্ট, পরিচ্ছন্নতা কর্মসূচি, খুতবা ও জরুরি নোটিশ সকল মুসল্লীর জন্য' 
                : 'Urgent announcements, cleaning schedules & community events'}
            </p>
          </div>
        </div>

        {/* Post Notice Button */}
        <button
          onClick={handleOpenNew}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'bn' ? 'নতুন নোটিশ পোস্ট করুন' : 'Post New Notice'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row items-center gap-2">
          {/* Search box */}
          <div className="relative w-full sm:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="বিজ্ঞপ্তি খুঁজুন (শিরোনাম, বিষয়বস্তু বা প্রচারক)..."
              className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Priority filter */}
          <div className="flex items-center gap-1.5 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setFilterPriority('all')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterPriority === 'all'
                  ? 'bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              সব স্তর
            </button>
            <button
              onClick={() => setFilterPriority('urgent')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1 ${
                filterPriority === 'urgent'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>জরুরী ({toBengaliNumerals(urgentCount)})</span>
            </button>
          </div>
        </div>

        {/* Category Pills (Interactive Filter Controls) */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pt-1">
          {[
            { key: 'all', label: 'সকল ক্যাটাগরি' },
            { key: 'cleaning', label: '🧹 পরিচ্ছন্নতা' },
            { key: 'event', label: '📅 ইভেন্ট ও মাহফিল' },
            { key: 'maintenance', label: '🔧 সংস্কার কাজ' },
            { key: 'financial', label: '💰 অনুদান ফান্ড' },
            { key: 'general', label: '📢 সাধারণ' }
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => setFilterCategory(cat.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 border ${
                filterCategory === cat.key
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700/80 hover:bg-slate-100 dark:hover:bg-slate-750'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Notices List */}
      {filteredNotices.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
            {searchQuery || filterCategory !== 'all' || filterPriority !== 'all'
              ? 'কোনো নোটিশ খুঁজে পাওয়া যায়নি'
              : 'বর্তমানে কোনো নোটিশ নেই'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            প্রয়োজনে উপরোক্ত বোতামে চাপ দিয়ে নতুন জরুরি নোটিশ পোস্ট করুন
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotices.map((n) => {
            const pMeta = priorityMeta[n.priority] || priorityMeta.normal;
            const cMeta = categoryMeta[n.category] || categoryMeta.general;

            return (
              <div
                key={n.id}
                className={`p-4 rounded-2xl border shadow-xs transition-all relative ${pMeta.borderClass}`}
              >
                {/* Header Row: Title & Action Controls */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {n.isPinned && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100/80 dark:bg-amber-950/80 px-2 py-0.5 rounded-md border border-amber-300/40">
                          <Pin className="w-3 h-3 fill-amber-500 text-amber-600" /> শীর্ষে পিনকৃত
                        </span>
                      )}

                      {n.priority === 'urgent' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100/80 dark:bg-rose-950/80 px-2 py-0.5 rounded-md border border-rose-300/40">
                          <AlertTriangle className="w-3 h-3" /> জরুরী বিজ্ঞপ্তি
                        </span>
                      )}

                      {n.priority === 'important' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-950/80 px-2 py-0.5 rounded-md border border-sky-300/40">
                          <Megaphone className="w-3 h-3" /> বিশেষ ঘোষণা
                        </span>
                      )}
                    </div>

                    <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                      {n.title}
                    </h4>

                    {/* Unboxed Metadata Line (anti-slop rule) */}
                    <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                      <span>{cMeta.icon} {cMeta.label}</span>
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {toBengaliNumerals(n.date)}
                      </span>
                      {n.eventDate && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            অনুষ্ঠানের তারিখ: {toBengaliNumerals(n.eventDate)}
                          </span>
                        </>
                      )}
                      <span aria-hidden="true">·</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {n.postedBy}
                      </span>
                    </div>
                  </div>

                  {/* Actions Toolbar */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* Toggle Pin Button */}
                    <button
                      onClick={() => onTogglePin(n.id)}
                      className={`p-2 rounded-lg border transition ${
                        n.isPinned
                          ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-200 dark:border-amber-700'
                          : 'bg-white dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 border-slate-200 dark:border-slate-700'
                      }`}
                      title={n.isPinned ? 'আনপিন করুন' : 'শীর্ষে পিন করুন'}
                      aria-label="Pin Notice"
                    >
                      <Pin className={`w-3.5 h-3.5 ${n.isPinned ? 'fill-amber-600' : ''}`} />
                    </button>

                    {/* Copy Notice */}
                    <button
                      onClick={() => handleCopyNotice(n)}
                      className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 transition"
                      title="বিজ্ঞপ্তি কপি করুন (WhatsApp/SMS)"
                      aria-label="Copy Notice"
                    >
                      {copiedId === n.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {/* Edit Notice */}
                    <button
                      onClick={() => handleOpenEdit(n)}
                      className="p-2 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 transition"
                      title="সম্পাদনা করুন"
                      aria-label="Edit Notice"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    </button>

                    {/* Delete Notice with inline confirmation */}
                    <button
                      onClick={() => {
                        if (pendingDeleteId === n.id) {
                          onDeleteNotice(n.id);
                          setPendingDeleteId(null);
                        } else {
                          setPendingDeleteId(n.id);
                        }
                      }}
                      className={`p-2 rounded-lg border transition ${
                        pendingDeleteId === n.id
                          ? 'bg-rose-600 text-white border-rose-600 animate-pulse'
                          : 'bg-white dark:bg-slate-800 text-slate-400 hover:text-rose-600 border-slate-200 dark:border-slate-700'
                      }`}
                      title={pendingDeleteId === n.id ? 'নিশ্চিত করুন (ডিলিট হবে)' : 'মুছে ফেলুন'}
                      aria-label="Delete Notice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <div className="mt-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line bg-white/70 dark:bg-slate-900/70 p-3 rounded-xl border border-slate-200/50 dark:border-slate-800/80">
                  {n.message}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ========================================================
          POST / EDIT NOTICE MODAL
          ======================================================== */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs"
          onClick={() => setIsModalOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                  📢
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {editingNoticeId ? 'নোটিশ সম্পাদনা করুন' : 'নতুন নোটিশ পোস্ট করুন'}
                </h3>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Presets / Templates */}
            {!editingNoticeId && (
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> দ্রুত টেমপ্লেট নির্বাচন করুন:
                </span>
                <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                  {NOTICE_TEMPLATES.map((tmpl) => (
                    <button
                      key={tmpl.name}
                      type="button"
                      onClick={() => handleApplyTemplate(tmpl)}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-300 text-[11px] font-semibold whitespace-nowrap shrink-0 border border-slate-200 dark:border-slate-700 transition"
                    >
                      {tmpl.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmitForm} className="space-y-3.5">
              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  বিজ্ঞপ্তির শিরোনাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="যেমন: শুক্রবার জুমুআর পূর্বে মসজিদ পরিচ্ছন্নতা অভিযান"
                  className="w-full p-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Priority & Category Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Priority */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    অগ্রাধিকার স্তর
                  </label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as NoticePriority)}
                    className="w-full p-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="urgent">🔴 জরুরী বিজ্ঞপ্তি (Urgent)</option>
                    <option value="important">🟡 বিশেষ ঘোষণা (Important)</option>
                    <option value="normal">🟢 সাধারণ নোটিশ (Normal)</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ক্যাটাগরি
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as NoticeCategory)}
                    className="w-full p-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="cleaning">🧹 পরিচ্ছন্নতা অভিযান</option>
                    <option value="event">📅 ইভেন্ট ও মাহফিল</option>
                    <option value="maintenance">🔧 মেরামত ও সংস্কার</option>
                    <option value="financial">💰 তহবিল ও অনুদান</option>
                    <option value="general">📢 সাধারণ নোটিশ</option>
                  </select>
                </div>
              </div>

              {/* Message Body */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  বিজ্ঞপ্তির বিস্তারিত বিবরণ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={formMessage}
                  onChange={(e) => setFormMessage(e.target.value)}
                  placeholder="বিজ্ঞপ্তির পূর্ণাঙ্গ বিষয়বস্তু, সময় ও নির্দেশনা লিখুন..."
                  className="w-full p-2.5 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed"
                />
              </div>

              {/* Dates & Posted By Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Posting Date */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    পোস্টের তারিখ
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Event Date (Optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    অনুষ্ঠানের তারিখ (ঐচ্ছিক)
                  </label>
                  <input
                    type="date"
                    value={formEventDate}
                    onChange={(e) => setFormEventDate(e.target.value)}
                    className="w-full p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {/* Posted By */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    প্রচারক / কমিটি
                  </label>
                  <input
                    type="text"
                    value={formPostedBy}
                    onChange={(e) => setFormPostedBy(e.target.value)}
                    placeholder="মসজিদ কমিটি"
                    className="w-full p-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Pin to top checkbox */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40">
                <input
                  type="checkbox"
                  id="pinToggle"
                  checked={formIsPinned}
                  onChange={(e) => setFormIsPinned(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <label htmlFor="pinToggle" className="text-xs font-bold text-amber-900 dark:text-amber-200 cursor-pointer">
                  শীর্ষে পিন করে রাখুন (সকল মুসল্লী সবার আগে এই নোটিশ দেখতে পাবেন)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md transition"
                >
                  {editingNoticeId ? 'আপডেট করুন' : 'প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
