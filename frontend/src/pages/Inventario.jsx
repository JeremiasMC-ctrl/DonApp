import React, { useState, useEffect } from 'react';
import { Search, Calendar, Package, Layers, Info, CheckCircle, Clock, Eye, FileText } from 'lucide-react';
import api from '../api';

export default function Inventario() {
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [error, setError] = useState(null);

  // Details Modal State
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [printData, setPrintData] = useState(null);

  useEffect(() => {
    fetchInventario();
  }, []);

  // Bloquear el scroll del fondo cuando el modal de detalles esté abierto
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal]);

  const handleOpenDetails = async (donacionId) => {
    if (!donacionId) return;
    setShowModal(true);
    setLoadingDetails(true);
    try {
      const response = await api.get('/donaciones');
      const matched = (response.data || []).find(d => d.id === donacionId);
      setSelectedDonation(matched || null);
    } catch (err) {
      console.error("Error al obtener detalles de la donación:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handlePrintFactura = (donation) => {
    setPrintData(donation);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const fetchInventario = async () => {
    setLoading(true);
    try {
      const response = await api.get('/inventario');
      setInventario(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el histórico de inventario.');
    } finally {
      setLoading(false);
    }
  };

  // Get categories list for filter
  const categorias = Array.from(new Set(inventario.map(item => item.categoria)));

  // Calculate statistics (Scenario A: Historical metrics)
  const totalLotes = inventario.length;
  const uniqueCategories = categorias.length;
  const totalQuantity = inventario.reduce((acc, curr) => acc + (parseInt(curr.cantidad) || 0), 0);

  const filteredInventario = inventario.filter(item => {
    const matchesSearch = item.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.lote && item.lote.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.donacion?.donante && item.donacion.donante.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (item.donacion?.institucion && item.donacion.institucion.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === '' || item.categoria === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStatusBadgeClass = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'entregada') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  };

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-xl font-bold text-slate-100 font-display">Histórico de Productos Donados</h2>
        <p className="text-slate-400 text-xs mt-1">Registro de todos los productos y alimentos ingresados al sistema a través de donaciones.</p>
      </div>

      {/* Tarjetas de Estadísticas Logísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-sky-500">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 flex items-center justify-center text-sky-400">
            <Package size={22} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total de Lotes Donados</div>
            <div className="text-2xl font-black text-slate-100 mt-1">{totalLotes} lotes</div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-indigo-500">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <Layers size={22} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Categorías Únicas</div>
            <div className="text-2xl font-black text-slate-100 mt-1">{uniqueCategories} categorías</div>
          </div>
        </div>

        <div className="glass-card p-6 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
            <Info size={22} />
          </div>
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Volumen Total Donado</div>
            <div className="text-2xl font-black text-slate-100 mt-1">{totalQuantity.toLocaleString()} unidades</div>
          </div>
        </div>
      </div>

      {/* Controles de Búsqueda y Filtro */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Buscar por producto, lote, donante o fundación de destino..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/60 border border-white/5 text-slate-200 placeholder-slate-500 text-sm focus:border-sky-500/30 focus:bg-slate-900/80 outline-none transition-all"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 rounded-2xl bg-slate-900/60 border border-white/5 text-slate-300 text-sm focus:border-sky-500/30 focus:bg-slate-900/80 outline-none transition-all cursor-pointer"
        >
          <option value="">Todas las Categorías</option>
          {categorias.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Tabla de Inventario Histórico */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-500"></div>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-4 px-6">Producto</th>
                  <th className="py-4 px-6">Categoría</th>
                  <th className="py-4 px-6">Lote</th>
                  <th className="py-4 px-6">Cantidad Donada</th>
                  <th className="py-4 px-6">Vencimiento</th>
                  <th className="py-4 px-6">Estado Donación</th>
                  <th className="py-4 px-6 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
                {filteredInventario.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12 text-slate-500">
                      No hay productos registrados en el histórico.
                    </td>
                  </tr>
                ) : (
                  filteredInventario.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5 transition-all">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-100">{item.nombre}</div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          Donado por: <span className="text-slate-400">{item.donacion?.donante || 'N/A'}</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Destino: <span className="text-slate-400 font-semibold">{item.donacion?.institucion || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-xs text-slate-400 border border-white/5">{item.categoria}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs text-slate-400">{item.lote || 'Sin Lote'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-100">{item.cantidad}</span>
                          <span className="text-xs text-slate-500">{item.unidad || 'unidades'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Calendar size={12} className="text-slate-500" />
                            <span>{item.fecha_vencimiento ? new Date(item.fecha_vencimiento).toLocaleDateString() : 'Indefinido'}</span>
                          </div>
                          {item.fecha_vencimiento && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.alerta_estado === 'danger' 
                                ? 'bg-red-500/10 border border-red-500/20 text-red-400' 
                                : item.alerta_estado === 'warning'
                                  ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                                  : 'bg-sky-500/10 border border-sky-500/20 text-sky-400'
                            }`}>
                              {item.alerta_vencimiento}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full font-medium ${getStatusBadgeClass(item.donacion?.estado)}`}>
                          {item.donacion?.estado === 'Entregada' ? <CheckCircle size={10} /> : <Clock size={10} />}
                          {item.donacion?.estado || 'En Espera'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {item.donacion_id && (
                          <button
                            onClick={() => handleOpenDetails(item.donacion_id)}
                            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 transition-all"
                            title="Ver detalles de la donación"
                          >
                            <Eye size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Detalles de Donación */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-3xl glass-panel rounded-3xl overflow-hidden p-8 shadow-2xl space-y-6 my-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-display">Detalles de la Donación</h3>
                {selectedDonation && (
                  <p className="text-xs text-sky-400 font-semibold mt-1">COMPROBANTE: DON-{String(selectedDonation.id).padStart(5, '0')}</p>
                )}
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>

            {loadingDetails ? (
              <div className="text-center py-12 text-slate-400 text-sm">Cargando detalles de la donación...</div>
            ) : !selectedDonation ? (
              <div className="text-center py-12 text-slate-500 text-sm">No se encontraron detalles para esta donación.</div>
            ) : (
              <div className="space-y-6">
                {/* Cabecera del Detalle */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-950/20 p-4 rounded-2xl border border-white/5">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Donante</span>
                    <p className="text-sm font-semibold text-slate-200 mt-1">{selectedDonation.donante}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fundación Destino</span>
                    <p className="text-sm font-semibold text-slate-200 mt-1">{selectedDonation.institucion}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Fecha y Estado</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-slate-300 font-semibold">{selectedDonation.fecha}</span>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${getStatusBadgeClass(selectedDonation.estado)}`}>
                        {selectedDonation.estado}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tabla de Productos Donados */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-sky-400">Productos del Envío</h4>
                  <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-950/20">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/5 bg-slate-900/40 text-slate-400 font-bold uppercase">
                          <th className="py-2.5 px-4">Producto</th>
                          <th className="py-2.5 px-4">Categoría</th>
                          <th className="py-2.5 px-4">Lote</th>
                          <th className="py-2.5 px-4">Vencimiento</th>
                          <th className="py-2.5 px-4 text-right">Cantidad</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5 text-slate-300">
                        {selectedDonation.productos && selectedDonation.productos.map((prod, idx) => (
                          <tr key={idx} className="hover:bg-white/5 transition-colors">
                            <td className="py-2.5 px-4 font-semibold text-slate-100">{prod.nombre}</td>
                            <td className="py-2.5 px-4">{prod.categoria}</td>
                            <td className="py-2.5 px-4 font-mono text-slate-400">{prod.lote || 'Sin Lote'}</td>
                            <td className="py-2.5 px-4">{prod.fecha_vencimiento ? new Date(prod.fecha_vencimiento).toLocaleDateString() : 'N/A'}</td>
                            <td className="py-2.5 px-4 text-right font-extrabold text-slate-100">{prod.cantidad} {prod.unidad || 'unidades'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Observaciones */}
                {selectedDonation.observaciones && (
                  <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Observaciones</span>
                    <p className="text-xs text-slate-350 italic">"{selectedDonation.observaciones}"</p>
                  </div>
                )}

                {/* Botón de Impresión de Factura */}
                {selectedDonation.estado === 'Entregada' && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => handlePrintFactura(selectedDonation)}
                      className="px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/10 active:scale-[0.98]"
                    >
                      <FileText size={14} />
                      <span>Imprimir Factura</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
         COMPROBANTE IMPRIMIBLE (FACTURA DE DONACIÓN)
         ========================================== */}
      {printData && (
        <div id="printable-factura" className="hidden print:block p-8 bg-white text-black font-sans max-w-4xl mx-auto">
          {/* Cabecera */}
          <div className="flex justify-between items-start border-b-2 border-slate-300 pb-5">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-800 uppercase">DonApp</h1>
              <p className="text-xs text-slate-500 mt-1">Plataforma Logística de Donaciones</p>
              <p className="text-xs text-slate-500">Reporte y Transparencia Alimentaria</p>
            </div>
            <div className="text-right">
              <h2 className="text-lg font-bold text-slate-800">ACTA DE ENTREGA DE DONACIÓN</h2>
              <p className="text-sm font-mono font-semibold mt-1">Nº COMPROBANTE: DON-{String(printData.id).padStart(5, '0')}</p>
              <p className="text-xs text-slate-500 mt-0.5">Fecha de Emisión: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Información del Envío */}
          <div className="grid grid-cols-2 gap-6 my-6 border-b border-slate-200 pb-5 text-sm">
            <div>
              <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider mb-2">Entidad Donante</h3>
              <p className="font-bold text-slate-800">{printData.donante}</p>
              {printData.donante_id && (
                <p className="text-xs text-slate-650 mt-1">ID Donante: {printData.donante_id}</p>
              )}
            </div>
            <div>
              <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider mb-2">Fundación Destinataria</h3>
              <p className="font-bold text-slate-800">{printData.institucion}</p>
              <p className="text-xs text-slate-650 mt-1">Fecha de Entrega: {printData.fecha}</p>
            </div>
          </div>

          {/* Detalle de Productos */}
          <div className="my-6">
            <h3 className="font-bold text-xs uppercase text-slate-500 tracking-wider mb-3">Detalle de Productos Entregados</h3>
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-350 bg-slate-100 text-slate-700 font-bold">
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3">Lote</th>
                  <th className="py-2.5 px-3">Vencimiento</th>
                  <th className="py-2.5 px-3 text-right">Cantidad Entregada</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-slate-800">
                {printData.productos && printData.productos.map((prod, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 px-3 font-semibold">{prod.nombre}</td>
                    <td className="py-2.5 px-3">{prod.categoria}</td>
                    <td className="py-2.5 px-3 font-mono">{prod.lote || 'Sin Lote'}</td>
                    <td className="py-2.5 px-3">{prod.fecha_vencimiento ? new Date(prod.fecha_vencimiento).toLocaleDateString() : 'N/A'}</td>
                    <td className="py-2.5 px-3 text-right font-bold">{prod.cantidad} {prod.unidad || 'unidades'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Observaciones */}
          {printData.observaciones && (
            <div className="my-6 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="font-bold text-xs uppercase text-slate-500 mb-1">Observaciones de la Operación</h4>
              <p className="text-xs text-slate-700 italic">"{printData.observaciones}"</p>
            </div>
          )}

          {/* Firmas de Conformidad */}
          <div className="grid grid-cols-2 gap-12 mt-20 text-center text-xs">
            <div className="flex flex-col items-center">
              <div className="w-48 border-b border-slate-400 mb-2"></div>
              <p className="font-bold text-slate-800">Entregado por (DonApp / Operador)</p>
              <p className="text-slate-500 mt-1">{printData.usuario ? `${printData.usuario.nombres} ${printData.usuario.apellidos}` : 'Usuario Registrador'}</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-48 border-b border-slate-400 mb-2"></div>
              <p className="font-bold text-slate-800">Recibido por (Fundación Destinataria)</p>
              <p className="text-slate-500 mt-1">Firma Autorizada y Sello</p>
            </div>
          </div>

          {/* Pie de página de factura */}
          <div className="mt-20 border-t border-slate-200 pt-5 text-center text-[10px] text-slate-400">
            <p>Este documento es un comprobante de entrega oficial emitido por la plataforma DonApp.</p>
            <p className="mt-1">DonApp © 2026 - Conectando Donantes con Fundaciones Solidarias.</p>
          </div>
        </div>
      )}
    </div>
  );
}
