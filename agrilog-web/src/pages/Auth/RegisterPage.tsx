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
import { ROLE_INFO, VaiTroNguoiDung } from 'agrilog-shared';
import type { AuthResponse, RegisterDto } from 'agrilog-shared';
import { registerApi } from '../../services/api';
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

interface RegisterPageProps {
  onRegisterSuccess: (res: AuthResponse) => void;
  onSwitchToLogin: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onRegisterSuccess,
  onSwitchToLogin,
}) => {
  const [hoTen, setHoTen] = useState('');
  const [soDienThoai, setSoDienThoai] = useState('');
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [vaiTro, setVaiTro] = useState<VaiTroNguoiDung>(
    VaiTroNguoiDung.NONG_DAN,
  );
  const [vungTrongId, setVungTrongId] = useState<number>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const roles: VaiTroNguoiDung[] = [
    VaiTroNguoiDung.NONG_DAN,
    VaiTroNguoiDung.QUAN_LY,
    VaiTroNguoiDung.KY_THUAT,
    VaiTroNguoiDung.XUAT_KHAU,
    VaiTroNguoiDung.KIEM_DINH,
    VaiTroNguoiDung.ADMIN,
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
    <div className="max-w-xl w-full mx-auto">
      <Card variant="blue">
        <CardHeader>
          <div className="flex justify-center mb-3">
            <Badge variant="blue" icon={<ShieldCheck className="w-3.5 h-3.5" />}>
              Gia nhập Chuỗi Cung Ứng Bưởi
            </Badge>
          </div>
          <CardTitle>Đăng ký tài khoản AgriLog</CardTitle>
          <CardDescription>
            Chọn vai trò phù hợp và tạo tài khoản tham gia hệ thống
          </CardDescription>
        </CardHeader>

        {error && (
          <Alert variant="error" title="Đăng ký không thành công" className="mb-6">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            label="Họ và tên"
            requiredAsterisk
            required
            value={hoTen}
            onChange={(e) => setHoTen(e.target.value)}
            placeholder="Ví dụ: Nguyễn Văn Nông"
            leftIcon={<User className="w-5 h-5" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Số điện thoại"
              requiredAsterisk
              required
              value={soDienThoai}
              onChange={(e) => setSoDienThoai(e.target.value)}
              placeholder="0901234567"
              leftIcon={<Phone className="w-5 h-5" />}
            />

            <Input
              label="Email (Tùy chọn)"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nongdan@agrilog.vn"
              leftIcon={<Mail className="w-5 h-5" />}
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
              leftIcon={<Lock className="w-5 h-5" />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            <Input
              label="ID Vùng Trồng (Tùy chọn)"
              type="number"
              min={1}
              value={vungTrongId}
              onChange={(e) => setVungTrongId(Number(e.target.value))}
              leftIcon={<MapPin className="w-5 h-5" />}
            />
          </div>

          {/* Vai trò trong chuỗi bưởi */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
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

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            isLoading={loading}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="mt-6"
          >
            Đăng ký tham gia hệ thống
          </Button>
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
      </Card>
    </div>
  );
};
