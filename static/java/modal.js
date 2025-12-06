document.addEventListener("DOMContentLoaded", () => {
  const appsList = document.getElementById("appsList");
  const appDetailModal = document.getElementById("appDetailModal");
  const closeAppDetail = document.getElementById("closeAppDetail");

  // Elementos dentro del modal
  const modalLogo = appDetailModal.querySelector(".app-logo img");
  const modalName = appDetailModal.querySelector(".app-name");
  const modalDescription = appDetailModal.querySelector(".app-description");
  const modalDate = appDetailModal.querySelector(".app-date");
  const modalTheme = appDetailModal.querySelector(".app-theme");
  const modalStars = appDetailModal.querySelector(".reviews-summary .stars");
  const modalReviewsCount = appDetailModal.querySelector(".reviews-summary .reviews-count");
  const modalCommunitiesList = appDetailModal.querySelector(".community-list");

  // Pestañas
  const tabs = appDetailModal.querySelectorAll(".tab-btn");
  const tabContents = appDetailModal.querySelectorAll(".tab-content");

  // Función para cambiar pestaña
  function showTab(tabName) {
    tabs.forEach(t => t.classList.remove("active"));
    tabContents.forEach(c => c.classList.add("hidden"));

    const activeTab = appDetailModal.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(tabName);

    if (activeTab && activeContent) {
      activeTab.classList.add("active");
      activeContent.classList.remove("hidden");
    }
  }

  // Eventos pestañas
  tabs.forEach(tab => {
    tab.addEventListener("click", () => showTab(tab.dataset.tab));
  });

  // Abrir modal al hacer click en una app
  appsList.addEventListener("click", async (e) => {
    const appBtn = e.target.closest(".app-item");
    if (!appBtn) return;

    const appId = appBtn.dataset.appId; // Cada botón debe tener data-app-id="{{app.id}}"

    try {
      const response = await fetch(`/account/get_app/${appId}`);
      const data = await response.json();

      if (!data.success) {
        alert("No se pudo cargar la app");
        return;
      }

      const app = data.app;

      // Llenar datos del modal
      modalLogo.src = app.image_url || "/static/images/app-placeholder.png";
      modalName.textContent = app.name;
      modalDescription.textContent = app.description || "Sin descripción";
      modalDate.textContent = `Fecha: ${app.creation_date || "Desconocida"}`;
      modalTheme.textContent = `Tema: ${app.theme || "General"}`;

      // Reseñas
      const rating = Math.round(app.rating || 0);
      modalStars.textContent = "⭐".repeat(rating) + "☆".repeat(5 - rating);
      modalReviewsCount.textContent = `(${app.reviews_count || 0})`;

      // Comunidades
      modalCommunitiesList.innerHTML = "";
      (app.communities || []).forEach(c => {
        const li = document.createElement("li");
        li.textContent = c.name;
        modalCommunitiesList.appendChild(li);
      });

      // Mostrar modal y pestaña por defecto (reseñas)
      showTab("reviews");
      appDetailModal.classList.remove("hidden");

    } catch (err) {
      console.error(err);
      alert("Error al cargar los datos de la app");
    }
  });

  // Cerrar modal
  closeAppDetail.addEventListener("click", () => {
    appDetailModal.classList.add("hidden");
  });

  // Cerrar modal haciendo clic fuera del contenido
  appDetailModal.addEventListener("click", (e) => {
    if (e.target === appDetailModal) appDetailModal.classList.add("hidden");
  });

  // Iconos de edición (solo frontend, no funcional aún)
  appDetailModal.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      alert("Función de edición aún no implementada");
    });
  });
});
