import React from 'react';
import { Plus, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';

interface GrammarFormProps {
  editingId: string | null;
  name: string;
  description: string;
  pattern: string;
  onNameChange: (val: string) => void;
  onDescriptionChange: (val: string) => void;
  onPatternChange: (val: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export const GrammarForm: React.FC<GrammarFormProps> = ({
  editingId,
  name,
  description,
  pattern,
  onNameChange,
  onDescriptionChange,
  onPatternChange,
  onSave,
  onCancel
}) => {
  return (
    <Panel className="p-6 h-fit sticky top-6 shadow-xl">
      <h3 className="text-xs font-bold text-text-dim uppercase tracking-widest mb-4">
        {editingId ? "Modify Target Rule" : "Add Local Rule"}
      </h3>
      <div className="space-y-4">
        <div>
          <label className="text-[10px] text-text-dim uppercase mb-1 block">Rule Name</label>
          <input 
            value={name}
            onChange={e => onNameChange(e.target.value)}
            placeholder="e.g. て-form"
            className="w-full bg-bg border border-border rounded px-3 py-2 text-sm focus:border-accent outline-none text-white"
          />
        </div>
        <div>
          <label className="text-[10px] text-text-dim uppercase mb-1 block">Description</label>
          <textarea 
            value={description}
            onChange={e => onDescriptionChange(e.target.value)}
            placeholder="Explain the grammar logic..."
            className="w-full bg-bg border border-border rounded px-3 py-2 text-sm h-24 focus:border-accent outline-none text-white"
          />
        </div>
        <div>
          <label className="text-[10px] text-text-dim uppercase mb-1 block">Pattern Hint (Optional)</label>
          <input 
            value={pattern}
            onChange={e => onPatternChange(e.target.value)}
            placeholder="verb[te]"
            className="w-full bg-bg border border-border rounded px-3 py-2 text-sm focus:border-accent outline-none text-white"
          />
        </div>
        <div className="flex gap-2">
          {editingId && (
            <Button onClick={onCancel} variant="secondary" className="flex-1">
              Cancel
            </Button>
          )}
          <Button onClick={onSave} className="flex-[2]">
            {editingId ? <CheckCircle2 size={16} /> : <Plus size={16} />}
            {editingId ? "Update Rule" : "Add to Index"}
          </Button>
        </div>
      </div>
    </Panel>
  );
};
