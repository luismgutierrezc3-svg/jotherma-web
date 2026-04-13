// URL de tu backend
const API_URL = 'https://jotherma-web-production.up.railway.app/api';

// Esperar a que cargue la página
document.addEventListener('DOMContentLoaded', async () => {

  console.log("JS cargado correctamente");

  // =========================
  // TEXTOS
  // =========================
  try {
    const res = await fetch(`${API_URL}/textos`);

    if (!res.ok) {
      console.log("No se pudo cargar textos");
      return;
    }

    const data = await res.json();
    const t = data.textos || {};

    console.log("TEXTOS:", t);

// =========================
// HERO
// =========================
if (t.hero) {

  const elTitulo = document.getElementById('txt-hero-titulo');
  if (elTitulo) {
    elTitulo.innerHTML = `
      ${t.hero.titulo || ''} <span>${t.hero.titulo_destacado || ''}</span>
    `;
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

      if (t.quienes.titulo) {
        const el = document.getElementById('txt-quienes-titulo');
        if (el) el.textContent = t.quienes.titulo;
      }

      if (t.quienes.descripcion) {
        const el = document.getElementById('txt-quienes-desc');
        if (el) el.textContent = t.quienes.descripcion;
      }

    }

    // =========================
    // PROGRAMAS
    // =========================
    if (t.programas && Array.isArray(t.programas)) {

      const container = document.getElementById('programas-container');

      if (container) {
        container.innerHTML = '';

        t.programas.forEach(p => {
          const card = document.createElement('div');
          card.className = 'prog-card';

          card.innerHTML = `
            <div class="prog-icon">${p.icono || '⭐'}</div>
            <h3>${p.titulo || ''}</h3>
            <p>${p.descripcion || ''}</p>
          `;

          container.appendChild(card);
        });
      }

    }

    // =========================
    // BLOG / NOTICIAS
    // =========================
    if (t.blog && Array.isArray(t.blog)) {

      const container = document.getElementById('blog-container');

      if (container) {
        container.innerHTML = '';

        t.blog.forEach(n => {
          const card = document.createElement('div');
          card.className = 'blog-card';

          card.innerHTML = `
            <div class="blog-body">
              <span class="blog-cat">${n.categoria || 'Noticias'}</span>
              <h3>${n.titulo || ''}</h3>
              <p>${n.resumen || ''}</p>
              <div class="blog-meta">${n.fecha || ''}</div>
            </div>
          `;

          container.appendChild(card);
        });
      }

    }

  } catch (error) {
    console.log("Error textos:", error);
  }

});