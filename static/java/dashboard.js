document.addEventListener('DOMContentLoaded', () => {
  /* ======================================================
     ESTADO GLOBAL
  ====================================================== */
  let currentApp = null;
  window.currentApp = null;
  let currentUser = null; // Usuario actual

  /* ======================================================
     VARIABLES
  ====================================================== */
  const createAppForm = document.getElementById('createAppForm');
  const appsList = document.getElementById('appsList');
  const createAppModal = document.getElementById('createAppModal');
  const cancelAppBtn = document.getElementById('cancelAppBtn');
  const newAppBtn = document.getElementById('newAppBtn');
  const userSearchInput = document.getElementById('userSearch');
  const userRoleSelect = document.getElementById('userRole');
  const userSearchResults = document.getElementById('userSearchResults');
  const addUserBtn = document.getElementById('addUserBtn');
  const teamContainer = document.getElementById('team-members-container');
  const appDetailModal = document.getElementById('appDetailModal');
  const closeAppDetail = document.getElementById('closeAppDetail');
  const addCommunityBtn = document.getElementById('addCommunityBtn');
  const addCommunityForm = document.getElementById('addCommunityForm');
  const saveCommunityBtn = document.getElementById('saveCommunityBtn');
  const communityNameInput = document.getElementById('communityNameInput');
  const saveAppChangesBtn = document.getElementById('save-app-changes');
  const changeLogoBtn = document.getElementById('change-logo-btn');
  const appLogoInput = document.getElementById('app-logo-input');
  const deleteAppBtnContainer = document.getElementById('delete-app-btn-container');

  // Obtener usuario actual desde variable global
  try {
    if (typeof window.currentUserData !== 'undefined') {
      currentUser = window.currentUserData;
      console.log('✅ Usuario actual cargado:', currentUser);
    }
  } catch (e) {
    console.error('Error obteniendo usuario actual:', e);
  }

  /* ======================================================
     FUNCIONES AUXILIARES
  ====================================================== */
  function showError(message) {
    console.error('❌ Error:', message);
    alert(message);
  }

  function showSuccess(message) {
    console.log('✅ Éxito:', message);
    alert(message);
  }

  function getSocialEmoji(network) {
    const emojis = {
      twitter: '🐦',
      linkedin: '🔗',
      github: '🐙'
    };
    return emojis[network.toLowerCase()] || '';
  }

  function getDefaultAvatar() {
    return 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz48c3ZnIHdpZHRoPSI1MCIgaGVpZ2h0PSI1MCIgdmlld0JveD0iMCAwIDUwIDUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxjaXJjbGUgY3g9IjI1IiBjeT0iMjUiIHI9IjI1IiBmaWxsPSIjY2NjIi8+PC9zdmc+';
  }

  /* ======================================================
     BÚSQUEDA DE USUARIOS PARA EQUIPO
  ====================================================== */
  let searchTimeout;
  let currentSearchResults = [];

  userSearchInput?.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      userSearchResults.style.display = 'none';
      return;
    }

    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`/search_users?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
        
        const users = await res.json();
        currentSearchResults = users;

        if (!users || users.length === 0) {
          userSearchResults.style.display = 'none';
          return;
        }

        userSearchResults.innerHTML = '';
        users.forEach(user => {
          const div = document.createElement('div');
          div.className = 'user-search-result';
          div.style.cssText = 'padding: 8px; cursor: pointer; border-bottom: 1px solid #e2e8f0;';
          
          div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
              ${user.avatar_url ? `<img src="${user.avatar_url}" style="width:32px;height:32px;border-radius:50%;">` : ''}
              <div>
                <strong>${user.name || 'Sin nombre'}</strong>
                <div style="font-size: 0.85rem; color: #64748b;">${user.email || 'Sin email'}</div>
              </div>
            </div>
          `;
          
          div.addEventListener('click', () => {
            addTeamMember(user);
            userSearchInput.value = '';
            userSearchResults.style.display = 'none';
          });
          
          userSearchResults.appendChild(div);
        });
        userSearchResults.style.display = 'block';
      } catch (err) {
        console.error('Error buscando usuarios:', err);
        userSearchResults.style.display = 'none';
      }
    }, 300);
  });

  function addTeamMember(user) {
    const role = userRoleSelect.value;
    const memberId = `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const socials = user.socials || {};
    const socialLinks = [];
    
    if (socials.twitter) {
      socialLinks.push(`<a href="${socials.twitter}" target="_blank" style="color: #1da1f2;">Twitter</a>`);
    }
    if (socials.linkedin) {
      socialLinks.push(`<a href="${socials.linkedin}" target="_blank" style="color: #0077b5;">LinkedIn</a>`);
    }
    if (socials.github) {
      socialLinks.push(`<a href="${socials.github}" target="_blank" style="color: #333;">GitHub</a>`);
    }
    
    const memberDiv = document.createElement('div');
    memberDiv.className = 'team-member-entry';
    memberDiv.dataset.memberId = memberId;
    memberDiv.dataset.userId = user.id || '';
    
    memberDiv.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px; background: #f8fafc; border-radius: 8px; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
          ${user.avatar_url ? `<img src="${user.avatar_url}" style="width:36px;height:36px;border-radius:50%;">` : ''}
          <div style="flex: 1;">
            <div style="font-weight: 500;">${user.name || 'Miembro sin nombre'}</div>
            <div style="font-size: 0.85rem; color: #64748b;">${user.email || ''} • ${role}</div>
            ${socialLinks.length > 0 ? 
              `<div style="display: flex; gap: 8px; margin-top: 4px; font-size: 0.8rem;">
                ${socialLinks.join(' • ')}
              </div>` : ''
            }
          </div>
        </div>
        <button type="button" class="remove-member-btn" style="background: #ef4444; color: white; border: none; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
          Eliminar
        </button>
      </div>
      <input type="hidden" name="team_members[${memberId}][name]" value="${user.name || ''}">
      <input type="hidden" name="team_members[${memberId}][role]" value="${role}">
      <input type="hidden" name="team_members[${memberId}][avatar_url]" value="${user.avatar_url || ''}">
      <input type="hidden" name="team_members[${memberId}][user_id]" value="${user.id || ''}">
      <input type="hidden" name="team_members[${memberId}][socials]" value='${JSON.stringify(socials)}'>
    `;
    
    memberDiv.querySelector('.remove-member-btn').onclick = () => memberDiv.remove();
    teamContainer.appendChild(memberDiv);
  }

  addUserBtn?.addEventListener('click', () => {
    const query = userSearchInput.value.trim();
    
    if (query && currentSearchResults.length > 0) {
      addTeamMember(currentSearchResults[0]);
      userSearchInput.value = '';
      userSearchResults.style.display = 'none';
    } else if (query) {
      const user = {
        id: null,
        name: query,
        email: '',
        avatar_url: ''
      };
      addTeamMember(user);
      userSearchInput.value = '';
    }
  });

  /* ======================================================
     MODAL CREAR APP
  ====================================================== */
  newAppBtn?.addEventListener('click', () => {
    createAppModal.classList.remove('hidden');
    userSearchInput.value = '';
    userSearchResults.style.display = 'none';
    teamContainer.innerHTML = '';
  });
  
  cancelAppBtn?.addEventListener('click', () => createAppModal.classList.add('hidden'));
  createAppModal?.addEventListener('click', e => {
    if (e.target === createAppModal) createAppModal.classList.add('hidden');
  });

  /* ======================================================
     CREAR APP
  ====================================================== */
  createAppForm?.addEventListener('submit', async e => {
    e.preventDefault();

    try {
      const formData = new FormData(createAppForm);
      const members = [];

      document.querySelectorAll('.team-member-entry').forEach(div => {
        const inputs = div.querySelectorAll('input[type="hidden"]');
        const memberData = {};
        inputs.forEach(input => {
          const name = input.name.match(/\[([^\]]+)\]/g);
          if (name && name.length >= 2) {
            const key = name[1].replace(/[\[\]]/g, '');
            memberData[key] = input.value;
          }
        });
        if (memberData.name) {
          members.push(memberData);
        }
      });

      formData.append('members_json', JSON.stringify(members));

      const res = await fetch('/account/create_app', { 
        method: 'POST', 
        body: formData 
      });
      
      if (!res.ok) throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
      
      const data = await res.json();
      
      if (!data.success) throw new Error(data.message || 'Error al crear la app');

      if (!data.app || !data.app.id) {
        throw new Error('La app fue creada pero no se recibió un ID válido');
      }

      console.log('✅ App creada con ID:', data.app.id);

      const btn = document.createElement('button');
      btn.className = 'app-item';
      btn.dataset.appId = data.app.id.toString();
      
      const imageUrl = data.app.image_url || '/static/images/app-placeholder.png';
      
      btn.innerHTML = `
        <img src="${imageUrl}" class="app-img" alt="${data.app.name}">
        <span class="app-name">${data.app.name}</span>
      `;
      
      btn.addEventListener('click', function() {
        const id = this.dataset.appId;
        if (id) {
          openAppDetail(id);
        } else {
          showError('Esta aplicación no tiene un ID válido');
        }
      });
      
      if (appsList) {
        if (appsList.firstChild) {
          appsList.insertBefore(btn, appsList.firstChild);
        } else {
          appsList.appendChild(btn);
        }
      }
      
      createAppForm.reset();
      teamContainer.innerHTML = '';
      createAppModal.classList.add('hidden');
      
      showSuccess('¡App creada exitosamente!');
      
    } catch (err) {
      console.error('Error al crear app:', err);
      showError(err.message || 'Error de red al crear la app');
    }
  });

  /* ======================================================
     FETCH APP - MEJORADO CON MANEJO DE ERRORES
  ====================================================== */
  async function fetchAppData(appId) {
    console.log(`🔍 Solicitando datos para app ID: ${appId}`);
    
    if (!appId || appId === 'undefined' || appId === 'null') {
      throw new Error('ID de aplicación no válido');
    }
    
    try {
      const response = await fetch(`/account/apps/${appId}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error al obtener datos de la app');
      }
      
      data.app.reviews = data.app.reviews || [];
      data.app.communities = data.app.communities || [];
      data.app.team_members = data.app.team_members || [];
      
      console.log('✅ Datos de app obtenidos:', data.app.name);
      return data.app;
      
    } catch (error) {
      console.error('❌ Error en fetchAppData:', error);
      throw error;
    }
  }



function initAppDetailTabs() {
  if (!appDetailModal) return;

  const tabButtons = appDetailModal.querySelectorAll('.tab-btn');
  const tabContents = appDetailModal.querySelectorAll('.tab-content');

  function showTab(tabName) {
    // Reset botones
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.add('hidden'));

    // Activar botón
    const activeBtn = appDetailModal.querySelector(
      `.tab-btn[data-tab="${tabName}"]`
    );
    const activeContent = appDetailModal.querySelector(
      `#${tabName}`
    );

    if (!activeBtn || !activeContent) return;

    activeBtn.classList.add('active');
    activeContent.classList.remove('hidden');

    // 🔁 Cargas bajo demanda
    if (tabName === 'team') {
      renderTeamMembers();
    }

    if (tabName === 'communities') {
      renderCommunities();
    }

    if (tabName === 'reviews') {
      renderReviewsAdmin();
    }
  }

  // Click listeners
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      if (tabName) {
        showTab(tabName);
      }
    });
  });

  // 👉 Tab inicial por defecto
  showTab('general');
}

