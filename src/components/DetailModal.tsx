import React, { useState } from 'react';
import { X, Calendar, Heart, User, FileText, Trash2, Edit, AlertTriangle, Check, Loader2 } from 'lucide-react';
import { NoticeItem, GalleryItem, QuickMenuItem } from '../types';
import { useAuth } from '../lib/AuthContext';

export type ModalData = 
  | { type: 'notice'; data: NoticeItem }
  | { type: 'gallery'; data: GalleryItem }
  | { type: 'quickMenu'; data: QuickMenuItem };

interface DetailModalProps {
  modalData: ModalData | null;
  onClose: () => void;
  onDeleteNotice?: (id: string) => Promise<void>;
  onDeleteGalleryItem?: (id: string) => Promise<void>;
  onEditNotice?: (item: NoticeItem) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ 
  modalData, 
  onClose,
  onDeleteNotice,
  onDeleteGalleryItem,
  onEditNotice,
}) => {
  const { user, isAdmin } = useAuth();
  const [confirmingNoticeDelete, setConfirmingNoticeDelete] = useState(false);
  const [confirmingGalleryDelete, setConfirmingGalleryDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!modalData) return null;

  const handleDeleteNoticeFromModal = async (id: string) => {
    setIsDeleting(true);
    try {
      if (onDeleteNotice) {
        await onDeleteNotice(id);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to delete notice:', err);
    } finally {
      setIsDeleting(false);
      setConfirmingNoticeDelete(false);
    }
  };

  const handleDeleteGalleryFromModal = async (id: string) => {
    setIsDeleting(true);
    try {
      if (onDeleteGalleryItem) {
        await onDeleteGalleryItem(id);
      }
      onClose();
    } catch (err: any) {
      console.error('Failed to delete gallery item:', err);
    } finally {
      setIsDeleting(false);
      setConfirmingGalleryDelete(false);
    }
  };

  return (
    <div 
      id="portal-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        id="portal-modal-content"
        className="clay-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 bg-white border-2 border-white/90 shadow-2xl relative animate-scaleUp rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          id="btn-close-modal"
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-[#EBF6F1] hover:bg-[#D7EFE5] text-[#2D5A4E] flex items-center justify-center transition-colors clay-pill cursor-pointer"
          title="닫기"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Type Specific Content */}
        {modalData.type === 'notice' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-xl bg-[#E6F7F1] text-[#1E765F] font-extrabold text-xs">
                {modalData.data.category}
              </span>
              {modalData.data.isPinned && (
                <span className="px-2.5 py-0.5 rounded-lg bg-[#FFEFA8] text-[#8C6400] font-bold text-xs">
                  📌 중요공지
                </span>
              )}
              <span className="text-xs text-[#7B9E94] flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {modalData.data.date}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-extrabold text-[#1B3C32] leading-snug">
              {modalData.data.title}
            </h3>

            <div className="clay-inset p-5 sm:p-6 rounded-2xl space-y-4 text-xs sm:text-sm text-[#274B40] leading-relaxed whitespace-pre-wrap">
              {modalData.data.summary && (
                <div className="p-3 bg-white/80 rounded-xl font-bold text-[#1E5C4B] border border-[#D5ECE2]">
                  {modalData.data.summary}
                </div>
              )}
              <div className="text-[#33594F]">
                {modalData.data.content || modalData.data.summary || '상세 내용이 없습니다.'}
              </div>

              <div className="pt-3 border-t border-[#D7ECE3] flex items-center justify-between text-xs text-[#5D8177]">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  작성자: {modalData.data.author || '특수교육지원실'}
                </span>
                <span>조회수: {modalData.data.views}회</span>
              </div>
            </div>

            {/* Inline Confirm Deletion Banner */}
            {confirmingNoticeDelete && (
              <div className="p-4 rounded-2xl bg-[#FFF0F0] border border-[#FFD0D0] flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-bold text-[#D03030]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>이 공지사항을 정말 삭제하시겠습니까?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingNoticeDelete(false)}
                    disabled={isDeleting}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#FFD0D0] text-xs font-bold text-[#666] hover:bg-gray-50 cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteNoticeFromModal(modalData.data.id)}
                    disabled={isDeleting}
                    className="px-3 py-1.5 rounded-xl bg-[#D03030] text-white text-xs font-bold hover:bg-[#B02020] flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    <span>네, 삭제합니다</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-2">
              <div>
                {onDeleteNotice && (
                  <div className="flex items-center gap-2">
                    {onEditNotice && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onEditNotice(modalData.data);
                        }}
                        className="px-3 py-2 rounded-xl bg-[#EAF5FF] text-[#1E67B6] hover:bg-[#D5E9FF] font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>수정</span>
                      </button>
                    )}
                    {!confirmingNoticeDelete && (
                      <button
                        type="button"
                        onClick={() => setConfirmingNoticeDelete(true)}
                        className="px-3 py-2 rounded-xl bg-[#FFF0F0] text-[#D03030] hover:bg-[#FFE0E0] font-bold text-xs flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>삭제</span>
                      </button>
                    )}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#3EB895] text-white font-bold text-xs clay-btn cursor-pointer"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        )}

        {modalData.type === 'gallery' && (
          <div className="space-y-5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-[#FFF5D6] text-[#B08000] font-extrabold text-xs">
                {modalData.data.category}
              </span>
              <span className="text-xs text-[#7B9E94]">
                작성자: {modalData.data.authorName || '학급 친구'} · {modalData.data.date}
              </span>
            </div>

            {/* Optional Image */}
            {modalData.data.imageSrc && modalData.data.imageSrc.trim().length > 0 && (
              <div className="rounded-2xl overflow-hidden border-2 border-[#E7F3EE] shadow-sm max-h-80 flex items-center justify-center bg-[#F4F9F7]">
                <img
                  src={modalData.data.imageSrc}
                  alt={modalData.data.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-auto max-h-80 object-contain"
                />
              </div>
            )}

            <h3 className="text-lg sm:text-xl font-extrabold text-[#1B3C32]">
              {modalData.data.title}
            </h3>

            <div className="clay-inset p-4 rounded-2xl text-xs sm:text-sm text-[#3E6157]">
              <p className="font-medium leading-relaxed whitespace-pre-wrap">{modalData.data.description || '등록된 내용이 없습니다.'}</p>
            </div>

            {/* Inline Confirm Deletion Banner for Gallery */}
            {confirmingGalleryDelete && (
              <div className="p-4 rounded-2xl bg-[#FFF0F0] border border-[#FFD0D0] flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                <div className="flex items-center gap-2 text-xs font-bold text-[#D03030]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>이 게시물을 정말 삭제하시겠습니까?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingGalleryDelete(false)}
                    disabled={isDeleting}
                    className="px-3 py-1.5 rounded-xl bg-white border border-[#FFD0D0] text-xs font-bold text-[#666] hover:bg-gray-50 cursor-pointer"
                  >
                    취소
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGalleryFromModal(modalData.data.id)}
                    disabled={isDeleting}
                    className="px-3 py-1.5 rounded-xl bg-[#D03030] text-white text-xs font-bold hover:bg-[#B02020] flex items-center gap-1 cursor-pointer shadow-xs"
                  >
                    {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    <span>네, 삭제합니다</span>
                  </button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#E05252] flex items-center gap-1">
                  <Heart className="w-4 h-4 fill-current" />
                  {modalData.data.likes}명이 응원합니다
                </span>

                {onDeleteGalleryItem && !confirmingGalleryDelete && (
                  <button
                    type="button"
                    onClick={() => setConfirmingGalleryDelete(true)}
                    className="px-3 py-1.5 rounded-xl bg-[#FFF0F0] text-[#D03030] hover:bg-[#FFE0E0] font-bold text-xs flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>게시물 삭제</span>
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#3EB895] text-white font-bold text-xs clay-btn cursor-pointer"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        )}

        {modalData.type === 'quickMenu' && (
          <div className="space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-2xl p-1 bg-white shadow-xs border border-[#E3F1EC]">
                <img
                  src={modalData.data.imageSrc}
                  alt={modalData.data.iconAlt}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-lg bg-[#E5F5EF] text-[#22725D] text-[11px] font-extrabold">
                  {modalData.data.badge}
                </span>
                <h3 className="text-xl font-extrabold text-[#183B32]">
                  {modalData.data.title} 안내
                </h3>
              </div>
            </div>

            <div className="clay-inset p-5 rounded-2xl space-y-3 text-xs sm:text-sm text-[#3C5E55] leading-relaxed">
              <p className="font-bold text-[#1E483C]">
                {modalData.data.subTitle} · {modalData.data.title}
              </p>
              <p>{modalData.data.description}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#3EB895] text-white font-bold text-xs clay-btn cursor-pointer"
              >
                확인 및 닫기
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

