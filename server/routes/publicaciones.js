const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');
const { verificarToken, verificarPermiso } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── Listar publicaciones (público para el sitio) ───────────
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM publicaciones ORDER BY creado_en DESC');
    res.json({ success: true, publicaciones: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo publicaciones' });
  }
});

// ── Crear publicación ──────────────────────────────────────
router.post('/', verificarToken, verificarPermiso('blog'), upload.single('imagen'), async (req, res) => {
  try {
    const { titulo, contenido, categoria, estado } = req.body;
    let imagen_url = req.body.imagen_url || null;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'jotherma/publicaciones', resource_type: 'image' },
          (error, result) => error ? reject(error) : resolve(result)
        );
        stream.end(req.file.buffer);
      });
      imagen_url = result.secure_url;
    }

    const r = await query(
      'INSERT INTO publicaciones (titulo, contenido, categoria, estado, autor_id, imagen_url, fecha_publicacion) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [titulo, contenido, categoria, estado, req.usuario.id, imagen_url, estado === 'publicado' ? new Date() : null]
    );
    res.status(201).json({ success: true, publicacion: r.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error creando publicación' });
  }
});

// ── Actualizar publicación ─────────────────────────────────
router.put('/:id', verificarToken, verificarPermiso('blog'), upload.single('imagen'), async (req, res) => {
  try {
    const { titulo, contenido, categoria, estado } = req.body;
    let imagen_url = req.body.imagen_url || null;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'jotherma/publicaciones', resource_type: 'image' },
          (error, result) => error ? reject(error) : resolve(result)
        );
        stream.end(req.file.buffer);
      });
      imagen_url = result.secure_url;
    }

    const r = await query(
      `UPDATE publicaciones SET
        titulo = COALESCE($1, titulo),
        contenido = COALESCE($2, contenido),
        categoria = COALESCE($3, categoria),
        estado = COALESCE($4, estado),
        imagen_url = COALESCE($5, imagen_url),
        fecha_publicacion = CASE WHEN $4 = 'publicado' AND fecha_publicacion IS NULL THEN NOW() ELSE fecha_publicacion END,
        actualizado_en = NOW()
      WHERE id = $6 RETURNING *`,
      [titulo, contenido, categoria, estado, imagen_url, req.params.id]
    );
    res.json({ success: true, publicacion: r.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando publicación' });
  }
});

// ── Eliminar publicación ───────────────────────────────────
router.delete('/:id', verificarToken, verificarPermiso('blog'), async (req, res) => {
  try {
    await query('DELETE FROM publicaciones WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Publicación eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando publicación' });
  }
});

module.exports = router;
