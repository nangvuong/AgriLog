import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { X } from 'lucide-react';
import {
  QuickLogForm,
  type QuickLogFormProps,
} from './QuickLogForm';

interface QuickLogBottomSheetProps extends QuickLogFormProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * QuickLogBottomSheet - Bottom Sheet / Modal Ghi nhật ký nhanh chuẩn trang-chu-nong-dan.html
 * Khi phần ghi nhật ký hiện lên: Khóa cuộn trang nền (Lock background scroll) để người dùng không cuộn trang xuống dưới được.
 */
export const QuickLogBottomSheet: React.FC<QuickLogBottomSheetProps> = ({
  isOpen,
  onClose,
  ...formProps
}) => {
  // Khóa cuộn (Scroll Lock) cho trang nền khi Quick Log mở ra
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const scrollArea = document.querySelector('.scroll-area');
      if (scrollArea) {
        (scrollArea as HTMLElement).style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
      const scrollArea = document.querySelector('.scroll-area');
      if (scrollArea) {
        (scrollArea as HTMLElement).style.overflow = 'auto';
      }
    }

    return () => {
      document.body.style.overflow = '';
      const scrollArea = document.querySelector('.scroll-area');
      if (scrollArea) {
        (scrollArea as HTMLElement).style.overflow = 'auto';
      }
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center overflow-hidden">
          {/* Sheet Backdrop - cố định toàn màn hình */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1F3A2E]/55 backdrop-blur-xs z-[100] cursor-pointer"
          />

          {/* Bottom Sheet Container - cố định góc dưới màn hình */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="relative w-full max-w-lg bg-[#FBF8F1] rounded-t-[28px] shadow-[0_-14px_45px_rgba(25,38,28,0.35)] z-[101] flex flex-col max-h-[92vh] border-t border-[#E4DCC8] overflow-hidden"
            style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
          >
            {/* Sheet Handle cho mobile */}
            <div className="w-[44px] h-[5px] bg-[#D6CEBC] rounded-full mx-auto mt-3 mb-1 shrink-0" />

            {/* Sheet Head */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#E4DCC8] shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D9A441] animate-pulse" />
                <h3 className="font-serif font-bold text-[18px] text-[#1F3A2E] m-0">
                  Ghi nhật ký nhanh
                </h3>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Đóng"
                className="w-8 h-8 rounded-full bg-[#EAE3D2] hover:bg-[#DED5C0] flex items-center justify-center text-[#4A5D4E] hover:text-[#1F3A2E] transition-colors cursor-pointer active:scale-95"
              >
                <X className="w-4 h-4 stroke-[2.5]" />
              </button>
            </div>

            {/* Sheet Body */}
            <div className="p-4 overflow-y-auto max-h-[calc(92vh-68px)] pb-10 no-scrollbar">
              <QuickLogForm {...formProps} />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
