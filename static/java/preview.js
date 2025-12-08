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

    logo.src = app.image_url || "https://picsum.photos/200?random=99";
    name.textContent = app.name;
    description.textContent = app.short_description || app.long_description || "Sin descripción.";

    // Tags
    tagsContainer.innerHTML = "";
    (app.tags || []).forEach(t => {
      const span = document.createElement("span");
      span.className = "tag";
      span.textContent = t;
      tagsContainer.appendChild(span);
    });

    longDescription.textContent = app.long_description || "Sin descripción larga disponible.";

    // --- Reseñas ---
    const avgStarsContainer = document.getElementById("avg-stars");
    const reviewsCount = document.getElementById("reviews-count");
    const reviewsList = document.getElementById("reviews-list");

    function renderStars(container, rating) {
      container.innerHTML = "";
      const fullStars = Math.floor(rating);
      const halfStar = rating - fullStars >= 0.5;
      const totalStars = 5;

      for (let i = 0; i < fullStars; i++) container.innerHTML += "★";
      if (halfStar) container.innerHTML += "☆";
      for (let i = fullStars + (halfStar ? 1 : 0); i < totalStars; i++) container.innerHTML += "☆";
    }

    function renderReviews() {
      reviewsList.innerHTML = "";
      if (app.reviews && app.reviews.length > 0) {
        app.reviews.forEach(r => {
          const div = document.createElement("div");
          div.className = "comment";
          div.innerHTML = `<strong>@${r.username}</strong> ⭐ ${r.rating}<br>${r.content}`;
          reviewsList.appendChild(div);
        });
      }
      const avgRating = app.reviews && app.reviews.length > 0
        ? app.reviews.reduce((sum, r) => sum + r.rating, 0) / app.reviews.length
        : 0;
      renderStars(avgStarsContainer, avgRating);
      reviewsCount.textContent = `basado en ${app.reviews ? app.reviews.length : 0} opiniones`;
    }

    renderReviews();

    // --- Formulario estilo Amazon ---
    const addReviewBtn = document.getElementById("add-review-btn");
    const reviewForm = document.getElementById("review-form");
    const submitReview = document.getElementById("submit-review");
    const starPicker = document.getElementById("star-picker");
    let selectedRating = 0;

    // Mostrar/ocultar formulario
    addReviewBtn.addEventListener("click", () => {
      reviewForm.style.display = reviewForm.style.display === "none" ? "block" : "none";
    });

    // Interactividad de las estrellas
    starPicker.querySelectorAll("span").forEach(star => {
      star.addEventListener("mouseover", () => highlightStars(parseInt(star.dataset.value)));
      star.addEventListener("click", () => selectedRating = parseInt(star.dataset.value));
    });
    starPicker.addEventListener("mouseout", () => highlightStars(selectedRating));

    function highlightStars(rating) {
      starPicker.querySelectorAll("span").forEach(star => {
        star.textContent = parseInt(star.dataset.value) <= rating ? "★" : "☆";
      });
    }

    // Enviar reseña
    submitReview.addEventListener("click", async () => {
      const text = document.getElementById("review-text").value.trim();

      if (!text || selectedRating === 0) {
        alert("Por favor completa ambos campos.");
        return;
      }

      try {
        const formData = new FormData();
        formData.append("content", text);
        formData.append("rating", selectedRating);

        const res = await fetch(`/app/${appId}/reviews/add`, { method: "POST", body: formData });
        const data = await res.json();

        if (data.success) {
          app.reviews.push(data.review);
          renderReviews();
          document.getElementById("review-text").value = "";
          selectedRating = 0;
          highlightStars(0);
          reviewForm.style.display = "none";
        } else {
          alert(data.error || "Error al enviar la reseña.");
        }
      } catch (err) {
        console.error(err);
        alert("Error enviando la reseña.");
      }
    });

    // --- Cambio de pestañas ---
    const tabButtons = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");

    tabButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.dataset.tab;
        tabContents.forEach(tc => tc.classList.remove("active"));
        document.getElementById(targetId).classList.add("active");
        tabButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

  } catch (err) {
    console.error("Error cargando el preview de la app:", err);
  }
});
