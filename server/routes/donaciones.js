const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');
const { verificarToken, verificarPermiso } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM donaciones ORDER BY creado_en DESC');
    res.json({ success: true, donaciones: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo donaciones' });
  }
});

router.patch('/:id/estado', verificarPermiso('donaciones'), async (req, res) => {
  try {
    const { estado } = req.body;
    const result = await query(
      'UPDATE donaciones SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, req.params.id]
    );
    res.json({ success: true, donacion: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando donación' });
  }
});

module.exports = router;
