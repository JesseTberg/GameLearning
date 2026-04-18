import React, { useState, useRef } from 'react';
import { FileUp, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Panel } from '../ui/Panel';
import { parseGrammarFromPdf } from '../../services/gemini';
import { GrammarPoint } from '../../types';

interface GrammarImporterProps {
  onImport: (points: GrammarPoint[]) => void;
}

export const GrammarImporter: React.FC<GrammarImporterProps> = ({ onImport }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file.');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        const points = await parseGrammarFromPdf(base64);
        onImport(points);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      console.error(err);
      setError('Failed to analyze PDF. Please check your API key.');
      setIsUploading(false);
    }
  };

  return (
    <Panel className="p-6 border-dashed border-gray-700 bg-blue-600/5 mt-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
            {isUploading ? <Loader2 size={18} className="animate-spin" /> : <FileUp size={18} />}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Import from Study Material</h4>
            <p className="text-[10px] text-gray-400">Upload a PDF to extract grammar rules automatically</p>
          </div>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf"
          className="hidden"
        />
        
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? "Reading..." : "Select PDF"}
        </Button>
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-900/40 rounded flex items-center gap-2 text-red-400 text-[10px]">
          <AlertCircle size={14} />
          {error}
        </div>
      )}
    </Panel>
  );
};
