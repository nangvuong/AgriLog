import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  BarChart3,
  CloudSun,
  Droplets,
  Plus,
  ShieldAlert,
  Sparkles,
  Sun,
  Thermometer,
  TreeDeciduous,
} from 'lucide-react';
import {
  LoaiHoatDongCanhTac,
  QuickLogChannel,
  type FarmerDashboardResponse,
  type FarmerRecentActivityDto,
  type UserProfile,
} from 'agrilog-shared';
import {
  createQuickFarmingLogApi,
  getFarmerDashboardSummaryApi,
} from '../../services/api';
import {
  AlertsCard,
  FarmerBottomNav,
  FarmerHeader,
  QuickLogBottomSheet,
  QuickLogForm,
  RecentActivitiesSection,
  SeasonsSection,
} from './components';

interface FarmerHomePageProps {
  user: UserProfile | null;
  token: string;
  onNavigate: (
    tab: 'farmer-home' | 'login' | 'register' | 'profile' | 'change-password',
  ) => void;
  onShowToast: (msg: string) => void;
}

/**
 * FarmerHomePage - Trang chủ Nông dân với giao diện Full-Width trên Desktop & App Shell trên Mobile
 * - Desktop (lg trở lên): Layout 2 cột Full-Width rộng rãi, Thống kê nông vụ, Khuyến cáo thời tiết & Form/Modal Ghi nhật ký nhanh
 * - Bottom Nav: Có hiệu ứng Active Tab pill indicator, bấm "Trang chủ" lập tức điều hướng về trang Nông dân (/farmer-home)
 */
