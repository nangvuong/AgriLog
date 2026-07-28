import React from 'react';
import {
  CheckCircle2,
  Globe,
  MapPin,
  QrCode,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

export const HeroBanner: React.FC = () => {
  return (
    <div className="hidden lg:flex flex-col justify-between p-8 xl:p-12 bg-gradient-to-br from-green-900 via-green-800 to-blue-900 rounded-3xl text-white relative overflow-hidden shadow-2xl border border-white/10">
      {/* Background artwork */}
      <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay">
        <img
          src="/hero.png"
          alt="Bưởi da xanh xuất khẩu AgriLog"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Subtle light glow overlay */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -z-1" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-green-500/25 rounded-full blur-3xl -z-1" />

      {/* Top badges */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-semibold">
          <Globe className="w-4 h-4 text-green-300" />
          <span>Tiêu chuẩn Xuất khẩu Quốc tế</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/30 backdrop-blur-md border border-blue-400/40 text-xs font-bold text-blue-200">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>GlobalGAP #VN-2026</span>
        </div>
      </div>

      {/* Main copy */}
      <div className="relative z-10 my-10 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="text-xs uppercase tracking-widest font-extrabold text-green-300">
            Hệ thống Quản lý Vườn & Truy xuất Nguồn gốc
          </span>
          <h1 className="text-4xl xl:text-5xl font-black tracking-tight leading-tight mt-2 text-white">
            Nhật Ký Điện Tử <br />
            <span className="bg-gradient-to-r from-green-300 via-white to-blue-300 bg-clip-text text-transparent">
              Bưởi Xuất Khẩu
            </span>
          </h1>
          <p className="text-base text-green-100/90 max-w-md mt-4 leading-relaxed">
            Kết nối trọn vẹn chuỗi giá trị từ Nông dân trồng bưởi, Hợp tác xã, Kỹ thuật viên đến Doanh nghiệp xuất khẩu và Kiểm định chất lượng.
          </p>
        </motion.div>

        {/* Feature Checkpoints */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="flex items-center gap-2 text-green-300 font-bold text-sm mb-1">
              <MapPin className="w-4 h-4" />
              <span>Vị trí GPS Vườn trồng</span>
            </div>
            <p className="text-xs text-green-100/80">
              Ghi nhận tọa độ lô canh tác và dữ liệu thổ nhưỡng thực tế.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <div className="flex items-center gap-2 text-blue-300 font-bold text-sm mb-1">
              <QrCode className="w-4 h-4" />
              <span>Mã QR Truy xuất lô</span>
            </div>
            <p className="text-xs text-blue-100/80">
              Mã hóa lịch sử chăm sóc, bón phân, thu hoạch cho thị trường EU, Mỹ.
            </p>
          </div>
        </div>
      </div>

      {/* Footer endpoint info card */}
      <div className="relative z-10 p-4 rounded-2xl bg-black/30 backdrop-blur-lg border border-white/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green-500/20 border border-green-400/30 flex items-center justify-center text-green-300">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-white">
              Tích hợp 4 Endpoints Authentication
            </p>
            <p className="text-[11px] text-green-200/75">
              POST /register • POST /login • GET /me • POST /change-password
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-bold text-green-300 bg-green-950/50 px-3 py-1.5 rounded-xl border border-green-700/50">
          <CheckCircle2 className="w-3.5 h-3.5" />
          JWT Bearer
        </span>
      </div>
    </div>
  );
};
