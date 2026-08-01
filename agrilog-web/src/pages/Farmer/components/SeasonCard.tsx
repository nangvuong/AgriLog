import React from 'react';
import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { type FarmerSeasonDto } from 'agrilog-shared';

interface SeasonCardProps {
  season: FarmerSeasonDto;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

/**
 * SeasonCard - Thẻ Vụ mùa canh tác theo chuẩn trang-chu-nong-dan.html
 * Gồm SVG Progress Ring 52x52, Thông tin Lô bưởi, Pills trạng thái và nút xem chi tiết.
 */
export const SeasonCard: React.FC<SeasonCardProps> = ({
  season,
  isSelected,
  onSelect,
}) => {
  const percent = Math.min(100, Math.max(0, season.tien_do_phan_tram || 0));
  const radius = 21;
  const circumference = 2 * Math.PI * radius; // ~131.95
  const strokeDashoffset = circumference - (percent / 100) * circumference;

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -2 }}
      onClick={() => onSelect(season.id)}
      className={`season-card display-flex gap-[14px] items-center bg-white border border-[#E4DCC8] rounded-[14px] p-3.5 mb-3 transition-all cursor-pointer shadow-sm hover:shadow-md ${
        isSelected ? 'ring-2 ring-[#1F3A2E] bg-[#FBF8F1]' : ''
      }`}
    >
      {/* SVG Ring Wrap */}
      <div className="relative shrink-0 w-[52px] h-[52px] flex items-center justify-center">
        <svg className="w-[52px] h-[52px] -rotate-90" viewBox="0 0 52 52">
          <circle
            cx="26"
            cy="26"
            r={radius}
            className="fill-none stroke-[#E4DCC8] stroke-[4]"
          />
          <circle
            cx="26"
            cy="26"
            r={radius}
            className="fill-none stroke-[#D9A441] stroke-[4] stroke-linecap-round transition-all duration-700"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center font-mono text-[10.5px] font-medium text-[#23301F]">
          {percent}%
        </span>
      </div>

      {/* Season Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14.5px] text-[#23301F] m-0 leading-snug truncate">
          {season.ten_lo}
        </p>
        <p className="text-[12.5px] text-[#5C6B57] m-0 mt-0.5 font-mono">
          {season.meta}
        </p>

        {/* Status Pills */}
        <div className="flex gap-1.5 mt-2 flex-wrap items-center">
          {season.is_urgent && (
            <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-full bg-[#F5E3DE] text-[#B84C3C] font-semibold">
              {season.trang_thai_tag}
            </span>
          )}
          {!season.is_urgent && (
            <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-full bg-[#EFE9D8] text-[#5C6B57] font-medium">
              {season.trang_thai_tag}
            </span>
          )}
          <span className="font-mono text-[10.5px] px-2 py-0.5 rounded-full bg-[#EFE9D8] text-[#5C6B57] font-medium">
            {season.so_cay} cây
          </span>
        </div>
      </div>

      {/* Go Button */}
      <button
        type="button"
        aria-label="Xem vụ mùa"
        className="shrink-0 w-[34px] h-[34px] rounded-full border border-[#E4DCC8] bg-[#FBF8F1] flex items-center justify-center hover:bg-[#EFE9D8] transition-colors cursor-pointer"
      >
        <ChevronRight className="w-4 h-4 stroke-[#345645]" />
      </button>
    </motion.div>
  );
};
