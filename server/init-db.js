const { pool } = require('../config/database');
const bcrypt = require('bcrypt');
require('dotenv').config();

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Iniciando creación de base de datos...\n');
    await client.query('BEGIN');

    console.log('📋 Creando tabla: usuarios');
    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        rol VARCHAR(50) NOT NULL CHECK (rol IN ('superadmin', 'editor', 'viewer')),
        activo BOOLEAN DEFAULT true,
        ultimo_acceso TIMESTAMP,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_usuarios_email ON usuarios(email);
      CREATE INDEX IF NOT EXISTS idx_usuarios_rol ON usuarios(rol);
    `);

    console.log('📋 Creando tabla: sesiones');
    await client.query(`
      CREATE TABLE IF NOT EXISTS sesiones (
        sid VARCHAR PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_sesiones_expire ON sesiones(expire);
    `);

    console.log('📋 Creando tabla: publicaciones');
    await client.query(`
      CREATE TABLE IF NOT EXISTS publicaciones (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(500) NOT NULL,
        contenido TEXT,
        categoria VARCHAR(100),
        estado VARCHAR(50) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado')),
        fecha_publicacion TIMESTAMP,
        autor_id INTEGER REFERENCES usuarios(id),
        imagen_url VARCHAR(500),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_publicaciones_estado ON publicaciones(estado);
      CREATE INDEX IF NOT EXISTS idx_publicaciones_categoria ON publicaciones(categoria);
    `);

    console.log('📋 Creando tabla: mensajes_contacto');
    await client.query(`
      CREATE TABLE IF NOT EXISTS mensajes_contacto (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        asunto VARCHAR(500),
        mensaje TEXT NOT NULL,
        estado VARCHAR(50) DEFAULT 'nuevo' CHECK (estado IN ('nuevo', 'leido', 'respondido')),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_mensajes_estado ON mensajes_contacto(estado);
    `);

    console.log('📋 Creando tabla: donaciones');
    await client.query(`
      CREATE TABLE IF NOT EXISTS donaciones (
        id SERIAL PRIMARY KEY,
        donante VARCHAR(255) NOT NULL,
        email VARCHAR(255),
        monto DECIMAL(12, 2) NOT NULL,
        metodo VARCHAR(100),
        programa VARCHAR(255),
        estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmada', 'rechazada')),
        transaccion_id VARCHAR(255),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_donaciones_estado ON donaciones(estado);
      CREATE INDEX IF NOT EXISTS idx_donaciones_fecha ON donaciones(creado_en);
    `);

    console.log('📋 Creando tabla: voluntarios');
    await client.query(`
      CREATE TABLE IF NOT EXISTS voluntarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        telefono VARCHAR(50),
        ciudad VARCHAR(255),
        area_interes VARCHAR(255),
        programa VARCHAR(255),
        disponibilidad VARCHAR(500),
        mensaje TEXT,
        estado VARCHAR(50) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_voluntarios_estado ON voluntarios(estado);
    `);

    console.log('📋 Creando tabla: configuracion_sitio');
    await client.query(`
      CREATE TABLE IF NOT EXISTS configuracion_sitio (
        clave VARCHAR(255) PRIMARY KEY,
        valor TEXT,
        tipo VARCHAR(50) DEFAULT 'texto',
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

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

    console.log('📋 Creando tabla: galeria');
    await client.query(`
      CREATE TABLE IF NOT EXISTS galeria (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(255),
        descripcion TEXT,
        imagen_url VARCHAR(500),
        orden INTEGER DEFAULT 0,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('\n👤 Creando usuario administrador inicial...');
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@jotherma.org';
    const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin123456!';
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await client.query(`
      INSERT INTO usuarios (nombre, email, password_hash, rol, activo)
      VALUES ($1, $2, $3, $4, true)
      ON CONFLICT (email) DO NOTHING
    `, ['Administrador Principal', adminEmail, passwordHash, 'superadmin']);

    console.log(`   ✓ Admin creado: ${adminEmail}`);

    console.log('⚙️  Insertando configuración inicial...');
    await client.query(`
      INSERT INTO configuracion_sitio (clave, valor, tipo) VALUES
        ('banco_nombre', 'Bancolombia', 'texto'),
        ('banco_tipo_cuenta', 'Ahorros', 'texto'),
        ('banco_numero_cuenta', '000-000000-00', 'texto'),
        ('banco_nit', '000.000.000-0', 'texto'),
        ('banco_razon_social', 'Fundación Jóvenes Trabajando Como Hermanos', 'texto'),
        ('pasarela_pago', 'mercadopago', 'texto')
      ON CONFLICT (clave) DO NOTHING
    `);

    console.log('📝 Insertando textos por defecto...');
    await client.query(`
      INSERT INTO textos_sitio (seccion, clave, valor) VALUES
        ('hero', 'titulo', 'Transformando vidas en'),
        ('hero', 'titulo_destacado', 'Colombia'),
        ('hero', 'descripcion', 'Trabajamos junto a niños, jóvenes y comunidades vulnerables de toda Colombia, construyendo oportunidades reales de educación, desarrollo y dignidad.'),
        ('hero', 'stat1_num', '+500'),
        ('hero', 'stat1_label', 'Beneficiarios'),
        ('hero', 'stat2_num', '6'),
        ('hero', 'stat2_label', 'Programas activos'),
        ('hero', 'stat3_num', '10+'),
        ('hero', 'stat3_label', 'Comunidades en Colombia'),
        ('hero', 'stat4_num', '100%'),
        ('hero', 'stat4_label', 'Impacto local'),
        ('quienes', 'titulo', 'Una fundación que trabaja unida, como hermanos'),
        ('quienes', 'descripcion1', 'La Fundación Jóvenes Trabajando Como Hermanos — JOTHERMA — nació del convencimiento de que el trabajo solidario y colectivo es la herramienta más poderosa para transformar realidades.'),
        ('quienes', 'descripcion2', 'Creemos en el potencial de cada persona y en la fuerza de la comunidad como motor de cambio sostenible.'),
        ('quienes', 'mision', 'Promover el desarrollo humano integral de comunidades vulnerables de Colombia, a través de programas educativos, sociales y culturales que generen bienestar y equidad.'),
        ('quienes', 'vision', 'Ser una fundación referente en Colombia por su impacto social sostenible, reconocida por transformar vidas con transparencia, amor y compromiso.'),
        ('contacto', 'titulo', 'Contáctanos'),
        ('contacto', 'email', 'info@jotherma.org'),
        ('contacto', 'telefono', '+57 300 123 4567'),
        ('contacto', 'direccion', 'Bogotá, Colombia')
      ON CONFLICT (seccion, clave) DO NOTHING
    `);

    await client.query('COMMIT');
    console.log('\n✅ Base de datos inicializada exitosamente!');
    console.log('═══════════════════════════════════════════════════════\n');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  initDatabase()
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}

module.exports = initDatabase;
