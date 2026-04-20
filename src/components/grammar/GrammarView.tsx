import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SectionHeader } from '../ui/SectionHeader';
import { GrammarItem } from './GrammarItem';
import { GrammarForm } from './GrammarForm';
import { GrammarPoint } from '../../types';

interface GrammarViewProps {
  grammarPoints: GrammarPoint[];
  setGrammarPoints: (points: GrammarPoint[]) => void;
}

import { GrammarImporter } from './GrammarImporter';

export const GrammarView: React.FC<GrammarViewProps> = ({ grammarPoints, setGrammarPoints }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pattern, setPattern] = useState('');

  const startEdit = (point: GrammarPoint) => {
    setEditingId(point.id);
    setName(point.name);
    setDescription(point.description);
    setPattern(point.pattern);
  };

  const handleImport = (newPoints: GrammarPoint[]) => {
    setGrammarPoints([...grammarPoints, ...newPoints]);
  };

  const savePoint = () => {
    if (!name) return;
    
    if (editingId) {
      setGrammarPoints(grammarPoints.map(p => p.id === editingId 
        ? { ...p, name, description, pattern } 
        : p));
      setEditingId(null);
    } else {
      const point: GrammarPoint = {
        id: Math.random().toString(36).substr(2, 9),
        name, description, pattern
      };
      setGrammarPoints([...grammarPoints, point]);
    }
    
    clearForm();
  };

  const clearForm = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setPattern('');
  };

  const onRemove = (id: string) => {
    setGrammarPoints(grammarPoints.filter(p => p.id !== id));
    if (editingId === id) clearForm();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="space-y-6"
    >
      <SectionHeader 
        title="Grammar Guide" 
        subtitle="Rules to help translate and understand context" 
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {grammarPoints.map(point => (
              <GrammarItem 
                key={point.id}
                point={point}
                isEditing={editingId === point.id}
                onEdit={startEdit}
                onRemove={onRemove}
              />
            ))}
          </AnimatePresence>
 
          <GrammarImporter onImport={handleImport} />
        </div>
 
        <GrammarForm 
          editingId={editingId}
          name={name}
          description={description}
          pattern={pattern}
          onNameChange={setName}
          onDescriptionChange={setDescription}
          onPatternChange={setPattern}
          onSave={savePoint}
          onCancel={clearForm}
        />
      </div>
    </motion.div>
  );
};