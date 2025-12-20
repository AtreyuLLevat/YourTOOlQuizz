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

  const teamContainer = document.getElementById('team-members-container');
  const addMemberBtn = document.getElementById('addMemberBtn');

  const appDetailModal = document.getElementById('appDetailModal');
  const closeAppDetail = document.getElementById('closeAppDetail');

  const addCommunityBtn = document.getElementById('addCommunityBtn');
  const addCommunityForm = document.getElementById('addCommunityForm');
  const saveCommunityBtn = document.getElementById('saveCommunityBtn');
  const communityNameInput = document.getElementById('communityNameInput');

  /* ======================================================
     MODAL CREAR APP
  ====================================================== */
  newAppBtn?.addEventListener('click', () => createAppModal.classList.remove('hidden'));
  cancelAppBtn?.addEventListener('click', () => createAppModal.classList.add('hidden'));
  createAppModal?.addEventListener('click', e => {
    if (e.target === createAppModal) createAppModal.classList.add('hidden');
  });

  /* ======================================================
     TEAM MEMBERS
  ====================================================== */
  addMemberBtn?.addEventListener('click', () => {
    const div = document.createElement('div');
    div.className = 'team-member-entry';
    div.innerHTML = `
      <input type="text" placeholder="Nombre" required>
      <input type="text" placeholder="Rol">
      <input type="url" placeholder="URL Avatar">
      <button type="button" class="remove-member-btn">Eliminar</button>
    `;
    teamContainer.appendChild(div);
    div.querySelector('.remove-member-btn').onclick = () => div.remove();
  });

  /* ======================================================
     CREAR APP
  ====================================================== */
  createAppForm?.addEventListener('submit', async e => {
    e.preventDefault();

    const formData = new FormData(createAppForm);
    const members = [];

    document.querySelectorAll('.team-member-entry').forEach(div => {
      const inputs = div.querySelectorAll('input');
      if (inputs[0].value.trim()) {
        members.push({
          name: inputs[0].value.trim(),
          role: inputs[1].value.trim(),
          avatar_url: inputs[2].value.trim()
        });
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
    console.log(`🚀 Abriendo detalle de app: ${appId}`);
    
    try {
      currentApp = await fetchAppData(appId);
      window.currentApp = currentApp;
    } catch {
      return alert('Error cargando app');
    }

    if (!appDetailModal) return;
    appDetailModal.dataset.appId = appId;

    const appNameEl = appDetailModal.querySelector('.app-name');
    if (appNameEl) appNameEl.textContent = currentApp.name || '---';

    const appDescEl = appDetailModal.querySelector('.app-description');
    if (appDescEl) appDescEl.textContent = currentApp.description || '---';

    const appDateEl = appDetailModal.querySelector('.app-date');
    if (appDateEl) appDateEl.textContent = currentApp.creation_date || '---';

    const appThemeEl = appDetailModal.querySelector('.app-theme');
    if (appThemeEl) appThemeEl.textContent = `Tema: ${currentApp.theme || 'General'}`;

    // Asegurar que currentApp.communities existe
    if (!currentApp.communities) {
      currentApp.communities = [];
    }

    renderReviewsAdmin();
    renderCommunities();

    appDetailModal.classList.remove('hidden');
    console.log('✅ Modal abierto exitosamente');
  }

  /* ======================================================
     REVIEWS
  ====================================================== */
function renderReviewsAdmin() {
  const reviewsList = document.getElementById('reviews-list');
  const reviewsCount = document.querySelector('.reviews-count');
  if (!reviewsList || !reviewsCount) return;

  reviewsList.innerHTML = '';

  if (!currentApp.reviews || !currentApp.reviews.length) {
    reviewsList.innerHTML = `
      <div class="no-reviews-message">
        <div class="icon">💬</div>
        <h3>Sin reseñas aún</h3>
        <p>Esta app no tiene reseñas. Los usuarios podrán añadirlas cuando prueben tu aplicación.</p>
      </div>
    `;
    reviewsCount.textContent = '(0)';
    return;
  }

  currentApp.reviews.forEach((r, index) => {
    const card = document.createElement('div');
    card.className = 'review-card';
    card.dataset.reviewId = r.id;  // 🔥 imprescindible

    // Determinar estado basado en rating
    let statusClass = 'neutral';
    let statusText = 'Neutral';
    if (r.rating >= 4) {
      statusClass = 'positive';
      statusText = 'Positivo';
    } else if (r.rating <= 2) {
      statusClass = 'negative';
      statusText = 'Negativo';
    }

    // Crear estrellas visuales
    const stars = '⭐'.repeat(r.rating) + '☆'.repeat(5 - r.rating);

    // Iniciales de usuario
    const initials = r.username ? r.username.charAt(0).toUpperCase() : 'U';

    // Formatear fecha
    const reviewDate = r.created_at ? new Date(r.created_at).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'short', year: 'numeric'
    }) : 'Fecha no disponible';

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

    // 🔥 Evento click para abrir menú de acciones
    card.addEventListener('click', (e) => {
      e.stopPropagation();
      openReviewActionsMenu(e, r.id);
    });

    // Animación escalonada
    card.style.animationDelay = `${index * 0.05}s`;

    reviewsList.appendChild(card);
  });

  reviewsCount.textContent = `(${currentApp.reviews.length})`;

  // Resumen de estrellas en el header
  const starsElement = document.querySelector('.stars');
  if (starsElement && currentApp.reviews.length > 0) {
    const avgRating = (currentApp.reviews.reduce((sum, r) => sum + r.rating, 0) / currentApp.reviews.length).toFixed(1);
    starsElement.innerHTML = `
      <span style="display:flex;align-items:center;gap:4px;">
        <span style="color:#f59e0b;font-size:18px;">${'★'.repeat(Math.floor(avgRating))}${'☆'.repeat(5 - Math.floor(avgRating))}</span>
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

    // Limpiar completamente
    list.innerHTML = '';

    if (!currentApp || !currentApp.communities || !currentApp.communities.length) {
      console.log('ℹ️ No hay comunidades para mostrar');
      list.innerHTML = '<li class="no-communities">Sin comunidades creadas</li>';
      return;
    }

    console.log(`🔄 Renderizando ${currentApp.communities.length} comunidades`);
    
    // Crear tarjetas minimalistas modernas
    currentApp.communities.forEach(community => {
      if (!community || !community.id) return;
      
      // Crear contenedor de tarjeta
      const li = document.createElement('li');
      li.className = 'community-card-container';
      li.style.cssText = 'margin-bottom: 16px; list-style: none;';
      
      // Crear el enlace como tarjeta
      const a = document.createElement('a');
      a.href = `/community/${community.id}`;
      a.className = 'community-card';
      a.target = '_blank';
      
      // Contenido de la tarjeta
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
      
      // Estilos hover elegante
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
      
      // Estilos para el contenido interno
      const cardContent = a.querySelector('.community-card-content');
      if (cardContent) {
        cardContent.style.cssText = `
          flex: 1;
          min-width: 0;
        `;
      }
      
      const cardName = a.querySelector('.community-card-name');
      if (cardName) {
        cardName.style.cssText = `
          font-size: 16px;
          font-weight: 600;
          color: #111827;
          margin-bottom: 4px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        `;
      }
      
      const cardMeta = a.querySelector('.community-card-meta');
      if (cardMeta) {
        cardMeta.style.cssText = `
          font-size: 14px;
          color: #6b7280;
          font-weight: 400;
        `;
      }
      
      const cardArrow = a.querySelector('.community-card-arrow');
      if (cardArrow) {
        cardArrow.style.cssText = `
          font-size: 20px;
          color: #374151;
          font-weight: 300;
          margin-left: 16px;
          transition: transform 0.2s ease;
        `;
        
        // Animación de la flecha en hover
        a.addEventListener('mouseenter', () => {
          cardArrow.style.transform = 'translateX(4px)';
        });
        
        a.addEventListener('mouseleave', () => {
          cardArrow.style.transform = 'translateX(0)';
        });
      }
      
      // Evento de clic
      a.addEventListener('click', (e) => {
        console.log(`🔗 Navegando a comunidad: ${community.name} (ID: ${community.id})`);
      });
      
      li.appendChild(a);
      list.appendChild(li);
    });
    
    console.log(`✅ Se crearon ${list.children.length} tarjetas de comunidad`);
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

  // Función de test actualizada
  window.testCommunities = function() {
    console.log('=== TEST COMUNIDADES ===');
    console.log('1. currentApp:', currentApp);
    console.log('2. currentApp.communities:', currentApp?.communities);
    
    const list = appDetailModal?.querySelector('.community-list');
    console.log('3. Lista HTML:', list?.innerHTML);
    
    const links = list?.querySelectorAll('a') || [];
    console.log('4. Enlaces encontrados:', links.length);
    
    console.log('5. Ejecutando renderCommunities()...');
    renderCommunities();
    
    console.log('=== FIN TEST ===');
  };

  console.log('✅ dashboard.js cargado completamente');
});