const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// POST /api/voluntarios — registrar voluntario (público)
router.post('/', async (req, res) => {
  const { nombre, email, telefono, ciudad, area_interes, mensaje } = req.body;

  if (!nombre || !email || !telefono) {
    return res.status(400).json({ error: 'Nombre, email y teléfono son requeridos' });
  }

  try {
    // La tabla tiene columnas: nombre, email, telefono, ciudad, area_interes, programa, disponibilidad, mensaje, estado
    const result = await pool.query(
      `INSERT INTO voluntarios (nombre, email, telefono, ciudad, area_interes, programa, mensaje)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, creado_en`,
      [nombre.trim(), email.toLowerCase().trim(), telefono.trim(),
       ciudad || '', area_interes || '', area_interes || '', mensaje || '']
    );

    res.status(201).json({ mensaje: 'Solicitud de voluntariado enviada correctamente', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error guardando solicitud de voluntariado' });
  }
});

// GET /api/voluntarios — listar (admin)
router.get('/', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM voluntarios ORDER BY creado_en DESC');
    res.json({ voluntarios: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo voluntarios' });
  }
});

// PUT /api/voluntarios/:id/estado — cambiar estado
router.put('/:id/estado', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosValidos = ['pendiente', 'aprobado', 'rechazado'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    await pool.query('UPDATE voluntarios SET estado = $1 WHERE id = $2', [estado, id]);
    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando estado' });
  }
});

// DELETE /api/voluntarios/:id
router.delete('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM voluntarios WHERE id = $1', [id]);
    res.json({ mensaje: 'Voluntario eliminado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error eliminando voluntario' });
  }
});

module.exports = router;
