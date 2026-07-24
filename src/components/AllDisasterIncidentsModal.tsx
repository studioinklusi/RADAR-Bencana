import React, { useState } from 'react';
import {
  X,
  Flame,
  Search,
  Filter,
  MapPin,
  AlertTriangle,
  Users,
  Home,
  Building2,
  Calendar,
  CheckCircle2,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { DISASTER_INCIDENTS } from '../data/mockDisasterIncidents';
import { HazardType, DisasterIncident } from '../types';

interface AllDisasterIncidentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  showAllIncidentsMode: boolean;
  onToggleAllIncidentsMode: () => void;
  onSelectIncidentOnMap: (coords: [number, number], title: string) => void;
}

export const AllDisasterIncidentsModal: React.FC<AllDisasterIncidentsModalProps> = ({
  isOpen,
  onClose,
  showAllIncidentsMode,
  onToggleAllIncidentsMode,
  onSelectIncidentOnMap,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedHazardFilter, setSelectedHazardFilter] = useState<string>('all');
  const [selectedYearFilter, setSelectedYearFilter] = useState<string>('all');

  if (!isOpen) return null;

  // Filtered dataset
  const filteredList = DISASTER_INCIDENTS.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.locationName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.districtName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.subdistrictName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesHazard =
      selectedHazardFilter === 'all' || inc.hazardType === selectedHazardFilter;

    const matchesYear =
      selectedYearFilter === 'all' || inc.year.toString() === selectedYearFilter;

    return matchesSearch && matchesHazard && matchesYear;
  });

  // Calculate Aggregates
  const totalIncidents = DISASTER_INCIDENTS.length;
  const totalVictims = DISASTER_INCIDENTS.reduce((acc, curr) => acc + curr.affectedVictims, 0);
  const totalEvacuated = DISASTER_INCIDENTS.reduce((acc, curr) => acc + curr.evacuatedPeople, 0);
  const totalDamagedHouses = DISASTER_INCIDENTS.reduce((acc, curr) => acc + curr.damagedHouses, 0);

  const getHazardBadge = (type: HazardType) => {
    switch (type) {
      case 'flood':
        return { name: 'Banjir Luapan', bg: 'bg-blue-50 text-blue-800 border-blue-200' };
      case 'landslide':
        return { name: 'Longsor / Gerakan Tanah', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'wildfire':
        return { name: 'Karhutla / Kebakaran', bg: 'bg-rose-50 text-rose-800 border-rose-200' };
      case 'coastal':
        return { name: 'Gelombang Pesisir / Surge', bg: 'bg-teal-50 text-teal-800 border-teal-200' };
      default:
        return { name: type, bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-hidden animate-fadeIn">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-xs">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900">
                  Rekapitulasi Kejadian Bencana Keseluruhan
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-mono font-bold">
                  {totalIncidents} Kejadian Terdata
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Database histori titik bencana alam Provinsi Jawa Barat (2018–2025)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Overlay Button */}
            <button
              onClick={onToggleAllIncidentsMode}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer ${
                showAllIncidentsMode
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {showAllIncidentsMode ? 'Mode Semua Titik: Aktif' : 'Tampilkan Semua di Peta'}
              </span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 custom-scrollbar">
          {/* Aggregate Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono flex items-center justify-between font-bold">
                <span>Total Kejadian</span>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
              </div>
              <div className="text-xl font-black text-rose-700 font-mono">{totalIncidents} Event</div>
              <div className="text-[10px] text-slate-500">2018 - 2025 (Jawa Barat)</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono flex items-center justify-between font-bold">
                <span>Jiwa Terdampak</span>
                <Users className="w-3.5 h-3.5 text-amber-600" />
              </div>
              <div className="text-xl font-black text-amber-700 font-mono">
                {totalVictims.toLocaleString('id-ID')} <span className="text-xs font-normal">Jiwa</span>
              </div>
              <div className="text-[10px] text-slate-500">Korban Luka / Mengungsi</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono flex items-center justify-between font-bold">
                <span>Pengungsi</span>
                <Users className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="text-xl font-black text-blue-700 font-mono">
                {totalEvacuated.toLocaleString('id-ID')} <span className="text-xs font-normal">Jiwa</span>
              </div>
              <div className="text-[10px] text-slate-500">Di Posko Evakuasi</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono flex items-center justify-between font-bold">
                <span>Rumah Rusak</span>
                <Home className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-xl font-black text-emerald-700 font-mono">
                {totalDamagedHouses.toLocaleString('id-ID')} <span className="text-xs font-normal">Unit</span>
              </div>
              <div className="text-[10px] text-slate-500">Ringan / Sedang / Berat</div>
            </div>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari nama bencana, desa, kecamatan, atau kabupaten..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Filter Jenis Bencana */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedHazardFilter}
                onChange={(e) => setSelectedHazardFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="all">Semua Jenis Bencana</option>
                <option value="flood">Banjir Luapan</option>
                <option value="landslide">Longsor / Tanah Cadas</option>
                <option value="wildfire">Karhutla / Kebakaran</option>
                <option value="coastal">Gelombang Pesisir</option>
              </select>

              {/* Filter Tahun */}
              <select
                value={selectedYearFilter}
                onChange={(e) => setSelectedYearFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 font-mono"
              >
                <option value="all">Semua Tahun (2018-2025)</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
                <option value="2021">2021</option>
                <option value="2020">2020</option>
                <option value="2019">2019</option>
                <option value="2018">2018</option>
              </select>
            </div>
          </div>

          {/* List of Disaster Incidents */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-mono">
              <span>Menampilkan {filteredList.length} dari {totalIncidents} Kejadian</span>
              <span>Klik &quot;Lihat di Peta&quot; untuk zoom ke lokasi kejadian</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredList.map((inc) => {
                const badge = getHazardBadge(inc.hazardType);
                return (
                  <div
                    key={inc.id}
                    className="p-4 rounded-xl bg-white border border-slate-200 hover:border-slate-300 transition-all space-y-2.5 flex flex-col justify-between group shadow-xs"
                  >
                    <div>
                      {/* Top Meta Bar */}
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${badge.bg}`}>
                          {badge.name}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>{inc.date}</span>
                        </div>
                      </div>

                      {/* Incident Title */}
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                        {inc.title}
                      </h3>

                      {/* Location Details */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                        <span className="line-clamp-1">{inc.locationName}, {inc.subdistrictName}, {inc.districtName}</span>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 leading-relaxed mt-2 line-clamp-2">
                        {inc.description}
                      </p>
                    </div>

                    {/* Infrastructure & Victim Numbers */}
                    <div className="pt-2.5 border-t border-slate-100 space-y-2">
                      <div className="grid grid-cols-3 gap-1 text-[11px] font-mono">
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-200 text-center">
                          <div className="text-[9px] text-slate-500">Terdampak</div>
                          <div className="font-bold text-amber-700">{inc.affectedVictims} Jiwa</div>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-200 text-center">
                          <div className="text-[9px] text-slate-500">Pengungsi</div>
                          <div className="font-bold text-blue-700">{inc.evacuatedPeople} Jiwa</div>
                        </div>
                        <div className="bg-slate-50 p-1.5 rounded border border-slate-200 text-center">
                          <div className="text-[9px] text-slate-500">Rumah Rusak</div>
                          <div className="font-bold text-emerald-700">{inc.damagedHouses} Unit</div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <button
                        onClick={() => {
                          onSelectIncidentOnMap(inc.coordinates, inc.title);
                          onClose();
                        }}
                        className="w-full py-2 px-3 rounded-lg bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-mono font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Fokus Lokasi di Peta</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-mono text-[11px]">Database Bencana Terverifikasi BPBD &amp; GEE</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-mono text-xs font-bold transition-colors cursor-pointer"
          >
            Tutup Rekapitulasi
          </button>
        </div>
      </div>
    </div>
  );
};
