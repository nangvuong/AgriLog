import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface PublicRouteProps {
  redirectTo?: string;
  children?: React.ReactNode;
}

/**
 * Component bảo vệ tuyến đường công khai (Public Route: Đăng nhập / Đăng ký)
 * - Nếu người dùng đã đăng nhập sẵn -> tự động chuyển hướng sang Trang chủ Nông dân
 */
export const PublicRoute: React.FC<PublicRouteProps> = ({
  redirectTo = '/farmer-home',
  children,
}) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
