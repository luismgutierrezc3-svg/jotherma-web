const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../config/database');
const { verificarToken, soloSuperAdmin } = require('../middleware/auth');

// GET /api/usuarios — listar todos
router.get('/', verificarToken, soloSuperAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, email, rol, activo, ultimo_acceso, creado_en FROM usuarios ORDER BY creado_en DESC'
    );
    res.json({ usuarios: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo usuarios' });
  }
});

// POST /api/usuarios — crear usuario
router.post('/', verificarToken, soloSuperAdmin, async (req, res) => {
  const { nombre, email, password, rol } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Nombre, email y contraseña son requeridos' });
  }

  const rolesValidos = ['superadmin', 'admin', 'editor', 'viewer'];
  if (rol && !rolesValidos.includes(rol)) {
    return res.status(400).json({ error: 'Rol inválido' });
  }

  try {
    const existe = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email.toLowerCase()]);
    if (existe.rows.length > 0) {
      return res.status(409).json({ error: 'Ya existe un usuario con ese email' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO usuarios (nombre, email, password_hash, rol)
       VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, rol, creado_en`,
      [nombre.trim(), email.toLowerCase().trim(), passwordHash, rol || 'editor']
    );

    res.status(201).json({ usuario: result.rows[0], mensaje: 'Usuario creado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando usuario' });
  }
});

// DELETE /api/usuarios/:id — eliminar usuario
router.delete('/:id', verificarToken, soloSuperAdmin, async (req, res) => {
  const { id } = req.params;

  // No puede eliminarse a sí mismo
  if (parseInt(id) === req.usuario.id) {
    return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
  }

  try {
    await pool.query('UPDATE usuarios SET activo = false WHERE id = $1', [id]);
    res.json({ mensaje: 'Usuario desactivado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error eliminando usuario' });
  }
});

module.exports = router;
