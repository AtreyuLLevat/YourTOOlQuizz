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

    // SOLUCIÓN: Solo establecer arrays vacíos si no existen los campos
    if (!data.app.reviews) data.app.reviews = [];
    if (!data.app.communities) data.app.communities = [];
    if (!data.app.team_members) data.app.team_members = [];

    return data.app;
  }

  /* ======================================================
     ABRIR MODAL APP - CORREGIDO
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

    // PRIMERO: Limpiar completamente el contenido
    const communityList = appDetailModal.querySelector('.community-list');
    if (communityList) {
      communityList.innerHTML = '';
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
     COMMUNITIES - SOLUCIÓN DEFINITIVA
  ====================================================== */
  function renderCommunities() {
    console.log('🎯 INICIANDO renderCommunities()');
    
    if (!appDetailModal) {
      console.error('❌ appDetailModal no encontrado');
      return;
    }

    const list = appDetailModal.querySelector('.community-list');
    if (!list) {
      console.error('❌ No se encontró .community-list en el modal');
      return;
    }

    // LIMPIAR COMPLETAMENTE
    list.innerHTML = '';

    // Validación exhaustiva
    if (!currentApp) {
      console.error('❌ currentApp es null/undefined');
      list.innerHTML = '<li>Error: App no cargada</li>';
      return;
    }

    if (!currentApp.communities) {
      console.warn('⚠️ currentApp.communities es undefined');
      currentApp.communities = [];
    }

    if (!currentApp.communities.length) {
      console.log('ℹ️ No hay comunidades para mostrar');
      list.innerHTML = '<li>Sin comunidades</li>';
      return;
    }

    console.log(`🔄 Renderizando ${currentApp.communities.length} comunidades`);
    
    // USAR INNERHTML PARA ASEGURAR QUE SE RENDERICE CORRECTAMENTE
    let communitiesHTML = '';
    
    currentApp.communities.forEach(c => {
      if (!c || !c.id) {
        console.warn('⚠️ Comunidad sin ID válido:', c);
        return;
      }
      
      const communityUrl = `/community/${c.id}`;
      communitiesHTML += `
        <li style="margin-bottom: 10px;">
          <a href="${communityUrl}" 
             class="community-link" 
             target="_blank"
             style="
               display: block;
               padding: 10px 15px;
               background: #2563eb;
               color: white;
               text-decoration: none;
               border-radius: 6px;
               font-weight: 500;
               text-align: center;
               transition: background 0.2s;
               cursor: pointer;
             "
             onmouseover="this.style.background='#1d4ed8'"
             onmouseout="this.style.background='#2563eb'">
            ${c.name || 'Comunidad sin nombre'}
          </a>
        </li>
      `;
    });
    
    list.innerHTML = communitiesHTML;
    
    // AGREGAR EVENT LISTENERS DESPUÉS DE RENDERIZAR
    setTimeout(() => {
      const links = list.querySelectorAll('.community-link');
      links.forEach(link => {
        link.addEventListener('click', function(e) {
          console.log(`🔗 Navegando a: ${this.href}`);
          // Permitir que el navegador maneje el enlace
        });
      });
    }, 100);
    
    console.log('✅ Comunidades renderizadas exitosamente');
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
      
      // RE-RENDERIZAR comunidades
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
    });
  });

  // Close modal on backdrop click
  appDetailModal?.addEventListener('click', e => {
    if (e.target === appDetailModal) {
      appDetailModal.classList.add('hidden');
    }
  });

  console.log('✅ dashboard.js cargado completamente');
});
// TEST FUNCIONAL
window.testCommunities = function() {
  console.log('=== TEST COMUNIDADES ===');
  console.log('1. currentApp:', currentApp);
  console.log('2. currentApp.communities:', currentApp?.communities);
  console.log('3. Lista HTML:', document.querySelector('.community-list')?.innerHTML);
  console.log('4. Enlaces encontrados:', document.querySelectorAll('.community-link').length);
  
  // Forzar renderizado
  if (currentApp) {
    console.log('🔄 Forzando renderCommunities()');
    renderCommunities();
  }
  console.log('=== FIN TEST ===');
};