import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  ArrowLeft, 
  Plus, 
  Eye, 
  Calendar, 
  Pin, 
  ChevronLeft, 
  ChevronRight, 
  Printer, 
  Share2, 
  Volume2, 
  Trash2, 
  Edit, 
  ShieldCheck 
} from 'lucide-react';
import { NoticeItem } from '../types';
import { useAuth } from '../lib/AuthContext';
import { ConfirmModal, ConfirmState } from '../components/ConfirmModal';
import { ToastContainer, ToastMessage } from '../components/Toast';

interface NoticePageProps {
  notices: NoticeItem[];
  onBackToHome: () => void;
  onOpenNoticeEditor: (notice?: NoticeItem) => void;
  onDeleteNotice: (id: string) => Promise<void>;
  onIncrementViews: (id: string) => void;
}

export const NoticePage: React.FC<NoticePageProps> = ({
  notices,
  onBackToHome,
  onOpenNoticeEditor,
  onDeleteNotice,
  onIncrementViews,
}) => {
  const { isAdmin } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>('전체');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedNotice, setSelectedNotice] = useState<NoticeItem | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const itemsPerPage = 8;

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

  const categories = ['전체', '학급 공지', '교육과정', '가정통신', '체험학습', '치료지원 & 복지', '진로직업'];

  // Filter Notices
  const filteredNotices = notices.filter((item) => {
    const matchesCat = selectedCategory === '전체' || item.category === selectedCategory;
    const matchesSearch = 
      item.title.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (item.summary && item.summary.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (item.content && item.content.toLowerCase().includes(searchKeyword.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  // Sort pinned first
  const sortedNotices = [...filteredNotices].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  const totalPages = Math.ceil(sortedNotices.length / itemsPerPage) || 1;
  const paginatedNotices = sortedNotices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSelectNotice = (item: NoticeItem) => {
    setSelectedNotice(item);
    onIncrementViews(item.id);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmState({
      isOpen: true,
      title: '공지사항 삭제',
      message: '이 공지사항을 정말 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.',
      confirmText: '삭제하기',
      isDestructive: true,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await onDeleteNotice(id);
          if (selectedNotice?.id === id) {
            setSelectedNotice(null);
          }
          addToast('공지사항이 성공적으로 삭제되었습니다.', 'success');
        } catch (err: any) {
          console.error('Delete notice error:', err);
          addToast('공지사항 삭제 실패: ' + (err.message || '삭제 권한이 없습니다.'), 'error');
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const handleEdit = (item: NoticeItem, e: React.MouseEvent) => {
    e.stopPropagation();
    onOpenNoticeEditor(item);
  };

  const handleTTS = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'ko-KR';
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
      addToast('음성 안내를 재생합니다.', 'info');
    } else {
      addToast('사용하시는 브라우저에서 음성 안내를 지원하지 않습니다.', 'error');
    }
  };


  return (
    <div id="notice-page-container" className="py-6 px-4 sm:px-8 max-w-7xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Top Header & Breadcrumb */}
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
            <span className="text-[#1F8269]">공지사항 전용 마당</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173A31] flex items-center gap-3">
            <span>참사랑 특수학급 공지사항</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E5F8F1] text-[#1E775F] border border-[#C5ECD9]">
              실시간 데이터베이스 연동
            </span>
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <button
              type="button"
              onClick={() => onOpenNoticeEditor()}
              className="px-4 py-2.5 rounded-2xl bg-[#22836B] hover:bg-[#1A6B57] text-white font-extrabold text-xs clay-btn shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>새 공지 등록</span>
            </button>
          )}

          <button
            type="button"
            onClick={onBackToHome}
            className="px-4 py-2.5 rounded-2xl bg-white border border-[#D5EBE2] text-[#446C60] hover:bg-[#F2FAF6] font-bold text-xs clay-btn shadow-xs cursor-pointer"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>

      {/* DETAIL VIEW (If a notice is selected) */}
      {selectedNotice ? (
        <div className="clay-card p-6 sm:p-10 border-2 border-white shadow-xl space-y-6 animate-scaleUp">
          <div className="flex items-center justify-between pb-4 border-b border-[#E3F2EB]">
            <button
              type="button"
              onClick={() => setSelectedNotice(null)}
              className="flex items-center gap-1.5 text-xs font-bold text-[#2A6E5C] hover:text-[#18463A] bg-[#F0FAF5] px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>목록으로 돌아가기</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleTTS(`${selectedNotice.title}. ${selectedNotice.content}`)}
                className="px-3 py-1.5 rounded-xl bg-[#F0FAF5] hover:bg-[#E2F5ED] text-[#24705D] text-xs font-bold flex items-center gap-1 cursor-pointer"
                title="음성으로 읽어주기"
              >
                <Volume2 className="w-4 h-4 text-[#3EB895]" />
                <span className="hidden sm:inline">음성 듣기</span>
              </button>

              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-1.5 rounded-xl bg-white border border-[#CFE7DD] text-[#3D695C] text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">인쇄</span>
              </button>

              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={(e) => handleEdit(selectedNotice, e)}
                    className="px-3 py-1.5 rounded-xl bg-[#EAF5FF] text-[#1E67B6] hover:bg-[#D5E9FF] text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>수정</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleDelete(selectedNotice.id, e)}
                    className="px-3 py-1.5 rounded-xl bg-[#FFF0F0] text-[#D03030] hover:bg-[#FFE0E0] text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>삭제</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Notice Detail Content */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E5F8F1] text-[#1E775F]">
                {selectedNotice.category}
              </span>
              {selectedNotice.isPinned && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFF5E4] text-[#B07200] flex items-center gap-1">
                  <Pin className="w-3 h-3" />
                  <span>중요 고정</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-[#173C31] leading-snug">
              {selectedNotice.title}
            </h2>

            <div className="flex items-center gap-4 text-xs text-[#6B9185] pb-4 border-b border-[#EAF3EE]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {selectedNotice.date}
              </span>
              <span>작성자: {selectedNotice.author || '특수학급 담당교사'}</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                조회수 {selectedNotice.views}
              </span>
            </div>

            {/* Main Body with formatted paragraphs */}
            <div className="p-6 rounded-2xl bg-[#F9FDFC] border border-[#E0EFE8] text-sm text-[#274F43] leading-relaxed whitespace-pre-line font-medium min-h-[160px]">
              {selectedNotice.content}
            </div>
          </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="space-y-6">
          {/* Filter & Search Bar */}
          <div className="clay-card p-4 sm:p-5 border border-[#D8ECE2] flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Category Buttons */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentPage(1);
                  }}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#22836B] text-white shadow-xs'
                      : 'bg-[#F2FAF6] text-[#487063] hover:bg-[#E3F4ED]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Keyword Search */}
            <div className="relative w-full md:w-72">
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="공지 검색 (제목/본문)..."
                className="w-full pl-9 pr-4 py-2 rounded-2xl bg-[#F4FAF7] border border-[#CFE6DC] text-xs font-bold text-[#1E483C] placeholder-[#799F94] focus:outline-none focus:border-[#22836B]"
              />
              <Search className="w-4 h-4 text-[#5F877B] absolute left-3 top-2.5" />
            </div>
          </div>

          {/* Notice List */}
          {paginatedNotices.length === 0 ? (
            <div className="clay-card p-12 text-center text-sm font-bold text-[#6D9488] border border-[#D5EBE1] space-y-3">
              <FileText className="w-12 h-12 text-[#9AC6B8] mx-auto" />
              <p>
                {searchKeyword || selectedCategory !== '전체' 
                  ? '조건에 일치하는 공지사항이 없습니다.' 
                  : '등록된 공지사항이 없습니다.'}
              </p>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => onOpenNoticeEditor()}
                  className="px-4 py-2 rounded-xl bg-[#22836B] text-white text-xs font-bold clay-btn cursor-pointer inline-flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>첫 공지사항 작성하기</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedNotices.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectNotice(item)}
                  className={`clay-card p-4 sm:p-5 border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group ${
                    item.isPinned 
                      ? 'border-[#FFE0A3] bg-[#FFFCF6] shadow-sm' 
                      : 'border-white hover:border-[#CFEADF] hover:shadow-md'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        item.isPinned 
                          ? 'bg-[#FFECC7] text-[#996300]' 
                          : 'bg-[#EAF7F2] text-[#22725D]'
                      }`}>
                        {item.category}
                      </span>
                      {item.isPinned && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-[#E59819] text-white flex items-center gap-0.5">
                          <Pin className="w-2.5 h-2.5" />
                          <span>중요</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-sm sm:text-base text-[#1A3D33] group-hover:text-[#22836B] transition-colors line-clamp-1">
                      {item.title}
                    </h3>

                    <p className="text-xs text-[#5D8177] line-clamp-1">
                      {item.summary || item.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 text-xs text-[#7B9F95] shrink-0">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        {item.views}
                      </span>
                    </div>

                    {isAdmin && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleEdit(item, e)}
                          className="p-1.5 hover:bg-[#E5F5EE] text-[#256B59] rounded-lg cursor-pointer"
                          title="공지 수정"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDelete(item.id, e)}
                          className="p-1.5 hover:bg-[#FEECEB] text-[#C44A4A] rounded-lg cursor-pointer"
                          title="공지 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-2 rounded-xl bg-white border border-[#D5EBE1] text-[#4A7165] disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setCurrentPage(num)}
                  className={`w-8 h-8 rounded-xl font-bold text-xs cursor-pointer ${
                    currentPage === num
                      ? 'bg-[#22836B] text-white shadow-xs'
                      : 'bg-white border border-[#D5EBE1] text-[#4A7165] hover:bg-[#F2FAF6]'
                  }`}
                >
                  {num}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-2 rounded-xl bg-white border border-[#D5EBE1] text-[#4A7165] disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

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

