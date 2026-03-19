const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando creación de base de datos...\n');
    
    // Iniciar transacción
    await client.query('BEGIN');

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

