import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  FileText, 
  Image as ImageIcon, 
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { NoticeItem, GalleryItem } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigatePage: (page: string) => void;
  notices: NoticeItem[];
  galleryItems: GalleryItem[];
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onNavigatePage,
  notices,
  galleryItems,
}) => {
  const [query, setQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();

    const matchedNotices = notices.filter(
      n => n.title.toLowerCase().includes(q) || (n.summary && n.summary.toLowerCase().includes(q)) || (n.content && n.content.toLowerCase().includes(q)) || n.category.toLowerCase().includes(q)
    );

    const matchedGallery = galleryItems.filter(
      g => g.title.toLowerCase().includes(q) || g.description.toLowerCase().includes(q) || g.category.toLowerCase().includes(q)
    );

    const totalCount = matchedNotices.length + matchedGallery.length;

    return {
      notices: matchedNotices,
      gallery: matchedGallery,
      totalCount,
    };
  }, [query, notices, galleryItems]);

  if (!isOpen) return null;

  const handleSelectResult = (page: string) => {
    onNavigatePage(page);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/50 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="clay-card w-full max-w-2xl bg-white border-2 border-white shadow-2xl overflow-hidden rounded-3xl animate-scaleUp max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-4 sm:p-5 border-b border-[#E0EFEA] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#3EB895] shrink-0" />
          <input
            id="global-portal-search-input"
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="포털 내 검색 (공지사항 제목, 내용, 갤러리 작품 등)..."
            className="w-full bg-transparent text-sm sm:text-base font-bold text-[#1C453A] placeholder-[#799F94] focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="text-xs text-[#6A9084] hover:text-[#1F453A] bg-[#EFF7F4] px-2.5 py-1 rounded-xl clay-pill cursor-pointer"
            >
              지우기
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#EFF7F4] text-[#4A7165] hover:bg-[#E0F2EB] flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Tag Recommendations when empty */}
        {!query && (
          <div className="p-6 space-y-4 overflow-y-auto">
            <div className="flex items-center gap-2 text-xs font-extrabold text-[#2F584C]">
              <Sparkles className="w-4 h-4 text-[#3EB895]" />
              <span>추천 검색어</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['공지사항', '도예', '원예', '가정통신', '체험학습', '제과제빵', '동아리'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setQuery(tag)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#F0FAF5] hover:bg-[#E2F5ED] text-[#24705D] text-xs font-bold border border-[#D5EDE3] transition-colors cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-[#E8F3EE] text-xs text-[#6E9187] space-y-2">
              <p className="font-bold text-[#355F52]">바로가기 페이지:</p>
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => handleSelectResult('notices')}
                  className="p-3.5 rounded-2xl bg-[#F4FAF7] hover:bg-[#E5F5EE] text-left text-xs font-bold text-[#2A594B] cursor-pointer flex items-center justify-between"
                >
                  <span>공지마당 바로가기</span>
                  <ArrowRight className="w-4 h-4 text-[#3EB895]" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectResult('gallery')}
                  className="p-3.5 rounded-2xl bg-[#F4FAF7] hover:bg-[#E5F5EE] text-left text-xs font-bold text-[#2A594B] cursor-pointer flex items-center justify-between"
                >
                  <span>활동 갤러리 바로가기</span>
                  <ArrowRight className="w-4 h-4 text-[#E59819]" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results List */}
        {query && searchResults && (
          <div className="p-4 sm:p-6 overflow-y-auto space-y-4 divide-y divide-[#EBF4F0]">
            <div className="text-xs font-extrabold text-[#2F5A4D] flex items-center justify-between pb-2">
              <span>&apos;{query}&apos; 검색 결과 (총 {searchResults.totalCount}건)</span>
            </div>

            {searchResults.totalCount === 0 && (
              <div className="py-12 text-center text-xs font-bold text-[#6F9389]">
                검색된 결과가 없습니다. 다른 단어로 검색해보세요.
              </div>
            )}

            {/* Notice Results */}
            {searchResults.notices.length > 0 && (
              <div className="pt-3 space-y-2">
                <div className="text-[11px] font-bold text-[#1E7860] flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>공지사항 ({searchResults.notices.length})</span>
                </div>
                {searchResults.notices.map(n => (
                  <div
                    key={n.id}
                    onClick={() => handleSelectResult('notices')}
                    className="p-3 rounded-xl bg-[#F3FAF7] hover:bg-[#E4F5EE] cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-[#184236]">{n.title}</div>
                      <div className="text-[11px] text-[#60877C] line-clamp-1">{n.summary || n.content}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#3EB895] shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            )}

            {/* Gallery Results */}
            {searchResults.gallery.length > 0 && (
              <div className="pt-3 space-y-2">
                <div className="text-[11px] font-bold text-[#B07200] flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>갤러리 작품 ({searchResults.gallery.length})</span>
                </div>
                {searchResults.gallery.map(g => (
                  <div
                    key={g.id}
                    onClick={() => handleSelectResult('gallery')}
                    className="p-3 rounded-xl bg-[#FFF8EB] hover:bg-[#FFEFCF] cursor-pointer transition-colors flex items-center justify-between"
                  >
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-[#6D4906]">{g.title}</div>
                      <div className="text-[11px] text-[#8C6B26] line-clamp-1">{g.description}</div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#E59819] shrink-0 ml-2" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

