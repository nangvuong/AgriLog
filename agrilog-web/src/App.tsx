import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import type { AuthResponse, UserProfile } from 'agrilog-shared';
import { Header } from './components/Header';
import { HeroBanner } from './components/HeroBanner';
import {
  ChangePasswordPage,
  LoginPage,
  ProfilePage,
  RegisterPage,
} from './pages/Auth';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'login' | 'register' | 'profile' | 'change-password'
  >('login');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string>('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gradient-to-br from-green-50/70 via-white to-blue-50/60 text-slate-800 flex flex-col font-sans">
      {/* Navbar */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-24 right-6 z-50 bg-slate-900/90 text-white px-5 py-3 rounded-2xl shadow-xl backdrop-blur-md border border-white/10 text-sm font-medium flex items-center gap-2"
          >
            <span className="w-2 h-2 rounded-full bg-green-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 w-full items-center">
          {/* Left Side: Hero Artwork Banner */}
          <HeroBanner />

          {/* Right Side: Interactive Pages */}
          <div className="w-full">
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
                  onSuccess={() => setActiveTab('profile')}
                  onCancel={() => setActiveTab('profile')}
                />
              )}

              {/* Fallback if accessing profile or change-password when logged out */}
              {(activeTab === 'profile' ||
                activeTab === 'change-password') &&
                !currentUser && (
                  <motion.div
                    key="unauthorized"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-amber-200 text-center max-w-md mx-auto"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto mb-4">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Yêu cầu đăng nhập
                    </h3>
                    <p className="text-sm text-slate-500 mt-2">
                      Vui lòng đăng nhập để xem thông tin hồ sơ và đổi mật
                      khẩu của bạn.
                    </p>
                    <button
                      onClick={() => setActiveTab('login')}
                      className="mt-6 w-full py-3 px-6 rounded-2xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-all shadow-md"
                    >
                      Đăng nhập ngay
                    </button>
                  </motion.div>
                )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200/60 bg-white/60 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 <strong>AgriLog</strong> — Nhật ký điện tử cho người trồng
            bưởi xuất khẩu.
          </span>
          <span className="inline-flex items-center gap-2">
            <span>Powered by NestJS 11 + React 19 + Tailwind CSS</span>
          </span>
        </div>
      </footer>
    </div>
  );
}