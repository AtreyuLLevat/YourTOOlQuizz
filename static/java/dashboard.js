// static/java/dashboard.js (versión simplificada)
import { communitiesManager } from './communities.js';

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
    
    if (!data.success) {
      console.error('❌ Error en fetchAppData:', data.error);
      throw new Error(data.error || 'Error cargando app');
    }

    console.log('📦 Datos recibidos del backend:', {
      appId: data.app.id,
      name: data.app.name,
      communitiesCount: data.app.communities?.length || 0,
      communities: data.app.communities
    });

    // Solo inicializar si no existen
    if (!data.app.reviews) data.app.reviews = [];
    if (!data.app.communities) {
      console.warn('⚠️ No hay comunidades en la respuesta del backend');
      data.app.communities = [];
    }
    if (!data.app.team_members) data.app.team_members = [];

    return data.app;
  }

  /* ======================================================
     ABRIR MODAL APP
  ====================================================== */
  async function openAppDetail(appId) {
    console.log(`🚀 Abriendo detalle de app: ${appId}`);
    
    try {
      currentApp = await fetchAppData(appId);
      window.currentApp = currentApp;
    } catch (error) {
      console.error('❌ Error en openAppDetail:', error);
      return alert(`Error cargando app: ${error.message}`);
    }

    if (!appDetailModal) {
      console.error('❌ No se encontró el modal appDetailModal');
      return;
    }
    
    appDetailModal.dataset.appId = appId;

    const appNameEl = appDetailModal.querySelector('.app-name');
    if (appNameEl) appNameEl.textContent = currentApp.name || '---';

    const appDescEl = appDetailModal.querySelector('.app-description');
    if (appDescEl) appDescEl.textContent = currentApp.description || '---';

    const appDateEl = appDetailModal.querySelector('.app-date');
    if (appDateEl) appDateEl.textContent = currentApp.creation_date || '---';

    const appThemeEl = appDetailModal.querySelector('.app-theme');
    if (appThemeEl) appThemeEl.textContent = `Tema: ${currentApp.theme || 'General'}`;

    // DEPURACIÓN: Verificar comunidades antes de renderizar
    console.log('📊 Comunidades para renderizar:', {
      hasCurrentApp: !!currentApp,
      hasCommunities: !!currentApp.communities,
      communitiesCount: currentApp.communities?.length || 0,
      communities: currentApp.communities
    });

    if (!currentApp.communities) {
      console.warn('⚠️ currentApp.communities es undefined, inicializando array vacío');
      currentApp.communities = [];
    }

    // Usar el CommunitiesManager
    communitiesManager.init(currentApp, appDetailModal);
    communitiesManager.renderCommunities();

    renderReviewsAdmin();

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

    if (!currentApp.reviews.length) {
      reviewsList.innerHTML = '<p>Sin reseñas</p>';
      reviewsCount.textContent = '(0)';
      return;
    }

    currentApp.reviews.forEach(r => {
      const div = document.createElement('div');
      div.className = 'review-item';
      div.innerHTML = `
        <div style="display:flex; justify-content:space-between;">
          <strong>@${r.username || 'Usuario'}</strong>
          <span>⭐ ${r.rating}</span>
        </div>
        <textarea class="review-content">${r.content || ''}</textarea>
      `;
      reviewsList.appendChild(div);
    });

    reviewsCount.textContent = `(${currentApp.reviews.length})`;
  }

  /* ======================================================
     AÑADIR COMUNIDAD (usando el manager)
  ====================================================== */
  addCommunityBtn?.addEventListener('click', () => {
    addCommunityForm.classList.toggle('hidden');
  });

  saveCommunityBtn?.addEventListener('click', async () => {
    const name = communityNameInput.value.trim();
    if (!name) return alert('Nombre obligatorio');

    const appId = appDetailModal?.dataset.appId;
    if (!appId) return alert('App no válida');

    const community = await communitiesManager.addCommunity(name, appId);
    
    if (community) {
      communityNameInput.value = '';
      addCommunityForm.classList.add('hidden');
    }
  });

  /* ======================================================
     CERRAR MODAL
  ====================================================== */
  closeAppDetail?.addEventListener('click', () => {
    appDetailModal.classList.add('hidden');
    currentApp = null;
    window.currentApp = null;
    console.log('🔒 Modal cerrado');
  });

  /* ======================================================
     LISTENER APPS
  ====================================================== */
  appsList?.addEventListener('click', e => {
    const btn = e.target.closest('.app-item');
    if (!btn) return;

    const appId = btn.dataset.appId;
    if (appId) {
      console.log('🖱️ Click en app:', appId);
      openAppDetail(appId);
    }
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
    });
  });

  // Close modal on backdrop click
  appDetailModal?.addEventListener('click', e => {
    if (e.target === appDetailModal) {
      appDetailModal.classList.add('hidden');
    }
  });

  // DEBUG: Verificar que todo esté cargado
  console.log('✅ dashboard.js cargado completamente');
});