/* ======================================================
   RELLENAR MODAL APP (BASE PARA TABS)
====================================================== */
function fillAppDetailModal(app) {
  if (!appDetailModal || !app) return;

  /* ===== DATOS BÁSICOS ===== */

  const modalLogoImg = document.getElementById('app-logo');
  const nameInput = document.getElementById('app-name-input');
  const descriptionInput = document.getElementById('app-description-input');
  const dateInput = document.getElementById('app-date-input');
  const themeInput = document.getElementById('app-theme-input');

  if (modalLogoImg) {
    modalLogoImg.src = app.image_url || '/static/images/app-placeholder.png';
  }

  if (nameInput) nameInput.value = app.name || '';
  if (descriptionInput) descriptionInput.value = app.description || '';

  if (dateInput) {
    dateInput.value = app.creation_date
      ? app.creation_date.split('T')[0]
      : '';
  }

  if (themeInput) themeInput.value = app.theme || 'General';

  /* ===== REVIEWS ===== */
  renderReviewsAdmin();

  /* ===== COMUNIDADES ===== */
  renderCommunities();

  /* ===== TEAM ===== */
  renderTeamMembers();
}

  /* ======================================================
     ABRIR MODAL APP - VERSIÓN MEJORADA
  ====================================================== */
  async function openAppDetail(appId) {
    console.log(`📱 Abriendo app con ID: ${appId}`);
    
    if (!appId || appId === 'undefined' || appId === 'null') {
      showError('ID de aplicación no válido');
      return;
    }
    
    try {
      currentApp = await fetchAppData(appId);
      window.currentApp = currentApp;
      
      if (!appDetailModal) {
        showError('No se puede mostrar la app - modal no encontrado');
        return;
      }
      
      appDetailModal.dataset.appId = appId;
      
      document.getElementById('app-name-input').value = currentApp.name || '';
      document.getElementById('app-description-input').value = currentApp.description || '';
      document.getElementById('app-date-input').value = currentApp.creation_date ? 
        new Date(currentApp.creation_date).toISOString().split('T')[0] : '';
      document.getElementById('app-theme-input').value = currentApp.theme || 'General';
      document.getElementById('app-logo').src = currentApp.image_url || '/static/images/app-placeholder.png';
      


      
      // Agregar botón de eliminar si el usuario es el dueño
      if (deleteAppBtnContainer) {
        deleteAppBtnContainer.innerHTML = '';
        
        // Verificar si el usuario actual es el dueño de la app
        const appOwnerId = currentApp.owner_id;
        const userId = currentUser?.id || currentUser?.user_id;
        
        if (userId && appOwnerId && parseInt(appOwnerId) === parseInt(userId)) {
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'btn danger';
          deleteBtn.id = 'delete-app-btn';
          deleteBtn.textContent = 'Eliminar Aplicación';
          deleteBtn.addEventListener('click', () => deleteApp(appId));
          deleteAppBtnContainer.appendChild(deleteBtn);
        }
      }
      
      appDetailModal.classList.remove('hidden');
      initAppDetailTabs();
      fillAppDetailModal(currentApp);

      console.log('✅ Modal abierto correctamente');
      
    } catch (error) {
      console.error('❌ Error al abrir app:', error);
      showError('No se pudo cargar la aplicación: ' + error.message);
    }
  }
  
  function updateAppBasicInfo() {
    if (!appDetailModal || !currentApp) return;
    
    const elements = {
      name: appDetailModal.querySelector('.app-name'),
      description: appDetailModal.querySelector('.app-description'),
      date: appDetailModal.querySelector('.app-date'),
      theme: appDetailModal.querySelector('.app-theme')
    };
    
    if (elements.name) elements.name.textContent = currentApp.name || '---';
    if (elements.description) elements.description.textContent = currentApp.description || '---';
    if (elements.date) elements.date.textContent = currentApp.creation_date || '---';
    if (elements.theme) elements.theme.textContent = "Tema: " + (currentApp.theme || "General");

    const logoImg = document.getElementById("app-logo");
    if (logoImg) {
      logoImg.src = currentApp.image_url || '/static/images/app-placeholder.png';
    }
  }

  
  /* ======================================================
     ELIMINAR APLICACIÓN
  ====================================================== */
  async function deleteApp(appId) {
    if (!confirm('¿Estás seguro de eliminar esta aplicación? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      const res = await fetch(`/account/delete_app/${appId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Error al eliminar');

      const appButton = document.querySelector(`.app-item[data-app-id="${appId}"]`);
      if (appButton) appButton.remove();
      
      if (appDetailModal) {
        appDetailModal.classList.add('hidden');
        currentApp = null;
        window.currentApp = null;
      }
      
      showSuccess('Aplicación eliminada correctamente');
      
    } catch (error) {
      console.error('❌ Error eliminando app:', error);
      showError('No se pudo eliminar la aplicación: ' + error.message);
    }
  }

  /* ======================================================
     EDITAR MIEMBRO DEL EQUIPO
  ====================================================== */
