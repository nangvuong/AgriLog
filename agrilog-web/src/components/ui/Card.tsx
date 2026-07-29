import React from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

export interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'green' | 'blue' | 'default';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'green',
  ...props
}) => {
  const borderStyles = {
    green: 'border-green-100/80',
    blue: 'border-blue-100/80',
    default: 'border-slate-100',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.3 }}
      className={`bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-2xl border ${borderStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const CardHeader: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`text-center mb-5 sm:mb-8 ${className}`}>{children}</div>
);

export const CardTitle: React.FC<{
  children: React.ReactNode;
  className?: string;
  gradient?: boolean;
}> = ({ children, className = '', gradient = true }) => (
  <h2
    className={`text-xl sm:text-2xl font-bold ${
      gradient
        ? 'bg-gradient-to-r from-green-800 via-green-700 to-blue-700 bg-clip-text text-transparent'
        : 'text-slate-800'
    } ${className}`}
  >
    {children}
  </h2>
);

export const CardDescription: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <p className={`text-sm text-slate-500 mt-1 ${className}`}>{children}</p>
);

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`space-y-5 ${className}`}>{children}</div>
);

export const CardFooter: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`mt-6 pt-5 border-t border-slate-100 text-center ${className}`}>
    {children}
  </div>
);
