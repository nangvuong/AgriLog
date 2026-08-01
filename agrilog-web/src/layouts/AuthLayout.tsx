import React, { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { HeroBanner, MobileHeroBanner } from '../components/HeroBanner';
import { useAuth } from '../context/AuthContext';

/**
 * Layout Split-Screen chính cho các trang xác thực và quản lý tài khoản
 * (Đăng nhập, Đăng ký, Hồ sơ, Đổi mật khẩu) theo chuẩn mẫu dang-nhap.html
 */
export const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [lang, setLang] = useState<'VN' | 'EN'>('VN');

  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-[#FBF8F1] text-[#23301F] flex flex-col lg:flex-row font-sans overflow-x-hidden">
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
              {!isAuthenticated ? (
                <>
                  <button
                    onClick={() => navigate('/login')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      currentPath === '/login'
                        ? 'bg-[#1F3A2E] text-[#F5F2E8] shadow-sm'
                        : 'text-[#5C6B57] hover:text-[#23301F]'
                    }`}
                  >
                    Đăng nhập
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      currentPath === '/register'
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
                    onClick={() => navigate('/farmer-home')}
                    className="px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer text-[#5C6B57] hover:text-[#23301F]"
                  >
                    Trang chủ
                  </button>
                  <button
                    onClick={() => navigate('/profile')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      currentPath === '/profile'
                        ? 'bg-[#1F3A2E] text-[#F5F2E8] shadow-sm'
                        : 'text-[#5C6B57] hover:text-[#23301F]'
                    }`}
                  >
                    Hồ sơ
                  </button>
                  <button
                    onClick={() => navigate('/change-password')}
                    className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      currentPath === '/change-password'
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

        {/* Center Form Area (<Outlet /> renders child route component) */}
        <div className="flex-1 flex items-center justify-center py-4 sm:py-8">
          <Outlet />
        </div>

        {/* Bottom Footer (.form-footer in dang-nhap.html) */}
        <footer className="pt-4 border-t border-[#E4DCC8]/60 text-center text-xs text-[#5C6B57] font-medium">
          © 2026 <strong>AgriLog</strong> — Nhật ký điện tử cho người trồng bưởi xuất khẩu chuẩn GlobalGAP #VN-2026.
        </footer>
      </main>
    </div>
  );
};
