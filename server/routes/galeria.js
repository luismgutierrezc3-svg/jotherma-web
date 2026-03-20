const express = require('express');
const router = express.Router();
const { query } = require('../../config/database');
const { verificarToken, verificarPermiso } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer en memoria
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ── Subir imagen a Cloudinary ──────────────────────────────
router.post('/upload', verificarToken, upload.single('imagen'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No se recibió imagen' });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'jotherma', resource_type: 'image' },
        (error, result) => error ? reject(error) : resolve(result)
      );
      stream.end(req.file.buffer);
    });

    res.json({ success: true, url: result.secure_url, public_id: result.public_id });
  } catch (error) {
    console.error('Error subiendo imagen:', error);
    res.status(500).json({ error: 'Error subiendo imagen' });
  }
});

// ── Obtener galería ────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT * FROM galeria ORDER BY orden ASC, creado_en DESC');
    res.json({ success: true, galeria: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Error obteniendo galería' });
  }
});

// ── Crear ítem de galería ──────────────────────────────────
router.post('/', verificarToken, upload.single('imagen'), async (req, res) => {
  try {
    const { titulo, descripcion, orden } = req.body;
    let imagen_url = req.body.imagen_url || null;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'jotherma/galeria', resource_type: 'image' },
          (error, result) => error ? reject(error) : resolve(result)
        );
        stream.end(req.file.buffer);
      });
      imagen_url = result.secure_url;
    }

    const r = await query(
      'INSERT INTO galeria (titulo, descripcion, imagen_url, orden) VALUES ($1, $2, $3, $4) RETURNING *',
      [titulo, descripcion, imagen_url, orden || 0]
    );
    res.status(201).json({ success: true, item: r.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error creando item de galería' });
  }
});

// ── Actualizar ítem ────────────────────────────────────────
router.put('/:id', verificarToken, upload.single('imagen'), async (req, res) => {
  try {
    const { titulo, descripcion, orden } = req.body;
    let imagen_url = req.body.imagen_url || null;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'jotherma/galeria', resource_type: 'image' },
          (error, result) => error ? reject(error) : resolve(result)
        );
        stream.end(req.file.buffer);
      });
      imagen_url = result.secure_url;
    }

    const r = await query(
      `UPDATE galeria SET titulo=$1, descripcion=$2, ${imagen_url ? 'imagen_url=$3,' : ''} orden=${imagen_url ? '$4' : '$3'} WHERE id=${imagen_url ? '$5' : '$4'} RETURNING *`,
      imagen_url
        ? [titulo, descripcion, imagen_url, orden || 0, req.params.id]
        : [titulo, descripcion, orden || 0, req.params.id]
    );
    res.json({ success: true, item: r.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Error actualizando item' });
  }
});

// ── Eliminar ítem ──────────────────────────────────────────
router.delete('/:id', verificarToken, async (req, res) => {
  try {
    await query('DELETE FROM galeria WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Item eliminado' });
  } catch (error) {
    res.status(500).json({ error: 'Error eliminando item' });
  }
});

module.exports = router;
