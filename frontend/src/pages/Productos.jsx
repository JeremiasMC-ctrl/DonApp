import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  Layers, 
  ShoppingBag, 
  Activity, 
  Heart,
  TrendingUp,
  AlertCircle 
} from 'lucide-react';
import api from '../api';
import Header from '../components/Header';

export default function Productos({ user }) {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);

  useEffect(() => {
    fetchProductos();
  }, []);

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const response = await api.get('/productos');
      setProductos(response.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al conectar con el servidor para cargar el inventario.');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos
  const filteredProducts = productos.filter((p) => {
    const term = searchTerm.toLowerCase();
    return (
      p.nombre.toLowerCase().includes(term) ||
      p.categoria.toLowerCase().includes(term) ||
      (p.donacion?.donante && p.donacion.donante.toLowerCase().includes(term)) ||
      (p.donacion?.institucion && p.donacion.institucion.toLowerCase().includes(term))
    );
  });

  // Calcular métricas dinámicas
  const getCategoryMetrics = (categoryName) => {
    return productos
      .filter(p => p.categoria.toLowerCase() === categoryName.toLowerCase())
      .reduce((sum, p) => sum + parseInt(p.cantidad), 0);
  };

  const totalAlimentos = getCategoryMetrics('alimentos');
  const totalMedicinas = getCategoryMetrics('medicinas');
  const totalOtros = productos
    .filter(p => {
      const c = p.categoria.toLowerCase();
      return c !== 'alimentos' && c !== 'medicinas';
    })
    .reduce((sum, p) => sum + parseInt(p.cantidad), 0);

  const getCategoryBadgeClass = (category) => {
    const c = category?.toLowerCase() || '';
    switch (c) {
      case 'alimentos':
        return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
      case 'medicinas':
        return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
      case 'ropa':
        return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
      case 'artículos de aseo':
        return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      default:
        return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="Inventario de Productos Donados" user={user} />

      <main className="p-6 md:p-8 flex-1 flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fade-in relative z-10">
        
        {/* Alertas */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Tarjetas de Resumen de Stock */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="glass-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-teal-500/15 bg-teal-500/10 text-teal-400">
              <ShoppingBag size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
                {totalAlimentos.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Alimentos Recibidos</div>
            </div>
          </div>

          <div className="glass-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-sky-500/15 bg-sky-500/10 text-sky-400">
              <Activity size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
                {totalMedicinas.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Medicinas Recibidas</div>
            </div>
          </div>

          <div className="glass-card flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center border border-slate-500/15 bg-slate-500/10 text-slate-400">
              <Layers size={22} />
            </div>
            <div>
              <div className="text-2xl font-bold tracking-tight text-slate-100 font-mono">
                {totalOtros.toLocaleString()}
              </div>
              <div className="text-xs text-slate-400 mt-0.5">Otros Recursos (Ropa/Aseo)</div>
            </div>
          </div>
        </div>

        {/* Listado de Productos */}
        <div className="glass-card">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <FileText size={20} className="text-sky-500" />
              <h2 className="text-lg font-bold text-slate-200">Inventario Global de Donaciones</h2>
            </div>

            {/* Buscador interno */}
            <div className="relative w-full md:w-80">
              <input
                type="text"
                placeholder="Buscar por producto, categoría, donante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl bg-slate-950/40 border border-white/10 py-2 pl-10 pr-4 outline-none text-xs text-slate-200 placeholder-slate-400 focus:border-sky-500/50 focus:bg-slate-950/60 transition-all duration-300"
              />
              <Search size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Cargando inventario...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-4.5 px-4">ID</th>
                    <th className="py-4.5 px-4">Producto</th>
                    <th className="py-4.5 px-4">Categoría</th>
                    <th className="py-4.5 px-4">Cantidad Registrada</th>
                    <th className="py-4.5 px-4">Donación Origen (ID)</th>
                    <th className="py-4.5 px-4">Donante</th>
                    <th className="py-4.5 px-4">Institución Destino</th>
                    <th className="py-4.5 px-4">Fecha Ingreso</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-slate-500">No se encontraron productos en el inventario.</td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                        <td className="py-4 px-4 font-mono text-slate-450">{p.id}</td>
                        <td className="py-4 px-4 font-semibold text-slate-200">{p.nombre}</td>
                        <td className="py-4 px-4">
                          <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-medium ${getCategoryBadgeClass(p.categoria)}`}>
                            {p.categoria}
                          </span>
                        </td>
                        <td className="py-4 px-4 font-mono font-semibold text-sky-400 text-xs">
                          {p.cantidad} <span className="text-slate-450 font-normal text-[10px]">{p.unidad || 'unidades'}</span>
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-slate-400">
                          {p.donacion_id ? `Donación #${p.donacion_id}` : 'N/A'}
                        </td>
                        <td className="py-4 px-4 text-slate-300">{p.donacion?.donante || 'N/A'}</td>
                        <td className="py-4 px-4 text-slate-300">{p.donacion?.institucion || 'N/A'}</td>
                        <td className="py-4 px-4 text-slate-450 text-xs font-mono">{p.donacion?.fecha || 'N/A'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>
      
      <footer className="w-full text-center py-6 text-slate-500 border-t border-white/5 mt-auto text-xs">
        <p>&copy; 2026 DonApp. Todos los derechos reservados. Proyecto Universitario.</p>
      </footer>
    </div>
  );
}
