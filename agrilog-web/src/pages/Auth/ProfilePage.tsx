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
import { ROLE_INFO, UserProfile } from '../../types/auth';
import { getProfileApi } from '../../services/api';
import { Alert, Badge, Button, Card } from '../../components/ui';

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

  const roleInfo = ROLE_INFO[user.vai_tro] || ROLE_INFO.nong_dan;

  const handleRefresh = async () => {
    setRefreshing(true);
    setStatusMsg(null);
    try {
      const freshUser = await getProfileApi(token);
      onUserUpdate(freshUser);
      setStatusMsg('Đã làm mới thông tin từ máy chủ NestJS (GET /auth/me)');
    } catch (err: any) {
      setStatusMsg(`Lỗi: ${err.message}`);
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto">
      <Card variant="green">
        {/* Profile Header Card */}
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <div className="relative">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-600 via-green-700 to-blue-700 flex items-center justify-center text-white text-3xl font-extrabold shadow-lg shadow-green-600/25">
              {user.ho_ten ? user.ho_ten.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              <h2 className="text-2xl font-bold text-slate-800">
                {user.ho_ten}
              </h2>
              <Badge variant="green" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
                {roleInfo.label}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">{roleInfo.description}</p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                <span className="text-slate-400">ID tài khoản:</span>
                <span className="text-blue-700 font-bold">#{user.id}</span>
              </span>
              <Badge variant="emerald" pulse>
                Đang hoạt động
              </Badge>
            </div>
          </div>
        </div>

        {/* Status notification */}
        {statusMsg && (
          <Alert variant="info" className="my-4">
            {statusMsg}
          </Alert>
        )}

        {/* Profile Info Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <Phone className="w-3.5 h-3.5 text-green-600" />
              <span>Số điện thoại</span>
            </div>
            <p className="text-sm font-bold text-slate-800">
              {user.so_dien_thoai || 'Chưa đăng ký'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              <span>Email liên hệ</span>
            </div>
            <p className="text-sm font-bold text-slate-800">
              {user.email || 'Chưa đăng ký'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>ID Vùng trồng trực thuộc</span>
            </div>
            <p className="text-sm font-bold text-slate-800">
              {user.vung_trong_id
                ? `Vùng trồng #${user.vung_trong_id}`
                : 'Chưa gán vùng trồng'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/60">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Ngày gia nhập</span>
            </div>
            <p className="text-sm font-bold text-slate-800">
              {new Date(user.ngay_tao).toLocaleDateString('vi-VN')}
            </p>
          </div>
        </div>

        {/* GlobalGAP Export Traceability Integration Card */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 via-white to-green-50 border border-blue-200/80 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-200 flex items-center justify-center text-blue-600">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Quyền truy xuất lô bưởi xuất khẩu
              </h4>
              <p className="text-xs text-slate-500">
                Tài khoản được phân quyền cập nhật nhật ký & in tem truy xuất
              </p>
            </div>
          </div>
          <span className="px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-sm">
            LOT-2026-US-001
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleRefresh}
            isLoading={refreshing}
            variant="secondary"
            size="md"
            className="flex-1"
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Đồng bộ (GET /me)
          </Button>

          <Button
            onClick={onSwitchToChangePassword}
            variant="outline"
            size="md"
            className="flex-1"
            leftIcon={<KeyRound className="w-4 h-4" />}
          >
            Đổi mật khẩu
          </Button>

          <Button
            onClick={onLogout}
            variant="danger"
            size="md"
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Đăng xuất
          </Button>
        </div>
      </Card>
    </div>
  );
};
