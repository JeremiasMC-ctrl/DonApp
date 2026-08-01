import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Plus, 
  Trash2, 
  Calendar, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X,
  Eye,
  Edit2,
  Clock
} from 'lucide-react';
import api from '../api';
import Header from '../components/Header';

export default function Donaciones({ user, hideHeader }) {
  const [donaciones, setDonaciones] = useState([]);
  const [donantes, setDonantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const rolLower = user?.rol?.toLowerCase() || '';
  const isSupervisor = rolLower === 'supervisor' || rolLower === 'trabajador social';

  // Alertas
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDonationId, setCurrentDonationId] = useState(null);
  const [originalEstado, setOriginalEstado] = useState('');
  const [printData, setPrintData] = useState(null);

  // Formulario
  const [form, setForm] = useState({
    donante: '',
    donante_id: '',
    institucion: '',
    fecha: '',
    estado: 'En Espera',
    observaciones: '',
    productos: []
  });
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Catálogos
  const instituciones = [
    'Fundación Esperanza',
    'Hogar del Niño',
    'Banco de Alimentos',
    'Cruz Roja Local',
    'Cáritas Diocesana'
  ];

  const categorias = [
    'Alimentos',
    'Medicinas',
    'Ropa',
    'Artículos de Aseo',
    'Otros'
  ];

  useEffect(() => {
    fetchDonaciones();
    fetchDonantes();
  }, []);

  // Bloquear el scroll del fondo cuando el modal esté abierto
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


  const fetchDonaciones = async () => {
    setLoading(true);
    try {
      const response = await api.get('/donaciones');
      setDonaciones(response.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al conectar con el servidor para cargar las donaciones.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDonantes = async () => {
    try {
      const response = await api.get('/donantes');
      setDonantes(response.data || []);
    } catch (err) {
      console.error('Error al cargar donantes:', err);
    }
  };

  // Abrir modal de creación
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setCurrentDonationId(null);
    setOriginalEstado('En Espera');
    setForm({
      donante: '',
      donante_id: '',
      institucion: instituciones[0],
      fecha: new Date().toISOString().split('T')[0],
      estado: 'En Espera',
      observaciones: '',
      productos: [{ nombre: '', categoria: categorias[0], cantidad: 1, unidad: 'unidades' }]
    });
    setFormError(null);
    setShowModal(true);
  };

  // Abrir modal de visualización / edición
  const handleOpenViewEdit = (don) => {
    setIsEditMode(true);
    setCurrentDonationId(don.id);
    setOriginalEstado(don.estado);
    setForm({
      donante: don.donante,
      donante_id: don.donante_id || '',
      institucion: don.institucion,
      fecha: don.fecha,
      estado: don.estado,
      observaciones: don.observaciones || '',
      productos: don.productos && don.productos.length > 0 
        ? don.productos.map(p => ({ ...p }))
        : [{ nombre: '', categoria: categorias[0], cantidad: 1, unidad: 'unidades' }]
    });
    setFormError(null);
    setShowModal(true);
  };

  // Imprimir Factura / Comprobante de Donación
  const handlePrintFactura = (donationId) => {
    const don = donaciones.find(d => d.id === donationId);
    if (!don) return;
    setPrintData(don);
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Agregar fila de producto en el modal
  const handleAddProductRow = () => {
    setForm({
      ...form,
      productos: [
        ...form.productos,
        { nombre: '', categoria: categorias[0], cantidad: 1, unidad: 'unidades' }
      ]
    });
  };

  // Eliminar fila de producto en el modal
  const handleRemoveProductRow = (index) => {
    const updated = [...form.productos];
    updated.splice(index, 1);
    setForm({ ...form, productos: updated });
  };

  // Modificar campo de producto en el modal
  const handleProductChange = (index, field, value) => {
    const updated = [...form.productos];
    updated[index][field] = value;
    setForm({ ...form, productos: updated });
  };

  // Validaciones del formulario
  const validateForm = () => {
    const { donante, institucion, fecha, productos } = form;

    if (!donante || !donante.trim()) {
      setFormError('El nombre del donante es obligatorio.');
      return false;
    }

    if (!institucion || !institucion.trim()) {
      setFormError('La institución destino es obligatoria.');
      return false;
    }

    if (!fecha) {
      setFormError('La fecha de la donación es obligatoria.');
      return false;
    }

    if (productos.length === 0) {
      setFormError('Debes registrar al menos un producto en la donación.');
      return false;
    }

    // Validar productos
    for (let i = 0; i < productos.length; i++) {
      const p = productos[i];
      if (!p.nombre || !p.nombre.trim()) {
        setFormError(`El nombre del producto #${i + 1} es obligatorio.`);
        return false;
      }
      if (!p.cantidad || parseInt(p.cantidad) <= 0) {
        setFormError(`La cantidad del producto #${i + 1} debe ser mayor a 0.`);
        return false;
      }
      if (!p.unidad || !p.unidad.trim()) {
        setFormError(`La unidad del producto #${i + 1} es obligatoria (ej: kg, unidades).`);
        return false;
      }
    }
    return true;
  };

  // Marcar como Entregada directamente
  const handleDeliverDonation = async () => {
    setFormError(null);
    if (!validateForm()) return;
    if (window.confirm('¿Estás seguro de que deseas marcar esta donación como Entregada? Esto la guardará y ya no se podrá modificar.')) {
      setSubmitting(true);
      try {
        const updatedForm = { ...form, estado: 'Entregada' };
        const response = await api.put(`/donaciones/${currentDonationId}`, updatedForm);
        setSuccessMsg(response.data.mensaje || 'Donación marcada como entregada.');
        setShowModal(false);
        fetchDonaciones();
      } catch (err) {
        console.error(err);
        setFormError(err.response?.data?.error || 'Ocurrió un error al entregar la donación.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  // Envío del formulario (Creación o Actualización)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      if (isEditMode) {
        // Actualizar
        const response = await api.put(`/donaciones/${currentDonationId}`, form);
        setSuccessMsg(response.data.mensaje || 'Donación actualizada correctamente.');
      } else {
        // Registrar
        const response = await api.post('/donaciones', form);
        setSuccessMsg(response.data.mensaje || 'Donación registrada correctamente.');
      }
      setShowModal(false);
      fetchDonaciones();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.error || 'Ocurrió un error al guardar la donación.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    const s = status?.toLowerCase() || '';
    if (s === 'entregada') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
  };

  const isReadOnly = (isEditMode && originalEstado === 'Entregada');
  const disableInputs = isReadOnly || (isEditMode && form.estado === 'Entregada');
  const canSetEntregada = rolLower === 'administrador' || rolLower === 'admin' || rolLower === 'supervisor' || rolLower === 'trabajador social';
  const disableProductInputs = disableInputs;

  const filteredDonaciones = donaciones.filter(d => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    return (
      d.id.toString().includes(term) ||
      d.donante?.toLowerCase().includes(term) ||
      d.institucion?.toLowerCase().includes(term) ||
      d.fecha?.toLowerCase().includes(term) ||
      (d.usuario && `${d.usuario.nombres} ${d.usuario.apellidos}`.toLowerCase().includes(term)) ||
      (d.productos && d.productos.some(p => p.nombre?.toLowerCase().includes(term)))
    );
  });

  const donacionesEnEspera = filteredDonaciones.filter(d => d.estado?.toLowerCase() === 'en espera');
  const donacionesEntregadas = filteredDonaciones.filter(d => d.estado?.toLowerCase() === 'entregada');

  const renderTable = (lista, mensajeVacio) => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-white/5 text-slate-400 font-semibold text-xs uppercase tracking-wider">
              <th className="py-4.5 px-4">ID</th>
              <th className="py-4.5 px-4">Donante</th>
              <th className="py-4.5 px-4">Institución Destino</th>
              <th className="py-4.5 px-4">Fecha</th>
              <th className="py-4.5 px-4">Productos</th>
              <th className="py-4.5 px-4">Registrador por</th>
              <th className="py-4.5 px-4">Estado</th>
              <th className="py-4.5 px-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-slate-300">
            {lista.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-10 text-slate-500">{mensajeVacio}</td>
              </tr>
            ) : (
              lista.map((don) => (
                <tr key={don.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                  <td className="py-4 px-4 font-mono text-slate-450">{don.id}</td>
                  <td className="py-4 px-4 font-semibold text-slate-200">{don.donante}</td>
                  <td className="py-4 px-4 text-slate-300">{don.institucion}</td>
                  <td className="py-4 px-4 text-slate-400 font-mono text-xs">{don.fecha}</td>
                  <td className="py-4 px-4">
                    <span className="text-xs text-sky-400 font-semibold bg-sky-500/10 px-2 py-0.5 rounded-md">
                      {don.productos ? don.productos.length : 0} items
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-450 text-xs">
                    {don.usuario ? `${don.usuario.nombres} ${don.usuario.apellidos}` : 'N/A'}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${getStatusBadgeClass(don.estado)}`}>
                      {don.estado}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <button 
                      onClick={() => handleOpenViewEdit(don)}
                      className="px-3.5 py-1.5 rounded-lg border border-sky-500/20 text-sky-400 hover:bg-sky-500/10 text-xs font-semibold tracking-wide transition-all duration-150 flex items-center gap-1.5 mx-auto animate-pulse-subtle"
                    >
                      {don.estado === 'Entregada' ? (
                        <>
                          <Eye size={13} />
                          <span>Ver Detalle</span>
                        </>
                      ) : (
                        <>
                          <Edit2 size={13} />
                          <span>Editar</span>
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {!hideHeader && (
        <Header 
          title={isSupervisor ? 'Reporte de Donaciones' : 'Gestión de Donaciones'} 
          user={user} 
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          placeholderText="Buscar donaciones..."
        />
      )}

      <main className="p-6 md:p-8 flex-1 flex flex-col gap-6 max-w-7xl w-full mx-auto animate-fade-in relative z-10">
        
        {/* Alertas generales */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <CheckCircle size={18} />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-300">
              <X size={16} />
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="text-red-400 hover:text-red-300">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Tabla de Donaciones */}
        {loading ? (
          <div className="glass-card text-center py-12 text-slate-400 text-sm">
            Cargando donaciones...
          </div>
        ) : (
          <>
            {/* Donaciones en Espera */}
            <div className="glass-card mb-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <Clock size={20} className="text-amber-500" />
                  <h2 className="text-lg font-bold text-slate-200">
                    Donaciones en Espera
                  </h2>
                </div>
                {!isSupervisor && (
                  <button 
                    type="button" 
                    onClick={handleOpenCreate}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md shadow-sky-500/10 hover:shadow-sky-600/20"
                  >
                    <Plus size={16} />
                    <span>Registrar Donación</span>
                  </button>
                )}
              </div>
              {renderTable(donacionesEnEspera, 'No hay donaciones en espera en el sistema.')}
            </div>

            {/* Donaciones Entregadas */}
            <div className="glass-card">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
                <div className="flex items-center gap-2.5">
                  <CheckCircle size={20} className="text-emerald-500" />
                  <h2 className="text-lg font-bold text-slate-200">
                    Donaciones Entregadas
                  </h2>
                </div>
              </div>
              {renderTable(donacionesEntregadas, 'No hay donaciones entregadas en el sistema.')}
            </div>
          </>
        )}
      </main>

      {/* ==========================================
         MODAL DE CREACIÓN / EDICIÓN
         ========================================== */}
      {showModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-3xl glass-panel rounded-3xl overflow-hidden p-8 shadow-2xl animate-fade-in space-y-6 my-8">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <h3 className="text-lg font-bold text-slate-100 font-display">
                  {isReadOnly ? 'Detalle de Donación' : (isEditMode ? 'Editar Donación' : 'Registrar Donación')}
                </h3>
                <div className="flex items-center gap-3">
                  {isEditMode && form.estado === 'Entregada' && (
                    <button
                      type="button"
                      onClick={() => handlePrintFactura(currentDonationId)}
                      className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md shadow-sky-500/10 active:scale-[0.98]"
                    >
                      <FileText size={13} />
                      <span>Imprimir Factura</span>
                    </button>
                  )}
                  <button 
                    onClick={() => setShowModal(false)}
                    className="text-slate-400 hover:text-white text-sm font-semibold transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>

              {formError && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
                {/* Cabecera */}
                {/* Cabecera */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Donante</label>
                    <input
                      type="text"
                      list="donantes-list"
                      className="glass-input text-xs disabled:opacity-50"
                      placeholder="Escribe o selecciona un donante"
                      value={form.donante}
                      disabled={disableProductInputs}
                      onChange={(e) => {
                        const name = e.target.value;
                        const matchedDonante = donantes.find(d => d.nombre.toLowerCase() === name.toLowerCase());
                        setForm({
                          ...form,
                          donante: name,
                          donante_id: matchedDonante ? matchedDonante.id : ''
                        });
                      }}
                    />
                    <datalist id="donantes-list">
                      {donantes.map((don) => (
                        <option key={don.id} value={don.nombre} />
                      ))}
                    </datalist>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 font-semibold">Institución Destino</label>
                    <select
                      className="w-full rounded-xl bg-slate-950/40 border border-white/10 px-4 py-3 outline-none text-slate-200 text-xs focus:border-sky-500/50 disabled:opacity-50"
                      required
                      value={form.institucion}
                      disabled={disableProductInputs}
                      onChange={(e) => setForm({ ...form, institucion: e.target.value })}
                    >
                      {instituciones.map((inst, i) => (
                        <option key={i} value={inst} className="bg-slate-900 text-slate-200">{inst}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Fecha</label>
                    <div className="relative">
                      <input
                        type="date"
                        className="glass-input text-xs disabled:opacity-50"
                        required
                        value={form.fecha}
                        disabled={disableProductInputs}
                        onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Observaciones</label>
                  <textarea
                    rows={2}
                    className="glass-input text-xs resize-none disabled:opacity-50"
                    placeholder="Observaciones adicionales..."
                    value={form.observaciones}
                    disabled={disableInputs}
                    onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  />
                </div>

                {/* Sub-form de Productos */}
                <div className="border-t border-white/5 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-sky-400 pl-1">Productos Donados</h4>
                    {!disableProductInputs && (
                      <button
                        type="button"
                        onClick={handleAddProductRow}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/10 text-xs font-semibold rounded-lg flex items-center gap-1 transition-all duration-150"
                      >
                        <Plus size={12} />
                        <span>Añadir Producto</span>
                      </button>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pr-1">
                    {form.productos.map((prod, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950/20 p-3 rounded-xl border border-white/5">
                        
                        <div className="w-full sm:flex-1">
                          <input
                            type="text"
                            placeholder="Nombre del producto"
                            className="glass-input text-xs py-2 disabled:opacity-50"
                            required
                            value={prod.nombre}
                            disabled={disableProductInputs}
                            onChange={(e) => handleProductChange(idx, 'nombre', e.target.value)}
                          />
                        </div>

                        <div className="w-full sm:w-44">
                          <select
                            className="w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2 outline-none text-slate-200 text-xs focus:border-sky-500/50 disabled:opacity-50"
                            required
                            value={prod.categoria}
                            disabled={disableProductInputs}
                            onChange={(e) => handleProductChange(idx, 'categoria', e.target.value)}
                          >
                            {categorias.map((cat, i) => (
                              <option key={i} value={cat} className="bg-slate-900 text-slate-200">{cat}</option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full sm:w-24">
                          <input
                            type="number"
                            placeholder="Cant."
                            min="1"
                            className="glass-input text-xs py-2 text-center disabled:opacity-50"
                            required
                            value={prod.cantidad}
                            disabled={disableProductInputs}
                            onChange={(e) => handleProductChange(idx, 'cantidad', e.target.value)}
                          />
                        </div>

                        <div className="w-full sm:w-28">
                          <input
                            type="text"
                            placeholder="Unidad (kg, cajas)"
                            className="glass-input text-xs py-2 disabled:opacity-50"
                            required
                            value={prod.unidad}
                            disabled={disableProductInputs}
                            onChange={(e) => handleProductChange(idx, 'unidad', e.target.value)}
                          />
                        </div>

                        {!disableProductInputs && form.productos.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveProductRow(idx)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors duration-150 self-end sm:self-center"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}

                      </div>
                    ))}
                  </div>
                </div>

                {!isReadOnly && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <button 
                      type="submit" 
                      className="flex-1 btn-gradient text-xs font-semibold py-2.5"
                      disabled={submitting}
                    >
                      {submitting ? 'Guardando...' : (isEditMode ? 'ACTUALIZAR DONACIÓN' : 'REGISTRAR DONACIÓN')}
                    </button>
                    {isEditMode && canSetEntregada && (
                      <button
                        type="button"
                        onClick={handleDeliverDonation}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-750 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-650/10 active:scale-[0.98] disabled:opacity-50"
                        disabled={submitting}
                      >
                        <CheckCircle size={14} />
                        <span>Marcar como Entregada</span>
                      </button>
                    )}
                  </div>
                )}
              </form>
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

      <footer className="w-full text-center py-6 text-slate-500 border-t border-white/5 mt-auto text-xs">
        <p>&copy; 2026 DonApp. Todos los derechos reservados. Proyecto Universitario.</p>
      </footer>
    </div>
  );
}
