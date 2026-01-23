import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ProjectType, AiTask, AiResponsePayload } from '../types';
import { RETRIBUTION_EVIDENCE_OPTIONS } from '../constants';

// --- SUB COMPONENTS ---

const StepClassification: React.FC = () => {
    const { currentProject, updateProject } = useAppStore();
    if (!currentProject) return null;

    return (
        <div className="space-y-8 animate-slideUp">
            <div className="card p-8">
                <h3 className="text-xl font-bold mb-6 text-slate-900">Datos Iniciales</h3>
                <div className="space-y-4">
                    <div>
                        <label className="label block text-sm font-bold text-slate-700 mb-2">Nombre del Proyecto (Interno)</label>
                        <input
                            type="text"
                            className="input-field"
                            value={currentProject.name}
                            onChange={(e) => updateProject({ name: e.target.value })}
                            placeholder="Ej: Festival de Teatro 2024"
                        />
                    </div>
                </div>
            </div>

            <div className="card p-8">
                <h3 className="text-xl font-bold mb-6 text-slate-900">Clasificación (Art. 8°)</h3>
                <div className="space-y-4">
                    <div>
                        <label className="label block text-sm font-bold text-slate-700 mb-2">Tipo de Proyecto</label>
                        <select
                            className="input-field"
                            value={currentProject.initial.projectType}
                            onChange={(e) => updateProject({ initial: { ...currentProject.initial, projectType: e.target.value as ProjectType } })}
                        >
                            {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <p className="text-xs text-slate-400 mt-2">Seleccione la categoría principal. Si su proyecto es mixto, elija la predominante.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StepNarrative: React.FC<{ onOpenAi: (task: AiTask, field: string) => void }> = ({ onOpenAi }) => {
    const { currentProject, updateProject } = useAppStore();
    if (!currentProject) return null;

    return (
        <div className="space-y-8 animate-slideUp">
            {/* TITULO */}
            <div className="card p-8 relative">
                <div className="flex justify-between items-start mb-4">
                    <label className="block text-sm font-bold text-slate-700">Título del Proyecto</label>
                    <button
                        onClick={() => onOpenAi('generate_title', 'content.title')}
                        className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1"
                    >
                        <span className="material-icons-outlined text-sm">auto_awesome</span> IA
                    </button>
                </div>
                <input
                    type="text"
                    className="input-field"
                    value={currentProject.content.title}
                    onChange={(e) => updateProject({ content: { ...currentProject.content, title: e.target.value } })}
                    placeholder="Título descriptivo..."
                />
                <div className="text-right mt-1">
                    <span className={`text-[10px] font-bold ${currentProject.content.title.length > 150 ? 'text-red-500' : 'text-slate-400'}`}>
                        {currentProject.content.title.length}/150
                    </span>
                </div>
            </div>

            {/* RESUMEN */}
            <div className="card p-8 relative">
                <div className="flex justify-between items-start mb-4">
                    <label className="block text-sm font-bold text-slate-700">Resumen Ejecutivo</label>
                    <button
                        onClick={() => onOpenAi('generate_summary', 'content.summary')}
                        className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 flex items-center gap-1"
                    >
                        <span className="material-icons-outlined text-sm">auto_awesome</span> IA
                    </button>
                </div>
                <textarea
                    rows={6}
                    className="input-field"
                    value={currentProject.content.summary}
                    onChange={(e) => updateProject({ content: { ...currentProject.content, summary: e.target.value } })}
                    placeholder="Resumen del impacto y actividades..."
                />
                <div className="text-right mt-1">
                    <span className={`text-[10px] font-bold ${currentProject.content.summary.length > 400 ? 'text-red-500' : 'text-slate-400'}`}>
                        {currentProject.content.summary.length}/400
                    </span>
                </div>
            </div>
        </div>
    );
};

const StepTimeline: React.FC = () => {
    const { currentProject, updateProject } = useAppStore();
    if (!currentProject) return null;

    const addActivity = () => {
        const newActivity = {
            id: Math.random().toString(36),
            name: '',
            unit: 'meses' as const,
            duration: 1,
            description: ''
        };
        updateProject({ timeline: [...currentProject.timeline, newActivity] });
    };

    const removeActivity = (id: string) => {
        updateProject({ timeline: currentProject.timeline.filter(a => a.id !== id) });
    };

    const updateActivity = (id: string, field: string, value: any) => {
        const updated = currentProject.timeline.map(a => a.id === id ? { ...a, [field]: value } : a);
        updateProject({ timeline: updated });
    };

    return (
        <div className="space-y-8 animate-slideUp">
            <div className="card p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Cronograma de Actividades</h3>
                    <button onClick={addActivity} className="btn-secondary py-2 px-4 text-xs h-10">
                        <span className="material-icons-outlined text-sm">add</span> Agregar
                    </button>
                </div>

                {currentProject.timeline.length === 0 ? (
                    <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-slate-400 text-sm">No hay actividades registradas.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {currentProject.timeline.map((act, idx) => (
                            <div key={act.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                <div className="flex gap-4 mb-2">
                                    <div className="flex-1">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Actividad</label>
                                        <input
                                            type="text"
                                            className="input-field py-2 text-sm"
                                            value={act.name}
                                            onChange={e => updateActivity(act.id, 'name', e.target.value)}
                                            placeholder="Nombre de la actividad"
                                        />
                                    </div>
                                    <div className="w-24">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Duración</label>
                                        <input
                                            type="number"
                                            className="input-field py-2 text-sm"
                                            value={act.duration}
                                            onChange={e => updateActivity(act.id, 'duration', parseInt(e.target.value))}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Unidad</label>
                                        <select
                                            className="input-field py-2 text-sm"
                                            value={act.unit}
                                            onChange={e => updateActivity(act.id, 'unit', e.target.value)}
                                        >
                                            <option value="dias">Días</option>
                                            <option value="semanas">Semanas</option>
                                            <option value="meses">Meses</option>
                                        </select>
                                    </div>
                                    <button onClick={() => removeActivity(act.id)} className="mt-6 text-slate-400 hover:text-red-500">
                                        <span className="material-icons-outlined">delete</span>
                                    </button>
                                </div>
                                <textarea
                                    className="input-field py-2 text-sm w-full"
                                    placeholder="Descripción breve..."
                                    value={act.description}
                                    onChange={e => updateActivity(act.id, 'description', e.target.value)}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN WIZARD ---

export const Wizard: React.FC = () => {
    const { currentProject, updateProject, apiKey, setApiKey } = useAppStore();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);

    // AI State
    const [aiShow, setAiShow] = useState(false);
    const [aiTask, setAiTask] = useState<AiTask | null>(null);
    const [aiField, setAiField] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null); // Last result
    const [aiNotes, setAiNotes] = useState("");

    const steps = [
        "Datos Iniciales",
        "Beneficiario",
        "Datos del Proyecto",
        "Cronograma",
        "Presupuesto",
        "Documentos",
        "Revisión y Export"
    ];

    useEffect(() => {
        if (!currentProject) navigate('/');
    }, [currentProject, navigate]);

    if (!currentProject) return null;

    // AI Logic
    const handleOpenAi = (task: AiTask, field: string) => {
        setAiTask(task);
        setAiField(field);
        setAiShow(true);
        setAiResult(null);
        setAiNotes("");
    };

    const handleRunAi = async () => {
        if (!aiTask) return;
        setAiLoading(true);
        try {
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-gemini-api-key': apiKey || '' },
                body: JSON.stringify({
                    projectId: currentProject.id,
                    task: aiTask,
                    field: aiField,
                    projectContext: currentProject,
                    userNotes: aiNotes
                })
            });
            const data: AiResponsePayload = await res.json();
            setAiResult(data);
        } catch (err) {
            console.error(err);
            alert("Error al conectar con la IA");
        } finally {
            setAiLoading(false);
        }
    };

    const handleApplyAi = (val: string) => {
        if (!aiField) return;
        // Deep update utility would be better, but for MVP strict fields:
        if (aiField === 'content.title') updateProject({ content: { ...currentProject.content, title: val }, name: val });
        else if (aiField === 'content.summary') updateProject({ content: { ...currentProject.content, summary: val } });
        // Add more field mappings as needed
        setAiShow(false);
    };

    // Render Steps
    const renderContent = () => {
        switch (activeStep) {
            case 0: return <StepClassification />;
            case 2: return <StepNarrative onOpenAi={handleOpenAi} />;
            case 3: return <StepTimeline />;
            default: return <div className="text-center py-20 text-slate-400">Paso en construcción...</div>;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            {/* LEFT SIDEBAR (Stepper) */}
            <aside className="w-80 bg-white border-r border-slate-200 flex flex-col z-20 shadow-xl">
                <div className="p-8 border-b border-slate-100">
                    <h1 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">Guía de Formulación</h1>
                    <div className="w-full bg-slate-100 h-1 rounded-full mt-4">
                        <div className="bg-blue-600 h-1 rounded-full transition-all duration-500" style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}></div>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {steps.map((label, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveStep(idx)}
                            className={`w-full text-left px-4 py-3 rounded-xl flex items-center gap-3 transition-all ${idx === activeStep ? 'bg-blue-50 text-blue-700 font-bold border border-blue-100' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border ${idx === activeStep ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 bg-white text-slate-400'
                                }`}>
                                {idx + 1}
                            </span>
                            <span className="text-sm">{label}</span>
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-100">
                    <button onClick={() => navigate('/')} className="text-xs font-bold text-slate-400 hover:text-slate-600 flex items-center gap-2">
                        <span className="material-icons-outlined">arrow_back</span> Volver al Dashboard
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                <header className="px-8 py-4 bg-white border-b border-slate-200 flex justify-between items-center shrink-0">
                    <div>
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest">Paso {activeStep + 1}</span>
                        <h2 className="text-xl font-bold text-slate-900 mt-1">{steps[activeStep]}</h2>
                    </div>
                    <div className="flex gap-2">
                        <button disabled={activeStep === 0} onClick={() => setActiveStep(s => s - 1)} className="btn-secondary h-10 px-4 text-sm">Anterior</button>
                        <button onClick={() => setActiveStep(s => Math.min(steps.length - 1, s + 1))} className="btn-primary h-10 px-6 text-sm">Siguiente</button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-4xl mx-auto pb-20">
                        {renderContent()}
                    </div>
                </div>

                {/* AI MODAL */}
                {aiShow && (
                    <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh] animate-slideUp">
                            <div className="bg-blue-600 p-6 rounded-t-3xl flex justify-between items-center">
                                <div className="text-white">
                                    <h3 className="font-bold flex items-center gap-2"><span className="material-icons-outlined">auto_awesome</span> Asistente Gemini</h3>
                                    <p className="text-[10px] opacity-80 uppercase tracking-widest">Sugerencia Inteligente</p>
                                </div>
                                <button onClick={() => setAiShow(false)} className="text-white/50 hover:text-white"><span className="material-icons-outlined">close</span></button>
                            </div>

                            <div className="p-6 flex-1 overflow-y-auto space-y-4">
                                {!aiResult ? (
                                    <>
                                        <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-900 italic">
                                            Ayudaré a redactar el contenido para este campo basándome en la Ley de Donaciones Culturales.
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Instrucciones Adicionales</label>
                                            <textarea
                                                className="input-field mt-1 text-sm bg-slate-50"
                                                rows={3}
                                                placeholder="Ej: Hazlo más formal, enfócate en inclusión..."
                                                value={aiNotes}
                                                onChange={e => setAiNotes(e.target.value)}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Propuesta Generada</label>
                                        {aiResult.suggestions.map((s: any, idx: number) => (
                                            <div key={idx} className="p-4 border border-blue-100 rounded-xl bg-blue-50/50 hover:bg-blue-50 transition-colors group">
                                                <p className="text-sm text-slate-800 whitespace-pre-wrap">{typeof s === 'string' ? s : JSON.stringify(s)}</p>
                                                <button
                                                    onClick={() => handleApplyAi(typeof s === 'string' ? s : JSON.stringify(s))}
                                                    className="mt-3 w-full btn-primary h-8 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    USAR ESTA VERSIÓN
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-3xl">
                                {!aiResult ? (
                                    <button
                                        onClick={handleRunAi}
                                        disabled={aiLoading}
                                        className="btn-primary w-full h-12 text-sm"
                                    >
                                        {aiLoading ? 'GENERANDO...' : 'GENERAR PROPUESTA'}
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setAiResult(null)}
                                        className="btn-secondary w-full h-12 text-sm"
                                    >
                                        INTENTAR DE NUEVO
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
