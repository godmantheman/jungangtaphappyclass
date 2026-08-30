import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { QUICK_MENU_ITEMS } from '../data/portalData';
import { QuickMenuItem } from '../types';

interface QuickMenuCardsProps {
  onSelectMenu: (menuId: string) => void;
}

export const QuickMenuCards: React.FC<QuickMenuCardsProps> = ({ onSelectMenu }) => {
  const getCardThemeClass = (theme: QuickMenuItem['theme']) => {
    switch (theme) {
      case 'mint':
        return 'clay-card-mint hover:border-[#86DDC7]';
      case 'yellow':
        return 'clay-card-yellow hover:border-[#FAD67B]';
      case 'blue':
        return 'clay-card bg-gradient-to-br from-[#EEF7FF] via-[#F4FAFF] to-[#E5F1FC] hover:border-[#8EC1FC]';
      case 'coral':
        return 'clay-card bg-gradient-to-br from-[#FFF2EE] via-[#FFF8F5] to-[#FCEAE5] hover:border-[#F7ABA0]';
      default:
        return 'clay-card hover:border-[#3EB895]';
    }
  };

  const getAccentBadgeColor = (theme: QuickMenuItem['theme']) => {
    switch (theme) {
      case 'mint':
        return 'bg-[#C7F0E4] text-[#1D6C58] border-[#A8E4D2]';
      case 'yellow':
        return 'bg-[#FEECA7] text-[#7F5900] border-[#FBDC7B]';
      case 'blue':
        return 'bg-[#D6E8FC] text-[#1656A8] border-[#B9DAFA]';
      case 'coral':
        return 'bg-[#FEDBD4] text-[#A63724] border-[#F8B7AB]';
      default:
        return 'bg-[#E3F4EE] text-[#22725D] border-[#C4E8DD]';
    }
  };

  return (
    <section id="quick-menu-cards-section" className="py-4 sm:py-6 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Section Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3FB997] shadow-xs" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#357B69]">
                주요 소통 & 참여 창구
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#193B32] tracking-tight">
              참사랑학급 바로가기
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#5B7F74] font-medium">
            공지, 학급 게시판, 실시간 전체 채팅과 1:1 상담실을 이용하실 수 있습니다
          </p>
        </div>

        {/* 4 Focused Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {QUICK_MENU_ITEMS.map((item) => (
            <div
              key={item.id}
              id={`card-${item.id}`}
              onClick={() => onSelectMenu(item.id)}
              className={`relative group cursor-pointer transition-all duration-300 p-5 rounded-[28px] flex flex-col justify-between overflow-hidden border-2 border-white/80 shadow-md hover:-translate-y-1 ${getCardThemeClass(
                item.theme
              )}`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${getAccentBadgeColor(item.theme)}`}>
                    {item.badge}
                  </span>
                  <div className="w-7 h-7 rounded-full bg-white/90 shadow-xs flex items-center justify-center text-[#3B665A] group-hover:bg-[#20876C] group-hover:text-white transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-extrabold tracking-wider text-[#547E72]">
                    {item.subTitle}
                  </p>
                  <h3 className="text-lg font-extrabold text-[#183930] group-hover:text-[#18755D] transition-colors mt-0.5">
                    {item.title}
                  </h3>
                </div>

                <p className="text-xs text-[#527067] font-medium leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <span className="text-[11px] font-extrabold text-[#248169] group-hover:underline flex items-center gap-0.5">
                  입장하기 →
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
