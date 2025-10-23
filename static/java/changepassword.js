document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("changePasswordForm");
  const feedback = document.getElementById("passwordFeedback");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const current_password = document.getElementById("current_password").value;
    const new_password = document.getElementById("new_password").value;
    const confirm_password = document.getElementById("confirm_password").value;

    feedback.style.display = "none";

    if (new_password !== confirm_password) {
      feedback.style.color = "red";
      feedback.textContent = "Las contraseñas no coinciden.";
      feedback.style.display = "block";
      return;
    }

    try {
      const res = await fetch("/account/change_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password, new_password })
      });

      const data = await res.json();

      feedback.style.display = "block";
      feedback.style.color = res.ok ? "green" : "red";
      feedback.textContent = data.message || data.error || "Error al cambiar la contraseña";
    } catch (error) {
      console.error("Error de conexión:", error);
      feedback.style.display = "block";
      feedback.style.color = "red";
      feedback.textContent = "Error de conexión con el servidor.";
    }
  });
});
