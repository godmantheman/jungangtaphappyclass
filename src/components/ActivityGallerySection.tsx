import React from 'react';
import { 
  FileText, 
  ArrowRight, 
  Heart, 
  Plus, 
  Calendar,
  Image as ImageIcon,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { GalleryItem } from '../types';
import { useAuth } from '../lib/AuthContext';

interface ActivityGallerySectionProps {
  galleryItems: GalleryItem[];
  onSelectGallery: (item: GalleryItem) => void;
  onViewAll: () => void;
  onOpenGalleryEditor: () => void;
  onLikeGalleryItem: (id: string) => void;
}

export const ActivityGallerySection: React.FC<ActivityGallerySectionProps> = ({
  galleryItems,
  onSelectGallery,
  onViewAll,
  onOpenGalleryEditor,
  onLikeGalleryItem,
}) => {
  const { user, isAdmin } = useAuth();
  const displayItems = galleryItems.slice(0, 4);

  return (
    <section id="portal-gallery-section" className="space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-7 h-7 rounded-lg bg-[#FFF2DA] text-[#A66E00] flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold text-[#A66E00]">
              배움과 소통의 이야기
            </span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#173C31] tracking-tight">
            특수학급 생생 활동 이야기
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {user && (
            <button
              type="button"
              onClick={onOpenGalleryEditor}
              className="px-3.5 py-2 rounded-xl bg-[#22836B] hover:bg-[#1A6B57] text-white font-bold text-xs clay-btn shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>이야기 작성</span>
            </button>
          )}

          <button
            type="button"
            onClick={onViewAll}
            className="px-4 py-2 rounded-xl bg-white border border-[#D5EBE2] text-[#3B6C5F] hover:bg-[#F2FAF6] font-bold text-xs clay-pill cursor-pointer flex items-center gap-1.5 transition-colors"
          >
            <span>전체보기</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#3EB895]" />
          </button>
        </div>
      </div>

      {/* Posts Grid */}
      {displayItems.length === 0 ? (
        <div className="clay-card p-10 text-center text-xs font-bold text-[#6D9488] border border-dashed border-[#CFE7DD] rounded-3xl space-y-2">
          <p>등록된 활동 이야기가 없습니다.</p>
          {user && (
            <button
              type="button"
              onClick={onOpenGalleryEditor}
              className="px-3.5 py-1.5 bg-[#22836B] text-white rounded-lg text-xs font-bold cursor-pointer inline-flex items-center gap-1 mt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>첫 활동 이야기 작성하기</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {displayItems.map((item) => {
            const hasImage = Boolean(item.imageSrc && item.imageSrc.trim());

            return (
              <div
                key={item.id}
                onClick={() => onSelectGallery(item)}
                className="group clay-card overflow-hidden hover:scale-[1.02] transition-all duration-300 border border-white hover:border-[#B2E4D5] shadow-md hover:shadow-xl cursor-pointer flex flex-col justify-between"
              >
                {/* Visual Header / Image Box */}
                {hasImage ? (
                  <div className="relative aspect-4/3 overflow-hidden bg-gradient-to-br from-[#E2F5EE] to-[#FFF6E3]">
                    <img 
                      src={item.imageSrc} 
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    />
                    <div className="absolute top-2.5 left-2.5">
                      <span className="px-2.5 py-0.5 rounded-lg bg-white/90 backdrop-blur-xs text-[#1E6854] text-[10px] font-extrabold shadow-2xs">
                        {item.category}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-gradient-to-br from-[#F0FAF6] via-[#F5FCF9] to-[#FFF9EE] border-b border-[#E3F4ED] flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-lg bg-white text-[#1E6854] text-[10px] font-extrabold border border-[#D5EFE6]">
                      {item.category}
                    </span>
                    <span className="w-6 h-6 rounded-full bg-white text-[#3EB895] flex items-center justify-center shadow-2xs">
                      <FileText className="w-3.5 h-3.5" />
                    </span>
                  </div>
                )}

                {/* Text Info */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-extrabold text-sm text-[#1A3D33] group-hover:text-[#1E6854] transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-[#5D8177] line-clamp-3 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#EAF3EE] text-[11px] text-[#7B9F95]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {item.date}
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onLikeGalleryItem(item.id);
                      }}
                      className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#FFF5F2] hover:bg-[#FFE3DC] text-[#DE5D4E] font-bold text-[11px] transition-colors cursor-pointer"
                    >
                      <Heart className="w-3 h-3 fill-[#DE5D4E]" />
                      <span>{item.likes}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
