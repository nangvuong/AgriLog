import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Phone,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { AuthResponse, LoginDto } from '../types/auth';
import { loginApi } from '../services/api';

interface LoginViewProps {
  onLoginSuccess: (res: AuthResponse) => void;
  onSwitchToRegister: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onSwitchToRegister,
}) => {
  const [soDienThoaiHoacEmail, setSoDienThoaiHoacEmail] = useState('0901234567');
  const [matKhau, setMatKhau] = useState('matkhau123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const dto: LoginDto = {
        so_dien_thoai_hoac_email: soDienThoaiHoacEmail.trim(),
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

  const handleQuickFill = (accountType: 'nong_dan' | 'quan_ly' | 'kiem_dinh') => {
    setError(null);
    if (accountType === 'nong_dan') {
      setSoDienThoaiHoacEmail('0901234567');
      setMatKhau('matkhau123');
    } else if (accountType === 'quan_ly') {
      setSoDienThoaiHoacEmail('0909888777');
      setMatKhau('matkhau123');
    } else {
      setSoDienThoaiHoacEmail('0905111222');
      setMatKhau('matkhau123');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="max-w-md w-full mx-auto"
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-green-100/80">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Xác thực Chuỗi xuất khẩu
          </span>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-800 via-green-700 to-blue-700 bg-clip-text text-transparent">
            Đăng nhập AgriLog
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Truy cập hệ thống nhật ký bưởi & kiểm định GlobalGAP
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Đăng nhập không thành công</p>
              <p className="text-xs text-rose-600 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Số điện thoại hoặc Email
            </label>
            <div className="relative">
              <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={soDienThoaiHoacEmail}
                onChange={(e) => setSoDienThoaiHoacEmail(e.target.value)}
                placeholder="Ví dụ: 0901234567 hoặc nongdan@agrilog.vn"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-green-600 focus:ring-4 focus:ring-green-100 outline-none transition-all text-sm font-medium text-slate-800 bg-slate-50/50"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Mật khẩu đăng nhập
              </label>
              <span className="text-xs text-blue-600 hover:underline cursor-pointer font-medium">
                Quên mật khẩu?
              </span>
            </div>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                placeholder="Nhập mật khẩu (mặc định: matkhau123)"
                className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 focus:border-green-600 focus:ring-4 focus:ring-green-100 outline-none transition-all text-sm font-medium text-slate-800 bg-slate-50/50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-green-600 via-green-700 to-blue-600 text-white font-semibold text-sm shadow-lg shadow-green-600/25 hover:shadow-green-600/40 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Đăng nhập ngay</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Quick Demo Fill Accounts */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider text-center mb-3">
            Hoặc chọn tài khoản kiểm thử nhanh
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('nong_dan')}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-green-200/80 bg-green-50/50 hover:bg-green-100/70 text-green-800 text-xs font-semibold transition-all text-left"
            >
              <UserCheck className="w-4 h-4 text-green-600 flex-shrink-0" />
              <div>
                <div>Nông dân Bưởi</div>
                <div className="text-[10px] text-green-600 font-normal">0901234567</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickFill('quan_ly')}
              className="flex items-center gap-2 p-2.5 rounded-xl border border-blue-200/80 bg-blue-50/50 hover:bg-blue-100/70 text-blue-800 text-xs font-semibold transition-all text-left"
            >
              <UserCheck className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div>
                <div>Quản lý HTX</div>
                <div className="text-[10px] text-blue-600 font-normal">0909888777</div>
              </div>
            </button>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Chưa có tài khoản trong chuỗi xuất khẩu?{' '}
            <button
              onClick={onSwitchToRegister}
              className="font-bold text-green-700 hover:text-green-800 hover:underline"
            >
              Đăng ký tài khoản
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
};
