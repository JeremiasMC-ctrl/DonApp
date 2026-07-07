import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import Donaciones from './pages/Donaciones';
import Productos from './pages/Productos';
import Donantes from './pages/Donantes';
import Beneficiarios from './pages/Beneficiarios';
import Inventario from './pages/Inventario';
import Reportes from './pages/Reportes';
import api from './api';

// Helper to determine the default route for a user based on permissions
export const getDefaultRoute = (user) => {
  if (!user) return '/';
  const permisos = user.permisos || [];
  if (permisos.includes('reportes')) return '/dashboard';
  if (permisos.includes('beneficiarios')) return '/beneficiarios';
  if (permisos.includes('donaciones')) return '/donaciones';
  if (permisos.includes('inventario')) return '/inventario';
  if (permisos.includes('donantes_consultar')) return '/donantes';
  return '/';
};

// Component to protect routes based on permissions
function ProtectedRoute({ user, requiredPermission, children }) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  const userPermissions = user.permisos || [];
  if (!userPermissions.includes(requiredPermission)) {
    return <Navigate to={getDefaultRoute(user)} replace />;
  }
  return children;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Intentar cargar la sesión al montar
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          setUser(JSON.parse(storedUser));
          // Verificar validez del token en el backend
          const response = await api.get('/auth/me');
          setUser(response.data);
          localStorage.setItem('user', JSON.stringify(response.data));
        } catch (err) {
          console.error('Handshake de token fallido:', err);
          // Limpiar si el token no es válido
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    window.location.href = '/';
  };

  // Función para reaccionar si el admin cambia su propio rol
  const handleUpdateCurrentUserRole = (newRolName, newRolId) => {
    if (user) {
      const updatedUser = { ...user, rol: newRolName, rol_id: newRolId };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-slate-400 text-sm">
        Verificando sesión...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta Pública: Landing Page */}
        <Route path="/" element={<Home user={user} onLogout={handleLogout} />} />

        {/* Ruta de Login */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to={getDefaultRoute(user)} replace /> : <Login onLoginSuccess={handleLoginSuccess} />
          } 
        />

        {/* Layout para Rutas Protegidas */}
        <Route
          element={
            user ? (
              <div className="flex min-h-screen bg-[#0f172a] overflow-hidden">
                <Sidebar user={user} onLogout={handleLogout} />
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <Outlet />
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        >
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute user={user} requiredPermission="reportes">
                <Dashboard user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/usuarios" 
            element={
              <ProtectedRoute user={user} requiredPermission="usuarios">
                <Usuarios 
                  user={user} 
                  onUpdateCurrentUserRole={handleUpdateCurrentUserRole} 
                />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donaciones" 
            element={
              <ProtectedRoute user={user} requiredPermission="donaciones">
                <Donaciones user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/productos" 
            element={
              <ProtectedRoute user={user} requiredPermission="donaciones">
                <Productos user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donantes" 
            element={
              <ProtectedRoute user={user} requiredPermission="donantes_consultar">
                <Donantes user={user} />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/beneficiarios" 
            element={
              <ProtectedRoute user={user} requiredPermission="beneficiarios">
                <Beneficiarios />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/inventario" 
            element={
              <ProtectedRoute user={user} requiredPermission="inventario">
                <Inventario />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reportes" 
            element={
              <ProtectedRoute user={user} requiredPermission="reportes">
                <Reportes />
              </ProtectedRoute>
            } 
          />
        </Route>

        {/* Redirección por defecto para cualquier otra ruta */}
        <Route path="*" element={<Navigate to={getDefaultRoute(user)} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
