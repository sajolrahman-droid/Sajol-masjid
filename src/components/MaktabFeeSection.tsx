import React, { useState, useMemo } from 'react';
import {
  GraduationCap,
  Plus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  PhoneCall,
  Download,
  Copy,
  Receipt,
  Trash2,
  Edit3,
  MessageSquare,
  DollarSign,
  ChevronRight,
  Filter,
  UserCheck,
  UserX,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  X,
  Printer
} from 'lucide-react';
import {
  AppStateData,
  MaktabStudent,
  MaktabFeePayment,
  MosqueTransaction,
  Language
} from '../types/mosque';
import { toBengaliNumerals } from '../utils/prayerCalculator';

interface MaktabFeeSectionProps {
  appState: AppStateData;
  onUpdateAppState: (updater: (prev: AppStateData) => AppStateData) => void;
  language: Language;
}

export const MaktabFeeSection: React.FC<MaktabFeeSectionProps> = ({
  appState,
  onUpdateAppState,
  language
}) => {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthStr);
  const [filterStatus, setFilterStatus] = useState<'all' | 'due' | 'paid' | 'partial'>('all');
  const [filterClass, setFilterClass] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isCollectFeeOpen, setIsCollectFeeOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isDueReportModalOpen, setIsDueReportModalOpen] = useState(false);
  const [selectedStudentForAction, setSelectedStudentForAction] = useState<MaktabStudent | null>(null);
  const [selectedPaymentForReceipt, setSelectedPaymentForReceipt] = useState<MaktabFeePayment | null>(null);
  const [editingStudent, setEditingStudent] = useState<MaktabStudent | null>(null);

  // Student Form State
  const [studentName, setStudentName] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [studentPhone, setStudentPhone] = useState('');
  const [studentRoll, setStudentRoll] = useState('');
  const [studentClass, setStudentClass] = useState('কায়েদা');
  const [studentFee, setStudentFee] = useState<number | ''>(500);
  const [studentAdmissionDate, setStudentAdmissionDate] = useState(new Date().toISOString().slice(0, 10));
  const [studentNote, setStudentNote] = useState('');

  // Collect Fee Form State
  const [payAmount, setPayAmount] = useState<number | ''>('');
  const [payDiscount, setPayDiscount] = useState<number | ''>(0);
  const [payAcc, setPayAcc] = useState<'cash' | 'bank'>('cash');
  const [payDate, setPayDate] = useState(new Date().toISOString().slice(0, 10));
  const [payReceiptNo, setPayReceiptNo] = useState('');
  const [payCollector, setPayCollector] = useState('ইমাম সাহেব');
  const [payNote, setPayNote] = useState('');

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const students: MaktabStudent[] = useMemo(() => {
    return Array.isArray(appState.maktabStudents) ? appState.maktabStudents : [];
  }, [appState.maktabStudents]);

  const payments: MaktabFeePayment[] = useMemo(() => {
    return Array.isArray(appState.maktabPayments) ? appState.maktabPayments : [];
  }, [appState.maktabPayments]);

  const f = (n: number) => `৳ ${(Number(n) || 0).toLocaleString('bn-BD')}`;

  // Month Display in Bengali
  const formatMonthBengali = (mStr: string) => {
    try {
      const [year, month] = mStr.split('-');
      const monthNames = [
        'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
        'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
      ];
      const mIdx = parseInt(month, 10) - 1;
      return `${monthNames[mIdx] || ''} ${toBengaliNumerals(year)}`;
    } catch {
      return mStr;
    }
  };

  // Student calculation for selected month
  const studentMetrics = useMemo(() => {
    return students.map((st) => {
      // payments for this student in selected month
      const monthPayments = payments.filter(
        (p) => p.studentId === st.id && p.month === selectedMonth
      );
      const paid = monthPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
      const discount = monthPayments.reduce((acc, p) => acc + (Number(p.waiverDiscount) || 0), 0);
      const due = Math.max(0, st.monthlyFee - discount - paid);

      let status: 'paid' | 'due' | 'partial' = 'due';
      if (paid >= st.monthlyFee - discount) {
        status = 'paid';
      } else if (paid > 0) {
        status = 'partial';
      }

      // all-time total paid
      const allPayments = payments.filter((p) => p.studentId === st.id);
      const allTimePaid = allPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

      return {
        student: st,
        paid,
        discount,
        due,
        status,
        monthPayments,
        allTimePaid
      };
    });
  }, [students, payments, selectedMonth]);

  // Overall KPI aggregates
  const totalActiveStudents = useMemo(() => {
    return students.filter((s) => s.status === 'active').length;
  }, [students]);

  const totalMonthlyFeeDemand = useMemo(() => {
    return students
      .filter((s) => s.status === 'active')
      .reduce((sum, s) => sum + (Number(s.monthlyFee) || 0), 0);
  }, [students]);

  const totalCollectedThisMonth = useMemo(() => {
    return studentMetrics.reduce((sum, m) => sum + m.paid, 0);
  }, [studentMetrics]);

  const totalDueThisMonth = useMemo(() => {
    return studentMetrics
      .filter((m) => m.student.status === 'active')
      .reduce((sum, m) => sum + m.due, 0);
  }, [studentMetrics]);

  const dueStudentsCount = useMemo(() => {
    return studentMetrics.filter((m) => m.student.status === 'active' && m.due > 0).length;
  }, [studentMetrics]);

  const paidStudentsCount = useMemo(() => {
    return studentMetrics.filter((m) => m.student.status === 'active' && m.status === 'paid').length;
  }, [studentMetrics]);

  const partialStudentsCount = useMemo(() => {
    return studentMetrics.filter((m) => m.student.status === 'active' && m.status === 'partial').length;
  }, [studentMetrics]);

  // Filtered List
  const filteredMetrics = useMemo(() => {
    return studentMetrics.filter((item) => {
      const { student, status } = item;

      // Status filter
      if (filterStatus === 'due' && item.due <= 0) return false;
      if (filterStatus === 'paid' && status !== 'paid') return false;
      if (filterStatus === 'partial' && status !== 'partial') return false;

      // Class filter
      if (filterClass !== 'all' && student.classLevel !== filterClass) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = student.name.toLowerCase().includes(q);
        const matchGuardian = student.guardianName.toLowerCase().includes(q);
        const matchRoll = student.roll.toLowerCase().includes(q);
        const matchPhone = student.phone.includes(q);
        const matchClass = student.classLevel.toLowerCase().includes(q);
        if (!matchName && !matchGuardian && !matchRoll && !matchPhone && !matchClass) {
          return false;
        }
      }

      return true;
    });
  }, [studentMetrics, filterStatus, filterClass, searchQuery]);

  // Open Collect Fee Form
  const handleOpenCollectFee = (student: MaktabStudent, currentDue: number) => {
    setSelectedStudentForAction(student);
    setPayAmount(currentDue > 0 ? currentDue : student.monthlyFee);
    setPayDiscount(0);
    setPayAcc('cash');
    setPayDate(new Date().toISOString().slice(0, 10));
    setPayReceiptNo(`MKT-${Date.now().toString().slice(-4)}`);
    setPayCollector('ইমাম সাহেব');
    setPayNote(`মক্তবের মাসিক বেতন আদায় (${formatMonthBengali(selectedMonth)})`);
    setIsCollectFeeOpen(true);
  };

  // Submit Collect Fee
  const handleSubmitCollectFee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForAction) return;

    const amt = Number(payAmount);
    if (!amt || amt <= 0) {
      showToast('অনুগ্রহ করে সঠিক টাকার পরিমাণ দিন');
      return;
    }

    const discount = Number(payDiscount) || 0;
    const paymentId = Date.now();
    const txId = paymentId + 1;

    const newPayment: MaktabFeePayment = {
      id: paymentId,
      studentId: selectedStudentForAction.id,
      studentName: selectedStudentForAction.name,
      month: selectedMonth,
      amount: amt,
      waiverDiscount: discount,
      paidDate: payDate || new Date().toISOString().slice(0, 10),
      acc: payAcc,
      receiptNo: payReceiptNo.trim() || `MKT-${paymentId.toString().slice(-4)}`,
      collectedBy: payCollector.trim(),
      note: payNote.trim() || `${formatMonthBengali(selectedMonth)} এর বেতন`,
      txId
    };

    // Also create incoming MosqueTransaction to sync with Treasury!
    const newTx: MosqueTransaction = {
      id: txId,
      type: 'in',
      date: payDate || new Date().toISOString().slice(0, 10),
      cat: 'মক্তবের বেতন/ফি',
      name: `${selectedStudentForAction.name} (মক্তব)`,
      amt,
      acc: payAcc,
      note: `মক্তব বেতন (${formatMonthBengali(selectedMonth)}) - মেমো নং: ${newPayment.receiptNo}`
    };

    onUpdateAppState((prev) => ({
      ...prev,
      maktabPayments: [newPayment, ...(prev.maktabPayments || [])],
      tx: [newTx, ...prev.tx]
    }));

    setIsCollectFeeOpen(false);
    setSelectedPaymentForReceipt(newPayment);
    showToast(`✅ ${selectedStudentForAction.name}-এর ${f(amt)} বেতন সফলভাবে জমা ও তহবিলে যুক্ত হয়েছে!`);
  };

  // Handle Save New or Edited Student
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      showToast('শিক্ষার্থীর নাম আবশ্যক');
      return;
    }

    const fee = Number(studentFee);
    if (isNaN(fee) || fee < 0) {
      showToast('সঠিক বেতন নির্ধারণ করুন');
      return;
    }

    if (editingStudent) {
      // Edit
      onUpdateAppState((prev) => ({
        ...prev,
        maktabStudents: (prev.maktabStudents || []).map((s) =>
          s.id === editingStudent.id
            ? {
                ...s,
                name: studentName.trim(),
                guardianName: guardianName.trim(),
                phone: studentPhone.trim(),
                roll: studentRoll.trim() || s.roll,
                classLevel: studentClass,
                monthlyFee: fee,
                note: studentNote.trim()
              }
            : s
        )
      }));
      showToast('শিক্ষার্থীর তথ্য আপডেট করা হয়েছে');
    } else {
      // Add new
      const nextRoll = studentRoll.trim() || toBengaliNumerals((students.length + 1).toString().padStart(2, '0'));
      const newStudent: MaktabStudent = {
        id: Date.now(),
        name: studentName.trim(),
        guardianName: guardianName.trim(),
        phone: studentPhone.trim(),
        roll: nextRoll,
        classLevel: studentClass,
        monthlyFee: fee,
        admissionDate: studentAdmissionDate || new Date().toISOString().slice(0, 10),
        status: 'active',
        note: studentNote.trim()
      };

      onUpdateAppState((prev) => ({
        ...prev,
        maktabStudents: [...(prev.maktabStudents || []), newStudent]
      }));
      showToast('নতুন শিক্ষার্থী সফলভাবে নিবন্ধিত হয়েছে');
    }

    // Reset Form
    setIsAddStudentOpen(false);
    setEditingStudent(null);
    setStudentName('');
    setGuardianName('');
    setStudentPhone('');
    setStudentRoll('');
    setStudentClass('কায়েদা');
    setStudentFee(500);
    setStudentNote('');
  };

  // Delete Student
  const handleDeleteStudent = (student: MaktabStudent) => {
    if (confirm(`আপনি কি নিশ্চিতভাবে "${student.name}" শিক্ষার্থীকে তালিকা থেকে মুছে ফেলতে চান?`)) {
      onUpdateAppState((prev) => ({
        ...prev,
        maktabStudents: (prev.maktabStudents || []).filter((s) => s.id !== student.id)
      }));
      showToast('শিক্ষার্থী মুছে ফেলা হয়েছে');
    }
  };

  // Delete Payment Record
  const handleDeletePayment = (payment: MaktabFeePayment) => {
    if (confirm(`রশিদ নং ${payment.receiptNo} (${payment.studentName}-এর ${f(payment.amount)}) ডিলিট করতে চান? সংশ্লিষ্ট মসজিদ ক্যাশ ট্রানজেকশনও মুছে যাবে।`)) {
      onUpdateAppState((prev) => ({
        ...prev,
        maktabPayments: (prev.maktabPayments || []).filter((p) => p.id !== payment.id),
        tx: payment.txId ? prev.tx.filter((t) => t.id !== payment.txId) : prev.tx
      }));
      showToast('বেতন জমার এন্ট্রি মুছে ফেলা হয়েছে');
    }
  };

  // Start Edit Student
  const handleStartEdit = (student: MaktabStudent) => {
    setEditingStudent(student);
    setStudentName(student.name);
    setGuardianName(student.guardianName);
    setStudentPhone(student.phone);
    setStudentRoll(student.roll);
    setStudentClass(student.classLevel);
    setStudentFee(student.monthlyFee);
    setStudentAdmissionDate(student.admissionDate);
    setStudentNote(student.note || '');
    setIsAddStudentOpen(true);
  };

  // Copy Reminder SMS text for a student with dues
  const handleCopyDueSMS = (st: MaktabStudent, due: number) => {
    const text = `আসসালামু আলাইকুম। সম্মানিত অভিভাবক, ${appState.name} মক্তব ও নূরানী মাদ্রাসায় আপনার সন্তান ${st.name} (রোল: ${toBengaliNumerals(st.roll)}, শ্রেণি: ${st.classLevel})-এর ${formatMonthBengali(selectedMonth)} মাসের ধার্যকৃত বেতন ${f(due)} বকেয়া রয়েছে।\n\nঅনুগ্রহ করে মক্তবের শিক্ষক অথবা মসজিদ কোষাধ্যক্ষের নিকট বেতন পরিশোধ করার জন্য বিনীত অনুরোধ জানানো হলো।\nজাযাকাল্লাহু খাইরান।\n— মক্তব পরিচালনা ও মসজিদ কমিটি`;
    navigator.clipboard.writeText(text);
    showToast(`📱 ${st.name}-এর অভিভাবকের তাগিদ মেসেজ কপি হয়েছে!`);
  };

  // Copy Complete Dues Report for WhatsApp/SMS
  const handleCopyAllDuesReport = () => {
    const dueList = studentMetrics.filter((m) => m.student.status === 'active' && m.due > 0);
    if (!dueList.length) {
      showToast('কোনো বকেয়া শিক্ষার্থী নেই! আলহামদুলিল্লাহ।');
      return;
    }

    let report = `🕌 ${appState.name}\n📚 মক্তব ও নূরানী মাদ্রাসা — বকেয়া বেতনের বিবরণী\n📅 মাস: ${formatMonthBengali(selectedMonth)}\n\n`;
    report += `মোট বকেয়া শিক্ষার্থী: ${toBengaliNumerals(dueList.length)} জন\n`;
    report += `সর্বমোট বকেয়া পাওনা: ${f(totalDueThisMonth)}\n`;
    report += `─────────────────────\n`;

    dueList.forEach((m, idx) => {
      report += `${toBengaliNumerals(idx + 1)}. ${m.student.name} (রোল: ${toBengaliNumerals(m.student.roll)}, শ্রেণি: ${m.student.classLevel})\n`;
      report += `   • পিতা/অভিভাবক: ${m.student.guardianName || 'অনির্দিষ্ট'}\n`;
      report += `   • বকেয়া পরিমাণ: ${f(m.due)}\n`;
      if (m.student.phone) {
        report += `   • যোগাযোগ: ${m.student.phone}\n`;
      }
      report += `\n`;
    });

    report += `হিসাব প্রস্তুত: কোষাধ্যক্ষ ও মক্তব পরিচালনা কমিটি`;

    navigator.clipboard.writeText(report);
    showToast('বকেয়া তালিকার পূর্ণাঙ্গ রিপোর্ট কপি হয়েছে!');
  };

  const CLASSES_LIST = ['কায়েদা', 'আমপারা', 'নাজেরা', 'হিফজ বিভাগ', 'কুরআন শিক্ষা', 'সাধারণ'];

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white dark:bg-purple-950 dark:border dark:border-purple-700 px-4 py-2.5 rounded-full text-xs font-semibold shadow-2xl animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Top Banner & Month Selector */}
      <div className="bg-gradient-to-br from-purple-800 via-indigo-900 to-slate-950 text-white rounded-3xl p-5 sm:p-6 shadow-lg border border-purple-700/40 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-10 -mt-10 w-44 h-44 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-2xl bg-white/10 text-purple-200 border border-white/15">
                <GraduationCap className="w-5 h-5" />
              </span>
              <span className="text-xs uppercase tracking-wider font-extrabold text-purple-300">
                মক্তব ও মাদ্রাসা হিসাব বিভাগ
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              শিক্ষার্থীদের মাসিক বেতন ও বকেয়া পাওনা হিসাব
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80 max-w-xl">
              মক্তবের শিক্ষার্থীদের তালিকা, মাসিক ফি আদায়, রশিদ ইস্যু এবং বকেয়া পাওনার পূর্ণাঙ্গ পর্যবেক্ষণ
            </p>
          </div>

          {/* Action buttons & Month Picker */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Month Picker */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-2xl border border-white/15 backdrop-blur-xs">
              <Calendar className="w-4 h-4 text-purple-300 shrink-0" />
              <div className="text-left">
                <div className="text-[10px] text-purple-200 font-medium">হিসাবের মাস:</div>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="bg-transparent text-white font-bold text-xs focus:outline-none cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Add Student Button */}
            <button
              onClick={() => {
                setEditingStudent(null);
                setStudentName('');
                setGuardianName('');
                setStudentPhone('');
                setStudentRoll('');
                setStudentClass('কায়েদা');
                setStudentFee(500);
                setStudentNote('');
                setIsAddStudentOpen(true);
              }}
              className="px-4 py-2.5 rounded-2xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>নতুন শিক্ষার্থী ভর্তি</span>
            </button>

            {/* Full Due Report Button */}
            <button
              onClick={handleCopyAllDuesReport}
              className="px-3.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs border border-white/20 transition flex items-center gap-1.5"
              title="বকেয়া শিক্ষার্থীদের তালিকা টেক্সট আকারে কপি করুন"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>বকেয়া তালিকা কপি</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Students */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              মোট সক্রিয় শিক্ষার্থী
            </span>
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
              {toBengaliNumerals(totalActiveStudents)} <span className="text-sm font-sans font-normal text-slate-500">জন</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              পরিশোধিত: {toBengaliNumerals(paidStudentsCount)} | বকেয়া: {toBengaliNumerals(dueStudentsCount)}
            </div>
          </div>
        </div>

        {/* Total Monthly Demand */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {formatMonthBengali(selectedMonth)} এর মোট দাবি
            </span>
            <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <DollarSign className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-700 dark:text-indigo-400">
              {f(totalMonthlyFeeDemand)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              ধার্যকৃত মাসিক বেতনের মোট যোগফল
            </div>
          </div>
        </div>

        {/* Collected this month */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              চলতি মাসে আদায়কৃত বেতন
            </span>
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400">
              {f(totalCollectedThisMonth)}
            </div>
            <div className="text-[11px] text-emerald-600 font-semibold mt-1">
              {totalMonthlyFeeDemand > 0
                ? `${toBengaliNumerals(Math.round((totalCollectedThisMonth / totalMonthlyFeeDemand) * 100))}% আদায় সম্পন্ন`
                : 'তহবিলে জমা হয়েছে'}
            </div>
          </div>
        </div>

        {/* Total Dues for Month */}
        <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
              চলতি মাসের বকেয়া পাওনা
            </span>
            <span className="p-2 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl sm:text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
              {f(totalDueThisMonth)}
            </div>
            <div className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1">
              বকেয়া রয়েছে: {toBengaliNumerals(dueStudentsCount)} জন শিক্ষার্থীর
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tab buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {[
              { id: 'all', label: 'সব শিক্ষার্থী', count: totalActiveStudents },
              { id: 'due', label: 'বকেয়া আছে', count: dueStudentsCount, alert: true },
              { id: 'partial', label: 'আংশিক জমা', count: partialStudentsCount },
              { id: 'paid', label: 'পরিশোধিত', count: paidStudentsCount, success: true }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id as typeof filterStatus)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                  filterStatus === tab.id
                    ? tab.alert
                      ? 'bg-rose-600 text-white'
                      : tab.success
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-600 text-white'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  filterStatus === tab.id
                    ? 'bg-white/30 text-white'
                    : tab.alert
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}>
                  {toBengaliNumerals(tab.count)}
                </span>
              </button>
            ))}
          </div>

          {/* Search & Class Dropdown */}
          <div className="flex items-center gap-2">
            {/* Class filter */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none"
            >
              <option value="all">সকল বিভাগ</option>
              {CLASSES_LIST.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="নাম, রোল বা মোবাইল..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Students & Fee Status Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              {formatMonthBengali(selectedMonth)}-এর বেতন আদায় ও বকেয়ার বিবরণ
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              ({toBengaliNumerals(filteredMetrics.length)} জন শিক্ষার্থী)
            </span>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            ক্যাশ ও ব্যাংক তহবিলের সাথে স্বয়ংক্রিয়ভাবে সংযুক্ত
          </div>
        </div>

        {filteredMetrics.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm space-y-2">
            <BookOpen className="w-10 h-10 mx-auto opacity-30" />
            <p>কোনো শিক্ষার্থীর তথ্য পাওয়া যায়নি</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-purple-600 dark:text-purple-400 font-semibold underline"
              >
                ফিল্টার মুছুন
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 font-semibold">
                  <th className="py-3 px-3">রোল</th>
                  <th className="py-3 px-3">শিক্ষার্থী ও অভিভাবক</th>
                  <th className="py-3 px-3">শ্রেণি/বিভাগ</th>
                  <th className="py-3 px-3 text-right">মাসিক বেতন</th>
                  <th className="py-3 px-3 text-right">জমা হয়েছে</th>
                  <th className="py-3 px-3 text-right">বকেয়া পাওনা</th>
                  <th className="py-3 px-3 text-center">স্ট্যাটাস</th>
                  <th className="py-3 px-3 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredMetrics.map(({ student, paid, discount, due, status, monthPayments }) => (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    {/* Roll */}
                    <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                      {toBengaliNumerals(student.roll)}
                    </td>

                    {/* Name & Guardian */}
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{student.name}</span>
                        {student.note && (
                          <span className="text-[10px] text-slate-400 font-normal hidden sm:inline" title={student.note}>
                            • {student.note}
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>পিতা: {student.guardianName || 'অভিভাবক'}</span>
                        {student.phone && (
                          <a
                            href={`tel:${student.phone}`}
                            className="inline-flex items-center gap-0.5 text-blue-600 dark:text-blue-400 hover:underline"
                            title="কল করুন"
                          >
                            <PhoneCall className="w-2.5 h-2.5" />
                            <span>{student.phone}</span>
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Class badge */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60">
                        {student.classLevel}
                      </span>
                    </td>

                    {/* Monthly Fee */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                      {f(student.monthlyFee)}
                    </td>

                    {/* Paid */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {paid > 0 ? f(paid) : <span className="text-slate-400 font-normal">০ ৳</span>}
                      {discount > 0 && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400">
                          (ছাড়: {f(discount)})
                        </div>
                      )}
                    </td>

                    {/* Due */}
                    <td className="py-3 px-3 text-right font-mono font-black">
                      {due > 0 ? (
                        <span className="text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-900/50">
                          {f(due)}
                        </span>
                      ) : (
                        <span className="text-emerald-600 font-semibold">০ ৳</span>
                      )}
                    </td>

                    {/* Status Badge */}
                    <td className="py-3 px-3 text-center">
                      {status === 'paid' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>পরিশোধিত</span>
                        </span>
                      )}
                      {status === 'due' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                          <AlertCircle className="w-3 h-3" />
                          <span>বকেয়া</span>
                        </span>
                      )}
                      {status === 'partial' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                          <Clock className="w-3 h-3" />
                          <span>আংশিক</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        {/* Collect Fee Button */}
                        {due > 0 ? (
                          <button
                            onClick={() => handleOpenCollectFee(student, due)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs transition active:scale-95 flex items-center gap-1"
                            title="বেতন বা বকেয়া আদায় করুন"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>আদায় নিন</span>
                          </button>
                        ) : (
                          monthPayments.length > 0 && (
                            <button
                              onClick={() => {
                                setSelectedPaymentForReceipt(monthPayments[0]);
                                setIsReceiptModalOpen(true);
                              }}
                              className="px-2 py-1 rounded-lg bg-purple-100 hover:bg-purple-200 text-purple-800 dark:bg-purple-950 dark:text-purple-300 font-bold text-[11px] transition flex items-center gap-1"
                              title="পেমেন্ট রশিদ দেখুন"
                            >
                              <Receipt className="w-3 h-3" />
                              <span>রশিদ</span>
                            </button>
                          )
                        )}

                        {/* Reminder SMS button if due */}
                        {due > 0 && (
                          <button
                            onClick={() => handleCopyDueSMS(student, due)}
                            className="p-1 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                            title="অভিভাবকের কাছে পাঠানোর জন্য তাগিদ মেসেজ কপি করুন"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Edit Student */}
                        <button
                          onClick={() => handleStartEdit(student)}
                          className="p-1 rounded-lg text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="শিক্ষার্থীর তথ্য সম্পাদনা"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Student */}
                        <button
                          onClick={() => handleDeleteStudent(student)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="তালিকা থেকে বাদ দিন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Payments Ledger / Log */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Receipt className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              সাম্প্রতিক মক্তব ফি আদায়ের রসিদ ও ট্রানজেকশন খতিয়ান
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            মোট জমার ভাউচার: {toBengaliNumerals(payments.length)} টি
          </span>
        </div>

        {payments.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-4">এখনও কোনো বেতন জমা হয়নি</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-2.5 px-2">রশিদ নং</th>
                  <th className="py-2.5 px-2">তারিখ</th>
                  <th className="py-2.5 px-2">শিক্ষার্থীর নাম</th>
                  <th className="py-2.5 px-2">হিসাবের মাস</th>
                  <th className="py-2.5 px-2 text-right">পরিশোধিত টাকা</th>
                  <th className="py-2.5 px-2">তহবিল</th>
                  <th className="py-2.5 px-2">আদায়কারী</th>
                  <th className="py-2.5 px-2 text-right">পদক্ষেপ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.slice(0, 8).map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-2 px-2 font-mono font-bold text-purple-600 dark:text-purple-400">
                      {pay.receiptNo}
                    </td>
                    <td className="py-2 px-2 text-slate-500 font-mono">
                      {toBengaliNumerals(pay.paidDate)}
                    </td>
                    <td className="py-2 px-2 font-bold text-slate-900 dark:text-white">
                      {pay.studentName}
                    </td>
                    <td className="py-2 px-2 text-slate-600 dark:text-slate-300">
                      {formatMonthBengali(pay.month)}
                    </td>
                    <td className="py-2 px-2 text-right font-mono font-bold text-emerald-600">
                      {f(pay.amount)}
                    </td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        pay.acc === 'bank'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {pay.acc === 'bank' ? 'ব্যাংক' : 'নগদ'}
                      </span>
                    </td>
                    <td className="py-2 px-2 text-slate-500">
                      {pay.collectedBy || 'ইমাম সাহেব'}
                    </td>
                    <td className="py-2 px-2 text-right space-x-1">
                      <button
                        onClick={() => {
                          setSelectedPaymentForReceipt(pay);
                          setIsReceiptModalOpen(true);
                        }}
                        className="p-1 rounded text-slate-600 hover:text-purple-600"
                        title="রশিদ দেখুন"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeletePayment(pay)}
                        className="p-1 rounded text-rose-500 hover:text-rose-700"
                        title="রশিদ মুছে ফেলুন"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL 1: Collect Fee / Record Payment */}
      {isCollectFeeOpen && selectedStudentForAction && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <DollarSign className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    মক্তবের বেতন বা বকেয়া আদায়
                  </h3>
                  <p className="text-xs text-slate-500">
                    শিক্ষার্থী: {selectedStudentForAction.name} (রোল: {toBengaliNumerals(selectedStudentForAction.roll)})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCollectFeeOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitCollectFee} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 flex items-center justify-between">
                <div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">হিসাবের মাস:</div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    {formatMonthBengali(selectedMonth)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">নির্ধারিত মাসিক বেতন:</div>
                  <div className="font-bold font-mono text-purple-700 dark:text-purple-300 text-sm">
                    {f(selectedStudentForAction.monthlyFee)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    আদায়কৃত পরিমাণ (টাকা)*:
                  </span>
                  <input
                    type="number"
                    min="1"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="যেমন: ৫০০ বা ৮০০"
                    autoFocus
                  />
                </label>

                <label className="block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    ছাড় বা মওকুফ (যদি থাকে):
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={payDiscount}
                    onChange={(e) => setPayDiscount(e.target.value === '' ? 0 : Number(e.target.value))}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none"
                    placeholder="০"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    জমার তহবিল খাত*:
                  </span>
                  <select
                    value={payAcc}
                    onChange={(e) => setPayAcc(e.target.value as 'cash' | 'bank')}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold focus:outline-none"
                  >
                    <option value="cash">💵 কোষাধ্যক্ষের নগদ তহবিল</option>
                    <option value="bank">🏛️ মসজিদের ব্যাংক অ্যাকাউন্ট</option>
                  </select>
                </label>

                <label className="block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    পরিশোধের তারিখ*:
                  </span>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    রশিদ বা মেমো নম্বর:
                  </span>
                  <input
                    type="text"
                    value={payReceiptNo}
                    onChange={(e) => setPayReceiptNo(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    placeholder="MKT-101"
                  />
                </label>

                <label className="block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    আদায়কারী ব্যক্তি:
                  </span>
                  <input
                    type="text"
                    value={payCollector}
                    onChange={(e) => setPayCollector(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                    placeholder="ইমাম সাহেব / কোষাধ্যক্ষ"
                  />
                </label>
              </div>

              <label className="block">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  অতিরিক্ত মন্তব্য:
                </span>
                <input
                  type="text"
                  value={payNote}
                  onChange={(e) => setPayNote(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="যেমন: অক্টোবর মাসের বেতন পরিশোধ"
                />
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCollectFeeOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>বেতন জমা সংরক্ষণ ও রশিদ তৈরি</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add or Edit Student */}
      {isAddStudentOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 w-full max-w-lg border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                  <GraduationCap className="w-5 h-5" />
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {editingStudent ? 'শিক্ষার্থীর তথ্য সংশোধন' : 'নতুন শিক্ষার্থী ভর্তি ও নিবন্ধন'}
                </h3>
              </div>
              <button
                onClick={() => setIsAddStudentOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    শিক্ষার্থীর নাম*:
                  </span>
                  <input
                    type="text"
                    required
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold"
                    placeholder="যেমন: মুহাম্মদ তাসিন আহমেদ"
                    autoFocus
                  />
                </label>

                <label className="block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    পিতা বা অভিভাবকের নাম:
                  </span>
                  <input
                    type="text"
                    value={guardianName}
                    onChange={(e) => setGuardianName(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                    placeholder="যেমন: হাজী লোকমান হোসেন"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    শ্রেণি / বিভাগ*:
                  </span>
                  <select
                    value={studentClass}
                    onChange={(e) => setStudentClass(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
                  >
                    {CLASSES_LIST.map((cls) => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    রোল নম্বর:
                  </span>
                  <input
                    type="text"
                    value={studentRoll}
                    onChange={(e) => setStudentRoll(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    placeholder="০১"
                  />
                </label>

                <label className="block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    ধার্যকৃত মাসিক বেতন (টাকা)*:
                  </span>
                  <input
                    type="number"
                    min="0"
                    required
                    value={studentFee}
                    onChange={(e) => setStudentFee(e.target.value === '' ? '' : Number(e.target.value))}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-bold font-mono"
                    placeholder="৫০০"
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    অভিভাবকের মোবাইল নম্বর:
                  </span>
                  <input
                    type="tel"
                    value={studentPhone}
                    onChange={(e) => setStudentPhone(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                    placeholder="017xxxxxxxx"
                  />
                </label>

                <label className="block">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    ভর্তির তারিখ:
                  </span>
                  <input
                    type="date"
                    value={studentAdmissionDate}
                    onChange={(e) => setStudentAdmissionDate(e.target.value)}
                    className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </label>
              </div>

              <label className="block">
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  মন্তব্য / শিফট / বিবরণ:
                </span>
                <input
                  type="text"
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  className="mt-1 w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
                  placeholder="যেমন: সকাল ৭:০০ - ৮:০০ শিফট"
                />
              </label>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddStudentOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md transition active:scale-95 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{editingStudent ? 'আপডেট করুন' : 'নিবন্ধন সম্পন্ন করুন'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Printable Receipt Slip */}
      {isReceiptModalOpen && selectedPaymentForReceipt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                বেতন পরিশোধের রশিদ
              </span>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Printable Receipt Paper */}
            <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-slate-800/80 border border-amber-200/80 dark:border-slate-700 text-slate-900 dark:text-white space-y-3 font-sans">
              <div className="text-center border-b border-dashed border-slate-300 dark:border-slate-700 pb-3">
                <div className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                  {appState.name}
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white">
                  মক্তব ও নূরানী মাদ্রাসা
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  মাসিক বেতন আদায়ের অফিশিয়াল রসিদ
                </div>
              </div>

              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span>রশিদ নং: <strong>{selectedPaymentForReceipt.receiptNo}</strong></span>
                <span>তারিখ: {toBengaliNumerals(selectedPaymentForReceipt.paidDate)}</span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-slate-500">শিক্ষার্থীর নাম:</span>
                  <span className="font-bold">{selectedPaymentForReceipt.studentName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-slate-500">হিসাবের মাস:</span>
                  <span className="font-bold">{formatMonthBengali(selectedPaymentForReceipt.month)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-slate-500">পরিশোধের মাধ্যম:</span>
                  <span className="font-semibold">
                    {selectedPaymentForReceipt.acc === 'bank' ? 'ব্যাংক ট্রান্সফার' : 'কোষাধ্যক্ষ (নগদ)'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-700/50">
                  <span className="text-slate-500">আদায়কারী:</span>
                  <span className="font-semibold">{selectedPaymentForReceipt.collectedBy || 'ইমাম সাহেব'}</span>
                </div>
                <div className="flex justify-between py-2 text-sm">
                  <span className="font-extrabold text-slate-900 dark:text-white">মোট আদায়কৃত টাকা:</span>
                  <span className="font-extrabold font-mono text-emerald-600 dark:text-emerald-400 text-base">
                    {f(selectedPaymentForReceipt.amount)}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center text-[10px] text-slate-400 border-t border-dashed border-slate-300 dark:border-slate-700">
                <div>স্বাক্ষর (আদায়কারী)</div>
                <div>স্বাক্ষর (অভিভাবক)</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>প্রিন্ট করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
