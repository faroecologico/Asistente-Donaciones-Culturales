import { supabase } from '../lib/supabaseClient';
import { AuthModal } from './AuthModal';
import { SettingsModal } from './SettingsModal';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation();
    const { user } = useAppStore();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        setShowProfileMenu(false);
    };

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

                        <div className="relative">
                            <button
                                onClick={() => user ? setShowProfileMenu(!showProfileMenu) : setIsAuthOpen(true)}
                                className="flex items-center gap-3 text-slate-900 hover:opacity-70 transition-opacity bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-2xl group"
                            >
                                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white overflow-hidden shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                                    <span className="material-icons-outlined text-lg">{user ? 'account_circle' : 'login'}</span>
                                </div>
                                <div className="text-left">
                                    <span className="text-[10px] font-bold text-slate-400 block uppercase leading-none mb-0.5">{user ? 'Usuario' : 'Estatus'}</span>
                                    <span className="text-[11px] font-black uppercase tracking-widest">{user ? user.email.split('@')[0] : 'Entrar'}</span>
                                </div>
                            </button>

                            {showProfileMenu && user && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-3xl border border-slate-100 shadow-2xl p-4 animate-slideUp z-[70]">
                                    <div className="p-4 bg-slate-50 rounded-2xl mb-4">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Sesión iniciada como</p>
                                        <p className="text-xs font-bold text-slate-900 truncate">{user.email}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <button
                                            onClick={() => { setIsSettingsOpen(true); setShowProfileMenu(false); }}
                                            className="flex items-center gap-3 w-full p-3 hover:bg-slate-50 rounded-xl text-slate-600 transition-colors text-sm font-bold"
                                        >
                                            <span className="material-icons-outlined text-lg">settings</span>
                                            Configuración
                                        </button>
                                        <button
                                            onClick={handleLogout}
                                            className="flex items-center gap-3 w-full p-3 hover:bg-red-50 rounded-xl text-red-500 transition-colors text-sm font-bold"
                                        >
                                            <span className="material-icons-outlined text-lg">logout</span>
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>
                </div>
            </header>

            <main className="flex-1 bg-[#F4F7FA]">
                {children}
            </main>

            <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
            <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};
