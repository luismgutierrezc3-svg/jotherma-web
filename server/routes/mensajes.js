const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// POST /api/mensajes — recibir mensaje del formulario de contacto (público)
router.post('/', async (req, res) => {
  const { nombre, email, asunto, mensaje } = req.body;

  if (!nombre || !email || !mensaje) {
    return res.status(400).json({ error: 'Nombre, email y mensaje son requeridos' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO mensajes_contacto (nombre, email, asunto, mensaje)
       VALUES ($1, $2, $3, $4) RETURNING id, creado_en`,
      [nombre.trim(), email.toLowerCase().trim(), asunto || '', mensaje.trim()]
    );

    res.status(201).json({ mensaje: 'Mensaje enviado correctamente', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error guardando mensaje' });
  }
});

// GET /api/mensajes — listar mensajes (admin)
router.get('/', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM mensajes_contacto ORDER BY creado_en DESC'
    );
    res.json({ mensajes: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo mensajes' });
  }
});

// PUT /api/mensajes/:id/estado — cambiar estado (nuevo/leido/respondido)
router.put('/:id/estado', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosValidos = ['nuevo', 'leido', 'respondido'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    await pool.query('UPDATE mensajes_contacto SET estado = $1 WHERE id = $2', [estado, id]);
    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando estado' });
  }
});

// DELETE /api/mensajes/:id — eliminar mensaje
router.delete('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM mensajes_contacto WHERE id = $1', [id]);
    res.json({ mensaje: 'Mensaje eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error eliminando mensaje' });
  }
});

module.exports = router;
