document.addEventListener('DOMContentLoaded', () => {

  // === Variables comunes ===
  const createAppForm = document.getElementById('createAppForm');
  const appsList = document.getElementById('appsList');
  const createAppModal = document.getElementById('createAppModal');
  const cancelAppBtn = document.getElementById('cancelAppBtn');
  const newAppBtn = document.getElementById('newAppBtn');

  const changeBtn = document.getElementById('changeBtn');
  const modal = document.getElementById('modal');
  const cancelModal = document.getElementById('cancelModal');
  const saveModal = document.getElementById('saveModal');

  // === Modal crear app ===
  newAppBtn?.addEventListener('click', () => createAppModal.classList.remove('hidden'));
  cancelAppBtn?.addEventListener('click', () => createAppModal.classList.add('hidden'));
  createAppModal?.addEventListener('click', (e) => { if (e.target === createAppModal) createAppModal.classList.add('hidden'); });

  // === Crear app AJAX ===
  createAppForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(createAppForm);

    try {
      const response = await fetch('/account/create_app', { method: 'POST', body: formData });
      const data = await response.json();

      if (data.success) {
        const appBtn = document.createElement('button');
        appBtn.className = 'app-item';
        appBtn.innerHTML = `
          <img src="${data.app.image_url}" alt="App" class="app-img">
          <span class="app-name">${data.app.name}</span>
        `;
        appsList.prepend(appBtn);

        createAppForm.reset();
        createAppModal.classList.add('hidden');
      } else {
        alert(data.message || 'Error al crear la app.');
      }
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al crear la app.');
    }
  });

  // === Modal de contraseña ===
  if (changeBtn && modal && cancelModal && saveModal) {
    changeBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
    cancelModal.addEventListener('click', () => { modal.style.display = 'none'; });
    saveModal.addEventListener('click', () => {
      const newPwd = document.getElementById('newPwd').value;
      const confirm = document.getElementById('confirmPwd').value;
      if (!newPwd || newPwd !== confirm) {
        alert('Las contraseñas no coinciden.');
        return;
      }
      alert('Contraseña actualizada correctamente.');
      modal.style.display = 'none';
    });
  }

  // === Detectar cambios y mostrar botones de guardar ===
  const setupChangeDetection = (selectors, buttonId) => {
    const button = document.getElementById(buttonId);
    if (!button) return;
    document.querySelectorAll(selectors).forEach(el => {
      el.addEventListener('input', () => button.classList.remove('hidden'));
      el.addEventListener('change', () => button.classList.remove('hidden'));
    });
    button.addEventListener('click', () => {
      alert('Cambios guardados.');
      button.classList.add('hidden');
    });
  };

  setupChangeDetection('#email, #name', 'saveProfile');
  setupChangeDetection('#publicProfile, #dataUsage', 'savePrivacy');
  setupChangeDetection('#newsletters, #reminders, #offers', 'saveNotifications');

  // === Botón cerrar sesión ===
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('¿Seguro que quieres cerrar sesión?')) {
        window.location.href = logoutBtn.dataset.href || '/logout';
      }
    });
  }

});
