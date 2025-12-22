// avatar.js
document.addEventListener('DOMContentLoaded', function() {
  
  // Elementos DOM
  const avatarInput = document.getElementById('avatarInput');
  const uploadAvatarBtn = document.getElementById('uploadAvatarBtn');
  const removeAvatarBtn = document.getElementById('removeAvatarBtn');
  const avatarPreview = document.getElementById('avatarPreview');
  const avatarFeedback = document.getElementById('avatarFeedback');
  
  // Modal elements
  const avatarSetupModal = document.getElementById('avatarSetupModal');
  const avatarModalInput = document.getElementById('avatarModalInput');
  const avatarModalChooseBtn = document.getElementById('avatarModalChooseBtn');
  const avatarModalPreview = document.getElementById('avatarModalPreview');
  const skipAvatarBtn = document.getElementById('skipAvatarBtn');
  const saveAvatarModalBtn = document.getElementById('saveAvatarModalBtn');
  
  // Variables de estado
  let selectedFile = null;
  
  // ===== FUNCIONES GENERALES =====
  
  function showFeedback(message, isError = false) {
    avatarFeedback.textContent = message;
    avatarFeedback.style.color = isError ? '#dc2626' : '#16a34a';
    avatarFeedback.style.display = 'block';
    
    setTimeout(() => {
      avatarFeedback.style.display = 'none';
    }, 3000);
  }
  
  async function uploadAvatar(file, isModal = false) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const response = await fetch('/account/upload_avatar', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (isModal) {
          // Cerrar modal y actualizar foto principal
          avatarSetupModal.classList.add('hidden');
          avatarPreview.src = data.avatar_url + '?t=' + Date.now();
        } else {
          // Solo actualizar foto principal
          avatarPreview.src = data.avatar_url + '?t=' + Date.now();
        }
        
        showFeedback('Foto actualizada correctamente');
        return true;
      } else {
        showFeedback(data.message || 'Error al subir la foto', true);
        return false;
      }
    } catch (error) {
      console.error('Error:', error);
      showFeedback('Error de red al subir la foto', true);
      return false;
    }
  }
  
  async function removeAvatar() {
    if (!confirm('¿Estás seguro de que quieres eliminar tu foto de perfil?')) {
      return;
    }
    
    try {
      const response = await fetch('/account/remove_avatar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        avatarPreview.src = data.avatar_url + '?t=' + Date.now();
        showFeedback('Foto eliminada correctamente');
      } else {
        showFeedback(data.message || 'Error al eliminar la foto', true);
      }
    } catch (error) {
      console.error('Error:', error);
      showFeedback('Error de red', true);
    }
  }
  
  // ===== EVENT LISTENERS PARA SECCIÓN PRINCIPAL =====
  
  uploadAvatarBtn?.addEventListener('click', () => {
    avatarInput.click();
  });
  
  avatarInput?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        showFeedback('El archivo es demasiado grande (máximo 5MB)', true);
        return;
      }
      
      // Mostrar vista previa
      const reader = new FileReader();
      reader.onload = function(e) {
        avatarPreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
      
      // Subir automáticamente
      uploadAvatar(file);
    }
  });
  
  removeAvatarBtn?.addEventListener('click', removeAvatar);
  
  // ===== EVENT LISTENERS PARA MODAL =====
  
  // Mostrar modal solo si no tiene avatar (condición manejada por Flask)
  // La lógica de cuándo mostrar el modal está en el template con la condición {{ 'hidden' if usuario.avatar_url else '' }}
  
  avatarModalChooseBtn?.addEventListener('click', () => {
    avatarModalInput.click();
  });
  
  avatarModalInput?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
      // Validar tamaño
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es demasiado grande (máximo 5MB)');
        return;
      }
      
      selectedFile = file;
      
      // Mostrar vista previa en modal
      const reader = new FileReader();
      reader.onload = function(e) {
        avatarModalPreview.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
  
  skipAvatarBtn?.addEventListener('click', () => {
    avatarSetupModal.classList.add('hidden');
  });
  
  saveAvatarModalBtn?.addEventListener('click', async () => {
    if (selectedFile) {
      const success = await uploadAvatar(selectedFile, true);
      if (success) {
        avatarSetupModal.classList.add('hidden');
      }
    } else {
      // Si no seleccionó nada, usar avatar por defecto y cerrar modal
      avatarSetupModal.classList.add('hidden');
    }
  });
  
  // Cerrar modal al hacer clic fuera
  avatarSetupModal?.addEventListener('click', (e) => {
    if (e.target === avatarSetupModal) {
      avatarSetupModal.classList.add('hidden');
    }
  });
  
  console.log('✅ avatar.js cargado');
});