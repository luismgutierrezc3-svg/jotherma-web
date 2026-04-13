// URL de tu backend
const API_URL = 'https://jotherma-web-production.up.railway.app/api';

// Esperar a que cargue la página
document.addEventListener('DOMContentLoaded', async () => {

  console.log("VERSION NUEVA 123 🔥");

  // =========================
  // TEXTOS
  // =========================
  try {
    const res = await fetch(`${API_URL}/textos`);

    if (!res.ok) {
      console.log("No se pudo cargar textos");
    } else {

      const data = await res.json();
      const t = data.textos || {};

      console.log("TEXTOS:", t);

      // =========================
      // HERO
      // =========================
      if (t.hero) {
        const elTitulo = document.getElementById('txt-hero-titulo');
        if (elTitulo) {
          elTitulo.innerHTML = `${t.hero.titulo || ''} <span>${t.hero.titulo_destacado || ''}</span>`;
        }
        const elSub = document.getElementById('txt-hero-subtitulo');
        if (elSub) {
          elSub.textContent = t.hero.descripcion || '';
        }
      }

      // =========================
      // QUIÉNES SOMOS
      // =========================
      if (t.quienes) {
        const elTitulo = document.getElementById('txt-quienes-titulo');
        if (elTitulo) elTitulo.textContent = t.quienes.titulo || '';

        const elDesc = document.getElementById('txt-quienes-descripcion');
        if (elDesc) elDesc.textContent = t.quienes.descripcion || '';

        const elMision = document.getElementById('txt-quienes-mision');
        if (elMision && t.quienes.mision) elMision.textContent = t.quienes.mision;

        const elVision = document.getElementById('txt-quienes-vision');
        if (elVision && t.quienes.vision) elVision.textContent = t.quienes.vision;
      }

      // =========================
      // CONTACTO
      // =========================
      if (t.contacto) {
        const elDir = document.getElementById('txt-contacto-direccion');
        if (elDir && t.contacto.direccion) elDir.textContent = t.contacto.direccion;

        const elEmail = document.getElementById('txt-contacto-email');
        if (elEmail && t.contacto.email) {
          elEmail.textContent = t.contacto.email;
          elEmail.href = `mailto:${t.contacto.email}`;
        }

        const elTel = document.getElementById('txt-contacto-telefono');
        if (elTel && t.contacto.telefono) elTel.textContent = t.contacto.telefono;

        const elHorario = document.getElementById('txt-contacto-horario');
        if (elHorario && t.contacto.horario) elHorario.textContent = t.contacto.horario;
      }

    }
  } catch (error) {
    console.log("Error textos:", error);
  }

  // =========================
  // GALERÍA
  // =========================
  try {
    const resGal = await fetch(`${API_URL}/galeria`);
    if (resGal.ok) {
      const dataGal = await resGal.json();
      const items = dataGal.galeria || [];
      const grid = document.getElementById('galeria-grid');
      if (grid && items.length > 0) {
        grid.innerHTML = items.map(item => `
          <div class="gal-item">
            <img src="${item.imagen_url}" alt="${item.titulo || 'Foto JOTHERMA'}" loading="lazy"/>
            ${item.titulo ? `<div class="gal-caption">${item.titulo}</div>` : ''}
          </div>
        `).join('');
      }
    }
  } catch (error) {
    console.log("Error galería:", error);
  }

  // =========================
  // PUBLICACIONES / BLOG
  // =========================
  try {
    const resBlog = await fetch(`${API_URL}/publicaciones`);
    if (resBlog.ok) {
      const dataBlog = await resBlog.json();
      const pubs = (dataBlog.publicaciones || []).filter(p => p.estado === 'publicado');
      const grid = document.getElementById('blog-grid');
      if (grid) {
        if (pubs.length > 0) {
          grid.innerHTML = pubs.map(n => `
            <div class="blog-card">
              ${n.imagen_url ? `<div class="blog-img"><img src="${n.imagen_url}" alt="${n.titulo}" loading="lazy"/></div>` : ''}
              <div class="blog-body">
                <span class="blog-cat">${n.categoria || 'Noticias'}</span>
                <h3>${n.titulo || ''}</h3>
                <p>${(n.contenido || '').substring(0, 120)}...</p>
                <div class="blog-meta">${new Date(n.creado_en).toLocaleDateString('es-CO')}</div>
              </div>
            </div>
          `).join('');
        } else {
          grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#888;">No hay publicaciones aún.</div>';
        }
      }
    }
  } catch (error) {
    console.log("Error publicaciones:", error);
  }

});
