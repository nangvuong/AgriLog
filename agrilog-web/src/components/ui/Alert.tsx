import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { motion } from 'motion/react';

export type AlertVariant = 'error' | 'success' | 'warning' | 'info';

export interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
  icon?: React.ReactNode;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className = '',
  icon,
}) => {
  const variantStyles: Record<
    AlertVariant,
    { bg: string; border: string; text: string; sub: string; defaultIcon: React.ReactNode }
  > = {
    error: {
      bg: 'bg-rose-50',
      border: 'border-rose-200',
      text: 'text-rose-800',
      sub: 'text-rose-600',
      defaultIcon: <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />,
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      sub: 'text-green-700',
      defaultIcon: (
        <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      ),
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      sub: 'text-amber-700',
      defaultIcon: (
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      ),
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      sub: 'text-blue-700',
      defaultIcon: <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />,
    },
  };

  const current = variantStyles[variant];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`p-4 rounded-2xl border flex items-start gap-3 ${current.bg} ${current.border} ${className}`}
    >
      {icon || current.defaultIcon}
      <div className="flex-1">
        {title && (
          <p className={`font-semibold text-sm ${current.text}`}>{title}</p>
        )}
        <div
          className={`text-xs mt-0.5 ${current.sub} ${
            !title ? 'font-medium text-sm' : ''
          }`}
        >
          {children}
        </div>
      </div>
    </motion.div>
  );
};
