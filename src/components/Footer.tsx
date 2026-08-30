import React from 'react';
import { School, Heart, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="main-footer" className="bg-[#EBF4F0] border-t border-[#D5EAE0] mt-12 py-8 px-4 sm:px-8 text-[#4E7066]">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Footer Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-[#D8EDE4]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#29836B] flex items-center justify-center shadow-xs">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-base text-[#193C32]">
                중앙탑중학교 특수교육지원실 · 참사랑학급
              </h4>
              <p className="text-xs text-[#6B8E83]">
                JUNGANGTAP MIDDLE SCHOOL INCLUSIVE EDUCATION
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-scroll-to-top"
              type="button"
              onClick={scrollToTop}
              className="px-3.5 py-1.5 rounded-full bg-white flex items-center gap-1.5 text-xs font-bold text-[#2C7864] clay-pill hover:bg-[#DDF3EA] transition-colors cursor-pointer"
              title="맨 위로 가기"
            >
              <span>맨 위로</span>
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* School Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#52756B]">
          <div className="space-y-1">
            <p className="font-bold text-[#2C5247]">중앙탑중학교 특수교육지원실</p>
            <p>충청북도 충주시 중앙탑면 원앙길 103</p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-[#7A9C92]">
            <Heart className="w-3 h-3 text-[#F26E6E] fill-current" />
            <span>배려와 나눔으로 함께 성장하는 포용 교육</span>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-3 border-t border-[#D8EDE4] flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-[#7A9C92]">
          <p>© 2026 중앙탑중학교 참사랑학급. All rights reserved.</p>
          <span>웹 접근성 지원 포털</span>
        </div>

      </div>
    </footer>
  );
};

