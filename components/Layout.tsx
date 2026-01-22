import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const isWizard = location.pathname.startsWith('/wizard');

    return (
        <div className="min-h-screen flex flex-col">
            <header className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-[60] h-16 flex items-center px-10">
                <div className="flex-1 flex items-center justify-between max-w-7xl mx-auto w-full">
                    <Link to="/" className="flex items-center gap-2 group transition-opacity hover:opacity-80">
                        <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center transform group-hover:rotate-6 transition-transform">
                            <span className="material-icons-outlined text-white text-xl">account_balance</span>
                        </div>
                        <span className="text-sm font-black tracking-[-0.02em] text-slate-900">ASISTENTE DONACIONES</span>
                    </Link>

                    <nav className="flex items-center gap-8">
                        <Link
                            to="/"
                            className={`text-[11px] font-black uppercase tracking-widest transition-colors ${location.pathname === '/' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-900'}`}
                        >
                            Mis Proyectos
                        </Link>
                        <div className="w-px h-4 bg-slate-100"></div>
                        <button className="flex items-center gap-2 text-slate-900 hover:opacity-70 transition-opacity">
                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 overflow-hidden">
                                <span className="material-icons-outlined text-lg">person</span>
                            </div>
                            <span className="text-[11px] font-black uppercase tracking-widest">Invitado</span>
                        </button>
                    </nav>
                </div>
            </header>

            <main className="flex-1 bg-[#F4F7FA]">
                {children}
            </main>
        </div>
    );
};
