import React, { useState } from 'react';
import { 
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  X, 
  AlertCircle, 
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Users
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { ConfirmModal, ConfirmState } from './ConfirmModal';

interface AdminPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenNoticeEditor: () => void;
  onOpenGalleryEditor: () => void;
}

export const AdminPanelModal: React.FC<AdminPanelModalProps> = ({
  isOpen,
  onClose,
  onOpenNoticeEditor,
  onOpenGalleryEditor,
}) => {
  const { user, adminData, adminList, addAdminEmail, removeAdmin, logout } = useAuth();
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'admins'>('overview');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!isOpen) return null;

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim() || !newAdminName.trim()) {
      setStatusMsg({ type: 'error', text: '이메일과 이름을 모두 입력해주세요.' });
      return;
    }

    try {
      await addAdminEmail(newAdminEmail.trim(), newAdminName.trim());
      setNewAdminEmail('');
      setNewAdminName('');
      setStatusMsg({ type: 'success', text: '새 관리자가 성공적으로 등록되었습니다.' });
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || '등록 중 오류가 발생했습니다.' });
    }
  };

  const handleRemoveAdmin = (uid: string) => {
    setConfirmState({
      isOpen: true,
      title: '관리자 권한 삭제',
      message: '이 사용자의 관리자 권한을 해제하시겠습니까?',
      confirmText: '권한 해제',
      isDestructive: true,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await removeAdmin(uid);
          setStatusMsg({ type: 'success', text: '관리자가 삭제되었습니다.' });
          setTimeout(() => setStatusMsg(null), 3000);
        } catch (err: any) {
          setStatusMsg({ type: 'error', text: err.message });
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };


  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="clay-card w-full max-w-3xl bg-white border-2 border-[#D8ECE2] shadow-2xl rounded-3xl overflow-hidden flex flex-col max-h-[85vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-[#173C31] to-[#255C4D] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#72ECC8]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold">포털 관리자 대시보드</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#72ECC8] text-[#123E32]">
                  {adminData?.role === 'super_admin' ? '최고 관리자' : '학급 교사'}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                {user?.email} ({adminData?.name || '관리자'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={logout}
              className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors cursor-pointer"
            >
              로그아웃
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E2EFE9] bg-[#F7FCF9] px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-[#22836B] text-[#195949] bg-white rounded-t-xl'
                : 'border-transparent text-[#61867A] hover:text-[#1F4C3F]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>콘텐츠 관리</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2.5 text-xs font-extrabold border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'admins'
                ? 'border-[#22836B] text-[#195949] bg-white rounded-t-xl'
                : 'border-transparent text-[#61867A] hover:text-[#1F4C3F]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>관리자 권한 목록 ({adminList.length + 1})</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {statusMsg && (
            <div className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-bold ${
              statusMsg.type === 'success' ? 'bg-[#E6F8F1] text-[#166E56]' : 'bg-[#FFF0F0] text-[#D03030]'
            }`}>
              {statusMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          {/* TAB: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-[#173C31] mb-1">실시간 콘텐츠 등록 & 관리</h3>
                <p className="text-xs text-[#5E8378]">
                  공지사항 및 갤러리 작품을 추가하거나 수정·삭제하여 홈페이지를 편리하게 운영할 수 있습니다.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="clay-card p-5 border border-[#D5EBE1] hover:border-[#3EB895] transition-all space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#E6F8F1] text-[#228068] flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#184236]">새 공지사항 작성하기</h4>
                    <p className="text-xs text-[#63877D] mt-0.5">
                      학급 소식, 가정통신문, 안내사항 등 실시간 공지를 등록합니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenNoticeEditor();
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#3EB895] hover:bg-[#32A383] text-white font-bold text-xs shadow-sm cursor-pointer"
                  >
                    공지사항 글쓰기 창 열기
                  </button>
                </div>

                <div className="clay-card p-5 border border-[#D5EBE1] hover:border-[#F7B347] transition-all space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#FFF5E4] text-[#B07200] flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#184236]">새 갤러리 작품 등록하기</h4>
                    <p className="text-xs text-[#63877D] mt-0.5">
                      학생들의 도예, 원예, 미술 작품 사진과 설명을 게시합니다.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenGalleryEditor();
                    }}
                    className="w-full py-2.5 rounded-xl bg-[#E59819] hover:bg-[#CA8410] text-white font-bold text-xs shadow-sm cursor-pointer"
                  >
                    갤러리 작품 등록창 열기
                  </button>
                </div>
              </div>

              <div className="clay-inset p-4 rounded-2xl text-xs text-[#2A574A] space-y-1">
                <p className="font-bold">💡 실시간 데이터베이스 관리 기능</p>
                <p>
                  관리자로 로그인된 상태에서는 각 공지사항 및 갤러리 상세 화면에서 <b>[삭제]</b> 및 <b>[수정]</b> 버튼을 통해 실시간으로 데이터를 관리할 수 있습니다.
                </p>
              </div>
            </div>
          )}

          {/* TAB: Admin Management */}
          {activeTab === 'admins' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-[#173C31] mb-1">관리자 권한 부여 및 관리</h3>
                <p className="text-xs text-[#5E8378]">
                  공지사항 및 포털 콘텐츠를 직접 관리할 교사/관리자의 구글 이메일을 등록하세요.
                </p>
              </div>

              {/* Add Admin Form */}
              <form onSubmit={handleAddAdmin} className="clay-card p-5 border border-[#D8ECE2] space-y-4">
                <h4 className="text-xs font-extrabold text-[#1F4F42] flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-[#3EB895]" />
                  <span>새 관리자 이메일 추가</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#446A5E] mb-1">
                      구글 계정 이메일 (Google Email)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="teacher@school.kr 또는 @gmail.com"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4FAF7] border border-[#CFE6DC] text-xs font-bold text-[#1E483C] focus:outline-none focus:border-[#3EB895]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#446A5E] mb-1">
                      관리자 이름 / 직책
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="예: 김선생님 (특수교사)"
                      value={newAdminName}
                      onChange={(e) => setNewAdminName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-[#F4FAF7] border border-[#CFE6DC] text-xs font-bold text-[#1E483C] focus:outline-none focus:border-[#3EB895]"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#22836B] hover:bg-[#1B6F5A] text-white text-xs font-bold clay-btn shadow-sm cursor-pointer"
                  >
                    관리자 권한 추가
                  </button>
                </div>
              </form>

              {/* Admin List */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold text-[#1F4F42]">등록된 관리자 목록</h4>
                <div className="divide-y divide-[#E6F3ED] border border-[#D5EBE1] rounded-2xl overflow-hidden bg-white">
                  {/* Super Admin Row */}
                  <div className="p-3.5 flex items-center justify-between bg-[#F4FAF7]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#1B4D3F] text-white flex items-center justify-center font-extrabold text-xs">
                        👑
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-[#173C31] flex items-center gap-2">
                          <span>0319sea2@gmail.com</span>
                          <span className="text-[10px] bg-[#1E6754] text-white px-2 py-0.5 rounded-md font-bold">
                            최고 관리자 (Super Admin)
                          </span>
                        </div>
                        <p className="text-[11px] text-[#60867A]">기본 지정 마스터 권한자</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#356355]">영구 활성</span>
                  </div>

                  {/* Additional Admins */}
                  {adminList.map((adm) => (
                    <div key={adm.uid} className="p-3.5 flex items-center justify-between hover:bg-[#F9FCFA]">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#E5F5EE] text-[#1E6B56] flex items-center justify-center font-bold text-xs">
                          {adm.name ? adm.name.charAt(0) : '교'}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1A4135]">{adm.email}</div>
                          <p className="text-[11px] text-[#63897E]">{adm.name || '특수학급 담당자'}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveAdmin(adm.uid)}
                        className="p-1.5 text-[#C44A4A] hover:bg-[#FEECEB] rounded-lg transition-colors cursor-pointer"
                        title="관리자 권한 해제"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {adminList.length === 0 && (
                    <div className="p-4 text-center text-xs text-[#73988D]">
                      추가로 등록된 보조 관리자가 없습니다.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      <ConfirmModal
        confirmState={confirmState}
        onClose={() => setConfirmState(null)}
        isLoading={isDeleting}
      />
    </div>
  );
};

