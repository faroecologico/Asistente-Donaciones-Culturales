import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ProjectStatus } from '../types';

export const Dashboard: React.FC = () => {
    const { projects, deleteProject, loadProject, duplicateProject, createProject, apiKey, setApiKey, loadDemo } = useAppStore();
    const navigate = useNavigate();

    const handleCreate = () => {
        createProject();
        navigate('/wizard');
    };

    const handleEdit = (id: string) => {
        loadProject(id);
        navigate('/wizard');
    };

    return (
        <div className="page-container py-12">
            <div className="flex items-end justify-between mb-16 border-b border-slate-200 pb-8">
                <div className="max-w-xl">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-4">Proyectos</h1>
                    <p className="text-slate-500 text-lg leading-relaxed">Bienvenido al asistente de formulación. Crea proyectos estructurados para la Ley de Donaciones Culturales.</p>
                </div>
                <button onClick={handleCreate} className="btn-primary h-14 px-10 rounded-2xl text-base shadow-xl shadow-blue-200">
                    <span className="material-icons-outlined text-xl">add</span>
                    Nuevo Proyecto
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
                    <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-8">
                        <span className="material-icons-outlined text-4xl text-blue-600">rocket_launch</span>
                    </div>
                    <h2 className="text-2xl font-black text-slate-800 mb-2">No hay borradores activos</h2>
                    <p className="text-slate-400 mb-10 text-center max-w-sm">Los proyectos que inicies aparecerán aquí para ser editados o exportados.</p>
                    <button onClick={handleCreate} className="btn-secondary px-8">Comenzar ahora mismo</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map(p => (
                        <div
                            key={p.id}
                            onClick={() => handleEdit(p.id)}
                            className="card p-8 group hover:border-blue-300 hover:shadow-2xl hover:shadow-blue-100 transition-all cursor-pointer relative flex flex-col min-h-[320px] rounded-[2rem]"
                        >
                            <div className="flex justify-between items-start mb-8">
                                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full ${p.status === ProjectStatus.Ready ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {p.status}
                                </span>
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{new Date(p.updatedAt).toLocaleDateString()}</span>
                            </div>

                            <h3 className="text-2xl font-black text-slate-900 leading-tight mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {p.name || "Sin título"}
                            </h3>

                            <p className="text-sm text-slate-500 leading-relaxed mb-8 flex-1 line-clamp-3">
                                {p.content.summary || "Proyecto en proceso de formulación. Haz clic para continuar editando detalles."}
                            </p>

                            <div className="flex items-center gap-2 pt-6 border-t border-slate-50 mt-auto">
                                <button
                                    onClick={(e) => { e.stopPropagation(); duplicateProject(p.id); }}
                                    className="p-2.5 rounded-xl hover:bg-slate-50 text-slate-400 hover:text-blue-600 transition-colors"
                                    title="Duplicar"
                                >
                                    <span className="material-icons-outlined text-xl">content_copy</span>
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); deleteProject(p.id); }}
                                    className="p-2.5 rounded-xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                                    title="Eliminar"
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

            {/* API Key Config (MVP Floating or footer) */}
            <div className="fixed bottom-8 left-8">
                <button
                    onClick={() => {
                        const key = prompt("Ingrese su Gemini API Key (opcional, por defecto usa la del sistema):", apiKey || "");
                        if (key !== null) setApiKey(key);
                    }}
                    className="bg-slate-900 text-white p-4 rounded-2xl shadow-2xl flex items-center gap-3 hover:scale-105 transition-transform"
                >
                    <span className="material-icons-outlined text-lg">vpn_key</span>
                    <span className="text-xs font-bold uppercase tracking-widest leading-none">Config de IA</span>
                </button>
            </div>
        </div>
    );
};
