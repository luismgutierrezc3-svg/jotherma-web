// Este archivo contiene rutas simplificadas para completar el backend
const express = require('express');
const { query } = require('../../config/database');
const { verificarToken, verificarPermiso } = require('../middleware/auth');

// ══════════════════════════════════════════════════════════
// PUBLICACIONES
// ══════════════════════════════════════════════════════════
const publicacionesRouter = express.Router();
publicacionesRouter.use(verificarToken);

publicacionesRouter.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM publicaciones ORDER BY creado_en DESC');
    res.json({ success: true, publicaciones: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo publicaciones' });
  }
});

publicacionesRouter.post('/', verificarPermiso('blog'), async (req, res) => {
  try {
    const { titulo, contenido, categoria, estado } = req.body;
    const result = await query(
      'INSERT INTO publicaciones (titulo, contenido, categoria, estado, autor_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [titulo, contenido, categoria, estado, req.usuario.id]
    );
    res.status(201).json({ success: true, publicacion: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error creando publicación' });
  }
});

// ══════════════════════════════════════════════════════════
// MENSAJES
// ══════════════════════════════════════════════════════════
const mensajesRouter = express.Router();
mensajesRouter.use(verificarToken);

mensajesRouter.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM mensajes_contacto ORDER BY creado_en DESC');
    res.json({ success: true, mensajes: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo mensajes' });
  }
});

mensajesRouter.patch('/:id/estado', async (req, res) => {
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

// ══════════════════════════════════════════════════════════
// DONACIONES
// ══════════════════════════════════════════════════════════
const donacionesRouter = express.Router();
donacionesRouter.use(verificarToken);

donacionesRouter.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM donaciones ORDER BY creado_en DESC');
    res.json({ success: true, donaciones: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo donaciones' });
  }
});

donacionesRouter.patch('/:id/estado', verificarPermiso('donaciones'), async (req, res) => {
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

// ══════════════════════════════════════════════════════════
// VOLUNTARIOS
// ══════════════════════════════════════════════════════════
const voluntariosRouter = express.Router();
voluntariosRouter.use(verificarToken);

voluntariosRouter.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM voluntarios ORDER BY creado_en DESC');
    res.json({ success: true, voluntarios: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo voluntarios' });
  }
});

voluntariosRouter.patch('/:id/estado', verificarPermiso('voluntarios'), async (req, res) => {
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

// ══════════════════════════════════════════════════════════
// CONFIGURACIÓN
// ══════════════════════════════════════════════════════════
const configuracionRouter = express.Router();
configuracionRouter.use(verificarToken);

configuracionRouter.get('/', async (req, res) => {
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

configuracionRouter.post('/', verificarPermiso('finanzas'), async (req, res) => {
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

module.exports = {
  publicaciones: publicacionesRouter,
  mensajes: mensajesRouter,
  donaciones: donacionesRouter,
  voluntarios: voluntariosRouter,
  configuracion: configuracionRouter
};
