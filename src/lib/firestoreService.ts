import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  limit,
  increment,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';
import { 
  NoticeItem, 
  GalleryItem, 
  GroupChatMessage, 
  DirectChatRoom, 
  DirectChatMessage 
} from '../types';

/* ==========================================================
   NOTICES SERVICE (공지사항 Firestore 실시간 CRUD)
   ========================================================== */

export const subscribeNotices = (callback: (notices: NoticeItem[]) => void) => {
  const colRef = collection(db, 'notices');
  return onSnapshot(colRef, (snapshot) => {
    const items: NoticeItem[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as NoticeItem));
    
    // Sort pinned first, then newest date
    items.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    });

    callback(items);
  }, (err) => {
    console.error('Error fetching notices:', err);
    callback([]);
  });
};

export const addNotice = async (notice: Omit<NoticeItem, 'id' | 'views'>) => {
  const colRef = collection(db, 'notices');
  const docRef = await addDoc(colRef, {
    ...notice,
    views: 0,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const updateNotice = async (id: string, updates: Partial<NoticeItem>) => {
  const docRef = doc(db, 'notices', id);
  await updateDoc(docRef, { ...updates });
};

export const deleteNotice = async (id: string) => {
  const docRef = doc(db, 'notices', id);
  await deleteDoc(docRef);
};

export const incrementNoticeViews = async (id: string) => {
  const docRef = doc(db, 'notices', id);
  try {
    await updateDoc(docRef, {
      views: increment(1)
    });
  } catch (e) {
    // silently catch if offline or permission
  }
};

/* ==========================================================
   ACTIVITY POSTS / GALLERY SERVICE (활동 이야기/게시물 실시간 CRUD)
   사진이 없어도 텍스트만으로 등록 가능!
   ========================================================== */

export const subscribeGallery = (callback: (items: GalleryItem[]) => void) => {
  const colRef = collection(db, 'gallery');
  return onSnapshot(colRef, (snapshot) => {
    const items: GalleryItem[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as GalleryItem));
    // sort newest first
    items.sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime());
    callback(items);
  }, (err) => {
    console.error('Error fetching activity posts:', err);
    callback([]);
  });
};

export const addGalleryItem = async (item: Omit<GalleryItem, 'id' | 'likes'>) => {
  const colRef = collection(db, 'gallery');
  const docRef = await addDoc(colRef, {
    ...item,
    imageSrc: item.imageSrc || '',
    likes: 0,
    createdAt: new Date().toISOString(),
  });
  return docRef.id;
};

export const updateGalleryItem = async (id: string, updates: Partial<GalleryItem>) => {
  const docRef = doc(db, 'gallery', id);
  await updateDoc(docRef, { ...updates });
};

export const deleteGalleryItem = async (id: string) => {
  const docRef = doc(db, 'gallery', id);
  await deleteDoc(docRef);
};

export const likeGalleryItem = async (id: string) => {
  const docRef = doc(db, 'gallery', id);
  await updateDoc(docRef, {
    likes: increment(1),
  });
};

/* ==========================================================
   GROUP CHAT SERVICE (전체 일반 실시간 단체 채팅)
   ========================================================== */

export const subscribeGroupChat = (callback: (messages: GroupChatMessage[]) => void) => {
  const colRef = collection(db, 'group_chat_messages');
  const q = query(colRef, orderBy('createdAt', 'asc'), limit(150));
  
  return onSnapshot(q, (snapshot) => {
    const messages: GroupChatMessage[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as GroupChatMessage));
    callback(messages);
  }, (err) => {
    console.error('Error fetching group chat:', err);
    callback([]);
  });
};

export const sendGroupChatMessage = async (data: {
  text: string;
  senderUid: string;
  senderName: string;
  senderEmail?: string;
  senderPhoto?: string;
  isAdmin?: boolean;
}) => {
  const colRef = collection(db, 'group_chat_messages');
  await addDoc(colRef, {
    ...data,
    createdAt: new Date().toISOString(),
  });
};

export const deleteGroupChatMessage = async (messageId: string) => {
  const docRef = doc(db, 'group_chat_messages', messageId);
  await deleteDoc(docRef);
};

