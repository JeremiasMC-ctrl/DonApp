import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, MapPin, Phone, Mail } from 'lucide-react';
import api from '../api';

export default function Beneficiarios() {
  const [fundaciones, setFundaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  
  // Foundation fields
  const [nombre, setNombre] = useState('');
  const [identificacion, setIdentificacion] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFundaciones();
  }, []);

  // Bloquear el scroll del fondo cuando el modal esté abierto
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  const fetchFundaciones = async () => {
    setLoading(true);
    try {
      const response = await api.get('/beneficiarios');
      setFundaciones(response.data);
    } catch (err) {
      console.error(err);
      setError('Error al obtener fundaciones.');
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
    setDireccion('');
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (f) => {
    setEditId(f.id);
    setNombre(f.nombre);
    setIdentificacion(f.identificacion || '');
    setEmail(f.email || '');
    setTelefono(f.telefono || '');
    setDireccion(f.direccion || '');
    setError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      setError('El nombre de la fundación es obligatorio.');
      return;
    }

    const payload = {
      nombre,
      identificacion,
      email,
      telefono,
      direccion
    };

    try {
      if (editId) {
        await api.put(`/beneficiarios/${editId}`, payload);
      } else {
        await api.post('/beneficiarios', payload);
      }
      setIsModalOpen(false);
      fetchFundaciones();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Error al guardar los datos de la fundación. La identificación debe ser única.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta fundación?')) {
      return;
    }

    try {
      await api.delete(`/beneficiarios/${id}`);
      fetchFundaciones();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar la fundación.');
    }
  };

  const filteredFundaciones = fundaciones.filter(f => 
    f.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (f.identificacion && f.identificacion.includes(searchTerm)) ||
    (f.direccion && f.direccion.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 font-display">Fundaciones</h2>
          <p className="text-slate-400 text-xs mt-1">Registro y gestión de las fundaciones beneficiarias de la red.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-sky-500/20 active:scale-[0.98]"
        >
          <Plus size={16} />
          Registrar Fundación
        </button>
      </div>

      {/* Contenedor de Búsqueda */}
      <div className="relative">
        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
          <Search size={18} />
        </span>
        <input
          type="text"
          placeholder="Buscar por nombre, identificación/RUC o dirección..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900/60 border border-white/5 text-slate-200 placeholder-slate-500 text-sm focus:border-sky-500/30 focus:bg-slate-900/80 outline-none transition-all"
        />
      </div>

      {/* Listado */}
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
                  <th className="py-4 px-6">Fundación / Razón Social</th>
                  <th className="py-4 px-6">Identificación / RUC</th>
                  <th className="py-4 px-6">Email de Contacto</th>
                  <th className="py-4 px-6">Teléfono</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
                {filteredFundaciones.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-500">
                      No se encontraron fundaciones en el sistema.
                    </td>
                  </tr>
                ) : (
                  filteredFundaciones.map((f) => (
                    <tr key={f.id} className="hover:bg-white/5 transition-all">
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-100">{f.nombre}</div>
                        {f.direccion && (
                          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-1">
                            <MapPin size={11} className="text-slate-500" />
                            {f.direccion}
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs text-slate-400">{f.identificacion || 'N/A'}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-350">
                        {f.email ? (
                          <span className="flex items-center gap-1.5">
                            <Mail size={12} className="text-slate-400" />
                            {f.email}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-slate-350">
                        {f.telefono ? (
                          <span className="flex items-center gap-1.5">
                            <Phone size={12} className="text-slate-400" />
                            {f.telefono}
                          </span>
                        ) : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(f)}
                            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/5 transition-all"
                            title="Editar fundación"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(f.id)}
                            className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/10 transition-all"
                            title="Eliminar fundación"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
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
          <div className="w-full max-w-lg glass-panel rounded-3xl overflow-hidden shadow-2xl z-10 animate-fade-in flex flex-col p-8 max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-slate-100 font-display">
                {editId ? 'Editar Fundación' : 'Registrar Fundación'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm font-semibold transition-colors"
              >
                Cerrar
              </button>
            </div>

            {error && (
              <div className="mt-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4 overflow-y-auto pr-1">
              <div className="space-y-1">
                <label htmlFor="nombre" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Nombre de la Fundación / Razón Social</label>
                <input
                  type="text"
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Fundación Rayito de Luz"
                  className="glass-input text-sm"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="identificacion" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Identificación / RUC</label>
                  <input
                    type="text"
                    id="identificacion"
                    value={identificacion}
                    onChange={(e) => setIdentificacion(e.target.value)}
                    placeholder="Ej. RUC-2049583719"
                    className="glass-input text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="telefono" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Teléfono de Contacto</label>
                  <input
                    type="text"
                    id="telefono"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej. +51 987654321"
                    className="glass-input text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Email de Contacto</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ej. contacto@fundacion.org"
                  className="glass-input text-sm"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="direccion" className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Dirección / Sede Principal</label>
                <input
                  type="text"
                  id="direccion"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Ej. Av. Primavera 123, Oficina 401"
                  className="glass-input text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-300 border border-white/5 font-semibold text-sm transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-sky-500/20 active:scale-[0.98]"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
