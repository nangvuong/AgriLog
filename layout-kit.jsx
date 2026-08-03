import React, { useState } from "react";
import {
  LayoutDashboard, Sprout, Tractor, Bug, Package, Wrench, BarChart3, Settings,
  Menu, X, Bell, ChevronRight, ChevronDown, Search, Plus,
} from "lucide-react";

/**
 * Layout kit dùng chung cho toàn bộ ứng dụng AgriLog.
 * Gồm: Navbar (top bar), Sidebar (điều hướng), Container (khung nội dung),
 * Breadcrumb (đường dẫn), PageHeader (tiêu đề trang + hành động).
 * Cùng tông màu với trang auth/dashboard: xanh đất #1C2B1E + vàng lúa #C9A227
 * trên nền giấy kem #F7F2DF.
 */

const NAV_ITEMS = [
  { key: "overview", label: "Tổng quan", icon: LayoutDashboard },
  { key: "seasons", label: "Mùa vụ", icon: Sprout },
  { key: "activities", label: "Hoạt động", icon: Tractor },
  { key: "observations", label: "Quan sát", icon: Bug, badge: 3 },
  { key: "inventory", label: "Vật tư", icon: Package },
  { key: "assets", label: "Tài sản", icon: Wrench },
  { key: "reports", label: "Báo cáo", icon: BarChart3 },
];

/* ========================= Sidebar ========================= */

export function Sidebar({ active, onNavigate, open, onClose }) {
  const content = (
    <div className="flex h-full flex-col bg-[#1C2B1E]">
      <div className="flex h-16 shrink-0 items-center gap-2 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-[#C9A227]/15 text-[#E7C766]">
          <Sprout className="h-4.5 w-4.5" strokeWidth={1.75} />
        </div>
        <span className="text-[17px] text-[#F3F5E9]" style={{ fontFamily: "'Lora', serif", fontWeight: 500 }}>
          AgriLog
        </span>
        <button onClick={onClose} className="ml-auto text-[#8FA084] lg:hidden" aria-label="Đóng menu">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate?.(item.key)}
              className={
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px] transition " +
                (isActive
                  ? "bg-[#2A3E2A] text-[#F3F5E9]"
                  : "text-[#9BAB90] hover:bg-[#233420] hover:text-[#E4E8D8]")
              }
              style={{ fontFamily: "'Lora', serif" }}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" strokeWidth={1.75} />
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge && (
                <span className="rounded-full bg-[#C9A227] px-1.5 py-0.5 text-[10.5px] font-medium text-[#1C2B1E]">
                  {item.badge}
                </span>
              )}
              {isActive && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#C9A227]" />}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-[#2A3E2A] p-3">
        <button
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[13.5px] text-[#9BAB90] transition hover:bg-[#233420] hover:text-[#E4E8D8]"
          style={{ fontFamily: "'Lora', serif" }}
        >
          <Settings className="h-4.5 w-4.5 shrink-0" strokeWidth={1.75} />
          Cài đặt
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop: cố định bên trái */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0">
        <div className="fixed inset-y-0 left-0 w-64">{content}</div>
      </aside>

      {/* Mobile: drawer trượt ra + backdrop */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />
          <div className="absolute inset-y-0 left-0 w-64 shadow-xl">{content}</div>
        </div>
      )}
    </>
  );
}

/* ========================= Navbar ========================= */

