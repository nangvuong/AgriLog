import React, { useState } from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { type UserProfile } from 'agrilog-shared';
import { getProfileApi } from '../../services/api';
import { Badge, Button } from '../../components/ui';
import {
  FarmerBottomNav,
  ProfileHeaderCard,
  ProfileSecurityCard,
} from './components';

export interface FarmerProfilePageProps {
  user: UserProfile;
  token: string;
  onUserUpdate: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  onSwitchToChangePassword: () => void;
  onNavigate: (
    tab:
      | 'farmer-home'
      | 'login'
      | 'register'
      | 'profile'
      | 'change-password',
  ) => void;
  onShowToast: (msg: string) => void;
}

/**
 * FarmerProfilePage - Trang Quản lý Hồ sơ Nông dân
 * Chuyển từ giao diện Auth cũ sang kiến trúc toàn màn hình Farmer Page (Editorial Green & Gold)
 */
export const FarmerProfilePage: React.FC<FarmerProfilePageProps> = ({
  user,
  token,
  onUserUpdate,
  onLogout,
  onSwitchToChangePassword,
  onNavigate,
  onShowToast,
}) => {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const refreshedUser = await getProfileApi(token);
      onUserUpdate(refreshedUser);
      onShowToast('Đã đồng bộ dữ liệu hồ sơ mới nhất từ AgriLog Server!');
    } catch (err: any) {
      onShowToast('Lỗi khi tải lại hồ sơ: ' + (err.message || ''));
    } finally {
      setRefreshing(false);
    }
  };

  const formatDate = (dateVal: string | Date) => {
    try {
      const d = new Date(dateVal);
      return d.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return String(dateVal);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F1] text-[#23301F] font-sans pb-24 lg:pb-12">
      {/* 1. TOP HEADER (Editorial Dark Forest Green & Gold) */}
      <header className="bg-gradient-to-br from-[#1F3A2E] via-[#1D362B] to-[#14261E] text-[#F5F2E8] relative overflow-hidden shadow-lg border-b border-[#3E5C4B]">
        {/* Subtle decorative dot pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle, #D9A441 1.8px, transparent 2px)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-8 relative z-10">
          <div className="flex items-center justify-between gap-4 mb-6">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onNavigate('farmer-home')}
              leftIcon={<ArrowLeft className="w-4 h-4 text-white" />}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 font-bold cursor-pointer shadow-none"
            >
              Về Trang chủ Nông dân
            </Button>

            <Badge
              variant="emerald"
              size="sm"
              pulse
              className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 uppercase tracking-wider font-bold"
            >
              GlobalGAP #VN-2026
            </Badge>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-mono uppercase tracking-widest text-[#8FAE94] mb-1">
                Hồ sơ Người trồng bưởi & Hợp tác xã
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white tracking-tight flex items-center gap-3">
                <span>Hồ sơ của tôi</span>
                <span className="w-10 h-10 rounded-2xl bg-[#D9A441] text-[#1F3A2E] font-serif font-black text-xl flex items-center justify-center">
                  <User className="w-6 h-6" />
                </span>
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN RESPONSIVE PROFILE GRID (12 Columns on lg Desktop) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Personal Info & GlobalGAP ID */}
          <div className="lg:col-span-8 space-y-6">
            <ProfileHeaderCard
              user={user}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              formatDate={formatDate}
            />
          </div>

          {/* Right Column (4 cols): Security & Logout */}
          <div className="lg:col-span-4 space-y-6">
            <ProfileSecurityCard
              user={user}
              onSwitchToChangePassword={onSwitchToChangePassword}
              onLogout={onLogout}
            />
          </div>
        </div>
      </main>

      {/* 3. MOBILE BOTTOM NAVIGATION BAR (< lg only) */}
      <FarmerBottomNav
        activeTab="profile"
        unreadAlertsCount={0}
        onOpenQuickLog={() =>
          onShowToast('Mở ghi nhật ký nhanh tại Trang chủ Nông dân')
        }
        onNavigate={(tab) => {
          if (tab === 'profile') {
            onShowToast('Anh/chị đang ở màn hình Hồ sơ');
          } else {
            onNavigate(tab);
          }
        }}
        onShowToast={onShowToast}
      />
    </div>
  );
};
