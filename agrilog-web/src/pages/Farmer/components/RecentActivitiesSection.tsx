import React from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  Award,
  Bug,
  Calendar,
  Droplets,
  Leaf,
  Scissors,
  Sprout,
} from 'lucide-react';
import {
  LoaiHoatDongCanhTac,
  type FarmerRecentActivityDto,
} from 'agrilog-shared';

interface RecentActivitiesSectionProps {
  activities: FarmerRecentActivityDto[];
  onNavigate: (
    tab: 'login' | 'register' | 'profile' | 'change-password',
  ) => void;
  onShowToast: (msg: string) => void;
}

/**
 * RecentActivitiesSection - Hoạt động gần đây theo thiết kế từ trang-chu-nong-dan.html
 * Gồm biểu tượng tròn vàng nhạt (activity-icon #F7EDD6) và chữ tiêu đề/thời gian.
 */
export const RecentActivitiesSection: React.FC<
  RecentActivitiesSectionProps
> = ({ activities, onNavigate, onShowToast }) => {
  const getActivityIcon = (typeStr: string) => {
    switch (typeStr) {
      case 'phun_thuoc':
      case LoaiHoatDongCanhTac.PHUN_THUOC:
        return <Activity className="w-4 h-4 stroke-[#B9862F]" />;
      case 'bon_phan':
      case LoaiHoatDongCanhTac.BON_PHAN:
        return <Sprout className="w-4 h-4 stroke-[#B9862F]" />;
      case 'tuoi_nuoc':
      case LoaiHoatDongCanhTac.TUOI_NUOC:
        return <Droplets className="w-4 h-4 stroke-[#B9862F]" />;
      case 'tia_canh':
      case LoaiHoatDongCanhTac.TIA_CANH:
        return <Scissors className="w-4 h-4 stroke-[#B9862F]" />;
      case 'lam_co':
      case LoaiHoatDongCanhTac.LAM_CO:
        return <Leaf className="w-4 h-4 stroke-[#B9862F]" />;
      case 'be_qua':
      case LoaiHoatDongCanhTac.BE_QUA:
        return <Award className="w-4 h-4 stroke-[#B9862F]" />;
      case 'sau_benh':
      case LoaiHoatDongCanhTac.SAU_BENH:
        return <Bug className="w-4 h-4 stroke-[#B9862F]" />;
      default:
        return <Calendar className="w-4 h-4 stroke-[#B9862F]" />;
    }
  };

  return (
    <section className="px-5 pt-6 pb-4 max-w-5xl mx-auto">
      {/* Section Head */}
      <div className="flex items-baseline justify-between mb-3.5">
        <h2 className="font-serif font-semibold text-[18px] text-[#23301F] m-0">
          Hoạt động gần đây
        </h2>
        <button
          type="button"
          onClick={() => onNavigate('profile')}
          className="text-[12.5px] text-[#5C6B57] hover:text-[#1F3A2E] hover:underline font-medium bg-transparent border-0 p-0 cursor-pointer"
        >
          Lịch sử →
        </button>
      </div>

      {/* Activity List Container */}
      <div className="bg-white border border-[#E4DCC8] rounded-[14px] px-4 py-1 divide-y divide-[#E4DCC8] shadow-sm">
        {activities.map((act, index) => (
          <motion.div
            key={act.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
            onClick={() =>
              onShowToast(`Chi tiết nhật ký: "${act.title}" (${act.time_ago})`)
            }
            className="flex items-center gap-3 py-3 cursor-pointer hover:bg-[#FBF8F1]/80 px-1 transition-colors"
          >
            {/* Activity Icon Circle */}
            <div className="w-[34px] h-[34px] rounded-full bg-[#F7EDD6] flex items-center justify-center shrink-0">
              {getActivityIcon(act.icon_type)}
            </div>

            {/* Activity Text Info */}
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-medium text-[#23301F] m-0 truncate">
                {act.title}
              </p>
              <p className="text-[12px] text-[#5C6B57] m-0 mt-0.5 font-mono">
                {act.time_ago}
                {act.ngay_thuc_hien ? ` • ${act.ngay_thuc_hien}` : ''}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
