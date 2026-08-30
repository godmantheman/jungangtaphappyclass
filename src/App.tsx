import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import { QuickMenuCards } from './components/QuickMenuCards';
import { NoticeSection } from './components/NoticeSection';
import { ActivityGallerySection } from './components/ActivityGallerySection';
import { Footer } from './components/Footer';
import { DetailModal, ModalData } from './components/DetailModal';
import { SearchModal } from './components/SearchModal';
import { NoticeEditorModal } from './components/NoticeEditorModal';
import { GalleryEditorModal } from './components/GalleryEditorModal';
import { AdminPanelModal } from './components/AdminPanelModal';
import { NoticePage } from './pages/NoticePage';
import { GalleryPage } from './pages/GalleryPage';
import { GroupChatPage } from './pages/GroupChatPage';
import { DirectChatPage } from './pages/DirectChatPage';
import { 
  AccessibilitySettings, 
  NoticeItem, 
  GalleryItem
} from './types';
import { QUICK_MENU_ITEMS } from './data/portalData';
import { 
  subscribeNotices, 
  addNotice, 
  updateNotice, 
  deleteNotice, 
  incrementNoticeViews,
  subscribeGallery,
  addGalleryItem,
  deleteGalleryItem,
  likeGalleryItem
} from './lib/firestoreService';

