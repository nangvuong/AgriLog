import React, { useState } from 'react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { VaiTroNguoiDung } from 'agrilog-shared';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../layouts/AuthLayout';
import { ChangePasswordPage, LoginPage, RegisterPage } from '../pages/Auth';
import { FarmerHomePage, FarmerProfilePage } from '../pages/Farmer';
import { ProtectedRoute, PublicRoute } from '../components/routes';

/**
 * AppRouter - Trung tâm định tuyến toàn bộ ứng dụng AgriLog
 * - Có hỗ trợ Protected Route & Public Route
 * - Quản lý Toast Notification toàn cục
 */
export const AppRouter: React.FC = () => {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  return (
    <>
      {/* Cấu hình các tuyến đường (Routes) */}
      <Routes>
        {/* Route gốc / chuyển hướng tới Trang chủ Nông dân */}
        <Route path="/" element={<Navigate to="/farmer-home" replace />} />

        {/* Cụm tuyến đường sử dụng Split-Screen AuthLayout (Đăng nhập, Đăng ký, Đổi mật khẩu) */}
        <Route element={<AuthLayout />}>
          {/* Public Routes - Chỉ dành cho người dùng CHƯA đăng nhập */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginRouteContainer onShowToast={showToast} />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterRouteContainer onShowToast={showToast} />
              </PublicRoute>
            }
          />

          {/* Protected Route - Đổi mật khẩu */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute>
                <ChangePasswordRouteContainer onShowToast={showToast} />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* Protected Routes cho hệ sinh thái Nông dân (Full Viewport - Chuẩn Farmer Page) */}
        <Route
          path="/farmer-home"
          element={
            <ProtectedRoute
              allowedRoles={[
                VaiTroNguoiDung.NONG_DAN,
                VaiTroNguoiDung.QUAN_LY,
                VaiTroNguoiDung.ADMIN,
              ]}
            >
              <FarmerHomeRouteContainer onShowToast={showToast} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfileRouteContainer onShowToast={showToast} />
            </ProtectedRoute>
          }
        />

        {/* 404 Not Found - Chuyển hướng về mặc định */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1F3A2E] text-[#F5F2E8] px-5 py-3 rounded-2xl shadow-2xl border border-[#3E5C4B] font-medium text-sm flex items-center gap-2 max-w-sm w-[90%] sm:w-auto"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

/* =========================================================================
 * Sub-components kết nối trang (Page) với AuthContext & useNavigate
 * ========================================================================= */

const LoginRouteContainer: React.FC<{ onShowToast: (m: string) => void }> = ({
  onShowToast,
}) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <LoginPage
      onLoginSuccess={(res) => {
        login(res);
        onShowToast(`Chào mừng ${res.user.ho_ten} đã đăng nhập!`);
        navigate('/farmer-home');
      }}
      onSwitchToRegister={() => navigate('/register')}
    />
  );
};

const RegisterRouteContainer: React.FC<{ onShowToast: (m: string) => void }> = ({
  onShowToast,
}) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  return (
    <RegisterPage
      onRegisterSuccess={(res) => {
        login(res);
        onShowToast(`Đăng ký thành công! Chào mừng ${res.user.ho_ten}`);
        navigate('/farmer-home');
      }}
      onSwitchToLogin={() => navigate('/login')}
    />
  );
};

const FarmerHomeRouteContainer: React.FC<{
  onShowToast: (m: string) => void;
}> = ({ onShowToast }) => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  return (
    <FarmerHomePage
      user={user}
      token={token || ''}
      onNavigate={(tab) => {
        navigate(`/${tab}`);
      }}
      onShowToast={onShowToast}
    />
  );
};

const ProfileRouteContainer: React.FC<{ onShowToast: (m: string) => void }> = ({
  onShowToast,
}) => {
  const { user, token, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <FarmerProfilePage
      user={user}
      token={token || ''}
      onUserUpdate={(updated) => {
        updateUser(updated);
        onShowToast('Hồ sơ đã được cập nhật!');
      }}
      onLogout={() => {
        logout();
        onShowToast('Đã đăng xuất khỏi tài khoản.');
        navigate('/login');
      }}
      onSwitchToChangePassword={() => navigate('/change-password')}
      onNavigate={(tab) => {
        navigate(`/${tab}`);
      }}
      onShowToast={onShowToast}
    />
  );
};

const ChangePasswordRouteContainer: React.FC<{
  onShowToast: (m: string) => void;
}> = ({ onShowToast }) => {
  const { token } = useAuth();
  const navigate = useNavigate();

  return (
    <ChangePasswordPage
      token={token || ''}
      onSuccess={() => {
        onShowToast('Đổi mật khẩu thành công!');
        navigate('/profile');
      }}
      onCancel={() => navigate('/profile')}
    />
  );
};
