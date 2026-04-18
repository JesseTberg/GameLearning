import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'accent-ghost';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  size = 'md',
  className, 
  disabled,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-bold transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none rounded-md uppercase tracking-tight';
  
  const variants = {
    primary: 'bg-accent hover:bg-accent-light text-white shadow-[0_0_15px_rgba(99,102,241,0.2)]',
    secondary: 'bg-panel hover:bg-sidebar text-text-main border border-border',
    danger: 'bg-red-900/20 hover:bg-red-900/30 text-red-400 border border-red-900/50',
    ghost: 'hover:bg-accent/10 text-text-dim hover:text-accent-light',
    outline: 'border border-dashed border-accent/30 text-accent-light hover:bg-accent/10',
    'accent-ghost': 'bg-accent/10 border border-accent/20 text-accent-light hover:bg-accent/20'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-[10px]',
    md: 'px-4 py-2 text-xs',
    lg: 'px-6 py-3 text-sm'
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)} 
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && <Loader2 size={16} className="animate-spin" />}
      {children}
    </button>
  );
};
