import React, { useState, useMemo, useRef } from 'react';
import { 
  Landmark, 
  ArrowDownRight, 
  ArrowUpRight, 
  ArrowLeftRight, 
  Users, 
  FileText, 
  Calculator, 
  Lock, 
  Unlock, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  Check, 
  Download, 
  Upload, 
  Copy, 
  Wheat, 
  PhoneCall, 
  AlertTriangle,
  BarChart3,
  Sparkles,
  Lightbulb,
  Megaphone,
  Pin,
  Bell,
  GraduationCap,
  ArrowRight,
  Calendar,
  Filter,
  X,
  Briefcase,
  Clock,
  Heart
} from 'lucide-react';
import { 
  AppStateData, 
  MosqueTransaction, 
  MosqueMember, 
  MosquePledge, 
  MosquePaddySale, 
  MosquePlanItem, 
  MosqueNotice,
  Language 
} from '../types/mosque';
import { toBengaliNumerals } from '../utils/prayerCalculator';
import { MosqueFinancialVisualSummary } from './MosqueFinancialVisualSummary';
import { MosqueNoticeBoard } from './MosqueNoticeBoard';
import { suggestCategoryFromKeyword, POPULAR_NOTE_TEMPLATES } from '../utils/categorySuggester';
import { QuickExpenseAddButtons, QuickExpensePreset } from './QuickExpenseAddButtons';
import { MosquePDFReportModal } from './MosquePDFReportModal';
import { DonationGoalProgressBar } from './DonationGoalProgressBar';
import { MaktabFeeSection } from './MaktabFeeSection';
import { PrayerPunctualityD3Section } from './PrayerPunctualityD3Section';
import { DonorsListSection, getCategoryBadgeStyle } from './DonorsListSection';
import { MonthlyPDFSummaryGenerator } from './MonthlyPDFSummaryGenerator';
import { AnnualFinancialSummaryView } from './AnnualFinancialSummaryView';

interface MosqueAccountsSectionProps {
  appState: AppStateData;
  onUpdateAppState: (updater: (prev: AppStateData) => AppStateData) => void;
  language: Language;
  onOpenDonateModal?: () => void;
}

