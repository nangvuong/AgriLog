import React from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, BookOpen, Home, Plus, User } from 'lucide-react';

interface FarmerBottomNavProps {
  activeTab?: 'home' | 'journal' | 'alerts' | 'profile';
  unreadAlertsCount: number;
  onOpenQuickLog: () => void;
  onNavigate: (
    tab: 'farmer-home' | 'login' | 'register' | 'profile' | 'change-password',
  ) => void;
  onShowToast: (msg: string) => void;
}

/**
 * FarmerBottomNav - Thanh điều hướng đáy màn hình với hiệu ứng Active Tab & Animation
 * - Phản hồi mượt mà với Motion/React (whileTap scale & active pill indicator)
 * - Nút "Trang chủ" kích hoạt chuyển hướng quay về trang Nông dân (/farmer-home)
 */
export const FarmerBottomNav: React.FC<FarmerBottomNavProps> = ({
  activeTab = 'home',
  unreadAlertsCount,
  onOpenQuickLog,
  onNavigate,
  onShowToast,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 max-w-5xl mx-auto bg-white/95 backdrop-blur-2xl border-t border-[#E4DCC8] flex items-center justify-around py-2 px-2 z-40 shadow-2xl">
      {/* Tab: Trang chủ */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          if (activeTab === 'home') {
            onShowToast('Anh/chị đang ở Trang chủ Nông dân');
          } else {
            onNavigate('farmer-home');
          }
        }}
        className={`relative flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl cursor-pointer transition-colors ${
          activeTab === 'home'
            ? 'text-[#1F3A2E] font-bold'
            : 'text-[#5C6B57] hover:text-[#1F3A2E] font-medium'
        }`}
      >
        {activeTab === 'home' && (
          <motion.div
            layoutId="activeTabBg"
            className="absolute inset-0 bg-[#EBF3ED] rounded-xl -z-10"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[#1F3A2E]' : 'stroke-[#5C6B57]'}`} />
        <span className="text-[10.5px]">Trang chủ</span>
      </motion.button>

      {/* Tab: Nhật ký */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={onOpenQuickLog}
        className={`relative flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl cursor-pointer transition-colors ${
          activeTab === 'journal'
            ? 'text-[#1F3A2E] font-bold'
            : 'text-[#5C6B57] hover:text-[#1F3A2E] font-medium'
        }`}
      >
        {activeTab === 'journal' && (
          <motion.div
            layoutId="activeTabBg"
            className="absolute inset-0 bg-[#EBF3ED] rounded-xl -z-10"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <BookOpen className={`w-5 h-5 ${activeTab === 'journal' ? 'stroke-[#1F3A2E]' : 'stroke-[#5C6B57]'}`} />
        <span className="text-[10.5px]">Nhật ký</span>
      </motion.button>

      {/* Center Action Button (Quick Log FAB) */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        onClick={onOpenQuickLog}
        className="w-11 h-11 -mt-5 rounded-2xl bg-[#1F3A2E] text-[#F5F2E8] flex items-center justify-center shadow-lg border-2 border-white hover:bg-emerald-800 transition-all cursor-pointer shrink-0"
        aria-label="Ghi nhật ký nhanh"
      >
        <Plus className="w-5 h-5 stroke-white stroke-[2.5]" />
      </motion.button>

      {/* Tab: Cảnh báo */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => onShowToast('Danh sách cảnh báo dịch hại & cách ly GlobalGAP')}
        className={`relative flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl cursor-pointer transition-colors ${
          activeTab === 'alerts'
            ? 'text-[#1F3A2E] font-bold'
            : 'text-[#5C6B57] hover:text-[#1F3A2E] font-medium'
        }`}
      >
        {activeTab === 'alerts' && (
          <motion.div
            layoutId="activeTabBg"
            className="absolute inset-0 bg-[#EBF3ED] rounded-xl -z-10"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <AlertTriangle className={`w-5 h-5 ${activeTab === 'alerts' ? 'stroke-[#1F3A2E]' : 'stroke-[#5C6B57]'}`} />
        <span className="text-[10.5px]">Cảnh báo</span>
        {unreadAlertsCount > 0 && (
          <span className="absolute top-1.5 right-[24%] w-2 h-2 rounded-full bg-[#B84C3C] ring-2 ring-white" />
        )}
      </motion.button>

      {/* Tab: Hồ sơ */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.92 }}
        onClick={() => {
          if (activeTab === 'profile') {
            onShowToast('Anh/chị đang ở màn hình Hồ sơ');
          } else {
            onNavigate('profile');
          }
        }}
        className={`relative flex-1 flex flex-col items-center gap-1 py-1.5 rounded-xl cursor-pointer transition-colors ${
          activeTab === 'profile'
            ? 'text-[#1F3A2E] font-bold'
            : 'text-[#5C6B57] hover:text-[#1F3A2E] font-medium'
        }`}
      >
        {activeTab === 'profile' && (
          <motion.div
            layoutId="activeTabBg"
            className="absolute inset-0 bg-[#EBF3ED] rounded-xl -z-10"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
        <User className={`w-5 h-5 ${activeTab === 'profile' ? 'stroke-[#1F3A2E]' : 'stroke-[#5C6B57]'}`} />
        <span className="text-[10.5px]">Hồ sơ</span>
      </motion.button>
    </nav>
  );
};
