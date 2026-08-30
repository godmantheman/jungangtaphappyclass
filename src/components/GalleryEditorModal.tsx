import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Image as ImageIcon, 
  AlertCircle,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { GalleryItem } from '../types';
import { useAuth } from '../lib/AuthContext';

interface GalleryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<GalleryItem, 'id' | 'likes'>) => Promise<void>;
}

export const GalleryEditorModal: React.FC<GalleryEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('도예 및 조형');
  const [description, setDescription] = useState('');
  const [imageSrc, setImageSrc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const categories = ['도예 및 조형', '원예 및 생태', '일상 제과제빵', '음악 및 리듬', '학급 이야기', '직업 및 자립'];

  // Presets for convenience
  const imagePresets = [
    { label: '도예/조형', url: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?auto=format&fit=crop&w=800&q=80' },
    { label: '원예/화분', url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=800&q=80' },
    { label: '제과제빵', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80' },
    { label: '음악/악기', url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80' },
  ];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('게시물 제목을 입력해주세요.');
      return;
    }
    if (!description.trim()) {
      setError('게시물 내용을 입력해주세요.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await onSave({
        title: title.trim(),
        category,
        description: description.trim(),
        imageSrc: imageSrc.trim() || undefined, // 사진 없어도 등록 가능!
        date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
        authorName: user?.displayName || user?.email?.split('@')[0] || '특수학급',
        authorUid: user?.uid,
      });
      onClose();
      setTitle('');
      setDescription('');
      setImageSrc('');
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
        className="clay-card w-full max-w-xl bg-white border-2 border-[#D8ECE2] shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#1E6854] via-[#22836B] to-[#E59819] text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FileText className="w-5 h-5" />
            <div>
              <h2 className="text-base sm:text-lg font-extrabold">새 활동 게시물 작성</h2>
              <p className="text-[11px] text-white/80">사진 첨부는 선택사항이며 글만으로도 작성할 수 있습니다.</p>
            </div>
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

          {/* Category */}
          <div>
            <label className="block text-xs font-bold text-[#355B50] mb-1.5">
              활동 분야 선택
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    category === cat
                      ? 'bg-[#22836B] text-white shadow-xs'
                      : 'bg-[#F0FAF5] text-[#346F5F] hover:bg-[#E0F5EC]'
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
              게시물 제목 <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 향기로운 봄맞이 허브 화분 심기 활동"
              className="w-full px-4 py-2.5 rounded-xl bg-[#F8FCF9] border border-[#CFE9DD] text-xs sm:text-sm font-bold text-[#1C4538] focus:outline-none focus:border-[#22836B]"
            />
          </div>

          {/* Content / Description */}
          <div>
            <label className="block text-xs font-bold text-[#355B50] mb-1">
              활동 내용 및 이야기 <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="활동에 참여한 학생들의 이야기, 배움 내용, 소감 등을 자유롭게 적어주세요."
              className="w-full p-3 rounded-xl bg-[#F8FCF9] border border-[#CFE9DD] text-xs text-[#1C4538] leading-relaxed focus:outline-none focus:border-[#22836B]"
            />
          </div>

          {/* Image URL (Optional) */}
          <div className="p-3.5 rounded-2xl bg-[#FFF9EE] border border-[#FFE7B8] space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-[#8C6200] flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-[#E59819]" />
                <span>사진 첨부 (선택사항)</span>
              </label>
              <span className="text-[10px] text-[#A87A00] font-semibold">사진 없이 글만 올리셔도 됩니다</span>
            </div>
            
            <input
              type="url"
              value={imageSrc}
              onChange={(e) => setImageSrc(e.target.value)}
              placeholder="https://... 이미지 웹 주소 (선택)"
              className="w-full px-3 py-2 rounded-xl bg-white border border-[#FFE7B8] text-xs font-medium text-[#1C4538] focus:outline-none focus:border-[#E59819]"
            />

            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[10px] font-bold text-[#8C6200]">샘플 사진:</span>
              {imagePresets.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setImageSrc(p.url)}
                  className="px-2 py-0.5 rounded-lg bg-white hover:bg-[#FFEFCF] text-[#8C6200] border border-[#FFE0A3] text-[10px] font-bold cursor-pointer"
                >
                  {p.label}
                </button>
              ))}
              {imageSrc && (
                <button
                  type="button"
                  onClick={() => setImageSrc('')}
                  className="px-2 py-0.5 rounded-lg bg-rose-50 text-rose-600 text-[10px] font-bold cursor-pointer"
                >
                  사진 제거
                </button>
              )}
            </div>

            {/* Preview if image URL exists */}
            {imageSrc && (
              <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-slate-100 border border-[#FFE7B8] mt-2">
                <img 
                  src={imageSrc} 
                  alt="미리보기" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
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
              className="px-6 py-2.5 rounded-xl bg-[#22836B] hover:bg-[#186854] text-white font-bold text-xs clay-btn shadow-md cursor-pointer flex items-center gap-1.5"
            >
              {submitting ? '게시 중...' : '게시물 등록'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