/* ==========================================================
   1:1 DIRECT CHAT SERVICE (사용자 <-> 관리자 실시간 1:1 상담 채팅)
   ========================================================== */

// 관리자용: 모든 1:1 상담 대화방 목록 구독
export const subscribeAllDirectChatRooms = (callback: (rooms: DirectChatRoom[]) => void) => {
  const colRef = collection(db, 'direct_chats');
  return onSnapshot(colRef, (snapshot) => {
    const rooms: DirectChatRoom[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as DirectChatRoom));
    
    // Sort latest message first
    rooms.sort((a, b) => {
      const timeA = new Date(a.lastMessageTime || a.createdAt || 0).getTime();
      const timeB = new Date(b.lastMessageTime || b.createdAt || 0).getTime();
      return timeB - timeA;
    });

    callback(rooms);
  }, (err) => {
    console.error('Error fetching all direct chat rooms:', err);
    callback([]);
  });
};

// 사용자용: 특정 사용자의 1:1 상담 방 정보 가져오기 / 생성하기
export const getOrCreateDirectChatRoom = async (user: {
  uid: string;
  displayName: string;
  email?: string;
  photoURL?: string;
}): Promise<DirectChatRoom> => {
  const roomRef = doc(db, 'direct_chats', user.uid);
  const snap = await getDoc(roomRef);

  if (snap.exists()) {
    return { id: snap.id, ...snap.data() } as DirectChatRoom;
  }

  const newRoom: Omit<DirectChatRoom, 'id'> = {
    userUid: user.uid,
    userName: user.displayName || '익명 상담자',
    userEmail: user.email || '',
    userPhoto: user.photoURL || '',
    status: '진행중',
    lastMessage: '상담 대화방이 개설되었습니다.',
    lastMessageTime: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };

  await setDoc(roomRef, newRoom);
  return { id: user.uid, ...newRoom };
};

// 특정 1:1 방의 실시간 메시지 목록 구독
export const subscribeDirectChatMessages = (
  chatRoomId: string, 
  callback: (messages: DirectChatMessage[]) => void
) => {
  const colRef = collection(db, 'direct_chats', chatRoomId, 'messages');
  const q = query(colRef, orderBy('createdAt', 'asc'), limit(150));

  return onSnapshot(q, (snapshot) => {
    const msgs: DirectChatMessage[] = snapshot.docs.map(docSnap => ({
      id: docSnap.id,
      ...docSnap.data(),
    } as DirectChatMessage));
    callback(msgs);
  }, (err) => {
    console.error('Error fetching direct chat messages:', err);
    callback([]);
  });
};

// 1:1 방으로 메시지 전송
export const sendDirectChatMessage = async (
  chatRoomId: string, 
  message: {
    text: string;
    senderUid: string;
    senderName: string;
    senderRole: 'user' | 'admin';
  }
) => {
  const colRef = collection(db, 'direct_chats', chatRoomId, 'messages');
  const now = new Date().toISOString();

  await addDoc(colRef, {
    ...message,
    createdAt: now,
  });

  // 메타데이터 업데이트 (최근 메시지, 시간)
  const roomRef = doc(db, 'direct_chats', chatRoomId);
  await updateDoc(roomRef, {
    lastMessage: message.text,
    lastMessageTime: now,
    status: '진행중',
  });
};

// 1:1 상담 상태 변경 (완료 / 진행중)
export const updateDirectChatStatus = async (chatRoomId: string, status: '진행중' | '상담완료') => {
  const roomRef = doc(db, 'direct_chats', chatRoomId);
  await updateDoc(roomRef, { status });
};

// 1:1 개별 상담 메시지 삭제
export const deleteDirectChatMessage = async (chatRoomId: string, messageId: string) => {
  const docRef = doc(db, 'direct_chats', chatRoomId, 'messages', messageId);
  await deleteDoc(docRef);
};

// 1:1 상담 대화방 삭제 (관리자용)
export const deleteDirectChatRoom = async (chatRoomId: string) => {
  const roomRef = doc(db, 'direct_chats', chatRoomId);
  await deleteDoc(roomRef);
};

