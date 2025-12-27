document.addEventListener("DOMContentLoaded", () => {
  const appsList = document.getElementById("appsList");
  const appDetailModal = document.getElementById("appDetailModal");
  const closeAppDetail = document.getElementById("closeAppDetail");

  if (!appsList || !appDetailModal) return;

  /* =========================
     ELEMENTOS DEL MODAL
  ========================= */

  // Logo
  const modalLogoImg = document.getElementById("app-logo");

  // Inputs editables
  const nameInput = document.getElementById("app-name-input");
  const descriptionInput = document.getElementById("app-description-input");
  const dateInput = document.getElementById("app-date-input");
  const themeInput = document.getElementById("app-theme-input");

  // Reviews
  const starsEl = appDetailModal.querySelector(".reviews-summary .stars");
  const reviewsCountEl = appDetailModal.querySelector(".reviews-summary .reviews-count");
  const reviewsList = document.getElementById("reviews-list");

  // Comunidades
  const communitiesList = appDetailModal.querySelector(".community-list");

  // Team
  const teamList = document.getElementById("team-members-list");

  /* =========================
     PESTAÑAS
  ========================= */

  const tabButtons = appDetailModal.querySelectorAll(".tab-btn");
  const tabContents = appDetailModal.querySelectorAll(".tab-content");

  function showTab(tabName) {
    tabButtons.forEach(btn => btn.classList.remove("active"));
    tabContents.forEach(c => c.classList.add("hidden"));

    const activeBtn = appDetailModal.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(tabName);

    if (activeBtn && activeContent) {
      activeBtn.classList.add("active");
      activeContent.classList.remove("hidden");

      // Cargar team SOLO cuando se abre la pestaña
      if (tabName === "team" && window.currentAppId) {
        loadTeamMembers(window.currentAppId);
      }
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      showTab(btn.dataset.tab);
    });
  });

  /* =========================
     ABRIR MODAL
  ========================= */

  appsList.addEventListener("click", async (e) => {
    const appBtn = e.target.closest(".app-item");
    if (!appBtn) return;

    const appId = appBtn.dataset.appId;
    window.currentAppId = appId;

    try {
      const res = await fetch(`/account/apps/${appId}`);
      const data = await res.json();

      if (!data.success) {
        alert("No se pudo cargar la app");
        return;
      }

      const app = data.app;

      /* ===== RELLENAR DATOS ===== */

      if (modalLogoImg) {
        modalLogoImg.src = app.image_url || "/static/images/app-placeholder.png";
      }

      if (nameInput) nameInput.value = app.name || "";
      if (descriptionInput) descriptionInput.value = app.description || "";
      
      // Adaptar fecha al formato YYYY-MM-DD
      if (dateInput) {
        dateInput.value = app.creation_date ? app.creation_date.split("T")[0] : "";
      }

      if (themeInput) themeInput.value = app.theme || "General";

      /* ===== REVIEWS ===== */

      if (starsEl && reviewsCountEl) {
        const rating = Math.round(app.rating || 0);
        starsEl.textContent = "⭐".repeat(rating) + "☆".repeat(5 - rating);
        reviewsCountEl.textContent = `(${app.reviews_count || 0})`;
      }

      if (reviewsList) {
        reviewsList.innerHTML = "";
        (app.reviews || []).forEach(r => {
          const div = document.createElement("div");
          div.className = "review-card";
          div.innerHTML = `
            <div class="review-header">
              <div class="review-user-info">
                <div class="review-avatar">${(r.user_name || "?")[0]}</div>
                <div class="review-user-details">
                  <div class="review-username">${r.user_name || "Usuario"}</div>
                  <div class="review-date">${r.date || ""}</div>
                </div>
              </div>
              <div class="review-rating">
                ⭐ <span class="rating-value">${r.rating}</span>
              </div>
            </div>
            <p class="review-content">${r.content || ""}</p>
          `;
          reviewsList.appendChild(div);
        });
      }

      /* ===== COMUNIDADES ===== */

      if (communitiesList) {
        communitiesList.innerHTML = "";
        (app.communities || []).forEach(c => {
          const li = document.createElement("li");
          li.textContent = c.name;
          communitiesList.appendChild(li);
        });
      }

      /* ===== MOSTRAR MODAL ===== */

      showTab("reviews");
      appDetailModal.classList.remove("hidden");

    } catch (err) {
      console.error(err);
      alert("Error al cargar la app");
    }
  });

  /* =========================
     TEAM MEMBERS
  ========================= */

  async function loadTeamMembers(appId) {
    if (!teamList) return;

    teamList.innerHTML = "Cargando equipo...";

    try {
      const res = await fetch(`/apps/${appId}/team`);
      const team = await res.json();

      teamList.innerHTML = "";

      if (!team.length) {
        teamList.innerHTML = "<p style='color:#64748b;'>No hay miembros en el equipo.</p>";
        return;
      }

      team.forEach(m => {
        const socials = Object.entries(m.socials || {})
          .map(([k, v]) => `
            <a href="${v}" target="_blank" class="social-badge ${k}">
              @${k}
            </a>
          `).join("");

        const card = document.createElement("div");
        card.className = "team-member-card";
        card.innerHTML = `
          <div class="team-member-info">
            <img class="team-avatar" src="${m.avatar || '/static/images/default-avatar.png'}">
            <div>
              <div class="team-name">${m.name}</div>
              <div class="team-role">${m.role || ""}</div>
              <div class="social-badges">${socials}</div>
            </div>
          </div>
        `;
        teamList.appendChild(card);
      });

    } catch (err) {
      console.error(err);
      teamList.innerHTML = "<p>Error al cargar el equipo</p>";
    }
  }

  /* =========================
     CERRAR MODAL
  ========================= */

  closeAppDetail?.addEventListener("click", () => {
    appDetailModal.classList.add("hidden");
  });

  appDetailModal.addEventListener("click", (e) => {
    if (e.target === appDetailModal) {
      appDetailModal.classList.add("hidden");
    }
  });
});
