import heroImg from '../assets/images/hero_school_clay_1788097638985.jpg';
import noticeImg from '../assets/images/clay_notice_icon_1788097658512.jpg';
import galleryImg from '../assets/images/clay_gallery_icon_1788097693369.jpg';

import { QuickMenuItem } from '../types';

export const HERO_BANNER_DATA = {
  schoolName: '중앙탑중학교',
  subName: '특수교육지원실 · 참사랑학급',
  englishTitle: 'JUNGANGTAP SPECIAL EDUCATION PORTAL',
  tagline: '서로 배려하고 함께 성장하는 따뜻한 참사랑학급',
  caption: '중앙탑중학교 특수학급의 주요 공지사항과 학생들의 다양한 활동 모습, 실시간 소통 및 1:1 상담을 편리하게 이용하실 수 있습니다.',
  bannerImage: heroImg,
};

export const QUICK_MENU_ITEMS: QuickMenuItem[] = [
  {
    id: 'menu-notice',
    title: '공지마당',
    subTitle: '학급 소식 & 가정통신',
    description: '특수학급의 새로운 소식, 가정통신문, 주요 안내사항을 실시간으로 확인합니다.',
    imageSrc: noticeImg,
    badge: '실시간 소식',
    theme: 'mint',
    iconAlt: '3D 클레이 공지사항 아이콘'
  },
  {
    id: 'menu-gallery',
    title: '활동 이야기',
    subTitle: '배움과 성장 기록',
    description: '도예, 원예, 제과제빵 등 학생들의 생생한 활동 모습과 이야기를 나눕니다.',
    imageSrc: galleryImg,
    badge: '성장 이야기',
    theme: 'yellow',
    iconAlt: '3D 클레이 갤러리 아이콘'
  }
];
