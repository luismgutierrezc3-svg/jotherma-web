const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { pool } = require('../config/database');
const { verificarToken } = require('../middleware/auth');

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Multer en memoria
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// Subir buffer a Cloudinary
function subirACloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image', transformation: [{ quality: 'auto', fetch_format: 'auto' }] },
      (error, result) => { if (error) reject(error); else resolve(result); }
    );
    stream.end(buffer);
  });
}

// GET /api/publicaciones — listar (público: solo publicadas; admin: todas)
router.get('/', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const esAdmin = authHeader && authHeader.startsWith('Bearer ');

    const query = esAdmin
      ? 'SELECT * FROM publicaciones ORDER BY creado_en DESC'
      : "SELECT * FROM publicaciones WHERE estado = 'publicado' ORDER BY fecha_publicacion DESC, creado_en DESC";

    const result = await pool.query(query);
    res.json({ publicaciones: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error obteniendo publicaciones' });
  }
});

// POST /api/publicaciones — crear
router.post('/', verificarToken, upload.single('imagen'), async (req, res) => {
  const { titulo, contenido, categoria, estado } = req.body;

  if (!titulo) return res.status(400).json({ error: 'El título es requerido' });

  try {
    let imagen_url = null;

    if (req.file) {
      const resultado = await subirACloudinary(req.file.buffer, 'jotherma/publicaciones');
      imagen_url = resultado.secure_url;
    }

    const fechaPublicacion = estado === 'publicado' ? new Date() : null;

    const result = await pool.query(
      `INSERT INTO publicaciones (titulo, contenido, categoria, estado, fecha_publicacion, autor_id, imagen_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [titulo.trim(), contenido || '', categoria || '', estado || 'borrador', fechaPublicacion, req.usuario.id, imagen_url]
    );

    res.status(201).json({ publicacion: result.rows[0], mensaje: 'Publicación creada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error creando publicación' });
  }
});

// PUT /api/publicaciones/:id — editar
router.put('/:id', verificarToken, upload.single('imagen'), async (req, res) => {
  const { id } = req.params;
  const { titulo, contenido, categoria, estado } = req.body;

  try {
    const existing = await pool.query('SELECT * FROM publicaciones WHERE id = $1', [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: 'Publicación no encontrada' });

    let imagen_url = existing.rows[0].imagen_url;

    if (req.file) {
      const resultado = await subirACloudinary(req.file.buffer, 'jotherma/publicaciones');
      imagen_url = resultado.secure_url;
    }

    const estabaPublicada = existing.rows[0].estado === 'publicado';
    const ahoraPublicada = estado === 'publicado';
    const fechaPublicacion = ahoraPublicada && !estabaPublicada
      ? new Date()
      : existing.rows[0].fecha_publicacion;

    const result = await pool.query(
      `UPDATE publicaciones SET titulo=$1, contenido=$2, categoria=$3, estado=$4,
       fecha_publicacion=$5, imagen_url=$6, actualizado_en=CURRENT_TIMESTAMP
       WHERE id=$7 RETURNING *`,
      [titulo || existing.rows[0].titulo, contenido ?? existing.rows[0].contenido,
       categoria || existing.rows[0].categoria, estado || existing.rows[0].estado,
       fechaPublicacion, imagen_url, id]
    );

    res.json({ publicacion: result.rows[0], mensaje: 'Publicación actualizada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error actualizando publicación' });
  }
});

// DELETE /api/publicaciones/:id — eliminar
router.delete('/:id', verificarToken, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM publicaciones WHERE id = $1', [id]);
    res.json({ mensaje: 'Publicación eliminada' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error eliminando publicación' });
  }
});

module.exports = router;
