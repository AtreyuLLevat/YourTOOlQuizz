document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("changePasswordForm");
  const feedback = document.getElementById("passwordFeedback");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const current_password = document.getElementById("current_password").value;
    const new_password = document.getElementById("new_password").value;
    const confirm_password = document.getElementById("confirm_password").value;

    try {
      const response = await fetch("/change_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ current_password, new_password, confirm_password }),
      });

      const data = await response.json();

      feedback.style.display = "block";
      feedback.style.color = data.success ? "green" : "red";
      feedback.textContent = data.message;
    } catch (error) {
      feedback.style.display = "block";
      feedback.style.color = "red";
      feedback.textContent = "Ocurrió un error al intentar actualizar la contraseña.";
    }
  });
});
