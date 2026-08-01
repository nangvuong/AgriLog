import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { type VaiTroNguoiDung } from 'agrilog-shared';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: VaiTroNguoiDung[];
  redirectTo?: string;
  children?: React.ReactNode;
}

/**
 * Component bảo vệ các tuyến đường yêu cầu đăng nhập (Protected Route)
 * - Kiểm tra trạng thái xác thực từ AuthContext
 * - Kiểm tra quyền truy cập vai trò (VaiTroNguoiDung)
 * - Tự động chuyển hướng về màn hình đăng nhập hoặc từ chối truy cập
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  redirectTo = '/login',
  children,
}) => {
  const { isAuthenticated, user, hasRole } = useAuth();
  const location = useLocation();

  // 1. Nếu chưa đăng nhập -> chuyển hướng sang trang đăng nhập và lưu lại đường dẫn gốc (from)
  if (!isAuthenticated || !user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  // 2. Nếu có giới hạn vai trò (Role-Based Access Control) mà người dùng không đáp ứng
  if (allowedRoles && allowedRoles.length > 0 && !hasRole(allowedRoles)) {
    return (
      <div className="min-h-screen bg-[#FBF8F1] flex items-center justify-center p-6 text-[#23301F]">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-[#E4DCC8] text-center max-w-md mx-auto">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-serif text-[#23301F]">
            Quyền truy cập bị từ chối
          </h3>
          <p className="text-sm text-[#5C6B57] mt-2 leading-relaxed">
            Tài khoản của bạn ({user.ho_ten} - <strong>{user.vai_tro}</strong>) không
            có quyền truy cập vào chức năng này.
          </p>
          <a
            href="/farmer-home"
            className="mt-6 inline-block w-full py-3 px-6 rounded-2xl bg-[#1F3A2E] text-[#F5F2E8] font-bold text-sm hover:bg-[#264839] transition-all shadow-md"
          >
            Về Trang chủ
          </a>
        </div>
      </div>
    );
  }

  // 3. Hợp lệ -> hiển thị nội dung tuyến đường
  return children ? <>{children}</> : <Outlet />;
};