/* ======================================================
   EDITAR MIEMBRO DEL EQUIPO - CON SELECT DE ROLES
====================================================== */
function editTeamMember(memberId, currentRole = '') {
  // Crear modal para seleccionar rol
  const modal = document.createElement('div');
  modal.id = 'edit-role-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 24px;
      border-radius: 12px;
      max-width: 320px;
      width: 90%;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    ">
      <h3 style="
        margin-bottom: 16px;
        color: #1e293b;
        font-size: 18px;
        font-weight: 600;
      ">Cambiar rol</h3>
      
      <select id="role-select" style="
        width: 100%;
        padding: 10px 12px;
        border: 1px solid #cbd5e1;
        border-radius: 6px;
        font-size: 14px;
        margin-bottom: 20px;
        background-color: white;
        color: #1e293b;
      ">
        <option value="" ${!currentRole ? 'selected' : ''}>Seleccionar rol...</option>
        <option value="Desarrollador" ${currentRole === 'Desarrollador' ? 'selected' : ''}>Desarrollador</option>
        <option value="Diseñador" ${currentRole === 'Diseñador' ? 'selected' : ''}>Diseñador</option>
        <option value="Manager" ${currentRole === 'Manager' ? 'selected' : ''}>Manager</option>
        <option value="Tester" ${currentRole === 'Tester' ? 'selected' : ''}>Tester</option>
        <option value="Soporte" ${currentRole === 'Soporte' ? 'selected' : ''}>Soporte</option>
        <option value="Otro" ${currentRole === 'Otro' ? 'selected' : ''}>Otro</option>
      </select>
      
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="cancel-edit-role" style="
          padding: 8px 20px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background: white;
          color: #475569;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        ">
          Cancelar
        </button>
        <button id="confirm-edit-role" style="
          padding: 8px 20px;
          border: none;
          border-radius: 6px;
          background: #3b82f6;
          color: white;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        ">
          Guardar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Estilos para hover
  const cancelBtn = modal.querySelector('#cancel-edit-role');
  const confirmBtn = modal.querySelector('#confirm-edit-role');
  const select = modal.querySelector('#role-select');
  
  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.background = '#f8fafc';
  });
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.background = 'white';
  });
  
  confirmBtn.addEventListener('mouseenter', () => {
    confirmBtn.style.background = '#2563eb';
  });
  confirmBtn.addEventListener('mouseleave', () => {
    confirmBtn.style.background = '#3b82f6';
  });
  
  // Event listeners
  cancelBtn.addEventListener('click', () => {
    modal.remove();
  });
  
  confirmBtn.addEventListener('click', () => {
    const newRole = select.value.trim();
    
    if (!newRole) {
      alert('Por favor selecciona un rol');
      return;
    }
    
    if (newRole === currentRole) {
      modal.remove();
      return;
    }
    
    // Enviar solicitud para cambiar el rol
    updateTeamMemberRole(memberId, newRole, currentRole);
    modal.remove();
  });
  
  // Cerrar con Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  // Cerrar al hacer clic fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Enfocar el select al abrir
  select.focus();
}

/* ======================================================
   ACTUALIZAR ROL DEL MIEMBRO (función auxiliar)
====================================================== */
function updateTeamMemberRole(memberId, newRole, oldRole) {
  fetch(`/account/team_member/${memberId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: newRole })
  })
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => {
    if (!data.success) {
      showError(data.message || 'Error al actualizar el rol');
      return;
    }

    // Actualizar UI
    const card = document.querySelector(`[data-member-id="${memberId}"]`);
    if (card) {
      const roleElem = card.querySelector('.team-role');
      if (roleElem) roleElem.textContent = newRole;

      const editBtn = card.querySelector('.edit-member-btn');
      if (editBtn) editBtn.dataset.role = newRole;
    }

    // Actualizar estado local
    const member = currentApp.team_members.find(m => String(m.id) === String(memberId));
    if (member) member.role = newRole;

    showSuccess('Rol actualizado correctamente');
  })
  .catch(err => {
    console.error('updateTeamMemberRole error:', err);
    showError('Error de red al actualizar el rol');
  });
}


function removeTeamMember(memberId, memberName = '') {
  if (!confirm(`¿Eliminar a ${memberName || 'este miembro'} del equipo?`)) return;

  fetch(`/account/team_member/${memberId}`, {
    method: 'DELETE'
  })
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => {
    if (!data.success) {
      showError(data.message || 'Error al eliminar el miembro');
      return;
    }

    // UI
    const card = document.querySelector(`[data-member-id="${memberId}"]`);
    if (card) card.remove();

    // Estado local
    currentApp.team_members = currentApp.team_members.filter(
      m => String(m.id) !== String(memberId)
    );

    if (currentApp.team_members.length === 0) {
      renderTeamMembers();
    }

    showSuccess('Miembro eliminado correctamente');
  })
  .catch(err => {
    console.error('removeTeamMember error:', err);
    showError('Error de red al eliminar el miembro');
  });
}


  /* ======================================================
     RENDERIZAR MIEMBROS DEL EQUIPO (CON BOTONES)
  ====================================================== */
/* ======================================================
   RENDERIZAR MIEMBROS DEL EQUIPO (CON BOTÓN PARA AÑADIR)
====================================================== */
function renderTeamMembers() {
  const list = document.getElementById('team-members-list');
  if (!list) return;

  list.innerHTML = '';

  const appOwnerId = String(currentApp.owner_id);
  const userId = String(currentUser?.id || currentUser?.user_id || '');
  const isOwner = appOwnerId && userId && appOwnerId === userId;

  // Cabecera con botón de añadir
  const header = document.createElement('div');
  header.className = 'team-header';
  header.innerHTML = `
    <h3 style="margin-bottom: 15px; font-size: 1.1rem;">Miembros del Equipo</h3>
    ${isOwner ? `<button id="add-team-member-btn" class="btn-small primary">+ Añadir Miembro</button>` : ''}
  `;
  list.appendChild(header);

  // Contenedor para miembros
  const membersContainer = document.createElement('div');
  membersContainer.className = 'team-members-container';
  membersContainer.style.cssText = 'display: flex; flex-direction: column; gap: 16px; margin-top: 16px;';

  if (!currentApp?.team_members?.length) {
    membersContainer.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #64748b; background: #f8fafc; border-radius: 12px; border: 1px dashed #e2e8f0;">
        <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">👥</div>
        <h4 style="color: #475569; margin-bottom: 8px; font-weight: 600;">Sin miembros en el equipo</h4>
        <p>Agrega miembros para colaborar en esta aplicación.</p>
      </div>
    `;
    list.appendChild(membersContainer);
    return;
  }

  currentApp.team_members.forEach(member => {
    const card = document.createElement('div');
    card.className = 'team-member-card';
    card.dataset.memberId = member.id;

    let socialHtml = '';
    if (member.socials) {
      Object.entries(member.socials).forEach(([network, url]) => {
        if (url) {
          socialHtml += `<a href="${url}" target="_blank" class="team-social-link">${network}</a>`;
        }
      });
    }

    const actionsHtml = isOwner ? `
      <div class="team-member-actions">
        <button class="btn-small edit-member-btn"
          data-member-id="${member.id}"
          data-role="${member.role || ''}">
          Editar Rol
        </button>
        <button class="btn-small danger remove-member-btn"
          data-member-id="${member.id}"
          data-name="${member.name || ''}">
          Eliminar
        </button>
      </div>
    ` : '';

    card.innerHTML = `
      <div class="team-member-info">
        <img src="${member.avatar_url || getDefaultAvatar()}" class="team-avatar">
        <div>
          <div class="team-name">${member.name || 'Sin nombre'}</div>
          <div class="team-role">${member.role || 'Sin rol'}</div>
          <div class="team-socials">${socialHtml}</div>
        </div>
      </div>
      ${actionsHtml}
    `;

    membersContainer.appendChild(card);
  });

  list.appendChild(membersContainer);

  // Configurar listeners para botones de edición/eliminación
  membersContainer.querySelectorAll('.edit-member-btn').forEach(btn => {
    btn.onclick = () => editTeamMember(btn.dataset.memberId, btn.dataset.role);
  });

  membersContainer.querySelectorAll('.remove-member-btn').forEach(btn => {
    btn.onclick = () => removeTeamMember(btn.dataset.memberId, btn.dataset.name);
  });

  // Configurar listener para el botón de añadir miembro
  const addBtn = document.getElementById('add-team-member-btn');
  if (addBtn) {
    addBtn.onclick = () => openAddTeamMemberModal();
  }
}

