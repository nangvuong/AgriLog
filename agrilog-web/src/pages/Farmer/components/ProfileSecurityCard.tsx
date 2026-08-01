import React from 'react';
import {
  Headphones,
  KeyRound,
  LogOut,
  PhoneCall,
  ShieldCheck,
} from 'lucide-react';
import { ROLE_INFO, VaiTroNguoiDung, type UserProfile } from 'agrilog-shared';
import { Button } from '../../../components/ui';

interface ProfileSecurityCardProps {
  user: UserProfile;
  onSwitchToChangePassword: () => void;
  onLogout: () => void;
}

/**
 * ProfileSecurityCard - Thẻ Quản lý Bảo mật, Hỗ trợ kỹ thuật & Đăng xuất cho Nông dân
 */
export const ProfileSecurityCard: React.FC<ProfileSecurityCardProps> = ({
  user,
  onSwitchToChangePassword,
  onLogout,
}) => {
  const roleInfo =
    ROLE_INFO[user.vai_tro] || ROLE_INFO[VaiTroNguoiDung.NONG_DAN];

  return (
    <div className="space-y-6">
      {/* 1. THẺ BẢO MẬT & ĐỔI MẬT KHẨU */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-[#E4DCC8] shadow-sm space-y-5">
        <div className="flex items-center gap-3 pb-4 border-b border-[#E4DCC8]/60">
          <div className="w-10 h-10 rounded-2xl bg-[#1F3A2E] text-[#D9A441] flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1F3A2E]">
              Bảo mật & Quyền hạn
            </h3>
            <p className="text-xs text-[#5C6B57]">
              Quản lý mật khẩu và quyền hạn tài khoản
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-[#FBF8F1] border border-[#E4DCC8] flex items-center justify-between gap-4">
            <div>
              <p className="font-bold text-sm text-[#1F3A2E]">
                Mật khẩu đăng nhập
              </p>
              <p className="text-xs text-[#5C6B57] mt-0.5">
                Cập nhật định kỳ để bảo vệ dữ liệu trang trại
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSwitchToChangePassword}
              leftIcon={<KeyRound className="w-4 h-4 text-[#1F3A2E]" />}
              className="flex-shrink-0 font-bold cursor-pointer"
            >
              Đổi mật khẩu
            </Button>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBF8F1] border border-[#E4DCC8]">
            <p className="font-bold text-sm text-[#1F3A2E] mb-1">
              Phân quyền tài khoản
            </p>
            <p className="text-xs text-[#5C6B57] leading-relaxed">
              Anh/chị đang có quyền{' '}
              <strong className="text-[#1F3A2E]">{roleInfo.label}</strong>. Có
              thể tạo nhật ký vụ mùa, ghi nhận hình ảnh minh chứng và theo dõi
              cách ly thuốc bảo vệ thực vật.
            </p>
          </div>
        </div>
      </div>

      {/* 2. THẺ HỖ TRỢ KỸ THUẬT & KHUYẾN NÔNG VÙNG TRỒNG */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-[#E4DCC8] shadow-sm space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b border-[#E4DCC8]/60">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-base text-[#1F3A2E]">
              Cán bộ Kỹ thuật Khuyến nông
            </h3>
            <p className="text-xs text-[#5C6B57]">
              Hỗ trợ chuẩn GlobalGAP & bảo vệ thực vật
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-[#FBF8F1] border border-[#E4DCC8] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C6B57] font-medium">
              Kỹ sư phụ trách:
            </span>
            <span className="text-xs font-bold text-[#1F3A2E]">
              KS. Nguyễn Văn Nông
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#5C6B57] font-medium">
              Đường dây nóng:
            </span>
            <span className="text-xs font-mono font-bold text-emerald-700 flex items-center gap-1">
              <PhoneCall className="w-3.5 h-3.5" />
              0988.234.567
            </span>
          </div>
        </div>
      </div>

      {/* 3. THẺ ĐĂNG XUẤT */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-[#E4DCC8] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-base text-rose-900">
            Đăng xuất khỏi thiết bị
          </h4>
          <p className="text-xs text-[#5C6B57] mt-0.5">
            Kết thúc phiên làm việc an toàn, bảo mật token
          </p>
        </div>

        <Button
          type="button"
          variant="danger"
          size="md"
          onClick={onLogout}
          leftIcon={<LogOut className="w-4 h-4" />}
          className="w-full sm:w-auto cursor-pointer font-bold"
        >
          Đăng xuất ngay
        </Button>
      </div>
    </div>
  );
};
