import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  Settings, 
  PlusCircle, 
  Heart, 
  FileText, 
  TrendingUp, 
  Activity, 
  Download, 
  LogOut,
  Landmark,
  Package,
  BarChart2 
} from 'lucide-react';

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const rolLower = user?.rol?.toLowerCase() || '';

  // Obtener iniciales para el avatar
  const getInitials = () => {
    if (!user) return 'DA';
    const first = user.nombres ? user.nombres.substring(0, 1) : '';
    const last = user.apellidos ? user.apellidos.substring(0, 1) : '';
    return (first + last).toUpperCase() || 'DA';
  };

  // Clases CSS para los roles
  const getBadgeClass = () => {
    switch (rolLower) {
      case 'administrador':
        return 'bg-red-500/10 text-red-400 border border-red-500/20';
      case 'trabajador social':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'encargado de bodega':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  const userPermisos = user?.permisos || [];
  const menuItems = [];

  if (userPermisos.includes('usuarios')) {
    menuItems.push({ label: 'Usuarios y Roles', path: '/usuarios', icon: Users, active: true });
  }
  if (userPermisos.includes('donaciones')) {
    menuItems.push({ label: 'Donaciones', path: '/donaciones', icon: Heart, active: true });
  }
  if (userPermisos.includes('donantes_consultar')) {
    menuItems.push({ label: 'Donantes', path: '/donantes', icon: Landmark, active: true });
  }
  if (userPermisos.includes('beneficiarios')) {
    menuItems.push({ label: 'Fundaciones', path: '/beneficiarios', icon: Users, active: true });
  }
  if (userPermisos.includes('inventario')) {
    menuItems.push({ label: 'Registro de Donaciones', path: '/inventario', icon: Package, active: true });
  }
  if (userPermisos.includes('reportes')) {
    menuItems.push({ label: 'Reportes e Inteligencia', path: '/reportes', icon: BarChart2, active: true });
  }

  return (
    <aside className="w-80 h-screen sticky top-0 flex flex-col justify-between bg-slate-900/40 border-r border-white/5 backdrop-blur-xl p-6 text-slate-300">
      <div className="flex flex-col gap-8 flex-1 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar]:h-0">
        
        {/* Perfil del Usuario */}
        <div className="flex flex-col items-center text-center mt-4 border-b border-white/5 pb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-500 to-sky-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-sky-500/15 mb-4 select-none">
            {getInitials()}
          </div>
          <h3 className="font-semibold text-lg text-slate-100 line-clamp-1">{user?.nombre_completo}</h3>
          <p className="text-sm text-slate-400 mb-3">@{user?.usuario}</p>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${getBadgeClass()}`}>
            {user?.rol}
          </span>
        </div>

        {/* Menú de Navegación */}
        <nav className="flex flex-col gap-2">
          {userPermisos.includes('reportes') && (
            <Link 
              to="/dashboard" 
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === '/dashboard' 
                  ? 'bg-sky-500/15 text-sky-400 font-medium' 
                  : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutDashboard size={20} />
              <span>Panel Principal</span>
            </Link>
          )}

          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            if (item.active) {
              return (
                <Link 
                  key={idx}
                  to={item.path} 
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-sky-500/15 text-sky-400 font-medium' 
                      : 'hover:bg-white/5 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            } else {
              return (
                <div 
                  key={idx}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 opacity-60 cursor-not-allowed select-none"
                  title="Módulo no habilitado"
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </div>
              );
            }
          })}
        </nav>
      </div>

      {/* Botón de Logout */}
      <div className="border-t border-white/5 pt-4 mt-4">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-all duration-200"
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
