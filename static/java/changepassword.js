document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("changePasswordForm");
  const feedback = document.getElementById("passwordFeedback");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const current_password = document.getElementById("current_password").value;
    const new_password = document.getElementById("new_password").value;
    const confirm_password = document.getElementById("confirm_password").value;

    const response = await fetch("/change_password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ current_password, new_password, confirm_password }),
    });

    const result = await response.json();

    feedback.style.display = "block";
    feedback.style.color = result.success ? "green" : "red";
    feedback.textContent = result.message;

    if (result.success) {
      form.reset();
      setTimeout(() => (feedback.style.display = "none"), 3000);
    }
  });
});
