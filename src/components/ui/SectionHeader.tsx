import React from 'react';
import { cn } from '../../lib/utils';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  className?: string;
  variant?: 'large' | 'small';
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  icon, 
  leftAction,
  rightAction,
  className,
  variant = 'large'
}) => {
  return (
    <div className={cn("flex items-center justify-between shrink-0", variant === 'large' ? "mb-6" : "mb-2", className)}>
      <div className="flex items-center gap-4">
        {leftAction}
        {icon && <div className="text-accent-light">{icon}</div>}
        <div>
          <h2 className={cn("font-bold text-white tracking-tight", variant === 'large' ? "text-xl" : "text-[0.85rem] uppercase tracking-wider")}>{title}</h2>
          {subtitle && <p className="text-xs text-text-dim uppercase tracking-widest mt-1">{subtitle}</p>}
        </div>
      </div>
      {rightAction}
    </div>
  );
};
