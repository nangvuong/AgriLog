import React, { useState } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import type { ChangePasswordDto } from 'agrilog-shared';
import { changePasswordApi } from '../../services/api';
import {
  Alert,
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from '../../components/ui';

interface ChangePasswordPageProps {
  token: string;
  onSuccess: () => void;
  onCancel: () => void;
}

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
    <div className="max-w-md w-full mx-auto">
      <Card variant="blue">
        <CardHeader>
          <div className="flex justify-center mb-3">
            <Badge variant="blue" icon={<KeyRound className="w-3.5 h-3.5" />}>
              Bảo mật & Phân quyền
            </Badge>
          </div>
          <CardTitle>Đổi Mật Khẩu</CardTitle>
          <CardDescription>
            Cập nhật mật khẩu mới cho tài khoản AgriLog
          </CardDescription>
        </CardHeader>

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
            leftIcon={<Lock className="w-5 h-5" />}
            rightElement={
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                {showOld ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
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
              leftIcon={<Lock className="w-5 h-5" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  {showNew ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-green-600" />
              <span>Khuyến nghị kết hợp chữ hoa, chữ thường & số</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              onClick={onCancel}
              variant="outline"
              size="md"
              className="flex-1"
            >
              Hủy bỏ
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="flex-1"
              isLoading={loading}
              disabled={!!successMsg}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Xác nhận đổi
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
