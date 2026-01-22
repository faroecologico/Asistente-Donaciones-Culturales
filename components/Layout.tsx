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
        <div className="min-h-screen flex flex-col font-sans">
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">

                        {/* Logo Area */}
                        <div className="flex items-center gap-8">
                            <Link to="/" className="flex items-center gap-2 text-blue-700 hover:opacity-80 transition-opacity">
                                <span className="material-icons-outlined text-3xl">account_balance</span>
                                <span className="text-xl font-bold tracking-tight text-slate-900">Asistente Donaciones</span>
                            </Link>
                        </div>

                        {/* Right Actions */}
                        <div className="flex items-center gap-4">
                            {/* Contextual Actions or User Menu */}
                            <button className="btn-secondary text-xs py-1.5 h-9">
                                <span className="material-icons-outlined text-sm">settings_suggest</span>
                                Configurar IA
                            </button>

                            <div className="h-6 w-px bg-slate-200 mx-2"></div>

                            <Link to="/" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
                                Mis Proyectos
                            </Link>

                            {currentUser ? (
                                <button onClick={handleLogout} className="btn-secondary text-xs ml-2 h-9">
                                    <span className="material-icons-outlined text-sm">logout</span>
                                    Salir
                                </button>
                            ) : (
                                <button className="btn-secondary text-xs ml-2 h-9 bg-slate-50">
                                    <span className="material-icons-outlined text-sm">login</span>
                                    Ingresar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 bg-slate-50 relative">
                {children}
            </main>

        </div>
    );
};
