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
  Edit2
} from 'lucide-react';
import api from '../api';
import Header from '../components/Header';

export default function Donaciones({ user }) {
  const [donaciones, setDonaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const rolLower = user?.rol?.toLowerCase() || '';
  const isSupervisor = rolLower === 'supervisor';

  // Alertas
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentDonationId, setCurrentDonationId] = useState(null);

  // Formulario
  const [form, setForm] = useState({
    donante: '',
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
  }, []);

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

  // Abrir modal de creación
  const handleOpenCreate = () => {
    setIsEditMode(false);
    setCurrentDonationId(null);
    setForm({
      donante: '',
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
    setForm({
      donante: don.donante,
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

  // Envío del formulario (Creación o Actualización)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);

    const { donante, institucion, fecha, estado, observaciones, productos } = form;

    if (!donante.trim() || !institucion.trim() || !fecha) {
      setFormError('Todos los campos de la cabecera son obligatorios.');
      setSubmitting(false);
      return;
    }

    if (productos.length === 0) {
      setFormError('Debes registrar al menos un producto en la donación.');
      setSubmitting(false);
      return;
    }

    // Validar productos
    for (const p of productos) {
      if (!p.nombre.trim() || !p.cantidad || parseInt(p.cantidad) <= 0) {
        setFormError('Todos los productos deben tener nombre y cantidad válida mayor a 0.');
        setSubmitting(false);
        return;
      }
    }

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

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title={isSupervisor ? 'Reporte de Donaciones' : 'Gestión de Donaciones'} user={user} />

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
        <div className="glass-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <Heart size={20} className="text-sky-500" />
              <h2 className="text-lg font-bold text-slate-200">
                {isSupervisor ? 'Historial de Donaciones' : 'Donaciones Registradas'}
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

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Cargando donaciones...</div>
          ) : (
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
                  {donaciones.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="text-center py-10 text-slate-500">No hay donaciones registradas en el sistema.</td>
                    </tr>
                  ) : (
                    donaciones.map((don) => (
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
                            {isSupervisor ? (
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
          )}
        </div>

        {/* ==========================================
           MODAL DE CREACIÓN / EDICIÓN
           ========================================== */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
            <div className="w-full max-w-3xl bg-slate-900 border border-white/10 rounded-3xl overflow-hidden p-8 shadow-2xl relative my-8">
              <button 
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-100 uppercase tracking-widest font-display">
                  {isSupervisor ? 'Detalle de Donación' : (isEditMode ? 'Editar Donación' : 'Registrar Donación')}
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  {isSupervisor ? 'Consulta la información de la donación seleccionada' : 'Completa la información para el registro'}
                </p>
              </div>

              {formError && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                {/* Cabecera */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Donante</label>
                    <input
                      type="text"
                      className="glass-input text-xs disabled:opacity-50"
                      required
                      placeholder="Nombre del donante"
                      value={form.donante}
                      disabled={isSupervisor}
                      onChange={(e) => setForm({ ...form, donante: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 font-semibold">Institución Destino</label>
                    <select
                      className="w-full rounded-xl bg-slate-950/40 border border-white/10 px-4 py-3 outline-none text-slate-200 text-xs focus:border-sky-500/50 disabled:opacity-50"
                      required
                      value={form.institucion}
                      disabled={isSupervisor}
                      onChange={(e) => setForm({ ...form, institucion: e.target.value })}
                    >
                      {instituciones.map((inst, i) => (
                        <option key={i} value={inst} className="bg-slate-900 text-slate-200">{inst}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Fecha</label>
                    <div className="relative">
                      <input
                        type="date"
                        className="glass-input text-xs pl-10 disabled:opacity-50"
                        required
                        value={form.fecha}
                        disabled={isSupervisor}
                        onChange={(e) => setForm({ ...form, fecha: e.target.value })}
                      />
                      <Calendar size={14} className="absolute left-3.5 top-3.5 text-slate-400" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1 font-semibold">Estado de la Donación</label>
                    <select
                      className="w-full rounded-xl bg-slate-950/40 border border-white/10 px-4 py-3 outline-none text-slate-200 text-xs focus:border-sky-500/50 disabled:opacity-50"
                      required
                      value={form.estado}
                      disabled={isSupervisor}
                      onChange={(e) => setForm({ ...form, estado: e.target.value })}
                    >
                      <option value="En Espera" className="bg-slate-900 text-slate-200">En Espera</option>
                      <option value="Entregada" className="bg-slate-900 text-slate-200">Entregada</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">Observaciones</label>
                  <textarea
                    rows={2}
                    className="glass-input text-xs resize-none disabled:opacity-50"
                    placeholder="Observaciones adicionales..."
                    value={form.observaciones}
                    disabled={isSupervisor}
                    onChange={(e) => setForm({ ...form, observaciones: e.target.value })}
                  />
                </div>

                {/* Sub-form de Productos */}
                <div className="border-t border-white/5 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-sky-400 pl-1">Productos Donados</h4>
                    {!isSupervisor && (
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

                  <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                    {form.productos.map((prod, idx) => (
                      <div key={idx} className="flex flex-col sm:flex-row items-center gap-3 bg-slate-950/20 p-3 rounded-xl border border-white/5">
                        
                        <div className="w-full sm:flex-1">
                          <input
                            type="text"
                            placeholder="Nombre del producto"
                            className="glass-input text-xs py-2 disabled:opacity-50"
                            required
                            value={prod.nombre}
                            disabled={isSupervisor}
                            onChange={(e) => handleProductChange(idx, 'nombre', e.target.value)}
                          />
                        </div>

                        <div className="w-full sm:w-44">
                          <select
                            className="w-full rounded-xl bg-slate-950/40 border border-white/10 px-3 py-2 outline-none text-slate-200 text-xs focus:border-sky-500/50 disabled:opacity-50"
                            required
                            value={prod.categoria}
                            disabled={isSupervisor}
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
                            disabled={isSupervisor}
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
                            disabled={isSupervisor}
                            onChange={(e) => handleProductChange(idx, 'unidad', e.target.value)}
                          />
                        </div>

                        {!isSupervisor && form.productos.length > 1 && (
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

                {!isSupervisor && (
                  <button 
                    type="submit" 
                    className="btn-gradient mt-2 text-xs font-semibold py-2.5"
                    disabled={submitting}
                  >
                    {submitting ? 'Guardando...' : (isEditMode ? 'ACTUALIZAR DONACIÓN' : 'REGISTRAR DONACIÓN')}
                  </button>
                )}
              </form>
            </div>
          </div>
        )}

      </main>
      
      <footer className="w-full text-center py-6 text-slate-500 border-t border-white/5 mt-auto text-xs">
        <p>&copy; 2026 DonApp. Todos los derechos reservados. Proyecto Universitario.</p>
      </footer>
    </div>
  );
}
