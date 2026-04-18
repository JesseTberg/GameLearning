import React from 'react';
import { cn } from '../../lib/utils';

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'sidebar' | 'header' | 'glass';
}

export const Panel: React.FC<PanelProps> = ({ 
  children, 
  variant = 'default', 
  className, 
  ...props 
}) => {
  const variants = {
    default: 'bg-sidebar border border-border rounded-lg',
    sidebar: 'bg-sidebar border-r border-border',
    header: 'bg-sidebar border-b border-border h-14 px-6 flex items-center justify-between shrink-0 z-50',
    glass: 'bg-sidebar/50 backdrop-blur-sm border border-border rounded-xl shadow-xl'
  };

  return (
    <div 
      className={cn(variants[variant], className)} 
      {...props}
    >
      {children}
    </div>
  );
};
