import React, { useState } from 'react';
import {
  AlertCircle,
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
  UserCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  AuthResponse,
  RegisterDto,
  ROLE_INFO,
  VaiTroNguoiDung,
} from '../types/auth';
import { registerApi } from '../services/api';

interface RegisterViewProps {
  onRegisterSuccess: (res: AuthResponse) => void;
  onSwitchToLogin: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({
  onRegisterSuccess,
  onSwitchToLogin,
}) => {
  const [hoTen, setHoTen] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [vaiTro, setVaiTro] = useState<VaiTroNguoiDung>('nong_dan');
  const [vungTrongId, setVungTrongId] = useState<number>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles: VaiTroNguoiDung[] = [
    'nong_dan',
    'quan_ly',
    'ky_thuat',
    'xuat_khau',
    'kiem_dinh',
    'admin',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (matKhau.length < 6) {
      setError('Mật khẩu phải từ 6 ký tự trở lên');
      return;
    }

    setLoading(true);
    try {
      const dto: RegisterDto = {
        ho_ten: hoTen.trim(),
        so_dien_thoai: soDienThoai.trim() || undefined,
        email: email.trim() || undefined,
        mat_khau: matKhau,
        vai_tro: vaiTro,
        vung_trong_id: Number(vungTrongId) || undefined,
      };

      const res = await registerApi(dto);
      onRegisterSuccess(res);
    } catch (err: any) {
      setError(err.message || 'Đăng ký không thành công');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className="max-w-xl w-full mx-auto"
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-blue-100/80">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            Gia nhập Chuỗi Cung Ứng Bưởi
          </span>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-green-700 to-green-800 bg-clip-text text-transparent">
            Đăng ký tài khoản AgriLog
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Chọn vai trò phù hợp và tạo tài khoản tham gia hệ thống
          </p>
        </div>

        {/* Error alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Đăng ký không thành công</p>
              <p className="text-xs text-rose-600 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Họ tên */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Họ và tên *
            </label>
            <div className="relative">
              <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={hoTen}
                onChange={(e) => setHoTen(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn Nông"
                className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium text-slate-800 bg-slate-50/50"
              />
            </div>
          </div>

          {/* SĐT & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Số điện thoại *
              </label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={soDienThoai}
                  onChange={(e) => setSoDienThoai(e.target.value)}
                  placeholder="0901234567"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium text-slate-800 bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Email (Tùy chọn)
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nongdan@agrilog.vn"
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium text-slate-800 bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Mật khẩu & ID vùng trồng */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Mật khẩu (≥ 6 ký tự) *
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={matKhau}
                  onChange={(e) => setMatKhau(e.target.value)}
                  placeholder="Mật khẩu bảo mật"
                  className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium text-slate-800 bg-slate-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                ID Vùng Trồng (Tùy chọn)
              </label>
              <div className="relative">
                <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="number"
                  min="1"
                  value={vungTrongId}
                  onChange={(e) => setVungTrongId(Number(e.target.value))}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium text-slate-800 bg-slate-50/50"
                />
              </div>
            </div>
          </div>

          {/* Vai trò trong chuỗi bưởi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Vai trò trong chuỗi cung ứng *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {roles.map((role) => {
                const info = ROLE_INFO[role];
                const isSelected = vaiTro === role;
                return (
                  <div
                    key={role}
                    onClick={() => setVaiTro(role)}
                    className={`cursor-pointer p-3 rounded-2xl border transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-sm'
                        : 'border-slate-200/80 hover:bg-slate-50/80'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p
                        className={`text-xs font-bold ${
                          isSelected ? 'text-blue-900' : 'text-slate-800'
                        }`}
                      >
                        {info.label}
                      </p>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
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
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-green-600 to-green-700 text-white font-semibold text-sm shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 flex items-center justify-center gap-2 transition-all disabled:opacity-70 mt-6"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Đăng ký tham gia hệ thống</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center border-t border-slate-100 pt-5">
          <p className="text-sm text-slate-600">
            Đã có tài khoản AgriLog?{' '}
            <button
              onClick={onSwitchToLogin}
              className="font-bold text-blue-700 hover:text-blue-800 hover:underline"
            >
              Đăng nhập ngay
            </button>
          </p>
        </div>
      </div>
    </motion.div>
  );
};
