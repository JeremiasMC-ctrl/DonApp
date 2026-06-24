import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Usuarios from './pages/Usuarios';
import api from './api';

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
        {/* Ruta de Login */}
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/" replace /> : <Login onLoginSuccess={handleLoginSuccess} />
          } 
        />

        {/* Rutas Protegidas bajo Layout */}
        <Route
          path="/*"
          element={
            user ? (
              <div className="flex min-h-screen bg-[#0f172a] overflow-hidden">
                <Sidebar user={user} onLogout={handleLogout} />
                <div className="flex-1 flex flex-col overflow-y-auto">
                  <Routes>
                    <Route path="/" element={<Dashboard user={user} />} />
                    <Route 
                      path="/usuarios" 
                      element={
                        <Usuarios 
                          user={user} 
                          onUpdateCurrentUserRole={handleUpdateCurrentUserRole} 
                        />
                      } 
                    />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </div>
              </div>
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
