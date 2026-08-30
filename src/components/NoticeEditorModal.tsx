import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Pin
} from 'lucide-react';
import { NoticeItem } from '../types';
import { useAuth } from '../lib/AuthContext';

interface NoticeEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (notice: Omit<NoticeItem, 'id' | 'views'>, editId?: string) => Promise<void>;
  editNotice: NoticeItem | null;
}

export const NoticeEditorModal: React.FC<NoticeEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editNotice,
}) => {
  const { user, adminData } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('학급 공지');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = ['학급 공지', '교육과정', '가정통신', '체험학습', '치료지원 & 복지', '진로직업'];

  useEffect(() => {
    if (editNotice) {
      setTitle(editNotice.title);
      setCategory(editNotice.category);
      setSummary(editNotice.summary);
      setContent(editNotice.content || editNotice.summary);
      setIsPinned(!!editNotice.isPinned);
    } else {
      setTitle('');
      setCategory('학급 공지');
      setSummary('');
      setContent('');
      setIsPinned(false);
    }
    setError('');
  }, [editNotice, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('공지 제목을 입력해주세요.');
      return;
    }
    if (!content.trim()) {
      setError('공지 본문 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const generatedSummary = summary.trim() || content.trim().slice(0, 100) + '...';
      const noticePayload: Omit<NoticeItem, 'id' | 'views'> = {
        title: title.trim(),
        category,
        summary: generatedSummary,
        content: content.trim(),
        date: editNotice ? editNotice.date : new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
        author: adminData?.name || user?.displayName || '특수학급 담당교사',
        isPinned,
      };

      await onSave(noticePayload, editNotice?.id);
      onClose();
    } catch (err: any) {
      setError(err.message || '저장 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="clay-card w-full max-w-2xl bg-white border-2 border-[#D8ECE2] shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#1E5C4A] to-[#2B7A64] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-[#86EFCE]" />
            <h2 className="text-base sm:text-lg font-extrabold">
              {editNotice ? '공지사항 수정' : '새 공지사항 등록'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-[#FFF0F0] text-[#D03030] text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Category selection */}
          <div>
            <label className="block text-xs font-bold text-[#355B50] mb-1.5">
              분류 카테고리
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-[#2B7A64] text-white shadow-xs'
                      : 'bg-[#F2FAF6] text-[#476F62] hover:bg-[#E2F5EC]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-[#355B50] mb-1">
              공지 제목 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 2026학년도 2학기 개별화교육지원팀(IEP) 협의회 개최 안내"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F6FBF9] border border-[#CFE7DD] text-xs sm:text-sm font-bold text-[#1C4538] focus:outline-none focus:border-[#2B7A64]"
            />
          </div>

          {/* Summary */}
          <div>
            <label className="block text-xs font-bold text-[#355B50] mb-1">
              간략 요약 (목록에 표시될 설명)
            </label>
            <input
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="비워두시면 본문 앞부분이 자동으로 적용됩니다."
              className="w-full px-4 py-2 rounded-xl bg-[#F6FBF9] border border-[#CFE7DD] text-xs font-medium text-[#1C4538] focus:outline-none focus:border-[#2B7A64]"
            />
          </div>

          {/* Detailed Content */}
          <div>
            <label className="block text-xs font-bold text-[#355B50] mb-1">
              상세 본문 내용 <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={7}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="공지사항의 상세 내용을 입력해주세요. 줄바꿈이 그대로 보존됩니다."
              className="w-full p-4 rounded-xl bg-[#F6FBF9] border border-[#CFE7DD] text-xs sm:text-sm font-normal text-[#1C4538] leading-relaxed focus:outline-none focus:border-[#2B7A64]"
            />
          </div>

          {/* Options */}
          <div className="flex items-center justify-between pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#335E52]">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="w-4 h-4 rounded text-[#2B7A64] focus:ring-0 cursor-pointer"
              />
              <Pin className="w-3.5 h-3.5 text-[#E59819]" />
              <span>상단 고정 중요 공지로 등록</span>
            </label>

            <span className="text-[11px] text-[#6F958A]">
              작성자: {adminData?.name || user?.displayName || '관리자'}
            </span>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#E8F4EE]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white border border-[#D5ECE2] text-[#4F786C] hover:bg-[#F2FAF6] font-bold text-xs cursor-pointer"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl bg-[#2B7A64] hover:bg-[#206351] text-white font-bold text-xs clay-btn shadow-md cursor-pointer flex items-center gap-1.5"
            >
              {submitting ? '저장 중...' : editNotice ? '수정 완료' : '공지사항 게시'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