/* ======================================================
   MODAL PARA AÑADIR NUEVO MIEMBRO DEL EQUIPO
====================================================== */
function openAddTeamMemberModal() {
  // Crear modal para añadir miembro
  const modal = document.createElement('div');
  modal.id = 'add-team-member-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 28px;
      border-radius: 14px;
      max-width: 450px;
      width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    ">
      <h3 style="
        margin-bottom: 20px;
        color: #1e293b;
        font-size: 20px;
        font-weight: 700;
      ">Añadir miembro al equipo</h3>
      
      <!-- Búsqueda de usuario -->
      <div style="margin-bottom: 20px;">
        <label style="display: block; font-weight: 500; margin-bottom: 8px; color: #374151;">
          Buscar usuario
        </label>
        <div style="position: relative;">
          <input type="text" id="add-member-search" 
            placeholder="Nombre o email del usuario"
            style="
              width: 100%;
              padding: 12px 16px;
              border: 1px solid #d1d5db;
              border-radius: 8px;
              font-size: 14px;
              transition: all 0.2s ease;
            "
          >
          <div id="add-member-results" 
            style="
              position: absolute;
              top: 100%;
              left: 0;
              right: 0;
              background: white;
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              margin-top: 4px;
              max-height: 200px;
              overflow-y: auto;
              box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
              display: none;
              z-index: 100;
            "
          ></div>
        </div>
      </div>
      
      <!-- Información del miembro seleccionado -->
      <div id="selected-member-info" style="
        margin-bottom: 20px;
        padding: 16px;
        background: #f9fafb;
        border-radius: 8px;
        border: 1px dashed #d1d5db;
        display: none;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div id="selected-member-avatar" style="
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: #e5e7eb;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6b7280;
            font-size: 18px;
          "></div>
          <div>
            <div id="selected-member-name" style="
              font-weight: 600;
              color: #111827;
              font-size: 15px;
            "></div>
            <div id="selected-member-email" style="
              font-size: 13px;
              color: #6b7280;
            "></div>
          </div>
        </div>
      </div>
      
      <!-- Campo para rol -->
      <div style="margin-bottom: 24px;">
        <label style="display: block; font-weight: 500; margin-bottom: 8px; color: #374151;">
          Rol en el equipo
        </label>
        <select id="add-member-role" style="
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
          background-color: white;
          color: #1e293b;
        ">
          <option value="Desarrollador">Desarrollador</option>
          <option value="Diseñador">Diseñador</option>
          <option value="Manager">Manager</option>
          <option value="Tester">Tester</option>
          <option value="Soporte">Soporte</option>
          <option value="Otro">Otro</option>
        </select>
      </div>
      
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="cancel-add-member" style="
          padding: 10px 24px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          color: #374151;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        ">
          Cancelar
        </button>
        <button id="confirm-add-member" style="
          padding: 10px 24px;
          border: none;
          border-radius: 8px;
          background: #2563eb;
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s ease;
          opacity: 0.5;
          cursor: not-allowed;
        " disabled>
          Añadir al equipo
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Variables de estado
  let selectedUser = null;
  let searchTimeout = null;
  
  // Referencias a elementos del modal
  const searchInput = modal.querySelector('#add-member-search');
  const searchResults = modal.querySelector('#add-member-results');
  const selectedInfo = modal.querySelector('#selected-member-info');
  const roleSelect = modal.querySelector('#add-member-role');
  const confirmBtn = modal.querySelector('#confirm-add-member');
  const cancelBtn = modal.querySelector('#cancel-add-member');
  
  // Función para buscar usuarios
  async function searchUsers(query) {
    if (query.length < 2) {
      searchResults.style.display = 'none';
      return;
    }
    
    try {
      const res = await fetch(`/search_users?q=${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      
      const users = await res.json();
      searchResults.innerHTML = '';
      
      if (!users || users.length === 0) {
        searchResults.style.display = 'none';
        return;
      }
      
      users.forEach(user => {
        const div = document.createElement('div');
        div.className = 'user-search-result';
        div.style.cssText = `
          padding: 12px 16px;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
          transition: background 0.2s ease;
          display: flex;
          align-items: center;
          gap: 12px;
        `;
        
        div.innerHTML = `
          ${user.avatar_url ? 
            `<img src="${user.avatar_url}" style="width:32px;height:32px;border-radius:50%;">` : 
            `<div style="width:32px;height:32px;border-radius:50%;background:#e5e7eb;display:flex;align-items:center;justify-content:center;color:#6b7280;font-size:14px;">
              ${user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>`
          }
          <div style="flex: 1;">
            <div style="font-weight: 500; color: #111827; font-size: 14px;">
              ${user.name || 'Sin nombre'}
            </div>
            <div style="font-size: 13px; color: #6b7280;">
              ${user.email || 'Sin email'}
            </div>
          </div>
        `;
        
        div.addEventListener('click', () => {
          selectUser(user);
          searchResults.style.display = 'none';
          searchInput.value = user.name || user.email || '';
        });
        
        div.addEventListener('mouseenter', () => {
          div.style.background = '#f9fafb';
        });
        
        div.addEventListener('mouseleave', () => {
          div.style.background = 'white';
        });
        
        searchResults.appendChild(div);
      });
      
      searchResults.style.display = 'block';
    } catch (err) {
      console.error('Error buscando usuarios:', err);
      searchResults.style.display = 'none';
    }
  }
  
  // Función para seleccionar usuario
  function selectUser(user) {
    selectedUser = user;
    
    // Mostrar información del usuario seleccionado
    const avatarDiv = selectedInfo.querySelector('#selected-member-avatar');
    const nameDiv = selectedInfo.querySelector('#selected-member-name');
    const emailDiv = selectedInfo.querySelector('#selected-member-email');
    
    if (user.avatar_url) {
      avatarDiv.innerHTML = `<img src="${user.avatar_url}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
    } else {
      avatarDiv.innerHTML = user.name ? user.name.charAt(0).toUpperCase() : 'U';
      avatarDiv.style.background = '#3b82f6';
      avatarDiv.style.color = 'white';
    }
    
    nameDiv.textContent = user.name || 'Usuario sin nombre';
    emailDiv.textContent = user.email || 'Sin email';
    
    selectedInfo.style.display = 'block';
    
    // Habilitar botón de confirmación
    confirmBtn.disabled = false;
    confirmBtn.style.opacity = '1';
    confirmBtn.style.cursor = 'pointer';
  }
  
  // Event listeners
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.trim();
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      searchUsers(query);
    }, 300);
  });
  
  searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length >= 2) {
      searchUsers(searchInput.value.trim());
    }
  });
  
  // Cerrar resultados al hacer clic fuera
  document.addEventListener('click', (e) => {
    if (!searchResults.contains(e.target) && e.target !== searchInput) {
      searchResults.style.display = 'none';
    }
  });
  
  // Botón cancelar
  cancelBtn.addEventListener('click', () => {
    modal.remove();
  });
  
  // Botón confirmar
 confirmBtn.addEventListener('click', async () => {
  if (!selectedUser) return;
  
  try {
    const response = await fetch(`/account/apps/${currentApp.id}/add_team_member_two`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: selectedUser.id,
        role: roleSelect.value,
        name: selectedUser.name,
        avatar_url: selectedUser.avatar_url,
        socials: selectedUser.socials || {}
      })
    });
    
    // Primero verificar si la respuesta es JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      const data = await response.json();
      
      if (data.success) {
        // Actualizar la app localmente
        currentApp.team_members.push(data.member);
        
        // Renderizar equipo actualizado
        renderTeamMembers();
        
        // Cerrar modal
        modal.remove();
        
        // Mostrar notificación
        showNotification('Miembro añadido correctamente al equipo', 'success');
      } else {
        throw new Error(data.message || 'Error al añadir miembro');
      }
    } else {
      // Si no es JSON, probablemente sea un error HTML
      const text = await response.text();
      console.error("Server returned HTML:", text.substring(0, 200));
      
      if (response.status === 404) {
        throw new Error('La función de añadir miembros no está disponible temporalmente');
      } else if (response.status === 403) {
        throw new Error('No tienes permisos para añadir miembros');
      } else {
        throw new Error('Error del servidor: ' + response.statusText);
      }
    }
    
  } catch (error) {
    console.error('Error añadiendo miembro:', error);
    showError('Error al añadir miembro: ' + error.message);
    }
  });
  
  // Estilos para hover de botones
  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.background = '#f9fafb';
  });
  
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.background = 'white';
  });
  
  confirmBtn.addEventListener('mouseenter', () => {
    if (!confirmBtn.disabled) {
      confirmBtn.style.background = '#1d4ed8';
    }
  });
  
  confirmBtn.addEventListener('mouseleave', () => {
    if (!confirmBtn.disabled) {
      confirmBtn.style.background = '#2563eb';
    }
  });
  
  // Cerrar con Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  // Cerrar al hacer clic fuera del modal
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Enfocar el input de búsqueda
  searchInput.focus();
}
  /* ======================================================
     REVIEWS (sin cambios)
  ====================================================== */
 /* ======================================================
   REVIEWS SIMPLIFICADO
====================================================== */
/* ======================================================
   REVIEWS - SIN VERIFICACIONES DE PROPIEDAD
====================================================== */
function renderReviewsAdmin() {
  const reviewsList = document.getElementById('reviews-list');
  const reviewsCount = document.querySelector('.reviews-count');
  const starsElement = document.querySelector('.stars');
  
  if (!reviewsList || !reviewsCount) return;
  
  reviewsList.innerHTML = '';
  
  if (!currentApp.reviews || currentApp.reviews.length === 0) {
    reviewsList.innerHTML = `
      <div class="no-reviews-message">
        <div class="icon">💬</div>
        <h3>Sin reseñas aún</h3>
        <p>Esta app no tiene reseñas. Los usuarios podrán añadirlas cuando prueben tu aplicación.</p>
      </div>
    `;
    reviewsCount.textContent = '(0)';
    if (starsElement) starsElement.innerHTML = '★☆☆☆☆ (0.0)';
    return;
  }
  
  const totalReviews = currentApp.reviews.length;
  const averageRating = currentApp.reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / totalReviews;
  const roundedAverage = averageRating.toFixed(1);
  
  reviewsCount.textContent = `(${totalReviews})`;
  if (starsElement) {
    starsElement.innerHTML = `
      <span style="display:flex;align-items:center;gap:4px;">
        <span style="color:#f59e0b;font-size:18px;">
          ${'★'.repeat(Math.floor(averageRating))}${'☆'.repeat(5 - Math.floor(averageRating))}
        </span>
        <span style="font-weight:600;color:#1e293b;">${roundedAverage}</span>
        <span style="color:#64748b;font-size:14px;">(${totalReviews} ${totalReviews === 1 ? 'reseña' : 'reseñas'})</span>
      </span>
    `;
  }
  
  currentApp.reviews.forEach((review, index) => {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.dataset.reviewId = review.id || index;
    card.dataset.rating = review.rating || 0;
    
    const rating = Number(review.rating) || 0;
    let statusClass = 'neutral';
    let statusText = 'Neutral';
    
    if (rating >= 4) {
      statusClass = 'positive';
      statusText = 'Positivo';
    } else if (rating <= 2) {
      statusClass = 'negative';
      statusText = 'Negativo';
    }
    
    const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
    const initials = (review.username || 'U').charAt(0).toUpperCase();
    const reviewDate = review.created_at ? 
      new Date(review.created_at).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'short', 
        year: 'numeric' 
      }) : 'Fecha no disponible';
    
    card.innerHTML = `
      <div class="review-status ${statusClass}">${statusText}</div>
      <div class="review-header">
        <div class="review-user-info">
          <div class="review-avatar">${initials}</div>
          <div class="review-user-details">
            <div class="review-username">@${review.username || 'Usuario'}</div>
            <div class="review-date">${reviewDate}</div>
          </div>
        </div>
        <div class="review-rating">
          <span class="star-icon">${stars}</span>
          <span class="rating-value">${rating}/5</span>
        </div>
      </div>
      <div class="review-content">${review.content || 'Sin comentario'}</div>
    `;
    
    // Clic derecho para eliminar - SIEMPRE DISPONIBLE
    card.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openReviewActionsMenu(e, review.id || index);
    });
    
    // Clic normal también abre el modal - SIEMPRE DISPONIBLE
    card.addEventListener('click', (e) => {
      openReviewActionsMenu(e, review.id || index);
    });
    
    reviewsList.appendChild(card);
  });
}
/* ======================================================
   MENÚ DE ACCIONES PARA REVIEWS (clic derecho)
====================================================== */
/* ======================================================
   MENÚ DE ACCIONES PARA REVIEWS (clic derecho) - SIMPLIFICADO
====================================================== */
/* ======================================================
   MENÚ DE ACCIONES PARA REVIEWS (clic derecho) - SIN VERIFICAR PROPIETARIO
====================================================== */
function openReviewActionsMenu(e, reviewId) {
  e.preventDefault();
  
  const review = currentApp?.reviews?.find(r => String(r.id) === String(reviewId));
  if (!review) return;
  
  // Crear mini modal de confirmación - SIEMPRE DISPONIBLE
  const modal = document.createElement('div');
  modal.id = 'delete-review-mini-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  `;
  
  const reviewUsername = review.username || 'Usuario anónimo';
  const reviewContent = review.content ? 
    (review.content.length > 100 ? review.content.substring(0, 100) + '...' : review.content) : 
    'Sin comentario';
  const reviewRating = review.rating || 0;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 24px;
      border-radius: 12px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    ">
      <h3 style="
        margin-bottom: 16px;
        color: #1e293b;
        font-size: 18px;
        font-weight: 600;
      ">¿Eliminar reseña?</h3>
      
      <div style="
        margin-bottom: 20px;
        padding: 16px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
      ">
        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
          <div style="font-weight: 500; color: #1e293b;">${reviewUsername}</div>
          <div style="color: #f59e0b; font-weight: 600;">${reviewRating}/5</div>
        </div>
        <div style="color: #64748b; font-size: 14px; line-height: 1.5;">
          "${reviewContent}"
        </div>
      </div>
      
      <p style="
        margin-bottom: 20px;
        color: #64748b;
        line-height: 1.5;
        font-size: 14px;
      ">
        Esta acción no se puede deshacer. La reseña será eliminada permanentemente.
      </p>
      
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="cancel-delete-review" style="
          padding: 8px 20px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background: white;
          color: #475569;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        ">
          Cancelar
        </button>
        <button id="confirm-delete-review" style="
          padding: 8px 20px;
          border: none;
          border-radius: 6px;
          background: #ef4444;
          color: white;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        ">
          Eliminar Reseña
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Añadir estilos para hover
  const cancelBtn = modal.querySelector('#cancel-delete-review');
  const confirmBtn = modal.querySelector('#confirm-delete-review');
  
  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.background = '#f8fafc';
  });
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.background = 'white';
  });
  
  confirmBtn.addEventListener('mouseenter', () => {
    confirmBtn.style.background = '#dc2626';
  });
  confirmBtn.addEventListener('mouseleave', () => {
    confirmBtn.style.background = '#ef4444';
  });
  
  // Event listeners
  cancelBtn.addEventListener('click', () => {
    modal.remove();
  });
  
  confirmBtn.addEventListener('click', async () => {
    await deleteReview(reviewId);
    modal.remove();
  });
  
  // Cerrar al hacer clic fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
  
  // Cerrar con Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
}

