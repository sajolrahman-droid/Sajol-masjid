import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Copy, 
  Check, 
  CreditCard, 
  Building, 
  Smartphone, 
  QrCode, 
  Sparkles, 
  Receipt, 
  Printer 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { MosqueSettings, MosqueTransaction } from '../types/mosque';
import { toBengaliNumerals } from '../utils/prayerCalculator';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: MosqueSettings;
  onRecordDonation: (tx: Omit<MosqueTransaction, 'id'>) => void;
}

export const DonateModal: React.FC<DonateModalProps> = ({
  isOpen,
  onClose,
  settings,
  onRecordDonation
}) => {
  const [activeTab, setActiveTab] = useState<'methods' | 'record' | 'receipt'>('methods');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Donation form state
  const [donorName, setDonorName] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState('সাধারণ তহবিল (General Fund)');
  const [targetAccount, setTargetAccount] = useState<'cash' | 'bank'>('bank');
  const [notes, setNotes] = useState('');

  // Generated receipt state
  const [lastReceipt, setLastReceipt] = useState<{
    id: number;
    name: string;
    phone: string;
    amount: number;
    category: string;
    date: string;
  } | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleDonationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      alert('অনুগ্রহ করে সঠিক টাকার পরিমাণ দিন');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const donorFinalName = donorName.trim() || 'নাম প্রকাশে অনিচ্ছুক মুসল্লি';

    // Record into mosque ledger
    onRecordDonation({
      type: 'in',
      date: todayStr,
      cat: category,
      name: donorFinalName,
      amt: amt,
      acc: targetAccount,
      note: `অনলাইন দান • ${notes || (donorPhone ? `মোবাইল: ${donorPhone}` : '')}`
    });

    // Create receipt
    const receiptData = {
      id: Date.now(),
      name: donorFinalName,
      phone: donorPhone.trim(),
      amount: amt,
      category: category,
      date: todayStr
    };
    setLastReceipt(receiptData);
    setActiveTab('receipt');

    // Confetti
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md">
              <Heart className="w-5 h-5 fill-rose-600 text-rose-600" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">মসজিদে মুক্তহস্তে দান করুন</h3>
              <p className="text-xs text-emerald-200 truncate">{settings.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-emerald-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Active Target Donation Goal Banner inside Donate Modal */}
        {(() => {
          const goal = settings.donationGoal || {
            title: 'মসজিদ সংস্কার, উন্নয়ন ও দ্বিতীয় তলার সম্প্রসারণ তহবিল',
            targetAmount: 500000
          };
          const targetAmt = goal.targetAmount || 500000;
          return (
            <div className="p-3 bg-emerald-50 dark:bg-slate-800/80 border-b border-emerald-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-[10px] font-bold shrink-0">
                  লক্ষ্যমাত্রা তহবিল
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                  {goal.title}
                </span>
              </div>
              <div className="text-emerald-800 dark:text-emerald-300 font-extrabold font-mono shrink-0">
                লক্ষ্য: ৳ {(targetAmt).toLocaleString('bn-BD')}
              </div>
            </div>
          );
        })()}

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-1.5">
          <button
            onClick={() => setActiveTab('methods')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'methods'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            মোবাইল ব্যাংকিং ও ব্যাংক হিসাব
          </button>
          <button
            onClick={() => setActiveTab('record')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              activeTab === 'record'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            দানের রশিদ তৈরি করুন
          </button>
          {lastReceipt && (
            <button
              onClick={() => setActiveTab('receipt')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                activeTab === 'receipt'
                  ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              রশিদ দেখুন 📄
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
          {activeTab === 'methods' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-slate-800/80 rounded-xl border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200">
                রাসূলুল্লাহ (সা.) বলেছেন: "দান-সদকা গুনাহকে এমনভাবে নিভিয়ে ফেলে, যেভাবে পানি আগুনকে নিভিয়ে ফেলে।" (তিরমিযী)
              </div>

              {/* Quick Donation Shortcuts */}
              <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800/80 rounded-xl border border-emerald-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>দ্রুত দান নির্বাচন (Quick Donation):</span>
                  </span>
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                    রশিদ পেতে পরিমাণ নির্বাচন করুন ➔
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {[100, 200, 500, 1000, 2000, 5000].map((presetAmt) => (
                    <button
                      key={presetAmt}
                      type="button"
                      onClick={() => {
                        setAmount(presetAmt);
                        setActiveTab('record');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-slate-800 dark:text-slate-200 font-bold font-mono text-xs border border-emerald-300 dark:border-slate-600 shadow-2xs transition active:scale-95"
                    >
                      ৳ {toBengaliNumerals(presetAmt)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mobile Banking Options */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-emerald-600" />
                  <span>মোবাইল ব্যাংকিং (বিকাশ / নগদ / রকেট)</span>
                </h4>

                {/* bKash */}
                <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-pink-700 dark:text-pink-400 flex items-center gap-1">
                      <span>বিকাশ (bKash)</span>
                    </div>
                    <div className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                      {settings.bkashNumber}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(settings.bkashNumber.split(' ')[0], 'bkash')}
                    className="px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-700 text-white text-xs font-semibold flex items-center gap-1 transition"
                  >
                    {copiedField === 'bkash' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'bkash' ? 'কপি হয়েছে' : 'নম্বর কপি'}</span>
                  </button>
                </div>

                {/* Nagad */}
                <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-orange-700 dark:text-orange-400 flex items-center gap-1">
                      <span>নগদ (Nagad)</span>
                    </div>
                    <div className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                      {settings.nagadNumber}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(settings.nagadNumber.split(' ')[0], 'nagad')}
                    className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold flex items-center gap-1 transition"
                  >
                    {copiedField === 'nagad' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'nagad' ? 'কপি হয়েছে' : 'নম্বর কপি'}</span>
                  </button>
                </div>

                {/* Rocket */}
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900/40 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-purple-700 dark:text-purple-400">
                      রকেট (Rocket)
                    </div>
                    <div className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                      {settings.rocketNumber}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(settings.rocketNumber, 'rocket')}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold flex items-center gap-1 transition"
                  >
                    {copiedField === 'rocket' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'rocket' ? 'কপি হয়েছে' : 'নম্বর কপি'}</span>
                  </button>
                </div>
              </div>

              {/* Bank Account Details */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-emerald-600" />
                  <span>মসজিদের ব্যাংক অ্যাকাউন্ট তথ্য</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">ব্যাংকের নাম:</span>
                    <div className="font-bold text-slate-900 dark:text-white">{settings.bankName}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">শাখা:</span>
                    <div className="font-bold text-slate-900 dark:text-white">{settings.bankBranch}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">অ্যাকাউন্ট নাম:</span>
                    <div className="font-bold text-slate-900 dark:text-white">{settings.name}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">রাউটিং নম্বর:</span>
                    <div className="font-mono font-bold text-slate-900 dark:text-white">{settings.bankRouting}</div>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-500 dark:text-slate-400">হিসাব নম্বর:</span>
                    <div className="text-sm sm:text-base font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      {settings.bankAccount}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy(settings.bankAccount, 'bankAcc')}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1"
                  >
                    {copiedField === 'bankAcc' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'bankAcc' ? 'কপি হয়েছে' : 'হিসাব কপি'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'record' && (
            <form onSubmit={handleDonationSubmit} className="space-y-3 text-xs">
              <p className="text-slate-500 dark:text-slate-400">
                আপনি বিকাশ/নগদে টাকা পাঠালে নিচের ফরম পূরণ করে সরাসরি ডিজিটাল রশিদ সংগ্রহ করতে পারেন এবং তথ্য মসজিদের হিসাবের খাতায় যুক্ত হবে।
              </p>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  দাতার নাম:
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="আপনার নাম (বা গোপন রাখতে ফাঁকা রাখুন)"
                  className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    মোবাইল নম্বর:
                  </label>
                  <input
                    type="tel"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    দানের পরিমাণ (টাকা)*:
                  </label>

                  {/* QUICK DONATION PRESET AMOUNTS */}
                  <div className="mt-1.5 mb-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mr-0.5">
                      দ্রুত নির্বাচন:
                    </span>
                    {[100, 200, 500, 1000, 2000, 5000].map((presetAmt) => (
                      <button
                        key={presetAmt}
                        type="button"
                        onClick={() => setAmount(presetAmt)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition ${
                          amount === presetAmt
                            ? 'bg-emerald-600 text-white shadow-xs scale-105 ring-2 ring-emerald-500/30'
                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        ৳ {toBengaliNumerals(presetAmt)}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    min="1"
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value) || '')}
                    placeholder="৳ যেমন: ৫০০"
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    দানের খাত:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="সাধারণ তহবিল (General Fund)">সাধারণ তহবিল (General Fund)</option>
                    <option value="যাকাত (Zakat)">যাকাত (Zakat)</option>
                    <option value="সদকা (Sadaqah)">সদকা (Sadaqah)</option>
                    <option value="মসজিদ মেরামত ও সংস্কার (Mosque Maintenance)">মসজিদ মেরামত ও সংস্কার (Mosque Maintenance)</option>
                    <option value="জুমার দান (Jummah Donation)">জুমার দান (Jummah Donation)</option>
                    <option value="উন্নয়ন ও নির্মাণ তহবিল (Construction Fund)">উন্নয়ন ও নির্মাণ তহবিল (Construction Fund)</option>
                    <option value="সদস্যদের দান/চাঁদা (Member Contribution)">সদস্যদের দান/চাঁদা (Member Contribution)</option>
                    <option value="বিশেষ দান (Special Donation)">বিশেষ দান (Special Donation)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300">
                    কোথায় জমা দিয়েছেন:
                  </label>
                  <select
                    value={targetAccount}
                    onChange={(e) => setTargetAccount(e.target.value as 'cash' | 'bank')}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white text-sm"
                  >
                    <option value="bank">ব্যাংক / বিকাশ / নগদ</option>
                    <option value="cash">কোষাধ্যক্ষের হাতে নগদ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300">
                  মন্তব্য / ট্রানজেকশন আইডি (ঐচ্ছিক):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="যেমন: bKash TrxID বা উদ্দেশ্য"
                  className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>দান নিশ্চিত করুন ও রশিদ পান</span>
              </button>
            </form>
          )}

          {activeTab === 'receipt' && lastReceipt && (
            <div className="space-y-4">
              {/* Printable Receipt Card */}
              <div 
                id="donation-receipt"
                className="p-6 rounded-2xl bg-amber-50/60 dark:bg-slate-800 border-2 border-dashed border-amber-300 dark:border-amber-800/80 text-slate-900 dark:text-white space-y-4 shadow-sm"
              >
                <div className="text-center pb-3 border-b border-amber-300/60 dark:border-slate-700">
                  <div className="text-2xl mb-1">🕌</div>
                  <h3 className="font-extrabold text-lg text-emerald-800 dark:text-emerald-400">
                    {settings.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{settings.location}</p>
                  <div className="inline-block px-3 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold mt-2">
                    অফিসিয়াল দানের ডিজিটাল মানি রসিদ
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">রশিদ নং:</span>
                    <div className="font-mono font-bold">#{lastReceipt.id.toString().slice(-6)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 dark:text-slate-400">তারিখ:</span>
                    <div className="font-bold">{lastReceipt.date}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">দাতার নাম:</span>
                    <div className="font-bold text-sm text-emerald-900 dark:text-emerald-300">
                      {lastReceipt.name}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 dark:text-slate-400">দানের খাত:</span>
                    <div className="font-semibold">{lastReceipt.category}</div>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-amber-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-600 dark:text-slate-400">মোট দানের পরিমাণ:</span>
                  <span className="text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
                    ৳ {lastReceipt.amount.toLocaleString('bn-BD')}
                  </span>
                </div>

                <p className="text-center text-[11px] text-slate-500 dark:text-slate-400 italic">
                  "আল্লাহ তাআলা আপনার এই নেক দানকে কবুল করে উত্তম প্রতিদান দান করুন। আমীন।"
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                >
                  <Printer className="w-4 h-4" />
                  <span>রশিদ প্রিন্ট বা সেভ করুন</span>
                </button>
                <button
                  onClick={() => setActiveTab('methods')}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold transition"
                >
                  সম্পন্ন
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
