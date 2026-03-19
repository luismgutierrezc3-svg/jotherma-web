/* ══════════════════════════════════════════════════════════
   PARTE 1: BACKEND - API PARA GESTIONAR TEXTOS DEL SITIO
   
   Este archivo va en: server/routes/textos.js
   ══════════════════════════════════════════════════════════ */

const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');
const { verificarToken, verificarRol } = require('../middleware/auth');

// ══════════════════════════════════════════════════════════
// OBTENER TODOS LOS TEXTOS DEL SITIO
// ══════════════════════════════════════════════════════════
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM textos_sitio ORDER BY seccion, clave');
    
    // Organizar por secciones
    const textosPorSeccion = {};
    result.rows.forEach(row => {
      if (!textosPorSeccion[row.seccion]) {
        textosPorSeccion[row.seccion] = {};
      }
      textosPorSeccion[row.seccion][row.clave] = row.valor;
    });

    res.json({
      success: true,
      textos: textosPorSeccion,
      total: result.rows.length
    });

  } catch (error) {
    console.error('Error obteniendo textos:', error);
    res.status(500).json({ error: 'Error obteniendo textos del sitio' });
  }
});

// ══════════════════════════════════════════════════════════
// ACTUALIZAR MÚLTIPLES TEXTOS
// ══════════════════════════════════════════════════════════
router.post('/actualizar', verificarToken, verificarRol('superadmin', 'editor'), async (req, res) => {
  try {
    const { textos } = req.body;

    if (!textos || typeof textos !== 'object') {
      return res.status(400).json({ error: 'Formato de datos inválido' });
    }

    let actualizados = 0;

    for (const [seccion, campos] of Object.entries(textos)) {
      for (const [clave, valor] of Object.entries(campos)) {
        await query(`
          INSERT INTO textos_sitio (seccion, clave, valor)
          VALUES ($1, $2, $3)
          ON CONFLICT (seccion, clave)
          DO UPDATE SET valor = $3, actualizado_en = CURRENT_TIMESTAMP
        `, [seccion, clave, valor]);
        actualizados++;
      }
    }

    res.json({
      success: true,
      message: `${actualizados} texto(s) actualizado(s)`,
      actualizados
    });

  } catch (error) {
    console.error('Error actualizando textos:', error);
    res.status(500).json({ error: 'Error actualizando textos' });
  }
});

// ══════════════════════════════════════════════════════════
// ACTUALIZAR UN TEXTO INDIVIDUAL
// ══════════════════════════════════════════════════════════
router.post('/actualizar-uno', verificarToken, verificarRol('superadmin', 'editor'), async (req, res) => {
  try {
    const { seccion, clave, valor } = req.body;

    if (!seccion || !clave || valor === undefined) {
      return res.status(400).json({ error: 'Faltan datos requeridos' });
    }

    await query(`
      INSERT INTO textos_sitio (seccion, clave, valor)
      VALUES ($1, $2, $3)
      ON CONFLICT (seccion, clave)
      DO UPDATE SET valor = $3, actualizado_en = CURRENT_TIMESTAMP
    `, [seccion, clave, valor]);

    res.json({
      success: true,
      message: 'Texto actualizado correctamente'
    });

  } catch (error) {
    console.error('Error actualizando texto:', error);
    res.status(500).json({ error: 'Error actualizando texto' });
  }
});

module.exports = router;
