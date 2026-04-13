const express = require('express');
const router = express.Router();
const { pool } = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// GET /api/textos — obtener todos los textos agrupados por sección (público)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT seccion, clave, valor FROM textos_sitio ORDER BY seccion, clave');

    // Agrupar por sección: { hero: { titulo: '...', ... }, contacto: { ... } }
    const textos = {};
    for (const row of result.rows) {
      if (!textos[row.seccion]) textos[row.seccion] = {};
      textos[row.seccion][row.clave] = row.valor;
    }

    res.json({ textos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo textos' });
  }
});

// POST /api/textos/actualizar — guardar textos (admin)
router.post('/actualizar', verificarToken, async (req, res) => {
  const { textos } = req.body;

  if (!textos || typeof textos !== 'object') {
    return res.status(400).json({ error: 'Formato de textos inválido' });
  }

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      for (const [seccion, claves] of Object.entries(textos)) {
        if (typeof claves !== 'object') continue;
        for (const [clave, valor] of Object.entries(claves)) {
          await client.query(
            `INSERT INTO textos_sitio (seccion, clave, valor, actualizado_en)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
             ON CONFLICT (seccion, clave)
             DO UPDATE SET valor = $3, actualizado_en = CURRENT_TIMESTAMP`,
            [seccion, clave, valor || '']
          );
        }
      }

      await client.query('COMMIT');
      res.json({ mensaje: 'Textos actualizados correctamente' });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando textos' });
  }
});

module.exports = router;
