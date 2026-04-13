const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// POST /api/donaciones — registrar donación (público)
router.post('/', async (req, res) => {
  const { donante, email, monto, metodo, programa } = req.body;

  if (!donante || !monto) {
    return res.status(400).json({ error: 'Nombre del donante y monto son requeridos' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO donaciones (donante, email, monto, metodo, programa)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, creado_en`,
      [donante.trim(), email || '', parseFloat(monto), metodo || 'online', programa || '']
    );

    res.status(201).json({ mensaje: 'Donación registrada', id: result.rows[0].id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error registrando donación' });
  }
});

// GET /api/donaciones — listar (admin)
router.get('/', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM donaciones ORDER BY creado_en DESC');
    res.json({ donaciones: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo donaciones' });
  }
});

// PUT /api/donaciones/:id/estado — cambiar estado
router.put('/:id/estado', verificarToken, async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const estadosValidos = ['pendiente', 'confirmada', 'rechazada'];
  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: 'Estado inválido' });
  }

  try {
    await pool.query('UPDATE donaciones SET estado = $1 WHERE id = $2', [estado, id]);
    res.json({ mensaje: 'Estado actualizado' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando estado' });
  }
});

// DELETE /api/donaciones/:id
router.delete('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM donaciones WHERE id = $1', [id]);
    res.json({ mensaje: 'Donación eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error eliminando donación' });
  }
});

module.exports = router;
