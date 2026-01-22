import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { ProjectStatus } from '../types';

export const Dashboard: React.FC = () => {
    const { projects, deleteProject, loadProject, duplicateProject } = useAppStore();
    const navigate = useNavigate();

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

    const handleDuplicate = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        duplicateProject(id);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-slate-200 pb-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Mis Proyectos</h1>
                    <p className="text-slate-500 text-sm mt-1">Gestiona tus postulaciones y borradores.</p>
                </div>
                <button
                    onClick={() => navigate('/wizard')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-2 font-medium"
                >
                    <span className="material-icons-outlined text-sm">add</span>
                    Crear Proyecto
                </button>
            </div>

            {projects.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300 shadow-sm">
                    <span className="material-icons-outlined text-4xl text-slate-300 mb-2">folder_open</span>
                    <p className="text-slate-500 mb-4">No tienes proyectos creados aún.</p>
                    <button onClick={() => navigate('/wizard')} className="text-blue-600 font-medium hover:underline">
                        Comenzar uno nuevo
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(project => (
                        <div
                            key={project.id}
                            onClick={() => handleEdit(project.id)}
                            className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-blue-300 transition-all cursor-pointer group relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className={`px-2 py-1 rounded text-xs font-semibold uppercase tracking-wider ${project.status === ProjectStatus.Ready ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                                    }`}>
                                    {project.status}
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={(e) => handleDuplicate(project.id, e)}
                                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-blue-600"
                                        title="Duplicar"
                                    >
                                        <span className="material-icons-outlined text-lg">content_copy</span>
                                    </button>
                                    <button
                                        onClick={(e) => handleDelete(project.id, e)}
                                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-red-600"
                                        title="Eliminar"
                                    >
                                        <span className="material-icons-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-bold text-slate-800 mb-2 line-clamp-2 leading-tight">
                                {project.name || "Sin Título"}
                            </h3>

                            <p className="text-sm text-slate-500 mb-4 line-clamp-3 h-10">
                                {project.content.summary || "Sin resumen..."}
                            </p>

                            <div className="flex items-center text-xs text-slate-400 pt-4 border-t border-slate-100">
                                <span className="material-icons-outlined text-sm mr-1">event</span>
                                Actualizado: {new Date(project.updatedAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
