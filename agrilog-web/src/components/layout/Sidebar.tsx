import React from 'react';
import {
  LayoutDashboard,
  Sprout,
  Tractor,
  Bug,
  Package,
  Wrench,
  BarChart3,
  Settings,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

export interface NavItem {
  key: string;
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  badge?: number;
}

export const NAV_ITEMS: NavItem[] = [
  { key: 'overview', label: 'Tổng quan', href: '/', icon: LayoutDashboard },
  { key: 'seasons', label: 'Mùa vụ', href: '/seasons', icon: Sprout },
  { key: 'activities', label: 'Hoạt động', href: '/activities', icon: Tractor },
  {
    key: 'observations',
    label: 'Quan sát',
    href: '/observations',
    icon: Bug,
    badge: 3,
  },
  { key: 'inventory', label: 'Vật tư', href: '/inventory', icon: Package },
  { key: 'assets', label: 'Tài sản', href: '/assets', icon: Wrench },
  { key: 'reports', label: 'Báo cáo', href: '/reports', icon: BarChart3 },
];

export interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = false, onClose }: SidebarProps) {
  const location = useLocation();

  const isItemActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  const content = (
    <div className="flex h-full flex-col bg-[#1C2B1E] shadow-2xl">
      <div className="flex h-16 shrink-0 items-center gap-2 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#C9A227]/15 text-[#E7C766]">
          <Sprout className="h-4.5 w-4.5" strokeWidth={1.75} />
        </div>
        <span
          className="text-[17px] text-[#F3F5E9]"
          style={{ fontFamily: "'Lora', serif", fontWeight: 500 }}
        >
          AgriLog
        </span>
        <button
          type="button"
          onClick={onClose}
          className="ml-auto text-[#8FA084] transition hover:text-white lg:hidden"
          aria-label="Đóng menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.href);
          return (
            <Link
              key={item.key}
              to={item.href}
              onClick={onClose}
              className={
                'relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px] transition-colors ' +
                (isActive
                  ? 'text-[#F3F5E9]'
                  : 'text-[#9BAB90] hover:bg-[#233420] hover:text-[#E4E8D8]')
              }
              style={{ fontFamily: "'Lora', serif" }}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebarActiveBackground"
                  className="absolute inset-0 rounded-lg bg-[#2A3E2A]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon
                className="relative z-10 h-4.5 w-4.5 shrink-0"
                strokeWidth={1.75}
              />
              <span className="relative z-10 flex-1 truncate">
                {item.label}
              </span>
              {item.badge && (
                <span className="relative z-10 rounded-full bg-[#C9A227] px-1.5 py-0.5 text-[10.5px] font-medium text-[#1C2B1E]">
                  {item.badge}
                </span>
              )}
              {isActive && (
                <motion.span
                  layoutId="sidebarActiveDot"
                  className="relative z-10 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9A227]"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-[#2A3E2A] p-3">
        <Link
          to="/settings"
          onClick={onClose}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px] text-[#9BAB90] transition hover:bg-[#233420] hover:text-[#E4E8D8]"
          style={{ fontFamily: "'Lora', serif" }}
        >
          <Settings className="h-4.5 w-4.5 shrink-0" strokeWidth={1.75} />
          Cài đặt
        </Link>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: cố định bên trái */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <div className="fixed inset-y-0 left-0 w-64">{content}</div>
      </aside>

      {/* Mobile: drawer trượt ra + backdrop với AnimatePresence */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
              onClick={onClose}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="absolute inset-y-0 left-0 w-64 shadow-xl"
            >
              {content}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Sidebar;
