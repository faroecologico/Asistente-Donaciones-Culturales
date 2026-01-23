import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { AiTask, AiResponsePayload, Actividad, ItemPresupuesto, Project } from '../types';
import { getRequiredDocuments } from '../lib/documentRules';

/**
 * UTILITY: Safe value accessor
 * Helper to safely get nested values or defaults to avoid crashes
 */
const getVal = (obj: any, path: string, def: any = '') => {
    return path.split('.').reduce((acc, part) => acc && acc[part] !== undefined ? acc[part] : undefined, obj) ?? def;
};

// --- SUB COMPONENTS FOR STEPS ---

const StepBeneficiary: React.FC = () => {
    const { currentProject, updateDeepProject } = useAppStore();
    if (!currentProject) return null;

    return (
        <div className="space-y-8 animate-slideUp">
            <div className="card p-4 md:p-8">
                <h3 className="text-xl font-bold mb-6 text-slate-900 border-b pb-2">1. Entidad Beneficiaria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label text-xs font-bold text-slate-500 uppercase">Razón Social</label>
                        <input
                            className="input-field"
                            value={currentProject.paso1_beneficiario.entidad.razon_social}
                            onChange={(e) => updateDeepProject('paso1_beneficiario.entidad.razon_social', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label text-xs font-bold text-slate-500 uppercase">RUT Entidad</label>
                        <input
                            className="input-field"
                            value={currentProject.paso1_beneficiario.entidad.rut}
                            onChange={(e) => updateDeepProject('paso1_beneficiario.entidad.rut', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label text-xs font-bold text-slate-500 uppercase">Domicilio (Calle/N°)</label>
                        <input
                            className="input-field"
                            value={currentProject.paso1_beneficiario.entidad.domicilio}
                            onChange={(e) => updateDeepProject('paso1_beneficiario.entidad.domicilio', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label text-xs font-bold text-slate-500 uppercase">Comuna / Región</label>
                        <input
                            className="input-field"
                            value={currentProject.paso1_beneficiario.entidad.comuna}
                            onChange={(e) => updateDeepProject('paso1_beneficiario.entidad.comuna', e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="card p-4 md:p-8">
                <h3 className="text-xl font-bold mb-6 text-slate-900 border-b pb-2">2. Representante Legal</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="label text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                        <input
                            className="input-field"
                            value={currentProject.paso1_beneficiario.representante_legal.nombre}
                            onChange={(e) => updateDeepProject('paso1_beneficiario.representante_legal.nombre', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="label text-xs font-bold text-slate-500 uppercase">RUT Representante</label>
                        <input
                            className="input-field"
                            value={currentProject.paso1_beneficiario.representante_legal.rut}
                            onChange={(e) => updateDeepProject('paso1_beneficiario.representante_legal.rut', e.target.value)}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const StepProjectData: React.FC<{ onOpenAi: (task: AiTask, field: string, context?: string) => void }> = ({ onOpenAi }) => {
    const { currentProject, updateDeepProject } = useAppStore();
    if (!currentProject) return null;

    return (
        <div className="space-y-8 animate-slideUp">
            {/* TITLE & SUMMARY */}
            <div className="card p-4 md:p-8">
                <div className="flex justify-between mb-2">
                    <label className="text-sm font-bold text-slate-900">Título del Proyecto (Máx 150 car.)</label>
                    <button onClick={() => onOpenAi('refine_field', 'paso2_datos_proyecto.titulo.texto')} className="text-blue-600 text-xs font-bold flex items-center gap-1"><span className="material-icons-outlined text-sm">auto_awesome</span> MEJORAR</button>
                </div>
                <input
                    className="input-field mb-1"
                    maxLength={150}
                    value={currentProject.paso2_datos_proyecto.titulo.texto}
                    onChange={(e) => updateDeepProject('paso2_datos_proyecto.titulo.texto', e.target.value)}
                />
                <div className="text-right text-[10px] text-slate-400">{currentProject.paso2_datos_proyecto.titulo.texto.length}/150</div>

                <div className="flex justify-between mb-2 mt-6">
                    <label className="text-sm font-bold text-slate-900">Resumen Ejecutivo (Máx 400 car.)</label>
                    <button onClick={() => onOpenAi('refine_field', 'paso2_datos_proyecto.resumen.texto')} className="text-blue-600 text-xs font-bold flex items-center gap-1"><span className="material-icons-outlined text-sm">auto_awesome</span> MEJORAR</button>
                </div>
                <textarea
                    className="input-field mb-1"
                    rows={4}
                    maxLength={400}
                    value={currentProject.paso2_datos_proyecto.resumen.texto}
                    onChange={(e) => updateDeepProject('paso2_datos_proyecto.resumen.texto', e.target.value)}
                />
                <div className="text-right text-[10px] text-slate-400">{currentProject.paso2_datos_proyecto.resumen.texto.length}/400</div>
            </div>

            {/* OBJECTIVES */}
            <div className="card p-4 md:p-8">
                <h3 className="text-xl font-bold mb-4 text-slate-900">Objetivos</h3>
                <label className="label text-xs font-bold text-slate-500 uppercase mt-4 block">Objetivo General</label>
                <textarea
                    className="input-field mt-1"
                    rows={2}
                    value={currentProject.paso2_datos_proyecto.objetivos.objetivo_general}
                    onChange={(e) => updateDeepProject('paso2_datos_proyecto.objetivos.objetivo_general', e.target.value)}
                />

                <label className="label text-xs font-bold text-slate-500 uppercase mt-6 block">Objetivos Específicos</label>
                {currentProject.paso2_datos_proyecto.objetivos.objetivos_especificos.map((obj, i) => (
                    <div key={i} className="flex gap-2 mt-2">
                        <input
                            className="input-field py-2 text-sm"
                            value={obj}
                            onChange={(e) => {
                                const newObjs = [...currentProject.paso2_datos_proyecto.objetivos.objetivos_especificos];
                                newObjs[i] = e.target.value;
                                updateDeepProject('paso2_datos_proyecto.objetivos.objetivos_especificos', newObjs);
                            }}
                        />
                        <button
                            onClick={() => {
                                const newObjs = currentProject.paso2_datos_proyecto.objetivos.objetivos_especificos.filter((_, idx) => idx !== i);
                                updateDeepProject('paso2_datos_proyecto.objetivos.objetivos_especificos', newObjs);
                            }}
                            className="text-red-400 hover:text-red-600"
                        >
                            <span className="material-icons-outlined">delete</span>
                        </button>
                    </div>
                ))}
                <button
                    onClick={() => updateDeepProject('paso2_datos_proyecto.objetivos.objetivos_especificos', [...currentProject.paso2_datos_proyecto.objetivos.objetivos_especificos, ""])}
                    className="mt-4 btn-secondary py-2 px-4 text-xs h-8"
                >
                    + Agregar Objetivo
                </button>
            </div>
        </div>
    );
};

const StepTimeline: React.FC = () => {
    const { currentProject, updateDeepProject } = useAppStore();
    if (!currentProject) return null;

    const addActivity = () => {
        const newAct: Actividad = {
            id: Math.random().toString(36),
            nombre: "",
            descripcion: "",
            duracion: 1,
            unidad: "meses",
            mes_inicio_relativo: 1,
            entregable: "",
            relacion_con_objetivos: []
        };
        updateDeepProject('paso3_cronograma.actividades', [...currentProject.paso3_cronograma.actividades, newAct]);
    };

    const updateActivity = (idx: number, field: keyof Actividad, val: any) => {
        const newActs = [...currentProject.paso3_cronograma.actividades];
        newActs[idx] = { ...newActs[idx], [field]: val };
        updateDeepProject('paso3_cronograma.actividades', newActs);
    };

    return (
        <div className="card p-4 md:p-8 animate-slideUp">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Cronograma</h3>
                <button onClick={addActivity} className="btn-secondary h-8 px-3 text-xs">+ Actividad</button>
            </div>
            <div className="space-y-4">
                {currentProject.paso3_cronograma.actividades.map((act, idx) => (
                    <div key={idx} className="bg-slate-50 p-4 border rounded-xl">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-4">
                                <label className="text-[10px] uppercase font-bold text-slate-400">Nombre</label>
                                <input className="input-field py-1 text-sm" value={act.nombre} onChange={e => updateActivity(idx, 'nombre', e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] uppercase font-bold text-slate-400">Inicio (Mes)</label>
                                <input type="number" className="input-field py-1 text-sm" value={act.mes_inicio_relativo} onChange={e => updateActivity(idx, 'mes_inicio_relativo', parseInt(e.target.value))} />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] uppercase font-bold text-slate-400">Duración</label>
                                <div className="flex gap-1">
                                    <input type="number" className="input-field py-1 text-sm w-16" value={act.duracion} onChange={e => updateActivity(idx, 'duracion', parseInt(e.target.value))} />
                                    <select className="input-field py-1 text-sm px-1" value={act.unidad} onChange={e => updateActivity(idx, 'unidad', e.target.value)}>
                                        <option value="dias">Días</option>
                                        <option value="meses">Meses</option>
                                    </select>
                                </div>
                            </div>
                            <div className="md:col-span-3">
                                <label className="text-[10px] uppercase font-bold text-slate-400">Entregable</label>
                                <input className="input-field py-1 text-sm" value={act.entregable} onChange={e => updateActivity(idx, 'entregable', e.target.value)} />
                            </div>
                            <div className="md:col-span-1 flex items-end">
                                <button onClick={() => {
                                    const filtered = currentProject.paso3_cronograma.actividades.filter((_, i) => i !== idx);
                                    updateDeepProject('paso3_cronograma.actividades', filtered);
                                }} className="text-red-400 hover:text-red-600 p-2"><span className="material-icons-outlined">delete</span></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StepBudget: React.FC = () => {
    const { currentProject, updateDeepProject } = useAppStore();
    if (!currentProject) return null;

    const addItem = () => {
        const item: ItemPresupuesto = {
            id: Math.random().toString(36),
            tipo_gasto: "Operacional",
            item: "",
            monto_global_clp: 0,
            detalle: ""
        };
        updateDeepProject('paso4_presupuesto.items', [...currentProject.paso4_presupuesto.items, item]);
    }

    const updateItem = (idx: number, field: keyof ItemPresupuesto, val: any) => {
        const items = [...currentProject.paso4_presupuesto.items];
        items[idx] = { ...items[idx], [field]: val };
        updateDeepProject('paso4_presupuesto.items', items);
    };

    const total = currentProject.paso4_presupuesto.items.reduce((sum, item) => sum + (Number(item.monto_global_clp) || 0), 0);

    return (
        <div className="card p-4 md:p-8 animate-slideUp">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h3 className="text-xl font-bold text-slate-900">Presupuesto</h3>
                    <p className="text-sm text-slate-500">Total Estimado: <span className="font-bold text-slate-800">${total.toLocaleString('es-CL')}</span></p>
                </div>
                <button onClick={addItem} className="btn-secondary h-8 px-3 text-xs">+ Ítem</button>
            </div>
            <div className="space-y-4">
                {currentProject.paso4_presupuesto.items.map((item, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center bg-slate-50 p-2 rounded-lg border">
                        <div className="col-span-3">
                            <select className="input-field text-xs py-1" value={item.tipo_gasto} onChange={e => updateItem(idx, 'tipo_gasto', e.target.value)}>
                                <option>Honorarios</option>
                                <option>Operacional</option>
                                <option>Inversión</option>
                            </select>
                        </div>
                        <div className="col-span-5">
                            <input className="input-field text-xs py-1" placeholder="Nombre del ítem..." value={item.item} onChange={e => updateItem(idx, 'item', e.target.value)} />
                        </div>
                        <div className="col-span-3">
                            <input type="number" className="input-field text-xs py-1" placeholder="Monto CLP" value={item.monto_global_clp} onChange={e => updateItem(idx, 'monto_global_clp', parseInt(e.target.value))} />
                        </div>
                        <div className="col-span-1 text-center">
                            <button onClick={() => {
                                const filtered = currentProject.paso4_presupuesto.items.filter((_, i) => i !== idx);
                                updateDeepProject('paso4_presupuesto.items', filtered);
                            }} className="text-red-400 hover:text-red-600"><span className="material-icons-outlined text-sm">delete</span></button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StepDocuments: React.FC = () => {
    const { currentProject, recalcDocuments } = useAppStore();

    // Recalc on mount to ensure list is fresh based on rules
    useEffect(() => { recalcDocuments(); }, []);

    if (!currentProject) return null;

    return (
        <div className="card p-4 md:p-8 animate-slideUp">
            <h3 className="text-xl font-bold mb-6 text-slate-900">Documentos de Admisibilidad</h3>
            <div className="space-y-2">
                {currentProject.paso5_documentos.admisibilidad_obligatoria.map((doc: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${doc.status === 'Listo' ? 'bg-green-500 border-green-500' : 'border-slate-300'}`}>
                            {doc.status === 'Listo' && <span className="material-icons-outlined text-white text-xs">check</span>}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-bold text-slate-800">{doc.name}</p>
                            {doc.observacion && <p className="text-[10px] text-slate-500">{doc.observacion}</p>}
                        </div>
                        {doc.required && <span className="px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold rounded uppercase">Obligatorio</span>}
                    </div>
                ))}
            </div>
        </div>
    );
};

const StepReview: React.FC = () => {
    const { currentProject } = useAppStore();
    if (!currentProject) return null;

    const downloadJson = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(currentProject, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `proyecto_${currentProject.id}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    return (
        <div className="card p-8 animate-slideUp text-center">
            <h2 className="text-2xl font-black text-slate-900 mb-4">¡Proyecto Listo para Exportar!</h2>
            <p className="text-slate-500 mb-8 max-w-md mx-auto">Revisa la completitud en los pasos anteriores. Puedes descargar el archivo JSON compatible o copiar la información.</p>

            <div className="flex justify-center gap-4">
                <button onClick={downloadJson} className="btn-primary h-12 px-8">
                    <span className="material-icons-outlined">download</span> Descargar JSON
                </button>
            </div>
        </div>
    );
};

// --- MAIN WIZARD ORCHESTRATOR ---

export const Wizard: React.FC = () => {
    const { currentProject, apiKey, updateDeepProject } = useAppStore();
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // AI State
    const [aiShow, setAiShow] = useState(false);
    const [aiTask, setAiTask] = useState<AiTask | 'refine_field' | null>(null);
    const [aiField, setAiField] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiResult, setAiResult] = useState<any>(null);
    const [aiNotes, setAiNotes] = useState("");

    useEffect(() => {
        if (!currentProject) navigate('/');
    }, [currentProject, navigate]);

    if (!currentProject) return null;

    const steps = [
        "Beneficiario",
        "Datos del Proyecto",
        "Cronograma",
        "Presupuesto",
        "Documentos",
        "Exportar"
    ];

    // AI Handlers
    const handleOpenAi = (task: AiTask | 'refine_field', field: string) => {
        setAiTask(task);
        setAiField(field);
        setAiNotes(getVal(currentProject, field, "")); // Pre-fill with current value
        setAiShow(true);
        setAiResult(null);
    };

    const handleRunAi = async () => {
        if (!aiTask || !apiKey) {
            alert("Falta configurar la API Key o la tarea.");
            return;
        }
        setAiLoading(true);
        setAiResult(null);

        try {
            const res = await fetch('/api/ai/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-gemini-api-key': apiKey },
                body: JSON.stringify({
                    projectId: currentProject.id,
                    task: aiTask,
                    field: aiField,
                    projectContext: currentProject,
                    userNotes: aiNotes
                })
            });
            if (!res.ok) throw new Error(res.statusText);
            const data = await res.json();

            if (data.suggestions) {
                setAiResult(data);
            } else {
                alert("Formato de respuesta inválido.");
            }
        } catch (e) {
            console.error(e);
            alert("Error en la generación. Verifica tu API Key.");
        } finally {
            setAiLoading(false);
        }
    };

    const applySuggestion = (text: string) => {
        if (aiField) {
            updateDeepProject(aiField, text);
            setAiShow(false);
        }
    };

    const renderContent = () => {
        switch (activeStep) {
            case 0: return <StepBeneficiary />;
            case 1: return <StepProjectData onOpenAi={handleOpenAi} />;
            case 2: return <StepTimeline />;
            case 3: return <StepBudget />;
            case 4: return <StepDocuments />;
            case 5: return <StepReview />;
            default: return null;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden relative">
            {/* MOBILE MENU OVERLAY */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`
                    fixed md:static inset-y-0 left-0 w-72 bg-white border-r border-slate-200 flex flex-col z-40 shadow-2xl md:shadow-none transition-transform duration-300
                    ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                `}
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                    <h1 className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Asistente Cultural</h1>
                    <button onClick={() => setMobileMenuOpen(false)} className="md:hidden text-slate-400">
                        <span className="material-icons-outlined">close</span>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {steps.map((label, i) => (
                        <button
                            key={i}
                            onClick={() => { setActiveStep(i); setMobileMenuOpen(false); }}
                            className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-3 transition-colors ${activeStep === i ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'
                                }`}
                        >
                            <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] border ${activeStep === i ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200'}`}>{i + 1}</span>
                            {label}
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-slate-100">
                    <button onClick={() => navigate('/')} className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-600">
                        <span className="material-icons-outlined">arrow_back</span> Volver
                    </button>
                </div>
            </aside>

            {/* MAIN */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden w-full">
                <header className="h-16 bg-white border-b flex items-center justify-between px-4 md:px-8 shrink-0">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setMobileMenuOpen(true)} className="md:hidden p-2 text-slate-500"><span className="material-icons-outlined">menu</span></button>
                        <h2 className="text-lg font-bold text-slate-900">{steps[activeStep]}</h2>
                    </div>
                    <div className="flex gap-2">
                        <button disabled={activeStep === 0} onClick={() => setActiveStep(s => s - 1)} className="btn-secondary h-9 px-4 text-xs">Anterior</button>
                        <button onClick={() => setActiveStep(s => Math.min(s + 1, steps.length - 1))} className="btn-primary h-9 px-4 text-xs">Siguiente</button>
                    </div>
                </header>
                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-4xl mx-auto pb-20">
                        {renderContent()}
                    </div>
                </div>
            </main>

            {/* AI MODAL */}
            {aiShow && (
                <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] animate-slideUp">
                        <div className="p-4 border-b bg-blue-600 rounded-t-2xl flex justify-between items-center text-white">
                            <span className="font-bold flex items-center gap-2"><span className="material-icons-outlined">auto_awesome</span> Asistente IA</span>
                            <button onClick={() => setAiShow(false)}><span className="material-icons-outlined">close</span></button>
                        </div>
                        <div className="p-4 overflow-y-auto flex-1">
                            <textarea
                                className="input-field mb-4 bg-slate-50"
                                rows={4}
                                value={aiNotes}
                                onChange={e => setAiNotes(e.target.value)}
                                placeholder="Describa cómo quiere mejorar este texto..."
                            />
                            {aiResult && (
                                <div className="space-y-3">
                                    <label className="text-[10px] uppercase font-bold text-slate-400">Sugerencias:</label>
                                    {aiResult.suggestions.map((s: any, i: number) => (
                                        <div key={i} className="p-3 bg-blue-50 border border-blue-100 rounded-xl">
                                            <p className="text-sm text-slate-800 whitespace-pre-wrap mb-2">{typeof s === 'string' ? s : JSON.stringify(s)}</p>
                                            <button onClick={() => applySuggestion(typeof s === 'string' ? s : JSON.stringify(s))} className="text-xs font-bold text-blue-600 hover:underline">USAR ESTA</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t bg-slate-50 rounded-b-2xl">
                            <button onClick={handleRunAi} disabled={aiLoading} className="btn-primary w-full h-10 text-sm">
                                {aiLoading ? 'Pensando...' : 'Generar Mejoras'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
