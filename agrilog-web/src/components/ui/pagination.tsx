import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

export function Pagination({
  page,
  totalPages,
  onChange,
  className = '',
}: PaginationProps) {
  const pages: (number | string)[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...');
    }
  }

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3',
        className,
      )}
    >
      <p
        className="text-[12px] text-[#8B9070]"
        style={{ fontFamily: "'Lora', serif" }}
      >
        Trang {page} / {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#52502E] transition hover:bg-[#ECEEDA] disabled:opacity-40"
          aria-label="Trang trước"
        >
          <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={'ellipsis-' + i}
              className="flex h-8 w-8 items-center justify-center text-[#B3AB92]"
            >
              <MoreHorizontal className="h-4 w-4" strokeWidth={1.75} />
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onChange(typeof p === 'number' ? p : page)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-md text-[12.5px] font-medium transition',
                p === page
                  ? 'bg-[#1C2B1E] text-[#F6EFDD]'
                  : 'text-[#52502E] hover:bg-[#ECEEDA]',
              )}
              style={{ fontFamily: "'IBM Plex Mono', monospace" }}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          onClick={() => onChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="flex h-8 w-8 items-center justify-center rounded-md text-[#52502E] transition hover:bg-[#ECEEDA] disabled:opacity-40"
          aria-label="Trang sau"
        >
          <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
}

export default Pagination;
