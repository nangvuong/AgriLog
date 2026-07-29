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
} from 'lucide-react';
import { UserProfile } from '../types/auth';

interface HeaderProps {
  activeTab: 'login' | 'register' | 'profile' | 'change-password';
  setActiveTab: (tab: 'login' | 'register' | 'profile' | 'change-password') => void;
  currentUser: UserProfile | null;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
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
