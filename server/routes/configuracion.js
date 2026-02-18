const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');
const { verificarToken, verificarPermiso } = require('../middleware/auth');

router.use(verificarToken);

router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM configuracion_sitio');
    const config = {};
    result.rows.forEach(row => {
      config[row.clave] = row.valor;
    });
    res.json({ success: true, configuracion: config });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo configuración' });
  }
});

router.post('/', verificarPermiso('finanzas'), async (req, res) => {
  try {
    const updates = req.body;
    for (const [clave, valor] of Object.entries(updates)) {
      await query(
        'INSERT INTO configuracion_sitio (clave, valor) VALUES ($1, $2) ON CONFLICT (clave) DO UPDATE SET valor = $2, actualizado_en = CURRENT_TIMESTAMP',
        [clave, valor]
      );
    }
    res.json({ success: true, message: 'Configuración actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando configuración' });
  }
});

module.exports = router;
