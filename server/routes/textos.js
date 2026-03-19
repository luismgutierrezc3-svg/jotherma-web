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


/* ══════════════════════════════════════════════════════════
   PARTE 2: INICIALIZAR TABLA EN LA BASE DE DATOS
   
   Agregar esto al archivo: server/init-db.js
   En la sección donde creas las tablas
   ══════════════════════════════════════════════════════════ */

/*
// Tabla para textos del sitio
console.log('📋 Creando tabla: textos_sitio');
await client.query(`
  CREATE TABLE IF NOT EXISTS textos_sitio (
    id SERIAL PRIMARY KEY,
    seccion VARCHAR(100) NOT NULL,
    clave VARCHAR(100) NOT NULL,
    valor TEXT,
    actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(seccion, clave)
  );
  
  CREATE INDEX IF NOT EXISTS idx_textos_seccion ON textos_sitio(seccion);
`);

// Insertar textos por defecto
console.log('📝 Insertando textos por defecto del sitio...');
await client.query(`
  INSERT INTO textos_sitio (seccion, clave, valor) VALUES
    -- HERO / INICIO
    ('hero', 'titulo', 'Fundación JOTHERMA'),
    ('hero', 'subtitulo', 'Jóvenes Trabajando Como Hermanos'),
    ('hero', 'descripcion', 'Trabajamos junto a niños, jóvenes y comunidades vulnerables de toda Colombia, construyendo oportunidades reales de educación, desarrollo y dignidad a lo largo y ancho del país.'),
    
    -- QUIÉNES SOMOS
    ('quienes', 'titulo', 'Quiénes Somos'),
    ('quienes', 'descripcion', 'Somos una organización sin ánimo de lucro dedicada a transformar vidas a través de programas de educación, nutrición, deporte y desarrollo comunitario.'),
    
    -- PROGRAMAS
    ('programas', 'titulo', 'Nuestros Programas'),
    ('programas', 'educacion_nombre', 'Educación'),
    ('programas', 'educacion_desc', 'Apoyo escolar y becas para niños y jóvenes.'),
    ('programas', 'nutricion_nombre', 'Nutrición'),
    ('programas', 'nutricion_desc', 'Alimentación balanceada para comunidades vulnerables.'),
    ('programas', 'deporte_nombre', 'Deporte'),
    ('programas', 'deporte_desc', 'Actividades deportivas para el desarrollo integral.'),
    
    -- CONTACTO
    ('contacto', 'titulo', 'Contáctanos'),
    ('contacto', 'email', 'info@jotherma.org'),
    ('contacto', 'telefono', '+57 300 123 4567'),
    ('contacto', 'direccion', 'Bogotá, Colombia')
  ON CONFLICT (seccion, clave) DO NOTHING
`);
*/


/* ══════════════════════════════════════════════════════════
   PARTE 3: REGISTRAR RUTA EN EL SERVIDOR
   
   Agregar esto en: server/index.js
   En la sección de rutas (línea ~60)
   ══════════════════════════════════════════════════════════ */

/*
const textosRoutes = require('./routes/textos');
app.use('/api/textos', textosRoutes);
*/
