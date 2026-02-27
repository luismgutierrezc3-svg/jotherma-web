const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ══════════════════════════════════════════════════════════
// MIDDLEWARES DE SEGURIDAD
// ══════════════════════════════════════════════════════════

// Helmet para headers de seguridad
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
scriptSrcAttr: ["'unsafe-inline'"],      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting - protección contra fuerza bruta
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 requests por ventana
  message: 'Demasiadas peticiones desde esta IP, intenta de nuevo más tarde'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // máximo 5 intentos de login
  message: 'Demasiados intentos de inicio de sesión, intenta de nuevo en 15 minutos'
});

app.use('/api/', limiter);
app.use('/api/auth/login', loginLimiter);

// Parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ══════════════════════════════════════════════════════════
// SERVIR ARCHIVOS ESTÁTICOS
// ══════════════════════════════════════════════════════════
app.use(express.static(path.join(__dirname, '../public')));

// ══════════════════════════════════════════════════════════
// RUTAS DE LA API
// ══════════════════════════════════════════════════════════
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const publicacionesRoutes = require('./routes/publicaciones');
const mensajesRoutes = require('./routes/mensajes');
const donacionesRoutes = require('./routes/donaciones');
const voluntariosRoutes = require('./routes/voluntarios');
const configuracionRoutes = require('./routes/configuracion');

app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/publicaciones', publicacionesRoutes);
app.use('/api/mensajes', mensajesRoutes);
app.use('/api/donaciones', donacionesRoutes);
app.use('/api/voluntarios', voluntariosRoutes);
app.use('/api/configuracion', configuracionRoutes);

// ══════════════════════════════════════════════════════════
// RUTA DE SALUD DEL SERVIDOR
// ══════════════════════════════════════════════════════════
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// ══════════════════════════════════════════════════════════
// MANEJO DE ERRORES
// ══════════════════════════════════════════════════════════
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ══════════════════════════════════════════════════════════
// FALLBACK PARA SPA (Single Page Application)
// ══════════════════════════════════════════════════════════
// Todas las rutas que no sean API sirven index.html
app.get('*', (req, res, next) => {
  // Si es una ruta de API, pasa al siguiente middleware (404)
  if (req.path.startsWith('/api/')) {
    return next();
  }
  // Sirve index.html para cualquier otra ruta HTML
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Ruta 404 solo para rutas de API
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// ══════════════════════════════════════════════════════════
// INICIAR SERVIDOR
// ══════════════════════════════════════════════════════════
app.listen(PORT, () => {
  console.log('═══════════════════════════════════════════════════════');
  console.log(`🚀 Servidor JOTHERMA ejecutándose en puerto ${PORT}`);
  console.log(`📍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log('═══════════════════════════════════════════════════════\n');
});

// Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

module.exports = app;
