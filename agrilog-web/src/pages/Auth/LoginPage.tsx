import React, { useState } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  Sprout,
  UserCheck,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import type { AuthResponse, LoginDto } from 'agrilog-shared';
import { loginApi } from '../../services/api';
import { Alert, Input } from '../../components/ui';

interface LoginPageProps {
  onLoginSuccess: (res: AuthResponse) => void;
  onSwitchToRegister: () => void;
}

/**
 * Trang Đăng nhập chuẩn Editorial "Nhật Ký Vườn Bưởi" theo đúng bố cục .form-card trong mẫu dang-nhap.html
 * Hiển thị trực tiếp trên cột nền giấy ấm của trang, không bị bọc card viền kép dư thừa
 */
export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onSwitchToRegister,
}) => {
  const [loginMode, setLoginMode] = useState<'phone' | 'email'>('phone');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const taiKhoan =
        loginMode === 'phone' ? soDienThoai.trim() : email.trim();

      if (!taiKhoan) {
        throw new Error(
          loginMode === 'phone'
            ? 'Vui lòng nhập số điện thoại đăng nhập'
            : 'Vui lòng nhập email đăng nhập',
        );
      }

      const dto: LoginDto = {
        so_dien_thoai_hoac_email: taiKhoan,
        mat_khau: matKhau,
      };
      const res = await loginApi(dto);
      onLoginSuccess(res);
    } catch (err: any) {
      setError(err.message || 'Đăng nhập không thành công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.35 }}
      className="w-full max-w-[400px] mx-auto text-[#23301F]"
    >
      {/* Editorial Heading by Login Mode */}
      <div className="mb-6">
        <AnimatePresence mode="wait">
          {loginMode === 'phone' ? (
            <motion.div
              key="header-phone"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#23301F] font-serif">
                Đăng nhập
              </h2>
              <p className="text-xs sm:text-sm text-[#5C6B57] mt-2 leading-relaxed">
                Nhập số điện thoại đã đăng ký với hợp tác xã để nhận mã xác thực và truy cập nhật ký vườn bưởi.
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="header-email"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
            >
              <button
                type="button"
                onClick={() => {
                  setLoginMode('phone');
                  setError(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#345645] hover:text-[#1F3A2E] mb-2.5 hover:underline transition-colors"
              >
                ← Dùng số điện thoại
              </button>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#23301F] font-serif">
                Đăng nhập quản trị
              </h2>
              <p className="text-xs sm:text-sm text-[#5C6B57] mt-2 leading-relaxed">
                Dành cho quản lý hợp tác xã, kỹ thuật viên, kiểm định và đơn vị xuất khẩu.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <Alert variant="error" title="Đăng nhập không thành công" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Form Body */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <AnimatePresence mode="wait">
          {loginMode === 'phone' ? (
            <motion.div
              key="form-phone"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              {/* Custom Editorial +84 Phone Field (matching dang-nhap.html step-phone) */}
              <div>
                <label className="block text-xs font-bold text-[#23301F] uppercase tracking-wider mb-2">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <div className="flex items-center rounded-2xl border border-[#E4DCC8] bg-white overflow-hidden focus-within:border-[#345645] focus-within:ring-4 focus-within:ring-[#345645]/15 transition-all shadow-sm">
                  <span className="font-mono text-sm font-bold bg-[#F4F0E4] text-[#5C6B57] px-3.5 py-3.5 border-r border-[#E4DCC8] flex items-center select-none">
                    +84
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    value={soDienThoai}
                    onChange={(e) => setSoDienThoai(e.target.value)}
                    placeholder="912 345 678"
                    required={loginMode === 'phone'}
                    className="w-full py-3.5 px-4 text-sm sm:text-base font-medium text-[#23301F] bg-transparent outline-none placeholder:text-[#B7AF9C] font-mono"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form-email"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <Input
                label="Email quản trị"
                requiredAsterisk
                type="email"
                required={loginMode === 'email'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@hoptacxa.vn"
                leftIcon={<Mail className="w-5 h-5 text-[#345645]" />}
                className="bg-white border-[#E4DCC8] text-[#23301F] placeholder:text-[#B7AF9C] py-3.5"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-[#23301F] uppercase tracking-wider">
              Mật khẩu <span className="text-rose-500">*</span>
            </label>
            <span className="text-xs text-[#345645] hover:underline cursor-pointer font-bold">
              Quên mật khẩu?
            </span>
          </div>
          <Input
            type={showPassword ? 'text' : 'password'}
            required
            value={matKhau}
            onChange={(e) => setMatKhau(e.target.value)}
            placeholder="••••••••"
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
        </div>

        {/* Editorial Primary Gold Button (from dang-nhap.html btn-primary) */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#D9A441] via-[#c49232] to-[#B9862F] text-[#23301F] font-bold text-sm sm:text-base shadow-lg shadow-[#D9A441]/25 hover:shadow-[#D9A441]/40 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-[#23301F] border-t-transparent rounded-full animate-spin" />
              <span>Đang xác thực...</span>
            </span>
          ) : (
            <>
              <span>Đăng nhập hệ thống</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </motion.button>
      </form>

      {/* Divider / Switch Mode Option from dang-nhap.html */}
      {loginMode === 'phone' && (
        <div className="my-6">
          <div className="flex items-center gap-3 my-5 text-[#B7AF9C] text-xs">
            <div className="h-[1px] flex-1 bg-[#E4DCC8]" />
            <span className="uppercase font-mono tracking-wider font-semibold">
              hoặc
            </span>
            <div className="h-[1px] flex-1 bg-[#E4DCC8]" />
          </div>

          <button
            type="button"
            onClick={() => {
              setLoginMode('email');
              setError(null);
            }}
            className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-[#345645] bg-[#F4F0E4]/70 hover:bg-[#F4F0E4] border border-[#E4DCC8] transition-all flex items-center justify-center gap-2"
          >
            <UserCheck className="w-4 h-4 text-[#1F3A2E]" />
            <span>Đăng nhập bằng email và mật khẩu</span>
          </button>
        </div>
      )}

      {/* Footer Link (matching dang-nhap.html form-footer style) */}
      <div className="mt-8 pt-6 border-t border-[#E4DCC8]/80 text-center">
        <p className="text-xs sm:text-sm text-[#5C6B57] leading-relaxed">
          Chưa có tài khoản trong chuỗi xuất khẩu?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-bold text-[#1F3A2E] hover:text-[#345645] hover:underline transition-colors"
          >
            Đăng ký ngay →
          </button>
        </p>
        <div className="flex items-center justify-center gap-2 mt-3 text-[11px] font-medium text-[#8FAE94]">
          <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Xác thực chuẩn GlobalGAP & Chuỗi cung ứng bưởi</span>
        </div>
      </div>
    </motion.div>
  );
};
