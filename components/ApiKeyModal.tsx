import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey } = useAppStore();
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setInputValue(apiKey || '');
    }
  }, [isOpen, apiKey]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setApiKey(inputValue.trim() || null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-slideUp border border-white/20">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4 text-purple-600">
            <span className="material-icons-outlined text-3xl">psychology</span>
            <h2 className="text-xl font-bold text-slate-800">Motor de Inteligencia Artificial</h2>
          </div>
          
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Para activar las funciones de generación automática (Títulos, Resúmenes, Cronogramas), necesitas una <strong>API Key de Google Gemini</strong>.
            <br/><br/>
            <span className="text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded border border-yellow-200">
              <span className="material-icons-outlined text-[10px] align-middle mr-1">lock</span>
              Tu llave se guarda solo en tu navegador.
            </span>
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Gemini API Key</label>
              <input
                type="password"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full bg-white text-slate-900 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all shadow-sm font-mono"
                placeholder="AIzaSy..."
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg hover:bg-purple-700 shadow-md transition-all flex items-center gap-2"
                >
                    Guardar Configuración
                </button>
            </div>
          </form>
          
          <div className="mt-4 pt-4 border-t border-gray-100 text-center">
            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-xs text-purple-600 hover:underline flex items-center justify-center gap-1">
                Obtener API Key gratis en Google AI Studio
                <span className="material-icons-outlined text-[10px]">open_in_new</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
