module.exports = (req, res, next) => {
  if (!req.user || !req.user.rol || req.user.rol.toLowerCase() !== 'administrador') {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  next();
};
