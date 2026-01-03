// create_community.js - Versión corregida
document.addEventListener('DOMContentLoaded', function() {
  console.log('✅ create_community.js cargado');
  
  let currentAppId = null;
  let addedMembers = [];
  let membersList = null; // 🔥 DECLARAR LA VARIABLE GLOBALMENTE
  
  // Elementos del DOM - solo los esenciales
  const modal = document.getElementById('createCommunityModal');
  
  // Verificar que el modal existe
  if (!modal) {
    console.log('ℹ️ Modal createCommunityModal no encontrado, será creado dinámicamente');
  }
  
  // Función para inicializar el membersList
  function initMembersList() {
    // Buscar el contenedor de miembros
    membersList = document.getElementById('communityMembersList');
    
    // Si no existe, crearlo dinámicamente
    if (!membersList) {
      console.log('ℹ️ Creando communityMembersList dinámicamente');
      const container = document.createElement('div');
      container.id = 'communityMembersList';
      container.style.cssText = 'margin-top: 10px; min-height: 100px;';
      
      // Buscar un lugar donde insertarlo
      const form = document.getElementById('createCommunityForm');
      if (form) {
        const membersSection = form.querySelector('.field:last-child');
        if (membersSection) {
          membersSection.appendChild(container);
          membersList = container;
        }
      }
    }
    
    return membersList;
  }
  
  // Función para actualizar la lista de miembros - VERSIÓN CORREGIDA
  function updateMembersList() {
    // Asegurarse de que membersList esté inicializado
    if (!membersList) {
      membersList = initMembersList();
    }
    
    if (!membersList) {
      console.error('❌ No se pudo inicializar membersList');
      return;
    }
    
    membersList.innerHTML = '';
    
    if (addedMembers.length === 0) {
      membersList.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #64748b; border: 1px dashed #e2e8f0; border-radius: 8px;">
          <div style="font-size: 24px; margin-bottom: 8px; opacity: 0.5;">👥</div>
          <p>Añade miembros para configurar los roles</p>
          <p style="font-size: 0.85rem; margin-top: 5px;">Puedes añadir miembros después de crear la comunidad</p>
        </div>
      `;
      return;
    }
    
    // Ordenar por rol
    const roleOrder = { owner: 1, admin: 2, moderator: 3, collaborator: 4 };
    addedMembers.sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);
    
    addedMembers.forEach((member, index) => {
      const memberDiv = document.createElement('div');
      memberDiv.className = 'team-member-card';
      memberDiv.style.cssText = `
        margin-bottom: 10px; 
        padding: 12px; 
        border: 1px solid #e2e8f0; 
        border-radius: 8px;
        background: white;
      `;
      
      const roleBadgeColor = {
        owner: '#dc2626',
        admin: '#2563eb',
        moderator: '#059669',
        collaborator: '#7c3aed'
      }[member.role] || '#64748b';
      
      memberDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
            <img src="${member.avatar_url || '/static/images/default-avatar.png'}" 
                 style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
            <div style="flex: 1;">
              <div style="font-weight: 500; color: #1e293b;">${member.name}</div>
              <div style="font-size: 0.85rem; color: #64748b;">${member.email}</div>
              ${member.is_external ? 
                '<span style="font-size: 0.7rem; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px;">Invitación por email</span>' : ''}
            </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 0.85rem; padding: 4px 8px; border-radius: 12px; background: ${roleBadgeColor}20; color: ${roleBadgeColor}; font-weight: 600;">
              ${getRoleLabel(member.role)}
            </span>
            <button type="button" class="remove-member-btn" data-index="${index}" 
                    style="background: #ef4444; color: white; border: none; border-radius: 6px; padding: 6px 10px; cursor: pointer; font-size: 0.85rem;">
              ×
            </button>
          </div>
        </div>
      `;
      
      membersList.appendChild(memberDiv);
    });
    
    // Añadir event listeners para eliminar
    membersList.querySelectorAll('.remove-member-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const index = parseInt(this.dataset.index);
        const member = addedMembers[index];
        
        // No permitir eliminar al owner si es el usuario actual
        if (member.role === 'owner' && member.user_id === window.currentUserData?.id) {
          alert('No puedes eliminar al owner (tú mismo)');
          return;
        }
        
        addedMembers.splice(index, 1);
        updateMembersList();
      });
    });
  }
  
  // Función auxiliar para etiquetas de roles
  function getRoleLabel(role) {
    const labels = {
      owner: '👑 Owner',
      admin: '🛡️ Admin',
      moderator: '⚖️ Moderador',
      collaborator: '🤝 Colaborador'
    };
    return labels[role] || role;
  }
  
  // Función para abrir el modal - VERSIÓN SIMPLIFICADA
  window.openCreateCommunityModal = function(appId) {
    console.log('🔄 Abriendo modal de comunidad para app:', appId);
    
    if (!appId) {
      console.error('❌ No se proporcionó appId');
      showError('No se puede identificar la aplicación');
      return;
    }
    
    currentAppId = appId;
    addedMembers = [];
    
    // Crear modal dinámicamente si no existe
    if (!document.getElementById('createCommunityModal')) {
      createModalStructure();
    }
    
    const modal = document.getElementById('createCommunityModal');
    if (!modal) {
      console.error('❌ No se pudo crear/obtener el modal');
      return;
    }
    
    // Resetear formulario
    const form = document.getElementById('createCommunityForm');
    if (form) {
      form.reset();
    }
    
    // Añadir owner por defecto (usuario actual)
    if (window.currentUserData) {
      addedMembers.push({
        user_id: window.currentUserData.id,
        name: window.currentUserData.name,
        email: window.currentUserData.email,
        avatar_url: window.currentUserData.avatar_url,
        role: 'owner',
        is_external: false
      });
    }
    
    // Inicializar membersList y actualizar
    membersList = initMembersList();
    updateMembersList();
    
    // Mostrar modal
    modal.classList.remove('hidden');
    
    // Enfocar campo de nombre
    setTimeout(() => {
      const nameInput = document.getElementById('communityName');
      if (nameInput) {
        nameInput.focus();
      }
    }, 100);
  };
  
  // Función para crear la estructura del modal
  function createModalStructure() {
    console.log('🏗️ Creando estructura del modal');
    
    const modalHTML = `
    <div id="createCommunityModal" class="modal-backdrop hidden">
      <div class="modal-content" style="max-width: 600px; max-height: 90vh; overflow-y: auto;">
        <h2 style="margin-bottom: 20px; color: #1e293b;">Crear Nueva Comunidad</h2>
        
        <form id="createCommunityForm">
          <!-- Información básica -->
          <div style="margin-bottom: 25px;">
            <h3 style="margin-bottom: 15px; font-size: 1rem; color: #374151;">Información básica</h3>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">
                Nombre de la comunidad *
              </label>
              <input type="text" 
                     id="communityName" 
                     name="name" 
                     required 
                     placeholder="Ej: Desarrolladores de YourToolQuizz"
                     maxlength="200"
                     style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box;">
              <div id="nameError" style="color: #dc2626; font-size: 0.85rem; margin-top: 5px; display: none;"></div>
            </div>
            
            <div style="margin-bottom: 15px;">
              <label style="display: block; margin-bottom: 5px; font-weight: 500; color: #374151;">
                Descripción (opcional)
              </label>
              <textarea id="communityDescription" 
                        name="description" 
                        rows="3" 
                        placeholder="Describe el propósito de esta comunidad..."
                        maxlength="500"
                        style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; box-sizing: border-box; resize: vertical;"></textarea>
            </div>
          </div>
          
          <!-- Equipo y roles - SIMPLIFICADO PARA PRUEBAS -->
          <div style="margin-bottom: 25px; padding: 15px; background: #f8fafc; border-radius: 8px;">
            <h3 style="margin-bottom: 15px; font-size: 1rem; color: #374151;">Organización del equipo</h3>
            
            <div style="color: #64748b; font-size: 0.9rem; margin-bottom: 15px;">
              <p>Por defecto, tú eres el <strong>👑 Owner</strong> de esta comunidad.</p>
              <p>Puedes añadir más miembros después de crear la comunidad.</p>
            </div>
            
            <!-- Contenedor de miembros -->
            <div id="communityMembersContainer">
              <!-- Aquí se cargará la lista de miembros -->
            </div>
          </div>
          
          <!-- Botones -->
          <div style="display: flex; gap: 10px; justify-content: flex-end; margin-top: 25px;">
            <button type="button" id="cancelCommunityBtn" class="modal-btn secondary" style="padding: 10px 20px;">
              Cancelar
            </button>
            <button type="submit" id="submitCommunityBtn" class="modal-btn primary" style="padding: 10px 20px;">
              Crear Comunidad
            </button>
          </div>
        </form>
      </div>
    </div>
    `;
    
    // Insertar en el body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Configurar event listeners básicos
    setupModalListeners();
  }
  
  // Configurar listeners del modal
  function setupModalListeners() {
    const modal = document.getElementById('createCommunityModal');
    const form = document.getElementById('createCommunityForm');
    const cancelBtn = document.getElementById('cancelCommunityBtn');
    const nameInput = document.getElementById('communityName');
    const nameError = document.getElementById('nameError');
    
    if (!modal || !form) return;
    
    // Cerrar modal al hacer clic fuera
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });
    
    // Botón cancelar
    if (cancelBtn) {
      cancelBtn.addEventListener('click', closeModal);
    }
    
    // Validar nombre
    if (nameInput && nameError) {
      nameInput.addEventListener('input', function() {
        const name = this.value.trim();
        
        if (!name) {
          nameError.textContent = 'El nombre es obligatorio';
          nameError.style.display = 'block';
        } else if (name.length < 3) {
          nameError.textContent = 'El nombre debe tener al menos 3 caracteres';
          nameError.style.display = 'block';
        } else {
          nameError.style.display = 'none';
        }
      });
    }
    
    // Enviar formulario
    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      await submitCommunityForm();
    });
  }
  
  // Función para cerrar modal
  function closeModal() {
    const modal = document.getElementById('createCommunityModal');
    if (modal) {
      modal.classList.add('hidden');
    }
    currentAppId = null;
    addedMembers = [];
  }
  
  // Función para enviar formulario
  async function submitCommunityForm() {
    const nameInput = document.getElementById('communityName');
    const descriptionInput = document.getElementById('communityDescription');
    
    if (!nameInput || !currentAppId) {
      showError('Datos incompletos');
      return;
    }
    
    const name = nameInput.value.trim();
    if (!name || name.length < 3) {
      showError('El nombre debe tener al menos 3 caracteres');
      return;
    }
    
    // Preparar datos simplificados (solo nombre y descripción por ahora)
    const formData = {
      name: name,
      description: descriptionInput ? descriptionInput.value.trim() : '',
      members: addedMembers.map(member => ({
        user_id: member.user_id,
        email: member.email,
        role: member.role
      }))
    };
    
    console.log('📤 Enviando datos:', formData);
    
    try {
      // Mostrar loading
      const submitBtn = document.getElementById('submitCommunityBtn');
      const originalText = submitBtn ? submitBtn.textContent : 'Crear';
      if (submitBtn) {
        submitBtn.textContent = 'Creando...';
        submitBtn.disabled = true;
      }
      
      // Usar la ruta existente (la simple) o la nueva
      const endpoint = `/apps/${currentAppId}/create_community`;
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      // Restaurar botón
      if (submitBtn) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
      
      if (data.success) {
        console.log('✅ Comunidad creada:', data);
        showNotification('¡Comunidad creada exitosamente!', 'success');
        closeModal();
        
        // Recargar comunidades en el dashboard
        if (window.renderCommunities && typeof window.renderCommunities === 'function') {
          window.renderCommunities();
        }
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('❌ Error:', error);
      showError('Error al crear la comunidad: ' + error.message);
      
      // Restaurar botón
      const submitBtn = document.getElementById('submitCommunityBtn');
      if (submitBtn) {
        submitBtn.textContent = 'Crear Comunidad';
        submitBtn.disabled = false;
      }
    }
  }
  
  // Funciones auxiliares para notificaciones
  function showError(message) {
    console.error('❌ Error:', message);
    alert(message);
  }
  
  function showNotification(message, type = 'success') {
    console.log('📢 Notificación:', message);
    
    // Crear notificación
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : '#ef4444'};
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 9999;
      animation: slideIn 0.3s ease-out;
    `;
    
    notification.innerHTML = `
      <span>${message}</span>
      <button onclick="this.parentElement.remove()" style="
        background: transparent; 
        border: none; 
        color: white; 
        margin-left: 10px; 
        cursor: pointer;
      ">×</button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 3 segundos
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 3000);
  }
  
  console.log('✅ create_community.js inicializado correctamente');
});