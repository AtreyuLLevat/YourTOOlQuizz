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

    const modalContent = document.querySelector('#appDetailModal .modal-content');
    if (modalContent) modalContent.dataset.appId = appId;

    document.querySelector('#appDetailModal .app-name').textContent = currentApp.name;
    document.querySelector('#appDetailModal .app-description').textContent =
      currentApp.description || '';
    document.querySelector('#appDetailModal .app-date').textContent =
      currentApp.creation_date || '---';
    document.querySelector('#appDetailModal .app-theme').textContent =
      `Tema: ${currentApp.theme || 'General'}`;

    // TEAM
    teamContainer.innerHTML = '';
    if (!currentApp.team_members.length) {
      teamContainer.innerHTML = '<p>Sin miembros</p>';
    } else {
      currentApp.team_members.forEach(m => {
        const div = document.createElement('div');
        div.innerHTML = `<strong>${m.name}</strong> - ${m.role || ''}`;
        teamContainer.appendChild(div);
      });
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
    reviewsList.innerHTML = '';

    if (!currentApp.reviews.length) {
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
        <textarea class="review-content">${r.content}</textarea>
        <div style="margin-top:6px; display:flex; gap:8px;">
          <button class="save-review-btn">Guardar</button>
          <button class="delete-review-btn">Eliminar</button>
        </div>
      `;
      reviewsList.appendChild(div);
    });

    reviewsCount.textContent = `(${currentApp.reviews.length})`;
  }

  document.addEventListener('click', async (e) => {

    // GUARDAR RESEÑA
    if (e.target.classList.contains('save-review-btn')) {
      const item = e.target.closest('.review-item');
      const id = item.dataset.reviewId;
      const content = item.querySelector('.review-content').value.trim();
      if (!content) return alert('Vacío');

      try {
        const res = await fetch(`/reviews/${id}/edit`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content })
        });
        const data = await res.json();
        if (!data.success) throw new Error();

        const r = currentApp.reviews.find(r => r.id === id);
        if (r) r.content = content;

        alert('Reseña actualizada ✅');
      } catch {
        alert('Error al guardar');
      }
    }

    // ELIMINAR RESEÑA
    if (e.target.classList.contains('delete-review-btn')) {
      const item = e.target.closest('.review-item');
      const id = item.dataset.reviewId;
      if (!confirm('¿Eliminar esta reseña?')) return;

      try {
        const res = await fetch(`/reviews/${id}/delete`, { method: 'DELETE' });
        const data = await res.json();
        if (!data.success) throw new Error();

        currentApp.reviews = currentApp.reviews.filter(r => r.id !== id);
        item.remove();
      } catch {
        alert('Error al eliminar');
      }
    }
  });

  /* ======================================================
     COMMUNITIES
  ====================================================== */
  function renderCommunities() {
    const box = document.getElementById('communities');
    box.innerHTML = '';
    if (!currentApp.communities.length) {
      box.innerHTML = '<p>Sin comunidades</p>';
    } else {
      currentApp.communities.forEach(c => {
        const div = document.createElement('div');
        div.textContent = c.name;
        box.appendChild(div);
      });
    }
  }

  /* ======================================================
     CERRAR MODAL
  ====================================================== */
  closeAppDetail?.addEventListener('click', () => {
    appDetailModal.classList.add('hidden');
    currentApp = null;
  });

});
