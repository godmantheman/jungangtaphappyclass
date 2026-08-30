import React from 'react';
import { 
  Eye, 
  Sparkles, 
  Search, 
  School, 
  SunMedium, 
  Moon,
  ShieldCheck,
  LogIn,
  LogOut,
  User as UserIcon,
  MessageSquare,
  MessagesSquare,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { AccessibilitySettings } from '../types';
import { useAuth } from '../lib/AuthContext';

interface HeaderProps {
  settings: AccessibilitySettings;
  onUpdateSettings: (updater: (prev: AccessibilitySettings) => AccessibilitySettings) => void;
  activeNav: string;
  onSelectNav: (id: string) => void;
  onOpenSearch: () => void;
  onOpenAdminPanel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  activeNav,
  onSelectNav,
  onOpenSearch,
  onOpenAdminPanel,
}) => {
  const { user, isAdmin, adminData, loginWithGoogle, logout } = useAuth();

  const navItems = [
    { id: 'intro', label: '학급 소개' },
    { id: 'notices', label: '공지마당' },
    { id: 'gallery', label: '활동 이야기' },
    { id: 'chat', label: '소통 채팅방' },
    { id: 'direct-chat', label: '1:1 상담채팅' },
  ];

  return (
    <header id="main-header" className="sticky top-0 z-40 backdrop-blur-md bg-white/85 border-b border-[#E3EFEA] transition-colors">
      {/* Top Utility Accessibility & Auth Bar */}
      <div className="bg-[#EBF7F3] border-b border-[#D8EDE5] py-1.5 px-2 sm:px-8 text-xs text-[#3D6B5E] overflow-x-hidden">
        <div className="flex flex-col gap-2">
          {/* First Row - Portal Label */}
          <div className="flex items-center justify-center sm:justify-start gap-2 min-w-0">
            <span className="inline-flex items-center gap-1 bg-white/90 px-2 py-0.5 rounded-full clay-pill text-[#2C7A65] font-semibold text-[10px] flex-shrink-0 whitespace-nowrap">
              <Sparkles className="w-2.5 h-2.5 text-[#3EB895]" />
              웹접근성 지원
            </span>
            <span className="hidden sm:inline text-[#6B9084] text-[11px]">
              누구나 편리하게 이용할 수 있는 유니버설 디자인 환경입니다
            </span>
          </div>

          {/* Second Row - Controls */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
            {/* Font Size Adjusters */}
            <div className="flex items-center bg-white/80 rounded-full px-1.5 py-0.5 clay-pill border border-[#D5EAE2] flex-shrink-0">
              <span className="text-[9px] font-bold text-[#558376] mr-0.5">글자</span>
              <button
                id="btn-font-normal"
                type="button"
                onClick={() => onUpdateSettings(s => ({ ...s, fontSize: 'normal' }))}
                className={`px-1 py-0.5 text-[9px] font-bold rounded-full transition-all cursor-pointer ${
                  settings.fontSize === 'normal' 
                    ? 'bg-[#3EB895] text-white clay-pill shadow-xs' 
                    : 'text-[#558376] hover:bg-[#E5F3EE]'
                }`}
                title="기본 글자 크기"
              >
                보
              </button>
              <button
                id="btn-font-large"
                type="button"
                onClick={() => onUpdateSettings(s => ({ ...s, fontSize: 'large' }))}
                className={`px-1 py-0.5 text-[9px] font-bold rounded-full transition-all cursor-pointer ${
                  settings.fontSize === 'large' 
                    ? 'bg-[#3EB895] text-white clay-pill shadow-xs' 
                    : 'text-[#558376] hover:bg-[#E5F3EE]'
                }`}
                title="큰 글자 크기"
              >
                크
              </button>
              <button
                id="btn-font-xlarge"
                type="button"
                onClick={() => onUpdateSettings(s => ({ ...s, fontSize: 'xlarge' }))}
                className={`px-1 py-0.5 text-[9px] font-bold rounded-full transition-all cursor-pointer ${
                  settings.fontSize === 'xlarge' 
                    ? 'bg-[#3EB895] text-white clay-pill shadow-xs' 
                    : 'text-[#558376] hover:bg-[#E5F3EE]'
                }`}
                title="아주 큰 글자 크기"
              >
                대
              </button>
            </div>

            {/* High Contrast Toggle */}
            <button
              id="btn-toggle-contrast"
              type="button"
              onClick={() => onUpdateSettings(s => ({ ...s, highContrast: !s.highContrast }))}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold clay-btn transition-all cursor-pointer flex-shrink-0 ${
                settings.highContrast 
                  ? 'bg-[#1D352F] text-[#FFE885] border border-[#FFE885]' 
                  : 'bg-white text-[#3D6B5E] hover:bg-[#E4F5EF]'
              }`}
              title="고대비 흑백 모드 토글"
            >
              {settings.highContrast ? <SunMedium className="w-2.5 h-2.5" /> : <Moon className="w-2.5 h-2.5" />}
              <span className="hidden sm:inline">고대비</span>
            </button>

            {/* Reading Guide Ruler */}
            <button
              id="btn-toggle-reading-guide"
              type="button"
              onClick={() => onUpdateSettings(s => ({ ...s, readingGuide: !s.readingGuide }))}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-semibold clay-btn transition-all cursor-pointer flex-shrink-0 ${
                settings.readingGuide 
                  ? 'bg-[#3EB895] text-white' 
                  : 'bg-white text-[#3D6B5E] hover:bg-[#E4F5EF]'
              }`}
              title="읽기 가이드라인 활성화"
            >
              <Eye className="w-2.5 h-2.5" />
              <span className="hidden md:inline">읽기</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main GNB Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div 
          id="header-brand"
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          onClick={() => onSelectNav('intro')}
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#A7E8D8] via-[#65D4B8] to-[#3EB895] p-2 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <School className="w-6 h-6 drop-shadow-sm" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl text-[#1E3B33] tracking-tight">
                중앙탑중학교
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#E5F7F1] text-[#29836B] border border-[#C6ECDF]">
                특수교육지원
              </span>
            </div>
            <p className="text-xs text-[#63877D] font-medium tracking-wide">
              행복반 공식 포털 · Inclusive Education
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav id="desktop-nav" className="hidden md:flex items-center gap-1">
          {navItems.map(item => {
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                type="button"
                onClick={() => onSelectNav(item.id)}
                className={`px-3 py-2 rounded-2xl font-bold text-xs sm:text-sm transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-[#E3F6F0] text-[#1E6854] shadow-xs'
                    : 'text-[#46655C] hover:text-[#1E6854] hover:bg-[#F0F8F5]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 bg-[#3EB895] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          <button
            id="btn-header-search"
            type="button"
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white border border-[#D5EBE2] text-[#4F7368] hover:text-[#1E6854] hover:border-[#3EB895] clay-btn text-xs font-semibold shadow-xs cursor-pointer"
            title="포털 통합 검색"
          >
            <Search className="w-4 h-4 text-[#3EB895]" />
            <span className="hidden sm:inline">통합 검색</span>
          </button>

          {/* User Auth Info / Login Button */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* Profile Chip */}
              <div className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-2xl bg-[#F0FAF6] border border-[#D3EDE2]">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || '사용자'} 
                    className="w-6 h-6 rounded-full object-cover border border-[#9BD8C4]"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#3EB895] text-white flex items-center justify-center text-[10px] font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-extrabold text-[#1B4B3D] max-w-[90px] sm:max-w-[120px] truncate">
                  {user.displayName || user.email?.split('@')[0]}
                </span>
                {isAdmin && (
                  <span className="px-1.5 py-0.5 rounded-md bg-[#FFEAA7] text-[#9A6400] text-[10px] font-black tracking-tight">
                    관리자
                  </span>
                )}
              </div>

              {/* Admin Panel Button */}
              {isAdmin && (
                <button
                  type="button"
                  onClick={onOpenAdminPanel}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#1D4A3E] text-white font-bold text-xs shadow-md hover:bg-[#15382E] cursor-pointer"
                  title="관리자 제어판 (관리자 추가 및 콘텐츠 관리)"
                >
                  <ShieldCheck className="w-4 h-4 text-[#72ECC8]" />
                  <span className="hidden lg:inline">관리자 패널</span>
                </button>
              )}
              
              {/* Logout Button */}
              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-2xl bg-white border border-[#D5EBE2] text-[#61877B] hover:text-[#C44A4A] text-xs font-bold transition-colors cursor-pointer"
                title="로그아웃"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={loginWithGoogle}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#22836B] hover:bg-[#1A6B57] text-white font-bold text-xs clay-btn shadow-md cursor-pointer"
              title="구글 계정으로 로그인"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
