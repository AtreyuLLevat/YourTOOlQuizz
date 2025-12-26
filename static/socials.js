// static/java/socials.js

class SocialsManager {
  constructor() {
    this.socialFields = ['twitter', 'linkedin', 'github', 'website'];
    this.saveButton = document.getElementById('saveSocials');
    this.feedbackElement = document.getElementById('socialsFeedback');
    
    this.init();
  }
  
  init() {
    // Mostrar botón cuando haya cambios
    this.socialFields.forEach(field => {
      const input = document.getElementById(field);
      if (input) {
        input.addEventListener('input', () => this.showSaveButton());
      }
    });
    
    // Manejar guardado
    if (this.saveButton) {
      this.saveButton.addEventListener('click', () => this.saveSocials());
    }
  }
  
  showSaveButton() {
    if (this.saveButton) {
      this.saveButton.classList.remove('hidden');
    }
  }
  
  hideSaveButton() {
    if (this.saveButton) {
      this.saveButton.classList.add('hidden');
    }
  }
  
  showFeedback(message, type = 'success') {
    if (!this.feedbackElement) return;
    
    this.feedbackElement.textContent = message;
    this.feedbackElement.style.color = type === 'success' ? '#10b981' : '#ef4444';
    this.feedbackElement.style.display = 'block';
    
    setTimeout(() => {
      this.feedbackElement.style.display = 'none';
    }, 3000);
  }
  
  async saveSocials() {
    if (!this.saveButton) return;
    
    // Deshabilitar botón mientras se guarda
    const originalText = this.saveButton.textContent;
    this.saveButton.textContent = 'Guardando...';
    this.saveButton.disabled = true;
    
    try {
      // Recolectar datos
      const socials = {};
      this.socialFields.forEach(field => {
        const input = document.getElementById(field);
        if (input && input.value.trim()) {
          socials[field] = input.value.trim();
        }
      });
      
      // Enviar al servidor
      const response = await fetch('/account/update_socials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ socials }),
        credentials: 'same-origin'
      });
      
      const data = await response.json();
      
      if (data.success) {
        this.showFeedback('✅ Redes sociales actualizadas correctamente');
        this.hideSaveButton();
        
        // Actualizar avatar preview si hay cambios
        const avatarPreview = document.getElementById('avatarPreview');
        if (avatarPreview) {
          // Forzar recarga de la imagen para reflejar cambios
          const currentSrc = avatarPreview.src;
          avatarPreview.src = currentSrc.split('?')[0] + '?' + new Date().getTime();
        }
      } else {
        this.showFeedback(`❌ Error: ${data.message || 'No se pudieron guardar los cambios'}`, 'error');
      }
      
    } catch (error) {
      console.error('Error guardando redes sociales:', error);
      this.showFeedback('❌ Error de conexión. Intenta nuevamente.', 'error');
    } finally {
      // Restaurar botón
      this.saveButton.textContent = originalText;
      this.saveButton.disabled = false;
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  const socialsManager = new SocialsManager();
  
  // También podemos exponerlo globalmente si es necesario
  window.socialsManager = socialsManager;
  
  console.log('✅ SocialsManager inicializado');
});

export default SocialsManager;