document.addEventListener("DOMContentLoaded", () => {
  const checkboxes = document.querySelectorAll("#notificaciones input[type='checkbox']");
  const saveBtn = document.getElementById("saveNotifications");
  const message = document.getElementById("notifMessage");

  const modal = document.getElementById("unsavedModal");
  const modalSave = document.getElementById("modalSave");
  const modalDiscard = document.getElementById("modalDiscard");

  let initialState = {};
  let hasUnsavedChanges = false;
  let lastClickOutside = null;

  // === CARGAR PREFERENCIAS GUARDADAS ===
  async function loadPreferences() {
    try {
      const response = await fetch("/get_notifications");
      const data = await response.json();

      if (data.success && data.notifications) {
        checkboxes.forEach(cb => {
          cb.checked = data.notifications[cb.id] ?? false;
        });
        initialState = Object.fromEntries(Array.from(checkboxes).map(cb => [cb.id, cb.checked]));
      } else {
        console.warn("⚠️ No se encontraron preferencias previas, usando valores por defecto.");
        checkboxes.forEach(cb => (initialState[cb.id] = cb.checked));
      }
    } catch (error) {
      console.error("❌ Error al cargar preferencias:", error);
    }
  }

  // === DETECTAR CAMBIOS ===
  checkboxes.forEach(cb => {
    cb.addEventListener("change", () => {
      hasUnsavedChanges = Array.from(checkboxes).some(cb => cb.checked !== initialState[cb.id]);
      saveBtn.classList.toggle("hidden", !hasUnsavedChanges);
    });
  });

  // === MODALES Y EVENTOS ===
  document.addEventListener("click", (e) => {
    const section = document.getElementById("notificaciones");
    const clickedInside = section.contains(e.target) || e.target.closest("#saveNotifications");
    if (hasUnsavedChanges && !clickedInside && !modal.classList.contains("showing")) {
      lastClickOutside = e.target;
      openModal();
    }
  });

  window.addEventListener("beforeunload", (e) => {
    if (hasUnsavedChanges) {
      e.preventDefault();
      e.returnValue = "";
    }
  });

  saveBtn.addEventListener("click", () => savePreferences());
  modalSave.addEventListener("click", () => {
    savePreferences();
    closeModal();
  });
  modalDiscard.addEventListener("click", () => {
    revertChanges();
    closeModal();
  });

  // === FUNCIONES ===
  async function savePreferences() {
    const preferences = {};
    checkboxes.forEach(cb => (preferences[cb.id] = cb.checked));

    try {
      const response = await fetch("/save_notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      });

      const data = await response.json();
      if (data.success) {
        showMessage("Notificaciones guardadas correctamente ✅", "success");
        initialState = { ...preferences };
        hasUnsavedChanges = false;
        saveBtn.classList.add("hidden");
      } else {
        showMessage(data.message || "Error al guardar las preferencias.", "error");
      }
    } catch {
      showMessage("No se pudo conectar con el servidor.", "error");
    }
  }

  function showMessage(text, type) {
    message.textContent = text;
    message.className = `notif-message ${type}`;
    message.style.display = "block";
    setTimeout(() => (message.style.display = "none"), 4000);
  }

  function revertChanges() {
    checkboxes.forEach(cb => (cb.checked = initialState[cb.id]));
    hasUnsavedChanges = false;
    saveBtn.classList.add("hidden");
  }

  function openModal() {
    modal.classList.remove("hidden");
    modal.classList.add("showing");
  }

  function closeModal() {
    modal.classList.add("hidden");
    modal.classList.remove("showing");
  }

  // === INICIALIZAR ===
  loadPreferences();
});
