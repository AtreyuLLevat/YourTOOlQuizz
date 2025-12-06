// =======================
// 🔵 CARGA DE DATOS DINÁMICOS
// =======================

async function fetchData() {
  try {
    const res = await fetch("/homepage/data");
    const data = await res.json();
    return data.success ? data : { apps: [], extensions: [], communities: [], quizzes: [] };
  } catch (err) {
    console.error("Error cargando datos:", err);
    return { apps: [], extensions: [], communities: [], quizzes: [] };
  }
}


// =======================
// 🔵 RENDER CARDS (Apps + Extensiones)
// =======================

function renderCards(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = ""; // Limpieza antes de renderizar

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <img src="${item.img || item.image_url || "/static/images/app-placeholder.png"}" alt="${item.title}">
      <div class="info">
        <h3>${item.title || item.name}</h3>
        <p>${item.desc || item.description || ""}</p>

        <div class="tags">
          ${(item.tags || item.tag_list || []).map(tag => `<span class="tag">${tag}</span>`).join("")}
        </div>

        <div class="more-info">${item.extra || ""}</div>

        <a href="#" class="view-btn">Ver más</a>
      </div>
    `;

    container.appendChild(div);
  });
}


// =======================
// 🔵 RENDER COMUNIDADES
// =======================

function renderCommunities(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "community-item";
    div.innerHTML = `
      <h4>${item.title}</h4>
      <p>${item.desc}</p>
      <div class="tags">
        ${(item.tags || []).map(tag => `<span class="tag">${tag}</span>`).join("")}
      </div>
    `;
    container.appendChild(div);
  });
}


// =======================
// 🔵 RENDER QUIZZES
// =======================

function renderQuizzes(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  items.forEach(item => {
    const div = document.createElement("div");
    div.className = "quiz-item";
    div.innerHTML = `
      <h4>${item.title}</h4>
      <p>${item.desc}</p>
      <div class="tags">
        ${(item.tags || []).map(tag => `<span class="tag">${tag}</span>`).join("")}
      </div>
    `;
    container.appendChild(div);
  });
}


// =======================
// 🔵 EJECUCIÓN GENERAL
// =======================

async function initHomepage() {
  const data = await fetchData();

  renderCards(data.apps, "appsList");
  renderCards(data.extensions, "extensionsList");
  renderCommunities(data.communities, "communitiesList");
  renderQuizzes(data.quizzes, "quizzesList");
}

document.addEventListener("DOMContentLoaded", initHomepage);
