import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  MapPin, 
  Globe, 
  Layers, 
  ChevronDown,
  Upload,
  RotateCcw,
  MoreVertical,
  ShieldCheck,
  LogIn
} from 'lucide-react';
import { AdminFeature } from '../types';
import { DESA_BOUNDARIES } from '../data/mockDesaBoundaries';

interface HeaderProps {
  districts: AdminFeature[];
  selectedDistrict: AdminFeature | null;
  selectedVillage?: string | null;
  onSelectDistrict: (district: AdminFeature | null) => void;
  onSelectVillage?: (village: string | null) => void;
  onOpenGeometryModal: () => void;
  onNavigateToLogin: () => void;
  onResetView: () => void;
  lang: 'ID' | 'EN';
  onToggleLang: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  districts,
  selectedDistrict,
  selectedVillage,
  onSelectDistrict,
  onSelectVillage,
  onOpenGeometryModal,
  onNavigateToLogin,
  onResetView,
  lang,
  onToggleLang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDistricts = districts.filter((d) =>
    d.properties.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.properties.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVillages = DESA_BOUNDARIES.features.filter((v: any) =>
    v.properties.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.properties.subdistrict.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 15);

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 h-14 px-4 flex items-center justify-between z-30 shrink-0 shadow-sm">
      {/* Brand & Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity" onClick={onResetView}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 via-teal-500 to-amber-500 p-[2px] flex items-center justify-center shadow-md shadow-emerald-500/20">
            <div className="w-full h-full bg-white rounded-[6px] flex items-center justify-center">
              <Layers className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5 leading-none font-sans">
              <span className="text-emerald-600 font-black text-base tracking-widest uppercase">RADAR</span>
              <span className="text-amber-700 font-bold text-[11px] tracking-wider uppercase bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded">BENCANA</span>
            </div>
            <p className="text-[10px] text-slate-500 font-medium tracking-tight mt-0.5 leading-tight" title="Rekapitulasi Analisis Dampak Area dan Risiko Bencana">
              Rekapitulasi Analisis Dampak Area &amp; Risiko
            </p>
          </div>
        </div>

        {/* Breadcrumb path: Kabupaten / Kecamatan / Desa */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100/80 px-3.5 py-1 rounded-full border border-slate-200 ml-4 font-sans">
          <span className="hover:text-emerald-700 cursor-pointer transition-colors font-medium text-slate-700" onClick={onResetView} title="Reset ke Kabupaten Banjarnegara">
            Kab. Banjarnegara
          </span>
          <span className="text-slate-400">/</span>
          <span className={`transition-colors ${selectedDistrict ? 'hover:text-emerald-700 cursor-pointer text-slate-700 font-medium' : 'text-slate-600'}`} onClick={selectedDistrict ? () => onSelectDistrict(selectedDistrict) : undefined}>
            {selectedDistrict ? selectedDistrict.properties.name : 'Semua Kecamatan'}
          </span>
          <span className="text-slate-400">/</span>
          <span className="text-emerald-700 font-semibold">
            {selectedVillage ? selectedVillage : (selectedDistrict ? 'Semua Desa' : 'Seluruh Desa')}
          </span>
        </div>
      </div>

      {/* Middle Search & Custom Geometry button */}
      <div className="flex items-center gap-2 max-w-md w-full px-4">
        <div className="relative flex-1">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder={lang === 'ID' ? 'Pilih satu atau lebih wilayah...' : 'Select region or district...'}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-8 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setIsSearchOpen(false);
                }}
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {isSearchOpen && searchQuery && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden z-50 max-h-72 overflow-y-auto">
              {filteredDistricts.length === 0 && filteredVillages.length === 0 ? (
                <div className="p-3 text-xs text-slate-500 text-center font-mono">
                  Tidak ada kecamatan/desa ditemukan
                </div>
              ) : (
                <>
                  {filteredDistricts.length > 0 && (
                    <div className="p-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono border-b border-slate-100">
                      Kecamatan (Kab. Banjarnegara)
                    </div>
                  )}
                  {filteredDistricts.map((district) => (
                    <button
                      key={district.id}
                      onClick={() => {
                        onSelectDistrict(district);
                        if (onSelectVillage) onSelectVillage(null);
                        setSearchQuery('');
                        setIsSearchOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-800 flex items-center justify-between border-b border-slate-100 last:border-0 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-800">{district.properties.name}</div>
                          <div className="text-[10px] text-slate-500">Kabupaten Banjarnegara</div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-mono border border-slate-200">
                        {district.properties.total_area_ha.toLocaleString()} ha
                      </span>
                    </button>
                  ))}

                  {filteredVillages.length > 0 && (
                    <div className="p-1.5 bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono border-y border-slate-100">
                      Desa / Kelurahan ({filteredVillages.length})
                    </div>
                  )}
                  {filteredVillages.map((village: any) => (
                    <button
                      key={village.id}
                      onClick={() => {
                        const parentKecName = village.properties.subdistrict;
                        const matchedKec = districts.find(d => 
                          d.properties.name.toLowerCase().includes(parentKecName.replace('Kecamatan ', '').toLowerCase()) ||
                          parentKecName.toLowerCase().includes(d.properties.name.toLowerCase())
                        );
                        if (matchedKec) {
                          onSelectDistrict(matchedKec);
                        }
                        if (onSelectVillage) {
                          onSelectVillage(village.properties.name);
                        }
                        setSearchQuery('');
                        setIsSearchOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-800 flex items-center justify-between border-b border-slate-100 last:border-0 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <div>
                          <div className="font-semibold text-slate-800">{village.properties.name}</div>
                          <div className="text-[10px] text-slate-500">{village.properties.subdistrict} • Banjarnegara</div>
                        </div>
                      </div>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-mono border border-emerald-200">
                        Desa
                      </span>
                    </button>
                  ))}
                </>
              )}
            </div>
          )}
        </div>

        {/* Custom Geometry button */}
        <button
          onClick={onOpenGeometryModal}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 text-slate-700 text-xs font-medium border border-slate-200 rounded-lg transition-all whitespace-nowrap shrink-0 shadow-xs"
        >
          <Upload className="w-3.5 h-3.5 text-emerald-600" />
          <span>{lang === 'ID' ? 'Geometri saya' : 'My Geometry'}</span>
        </button>
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center gap-2">
        {selectedDistrict && (
          <button
            onClick={onResetView}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-lg text-xs font-medium transition-colors shadow-xs"
            title="Clear clipping & return to full regional view"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Clip</span>
          </button>
        )}

        {/* Language switch */}
        <button
          onClick={onToggleLang}
          className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-xs font-mono flex items-center gap-1 transition-colors"
          title="Ganti Bahasa"
        >
          <Globe className="w-3.5 h-3.5 text-slate-500" />
          <span className="font-semibold">{lang}</span>
        </button>

        {/* More menu dropdown (⋯) — contains Admin Login */}
        <div className="relative" ref={moreMenuRef}>
          <button
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
            className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg border border-slate-200 transition-colors"
            title="Menu lainnya"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMoreMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 min-w-[180px] animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                onClick={() => {
                  onNavigateToLogin();
                  setIsMoreMenuOpen(false);
                }}
                className="w-full px-3.5 py-2.5 text-left text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2.5 transition-colors"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-medium">Login Admin</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
