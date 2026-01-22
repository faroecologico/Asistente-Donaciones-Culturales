import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAppStore } from '../store';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setCurrentUser } = useAppStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
             setCurrentUser(data.user as any);
             onClose();
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
             if (!data.session) {
                 setError("Registro exitoso. Por favor revisa tu correo para confirmar tu cuenta.");
             } else {
                 setCurrentUser(data.user as any);
                 onClose();
             }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-slideUp border border-white/20">
        <div className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
              {isLogin ? 'Bienvenido' : 'Crear Cuenta'}
            </h2>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-gray-100 rounded-full">
              <span className="material-icons-outlined">close</span>
            </button>
          </div>

          {error && (
            <div className={`mb-6 p-3 rounded-lg text-sm flex gap-2 items-start ${error.includes('exitoso') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              <span className="material-icons-outlined text-sm mt-0.5">info</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white text-slate-900 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm"
                placeholder="nombre@ejemplo.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 ml-1">Contraseña</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white text-slate-900 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all shadow-sm"
                placeholder="••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-accent text-white font-bold py-3.5 rounded-xl hover:bg-accent-hover transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none mt-2"
            >
              {loading ? 'Procesando...' : isLogin ? 'Iniciar Sesión' : 'Registrarse'}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-slate-500">
            {isLogin ? '¿No tienes cuenta? ' : '¿Ya tienes cuenta? '}
            <button
              onClick={() => {
                  setIsLogin(!isLogin);
                  setError(null);
              }}
              className="text-accent font-bold hover:underline transition-all"
            >
              {isLogin ? 'Regístrate aquí' : 'Ingresa aquí'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};