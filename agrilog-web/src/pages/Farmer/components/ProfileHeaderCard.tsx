import React from 'react';
import {
  Award,
  Calendar,
  CheckCircle2,
  FileText,
  Mail,
  MapPin,
  Phone,
  QrCode,
  RefreshCw,
  ShieldCheck,
  TreeDeciduous,
} from 'lucide-react';
import { ROLE_INFO, VaiTroNguoiDung, type UserProfile } from 'agrilog-shared';
import { Badge, Button } from '../../../components/ui';

interface ProfileHeaderCardProps {
  user: UserProfile;
  refreshing: boolean;
  onRefresh: () => void;
  formatDate: (val: string | Date) => string;
}

/**
 * ProfileHeaderCard - Thẻ hồ sơ nông dân, chứng nhận GlobalGAP & thống kê trang trại bưởi
 */
export const ProfileHeaderCard: React.FC<ProfileHeaderCardProps> = ({
  user,
  refreshing,
  onRefresh,
  formatDate,
}) => {
  const roleInfo =
    ROLE_INFO[user.vai_tro] || ROLE_INFO[VaiTroNguoiDung.NONG_DAN];

  return (
    <div className="space-y-6">
      {/* 1. THẺ THÔNG TIN CHỦ TRANG TRẠI BƯỞI */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-[#E4DCC8] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E4DCC8]/60">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#1F3A2E] text-[#D9A441] font-serif font-bold text-2xl flex items-center justify-center shadow-md">
              {user.ho_ten ? user.ho_ten.charAt(0).toUpperCase() : 'N'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1F3A2E]">
                  {user.ho_ten}
                </h2>
                <Badge variant="emerald" size="sm" className="font-bold">
                  {roleInfo.label}
                </Badge>
              </div>
              <p className="text-xs text-[#5C6B57] mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Thành viên Hợp tác xã Bưởi Da Xanh Bến Tre</span>
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            isLoading={refreshing}
            leftIcon={
              <RefreshCw
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
              />
            }
            className="self-start sm:self-center cursor-pointer font-bold"
          >
            Đồng bộ mới nhất
          </Button>
        </div>

        {/* Lưới thông tin liên hệ & địa bàn canh tác */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6">
          <div className="p-4 rounded-2xl bg-[#FBF8F1] border border-[#E4DCC8]">
            <div className="flex items-center gap-2 text-[#5C6B57] text-xs font-bold uppercase mb-1">
              <Mail className="w-4 h-4 text-[#1F3A2E]" />
              <span>Email tài khoản</span>
            </div>
            <p className="font-mono text-sm font-bold text-[#1F3A2E] truncate">
              {user.email || 'Chưa cập nhật email'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBF8F1] border border-[#E4DCC8]">
            <div className="flex items-center gap-2 text-[#5C6B57] text-xs font-bold uppercase mb-1">
              <Phone className="w-4 h-4 text-[#1F3A2E]" />
              <span>Số điện thoại liên lạc</span>
            </div>
            <p className="font-mono text-sm font-bold text-[#1F3A2E]">
              {user.so_dien_thoai || '0988.xxx.xxx'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBF8F1] border border-[#E4DCC8]">
            <div className="flex items-center gap-2 text-[#5C6B57] text-xs font-bold uppercase mb-1">
              <MapPin className="w-4 h-4 text-[#1F3A2E]" />
              <span>Vùng trồng / Hợp tác xã</span>
            </div>
            <p className="text-sm font-bold text-[#1F3A2E]">
              HTX Bưởi Da Xanh Bến Tre (Vùng #{user.vung_trong_id || 1})
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBF8F1] border border-[#E4DCC8]">
            <div className="flex items-center gap-2 text-[#5C6B57] text-xs font-bold uppercase mb-1">
              <Calendar className="w-4 h-4 text-[#1F3A2E]" />
              <span>Ngày tham gia AgriLog</span>
            </div>
            <p className="font-mono text-sm font-bold text-[#1F3A2E]">
              {user.ngay_tao
                ? formatDate(user.ngay_tao)
                : '12 tháng 03, 2026'}
            </p>
          </div>
        </div>
      </div>

      {/* 2. THẺ CHỨNG NHẬN GLOBALGAP & TEM QR TRUY XUẤT NGUỒN GỐC */}
      <div className="bg-gradient-to-br from-[#1F3A2E] via-[#1D362B] to-[#14261E] text-[#F5F2E8] rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-[#3E5C4B]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D9A441]/20 text-[#D9A441] border border-[#D9A441]/30 text-xs font-bold uppercase tracking-wider mb-2">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Chứng nhận GlobalGAP Xuất Khẩu</span>
            </div>
            <h3 className="font-serif font-bold text-xl sm:text-2xl text-white">
              GLOBALGAP-VN-2026-BDX-0089
            </h3>
            <p className="text-xs text-[#8FAE94] mt-1 max-w-md leading-relaxed">
              Mã số định danh trang trại bưởi dùng cho tem nhãn truy xuất nguồn
              gốc sang thị trường EU, Hoa Kỳ và Nhật Bản. Đồng bộ thời gian thực
              với nhật ký canh tác của nông dân.
            </p>
          </div>

          <div className="w-28 h-28 rounded-2xl bg-white p-2.5 flex flex-col items-center justify-center flex-shrink-0 shadow-lg text-center">
            <QrCode className="w-16 h-16 text-[#1F3A2E]" />
            <span className="text-[9px] font-mono font-bold text-[#1F3A2E] mt-1">
              QUÉT TRUY XUẤT
            </span>
          </div>
        </div>
      </div>

      {/* 3. THẺ THỐNG KÊ QUY MÔ TRANG TRẠI BƯỞI */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-[#E4DCC8] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E4DCC8]/60">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-emerald-600" />
            <h3 className="font-serif font-bold text-base sm:text-lg text-[#1F3A2E]">
              Quy mô & Thống kê canh tác
            </h3>
          </div>
          <Badge
            variant="emerald"
            size="sm"
            className="font-mono uppercase font-bold"
          >
            Đạt chuẩn 100%
          </Badge>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#FBF8F1] border border-[#E4DCC8] text-center">
            <TreeDeciduous className="w-6 h-6 text-emerald-700 mx-auto mb-1.5" />
            <p className="text-2xl font-serif font-bold text-[#1F3A2E]">3</p>
            <p className="text-xs text-[#5C6B57] font-medium">Lô bưởi canh tác</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBF8F1] border border-[#E4DCC8] text-center">
            <Award className="w-6 h-6 text-amber-600 mx-auto mb-1.5" />
            <p className="text-2xl font-serif font-bold text-[#1F3A2E]">420</p>
            <p className="text-xs text-[#5C6B57] font-medium">
              Cây bưởi Da Xanh
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBF8F1] border border-[#E4DCC8] text-center">
            <FileText className="w-6 h-6 text-blue-600 mx-auto mb-1.5" />
            <p className="text-2xl font-serif font-bold text-[#1F3A2E]">128</p>
            <p className="text-xs text-[#5C6B57] font-medium">
              Nhật ký mùa vụ
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FBF8F1] border border-[#E4DCC8] text-center">
            <ShieldCheck className="w-6 h-6 text-teal-600 mx-auto mb-1.5" />
            <p className="text-2xl font-serif font-bold text-[#1F3A2E]">
              An toàn
            </p>
            <p className="text-xs text-[#5C6B57] font-medium">
              Cách ly thuốc BVTV
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
