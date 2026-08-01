import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppRouter } from './routes';

/**
 * App chính của AgriLog GlobalGAP
 * - Cấu hình AuthProvider quản lý phiên đăng nhập toàn cục
 * - Cấu hình BrowserRouter & AppRouter quản lý định tuyến Protected Route & Public Route
 */
export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}