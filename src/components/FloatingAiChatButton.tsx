import React from 'react';
import { Bot, Sparkles } from 'lucide-react';

interface FloatingAiChatButtonProps {
  onOpenChat: () => void;
}

export const FloatingAiChatButton: React.FC<FloatingAiChatButtonProps> = ({
  onOpenChat,
}) => {
  return (
    <div className="fixed bottom-5 right-5 sm:right-6 z-30 pointer-events-auto">
      <button
        onClick={onOpenChat}
        className="group flex items-center gap-2.5 px-4 py-2.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 hover:from-emerald-700 hover:via-teal-700 hover:to-amber-700 text-white font-bold text-xs rounded-full shadow-lg shadow-emerald-700/30 hover:shadow-xl hover:shadow-emerald-700/40 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/30 backdrop-blur-md"
        title="Buka Asisten Tanya AI Bencana"
      >
        <div className="relative flex items-center justify-center">
          <Bot className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping"></span>
        </div>
        <span className="tracking-wide">Tanya AI Bencana</span>
        <span className="bg-white/20 text-amber-100 text-[10px] px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
          <Sparkles className="w-2.5 h-2.5 text-amber-300" />
          RADAR AI
        </span>
      </button>
    </div>
  );
};
