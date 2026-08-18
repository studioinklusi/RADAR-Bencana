import React from 'react';
import { Lock, ShieldCheck, ArrowRight, X, Sparkles, LogIn } from 'lucide-react';

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
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-amber-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Tutup"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="text-center pt-1 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Akses Layer Pola Ruang (RTRW)
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-mono">
            Data Zonasi Rencana Tata Ruang Wilayah
          </p>
        </div>

        {/* Content Info */}
        <div className="space-y-3 mb-6 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
          <div className="flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-slate-700">
              Layer <strong>Pola Ruang RTRW</strong> memuat batas zonasi resmi peruntukan lahan (Kawasan Lindung, Budi Daya, dan Badan Air) Kabupaten Banjarnegara.
            </p>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed pl-6 border-t border-slate-200/60 pt-2">
            Untuk mengaktifkan visualisasi poligon batas tata ruang di peta, silakan masuk menggunakan akun administrator terverifikasi.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Lanjut sebagai Tamu
          </button>
          <button
            onClick={() => {
              onClose();
              onNavigateToLogin();
            }}
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk sebagai Admin</span>
          </button>
        </div>
      </div>
    </div>
  );
};
