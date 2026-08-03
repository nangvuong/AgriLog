import * as React from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, rows = 4, ...props }, ref) => {
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
        <textarea
          id={id}
          rows={rows}
          className={cn(
            'w-full resize-none rounded-md border bg-white px-3 py-2.5 text-[13.5px] text-[#262A1E] shadow-sm outline-none transition placeholder:text-[#A8AC86] disabled:cursor-not-allowed disabled:opacity-50',
            error
              ? 'border-[#C15A34] focus-visible:ring-2 focus-visible:ring-[#C15A34]/30'
              : 'border-[#DCE0C4] focus-visible:border-[#C9A227] focus-visible:ring-2 focus-visible:ring-[#C9A227]/30',
            className,
          )}
          style={{ fontFamily: "'Lora', serif" }}
          ref={ref}
          {...props}
        />
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
Textarea.displayName = 'Textarea';

export { Textarea };
