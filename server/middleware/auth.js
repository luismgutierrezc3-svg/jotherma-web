const jwt = require('jsonwebtoken');

// Middleware para verificar JWT
const verificarToken = (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Acceso no autorizado',
      message: 'No se proporcionó token de autenticación' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ 
      error: 'Token inválido',
      message: 'El token de autenticación es inválido o ha expirado' 
    });
  }
};

// Middleware para verificar rol específico
const verificarRol = (...rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.usuario) {
      return res.status(401).json({ 
        error: 'No autenticado',
        message: 'Debes iniciar sesión para acceder a este recurso' 
      });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        error: 'Acceso denegado',
        message: `Se requiere rol: ${rolesPermitidos.join(' o ')}` 
      });
    }

    next();
  };
};

// Permisos por rol
const PERMISOS = {
  superadmin: ['blog', 'textos', 'galeria', 'mensajes', 'voluntarios', 'donaciones', 'finanzas', 'usuarios'],
  editor: ['blog', 'textos', 'galeria', 'mensajes', 'voluntarios', 'donaciones'],
  viewer: ['blog', 'mensajes', 'voluntarios', 'donaciones']
};

// Verificar permiso específico
const verificarPermiso = (seccion) => {
  return (req, res, next) => {
    const rol = req.usuario?.rol;
    
    if (!rol || !PERMISOS[rol]) {
      return res.status(403).json({ 
        error: 'Rol inválido',
        message: 'Tu rol no tiene permisos definidos' 
      });
    }

    if (!PERMISOS[rol].includes(seccion)) {
      return res.status(403).json({ 
        error: 'Permiso denegado',
        message: `No tienes permiso para acceder a: ${seccion}` 
      });
    }

    next();
  };
};

module.exports = {
  verificarToken,
  verificarRol,
  verificarPermiso,
  PERMISOS
};
