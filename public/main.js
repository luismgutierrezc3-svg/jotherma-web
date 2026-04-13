/* ============================================================
   JOTHERMA — Fundación Jóvenes Trabajando Como Hermanos
   main.js — Lógica principal del sitio
   ============================================================ */

/* ============================================================
   JOTHERMA — Fundación Jóvenes Trabajando Como Hermanos
   main.js — Lógica principal del sitio
   ============================================================ */

// 🔥 URL del backend en Railway
const API_URL = 'https://jotherma-web-production.up.railway.app/api';

/* ─── Blog: cargar publicaciones desde la API ──────────────── */
const EMOJIS_CAT = {
  'Educación':  '📣',
  'Nutrición':  '🍽️',
  'Deporte':    '🏆',
  'Salud':      '❤️',
  'Cultura':    '🎨',
  'Comunidad':  '🤝',
};
const COLORES_CARD = ['c1','c2','c3','c1','c2','c3'];

async function cargarPublicaciones() {
  const grid = document.getElementById('blog-grid');
  if (!grid) return;

  try {
    const res  = await fetch(`${API_URL}/publicaciones`);
    const data = await res.json();
    const pubs = (data.publicaciones || []).filter(p => p.estado === 'publicado');

    if (!pubs.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#888;">No hay publicaciones disponibles aún.</div>';
      return;
    }

    grid.innerHTML = pubs.map((p, i) => {
      const emoji = EMOJIS_CAT[p.categoria] || '📰';
      const color = COLORES_CARD[i % 3];
      const fecha = p.fecha_publicacion
        ? new Date(p.fecha_publicacion).toLocaleDateString('es-CO', { day:'numeric', month:'long', year:'numeric' })
        : new Date(p.creado_en).toLocaleDateString('es-CO', { day:'numeric', month:'long', year:'numeric' });
      const resumen = p.contenido ? p.contenido.substring(0, 120) + (p.contenido.length > 120 ? '…' : '') : '';
      const imgHtml = p.imagen_url
        ? `<img src="${p.imagen_url}" alt="${p.titulo}" style="width:100%;height:200px;object-fit:cover;border-radius:12px 12px 0 0;">`
        : `<div class="blog-img ${color}">${emoji}</div>`;

      return `
        <div class="blog-card">
          ${imgHtml}
          <div class="blog-body">
            <span class="blog-cat">${p.categoria || 'General'}</span>
            <h3>${p.titulo}</h3>
            <p>${resumen}</p>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span class="blog-meta">${fecha}</span>
              <a href="#" class="btn-ver">Leer más →</a>
            </div>
          </div>
        </div>`;
    }).join('');

  } catch (err) {
    console.error('Error cargando publicaciones:', err);
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#888;">No se pudieron cargar las publicaciones.</div>';
  }
}

document.addEventListener('DOMContentLoaded', cargarPublicaciones);

/* ─── Galería ─────────────────────────────────────────────── */
async function cargarGaleria() {
  const grid = document.getElementById('galeria-grid');
  if (!grid) return;

  try {
    const res  = await fetch(`${API_URL}/galeria`);
    const data = await res.json();
    const fotos = data.fotos || data.imagenes || data || [];

    if (!fotos.length) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#888;">No hay fotos en la galería aún.</div>';
      return;
    }

    grid.innerHTML = fotos.map(foto => {
      const url    = foto.url || foto.imagen_url || foto.secure_url || '';
      const titulo = foto.titulo || foto.descripcion || foto.alt || '';
      return `
        <div class="gal-item">
          <img src="${url}" alt="${titulo}" style="width:100%;height:100%;object-fit:cover;border-radius:12px;">
        </div>`;
    }).join('');

  } catch (err) {
    console.error('Error cargando galería:', err);
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#888;">No se pudo cargar la galería.</div>';
  }
}

document.addEventListener('DOMContentLoaded', cargarGaleria);

/* ─── Formulario de contacto ───────────────────────────────── */
(function initContactForm() {
  const submitBtn = document.getElementById('contact-submit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', async () => {
    const nombre  = document.getElementById('contact-nombre').value;
    const email   = document.getElementById('contact-email').value;
    const mensaje = document.getElementById('contact-mensaje').value;

    try {
      await fetch(`${API_URL}/mensajes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, mensaje })
      });

      alert('Mensaje enviado');
    } catch (err) {
      alert('Error al enviar');
    }
  });
})();

/* ─── Formulario voluntarios ───────────────────────────────── */
(function initVolForm() {
  const submitBtn = document.getElementById('vol-submit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', async () => {
    const nombre   = document.getElementById('vol-nombre').value;
    const email    = document.getElementById('vol-email').value;
    const telefono = document.getElementById('vol-telefono').value;

    try {
      await fetch(`${API_URL}/voluntarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, email, telefono })
      });

      alert('Solicitud enviada');
    } catch (err) {
      alert('Error');
    }
  });
})();