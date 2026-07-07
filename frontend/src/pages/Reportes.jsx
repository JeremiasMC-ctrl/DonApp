import React, { useState, useEffect } from 'react';
import { Package, TrendingUp, Users, AlertTriangle, AlertCircle, FileSpreadsheet, Download, RefreshCw, BarChart2 } from 'lucide-react';
import api from '../api';

export default function Reportes() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reportes/dashboard');
      setStats(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al obtener las estadísticas del sistema.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 flex-1">
        <RefreshCw className="animate-spin text-sky-500" size={32} />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6 flex-1 text-center space-y-4">
        <AlertTriangle className="text-red-500 mx-auto" size={40} />
        <p className="text-slate-350">{error || 'No se pudieron cargar los reportes.'}</p>
        <button onClick={fetchStats} className="px-4 py-2 bg-sky-500 text-white rounded-lg text-xs font-bold hover:bg-sky-600">
          Reintentar
        </button>
      </div>
    );
  }

  const {
    donacionesCount,
    beneficiariosCount,
    totalStockUnidades,
    vencidosCount,
    proximosVencerCount,
    itemsCriticos
  } = stats;

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex justify-between items-center border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-display">Reportes y Dashboard</h2>
          <p className="text-slate-400 text-xs mt-1">Estadísticas consolidadas e inteligencia de soporte social en tiempo real.</p>
        </div>
        <button
          onClick={fetchStats}
          className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 transition-all inline-flex items-center gap-2 text-xs font-semibold"
          title="Refrescar datos"
        >
          <RefreshCw size={14} />
          Actualizar
        </button>
      </div>

      {/* Grid de KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Unidades en Inventario</div>
            <span className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400">
              <Package size={16} />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-100">{totalStockUnidades}</div>
            <div className="text-[10px] text-slate-400 mt-1">Stock de productos activos</div>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Donaciones Recibidas</div>
            <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <TrendingUp size={16} />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-100">{donacionesCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">Registros históricos</div>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Fundaciones Registradas</div>
            <span className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
              <Users size={16} />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-100">{beneficiariosCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">Fundaciones en la red</div>
          </div>
        </div>

        <div className="glass-card p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Alertas Críticas</div>
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${vencidosCount > 0 ? 'bg-red-500/10 text-red-400' : 'bg-slate-800 text-slate-500'}`}>
              <AlertCircle size={16} />
            </span>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-black text-slate-100">{vencidosCount}</div>
            <div className="text-[10px] text-slate-400 mt-1">Productos vencidos o sin stock</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Alertas de Vencimiento Crítico */}
        <div className="lg:col-span-12 glass-card p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <AlertTriangle size={18} className="text-amber-500" />
            <h3 className="text-sm font-bold text-slate-100 font-display">Alertas de Vencimiento de Lotes</h3>
          </div>

          <div className="space-y-2 max-h-[220px] overflow-y-auto pr-2">
            {itemsCriticos.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No hay alertas críticas vigentes de vencimiento en inventario.
              </div>
            ) : (
              itemsCriticos.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 bg-red-500/5 hover:bg-red-500/10 border border-red-500/15 rounded-xl transition-all">
                  <div>
                    <div className="text-xs font-bold text-slate-100">{item.nombre}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Lote: {item.lote || 'N/A'} - Vence: {item.fecha_vencimiento ? new Date(item.fecha_vencimiento).toLocaleDateString() : 'N/A'}</div>
                  </div>
                  <span className="text-xs font-black text-red-400 bg-red-500/10 border border-red-500/25 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {item.cantidad_disponible} unid
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
