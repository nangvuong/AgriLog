import React from 'react';
import { motion } from 'framer-motion';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end"
    >
      <div>
        <h1
          className="text-[22px] text-[#20281B] sm:text-[24px]"
          style={{ fontFamily: "'Lora', serif", fontWeight: 500 }}
        >
          {title}
        </h1>
        {description && (
          <p
            className="mt-1 text-[13px] text-[#7C7A4E]"
            style={{ fontFamily: "'Lora', serif" }}
          >
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      )}
    </motion.div>
  );
}

export default PageHeader;
