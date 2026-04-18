import React from 'react';
import { motion } from 'motion/react';
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
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "bg-sidebar border border-border rounded-xl relative overflow-hidden transition-all",
        isHoverable && "hover:border-accent/30 group",
        onClick && "cursor-pointer active:scale-[0.98]",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