/* ======================================================
   ELIMINAR RESEÑA (SIN VERIFICACIÓN)
====================================================== */
async function deleteReview(reviewId) {
  try {
    const res = await fetch(`/account/review/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    const data = await res.json();
    if (data.success) {
      // Actualizar reviews locales
      currentApp.reviews = currentApp.reviews.filter(r => String(r.id) !== String(reviewId));
      
      // Renderizar reviews actualizadas
      renderReviewsAdmin();
      
      // Mostrar notificación
      showNotification('Reseña eliminada correctamente', 'success');
    } else {
      throw new Error(data.message || 'Error al eliminar la reseña');
    }
  } catch (err) {
    console.error('❌ Error eliminando reseña:', err);
    showError('Error al eliminar la reseña: ' + err.message);
  }
}

/* ======================================================
   FUNCIÓN DE NOTIFICACIONES
====================================================== */
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.innerHTML = `
    <span>${message}</span>
  `;
  
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
    font-size: 14px;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 3000);
}
/* ======================================================
   CREACIÓN DE COMUNIDADES
====================================================== */

// Mostrar/ocultar formulario de comunidad
addCommunityBtn?.addEventListener('click', () => {
  if (addCommunityForm) {
    addCommunityForm.classList.remove('hidden');
    if (communityNameInput) {
      communityNameInput.focus();
    }
  }
});

// Cancelar creación
document.getElementById('cancelCommunityBtn')?.addEventListener('click', (e) => {
  e.preventDefault();
  if (addCommunityForm) {
    addCommunityForm.classList.add('hidden');
  }
  if (communityNameInput) {
    communityNameInput.value = '';
  }
});

// Crear comunidad
saveCommunityBtn?.addEventListener('click', async (e) => {
  e.preventDefault();
  await createCommunity();
});

// Enter para crear comunidad
communityNameInput?.addEventListener('keypress', async (e) => {
  if (e.key === 'Enter') {
    e.preventDefault();
    await createCommunity();
  }
});

async function createCommunity() {
  const name = communityNameInput?.value.trim();
  
  if (!name) {
    alert('Por favor, introduce un nombre para la comunidad.');
    return;
  }

  if (!currentApp || !currentApp.id) {
    alert('Error: No se ha identificado la aplicación actual.');
    return;
  }

  console.log(`🔄 Creando comunidad para app ${currentApp.id}: ${name}`);

  try {
    const response = await fetch(`/apps/${currentApp.id}/create_community`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name })
    });

    const data = await response.json();
    
    if (data.success) {
      // Recargar los detalles de la app para actualizar la lista de comunidades
      currentApp = await fetchAppData(currentApp.id);
      
      // Renderizar comunidades actualizadas
      renderCommunities();
      
      // Ocultar formulario y limpiar input
      if (addCommunityForm) addCommunityForm.classList.add('hidden');
      if (communityNameInput) communityNameInput.value = '';
      
      // Mostrar mensaje de éxito
      showNotification('Comunidad creada exitosamente', 'success');
    } else {
      alert('Error al crear la comunidad: ' + (data.error || 'Error desconocido'));
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Error al crear la comunidad. Verifica tu conexión.');
  }
}


/* ======================================================
   RENDERIZAR COMUNIDADES - VERSIÓN MEJORADA
====================================================== */
function renderCommunities() {
  console.log('🎯 Renderizando comunidades...');
  
  // Usar un selector más específico para evitar problemas
  const communitiesTab = document.querySelector('#communities.tab-content');
  if (!communitiesTab) {
    console.error('❌ Tab de comunidades no encontrada');
    return;
  }
  
  // Si ya existe la estructura, solo actualizar el contenido
  let list = communitiesTab.querySelector('.community-list');
  let header = communitiesTab.querySelector('.communities-header');
  
  if (!header) {
    // Crear estructura solo si no existe
    communitiesTab.innerHTML = `
      <div class="communities-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0; font-size: 1.2rem; color: #1e293b;">Comunidades</h3>
        <div class="communities-actions">
          <button id="addCommunityBtn" class="btn-small primary" style="padding: 8px 16px;">
            + Crear Comunidad
          </button>
        </div>
      </div>
      <div class="communities-container">
        <ul class="community-list" style="list-style: none; padding: 0; margin: 0;"></ul>
      </div>
    `;
  }
  
  list = communitiesTab.querySelector('.community-list');
  
  if (!list) {
    console.error('❌ Lista no encontrada');
    return;
  }
  
  list.innerHTML = '';
  
  if (!currentApp || !currentApp.communities || currentApp.communities.length === 0) {
    console.log('ℹ️ No hay comunidades para mostrar');
    list.innerHTML = `
      <div style="
        text-align: center;
        padding: 60px 20px;
        color: #64748b;
        background: #f8fafc;
        border-radius: 12px;
        border: 1px dashed #e2e8f0;
        margin-top: 10px;
      ">
        <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">👥</div>
        <h4 style="color: #475569; margin-bottom: 8px; font-weight: 600;">
          No hay comunidades
        </h4>
        <p style="margin-bottom: 20px;">Crea una comunidad para que los usuarios puedan interactuar.</p>
        <button id="createFirstCommunityBtn" class="btn-small primary" style="padding: 8px 16px;">
          Crear mi primera comunidad
        </button>
      </div>
    `;
    
    // Configurar botón de crear primera comunidad
    const firstBtn = document.getElementById('createFirstCommunityBtn');
    if (firstBtn) {
      firstBtn.addEventListener('click', () => {
        openCreateCommunityModal(currentApp.id);
      });
    }
  } else {
    console.log(`🔄 Renderizando ${currentApp.communities.length} comunidades`);
    
    currentApp.communities.forEach((community) => {
      if (!community || !community.id) return;
      
      const li = document.createElement('li');
      li.className = 'community-card-container';
      li.style.cssText = 'margin-bottom: 16px; list-style: none; position: relative;';
      
      const a = document.createElement('a');
      a.href = `/community/${community.id}`;
      a.className = 'community-card';
      a.target = '_blank';
      a.style.cssText = `
        display: block;
        text-decoration: none;
        color: inherit;
      `;
      
      const cardDiv = document.createElement('div');
      cardDiv.className = 'community-card';
      cardDiv.innerHTML = `
        <div class="community-card-content">
          <div class="community-card-name" style="
            font-size: 16px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 4px;
          ">${community.name || 'Comunidad sin nombre'}</div>
          <div class="community-card-meta" style="
            font-size: 14px;
            color: #6b7280;
          ">${community.members_count || 0} miembros</div>
        </div>
        <div class="community-card-arrow" style="
          font-size: 20px;
          color: #374151;
          font-weight: 300;
          margin-left: 16px;
        ">→</div>
      `;
      
      cardDiv.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 20px 24px;
        background: #ffffff;
        color: #000000 !important;
        text-decoration: none !important;
        border-radius: 12px;
        font-weight: 500;
        cursor: pointer;
        border: 1px solid #e5e7eb;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      `;
      
      cardDiv.addEventListener('mouseenter', () => {
        cardDiv.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)';
        cardDiv.style.transform = 'translateY(-2px)';
        cardDiv.style.borderColor = '#d1d5db';
      });
      
      cardDiv.addEventListener('mouseleave', () => {
        cardDiv.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)';
        cardDiv.style.transform = 'translateY(0)';
        cardDiv.style.borderColor = '#e5e7eb';
      });
      
      a.appendChild(cardDiv);
      li.appendChild(a);
      
      // Botón de eliminar (solo para owner)
      if (currentApp && currentApp.owner_id === currentUser?.id) {
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-small danger delete-community-btn';
        deleteBtn.dataset.communityId = community.id;
        deleteBtn.innerHTML = 'Eliminar';
        deleteBtn.style.cssText = `
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 10;
          font-size: 11px;
          padding: 3px 8px;
          opacity: 0;
          transition: opacity 0.2s ease;
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        `;
        
        li.addEventListener('mouseenter', () => {
          deleteBtn.style.opacity = '1';
        });
        
        li.addEventListener('mouseleave', () => {
          deleteBtn.style.opacity = '0';
        });
        
        deleteBtn.addEventListener('click', async (e) => {
          e.preventDefault();
          e.stopPropagation();
          await openCommunityDeleteModal(community.id, community.name);
        });
        
        li.appendChild(deleteBtn);
      }
      
      list.appendChild(li);
    });
  }
  
