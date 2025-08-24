// Carga de Google Analytics de forma dinámica
(function() {
  const gaScript = document.createElement('script');
  gaScript.async = true;
  gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-R9HVBYS6QM";
  document.head.appendChild(gaScript);

  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag; // para que sea accesible globalmente
  gtag('js', new Date());
  gtag('config', 'G-R9HVBYS6QM');
})();

// Funcionalidad buscador y menú
document.addEventListener("DOMContentLoaded", () => {
  const searchToggleBtn = document.getElementById("searchToggleBtn");
  const searchCloseBtn = document.getElementById("searchCloseBtn");
  const mobileSearchForm = document.getElementById("mobileSearchForm");

  const hamburgerBtn = document.getElementById("hamburgerBtn");
  const mobileNavMenu = document.getElementById("mobileNavMenu");

  // Mostrar/ocultar buscador móvil
  if (searchToggleBtn && mobileSearchForm) {
    searchToggleBtn.addEventListener("click", () => {
      mobileSearchForm.classList.add("active");
      searchToggleBtn.style.display = "none";
      const input = mobileSearchForm.querySelector("input");
      if(input) input.focus();
      if (mobileNavMenu) mobileNavMenu.classList.add("hidden"); // ocultar menú si estaba abierto
    });
  }

  if (searchCloseBtn && mobileSearchForm) {
    searchCloseBtn.addEventListener("click", () => {
      mobileSearchForm.classList.remove("active");
      if(searchToggleBtn) searchToggleBtn.style.display = "inline-block";
    });
  }

  // Toggle menú hamburguesa
  if (hamburgerBtn && mobileNavMenu) {
    hamburgerBtn.addEventListener("click", () => {
      mobileNavMenu.classList.toggle("hidden");
      // Al abrir menú, cerrar buscador
      if (!mobileNavMenu.classList.contains("hidden") && mobileSearchForm && searchToggleBtn) {
        mobileSearchForm.classList.remove("active");
        searchToggleBtn.style.display = "inline-block";
      }
    });
  }

  // Cerrar menús al hacer clic fuera
  document.addEventListener("click", (e) => {
    // Cerrar buscador si clic fuera
    if (mobileSearchForm && !mobileSearchForm.contains(e.target) && searchToggleBtn && e.target !== searchToggleBtn) {
      mobileSearchForm.classList.remove("active");
      searchToggleBtn.style.display = "inline-block";
    }

    // Cerrar menú si clic fuera
    if (mobileNavMenu && !mobileNavMenu.contains(e.target) && hamburgerBtn && e.target !== hamburgerBtn) {
      mobileNavMenu.classList.add("hidden");
    }
  });
});
