import React from 'react';
import { type FarmerAlertDto } from 'agrilog-shared';

interface AlertsCardProps {
  alerts: FarmerAlertDto[];
  onShowToast: (msg: string) => void;
}

/**
 * AlertsCard - Khối Thẻ Cảnh báo theo thiết kế từ trang-chu-nong-dan.html
 * Đè lên Header với âm margin (-mt-6), cuộn ngang snap-x mượt mà.
 */
export const AlertsCard: React.FC<AlertsCardProps> = ({
  alerts,
  onShowToast,
}) => {
  if (!alerts || alerts.length === 0) {
    return (
      <div className="-mt-6 relative z-20 px-5 max-w-5xl mx-auto">
        <div className="flex gap-3 overflow-x-auto snap-x pb-1.5 no-scrollbar">
          <div className="snap-start shrink-0 w-[250px] bg-[#F5F2E8] rounded-[14px] p-3.5 shadow-[0_1px_2px_rgba(35,48,31,0.05),0_10px_24px_-14px_rgba(35,48,31,0.28)] border-l-4 border-[#D9A441]">
            <div className="text-[10.5px] font-bold tracking-[0.06em] uppercase text-[#B9862F]">
              Thông báo
            </div>
            <p className="text-[13px] leading-[1.45] my-1.5 text-[#23301F]">
              Tất cả các lô bưởi hiện tại đều tuân thủ tốt quy trình GlobalGAP.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="-mt-6 relative z-20 px-5 max-w-5xl mx-auto">
      <div className="flex gap-3 overflow-x-auto snap-x pb-1.5 no-scrollbar">
        {alerts.map((alt) => {
          const isDanger = String(alt.level).toLowerCase() === 'danger';
          return (
            <div
              key={alt.id}
              className={`snap-start shrink-0 w-[250px] sm:w-[280px] bg-[#F5F2E8] rounded-[14px] p-[14px_15px] shadow-[0_1px_2px_rgba(35,48,31,0.05),0_10px_24px_-14px_rgba(35,48,31,0.28)] border-l-4 transition-all ${
                isDanger ? 'border-[#B84C3C]' : 'border-[#D9A441]'
              }`}
            >
              <div
                className={`text-[10.5px] font-bold tracking-[0.06em] uppercase ${
                  isDanger ? 'text-[#B84C3C]' : 'text-[#B9862F]'
                }`}
              >
                {alt.tag || (isDanger ? 'Cần chú ý' : 'Sắp tới')}
              </div>
              <p className="text-[13px] leading-[1.45] my-1.5 text-[#23301F]">
                {alt.message}
              </p>
              <button
                type="button"
                onClick={() =>
                  onShowToast(`Chi tiết cảnh báo #${alt.id}: ${alt.tag}`)
                }
                className="text-[12.5px] font-semibold text-[#345645] hover:text-[#1F3A2E] hover:underline cursor-pointer bg-transparent border-0 p-0"
              >
                Xem chi tiết →
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
