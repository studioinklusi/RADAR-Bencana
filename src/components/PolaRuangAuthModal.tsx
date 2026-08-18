import React from 'react';
import { Lock, ShieldAlert, ArrowRight, X, Sparkles, LogIn } from 'lucide-react';

interface PolaRuangAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToLogin: () => void;
}

export const PolaRuangAuthModal: React.FC<PolaRuangAuthModalProps> = ({
  isOpen,
  onClose,
  onNavigateToLogin,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Accent top banner */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="text-center pt-2 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Lock className="w-6 h-6 text-amber-600 animate-pulse" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Akses Terbatas: Pola Ruang RTRW
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Kerahasiaan &amp; Proteksi Zonasi Tata Ruang Wilayah
          </p>
        </div>

        {/* Content Info */}
        <div className="space-y-3 mb-6 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Layer <strong>Pola Ruang (RTRW)</strong> memuat informasi zonasi sensitif (Kawasan Lindung, Kawasan Budi Daya, dan Ketentuan KKPR Dinas PUPR).
            </p>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed pl-6">
            Untuk membuka dan mengaktifkan layer ini pada visualisasi peta, diperlukan autentikasi akun administrator atau petugas resmi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigateToLogin();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Login Sekarang</span>
          </button>
        </div>
      </div>
    </div>
  );
};
