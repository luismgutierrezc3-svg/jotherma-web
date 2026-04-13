const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { pool } = require('../config/database');
const { verificarToken } = require('../middleware/auth');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

function subirACloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => { if (error) reject(error); else resolve(result); }
    );
    stream.end(buffer);
  });
}

// GET /api/galeria — listar fotos (público)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM galeria ORDER BY orden ASC, creado_en DESC');
    res.json({ fotos: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo galería' });
  }
});

// POST /api/galeria — subir foto
router.post('/', verificarToken, upload.single('imagen'), async (req, res) => {
  const { titulo, descripcion } = req.body;

  if (!req.file) return res.status(400).json({ error: 'La imagen es requerida' });

  try {
    const resultado = await subirACloudinary(req.file.buffer, 'jotherma/galeria');

    const result = await pool.query(
      'INSERT INTO galeria (titulo, descripcion, imagen_url) VALUES ($1, $2, $3) RETURNING *',
      [titulo || '', descripcion || '', resultado.secure_url]
    );

    res.status(201).json({ foto: result.rows[0], mensaje: 'Foto agregada a la galería' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error subiendo foto' });
  }
});

// DELETE /api/galeria/:id — eliminar foto
router.delete('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM galeria WHERE id = $1', [id]);
    res.json({ mensaje: 'Foto eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error eliminando foto' });
  }
});

module.exports = router;
