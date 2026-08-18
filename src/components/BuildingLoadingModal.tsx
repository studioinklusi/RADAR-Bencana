import React from 'react';
import { Home, Sparkles, X, MapPin, Layers } from 'lucide-react';

interface BuildingLoadingModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const BuildingLoadingModal: React.FC<BuildingLoadingModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200 space-y-4">
        {/* Accent gradient bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-pulse" />

        {/* Close Button if user wants to dismiss early */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Header Icon & Title */}
        <div className="text-center pt-2 space-y-2">
          <div className="relative w-16 h-16 mx-auto">
            {/* Spinning Ring */}
            <div className="w-16 h-16 rounded-2xl border-3 border-emerald-500/20 border-t-emerald-600 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center shadow-xs">
                <Home className="w-5 h-5 text-emerald-600 animate-bounce" />
              </div>
            </div>
          </div>

          <h3 className="text-base font-extrabold text-slate-900 pt-1">
            Memuat Tapak Bangunan (465K Unit)
          </h3>
          <p className="text-xs text-slate-500 font-mono">
            Google Open Buildings AI • Kabupaten Banjarnegara
          </p>
        </div>

        {/* Progress details */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-700 font-medium">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>Memproses Partisi Spasial...</span>
            </span>
            <span className="font-mono text-emerald-700 font-bold">465.806 Poligon</span>
          </div>

          {/* Animated Bar */}
          <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full w-full animate-pulse" />
          </div>

          <p className="text-[11px] text-slate-500 leading-snug pt-1">
            Sistem mengoptimalkan *Level of Detail (LOD)* agar peta tetap beroperasi sangat mulus (60 FPS) tanpa membebani memori.
          </p>
        </div>

        {/* User Guidance Tip */}
        <div className="bg-emerald-50/70 border border-emerald-200 p-3 rounded-xl flex items-start gap-2.5 text-[11px] text-emerald-900">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <p className="leading-snug">
            <strong>Tips Penggunaan:</strong> Perbesar peta (zoom in) ke area desa atau pemukiman warga untuk melihat bentuk tapak fisik dan tingkat risiko per atap bangunan.
          </p>
        </div>
      </div>
    </div>
  );
};
