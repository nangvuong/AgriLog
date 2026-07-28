import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { motion } from 'motion/react';
import { ChangePasswordDto } from '../types/auth';
import { changePasswordApi } from '../services/api';

interface ChangePasswordViewProps {
  token: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ChangePasswordView: React.FC<ChangePasswordViewProps> = ({
  token,
  onSuccess,
  onCancel,
}) => {
  const [matKhauCu, setMatKhauCu] = useState('');
  const [matKhauMoi, setMatKhauMoi] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (matKhauMoi.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (matKhauCu === matKhauMoi) {
      setError('Mật khẩu mới không được trùng với mật khẩu cũ');
      return;
    }

    setLoading(true);
    try {
      const dto: ChangePasswordDto = {
        mat_khau_cu: matKhauCu,
        mat_khau_moi: matKhauMoi,
      };
      const res = await changePasswordApi(token, dto);
      setSuccessMsg(res.message || 'Đổi mật khẩu thành công!');
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Đổi mật khẩu không thành công');
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
      className="max-w-md w-full mx-auto"
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-blue-100/80">
        {/* Header */}
        <div className="text-center mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
            <KeyRound className="w-3.5 h-3.5" />
            Bảo mật & Phân quyền
          </span>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-700 via-green-700 to-green-800 bg-clip-text text-transparent">
            Đổi Mật Khẩu
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Cập nhật mật khẩu mới cho tài khoản AgriLog
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
              <p className="font-semibold">Không thể đổi mật khẩu</p>
              <p className="text-xs text-rose-600 mt-0.5">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Success notification */}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-sm flex items-start gap-3"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-green-600" />
            <div>
              <p className="font-semibold">Thành công!</p>
              <p className="text-xs text-green-700 mt-0.5">{successMsg}</p>
            </div>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Mật khẩu hiện tại *
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showOld ? 'text' : 'password'}
                required
                value={matKhauCu}
                onChange={(e) => setMatKhauCu(e.target.value)}
                placeholder="Nhập mật khẩu cũ"
                className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium text-slate-800 bg-slate-50/50"
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showOld ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Mật khẩu mới (≥ 6 ký tự) *
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={matKhauMoi}
                onChange={(e) => setMatKhauMoi(e.target.value)}
                placeholder="Mật khẩu mới"
                className="w-full pl-11 pr-11 py-3 rounded-2xl border border-slate-200 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-none transition-all text-sm font-medium text-slate-800 bg-slate-50/50"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span>Khuyến nghị kết hợp chữ hoa, chữ thường & số</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-all"
            >
              Hủy bỏ
            </button>
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !!successMsg}
              className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-blue-600 via-green-600 to-green-700 text-white font-semibold text-xs shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 flex items-center justify-center gap-2 transition-all disabled:opacity-70"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Xác nhận đổi</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
