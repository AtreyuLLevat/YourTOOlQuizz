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

            <!-- Solo el botón de ver más, sin comunidad -->
            <a href="/preview/${app.id}" class="view-btn" style="margin-top: 0.5rem;">Ver más</a>
          </div>
        `;

        appsList.appendChild(item);
      });

      // No se inicializan dropdowns de comunidad porque ya no existen
      // initCommunityDropdowns();  <-- eliminada

    } catch (error) {
      console.error(error);
      appsList.innerHTML = "<p>Error al cargar apps.</p>";
    }
  }

});