const addCommunityBtn = document.getElementById('addCommunityBtn');
if (addCommunityBtn) {
  // En lugar de clonar, usar un enfoque más directo
  // Guardar el HTML original del botón
  const btnHTML = addCommunityBtn.outerHTML;
  
  // Reemplazar el botón con una copia limpia
  addCommunityBtn.outerHTML = btnHTML;
  
  // Obtener la nueva referencia del botón
  const newAddCommunityBtn = document.getElementById('addCommunityBtn');
  
  if (newAddCommunityBtn) {
    // Configurar el event listener correctamente
    newAddCommunityBtn.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('🔄 Botón de crear comunidad clickeado');
      console.log('📱 App actual:', currentApp);
      
      if (!currentApp || !currentApp.id) {
        console.error('❌ No hay app seleccionada o no tiene ID');
        showError('No se puede identificar la aplicación');
        return;
      }
      
      // Verificar que currentApp.id sea un UUID válido
      const appId = String(currentApp.id);
      console.log('🎯 Intentando abrir modal para app ID:', appId);
      
      // Primero intentar con el modal completo si existe
      if (typeof window.openCreateCommunityModal === 'function') {
        console.log('✅ Usando modal completo de create_community.js');
        window.openCreateCommunityModal(appId);
      } 
      // Si no, usar el modal simple local
      else if (typeof openCreateCommunityModalSimple === 'function') {
        console.log('ℹ️ Usando modal simple (fallback)');
        openCreateCommunityModalSimple(appId);
      }
      // Si no hay ninguna función disponible, mostrar error
      else {
        console.error('❌ No se encontró ninguna función para abrir el modal');
        showError('La función para crear comunidades no está disponible en este momento');
      }
    });
    
    // También añadir un atributo para debugging
    newAddCommunityBtn.setAttribute('data-app-id', currentApp?.id || 'no-app');
    
    console.log('✅ Botón de crear comunidad configurado correctamente');
  } else {
    console.error('❌ No se pudo obtener el nuevo botón después del reemplazo');
  }
} else {
  console.log('ℹ️ Botón addCommunityBtn no encontrado en el DOM');
}

}
/* ======================================================
   MODAL SIMPLE (FALLBACK) - Solo si no existe el complejo
====================================================== */
function openCreateCommunityModalSimple(appId) {
  console.log('🔄 Abriendo modal simple para app:', appId);
  
  // Verificar si ya existe un modal
  const existingModal = document.getElementById('create-community-simple-modal');
  if (existingModal) {
    existingModal.remove();
  }
  
  // Crear modal
  const modal = document.createElement('div');
  modal.id = 'create-community-simple-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 28px;
      border-radius: 14px;
      max-width: 450px;
      width: 90%;
      box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
    ">
      <h3 style="
        margin-bottom: 20px;
        color: #1e293b;
        font-size: 20px;
        font-weight: 700;
      ">Crear nueva comunidad</h3>
      
      <div style="margin-bottom: 24px;">
        <label style="display: block; font-weight: 500; margin-bottom: 8px; color: #374151;">
          Nombre de la comunidad *
        </label>
        <input type="text" id="new-community-name-simple" 
          placeholder="Ej: Soporte Técnico, Beta Testers, Ideas"
          style="
            width: 100%;
            padding: 12px 16px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.2s ease;
            box-sizing: border-box;
          "
        >
        <p style="margin-top: 8px; color: #6b7280; font-size: 13px;">
          Los usuarios podrán unirse a esta comunidad para discutir sobre la app.
        </p>
        <div id="community-name-error" style="color: #dc2626; font-size: 0.85rem; margin-top: 5px; display: none;"></div>
      </div>
      
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="cancel-create-community-simple" style="
          padding: 10px 24px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          background: white;
          color: #374151;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
        ">
          Cancelar
        </button>
        <button id="confirm-create-community-simple" style="
          padding: 10px 24px;
          border: none;
          border-radius: 8px;
          background: #2563eb;
          color: white;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: background 0.2s ease;
        ">
          Crear Comunidad
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Referencias
  const nameInput = modal.querySelector('#new-community-name-simple');
  const errorDiv = modal.querySelector('#community-name-error');
  const cancelBtn = modal.querySelector('#cancel-create-community-simple');
  const confirmBtn = modal.querySelector('#confirm-create-community-simple');
  
  // Función para validar nombre
  function validateName() {
    const name = nameInput.value.trim();
    
    if (!name) {
      errorDiv.textContent = 'El nombre es obligatorio';
      errorDiv.style.display = 'block';
      nameInput.style.borderColor = '#ef4444';
      return false;
    }
    
    if (name.length < 3) {
      errorDiv.textContent = 'El nombre debe tener al menos 3 caracteres';
      errorDiv.style.display = 'block';
      nameInput.style.borderColor = '#ef4444';
      return false;
    }
    
    errorDiv.style.display = 'none';
    nameInput.style.borderColor = '#10b981';
    return true;
  }
  
  // Enfocar input y poner placeholder
  setTimeout(() => {
    nameInput.focus();
    nameInput.value = 'Comunidad de ' + (currentApp?.name || 'la app');
    nameInput.select();
  }, 50);
  
  // Event listeners para el input
  nameInput.addEventListener('input', validateName);
  nameInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && validateName()) {
      createCommunity(appId, nameInput.value.trim());
    }
  });
  
  // Botón cancelar
  cancelBtn.addEventListener('click', () => {
    modal.remove();
  });
  
  // Botón confirmar
  confirmBtn.addEventListener('click', async () => {
    if (!validateName()) return;
    
    const name = nameInput.value.trim();
    await createCommunity(appId, name);
    modal.remove();
  });
  
  // Estilos hover
  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.background = '#f9fafb';
  });
  
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.background = 'white';
  });
  
  confirmBtn.addEventListener('mouseenter', () => {
    confirmBtn.style.background = '#1d4ed8';
  });
  
  confirmBtn.addEventListener('mouseleave', () => {
    confirmBtn.style.background = '#2563eb';
  });
  
  // Cerrar con Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      modal.remove();
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
  
  // Cerrar al hacer clic fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

