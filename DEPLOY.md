# 🚀 GUÍA RÁPIDA DE DESPLIEGUE - JOTHERMA

## ⚡ Opción 1: Railway (RECOMENDADO - 5 minutos)

### Ventajas
- ✅ 100% GRATIS hasta $5/mes de uso
- ✅ PostgreSQL incluido automáticamente
- ✅ Deploy en 5 minutos
- ✅ HTTPS automático
- ✅ Dominio gratuito

### Pasos

1. **Crear cuenta:** https://railway.app
   - Usa tu cuenta de GitHub

2. **Subir tu código a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin tu-repositorio
   git push -u origin main
   ```

3. **Crear proyecto en Railway:**
   - Click "New Project"
   - Selecciona "Deploy from GitHub repo"
   - Elige tu repositorio

4. **Agregar PostgreSQL:**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway conecta automáticamente

5. **Configurar variables de entorno:**
   - Ve a tu servicio → "Variables"
   - Agrega:
     ```
     JWT_SECRET=genera_una_clave_super_secreta_muy_larga_32_caracteres
     SESSION_SECRET=otra_clave_diferente_tambien_muy_larga_32_caracteres
     NODE_ENV=production
     INITIAL_ADMIN_EMAIL=admin@jotherma.org
     INITIAL_ADMIN_PASSWORD=TuPasswordSegura123!
     ```
   - Railway ya tiene DATABASE_URL configurada automáticamente

6. **Deploy:**
   - Railway hace deploy automáticamente
   - Espera 2-3 minutos

7. **Inicializar base de datos:**
   - En Railway, ve a tu servicio → "Deployments"
   - Abre "View Logs"
   - Busca la URL de tu app (algo como `xxxxx.railway.app`)
   - O usa el comando: `railway run npm run init-db`

8. **¡Listo! 🎉**
   - Tu sitio: `https://xxxxx.railway.app`
   - Admin: `https://xxxxx.railway.app/admin.html`

---

## ⚡ Opción 2: Render (Alternativa gratis)

### Ventajas
- ✅ 100% GRATIS (con limitaciones)
- ✅ PostgreSQL gratuito incluido
- ✅ HTTPS automático

### Pasos

1. **Crear cuenta:** https://render.com

2. **Crear Base de Datos:**
   - Dashboard → "New +" → "PostgreSQL"
   - Nombre: `jotherma-db`
   - Región: Oregon (más cercana)
   - Plan: Free
   - Click "Create Database"
   - **COPIAR** la "External Database URL"

3. **Crear Web Service:**
   - Dashboard → "New +" → "Web Service"
   - Conecta GitHub y selecciona tu repo
   - Configuración:
     - Name: `jotherma-web`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Plan: Free

4. **Variables de entorno:**
   - Sección "Environment"
   - Agrega:
     ```
     DATABASE_URL=<pega_la_url_que_copiaste>
     JWT_SECRET=genera_clave_secreta_larga
     SESSION_SECRET=otra_clave_diferente
     NODE_ENV=production
     INITIAL_ADMIN_EMAIL=admin@jotherma.org
     INITIAL_ADMIN_PASSWORD=CambiaEsto123!
     ```

5. **Deploy:**
   - Click "Create Web Service"
   - Espera 5-10 minutos

6. **Inicializar base de datos:**
   - Ve a tu servicio → "Shell"
   - Ejecuta: `npm run init-db`

7. **¡Listo! 🎉**
   - Tu sitio: `https://jotherma-web.onrender.com`
   - Admin: `https://jotherma-web.onrender.com/admin.html`

---

## ⚡ Opción 3: DigitalOcean (VPS - $5/mes)

### Para usuarios con experiencia en Linux

1. **Crear Droplet:**
   - Ubuntu 22.04
   - Plan: $5/mes (Basic)
   - Agregar SSH key

2. **Conectar via SSH:**
   ```bash
   ssh root@tu-ip
   ```

3. **Instalar Node.js y PostgreSQL:**
   ```bash
   # Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # PostgreSQL
   sudo apt install -y postgresql postgresql-contrib

   # PM2 (gestor de procesos)
   sudo npm install -g pm2
   ```

4. **Configurar PostgreSQL:**
   ```bash
   sudo -u postgres psql
   CREATE DATABASE jotherma_db;
   CREATE USER jotherma_user WITH PASSWORD 'password_segura';
   GRANT ALL PRIVILEGES ON DATABASE jotherma_db TO jotherma_user;
   \q
   ```

5. **Subir código:**
   ```bash
   cd /var/www
   git clone tu-repositorio jotherma-web
   cd jotherma-web
   npm install
   ```

6. **Configurar .env:**
   ```bash
   nano .env
   # Pega tu configuración
   ```

7. **Inicializar DB y arrancar:**
   ```bash
   npm run init-db
   pm2 start server/index.js --name jotherma
   pm2 startup
   pm2 save
   ```

8. **Configurar Nginx (opcional):**
   ```bash
   sudo apt install -y nginx
   sudo nano /etc/nginx/sites-available/jotherma
   ```

   ```nginx
   server {
       listen 80;
       server_name tudominio.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   sudo ln -s /etc/nginx/sites-available/jotherma /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

9. **Instalar SSL con Certbot:**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d tudominio.com
   ```

---

## 📊 Comparación de Opciones

| Característica | Railway | Render | DigitalOcean |
|---------------|---------|--------|--------------|
| **Precio** | Gratis ($5/mes) | Gratis | $5/mes |
| **Dificultad** | ⭐ Muy Fácil | ⭐⭐ Fácil | ⭐⭐⭐ Media |
| **Setup** | 5 minutos | 10 minutos | 30-60 minutos |
| **PostgreSQL** | Incluido | Incluido | Manual |
| **HTTPS** | Automático | Automático | Manual |
| **Escalabilidad** | Excelente | Buena | Total control |

---

## 🔐 IMPORTANTE: Después del Deploy

1. **Accede al panel admin**
2. **Inicia sesión con las credenciales iniciales**
3. **CAMBIA LA CONTRASEÑA INMEDIATAMENTE**
4. **Borra las variables INITIAL_ADMIN_* del .env**
5. **Crea usuarios adicionales si es necesario**

---

## 🆘 Problemas Comunes

### "Cannot connect to database"
- Verifica que DATABASE_URL esté correcta
- Asegúrate que la base de datos esté corriendo

### "Module not found"
- Ejecuta `npm install` de nuevo
- Verifica que package.json esté presente

### "Port already in use"
- Cambia PORT en variables de entorno
- O mata el proceso: `lsof -ti:3000 | xargs kill -9`

### El sitio no carga
- Revisa los logs del servicio
- Verifica que NODE_ENV=production
- Confirma que el puerto esté configurado correctamente

---

## 💡 Consejos Finales

1. **Usa Railway o Render** si no tienes experiencia con servidores
2. **Siempre usa HTTPS** en producción
3. **Haz backups** de la base de datos regularmente
4. **Monitorea los logs** para detectar errores
5. **Actualiza dependencias** cada mes: `npm update`

---

¿Necesitas ayuda? Consulta el README.md principal o la documentación de tu proveedor de hosting.
