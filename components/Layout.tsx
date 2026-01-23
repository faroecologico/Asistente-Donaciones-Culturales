import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const isWizard = location.pathname.includes('wizard');

    return (
        <div className="min-h-screen flex flex-col font-sans bg-[#F4F7FA]">
            {/* Global Header - Simplified on Wizard to focus attention */}
            {!isWizard && (
                <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center gap-8">
                                <Link to="/" className="flex items-center gap-2 text-blue-700 hover:opacity-80 transition-opacity">
                                    <span className="material-icons-outlined text-3xl">account_balance</span>
                                    <span className="text-xl font-bold tracking-tight text-slate-900 font-jakarta">Asistente Donaciones</span>
                                </Link>
                                <nav className="hidden md:flex gap-4">
                                    <Link
                                        to="/"
                                        className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
                                    >
                                        MIS PROYECTOS
                                    </Link>
                                </nav>
                            </div>

                            <div className="flex items-center gap-4">
                                <button className="flex items-center gap-2 text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-full">
                                    <span className="material-icons-outlined text-sm">person</span>
                                    INVITADO
                                </button>
                            </div>
                        </div>
                    </div>
                </header>
            )}

            <main className={`flex-1 ${isWizard ? 'flex flex-col h-screen overflow-hidden' : 'py-8'}`}>
                {children}
            </main>
        </div>
    );
};
