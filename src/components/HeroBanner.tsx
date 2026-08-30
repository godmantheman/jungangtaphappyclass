import React from 'react';
import { ArrowRight, Sun, Heart, BellRing, FileText, MessagesSquare, MessageSquare } from 'lucide-react';
import { HERO_BANNER_DATA } from '../data/portalData';

interface HeroBannerProps {
  onOpenNotice: () => void;
  onOpenGallery: () => void;
  onOpenChat: () => void;
  onOpenDirectChat: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onOpenNotice,
  onOpenGallery,
  onOpenChat,
  onOpenDirectChat,
}) => {
  return (
    <section id="hero-banner-section" className="relative pt-4 pb-6 sm:pb-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Main 3D Claymorphic Hero Container */}
        <div className="relative overflow-hidden rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-[#E6F8F3] via-[#E2F4FA] to-[#FFF8E6] border-2 border-white shadow-[0_20px_45px_-10px_rgba(45,85,75,0.12)] p-6 sm:p-10 lg:p-12">
          
          {/* Ambient Clay Background Decors */}
          <div className="absolute -top-16 -right-16 w-64 h-64 bg-[#76C4E8]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-[#FFD269]/25 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Content Side */}
            <div className="lg:col-span-6 space-y-6">
              {/* Category & Badge */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 text-[#217760] font-bold text-xs clay-pill shadow-xs border border-[#CDEAE0]">
                  <Sun className="w-3.5 h-3.5 text-[#FFAE1A]" />
                  중앙탑중학교 특수교육지원실
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E8F8F2] text-[#1E745C] font-bold text-xs clay-pill border border-[#BEE7D8]">
                  <Heart className="w-3 h-3 text-[#E05353] fill-current" />
                  행복반 열린 소통 공간
                </span>
              </div>

              {/* Main Headline */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-4xl lg:text-[40px] font-extrabold text-[#19372F] leading-tight tracking-tight">
                  서로 배려하고 함께 성장하는<br />
                  <span className="text-[#20876C] bg-gradient-to-r from-[#20876C] to-[#2E99BE] bg-clip-text text-transparent">
                    따뜻한 행복반 포털
                  </span>
                </h1>
                <p className="text-sm sm:text-base text-[#4E6B63] font-medium leading-relaxed max-w-xl">
                  {HERO_BANNER_DATA.caption}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-wrap items-stretch sm:items-center gap-2">
                <button
                  id="btn-hero-notice"
                  type="button"
                  onClick={onOpenNotice}
                  className="flex-1 sm:flex-none px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-[#22836B] hover:bg-[#1A6D58] text-white font-bold text-[11px] sm:text-sm clay-btn shadow-md flex items-center justify-center gap-1.5 sm:gap-2 group cursor-pointer transition-all"
                >
                  <BellRing className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>공지마당</span>
                  <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  id="btn-hero-gallery"
                  type="button"
                  onClick={onOpenGallery}
                  className="flex-1 sm:flex-none px-3 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-white hover:bg-[#F0FAF5] text-[#22725D] font-bold text-[11px] sm:text-sm border-2 border-[#D5EDE2] clay-pill shadow-xs flex items-center justify-center gap-1.5 sm:gap-2 group cursor-pointer transition-all"
                >
                  <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#D88D16]" />
                  <span>활동 이야기</span>
                </button>

                <button
                  id="btn-hero-chat"
                  type="button"
                  onClick={onOpenChat}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-[#E8F8F2] hover:bg-[#D5F2E8] text-[#1E745C] font-bold text-[11px] sm:text-sm border border-[#BEE7D8] clay-pill flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer transition-all"
                >
                  <MessagesSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#22836B]" />
                  <span>소통방</span>
                </button>

                <button
                  id="btn-hero-direct-chat"
                  type="button"
                  onClick={onOpenDirectChat}
                  className="flex-1 sm:flex-none px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-[#EBF3FF] hover:bg-[#D6E6FF] text-[#1B62D4] font-bold text-[11px] sm:text-sm border border-[#C6DCFF] clay-pill flex items-center justify-center gap-1 sm:gap-1.5 cursor-pointer transition-all"
                >
                  <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#2575FC]" />
                  <span>1:1 상담</span>
                </button>
              </div>

              {/* Feature Chips */}
              <div className="pt-2 flex flex-wrap items-center gap-2.5 text-xs text-[#486B60]">
                <div className="flex items-center gap-2 bg-white/85 px-3 py-1.5 rounded-2xl clay-pill border border-[#DDF0EA]">
                  <div className="w-2 h-2 rounded-full bg-[#41C4A0] animate-pulse" />
                  <span className="font-bold">실시간 소통 & 채팅 지원</span>
                </div>
                <div className="flex items-center gap-2 bg-white/85 px-3 py-1.5 rounded-2xl clay-pill border border-[#DDF0EA]">
                  <Heart className="w-3.5 h-3.5 text-[#F26E6E]" />
                  <span className="font-bold">포용적 통합교육</span>
                </div>
              </div>
            </div>

            {/* Right 3D Isometric Illustration Side */}
            <div className="lg:col-span-6 relative">
              <div className="relative group">
                <div className="relative rounded-[28px] sm:rounded-[36px] overflow-hidden border-4 border-white shadow-[0_16px_36px_rgba(40,110,95,0.16)] bg-white/50 backdrop-blur-xs">
                  <img
                    id="hero-3d-isometric-banner-img"
                    src={HERO_BANNER_DATA.bannerImage}
                    alt="중앙탑중학교 행복반 3D 일러스트 배너"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
                  />
                  
                  {/* Floating Badge */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md rounded-2xl px-3.5 py-2.5 clay-card-mint border border-white/80 shadow-md">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-[#22836B] text-white flex items-center justify-center text-xs font-extrabold">
                        🏫
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[#1E4B3E]">중앙탑중학교 행복반</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
};
