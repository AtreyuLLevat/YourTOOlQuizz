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

  // Elementos del modal
  const modalLogoImg = document.getElementById('app-logo');
  const nameInput = document.getElementById('app-name-input');
  const descriptionInput = document.getElementById('app-description-input');
  const dateInput = document.getElementById('app-date-input');
  const themeInput = document.getElementById('app-theme-input');
  const starsEl = appDetailModal?.querySelector('.reviews-summary .stars');
  const reviewsCountEl = appDetailModal?.querySelector('.reviews-summary .reviews-count');
  const reviewsList = document.getElementById('reviews-list');
  const communitiesList = appDetailModal?.querySelector('.community-list');
  const teamList = document.getElementById('team-members-list');

  // Pestañas
  const tabButtons = appDetailModal?.querySelectorAll('.tab-btn');
  const tabContents = appDetailModal?.querySelectorAll('.tab-content');

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

  /* ======================================================
     GESTIÓN DE PESTAÑAS
  ====================================================== */
  function showTab(tabName) {
    tabButtons?.forEach(btn => btn.classList.remove('active'));
    tabContents?.forEach(c => c.classList.add('hidden'));

    const activeBtn = appDetailModal?.querySelector(`.tab-btn[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(tabName);

    if (activeBtn && activeContent) {
      activeBtn.classList.add('active');
      activeContent.classList.remove('hidden');

      // Cargar team SOLO cuando se abre la pestaña
      if (tabName === 'team' && window.currentAppId) {
        loadTeamMembers(window.currentAppId);
      }
    }
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
      
      /* ===== RELLENAR DATOS ===== */
      if (nameInput) nameInput.value = currentApp.name || '';
      if (descriptionInput) descriptionInput.value = currentApp.description || '';
      if (dateInput) {
        dateInput.value = currentApp.creation_date ? 
          new Date(currentApp.creation_date).toISOString().split('T')[0] : '';
      }
      if (themeInput) themeInput.value = currentApp.theme || 'General';
      
      const logoImg = document.getElementById('app-logo');
      if (logoImg) {
        logoImg.src = currentApp.image_url || '/static/images/app-placeholder.png';
      }
      
      /* ===== REVIEWS ===== */
      if (starsEl && reviewsCountEl) {
        const rating = Math.round(currentApp.rating || 0);
        starsEl.textContent = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
        reviewsCountEl.textContent = `(${currentApp.reviews_count || 0})`;
      }

      if (reviewsList) {
        reviewsList.innerHTML = '';
        (currentApp.reviews || []).forEach(r => {
          const div = document.createElement('div');
          div.className = 'review-card';
          div.innerHTML = `
            <div class="review-header">
              <div class="review-user-info">
                <div class="review-avatar">${(r.user_name || '?')[0]}</div>
                <div class="review-user-details">
                  <div class="review-username">${r.user_name || 'Usuario'}</div>
                  <div class="review-date">${r.date || ''}</div>
                </div>
              </div>
              <div class="review-rating">
                ⭐ <span class="rating-value">${r.rating}</span>
              </div>
            </div>
            <p class="review-content">${r.content || ''}</p>
          `;
          reviewsList.appendChild(div);
        });
      }
      
      /* ===== COMUNIDADES ===== */
      if (communitiesList) {
        communitiesList.innerHTML = '';
        (currentApp.communities || []).forEach(c => {
          const li = document.createElement('li');
          li.textContent = c.name;
          communitiesList.appendChild(li);
        });
      }
      
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
      showTab('reviews');
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

    const logoImg = document.getElementById('app-logo');
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
  function editTeamMember(memberId, currentRole = '') {
    const input = prompt('Ingrese el nuevo rol:', currentRole);
    if (input === null) return; // cancelado

    const newRole = input.trim();
    if (!newRole || newRole === currentRole) return;

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

      // 🔄 UI
      const card = document.querySelector(`[data-member-id="${memberId}"]`);
      if (card) {
        const roleElem = card.querySelector('.team-role');
        if (roleElem) roleElem.textContent = newRole;

        const editBtn = card.querySelector('.edit-member-btn');
        if (editBtn) editBtn.dataset.role = newRole;
      }

      // 🔄 Estado local
      const member = currentApp.team_members.find(m => String(m.id) === String(memberId));
      if (member) member.role = newRole;

      showSuccess('Rol actualizado correctamente');
    })
    .catch(err => {
      console.error('editTeamMember error:', err);
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
     TEAM MEMBERS (desde modal.js)
  ====================================================== */
  async function loadTeamMembers(appId) {
    if (!teamList) return;

    teamList.innerHTML = 'Cargando equipo...';

    try {
      const res = await fetch(`/apps/${appId}/team`);
      const team = await res.json();

      teamList.innerHTML = '';

      if (!team.length) {
        teamList.innerHTML = '<p style="color:#64748b;">No hay miembros en el equipo.</p>';
        return;
      }

      team.forEach(m => {
        const socials = Object.entries(m.socials || {})
          .map(([k, v]) => `
            <a href="${v}" target="_blank" class="social-badge ${k}">
              @${k}
            </a>
          `).join('');

        const card = document.createElement('div');
        card.className = 'team-member-card';
        card.innerHTML = `
          <div class="team-member-info">
            <img class="team-avatar" src="${m.avatar || '/static/images/default-avatar.png'}">
            <div>
              <div class="team-name">${m.name}</div>
              <div class="team-role">${m.role || ''}</div>
              <div class="social-badges">${socials}</div>
            </div>
          </div>
        `;
        teamList.appendChild(card);
      });

    } catch (err) {
      console.error(err);
      teamList.innerHTML = '<p>Error al cargar el equipo</p>';
    }
  }

  /* ======================================================
     RENDERIZAR MIEMBROS DEL EQUIPO (CON BOTONES)
  ====================================================== */
  function renderTeamMembers() {
    const list = document.getElementById('team-members-list');
    if (!list) return;

    list.innerHTML = '';

    if (!currentApp?.team_members?.length) {
      list.innerHTML = '<p>No hay miembros en el equipo.</p>';
      return;
    }

    const appOwnerId = String(currentApp.owner_id);
    const userId = String(currentUser?.id || currentUser?.user_id || '');
    const isOwner = appOwnerId && userId && appOwnerId === userId;

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

      list.appendChild(card);
    });

    list.querySelectorAll('.edit-member-btn').forEach(btn => {
      btn.onclick = () => editTeamMember(btn.dataset.memberId, btn.dataset.role);
    });

    list.querySelectorAll('.remove-member-btn').forEach(btn => {
      btn.onclick = () => removeTeamMember(btn.dataset.memberId, btn.dataset.name);
    });
  }

  /* ======================================================
     REVIEWS (dashboard.js original)
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
      
      const stars = '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
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
      
      card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openReviewActionsMenu(e, review.id || index);
      });
      
      reviewsList.appendChild(card);
    });
  }

  /* ======================================================
     COMMUNITIES
  ====================================================== */
  function renderCommunities() {
    console.log('🎯 Renderizando comunidades...');
    
    if (!appDetailModal) {
      console.error('❌ appDetailModal no encontrado');
      return;
    }
    
    const list = appDetailModal.querySelector('.community-list');
    if (!list) {
      console.error('❌ No se encontró .community-list en el modal');
      return;
    }
    
    list.innerHTML = '';
    
    if (!currentApp || !currentApp.communities || currentApp.communities.length === 0) {
      console.log('ℹ️ No hay comunidades para mostrar');
      list.innerHTML = '<li class="no-communities">Sin comunidades creadas</li>';
      return;
    }
    
    console.log(`🔄 Renderizando ${currentApp.communities.length} comunidades`);
    
    currentApp.communities.forEach((community, index) => {
      if (!community || !community.id) return;
      
      const li = document.createElement('li');
      li.className = 'community-card-container';
      li.style.cssText = 'margin-bottom: 16px; list-style: none;';
      
      const a = document.createElement('a');
      a.href = `/community/${community.id}`;
      a.className = 'community-card';
      a.target = '_blank';
      
      a.innerHTML = `
        <div class="community-card-content">
          <div class="community-card-name">${community.name || 'Comunidad sin nombre'}</div>
          <div class="community-card-meta">${community.members_count || 0} miembros</div>
        </div>
        <div class="community-card-arrow">→</div>
      `;
      
      a.style.cssText = `
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
      
      a.addEventListener('mouseenter', () => {
        a.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12), 0 4px 8px rgba(0, 0, 0, 0.06)';
        a.style.transform = 'translateY(-2px)';
        a.style.borderColor = '#d1d5db';
      });
      
      a.addEventListener('mouseleave', () => {
        a.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)';
        a.style.transform = 'translateY(0)';
        a.style.borderColor = '#e5e7eb';
      });
      
      a.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openCommunityActionsMenu(e, community.id);
      });
      
      li.appendChild(a);
      list.appendChild(li);
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

  appDetailModal?.addEventListener('click', e => {
    if (e.target === appDetailModal) {
      appDetailModal.classList.add('hidden');
      currentApp = null;
      window.currentApp = null;
    }
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
     LISTENERS DE PESTAÑAS
  ====================================================== */
  tabButtons?.forEach(btn => {
    btn.addEventListener('click', () => {
      showTab(btn.dataset.tab);
    });
  });

  console.log('✅ dashboard.js completamente cargado y listo');
});