export function Navbar({ onMenuClick, farmName, userName, userRole }) {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#E1E5CB] bg-[#FFFDF6]/95 px-4 backdrop-blur sm:px-6 lg:pl-8">
      <button
        onClick={onMenuClick}
        className="text-[#33361F] lg:hidden"
        aria-label="Mở menu điều hướng"
      >
        <Menu className="h-5.5 w-5.5" strokeWidth={1.75} />
      </button>

      <div className="hidden min-w-0 flex-col leading-tight sm:flex">
        <span className="truncate text-[13.5px] text-[#20281B]" style={{ fontFamily: "'Lora', serif", fontWeight: 500 }}>
          {farmName}
        </span>
        <span className="text-[11px] text-[#8B9070]">Nông trại</span>
      </div>

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="relative hidden sm:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B9070]" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Tìm thửa, mùa vụ, hoạt động..."
            className="h-9 w-56 rounded-md border border-[#DCE0C4] bg-white pl-9 pr-3 text-[13px] text-[#262A1E] placeholder:text-[#A8AC86] outline-none transition focus-visible:border-[#C9A227] focus-visible:ring-2 focus-visible:ring-[#C9A227]/30"
            style={{ fontFamily: "'Lora', serif" }}
          />
        </div>

        <button className="relative flex h-9 w-9 items-center justify-center rounded-md text-[#52502E] transition hover:bg-[#ECEEDA]" aria-label="Thông báo">
          <Bell className="h-4.5 w-4.5" strokeWidth={1.75} />
          <span className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-[#C15A34]" />
        </button>

        <div className="relative">
          <button
            onClick={() => setUserMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-md py-1 pl-1 pr-2 transition hover:bg-[#ECEEDA]"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1C2B1E] text-[12px] font-medium text-[#F6EFDD]">
              {userName?.slice(0, 1) || "N"}
            </div>
            <div className="hidden text-left leading-tight sm:block">
              <p className="text-[12.5px] text-[#20281B]" style={{ fontFamily: "'Lora', serif" }}>{userName}</p>
              <p className="text-[10.5px] text-[#8B9070]">{userRole}</p>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-[#8B9070]" strokeWidth={1.75} />
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-44 rounded-lg border border-[#E1E5CB] bg-[#FFFDF6] py-1.5 shadow-md">
              <button className="block w-full px-3.5 py-2 text-left text-[13px] text-[#33361F] hover:bg-[#ECEEDA]" style={{ fontFamily: "'Lora', serif" }}>
                Hồ sơ của tôi
              </button>
              <button className="block w-full px-3.5 py-2 text-left text-[13px] text-[#33361F] hover:bg-[#ECEEDA]" style={{ fontFamily: "'Lora', serif" }}>
                Đổi nông trại
              </button>
              <div className="my-1 h-px bg-[#E1E5CB]" />
              <button className="block w-full px-3.5 py-2 text-left text-[13px] text-[#9C4B2E] hover:bg-[#F6E2DC]" style={{ fontFamily: "'Lora', serif" }}>
                Đăng xuất
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ========================= Breadcrumb ========================= */

export function Breadcrumb({ items = [] }) {
  return (
    <nav aria-label="breadcrumb" className="mb-3 flex items-center gap-1.5 text-[12.5px]">
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {item.href && !isLast ? (
              <a href={item.href} className="text-[#8B9070] transition hover:text-[#20281B]" style={{ fontFamily: "'Lora', serif" }}>
                {item.label}
              </a>
            ) : (
              <span
                className={isLast ? "text-[#20281B]" : "text-[#8B9070]"}
                style={{ fontFamily: "'Lora', serif", fontWeight: isLast ? 500 : 400 }}
                aria-current={isLast ? "page" : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast && <ChevronRight className="h-3.5 w-3.5 text-[#C4C9AC]" strokeWidth={2} />}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

/* ========================= PageHeader ========================= */

export function PageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-[22px] text-[#20281B] sm:text-[24px]" style={{ fontFamily: "'Lora', serif", fontWeight: 500 }}>
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-[13px] text-[#7C7A4E]" style={{ fontFamily: "'Lora', serif" }}>
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

/* ========================= Container ========================= */

export function Container({ children, className = "" }) {
  return <div className={"mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-6 lg:px-8 " + className}>{children}</div>;
}

/* ========================= Demo tổng hợp ========================= */

export default function LayoutDemo() {
  const [active, setActive] = useState("seasons");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-[#F7F2DF]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&family=IBM+Plex+Mono:wght@500&display=swap');
      `}</style>

      <Sidebar active={active} onNavigate={setActive} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-64">
        <Navbar onMenuClick={() => setSidebarOpen(true)} farmName="Nông trại Ba Xuân" userName="Ông Ba" userRole="Chủ nông trại" />

        <Container>
          <Breadcrumb items={[{ label: "Tổng quan", href: "#" }, { label: "Mùa vụ" }]} />

          <PageHeader
            title="Mùa vụ"
            description="Theo dõi các thửa đang canh tác và tiến độ từng vụ."
            actions={
              <button className="flex h-10 items-center gap-2 rounded-md bg-[#1C2B1E] px-4 text-[13.5px] font-medium text-[#F6EFDD] shadow-sm transition hover:bg-[#243A28]">
                <Plus className="h-4 w-4" strokeWidth={2} />
                Thêm mùa vụ
              </button>
            }
          />

          {/* Khung nội dung mẫu — nơi các trang thực tế (dashboard, danh sách...) sẽ render vào đây */}
          <div className="rounded-2xl border border-dashed border-[#DCE0C4] bg-[#FFFDF6]/60 p-10 text-center">
            <p className="text-[13px] text-[#8B9070]" style={{ fontFamily: "'Lora', serif" }}>
              Nội dung trang render tại đây, bên trong Container.
            </p>
          </div>
        </Container>
      </div>
    </div>
  );
}
