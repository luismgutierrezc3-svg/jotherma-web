const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../../config/database');
const { verificarToken } = require('../middleware/auth');

// ══════════════════════════════════════════════════════════
// LOGIN
// ══════════════════════════════════════════════════════════
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        message: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar usuario
    const result = await query(
      'SELECT * FROM usuarios WHERE email = $1 AND activo = true',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos' 
      });
    }

    const usuario = result.rows[0];

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas',
        message: 'Email o contraseña incorrectos' 
      });
    }

    // Actualizar último acceso
    await query(
      'UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = $1',
      [usuario.id]
    );

    // Generar JWT
    const token = jwt.sign(
      { 
        id: usuario.id,
        email: usuario.email,
        rol: usuario.rol,
        nombre: usuario.nombre
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    // Enviar token en cookie y respuesta
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 8 * 60 * 60 * 1000 // 8 horas
    });

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rol: usuario.rol
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      error: 'Error del servidor',
      message: 'Ocurrió un error al procesar tu solicitud' 
    });
  }
});

// ══════════════════════════════════════════════════════════
// LOGOUT
// ══════════════════════════════════════════════════════════
router.post('/logout', verificarToken, (req, res) => {
  res.clearCookie('token');
  res.json({ 
    success: true,
    message: 'Sesión cerrada exitosamente' 
  });
});

// ══════════════════════════════════════════════════════════
// VERIFICAR SESIÓN
// ══════════════════════════════════════════════════════════
router.get('/verify', verificarToken, async (req, res) => {
  try {
    const result = await query(
      'SELECT id, nombre, email, rol FROM usuarios WHERE id = $1 AND activo = true',
      [req.usuario.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        error: 'Usuario no encontrado',
        message: 'La sesión no es válida' 
      });
    }

    res.json({
      success: true,
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error('Error verificando sesión:', error);
    res.status(500).json({ 
      error: 'Error del servidor',
      message: 'No se pudo verificar la sesión' 
    });
  }
});

// ══════════════════════════════════════════════════════════
// CAMBIAR CONTRASEÑA
// ══════════════════════════════════════════════════════════
router.post('/cambiar-password', verificarToken, async (req, res) => {
  try {
    const { passwordActual, passwordNueva } = req.body;

    if (!passwordActual || !passwordNueva) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        message: 'Se requieren ambas contraseñas' 
      });
    }

    if (passwordNueva.length < 8) {
      return res.status(400).json({ 
        error: 'Contraseña débil',
        message: 'La nueva contraseña debe tener al menos 8 caracteres' 
      });
    }

    // Obtener usuario actual
    const result = await query(
      'SELECT password_hash FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );

    const usuario = result.rows[0];

    // Verificar contraseña actual
    const passwordValida = await bcrypt.compare(passwordActual, usuario.password_hash);

    if (!passwordValida) {
      return res.status(401).json({ 
        error: 'Contraseña incorrecta',
        message: 'La contraseña actual no es correcta' 
      });
    }

    // Hashear nueva contraseña
    const nuevoHash = await bcrypt.hash(passwordNueva, 10);

    // Actualizar en base de datos
    await query(
      'UPDATE usuarios SET password_hash = $1, actualizado_en = CURRENT_TIMESTAMP WHERE id = $2',
      [nuevoHash, req.usuario.id]
    );

    res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error cambiando contraseña:', error);
    res.status(500).json({ 
      error: 'Error del servidor',
      message: 'No se pudo cambiar la contraseña' 
    });
  }
});

module.exports = router;
