import React, { useState } from 'react';
import { ShieldCheck, ArrowLeft, Lock, User, AlertCircle, Sparkles } from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: () => void;
  onBackToMap: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToMap }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      // Dummy authentication
      if (username.trim().toLowerCase() === 'admin' && password === 'password') {
        setIsLoading(false);
        onLoginSuccess();
      } else {
        setIsLoading(false);
        setError('Username atau Password salah! (Petunjuk: admin / password)');
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-amber-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="p-6 relative z-10 flex items-center justify-between max-w-6xl w-full mx-auto">
        <button
          onClick={onBackToMap}
          className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm backdrop-blur-md transition-all group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600 group-hover:-translate-x-1 transition-transform" />
          <span>Kembali ke Peta Utama</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-600 bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Sistem Portal GIS Radar Bencana</span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl p-8 shadow-xl relative overflow-hidden">
          {/* Accent top border */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-500" />

          {/* Header icon & title */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-500 p-[2px] rounded-2xl mx-auto mb-4 shadow-md shadow-emerald-500/20">
              <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-7 h-7 text-emerald-600" />
              </div>
            </div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Login Super Admin</h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Masuk untuk mengelola data lapisan GIS, CSV &amp; GeoJSON
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-800 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-mono">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="Masukkan username admin..."
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider font-mono">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="Masukkan password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono shadow-inner"
                />
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 font-mono flex items-center justify-between">
              <span>Akun Demo Default:</span>
              <span className="text-emerald-700 font-bold bg-white px-2 py-0.5 rounded border border-slate-200">
                admin / password
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-xs rounded-xl shadow-sm shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              {isLoading ? (
                <span>Memverifikasi Hak Akses...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current text-amber-300" />
                  <span>Masuk Portal Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Footer Back Link */}
          <div className="mt-6 pt-5 border-t border-slate-100 text-center">
            <button
              onClick={onBackToMap}
              className="text-xs text-slate-500 hover:text-emerald-700 font-mono transition-colors inline-flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Batal &amp; Kembali ke Tampilan Peta</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-[10px] font-mono text-slate-500 relative z-10">
        RADAR BENCANA Indonesia • Hak Akses Terisolasi Super Admin
      </footer>
    </div>
  );
};
