import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: SelectOption[];
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    { className, label, error, options = [], children, id, ...props },
    ref,
  ) => {
    return (
      <div className="w-full">
        {label && (
          <Label
            htmlFor={id}
            className="mb-1.5 block text-[13px] font-medium text-[#3A3527]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            {label}
          </Label>
        )}
        <select
          id={id}
          className={cn(
            'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-[13.5px] text-[#262A1E] shadow-sm outline-none transition disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-[#C15A34] focus-visible:ring-2 focus-visible:ring-[#C15A34]/30'
              : 'border-[#DCE0C4] focus-visible:border-[#C9A227] focus-visible:ring-2 focus-visible:ring-[#C9A227]/30',
            className,
          )}
          style={{ fontFamily: "'Lora', serif" }}
          ref={ref}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
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
Select.displayName = 'Select';

export { Select };