export default function App() {
  // Real Firestore Data States
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);

  // Navigation State
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [modalData, setModalData] = useState<ModalData | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [cursorY, setCursorY] = useState(0);

  // Admin Modals State
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [isNoticeEditorOpen, setIsNoticeEditorOpen] = useState(false);
  const [editingNotice, setEditingNotice] = useState<NoticeItem | null>(null);
  const [isGalleryEditorOpen, setIsGalleryEditorOpen] = useState(false);

  // Accessibility State
  const [accessibility, setAccessibility] = useState<AccessibilitySettings>({
    fontSize: 'normal',
    highContrast: false,
    readingGuide: false,
    softMotion: true,
  });

  // Subscribe to real-time Firestore collections
  useEffect(() => {
    const unsubNotices = subscribeNotices((items) => {
      setNotices(items);
    });

    const unsubGallery = subscribeGallery((items) => {
      setGalleryItems(items);
    });

    return () => {
      unsubNotices();
      unsubGallery();
    };
  }, []);

  // Track mouse for reading guide
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (accessibility.readingGuide) {
        setCursorY(e.clientY);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [accessibility.readingGuide]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentPage]);

  // Handlers for Firestore CRUD
  const handleSaveNotice = async (noticePayload: Omit<NoticeItem, 'id' | 'views'>, editId?: string) => {
    if (editId) {
      await updateNotice(editId, noticePayload);
    } else {
      await addNotice(noticePayload);
    }
  };

  const handleDeleteNotice = async (id: string) => {
    await deleteNotice(id);
  };

  const handleOpenNoticeEditor = (notice?: NoticeItem) => {
    setEditingNotice(notice || null);
    setIsNoticeEditorOpen(true);
  };

  const handleSaveGalleryItem = async (item: Omit<GalleryItem, 'id' | 'likes'>) => {
    await addGalleryItem(item);
  };

  const handleDeleteGalleryItem = async (id: string) => {
    await deleteGalleryItem(id);
  };

  const handleLikeGalleryItem = async (id: string) => {
    await likeGalleryItem(id);
  };

  const handleSelectNav = (id: string) => {
    if (id === 'intro' || id === 'home') setCurrentPage('home');
    else if (id === 'notices') setCurrentPage('notices');
    else if (id === 'gallery') setCurrentPage('gallery');
    else if (id === 'chat') setCurrentPage('chat');
    else if (id === 'direct-chat') setCurrentPage('direct-chat');
  };

  const handleSelectQuickMenu = (menuId: string) => {
    if (menuId === 'menu-notice') setCurrentPage('notices');
    else if (menuId === 'menu-gallery') setCurrentPage('gallery');
    else if (menuId === 'menu-chat') setCurrentPage('chat');
    else if (menuId === 'menu-direct-chat') setCurrentPage('direct-chat');
    else {
      const item = QUICK_MENU_ITEMS.find(m => m.id === menuId);
      if (item) setModalData({ type: 'quickMenu', data: item });
    }
  };

  const getFontScaleClass = () => {
    switch (accessibility.fontSize) {
      case 'large':
        return 'font-scale-large text-[17px]';
      case 'xlarge':
        return 'font-scale-xlarge text-[19px]';
      default:
        return 'font-scale-normal text-[15px]';
    }
  };

  return (
    <div 
      className={`min-h-screen transition-all duration-300 ${getFontScaleClass()} ${
        accessibility.highContrast 
          ? 'high-contrast-mode bg-[#0A1411] text-[#F0FAF7]' 
          : 'bg-[#F4F9F6] text-[#2C3E3A]'
      }`}
    >
      {/* Reading Guide Ruler */}
      {accessibility.readingGuide && (
        <div 
          className="fixed left-0 right-0 h-10 bg-[#3EB895]/20 border-y-2 border-[#3EB895]/60 pointer-events-none z-50 transition-all duration-75"
          style={{ top: `${cursorY - 20}px` }}
        />
      )}

      {/* Header with Navigation & Auth State */}
      <Header
        settings={accessibility}
        onUpdateSettings={setAccessibility}
        activeNav={currentPage === 'home' ? 'intro' : currentPage}
        onSelectNav={handleSelectNav}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
      />

      {/* Main Routing Views */}
      <main className="min-h-[75vh]">
        {currentPage === 'home' && (
          <div className="space-y-4 animate-fadeIn">
            {/* 1. Hero 3D Banner */}
            <HeroBanner
              onOpenNotice={() => setCurrentPage('notices')}
              onOpenGallery={() => setCurrentPage('gallery')}
              onOpenChat={() => setCurrentPage('chat')}
              onOpenDirectChat={() => setCurrentPage('direct-chat')}
            />

            {/* 2. 3D Quick Menu */}
            <QuickMenuCards onSelectMenu={handleSelectQuickMenu} />

            {/* 3. Real-time Notice Section */}
            <NoticeSection
              notices={notices}
              onSelectNotice={(item: NoticeItem) => {
                incrementNoticeViews(item.id);
                setModalData({ type: 'notice', data: item });
              }}
              onViewAll={() => setCurrentPage('notices')}
              onOpenNoticeEditor={() => handleOpenNoticeEditor()}
            />

            {/* 4. Real-time Activity / Posts Section */}
            <ActivityGallerySection
              galleryItems={galleryItems}
              onSelectGallery={(item: GalleryItem) => setModalData({ type: 'gallery', data: item })}
              onViewAll={() => setCurrentPage('gallery')}
              onOpenGalleryEditor={() => setIsGalleryEditorOpen(true)}
              onLikeGalleryItem={handleLikeGalleryItem}
            />
          </div>
        )}

        {/* Dedicated Page: Notices */}
        {currentPage === 'notices' && (
          <NoticePage
            notices={notices}
            onBackToHome={() => setCurrentPage('home')}
            onOpenNoticeEditor={handleOpenNoticeEditor}
            onDeleteNotice={handleDeleteNotice}
            onIncrementViews={incrementNoticeViews}
          />
        )}

        {/* Dedicated Page: Activity / Posts */}
        {currentPage === 'gallery' && (
          <GalleryPage
            galleryItems={galleryItems}
            onBackToHome={() => setCurrentPage('home')}
            onOpenGalleryEditor={() => setIsGalleryEditorOpen(true)}
            onDeleteGalleryItem={handleDeleteGalleryItem}
            onLikeGalleryItem={handleLikeGalleryItem}
          />
        )}

        {/* Dedicated Page: Group Chat */}
        {currentPage === 'chat' && (
          <GroupChatPage
            onBackToHome={() => setCurrentPage('home')}
          />
        )}

        {/* Dedicated Page: 1:1 Direct Consultation Chat */}
        {currentPage === 'direct-chat' && (
          <DirectChatPage
            onBackToHome={() => setCurrentPage('home')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Detail Preview Modal */}
      <DetailModal
        modalData={modalData}
        onClose={() => setModalData(null)}
        onDeleteNotice={handleDeleteNotice}
        onDeleteGalleryItem={handleDeleteGalleryItem}
        onEditNotice={(item) => handleOpenNoticeEditor(item)}
      />


      {/* Global Real-time Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onNavigatePage={(page) => setCurrentPage(page)}
        notices={notices}
        galleryItems={galleryItems}
      />

      {/* Admin Panel Modal */}
      <AdminPanelModal
        isOpen={isAdminPanelOpen}
        onClose={() => setIsAdminPanelOpen(false)}
        onOpenNoticeEditor={() => handleOpenNoticeEditor()}
        onOpenGalleryEditor={() => setIsGalleryEditorOpen(true)}
      />

      {/* Notice Editor Modal */}
      <NoticeEditorModal
        isOpen={isNoticeEditorOpen}
        onClose={() => {
          setIsNoticeEditorOpen(false);
          setEditingNotice(null);
        }}
        onSave={handleSaveNotice}
        editNotice={editingNotice}
      />

      {/* Gallery / Post Editor Modal */}
      <GalleryEditorModal
        isOpen={isGalleryEditorOpen}
        onClose={() => setIsGalleryEditorOpen(false)}
        onSave={handleSaveGalleryItem}
      />
    </div>
  );
}
