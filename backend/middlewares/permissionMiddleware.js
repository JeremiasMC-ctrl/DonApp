module.exports = (requiredPermission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autorizado. Por favor inicia sesión.' });
    }
    
    const userPermissions = req.user.permisos || [];
    
    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ error: `Acceso denegado. Se requiere el permiso: ${requiredPermission}` });
    }
    
    next();
  };
};
