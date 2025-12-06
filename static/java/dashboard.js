document.addEventListener('DOMContentLoaded', () => {

  // === Formulario crear app ===
  const createAppForm = document.getElementById('createAppForm');
  if (createAppForm) {
    createAppForm.addEventListener('submit', async (e) => {
      // Si quieres enviar con JS sin recargar, usa fetch:
      e.preventDefault();

      const formData = new FormData(createAppForm);

      try {
        const response = await fetch('/account', {
          method: 'POST',
          body: formData
        });

        if (response.redirected) {
          // Redirige tras POST
          window.location.href = response.url;
        } else {
          // Mensaje de éxito opcional si no hay redirect
          alert('App creada correctamente');
          createAppForm.reset();
          document.getElementById('createAppModal').classList.add('hidden');
        }

      } catch (err) {
        console.error(err);
        alert('Ocurrió un error al crear la app.');
      }
    });
  }

  // === Modal de contraseña ===
  const changeBtn = document.getElementById('changeBtn');
  const modal = document.getElementById('modal');
  const cancelModal = document.getElementById('cancelModal');
  const saveModal = document.getElementById('saveModal');

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

  // === Mostrar botones de guardar solo al cambiar algo ===
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

  // === Modal crear app ===
  const newAppBtn = document.getElementById('newAppBtn');
  const createAppModal = document.getElementById('createAppModal');
  const cancelAppBtn = document.getElementById('cancelAppBtn');

  newAppBtn?.addEventListener('click', () => {
    createAppModal.classList.remove('hidden');
  });

  cancelAppBtn?.addEventListener('click', () => {
    createAppModal.classList.add('hidden');
  });

  createAppModal?.addEventListener('click', (e) => {
    if (e.target === createAppModal) createAppModal.classList.add('hidden');
  });

});
