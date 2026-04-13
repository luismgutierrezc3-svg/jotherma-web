const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido o expirado' });
  }
}

function soloAdmin(req, res, next) {
  if (!req.usuario || !['superadmin', 'admin'].includes(req.usuario.rol)) {
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol de administrador' });
  }
  next();
}

function soloSuperAdmin(req, res, next) {
  if (!req.usuario || req.usuario.rol !== 'superadmin') {
    return res.status(403).json({ error: 'Acceso denegado: se requiere rol de superadmin' });
  }
  next();
}

module.exports = { verificarToken, soloAdmin, soloSuperAdmin };
