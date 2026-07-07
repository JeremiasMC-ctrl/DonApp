import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Mail, Phone, User, Landmark, HelpCircle, ArrowRight } from 'lucide-react';
import api from '../api';

export default function Donantes({ user }) {
  const storedUser = localStorage.getItem('user');
  const loggedUser = user || (storedUser ? JSON.parse(storedUser) : null);
  const canManage = loggedUser?.permisos?.includes('donantes_gestionar');

  const [donantes, setDonantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // History Modal State
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [donorDonations, setDonorDonations] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [printData, setPrintData] = useState(null);
  
  // Form State
  const [nombre, setNombre] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [tipo, setTipo] = useState('Persona Natural');
  
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDonantes();
  }, []);

  // Bloquear el scroll del fondo cuando algún modal esté abierto
  useEffect(() => {
    if (isModalOpen || historyModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, historyModalOpen]);

  const fetchDonantes = async () => {
    setLoading(true);
    try {
      const response = await api.get('/donantes');
      setDonantes(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al obtener la lista de donantes.');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditId(null);
    setNombre('');
    setIdentificacion('');
    setEmail('');
    setTelefono('');
    setTipo('Persona Natural');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (donante) => {
    setEditId(donante.id);
    setNombre(donante.nombre);
    setIdentificacion(donante.identificacion || '');
    setEmail(donante.email || '');
    setTelefono(donante.telefono || '');
    setTipo(donante.tipo || 'Persona Natural');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError('El nombre del donante es obligatorio.');
      return;
    }

    const payload = { nombre, identificacion, email, telefono, tipo };

    try {
      if (editId) {
        await api.put(`/donantes/${editId}`, payload);
      } else {
        await api.post('/donantes', payload);
      }
      setIsModalOpen(false);
      fetchDonantes();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al guardar los datos del donante. Asegúrate que la identificación sea única.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este donante? Esto afectará los reportes vinculados.')) {
      return;
    }

    try {
      await api.delete(`/donantes/${id}`);
      fetchDonantes();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el donante.');
    }
  };

  const handleViewDonations = async (donante) => {
    setSelectedDonor(donante);
    setHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const response = await api.get('/donaciones');
      const filtered = (response.data || []).filter(d => 
        d.donante_id === donante.id || 
        d.donante.toLowerCase().trim() === donante.nombre.toLowerCase().trim()
      );
      setDonorDonations(filtered);
    } catch (err) {
      console.error('Error al obtener historial de donaciones:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handlePrintFactura = (donation) => {
    setPrintData(donation);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  const filteredDonantes = donantes.filter(d => 
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.identificacion && d.identificacion.includes(searchTerm)) ||
    (d.email && d.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-display">Donantes</h2>
          <p className="text-slate-400 text-xs mt-1">Gestiona las personas y empresas colaboradoras de DonApp.</p>
        </div>
        {canManage && (
          <button
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-sky-500/20 active:scale-[0.98]"
          >
            <Plus size={16} />
            Registrar Donante
          </button>
        )}
      </div>

      {/* Contenedor de Búsqueda */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Buscar por nombre, identificación o email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/60 border border-white/5 text-slate-200 placeholder-slate-500 text-sm focus:border-sky-500/30 focus:bg-slate-900/80 outline-none transition-all"
        />
      </div>

      {/* Listado en Tabla */}
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
                  <th className="py-4 px-6">Donante</th>
                  <th className="py-4 px-6">Identificación</th>
                  <th className="py-4 px-6">Tipo</th>
                  <th className="py-4 px-6">Contacto</th>
                  {canManage && <th className="py-4 px-6 text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
                {filteredDonantes.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-500">
                      No se encontraron donantes en el sistema.
                    </td>
                  </tr>
                ) : (
                  filteredDonantes.map((donante) => (
                    <tr key={donante.id} className="hover:bg-white/5 transition-all">
                      <td className="py-4 px-6">
                        <div 
                          className="font-semibold text-slate-100 hover:text-sky-400 hover:underline cursor-pointer transition-colors"
                          onClick={() => handleViewDonations(donante)}
                          title="Ver historial de donaciones"
                        >
                          {donante.nombre}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs text-slate-400">{donante.identificacion || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          donante.tipo === 'Empresa' 
                            ? 'bg-amber-500/10 border border-amber-500/20 text-amber-400' 
                            : 'bg-sky-500/10 border border-sky-500/20 text-sky-400'
                        }`}>
                          {donante.tipo === 'Empresa' ? <Landmark size={12} /> : <User size={12} />}
                          {donante.tipo}
                        </span>
                      </td>
                      <td className="py-4 px-6 space-y-1">
                        {donante.email && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Mail size={12} className="text-slate-500" />
                            {donante.email}
                          </div>
                        )}
                        {donante.telefono && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Phone size={12} className="text-slate-500" />
                            {donante.telefono}
                          </div>
                        )}
                        {!donante.email && !donante.telefono && <span className="text-slate-500 text-xs">Sin información</span>}
                      </td>
                      <td className="py-4 px-6 text-right">
                        {canManage && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditModal(donante)}
                              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 transition-all"
                              title="Editar donante"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(donante.id)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/10 transition-all"
                              title="Eliminar donante"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
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

      {/* Modal de Registro / Edición */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="w-full max-w-md glass-panel rounded-3xl overflow-hidden p-8 shadow-2xl z-10 animate-fade-in space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-slate-100 font-display">
                {editId ? 'Editar Donante' : 'Registrar Donante'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Tipo de Donante</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-950/60 p-1 rounded-xl border border-white/5">
                  <button
                    type="button"
                    onClick={() => setTipo('Persona Natural')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all text-center ${
                      tipo === 'Persona Natural' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Persona Natural
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('Empresa')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all text-center ${
                      tipo === 'Empresa' ? 'bg-sky-500 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Empresa / Institución
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="nombre" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nombre Completo / Razón Social</label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Fundación Sonrisas / Jeremías M."
                  className="glass-input text-sm"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="identificacion" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">DNI / RUC / Identificación</label>
                <input
                  type="text"
                  id="identificacion"
                  value={identificacion}
                  onChange={(e) => setIdentificacion(e.target.value)}
                  placeholder="Ej. 1045938173"
                  className="glass-input text-sm"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email de Contacto</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej. donante@correo.com"
                  className="glass-input text-sm"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="telefono" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Número Telefónico</label>
                <input
                  type="text"
                  id="telefono"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="Ej. +51 987 654 321"
                  className="glass-input text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-sky-500/20 active:scale-[0.98] mt-4"
              >
                {editId ? 'Actualizar Donante' : 'Registrar Donante'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal del Historial de Donaciones */}
      {historyModalOpen && selectedDonor && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-2xl glass-panel rounded-3xl overflow-hidden p-8 shadow-2xl z-10 animate-fade-in space-y-6 my-8">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100 font-display">Historial de Donaciones</h3>
                <p className="text-xs text-sky-400 font-semibold mt-1">Donante: {selectedDonor.nombre}</p>
              </div>
              <button 
                onClick={() => setHistoryModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>

            {loadingHistory ? (
              <div className="text-center py-8 text-slate-400 text-sm">Cargando donaciones del donante...</div>
            ) : donorDonations.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">Este donante no registra donaciones entregadas o en espera.</div>
            ) : (
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {donorDonations.map((don) => (
                  <div key={don.id} className="bg-slate-950/20 border border-white/5 p-4 rounded-xl flex justify-between items-center gap-4 hover:border-white/10 transition-all">
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-400 font-mono">
                        COMPROBANTE: DON-{String(don.id).padStart(5, '0')}
                      </div>
                      <div className="text-sm font-semibold text-slate-200">
                        Destino: {don.institucion}
                      </div>
                      <div className="text-xs text-slate-450">
                        Fecha de Registro: {don.fecha}
                      </div>
                      <div className="text-xs text-sky-400 font-medium mt-1">
                        {don.productos?.length || 0} ítems donados
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        don.estado === 'Entregada' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {don.estado}
                      </span>
                      {don.estado === 'Entregada' && (
                        <button
                          onClick={() => handlePrintFactura(don)}
                          className="px-2.5 py-1 bg-sky-500 hover:bg-sky-600 text-white text-[10px] font-semibold rounded-lg flex items-center gap-1 transition-all"
                          title="Imprimir comprobante de donación"
                        >
                          <span>Factura</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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
