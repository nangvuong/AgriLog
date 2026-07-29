import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  Phone,
  QrCode,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ROLE_INFO, VaiTroNguoiDung } from 'agrilog-shared';
import type { UserProfile } from 'agrilog-shared';
import { getProfileApi } from '../../services/api';
import { Alert, Badge } from '../../components/ui';

interface ProfilePageProps {
  user: UserProfile;
  token: string;
  onUserUpdate: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  onSwitchToChangePassword: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  token,
  onUserUpdate,
  onLogout,
  onSwitchToChangePassword,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const roleInfo =
    ROLE_INFO[user.vai_tro] || ROLE_INFO[VaiTroNguoiDung.NONG_DAN];

  const handleRefresh = async () => {
    setRefreshing(true);
    setStatusMsg(null);
    try {
      const refreshedUser = await getProfileApi(token);
      onUserUpdate(refreshedUser);
      setStatusMsg('Đã đồng bộ dữ liệu mới nhất từ hệ thống AgriLog Server');
    } catch (err: any) {
      setStatusMsg('Lỗi khi tải lại hồ sơ: ' + (err.message || ''));
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
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-[440px] mx-auto text-[#23301F]"
    >
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E4DCC8]/70">
        <span className="text-xs uppercase tracking-widest font-bold text-[#345645]">
          AgriLog User Profile
        </span>
        <Badge variant="green" size="sm">
          Đang hoạt động
        </Badge>
      </div>

      {/* Header Info */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-[#23301F] font-serif">
            {user.ho_ten}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleInfo.bg} ${roleInfo.color} ${roleInfo.border}`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{roleInfo.label}</span>
            </span>
          </div>
        </div>

        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2.5 rounded-xl border border-[#E4DCC8] bg-white hover:bg-[#F4F0E4] transition-colors text-[#5C6B57]"
          title="Tải lại dữ liệu"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {statusMsg && (
        <Alert variant="info" title="Đồng bộ hồ sơ" className="mb-6">
          {statusMsg}
        </Alert>
      )}

      {/* Profile Details Card Section */}
      <div className="space-y-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E4DCC8] shadow-sm space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#F4F0E4] flex items-center justify-center text-[#1F3A2E] font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#5C6B57] font-semibold uppercase">
                Số điện thoại liên lạc
              </p>
              <p className="text-sm sm:text-base font-bold font-mono text-[#23301F] mt-0.5">
                {user.so_dien_thoai || 'Chưa cập nhật'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-3 border-t border-[#E4DCC8]/60">
            <div className="w-10 h-10 rounded-xl bg-[#F4F0E4] flex items-center justify-center text-[#1F3A2E] font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#5C6B57] font-semibold uppercase">
                Email hệ thống
              </p>
              <p className="text-sm font-semibold text-[#23301F] mt-0.5">
                {user.email || 'Không có email'}
              </p>
            </div>
          </div>

          {user.vung_trong_id && (
            <div className="flex items-center gap-3 pt-3 border-t border-[#E4DCC8]/60">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-[#5C6B57] font-semibold uppercase">
                  ID Vùng trồng / Hợp tác xã
                </p>
                <p className="text-sm font-bold font-mono text-blue-700 mt-0.5">
                  ID: #{user.vung_trong_id}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 pt-3 border-t border-[#E4DCC8]/60">
            <div className="w-10 h-10 rounded-xl bg-[#F4F0E4] flex items-center justify-center text-[#5C6B57]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-[#5C6B57] font-semibold uppercase">
                Ngày tham gia chuỗi
              </p>
              <p className="text-xs sm:text-sm font-semibold text-[#23301F] mt-0.5">
                {formatDate(user.ngay_tao)}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onSwitchToChangePassword}
            className="w-full py-3 px-4 rounded-xl border border-[#E4DCC8] bg-white text-[#23301F] font-bold text-xs sm:text-sm hover:bg-[#F4F0E4] flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-[#1F3A2E]" />
            <span>Đổi mật khẩu</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3 px-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs sm:text-sm hover:bg-rose-100 flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất</span>
          </button>
        </div>

        <div className="pt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-200/80 text-xs font-semibold text-blue-700">
            <QrCode className="w-4 h-4" />
            <span>Tài khoản sẵn sàng xuất mã QR lô hàng GlobalGAP</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
