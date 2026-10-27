import React, { useState } from 'react';
import { Download, CheckCircle2, Share2, PlusSquare, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface Props {
  language?: 'bn' | 'en' | 'ar';
}

export const PWAInstallButton: React.FC<Props> = ({ language = 'bn' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  if (isInstalled) {
    return (
      <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
        <CheckCircle2 className="w-3.5 h-3.5" />
        {language === 'bn' ? 'অ্যাপ ইনস্টল্ড' : language === 'ar' ? 'مثبت' : 'Installed'}
      </span>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const ok = await install();
      if (ok) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    }
  };

  // If not installable and not iOS (e.g., standard browser tab that hasn't fired prompt yet),
  // we still provide an informational button so users know offline app is installable!
  return (
    <>
      <button
        onClick={handleInstallClick}
        title={language === 'bn' ? 'হোমস্ক্রিনে অ্যাপ ইনস্টল করুন' : 'Install App'}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-semibold transition-all duration-200 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm hover:shadow active:scale-95"
      >
        <Download className="w-4 h-4" />
        <span>{language === 'bn' ? 'অ্যাপ ইনস্টল' : language === 'ar' ? 'تثبيت التطبيق' : 'Install App'}</span>
      </button>

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Download className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                {language === 'bn' ? 'আইফোন / আইপ্যাডে ইনস্টল করুন' : 'Install on iPhone / iPad'}
              </h3>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-sm">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0">1</span>
                <p>
                  Safari ব্রাউজারের নিচের টুলবারে <Share2 className="w-4 h-4 inline text-blue-500 mx-1" /> <strong>Share</strong> বাটনে চাপ দিন।
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0">2</span>
                <p>
                  একটু নিচে স্ক্রল করে <PlusSquare className="w-4 h-4 inline text-slate-600 dark:text-slate-300 mx-1" /> <strong>Add to Home Screen</strong> এ ট্যাপ করুন।
                </p>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs shrink-0">3</span>
                <p>
                  উপরে ডানে <strong>Add</strong> চাপলেই অফলাইনে ব্যবহারযোগ্য হোমস্ক্রিন অ্যাপ তৈরি হয়ে যাবে!
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="mt-5 w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 font-semibold text-sm transition"
            >
              {language === 'bn' ? 'বুঝেছি / বন্ধ করুন' : 'Close'}
            </button>
          </div>
        </div>
      )}

      {/* Success banner */}
      {installSuccess && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-xl shadow-lg animate-in slide-in-from-bottom">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">অ্যাপ্লিকেশনটি সফলভাবে ইনস্টল হয়েছে!</span>
        </div>
      )}
    </>
  );
};
