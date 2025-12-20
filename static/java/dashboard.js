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
     FETCH APP - CORREGIDO
  ====================================================== */
  async function fetchAppData(appId) {
    const res = await fetch(`/account/get_app/${appId}`);
    const data = await res.json();
    if (!data.success) throw new Error();

    // SOLUCIÓN: Solo establecer arrays vacíos si no existen los campos
    // No sobrescribir datos ya existentes
    if (!data.app.reviews) data.app.reviews = [];
    if (!data.app.communities) data.app.communities = [];
    if (!data.app.team_members) data.app.team_members = [];

    return data.app;
  }

  /* ======================================================
     ABRIR MODAL APP - CORREGIDO
  ====================================================== */
  async function openAppDetail(appId) {
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

    // SOLUCIÓN: Asegurarse de que currentApp.communities existe antes de renderizar
    if (!currentApp.communities) {
      currentApp.communities = [];
    }
    
    // Asegurar que renderCommunities tiene los datos correctos
    renderReviewsAdmin();
    renderCommunities();

    appDetailModal.classList.remove('hidden');
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
     COMMUNITIES - COMPLETAMENTE CORREGIDO
  ====================================================== */
  function renderCommunities() {
    if (!appDetailModal) return;

    const list = appDetailModal.querySelector('.community-list');
    if (!list) return;

    list.innerHTML = '';

    // SOLUCIÓN: Verificar que currentApp y currentApp.communities existan
    if (!currentApp || !currentApp.communities || !currentApp.communities.length) {
      list.innerHTML = '<li>Sin comunidades</li>';
      return;
    }

    currentApp.communities.forEach(c => {
      // SOLUCIÓN: Verificar que cada comunidad tenga un ID válido
      if (!c || !c.id) return;
      
      const li = document.createElement('li');
      
      const a = document.createElement('a');
      a.href = `/community/${c.id}`;
      a.className = 'community-link';
      a.textContent = c.name || 'Comunidad sin nombre';
      a.target = '_blank'; // Para abrir en nueva pestaña (opcional)
      
      // Asegurar que el enlace funcione inmediatamente
      a.addEventListener('click', function(e) {
        if (!this.href || this.href === '#') {
          e.preventDefault();
          alert('Enlace no disponible temporalmente');
          return;
        }
        window.location.href = this.href;
      });
      
      li.appendChild(a);
      list.appendChild(li);
    });
    
    // SOLUCIÓN: Forzar actualización del DOM para asegurar que los enlaces se renderizan
    setTimeout(() => {
      const links = document.querySelectorAll('.community-link');
      links.forEach(link => {
        if (!link.onclick) {
          link.addEventListener('click', function(e) {
            if (!this.href || this.href === '#') {
              e.preventDefault();
              alert('Enlace no disponible temporalmente');
              return;
            }
            window.location.href = this.href;
          });
        }
      });
    }, 50);
  }

  /* ======================================================
     AÑADIR COMUNIDAD - CORREGIDO
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

      // SOLUCIÓN: Asegurar que currentApp.communities existe antes de push
      if (!currentApp.communities) {
        currentApp.communities = [];
      }
      
      currentApp.communities.push(data.community);
      renderCommunities();

      communityNameInput.value = '';
      addCommunityForm.classList.add('hidden');

      // SOLUCIÓN: Forzar actualización del DOM para asegurar que los enlaces se renderizan
      setTimeout(() => {
        const links = document.querySelectorAll('.community-link');
        links.forEach(link => {
          if (!link.onclick) {
            link.addEventListener('click', function(e) {
              if (!this.href || this.href === '#') {
                e.preventDefault();
                alert('Enlace no disponible temporalmente');
                return;
              }
              window.location.href = this.href;
            });
          }
        });
      }, 100);

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
     LISTENER APPS - CORREGIDO
  ====================================================== */
  appsList?.addEventListener('click', async e => {
    const btn = e.target.closest('.app-item');
    if (!btn) return;

    const appId = btn.dataset.appId;
    if (appId) {
      // SOLUCIÓN: Resetear currentApp antes de abrir
      currentApp = null;
      window.currentApp = null;
      
      // Asegurar que el modal está limpio
      const communityList = appDetailModal.querySelector('.community-list');
      if (communityList) {
        communityList.innerHTML = '<li>Cargando comunidades...</li>';
      }
      
      await openAppDetail(appId);
    }
  });

  // Tab switching logic (bound once on load)
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all buttons
      tabBtns.forEach(b => b.classList.remove('active'));
      // Add active to clicked button
      btn.classList.add('active');

      // Hide all tab contents
      tabContents.forEach(c => c.classList.add('hidden'));

      // Show the target tab
      const targetTab = document.querySelector(`#${btn.dataset.tab}`);
      if (targetTab) {
        targetTab.classList.remove('hidden');
      }
    });
  });

  // Close modal on backdrop click (bound once)
  appDetailModal?.addEventListener('click', e => {
    if (e.target === appDetailModal) {
      appDetailModal.classList.add('hidden');
    }
  });

});