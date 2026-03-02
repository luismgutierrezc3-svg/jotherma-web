/* ============================================================
   JOTHERMA — Fundación Jóvenes Trabajando Como Hermanos
   main.js — Lógica principal del sitio
   ============================================================ */

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
    const res  = await fetch('/api/publicaciones');
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
              <a href="#" class="btn-ver" onclick="abrirPublicacion(event, ${JSON.stringify(p).replace(/"/g,'&quot;')})">Leer más →</a>
            </div>
          </div>
        </div>`;
    }).join('');

  } catch (err) {
    console.error('Error cargando publicaciones:', err);
    grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#888;">No se pudieron cargar las publicaciones.</div>';
  }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', cargarPublicaciones);



const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) e.target.classList.add('visible');
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));


/* ─── Navbar: fondo al hacer scroll ────────────────────────── */
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    nav.style.boxShadow = '0 4px 24px rgba(13,45,94,.15)';
  } else {
    nav.style.boxShadow = '0 2px 16px rgba(13,45,94,.08)';
  }
});


/* ─── Donaciones: selección de monto ───────────────────────── */
function selMonto(el, val) {
  document.querySelectorAll('.don-op').forEach((d) => d.classList.remove('active'));
  el.classList.add('active');
  const inp = document.getElementById('monto-input');
  if (inp) inp.value = val === 'otro' ? '' : val;
  if (val === 'otro' && inp) inp.focus();
}


/* ─── Donaciones: método de pago ───────────────────────────── */
function selMetodo(el, tipo) {
  document.querySelectorAll('.metodo-btn').forEach((b) => b.classList.remove('active'));
  el.classList.add('active');

  const online       = document.getElementById('form-online');
  const transferencia = document.getElementById('form-transferencia');
  if (online)        online.style.display       = tipo === 'online'        ? 'block' : 'none';
  if (transferencia) transferencia.style.display = tipo === 'transferencia' ? 'block' : 'none';
}


/* ─── Legal: pestañas ──────────────────────────────────────── */
function showLegal(panel, btn) {
  document.querySelectorAll('.legal-panel').forEach((p) => p.classList.remove('active'));
  document.querySelectorAll('.legal-tab').forEach((t) => t.classList.remove('active'));

  const el = document.getElementById(panel);
  if (el) el.classList.add('active');

  if (btn) {
    btn.classList.add('active');
  } else {
    document.querySelectorAll('.legal-tab').forEach((t) => {
      const oc = t.getAttribute('onclick') || '';
      if (oc.includes(panel)) t.classList.add('active');
    });
  }

  // Hacer scroll suave a la sección legal si el usuario viene de otro lugar
  const legalSection = document.getElementById('legal');
  if (legalSection) {
    legalSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


/* ─── Cookies: banner ──────────────────────────────────────── */
(function initCookies() {
  const banner   = document.getElementById('cookies-banner');
  const KEY      = 'jotherma_cookies_accepted';

  if (!banner) return;

  // Ocultar si ya eligió
  if (localStorage.getItem(KEY)) {
    banner.style.display = 'none';
    return;
  }

  // Botón "Solo esenciales"
  const btnReject = banner.querySelector('.btn-reject');
  if (btnReject) {
    btnReject.addEventListener('click', () => {
      localStorage.setItem(KEY, 'essential');
      banner.style.display = 'none';
    });
  }

  // Botón "Aceptar todas"
  const btnAccept = banner.querySelector('.btn-accept');
  if (btnAccept) {
    btnAccept.addEventListener('click', () => {
      localStorage.setItem(KEY, 'all');
      banner.style.display = 'none';
    });
  }
})();


/* ─── Smooth scroll para los enlaces del nav ───────────────── */
document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (e) => {
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 72; // altura del navbar
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});


/* ─── Formulario de contacto: feedback visual ──────────────── */
(function initContactForm() {
  const contactSection = document.getElementById('contacto');
  if (!contactSection) return;

  const submitBtn = contactSection.querySelector('.btn-submit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', () => {
    alert('¡Mensaje enviado! Te responderemos pronto.');
  });
})();


/* ─── Formulario de voluntariado: feedback visual ──────────── */
(function initVolForm() {
  const volSection = document.getElementById('voluntariado');
  if (!volSection) return;

  const submitBtn = volSection.querySelector('.btn-submit');
  if (!submitBtn) return;

  submitBtn.addEventListener('click', () => {
    alert('¡Gracias por tu interés! Te contactaremos pronto.');
  });
})();


/* ─── Donación online: pasarela de pago ────────────────────── */
(function initDonForm() {
  const formOnline = document.getElementById('form-online');
  if (!formOnline) return;

  const submitBtn = formOnline.querySelector('.btn-submit');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      alert('Redirigiendo a pasarela de pagos segura...');
    });
  }

  const formTransferencia = document.getElementById('form-transferencia');
  if (!formTransferencia) return;

  const submitBtnT = formTransferencia.querySelector('.btn-submit');
  if (submitBtnT) {
    submitBtnT.addEventListener('click', () => {
      alert('¡Gracias! Te contactaremos al recibir tu comprobante.');
    });
  }
})();


/* ─── Modal de publicación completa ───────────────────────── */
function abrirPublicacion(e, p) {
  e.preventDefault();

  // Crear modal si no existe
  let overlay = document.getElementById('pub-modal-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'pub-modal-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px);';
    overlay.addEventListener('click', (ev) => { if (ev.target === overlay) overlay.style.display = 'none'; });
    document.body.appendChild(overlay);
  }

  const fecha = p.fecha_publicacion
    ? new Date(p.fecha_publicacion).toLocaleDateString('es-CO', { day:'numeric', month:'long', year:'numeric' })
    : new Date(p.creado_en).toLocaleDateString('es-CO', { day:'numeric', month:'long', year:'numeric' });

  const imgHtml = p.imagen_url
    ? `<img src="${p.imagen_url}" alt="${p.titulo}" style="width:100%;max-height:320px;object-fit:cover;border-radius:8px;margin-bottom:20px;">`
    : '';

  const contenidoHtml = (p.contenido || '').replace(/\n/g, '<br>');

  overlay.innerHTML = `
    <div style="background:#fff;border-radius:16px;max-width:700px;width:100%;max-height:85vh;overflow-y:auto;padding:36px;position:relative;">
      <button onclick="document.getElementById('pub-modal-overlay').style.display='none'"
        style="position:absolute;top:16px;right:16px;background:none;border:none;font-size:1.4rem;cursor:pointer;color:#666;">✕</button>
      ${imgHtml}
      <span style="background:#e8f0ff;color:#0d2d5e;padding:3px 12px;border-radius:20px;font-size:0.8rem;font-weight:600;">${p.categoria || 'General'}</span>
      <h2 style="margin:14px 0 8px;font-size:1.6rem;color:#0d2d5e;line-height:1.3;">${p.titulo}</h2>
      <p style="color:#888;font-size:0.85rem;margin-bottom:20px;">📅 ${fecha}</p>
      <div style="color:#333;font-size:1rem;line-height:1.75;">${contenidoHtml}</div>
    </div>`;

  overlay.style.display = 'flex';
}
