export interface QuickMenuItem {
  id: string;
  title: string;
  subTitle: string;
  description: string;
  imageSrc: string;
  badge: string;
  theme: 'mint' | 'blue' | 'yellow' | 'coral' | 'purple';
  iconAlt: string;
}

export interface NoticeItem {
  id: string;
  category: string;
  title: string;
  summary: string;
  content: string;
  date: string;
  author?: string;
  isPinned?: boolean;
  views: number;
  createdAt?: string;
}

export interface GalleryItem {
  id: string;
  category: string;
  title: string;
  description: string;
  imageSrc?: string; // 사진 선택사항 (사진 없어도 등록 가능)
  date: string;
  likes: number;
  authorName?: string;
  authorUid?: string;
  createdAt?: string;
}

export interface GroupChatMessage {
  id: string;
  text: string;
  senderUid: string;
  senderName: string;
  senderEmail?: string;
  senderPhoto?: string;
  isAdmin?: boolean;
  createdAt: string;
}

export interface DirectChatRoom {
  id: string;
  userUid: string;
  userName: string;
  userEmail?: string;
  userPhoto?: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadByAdmin?: number;
  unreadByUser?: number;
  status: '진행중' | '상담완료';
  createdAt: string;
}

export interface DirectChatMessage {
  id: string;
  text: string;
  senderUid: string;
  senderName: string;
  senderRole: 'user' | 'admin';
  createdAt: string;
}

export interface AccessibilitySettings {
  fontSize: 'normal' | 'large' | 'xlarge';
  highContrast: boolean;
  readingGuide: boolean;
  softMotion: boolean;
}
