document.addEventListener("DOMContentLoaded", () => {

  const modal = document.getElementById("editModal");
  const closeBtn = document.getElementById("closeModal");
  const saveBtn = document.getElementById("saveChanges");

  const idInput = document.getElementById("edit-app-id");
  const nameInput = document.getElementById("edit-name");
  const descInput = document.getElementById("edit-description");
  const themeInput = document.getElementById("edit-theme");
  const statusInput = document.getElementById("edit-status");

  document.querySelectorAll(".edit-app-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const appId = btn.dataset.id;

      const res = await fetch(`/api/apps/${appId}/edit`);
      const data = await res.json();

      if (!data.success) return alert("Error cargando app");

      idInput.value = data.app.id;
      nameInput.value = data.app.name || "";
      descInput.value = data.app.description || "";
      themeInput.value = data.app.theme || "";
      statusInput.value = data.app.status || "";

      modal.style.display = "flex";
    });
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });

  saveBtn.addEventListener("click", async () => {
    const appId = idInput.value;

    const payload = {
      name: nameInput.value,
      description: descInput.value,
      theme: themeInput.value,
      status: statusInput.value
    };

    const res = await fetch(`/api/apps/${appId}/edit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.success) {
      modal.style.display = "none";
      location.reload();
    } else {
      alert("Error guardando cambios");
    }
  });

});
