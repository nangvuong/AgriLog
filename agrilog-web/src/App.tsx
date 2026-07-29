import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { AuthResponse, UserProfile } from 'agrilog-shared';
import { HeroBanner, MobileHeroBanner } from './components/HeroBanner';
import {
  ChangePasswordPage,
  LoginPage,
  ProfilePage,
  RegisterPage,
} from './pages/Auth';
import { ShieldAlert } from 'lucide-react';

/**
 * App chính với cấu trúc Split-Screen Full-Viewport theo mẫu dang-nhap.html
 * Bên trái 44% (.panel-brand) màu xanh rừng sâu #1F3A2E
 * Bên phải 56% (.panel-form) nền giấy trắng ấm #FBF8F1
 */
export default function App() {
  const [activeTab, setActiveTab] = useState<
    'login' | 'register' | 'profile' | 'change-password'
  >('login');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [lang, setLang] = useState<'VN' | 'EN'>('VN');

  useEffect(() => {
    const savedToken = localStorage.getItem('agrilog_token');
    const savedUserJson = localStorage.getItem('agrilog_user');
    if (savedToken && savedUserJson) {
      try {
        const userObj = JSON.parse(savedUserJson) as UserProfile;
        setToken(savedToken);
        setCurrentUser(userObj);
        setActiveTab('profile');
      } catch (e) {
        localStorage.removeItem('agrilog_token');
        localStorage.removeItem('agrilog_user');
      }
    }
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleLoginOrRegisterSuccess = (res: AuthResponse) => {
    setToken(res.access_token);
    setCurrentUser(res.user);
    localStorage.setItem('agrilog_token', res.access_token);
    localStorage.setItem('agrilog_user', JSON.stringify(res.user));
    setActiveTab('profile');
    showToast(`Chào mừng ${res.user.ho_ten} đã đăng nhập hệ thống!`);
  };

  const handleProfileUpdate = (updatedUser: UserProfile) => {
    setCurrentUser(updatedUser);
    localStorage.setItem('agrilog_user', JSON.stringify(updatedUser));
    showToast('Dữ liệu hồ sơ đã được cập nhật!');
  };

  const handleLogout = () => {
    localStorage.removeItem('agrilog_token');
    localStorage.removeItem('agrilog_user');
    setToken('');
    setCurrentUser(null);
    setActiveTab('login');
    showToast('Đã đăng xuất khỏi tài khoản.');
  };

  return (
    <div className="min-h-screen bg-[#FBF8F1] text-[#23301F] flex flex-col lg:flex-row font-sans overflow-x-hidden">
      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 bg-[#1F3A2E] text-[#F5F2E8] px-5 py-3 rounded-2xl shadow-xl border border-[#D9A441]/40 text-sm font-semibold flex items-center gap-2"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LEFT: BRAND PANEL (44% width on desktop, 100vh full-height split screen matching dang-nhap.html) */}
      <aside className="hidden lg:block lg:w-[44%] xl:w-[42%] min-h-screen sticky top-0 flex-shrink-0">
        <HeroBanner />
      </aside>

      {/* Mobile Top Header Banner (< lg) */}
      <div className="lg:hidden w-full">
        <MobileHeroBanner />
      </div>

      {/* RIGHT: FORM PANEL (56% width on desktop, 100vh full-height split screen) */}
      <main className="flex-1 min-h-[calc(100vh-64px)] lg:min-h-screen bg-[#FBF8F1] text-[#23301F] flex flex-col justify-between p-4 sm:p-8 lg:p-14 relative">
        {/* Top Right Bar: Lang Toggle & Auth Nav */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pb-2.5 border-b border-[#E4DCC8]/50 sm:border-b-0">
          <div className="sm:hidden text-xs font-bold text-[#1F3A2E] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>AgriLog GlobalGAP</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Lang Toggle (.lang-toggle from dang-nhap.html) */}
            <div
              className="flex gap-0.5 bg-[#F4F0E4] p-1 rounded-xl border border-[#E4DCC8] font-mono text-xs"
              role="group"
              aria-label="Ngôn ngữ"
            >
              <button
                type="button"
                onClick={() => setLang('VN')}
                aria-current={lang === 'VN'}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  lang === 'VN'
                    ? 'bg-[#1F3A2E] text-[#F5F2E8] shadow-sm'
                    : 'text-[#5C6B57] hover:text-[#23301F]'
                }`}
              >
                VN
              </button>
              <button
                type="button"
                onClick={() => setLang('EN')}
                aria-current={lang === 'EN'}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  lang === 'EN'
                    ? 'bg-[#1F3A2E] text-[#F5F2E8] shadow-sm'
                    : 'text-[#5C6B57] hover:text-[#23301F]'
                }`}
              >
                EN
              </button>
            </div>

            {/* Nav Tabs (.nav-buttons) */}
            <nav className="flex items-center gap-1 bg-[#F4F0E4] p-1 rounded-xl border border-[#E4DCC8]">
              {!currentUser ? (
                <>
                  <button
                    onClick={() => setActiveTab('login')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'login'
                        ? 'bg-[#1F3A2E] text-[#F5F2E8] shadow-sm'
                        : 'text-[#5C6B57] hover:text-[#23301F]'
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => setActiveTab('register')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'register'
                        ? 'bg-[#1F3A2E] text-[#F5F2E8] shadow-sm'
                        : 'text-[#5C6B57] hover:text-[#23301F]'
                    }`}
                  >
                    Đăng ký
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'profile'
                        ? 'bg-[#1F3A2E] text-[#F5F2E8] shadow-sm'
                        : 'text-[#5C6B57] hover:text-[#23301F]'
                    }`}
                  >
                    Hồ sơ
                  </button>
                  <button
                    onClick={() => setActiveTab('change-password')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      activeTab === 'change-password'
                        ? 'bg-[#1F3A2E] text-[#F5F2E8] shadow-sm'
                        : 'text-[#5C6B57] hover:text-[#23301F]'
                    }`}
                  >
                    Đổi mật khẩu
                  </button>
                </>
              )}
            </nav>
          </div>
        </div>

        {/* Center Form Area (.form-wrap in dang-nhap.html) */}
        <div className="flex-1 flex items-center justify-center py-4 sm:py-8">
          <AnimatePresence mode="wait">
            {activeTab === 'login' && (
              <LoginPage
                key="login"
                onLoginSuccess={handleLoginOrRegisterSuccess}
                onSwitchToRegister={() => setActiveTab('register')}
              />
            )}

            {activeTab === 'register' && (
              <RegisterPage
                key="register"
                onRegisterSuccess={handleLoginOrRegisterSuccess}
                onSwitchToLogin={() => setActiveTab('login')}
              />
            )}

            {activeTab === 'profile' && currentUser && (
              <ProfilePage
                key="profile"
                user={currentUser}
                token={token}
                onUserUpdate={handleProfileUpdate}
                onLogout={handleLogout}
                onSwitchToChangePassword={() =>
                  setActiveTab('change-password')
                }
              />
            )}

            {activeTab === 'change-password' && currentUser && (
              <ChangePasswordPage
                key="change-password"
                token={token}
                onSuccess={() => {
                  showToast('Đổi mật khẩu thành công.');
                  setActiveTab('profile');
                }}
                onCancel={() => setActiveTab('profile')}
              />
            )}

            {(activeTab === 'profile' ||
              activeTab === 'change-password') &&
              !currentUser && (
                <motion.div
                  key="auth-required"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[#E4DCC8] text-center max-w-md mx-auto"
                >
                  <div className="w-12 h-12 rounded-2xl bg-[#F4F0E4] text-[#D9A441] flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#23301F] font-serif">
                    Yêu cầu đăng nhập
                  </h3>
                  <p className="text-sm text-[#5C6B57] mt-2 leading-relaxed">
                    Vui lòng đăng nhập hệ thống để xem nhật ký và thông tin hồ sơ xuất khẩu của bạn.
                  </p>
                  <button
                    onClick={() => setActiveTab('login')}
                    className="mt-6 w-full py-3.5 px-6 rounded-2xl bg-[#1F3A2E] text-[#F5F2E8] font-bold text-sm hover:bg-[#264839] transition-all shadow-md cursor-pointer"
                  >
                    Đăng nhập ngay
                  </button>
                </motion.div>
              )}
          </AnimatePresence>
        </div>

        {/* Bottom Footer (.form-footer in dang-nhap.html) */}
        <footer className="pt-4 border-t border-[#E4DCC8]/60 text-center text-xs text-[#5C6B57] font-medium">
          © 2026 <strong>AgriLog</strong> — Nhật ký điện tử cho người trồng bưởi xuất khẩu chuẩn GlobalGAP #VN-2026.
        </footer>
      </main>
    </div>
  );
}