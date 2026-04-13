const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// GET /api/configuracion — obtener configuración
router.get('/', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT clave, valor FROM configuracion_sitio');

    const configuracion = {};
    for (const row of result.rows) {
      configuracion[row.clave] = row.valor;
    }

    res.json({ configuracion });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo configuración' });
  }
});

// POST /api/configuracion — guardar configuración
router.post('/', verificarToken, async (req, res) => {
  const updates = req.body;

  if (!updates || typeof updates !== 'object') {
    return res.status(400).json({ error: 'Datos inválidos' });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const [clave, valor] of Object.entries(updates)) {
        await client.query(
          `INSERT INTO configuracion_sitio (clave, valor, actualizado_en)
           VALUES ($1, $2, CURRENT_TIMESTAMP)
           ON CONFLICT (clave)
           DO UPDATE SET valor = $2, actualizado_en = CURRENT_TIMESTAMP`,
          [clave, valor || '']
        );
      }

      await client.query('COMMIT');
      res.json({ mensaje: 'Configuración guardada correctamente' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error guardando configuración' });
  }
});

module.exports = router;
