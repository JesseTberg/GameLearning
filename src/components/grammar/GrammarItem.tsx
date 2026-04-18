import React from 'react';
import { History, Trash2 } from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { GrammarPoint } from '../../types';
import { cn } from '../../lib/utils';

interface GrammarItemProps {
  point: GrammarPoint;
  isEditing: boolean;
  onEdit: (point: GrammarPoint) => void;
  onRemove: (id: string) => void;
}

export const GrammarItem: React.FC<GrammarItemProps> = ({ 
  point, 
  isEditing, 
  onEdit, 
  onRemove 
}) => {
  return (
    <Card 
      className={cn(
        "p-5 flex justify-between items-start",
        isEditing && "border-accent ring-1 ring-accent/30"
      )}
    >
      <div className="flex-1">
        <h3 className="text-accent-light font-bold mb-1">{point.name}</h3>
        <p className="text-sm text-text-main mb-2">{point.description}</p>
        <code className="text-[10px] bg-black/40 px-2 py-1 rounded text-text-dim font-mono">
          {point.pattern}
        </code>
      </div>
      
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" onClick={() => onEdit(point)}>
          <History size={16} />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onRemove(point.id)} className="hover:text-red-400">
          <Trash2 size={16} />
        </Button>
      </div>
    </Card>
  );
};
