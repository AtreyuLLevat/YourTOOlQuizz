
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");
  const navLinks = document.querySelectorAll(".menu a");

  // --- Mostrar solo la primera sección al cargar ---
  sections.forEach((section, index) => {
    section.style.display = index === 0 ? "block" : "none";
  });
  navLinks[0].classList.add("active");

  // --- Al hacer clic en un enlace ---
  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();

      const targetId = link.getAttribute("href").substring(1);
      const targetSection = document.getElementById(targetId);

      // Quitar "active" de todos los links
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");

      // Ocultar todas las secciones excepto la seleccionada
      sections.forEach(section => {
        section.style.display = section === targetSection ? "block" : "none";
      });

      // Scroll al inicio del contenido
      window.scrollTo({
        top: document.querySelector("main").offsetTop - 20,
        behavior: "smooth"
      });
    });
  });

  // --- (Opcional) Detectar hash al cargar la página ---
  const hash = window.location.hash;
  if (hash) {
    const target = document.querySelector(hash);
    if (target) {
      navLinks.forEach(l => l.classList.remove("active"));
      document.querySelector(`.menu a[href="${hash}"]`).classList.add("active");
      sections.forEach(s => (s.style.display = s === target ? "block" : "none"));
    }
  }
});
