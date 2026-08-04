import * as React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  endAdornment?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, label, error, icon: Icon, endAdornment, id, ...props },
    ref,
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="mb-1.5 block text-[13px] font-medium text-[#3A3527]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            {label}
          </label>
        )}
        <div className="relative w-full">
          {Icon && (
            <Icon
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8B9070]"
              strokeWidth={1.75}
            />
          )}
          <input
            id={id}
            type={type}
            className={cn(
              'flex h-10 min-h-10 max-h-10 w-full appearance-none rounded-md border bg-white px-3 py-1.5 text-[14px] leading-normal text-[#262A1E] shadow-sm outline-none transition sm:text-[13.5px] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#A8AC86] disabled:cursor-not-allowed disabled:opacity-50 [type=date]:py-1 [type=datetime-local]:py-1 [type=time]:py-1',
              error
                ? 'border-[#C15A34] focus-visible:ring-2 focus-visible:ring-[#C15A34]/30'
                : 'border-[#DCE0C4] focus-visible:border-[#C9A227] focus-visible:ring-2 focus-visible:ring-[#C9A227]/30',
              Icon && 'pl-9',
              endAdornment && 'pr-10',
              className,
            )}
            style={{ fontFamily: "'Lora', serif" }}
            ref={ref}
            {...props}
          />
          {endAdornment}
        </div>
        {error && (
          <p
            className="mt-1 text-[12px] text-[#C15A34]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            {error}
          </p>
        )}
      </div>
    );
  },
);
Input.displayName = 'Input';

export { Input };
