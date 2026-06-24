import React from 'react';
import { 
  Heart, 
  CheckCircle2, 
  Clock, 
  AlertOctagon 
} from 'lucide-react';
import Header from '../components/Header';

export default function Dashboard({ user }) {
  // Datos simulados de la base de datos (idénticos a la versión PHP)
  const stats = [
    { 
      label: 'Total Donaciones', 
      val: '5,483', 
      icon: Heart, 
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/15' 
    },
    { 
      label: 'Entregadas', 
      val: '2,859', 
      icon: CheckCircle2, 
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/15' 
    },
    { 
      label: 'En Espera', 
      val: '1,248', 
      icon: Clock, 
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/15' 
    },
    { 
      label: 'Stock Crítico', 
      val: '38', 
      icon: AlertOctagon, 
      color: 'text-red-400 bg-red-500/10 border-red-500/15',
      isWarning: true
    }
  ];

  const topFoundations = [
    { name: 'Fundación Esperanza', percentage: '87%', value: '87k' },
    { name: 'Hogar del Niño', percentage: '72%', value: '72k' },
    { name: 'Banco de Alimentos', percentage: '59%', value: '59k' },
    { name: 'Cruz Roja Local', percentage: '50%', value: '50k' },
    { name: 'Cáritas Diocesana', percentage: '39%', value: '39k' }
  ];

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header user={user} />
      
      <main className="p-6 md:p-8 flex-1 flex flex-col gap-8 max-w-7xl w-full mx-auto animate-fade-in">
        
        {/* Sección: Resumen General */}
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 pl-1">
            Resumen General
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={idx} 
                  className={`glass-card flex items-center gap-4 ${
                    stat.isWarning ? 'border-red-500/15 hover:border-red-500/30' : ''
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${stat.color}`}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold tracking-tight ${stat.isWarning ? 'text-red-400' : 'text-slate-100'}`}>
                      {stat.val}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sección: Gráficos Visuales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Tarjeta de Gráfico Circular SVG */}
          <div className="glass-card flex flex-col justify-between min-h-[300px]">
            <h3 className="text-base font-bold text-slate-200 mb-6 border-b border-white/5 pb-3">
              Distribución de Recursos
            </h3>
            
            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4 flex-1">
              
              {/* Gráfico circular premium con SVG */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  {/* Círculo base de fondo */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="none" 
                    stroke="rgba(255, 255, 255, 0.05)" 
                    strokeWidth="3.2" 
                  />
                  
                  {/* Segmento Alimentos (Teal - 68%) */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="none" 
                    stroke="#14b8a6" 
                    strokeWidth="3.4" 
                    strokeDasharray="68 32" 
                    strokeDashoffset="0"
                    strokeLinecap="round" 
                  />
                  
                  {/* Segmento Medicinas (Azul - 32%) */}
                  {/* Dashoffset = 100 - Alimentos% = 32 */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    fill="none" 
                    stroke="#0284c7" 
                    strokeWidth="3.4" 
                    strokeDasharray="32 68" 
                    strokeDashoffset="-68"
                    strokeLinecap="round" 
                  />
                </svg>
                
                {/* Texto interior */}
                <div className="absolute flex flex-col items-center justify-center text-center select-none">
                  <span className="text-2xl font-extrabold text-slate-100 font-display leading-none">68%</span>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold mt-1">Alimentos</span>
                </div>
              </div>

              {/* Leyendas explicativas */}
              <div className="flex flex-col gap-4 font-medium text-sm">
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-teal-500 shadow-lg shadow-teal-500/30"></span>
                  <div>
                    <span className="text-slate-200">Alimentos</span>
                    <span className="text-slate-400 text-xs ml-1.5">(68%)</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="w-3.5 h-3.5 rounded-full bg-sky-500 shadow-lg shadow-sky-500/30"></span>
                  <div>
                    <span className="text-slate-200">Medicinas</span>
                    <span className="text-slate-400 text-xs ml-1.5">(32%)</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Tarjeta de Gráfico de Barras Horizontal */}
          <div className="glass-card flex flex-col justify-between min-h-[300px]">
            <h3 className="text-base font-bold text-slate-200 mb-6 border-b border-white/5 pb-3">
              Top 5 Fundaciones Beneficiadas
            </h3>
            
            <div className="flex flex-col gap-4 flex-1 justify-center py-2">
              {topFoundations.map((foundation, idx) => (
                <div key={idx} className="flex flex-col gap-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-300 hover:text-slate-100 transition-colors duration-150 cursor-default">
                      {foundation.name}
                    </span>
                    <span className="text-sky-400 font-mono">{foundation.value}</span>
                  </div>
                  
                  {/* Track de la barra */}
                  <div className="h-2 w-full rounded-full bg-slate-950/40 border border-white/5 overflow-hidden">
                    {/* Fill de la barra */}
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-sky-500 to-sky-600 shadow-md shadow-sky-500/10 transition-all duration-500 ease-out"
                      style={{ width: foundation.percentage }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}
