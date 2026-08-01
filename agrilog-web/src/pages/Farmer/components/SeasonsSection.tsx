import React from 'react';
import { type FarmerSeasonDto } from 'agrilog-shared';
import { SeasonCard } from './SeasonCard';

interface SeasonsSectionProps {
  seasons: FarmerSeasonDto[];
  selectedSeasonId: number;
  onSelectSeason: (id: number) => void;
  onShowToast: (msg: string) => void;
}

/**
 * SeasonsSection - Phần hiển thị danh sách vụ mùa đang canh tác theo trang-chu-nong-dan.html
 */
export const SeasonsSection: React.FC<SeasonsSectionProps> = ({
  seasons,
  selectedSeasonId,
  onSelectSeason,
  onShowToast,
}) => {
  return (
    <section className="px-5 pt-6 pb-1 max-w-5xl mx-auto">
      {/* Section Head */}
      <div className="flex items-baseline justify-between mb-3.5">
        <h2 className="font-serif font-semibold text-[18px] text-[#23301F] m-0">
          Vụ mùa đang canh tác
        </h2>
        <button
          type="button"
          onClick={() => onShowToast('Xem toàn bộ danh sách vụ mùa')}
          className="text-[12.5px] text-[#5C6B57] hover:text-[#1F3A2E] hover:underline font-medium bg-transparent border-0 p-0 cursor-pointer"
        >
          Xem tất cả
        </button>
      </div>

      {/* Season Cards List */}
      <div className="space-y-3">
        {seasons.map((s) => (
          <SeasonCard
            key={s.id}
            season={s}
            isSelected={selectedSeasonId === s.id}
            onSelect={onSelectSeason}
          />
        ))}
      </div>
    </section>
  );
};
