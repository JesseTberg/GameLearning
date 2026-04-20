import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Key, ShieldCheck, Lock } from 'lucide-react';
import { Button } from './ui/Button';
import { Panel } from './ui/Panel';
import { saveApiKey, getStoredApiKey, clearApiKey, AiProvider } from '../lib/encryption';
import { cn } from '../lib/utils';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const [provider, setProvider] = useState<AiProvider>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      const loadKey = async () => {
        const savedKey = await getStoredApiKey(provider);
        setApiKey(savedKey || '');
        setIsLoading(false);
      };
      loadKey();
    }
  }, [isOpen, provider]);

  const handleSave = async () => {
    if (!apiKey) return;
    
    setIsLoading(true); 
    try {
      await saveApiKey(provider, apiKey);
      setIsSaved(true);
      
      setTimeout(() => {
        setIsSaved(false);
        onClose();
      }, 800);
    } catch (err) {
      console.error("Encryption failed", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    clearApiKey(provider);
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
                  <h2 className="text-xl font-bold text-white">AI Engine Settings</h2>
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
                    Select Provider
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-6">
                    <button 
                      onClick={() => setProvider('gemini')}
                      className={cn(
                        "px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border",
                        provider === 'gemini' ? "bg-blue-600/20 border-blue-500 text-blue-400" : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                      )}
                    >
                      Google Gemini
                    </button>
                    <button 
                      disabled
                      className={cn(
                        "px-3 py-2 rounded-lg text-[10px] font-bold uppercase transition-all border",
                        "bg-white/2 border-white/5 text-gray-600 cursor-not-allowed flex flex-col items-center gap-0.5"
                      )}
                    >
                      OpenAI
                      <span className="text-[7px] text-amber-900/60 font-black tracking-tighter bg-amber-500/10 px-1 rounded">Under Development</span>
                    </button>
                  </div>

                  <label className="text-[10px] text-gray-400 uppercase tracking-widest block mb-2 font-bold">
                    {provider.toUpperCase()} API Key
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder={`Enter your ${provider} key...`}
                      className="w-full bg-black/40 border border-gray-800 rounded-lg px-4 py-3 text-sm focus:border-blue-500 outline-none text-white transition-all pl-10"
                    />
                    <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  </div>
                  <p className="text-[10px] text-gray-500 mt-3 leading-relaxed">
                    Your <strong>{provider}</strong> key is <strong>AES-GCM encrypted</strong> and stored in volatile session storage. 
                  </p>
                </div>

                <div className="bg-blue-600/5 border border-blue-600/10 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <ShieldCheck size={18} className="text-blue-400 mt-0.5 shrink-0" />
                    <div className="text-[11px] text-blue-400/80 leading-relaxed">
                      <strong>Strict Security Policy</strong>: The browser is restricted (CSP) to only communicate with this origin. Your key never touches 3rd-party domains.
                    </div>
                  </div>
                  <div className="flex items-start gap-3 border-t border-blue-600/10 pt-3">
                    <Lock size={16} className="text-blue-400/60 mt-0.5 shrink-0" />
                    <div className="text-[10px] text-blue-400/60 leading-relaxed">
                      Key is decrypted only at the moment of request and proxied through a secure local gateway.
                    </div>
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
