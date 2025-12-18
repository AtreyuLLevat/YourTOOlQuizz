document.addEventListener('DOMContentLoaded', () => {

  /* ======================================================
     ESTADO GLOBAL
  ====================================================== */
  let currentApp = null;

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

  /* ======================================================
     MODAL CREAR APP
  ====================================================== */
  newAppBtn?.addEventListener('click', () => {
    createAppModal.classList.remove('hidden');
  });

  cancelAppBtn?.addEventListener('click', () => {
    createAppModal.classList.add('hidden');
  });

  createAppModal?.addEventListener('click', (e) => {
    if (e.target === createAppModal) {
      createAppModal.classList.add('hidden');
    }
  });

  /* ======================================================
     AÑADIR TEAM MEMBERS
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
  createAppForm?.addEventListener('submit', async (e) => {
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
      const res = await fetch('/account/create_app', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!data.success) return alert(data.message || 'Error');

      const btn = document.createElement('button');
      btn.className = 'app-item';
      btn.dataset.appId = data.app.id;
      btn.innerHTML = `
        <img src="${data.app.image_url}" class="app-img">
        <span class="app-name">${data.app.name}</span>
      `;
      btn.onclick = () => openAppDetail(data.app.id);

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
    const res = await fetch(`/account/get_app/${appId}`);
    const data = await res.json();
    if (!data.success) throw new Error();
    data.app.reviews ||= [];
    return data.app;
  }

  /* ======================================================
     ABRIR MODAL APP
  ====================================================== */
async function openAppDetail(appId) {
  try {
    currentApp = await fetchAppData(appId);
  } catch {
    return alert('Error cargando app');
  }

  const appDetailModal = document.getElementById('appDetailModal');
  const modalContent = appDetailModal?.querySelector('.modal-content');
  if (!modalContent) return;

  modalContent.dataset.appId = appId;

  // Elementos del modal
  const appNameEl = modalContent.querySelector('.app-name');
  const appDescEl = modalContent.querySelector('.app-description');
  const appDateEl = modalContent.querySelector('.app-date');
  const appThemeEl = modalContent.querySelector('.app-theme');
  const teamContainerEl = modalContent.querySelector('#team-members-container');

  if (appNameEl) appNameEl.textContent = currentApp.name || '---';
  if (appDescEl) appDescEl.textContent = currentApp.description || '---';
  if (appDateEl) appDateEl.textContent = currentApp.creation_date || '---';
  if (appThemeEl) appThemeEl.textContent = `Tema: ${currentApp.theme || 'General'}`;

  // TEAM MEMBERS
  if (teamContainerEl) {
    teamContainerEl.innerHTML = '';
    if (!currentApp.team_members || !currentApp.team_members.length) {
      teamContainerEl.innerHTML = '<p>Sin miembros</p>';
    } else {
      currentApp.team_members.forEach(m => {
        const div = document.createElement('div');
        div.textContent = `${m.name} - ${m.role || ''}`;
        teamContainerEl.appendChild(div);
      });
    }
  }

  renderReviewsAdmin();
  renderCommunities();

  appDetailModal.classList.remove('hidden');
}

/* ======================================================
   REVIEWS ADMIN
====================================================== */
function renderReviewsAdmin() {
  const reviewsList = document.getElementById('reviews-list');
  const reviewsCount = document.querySelector('.reviews-count');

  if (!reviewsList || !reviewsCount) return;

  reviewsList.innerHTML = '';

  if (!currentApp.reviews || !currentApp.reviews.length) {
    reviewsList.innerHTML = '<p>Sin reseñas</p>';
    reviewsCount.textContent = '(0)';
    return;
  }

  currentApp.reviews.forEach(r => {
    const div = document.createElement('div');
    div.className = 'review-item';
    div.dataset.reviewId = r.id;
    div.innerHTML = `
      <div style="display:flex; justify-content:space-between;">
        <strong>@${r.username || 'Usuario'}</strong>
        <span>⭐ ${r.rating}</span>
      </div>
      <textarea class="review-content">${r.content || ''}</textarea>
      <div style="margin-top:6px; display:flex; gap:8px;">
        <button class="save-review-btn">Guardar</button>
        <button class="delete-review-btn">Eliminar</button>
      </div>
    `;
    reviewsList.appendChild(div);
  });

  reviewsCount.textContent = `(${currentApp.reviews.length})`;
}

/* ======================================================
   COMMUNITIES
====================================================== */
function renderCommunities() {
  const list = document.querySelector('.community-list');
  if (!list) return;

  list.innerHTML = '';

  if (!currentApp.communities || !currentApp.communities.length) {
    list.innerHTML = '<li>Sin comunidades</li>';
    return;
  }

  currentApp.communities.forEach(c => {
    const li = document.createElement('li');
    li.textContent = c.name;
    list.appendChild(li);
  });
}

const addCommunityBtn = document.getElementById('addCommunityBtn');
const addCommunityForm = document.getElementById('addCommunityForm');
const saveCommunityBtn = document.getElementById('saveCommunityBtn');
const communityNameInput = document.getElementById('communityNameInput');

addCommunityBtn?.addEventListener('click', () => {
  addCommunityForm.classList.toggle('hidden');
});

saveCommunityBtn?.addEventListener('click', async () => {
  const name = communityNameInput.value.trim();
  if (!name) return alert('Nombre obligatorio');

const appId = document
  .getElementById('appDetailModal')
  ?.dataset.appId;

  if (!appId) return alert('App no válida');

  try {
    const res = await fetch(`/apps/${appId}/create_community`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });

    const data = await res.json();
    if (!data.success) return alert(data.error);

    // Añadir sin recargar
    currentApp.communities.push(data.community);
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
  const appDetailModal = document.getElementById('appDetailModal');
  if (appDetailModal) appDetailModal.classList.add('hidden');
  currentApp = null;
});

})