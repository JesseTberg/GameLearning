import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  isHoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className, 
  onClick,
  isHoverable = true 
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-sidebar border border-border rounded-xl relative overflow-hidden transition-all",
        isHoverable && "hover:border-accent/30 group",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      {children}
    </div>
  );
};