document.addEventListener("DOMContentLoaded", async () => {
  const preview = document.getElementById("preview");
  const appId = preview.dataset.appId;

  if (!appId) {
    console.error("No se encontró el ID de la app.");
    return;
  }

  try {
    const response = await fetch(`/account/get_app/${appId}`);
    const data = await response.json();

    if (!data.success) {
      console.error("No se pudieron cargar los datos:", data);
      return;
    }

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


    // --- RELLENAR DATOS BÁSICOS ---
    logo.src = app.image_url || "https://picsum.photos/200?random=99";
    name.textContent = app.name;
    description.textContent = app.short_description || "Sin descripción breve.";

    // Tags
    tagsContainer.innerHTML = "";
    (app.tags || []).forEach(t => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = t;
      tagsContainer.appendChild(span);
    });

    // --- DESCRIPCIÓN LARGA ---
    longDescription.textContent = app.description || "Sin descripción larga disponible.";

    // --- RESEÑAS ---
    reviewsAvg.textContent = `⭐ ${app.rating || 0} / 5 — basado en ${app.reviews_count || 0} opiniones`;

    if (app.reviews) {
      app.reviews.forEach(r => {
        const div = document.createElement("div");
        div.className = "comment";
        div.innerHTML = `
          <strong>@${r.username}</strong>
          ${r.comment}
        `;
        reviewsList.appendChild(div);
      });
    }

    // --- EQUIPO ---
    teamContainer.innerHTML = "";
    if (app.team && app.team.length > 0) {
      app.team.forEach(member => {
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

    // Puedes personalizar más si tu backend incluye más datos

  } catch (err) {
    console.error("Error cargando el preview de la app:", err);
  }




  // --- CAMBIO DE PESTAÑAS ---
const tabButtons = document.querySelectorAll(".tab");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const targetId = btn.dataset.tab;

    // Activar la pestaña
    tabContents.forEach(tc => tc.classList.remove("active"));
    document.getElementById(targetId).classList.add("active");

    // Activar botón
    tabButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

// --- Funcionalidad añadir reseña ---
const addReviewBtn = document.getElementById("add-review-btn");
const reviewForm = document.getElementById("review-form");
const submitReview = document.getElementById("submit-review");

addReviewBtn.addEventListener("click", () => {
  reviewForm.style.display = reviewForm.style.display === "none" ? "block" : "none";
});

submitReview.addEventListener("click", async () => {
  const text = document.getElementById("review-text").value.trim();
  const rating = document.getElementById("review-rating").value.trim();
  const appId = document.getElementById("preview").dataset.appId;

  if (!text || !rating) {
    alert("Por favor completa ambos campos.");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("text", text);
    formData.append("rating", rating);

    const res = await fetch(`/app/${appId}/reviews/add`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      // Añadir al DOM
      const reviewsList = document.querySelector("#reviews .ratings");
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `<strong>@${data.review.username}</strong>⭐ ${data.review.rating}<br>${data.review.text}`;
      reviewsList.appendChild(div);

      // Limpiar formulario
      document.getElementById("review-text").value = "";
      document.getElementById("review-rating").value = "";
      reviewForm.style.display = "none";
    } else {
      alert(data.error || "Error al enviar la reseña.");
    }
  } catch (err) {
    console.error(err);
    alert("Error enviando la reseña.");
  }
});



});
