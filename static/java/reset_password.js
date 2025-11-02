
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("securityModal");
  const closeBtn = document.getElementById("closeModal");

  if (modal) {
    // Mostrar el modal
    modal.style.display = "flex";

    // Cerrar el modal con animación
    closeBtn.addEventListener("click", () => {
      modal.style.animation = "fadeOut 0.3s ease forwards";
      setTimeout(() => {
        modal.remove();
      }, 280);
    });
  }
});

