document.addEventListener("DOMContentLoaded", async () => {
  const preview = document.getElementById("preview");
  const appId = preview?.dataset?.appId;

  if (!appId) {
    console.error("No se encontró el ID de la app.");
    return;
  }

  // Función para renderizar estrellas
  function renderStars(container, rating) {
    if (!container) return;
    container.innerHTML = "";
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const totalStars = 5;

    for (let i = 0; i < fullStars; i++) container.innerHTML += "★";
    if (halfStar) container.innerHTML += "☆";
    for (let i = fullStars + (halfStar ? 1 : 0); i < totalStars; i++) container.innerHTML += "☆";
  }

  // Función para renderizar reviews
  function renderReviews(app, reviewsList, reviewsCount, avgStarsContainer) {
    if (!reviewsList || !reviewsCount) return;
    reviewsList.innerHTML = "";

    if (app.reviews.length > 0) {
      app.reviews.forEach(r => {
        const div = document.createElement("div");
        div.className = "comment";
        div.innerHTML = `<strong>@${r.username || "Usuario"}</strong> ⭐ ${r.rating || 0}<br>${r.content || ""}`;
        reviewsList.appendChild(div);
      });
    }

    const avgRating = app.reviews.length
      ? app.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / app.reviews.length
      : 0;

    renderStars(avgStarsContainer, avgRating);
    reviewsCount.textContent = `basado en ${app.reviews.length} opiniones`;
  }

  try {
    const response = await fetch(`/account/get_app/${appId}`);
    const data = await response.json();

    if (!data.success) {
      console.error("Error en backend:", data);
      return;
    }

    const app = data.app;
    app.reviews = app.reviews || [];
    app.team_members = app.team_members || [];
    app.communities = app.communities || [];

    // --- Elementos del DOM ---
    const logo = document.querySelector(".app-header img");
    const name = document.querySelector(".app-info h1");
    const description = document.querySelector(".app-info > p");
    const tagsContainer = document.querySelector(".tags");
    const longDescription = document.querySelector("#description .app-description p");

    logo.src = app.image_url || "https://picsum.photos/200?random=99";
    name.textContent = app.name || "Sin nombre";
    description.textContent = app.short_description || app.long_description || "Sin descripción.";
    longDescription.textContent = app.long_description || "Sin descripción larga disponible.";

    tagsContainer.innerHTML = "";
    (app.tags || []).forEach(t => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = t || "General";
      tagsContainer.appendChild(span);
    });

    // --- Reviews ---
    const avgStarsContainer = document.getElementById("avg-stars");
    const reviewsCount = document.getElementById("reviews-count");
    const reviewsList = document.getElementById("reviews-list");
    renderReviews(app, reviewsList, reviewsCount, avgStarsContainer);

    // --- Formulario de reviews ---
    const addReviewBtn = document.getElementById("add-review-btn");
    const reviewForm = document.getElementById("review-form");
    const submitReview = document.getElementById("submit-review");
    const starPicker = document.getElementById("star-picker");
    let selectedRating = 0;

    if (addReviewBtn && reviewForm) {
      addReviewBtn.addEventListener("click", () => {
        reviewForm.style.display = reviewForm.style.display === "none" ? "block" : "none";
      });
    }

    if (starPicker) {
      const stars = starPicker.querySelectorAll(".star");

      function updateStars() {
        stars.forEach(star => {
          const value = parseInt(star.dataset.value);
          star.textContent = value <= selectedRating ? "★" : "☆";
          star.classList.toggle("selected", value <= selectedRating);
        });
      }

      stars.forEach(star => {
        star.addEventListener("mouseover", () => {
          const hoverValue = parseInt(star.dataset.value);
          stars.forEach(s => {
            const val = parseInt(s.dataset.value);
            s.textContent = val <= hoverValue ? "★" : "☆";
            s.classList.toggle("hover", val <= hoverValue);
          });
        });

        star.addEventListener("click", () => {
          selectedRating = parseInt(star.dataset.value);
          updateStars();
        });
      });

      starPicker.addEventListener("mouseout", updateStars);
    }

    if (submitReview) {
      submitReview.addEventListener("click", async () => {
        const textArea = document.getElementById("review-text");
        const text = textArea?.value.trim();

        if (!text || selectedRating === 0) {
          alert("Por favor completa ambos campos.");
          return;
        }

        try {
          const formData = new FormData();
          formData.append("content", text);
          formData.append("rating", selectedRating);

          const res = await fetch(`/app/${appId}/reviews/add`, { method: "POST", body: formData });
          const resData = await res.json();

          if (resData.success) {
            app.reviews.push(resData.review);
            renderReviews(app, reviewsList, reviewsCount, avgStarsContainer);
            if (textArea) textArea.value = "";
            selectedRating = 0;
            if (starPicker) {
              starPicker.querySelectorAll(".star").forEach(star => star.textContent = "☆");
            }
            if (reviewForm) reviewForm.style.display = "none";
          } else {
            alert(resData.error || "Error al enviar la reseña.");
          }
        } catch (err) {
          console.error(err);
          alert("Error enviando la reseña.");
        }
      });
    }

    // --- Cambio de pestañas ---
    const tabButtons = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.tab;
        tabContents.forEach(tc => tc.classList.remove("active"));
        const targetTab = document.getElementById(targetId);
        if (targetTab) targetTab.classList.add("active");
        tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    // --- Renderizar equipo ---
    const teamContainer = document.getElementById("team-list");
    if (teamContainer) {
      teamContainer.innerHTML = "";
      if (app.team_members.length === 0) {
        teamContainer.innerHTML = "<p>No hay miembros en el equipo.</p>";
      } else {
        app.team_members.forEach(m => {
          const div = document.createElement("div");
          div.className = "team-member-horizontal";
          div.innerHTML = `
            <img src="${m.avatar_url || 'https://picsum.photos/80?random=21'}" alt="Avatar">
            <div class="team-info">
              <h3>${m.name}</h3>
              <p>${m.role || ""}</p>
              <p class="username">@${m.username || "anon"}</p>
              <div class="socials">
                ${m.twitter ? `<a href="${m.twitter}">Twitter</a>` : ""}
                ${m.linkedin ? `<a href="${m.linkedin}">LinkedIn</a>` : ""}
              </div>
            </div>
          `;
          teamContainer.appendChild(div);
        });
      }
    }

    // --- Renderizar comunidades ---
// --- Dropdown de comunidades ---
const openCommunityBtn = document.getElementById("openCommunityDropdown");
const communityDropdown = document.getElementById("communityDropdown");

if (openCommunityBtn && communityDropdown) {
  // Limpiar contenido previo
  communityDropdown.innerHTML = "";

  // Obtener comunidades de la app
  const communities = app.communities || [];

  if (communities.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No hay comunidades disponibles.";
    li.style.padding = "0.5rem 1rem";
    li.style.color = "#666";
    communityDropdown.appendChild(li);
  } else {
    communities.forEach(c => {
      const li = document.createElement("li");
      li.textContent = c.name;
      li.style.padding = "0.5rem 1rem";
      li.style.cursor = "pointer";
      li.style.transition = "background 0.2s";

      // Efectos hover
      li.addEventListener("mouseenter", () => li.style.background = "#f0f4ff");
      li.addEventListener("mouseleave", () => li.style.background = "transparent");

      // Redirigir al chat de la comunidad
li.addEventListener("click", () => {
  window.location.href = `/community/${c.id}`;
});


      communityDropdown.appendChild(li);
    });
  }

  // Toggle dropdown al hacer click en el botón
  openCommunityBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // evitar que se cierre inmediatamente
    communityDropdown.style.display = communityDropdown.style.display === "block" ? "none" : "block";
  });

  // Cerrar dropdown al hacer click fuera
  document.addEventListener("click", (e) => {
    if (!openCommunityBtn.contains(e.target) && !communityDropdown.contains(e.target)) {
      communityDropdown.style.display = "none";
    }
  });
}
  } catch (error) {
    console.error("Error al cargar la app:", error);
  }
});
