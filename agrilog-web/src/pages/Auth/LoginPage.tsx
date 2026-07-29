import React, { useState } from 'react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Phone,
  Sparkles,
} from 'lucide-react';
import type { AuthResponse, LoginDto } from 'agrilog-shared';
import { loginApi } from '../../services/api';
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

interface LoginPageProps {
  onLoginSuccess: (res: AuthResponse) => void;
  onSwitchToRegister: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onSwitchToRegister,
}) => {
  const [soDienThoaiHoacEmail, setSoDienThoaiHoacEmail] =
    useState('0901234567');
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

  return (
    <div className="max-w-md w-full mx-auto">
      <Card variant="green">
        <CardHeader>
          <div className="flex justify-center mb-3">
            <Badge variant="green" icon={<Sparkles className="w-3.5 h-3.5" />}>
              Xác thực Chuỗi xuất khẩu
            </Badge>
          </div>
          <CardTitle>Đăng nhập AgriLog</CardTitle>
          <CardDescription>
            Truy cập hệ thống nhật ký bưởi & kiểm định GlobalGAP
          </CardDescription>
        </CardHeader>

        {error && (
          <Alert variant="error" title="Đăng nhập không thành công" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Số điện thoại hoặc Email"
            requiredAsterisk
            required
            value={soDienThoaiHoacEmail}
            onChange={(e) => setSoDienThoaiHoacEmail(e.target.value)}
            placeholder="Ví dụ: 0901234567 hoặc nongdan@agrilog.vn"
            leftIcon={<Phone className="w-5 h-5" />}
          />

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Mật khẩu đăng nhập <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs text-blue-600 hover:underline cursor-pointer font-medium">
                Quên mật khẩu?
              </span>
            </div>
            <Input
              type={showPassword ? 'text' : 'password'}
              required
              value={matKhau}
              onChange={(e) => setMatKhau(e.target.value)}
              placeholder="Nhập mật khẩu"
              leftIcon={<Lock className="w-5 h-5" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 p-1"
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Đăng nhập ngay
          </Button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
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
      </Card>
    </div>
  );
};
