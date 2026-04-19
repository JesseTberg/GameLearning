import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from './ui/Button';
import { Panel } from './ui/Panel';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const savedKey = sessionStorage.getItem('GEMINI_API_KEY');
    if (savedKey) setApiKey(savedKey);
  }, [isOpen]);

  const handleSave = () => {
    sessionStorage.setItem('GEMINI_API_KEY', apiKey);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
      // Reload to ensure services get the new key
      window.location.reload();
    }, 1000);
  };

  const handleClear = () => {
    sessionStorage.removeItem('GEMINI_API_KEY');
    setApiKey('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="w-full max-w-md relative z-10"
          >
            <Panel className="p-8 border-gray-800 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
                    <Key size={20} />
                  </div>
                  <h2 className="text-xl font-bold text-white">API Settings</h2>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 rounded-full text-gray-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-2 font-bold">
                    Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Enter your API key..."
                      className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none text-white transition-all pl-10"
                    />
                    <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
                    Your key is stored in session storage and is cleared when you close the tab. 
                    You can get a free key from the Google AI Studio.
                  </p>
                </div>

                <div className="bg-blue-600/5 border border-blue-600/10 rounded-lg p-4 flex items-start gap-3">
                  <ShieldCheck size={18} className="text-blue-400 mt-0.5 shrink-0" />
                  <div className="text-[11px] text-blue-400/80 leading-relaxed">
                    Setting a personal API key override provides higher rate limits and ensures your assistant is always ready.
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="secondary" 
                    className="flex-1" 
                    onClick={handleClear}
                  >
                    Clear Key
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white" 
                    onClick={handleSave}
                    disabled={isSaved}
                  >
                    {isSaved ? "Saved!" : "Save Settings"}
                  </Button>
                </div>
              </div>
            </Panel>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
