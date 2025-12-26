document.addEventListener('DOMContentLoaded', () => {

  /* ======================================================
     ESTADO GLOBAL
  ====================================================== */
  let currentApp = null;
  window.currentApp = null;

  /* ======================================================
     VARIABLES
  ====================================================== */
  const createAppForm = document.getElementById('createAppForm');
  const appsList = document.getElementById('appsList');
  const createAppModal = document.getElementById('createAppModal');
  const cancelAppBtn = document.getElementById('cancelAppBtn');
  const newAppBtn = document.getElementById('newAppBtn');

  // Elementos para búsqueda de usuarios
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

  // Verificación inicial
  console.log('✅ dashboard.js iniciado');
  console.log('Elementos encontrados:', {
    appsList: !!appsList,
    createAppForm: !!createAppForm,
    appDetailModal: !!appDetailModal
  });

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

// En dashboard.js, en la función addTeamMember, actualiza el HTML para incluir redes sociales:

function addTeamMember(user) {
  const role = userRoleSelect.value;
  const memberId = `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Extraer redes sociales del usuario
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

  document.addEventListener('click', (e) => {
    if (!userSearchResults.contains(e.target) && e.target !== userSearchInput) {
      userSearchResults.style.display = 'none';
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

      // Recolectar miembros del equipo
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
      
      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Error al crear la app');
      }

      // Verificar que la app tiene ID
      if (!data.app || !data.app.id) {
        throw new Error('La app fue creada pero no se recibió un ID válido');
      }

      console.log('✅ App creada con ID:', data.app.id);

      // Crear botón para la nueva app
      const btn = document.createElement('button');
      btn.className = 'app-item';
      btn.dataset.appId = data.app.id.toString(); // Asegurar que es string
      
      const imageUrl = data.app.image_url || '/static/images/app-placeholder.png';
      
      btn.innerHTML = `
        <img src="${imageUrl}" class="app-img" alt="${data.app.name}">
        <span class="app-name">${data.app.name}</span>
      `;
      
      // Agregar listener al nuevo botón
      btn.addEventListener('click', function() {
        const id = this.dataset.appId;
        if (id) {
          openAppDetail(id);
        } else {
          console.error('Botón sin data-app-id:', this);
          showError('Esta aplicación no tiene un ID válido');
        }
      });
      
      // Agregar al principio de la lista
      if (appsList) {
        if (appsList.firstChild) {
          appsList.insertBefore(btn, appsList.firstChild);
        } else {
          appsList.appendChild(btn);
        }
      }
      
      // Limpiar y cerrar modal
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
      const response = await fetch(`/account/get_app/${appId}`);
      
      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Error al obtener datos de la app');
      }
      
      // Asegurar arrays
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
     ABRIR MODAL APP - VERSIÓN MEJORADA
  ====================================================== */
  async function openAppDetail(appId) {
    console.log(`📱 Abriendo app con ID: ${appId}`);
    
    // Validación básica
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
      
      // Guardar el ID en el modal
      appDetailModal.dataset.appId = appId;
      
      // Actualizar información básica
      updateAppBasicInfo();
      
      // Renderizar contenido
      renderReviewsAdmin(); 
      renderCommunities();
      
      // Mostrar modal
      appDetailModal.classList.remove('hidden');
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

  // 🔥 LOGO DE LA APP
  const logoImg = document.getElementById("app-logo");
  if (logoImg) {
    logoImg.src = currentApp.image_url || '/static/images/app-placeholder.png';
  }
}


  /* ======================================================
     REVIEWS
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
    
    // Calcular promedio
    const totalReviews = currentApp.reviews.length;
    const averageRating = currentApp.reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) / totalReviews;
    const roundedAverage = averageRating.toFixed(1);
    
    // Actualizar contador y estrellas
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
    
    // Crear tarjetas de reseñas
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
      
      // Agregar menú contextual
      card.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        openReviewActionsMenu(e, review.id || index);
      });
      
      reviewsList.appendChild(card);
    });
  }
  
  function closeReviewActionsMenu() {
    const menu = document.getElementById('review-actions-menu');
    if (menu) menu.remove();
  }
  
  function openReviewActionsMenu(event, reviewId) {
    closeReviewActionsMenu();
    
    const menu = document.createElement('div');
    menu.id = 'review-actions-menu';
    menu.innerHTML = `<button class="danger">🗑 Eliminar reseña</button>`;
    menu.style.cssText = `
      position: fixed;
      top: ${event.clientY}px;
      left: ${event.clientX}px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,.15);
      z-index: 9999;
      padding: 6px;
    `;
    
    menu.querySelector('button').onclick = () => {
      deleteReview(reviewId);
      closeReviewActionsMenu();
    };
    
    document.body.appendChild(menu);
  }
  
  document.addEventListener('click', closeReviewActionsMenu);
  
  async function deleteReview(reviewId) {
    if (!confirm('¿Eliminar esta reseña definitivamente?')) return;
    
    const appId = appDetailModal?.dataset.appId;
    if (!appId) {
      showError('No se pudo identificar la app');
      return;
    }
    
    try {
      const res = await fetch(`/account/review/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error al eliminar');
      
      // Actualizar lista localmente
      currentApp.reviews = currentApp.reviews.filter(r => r.id !== reviewId);
      renderReviewsAdmin();
      
      showSuccess('Reseña eliminada correctamente');
      
    } catch (error) {
      console.error('Error eliminando reseña:', error);
      showError('No se pudo eliminar la reseña: ' + error.message);
    }
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
      
      // Estilos inline para consistencia
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
      
      // Hover effects
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
      
      // Menú contextual para eliminar
      a.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openCommunityActionsMenu(e, community.id);
      });
      
      li.appendChild(a);
      list.appendChild(li);
    });
    
    console.log(`✅ Se crearon ${list.children.length} tarjetas de comunidad`);
  }
  
  function openCommunityActionsMenu(event, communityId) {
    closeCommunityActionsMenu();
    
    const menu = document.createElement('div');
    menu.id = 'community-actions-menu';
    menu.innerHTML = `<button class="danger">🗑 Eliminar comunidad</button>`;
    menu.style.cssText = `
      position: fixed;
      top: ${event.clientY}px;
      left: ${event.clientX}px;
      background: #fff;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgba(0,0,0,.15);
      z-index: 9999;
      padding: 6px;
    `;
    
    menu.querySelector('button').onclick = () => {
      deleteCommunity(communityId);
      closeCommunityActionsMenu();
    };
    
    document.body.appendChild(menu);
  }
  
  function closeCommunityActionsMenu() {
    const menu = document.getElementById('community-actions-menu');
    if (menu) menu.remove();
  }
  
  document.addEventListener('click', closeCommunityActionsMenu);
  
  async function deleteCommunity(communityId) {
    if (!confirm('¿Eliminar esta comunidad definitivamente?')) return;
    
    try {
      const res = await fetch(`/account/community/${communityId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error al eliminar');
      
      // Actualizar lista local
      currentApp.communities = currentApp.communities.filter(c => c.id !== communityId);
      renderCommunities();
      
      showSuccess('Comunidad eliminada correctamente');
      
    } catch (error) {
      console.error('Error eliminando comunidad:', error);
      showError('No se pudo eliminar la comunidad: ' + error.message);
    }
  }

  /* ======================================================
     AÑADIR COMUNIDAD
  ====================================================== */
  addCommunityBtn?.addEventListener('click', () => {
    addCommunityForm.classList.toggle('hidden');
  });

  saveCommunityBtn?.addEventListener('click', async () => {
    const name = communityNameInput.value.trim();
    if (!name) {
      showError('El nombre de la comunidad es obligatorio');
      return;
    }

    const appId = appDetailModal?.dataset.appId;
    if (!appId) {
      showError('No se pudo identificar la aplicación');
      return;
    }

    try {
      const res = await fetch(`/apps/${appId}/create_community`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      
      if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`);
      
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Error al crear comunidad');

      // Asegurar que existe el array de comunidades
      if (!currentApp.communities) {
        currentApp.communities = [];
      }
      
      // Agregar nueva comunidad
      currentApp.communities.push(data.community);
      
      // Re-renderizar
      renderCommunities();

      // Limpiar y cerrar formulario
      communityNameInput.value = '';
      addCommunityForm.classList.add('hidden');
      
      showSuccess('¡Comunidad creada exitosamente!');
      
    } catch (error) {
      console.error('Error al crear comunidad:', error);
      showError('No se pudo crear la comunidad: ' + error.message);
    }
  });
