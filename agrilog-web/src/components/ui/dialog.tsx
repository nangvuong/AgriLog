import React from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface DialogProps {
  open?: boolean;
  onClose?: () => void;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function Dialog({
  open = false,
  onClose,
  title,
  description,
  footer,
  children,
  className = '',
}: DialogProps) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 bg-[#151F16]/50 backdrop-blur-xs"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className={cn(
              'relative flex max-h-[92vh] w-full max-w-2xl sm:max-w-3xl flex-col overflow-hidden rounded-2xl border border-[#E1E5CB] bg-[#FFFDF6] shadow-xl',
              className,
            )}
          >
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#EEF0E1] p-4 sm:p-5">
              <div>
                {title && (
                  <h3
                    className="text-[16px] font-medium text-[#20281B]"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    {title}
                  </h3>
                )}
                {description && (
                  <p
                    className="mt-1 text-[12.5px] text-[#7C7A4E]"
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    {description}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 rounded-md p-1 text-[#8B9070] transition hover:bg-[#ECEEDA]"
                aria-label="Đóng"
              >
                <X className="h-4.5 w-4.5" strokeWidth={1.75} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">{children}</div>
            {footer && (
              <div className="flex shrink-0 items-center justify-end gap-2 border-t border-[#EEF0E1] p-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default Dialog;
