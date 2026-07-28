import React from 'react';
import {
  CheckCircle2,
  KeyRound,
  Leaf,
  LogIn,
  LogOut,
  Server,
  ShieldCheck,
  User,
  UserPlus,
  Wifi,
} from 'lucide-react';
import { motion } from 'motion/react';
import { UserProfile } from '../types/auth';

interface HeaderProps {
  activeTab: 'login' | 'register' | 'profile' | 'change-password';
  setActiveTab: (tab: 'login' | 'register' | 'profile' | 'change-password') => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
  isDemoMode: boolean;
  onToggleDemoMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  isDemoMode,
  onToggleDemoMode,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-green-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div
          onClick={() => setActiveTab(currentUser ? 'profile' : 'login')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-green-700 via-green-800 to-blue-700 bg-clip-text text-transparent">
                AgriLog Auth
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                <ShieldCheck className="w-3 h-3" />
                GlobalGAP
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Nhật ký bưởi xuất khẩu & Chuỗi cung ứng
            </p>
          </div>
        </div>

        {/* Status indicator & Nav tabs */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Toggle Demo vs Backend Mode */}
          <button
            onClick={onToggleDemoMode}
            title={
              isDemoMode
                ? 'Đang dùng chế độ Demo (Mock data), nhấn để thử kết nối API thực http://localhost:3000'
                : 'Đang kết nối API Backend thực tế (http://localhost:3000/api/v1)'
            }
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              isDemoMode
                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
                : 'bg-green-50 text-green-700 border-green-300 hover:bg-green-100'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>{isDemoMode ? 'Chế độ Demo Mock' : 'API NestJS: :3000'}</span>
            <span
              className={`w-2 h-2 rounded-full animate-pulse ${
                isDemoMode ? 'bg-amber-500' : 'bg-green-500'
              }`}
            />
          </button>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            {!currentUser ? (
              <>
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'login'
                      ? 'bg-white text-green-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Đăng nhập</span>
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'register'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Đăng ký</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'profile'
                      ? 'bg-white text-green-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Hồ sơ tôi</span>
                </button>
                <button
                  onClick={() => setActiveTab('change-password')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === 'change-password'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <KeyRound className="w-4 h-4" />
                  <span className="hidden sm:inline">Đổi mật khẩu</span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all"
                  title="Đăng xuất khỏi hệ thống"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
