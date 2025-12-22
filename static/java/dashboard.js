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

  /* ======================================================
     BÚSQUEDA DE USUARIOS PARA EQUIPO
  ====================================================== */
  let searchTimeout;
  let currentSearchResults = [];

  // Búsqueda en tiempo real de usuarios
  userSearchInput?.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      userSearchResults.style.display = 'none';
      return;
    }

    // Debounce para no hacer demasiadas peticiones
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`/search_users?q=${encodeURIComponent(query)}`);
        const users = await res.json();
        currentSearchResults = users;

        if (users.length === 0) {
          userSearchResults.style.display = 'none';
          return;
        }

        userSearchResults.innerHTML = '';
        users.forEach(user => {
          const div = document.createElement('div');
          div.className = 'user-search-result';
          div.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px; padding: 8px;">
              ${user.avatar_url ? `<img src="${user.avatar_url}" style="width:32px;height:32px;border-radius:50%;">` : ''}
              <div>
                <strong>${user.name}</strong>
                <div style="font-size: 0.85rem; color: #64748b;">${user.email}</div>
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

  // Agregar miembro al equipo
  function addTeamMember(user) {
    const role = userRoleSelect.value;
    const memberId = `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const memberDiv = document.createElement('div');
    memberDiv.className = 'team-member-entry';
    memberDiv.dataset.memberId = memberId;
    memberDiv.dataset.userId = user.id;
    
    memberDiv.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 10px; background: #f8fafc; border-radius: 8px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          ${user.avatar_url ? `<img src="${user.avatar_url}" style="width:36px;height:36px;border-radius:50%;">` : ''}
          <div>
            <div style="font-weight: 500;">${user.name}</div>
            <div style="font-size: 0.85rem; color: #64748b;">${user.email} • ${role}</div>
          </div>
        </div>
        <button type="button" class="remove-member-btn" style="background: #ef4444; color: white; border: none; padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
          Eliminar
        </button>
      </div>
      <input type="hidden" name="team_members[${memberId}][name]" value="${user.name}">
      <input type="hidden" name="team_members[${memberId}][role]" value="${role}">
      <input type="hidden" name="team_members[${memberId}][avatar_url]" value="${user.avatar_url || ''}">
      <input type="hidden" name="team_members[${memberId}][user_id]" value="${user.id}">
    `;
    
    memberDiv.querySelector('.remove-member-btn').onclick = () => memberDiv.remove();
    teamContainer.appendChild(memberDiv);
  }

  // Botón para agregar usuario manualmente si no se encuentra en búsqueda
  addUserBtn?.addEventListener('click', () => {
    const query = userSearchInput.value.trim();
    
    if (query && currentSearchResults.length > 0) {
      // Agregar el primer resultado de búsqueda
      addTeamMember(currentSearchResults[0]);
      userSearchInput.value = '';
      userSearchResults.style.display = 'none';
    } else if (query) {
      // Si no hay resultados pero hay texto, agregar como miembro manual
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

  // Ocultar resultados al hacer clic fuera
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
    // Limpiar campos al abrir
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

    try {
      const res = await fetch('/account/create_app', { method: 'POST', body: formData });
      const data = await res.json();
      if (!data.success) return alert(data.message || 'Error');

      const btn = document.createElement('button');
      btn.className = 'app-item';
      btn.dataset.appId = data.app.id;
      btn.innerHTML = `
        <img src="${data.app.image_url}" class="app-img">
        <span class="app-name">${data.app.name}</span>
      `;
      appsList.prepend(btn);

      createAppForm.reset();
      teamContainer.innerHTML = '';
      createAppModal.classList.add('hidden');

    } catch {
      alert('Error de red');
    }
  });

  /* ======================================================
     FETCH APP
  ====================================================== */
  async function fetchAppData(appId) {
    console.log(`🔍 Fetching app data for ID: ${appId}`);
    const res = await fetch(`/account/get_app/${appId}`);
    const data = await res.json();
    if (!data.success) throw new Error();

    // Solo establecer arrays vacíos si no existen
    if (!data.app.reviews) data.app.reviews = [];
    if (!data.app.communities) data.app.communities = [];
    if (!data.app.team_members) data.app.team_members = [];

    return data.app;
  }

  /* ======================================================
     ABRIR MODAL APP - VERSIÓN SIMPLIFICADA
  ====================================================== */
  async function openAppDetail(appId) {
    if (!appId) return;

    try {
      currentApp = await fetchAppData(appId);
      window.currentApp = currentApp;

      // Asegurar arrays vacíos
      if (!currentApp.reviews) currentApp.reviews = [];
      if (!currentApp.communities) currentApp.communities = [];
      if (!currentApp.team_members) currentApp.team_members = [];

    } catch (err) {
      return alert('Error cargando app');
    }

    if (!appDetailModal) return;
    appDetailModal.dataset.appId = appId;

    // Actualizar datos básicos
    if (appDetailModal) {
      const appNameEl = appDetailModal.querySelector('.app-name');
      if (appNameEl) appNameEl.textContent = currentApp.name ? currentApp.name : '---';

      const appDescEl = appDetailModal.querySelector('.app-description');
      if (appDescEl) appDescEl.textContent = currentApp.description ? currentApp.description : '---';

      const appDateEl = appDetailModal.querySelector('.app-date');
      if (appDateEl) appDateEl.textContent = currentApp.creation_date ? currentApp.creation_date : '---';

      const appThemeEl = appDetailModal.querySelector('.app-theme');
      if (appThemeEl) appThemeEl.textContent = "Tema: " + (currentApp.theme ? currentApp.theme : "General");
    }

    renderReviewsAdmin(); 
    renderCommunities();

    appDetailModal.classList.remove('hidden');
    console.log('✅ Modal abierto correctamente con reviews y estrellas sincronizadas');
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

    // Crear cards de reseña
    currentApp.reviews.forEach((r, index) => {
      const card = document.createElement('div');
      card.className = 'review-card';
      card.dataset.reviewId = r.id;

      let statusClass = 'neutral';
      let statusText = 'Neutral';
      if (Number(r.rating) >= 4) {
        statusClass = 'positive';
        statusText = 'Positivo';
      } else if (Number(r.rating) <= 2) {
        statusClass = 'negative';
        statusText = 'Negativo';
      }

      const stars = '⭐'.repeat(Number(r.rating)) + '☆'.repeat(5 - Number(r.rating));
      const initials = r.username ? r.username.charAt(0).toUpperCase() : 'U';
      const reviewDate = r.created_at ? new Date(r.created_at).toLocaleDateString('es-ES', { day:'numeric', month:'short', year:'numeric' }) : 'Fecha no disponible';

      card.innerHTML = `
        <div class="review-status ${statusClass}">${statusText}</div>
        <div class="review-header">
          <div class="review-user-info">
            <div class="review-avatar">${initials}</div>
            <div class="review-user-details">
              <div class="review-username">@${r.username || 'Usuario'}</div>
              <div class="review-date">${reviewDate}</div>
            </div>
          </div>
          <div class="review-rating">
            <span class="star-icon">${stars}</span>
            <span class="rating-value">${r.rating}/5</span>
          </div>
        </div>
        <div class="review-content">${r.content || 'Sin comentario'}</div>
      `;
      reviewsList.appendChild(card);
    });

    // Actualizar contador y promedio
    reviewsCount.textContent = `(${currentApp.reviews.length})`;
    if (starsElement) {
      const avgRating = (
        currentApp.reviews.reduce((sum, r) => sum + Number(r.rating), 0) / currentApp.reviews.length
      ).toFixed(1);
      starsElement.innerHTML = `
        <span style="display:flex;align-items:center;gap:4px;">
          <span style="color:#f59e0b;font-size:18px;">
            ${'★'.repeat(Math.floor(avgRating))}${'☆'.repeat(5 - Math.floor(avgRating))}
          </span>
          <span style="font-weight:600;color:#1e293b;">${avgRating}</span>
          <span style="color:#64748b;font-size:14px;">(${currentApp.reviews.length} ${currentApp.reviews.length === 1 ? 'reseña' : 'reseñas'})</span>
        </span>
      `;
    }
  }

  // ---------------------------
  // Menú flotante y eliminación
  // ---------------------------
  function closeReviewActionsMenu() {
    document.getElementById('review-actions-menu')?.remove();
  }

  document.addEventListener('click', closeReviewActionsMenu);

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

  async function deleteReview(reviewId) {
    if (!confirm('¿Eliminar esta reseña definitivamente?')) return;

    const appId = appDetailModal.dataset.appId;

    try {
      const res = await fetch(`/account/review/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (!data.success) return alert(data.error);

      // Eliminar del estado local
      currentApp.reviews = currentApp.reviews.filter(r => r.id !== reviewId);

      renderReviewsAdmin();
    } catch {
      alert('Error eliminando reseña');
    }
  }

  /* ======================================================
     COMMUNITIES - ESTILO MINIMALISTA MODERNO
  ====================================================== */
  function renderCommunities() {
    console.log('🎯 EJECUTANDO renderCommunities()');

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

    if (!currentApp || !currentApp.communities || !currentApp.communities.length) {
      console.log('ℹ️ No hay comunidades para mostrar');
      list.innerHTML = '<li class="no-communities">Sin comunidades creadas</li>';
      return;
    }

    console.log(`🔄 Renderizando ${currentApp.communities.length} comunidades`);

    currentApp.communities.forEach(community => {
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

      // Estilos minimalistas modernos
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

      // Hover elegante
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

      const cardContent = a.querySelector('.community-card-content');
      if (cardContent) cardContent.style.cssText = 'flex: 1; min-width: 0;';

      const cardName = a.querySelector('.community-card-name');
      if (cardName) cardName.style.cssText = `
        font-size: 16px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      `;

      const cardMeta = a.querySelector('.community-card-meta');
      if (cardMeta) cardMeta.style.cssText = 'font-size: 14px; color: #6b7280; font-weight: 400;';

      const cardArrow = a.querySelector('.community-card-arrow');
      if (cardArrow) {
        cardArrow.style.cssText = `
          font-size: 20px;
          color: #374151;
          font-weight: 300;
          margin-left: 16px;
          transition: transform 0.2s ease;
        `;
        a.addEventListener('mouseenter', () => cardArrow.style.transform = 'translateX(4px)');
        a.addEventListener('mouseleave', () => cardArrow.style.transform = 'translateX(0)');
      }

      // Menú de acciones para eliminar
      a.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openCommunityActionsMenu(e, community.id);
      });

      li.appendChild(a);
      list.appendChild(li);
    });

    console.log(`✅ Se crearon ${list.children.length} tarjetas de comunidad`);
  }

  // Menu contextual para eliminar comunidad
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
    document.getElementById('community-actions-menu')?.remove();
  }

  document.addEventListener('click', closeCommunityActionsMenu);

  async function deleteCommunity(communityId) {
    if (!confirm('¿Eliminar esta comunidad definitivamente?')) return;

    try {
      const res = await fetch(`/account/community/${communityId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (!data.success) return alert(data.error);

      currentApp.communities = currentApp.communities.filter(c => c.id !== communityId);
      renderCommunities();
    } catch {
      alert('Error eliminando comunidad');
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
    if (!name) return alert('Nombre obligatorio');

    const appId = appDetailModal?.dataset.appId;
    if (!appId) return alert('App no válida');

    try {
      const res = await fetch(`/apps/${appId}/create_community`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });

      const data = await res.json();
      if (!data.success) return alert(data.error);

      // Asegurar que currentApp.communities existe
      if (!currentApp.communities) {
        currentApp.communities = [];
      }
      
      // Agregar nueva comunidad
      currentApp.communities.push(data.community);
      
      // Re-renderizar
      renderCommunities();

      communityNameInput.value = '';
      addCommunityForm.classList.add('hidden');

    } catch {
      alert('Error de red');
    }
  });

  /* ======================================================
     CERRAR MODAL
  ====================================================== */
  closeAppDetail?.addEventListener('click', () => {
    appDetailModal.classList.add('hidden');
    currentApp = null;
    window.currentApp = null;
  });

  /* ======================================================
     LISTENER APPS
  ====================================================== */
  appsList?.addEventListener('click', e => {
    const btn = e.target.closest('.app-item');
    if (!btn) return;

    const appId = btn.dataset.appId;
    if (appId) openAppDetail(appId);
  });

  // Tab switching logic
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      tabContents.forEach(c => c.classList.add('hidden'));

      const targetTab = document.querySelector(`#${btn.dataset.tab}`);
      if (targetTab) {
        targetTab.classList.remove('hidden');
      }

      // 🔥 CLAVE: Re-renderizar comunidades al cambiar a esa pestaña
      if (btn.dataset.tab === 'communities') {
        renderCommunities();
      }
    });
  });

  // Close modal on backdrop click
  appDetailModal?.addEventListener('click', e => {
    if (e.target === appDetailModal) {
      appDetailModal.classList.add('hidden');
    }
  });

  console.log('✅ dashboard.js cargado completamente con sistema de búsqueda de usuarios');
});