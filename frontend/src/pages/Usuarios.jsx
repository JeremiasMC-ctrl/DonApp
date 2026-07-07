import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle, 
  X 
} from 'lucide-react';
import api from '../api';
import Header from '../components/Header';

export default function Usuarios({ user, onUpdateCurrentUserRole }) {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Mensajes de Alerta
  const [successMsg, setSuccessMsg] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Control de Modales
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Formulario de Registro
  const [regForm, setRegForm] = useState({
    nombres: '',
    apellidos: '',
    usuario: '',
    email: '',
    password: '',
    rol_id: ''
  });
  const [regError, setRegError] = useState(null);
  const [regSubmitting, setRegSubmitting] = useState(false);

  // Formulario de Rol
  const [roleForm, setRoleForm] = useState({
    usuario_id: '',
    nombre_completo: '',
    usuario: '',
    email: '',
    rol_id: ''
  });
  const [roleError, setRoleError] = useState(null);
  const [roleSubmitting, setRoleSubmitting] = useState(false);

  // Estados para Roles y Permisos Dinámicos
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null);
  const [rolePermissions, setRolePermissions] = useState([]);
  const [permissionsError, setPermissionsError] = useState(null);
  const [permissionsSubmitting, setPermissionsSubmitting] = useState(false);

  const availablePermissions = [
    { id: 'usuarios', label: 'Gestionar Usuarios y Roles' },
    { id: 'donantes_consultar', label: 'Consultar Donantes' },
    { id: 'donantes_gestionar', label: 'Registrar/Editar Donantes' },
    { id: 'beneficiarios', label: 'Gestionar Fundaciones' },
    { id: 'donaciones', label: 'Registrar/Clasificar Donaciones' },
    { id: 'inventario', label: 'Gestionar Inventario y Alertas' },
    { id: 'reportes', label: 'Reportes y Dashboard' }
  ];

  const openPermissionsModal = (role) => {
    setSelectedRoleForPermissions(role);
    let perms = [];
    if (role.permisos) {
      try {
        perms = typeof role.permisos === 'string' ? JSON.parse(role.permisos) : role.permisos;
      } catch (e) {
        console.error('Error al parsear permisos:', e);
      }
    }
    setRolePermissions(perms);
    setPermissionsError(null);
    setShowPermissionsModal(true);
  };

  const togglePermission = (permId) => {
    if (rolePermissions.includes(permId)) {
      setRolePermissions(rolePermissions.filter(p => p !== permId));
    } else {
      setRolePermissions([...rolePermissions, permId]);
    }
  };

  const handlePermissionsSubmit = async (e) => {
    e.preventDefault();
    setPermissionsError(null);
    setPermissionsSubmitting(true);

    try {
      await api.put(`/users/roles/${selectedRoleForPermissions.id}/permissions`, {
        permisos: rolePermissions
      });
      setSuccessMsg('Permisos del rol actualizados correctamente.');
      setShowPermissionsModal(false);
      fetchUsersAndRoles();
    } catch (err) {
      console.error(err);
      setPermissionsError(err.response?.data?.error || 'Error al guardar los permisos del rol.');
    } finally {
      setPermissionsSubmitting(false);
    }
  };

  const navigate = useNavigate();

  // Redireccionar si no es Administrador
  useEffect(() => {
    if (user && user.rol.toLowerCase() !== 'administrador') {
      navigate('/');
    }
  }, [user, navigate]);

  // Cargar datos al montar
  useEffect(() => {
    fetchUsersAndRoles();
  }, []);

  const fetchUsersAndRoles = async () => {
    setLoading(true);
    try {
      const [resUsers, resRoles] = await Promise.all([
        api.get('/users'),
        api.get('/users/roles')
      ]);
      setUsers(resUsers.data || []);
      setRoles(resRoles.data || []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Error al conectar con el servidor para cargar usuarios.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar Registro de Nuevo Colaborador
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError(null);
    setRegSubmitting(true);

    const { nombres, apellidos, usuario, email, password, rol_id } = regForm;

    // Validación HU003: Campos vacíos
    if (!nombres.trim() || !apellidos.trim() || !usuario.trim() || !email.trim() || !password || !rol_id) {
      setRegError('Todos los campos son obligatorios.');
      setRegSubmitting(false);
      return;
    }

    // Validación HU003: Formato Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setRegError('El correo electrónico no tiene un formato válido.');
      setRegSubmitting(false);
      return;
    }

    try {
      const response = await api.post('/users/register', regForm);
      setSuccessMsg(response.data.mensaje || 'Usuario registrado correctamente.');
      
      // Limpiar formulario y cerrar modal
      setRegForm({
        nombres: '',
        apellidos: '',
        usuario: '',
        email: '',
        password: '',
        rol_id: ''
      });
      setShowRegisterModal(false);
      
      // Recargar listado
      fetchUsersAndRoles();
    } catch (err) {
      console.error(err);
      setRegError(err.response?.data?.error || 'Ocurrió un error al registrar al usuario.');
    } finally {
      setRegSubmitting(false);
    }
  };

  // Manejar Asignación de Rol (HU004)
  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setRoleError(null);
    setRoleSubmitting(true);

    const { usuario_id, rol_id } = roleForm;

    if (!usuario_id || !rol_id) {
      setRoleError('Datos de asignación incompletos.');
      setRoleSubmitting(false);
      return;
    }

    try {
      const response = await api.post('/users/assign-role', { usuario_id, rol_id });
      setSuccessMsg(response.data.mensaje || 'Rol asignado correctamente.');
      setShowRoleModal(false);

      // Si el Administrador se actualizó su propio rol, notificar al App.jsx para refrescar la sesión
      if (parseInt(user.id) === parseInt(usuario_id)) {
        const updatedRoleObj = roles.find(r => parseInt(r.id) === parseInt(rol_id));
        if (updatedRoleObj) {
          onUpdateCurrentUserRole(updatedRoleObj.nombre, updatedRoleObj.id);
        }
      }

      fetchUsersAndRoles();
    } catch (err) {
      console.error(err);
      setRoleError(err.response?.data?.error || 'Ocurrió un error al asignar el rol.');
    } finally {
      setRoleSubmitting(false);
    }
  };

  // Abrir Modal de Edición de Rol con los datos cargados
  const openEditRole = (u) => {
    setRoleForm({
      usuario_id: u.id,
      nombre_completo: `${u.nombres} ${u.apellidos}`,
      usuario: u.usuario,
      email: u.email,
      rol_id: u.rol_id || ''
    });
    setRoleError(null);
    setShowRoleModal(true);
  };

  const getBadgeClass = (rolName) => {
    const name = rolName?.toLowerCase() || '';
    if (name === 'administrador') return 'bg-red-500/10 text-red-400 border border-red-500/20';
    if (name === 'encargado de bodega') return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
    if (name === 'trabajador social') return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
    return 'bg-slate-500/10 text-slate-400 border border-slate-500/20';
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <Header title="Gestión de Usuarios" user={user} />

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

        {/* Listado de Colaboradores */}
        <div className="glass-card">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <Users size={20} className="text-sky-500" />
              <h2 className="text-lg font-bold text-slate-200">Colaboradores del Sistema</h2>
            </div>
            <button 
              type="button" 
              onClick={() => {
                setRegError(null);
                setShowRegisterModal(true);
              }}
              className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white font-medium text-sm rounded-xl flex items-center gap-2 transition-all duration-200 shadow-md shadow-sky-500/10 hover:shadow-sky-600/20"
            >
              <UserPlus size={16} />
              <span>Nuevo Colaborador</span>
            </button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 text-sm">Cargando colaboradores...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                    <th className="py-4.5 px-4">ID</th>
                    <th className="py-4.5 px-4">Colaborador</th>
                    <th className="py-4.5 px-4">Usuario</th>
                    <th className="py-4.5 px-4">Email</th>
                    <th className="py-4.5 px-4">Rol Actual</th>
                    <th className="py-4.5 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-slate-300">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-slate-500">No hay colaboradores registrados.</td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                        <td className="py-4 px-4 font-mono text-slate-400">{u.id}</td>
                        <td className="py-4 px-4 font-semibold text-slate-200">{u.nombres} {u.apellidos}</td>
                        <td className="py-4 px-4 font-mono text-xs text-sky-400">@{u.usuario}</td>
                        <td className="py-4 px-4 text-slate-400">{u.email}</td>
                        <td className="py-4 px-4">
                          <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${getBadgeClass(u.rol?.nombre)}`}>
                            {u.rol?.nombre || 'Sin Rol'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button 
                            onClick={() => openEditRole(u)}
                            className="px-3.5 py-1.5 rounded-lg border border-sky-500/20 text-sky-400 hover:bg-sky-500/10 text-xs font-semibold tracking-wide transition-all duration-150 flex items-center gap-1.5 mx-auto"
                          >
                            <ShieldCheck size={14} />
                            <span>Asignar Rol</span>
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

        {/* Listado de Roles y Permisos (HU004 / Módulo de Roles y Permisos) */}
        <div className="glass-card mt-8">
          <div className="flex items-center gap-2.5 mb-6 border-b border-white/5 pb-4">
            <ShieldCheck size={20} className="text-emerald-500" />
            <h2 className="text-lg font-bold text-slate-200">Roles y Permisos del Sistema</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-4.5 px-4">Rol</th>
                  <th className="py-4.5 px-4">Descripción</th>
                  <th className="py-4.5 px-4">Permisos Asignados</th>
                  <th className="py-4.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {roles.map((rol) => {
                  let perms = [];
                  if (rol.permisos) {
                    try {
                      perms = typeof rol.permisos === 'string' ? JSON.parse(rol.permisos) : rol.permisos;
                    } catch (e) {}
                  }
                  return (
                    <tr key={rol.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                      <td className="py-4 px-4 font-semibold text-slate-200">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getBadgeClass(rol.nombre)}`}>
                          {rol.nombre}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400 max-w-xs truncate" title={rol.descripcion}>
                        {rol.descripcion}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1 max-w-lg">
                          {perms.length === 0 ? (
                            <span className="text-slate-600 text-xs italic">Ningún permiso asignado</span>
                          ) : (
                            perms.map((p, idx) => (
                              <span key={idx} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-semibold border border-white/5">
                                {availablePermissions.find(ap => ap.id === p)?.label || p}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => openPermissionsModal(rol)}
                          className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 font-semibold text-xs rounded-lg transition-colors"
                        >
                          Configurar Permisos
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ==========================================
           MODAL DE REGISTRO (HU003)
           ========================================== */}
        {showRegisterModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl overflow-hidden p-8 shadow-2xl relative">
              <button 
                onClick={() => setShowRegisterModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-100 uppercase tracking-widest font-display">REGISTRO</h3>
                <p className="text-slate-400 text-xs mt-1">Registrar nuevo usuario en el sistema</p>
              </div>

              {regError && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{regError}</span>
                </div>
              )}

              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombres"
                    className="glass-input text-xs"
                    required
                    value={regForm.nombres}
                    onChange={(e) => setRegForm({...regForm, nombres: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Apellidos"
                    className="glass-input text-xs"
                    required
                    value={regForm.apellidos}
                    onChange={(e) => setRegForm({...regForm, apellidos: e.target.value})}
                  />
                </div>

                <input
                  type="text"
                  placeholder="Nombre de Usuario (Único)"
                  className="glass-input text-xs"
                  required
                  value={regForm.usuario}
                  onChange={(e) => setRegForm({...regForm, usuario: e.target.value})}
                />

                <input
                  type="email"
                  placeholder="Correo Electrónico"
                  className="glass-input text-xs"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm({...regForm, email: e.target.value})}
                />

                <input
                  type="password"
                  placeholder="Contraseña"
                  className="glass-input text-xs"
                  required
                  value={regForm.password}
                  onChange={(e) => setRegForm({...regForm, password: e.target.value})}
                />

                <div className="flex flex-col gap-1">
                  <label htmlFor="reg_rol" className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pl-1">
                    Rol de Acceso (HU004)
                  </label>
                  <select
                    id="reg_rol"
                    className="w-full rounded-xl bg-slate-950/40 border border-white/10 px-4 py-3 outline-none text-slate-200 text-xs focus:border-sky-500/50"
                    required
                    value={regForm.rol_id}
                    onChange={(e) => setRegForm({...regForm, rol_id: e.target.value})}
                  >
                    <option value="" className="bg-slate-900 text-slate-400">Selecciona un rol...</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="btn-gradient mt-4 text-xs font-semibold py-2.5"
                  disabled={regSubmitting}
                >
                  {regSubmitting ? 'Registrando...' : 'REGISTRAR'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==========================================
           MODAL DE EDICIÓN DE ROL (HU004)
           ========================================== */}
        {showRoleModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl overflow-hidden p-8 shadow-2xl relative">
              <button 
                onClick={() => setShowRoleModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-100 uppercase tracking-widest font-display">EDITAR ROL</h3>
                <p className="text-slate-400 text-xs mt-1">Modifica los accesos y permisos del colaborador</p>
              </div>

              {roleError && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{roleError}</span>
                </div>
              )}

              <form onSubmit={handleRoleSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider pl-1 font-semibold">Nombre Completo</span>
                  <input
                    type="text"
                    className="glass-input text-xs bg-slate-950/20 border-white/5 text-slate-400 cursor-not-allowed"
                    disabled
                    value={roleForm.nombre_completo}
                  />
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider pl-1 font-semibold">Nombre de Usuario</span>
                  <input
                    type="text"
                    className="glass-input text-xs bg-slate-950/20 border-white/5 text-slate-400 cursor-not-allowed"
                    disabled
                    value={`@${roleForm.usuario}`}
                  />
                </div>

                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider pl-1 font-semibold">Correo Electrónico</span>
                  <input
                    type="text"
                    className="glass-input text-xs bg-slate-950/20 border-white/5 text-slate-400 cursor-not-allowed"
                    disabled
                    value={roleForm.email}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="edit_rol" className="text-[10px] font-semibold text-sky-400 uppercase tracking-wider pl-1">
                    Nuevo Rol Asignado
                  </label>
                  <select
                    id="edit_rol"
                    className="w-full rounded-xl bg-slate-950/40 border border-white/10 px-4 py-3 outline-none text-slate-200 text-xs focus:border-sky-500/50"
                    required
                    value={roleForm.rol_id}
                    onChange={(e) => setRoleForm({...roleForm, rol_id: e.target.value})}
                  >
                    {roles.map(r => (
                      <option key={r.id} value={r.id} className="bg-slate-900 text-slate-200">
                        {r.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  type="submit" 
                  className="btn-gradient mt-4 text-xs font-semibold py-2.5"
                  disabled={roleSubmitting}
                >
                  {roleSubmitting ? 'Actualizando...' : 'ACTUALIZAR'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ==========================================
           MODAL DE CONFIGURACIÓN DE PERMISOS (HU004)
           ========================================== */}
        {showPermissionsModal && selectedRoleForPermissions && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
            <div className="w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl overflow-hidden p-8 shadow-2xl relative">
              <button 
                type="button"
                onClick={() => setShowPermissionsModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-200"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-100 uppercase tracking-widest font-display">CONFIGURAR PERMISOS</h3>
                <p className="text-slate-400 text-xs mt-1">Rol: <span className="text-sky-400 font-bold">{selectedRoleForPermissions.nombre}</span></p>
              </div>

              {permissionsError && (
                <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{permissionsError}</span>
                </div>
              )}

              <form onSubmit={handlePermissionsSubmit} className="flex flex-col gap-4">
                <div className="space-y-3 bg-slate-950/40 p-4 rounded-2xl border border-white/5 max-h-72 overflow-y-auto">
                  {availablePermissions.map((perm) => {
                    const isChecked = rolePermissions.includes(perm.id);
                    return (
                      <label key={perm.id} className="flex items-start gap-3 cursor-pointer select-none py-1 hover:bg-white/[0.02] px-2 rounded-lg">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => togglePermission(perm.id)}
                          className="mt-1 accent-sky-500"
                        />
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{perm.label}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">Permiso de tipo {perm.id}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                <button 
                  type="submit" 
                  className="btn-gradient mt-4 text-xs font-semibold py-2.5"
                  disabled={permissionsSubmitting}
                >
                  {permissionsSubmitting ? 'Guardando...' : 'GUARDAR PERMISOS'}
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
      
      {/* Footer */}
      <footer className="w-full text-center py-6 text-slate-500 border-t border-white/5 mt-auto text-xs">
        <p>&copy; 2026 DonApp. Todos los derechos reservados. Proyecto Universitario.</p>
      </footer>
    </div>
  );
}
