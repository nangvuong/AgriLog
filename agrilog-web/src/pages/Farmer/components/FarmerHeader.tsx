import React from 'react';
import { Bell, CloudSun, User } from 'lucide-react';
import { type FarmerDashboardResponse, type UserProfile } from 'agrilog-shared';
import { Badge } from '../../../components/ui';

interface FarmerHeaderProps {
  user: UserProfile | null;
  data: FarmerDashboardResponse;
  onNavigate: (
    tab: 'login' | 'register' | 'profile' | 'change-password',
  ) => void;
  onShowToast: (msg: string) => void;
}

/**
 * FarmerHeader - Header trang chủ Nông dân theo thiết kế từ trang-chu-nong-dan.html
 * Phong cách Editorial Green & Gold với phông chữ Fraunces Serif & IBM Plex Mono
 */
export const FarmerHeader: React.FC<FarmerHeaderProps> = ({
  user,
  data,
  onNavigate,
  onShowToast,
}) => {
  const unreadCount = data.unread_alerts_count || 0;

  return (
    <header className="bg-[#1F3A2E] text-[#F5F2E8] px-5 sm:px-8 pt-6 pb-12 relative overflow-hidden">
      {/* Visual Radial Pattern Overlay */}
      <div
        className="absolute inset-0 opacity-12 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, #D9A441 2px, transparent 2.2px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          {/* Greeting Column */}
          <div className="greeting">
            <div className="text-[11.5px] font-medium uppercase tracking-[0.1em] text-[#8FAE94] font-mono">
              {data.current_date || 'Thứ Tư, 29/07'}
            </div>
            <h1 className="font-serif font-semibold text-2xl sm:text-3xl text-white mt-1 leading-tight">
              {data.greeting || (user?.ho_ten ? `Chào anh ${user.ho_ten} 👋` : 'Chào anh Tư 👋')}
            </h1>
            <div className="flex items-center gap-3 mt-2.5 text-[12.5px] text-[#8FAE94] font-mono">
              <span className="flex items-center gap-1.5">
                <CloudSun className="w-4 h-4 text-[#D9A441]" />
                {data.weather || '31°C, nắng nhẹ'}
              </span>
              <Badge
                variant="emerald"
                size="sm"
                className="bg-[#345645]/40 text-[#8FAE94] border-[#345645] text-[10.5px] uppercase font-mono tracking-wider hidden sm:inline-flex"
              >
                GlobalGAP #VN-2026
              </Badge>
            </div>
          </div>

          {/* Action Buttons Column */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Notification Bell Button */}
            <button
              type="button"
              onClick={() =>
                onShowToast(
                  unreadCount > 0
                    ? `Anh/chị có ${unreadCount} cảnh báo chưa đọc`
                    : 'Không có cảnh báo mới',
                )
              }
              className="relative w-[38px] h-[38px] rounded-full bg-[#F5F2E8]/10 border border-[#F5F2E8]/20 flex items-center justify-center hover:bg-[#F5F2E8]/20 transition-all cursor-pointer"
              aria-label="Thông báo"
            >
              <Bell className="w-[17px] h-[17px] stroke-[#F5F2E8]" />
              {unreadCount > 0 && (
                <span className="absolute top-[6px] right-[7px] w-2 h-2 rounded-full bg-[#B84C3C] border-[1.5px] border-[#1F3A2E]" />
              )}
            </button>

            {/* Profile Avatar Button */}
            <button
              type="button"
              onClick={() => onNavigate('profile')}
              className="flex items-center gap-2 bg-[#F5F2E8]/10 hover:bg-[#F5F2E8]/20 border border-[#F5F2E8]/20 px-3 py-1.5 rounded-full transition-all cursor-pointer"
              aria-label="Hồ sơ cá nhân"
            >
              <div className="w-6 h-6 rounded-full bg-[#D9A441] text-[#4A3826] font-bold text-xs flex items-center justify-center">
                {user?.ho_ten?.charAt(0).toUpperCase() || 'T'}
              </div>
              <span className="text-xs font-semibold text-white hidden sm:inline">
                {user?.ho_ten || 'Hồ sơ'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
