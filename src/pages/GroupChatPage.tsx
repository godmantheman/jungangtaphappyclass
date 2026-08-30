import React, { useState, useEffect, useRef } from 'react';
import { 
  MessagesSquare, 
  Send, 
  ArrowLeft, 
  Smile, 
  Trash2, 
  Sparkles, 
  ShieldCheck, 
  User as UserIcon,
  LogIn,
  Info
} from 'lucide-react';
import { GroupChatMessage } from '../types';
import { useAuth } from '../lib/AuthContext';
import { 
  subscribeGroupChat, 
  sendGroupChatMessage, 
  deleteGroupChatMessage 
} from '../lib/firestoreService';
import { ConfirmModal, ConfirmState } from '../components/ConfirmModal';
import { ToastContainer, ToastMessage } from '../components/Toast';

interface GroupChatPageProps {
  onBackToHome: () => void;
}

export const GroupChatPage: React.FC<GroupChatPageProps> = ({ onBackToHome }) => {
  const { user, isAdmin, loginWithGoogle } = useAuth();
  const [messages, setMessages] = useState<GroupChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [guestName, setGuestName] = useState('');
  const [sending, setSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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

  const quickEmojis = ['😊', '👍', '❤️', '👏', '🍀', '🌸', '✨', '📚', '🙌', '🎉'];
  const quickPhrases = [
    '안녕하세요!', 
    '오늘도 좋은 하루 보내세요 ✨', 
    '선생님 감사합니다 😊', 
    '모두 힘내세요! 🍀'
  ];

  // Subscribe to real-time chat
  useEffect(() => {
    const unsub = subscribeGroupChat((msgs) => {
      setMessages(msgs);
    });
    return () => unsub();
  }, []);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim()) return;

    let senderName = '학급 친구';
    let senderUid = 'guest_' + Math.random().toString(36).substring(2, 9);
    let senderPhoto: string | undefined = undefined;

    if (user) {
      senderUid = user.uid;
      senderName = user.displayName || user.email?.split('@')[0] || (isAdmin ? '특수학급 선생님' : '학급 친구');
      senderPhoto = user.photoURL || undefined;
    } else {
      if (guestName.trim()) {
        senderName = guestName.trim();
      }
    }

    setSending(true);
    try {
      await sendGroupChatMessage({
        text: inputText.trim(),
        senderUid,
        senderName,
        senderEmail: user?.email || undefined,
        senderPhoto,
        isAdmin: Boolean(isAdmin),
      });
      setInputText('');
      setShowEmojiPicker(false);
    } catch (err: any) {
      console.error('Error sending chat:', err);
      addToast('메시지 전송에 실패했습니다: ' + (err.message || '알 수 없는 오류'), 'error');
    } finally {
      setSending(false);
    }
  };

  const handleDeleteMessage = (messageId: string) => {
    setConfirmState({
      isOpen: true,
      title: '메시지 삭제',
      message: '이 메시지를 정말 삭제하시겠습니까?',
      confirmText: '삭제하기',
      isDestructive: true,
      onConfirm: async () => {
        setIsDeleting(true);
        try {
          await deleteGroupChatMessage(messageId);
          addToast('메시지가 삭제되었습니다.', 'success');
        } catch (err: any) {
          console.error('Delete message error:', err);
          addToast('메시지 삭제 실패: ' + (err.message || '삭제 권한이 없습니다.'), 'error');
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };



  const addEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  return (
    <div id="group-chat-page-container" className="py-6 px-4 sm:px-8 max-w-5xl mx-auto space-y-4 animate-fadeIn">
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
            <span className="text-[#1F8269]">실시간 전체 채팅방</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#173A31] flex items-center gap-3">
            <span>참사랑학급 열린 나눔터</span>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#E5F7F1] text-[#1E735D] border border-[#C6ECE0] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#3EB895] animate-pulse" />
              실시간 참여 중
            </span>
          </h1>
          <p className="text-xs text-[#628B7F] font-medium mt-0.5">
            학생, 학부모, 선생님 누구나 따뜻한 이야기와 소식을 나눌 수 있는 열린 단체 채팅 공간입니다.
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

      {/* Main Chat Box */}
      <div className="clay-card bg-white border-2 border-[#D8ECE2] shadow-xl rounded-3xl overflow-hidden flex flex-col h-[680px]">
        {/* Chat Room Subheader */}
        <div className="p-4 bg-gradient-to-r from-[#F0FAF6] via-[#F8FCFA] to-[#EDF8F4] border-b border-[#D8ECE2] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-[#3EB895] text-white flex items-center justify-center shadow-xs">
              <MessagesSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-[#173C31] flex items-center gap-1.5">
                <span>실시간 학급 소통방</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-[#2C7A65] border border-[#D0EBE1]">
                  메시지 {messages.length}개
                </span>
              </div>
              <p className="text-[11px] text-[#60877C]">
                서로를 격려하는 따뜻하고 고운 말을 사용해주세요.
              </p>
            </div>
          </div>

          {!user && (
            <button
              type="button"
              onClick={loginWithGoogle}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#E5F5EF] border border-[#C6ECE0] text-[#1E735D] text-xs font-bold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-[#3EB895]" />
              <span className="hidden sm:inline">로그인하고 참여하기</span>
            </button>
          )}
        </div>

        {/* Message Stream Area */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-[#FBFDFD]">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-[#789D91] space-y-2">
              <MessagesSquare className="w-12 h-12 text-[#9DD8C6] opacity-60" />
              <p className="font-extrabold text-sm text-[#355B50]">
                아직 등록된 대화가 없습니다.
              </p>
              <p className="text-xs text-[#7B9F94] max-w-xs">
                첫 번째 메시지를 남겨서 즐거운 학급 이야기를 시작해보세요!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMyMessage = user ? (msg.senderUid === user.uid) : false;
              const isTeacher = Boolean(msg.isAdmin);

              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-2.5 group ${
                    isMyMessage ? 'flex-row-reverse' : 'flex-row'
                  }`}
                >
                  {/* Sender Avatar */}
                  {msg.senderPhoto ? (
                    <img
                      src={msg.senderPhoto}
                      alt={msg.senderName}
                      className="w-8 h-8 rounded-full object-cover border border-[#C4E7DA] shrink-0 mt-0.5"
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                      isTeacher 
                        ? 'bg-[#1D4A3E] text-[#88F3D3] ring-2 ring-[#72ECC8]' 
                        : 'bg-[#D3EDE2] text-[#205A4A]'
                    }`}>
                      {isTeacher ? '선생' : (msg.senderName[0] || '익')}
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className={`max-w-[78%] sm:max-w-[70%] space-y-1 ${
                    isMyMessage ? 'items-end text-right' : 'items-start text-left'
                  }`}>
                    {/* Sender Meta */}
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="font-bold text-[#355F52]">
                        {msg.senderName}
                      </span>
                      {isTeacher && (
                        <span className="px-1.5 py-0.2 rounded-md bg-[#FFF0D4] text-[#9E6500] font-black text-[10px]">
                          선생님
                        </span>
                      )}
                      <span className="text-[10px] text-[#8EAFA5]">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      
                      {/* Delete button (Admin or Message Author) */}
                      {(isAdmin || isMyMessage) && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="opacity-0 group-hover:opacity-100 text-rose-400 hover:text-rose-600 p-0.5 rounded cursor-pointer transition-opacity"
                          title="메시지 삭제"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}

                    </div>

                    {/* Bubble Body */}
                    <div className={`p-3 sm:px-4 sm:py-2.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed break-words shadow-xs ${
                      isMyMessage
                        ? 'bg-[#3EB895] text-white rounded-tr-xs'
                        : isTeacher
                          ? 'bg-[#EBF7F2] border border-[#BDEBD9] text-[#173C31] rounded-tl-xs'
                          : 'bg-white border border-[#DCEEE6] text-[#20473C] rounded-tl-xs'
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

        {/* Quick Common Phrases Bar */}
        <div className="px-4 py-2 bg-[#F3F9F6] border-t border-[#E0F0E8] flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-bold text-[#6D9488] shrink-0">빠른 문구:</span>
          {quickPhrases.map((phrase, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setInputText(phrase)}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#E5F5EE] border border-[#D0EAE0] text-[#346355] text-[11px] font-medium shrink-0 cursor-pointer transition-colors"
            >
              {phrase}
            </button>
          ))}
        </div>

        {/* Input Bar Section */}
        <div className="p-3 sm:p-4 bg-white border-t border-[#DCEFE6] space-y-2">
          {/* Guest Name input if not logged in */}
          {!user && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#4B7567] shrink-0">보내는 사람:</span>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="이름 또는 닉네임 (예: 민준이, 학부모님)"
                className="px-3 py-1 rounded-xl bg-[#F6FCF9] border border-[#D2EDE1] text-xs font-bold text-[#1C4538] focus:outline-none focus:border-[#3EB895] w-48"
              />
              <span className="text-[11px] text-[#86A89D]">
                (로그인 시 구글 프로필 자동 사용)
              </span>
            </div>
          )}

          {/* Emoji Picker Row */}
          {showEmojiPicker && (
            <div className="flex items-center gap-1.5 p-2 rounded-2xl bg-[#F5FAF7] border border-[#D5EBE1] flex-wrap animate-fadeIn">
              {quickEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => addEmoji(emoji)}
                  className="w-8 h-8 text-lg rounded-xl hover:bg-white flex items-center justify-center cursor-pointer transition-colors"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}

          {/* Message Form */}
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2.5 rounded-2xl bg-[#F2FAF6] hover:bg-[#E2F5ED] text-[#366859] cursor-pointer transition-colors"
              title="이모지 선택"
            >
              <Smile className="w-5 h-5 text-[#3EB895]" />
            </button>

            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="따뜻한 메시지를 입력하세요..."
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
        </div>
      </div>

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

