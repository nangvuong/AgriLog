import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export function Breadcrumb({ items = [] }: BreadcrumbProps) {
  return (
    <nav
      aria-label="breadcrumb"
      className="mb-3 flex items-center gap-1.5 text-[12.5px]"
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1;
        return (
          <React.Fragment key={i}>
            {item.href && !isLast ? (
              <Link
                to={item.href}
                className="text-[#8B9070] transition hover:text-[#20281B]"
                style={{ fontFamily: "'Lora', serif" }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={isLast ? 'text-[#20281B]' : 'text-[#8B9070]'}
                style={{
                  fontFamily: "'Lora', serif",
                  fontWeight: isLast ? 500 : 400,
                }}
                aria-current={isLast ? 'page' : undefined}
              >
                {item.label}
              </span>
            )}
            {!isLast && (
              <ChevronRight
                className="h-3.5 w-3.5 text-[#C4C9AC]"
                strokeWidth={2}
              />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
