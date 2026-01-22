import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { AiRequestPayload, AiResponsePayload, AiTask } from '../types';

export const Wizard: React.FC = () => {
    const { currentProject, updateProject, apiKey, createProject } = useAppStore();
    const [loadingAi, setLoadingAi] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'general' | 'objectives' | 'retribution' | 'budget'>('general');

    useEffect(() => {
        if (!currentProject) {
            createProject();
        }
    }, [currentProject, createProject]);

    if (!currentProject) return null;

    const runAiTask = async (task: AiTask, field?: string) => {
        if (!currentProject) return;
        setLoadingAi(task);

        const payload: AiRequestPayload = {
            projectId: currentProject.id,
            task: task,
            field: field,
            projectContext: currentProject,
            userNotes: "Focus on Chilean culture laws."
        };

        try {
            // Updated to use relative path for Vercel Functions
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-gemini-api-key': apiKey || ''
                },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error('AI Request failed');

            const data: AiResponsePayload = await res.json();
            const suggestions = data.suggestions;

            if (suggestions && suggestions.length > 0) {
                // Apply logic (Simplified for restoration)
                if (task === 'generate_title') {
                    updateProject({
                        content: { ...currentProject.content, title: suggestions[0] },
                        name: suggestions[0]
                    });
                } else if (task === 'generate_summary') {
                    updateProject({
                        content: { ...currentProject.content, summary: suggestions[0] }
                    });
                }
                // Add other handlers as needed
            }

        } catch (err) {
            console.error(err);
            alert("Error generating content. Please check API Key.");
        } finally {
            setLoadingAi(null);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">Editor de Proyecto</h2>
                    <div className="flex gap-2">
                        <span className="text-sm text-slate-400 bg-slate-100 px-2 py-1 rounded">ID: {currentProject.id.slice(0, 8)}</span>
                    </div>
                </div>

                <div className="flex border-b border-slate-200 mb-6 overflow-x-auto">
                    {['general', 'objectives', 'retribution', 'budget'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab as any)}
                            className={`px-4 py-2 font-medium text-sm transition-colors border-b-2 ${activeTab === tab
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>

                {activeTab === 'general' && (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Título del Proyecto</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={currentProject.content.title}
                                    onChange={(e) => updateProject({ content: { ...currentProject.content, title: e.target.value } })}
                                    className="flex-1 p-2 border border-slate-300 rounded"
                                    placeholder="Ingrese un título descriptivo..."
                                />
                                <button
                                    onClick={() => runAiTask('generate_title')}
                                    disabled={loadingAi === 'generate_title'}
                                    className="bg-purple-100 text-purple-700 px-3 py-2 rounded hover:bg-purple-200 transition-colors flex items-center gap-1"
                                >
                                    <span className="material-icons-outlined text-sm">auto_awesome</span>
                                    {loadingAi === 'generate_title' ? '...' : 'Generar'}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Resumen Ejecutivo</label>
                            <div className="relative">
                                <textarea
                                    rows={5}
                                    value={currentProject.content.summary}
                                    onChange={(e) => updateProject({ content: { ...currentProject.content, summary: e.target.value } })}
                                    className="w-full p-2 border border-slate-300 rounded"
                                    placeholder="Describa el proyecto brevemente..."
                                />
                                <button
                                    onClick={() => runAiTask('generate_summary')}
                                    disabled={loadingAi === 'generate_summary'}
                                    className="absolute bottom-2 right-2 bg-white text-purple-600 border border-purple-200 text-xs px-2 py-1 rounded shadow-sm hover:bg-purple-50 flex items-center gap-1"
                                >
                                    <span className="material-icons-outlined text-xs">auto_awesome</span>
                                    Ayúdame a redactar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Other tabs omitted for brevity in restoration phase, focusing on connection verification */}
                {activeTab !== 'general' && (
                    <div className="text-center py-10 text-slate-400">
                        <p>Contenido de la pestaña {activeTab} en construcción/restauración...</p>
                    </div>
                )}
            </div>
        </div>
    );
};
