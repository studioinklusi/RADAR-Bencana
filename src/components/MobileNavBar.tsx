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
  isPending?: boolean;
}

export const MobileNavBarComponent: React.FC<MobileNavBarProps> = ({
  activeTab,
  onSelectTab,
  hasUnreadAiNotice = false,
  isPending = false,
}) => {
  const handleTabClick = (tab: MobileTab) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch (e) {}
    }
    onSelectTab(tab);
  };

  return (
    <nav 
      className="fixed bottom-0 inset-x-0 z-40 bg-white/98 border-t border-slate-200 shadow-2xl md:hidden pb-safe select-none"
      aria-label="Mobile Navigation Bar"
    >
      <div className="flex items-center justify-around h-14 px-1">
        {/* Tab 1: Peta (Map Canvas) */}
        <button
          type="button"
          onClick={() => handleTabClick('map')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 active:scale-80 active:bg-emerald-50/80 rounded-xl transition-transform duration-100 ease-out relative cursor-pointer ${
            activeTab === 'map'
              ? 'text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-full transition-transform ${activeTab === 'map' ? 'scale-110 bg-emerald-50 text-emerald-600' : ''}`}>
            <Map className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Peta</span>
          {activeTab === 'map' && (
            <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-xs" />
          )}
        </button>

        {/* Tab 2: Layer & Filter */}
        <button
          type="button"
          onClick={() => handleTabClick('layers')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 active:scale-80 active:bg-emerald-50/80 rounded-xl transition-transform duration-100 ease-out relative cursor-pointer ${
            activeTab === 'layers'
              ? 'text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-full transition-transform ${activeTab === 'layers' ? 'scale-110 bg-emerald-50 text-emerald-600' : ''}`}>
            <Layers className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Layer</span>
          {activeTab === 'layers' && (
            <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-xs" />
          )}
        </button>

        {/* Tab 3: Statistik / Analisis */}
        <button
          type="button"
          onClick={() => handleTabClick('stats')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 active:scale-80 active:bg-emerald-50/80 rounded-xl transition-transform duration-100 ease-out relative cursor-pointer ${
            activeTab === 'stats'
              ? 'text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-full transition-transform ${activeTab === 'stats' ? 'scale-110 bg-emerald-50 text-emerald-600' : ''}`}>
            <PieChart className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Risiko</span>
          {activeTab === 'stats' && (
            <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-xs" />
          )}
        </button>

        {/* Tab 4: Radar Invest */}
        <button
          type="button"
          onClick={() => handleTabClick('invest')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 active:scale-80 active:bg-emerald-50/80 rounded-xl transition-transform duration-100 ease-out relative cursor-pointer ${
            activeTab === 'invest'
              ? 'text-emerald-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className={`p-1 rounded-full transition-transform ${activeTab === 'invest' ? 'scale-110 bg-emerald-50 text-emerald-600' : ''}`}>
            <Briefcase className="w-5 h-5" />
          </div>
          <span className="text-[10px] tracking-tight mt-0.5">Invest</span>
          {activeTab === 'invest' && (
            <span className="absolute top-1 w-1.5 h-1.5 rounded-full bg-emerald-600 shadow-xs" />
          )}
        </button>

        {/* Tab 5: Tanya AI */}
        <button
          type="button"
          onClick={() => handleTabClick('chat')}
          className={`flex flex-col items-center justify-center flex-1 h-full py-1 active:scale-80 active:bg-emerald-50/80 rounded-xl transition-transform duration-100 ease-out relative cursor-pointer ${
            activeTab === 'chat'
              ? 'text-emerald-700 font-extrabold'
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

export const MobileNavBar = React.memo(MobileNavBarComponent);
