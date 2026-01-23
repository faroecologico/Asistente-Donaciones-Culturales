import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ProjectStatus, AiResponsePayload } from '../types';

export const Dashboard: React.FC = () => {
    const { projects, deleteProject, loadProject, duplicateProject, createProject, apiKey, setApiKey } = useAppStore();
    const navigate = useNavigate();

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [brief, setBrief] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const handleOpenWizard = (id: string) => {
        loadProject(id);
        navigate('/wizard');
    };

    const handleSmartCreate = async () => {
        if (!brief.trim()) return;

        // If no API key, just create empty
        if (!apiKey) {
            alert("Para usar la Generación Inteligente, configure su API Key primero.");
            return;
        }

        setIsGenerating(true);
        try {
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-gemini-api-key': apiKey },
                body: JSON.stringify({
                    projectId: 'new',
                    task: 'generate_initial_draft',
                    userNotes: brief,
                    projectContext: {}
                })
            });

            if (!res.ok) throw new Error(res.statusText);

            const data: AiResponsePayload = await res.json();

            // The AI might return the object directly or inside suggestions[0]
            let draftData = data;
            if (data.suggestions && data.suggestions.length > 0) {
                // Check if suggestion is stringified JSON or object
                const sugg = data.suggestions[0];
                draftData = typeof sugg === 'string' ? JSON.parse(sugg) : sugg;
            }

            // Create project with AI data
            createProject({
                name: draftData.paso2_datos_proyecto?.titulo?.texto || "Proyecto Generado por IA",
                ...draftData // Spread the rest of the generated fields
            });

            navigate('/wizard');

        } catch (err) {
            console.error(err);
            alert("Error al generar el borrador. Se creará un proyecto vacío.");
            createProject({ name: "Nuevo Proyecto" });
            navigate('/wizard');
        } finally {
            setIsGenerating(false);
            setIsModalOpen(false);
        }
    };

    return (
        <div className="page-container py-12 relative">
            <div className="flex items-end justify-between mb-16 border-b border-slate-200 pb-8">
                <div className="max-w-xl">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">Proyectos</h1>
                    <p className="text-slate-500 text-lg leading-relaxed">Gestione sus postulaciones a la Ley de Donaciones Culturales.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="btn-primary h-14 px-10 rounded-2xl text-base shadow-xl shadow-blue-200"
                >
                    <span className="material-icons-outlined text-xl">auto_awesome</span>
                    Nuevo con IA
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8">
                        <span className="material-icons-outlined text-4xl text-blue-600">rocket_launch</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">Sin proyectos aun</h2>
                    <p className="text-slate-400 mb-10 text-center max-w-sm">Use el asistente IA para generar su primer borrador en segundos.</p>
                    <button onClick={() => setIsModalOpen(true)} className="btn-secondary px-8">Crear Proyecto</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                    {projects.map(p => (
                        <div
                            key={p.id}
                            onClick={() => handleOpenWizard(p.id)}
                            className="card p-8 group hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100 transition-all cursor-pointer relative flex flex-col min-h-[320px] rounded-[2rem]"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-blue-50 text-blue-600">
                                    {p.clasificacion?.tipo_proyecto || "Borrador"}
                                </span>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(p.meta?.updatedAt || 0).toLocaleDateString()}</span>
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {p.paso2_datos_proyecto?.titulo?.texto || p.name || "Sin título"}
                            </h3>

                            <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1 line-clamp-3">
                                {p.paso2_datos_proyecto?.resumen?.texto || "Haga clic para completar el formulario..."}
                            </p>

                            <div className="flex items-center gap-2 pt-6 border-t border-slate-50 mt-auto">
                                <button
                                    onClick={(e) => { e.stopPropagation(); duplicateProject(p.id); }}
                                    className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    <span className="material-icons-outlined text-xl">content_copy</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                                    className="p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                >
                                    <span className="material-icons-outlined text-xl">delete_outline</span>
                                </button>
                                <div className="ml-auto flex items-center gap-1 text-xs font-black text-blue-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                                    EDITAR <span className="material-icons-outlined text-base">arrow_forward</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* NEW PROJECT MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-slideUp">
                        <div className="bg-slate-900 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10">
                                <span className="material-icons-outlined text-9xl">auto_awesome</span>
                            </div>
                            <h2 className="text-3xl font-black mb-2 relative z-10">Nuevo Proyecto</h2>
                            <p className="text-slate-400 relative z-10">Cuéntanos tu idea y la IA generará un primer borrador completo.</p>
                            <button onClick={() => setIsModalOpen(false)} className="absolute top-6 right-6 text-white/50 hover:text-white z-20">
                                <span className="material-icons-outlined">close</span>
                            </button>
                        </div>

                        <div className="p-8">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 block">Idea o Breve Descripción</label>
                            <textarea
                                autoFocus
                                className="input-field bg-slate-50 text-lg resize-none"
                                rows={5}
                                placeholder="Ej: Queremos realizar un festival de teatro gratuito en la comuna de La Pintana durante el verano, con 5 obras y talleres para niños..."
                                value={brief}
                                onChange={e => setBrief(e.target.value)}
                            />

                            <div className="mt-8 flex gap-4">
                                <button
                                    onClick={() => handleSmartCreate()}
                                    disabled={isGenerating || !brief.trim()}
                                    className="btn-primary w-full h-14 text-base relative overflow-hidden"
                                >
                                    {isGenerating ? (
                                        <div className="flex items-center gap-3">
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Generando Borrador...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <span className="material-icons-outlined">auto_awesome</span>
                                            <span>Generar Borrador Mágico</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                            {!apiKey && (
                                <p className="text-center text-xs text-red-500 mt-4">
                                    * Requiere configurar API Key (botón flotante abajo a la izq)
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* API Key Config */}
            <div className="fixed bottom-8 left-8 z-40">
                <button
                    onClick={() => {
                        const key = prompt("Ingrese su Gemini API Key:", apiKey || "");
                        if (key !== null) setApiKey(key);
                    }}
                    className="bg-white text-slate-900 border border-slate-200 p-3 rounded-xl shadow-lg flex items-center gap-3 hover:scale-105 transition-transform"
                >
                    <span className="material-icons-outlined text-slate-400">vpn_key</span>
                    <span className="text-xs font-bold uppercase tracking-widest leading-none">API Key</span>
                </button>
            </div>
        </div>
    );
};
