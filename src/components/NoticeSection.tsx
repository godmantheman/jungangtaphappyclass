import React, { useState } from 'react';
import { 
  FileText, 
  ArrowRight, 
  Sparkles, 
  Calendar, 
  Plus, 
  Eye, 
  Pin,
  ShieldCheck 
} from 'lucide-react';
import { NoticeItem } from '../types';
import { useAuth } from '../lib/AuthContext';

interface NoticeSectionProps {
  notices: NoticeItem[];
  onSelectNotice: (item: NoticeItem) => void;
  onViewAll: () => void;
  onOpenNoticeEditor: () => void;
}

export const NoticeSection: React.FC<NoticeSectionProps> = ({
  notices,
  onSelectNotice,
  onViewAll,
  onOpenNoticeEditor,
}) => {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('전체');

  const categories = ['전체', '학급 공지', '교육과정', '가정통신', '체험학습'];

  const filteredNotices = notices.filter(n => {
    if (activeTab === '전체') return true;
    return n.category === activeTab;
  });

  const displayNotices = filteredNotices.slice(0, 5);

  return (
    <section id="portal-notice-section" className="clay-card p-6 sm:p-8 border border-[#D5ECE2] space-y-6">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2EFE9]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#E5F5EE] text-[#1E775F] flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#173C31] flex items-center gap-2">
              <span>특수학급 공지마당</span>
            </h2>
          </div>
          <p className="text-xs text-[#5E8378]">
            실시간으로 등록되는 학급 중요 소식 및 가정통신 안내를 확인하세요.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenNoticeEditor}
              className="px-3.5 py-2 rounded-xl bg-[#22836B] hover:bg-[#1A6B57] text-white font-bold text-xs clay-btn shadow-xs cursor-pointer flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>공지 작성</span>
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

      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveTab(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === cat
                ? 'bg-[#22836B] text-white shadow-xs'
                : 'bg-[#F2FAF6] text-[#476E62] hover:bg-[#E3F4ED]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Notice List */}
      {displayNotices.length === 0 ? (
        <div className="py-10 text-center text-xs font-bold text-[#6D9488] bg-[#F7FCFA] rounded-2xl border border-dashed border-[#CFE7DD] space-y-2">
          <p>현재 등록된 공지사항이 없습니다.</p>
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenNoticeEditor}
              className="px-3.5 py-1.5 bg-[#22836B] text-white rounded-lg text-xs font-bold cursor-pointer"
            >
              새 공지 작성하기
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {displayNotices.map((item) => (
            <div
              key={item.id}
              onClick={() => onSelectNotice(item)}
              className={`p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group ${
                item.isPinned
                  ? 'bg-[#FFFDF7] border-[#FFE2A8]'
                  : 'bg-white border-[#E4F2EC] hover:border-[#3EB895] hover:bg-[#FAFDFC]'
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-md shrink-0 ${
                  item.isPinned 
                    ? 'bg-[#FFECC7] text-[#996300]' 
                    : 'bg-[#E7F7F1] text-[#1E775F]'
                }`}>
                  {item.category}
                </span>

                <div className="flex-1 space-y-0.5">
                  <h3 className="font-extrabold text-xs sm:text-sm text-[#183E34] group-hover:text-[#22836B] transition-colors line-clamp-1 flex items-center gap-1.5">
                    {item.isPinned && <Pin className="w-3 h-3 text-[#E59819] shrink-0" />}
                    <span>{item.title}</span>
                  </h3>
                  <p className="text-[11px] text-[#60887D] line-clamp-1">
                    {item.summary || item.content}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 text-[11px] text-[#7B9F94] shrink-0">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {item.date}
                </span>
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3" />
                  {item.views}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
