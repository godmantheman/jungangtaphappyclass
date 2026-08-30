import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  ArrowLeft, 
  ShieldCheck, 
  User as UserIcon, 
  Lock, 
  CheckCircle, 
  Clock, 
  Smile,
  Info,
  ChevronRight,
  LogIn,
  Trash2
} from 'lucide-react';

import { DirectChatRoom, DirectChatMessage } from '../types';
import { useAuth } from '../lib/AuthContext';
import { 
  subscribeAllDirectChatRooms, 
  getOrCreateDirectChatRoom, 
  subscribeDirectChatMessages, 
  sendDirectChatMessage, 
  updateDirectChatStatus,
  deleteDirectChatMessage,
  deleteDirectChatRoom
} from '../lib/firestoreService';
import { ConfirmModal, ConfirmState } from '../components/ConfirmModal';
import { ToastContainer, ToastMessage } from '../components/Toast';

interface DirectChatPageProps {
  onBackToHome: () => void;
}

export const DirectChatPage: React.FC<DirectChatPageProps> = ({ onBackToHome }) => {
  const { user, isAdmin, loginWithGoogle } = useAuth();
  
  // Admin State
  const [adminRooms, setAdminRooms] = useState<DirectChatRoom[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // User State
  const [userRoom, setUserRoom] = useState<DirectChatRoom | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestContact, setGuestContact] = useState('');
  const [guestStarted, setGuestStarted] = useState(false);
  const [guestUid, setGuestUid] = useState<string>(() => {
    const saved = localStorage.getItem('guest_chat_uid');
    if (saved) return saved;
    const newUid = 'guest_chat_' + Date.now();
    localStorage.setItem('guest_chat_uid', newUid);
    return newUid;
  });

  // Shared Chat State
  const [messages, setMessages] = useState<DirectChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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


  // Active room ID determined by role
  const currentActiveRoomId = isAdmin ? selectedRoomId : (userRoom?.id || null);

  // Load Rooms for Admin
  useEffect(() => {
    if (isAdmin) {
      const unsub = subscribeAllDirectChatRooms((rooms) => {
        setAdminRooms(rooms);
        if (!selectedRoomId && rooms.length > 0) {
          setSelectedRoomId(rooms[0].id);
        }
      });
      return () => unsub();
    }
  }, [isAdmin]);

  // Load / Create Room for User
  useEffect(() => {
    if (!isAdmin) {
      if (user) {
        getOrCreateDirectChatRoom({
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || '학부모/학생',
          email: user.email || '',
          photoURL: user.photoURL || '',
        }).then(room => {
          setUserRoom(room);
        });
      } else if (guestStarted && guestName.trim()) {
        getOrCreateDirectChatRoom({
          uid: guestUid,
          displayName: `${guestName.trim()} (${guestContact.trim() || '연락처 미입력'})`,
          email: '',
          photoURL: '',
        }).then(room => {
          setUserRoom(room);
        });
      }
    }
  }, [isAdmin, user, guestStarted, guestName, guestContact, guestUid]);

  // Subscribe to Messages in Active Room
  useEffect(() => {
    if (!currentActiveRoomId) {
      setMessages([]);
      return;
    }

    const unsub = subscribeDirectChatMessages(currentActiveRoomId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsub();
  }, [currentActiveRoomId]);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || !currentActiveRoomId) return;

    setSending(true);
    try {
      const senderRole = isAdmin ? 'admin' : 'user';
      const senderUid = user ? user.uid : guestUid;
      const senderName = isAdmin 
        ? '특수학급 선생님' 
        : (user?.displayName || guestName || '상담 신청자');

      await sendDirectChatMessage(currentActiveRoomId, {
        text: inputText.trim(),
        senderUid,
        senderName,
        senderRole,
      });

      setInputText('');
    } catch (err: any) {
      console.error('Error sending direct chat:', err);
      addToast('메시지 전송에 실패했습니다: ' + (err.message || '알 수 없는 오류'), 'error');
    } finally {
      setSending(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!isAdmin || !currentActiveRoomId) return;
    const room = adminRooms.find(r => r.id === currentActiveRoomId);
    if (!room) return;

    const nextStatus = room.status === '상담완료' ? '진행중' : '상담완료';
    await updateDirectChatStatus(currentActiveRoomId, nextStatus);
  };

  const handleDeleteRoom = (roomId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAdmin) return;
    setConfirmState({
      isOpen: true,
      title: '상담방 삭제',
      message: '이 상담방 전체를 삭제하시겠습니까?\n모든 상담 내역이 삭제되며 복구할 수 없습니다.',
      confirmText: '삭제하기',
      isDestructive: true,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteDirectChatRoom(roomId);
          if (selectedRoomId === roomId) {
            setSelectedRoomId(null);
          }
          addToast('상담 대화방이 성공적으로 삭제되었습니다.', 'success');
        } catch (err: any) {
          addToast('대화방 삭제 실패: ' + (err.message || '오류가 발생했습니다.'), 'error');
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const handleDeleteDirectMessage = (messageId: string) => {
    if (!currentActiveRoomId) return;
    setConfirmState({
      isOpen: true,
      title: '메시지 삭제',
      message: '이 메시지를 정말 삭제하시겠습니까?',
      confirmText: '삭제하기',
      isDestructive: true,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteDirectChatMessage(currentActiveRoomId, messageId);
          addToast('메시지가 삭제되었습니다.', 'success');
        } catch (err: any) {
          addToast('메시지 삭제 실패: ' + (err.message || '삭제 권한이 없습니다.'), 'error');
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };



  const selectedRoomObj = adminRooms.find(r => r.id === selectedRoomId);

  return (
    <div id="direct-chat-page-container" className="py-6 px-4 sm:px-8 max-w-6xl mx-auto space-y-4 animate-fadeIn">
      {/* Top Breadcrumb & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#D8ECE2]">
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
            <span className="text-[#1F8269]">1:1 관리자 상담 채팅</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173A31] flex items-center gap-3">
            <span>선생님과 1:1 실시간 비밀상담</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#FFF0D4] text-[#A66E00] border border-[#FFE0A3] flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#DE8600]" />
              비공개 보안 상담
            </span>
          </h1>
          <p className="text-xs text-[#628B7F] font-medium mt-0.5">
            {isAdmin 
              ? '학생 및 학부모님들께서 요청하신 1:1 상담을 실시간으로 확인하고 응답할 수 있는 관리자 창입니다.' 
              : '특수학급 선생님과 단둘이 안전하게 학습 지원 및 학교생활 상담을 나눌 수 있습니다.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onBackToHome}
          className="self-start sm:self-auto px-4 py-2 rounded-2xl bg-white border border-[#D5EBE2] text-[#446C60] hover:bg-[#F2FAF6] font-bold text-xs clay-btn shadow-xs cursor-pointer"
        >
          홈으로 가기
        </button>
      </div>

      {/* ADMIN VIEW: Left sidebar of rooms + Right chat box */}
      {isAdmin ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Rooms List */}
          <div className="clay-card bg-white border border-[#D8ECE2] rounded-3xl p-4 space-y-3 h-[650px] flex flex-col">
            <div className="flex items-center justify-between pb-2 border-b border-[#E5F2EC]">
              <span className="text-xs font-extrabold text-[#1A473A] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#3EB895]" />
                상담 대화방 목록 ({adminRooms.length})
              </span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2">
              {adminRooms.length === 0 ? (
                <div className="p-8 text-center text-xs font-bold text-[#7B9F95]">
                  아직 접수된 1:1 상담 요청이 없습니다.
                </div>
              ) : (
                adminRooms.map((room) => {
                  const isSelected = selectedRoomId === room.id;
                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`p-3.5 rounded-2xl cursor-pointer transition-all border ${
                        isSelected 
                          ? 'bg-[#EAF7F2] border-[#70D9BA] shadow-xs' 
                          : 'bg-[#F9FCFA] hover:bg-[#F0FAF5] border-[#E3F2EB]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-extrabold text-[#173C31] truncate max-w-[140px]">
                          {room.userName}
                        </span>
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          room.status === '상담완료' 
                            ? 'bg-[#E5ECE9] text-[#69887E]' 
                            : 'bg-[#FFF0D4] text-[#B07200]'
                        }`}>
                          {room.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#5A7E73] truncate">
                        {room.lastMessage || '대화가 시작되었습니다.'}
                      </p>
                      <div className="text-[10px] text-[#8DAFA5] mt-1">
                        {room.lastMessageTime ? new Date(room.lastMessageTime).toLocaleString([], { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Active Chat Box */}
          <div className="lg:col-span-2 clay-card bg-white border-2 border-[#D8ECE2] rounded-3xl overflow-hidden flex flex-col h-[650px]">
            {selectedRoomObj ? (
              <>
                {/* Room Top Bar */}
                <div className="p-4 bg-[#F2FAF6] border-b border-[#D8ECE2] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-2xl bg-[#1D4A3E] text-white flex items-center justify-center font-bold text-xs">
                      {selectedRoomObj.userName[0] || '상'}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-extrabold text-[#173C31]">
                        {selectedRoomObj.userName} 님과의 1:1 상담
                      </h3>
                      <p className="text-[11px] text-[#668B80]">
                        상태: {selectedRoomObj.status} · {selectedRoomObj.userEmail || '이메일 정보 없음'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleToggleStatus}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold clay-btn cursor-pointer transition-colors ${
                        selectedRoomObj.status === '상담완료' 
                          ? 'bg-[#2E7E6A] text-white' 
                          : 'bg-[#E5ECE9] text-[#385B50]'
                      }`}
                    >
                      {selectedRoomObj.status === '상담완료' ? '진행중으로 변경' : '상담완료 처리'}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteRoom(selectedRoomObj.id, e)}
                      className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 cursor-pointer transition-colors"
                      title="상담방 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#FAFDFB]">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center text-[#7B9F95]">
                      <MessageSquare className="w-10 h-10 text-[#9DD8C6] opacity-60 mb-2" />
                      <p className="text-xs font-bold">아직 주고받은 메시지가 없습니다.</p>
                      <p className="text-[11px] text-[#86A89D]">선생님께서 먼저 따뜻한 인사를 건네보세요.</p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderRole === 'admin';
                      return (
                        <div
                          key={msg.id}
                          className={`flex items-start gap-2.5 group ${isMe ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                          <div className={`max-w-[75%] space-y-1 ${isMe ? 'items-end text-right' : 'items-start text-left'}`}>
                            <div className="flex items-center gap-1.5 text-[11px]">
                              <span className="font-bold text-[#355F52]">
                                {msg.senderName}
                              </span>
                              <span className="text-[10px] text-[#8EAFA5]">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeleteDirectMessage(msg.id)}
                                className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 p-0.5 rounded cursor-pointer transition-opacity"
                                title="메시지 삭제"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            <div className={`p-3.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed break-words shadow-xs ${
                              isMe 
                                ? 'bg-[#1D4A3E] text-white rounded-tr-xs' 
                                : 'bg-white border border-[#DCEEE6] text-[#1E4338] rounded-tl-xs'
                            }`}>
                              {msg.text}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>


                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-[#DCEFE6] flex items-center gap-2">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="선생님 답변 메시지를 입력하세요..."
                    className="flex-1 px-4 py-3 rounded-2xl bg-[#F6FCF9] border border-[#D2EDE1] text-xs sm:text-sm font-medium text-[#1C4538] focus:outline-none focus:border-[#3EB895]"
                  />
                  <button
                    type="submit"
                    disabled={sending || !inputText.trim()}
                    className="px-5 py-3 rounded-2xl bg-[#1D4A3E] hover:bg-[#153B31] disabled:opacity-50 text-white font-bold text-xs sm:text-sm clay-btn shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-4 h-4 text-[#78F5D2]" />
                    <span>전송</span>
                  </button>
                </form>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#7B9F95]">
                <MessageSquare className="w-12 h-12 text-[#9DD8C6] opacity-60 mb-2" />
                <p className="font-bold text-sm">상담 대화방을 선택해주세요.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* USER VIEW: Direct conversation with teacher */
        <div className="clay-card bg-white border-2 border-[#D8ECE2] shadow-xl rounded-3xl overflow-hidden flex flex-col h-[680px]">
          {/* If user is not logged in and hasn't started guest chat */}
          {!user && !guestStarted ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10 max-w-md mx-auto text-center space-y-5 animate-fadeIn">
              <div className="w-16 h-16 rounded-3xl bg-[#E5F7F1] text-[#28846C] flex items-center justify-center mx-auto shadow-sm">
                <Lock className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-extrabold text-[#173C31]">
                  선생님과 1:1 상담 시작하기
                </h2>
                <p className="text-xs text-[#5C8578] leading-relaxed">
                  구글 계정으로 로그인하시거나, 간단히 이름과 연락처를 입력하시면 바로 상담 대화방으로 연결됩니다.
                </p>
              </div>

              {/* Login Button */}
              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full py-3 px-4 rounded-2xl bg-[#3EB895] hover:bg-[#2C9E7D] text-white font-bold text-xs sm:text-sm clay-btn shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Google 계정으로 간편 시작</span>
              </button>

              <div className="flex items-center gap-2 w-full">
                <div className="flex-1 h-px bg-[#D8EDE5]" />
                <span className="text-[11px] font-bold text-[#83A79C]">또는 게스트로 시작</span>
                <div className="flex-1 h-px bg-[#D8EDE5]" />
              </div>

              {/* Guest Form */}
              <div className="w-full space-y-3 text-left">
                <div>
                  <label className="block text-xs font-bold text-[#355B50] mb-1">
                    학생 성명 또는 보호자명 <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="예: 2학년 김민준 학생"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F6FCF9] border border-[#D2EDE1] text-xs font-bold text-[#1C4538] focus:outline-none focus:border-[#3EB895]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#355B50] mb-1">
                    연락처 (선택 사항)
                  </label>
                  <input
                    type="text"
                    value={guestContact}
                    onChange={(e) => setGuestContact(e.target.value)}
                    placeholder="예: 010-0000-0000"
                    className="w-full px-4 py-2.5 rounded-xl bg-[#F6FCF9] border border-[#D2EDE1] text-xs font-medium text-[#1C4538] focus:outline-none focus:border-[#3EB895]"
                  />
                </div>

                <button
                  type="button"
                  disabled={!guestName.trim()}
                  onClick={() => setGuestStarted(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-[#1E6854] hover:bg-[#154D3E] disabled:opacity-50 text-white font-bold text-xs clay-btn shadow-md cursor-pointer transition-colors"
                >
                  1:1 상담방 입장하기
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Active User Chat Room */}
              <div className="p-4 bg-gradient-to-r from-[#F0FAF6] to-[#E7F6F0] border-b border-[#D8ECE2] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-2xl bg-[#3EB895] text-white flex items-center justify-center shadow-xs">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-[#173C31] flex items-center gap-1.5">
                      <span>특수학급 선생님 1:1 상담실</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#2C7A65] border border-[#D0EBE1]">
                        비공개 연결됨
                      </span>
                    </div>
                    <p className="text-[11px] text-[#60877C]">
                      선생님께서 실시간으로 메시지를 확인 후 정성껏 답변해 드립니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Message Stream */}
              <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#FAFDFB]">
                {/* Security info banner */}
                <div className="p-3.5 rounded-2xl bg-[#FFF9ED] border border-[#FFE8B8] text-xs text-[#8C6200] flex items-center gap-2 font-medium">
                  <Info className="w-4 h-4 text-[#DE8600] shrink-0" />
                  <span>이 상담방은 학생/학부모님과 특수학급 선생님 단둘만 열람할 수 있는 안전한 비밀 공간입니다.</span>
                </div>

                {messages.length === 0 ? (
                  <div className="py-12 text-center text-[#7B9F95] space-y-2">
                    <MessageSquare className="w-12 h-12 text-[#9DD8C6] opacity-60 mx-auto" />
                    <p className="font-extrabold text-sm text-[#355B50]">
                      상담 대화방이 준비되었습니다.
                    </p>
                    <p className="text-xs text-[#7B9F94] max-w-sm mx-auto">
                      궁금한 점이나 학교생활 관련 도움이 필요한 내용을 편안하게 남겨주세요.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMyMessage = msg.senderRole === 'user';
                    const isTeacher = msg.senderRole === 'admin';

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-start gap-2.5 group ${isMyMessage ? 'flex-row-reverse' : 'flex-row'}`}
                      >
                        <div className={`max-w-[78%] sm:max-w-[70%] space-y-1 ${isMyMessage ? 'items-end text-right' : 'items-start text-left'}`}>
                          <div className="flex items-center gap-1.5 text-[11px]">
                            <span className="font-bold text-[#355F52]">
                              {isTeacher ? '특수학급 선생님' : msg.senderName}
                            </span>
                            {isTeacher && (
                              <span className="px-1.5 py-0.2 rounded-md bg-[#FFEAA7] text-[#8C5D00] font-black text-[10px]">
                                선생님
                              </span>
                            )}
                            <span className="text-[10px] text-[#8EAFA5]">
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {isMyMessage && (
                              <button
                                type="button"
                                onClick={() => handleDeleteDirectMessage(msg.id)}
                                className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 p-0.5 rounded cursor-pointer transition-opacity"
                                title="내 메시지 삭제"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>

                          <div className={`p-3.5 sm:px-4 sm:py-3 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed break-words shadow-xs ${
                            isMyMessage 
                              ? 'bg-[#3EB895] text-white rounded-tr-xs' 
                              : 'bg-white border border-[#DCEEE6] text-[#1E4338] rounded-tl-xs'
                          }`}>
                            {msg.text}
                          </div>
                        </div>
                      </div>

                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input Form */}
              <form onSubmit={handleSendMessage} className="p-3 sm:p-4 bg-white border-t border-[#DCEFE6] flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="선생님께 상담하실 내용을 입력하세요..."
                  className="flex-1 px-4 py-3 rounded-2xl bg-[#F6FCF9] border border-[#D2EDE1] text-xs sm:text-sm font-medium text-[#1C4538] focus:outline-none focus:border-[#3EB895]"
                />
                <button
                  type="submit"
                  disabled={sending || !inputText.trim()}
                  className="px-5 py-3 rounded-2xl bg-[#3EB895] hover:bg-[#2C9E7D] disabled:opacity-50 text-white font-bold text-xs sm:text-sm clay-btn shadow-md flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>전송</span>
                </button>
              </form>
            </>
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

