import React from 'react';
import { 
  Map, 
  Layers, 
  PieChart, 
  Briefcase, 
  Bot,
  Sparkles
} from 'lucide-react';

export type MobileTab = 'map' | 'layers' | 'stats' | 'invest' | 'chat';

interface MobileNavBarProps {
  activeTab: MobileTab;
  onSelectTab: (tab: MobileTab) => void;
  hasUnreadAiNotice?: boolean;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({
  activeTab,
  onSelectTab,
  hasUnreadAiNotice = false,
}) => {
  return (
    <nav 
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-lg md:hidden pb-safe select-none"
      aria-label="Mobile Navigation Bar"
    >
      <div className="flex items-center justify-around h-14 px-1">
        {/* Tab 1: Peta (Map Canvas) */}
        <button
          type="button"
          onClick={() => onSelectTab('map')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all relative ${
            activeTab === 'map'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-full transition-transform ${activeTab === 'map' ? 'scale-110 bg-emerald-50 text-emerald-600' : ''}`}>
            <Map className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Peta</span>
          {activeTab === 'map' && (
            <span className="absolute top-1 w-1 h-1 rounded-full bg-emerald-600" />
          )}
        </button>

        {/* Tab 2: Layer & Filter */}
        <button
          type="button"
          onClick={() => onSelectTab('layers')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all relative ${
            activeTab === 'layers'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-full transition-transform ${activeTab === 'layers' ? 'scale-110 bg-emerald-50 text-emerald-600' : ''}`}>
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Layer</span>
          {activeTab === 'layers' && (
            <span className="absolute top-1 w-1 h-1 rounded-full bg-emerald-600" />
          )}
        </button>

        {/* Tab 3: Statistik / Analisis */}
        <button
          type="button"
          onClick={() => onSelectTab('stats')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all relative ${
            activeTab === 'stats'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-full transition-transform ${activeTab === 'stats' ? 'scale-110 bg-emerald-50 text-emerald-600' : ''}`}>
            <PieChart className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Risiko</span>
          {activeTab === 'stats' && (
            <span className="absolute top-1 w-1 h-1 rounded-full bg-emerald-600" />
          )}
        </button>

        {/* Tab 4: Radar Invest */}
        <button
          type="button"
          onClick={() => onSelectTab('invest')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all relative ${
            activeTab === 'invest'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-full transition-transform ${activeTab === 'invest' ? 'scale-110 bg-emerald-50 text-emerald-600' : ''}`}>
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Invest</span>
          {activeTab === 'invest' && (
            <span className="absolute top-1 w-1 h-1 rounded-full bg-emerald-600" />
          )}
        </button>

        {/* Tab 5: Tanya AI */}
        <button
          type="button"
          onClick={() => onSelectTab('chat')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 transition-all relative ${
            activeTab === 'chat'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-full relative transition-transform ${activeTab === 'chat' ? 'scale-110 bg-gradient-to-tr from-emerald-500 to-amber-500 text-white shadow-xs' : 'text-slate-600'}`}>
            <Bot className="w-5 h-5" />
            <Sparkles className="w-2.5 h-2.5 text-amber-300 absolute -top-0.5 -right-0.5 animate-pulse" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Tanya AI</span>
          {hasUnreadAiNotice && (
            <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          )}
        </button>
      </div>
    </nav>
  );
};
