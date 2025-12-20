document.addEventListener("DOMContentLoaded", () => {
  const appsList = document.getElementById("appsList");

  loadApps();

  async function loadApps() {
    try {
      const response = await fetch("/account/get_all_apps");

      if (!response.ok) {
        appsList.innerHTML = "<p>Error al cargar apps: servidor respondió con error.</p>";
        return;
      }

      const data = await response.json();

      if (!data.success || !data.apps.length) {
        appsList.innerHTML = "<p>No se pudieron cargar las aplicaciones.</p>";
        return;
      }

      appsList.innerHTML = "";

      data.apps.forEach(app => {
        const item = document.createElement("div");
        item.className = "item app-item";
        item.dataset.appId = app.id;

        item.innerHTML = `
          <img src="${app.image_url || '/static/images/app-placeholder.png'}" alt="App">

          <div class="info">
            <h3>${app.name}</h3>
            <p>${app.description || "Sin descripción"}</p>

            <div class="tags">
              <span class="tag">${app.theme}</span>
              <span class="tag">${app.creation_date}</span>
            </div>

            <!-- Botón de comunidades -->
            <div class="community-dropdown-wrapper" style="margin-top: 0.5rem; position: relative;">
              <button class="view-btn openCommunityDropdown" type="button" data-app-id="${app.id}">
                Seleccionar comunidad ▼
              </button>
              <ul class="communityDropdown" style="
                display: none;
                position: absolute;
                top: 36px;
                left: 0;
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: var(--radius);
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                list-style: none;
                padding: 0.5rem 0;
                min-width: 220px;
                max-height: 200px;
                overflow-y: auto;
                z-index: 1000;
                transition: all 0.25s ease;
              "></ul>
            </div>

            <a href="/preview/${app.id}" class="view-btn" style="margin-top: 0.5rem;">Ver más</a>
          </div>
        `;

        appsList.appendChild(item);
      });

      // Inicializar los dropdowns de comunidades
      initCommunityDropdowns();

    } catch (error) {
      console.error(error);
      appsList.innerHTML = "<p>Error al cargar apps.</p>";
    }
  }

  function initCommunityDropdowns() {
    document.querySelectorAll(".openCommunityDropdown").forEach(btn => {
      const appId = btn.dataset.appId;
      const dropdown = btn.nextElementSibling;

      btn.addEventListener("click", async (e) => {
        e.stopPropagation();

        // Toggle visual
        if (dropdown.style.display === "block") {
          dropdown.style.opacity = 0;
          setTimeout(() => dropdown.style.display = "none", 200);
          return;
        }

        dropdown.style.display = "block";
        dropdown.style.opacity = 0;
        setTimeout(() => dropdown.style.opacity = 1, 0);

        // Si ya tiene elementos, no recargar
        if (dropdown.children.length > 0) return;

        try {
          const response = await fetch(`/account/get_app/${appId}`);
          const data = await response.json();
          dropdown.innerHTML = "";

          if (data.success && data.app.communities.length) {
            data.app.communities.forEach(c => {
              const li = document.createElement("li");
              li.textContent = c.name;
              li.style.padding = "0.5rem 1rem";
              li.style.cursor = "pointer";
              li.style.transition = "background 0.2s ease";

              li.addEventListener("mouseenter", () => li.style.background = "#f3f4f6");
              li.addEventListener("mouseleave", () => li.style.background = "transparent");

              li.addEventListener("click", () => {
                window.location.href = `/community/${c.id}`;
              });

              dropdown.appendChild(li);
            });
          } else {
            const li = document.createElement("li");
            li.textContent = "No hay comunidades";
            li.style.padding = "0.5rem 1rem";
            li.style.color = "var(--muted)";
            dropdown.appendChild(li);
          }

        } catch (err) {
          console.error(err);
        }
      });
    });

    // Cerrar dropdown si clic fuera
    document.addEventListener("click", (e) => {
      document.querySelectorAll(".communityDropdown").forEach(dd => {
        if (!dd.contains(e.target) && !dd.previousElementSibling.contains(e.target)) {
          dd.style.opacity = 0;
          setTimeout(() => dd.style.display = "none", 200);
        }
      });
    });
  }

});
