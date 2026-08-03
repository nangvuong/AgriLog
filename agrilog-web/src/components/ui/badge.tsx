import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default: 'bg-[#ECEEDA] text-[#3F6B2C]',
        gold: 'bg-[#FBF0D6] text-[#8A6D1F]',
        danger: 'bg-[#F6E2DC] text-[#9C4B2E]',
        outline: 'border border-[#DCE0C4] text-[#52502E]',
        neutral: 'bg-[#EFEBDD] text-[#8B8368]',
        secondary: 'bg-[#ECEEDA] text-[#20281B]',
        destructive: 'bg-[#C15A34] text-white',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={{ fontFamily: "'Lora', serif" }}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
