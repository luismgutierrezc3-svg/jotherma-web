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

    // HERO
    if (t.hero && t.hero.descripcion) {
      const el = document.getElementById('txt-hero-subtitulo');
      if (el) el.textContent = t.hero.descripcion;
    }

  } catch (error) {
    console.log("Error textos:", error);
  }

});