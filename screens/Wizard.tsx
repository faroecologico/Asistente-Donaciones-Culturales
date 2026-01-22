import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { AiRequestPayload, AiResponsePayload, AiTask, ProjectType, BeneficiaryType } from '../types';

// Steps Configuration
const STEPS = [
    { id: 'entity_type', label: 'Entidad & Tipo', icon: 'looks_one' },
    { id: 'beneficiary', label: 'Beneficiario', icon: 'looks_two' },
    { id: 'project_data', label: 'Datos Proyecto', icon: 'looks_3' },
    { id: 'retribution', label: 'Retribución', icon: 'looks_4' },
    { id: 'timeline', label: 'Cronograma', icon: 'looks_5' },
    { id: 'budget', label: 'Presupuesto', icon: 'looks_6' },
    { id: 'docs', label: 'Documentos', icon: 'looks_6' }, // Reusing icon for simplicity
    { id: 'review', label: 'Revisión', icon: 'check_circle' },
];

export const Wizard: React.FC = () => {
    const { currentProject, updateProject, apiKey, runValidation, validation } = useAppStore();
    const navigate = useNavigate();
    const [loadingAi, setLoadingAi] = useState<string | null>(null);
    const [activeStepIndex, setActiveStepIndex] = useState(0);

    useEffect(() => {
        if (!currentProject) {
            navigate('/');
        }
    }, [currentProject, navigate]);

    if (!currentProject) return null;

    const activeStep = STEPS[activeStepIndex];

    const handleNext = () => {
        if (activeStepIndex < STEPS.length - 1) {
            setActiveStepIndex(prev => prev + 1);
            runValidation();
        }
    };

    const handleBack = () => {
        if (activeStepIndex > 0) {
            setActiveStepIndex(prev => prev - 1);
        }
    };

    // --- AI Handler ---
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
            }
        } catch (err) {
            console.error(err);
            alert("Error generating content. Please check API Key.");
        } finally {
            setLoadingAi(null);
        }
    };

    // --- RENDER CONTENT BY STEP ---
    const renderStepContent = () => {
        switch (activeStep.id) {
            case 'entity_type':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="border border-blue-100 bg-blue-50 p-6 rounded-xl">
                            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                <span className="material-icons-outlined">domain</span>
                                1. Selección de Entidad Beneficiaria
                            </h3>
                            <select
                                className="input-field bg-white"
                                value={currentProject.initial.entityId || ''}
                                onChange={(e) => updateProject({ initial: { ...currentProject.initial, entityId: e.target.value } })}
                            >
                                <option value="">-- Seleccionar Entidad Existente --</option>
                                {/* MOCK ENTITIES from Store would go here if available */}
                            </select>

                            <button className="w-full mt-4 py-3 border-2 border-dashed border-blue-300 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-2 font-medium">
                                <span className="material-icons-outlined">add_circle_outline</span>
                                Crear Nueva Entidad
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre del Proyecto (Interno)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={currentProject.name}
                                    onChange={(e) => updateProject({ name: e.target.value })}
                                    placeholder="Ej: Festival de Teatro 2026"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Tipo de Proyecto (RF-05)</label>
                                <select
                                    className="input-field"
                                    value={currentProject.initial.projectType}
                                    onChange={(e) => updateProject({ initial: { ...currentProject.initial, projectType: e.target.value as ProjectType } })}
                                >
                                    {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                                    <span className="material-icons-outlined text-sm">info</span>
                                    Seleccione solo un tipo. Si su proyecto es mixto, deberá separarlo.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'beneficiary':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Datos de la Entidad</h3>
                            <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">Nombre</label>
                                    <p className="text-slate-900 font-medium">{currentProject.beneficiary.entity?.name || '---'}</p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-400 uppercase">RUT</label>
                                    <p className="text-slate-900 font-medium">{currentProject.beneficiary.entity?.rut || '---'}</p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Clasificación</label>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-slate-900 font-medium">Jurídica</span>
                                        {/* Mock tags */}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Representante Legal</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Nombre Completo</label>
                                    <input type="text" className="input-field" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">RUT</label>
                                        <input type="text" className="input-field" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                                        <input type="email" className="input-field" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'project_data':
                return (
                    <div className="space-y-6 animate-fadeIn">
                        {/* Title Section */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-slate-700">Título del Proyecto</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400">{currentProject.content.title.length}/150</span>
                                    <button
                                        onClick={() => runAiTask('generate_title')}
                                        disabled={loadingAi === 'generate_title'}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                    >
                                        <span className="material-icons-outlined text-sm">auto_awesome</span>
                                        Generar con IA
                                    </button>
                                </div>
                            </div>
                            <input
                                type="text"
                                className="input-field"
                                value={currentProject.content.title}
                                onChange={(e) => updateProject({ content: { ...currentProject.content, title: e.target.value } })}
                                placeholder="Un título descriptivo y claro..."
                            />
                        </div>

                        {/* Location */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold">
                                <span className="material-icons-outlined text-slate-400">place</span>
                                Ubicación
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Región</label>
                                    <input type="text" className="input-field" placeholder="Ej: Maule" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Comuna</label>
                                    <input type="text" className="input-field" placeholder="Ej: Talca" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Espacio/Lugar</label>
                                    <input type="text" className="input-field" placeholder="Ej: Teatro Regional" />
                                </div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-semibold text-slate-700">Resumen Ejecutivo</label>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400">{currentProject.content.summary.length}/400</span>
                                    <button
                                        onClick={() => runAiTask('generate_summary')}
                                        disabled={loadingAi === 'generate_summary'}
                                        className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                                    >
                                        <span className="material-icons-outlined text-sm">auto_awesome</span>
                                        Generar con IA
                                    </button>
                                </div>
                            </div>
                            <textarea
                                rows={6}
                                className="input-field resize-none"
                                value={currentProject.content.summary}
                                onChange={(e) => updateProject({ content: { ...currentProject.content, summary: e.target.value } })}
                                placeholder="Describe brevemente de qué trata el proyecto..."
                            />
                        </div>
                    </div>
                );

            default:
                return (
                    <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                        <span className="material-icons-outlined text-6xl mb-4">construction</span>
                        <h3 className="text-lg font-medium text-slate-600">En Construcción</h3>
                        <p>Esta sección ({activeStep.label}) estará disponible pronto.</p>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)] bg-slate-50">
            {/* LEFT SIDEBAR - STEPPER */}
            <aside className="w-full md:w-64 flex-shrink-0 bg-white border-r border-slate-200 hidden md:block">
                <div className="p-6">
                    <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Nuevo Proyecto</h2>
                    <div className="bg-slate-100 text-slate-600 px-2 py-1 rounded text-xs inline-block mb-6 font-medium">
                        {currentProject.status.toUpperCase()}
                    </div>

                    <nav className="space-y-1">
                        {STEPS.map((step, idx) => {
                            const isActive = idx === activeStepIndex;
                            const isCompleted = idx < activeStepIndex;

                            return (
                                <button
                                    key={step.id}
                                    onClick={() => setActiveStepIndex(idx)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${isActive
                                            ? 'bg-blue-50 text-blue-700 shadow-sm'
                                            : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border ${isActive
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : isCompleted
                                                ? 'bg-green-100 text-green-700 border-green-200'
                                                : 'bg-white text-slate-400 border-slate-200'
                                        }`}>
                                        {isCompleted ? <span className="material-icons-outlined text-sm">check</span> : (idx + 1)}
                                    </div>
                                    <span>{step.label}</span>
                                </button>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col">
                {/* Mobile Stepper Header (visible only on small screens) */}
                <div className="md:hidden bg-white p-4 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                    <span className="text-sm font-bold text-slate-700">{activeStep.label}</span>
                    <span className="text-xs text-slate-400">Paso {activeStepIndex + 1} / {STEPS.length}</span>
                </div>

                {/* Header Action Bar */}
                <div className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <h2 className="text-lg font-bold text-slate-800">{activeStep.label}</h2>
                    </div>
                    <div className="flex gap-3">
                        <button className="btn-ghost text-sm">
                            <span className="material-icons-outlined text-lg">save</span>
                            Guardar Avance
                        </button>
                        <button
                            onClick={handleBack}
                            disabled={activeStepIndex === 0}
                            className="btn-secondary"
                        >
                            Atrás
                        </button>
                        <button
                            onClick={handleNext}
                            className="btn-primary"
                        >
                            {activeStepIndex === STEPS.length - 1 ? 'Finalizar' : 'Siguiente'}
                        </button>
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        {renderStepContent()}
                    </div>
                </div>
            </main>
        </div>
    );
};
