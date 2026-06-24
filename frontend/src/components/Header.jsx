import React from 'react';
import { Search, Bell, User as UserIcon } from 'lucide-react';

export default function Header({ title, user }) {
  return (
    <header className="flex justify-between items-center bg-slate-900/10 border-b border-white/5 p-6 backdrop-blur-md sticky top-0 z-30">
      <div>
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
          {title ? title : `¡Bienvenido, ${user?.nombres || 'Usuario'}!`}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Logo de DonApp (Derecha superior) */}
        <span className="text-xl font-extrabold text-sky-500 tracking-wider font-display mr-4 hidden md:inline select-none">
          DonApp
        </span>

        {/* Buscador */}
        <div className="relative hidden sm:block">
          <input
            type="text"
            placeholder="Buscar donaciones..."
            className="w-64 rounded-full bg-slate-950/40 border border-white/10 py-2 pl-10 pr-4 outline-none text-sm text-slate-200 placeholder-slate-400 focus:border-sky-500/50 focus:w-72 focus:bg-slate-950/60 transition-all duration-300"
          />
          <Search size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
        </div>

        {/* Botón de Notificaciones */}
        <button 
          className="w-10 h-10 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 hover:border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200"
          title="Notificaciones"
        >
          <Bell size={18} />
        </button>

        {/* Botón de Perfil */}
        <button 
          className="w-10 h-10 rounded-xl bg-slate-800/40 hover:bg-slate-800/60 border border-white/5 hover:border-white/10 flex items-center justify-center text-slate-300 hover:text-white transition-all duration-200"
          title="Mi Perfil"
        >
          <UserIcon size={18} />
        </button>
      </div>
    </header>
  );
}
