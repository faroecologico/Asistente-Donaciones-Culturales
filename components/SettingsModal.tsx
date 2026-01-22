import React, { useState } from 'react';
import { useAppStore } from '../store';

export const SettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { apiKey, setApiKey } = useAppStore();
    const [tempKey, setTempKey] = useState(apiKey || '');

    if (!isOpen) return null;

    const handleSave = () => {
        setApiKey(tempKey);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-slideUp">
                <header className="bg-slate-900 py-8 px-10 text-white flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <span className="material-icons-outlined text-3xl">settings</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-black tracking-tight leading-none mb-1">Configuración</h2>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Personaliza tu experiencia</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors text-slate-400">
                        <span className="material-icons-outlined text-2xl">close</span>
                    </button>
                </header>

                <div className="p-10 space-y-8">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Gemini API Key</label>
                            <p className="text-[11px] text-slate-500 mb-3 px-1 italic">Si dispones de una clave propia, ingrésala aquí para evitar límites de cuota generales.</p>
                            <div className="relative">
                                <input
                                    type="password"
                                    className="input-field pr-12"
                                    placeholder="AIzaSy..."
                                    value={tempKey}
                                    onChange={(e) => setTempKey(e.target.value)}
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 material-icons-outlined text-slate-300">vpn_key</span>
                            </div>
                        </div>

                        <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                            <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="material-icons-outlined text-sm">info</span>
                                Importante
                            </h4>
                            <p className="text-xs text-blue-900 font-medium leading-relaxed">
                                Tu clave se guarda localmente en este navegador. No es compartida con nuestros servidores. Puedes obtener una clave gratuita en <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="underline font-black">Google AI Studio</a>.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-4 border-t border-slate-100">
                        <button className="btn-secondary flex-1 py-4 text-sm font-bold" onClick={onClose}>Cerrar</button>
                        <button
                            className="btn-primary flex-1 py-4 text-sm font-bold shadow-xl shadow-blue-200"
                            onClick={handleSave}
                        >
                            GUARDAR CAMBIOS
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
