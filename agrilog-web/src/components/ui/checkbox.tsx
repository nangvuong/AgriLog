import * as React from 'react';
import { cn } from '@/lib/utils';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  children?: React.ReactNode;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, id, checked, onCheckedChange, children, ...props }, ref) => {
    return (
      <label
        htmlFor={id}
        className={cn(
          'flex cursor-pointer select-none items-center gap-2 text-[13px] text-[#52502E]',
          className,
        )}
        style={{ fontFamily: "'Lora', serif" }}
      >
        <span className="relative flex h-4 w-4 items-center justify-center">
          <input
            id={id}
            ref={ref}
            type="checkbox"
            checked={checked}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            className="peer absolute h-4 w-4 cursor-pointer appearance-none rounded-[4px] border border-[#BFC49E] bg-white transition checked:border-[#1C2B1E] checked:bg-[#1C2B1E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C9A227]"
            {...props}
          />
          <svg
            className="pointer-events-none absolute h-2.5 w-2.5 scale-0 text-[#F6EFDD] transition peer-checked:scale-100"
            viewBox="0 0 12 12"
            fill="none"
          >
            <path
              d="M2 6.2L4.7 9L10 3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        {children}
      </label>
    );
  },
);
Checkbox.displayName = 'Checkbox';

export { Checkbox };
