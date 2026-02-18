const { Pool } = require('pg');
require('dotenv').config();

// Configuración del pool de conexiones a PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false // Necesario para algunos servicios cloud
  } : false,
  max: 20, // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Manejo de errores del pool
pool.on('error', (err) => {
  console.error('Error inesperado en el pool de base de datos:', err);
  process.exit(-1);
});

// Función helper para ejecutar queries
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query ejecutada', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Error en query:', error);
    throw error;
  }
};

// Función para obtener un cliente del pool (para transacciones)
const getClient = () => pool.connect();

module.exports = {
  query,
  getClient,
  pool
};