export const FarmerHomePage: React.FC<FarmerHomePageProps> = ({
  user,
  token,
  onNavigate,
  onShowToast,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<FarmerDashboardResponse | null>(null);

  // Bottom Sheet / Modal Dialog State
  const [isSheetOpen, setIsSheetOpen] = useState<boolean>(false);

  // Form Ghi Nhật Ký Nhanh State
  const [selectedSeasonId, setSelectedSeasonId] = useState<number>(1);
  const [selectedActivity, setSelectedActivity] = useState<string>(
    LoaiHoatDongCanhTac.PHUN_THUOC,
  );
  const [activeChannel, setActiveChannel] = useState<
    QuickLogChannel | 'mic' | 'cam' | 'text'
  >(QuickLogChannel.MIC);
  const [noteText, setNoteText] = useState<string>('');
  const [supplyName, setSupplyName] = useState<string>('');
  const [supplyAmount, setSupplyAmount] = useState<string>('');
  const [isRecordingMic, setIsRecordingMic] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    async function loadDashboard() {
      setLoading(true);
      try {
        const res = await getFarmerDashboardSummaryApi(token);
        if (isMounted) {
          setData(res);
          if (res.seasons && res.seasons.length > 0) {
            setSelectedSeasonId(res.seasons[0].id);
          }
        }
      } catch {
        // Fallback handled in API service
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSimulateMic = () => {
    setIsRecordingMic(true);
    onShowToast('Đang nhận diện giọng nói... (nhấn giữ & nói)');
    setTimeout(() => {
      setNoteText('Phun thuốc Regent 50ml cho lô A2');
      setSupplyName('Regent 800WG');
      setSupplyAmount('50 ml');
      setIsRecordingMic(false);
      onShowToast('Đã nhận diện: "Phun thuốc Regent 50ml cho lô A2"');
    }, 1800);
  };

  const handleSimulateCam = () => {
    onShowToast('Đang quét nhãn chai vật tư & ảnh minh chứng...');
    setTimeout(() => {
      setSupplyName('Phân bón lá NPK 20-20-20');
      setSupplyAmount('150 g');
      setNoteText('Bón phân lá cho bưởi giai đoạn phát triển quả');
      onShowToast('Đã nhận diện tự động nhãn phân bón NPK!');
    }, 1200);
  };

  const handleSaveQuickLog = async (payload?: {
    hoat_dong_list?: Array<{
      loai_hoat_dong: string;
      vat_tu_list: Array<{ ten_vat_tu: string; lieu_luong: string }>;
    }>;
    danh_sach_hoat_dong?: string[];
    danh_sach_vat_tu?: Array<{ ten_vat_tu: string; lieu_luong: string }>;
  }) => {
    setSubmitting(true);
    try {
      const hoatDongList = payload?.hoat_dong_list || [
        {
          loai_hoat_dong: selectedActivity,
          vat_tu_list: [{ ten_vat_tu: supplyName, lieu_luong: supplyAmount }],
        },
      ];

      const actList = hoatDongList.map((h) => h.loai_hoat_dong);
      const firstAct = actList[0] || selectedActivity;

      const res = await createQuickFarmingLogApi(token, {
        vu_mua_id: selectedSeasonId,
        loai_hoat_dong: firstAct,
        hoat_dong_list: hoatDongList,
        ngay_thuc_hien: new Date().toISOString().slice(0, 10),
        mo_ta:
          noteText ||
          `Ghi nhật ký: ${hoatDongList
            .map(
              (h) =>
                `${h.loai_hoat_dong}${
                  h.vat_tu_list.length > 0
                    ? `: ${h.vat_tu_list.map((v) => `${v.ten_vat_tu} (${v.lieu_luong})`).join(', ')}`
                    : ''
                }`,
            )
            .join(' | ')}`,
        hinh_anh: [],
      });

      if (data) {
        const loaiMap: Record<string, string> = {
          bon_phan: 'Bón phân',
          phun_thuoc: 'Phun thuốc',
          tuoi_nuoc: 'Tưới nước',
          tia_canh: 'Tỉa cành',
          lam_co: 'Làm cỏ',
          be_qua: 'Bẻ quả',
          sau_benh: 'Khảo sát sâu bệnh',
          khac: 'Hoạt động nông vụ',
        };
        const selectedSeason = data.seasons.find(
          (s) => s.id === selectedSeasonId,
        );
        const plotName = selectedSeason
          ? selectedSeason.ten_lo.split('·')[0].trim()
          : 'Lô A2';
        const titleStr = actList.map((a) => loaiMap[a] || a).join(' & ');
        const newAct: FarmerRecentActivityDto = {
          id: res.log_id || Date.now(),
          title: `${titleStr} — ${plotName}`,
          time_ago: 'Hôm nay, vừa xong',
          icon_type: firstAct,
          loai_hoat_dong: firstAct,
          ngay_thuc_hien: new Date().toISOString().slice(0, 10),
        };
        setData({
          ...data,
          recent_activities: [newAct, ...data.recent_activities],
        });
      }

      onShowToast(res.message);
      setIsSheetOpen(false);
      setNoteText('');
      setSupplyName('');
      setSupplyAmount('');
    } catch {
      onShowToast('Có lỗi khi lưu nhật ký, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const quickLogFormProps = {
    seasons: data?.seasons || [],
    selectedSeasonId,
    setSelectedSeasonId,
    selectedActivity,
    setSelectedActivity,
    activeChannel,
    setActiveChannel,
    noteText,
    setNoteText,
    supplyName,
    setSupplyName,
    supplyAmount,
    setSupplyAmount,
    isRecordingMic,
    submitting,
    handleSimulateMic,
    handleSimulateCam,
    handleSaveQuickLog,
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-[#EFE9D8] flex items-center justify-center p-4">
        <div className="w-full max-w-[480px] bg-[#FBF8F1] min-h-[400px] rounded-[28px] p-8 flex flex-col items-center justify-center text-center shadow-xl border border-[#E4DCC8]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            className="w-12 h-12 rounded-full bg-[#1F3A2E] text-[#F5F2E8] flex items-center justify-center mb-4 shadow-md"
          >
            <Sun className="w-6 h-6 stroke-[#D9A441]" />
          </motion.div>
          <h2 className="font-serif text-xl font-semibold text-[#1F3A2E]">
            Đang tải Trang chủ Nông dân...
          </h2>
          <p className="text-xs text-[#5C6B57] font-mono mt-1">
            Đồng bộ chuẩn GlobalGAP #VN-2026
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F1] text-[#23301F] font-sans pb-24 lg:pb-12">
      {/* 1. TOP HEADER BANNER (Full Width trên Desktop) */}
      <FarmerHeader
        user={user}
        data={data}
        onNavigate={onNavigate}
        onShowToast={onShowToast}
      />

      {/* 2. ALERTS OVERLAP (Chỉ trên Mobile < lg) */}
      <div className="lg:hidden">
        <AlertsCard alerts={data.alerts} onShowToast={onShowToast} />
      </div>

      {/* 3. MAIN FULL-WIDTH RESPONSIVE DASHBOARD LAYOUT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Main Column (8 cols on Desktop): Vụ Mùa 2 cột & Lịch sử Hoạt động */}
          <div className="lg:col-span-8 space-y-8">
            {/* Desktop Overview Metric Cards Bar */}
            <div className="hidden lg:grid grid-cols-3 gap-4">
              <div className="bg-white/90 backdrop-blur-xl border border-[#E4DCC8] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#F7EDD6] text-[#B9862F] flex items-center justify-center shrink-0">
                  <TreeDeciduous className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#5C6B57] font-mono">Quy mô vùng trồng</p>
                  <p className="font-serif font-bold text-lg text-[#1F3A2E]">
                    270 gốc · 2.5 Ha
                  </p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-xl border border-[#E4DCC8] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#EBF3ED] text-[#1F3A2E] flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-[#D9A441]" />
                </div>
                <div>
                  <p className="text-xs text-[#5C6B57] font-mono">Xác thực chứng nhận</p>
                  <p className="font-serif font-bold text-lg text-[#1F3A2E]">
                    GlobalGAP #VN
                  </p>
                </div>
              </div>

              <div className="bg-white/90 backdrop-blur-xl border border-[#E4DCC8] rounded-2xl p-4 flex items-center gap-3.5 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-[#F5E3DE] text-[#B84C3C] flex items-center justify-center shrink-0">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-[#5C6B57] font-mono">Sản lượng dự kiến</p>
                  <p className="font-serif font-bold text-lg text-[#1F3A2E]">
                    12.5 Tấn / Vụ
                  </p>
                </div>
              </div>
            </div>

            {/* Seasons Grid Section */}
            <SeasonsSection
              seasons={data.seasons}
              selectedSeasonId={selectedSeasonId}
              onSelectSeason={setSelectedSeasonId}
              onShowToast={onShowToast}
            />

            {/* Recent Activity Timeline Section */}
            <RecentActivitiesSection
              activities={data.recent_activities}
              onNavigate={onNavigate}
              onShowToast={onShowToast}
            />
          </div>

          {/* Right Sidebar Column (4 cols on Desktop): Form Ghi Nhật Ký, Thời Tiết & Cảnh Báo */}
          <div className="hidden lg:block lg:col-span-4 space-y-6">
            {/* Embedded Desktop Quick Log Widget */}
            <div className="bg-white border border-[#E4DCC8] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-[#E4DCC8]">
                <div className="w-10 h-10 rounded-2xl bg-[#1F3A2E] text-[#F5F2E8] flex items-center justify-center shadow-md">
                  <Sparkles className="w-5 h-5 text-[#D9A441]" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#1F3A2E]">
                    Ghi nhật ký nhanh
                  </h3>
                  <p className="text-xs text-[#5C6B57] font-mono">
                    Chuẩn GlobalGAP #VN-2026
                  </p>
                </div>
              </div>

              <QuickLogForm {...quickLogFormProps} />
            </div>

            {/* Weather & Farming Advisory Widget */}
            <div className="bg-white border border-[#E4DCC8] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E4DCC8]">
                <div className="flex items-center gap-2">
                  <CloudSun className="w-5 h-5 text-[#D9A441]" />
                  <h3 className="font-serif font-bold text-base text-[#1F3A2E]">
                    Khuyến cáo Nông vụ
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Thời tiết tốt
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3.5 rounded-2xl bg-[#FBF8F1] border border-[#E4DCC8]">
                  <Thermometer className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                  <p className="text-xs text-[#5C6B57]">Nhiệt độ vùng</p>
                  <p className="font-serif font-bold text-base text-[#1F3A2E]">
                    31°C
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#FBF8F1] border border-[#E4DCC8]">
                  <Droplets className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                  <p className="text-xs text-[#5C6B57]">Độ ẩm đất</p>
                  <p className="font-serif font-bold text-base text-[#1F3A2E]">
                    78%
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EBF3ED] border border-[#1F3A2E]/20 text-xs text-[#1F3A2E] leading-relaxed">
                <strong>Khuyến nghị GlobalGAP:</strong> Thời tiết nắng nhẹ,
                thích hợp để tiến hành tỉa cành tạo tán và kiểm tra sâu vẽ bùa
                cho bưởi giai đoạn ra lộc non.
              </div>
            </div>

            {/* GlobalGAP Alerts Widget */}
            <div className="bg-white border border-[#E4DCC8] rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-[#E4DCC8]">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="font-serif font-bold text-base text-[#1F3A2E]">
                  Cảnh báo Dịch hại & Cách ly
                </h3>
              </div>
              <AlertsCard alerts={data.alerts} onShowToast={onShowToast} />
            </div>
          </div>
        </div>
      </main>

      {/* 4. DESKTOP FLOATING ACTION BUTTON - FAB */}
      <motion.button
        type="button"
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsSheetOpen(true)}
        className="fixed bottom-8 right-8 z-40 hidden lg:flex items-center gap-3 px-6 py-4 rounded-3xl bg-gradient-to-r from-[#1F3A2E] via-[#1D362B] to-[#14261E] text-[#F5F2E8] shadow-2xl border-2 border-[#D9A441] hover:shadow-[#1F3A2E]/40 transition-all cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-2xl bg-[#D9A441] text-[#1F3A2E] flex items-center justify-center font-bold shadow-md group-hover:rotate-12 transition-transform">
          <Plus className="w-5 h-5" />
        </div>
        <div className="text-left">
          <span className="block text-[11px] font-mono uppercase tracking-wider text-[#D9A441] font-bold">
            GlobalGAP #VN-2026
          </span>
          <span className="block font-serif font-bold text-base text-white">
            Ghi nhật ký nhanh
          </span>
        </div>
      </motion.button>

      {/* 5. BOTTOM NAV BAR (Có Active Tab Pill & Điều hướng quay về Trang Nông Dân) */}
      <FarmerBottomNav
        activeTab="home"
        unreadAlertsCount={data.unread_alerts_count}
        onOpenQuickLog={() => setIsSheetOpen(true)}
        onNavigate={onNavigate}
        onShowToast={onShowToast}
      />

      {/* 6. QUICK LOG MODAL / BOTTOM SHEET */}
      <QuickLogBottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        {...quickLogFormProps}
      />
    </div>
  );
};
