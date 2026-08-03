import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-[13.5px] font-medium transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#F7F2DF]',
  {
    variants: {
      variant: {
        primary:
          'bg-[#1C2B1E] text-[#F6EFDD] hover:bg-[#243A28] focus-visible:ring-[#1C2B1E]/40 shadow-sm',
        gold: 'bg-[#C9A227] text-[#1C2B1E] hover:bg-[#B8931F] focus-visible:ring-[#C9A227]/50 shadow-sm',
        secondary:
          'bg-[#ECEEDA] text-[#20281B] hover:bg-[#E1E5CB] focus-visible:ring-[#8B9070]/40',
        outline:
          'border border-[#DCE0C4] bg-white text-[#33361F] hover:bg-[#F7F2DF] focus-visible:ring-[#8B9070]/40 shadow-sm',
        ghost:
          'text-[#33361F] hover:bg-[#ECEEDA] focus-visible:ring-[#8B9070]/40',
        destructive:
          'bg-[#C15A34] text-white hover:bg-[#A94B2A] focus-visible:ring-[#C15A34]/40 shadow-sm',

        // Backward-compatible variants
        default:
          'bg-[#1C2B1E] text-[#F6EFDD] hover:bg-[#243A28] shadow-sm',
        link: 'text-primary underline-offset-4 hover:underline',
        agri: 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-lg shadow-emerald-600/20',
        notebookPrimary:
          'bg-[#1C2B1E] text-[#F6EFDD] shadow-sm hover:bg-[#243A28] active:scale-[0.99] focus-visible:ring-[#C9A227] focus-visible:ring-offset-[#F7F2DF]',
        notebookGhost:
          'border border-[#DCE0C4] bg-white text-[#33361F] shadow-sm hover:bg-[#F7F2DF] focus-visible:ring-[#C9A227]/40',
      },
      size: {
        default: 'h-10 px-4 py-2 gap-2',
        sm: 'h-8 px-3 text-[12.5px] gap-1.5',
        md: 'h-10 px-4 text-[13.5px] gap-2',
        lg: 'h-11 px-5 text-[14px] gap-2',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, loading = false, disabled, children, ...props },
    ref,
  ) => {
    return (
      <button
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, size, className }))}
        style={{ fontFamily: "'Lora', serif" }}
        ref={ref}
        {...props}
      >
        {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  },
);
Button.displayName = 'Button';

export { Button, buttonVariants };
