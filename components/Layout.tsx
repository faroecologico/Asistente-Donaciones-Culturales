import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppStore } from '../store';
import { supabase } from '../lib/supabaseClient';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser, setCurrentUser } = useAppStore();
    const location = useLocation();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setCurrentUser(null);
    };

    return (
        <div className="min-h-screen flex flex-col font-sans text-slate-900">
            <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-4">
                            <Link to="/" className="text-xl font-bold tracking-tight hover:text-blue-400 transition-colors">
                                Fondart AI Assist
                            </Link>
                            <nav className="hidden md:flex gap-4 ml-8">
                                <Link
                                    to="/"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname === '/' ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                                >
                                    Proyectos
                                </Link>
                                <Link
                                    to="/wizard"
                                    className={`px-3 py-2 rounded-md text-sm font-medium ${location.pathname.startsWith('/wizard') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-700 hover:text-white'}`}
                                >
                                    Nuevo Proyecto
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center gap-4">
                            {currentUser ? (
                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-slate-300">{currentUser.email}</span>
                                    <button onClick={handleLogout} className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1 rounded text-red-300 transition-colors">
                                        Salir
                                    </button>
                                </div>
                            ) : (
                                <span className="text-xs text-slate-400">Modo Invitado</span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 bg-slate-50 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
                    {children}
                </div>
            </main>

            <footer className="bg-white border-t border-slate-200 py-6 mt-auto">
                <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
                    <p>© {new Date().getFullYear()} Asistente Donaciones Culturales. Versión Beta.</p>
                </div>
            </footer>
        </div>
    );
};
