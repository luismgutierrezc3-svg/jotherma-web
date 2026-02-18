const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');
const { verificarToken, verificarPermiso } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM publicaciones ORDER BY creado_en DESC');
    res.json({ success: true, publicaciones: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo publicaciones' });
  }
});

router.post('/', verificarPermiso('blog'), async (req, res) => {
  try {
    const { titulo, contenido, categoria, estado } = req.body;
    const result = await query(
      'INSERT INTO publicaciones (titulo, contenido, categoria, estado, autor_id, fecha_publicacion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [titulo, contenido, categoria, estado, req.usuario.id, estado === 'publicado' ? new Date() : null]
    );
    res.status(201).json({ success: true, publicacion: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error creando publicación' });
  }
});

module.exports = router;