async function loadTeamMembers(appId) {
  const res = await fetch(`/apps/${appId}/team`);
  const team = await res.json();

  const container = document.getElementById("team-members-list");
  container.innerHTML = "";

  team.forEach(m => {
    const socials = Object.entries(m.socials || {})
      .map(([k, v]) => `<a href="${v}" target="_blank">@${k}</a>`)
      .join("");

    container.innerHTML += `
      <div class="team-card">
        <img src="${m.avatar || '/static/img/default-avatar.png'}">
        <div class="team-name">${m.name}</div>
        <div class="team-role">${m.role || ''}</div>
        <div class="team-socials">${socials}</div>
      </div>
    `;
  });
}

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
      // Evitar agregar múltiples listeners
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
  
  // Configurar listeners iniciales
  setupAppClickListeners();
  
  // También configurar para botones que se agreguen dinámicamente
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
      // Actualizar botones activos
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Ocultar todos los contenidos
      tabContents.forEach(c => c.classList.add('hidden'));
      
      // Mostrar contenido correspondiente
      const targetTab = document.getElementById(btn.dataset.tab);
      if (targetTab) {
        targetTab.classList.remove('hidden');
      }
      
      // Re-renderizar si es necesario
      if (btn.dataset.tab === 'communities') {
        renderCommunities();
      }
    });
  });

  // Cerrar modal al hacer clic fuera
  appDetailModal?.addEventListener('click', e => {
    if (e.target === appDetailModal) {
      appDetailModal.classList.add('hidden');
      currentApp = null;
      window.currentApp = null;
    }
  });

  /* ======================================================
     DEBUGGING INICIAL
  ====================================================== */
  setTimeout(() => {
    console.log('🔍 Verificando botones de apps...');
    const appButtons = document.querySelectorAll('.app-item');
    console.log(`✅ Encontrados ${appButtons.length} botones de apps`);
    
    appButtons.forEach((btn, index) => {
      const appId = btn.dataset.appId;
      const isValid = appId && appId !== 'undefined' && appId !== 'null';
      console.log(`App ${index + 1}:`, {
        id: appId,
        isValid: isValid,
        text: btn.querySelector('.app-name')?.textContent || 'Sin nombre'
      });
    });
  }, 500);

  console.log('✅ dashboard.js completamente cargado y listo');
});