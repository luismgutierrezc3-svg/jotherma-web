# 🌟 Fundación JOTHERMA - Sitio Web con Panel de Administración

Sistema web profesional para la Fundación JOTHERMA con autenticación segura, backend Node.js y base de datos PostgreSQL.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Despliegue](#despliegue)
- [Seguridad](#seguridad)

## ✨ Características

- ✅ **Backend seguro** con Node.js + Express
- ✅ **Base de datos PostgreSQL** para almacenamiento persistente
- ✅ **Autenticación JWT** con contraseñas hasheadas (bcrypt)
- ✅ **Sistema de roles** (Superadmin, Editor, Viewer)
- ✅ **Protección contra ataques** (rate limiting, helmet)
- ✅ **Variables de entorno** para credenciales sensibles
- ✅ **API RESTful** completa
- ✅ **Panel de administración** moderno y responsive

## 🔧 Requisitos

- **Node.js** v16 o superior
- **PostgreSQL** v12 o superior
- **npm** o **yarn**

## 📦 Instalación

### 1. Clonar o subir archivos al servidor

```bash
# Si usas Git
git clone tu-repositorio.git
cd jotherma-web

# O simplemente sube la carpeta al servidor
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar base de datos PostgreSQL

#### Opción A: Instalación local

```bash
# En Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Crear base de datos
sudo -u postgres psql
CREATE DATABASE jotherma_db;
CREATE USER jotherma_user WITH PASSWORD 'tu_password_segura';
GRANT ALL PRIVILEGES ON DATABASE jotherma_db TO jotherma_user;
\q
```

#### Opción B: Usar servicio cloud (recomendado)

Servicios recomendados:
- **Supabase** (https://supabase.com) - GRATIS hasta 500MB
- **Railway** (https://railway.app) - GRATIS con límites
- **Neon** (https://neon.tech) - GRATIS con límites
- **ElephantSQL** (https://www.elephantsql.com) - GRATIS hasta 20MB

Todos proporcionan una URL de conexión como:
```
postgresql://usuario:password@host:5432/database
```

### 4. Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env con tus valores reales
nano .env
```

**Contenido del archivo `.env`:**

```env
# Base de datos
DATABASE_URL=postgresql://usuario:password@localhost:5432/jotherma_db

# Seguridad (genera claves únicas y largas)
JWT_SECRET=tu_clave_secreta_muy_larga_minimo_32_caracteres
SESSION_SECRET=otra_clave_diferente_tambien_muy_larga

# Servidor
PORT=3000
NODE_ENV=production

# Dominios
FRONTEND_URL=https://tudominio.com
BACKEND_URL=https://api.tudominio.com

# Admin inicial
INITIAL_ADMIN_EMAIL=admin@jotherma.org
INITIAL_ADMIN_PASSWORD=CambiaEsto123!
```

### 5. Inicializar base de datos

```bash
npm run init-db
```

Este comando:
- Crea todas las tablas necesarias
- Crea el usuario administrador inicial
- Inserta configuración por defecto

### 6. Iniciar el servidor

```bash
# Producción
npm start

# Desarrollo (con auto-reload)
npm run dev
```

El servidor estará disponible en: `http://localhost:3000`

## 🌐 Despliegue en Internet

### Recomendaciones de Hosting

#### 1. **Railway** (⭐ RECOMENDADO - Más fácil)
- **Precio:** GRATIS hasta $5/mes de uso
- **Incluye:** PostgreSQL automático
- **Complejidad:** ⭐ Muy fácil
- **URL:** https://railway.app

**Pasos:**
1. Crear cuenta en Railway
2. "New Project" → "Deploy from GitHub"
3. Railway detecta Node.js automáticamente
4. Agrega servicio PostgreSQL desde el dashboard
5. Configura variables de entorno en el panel
6. Deploy automático ✅

#### 2. **Render** (⭐ RECOMENDADO - Alternativa gratis)
- **Precio:** GRATIS (con limitaciones)
- **Incluye:** PostgreSQL gratuito
- **Complejidad:** ⭐⭐ Fácil
- **URL:** https://render.com

**Pasos:**
1. Crear cuenta en Render
2. "New Web Service" → conectar GitHub
3. Crear "PostgreSQL" database separada
4. Copiar DATABASE_URL y configurar en variables de entorno
5. Deploy automático ✅

#### 3. **DigitalOcean App Platform**
- **Precio:** Desde $5/mes
- **Incluye:** Base de datos gestionada (adicional $7/mes)
- **Complejidad:** ⭐⭐ Media
- **URL:** https://www.digitalocean.com/products/app-platform

#### 4. **Heroku**
- **Precio:** Desde $7/mes (antes era gratis)
- **Incluye:** PostgreSQL addon disponible
- **Complejidad:** ⭐⭐ Media
- **URL:** https://www.heroku.com

#### 5. **VPS tradicional** (DigitalOcean, Linode, Vultr)
- **Precio:** Desde $5/mes
- **Complejidad:** ⭐⭐⭐ Avanzada
- **Requiere:** Conocimientos de Linux y configuración manual

### Variables de Entorno en Producción

**IMPORTANTE:** En todos los servicios, configura estas variables:

```
DATABASE_URL=<tu_url_de_postgresql>
JWT_SECRET=<clave_aleatoria_muy_larga>
SESSION_SECRET=<otra_clave_aleatoria_diferente>
NODE_ENV=production
PORT=3000
```

### Dominio Personalizado

Una vez desplegado, puedes conectar tu dominio:

1. **Comprar dominio:** Namecheap, GoDaddy, Google Domains
2. **Configurar DNS:** Apuntar A record o CNAME al servidor
3. **SSL/HTTPS:** La mayoría de plataformas lo configuran automáticamente

## 🔒 Seguridad

### ✅ Implementado

- Contraseñas hasheadas con bcrypt (10 rounds)
- Tokens JWT con expiración (8 horas)
- Rate limiting (protección contra fuerza bruta)
- Helmet.js para headers de seguridad
- Cookies httpOnly
- Variables de entorno para credenciales
- Validación de roles y permisos
- SQL injection protection (prepared statements)

### 🚨 Recomendaciones Adicionales

1. **Cambiar credenciales iniciales inmediatamente**
2. **Usar HTTPS en producción** (obligatorio)
3. **Configurar firewall** en el servidor
4. **Hacer backups regulares** de la base de datos
5. **Monitorear logs** de acceso
6. **Actualizar dependencias** regularmente

```bash
# Verificar vulnerabilidades
npm audit

# Actualizar dependencias
npm update
```

## 🔑 Acceso Inicial

**Email:** El que configuraste en INITIAL_ADMIN_EMAIL  
**Contraseña:** La que configuraste en INITIAL_ADMIN_PASSWORD

**⚠️ IMPORTANTE:** Cambia la contraseña inmediatamente después del primer login.

## 📱 URLs

- **Sitio público:** `https://tudominio.com` → `/public/index.html`
- **Panel admin:** `https://tudominio.com/admin.html` → `/public/admin.html`
- **API:** `https://tudominio.com/api/*`

## 🆘 Solución de Problemas

### Error de conexión a base de datos

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar la URL de conexión
echo $DATABASE_URL
```

### Error "Cannot find module"

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Puerto ya en uso

```bash
# Cambiar el puerto en .env
PORT=3001

# O matar el proceso
sudo lsof -i :3000
sudo kill -9 <PID>
```

## 📞 Soporte

Para problemas técnicos o preguntas, contacta al desarrollador o consulta la documentación de Node.js y PostgreSQL.

---

**Desarrollado para Fundación JOTHERMA** 🌟
