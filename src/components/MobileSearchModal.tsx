import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, ChevronRight, Compass } from 'lucide-react';
import { AdminFeature } from '../types';
import { DESA_BOUNDARIES } from '../data/mockDesaBoundaries';

interface MobileSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  districts: AdminFeature[];
  selectedDistrict: AdminFeature | null;
  selectedVillage?: string | null;
  onSelectDistrict: (district: AdminFeature | null) => void;
  onSelectVillage: (village: string | null) => void;
  onResetView: () => void;
}

export const MobileSearchModal: React.FC<MobileSearchModalProps> = ({
  isOpen,
  onClose,
  districts,
  selectedDistrict,
  selectedVillage,
  onSelectDistrict,
  onSelectVillage,
  onResetView,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'kecamatan' | 'desa'>('all');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredDistricts = districts.filter((d) =>
    d.properties.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.properties.code?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredVillages = DESA_BOUNDARIES.features.filter((v: any) =>
    v.properties.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.properties.subdistrict?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 30);

  const handleSelectDistrict = (district: AdminFeature) => {
    onSelectDistrict(district);
    onSelectVillage(null);
    onClose();
  };

  const handleSelectVillage = (village: any) => {
    const parentDistrict = districts.find(
      (d) => d.properties.name.toLowerCase().replace(/^(kecamatan|kabupaten)\s+/i, '') === village.properties.subdistrict?.toLowerCase()
    );
    if (parentDistrict) {
      onSelectDistrict(parentDistrict);
    }
    onSelectVillage(village.properties.name);
    onClose();
  };

  const handleSelectKabupaten = () => {
    onResetView();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex flex-col md:hidden animate-fadeIn select-none">
      {/* Top Search Header */}
      <div className="bg-white border-b border-slate-200 p-3 pt-safe shadow-sm">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Kecamatan atau Desa di Banjarnegara..."
              className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors shrink-0"
          >
            Batal
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-2.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
              filterType === 'all'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua
          </button>
          <button
            type="button"
            onClick={() => setFilterType('kecamatan')}
            className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
              filterType === 'kecamatan'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kecamatan ({filteredDistricts.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('desa')}
            className={`px-3 py-1 rounded-lg text-xs font-medium shrink-0 transition-all ${
              filterType === 'desa'
                ? 'bg-emerald-600 text-white font-bold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Desa / Kelurahan ({filteredVillages.length})
          </button>
        </div>
      </div>

      {/* Search Results List */}
      <div className="flex-1 overflow-y-auto bg-slate-50 p-3 space-y-3 pb-safe">
        {/* Kabupaten Overview Shortcut */}
        {!searchQuery && (
          <button
            type="button"
            onClick={handleSelectKabupaten}
            className="w-full bg-white border border-emerald-200 p-3 rounded-xl flex items-center justify-between shadow-xs hover:border-emerald-400 transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-emerald-800">Kabupaten Banjarnegara</div>
                <div className="text-[10px] text-slate-500 font-mono">Lihat Seluruh Wilayah (20 Kecamatan)</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-600" />
          </button>
        )}

        {/* Kecamatan List */}
        {(filterType === 'all' || filterType === 'kecamatan') && filteredDistricts.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Kecamatan</span>
              <span>{filteredDistricts.length} ditemukan</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
              {filteredDistricts.map((d) => {
                const isSelected = selectedDistrict?.properties.name === d.properties.name && !selectedVillage;
                return (
                  <button
                    key={d.properties.name}
                    type="button"
                    onClick={() => handleSelectDistrict(d)}
                    className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors ${
                      isSelected ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="text-xs">{d.properties.name}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                        Aktif
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Desa List */}
        {(filterType === 'all' || filterType === 'desa') && filteredVillages.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
            <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Desa / Kelurahan</span>
              <span>{filteredVillages.length} ditemukan</span>
            </div>
            <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
              {filteredVillages.map((v: any, idx: number) => {
                const isSelected = selectedVillage === v.properties.name;
                return (
                  <button
                    key={`${v.properties.name}-${idx}`}
                    type="button"
                    onClick={() => handleSelectVillage(v)}
                    className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors ${
                      isSelected ? 'bg-emerald-50 text-emerald-800 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <div className="text-xs text-slate-800 font-medium">Desa {v.properties.name}</div>
                      <div className="text-[10px] text-slate-500 font-mono">Kec. {v.properties.subdistrict}</div>
                    </div>
                    {isSelected ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-mono">
                        Aktif
                      </span>
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* No Results */}
        {filteredDistricts.length === 0 && filteredVillages.length === 0 && (
          <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-700">Tidak ada wilayah ditemukan</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Coba kata kunci lain atau periksa ejaan nama kecamatan/desa.</div>
          </div>
        )}
      </div>
    </div>
  );
};
