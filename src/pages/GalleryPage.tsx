import React, { useState } from 'react';
import { 
  FileText, 
  ArrowLeft, 
  Heart, 
  Calendar, 
  Maximize2, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Trash2,
  Image as ImageIcon,
  Sparkles,
  User
} from 'lucide-react';
import { GalleryItem } from '../types';
import { useAuth } from '../lib/AuthContext';
import { ConfirmModal, ConfirmState } from '../components/ConfirmModal';
import { ToastContainer, ToastMessage } from '../components/Toast';

interface GalleryPageProps {
  galleryItems: GalleryItem[];
  onBackToHome: () => void;
  onOpenGalleryEditor: () => void;
  onDeleteGalleryItem: (id: string) => Promise<void>;
  onLikeGalleryItem: (id: string) => void;
}

export const GalleryPage: React.FC<GalleryPageProps> = ({ 
  galleryItems,
  onBackToHome,
  onOpenGalleryEditor,
  onDeleteGalleryItem,
  onLikeGalleryItem,
}) => {
  const { user, isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [activeItemIndex, setActiveItemIndex] = useState<number | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const categories = ['전체', '도예 및 조형', '원예 및 생태', '일상 제과제빵', '음악 및 리듬', '학급 이야기', '직업 및 자립'];

  const filteredItems = galleryItems.filter(item => {
    if (selectedCategory === '전체') return true;
    return item.category.includes(selectedCategory) || selectedCategory.includes(item.category);
  });

  const handleToggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onLikeGalleryItem(id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmState({
      isOpen: true,
      title: '활동 게시물 삭제',
      message: '이 게시물을 정말 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.',
      confirmText: '삭제하기',
      isDestructive: true,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await onDeleteGalleryItem(id);
          if (activeItemIndex !== null) {
            setActiveItemIndex(null);
          }
          addToast('게시물이 성공적으로 삭제되었습니다.', 'success');
        } catch (err: any) {
          console.error('Delete gallery error:', err);
          addToast('게시물 삭제 실패: ' + (err.message || '삭제 권한이 없습니다.'), 'error');
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const currentItem = activeItemIndex !== null ? filteredItems[activeItemIndex] : null;

  return (
    <div id="gallery-page-container" className="py-6 px-4 sm:px-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">

      
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8ECE2]">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#5D8378] font-bold mb-1">
            <button 
              type="button" 
              onClick={onBackToHome}
              className="hover:text-[#1F8269] flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>홈으로</span>
            </button>
            <span>/</span>
            <span className="text-[#1F8269]">활동 이야기 마당</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173A31] flex items-center gap-3">
            <span>특수학급 활동 이야기 & 게시판</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E5F7F1] text-[#1E6854] border border-[#C2EADE]">
              실시간 참여 소통
            </span>
          </h1>
          <p className="text-xs text-[#63877D] mt-1 font-medium">
            사진과 글을 통해 특수학급의 다채로운 활동과 성장의 발자취를 함께 나눕니다.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <button
              type="button"
              onClick={onOpenGalleryEditor}
              className="px-4 py-2.5 rounded-2xl bg-[#22836B] hover:bg-[#1A6B57] text-white font-extrabold text-xs clay-btn shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>새 이야기 작성</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBackToHome}
            className="self-start sm:self-auto px-4 py-2.5 rounded-2xl bg-white border border-[#D5EBE2] text-[#446C60] hover:bg-[#F2FAF6] font-bold text-xs clay-btn shadow-xs cursor-pointer"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="clay-card p-4 border border-[#D8ECE2] flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#22836B] text-white shadow-xs'
                  : 'bg-[#F2FAF6] text-[#487063] hover:bg-[#E3F4ED]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="text-xs font-bold text-[#6D9387]">
          총 {filteredItems.length}개의 이야기
        </span>
      </div>

      {/* Post Cards Grid */}
      {filteredItems.length === 0 ? (
        <div className="clay-card p-12 text-center text-sm font-bold text-[#6D9488] border border-[#D5EBE1] space-y-3">
          <FileText className="w-12 h-12 text-[#22836B] mx-auto opacity-70" />
          <p>등록된 활동 이야기가 없습니다.</p>
          {user && (
            <button
              type="button"
              onClick={onOpenGalleryEditor}
              className="px-4 py-2 rounded-xl bg-[#22836B] text-white text-xs font-bold clay-btn cursor-pointer inline-flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              <span>첫 이야기 작성하기</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => {
            const hasImage = Boolean(item.imageSrc && item.imageSrc.trim());
            const canDelete = isAdmin || (user && user.uid === item.authorUid);

            return (
              <div
                key={item.id}
                onClick={() => setActiveItemIndex(index)}
                className="group clay-card overflow-hidden hover:scale-[1.02] transition-all duration-300 border border-white hover:border-[#B2E4D5] shadow-md hover:shadow-xl cursor-pointer flex flex-col justify-between"
              >
                {/* Visual Header */}
                {hasImage ? (
                  <div className="relative aspect-4/3 overflow-hidden bg-gradient-to-br from-[#E2F5EE] to-[#FFF6E3]">
                    <img 
                      src={item.imageSrc} 
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3 justify-between">
                      <span className="text-white text-xs font-bold flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-lg">
                        <Maximize2 className="w-3.5 h-3.5" />
                        상세보기
                      </span>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1.5 rounded-xl bg-black/60 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                          title="게시물 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-xl bg-white/90 backdrop-blur-xs text-[#1E6854] text-[11px] font-extrabold shadow-xs">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gradient-to-br from-[#EBF7F2] via-[#F2FAF6] to-[#FFF8ED] border-b border-[#D8EDE4] flex items-center justify-between">
                    <span className="px-3 py-1 rounded-xl bg-white text-[#1E6854] text-[11px] font-extrabold border border-[#C5E8DC] shadow-2xs">
                      {item.category}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-white text-[#22836B] flex items-center justify-center shadow-2xs">
                        <FileText className="w-4 h-4" />
                      </span>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1 text-[#C44A4A] hover:text-[#962626] transition-colors cursor-pointer"
                          title="게시물 삭제"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Info Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="font-extrabold text-base text-[#1A3D33] group-hover:text-[#22836B] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-[#5D8177] line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Bottom Meta */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#EAF3EE] text-xs text-[#7B9F95]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {item.date}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleToggleLike(item.id, e)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF5F2] hover:bg-[#FFE3DC] text-[#DE5D4E] font-bold text-xs transition-colors cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 fill-[#DE5D4E]" />
                      <span>{item.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Detail Modal */}
      {currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl space-y-0 flex flex-col max-h-[90vh]">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setActiveItemIndex(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Optional Image Stage */}
            {currentItem.imageSrc && (
              <div className="relative aspect-16/9 bg-slate-900 flex items-center justify-center shrink-0">
                <img 
                  src={currentItem.imageSrc} 
                  alt={currentItem.title}
                  referrerPolicy="no-referrer"
                  className="max-h-full max-w-full object-contain"
                />
              </div>
            )}

            {/* Content Body */}
            <div className="p-6 sm:p-8 bg-white space-y-4 overflow-y-auto flex-1">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-xl bg-[#E3F6F0] text-[#1E6854] text-xs font-extrabold border border-[#C5E8DC]">
                  {currentItem.category}
                </span>
                <div className="flex items-center gap-3 text-xs text-[#7B9F95]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {currentItem.date}
                  </span>
                  {currentItem.authorName && (
                    <span className="flex items-center gap-1 font-bold text-[#4B7368]">
                      <User className="w-3.5 h-3.5" />
                      {currentItem.authorName}
                    </span>
                  )}
                </div>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-[#173C31] leading-snug">
                {currentItem.title}
              </h2>

              <div className="p-4 rounded-2xl bg-[#F8FCFA] border border-[#E3F2EB] text-xs sm:text-sm text-[#385E53] leading-relaxed whitespace-pre-wrap">
                {currentItem.description}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={(e) => handleToggleLike(currentItem.id, e)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FFF5F2] hover:bg-[#FFE3DC] text-[#DE5D4E] font-bold text-xs transition-colors cursor-pointer"
                >
                  <Heart className="w-4 h-4 fill-[#DE5D4E]" />
                  <span>공감 좋아요 {currentItem.likes}</span>
                </button>

                <button
                  type="button"
                  onClick={(e) => handleDelete(currentItem.id, e)}
                  className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>게시물 삭제</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmModal
        confirmState={confirmState}
        onClose={() => setConfirmState(null)}
        isLoading={isDeleting}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

    </div>
  );
};

