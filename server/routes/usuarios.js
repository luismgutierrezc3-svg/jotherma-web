const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { query } = require('../../config/database');
const { verificarToken, verificarRol } = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// ══════════════════════════════════════════════════════════
// LISTAR USUARIOS (solo superadmin)
// ══════════════════════════════════════════════════════════
router.get('/', verificarRol('superadmin'), async (req, res) => {
  try {
    const result = await query(`
      SELECT id, nombre, email, rol, activo, ultimo_acceso, creado_en
      FROM usuarios
      ORDER BY creado_en DESC
    `);

    res.json({
      success: true,
      usuarios: result.rows
    });
  } catch (error) {
    console.error('Error listando usuarios:', error);
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
});

// ══════════════════════════════════════════════════════════
// CREAR USUARIO (solo superadmin)
// ══════════════════════════════════════════════════════════
router.post('/', verificarRol('superadmin'), async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;

    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ 
        error: 'Datos incompletos',
        message: 'Todos los campos son requeridos' 
      });
    }

    // Verificar que el rol sea válido
    if (!['superadmin', 'editor', 'viewer'].includes(rol)) {
      return res.status(400).json({ 
        error: 'Rol inválido',
        message: 'El rol debe ser: superadmin, editor o viewer' 
      });
    }

    // Verificar si el email ya existe
    const existente = await query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existente.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Email duplicado',
        message: 'Ya existe un usuario con este email' 
      });
    }

    // Hashear contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const result = await query(`
      INSERT INTO usuarios (nombre, email, password_hash, rol)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, email, rol, creado_en
    `, [nombre, email, passwordHash, rol]);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error('Error creando usuario:', error);
    res.status(500).json({ error: 'Error creando usuario' });
  }
});

// ══════════════════════════════════════════════════════════
// ACTUALIZAR USUARIO (solo superadmin)
// ══════════════════════════════════════════════════════════
router.put('/:id', verificarRol('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, email, rol, activo } = req.body;

    const result = await query(`
      UPDATE usuarios 
      SET nombre = COALESCE($1, nombre),
          email = COALESCE($2, email),
          rol = COALESCE($3, rol),
          activo = COALESCE($4, activo),
          actualizado_en = CURRENT_TIMESTAMP
      WHERE id = $5
      RETURNING id, nombre, email, rol, activo
    `, [nombre, email, rol, activo, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      message: 'Usuario actualizado',
      usuario: result.rows[0]
    });

  } catch (error) {
    console.error('Error actualizando usuario:', error);
    res.status(500).json({ error: 'Error actualizando usuario' });
  }
});

// ══════════════════════════════════════════════════════════
// ELIMINAR USUARIO (solo superadmin)
// ══════════════════════════════════════════════════════════
router.delete('/:id', verificarRol('superadmin'), async (req, res) => {
  try {
    const { id } = req.params;

    // No permitir eliminar el propio usuario
    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({ 
        error: 'Operación no permitida',
        message: 'No puedes eliminar tu propio usuario' 
      });
    }

    const result = await query('DELETE FROM usuarios WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      message: 'Usuario eliminado'
    });

  } catch (error) {
    console.error('Error eliminando usuario:', error);
    res.status(500).json({ error: 'Error eliminando usuario' });
  }
});

module.exports = router;
