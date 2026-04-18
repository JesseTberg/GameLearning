import React from 'react';
import { cn } from '../../lib/utils';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: 1 | 2 | 3 | 4;
}

export const Grid: React.FC<GridProps> = ({ 
  children, 
  cols = 3, 
  className, 
  ...props 
}) => {
  const colStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div 
      className={cn("grid gap-6", colStyles[cols], className)} 
      {...props}
    >
      {children}
    </div>
  );
};
