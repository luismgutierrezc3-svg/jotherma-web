const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');
const { verificarToken } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM mensajes_contacto ORDER BY creado_en DESC');
    res.json({ success: true, mensajes: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo mensajes' });
  }
});

router.patch('/:id/estado', async (req, res) => {
  try {
    const { estado } = req.body;
    const result = await query(
      'UPDATE mensajes_contacto SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, req.params.id]
    );
    res.json({ success: true, mensaje: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando mensaje' });
  }
});

module.exports = router;
