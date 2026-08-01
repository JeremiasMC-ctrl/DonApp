import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, User as UserIcon, LogOut } from 'lucide-react';

export default function Header({ title, user, searchTerm, onSearch, placeholderText }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
  };

  const getInitials = () => {
    if (!user) return 'U';
    const first = user.nombres ? user.nombres.substring(0, 1) : '';
    const last = user.apellidos ? user.apellidos.substring(0, 1) : '';
    return (first + last).toUpperCase() || 'U';
  };

  return (
    <header className="flex justify-between items-center bg-slate-700/50 border-b border-white/20 p-6 backdrop-blur-md sticky top-0 z-30">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          {title ? title : `¡Bienvenido, ${user?.nombres || 'Usuario'}!`}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Logo de DonApp */}
        <span className="text-xl font-extrabold text-sky-500 tracking-wider font-display mr-4 hidden md:inline select-none">
          DonApp
        </span>

        {/* Buscador */}
        {onSearch && (
          <div className="relative hidden sm:block">
            <input
              type="text"
              placeholder={placeholderText || "Buscar..."}
              value={searchTerm || ''}
              onChange={(e) => onSearch(e.target.value)}
              className="w-64 rounded-full bg-slate-950/40 border border-white/10 py-2 pl-10 pr-4 outline-none text-sm text-slate-200 placeholder-slate-400 focus:border-sky-500/50 focus:w-72 focus:bg-slate-950/60 transition-all duration-300"
            />
            <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
          </div>
        )}

        {/* Botón de Notificaciones */}
        <button 
          className="w-10 h-10 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 hover:border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200"
          title="Notificaciones"
        >
          <Bell size={18} />
        </button>

        {/* Botón de Perfil con Dropdown */}
        <div className="relative animate-fade-in" ref={dropdownRef}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-200 ${
              isOpen 
                ? 'bg-sky-500/20 border-sky-500/30 text-sky-400 font-bold' 
                : 'bg-slate-800/40 hover:bg-slate-800/60 border-white/5 hover:border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Mi Perfil"
          >
            <UserIcon size={18} />
          </button>

          {isOpen && (
            <div className="absolute right-0 mt-3 w-72 bg-slate-950/90 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden p-5 shadow-2xl z-50 animate-fade-in space-y-4">
              <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-500 to-sky-600 flex items-center justify-center text-lg font-bold text-white shadow-md shadow-sky-500/10 select-none">
                  {getInitials()}
                </div>
                <div className="overflow-hidden">
                  <h4 className="font-bold text-sm text-slate-100 truncate">{user?.nombre_completo || `${user?.nombres} ${user?.apellidos}`}</h4>
                  <p className="text-xs text-slate-400 truncate">@{user?.usuario}</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Rol de Acceso:</span>
                  <span className="px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/15 font-bold text-[9px] uppercase tracking-wide">
                    {user?.rol || 'Usuario'}
                  </span>
                </div>
                {user?.email && (
                  <div className="flex justify-between items-center text-slate-400 gap-2">
                    <span className="shrink-0">Correo:</span>
                    <span className="text-slate-200 truncate" title={user.email}>{user.email}</span>
                  </div>
                )}
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/35 text-red-400 hover:text-red-300 transition-all duration-150 flex items-center justify-center gap-2 font-semibold text-xs mt-2"
              >
                <LogOut size={14} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
