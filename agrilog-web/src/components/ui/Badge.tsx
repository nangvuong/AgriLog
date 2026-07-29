import React from 'react';

export type BadgeVariant =
  | 'green'
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'slate'
  | 'indigo'
  | 'sky';

export interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  pulse?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'green',
  size = 'sm',
  icon,
  pulse = false,
  children,
  className = '',
}) => {
  const baseStyles =
    'inline-flex items-center gap-1.5 font-semibold rounded-full border transition-colors select-none';

  const sizeStyles = {
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3.5 py-1 text-sm',
  };

  const variantStyles: Record<BadgeVariant, string> = {
    green: 'bg-green-50 text-green-700 border-green-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-300',
    rose: 'bg-rose-50 text-rose-700 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-300',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    sky: 'bg-sky-50 text-sky-700 border-sky-200',
  };

  const pulseColors: Record<BadgeVariant, string> = {
    green: 'bg-green-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    slate: 'bg-slate-500',
    indigo: 'bg-indigo-500',
    sky: 'bg-sky-500',
  };

  return (
    <span
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {pulse && (
        <span
          className={`w-2 h-2 rounded-full animate-pulse ${pulseColors[variant]}`}
        />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
