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
    <div className="fixed inset-0 z-[9999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-fadeIn select-text">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-5xl h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 md:px-6 bg-gradient-to-r from-emerald-50 via-white to-amber-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <span>Tanya AI Bencana — Mode Layar Penuh (Fullscreen)</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold border border-emerald-200">
                  Qwen 2.5
                </span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Konteks Wilayah Aktif: <strong className="text-emerald-700 font-semibold">{selectedDistrict?.properties?.name || 'Banjarnegara (Keseluruhan)'}</strong> • Ancaman: <strong className="text-amber-700 font-mono uppercase font-bold">{selectedHazard}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl font-semibold text-xs border border-slate-200 transition-all flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
            >
              <Minimize2 className="w-4 h-4 text-emerald-600" />
              <span>Kembali (Minimize)</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Chat Message History Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/60">
          {chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs text-xs font-bold ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-100 border border-amber-300 text-amber-800'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div
                className={`p-4 rounded-2xl max-w-[82%] leading-relaxed text-xs md:text-sm shadow-xs ${
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
            <div className="flex items-center gap-2 text-slate-500 text-xs py-2 bg-white/80 p-3 rounded-xl border border-slate-200 inline-flex shadow-xs">
              <span className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
              <span>Qwen AI sedang merumuskan analisis spasial & mitigasi bencana...</span>
            </div>
          )}
        </div>

        {/* Quick Chips & Chat Input Form Footer */}
        <div className="p-4 md:px-6 bg-white border-t border-slate-200 space-y-3 shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-xs text-slate-500 font-semibold shrink-0 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Pertanyaan Cepat:</span>
            </span>
            <button
              type="button"
              onClick={() => onSendMessage('Apa rekomendasi mitigasi bencana untuk wilayah yang sedang saya buka ini?')}
              className="text-xs bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer shrink-0 font-medium"
            >
              Rekomendasi mitigasi wilayah ini
            </button>
            <button
              type="button"
              onClick={() => onSendMessage('Fasilitas kritis apa saja yang rentan terdampak di lokasi ini?')}
              className="text-xs bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer shrink-0 font-medium"
            >
              Fasilitas kritis yang rentan
            </button>
            <button
              type="button"
              onClick={() => onSendMessage('Bagaimana nomor dan kontak protokol darurat BPBD Kabupaten Banjarnegara?')}
              className="text-xs bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200 transition-all cursor-pointer shrink-0 font-medium"
            >
              Nomor kontak darurat BPBD
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputChatText}
              onChange={(e) => onChangeInputChatText(e.target.value)}
              placeholder="Ketik pertanyaan kebencanaan atau analisis spasial di sini..."
              disabled={isChatSending}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs md:text-sm focus:outline-none focus:border-emerald-500 focus:bg-white text-slate-800 placeholder:text-slate-400 shadow-inner"
            />
            <button
              type="submit"
              disabled={isChatSending || !inputChatText.trim()}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs md:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm shadow-emerald-600/30 shrink-0"
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
