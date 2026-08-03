import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { Input } from '@/components/ui/input';

export interface NavbarProps {
  onMenuClick?: () => void;
  farmName?: string;
  userName?: string;
  userRole?: string;
}

export function Navbar({
  onMenuClick,
  farmName = 'Nông trại Ba Xuân',
  userName = 'Ông Ba',
  userRole = 'Chủ nông trại',
}: NavbarProps) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { logout } = useAuthStore();
  const menuRef = useRef<HTMLDivElement>(null);

  // Close user menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E1E5CB] bg-[#FFFDF6]/95 px-4 backdrop-blur sm:px-6 lg:pl-8">
      <button
        type="button"
        onClick={onMenuClick}
        className="text-[#33361F] lg:hidden"
        aria-label="Mở menu điều hướng"
      >
        <Menu className="h-5.5 w-5.5" strokeWidth={1.75} />
      </button>

      <div className="hidden min-w-0 flex-col leading-tight sm:flex">
        <span
          className="truncate text-[13.5px] text-[#20281B]"
          style={{ fontFamily: "'Lora', serif", fontWeight: 500 }}
        >
          {farmName}
        </span>
        <span className="text-[11px] text-[#8B9070]">Nông trại</span>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative hidden w-56 sm:block">
          <Input
            icon={Search}
            type="text"
            placeholder="Tìm thửa, mùa vụ, hoạt động..."
            className="h-9 w-full rounded-md text-[13px]"
            style={{ fontFamily: "'Lora', serif" }}
          />
        </div>

        <button
          type="button"
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-[#52502E] transition hover:bg-[#ECEEDA]"
          aria-label="Thông báo"
        >
          <Bell className="h-4.5 w-4.5" strokeWidth={1.75} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#C15A34]" />
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 transition hover:bg-[#ECEEDA]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C2B1E] text-[12px] font-medium text-[#F6EFDD]">
              {userName?.slice(0, 1) || 'N'}
            </div>
            <div className="hidden text-left leading-tight sm:block">
              <p
                className="text-[12.5px] text-[#20281B]"
                style={{ fontFamily: "'Lora', serif" }}
              >
                {userName}
              </p>
              <p className="text-[10.5px] text-[#8B9070]">{userRole}</p>
            </div>
            <ChevronDown
              className="h-3.5 w-3.5 text-[#8B9070]"
              strokeWidth={1.75}
            />
          </button>

          <AnimatePresence>
            {userMenuOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -6 }}
                transition={{ duration: 0.16, ease: 'easeOut' }}
                className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-[#E1E5CB] bg-[#FFFDF6] py-1.5 shadow-md"
              >
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(false)}
                  className="block w-full px-3.5 py-2 text-left text-[13px] text-[#33361F] hover:bg-[#ECEEDA]"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  Hồ sơ của tôi
                </button>
                <button
                  type="button"
                  onClick={() => setUserMenuOpen(false)}
                  className="block w-full px-3.5 py-2 text-left text-[13px] text-[#33361F] hover:bg-[#ECEEDA]"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  Đổi nông trại
                </button>
                <div className="my-1 h-px bg-[#E1E5CB]" />
                <button
                  type="button"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                  className="block w-full px-3.5 py-2 text-left text-[13px] text-[#9C4B2E] hover:bg-[#F6E2DC]"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  Đăng xuất
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
