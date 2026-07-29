import React, { useState } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  Sprout,
} from 'lucide-react';
import { motion } from 'motion/react';
import type { ChangePasswordDto } from 'agrilog-shared';
import { changePasswordApi } from '../../services/api';
import { Alert, Input } from '../../components/ui';

interface ChangePasswordPageProps {
  token: string;
  onSuccess: () => void;
  onCancel: () => void;
}

/**
 * Trang Đổi mật khẩu chuẩn Editorial "Nhật Ký Vườn Bưởi" theo bố cục .form-card trong mẫu dang-nhap.html
 */
export const ChangePasswordPage: React.FC<ChangePasswordPageProps> = ({
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
    if (matKhauMoi === matKhauCu) {
      setError('Mật khẩu mới không được trùng mật khẩu hiện tại');
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
      }, 1200);
    } catch (err: any) {
      setError(err.message || 'Không thể đổi mật khẩu');
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
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E4DCC8]/70">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-full bg-[#1F3A2E] text-[#D9A441] flex items-center justify-center shadow-sm">
            <Sprout className="w-4 h-4" />
          </span>
          <span className="text-xs uppercase tracking-widest font-bold text-[#345645]">
            AgriLog Security
          </span>
        </div>
        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-[#1F3A2E]/10 text-[#1F3A2E]">
          GLOBALGAP
        </span>
      </div>

      <div className="mb-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[#23301F] font-serif">
          Đổi mật khẩu
        </h2>
        <p className="text-xs sm:text-sm text-[#5C6B57] mt-2 leading-relaxed">
          Nâng cấp bảo mật tài khoản cho chuỗi cung ứng bưởi xuất khẩu.
        </p>
      </div>

      {error && (
        <Alert variant="error" title="Không thể đổi mật khẩu" className="mb-6">
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert variant="success" title="Thành công!" className="mb-6">
          {successMsg}
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Mật khẩu hiện tại"
          requiredAsterisk
          type={showOld ? 'text' : 'password'}
          required
          value={matKhauCu}
          onChange={(e) => setMatKhauCu(e.target.value)}
          placeholder="Nhập mật khẩu cũ"
          leftIcon={<Lock className="w-5 h-5 text-[#345645]" />}
          className="bg-white border-[#E4DCC8] text-[#23301F] placeholder:text-[#B7AF9C] py-3.5"
          rightElement={
            <button
              type="button"
              onClick={() => setShowOld(!showOld)}
              className="text-[#5C6B57] hover:text-[#23301F] p-2 rounded-lg active:scale-90 transition-transform"
              title={showOld ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
            >
              {showOld ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          }
        />

        <div>
          <Input
            label="Mật khẩu mới (≥ 6 ký tự)"
            requiredAsterisk
            type={showNew ? 'text' : 'password'}
            required
            value={matKhauMoi}
            onChange={(e) => setMatKhauMoi(e.target.value)}
            placeholder="Mật khẩu mới"
            leftIcon={<Lock className="w-5 h-5 text-[#345645]" />}
            className="bg-white border-[#E4DCC8] text-[#23301F] placeholder:text-[#B7AF9C] py-3.5"
            rightElement={
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="text-[#5C6B57] hover:text-[#23301F] p-2 rounded-lg active:scale-90 transition-transform"
                title={showNew ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showNew ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            }
          />
          <div className="flex items-center gap-2 mt-2 text-xs text-[#5C6B57]">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            <span>Khuyến nghị kết hợp chữ hoa, chữ thường & số</span>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 rounded-2xl border border-[#E4DCC8] bg-white text-[#23301F] font-bold text-sm hover:bg-[#F4F0E4] transition-colors"
          >
            Hủy bỏ
          </button>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="flex-1 py-4 px-4 rounded-2xl bg-gradient-to-r from-[#D9A441] via-[#c49232] to-[#B9862F] text-[#23301F] font-bold text-sm shadow-lg shadow-[#D9A441]/25 hover:shadow-[#D9A441]/40 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? 'Đang đổi...' : 'Cập nhật mật khẩu'}
          </motion.button>
        </div>
      </form>
    </motion.div>
  );
};
