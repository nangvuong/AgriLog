import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { UserRole } from 'agrilog-shared';
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Shadcn/UI components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

/**
 * Trang Auth cho "Nhật Ký" — nhật ký điện tử.
 * Ý tưởng: viết nhật ký thường vào ban đêm — nên bên trái là một "trang bìa"
 * màu mực đêm với minh hoạ cuốn sổ + ngòi bút và bầu trời sao nhỏ.
 * Bên phải là "trang giấy" màu kem sáng chứa form, viền kẻ ngang mờ như giấy sổ tay.
 * Font: Caveat (chữ viết tay) cho thương hiệu/trích dẫn, Lora (serif) cho nội dung,
 * IBM Plex Mono cho nhãn ngày tháng / nhãn phụ kiểu con dấu.
 *
 * Tích hợp Shadcn/UI components và Framer Motion cho trải nghiệm mượt mà, sống động.
 */

const QUOTES = [
  'Mỗi trang nhật ký là một ngày ngoài đồng được giữ lại.',
  'Ghi lại hôm nay, để mùa sau biết đường mà làm tốt hơn.',
  'Đất nhớ từng vụ mùa, sổ tay nhớ từng ngày công.',
  'Gieo hạt cần kiên nhẫn, ghi chép cần đều đặn.',
];

function useTodayVN() {
  const d = new Date();
  const text = new Intl.DateTimeFormat('vi-VN', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(d);
  return text.toUpperCase();
}

function FieldMark() {
  return (
    <svg viewBox="0 0 200 140" className="h-full w-full" fill="none">
      <path
        d="M20 108 C60 100, 140 100, 180 108"
        stroke="#C9A227"
        strokeWidth="1.2"
        opacity="0.5"
        strokeLinecap="round"
      />
      <path
        d="M20 118 C60 110, 140 110, 180 118"
        stroke="#C9A227"
        strokeWidth="1.2"
        opacity="0.4"
        strokeLinecap="round"
      />
      <path
        d="M20 128 C60 120, 140 120, 180 128"
        stroke="#C9A227"
        strokeWidth="1.2"
        opacity="0.3"
        strokeLinecap="round"
      />

      <path
        d="M100 108 C100 78, 100 52, 100 28"
        stroke="#C9A227"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M100 60 C82 58, 68 46, 64 24 C88 26, 100 40, 100 60 Z"
        stroke="#C9A227"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M100 74 C120 72, 136 58, 140 34 C114 37, 100 52, 100 74 Z"
        stroke="#C9A227"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M100 92 C86 90, 74 80, 70 62 C90 64, 100 76, 100 92 Z"
        stroke="#C9A227"
        strokeWidth="1.2"
        strokeLinejoin="round"
        opacity="0.85"
      />

      <path
        d="M46 108 C46 92, 46 78, 46 66"
        stroke="#C9A227"
        strokeWidth="1.1"
        opacity="0.55"
        strokeLinecap="round"
      />
      <path
        d="M46 78 C38 76, 32 68, 31 56 C42 58, 46 66, 46 78 Z"
        stroke="#C9A227"
        strokeWidth="1"
        opacity="0.55"
        strokeLinejoin="round"
      />

      <path
        d="M158 108 C158 94, 158 82, 158 72"
        stroke="#C9A227"
        strokeWidth="1.1"
        opacity="0.55"
        strokeLinecap="round"
      />
      <path
        d="M158 84 C167 82, 173 74, 174 62 C163 64, 158 72, 158 84 Z"
        stroke="#C9A227"
        strokeWidth="1"
        opacity="0.55"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Stars() {
  const dots = [
    [8, 12],
    [22, 28],
    [40, 8],
    [63, 20],
    [80, 6],
    [15, 55],
    [55, 60],
    [88, 45],
    [30, 78],
    [70, 82],
    [12, 90],
    [90, 88],
    [48, 92],
    [75, 15],
  ];
  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
    >
      {dots.map(([x, y], i) => (
        <span
          key={i}
          className="absolute h-[3px] w-[3px] rounded-full bg-[#C9A227]"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            opacity: 0.25 + (i % 3) * 0.15,
          }}
        />
      ))}
    </motion.div>
  );
}

