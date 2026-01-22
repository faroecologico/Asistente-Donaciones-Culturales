import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export const AuthModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  if (!isOpen) return null;

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('¡Registro exitoso! Revisa tu email para confirmar.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      onClose();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md shadow-2xl overflow-hidden animate-slideUp p-10">
        <header className="mb-8 text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <span className="material-icons-outlined text-white text-3xl">lock</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900">{isSignUp ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
          <p className="text-sm text-slate-400 font-medium mt-2 italic">Accede a tus proyectos en la nube con Supabase</p>
        </header>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Contraseña</label>
            <input
              type="password"
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-4 h-auto text-sm shadow-xl shadow-blue-100"
          >
            {loading ? 'Procesando...' : isSignUp ? 'Registrarse' : 'Entrar'}
          </button>
        </form>

        <footer className="mt-8 pt-8 border-t border-slate-100 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-xs font-black text-slate-400 hover:text-blue-600 transition-colors uppercase tracking-widest"
          >
            {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
          </button>
        </footer>
      </div>
    </div>
  );
};