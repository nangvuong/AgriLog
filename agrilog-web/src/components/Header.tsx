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
import type { UserProfile } from 'agrilog-shared';

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
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-green-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div
          onClick={() => setActiveTab(currentUser ? 'profile' : 'login')}
          className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-green-600 to-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform flex-shrink-0">
            <Leaf className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-base sm:text-xl font-bold tracking-tight bg-gradient-to-r from-green-700 via-green-800 to-blue-700 bg-clip-text text-transparent truncate">
                AgriLog Auth
              </span>
              <span className="inline-flex items-center gap-0.5 sm:gap-1 text-[9px] sm:text-[10px] uppercase tracking-wider font-semibold px-1.5 sm:px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex-shrink-0">
                <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span className="hidden xs:inline">GlobalGAP</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Nhật ký bưởi xuất khẩu & Chuỗi cung ứng
            </p>
          </div>
        </div>

        {/* Status indicator & Nav tabs */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl sm:rounded-2xl border border-slate-200/60">
            {!currentUser ? (
              <>
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
                    activeTab === 'login'
                      ? 'bg-white text-green-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Đăng nhập</span>
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
                    activeTab === 'register'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Đăng ký</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
                    activeTab === 'profile'
                      ? 'bg-white text-green-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>Hồ sơ</span>
                </button>
                <button
                  onClick={() => setActiveTab('change-password')}
                  className={`flex items-center gap-1.5 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
                    activeTab === 'change-password'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="Đổi mật khẩu"
                >
                  <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Mật khẩu</span>
                </button>
                <button
                  onClick={onLogout}
                  className="flex items-center justify-center p-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-all active:scale-95"
                  title="Đăng xuất khỏi hệ thống"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
