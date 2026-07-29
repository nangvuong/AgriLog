import React, { useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ROLE_INFO, VaiTroNguoiDung } from 'agrilog-shared';
import type { AuthResponse, RegisterDto } from 'agrilog-shared';
import { registerApi } from '../../services/api';
import { Alert, Input } from '../../components/ui';

interface RegisterPageProps {
  onRegisterSuccess: (res: AuthResponse) => void;
  onSwitchToLogin: () => void;
}

/**
 * Trang Đăng ký chuẩn Editorial "Nhật Ký Vườn Bưởi" theo mẫu dang-nhap.html
 * Hiển thị trực tiếp không viền Card kép, tối ưu responsive & Framer Motion
 */
export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onSwitchToLogin,
}) => {
  const [hoTen, setHoTen] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [xacNhantMatKhau, setXacNhanMatKhau] = useState('');
  const [vaiTro, setVaiTro] = useState<VaiTroNguoiDung>(
    VaiTroNguoiDung.NONG_DAN,
  );
  const [vungTrongId, setVungTrongId] = useState<string>('1');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (matKhau !== xacNhantMatKhau) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (matKhau.length < 6) {
      setError('Mật khẩu cần ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      const dto: RegisterDto = {
        ho_ten: hoTen.trim(),
        so_dien_thoai: soDienThoai.trim(),
        email: email.trim() || undefined,
        mat_khau: matKhau,
        vai_tro: vaiTro,
        vung_trong_id: vungTrongId ? Number(vungTrongId) : undefined,
      };
      const res = await registerApi(dto);
      onRegisterSuccess(res);
    } catch (err: any) {
      setError(err.message || 'Đăng ký tài khoản thất bại');
    } finally {
      setLoading(false);
    }
  };

  const roles = [
    VaiTroNguoiDung.NONG_DAN,
    VaiTroNguoiDung.QUAN_LY,
    VaiTroNguoiDung.KY_THUAT,
    VaiTroNguoiDung.XUAT_KHAU,
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-[420px] mx-auto text-[#23301F]"
    >
      {/* Editorial Title */}
      <div className="mb-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#23301F] font-serif">
          Đăng ký tài khoản
        </h2>
        <p className="text-xs sm:text-sm text-[#5C6B57] mt-2 leading-relaxed">
          Tạo tài khoản tham gia chuỗi cung ứng bưởi xuất khẩu chuẩn GlobalGAP.
        </p>
      </div>

      {error && (
        <Alert variant="error" title="Đăng ký không thành công" className="mb-6">
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Họ và tên thành viên"
          requiredAsterisk
          required
          value={hoTen}
          onChange={(e) => setHoTen(e.target.value)}
          placeholder="Ví dụ: Nguyễn Văn Nông"
          leftIcon={<User className="w-5 h-5 text-[#345645]" />}
          className="bg-white border-[#E4DCC8] text-[#23301F] placeholder:text-[#B7AF9C] py-3.5"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Số điện thoại (+84)"
            requiredAsterisk
            required
            type="tel"
            value={soDienThoai}
            onChange={(e) => setSoDienThoai(e.target.value)}
            placeholder="0901234567"
            leftIcon={<Phone className="w-5 h-5 text-[#345645]" />}
            className="bg-white border-[#E4DCC8] text-[#23301F] placeholder:text-[#B7AF9C] font-mono py-3.5"
          />
          <Input
            label="Email (tùy chọn)"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ten@agrilog.vn"
            leftIcon={<Mail className="w-5 h-5 text-[#345645]" />}
            className="bg-white border-[#E4DCC8] text-[#23301F] placeholder:text-[#B7AF9C] py-3.5"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Mật khẩu (≥ 6 ký tự)"
            requiredAsterisk
            type={showPassword ? 'text' : 'password'}
            required
            value={matKhau}
            onChange={(e) => setMatKhau(e.target.value)}
            placeholder="Mật khẩu bảo mật"
            leftIcon={<Lock className="w-5 h-5 text-[#345645]" />}
            className="bg-white border-[#E4DCC8] text-[#23301F] placeholder:text-[#B7AF9C] py-3.5"
            rightElement={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[#5C6B57] hover:text-[#23301F] p-2 rounded-lg active:scale-90 transition-transform"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
          />

          <Input
            label="Xác nhận mật khẩu"
            requiredAsterisk
            type={showConfirm ? 'text' : 'password'}
            required
            value={xacNhantMatKhau}
            onChange={(e) => setXacNhanMatKhau(e.target.value)}
            placeholder="Nhập lại mật khẩu"
            leftIcon={<Lock className="w-5 h-5 text-[#345645]" />}
            className="bg-white border-[#E4DCC8] text-[#23301F] placeholder:text-[#B7AF9C] py-3.5"
            rightElement={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="text-[#5C6B57] hover:text-[#23301F] p-2 rounded-lg active:scale-90 transition-transform"
                title={showConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
          />
        </div>

        <Input
          label="ID Vùng trồng GPS / Lô canh tác"
          value={vungTrongId}
          onChange={(e) => setVungTrongId(e.target.value)}
          placeholder="Ví dụ: 1 (Bến Tre)"
          leftIcon={<MapPin className="w-5 h-5 text-blue-600" />}
          className="bg-white border-[#E4DCC8] text-[#23301F] placeholder:text-[#B7AF9C] font-mono py-3.5"
          helperText="ID Vùng trồng giúp định danh tự động trong nhật ký GlobalGAP."
        />

        {/* Vai trò trong chuỗi bưởi - 2-column grid */}
        <div>
          <label className="block text-xs font-bold text-[#23301F] uppercase tracking-wider mb-2">
            Vai trò trong chuỗi cung ứng <span className="text-rose-500">*</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {roles.map((role) => {
              const info = ROLE_INFO[role];
              const isSelected = vaiTro === role;
              return (
                <div
                  key={role}
                  onClick={() => setVaiTro(role)}
                  className={`cursor-pointer p-2.5 sm:p-3 rounded-xl sm:rounded-2xl border transition-all flex items-start gap-2 active:scale-[0.98] ${
                    isSelected
                      ? 'bg-[#1F3A2E]/10 border-[#1F3A2E] ring-2 ring-[#1F3A2E]/20 shadow-sm'
                      : 'border-[#E4DCC8] bg-white hover:bg-[#F4F0E4]/50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? 'bg-[#1F3A2E] text-[#D9A441]'
                        : 'border border-[#B7AF9C] text-transparent'
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={`text-xs font-bold truncate ${
                        isSelected ? 'text-[#1F3A2E]' : 'text-[#23301F]'
                      }`}
                    >
                      {info.label}
                    </p>
                    <p className="text-[10px] sm:text-[11px] text-[#5C6B57] line-clamp-1 sm:line-clamp-2 mt-0.5">
                      {info.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D9A441] via-[#c49232] to-[#B9862F] text-[#23301F] font-bold text-sm sm:text-base shadow-lg shadow-[#D9A441]/25 hover:shadow-[#D9A441]/40 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer mt-3"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-[#23301F] border-t-transparent rounded-full animate-spin" />
              <span>Đang tạo tài khoản...</span>
            </span>
          ) : (
            <>
              <span>Đăng ký tham gia</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* Footer Link */}
      <div className="mt-8 pt-6 border-t border-[#E4DCC8]/80 text-center">
        <p className="text-xs sm:text-sm text-[#5C6B57]">
          Đã có tài khoản trong chuỗi xuất khẩu?{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="font-bold text-[#1F3A2E] hover:text-[#345645] hover:underline transition-colors"
          >
            Đăng nhập ngay →
          </button>
        </p>
        <div className="flex items-center justify-center gap-2 mt-3 text-[11px] font-medium text-[#8FAE94]">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Được kiểm định & bảo mật chuẩn GlobalGAP</span>
        </div>
      </div>
    </motion.div>
  );
};