export interface AuthPageProps {
  defaultMode?: 'signin' | 'signup';
}

export default function AuthPage({ defaultMode = 'signin' }: AuthPageProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isLoading, error, clearError } = useAuthStore();

  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [remember, setRemember] = useState(false);
  const [terms, setTerms] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form fields
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');

  const dateStr = useTodayVN();
  const quote = QUOTES[new Date().getDate() % QUOTES.length];

  // Sync mode with route if needed
  useEffect(() => {
    if (location.pathname === '/register') {
      setMode('signup');
    } else if (location.pathname === '/login') {
      setMode('signin');
    }
  }, [location.pathname]);

  const handleModeChange = (nextMode: 'signin' | 'signup') => {
    setMode(nextMode);
    clearError();
    setValidationError(null);
    navigate(nextMode === 'signin' ? '/login' : '/register', { replace: true });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setValidationError(null);

    if (mode === 'signin') {
      if (!emailOrUsername.trim() || !password) {
        setValidationError('Vui lòng nhập email/tên đăng nhập và mật khẩu.');
        return;
      }

      try {
        const isEmail = emailOrUsername.includes('@');
        await login({
          [isEmail ? 'email' : 'username']: emailOrUsername.trim(),
          password,
        });
        navigate('/', { replace: true });
      } catch {
        // Error state handled by Zustand
      }
    } else {
      // mode === 'signup'
      if (!fullName.trim() || !username.trim() || !email.trim() || !password) {
        setValidationError('Vui lòng điền đầy đủ các thông tin bắt buộc.');
        return;
      }

      if (password !== password2) {
        setValidationError('Mật khẩu nhập lại không khớp.');
        return;
      }

      if (password.length < 6) {
        setValidationError('Mật khẩu phải chứa ít nhất 6 ký tự.');
        return;
      }

      if (!terms) {
        setValidationError('Vui lòng đồng ý với Điều khoản và Chính sách bảo mật.');
        return;
      }

      try {
        await register({
          full_name: fullName.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
          role: UserRole.FARMER,
        });
        navigate('/', { replace: true });
      } catch {
        // Error state handled by Zustand
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Noto+Serif+Display:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');
      `}</style>

      {/* Panel trái — chỉ hiện từ lg trở lên */}
      <div className="relative hidden w-full overflow-hidden bg-[#1C2B1E] px-12 py-12 lg:flex lg:w-[42%] lg:flex-col lg:justify-between">
        <Stars />
        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-[36px] leading-none text-[#E7C766]"
            style={{ fontFamily: "'Dancing Script', cursive" }}
          >
            Nhật Ký
          </motion.p>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-2 text-[12px] tracking-[0.18em] text-[#7E9384]"
            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
          >
            {dateStr}
          </motion.p>
        </div>

        <motion.div
          className="relative z-10 my-10 h-56 w-full opacity-90"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        >
          <FieldMark />
        </motion.div>

        <div className="relative z-10">
          <AnimatePresence mode="wait">
            <motion.p
              key={quote}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="max-w-[26ch] text-[22px] leading-snug text-[#D6DAC0]"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              “{quote}”
            </motion.p>
          </AnimatePresence>
          <p
            className="mt-6 text-[11px] tracking-[0.15em] text-[#5E7268]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            NHẬT KÝ ĐỒNG RUỘNG · THEO TỪNG MÙA VỤ
          </p>
        </div>
      </div>

      {/* Panel phải — form */}
      <div
        className="flex w-full flex-1 items-center justify-center bg-[#F7F2DF] px-5 py-10 sm:px-8"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent, transparent 34px, rgba(60,55,40,0.05) 35px)',
        }}
      >
        <div className="w-full max-w-[400px]">
          {/* thương hiệu rút gọn cho mobile */}
          <div className="mb-8 flex items-center justify-between lg:hidden">
            <p
              className="text-[28px] leading-none text-[#1C2B1E]"
              style={{ fontFamily: "'Dancing Script', cursive" }}
            >
              Nhật Ký
            </p>
            <p
              className="text-[10px] tracking-[0.14em] text-[#7C7A4E]"
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {dateStr}
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="rounded-2xl border border-[#E1E5CB] bg-[#FFFDF6] p-6 shadow-sm sm:p-8"
          >
            {/* Tabs với hiệu ứng layout motion */}
            <div className="mb-6 flex rounded-full bg-[#ECEEDA] p-1">
              {[
                { key: 'signin' as const, label: 'Đăng nhập' },
                { key: 'signup' as const, label: 'Đăng ký' },
              ].map((t) => {
                const isActive = mode === t.key;
                return (
                  <button
                    key={t.key}
                    type="button"
                    onClick={() => handleModeChange(t.key)}
                    className={
                      'relative h-9 flex-1 rounded-full text-[13px] font-medium transition-colors ' +
                      (isActive ? 'text-[#1C2B1E]' : 'text-[#7C7A4E] hover:text-[#33361F]')
                    }
                    style={{ fontFamily: "'Lora', serif" }}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeAuthTab"
                        className="absolute inset-0 rounded-full bg-white shadow-sm"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                      />
                    )}
                    <span className="relative z-10">{t.label}</span>
                  </button>
                );
              })}
            </div>

            <h1
              className="mb-1 text-[19px] font-medium text-[#20281B]"
              style={{ fontFamily: "'Lora', serif" }}
            >
              {mode === 'signin'
                ? 'Chào bạn quay lại'
                : 'Bắt đầu trang đầu tiên'}
            </h1>
            <p
              className="mb-6 text-[13px] text-[#7C7A4E]"
              style={{ fontFamily: "'Lora', serif" }}
            >
              {mode === 'signin'
                ? 'Đăng nhập để tiếp tục ghi chép nhật ký đồng ruộng.'
                : 'Tạo tài khoản để bắt đầu lưu lại từng mùa vụ.'}
            </p>

            {(error || validationError) && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4"
              >
                <Alert
                  variant="destructive"
                  className="border-[#E57373] bg-[#FFEBEE] text-[#B71C1C]"
                  style={{ fontFamily: "'Lora', serif" }}
                >
                  <AlertDescription>
                    {validationError || error}
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              <motion.form
                key={mode}
                initial={{ opacity: 0, x: mode === 'signin' ? -15 : 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: mode === 'signin' ? 15 : -15 }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
                className="space-y-4"
                onSubmit={handleSubmit}
              >
                {mode === 'signup' && (
                  <>
                    <div>
                      <Label htmlFor="full_name">Họ và tên</Label>
                      <Input
                        id="full_name"
                        icon={User}
                        type="text"
                        placeholder="Nguyễn Văn A"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (error || validationError) {
                            clearError();
                            setValidationError(null);
                          }
                        }}
                        autoComplete="name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="username">Tên đăng nhập</Label>
                      <Input
                        id="username"
                        icon={User}
                        type="text"
                        placeholder="nongdan_01"
                        value={username}
                        onChange={(e) => {
                          setUsername(e.target.value);
                          if (error || validationError) {
                            clearError();
                            setValidationError(null);
                          }
                        }}
                        autoComplete="username"
                        required
                      />
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="email">
                    {mode === 'signin' ? 'Email hoặc Tên đăng nhập' : 'Email'}
                  </Label>
                  <Input
                    id="email"
                    icon={Mail}
                    type="text"
                    placeholder={
                      mode === 'signin'
                        ? 'email@agrilog.vn hoặc nongdan_01'
                        : 'ban@email.com'
                    }
                    value={mode === 'signin' ? emailOrUsername : email}
                    onChange={(e) => {
                      if (mode === 'signin') {
                        setEmailOrUsername(e.target.value);
                      } else {
                        setEmail(e.target.value);
                      }
                      if (error || validationError) {
                        clearError();
                        setValidationError(null);
                      }
                    }}
                    autoComplete="email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Mật khẩu</Label>
                  <Input
                    id="password"
                    icon={Lock}
                    type={showPw ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (error || validationError) {
                        clearError();
                        setValidationError(null);
                      }
                    }}
                    autoComplete={
                      mode === 'signin' ? 'current-password' : 'new-password'
                    }
                    required
                    endAdornment={
                      <button
                        type="button"
                        onClick={() => setShowPw((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B9070] hover:text-[#33361F]"
                        aria-label={showPw ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPw ? (
                          <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                        ) : (
                          <Eye className="h-4 w-4" strokeWidth={1.75} />
                        )}
                      </button>
                    }
                  />
                </div>

                {mode === 'signup' && (
                  <div>
                    <Label htmlFor="password2">Nhập lại mật khẩu</Label>
                    <Input
                      id="password2"
                      icon={Lock}
                      type={showPw2 ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password2}
                      onChange={(e) => {
                        setPassword2(e.target.value);
                        if (error || validationError) {
                          clearError();
                          setValidationError(null);
                        }
                      }}
                      autoComplete="new-password"
                      required
                      endAdornment={
                        <button
                          type="button"
                          onClick={() => setShowPw2((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B9070] hover:text-[#33361F]"
                          aria-label={showPw2 ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                        >
                          {showPw2 ? (
                            <EyeOff className="h-4 w-4" strokeWidth={1.75} />
                          ) : (
                            <Eye className="h-4 w-4" strokeWidth={1.75} />
                          )}
                        </button>
                      }
                    />
                  </div>
                )}

                {mode === 'signin' ? (
                  <div className="flex items-center justify-between pt-1">
                    <Checkbox
                      id="remember"
                      checked={remember}
                      onCheckedChange={setRemember}
                    >
                      Ghi nhớ đăng nhập
                    </Checkbox>
                    <a
                      href="#forgot"
                      className="text-[13px] font-medium text-[#6E7A1F] hover:text-[#1C2B1E]"
                      style={{ fontFamily: "'Lora', serif" }}
                    >
                      Quên mật khẩu?
                    </a>
                  </div>
                ) : (
                  <div className="pt-1">
                    <Checkbox
                      id="terms"
                      checked={terms}
                      onCheckedChange={setTerms}
                    >
                      Tôi đồng ý với Điều khoản và Chính sách bảo mật
                    </Checkbox>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="notebookPrimary"
                  className="group w-full text-[14px]"
                  style={{ fontFamily: "'Lora', serif" }}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : mode === 'signin' ? (
                    <>
                      Đăng nhập
                      <ArrowRight
                        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                        strokeWidth={1.75}
                      />
                    </>
                  ) : (
                    <>
                      Tạo tài khoản
                      <ArrowRight
                        className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1"
                        strokeWidth={1.75}
                      />
                    </>
                  )}
                </Button>
              </motion.form>
            </AnimatePresence>

            <div className="my-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E1E5CB]" />
              <span
                className="text-[11px] uppercase tracking-[0.12em] text-[#A8AC86]"
                style={{ fontFamily: "'Lora', serif" }}
              >
                hoặc tiếp tục với
              </span>
              <div className="h-px flex-1 bg-[#E1E5CB]" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="notebookGhost"
                style={{ fontFamily: "'Lora', serif" }}
              >
                Google
              </Button>
              <Button
                type="button"
                variant="notebookGhost"
                style={{ fontFamily: "'Lora', serif" }}
              >
                Apple
              </Button>
            </div>
          </motion.div>

          <p
            className="mt-6 text-center text-[13px] text-[#7C7A4E]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            {mode === 'signin' ? 'Chưa có tài khoản? ' : 'Đã có tài khoản? '}
            <button
              type="button"
              onClick={() => handleModeChange(mode === 'signin' ? 'signup' : 'signin')}
              className="font-medium text-[#1C2B1E] underline underline-offset-2 hover:text-[#6E7A1F]"
            >
              {mode === 'signin' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
