document.addEventListener("DOMContentLoaded", () => {
  const appsList = document.getElementById("appsList");

  // Cargar apps al inicio
  loadApps();

  async function loadApps() {
    try {
      const response = await fetch("/account/get_app/<id>");
      const data = await response.json();

      if (!data.success) {
        appsList.innerHTML = "<p>No se pudieron cargar las aplicaciones.</p>";
        return;
      }

      const apps = data.apps;
      appsList.innerHTML = "";

      apps.forEach(app => {
        const item = document.createElement("div");
        item.className = "item app-item";
        item.dataset.appId = app.id;

        item.innerHTML = `
          <img src="${app.image_url || '/static/images/app-placeholder.png'}" alt="App">

          <div class="info">
            <h3>${app.name}</h3>
            <p>${app.description || "Sin descripción"}</p>

            <div class="tags">
              <span class="tag">${app.theme || "General"}</span>
              <span class="tag">${app.creation_date || "Fecha desconocida"}</span>
            </div>
            <a href="/preview/${app.id}" class="view-btn">Ver más</a>

          </div>
        `;

        appsList.appendChild(item);
      });

    } catch (error) {
      console.error(error);
      appsList.innerHTML = "<p>Error al cargar apps.</p>";
    }
  }
});
