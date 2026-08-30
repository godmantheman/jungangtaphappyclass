import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  isDestructive?: boolean;
  onConfirm: () => Promise<void> | void;
}

interface ConfirmModalProps {
  confirmState: ConfirmState | null;
  onClose: () => void;
  isLoading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  confirmState,
  onClose,
  isLoading = false,
}) => {
  if (!confirmState || !confirmState.isOpen) return null;

  const handleConfirm = async () => {
    try {
      await confirmState.onConfirm();
    } finally {
      onClose();
    }
  };

  return (
    <div 
      id="portal-confirm-backdrop"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="portal-confirm-box"
        className="clay-card w-full max-w-md bg-white border-2 border-[#FDE8E8] shadow-2xl rounded-3xl p-6 relative animate-scaleUp text-center space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-[#F2F7F5] text-[#5C8276] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-[#FFF0F0] text-[#E03131] flex items-center justify-center mx-auto shadow-xs">
          <Trash2 className="w-7 h-7" />
        </div>

        <div className="space-y-1.5">
          <h3 className="text-lg font-extrabold text-[#1F3D34]">
            {confirmState.title || '항목 삭제'}
          </h3>
          <p className="text-xs sm:text-sm text-[#4E7569] leading-relaxed whitespace-pre-wrap">
            {confirmState.message || '정말 이 항목을 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.'}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#F0F5F3] hover:bg-[#E2EBE7] text-[#335C4F] font-bold text-xs sm:text-sm clay-btn cursor-pointer transition-colors"
          >
            취소
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 px-4 rounded-xl bg-[#E03131] hover:bg-[#C92A2A] text-white font-bold text-xs sm:text-sm clay-btn shadow-md cursor-pointer transition-colors flex items-center justify-center gap-1.5"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>삭제 중...</span>
              </>
            ) : (
              <span>{confirmState.confirmText || '삭제하기'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
