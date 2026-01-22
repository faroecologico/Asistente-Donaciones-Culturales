import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ProjectStatus } from '../types';

export const Dashboard: React.FC = () => {
    const { projects, deleteProject, loadProject, duplicateProject, createProject } = useAppStore();
    const navigate = useNavigate();

    const handleCreate = () => {
        createProject(); // Initialize new project
        navigate('/wizard');
    };

    const handleEdit = (id: string) => {
        loadProject(id);
        navigate('/wizard');
    };

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('¿Seguro que deseas eliminar este proyecto?')) {
            deleteProject(id);
        }
    };

    return (
        <div className="page-container space-y-8">

            {/* Page Header */}
            <div className="flex justify-between items-end border-b border-slate-200 pb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Mis Proyectos</h1>
                    <p className="text-slate-500 text-base mt-2">Gestiona tus postulaciones a la Ley de Donaciones Culturales</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="btn-primary"
                >
                    <span className="material-icons-outlined">add</span>
                    Crear Proyecto
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-icons-outlined text-3xl text-blue-600">folder_open</span>
                    </div>
                    <h3 className="text-lg font-medium text-slate-900">No tienes proyectos aún</h3>
                    <p className="text-slate-500 mb-6 max-w-sm mx-auto">Comienza creando tu primera postulación con la ayuda de nuestra IA.</p>
                    <button onClick={handleCreate} className="btn-primary mx-auto">
                        Comenzar uno nuevo
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div
                            key={project.id}
                            onClick={() => handleEdit(project.id)}
                            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group flex flex-col h-full"
                        >
                            {/* Header Card */}
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${project.status === ProjectStatus.Ready ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {project.status}
                                </span>
                                <span className="text-xs text-slate-400 font-medium">
                                    {new Date(project.updatedAt).toLocaleDateString()}
                                </span>
                            </div>

                            {/* Content */}
                            <h3 className="text-xl font-bold text-slate-800 mb-2 leading-tight group-hover:text-blue-600 transition-colors">
                                {project.name || "Nuevo Proyecto"}
                            </h3>

                            <p className="text-sm text-slate-500 mb-6 line-clamp-3 leading-relaxed flex-1">
                                {project.content.summary || "Sin descripción. Haz clic para editar..."}
                            </p>

                            {/* Tags/Meta */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {project.initial.projectType && (
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                        {project.initial.projectType}
                                    </span>
                                )}
                                {project.initial.beneficiaryType && (
                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                                        {project.initial.beneficiaryType}
                                    </span>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="pt-4 border-t border-slate-100 flex justify-between items-center opacity-70 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            duplicateProject(project.id);
                                        }}
                                        title="Duplicar"
                                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        <span className="material-icons-outlined text-lg">content_copy</span>
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(project.id, e)}
                                        title="Eliminar"
                                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                                    >
                                        <span className="material-icons-outlined text-lg">delete</span>
                                    </button>
                                </div>
                                <div className="text-sm font-medium text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                    Editar <span className="material-icons-outlined text-base">arrow_forward</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
