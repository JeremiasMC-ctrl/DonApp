import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../api';

export default function Login({ onLoginSuccess }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!usuario.trim() || !password) {
      setError('Por favor completa todos los campos.');
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/login', { usuario, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      onLoginSuccess(user);
      navigate('/');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || 
        'Credenciales incorrectas. Inténtalo de nuevo.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative noise-overlay">
      <div className="w-full max-w-md glass-panel rounded-3xl overflow-hidden p-8 shadow-2xl z-10 animate-slide-up">
        
        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="text-4xl font-extrabold text-sky-500 tracking-wider font-display mb-2 select-none">
            DonApp
          </div>
          <p className="text-slate-400 text-sm font-medium">Sistema de Donaciones Conectando Vidas</p>
        </div>

        {/* Mensajes de Error */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-red-400 text-sm">
            <ShieldAlert size={18} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold">Error:</span> {error}
            </div>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="usuario" className="text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1">
              Nombre de Usuario
            </label>
            <input
              type="text"
              id="usuario"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              placeholder="Ej. admin"
              className="glass-input text-sm"
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="password" className="text-xs font-semibold text-slate-300 uppercase tracking-wider pl-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="glass-input text-sm"
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-gradient mt-4 disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center justify-center"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Ingresar al Sistema'}
          </button>
        </form>

        {/* Cuentas de Prueba (Acordeón React) */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-slate-400 text-xs mb-2">¿Quieres probar el sistema? Usa estas credenciales:</p>
          
          <button 
            type="button"
            onClick={() => setShowCredentials(!showCredentials)}
            className="inline-flex items-center gap-1 text-sky-400 hover:text-sky-350 text-xs font-semibold transition-colors duration-200 outline-none"
          >
            <span>Ver cuentas de prueba</span>
            {showCredentials ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <div className={`overflow-hidden transition-all duration-300 max-h-0 ${showCredentials ? 'max-h-40 mt-3' : ''}`}>
            <div className="bg-slate-950/40 border border-white/5 rounded-xl p-3 text-left text-xs leading-relaxed text-slate-400 font-mono">
              <div><strong>Admin:</strong> <code className="text-sky-300">admin</code> / <code className="text-sky-300">admin123</code></div>
              <div className="mt-1"><strong>Operador:</strong> <code className="text-sky-300">operador</code> / <code className="text-sky-300">operador123</code></div>
              <div className="mt-1"><strong>Supervisor:</strong> <code className="text-sky-300">supervisor</code> / <code className="text-sky-300">supervisor123</code></div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
