import * as React from 'react';
import { cn } from '@/lib/utils';

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        'mb-1.5 block text-[13px] font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-[#33361F]',
        className,
      )}
      style={{ fontFamily: "'Lora', serif" }}
      {...props}
    />
  ),
);
Label.displayName = 'Label';

export { Label };
