import React from 'react';
import { Bot, User, Send, Minimize2, X, Sparkles } from 'lucide-react';
import { ChatMessageRenderer } from './ChatMessageRenderer';
import { ChatMessage, AdminFeature, HazardType } from '../types';

interface MaximizedChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatMessages: ChatMessage[];
  onSendMessage: (textToSend?: string) => void;
  inputChatText: string;
  onChangeInputChatText: (text: string) => void;
  isChatSending: boolean;
  selectedDistrict: AdminFeature | null;
  selectedHazard: HazardType;
}

export const MaximizedChatModal: React.FC<MaximizedChatModalProps> = ({
  isOpen,
  onClose,
  chatMessages,
  onSendMessage,
  inputChatText,
  onChangeInputChatText,
  isChatSending,
  selectedDistrict,
  selectedHazard,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 lg:p-6 max-sm:p-0 animate-fadeIn select-text">
      <div className="bg-white border border-slate-200 max-sm:border-0 rounded-2xl max-sm:rounded-none shadow-2xl w-[95vw] max-w-5xl lg:max-w-6xl h-[86vh] max-h-[820px] max-sm:h-[100dvh] max-sm:w-full max-sm:max-h-none flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 sm:px-6 sm:py-4.5 bg-gradient-to-r from-emerald-50 via-white to-amber-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-800 text-sm sm:text-base tracking-tight truncate">
                  Tanya AI Bencana
                </h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-mono font-bold border border-emerald-200">
                  RADAR AI COPILOT
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate font-mono mt-0.5">
                Konteks Spasial: <strong className="text-emerald-700 font-semibold">{selectedDistrict?.properties?.name || 'Kabupaten Banjarnegara'}</strong> • Bahaya: <strong className="text-amber-700 uppercase font-bold">{selectedHazard}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-slate-100 text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Tutup Modal"
            >
              <span className="hidden sm:inline">Tutup</span>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Chat Message History Body */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 lg:p-7 space-y-4 sm:space-y-5 bg-slate-50/60">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shrink-0 shadow-xs text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-amber-100 border border-amber-300 text-amber-800'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                ) : (
                  <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </div>
              <div
                className={`p-4 sm:p-5 rounded-2xl max-w-[88%] lg:max-w-[84%] leading-relaxed text-xs sm:text-sm shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-xs'
                }`}
              >
                <ChatMessageRenderer content={msg.text} isUser={msg.sender === 'user'} />
                <span
                  className={`text-[10px] block mt-2 text-right font-mono ${
                    msg.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isChatSending && (
            <div className="flex items-center gap-2.5 text-slate-600 text-xs py-2.5 bg-white p-3.5 rounded-xl border border-slate-200 inline-flex shadow-xs">
              <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
              <span className="font-medium">RADAR AI sedang merumuskan analisis spasial &amp; rekomendasi mitigasi...</span>
            </div>
          )}
        </div>

        {/* Quick Chips & Chat Input Form Footer with generous bottom padding */}
        <div className="p-4 sm:px-6 pt-3 sm:pt-4 pb-5 sm:pb-6 bg-white border-t border-slate-200 space-y-3 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-xs text-slate-500 font-semibold shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Pertanyaan Cepat:</span>
            </span>
            <button
              type="button"
              onClick={() => onSendMessage('Apa rekomendasi mitigasi bencana untuk wilayah yang sedang saya buka ini?')}
              className="text-xs bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 text-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer shrink-0 font-medium shadow-2xs"
            >
              📍 Rekomendasi mitigasi wilayah ini
            </button>
            <button
              type="button"
              onClick={() => onSendMessage('Fasilitas kritis apa saja yang rentan terdampak di lokasi ini?')}
              className="text-xs bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 text-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer shrink-0 font-medium shadow-2xs"
            >
              🏥 Fasilitas kritis yang rentan
            </button>
            <button
              type="button"
              onClick={() => onSendMessage('Bagaimana nomor dan kontak protokol darurat BPBD Kabupaten Banjarnegara?')}
              className="text-xs bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 text-slate-700 px-3.5 py-1.5 rounded-xl border border-slate-200 transition-all cursor-pointer shrink-0 font-medium shadow-2xs"
            >
              📞 Nomor kontak darurat BPBD
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSendMessage();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputChatText}
              onChange={(e) => onChangeInputChatText(e.target.value)}
              placeholder="Ketik pertanyaan kebencanaan, analisis spasial GEE, atau rekomendasi mitigasi di sini..."
              disabled={isChatSending}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-800 placeholder:text-slate-400 shadow-inner transition-all"
            />
            <button
              type="submit"
              disabled={isChatSending || !inputChatText.trim()}
              className="px-6 sm:px-7 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/30 shrink-0"
            >
              <span>Kirim</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