export const MosqueAccountsSection: React.FC<MosqueAccountsSectionProps> = ({
  appState,
  onUpdateAppState,
  language,
  onOpenDonateModal
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'home' | 'notice' | 'annual' | 'chart' | 'punctuality' | 'donations' | 'in' | 'out' | 'mem' | 'maktab' | 'pl' | 'plan' | 'rep'>('home');
  const [filterQuery, setFilterQuery] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  // Pin Unlock state
  const [isUnlocked, setIsUnlocked] = useState<boolean>(!appState.pin);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Month filters
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [reportMonth, setReportMonth] = useState(currentMonthStr);
  const [memberMonth, setMemberMonth] = useState(currentMonthStr);
  const [reportYear, setReportYear] = useState(new Date().getFullYear().toString());
  const [isPDFModalOpen, setIsPDFModalOpen] = useState(false);

  // Form states for new transactions
  const [txDate, setTxDate] = useState(new Date().toISOString().slice(0, 10));
  const [txCat, setTxCat] = useState('');
  const [txName, setTxName] = useState('');
  const [txAmt, setTxAmt] = useState<number | ''>('');
  const [txAcc, setTxAcc] = useState<'cash' | 'bank'>('cash');
  const [txNote, setTxNote] = useState('');
  const [editingTxId, setEditingTxId] = useState<number | null>(null);
  const [hasUserManuallySelectedCat, setHasUserManuallySelectedCat] = useState(false);
  const txAmtInputRef = useRef<HTMLInputElement>(null);
  const [selectedQuickPresetId, setSelectedQuickPresetId] = useState<string | null>(null);

  // Quick Expense Preset Selection Handler
  const handleSelectQuickExpense = (preset: QuickExpensePreset) => {
    setActiveSubTab('out');
    setTxCat(preset.category);
    setTxName(preset.payee);
    setTxNote(preset.note);
    setTxAcc(preset.acc);
    setHasUserManuallySelectedCat(true);
    setSelectedQuickPresetId(preset.id);
    if (!txDate) {
      setTxDate(new Date().toISOString().slice(0, 10));
    }
    showToast(`⚡ ${preset.nameBn} (${preset.nameEn}) প্রাক-পূরণ হয়েছে! টাকার পরিমাণ লিখুন`);
    setTimeout(() => {
      txAmtInputRef.current?.focus();
      txAmtInputRef.current?.select();
    }, 60);
  };

  const handleClearQuickPreset = () => {
    setSelectedQuickPresetId(null);
    setTxAmt('');
    setTxName('');
    setTxNote('');
    setTxCat('');
    setHasUserManuallySelectedCat(false);
    showToast('ফর্ম রিসেট করা হয়েছে');
  };

  // Auto-suggestion based on note and description keywords
  const currentTxType = (activeSubTab === 'out' ? 'out' : 'in') as 'in' | 'out';
  const categorySuggestion = useMemo(() => {
    return suggestCategoryFromKeyword(`${txNote} ${txName}`, currentTxType);
  }, [txNote, txName, currentTxType]);

  // Handle note change with auto-suggestion
  const handleNoteChange = (val: string) => {
    setTxNote(val);
    const sug = suggestCategoryFromKeyword(`${val} ${txName}`, currentTxType);
    if (sug.topSuggestion && !hasUserManuallySelectedCat && !editingTxId) {
      setTxCat(sug.topSuggestion.category);
    }
  };

  // Handle name change with auto-suggestion
  const handleNameChange = (val: string) => {
    setTxName(val);
    const sug = suggestCategoryFromKeyword(`${txNote} ${val}`, currentTxType);
    if (sug.topSuggestion && !hasUserManuallySelectedCat && !editingTxId) {
      setTxCat(sug.topSuggestion.category);
    }
  };

  // Transfer state
  const [xferDate, setXferDate] = useState(new Date().toISOString().slice(0, 10));
  const [xferType, setXferType] = useState<'bank' | 'cash'>('bank');
  const [xferAmt, setXferAmt] = useState<number | ''>('');

  // Member form
  const [newMemName, setNewMemName] = useState('');
  const [newMemFatherName, setNewMemFatherName] = useState('');
  const [newMemMotherName, setNewMemMotherName] = useState('');
  const [newMemAddress, setNewMemAddress] = useState('');
  const [newMemProfession, setNewMemProfession] = useState('');
  const [newMemPhone, setNewMemPhone] = useState('');
  const [newMemAmt, setNewMemAmt] = useState<number | ''>('');
  const [newMemRegDate, setNewMemRegDate] = useState(new Date().toISOString().slice(0, 10));

  // Member search & filters
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [selectedProfession, setSelectedProfession] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'this_month' | 'last_3_months' | 'this_year'>('all');

  // Plan item form
  const [planName, setPlanName] = useState('');
  const [planQty, setPlanQty] = useState<number | ''>(1);
  const [planRate, setPlanRate] = useState<number | ''>('');

  // Pledge form
  const [plName, setPlName] = useState('');
  const [plAddress, setPlAddress] = useState('');
  const [plPhone, setPlPhone] = useState('');
  const [plType, setPlType] = useState<'cash' | 'dhan'>('cash');
  const [plQty, setPlQty] = useState<number | ''>('');
  const [plUnit, setPlUnit] = useState<'মণ' | 'কেজি'>('মণ');
  const [plPurpose, setPlPurpose] = useState('সাধারণ দান');
  const [plDate, setPlDate] = useState('');
  const [plNote, setPlNote] = useState('');
  const [editingPlId, setEditingPlId] = useState<number | null>(null);

  // Paddy sale form
  const [saleDate, setSaleDate] = useState(new Date().toISOString().slice(0, 10));
  const [saleQty, setSaleQty] = useState<number | ''>('');
  const [saleUnit, setSaleUnit] = useState<'মণ' | 'কেজি'>('মণ');
  const [saleRate, setSaleRate] = useState<number | ''>('');
  const [saleBuyer, setSaleBuyer] = useState('');
  const [saleAcc, setSaleAcc] = useState<'cash' | 'bank'>('cash');

  // Text report copy state
  const [textReportCopied, setTextReportCopied] = useState(false);

  // Toast message
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2800);
  };

  const INC_CATEGORIES = [
    'মুসল্লিদের দান',
    'সদস্যদের দান/চাঁদা',
    'মক্তবের বেতন/ফি',
    'জুমার দান',
    'বিশেষ দান',
    'যাকাত/ফিতরা',
    'অন্যান্য আয়',
    'ধান বিক্রি'
  ];

  const EXP_CATEGORIES = [
    'উন্নয়ন খরচ',
    'মাসিক খরচ',
    'ইমাম/হুজুরের বেতন',
    'মুয়াজ্জিনের বেতন',
    'বিদ্যুৎ (কারেন্ট) বিল',
    'গ্যাস বিল',
    'পানি বিল',
    'অন্যান্য খরচ'
  ];

  // Calculate Bank and Cash Balances
  const balance = useMemo(() => {
    let b = Number(appState.ob) || 0;
    let c = Number(appState.oc) || 0;

    appState.tx.forEach((t) => {
      const a = Number(t.amt) || 0;
      if (t.type === 'in') {
        if (t.acc === 'bank') b += a;
        else c += a;
      } else if (t.type === 'out') {
        if (t.acc === 'bank') b -= a;
        else c -= a;
      } else if (t.type === 'xfer') {
        if (t.acc === 'bank') {
          // bank to cash
          b -= a;
          c += a;
        } else {
          // cash to bank
          c -= a;
          b += a;
        }
      }
    });

    return { b, c, total: b + c };
  }, [appState]);

  // Sum helpers
  const f = (n: number) => `৳ ${(Number(n) || 0).toLocaleString('bn-BD')}`;

  const monthTxs = useMemo(() => {
    return appState.tx.filter((t) => t.date.startsWith(currentMonthStr));
  }, [appState.tx, currentMonthStr]);

  const monthIncome = useMemo(() => {
    return monthTxs.filter((t) => t.type === 'in').reduce((sum, t) => sum + Number(t.amt), 0);
  }, [monthTxs]);

  const monthExpense = useMemo(() => {
    return monthTxs.filter((t) => t.type === 'out').reduce((sum, t) => sum + Number(t.amt), 0);
  }, [monthTxs]);

  const totalIncome = useMemo(() => {
    return appState.tx.filter((t) => t.type === 'in').reduce((sum, t) => sum + Number(t.amt), 0);
  }, [appState.tx]);

  const totalExpense = useMemo(() => {
    return appState.tx.filter((t) => t.type === 'out').reduce((sum, t) => sum + Number(t.amt), 0);
  }, [appState.tx]);

  // Paddy inventory calculation
  const paddyStats = useMemo(() => {
    const toKg = (q: number, u?: string) => (u === 'মণ' ? q * 40 : q);
    const dsPledges = appState.pl.filter((p) => p.ty === 'dhan');
    const totalPledgedKg = dsPledges.reduce((s, p) => s + toKg(p.q, p.u), 0);
    const totalReceivedKg = dsPledges.reduce((s, p) => s + toKg(p.got, p.u), 0);
    const totalSoldKg = appState.ds.reduce((s, d) => s + Number(d.kg), 0);
    const currentStockKg = Math.max(0, totalReceivedKg - totalSoldKg);
    const totalSaleTaka = appState.ds.reduce((s, d) => s + Number(d.total), 0);

    return {
      pledgedMon: totalPledgedKg / 40,
      receivedMon: totalReceivedKg / 40,
      soldMon: totalSoldKg / 40,
      stockMon: currentStockKg / 40,
      stockKg: currentStockKg,
      totalSaleTaka
    };
  }, [appState.pl, appState.ds]);

  // Pin Unlock Check
  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pinInput === appState.pin) {
      setIsUnlocked(true);
      setPinError(false);
      showToast('লক খোলা হয়েছে');
    } else {
      setPinError(true);
      showToast('ভুল পিন!');
    }
  };

  // Add or Edit Transaction
  const handleSaveTx = (type: 'in' | 'out') => {
    const a = Number(txAmt);
    if (!a || a <= 0) return showToast('টাকার পরিমাণ দিন');

    const catToUse = txCat || (type === 'in' ? INC_CATEGORIES[0] : EXP_CATEGORIES[0]);
    const isEditing = editingTxId !== null;

    onUpdateAppState((prev) => {
      const nextTx: MosqueTransaction = {
        id: isEditing ? editingTxId : Date.now(),
        type,
        date: txDate || new Date().toISOString().slice(0, 10),
        cat: catToUse,
        name: txName.trim(),
        amt: a,
        acc: txAcc,
        note: txNote.trim()
      };

      let updatedList = [...prev.tx];
      if (isEditing) {
        updatedList = updatedList.map((t) => (t.id === editingTxId ? nextTx : t));
      } else {
        updatedList.push(nextTx);
      }

      return {
        ...prev,
        tx: updatedList
      };
    });

    // Reset form
    setEditingTxId(null);
    setSelectedQuickPresetId(null);
    setTxAmt('');
    setTxName('');
    setTxNote('');
    setTxCat('');
    setHasUserManuallySelectedCat(false);
    showToast(isEditing ? 'লেনদেন আপডেট হয়েছে' : 'সংরক্ষিত হয়েছে');
  };

  // Delete Transaction
  const handleDeleteTx = (id: number) => {
    if (pendingDeleteId === id) {
      onUpdateAppState((prev) => ({
        ...prev,
        tx: prev.tx.filter((t) => t.id !== id)
      }));
      setPendingDeleteId(null);
      showToast('লেনদেন মুছে ফেলা হয়েছে');
    } else {
      setPendingDeleteId(id);
    }
  };

  // Bank <-> Cash Transfer
  const handleTransfer = () => {
    const a = Number(xferAmt);
    if (!a || a <= 0) return showToast('টাকার পরিমাণ দিন');

    onUpdateAppState((prev) => ({
      ...prev,
      tx: [
        ...prev.tx,
        {
          id: Date.now(),
          type: 'xfer',
          date: xferDate || new Date().toISOString().slice(0, 10),
          cat: xferType === 'bank' ? 'ব্যাংক থেকে উত্তোলন' : 'ব্যাংকে জমা',
          name: '',
          amt: a,
          acc: xferType,
          note: xferType === 'bank' ? 'কোষাধ্যক্ষকে নগদ প্রদান' : 'ব্যাংক অ্যাকাউন্টে জমা'
        }
      ]
    }));

    setXferAmt('');
    showToast('স্থানান্তর সংরক্ষিত');
  };

  // Add Member
  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    const a = Number(newMemAmt);
    if (!newMemName.trim() || !a || a <= 0) return showToast('নাম ও মাসিক চাঁদার পরিমাণ দিন');

    onUpdateAppState((prev) => ({
      ...prev,
      ppl: [
        ...prev.ppl,
        {
          id: Date.now(),
          n: newMemName.trim(),
          fatherName: newMemFatherName.trim() || undefined,
          motherName: newMemMotherName.trim() || undefined,
          address: newMemAddress.trim() || undefined,
          profession: newMemProfession.trim() || undefined,
          ph: newMemPhone.trim(),
          amt: a,
          regDate: newMemRegDate || new Date().toISOString().slice(0, 10)
        }
      ]
    }));

    setNewMemName('');
    setNewMemFatherName('');
    setNewMemMotherName('');
    setNewMemAddress('');
    setNewMemProfession('');
    setNewMemPhone('');
    setNewMemAmt('');
    setNewMemRegDate(new Date().toISOString().slice(0, 10));
    showToast('সদস্য যোগ করা হয়েছে');
  };

  // Collect Member Subscription into Cash
  const handlePayMember = (member: MosqueMember, dueAmount: number) => {
    onUpdateAppState((prev) => ({
      ...prev,
      tx: [
        ...prev.tx,
        {
          id: Date.now(),
          type: 'in',
          date: memberMonth === currentMonthStr ? new Date().toISOString().slice(0, 10) : `${memberMonth}-01`,
          cat: 'সদস্যদের দান/চাঁদা',
          name: member.n,
          amt: dueAmount,
          acc: 'cash',
          note: `মাসিক চাঁদা পরিশোধ (${memberMonth})`
        }
      ]
    }));
    showToast('চাঁদা আদায় ও কোষাধ্যক্ষের তহবিলে জমা হয়েছে');
  };

  // Add / Edit Pledge (ওয়াদা)
  const handleSavePledge = (e: React.FormEvent) => {
    e.preventDefault();
    const q = Number(plQty);
    if (!plName.trim() || !q || q <= 0) return showToast('নাম ও পরিমাণ দিন');

    onUpdateAppState((prev) => {
      const pledgeItem: MosquePledge = {
        id: editingPlId !== null ? editingPlId : Date.now(),
        n: plName.trim(),
        ad: plAddress.trim(),
        ph: plPhone.trim(),
        ty: plType,
        q,
        u: plType === 'dhan' ? plUnit : '',
        pur: plPurpose.trim() || 'সাধারণ দান',
        dt: plDate,
        note: plNote.trim(),
        got: editingPlId !== null ? (prev.pl.find((p) => p.id === editingPlId)?.got || 0) : 0
      };

      let updatedPl = [...prev.pl];
      if (editingPlId !== null) {
        updatedPl = updatedPl.map((p) => (p.id === editingPlId ? pledgeItem : p));
      } else {
        updatedPl.push(pledgeItem);
      }

      return {
        ...prev,
        pl: updatedPl
      };
    });

    setEditingPlId(null);
    setPlName('');
    setPlAddress('');
    setPlPhone('');
    setPlQty('');
    setPlNote('');
    showToast('ওয়াদা সংরক্ষিত হয়েছে');
  };

  // Receive Pledge
  const handleRecvPledge = (pledge: MosquePledge, receivedAmount: number) => {
    if (receivedAmount <= 0) return showToast('সঠিক পরিমাণ দিন');

    onUpdateAppState((prev) => {
      const updatedPl = prev.pl.map((p) => {
        if (p.id === pledge.id) {
          return { ...p, got: p.got + receivedAmount };
        }
        return p;
      });

      let updatedTx = [...prev.tx];
      // If cash, automatically add to Income
      if (pledge.ty === 'cash') {
        updatedTx.push({
          id: Date.now(),
          type: 'in',
          date: new Date().toISOString().slice(0, 10),
          cat: 'বিশেষ দান',
          name: pledge.n,
          amt: receivedAmount,
          acc: 'cash',
          note: `ওয়াদা আদায় — ${pledge.pur}`
        });
      }

      return {
        ...prev,
        pl: updatedPl,
        tx: updatedTx
      };
    });

    showToast(pledge.ty === 'cash' ? 'টাকা আদায় হয়েছে ও আয়ে যোগ হয়েছে' : 'ধান আদায় হিসেবে জমা হয়েছে');
  };

  // Paddy Sale
  const handleAddPaddySale = (e: React.FormEvent) => {
    e.preventDefault();
    const q = Number(saleQty);
    const r = Number(saleRate);
    if (!q || q <= 0 || !r || r <= 0) return showToast('পরিমাণ ও দর দিন');

    const kg = saleUnit === 'মণ' ? q * 40 : q;
    if (kg > paddyStats.stockKg + 0.01) {
      return showToast('মজুদের চেয়ে বেশি ধান বিক্রি করা যাবে না');
    }

    const total = Math.round((kg / 40) * r);
    const saleId = Date.now();
    const txId = saleId + 1;
    const buyerName = saleBuyer.trim() || 'ধান বিক্রি';

    onUpdateAppState((prev) => ({
      ...prev,
      ds: [
        ...prev.ds,
        {
          id: saleId,
          dt: saleDate || new Date().toISOString().slice(0, 10),
          kg,
          rate: r,
          total,
          buyer: buyerName,
          tx: txId
        }
      ],
      tx: [
        ...prev.tx,
        {
          id: txId,
          type: 'in',
          date: saleDate || new Date().toISOString().slice(0, 10),
          cat: 'ধান বিক্রি',
          name: buyerName,
          amt: total,
          acc: saleAcc,
          note: `${(kg / 40).toLocaleString('bn-BD', { maximumFractionDigits: 2 })} মণ ধান বিক্রি (দর: ৳ ${r}/মণ)`
        }
      ]
    }));

    setSaleQty('');
    setSaleRate('');
    setSaleBuyer('');
    showToast('ধান বিক্রি সংরক্ষিত ও আয়ে যোগ হয়েছে');
  };

  // Add Plan Item
  const handleAddPlanItem = (e: React.FormEvent) => {
    e.preventDefault();
    const q = Number(planQty) || 1;
    const r = Number(planRate);
    if (!planName.trim() || !r || r <= 0) return showToast('কাজের নাম ও একক দর দিন');

    onUpdateAppState((prev) => ({
      ...prev,
      plan: [
        ...prev.plan,
        {
          id: Date.now(),
          n: planName.trim(),
          q,
          r
        }
      ]
    }));

    setPlanName('');
    setPlanQty(1);
    setPlanRate('');
    showToast('পরিকল্পনা যোগ করা হয়েছে');
  };

  // Generate WhatsApp / SMS text report
  const generateTextReport = () => {
    const mi = appState.tx.filter((t) => t.type === 'in' && t.date.startsWith(reportMonth));
    const mo = appState.tx.filter((t) => t.type === 'out' && t.date.startsWith(reportMonth));

    const sumBy = (list: MosqueTransaction[]) => {
      const o: Record<string, number> = {};
      list.forEach((t) => {
        o[t.cat] = (o[t.cat] || 0) + Number(t.amt);
      });
      return o;
    };

    const inCats = sumBy(mi);
    const outCats = sumBy(mo);

    const text = `🕌 ${appState.name} — মাসিক আয়-ব্যয় হিসাব (${reportMonth})\n\n` +
      `🟢 মোট আয়: ${f(mi.reduce((s, t) => s + Number(t.amt), 0))}\n` +
      Object.entries(inCats).map(([k, v]) => `  • ${k}: ${f(v)}`).join('\n') +
      `\n\n🔴 মোট খরচ: ${f(mo.reduce((s, t) => s + Number(t.amt), 0))}\n` +
      Object.entries(outCats).map(([k, v]) => `  • ${k}: ${f(v)}`).join('\n') +
      `\n\n💼 বর্তমান ব্যাংক তহবিল: ${f(balance.b)}` +
      `\n💵 কোষাধ্যক্ষের কাছে নগদ: ${f(balance.c)}` +
      `\n💰 মোট সার্বিক তহবিল: ${f(balance.total)}\n\n` +
      `অ্যাপ তৈরি করেছেন: Md Moddasel Hoque (Cell: 01914393139)`;

    navigator.clipboard.writeText(text);
    setTextReportCopied(true);
    showToast('টেক্সট রিপোর্ট কপি হয়েছে! মেসেঞ্জার/হোয়াটসঅ্যাপে পেস্ট করুন।');
    setTimeout(() => setTextReportCopied(false), 3000);
  };

  // Notice management helpers & CRUD
  const noticesList = useMemo(() => {
    return Array.isArray(appState.notices) ? appState.notices : [];
  }, [appState.notices]);

  const topNotice = useMemo(() => {
    if (!noticesList.length) return null;
    const pinnedOrUrgent = noticesList.find((n) => n.isPinned || n.priority === 'urgent');
    return pinnedOrUrgent || noticesList[0];
  }, [noticesList]);

  const handleSaveNotice = (notice: MosqueNotice) => {
    onUpdateAppState((prev) => {
      const existing = prev.notices || [];
      const isEdit = existing.some((n) => n.id === notice.id);
      let updated: MosqueNotice[];
      if (isEdit) {
        updated = existing.map((n) => (n.id === notice.id ? notice : n));
      } else {
        updated = [notice, ...existing];
      }
      return {
        ...prev,
        notices: updated
      };
    });
    showToast('বিজ্ঞপ্তি সংরক্ষিত ও প্রকাশিত হয়েছে');
  };

  const handleDeleteNotice = (id: number) => {
    onUpdateAppState((prev) => ({
      ...prev,
      notices: (prev.notices || []).filter((n) => n.id !== id)
    }));
    showToast('বিজ্ঞপ্তি মুছে ফেলা হয়েছে');
  };

  const handleTogglePinNotice = (id: number) => {
    onUpdateAppState((prev) => ({
      ...prev,
      notices: (prev.notices || []).map((n) =>
        n.id === id ? { ...n, isPinned: !n.isPinned } : n
      )
    }));
    showToast('পিন স্থিতি আপডেট হয়েছে');
  };

  // Member registration date helper & formatting
  const getMemberRegDate = (mem: MosqueMember): string => {
    if (mem.regDate) return mem.regDate;
    if (mem.id && mem.id > 1600000000000) {
      return new Date(mem.id).toISOString().slice(0, 10);
    }
    return '2026-01-01';
  };

  const formatRegDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const months = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      const monthName = months[monthIdx] || parts[1];
      return `${toBengaliNumerals(parts[2])} ${monthName} ${toBengaliNumerals(parts[0])}`;
    }
    return toBengaliNumerals(dateStr);
  };

  // Unique member professions with count
  const uniqueProfessions = useMemo(() => {
    const counts: Record<string, number> = {};
    appState.ppl.forEach((m) => {
      const p = m.profession?.trim();
      if (p) {
        counts[p] = (counts[p] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [appState.ppl]);

  // Filtered members list based on search query, profession, and registration date
  const filteredMembers = useMemo(() => {
    return appState.ppl.filter((mem) => {
      // 1. Search by name (and fallback to father/mother/address/phone)
      if (memberSearchQuery.trim()) {
        const q = memberSearchQuery.toLowerCase().trim();
        const matchName = mem.n.toLowerCase().includes(q);
        const matchFather = mem.fatherName ? mem.fatherName.toLowerCase().includes(q) : false;
        const matchPhone = mem.ph ? mem.ph.includes(q) : false;
        const matchAddress = mem.address ? mem.address.toLowerCase().includes(q) : false;
        const matchProfession = mem.profession ? mem.profession.toLowerCase().includes(q) : false;
        if (!matchName && !matchFather && !matchPhone && !matchAddress && !matchProfession) {
          return false;
        }
      }

      // 2. Profession filter chip
      if (selectedProfession !== 'all') {
        if ((mem.profession?.trim() || '') !== selectedProfession) {
          return false;
        }
      }

      // 3. Registration date timeframe filter chip
      if (selectedDateFilter !== 'all') {
        const rDateStr = getMemberRegDate(mem);
        const regDate = new Date(rDateStr);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth();

        if (selectedDateFilter === 'this_month') {
          if (regDate.getFullYear() !== currentYear || regDate.getMonth() !== currentMonth) {
            return false;
          }
        } else if (selectedDateFilter === 'last_3_months') {
          const threeMonthsAgo = new Date();
          threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
          if (regDate < threeMonthsAgo) return false;
        } else if (selectedDateFilter === 'this_year') {
          if (regDate.getFullYear() !== currentYear) return false;
        }
      }

      return true;
    });
  }, [appState.ppl, memberSearchQuery, selectedProfession, selectedDateFilter]);

  // PIN Lock check
  if (appState.pin && !isUnlocked) {
    return (
      <div className="max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4 my-8">
        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
          মসজিদের হিসাবঘর লক করা আছে
        </h3>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          কমিটির আর্থিক লেনদেন ও গোপনীয়তা সুরক্ষায় পিন কোড প্রবেশ করান।
        </p>

        <form onSubmit={handleUnlock} className="space-y-3 pt-2">
          <input
            type="password"
            inputMode="numeric"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            placeholder="গোপন পিন দিন"
            className="w-full text-center text-2xl font-mono tracking-widest p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            autoFocus
          />
          {pinError && (
            <p className="text-xs text-rose-500 font-bold">ভুল পিন কোড! পুনরায় চেষ্টা করুন।</p>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Unlock className="w-4 h-4" />
            <span>লক খুলুন (হিসাব দেখুন)</span>
          </button>
        </form>
      </div>
    );
  }

  // Maktab Students Fee & Dues Summary for Dashboard & Tab Badge
  const maktabStudentsList = useMemo(() => {
    return Array.isArray(appState.maktabStudents) ? appState.maktabStudents : [];
  }, [appState.maktabStudents]);

  const maktabPaymentsList = useMemo(() => {
    return Array.isArray(appState.maktabPayments) ? appState.maktabPayments : [];
  }, [appState.maktabPayments]);

  const maktabDueStudentsCount = useMemo(() => {
    const active = maktabStudentsList.filter((s) => s.status === 'active');
    return active.filter((st) => {
      const paid = maktabPaymentsList
        .filter((p) => p.studentId === st.id && p.month === currentMonthStr)
        .reduce((sum, p) => sum + (Number(p.amount) || 0) + (Number(p.waiverDiscount) || 0), 0);
      return paid < st.monthlyFee;
    }).length;
  }, [maktabStudentsList, maktabPaymentsList, currentMonthStr]);

  const maktabMonthCollected = useMemo(() => {
    return maktabPaymentsList
      .filter((p) => p.month === currentMonthStr)
      .reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  }, [maktabPaymentsList, currentMonthStr]);

  const maktabMonthTotalDue = useMemo(() => {
    const active = maktabStudentsList.filter((s) => s.status === 'active');
    return active.reduce((sum, st) => {
      const paid = maktabPaymentsList
        .filter((p) => p.studentId === st.id && p.month === currentMonthStr)
        .reduce((s, p) => s + (Number(p.amount) || 0) + (Number(p.waiverDiscount) || 0), 0);
      return sum + Math.max(0, st.monthlyFee - paid);
    }, 0);
  }, [maktabStudentsList, maktabPaymentsList, currentMonthStr]);

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      {/* Toast popup */}
      {toastMsg && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white dark:bg-emerald-950 dark:border dark:border-emerald-700 px-4 py-2 rounded-full text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          {toastMsg}
        </div>
      )}

      {/* Accounts Sub-Navigation from attached file */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 border border-slate-200 dark:border-slate-800 shadow-xs flex gap-1.5 overflow-x-auto scrollbar-none">
        {[
          { key: 'home', label: 'ড্যাশবোর্ড', icon: <Landmark className="w-4 h-4" /> },
          { key: 'notice', label: 'নোটিশ বোর্ড', icon: <Megaphone className="w-4 h-4 text-amber-500" />, badge: noticesList.length },
          { key: 'annual', label: 'বার্ষিক হিসাব ও YoY প্রবৃদ্ধি', icon: <Calendar className="w-4 h-4 text-purple-600" /> },
          { key: 'chart', label: 'ভিজ্যুয়াল চার্ট', icon: <BarChart3 className="w-4 h-4 text-emerald-500" /> },
          { key: 'punctuality', label: 'নামাজের সময়ানুবর্তিতা (D3)', icon: <Clock className="w-4 h-4 text-sky-500" /> },
          { key: 'donations', label: 'দান ও দাতা তালিকা', icon: <Heart className="w-4 h-4 text-rose-500 fill-rose-500/20" />, badge: appState.tx.filter(t => t.type === 'in').length },
          { key: 'in', label: 'আয়/দান এন্ট্রি', icon: <ArrowDownRight className="w-4 h-4 text-emerald-600" /> },
          { key: 'out', label: 'খরচ', icon: <ArrowUpRight className="w-4 h-4 text-rose-600" /> },
          { key: 'mem', label: 'সদস্য ও চাঁদা', icon: <Users className="w-4 h-4 text-blue-600" /> },
          { key: 'maktab', label: 'মক্তব ও বেতন', icon: <GraduationCap className="w-4 h-4 text-purple-600" />, badge: maktabDueStudentsCount },
          { key: 'pl', label: 'ওয়াদা ও ধান', icon: <Wheat className="w-4 h-4 text-amber-600" /> },
          { key: 'plan', label: 'উন্নয়ন হিসাব', icon: <Calculator className="w-4 h-4 text-indigo-600" /> },
          { key: 'rep', label: 'পূর্ণাঙ্গ রিপোর্ট', icon: <FileText className="w-4 h-4 text-teal-600" /> }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveSubTab(tab.key as typeof activeSubTab);
              setFilterQuery('');
            }}
            className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition flex items-center gap-1.5 shrink-0 ${
              activeSubTab === tab.key
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                activeSubTab === tab.key
                  ? 'bg-white/30 text-white'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {toBengaliNumerals(tab.badge)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* DASHBOARD TAB */}
      {activeSubTab === 'home' && (
        <div className="space-y-4">
          {/* Urgent / Pinned Notice Announcement Banner on Dashboard */}
          {topNotice && (
            <div className={`p-4 rounded-2xl border shadow-xs transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              topNotice.priority === 'urgent'
                ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300/80 dark:border-rose-900/60'
                : 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300/80 dark:border-amber-900/60'
            }`}>
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl shadow-xs ${
                  topNotice.priority === 'urgent'
                    ? 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300'
                    : 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300'
                }`}>
                  📢
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      topNotice.priority === 'urgent'
                        ? 'bg-rose-200/80 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200'
                        : 'bg-amber-200/80 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200'
                    }`}>
                      {topNotice.priority === 'urgent' ? 'জরুরী বিজ্ঞপ্তি' : 'গুরুত্বপূর্ণ ঘোষণা'}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      {toBengaliNumerals(topNotice.date)}
                    </span>
                    {topNotice.isPinned && (
                      <span className="text-[10px] font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-0.5">
                        <Pin className="w-3 h-3 fill-amber-500 text-amber-600" /> পিনকৃত
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate mt-1">
                    {topNotice.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5">
                    {topNotice.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => setActiveSubTab('notice')}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 font-bold text-xs shadow-xs hover:bg-slate-800 dark:hover:bg-slate-200 transition"
                >
                  সব নোটিশ দেখুন ({toBengaliNumerals(noticesList.length)})
                </button>
              </div>
            </div>
          )}

          {/* Fund Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md">
              <span className="text-xs font-semibold opacity-90">মোট সার্বিক তহবিল</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono mt-1">
                {f(balance.total)}
              </div>
              <span className="text-[11px] opacity-80 mt-1 block">ব্যাংক + কোষাধ্যক্ষ সর্বমোট</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                ব্যাংক অ্যাকাউন্টে স্থিতি
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                {f(balance.b)}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                শুরুর ব্যালেন্স: {f(appState.ob)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                কোষাধ্যক্ষের কাছে নগদ
              </span>
              <div className="text-xl sm:text-2xl font-bold font-mono text-blue-700 dark:text-blue-400 mt-1">
                {f(balance.c)}
              </div>
              <span className="text-[11px] text-slate-400 block mt-1">
                শুরুর ব্যালেন্স: {f(appState.oc)}
              </span>
            </div>
          </div>

          {/* Target Donation Goal Visual Progress Bar */}
          <DonationGoalProgressBar
            appState={appState}
            onUpdateSettings={(newSettings) => {
              onUpdateAppState((prev) => ({
                ...prev,
                settings: {
                  ...prev.settings,
                  ...newSettings
                }
              }));
            }}
            language={language}
          />

          {/* Month & Total Summary */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">চলতি মাসের আয়</span>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-600 mt-1">
                {f(monthIncome)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">চলতি মাসের খরচ</span>
              <div className="text-base sm:text-lg font-bold font-mono text-rose-600 mt-1">
                {f(monthExpense)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">সর্বমোট আয়</span>
              <div className="text-base sm:text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                {f(totalIncome)}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">সর্বমোট খরচ</span>
              <div className="text-base sm:text-lg font-bold font-mono text-rose-700 dark:text-rose-400 mt-1">
                {f(totalExpense)}
              </div>
            </div>
          </div>

          {/* Quick PDF Action Banner on Dashboard */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-900 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl shrink-0 border border-white/20">
                📄
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>মাসিক অফিশিয়াল আয়-ব্যয় পিডিএফ রিপোর্ট</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-400 text-slate-950 font-extrabold">
                    কমিটি কপি
                  </span>
                </h4>
                <p className="text-xs text-emerald-100/80">
                  সর্বশেষ হিসাবের সম্পূর্ণ রিপোর্ট প্রিন্ট বা পিডিএফ ডাউনলোড করুন
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsPDFModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md transition active:scale-95 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>পিডিএফ রিপোর্ট ডাউনলোড</span>
            </button>
          </div>

          {/* Maktab Student Fee & Dues Summary Widget on Dashboard */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border border-purple-500/30 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-400/30">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-200">
                    মক্তব ও নূরানী মাদ্রাসা বেতন হিসাব
                  </span>
                  {maktabDueStudentsCount > 0 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/80 text-white">
                      {toBengaliNumerals(maktabDueStudentsCount)} জনের বকেয়া আছে
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/80 text-white">
                      সকল বেতন পরিশোধিত ✓
                    </span>
                  )}
                </div>
                <div className="text-xs text-purple-100/90 mt-1 flex flex-wrap items-center gap-3">
                  <span>চলতি মাসে আদায়: <strong className="text-emerald-400 font-mono">{f(maktabMonthCollected)}</strong></span>
                  <span>•</span>
                  <span>বকেয়া পাওনা: <strong className="text-rose-400 font-mono">{f(maktabMonthTotalDue)}</strong></span>
                  <span>•</span>
                  <span>মোট শিক্ষার্থী: <strong className="text-white font-mono">{toBengaliNumerals(maktabStudentsList.filter(s => s.status === 'active').length)} জন</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('maktab')}
              className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
            >
              <span>বেতন ও বকেয়া হিসাব</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Prayer Punctuality Analytics Widget on Dashboard */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950 via-slate-900 to-emerald-950 border border-sky-500/30 text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 border border-sky-400/30">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sky-200">
                    নামাজের সময়ানুবর্তিতা ও ক্বাযা অ্যানালিটিক্স
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/80 text-white">
                    D3.js ট্রেন্ড চার্ট
                  </span>
                </div>
                <div className="text-xs text-sky-100/90 mt-1 flex flex-wrap items-center gap-2.5">
                  <span>ব্যবহারকারীর ওয়াক্তভিত্তিক লগ বিশ্লেষণ</span>
                  <span>•</span>
                  <span>সময়মতো বনাম মিসড সালাতের ট্রেন্ড</span>
                  <span>•</span>
                  <span>দৈনিক সালাত ট্র্যাকার</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('punctuality')}
              className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5 shrink-0 self-end sm:self-auto"
            >
              <span>অ্যানালিটিক্স চার্ট খুলুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Expense Entry Buttons on Dashboard */}
          <QuickExpenseAddButtons
            variant="dashboard"
            onSelectPreset={handleSelectQuickExpense}
            selectedPresetId={selectedQuickPresetId}
            onClearPreset={handleClearQuickPreset}
          />

          {/* Visual Summary Section using Recharts */}
          <MosqueFinancialVisualSummary appState={appState} balance={balance} />

          {/* Bank <-> Cash Inter-transfer Tool (from attached file) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3">
              <ArrowLeftRight className="w-5 h-5 text-indigo-600" />
              <span>ব্যাংক ↔ কোষাধ্যক্ষ লেনদেন (টাকা স্থানান্তর)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">তারিখ:</span>
                <input
                  type="date"
                  value={xferDate}
                  onChange={(e) => setXferDate(e.target.value)}
                  className="mt-1 w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">স্থানান্তরের ধরন:</span>
                <select
                  value={xferType}
                  onChange={(e) => setXferType(e.target.value as 'bank' | 'cash')}
                  className="mt-1 w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="bank">ব্যাংক থেকে উত্তোলন (কোষাধ্যক্ষকে নগদ প্রদান)</option>
                  <option value="cash">ব্যাংকে জমা (কোষাধ্যক্ষ থেকে ব্যাংক অ্যাকাউন্টে)</option>
                </select>
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">টাকার পরিমাণ:</span>
                <input
                  type="number"
                  min="1"
                  value={xferAmt}
                  onChange={(e) => setXferAmt(Number(e.target.value) || '')}
                  placeholder="৳ যেমন: ১০,০০০"
                  className="mt-1 w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </label>
            </div>

            <button
              onClick={handleTransfer}
              className="mt-3 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
            >
              স্থানান্তর সংরক্ষণ করুন
            </button>
          </div>

          {/* Recent Transactions List */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              সাম্প্রতিক লেনদেনসমূহ
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-2 px-2">তারিখ</th>
                    <th className="py-2 px-2">খাত</th>
                    <th className="py-2 px-2">নাম / বিবরণ</th>
                    <th className="py-2 px-2 text-right">টাকা</th>
                    <th className="py-2 px-2 text-center">হিসাব</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {appState.tx.slice(-8).reverse().map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2 px-2 text-slate-500 font-mono">{t.date}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] inline-block ${getCategoryBadgeStyle(t.cat)}`}>
                          {t.cat}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-slate-600 dark:text-slate-400">
                        {t.name} <span className="opacity-70 text-[11px]">{t.note}</span>
                      </td>
                      <td className={`py-2 px-2 text-right font-mono font-bold ${
                        t.type === 'in' ? 'text-emerald-600' : t.type === 'out' ? 'text-rose-600' : 'text-indigo-600'
                      }`}>
                        {f(t.amt)}
                      </td>
                      <td className="py-2 px-2 text-center text-slate-500">
                        {t.type === 'xfer' ? 'স্থানান্তর' : t.acc === 'bank' ? 'ব্যাংক' : 'কোষাধ্যক্ষ'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* NOTICE BOARD TAB */}
      {activeSubTab === 'notice' && (
        <MosqueNoticeBoard
          notices={noticesList}
          onSaveNotice={handleSaveNotice}
          onDeleteNotice={handleDeleteNotice}
          onTogglePin={handleTogglePinNotice}
          language={language}
        />
      )}

      {/* ANNUAL SUMMARY & YOY GROWTH TAB */}
      {activeSubTab === 'annual' && (
        <AnnualFinancialSummaryView appState={appState} language={language} />
      )}

      {/* DEDICATED VISUAL CHART TAB */}
      {activeSubTab === 'chart' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 border border-sky-200 dark:border-sky-900/60">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  নামাজের সময়ানুবর্তিতা ও ক্বাযা সালাত বিশ্লেষণ (D3.js)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  ওয়াক্তভিত্তিক সময়মতো আদায় ও ট্রেন্ড চার্ট দেখুন
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveSubTab('punctuality')}
              className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
            >
              <span>অ্যানালিটিক্স খুলুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <MosqueFinancialVisualSummary appState={appState} balance={balance} />
        </div>
      )}

      {/* PRAYER PUNCTUALITY ANALYTICS SECTION (D3.JS) */}
      {activeSubTab === 'punctuality' && (
        <PrayerPunctualityD3Section
          appState={appState}
          onUpdateAppState={onUpdateAppState}
          language={language}
        />
      )}

      {/* DETAILED DONATION & DONOR LIST TAB */}
      {activeSubTab === 'donations' && (
        <DonorsListSection
          appState={appState}
          onUpdateAppState={onUpdateAppState}
          language={language}
          onOpenDonateModal={onOpenDonateModal}
        />
      )}

      {/* INCOME (আয়/দান) & EXPENSE (খরচ) TABS */}
      {(activeSubTab === 'in' || activeSubTab === 'out') && (
        <div className="space-y-4">
          {/* New Transaction Form */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {activeSubTab === 'in' ? (
                  <>
                    <ArrowDownRight className="w-5 h-5 text-emerald-600" />
                    <span>নতুন আয় / দান এন্ট্রি করুন</span>
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-5 h-5 text-rose-600" />
                    <span>নতুন খরচ এন্ট্রি করুন</span>
                  </>
                )}
              </h3>

              {activeSubTab === 'in' && (
                <button
                  type="button"
                  onClick={() => setActiveSubTab('donations')}
                  className="px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 font-bold text-xs transition flex items-center gap-1 shrink-0 self-start sm:self-auto border border-emerald-200 dark:border-emerald-800"
                >
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span>সকল দান ও দাতা তালিকা দেখুন ➔</span>
                </button>
              )}
            </div>

            {/* Quick Expense Presets for Instant Pre-fill */}
            {activeSubTab === 'out' && (
              <div className="mb-4">
                <QuickExpenseAddButtons
                  variant="full"
                  onSelectPreset={handleSelectQuickExpense}
                  selectedPresetId={selectedQuickPresetId}
                  onClearPreset={handleClearQuickPreset}
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">তারিখ:</span>
                <input
                  type="date"
                  value={txDate}
                  onChange={(e) => setTxDate(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label className="relative">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">খাত নির্বাচন:</span>
                  {categorySuggestion.topSuggestion && (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5 text-amber-500 animate-pulse" />
                      <span>পরামর্শ সক্রিয়</span>
                    </span>
                  )}
                </div>
                <select
                  value={txCat}
                  onChange={(e) => {
                    setTxCat(e.target.value);
                    setHasUserManuallySelectedCat(true);
                  }}
                  className={`mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border text-slate-900 dark:text-white transition ${
                    categorySuggestion.topSuggestion && (txCat || (activeSubTab === 'in' ? INC_CATEGORIES[0] : EXP_CATEGORIES[0])) === categorySuggestion.topSuggestion.category
                      ? 'border-emerald-500 ring-1 ring-emerald-500 font-semibold'
                      : 'border-slate-300 dark:border-slate-700'
                  }`}
                >
                  {(activeSubTab === 'in' ? INC_CATEGORIES : EXP_CATEGORIES).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                {/* Top Suggestion Helper Pill */}
                {categorySuggestion.topSuggestion && (
                  <div className="mt-1 flex items-center justify-between gap-1 text-[11px] px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300">
                    <span className="truncate">
                      ✨ কি-ওয়ার্ড: <strong>{categorySuggestion.topSuggestion.matchedKeyword}</strong>
                    </span>
                    {(txCat || (activeSubTab === 'in' ? INC_CATEGORIES[0] : EXP_CATEGORIES[0])) !== categorySuggestion.topSuggestion.category && (
                      <button
                        type="button"
                        onClick={() => {
                          setTxCat(categorySuggestion.topSuggestion!.category);
                          setHasUserManuallySelectedCat(true);
                          showToast(`খাত '${categorySuggestion.topSuggestion!.category}' নির্বাচন করা হয়েছে`);
                        }}
                        className="px-1.5 py-0.2 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] shrink-0"
                      >
                        প্রয়োগ
                      </button>
                    )}
                  </div>
                )}
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  {activeSubTab === 'in' ? 'দাতার নাম:' : 'কাকে / বিবরণ:'}
                </span>
                <input
                  type="text"
                  value={txName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder={activeSubTab === 'in' ? 'দাতার নাম (বা প্রতিষ্ঠান)' : 'যেমন: ডেসকো, ইমাম সাহেব, দোকান'}
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">টাকার পরিমাণ (টাকা)*:</span>
                <input
                  ref={txAmtInputRef}
                  type="number"
                  min="1"
                  value={txAmt}
                  onChange={(e) => setTxAmt(Number(e.target.value) || '')}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveTx(activeSubTab);
                    }
                  }}
                  placeholder="৳ যেমন: ৫০০০"
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  {activeSubTab === 'in' ? 'কোথায় জমা:' : 'কোথা থেকে পরিশোধ:'}
                </span>
                <select
                  value={txAcc}
                  onChange={(e) => setTxAcc(e.target.value as 'cash' | 'bank')}
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="cash">কোষাধ্যক্ষের হাতে নগদ</option>
                  <option value="bank">ব্যাংক অ্যাকাউন্ট</option>
                </select>
              </label>

              <label className="sm:col-span-2">
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  মন্তব্য / অনুদানের নোট (অটো-সাজেশন কি-ওয়ার্ড লিখুন):
                </span>
                <div className="relative">
                  <input
                    type="text"
                    value={txNote}
                    onChange={(e) => handleNoteChange(e.target.value)}
                    placeholder={
                      activeSubTab === 'in'
                        ? 'যেমন: জুমার দান, donation, মাসিক চাঁদা, rent, ধান বিক্রি...'
                        : 'যেমন: light bill, ইমামের বেতন, কারেন্ট বিল, rent, এসি মেরামত...'
                    }
                    className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white pr-8"
                  />
                  {txNote && (
                    <button
                      type="button"
                      onClick={() => handleNoteChange('')}
                      className="absolute right-2.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
                      title="মুছুন"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </label>
            </div>

            {/* Smart Auto-Suggestion Feedback Bar */}
            {categorySuggestion.topSuggestion && (
              <div className="mt-3 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300">
                    <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-slate-700 dark:text-slate-300">
                      নোটে '<strong>{categorySuggestion.topSuggestion.matchedKeyword}</strong>' কি-ওয়ার্ড সনাক্ত হয়েছে — প্রস্তাবিত খাত:{' '}
                    </span>
                    <strong className="text-emerald-800 dark:text-emerald-300 font-bold underline">
                      {categorySuggestion.topSuggestion.category}
                    </strong>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block sm:inline sm:ml-1">
                      ({categorySuggestion.topSuggestion.explanation})
                    </span>
                  </div>
                </div>

                {(txCat || (activeSubTab === 'in' ? INC_CATEGORIES[0] : EXP_CATEGORIES[0])) !== categorySuggestion.topSuggestion.category && (
                  <button
                    type="button"
                    onClick={() => {
                      setTxCat(categorySuggestion.topSuggestion!.category);
                      setHasUserManuallySelectedCat(true);
                      showToast(`খাত '${categorySuggestion.topSuggestion!.category}' প্রয়োগ করা হয়েছে`);
                    }}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition flex items-center gap-1 shadow-xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>খাত প্রয়োগ করুন</span>
                  </button>
                )}
              </div>
            )}

            {/* Cross-Tab Suggestion (e.g. user typed 'light bill' in income tab or 'donation' in expense tab) */}
            {categorySuggestion.crossTypeSuggestion && (
              <div className="mt-3 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/70 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    '<strong>{categorySuggestion.crossTypeSuggestion.matchedKeyword}</strong>' কি-ওয়ার্ডটি{' '}
                    <strong>{categorySuggestion.crossTypeSuggestion.type === 'out' ? 'খরচের' : 'আয়ের'}</strong> খাতের সাথে মিলে ({categorySuggestion.crossTypeSuggestion.category})।
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const target = categorySuggestion.crossTypeSuggestion!.type;
                    setActiveSubTab(target);
                    setTxCat(categorySuggestion.crossTypeSuggestion!.category);
                    setHasUserManuallySelectedCat(true);
                    showToast(`${target === 'out' ? 'খরচের' : 'আয়ের'} ট্যাবে স্থানান্তরিত করা হয়েছে`);
                  }}
                  className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 transition"
                >
                  {categorySuggestion.crossTypeSuggestion.type === 'out' ? 'খরচ হিসাবে স্যুইচ করুন' : 'আয় হিসাবে স্যুইচ করুন'}
                </button>
              </div>
            )}

            {/* Quick Note & Category Template Chips */}
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-500" />
                <span>সহজ বিবরণ টেমপ্লেট:</span>
              </span>
              {POPULAR_NOTE_TEMPLATES[activeSubTab === 'in' ? 'in' : 'out'].map((tpl) => (
                <button
                  key={tpl}
                  type="button"
                  onClick={() => {
                    handleNoteChange(tpl);
                    showToast(`নোট যুক্ত ও খাত অটো-সিলেক্ট হয়েছে`);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] transition border border-slate-200 dark:border-slate-700 font-medium"
                >
                  {tpl}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => handleSaveTx(activeSubTab)}
                className={`px-5 py-2.5 rounded-xl text-white font-bold text-xs transition ${
                  activeSubTab === 'in'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {editingTxId !== null ? 'আপডেট করুন' : 'সংরক্ষণ করুন'}
              </button>

              {editingTxId !== null && (
                <button
                  onClick={() => {
                    setEditingTxId(null);
                    setSelectedQuickPresetId(null);
                    setTxAmt('');
                    setTxName('');
                    setTxNote('');
                    setTxCat('');
                    setHasUserManuallySelectedCat(false);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
              )}
            </div>
          </div>

          {/* Transaction Search & Table */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {activeSubTab === 'in' ? 'আয়ের তালিকা' : 'খরচের তালিকা'} (মোট{' '}
                <span className="font-mono text-emerald-600">
                  {f(appState.tx.filter((t) => t.type === activeSubTab).reduce((s, t) => s + Number(t.amt), 0))}
                </span>
                )
              </h3>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="নাম বা খাত দিয়ে খুঁজুন..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-2.5 px-2">তারিখ</th>
                    <th className="py-2.5 px-2">খাত</th>
                    <th className="py-2.5 px-2">নাম / বিবরণ</th>
                    <th className="py-2.5 px-2 text-right">টাকা</th>
                    <th className="py-2.5 px-2 text-center">হিসাব</th>
                    <th className="py-2.5 px-2 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {appState.tx
                    .filter(
                      (t) =>
                        t.type === activeSubTab &&
                        (!filterQuery || (t.name + t.cat + t.note).toLowerCase().includes(filterQuery.toLowerCase()))
                    )
                    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id)
                    .map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-2 font-mono text-slate-500">{t.date}</td>
                        <td className="py-2.5 px-2">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] inline-block ${getCategoryBadgeStyle(t.cat)}`}>
                            {t.cat}
                          </span>
                        </td>
                        <td className="py-2.5 px-2 text-slate-600 dark:text-slate-400">
                          {t.name} {t.note && <span className="opacity-70 text-[11px]">({t.note})</span>}
                        </td>
                        <td className={`py-2.5 px-2 text-right font-mono font-bold ${
                          t.type === 'in' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {f(t.amt)}
                        </td>
                        <td className="py-2.5 px-2 text-center text-slate-500">
                          {t.acc === 'bank' ? 'ব্যাংক' : 'কোষাধ্যক্ষ'}
                        </td>
                        <td className="py-2.5 px-2 text-right space-x-1">
                          <button
                            onClick={() => {
                              setEditingTxId(t.id);
                              setTxDate(t.date);
                              setTxCat(t.cat);
                              setTxName(t.name);
                              setTxAmt(t.amt);
                              setTxAcc(t.acc);
                              setTxNote(t.note);
                              setHasUserManuallySelectedCat(true);
                              showToast('সংশোধন করে সংরক্ষণ চাপুন');
                            }}
                            className="p-1 rounded text-slate-600 hover:text-emerald-600"
                            title="সম্পাদনা"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteTx(t.id)}
                            className="p-1 rounded text-rose-500 hover:text-rose-700 font-bold"
                            title="মুছে ফেলুন"
                          >
                            {pendingDeleteId === t.id ? 'নিশ্চিত?' : <Trash2 className="w-3.5 h-3.5" />}
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MEMBERS & SUBSCRIPTIONS (সদস্য ও চাঁদা) */}
      {activeSubTab === 'mem' && (
        <div className="space-y-4">
          {/* Add member */}
          <form onSubmit={handleAddMember} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>নতুন সদস্য নিবন্ধন</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">সদস্যের নাম <span className="text-rose-500">*</span>:</span>
                <input
                  type="text"
                  required
                  value={newMemName}
                  onChange={(e) => setNewMemName(e.target.value)}
                  placeholder="যেমন: হাজী মো. রফিকুল ইসলাম"
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">বাপের/পিতার নাম:</span>
                <input
                  type="text"
                  value={newMemFatherName}
                  onChange={(e) => setNewMemFatherName(e.target.value)}
                  placeholder="যেমন: মরহুম আব্দুল কাদের"
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">মায়ের নাম:</span>
                <input
                  type="text"
                  value={newMemMotherName}
                  onChange={(e) => setNewMemMotherName(e.target.value)}
                  placeholder="যেমন: রহিমা খাতুন"
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">পেশা:</span>
                <input
                  type="text"
                  value={newMemProfession}
                  onChange={(e) => setNewMemProfession(e.target.value)}
                  placeholder="যেমন: ব্যবসায়ী / শিক্ষক / চাকরিজীবী"
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">ঠিকানা:</span>
                <input
                  type="text"
                  value={newMemAddress}
                  onChange={(e) => setNewMemAddress(e.target.value)}
                  placeholder="যেমন: মধ্যপাড়া, মসজিদ রোড"
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">মোবাইল নম্বর:</span>
                <input
                  type="tel"
                  value={newMemPhone}
                  onChange={(e) => setNewMemPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">নিবন্ধন তারিখ:</span>
                <input
                  type="date"
                  value={newMemRegDate}
                  onChange={(e) => setNewMemRegDate(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="font-semibold text-slate-600 dark:text-slate-400">মাসিক নির্ধারিত চাঁদা (টাকা) <span className="text-rose-500">*</span>:</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={newMemAmt}
                  onChange={(e) => setNewMemAmt(Number(e.target.value) || '')}
                  placeholder="৳ যেমন: ১,০০০"
                  className="mt-1 w-full max-w-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-4 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition"
            >
              সদস্য যোগ করুন
            </button>
          </form>

          {/* Member Subscription Table */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>সদস্যদের মাসিক চাঁদা ও বকেয়া হিসাব</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 font-medium">
                  {toBengaliNumerals(filteredMembers.length)}/{toBengaliNumerals(appState.ppl.length)} জন
                </span>
              </h3>

              <div className="flex items-center gap-2 text-xs">
                <span className="text-slate-500">মাস নির্বাচন:</span>
                <input
                  type="month"
                  value={memberMonth}
                  onChange={(e) => setMemberMonth(e.target.value)}
                  className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                />
              </div>
            </div>

            {/* SEARCH BAR & FILTER CHIPS */}
            <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={memberSearchQuery}
                  onChange={(e) => setMemberSearchQuery(e.target.value)}
                  placeholder="সদস্যের নাম দিয়ে খুঁজুন... (যেমন: রফিকুল, আকরাম, সেলিম)"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                />
                {memberSearchQuery && (
                  <button
                    type="button"
                    onClick={() => setMemberSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    title="অনুসন্ধান মুছুন"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Chips Container */}
              <div className="space-y-2.5">
                {/* Profession Filter Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                    <Briefcase className="w-3 h-3 text-blue-500" />
                    পেশা:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedProfession('all')}
                    className={`px-2.5 py-1 rounded-full text-xs transition font-medium ${
                      selectedProfession === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    সকল পেশা ({toBengaliNumerals(appState.ppl.length)})
                  </button>
                  {uniqueProfessions.map((prof) => (
                    <button
                      key={prof.name}
                      type="button"
                      onClick={() => setSelectedProfession(prof.name)}
                      className={`px-2.5 py-1 rounded-full text-xs transition font-medium ${
                        selectedProfession === prof.name
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {prof.name} ({toBengaliNumerals(prof.count)})
                    </button>
                  ))}
                </div>

                {/* Registration Date Filter Chips */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
                    <Calendar className="w-3 h-3 text-emerald-500" />
                    নিবন্ধন সময়:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedDateFilter('all')}
                    className={`px-2.5 py-1 rounded-full text-xs transition font-medium ${
                      selectedDateFilter === 'all'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    সকল সময়
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDateFilter('this_month')}
                    className={`px-2.5 py-1 rounded-full text-xs transition font-medium ${
                      selectedDateFilter === 'this_month'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    চলতি মাস
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDateFilter('last_3_months')}
                    className={`px-2.5 py-1 rounded-full text-xs transition font-medium ${
                      selectedDateFilter === 'last_3_months'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    বিগত ৩ মাস
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDateFilter('this_year')}
                    className={`px-2.5 py-1 rounded-full text-xs transition font-medium ${
                      selectedDateFilter === 'this_year'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    চলতি বছর (২০২৬)
                  </button>

                  {(memberSearchQuery !== '' || selectedProfession !== 'all' || selectedDateFilter !== 'all') && (
                    <button
                      type="button"
                      onClick={() => {
                        setMemberSearchQuery('');
                        setSelectedProfession('all');
                        setSelectedDateFilter('all');
                      }}
                      className="ml-auto px-2 py-0.5 rounded text-[11px] text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold inline-flex items-center gap-1 transition"
                    >
                      <X className="w-3 h-3" />
                      ফিল্টার রিসেট
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Members Table or Empty State */}
            {filteredMembers.length === 0 ? (
              <div className="py-10 px-4 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <p className="font-semibold text-slate-700 dark:text-slate-300 text-sm">কোনো সদস্য পাওয়া যায়নি</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                  আপনার অনুসন্ধান বা ফিল্টারের সাথে মিল রেখে কোনো সদস্য পাওয়া যায়নি।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setMemberSearchQuery('');
                    setSelectedProfession('all');
                    setSelectedDateFilter('all');
                  }}
                  className="mt-3 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-xs"
                >
                  <X className="w-3.5 h-3.5" />
                  ফিল্টার রিসেট করুন
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                      <th className="py-2.5 px-2">সদস্যের তথ্য</th>
                      <th className="py-2.5 px-2 text-right">নির্ধারিত চাঁদা</th>
                      <th className="py-2.5 px-2 text-right">জমা হয়েছে</th>
                      <th className="py-2.5 px-2 text-right">বকেয়া</th>
                      <th className="py-2.5 px-2 text-right">পদক্ষেপ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {filteredMembers.map((mem) => {
                      const paid = appState.tx
                        .filter(
                          (t) =>
                            t.type === 'in' &&
                            t.cat === 'সদস্যদের দান/চাঁদা' &&
                            t.name === mem.n &&
                            t.date.startsWith(memberMonth)
                        )
                        .reduce((s, t) => s + Number(t.amt), 0);
                      const due = Math.max(0, mem.amt - paid);

                      return (
                        <tr key={mem.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                          <td className="py-2.5 px-2">
                            <div className="font-bold text-slate-900 dark:text-white text-sm">{mem.n}</div>
                            <div className="text-[11px] text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5">
                              {mem.fatherName && <span>পিতা: <strong className="font-medium text-slate-700 dark:text-slate-300">{mem.fatherName}</strong></span>}
                              {mem.motherName && <span>• মাতা: <strong className="font-medium text-slate-700 dark:text-slate-300">{mem.motherName}</strong></span>}
                              {mem.profession && <span className="text-blue-600 dark:text-blue-400 font-medium">• পেশা: {mem.profession}</span>}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-2.5 gap-y-0.5 mt-0.5">
                              {mem.address && <span>📍 {mem.address}</span>}
                              {mem.ph && <span>📞 {mem.ph}</span>}
                              <span className="text-emerald-700 dark:text-emerald-400 font-medium">📅 নিবন্ধন: {formatRegDate(getMemberRegDate(mem))}</span>
                            </div>
                          </td>
                        <td className="py-2.5 px-2 text-right font-mono font-semibold">{f(mem.amt)}</td>
                        <td className="py-2.5 px-2 text-right font-mono font-semibold text-emerald-600">{f(paid)}</td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold">
                          {due > 0 ? (
                            <span className="text-rose-600">{f(due)}</span>
                          ) : (
                            <span className="text-emerald-600 font-semibold">পরিশোধিত ✓</span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-right space-x-1">
                          {due > 0 && (
                            <button
                              onClick={() => handlePayMember(mem, due)}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                            >
                              জমা নিন
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`${mem.n} সদস্যকে তালিকা থেকে বাদ দিতে চান?`)) {
                                onUpdateAppState((prev) => ({
                                  ...prev,
                                  ppl: prev.ppl.filter((p) => p.id !== mem.id)
                                }));
                              }
                            }}
                            className="p-1 rounded text-rose-500 hover:text-rose-700"
                            title="মুছে ফেলুন"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    )}

      {/* MAKTAB STUDENT FEES & DUES (মক্তবের ছাত্র/ছাত্রীদের বেতন ও বকেয়া পাওনা) */}
      {activeSubTab === 'maktab' && (
        <MaktabFeeSection
          appState={appState}
          onUpdateAppState={onUpdateAppState}
          language={language}
        />
      )}

      {/* PLEDGES & PADDY (ওয়াদা ও ধান) */}
      {activeSubTab === 'pl' && (
        <div className="space-y-4">
          {/* Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">নগদ ওয়াদা বাকি</span>
              <div className="text-lg font-bold font-mono text-rose-600 mt-1">
                {f(
                  appState.pl
                    .filter((p) => p.ty === 'cash')
                    .reduce((s, p) => s + Math.max(0, p.q - p.got), 0)
                )}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">ধান আদায় হয়েছে</span>
              <div className="text-lg font-bold font-mono text-emerald-600 mt-1">
                {toBengaliNumerals(paddyStats.receivedMon.toFixed(1))} মণ
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">বর্তমান ধান মজুদ</span>
              <div className="text-lg font-bold font-mono text-amber-600 mt-1">
                {toBengaliNumerals(paddyStats.stockMon.toFixed(1))} মণ
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">ধান বিক্রি থেকে আয়</span>
              <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-1">
                {f(paddyStats.totalSaleTaka)}
              </div>
            </div>
          </div>

          {/* New Pledge Form */}
          <form onSubmit={handleSavePledge} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Wheat className="w-5 h-5 text-amber-600" />
              <span>নতুন ওয়াদা / প্রতিশ্রুতি এন্ট্রি</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">দাতার নাম*:</span>
                <input
                  type="text"
                  required
                  value={plName}
                  onChange={(e) => setPlName(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">ঠিকানা:</span>
                <input
                  type="text"
                  value={plAddress}
                  onChange={(e) => setPlAddress(e.target.value)}
                  placeholder="গ্রাম বা এলাকা"
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">মোবাইল নম্বর:</span>
                <input
                  type="tel"
                  value={plPhone}
                  onChange={(e) => setPlPhone(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">ওয়াদার ধরন:</span>
                <select
                  value={plType}
                  onChange={(e) => setPlType(e.target.value as 'cash' | 'dhan')}
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="cash">নগদ টাকা (৳)</option>
                  <option value="dhan">ধান (ফসল)</option>
                </select>
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">
                  পরিমাণ ({plType === 'cash' ? 'টাকা' : 'ধান'})*:
                </span>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  required
                  value={plQty}
                  onChange={(e) => setPlQty(Number(e.target.value) || '')}
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </label>

              {plType === 'dhan' && (
                <label>
                  <span className="font-semibold text-slate-600 dark:text-slate-400">একক:</span>
                  <select
                    value={plUnit}
                    onChange={(e) => setPlUnit(e.target.value as 'মণ' | 'কেজি')}
                    className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="মণ">মণ (৪০ কেজি)</option>
                    <option value="কেজি">কেজি</option>
                  </select>
                </label>
              )}

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">কোন কাজে দেবেন (উদ্দেশ্য):</span>
                <input
                  type="text"
                  value={plPurpose}
                  onChange={(e) => setPlPurpose(e.target.value)}
                  placeholder="যেমন: দ্বিতীয় তলা, ওযুখানা বা সাধারণ"
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">দেওয়ার সম্ভাব্য তারিখ:</span>
                <input
                  type="date"
                  value={plDate}
                  onChange={(e) => setPlDate(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">মন্তব্য:</span>
                <input
                  type="text"
                  value={plNote}
                  onChange={(e) => setPlNote(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-3 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition"
            >
              সংরক্ষণ করুন
            </button>
          </form>

          {/* Paddy Inventory & Sale Box (from attached file) */}
          <form onSubmit={handleAddPaddySale} className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 dark:bg-slate-900 border border-amber-200 dark:border-amber-900/40 shadow-xs space-y-3">
            <h3 className="text-base font-bold text-amber-950 dark:text-amber-300 flex items-center gap-2">
              <Wheat className="w-5 h-5 text-amber-600" />
              <span>ধান বিক্রি ও বিক্রয়লব্ধ টাকা আয়ে জমা</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              <label>
                <span className="font-semibold text-slate-700 dark:text-slate-300">তারিখ:</span>
                <input
                  type="date"
                  value={saleDate}
                  onChange={(e) => setSaleDate(e.target.value)}
                  className="mt-1 w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-700 dark:text-slate-300">বিক্রির পরিমাণ:</span>
                <div className="flex gap-1 mt-1">
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    required
                    value={saleQty}
                    onChange={(e) => setSaleQty(Number(e.target.value) || '')}
                    className="w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                  />
                  <select
                    value={saleUnit}
                    onChange={(e) => setSaleUnit(e.target.value as 'মণ' | 'কেজি')}
                    className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="মণ">মণ</option>
                    <option value="কেজি">কেজি</option>
                  </select>
                </div>
              </label>

              <label>
                <span className="font-semibold text-slate-700 dark:text-slate-300">মণ প্রতি দর (টাকা)*:</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={saleRate}
                  onChange={(e) => setSaleRate(Number(e.target.value) || '')}
                  placeholder="যেমন: ১৩৫০"
                  className="mt-1 w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-700 dark:text-slate-300">ক্রেতা / মিলের নাম:</span>
                <input
                  type="text"
                  value={saleBuyer}
                  onChange={(e) => setSaleBuyer(e.target.value)}
                  placeholder="ক্রেতার নাম"
                  className="mt-1 w-full p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition"
            >
              ধান বিক্রি সংরক্ষণ (টাকা স্বয়ংক্রিয় আয়ে যোগ হবে)
            </button>
          </form>

          {/* Pledge Table */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              ওয়াদাকারীদের তালিকা ({toBengaliNumerals(appState.pl.length)} জন)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-2.5 px-2">নাম ও ঠিকানা</th>
                    <th className="py-2.5 px-2">ওয়াদার পরিমাণ</th>
                    <th className="py-2.5 px-2">উদ্দেশ্য / তারিখ</th>
                    <th className="py-2.5 px-2 text-right">আদায় হয়েছে</th>
                    <th className="py-2.5 px-2 text-center">অবস্থা</th>
                    <th className="py-2.5 px-2 text-right">আদায় গ্রহণ / কাজ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {appState.pl.map((pl) => {
                    const isFulfilled = pl.got >= pl.q;
                    return (
                      <tr key={pl.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                        <td className="py-2.5 px-2">
                          <div className="font-bold text-slate-900 dark:text-white">{pl.n}</div>
                          <div className="text-[11px] text-slate-400">
                            {pl.ad} {pl.ph && `• ${pl.ph}`}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 font-mono font-bold">
                          {pl.ty === 'cash' ? f(pl.q) : `${toBengaliNumerals(pl.q)} ${pl.u} ধান`}
                        </td>
                        <td className="py-2.5 px-2 text-slate-600 dark:text-slate-400">
                          <div>{pl.pur}</div>
                          {pl.dt && <div className="text-[11px] font-mono opacity-80">{pl.dt}</div>}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-600">
                          {pl.ty === 'cash' ? f(pl.got) : `${toBengaliNumerals(pl.got)} ${pl.u}`}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          {isFulfilled ? (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-[10px]">
                              সম্পূর্ণ আদায়
                            </span>
                          ) : pl.got > 0 ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold text-[10px]">
                              আংশিক
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 font-medium text-[10px]">
                              অপেক্ষমাণ
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-right space-x-1">
                          {!isFulfilled && (
                            <button
                              onClick={() => {
                                const input = prompt(`কত আদায় হয়েছে দিন (${pl.ty === 'cash' ? 'টাকা' : pl.u}):`, String(pl.q - pl.got));
                                if (input && Number(input) > 0) {
                                  handleRecvPledge(pl, Number(input));
                                }
                              }}
                              className="px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                            >
                              জমা নিন
                            </button>
                          )}
                          <button
                            onClick={() => {
                              if (confirm(`${pl.n} এর ওয়াদা মুছে ফেলতে চান?`)) {
                                onUpdateAppState((prev) => ({
                                  ...prev,
                                  pl: prev.pl.filter((p) => p.id !== pl.id)
                                }));
                              }
                            }}
                            className="p-1 rounded text-rose-500 hover:text-rose-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DEVELOPMENT CALCULATOR (উন্নয়ন পরিকল্পনা) */}
      {activeSubTab === 'plan' && (
        <div className="space-y-4">
          {/* Add Plan Form */}
          <form onSubmit={handleAddPlanItem} className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              <span>ভবিষ্যৎ উন্নয়ন পরিকল্পনা ও প্রাক্কলিত খরচ</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">কাজের নাম*:</span>
                <input
                  type="text"
                  required
                  value={planName}
                  onChange={(e) => setPlanName(e.target.value)}
                  placeholder="যেমন: দ্বিতীয় তলার ছাদ, ওযুখানা, টাইলস"
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">পরিমাণ:</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={planQty}
                  onChange={(e) => setPlanQty(Number(e.target.value) || 1)}
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </label>

              <label>
                <span className="font-semibold text-slate-600 dark:text-slate-400">একক দর (টাকা)*:</span>
                <input
                  type="number"
                  min="1"
                  required
                  value={planRate}
                  onChange={(e) => setPlanRate(Number(e.target.value) || '')}
                  placeholder="৳"
                  className="mt-1 w-full p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                />
              </label>
            </div>

            <button
              type="submit"
              className="mt-3 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition"
            >
              যোগ করুন
            </button>
          </form>

          {/* Plan items table */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-2.5 px-2">কাজের বিবরণ</th>
                    <th className="py-2.5 px-2 text-right">পরিমাণ</th>
                    <th className="py-2.5 px-2 text-right">দর</th>
                    <th className="py-2.5 px-2 text-right">মোট সম্ভাব্য খরচ</th>
                    <th className="py-2.5 px-2 text-right">পদক্ষেপ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {appState.plan.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-2.5 px-2 font-bold text-slate-900 dark:text-white">{item.n}</td>
                      <td className="py-2.5 px-2 text-right font-mono">{toBengaliNumerals(item.q)}</td>
                      <td className="py-2.5 px-2 text-right font-mono">{f(item.r)}</td>
                      <td className="py-2.5 px-2 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {f(item.q * item.r)}
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <button
                          onClick={() => {
                            onUpdateAppState((prev) => ({
                              ...prev,
                              plan: prev.plan.filter((p) => p.id !== item.id)
                            }));
                          }}
                          className="p-1 rounded text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Deficit / Surplus Calculation */}
            {(() => {
              const totalRequired = appState.plan.reduce((s, p) => s + p.q * p.r, 0);
              const availableFund = balance.total;
              const diff = totalRequired - availableFund;
              const pendingCashPledge = appState.pl
                .filter((p) => p.ty === 'cash')
                .reduce((s, p) => s + Math.max(0, p.q - p.got), 0);
              const memberCount = appState.ppl.length || appState.mem || 1;
              const perHeadShare = diff > 0 ? Math.ceil(diff / memberCount) : 0;

              return (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-500">মোট প্রয়োজনীয় খরচ</span>
                      <div className="text-xl font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                        {f(totalRequired)}
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-500">বর্তমান মোট তহবিল</span>
                      <div className="text-xl font-bold font-mono text-emerald-600 mt-0.5">
                        {f(availableFund)}
                      </div>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-xs text-slate-500">{diff > 0 ? 'ঘাটতি তহবিল' : 'উদ্বৃত্ত তহবিল'}</span>
                      <div className={`text-xl font-bold font-mono mt-0.5 ${diff > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {f(Math.abs(diff))}
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    ওয়াদাকৃত বাকি নগদ: <strong>{f(pendingCashPledge)}</strong> — আদায় হলে{' '}
                    {diff - pendingCashPledge > 0
                      ? `ঘাটতি থাকবে ${f(diff - pendingCashPledge)}`
                      : 'ঘাটতি সম্পূর্ণ পূরণ হবে, আলহামদুলিল্লাহ!'}
                  </p>

                  {diff > 0 && memberCount > 0 && (
                    <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-900 dark:text-emerald-200">
                      মোট {toBengaliNumerals(memberCount)} জন নিয়মিত দাতা/সদস্যের মাঝে ভাগ করলে জনপ্রতি প্রায়{' '}
                      <strong>{f(perHeadShare)}</strong> দিলে এই ঘাটতি পূরণ সম্ভব হবে।
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* FULL REPORTS (রিপোর্ট) */}
      {activeSubTab === 'rep' && (
        <div className="space-y-4">
          {/* Monthly Printable PDF Summary Generator UI Component */}
          <MonthlyPDFSummaryGenerator
            appState={appState}
            language={language}
            onOpenPDFModal={(m) => {
              setReportMonth(m);
              setIsPDFModalOpen(true);
            }}
          />

          {/* Annual Summary View & YoY Growth comparison in Reports */}
          <AnnualFinancialSummaryView appState={appState} language={language} />

          {/* Visual Summary Section using Recharts in Reports */}
          <MosqueFinancialVisualSummary appState={appState} balance={balance} />

          {/* Category breakdown tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Income breakdown */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h4 className="font-bold text-sm text-emerald-700 dark:text-emerald-400 mb-2">
                আয়ের খাতওয়ারি বিবরণ ({reportMonth})
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(() => {
                      const mi = appState.tx.filter((t) => t.type === 'in' && t.date.startsWith(reportMonth));
                      const byCat: Record<string, number> = {};
                      mi.forEach((t) => {
                        byCat[t.cat] = (byCat[t.cat] || 0) + Number(t.amt);
                      });
                      const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
                      if (!entries.length) {
                        return <tr><td colSpan={2} className="py-4 text-center text-slate-400">কোনো তথ্য নেই</td></tr>;
                      }
                      return entries.map(([cat, amt]) => (
                        <tr key={cat}>
                          <td className="py-2 text-slate-800 dark:text-slate-200">{cat}</td>
                          <td className="py-2 text-right font-mono font-bold text-emerald-600">{f(amt)}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expense breakdown */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <h4 className="font-bold text-sm text-rose-700 dark:text-rose-400 mb-2">
                খরচের খাতওয়ারি বিবরণ (বেতন, বিল, উন্নয়ন ইত্যাদি)
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(() => {
                      const mo = appState.tx.filter((t) => t.type === 'out' && t.date.startsWith(reportMonth));
                      const byCat: Record<string, number> = {};
                      mo.forEach((t) => {
                        byCat[t.cat] = (byCat[t.cat] || 0) + Number(t.amt);
                      });
                      const entries = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
                      if (!entries.length) {
                        return <tr><td colSpan={2} className="py-4 text-center text-slate-400">কোনো তথ্য নেই</td></tr>;
                      }
                      return entries.map(([cat, amt]) => (
                        <tr key={cat}>
                          <td className="py-2 text-slate-800 dark:text-slate-200">{cat}</td>
                          <td className="py-2 text-right font-mono font-bold text-rose-600">{f(amt)}</td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Top Donors Lifetime */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-2">
              সর্বোচ্চ দানকারীদের তালিকা (সর্বমোট অনুদান)
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                    <th className="py-2 px-2">দাতা / প্রতিষ্ঠানের নাম</th>
                    <th className="py-2 px-2 text-right">মোট অনুদান</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(() => {
                    const donors: Record<string, number> = {};
                    appState.tx
                      .filter((t) => t.type === 'in' && t.name)
                      .forEach((t) => {
                        donors[t.name] = (donors[t.name] || 0) + Number(t.amt);
                      });
                    const sorted = Object.entries(donors).sort((a, b) => b[1] - a[1]).slice(0, 10);
                    if (!sorted.length) return <tr><td colSpan={2} className="py-3 text-center text-slate-400">তথ্য নেই</td></tr>;
                    return sorted.map(([name, amt]) => (
                      <tr key={name} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-2 font-semibold text-slate-800 dark:text-slate-200">{name}</td>
                        <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-600">{f(amt)}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>

          {/* Copyable Text Report for WhatsApp/SMS from attached file */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Copy className="w-4 h-4 text-emerald-600" />
              <span>টেক্সট রিপোর্ট (কপি করে মেসেঞ্জার/হোয়াটসঅ্যাপে শেয়ারের জন্য)</span>
            </h4>
            <p className="text-xs text-slate-500">
              নিচের বাটনে চাপ দিলে বর্তমান নির্বাচিত মাসের পূর্ণাঙ্গ হিসাব কপি হয়ে যাবে।
            </p>
            <button
              onClick={generateTextReport}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition"
            >
              <Copy className="w-4 h-4" />
              <span>{textReportCopied ? 'কপি সম্পন্ন হয়েছে ✓' : 'রিপোর্ট টেক্সট কপি করুন'}</span>
            </button>
          </div>
        </div>
      )}

      {/* PDF Summary Report Modal */}
      <MosquePDFReportModal
        isOpen={isPDFModalOpen}
        onClose={() => setIsPDFModalOpen(false)}
        appState={appState}
        language={language}
        selectedMonthStr={reportMonth}
        onMonthChange={setReportMonth}
      />

      {/* Developer credit from attached file */}
      <div className="text-center py-4 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 space-y-0.5">
        <div>
          মসজিদ হিসাবঘর অ্যাপ তৈরি করেছেন (Developed by): <strong className="text-slate-800 dark:text-slate-200">Md Moddasel Hoque</strong>
        </div>
        <div>
          মোবাইল (Cell): <strong className="text-slate-800 dark:text-slate-200">01914393139</strong>
        </div>
      </div>
    </div>
  );
};
