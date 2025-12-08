document.addEventListener("DOMContentLoaded", async () => {
  const preview = document.getElementById("preview");
  if (!preview) return console.error("No se encontró el contenedor preview.");

  const appId = preview.dataset.appId;
  if (!appId) return console.error("No se encontró el ID de la app.");

  // --- CARGAR DATOS DE LA APP ---
  try {
    const response = await fetch(`/account/get_app/${appId}`);
    const data = await response.json();
    if (!data.success) return console.error("No se pudieron cargar los datos:", data);

    const app = data.app;

    // --- ELEMENTOS DEL DOM ---
    const logo = document.querySelector(".app-header img");
    const name = document.querySelector(".app-info h1");
    const description = document.querySelector(".app-info > p");
    const tagsContainer = document.querySelector(".tags");
    const longDescription = document.querySelector("#description .app-description p");
    const reviewsAvg = document.querySelector(".rating-average");
    const reviewsList = document.querySelector("#reviews .ratings");
    const teamContainer = document.querySelector(".team-container");

    // --- RELLENAR DATOS ---
    if (logo) logo.src = app.image_url || "https://picsum.photos/200?random=99";
    if (name) name.textContent = app.name;
    if (description) description.textContent = app.long_description || "Sin descripción disponible.";

    if (tagsContainer) {
      tagsContainer.innerHTML = "";
      (app.tags || []).forEach(t => {
        const span = document.createElement("span");
        span.className = "tag";
        span.textContent = t;
        tagsContainer.appendChild(span);
      });
    }

    if (longDescription) longDescription.textContent = app.long_description || "Sin descripción larga disponible.";

    if (reviewsAvg) reviewsAvg.textContent = `⭐ ${app.rating || 0} / 5 — basado en ${app.reviews_count || 0} opiniones`;

    if (reviewsList && app.reviews) {
      reviewsList.innerHTML = "";
      app.reviews.forEach(r => {
        const div = document.createElement("div");
        div.className = "comment";
        div.innerHTML = `<strong>@${r.username}</strong>⭐ ${r.rating || 0}<br>${r.comment}`;
        reviewsList.appendChild(div);
      });
    }

    if (teamContainer) {
      teamContainer.innerHTML = "";
      (app.team || []).forEach(member => {
        const div = document.createElement("div");
        div.className = "team-member-horizontal";
        div.innerHTML = `
          <img src="${member.avatar || 'https://picsum.photos/80'}" />
          <div class="team-info">
            <h3>${member.name}</h3>
            <p>${member.role}</p>
            <p class="username">@${member.username}</p>
          </div>
        `;
        teamContainer.appendChild(div);
      });
    }

  } catch (err) {
    console.error("Error cargando el preview de la app:", err);
  }

  // --- PESTAÑAS ---
  const tabButtons = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.tab;
      tabContents.forEach(tc => tc.classList.remove("active"));
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add("active");
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // --- FORMULARIO DE RESEÑAS ---
  const addReviewBtn = document.getElementById("add-review-btn");
  const reviewForm = document.getElementById("review-form");
  const submitReview = document.getElementById("submit-review");

  if (addReviewBtn && reviewForm && submitReview) {
    addReviewBtn.addEventListener("click", () => {
      reviewForm.style.display = reviewForm.style.display === "none" ? "block" : "none";
    });

    submitReview.addEventListener("click", async () => {
      const textEl = document.getElementById("review-text");
      const ratingEl = document.getElementById("review-rating");

      if (!textEl || !ratingEl) return alert("Formulario de reseña no encontrado.");

      const text = textEl.value.trim();
      const rating = ratingEl.value.trim();

      if (!text || !rating) return alert("Por favor completa ambos campos.");

      try {
        const formData = new FormData();
        formData.append("text", text);
        formData.append("rating", rating);

        const res = await fetch(`/app/${appId}/reviews/add`, { method: "POST", body: formData });
        const data = await res.json();

        if (data.success) {
          const reviewsList = document.querySelector("#reviews .ratings");
          if (reviewsList) {
            const div = document.createElement("div");
            div.className = "comment";
            div.innerHTML = `<strong>@${data.review.username}</strong>⭐ ${data.review.rating}<br>${data.review.text}`;
            reviewsList.appendChild(div);
          }

          // Limpiar formulario
          textEl.value = "";
          ratingEl.value = "";
          reviewForm.style.display = "none";
        } else {
          alert(data.error || "Error al enviar la reseña.");
        }
      } catch (err) {
        console.error(err);
        alert("Error enviando la reseña.");
      }
    });
  }

});
