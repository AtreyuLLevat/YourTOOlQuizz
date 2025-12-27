document.addEventListener("DOMContentLoaded", () => {
  const appsList = document.getElementById("appsList");
  const appDetailModal = document.getElementById("appDetailModal");
  const closeAppDetail = document.getElementById("closeAppDetail");

  if (!appsList || !appDetailModal) return;

  /* =========================
     ELEMENTOS DEL MODAL
  ========================= */
  const modalLogoImg = document.getElementById("app-logo");
  const nameInput = document.getElementById("app-name-input");
  const descriptionInput = document.getElementById("app-description-input");
  const dateInput = document.getElementById("app-date-input");
  const themeInput = document.getElementById("app-theme-input");

  const starsEl = appDetailModal.querySelector(".reviews-summary .stars");
  const reviewsCountEl = appDetailModal.querySelector(".reviews-summary .reviews-count");
  const reviewsList = document.getElementById("reviews-list");
  const communitiesList = appDetailModal.querySelector(".community-list");
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

      if (tabName === "team" && window.currentAppId) {
        loadTeamMembers(window.currentAppId);
      }
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => showTab(btn.dataset.tab));
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
      if (!res.ok) {
        const text = await res.text();
        console.error("Error al cargar la app:", text);
        alert("No se pudo cargar la app");
        return;
      }

      const data = await res.json();
      if (!data.success) {
        alert(data.message || "No se pudo cargar la app");
        return;
      }

      const app = data.app;

      // Rellenar datos
      if (modalLogoImg) modalLogoImg.src = app.image_url || "/static/images/app-placeholder.png";
      if (nameInput) nameInput.value = app.name || "";
      if (descriptionInput) descriptionInput.value = app.description || "";
      if (dateInput) dateInput.value = app.creation_date || "";
      if (themeInput) themeInput.value = app.theme || "General";

      // Reviews
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
                <div class="review-avatar">${(r.username || "?")[0]}</div>
                <div class="review-user-details">
                  <div class="review-username">${r.username || "Usuario"}</div>
                  <div class="review-date">${r.created_at || ""}</div>
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

      // Comunidades
      if (communitiesList) {
        communitiesList.innerHTML = "";
        (app.communities || []).forEach(c => {
          const li = document.createElement("li");
          li.textContent = c.name;
          communitiesList.appendChild(li);
        });
      }

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
      if (!res.ok) {
        const text = await res.text();
        console.error("Error al cargar equipo:", text);
        teamList.innerHTML = "<p>Error al cargar el equipo</p>";
        return;
      }

      const team = await res.json();
      teamList.innerHTML = "";

      if (!team.length) {
        teamList.innerHTML = "<p style='color:#64748b;'>No hay miembros en el equipo.</p>";
        return;
      }

      team.forEach(m => {
        const socials = Object.entries(m.socials || {})
          .map(([k, v]) => `<a href="${v}" target="_blank" class="social-badge ${k}">@${k}</a>`)
          .join("");

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
    if (e.target === appDetailModal) appDetailModal.classList.add("hidden");
  });
});
