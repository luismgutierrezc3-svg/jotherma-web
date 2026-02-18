const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');
const { verificarToken, verificarPermiso } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM voluntarios ORDER BY creado_en DESC');
    res.json({ success: true, voluntarios: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo voluntarios' });
  }
});

router.patch('/:id/estado', verificarPermiso('voluntarios'), async (req, res) => {
  try {
    const { estado } = req.body;
    const result = await query(
      'UPDATE voluntarios SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, req.params.id]
    );
    res.json({ success: true, voluntario: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando voluntario' });
  }
});

module.exports = router;
