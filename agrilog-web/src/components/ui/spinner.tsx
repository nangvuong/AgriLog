import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const SPINNER_SIZES = {
  sm: 'h-3.5 w-3.5',
  md: 'h-5 w-5',
  lg: 'h-7 w-7',
};

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Spinner({
  size = 'md',
  className = '',
  ...props
}: SpinnerProps) {
  return (
    <div className={cn('inline-flex items-center justify-center', className)} {...props}>
      <Loader2
        className={cn('animate-spin', SPINNER_SIZES[size])}
        strokeWidth={2}
      />
    </div>
  );
}

export default Spinner;
