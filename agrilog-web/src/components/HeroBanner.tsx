import React from 'react';
import {
  Award,
  CheckCircle2,
  Globe,
  Leaf,
  MapPin,
  QrCode,
  ShieldCheck,
  Sparkles,
  Sprout,
} from 'lucide-react';
import { motion } from 'motion/react';

/**
 * Banner thương hiệu cột trái chuẩn Editorial "Nhật Ký Vườn Bưởi" (dang-nhap.html format)
 * Hiển thị full-height 100vh trên máy tính (>= lg) như .panel-brand trong mẫu dang-nhap.html
 */
export const HeroBanner: React.FC = () => {
  return (
    <div className="hidden lg:flex flex-col justify-between p-10 xl:p-14 bg-gradient-to-br from-[#1F3A2E] via-[#264839] to-[#162920] text-[#F5F2E8] relative overflow-hidden border-r border-[#8FAE94]/20 min-h-screen w-full">
      {/* Orchard Pattern Dots Background */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #D9A441 2px, transparent 2.2px), radial-gradient(circle, #D9A441 2px, transparent 2.2px)`,
          backgroundSize: '48px 48px',
          backgroundPosition: '0 0, 24px 24px',
        }}
      />

      {/* Subtle light glow overlay */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#D9A441]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Brand Top: Mark + Eyebrow */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-[#D9A441] flex items-center justify-center text-[#D9A441] shadow-md bg-[#1F3A2E]/80">
            <Sprout className="w-5 h-5" />
          </div>
          <span className="text-xs uppercase tracking-[0.16em] text-[#8FAE94] font-semibold">
            Hệ thống truy xuất nguồn gốc
          </span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-bold text-blue-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>GlobalGAP #VN-2026</span>
        </div>
      </div>

      {/* Brand Mid: Editorial Heading + Quote + Market Tags */}
      <div className="relative z-10 my-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight leading-[1.12] text-[#F5F2E8] font-serif">
            Nhật Ký <br />
            <span className="bg-gradient-to-r from-[#D9A441] via-[#F5F2E8] to-[#8FAE94] bg-clip-text text-transparent">
              Vườn Bưởi
            </span>
          </h1>
          <p className="text-base text-[#8FAE94] max-w-md mt-4 leading-relaxed font-normal">
            Ghi lại từng ngày chăm sóc, minh bạch từ gốc cây đến tay người nhận — đúng chuẩn xuất khẩu quốc tế.
          </p>
        </motion.div>

        {/* Export Markets Badges (US, EU, CN, KR) */}
        <div className="flex items-center gap-2 pt-1 flex-wrap">
          <span className="text-xs uppercase tracking-wider text-[#8FAE94] font-semibold mr-1">
            Thị trường:
          </span>
          {['US', 'EU', 'CN', 'KR', 'JP'].map((market) => (
            <span
              key={market}
              className="font-mono text-xs tracking-wider px-3 py-1 rounded-full border border-[#F5F2E8]/25 bg-white/5 text-[#F5F2E8] font-semibold shadow-sm"
            >
              {market}
            </span>
          ))}
        </div>

        {/* Checkpoints */}
        <div className="grid grid-cols-2 gap-3 pt-4 border-t border-[#8FAE94]/20">
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-[#D9A441] font-bold text-xs mb-1">
              <MapPin className="w-4 h-4" />
              <span>Mã Vùng Trồng GPS</span>
            </div>
            <p className="text-[11px] text-[#8FAE94]">
              Định danh tọa độ từng lô bưởi canh tác chuẩn GlobalGAP.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2 text-blue-300 font-bold text-xs mb-1">
              <QrCode className="w-4 h-4" />
              <span>QR Truy Xuất Lô</span>
            </div>
            <p className="text-[11px] text-blue-100/75">
              Minh bạch bón phân, thu hoạch cho đối tác nhập khẩu.
            </p>
          </div>
        </div>
      </div>

      {/* Brand Bottom: Quote + Rotating Stamp SVG */}
      <div className="relative z-10 pt-6 border-t border-[#8FAE94]/20 flex items-center justify-between gap-4">
        <p className="text-xs text-[#8FAE94] leading-relaxed max-w-[24ch]">
          Mỗi lô hàng mang một <strong className="text-[#F5F2E8] font-semibold">mã vùng trồng</strong> — quét là thấy cả một mùa vụ.
        </p>

        {/* Circular Stamp SVG */}
        <div className="relative w-28 h-28 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 128 128" aria-hidden="true">
            <defs>
              <path
                id="orbitPath"
                d="M64,64 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
              />
            </defs>
            <motion.circle
              cx="64"
              cy="64"
              r="58"
              fill="none"
              stroke="#D9A441"
              strokeWidth="1.2"
              strokeDasharray="4 3"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
              style={{ originX: '64px', originY: '64px' }}
            />
            <circle
              cx="64"
              cy="64"
              r="46"
              fill="none"
              stroke="#8FAE94"
              strokeWidth="1"
              opacity="0.5"
            />
            <circle
              cx="64"
              cy="64"
              r="34"
              fill="none"
              stroke="#F5F2E8"
              strokeWidth="1"
              opacity="0.3"
            />
            <text className="fill-[#8FAE94] text-[8.5px] font-mono tracking-widest uppercase font-semibold">
              <textPath href="#orbitPath" startOffset="0%">
                MÃ VÙNG TRỒNG · TRUY XUẤT NGUỒN GỐC ·
              </textPath>
            </text>
            <text
              x="64"
              y="61"
              textAnchor="middle"
              className="fill-[#F5F2E8] font-mono text-sm font-bold tracking-wider"
            >
              VN·BT
            </text>
            <text
              x="64"
              y="75"
              textAnchor="middle"
              className="fill-[#D9A441] font-mono text-[10px] font-semibold tracking-widest"
            >
              VỤ 2026
            </text>
          </svg>
        </div>
      </div>
    </div>
  );
};

/**
 * Mobile Hero Banner thu gọn siêu tối ưu cho di động (< lg)
 * Thanh header ngang mật độ cao (height ~64px), giải phóng tối đa chiều cao màn hình cho form
 */
export const MobileHeroBanner: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="lg:hidden w-full py-3 px-4 sm:px-6 bg-[#1F3A2E] text-[#F5F2E8] relative overflow-hidden border-b border-[#8FAE94]/25 shadow-sm"
    >
      {/* Background dot pattern */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #D9A441 2px, transparent 2.2px)`,
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative z-10 flex items-center justify-between gap-3 max-w-xl mx-auto">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-full border border-[#D9A441] flex items-center justify-center text-[#D9A441] bg-[#1F3A2E] flex-shrink-0">
            <Sprout className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-[#F5F2E8] font-serif truncate leading-tight">
              Nhật Ký{' '}
              <span className="bg-gradient-to-r from-[#D9A441] to-[#8FAE94] bg-clip-text text-transparent">
                Vườn Bưởi
              </span>
            </h2>
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-[#8FAE94] font-medium truncate">
              <ShieldCheck className="w-3 h-3 text-blue-400 flex-shrink-0" />
              <span>Chuỗi xuất khẩu GlobalGAP #VN-2026</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className="font-mono text-[10px] px-2 py-1 rounded-lg border border-[#D9A441]/40 bg-[#D9A441]/10 text-[#D9A441] font-bold">
            VN·BT
          </span>
          <span className="hidden xs:inline-block font-mono text-[10px] px-2 py-1 rounded-lg border border-[#F5F2E8]/20 bg-white/5 text-[#F5F2E8] font-semibold">
            US•EU•CN
          </span>
        </div>
      </div>
    </motion.div>
  );
};
