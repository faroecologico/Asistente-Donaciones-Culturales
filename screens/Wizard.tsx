import React, { useState } from 'react';
import { useAppStore } from '../store';
import { AiRequestPayload, AiResponsePayload, AiTask, ProjectType } from '../types';
import { RETRIBUTION_EVIDENCE_OPTIONS } from '../constants';

// Step components or sub-renders
export const Wizard: React.FC = () => {
    const { currentProject, updateProject, apiKey, runValidation, validation } = useAppStore();
    const [activeStep, setActiveStep] = useState(0);
    const [loadingAi, setLoadingAi] = useState<AiTask | null>(null);
    const [showAiPanel, setShowAiPanel] = useState(false);

    if (!currentProject) return null;

    const steps = [
        "Datos Iniciales",
        "Beneficiario",
        "Datos del Proyecto",
        "Cronograma",
        "Presupuesto",
        "Documentos",
        "Revisión y Export"
    ];

    const runAi = async (task: AiTask, field?: string, userNotes?: string) => {
        setLoadingAi(task);
        try {
            const payload: AiRequestPayload = {
                projectId: currentProject.id,
                task,
                field,
                projectContext: currentProject,
                userNotes
            };

            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-gemini-api-key': apiKey || ''
                },
                body: JSON.stringify(payload)
            });

            const data: AiResponsePayload = await res.json();
            return data;
        } catch (e) {
            console.error(e);
            return null;
        } finally {
            setLoadingAi(null);
        }
    };

    const renderStep = () => {
        switch (activeStep) {
            case 0: return (
                <div className="space-y-6">
                    <div className="card p-6">
                        <h3 className="text-lg font-bold mb-4">Clasificación de Proyecto</h3>
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="label">Tipo de Proyecto (RF-05)</label>
                                <select
                                    className="input-field"
                                    value={currentProject.initial.projectType}
                                    onChange={e => updateProject({ initial: { ...currentProject.initial, projectType: e.target.value as ProjectType } })}
                                >
                                    {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            );
            case 2: return (
                <div className="space-y-6">
                    <div className="card p-6 relative">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-slate-900 leading-tight">Datos Narrativos</h3>
                            <button
                                onClick={() => setShowAiPanel(true)}
                                className="text-xs text-blue-600 font-bold flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
                                title="Abrir Asistente IA"
                            >
                                <span className="material-icons-outlined text-sm">auto_awesome</span>
                                ASISTENTE IA
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Título del Proyecto</label>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${currentProject.content.title.length > 150 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {currentProject.content.title.length}/150
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    className="input-field text-lg font-semibold"
                                    value={currentProject.content.title}
                                    onChange={e => updateProject({ content: { ...currentProject.content, title: e.target.value }, name: e.target.value })}
                                    placeholder="Ej: Festival de Teatro Comunitario 2024"
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Resumen Ejecutivo</label>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${currentProject.content.summary.length > 400 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>
                                        {currentProject.content.summary.length}/400
                                    </span>
                                </div>
                                <textarea
                                    rows={5}
                                    className="input-field leading-relaxed"
                                    value={currentProject.content.summary}
                                    onChange={e => updateProject({ content: { ...currentProject.content, summary: e.target.value } })}
                                    placeholder="Describe el impacto y actividades principales..."
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );
            case 6: return (
                <div className="space-y-6">
                    <div className="card p-8">
                        <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-icons-outlined text-green-600">fact_check</span>
                            Revisión y Exportación
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-700 border-b pb-2">Pre-flight Check</h4>
                                {steps.slice(0, 6).map((step, i) => {
                                    const hasError = validation?.errors[step.toLowerCase().replace(/ /g, '_')]; // simplified
                                    return (
                                        <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                            <span className="text-sm font-medium">{step}</span>
                                            <span className={`material-icons-outlined ${hasError ? 'text-red-500' : 'text-green-500'}`}>
                                                {hasError ? 'error_outline' : 'check_circle'}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-4">
                                <h4 className="font-bold text-slate-700 border-b pb-2">Acciones Finales</h4>
                                <button className="btn-primary w-full py-3 h-auto">
                                    <span className="material-icons-outlined">download</span>
                                    Generar Paquete de Postulación
                                </button>
                                <div className="grid grid-cols-2 gap-4">
                                    <button className="btn-secondary py-3 text-sm h-auto">Copiar Textos</button>
                                    <button className="btn-secondary py-3 text-sm h-auto">Checklist Docs</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
            default: return <div className="text-center py-20 text-slate-400 italic">Paso en construcción...</div>;
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-64px)] bg-slate-50 relative overflow-hidden">
            {/* Sidebar Stepper */}
            <aside className="w-full md:w-80 bg-white border-r border-slate-200 p-8 hidden md:block overflow-y-auto">
                <div className="mb-10">
                    <h2 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-4">Guía de Formulación</h2>
                    <div className="bg-slate-100 h-1 rounded-full w-full relative">
                        <div
                            className="absolute left-0 top-0 h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                        ></div>
                    </div>
                </div>

                <nav className="space-y-3">
                    {steps.map((step, idx) => (
                        <button
                            key={idx}
                            onClick={() => setActiveStep(idx)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all group ${activeStep === idx
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-100 translate-x-1'
                                    : idx < activeStep
                                        ? 'text-slate-900 border border-slate-100 hover:border-blue-200 hover:bg-white'
                                        : 'text-slate-400 grayscale hover:grayscale-0 pointer-events-none'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold border transition-colors ${activeStep === idx ? 'bg-blue-500 border-blue-400' : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}>
                                {idx + 1}
                            </div>
                            <span className="text-sm font-bold flex-1">{step}</span>
                            {idx < activeStep && <span className="material-icons-outlined text-green-500 text-sm">check_circle</span>}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
                    <div className="min-w-0 flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black rounded tracking-widest uppercase">Paso {activeStep + 1}</span>
                            <h2 className="text-xs font-bold text-slate-400 truncate">{currentProject.name || "Nuevo Proyecto"}</h2>
                        </div>
                        <h1 className="text-xl font-black text-slate-900 truncate tracking-tight">{steps[activeStep]}</h1>
                    </div>

                    <div className="flex gap-3 shrink-0">
                        <button
                            onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                            disabled={activeStep === 0}
                            className="btn-secondary px-5 h-10 text-sm"
                        >
                            Anterior
                        </button>
                        <button
                            onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                            className="btn-primary px-8 h-10 text-sm"
                        >
                            {activeStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto pb-20">
                        {renderStepContent()}
                    </div>
                </div>
            </main>

            {/* AI Assistant Modal/Panel */}
            {showAiPanel && (
                <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-slideUp">
                        <header className="bg-blue-600 py-6 px-10 text-white flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="material-icons-outlined text-3xl">auto_awesome</span>
                                <div>
                                    <h2 className="text-lg font-black tracking-tight leading-none">Asistente Gemini</h2>
                                    <p className="text-[10px] text-blue-100 font-bold opacity-80 uppercase tracking-widest mt-1">Sugerencia Inteligente</p>
                                </div>
                            </div>
                            <button onClick={() => setShowAiPanel(false)} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                                <span className="material-icons-outlined text-xl">close</span>
                            </button>
                        </header>

                        <div className="p-10 space-y-8">
                            <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                                <p className="text-sm text-slate-700 leading-relaxed italic">"Hola. Puedo ayudarte a redactar el **{steps[activeStep]}** de tu proyecto basándome en la Ley 18.985. ¿Tienes alguna instrucción adicional?"</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contexto Extra (Opcional)</label>
                                <textarea
                                    placeholder="Ej: Incluye lenguaje formal, enfócate en el impacto social..."
                                    className="input-field min-h-[120px] bg-slate-50 border-slate-100"
                                />
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-slate-100">
                                <button className="btn-secondary flex-1 py-4 text-sm font-bold" onClick={() => setShowAiPanel(false)}>Cancelar</button>
                                <button
                                    className="btn-primary flex-1 py-4 text-sm font-bold shadow-xl shadow-blue-200"
                                    onClick={async () => {
                                        const res = await runAi(activeStep === 2 ? 'generate_summary' : 'generate_title');
                                        if (res) {
                                            alert("IA generó sugerencia: " + res.suggestions[0]);
                                            setShowAiPanel(false);
                                        }
                                    }}
                                >
                                    {loadingAi ? 'PROCESANDO...' : 'GENERAR PROPUESTA'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Helper inside to keep it simple for now
    function renderStepContent() {
        return renderStep();
    }
};