/* ======================================================
   FUNCIÓN PARA CREAR COMUNIDAD (común a ambos modales)
====================================================== */
async function createCommunity(appId, name) {
    console.log(`🔄 Creando comunidad: "${name}" para app: ${appId}`);
    
    try {
        const response = await fetch(`/apps/${appId}/create_community`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                name: name,
                description: '',
                rules: '',
                is_public: 'public',
                allow_public_join: 'yes'
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Comunidad creada exitosamente:', data);
            
            // 🔥 IMPORTANTE: Redirigir a la nueva comunidad en NUEVA PESTAÑA
            if (data.community && data.community.id) {
                const communityUrl = `/community/${data.community.id}`;
                console.log('🌐 Redirigiendo a:', communityUrl);
                
                // Abrir en nueva pestaña
                window.open(communityUrl, '_blank');
                
                // También cerrar el modal
                const modal = document.getElementById('createCommunityModal') || 
                              document.getElementById('create-community-simple-modal');
                if (modal) {
                    modal.classList.add('hidden');
                }
                
                // Recargar lista de comunidades en el dashboard
                if (window.renderCommunities && typeof window.renderCommunities === 'function') {
                    window.renderCommunities();
                }
            }
            
            return data.community;
        } else {
            throw new Error(data.error || 'Error al crear la comunidad');
        }
    } catch (error) {
        console.error('❌ Error creando comunidad:', error);
        showError('Error: ' + error.message);
        return null;
    }
}
/* ======================================================
   ELIMINAR COMUNIDAD - CON MINI MODAL
====================================================== */
async function openCommunityDeleteModal(communityId, communityName) {
  // Crear mini modal
  const modal = document.createElement('div');
  modal.id = 'delete-community-mini-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  `;
  
  modal.innerHTML = `
    <div style="
      background: white;
      padding: 24px;
      border-radius: 12px;
      max-width: 400px;
      width: 90%;
      box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
    ">
      <h3 style="
        margin-bottom: 16px;
        color: #1e293b;
        font-size: 18px;
        font-weight: 600;
      ">¿Eliminar comunidad?</h3>
      
      <p style="
        margin-bottom: 20px;
        color: #64748b;
        line-height: 1.5;
      ">
        Vas a eliminar la comunidad <strong>"${communityName}"</strong>.
        Esta acción no se puede deshacer y todos los miembros perderán acceso.
      </p>
      
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <button id="cancel-delete-community" style="
          padding: 8px 20px;
          border: 1px solid #cbd5e1;
          border-radius: 6px;
          background: white;
          color: #475569;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        ">
          Cancelar
        </button>
        <button id="confirm-delete-community" style="
          padding: 8px 20px;
          border: none;
          border-radius: 6px;
          background: #ef4444;
          color: white;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.2s;
        ">
          Eliminar
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Añadir estilos para hover
  const cancelBtn = modal.querySelector('#cancel-delete-community');
  const confirmBtn = modal.querySelector('#confirm-delete-community');
  
  cancelBtn.addEventListener('mouseenter', () => {
    cancelBtn.style.background = '#f8fafc';
  });
  cancelBtn.addEventListener('mouseleave', () => {
    cancelBtn.style.background = 'white';
  });
  
  confirmBtn.addEventListener('mouseenter', () => {
    confirmBtn.style.background = '#dc2626';
  });
  confirmBtn.addEventListener('mouseleave', () => {
    confirmBtn.style.background = '#ef4444';
  });
  
  // Event listeners
  cancelBtn.addEventListener('click', () => {
    modal.remove();
  });
  
  confirmBtn.addEventListener('click', async () => {
    await deleteCommunity(communityId);
    modal.remove();
  });
  
  // Cerrar al hacer clic fuera
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

async function deleteCommunity(communityId) {
  try {
    const response = await fetch(`/account/community/${communityId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const data = await response.json();
    
    if (data.success) {
      // Actualizar la app localmente
      currentApp.communities = currentApp.communities.filter(c => c.id !== communityId);
      
      // Renderizar comunidades actualizadas
      renderCommunities();
      
      // Mostrar notificación
      showNotification('Comunidad eliminada exitosamente', 'success');
    } else {
      throw new Error(data.error || 'Error desconocido');
    }
  } catch (error) {
    console.error('Error:', error);
    showError('Error al eliminar la comunidad: ' + error.message);
  }
}

