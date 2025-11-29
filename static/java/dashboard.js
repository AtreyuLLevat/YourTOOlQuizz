document.addEventListener('DOMContentLoaded', () => {

  // === Formulario crear app ===
  const createAppForm = document.getElementById('createAppForm');
  if(createAppForm){
    createAppForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      // lógica submit aquí
    });
  }

  // === Modal de contraseña ===
  const changeBtn = document.getElementById('changeBtn');
  const modal = document.getElementById('modal');
  const cancelModal = document.getElementById('cancelModal');
  const saveModal = document.getElementById('saveModal');

  if(changeBtn && modal && cancelModal && saveModal){
    changeBtn.addEventListener('click', () => { modal.style.display = 'flex'; });
    cancelModal.addEventListener('click', () => { modal.style.display = 'none'; });
    saveModal.addEventListener('click', () => {
      const newPwd = document.getElementById('newPwd').value;
      const confirm = document.getElementById('confirmPwd').value;
      if(!newPwd || newPwd !== confirm){
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
    if(!button) return;
    document.querySelectorAll(selectors).forEach(el => {
      el.addEventListener('input', () => button.classList.remove('hidden'));
      el.addEventListener('change', () => button.classList.remove('hidden'));
    });
    button.addEventListener('click', () => {
      alert('Cambios guardados.');
      button.classList.add('hidden');
    });
  };

  setupChangeDetection('#email, #name','saveProfile');
  setupChangeDetection('#publicProfile, #dataUsage','savePrivacy');
  setupChangeDetection('#newsletters, #reminders, #offers','saveNotifications');

  // === Botón cerrar sesión ===
  const logoutBtn = document.getElementById('logoutBtn');
  if(logoutBtn){
    logoutBtn.addEventListener('click', () => {
      if(confirm('¿Seguro que quieres cerrar sesión?')) alert('Sesión cerrada.');
    });
  }

});
