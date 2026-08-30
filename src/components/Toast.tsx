import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-5 right-5 z-[110] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-2xl shadow-xl border animate-slideUp text-xs sm:text-sm font-bold ${
            toast.type === 'success'
              ? 'bg-[#18483B] text-white border-[#3EB895]'
              : toast.type === 'error'
              ? 'bg-[#7A1C1C] text-white border-[#F87171]'
              : 'bg-[#1E3A5F] text-white border-[#60A5FA]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-[#4EEDB8] shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-[#FCA5A5] shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 text-[#93C5FD] shrink-0" />}
            <span className="leading-snug">{toast.text}</span>
          </div>

          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="p-1 hover:bg-white/20 rounded-lg text-white/80 hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
