import React, { useState } from 'react';
import { useAppStore } from '../store';
import { AiRequestPayload, AiResponsePayload, AiTask, ProjectType, BeneficiaryType } from '../types';
import { RETRIBUTION_EVIDENCE_OPTIONS, RETRIBUTION_METRICS_OPTIONS } from '../constants';

import { generateChecklist } from '../lib/documentRules';

export const Wizard: React.FC = () => {
    const { currentProject, updateProject, apiKey, runValidation, validation } = useAppStore();
    const [activeStep, setActiveStep] = useState(0);
    const [loadingAi, setLoadingAi] = useState<AiTask | null>(null);
    const [showAiPanel, setShowAiPanel] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

    // Auto-generate checklist if empty when entering step 5
    React.useEffect(() => {
        if (activeStep === 5 && currentProject && currentProject.documents.length === 0) {
            const docs = generateChecklist(
                currentProject.initial.beneficiaryType,
                currentProject.initial.beneficiaryCategory,
                currentProject.initial.beneficiaryClass
            );
            updateProject({ documents: docs });
        }
    }, [activeStep]);

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
            setAiSuggestions(data.suggestions || []);
            return data;
        } catch (e) {
            console.error(e);
            return null;
        } finally {
            setLoadingAi(null);
        }
    };

    const applyAiSuggestion = (suggestion: any) => {
        if (typeof suggestion === 'string') {
            // For title or summary
            if (activeStep === 2) {
                if (suggestion.length > 200) {
                    updateProject({ content: { ...currentProject.content, summary: suggestion } });
                } else {
                    updateProject({ content: { ...currentProject.content, title: suggestion }, name: suggestion });
                }
            }
        } else if (suggestion.general) {
            updateProject({
                content: {
                    ...currentProject.content,
                    objectivesGeneral: suggestion.general,
                    objectivesSpecific: suggestion.specific
                }
            });
        } else if (suggestion.structured) {
            updateProject({
                content: {
                    ...currentProject.content,
                    culturalRetribution: suggestion.text,
                    retributionStructured: suggestion.structured
                },
                retributionMeta: {
                    metrics: suggestion.metrics,
                    evidence: suggestion.evidence
                }
            });
        }
        setShowAiPanel(false);
        setAiSuggestions([]);
    };

    const renderStep = () => {
        switch (activeStep) {
            case 0: return (
                <div className="space-y-6 animate-fadeIn">
                    <div className="card p-8">
                        <h3 className="text-xl font-black mb-6 text-slate-800">1. Configuración Básica</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tipo de Proyecto (RF-05)</label>
                                <select
                                    className="input-field"
                                    value={currentProject.initial.projectType}
                                    onChange={e => updateProject({ initial: { ...currentProject.initial, projectType: e.target.value as ProjectType } })}
                                >
                                    {Object.values(ProjectType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                <p className="text-[10px] text-slate-400 mt-2 font-medium">Nota: Si tu proyecto es mixto, debes declarar el tipo predominante.</p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Tipo de Beneficiario (RF-06)</label>
                                <select
                                    className="input-field"
                                    value={currentProject.initial.beneficiaryType}
                                    onChange={e => updateProject({ initial: { ...currentProject.initial, beneficiaryType: e.target.value as BeneficiaryType } })}
                                >
                                    {Object.values(BeneficiaryType).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            );

            case 1: return (
                <div className="space-y-6 animate-fadeIn">
                    <div className="card p-8">
                        <h3 className="text-xl font-black mb-6 text-slate-800">2. Datos de la Entidad</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Razón Social</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={currentProject.beneficiary.entity?.name || ''}
                                    onChange={e => updateProject({ beneficiary: { ...currentProject.beneficiary, entity: { ...currentProject.beneficiary.entity!, name: e.target.value } } })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">RUT Entidad</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="xx.xxx.xxx-x"
                                    value={currentProject.beneficiary.entity?.rut || ''}
                                    onChange={e => updateProject({ beneficiary: { ...currentProject.beneficiary, entity: { ...currentProject.beneficiary.entity!, rut: e.target.value } } })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card p-8">
                        <h3 className="text-xl font-black mb-6 text-slate-800">Representante Legal</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Nombre Completo</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={currentProject.beneficiary.legalRep.name}
                                    onChange={e => updateProject({ beneficiary: { ...currentProject.beneficiary, legalRep: { ...currentProject.beneficiary.legalRep, name: e.target.value } } })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">RUT Rep. Legal</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={currentProject.beneficiary.legalRep.rut}
                                    onChange={e => updateProject({ beneficiary: { ...currentProject.beneficiary, legalRep: { ...currentProject.beneficiary.legalRep, rut: e.target.value } } })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Email de Contacto</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    value={currentProject.beneficiary.legalRep.email}
                                    onChange={e => updateProject({ beneficiary: { ...currentProject.beneficiary, legalRep: { ...currentProject.beneficiary.legalRep, email: e.target.value } } })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );

            case 2: return (
                <div className="space-y-6 animate-fadeIn">
                    <div className="card p-8 relative">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-800">3. Datos Narrativos</h3>
                            <button
                                onClick={() => setShowAiPanel(true)}
                                className="text-[10px] text-white font-black flex items-center gap-2 bg-blue-600 px-4 py-2 rounded-full hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
                            >
                                <span className="material-icons-outlined text-sm">auto_awesome</span>
                                ASISTENTE IA
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Título del Proyecto</label>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${currentProject.content.title.length > 150 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {currentProject.content.title.length}/150
                                    </span>
                                </div>
                                <input
                                    type="text"
                                    className="input-field text-lg font-bold"
                                    value={currentProject.content.title}
                                    onChange={e => updateProject({ content: { ...currentProject.content, title: e.target.value }, name: e.target.value })}
                                />
                            </div>

                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Resumen Ejecutivo</label>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${currentProject.content.summary.length > 400 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                                        {currentProject.content.summary.length}/400
                                    </span>
                                </div>
                                <textarea
                                    rows={5}
                                    className="input-field text-sm leading-relaxed"
                                    value={currentProject.content.summary}
                                    onChange={e => updateProject({ content: { ...currentProject.content, summary: e.target.value } })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="card p-8">
                        <h3 className="text-xl font-black mb-6 text-slate-800">Ubicación y Tiempo</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Región</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={currentProject.content.locationRegion}
                                    onChange={e => updateProject({ content: { ...currentProject.content, locationRegion: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Comuna(s)</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    value={currentProject.content.locationComuna}
                                    onChange={e => updateProject({ content: { ...currentProject.content, locationComuna: e.target.value } })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Duración (Meses)</label>
                                <input
                                    type="number"
                                    className="input-field"
                                    value={currentProject.content.durationMonths}
                                    onChange={e => updateProject({ content: { ...currentProject.content, durationMonths: parseInt(e.target.value) || 0 } })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            );

            case 3: return (
                <div className="space-y-6 animate-fadeIn">
                    <div className="card p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">4. Cronograma de Actividades</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Mínimo 1 actividad requerida</p>
                            </div>
                            <button
                                onClick={() => {
                                    const newAct = { id: Math.random().toString(), name: "Nueva Actividad", unit: "meses" as any, duration: 1, description: "" };
                                    updateProject({ timeline: [...currentProject.timeline, newAct] });
                                }}
                                className="btn-secondary h-10 px-4 text-xs"
                            >
                                <span className="material-icons-outlined text-sm">add</span>
                                Agregar
                            </button>
                        </div>

                        {currentProject.timeline.length === 0 ? (
                            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl py-12 text-center">
                                <span className="material-icons-outlined text-slate-300 text-4xl mb-4">calendar_month</span>
                                <p className="text-sm font-bold text-slate-400">Sin actividades registradas.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {currentProject.timeline.map((act, i) => (
                                    <div key={act.id} className="flex gap-4 items-start bg-slate-50 p-6 rounded-2xl border border-slate-100 group">
                                        <div className="flex-1 space-y-4">
                                            <input
                                                className="bg-transparent border-b border-slate-200 w-full font-bold text-slate-800 focus:border-blue-500 outline-none pb-1"
                                                value={act.name}
                                                onChange={e => {
                                                    const newList = [...currentProject.timeline];
                                                    newList[i].name = e.target.value;
                                                    updateProject({ timeline: newList });
                                                }}
                                            />
                                            <div className="grid grid-cols-2 gap-4">
                                                <input
                                                    placeholder="Descripción corta..."
                                                    className="bg-transparent text-xs text-slate-500 outline-none"
                                                    value={act.description}
                                                    onChange={e => {
                                                        const newList = [...currentProject.timeline];
                                                        newList[i].description = e.target.value;
                                                        updateProject({ timeline: newList });
                                                    }}
                                                />
                                                <div className="flex items-center gap-2 justify-end">
                                                    <input
                                                        type="number"
                                                        className="w-12 bg-white border border-slate-200 rounded px-1 text-center text-xs py-1"
                                                        value={act.duration}
                                                        onChange={e => {
                                                            const newList = [...currentProject.timeline];
                                                            newList[i].duration = parseInt(e.target.value) || 0;
                                                            updateProject({ timeline: newList });
                                                        }}
                                                    />
                                                    <span className="text-[10px] font-black uppercase text-slate-400">Meses</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => updateProject({ timeline: currentProject.timeline.filter(x => x.id !== act.id) })}
                                            className="p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-500 transition-all"
                                        >
                                            <span className="material-icons-outlined text-lg">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            );

            case 4: return (
                <div className="space-y-6 animate-fadeIn">
                    <div className="card p-8">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">5. Presupuesto</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-1">Estimación de gastos principales</p>
                            </div>
                            <button
                                onClick={() => {
                                    const newItem = { id: Math.random().toString(), description: "Nuevo ítem", amount: 0, category: "Otros" };
                                    updateProject({ budget: [...currentProject.budget, newItem] });
                                }}
                                className="btn-secondary h-10 px-4 text-xs"
                            >
                                <span className="material-icons-outlined text-sm">add</span>
                                Agregar Gasto
                            </button>
                        </div>

                        <div className="space-y-4">
                            {currentProject.budget.map((item, i) => (
                                <div key={item.id} className="flex items-center gap-6 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <div className="flex-1">
                                        <input
                                            className="bg-transparent border-b border-slate-200 w-full font-bold text-slate-700 outline-none pb-1"
                                            value={item.description}
                                            onChange={e => {
                                                const newList = [...currentProject.budget];
                                                newList[i].description = e.target.value;
                                                updateProject({ budget: newList });
                                            }}
                                        />
                                    </div>
                                    <div className="w-32">
                                        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                                            <span className="text-slate-400 text-xs font-bold">$</span>
                                            <input
                                                type="number"
                                                className="w-full text-sm font-black text-slate-900 outline-none bg-transparent"
                                                value={item.amount}
                                                onChange={e => {
                                                    const newList = [...currentProject.budget];
                                                    newList[i].amount = parseInt(e.target.value) || 0;
                                                    updateProject({ budget: newList });
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => updateProject({ budget: currentProject.budget.filter(x => x.id !== item.id) })}
                                        className="text-slate-300 hover:text-red-500"
                                    >
                                        <span className="material-icons-outlined">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center">
                            <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Total Estimado</span>
                            <span className="text-3xl font-black text-slate-900">
                                ${currentProject.budget.reduce((acc, x) => acc + x.amount, 0).toLocaleString('es-CL')}
                            </span>
                        </div>
                    </div>
                </div>
            );

            case 5: return (
                <div className="space-y-6 animate-fadeIn">
                    <div className="card p-8">
                        <h3 className="text-xl font-black mb-2 text-slate-800">6. Checklist Documental</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-8">Según Ley 18.985 para {currentProject.initial.beneficiaryType}</p>

                        <div className="space-y-3">
                            {currentProject.documents.map((doc, i) => (
                                <div key={doc.id} className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div
                                        onClick={() => {
                                            const newList = [...currentProject.documents];
                                            newList[i].status = doc.status === 'Adjunto' ? 'Pendiente' : 'Adjunto';
                                            updateProject({ documents: newList });
                                        }}
                                        className={`w-6 h-6 rounded-full flex items-center justify-center cursor-pointer transition-colors ${doc.status === 'Adjunto' ? 'bg-green-500 text-white' : 'border-2 border-slate-200'}`}
                                    >
                                        {doc.status === 'Adjunto' && <span className="material-icons-outlined text-sm">check</span>}
                                    </div>
                                    <div className="flex-1">
                                        <p className={`text-sm font-bold ${doc.status === 'Adjunto' ? 'text-slate-800' : 'text-slate-400'}`}>{doc.name}</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            {doc.required && <span className="text-[9px] font-black text-red-500 bg-red-50 px-1.5 py-0.5 rounded uppercase uppercase">Obligatorio</span>}
                                            {doc.fileName && <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                                <span className="material-icons-outlined text-[10px]">attach_file</span>
                                                {doc.fileName}
                                            </span>}
                                        </div>
                                    </div>
                                    <button className="text-slate-400 hover:text-blue-600">
                                        <span className="material-icons-outlined">file_upload</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );

            case 6: return (
                <div className="space-y-6 animate-fadeIn">
                    <div className="card p-10">
                        <h3 className="text-3xl font-black mb-8 flex items-center gap-4 text-slate-900">
                            <span className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center text-white shadow-lg shadow-green-100">
                                <span className="material-icons-outlined text-2xl">verified</span>
                            </span>
                            Resumen de Validación
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Estado por Secciones</h4>
                                {steps.map((step, i) => {
                                    const fieldKey = step.toLowerCase().replace(/ /g, '_');
                                    const errors = validation?.errors[fieldKey] || [];
                                    const warnings = validation?.warnings[fieldKey] || [];

                                    return (
                                        <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                            <span className="text-sm font-black text-slate-700">{step}</span>
                                            <div className="flex items-center gap-2">
                                                {errors.length > 0 ? (
                                                    <span className="bg-red-500 text-white p-1 rounded-full flex items-center justify-center h-5 w-5" title={errors.join('\n')}>
                                                        <span className="material-icons-outlined text-xs">close</span>
                                                    </span>
                                                ) : warnings.length > 0 ? (
                                                    <span className="bg-amber-400 text-white p-1 rounded-full flex items-center justify-center h-5 w-5" title={warnings.join('\n')}>
                                                        <span className="material-icons-outlined text-xs">priority_high</span>
                                                    </span>
                                                ) : (
                                                    <span className="bg-green-500 text-white p-1 rounded-full flex items-center justify-center h-5 w-5">
                                                        <span className="material-icons-outlined text-xs">check</span>
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="space-y-6">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 pb-3">Generar Entregables</h4>
                                <div className="space-y-4">
                                    <button className="btn-primary w-full h-16 text-sm">
                                        <span className="material-icons-outlined text-xl">file_download</span>
                                        DESCARGAR PAQUETE ZIP (.zip)
                                    </button>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button className="btn-secondary h-14 text-xs font-black">
                                            <span className="material-icons-outlined text-lg">content_copy</span>
                                            COPIAR TEXTOS
                                        </button>
                                        <button className="btn-secondary h-14 text-xs font-black">
                                            <span className="material-icons-outlined text-lg">list_alt</span>
                                            LISTA DOCS
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mt-6">
                                    <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2">Próximos Pasos</h5>
                                    <p className="text-xs text-blue-900 font-medium leading-relaxed">Una vez descargados los archivos, ingrese al portal de **Donaciones Culturales** y utilice el material para completar su postulación oficial.</p>
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
                            onClick={() => {
                                setActiveStep(idx);
                                runValidation();
                            }}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all group ${activeStep === idx
                                ? 'bg-blue-600 text-white shadow-xl shadow-blue-100 translate-x-1'
                                : idx < activeStep
                                    ? 'text-slate-900 border border-slate-100 hover:border-blue-200 hover:bg-white'
                                    : 'text-slate-400 border border-transparent grayscale select-none'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black border transition-colors ${activeStep === idx ? 'bg-blue-500 border-blue-400' : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}>
                                {idx + 1}
                            </div>
                            <span className="text-sm font-black flex-1">{step}</span>
                            {idx < activeStep && <span className="material-icons-outlined text-green-500 text-sm">check_circle</span>}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0">
                <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-50">
                    <div className="min-w-0 flex-1 mr-4">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black rounded tracking-widest uppercase italic">Paso {activeStep + 1}</span>
                            <h2 className="text-[11px] font-black text-slate-300 truncate uppercase tracking-widest">{currentProject.name || "Nuevo Proyecto"}</h2>
                        </div>
                        <h1 className="text-xl font-black text-slate-900 truncate tracking-tight uppercase leading-none">{steps[activeStep]}</h1>
                    </div>

                    <div className="flex gap-4 shrink-0">
                        <button
                            onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                            disabled={activeStep === 0}
                            className="btn-secondary px-6 h-11 text-xs"
                        >
                            <span className="material-icons-outlined text-sm">west</span>
                            Anterior
                        </button>
                        <button
                            onClick={() => {
                                if (activeStep < steps.length - 1) {
                                    setActiveStep(prev => prev + 1);
                                    runValidation();
                                }
                            }}
                            className="btn-primary px-10 h-11 text-xs"
                        >
                            {activeStep === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
                            <span className="material-icons-outlined text-sm">east</span>
                        </button>
                    </div>
                </header>

                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-4xl mx-auto">
                        <div className="animate-slideUp">
                            {renderStepContent()}
                        </div>
                    </div>
                </div>
            </main>

            {/* AI Assistant Modal */}
            {showAiPanel && (
                <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-slideUp">
                        <header className="bg-slate-900 py-8 px-10 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <span className="material-icons-outlined text-3xl">auto_awesome</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight leading-none mb-1 text-blue-50">GPT-4 Asistente</h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Sugerencia Legislativa Art. 8°</p>
                                </div>
                            </div>
                            <button onClick={() => { setShowAiPanel(false); setAiSuggestions([]); }} className="hover:bg-white/10 p-2 rounded-full transition-colors text-slate-400">
                                <span className="material-icons-outlined text-2xl">close</span>
                            </button>
                        </header>

                        <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto">
                            {aiSuggestions.length === 0 ? (
                                <>
                                    <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
                                        <p className="text-sm text-slate-700 leading-relaxed font-medium">
                                            "Hola. Puedo redactar el **{steps[activeStep]}** de tu proyecto asegurando coherencia técnica. ¿Deseas que use tu descripción actual o tienes nuevas notas?"
                                        </p>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Instrucciones Adicionales</label>
                                        <textarea
                                            placeholder="Ej: Destaca el impacto en jóvenes vulnerables..."
                                            className="input-field min-h-[120px] bg-slate-50 border-slate-100 text-sm"
                                        />
                                    </div>
                                    <button
                                        disabled={loadingAi !== null}
                                        className="btn-primary w-full py-5 h-auto text-sm shadow-2xl shadow-blue-200"
                                        onClick={async () => {
                                            const task = activeStep === 2 ? 'generate_summary' : 'generate_title';
                                            await runAi(task);
                                        }}
                                    >
                                        {loadingAi ? 'ANALIZANDO CONTEXTO...' : 'GENERAR PROPUESTA INTELIGENTE'}
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Sugerencias Generadas</h3>
                                    {aiSuggestions.map((s, idx) => (
                                        <div key={idx} className="group p-6 bg-slate-50 rounded-3xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all">
                                            <p className="text-sm font-bold text-slate-800 leading-relaxed mb-6">{typeof s === 'string' ? s : JSON.stringify(s)}</p>
                                            <button
                                                onClick={() => applyAiSuggestion(s)}
                                                className="btn-primary h-10 text-[10px] px-6 w-auto ml-auto"
                                            >
                                                APLICAR ESTA VERSIÓN
                                            </button>
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => setAiSuggestions([])}
                                        className="w-full py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors"
                                    >
                                        Reintentar con nuevas notas
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    function renderStepContent() {
        return renderStep();
    }
};