/* ======================================================
   FUNCIÓN DE NOTIFICACIONES
====================================================== */
function showNotification(message, type = 'info') {
  // Si ya existe una notificación, removerla
  const existingNotification = document.querySelector('.notification');
  if (existingNotification) {
    existingNotification.remove();
  }
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <span>${message}</span>
    <button class="notification-close">&times;</button>
  `;
  
  // Estilos de la notificación
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 12px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 12px;
    animation: slideIn 0.3s ease-out;
    font-size: 14px;
  `;
  
  document.body.appendChild(notification);
  
  // Botón para cerrar
  notification.querySelector('.notification-close').addEventListener('click', () => {
    notification.remove();
  });
  
  // Auto-remover después de 5 segundos
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 5000);
  
  // Añadir estilos CSS para la animación si no existen
  if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      
      .notification-close {
        background: transparent;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        line-height: 1;
        opacity: 0.8;
        transition: opacity 0.2s;
      }
      
      .notification-close:hover {
        opacity: 1;
      }
    `;
    document.head.appendChild(style);
  }
}

// Función auxiliar para formatear fechas
function formatDate(dateString) {
  if (!dateString) return 'recientemente';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'hoy';
  if (diffDays === 1) return 'ayer';
  if (diffDays < 7) return `hace ${diffDays} días`;
  if (diffDays < 30) return `hace ${Math.floor(diffDays / 7)} semanas`;
  
  return date.toLocaleDateString('es-ES', { 
    day: 'numeric', 
    month: 'long', 
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
  });
}

  /* ======================================================
     LISTENER PARA GUARDAR CAMBIOS EN LA APP
  ====================================================== */
  saveAppChangesBtn?.addEventListener('click', async () => {
    const updatedData = {
      name: document.getElementById('app-name-input').value,
      description: document.getElementById('app-description-input').value,
      creation_date: document.getElementById('app-date-input').value,
      theme: document.getElementById('app-theme-input').value,
    };
    
    try {
      const res = await fetch(`/account/update_app/${currentApp.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      
      currentApp = { ...currentApp, ...updatedData };
      showSuccess('Cambios guardados correctamente');
      
    } catch (err) {
      showError('Error al guardar cambios: ' + err.message);
    }
  });

  /* ======================================================
     LISTENER PARA CAMBIAR LOGO
  ====================================================== */
  changeLogoBtn?.addEventListener('click', () => appLogoInput.click());
  appLogoInput?.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('appImage', file);
    
    try {
      const res = await fetch(`/account/update_app_image/${currentApp.id}`, {
        method: 'POST',
        body: formData
      });
      
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      
      document.getElementById('app-logo').src = data.image_url;
      currentApp.image_url = data.image_url;
      showSuccess('Logo actualizado');
      
    } catch (err) {
      showError('Error al actualizar logo: ' + err.message);
    }
  });

  /* ======================================================
     CERRAR MODAL
  ====================================================== */
  closeAppDetail?.addEventListener('click', () => {
    appDetailModal.classList.add('hidden');
    currentApp = null;
    window.currentApp = null;
    console.log('🗑 Modal cerrado y estado limpiado');
  });

  /* ======================================================
     LISTENER PARA APPS EXISTENTES Y NUEVAS
  ====================================================== */
  function setupAppClickListeners() {
    const appButtons = document.querySelectorAll('.app-item');
    
    appButtons.forEach(button => {
      button.removeEventListener('click', handleAppClick);
      button.addEventListener('click', handleAppClick);
    });
  }
  
  function handleAppClick() {
    const appId = this.dataset.appId;
    console.log('🖱️ Botón de app clickeado, ID:', appId);
    
    if (!appId) {
      console.error('Botón sin data-app-id:', this);
      showError('Esta aplicación no tiene un ID válido');
      return;
    }
    
    openAppDetail(appId);
  }
  
  setupAppClickListeners();
  
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.type === 'childList') {
        setupAppClickListeners();
      }
    });
  });
  
  if (appsList) {
    observer.observe(appsList, { childList: true });
  }

  /* ======================================================
     TABS DEL MODAL
  ====================================================== */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      tabContents.forEach(c => c.classList.add('hidden'));
      
      const targetTab = document.getElementById(btn.dataset.tab);
      if (targetTab) {
        targetTab.classList.remove('hidden');
      }
      
      if (btn.dataset.tab === 'communities') {
        renderCommunities();
      } else if (btn.dataset.tab === 'team') {
        renderTeamMembers();
      }
    });
  });

  appDetailModal?.addEventListener('click', e => {
    if (e.target === appDetailModal) {
      appDetailModal.classList.add('hidden');
      currentApp = null;
      window.currentApp = null;
    }
  });

// Al final de dashboard.js, añade:
window.loadAppDetails = fetchAppData;
window.openAppDetail = openAppDetail;
window.renderCommunities = renderCommunities;
window.renderTeamMembers = renderTeamMembers;
window.renderReviewsAdmin = renderReviewsAdmin;

  console.log('✅ dashboard.js completamente cargado y listo');
});