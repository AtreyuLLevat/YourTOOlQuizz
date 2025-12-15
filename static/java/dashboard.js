document.addEventListener('DOMContentLoaded', () => {

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
     AÑADIR TEAM MEMBERS (FORM)
  ====================================================== */
  addMemberBtn?.addEventListener('click', () => {
    const memberDiv = document.createElement('div');
    memberDiv.className = 'team-member-entry';
    memberDiv.innerHTML = `
      <input type="text" placeholder="Nombre" required>
      <input type="text" placeholder="Rol">
      <input type="url" placeholder="URL Avatar">
      <button type="button" class="remove-member-btn">Eliminar</button>
    `;
    teamContainer.appendChild(memberDiv);

    memberDiv.querySelector('.remove-member-btn')
      .addEventListener('click', () => memberDiv.remove());
  });

  /* ======================================================
     CREAR APP (AJAX + TEAM MEMBERS)
  ====================================================== */
  createAppForm?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData(createAppForm);

    // TEAM MEMBERS → JSON
    const members = [];
    document.querySelectorAll('.team-member-entry').forEach(div => {
      const inputs = div.querySelectorAll('input');
      const name = inputs[0].value.trim();
      const role = inputs[1].value.trim();
      const avatar_url = inputs[2].value.trim();
      if (name) members.push({ name, role, avatar_url });
    });

    formData.append('members_json', JSON.stringify(members));

    try {
      const res = await fetch('/account/create_app', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!data.success) {
        alert(data.message || 'Error creando app');
        return;
      }

      // Añadir app a la lista
      const appBtn = document.createElement('button');
      appBtn.className = 'app-item';
      appBtn.dataset.appId = data.app.id;
      appBtn.innerHTML = `
        <img src="${data.app.image_url}" class="app-img">
        <span class="app-name">${data.app.name}</span>
      `;

      appBtn.addEventListener('click', () => {
        openAppDetail(data.app.id);
      });

      appsList.prepend(appBtn);

      // Reset
      createAppForm.reset();
      teamContainer.innerHTML = '';
      createAppModal.classList.add('hidden');

    } catch (err) {
      console.error(err);
      alert('Error de red');
    }
  });

  /* ======================================================
     ABRIR MODAL CON DATOS REALES
  ====================================================== */
  async function openAppDetail(appId) {
    try {
      const res = await fetch(`/account/get_app/${appId}`);
      const data = await res.json();

      if (!data.success) {
        alert('Error cargando app');
        return;
      }
document.querySelector('.app-name').textContent = app.name;
document.querySelector('.app-description').textContent = app.description || '';
document.querySelector('.app-date').textContent = `Fecha: ${app.creation_date || '---'}`;
document.querySelector('.app-theme').textContent = `Tema: ${app.theme || 'General'}`;
document.querySelector('.app-logo img').src = app.image_url || '/static/images/app-placeholder.png';

// Team members
const teamBox = document.getElementById('team-members-container');
teamBox.innerHTML = '';
app.team_members.forEach(m => {
    const div = document.createElement('div');
    div.className = 'team-member-horizontal';
    div.innerHTML = `
        <img src="${m.avatar_url || 'https://picsum.photos/60'}">
        <div><strong>${m.name}</strong><p>${m.role || ''}</p></div>
    `;
    teamBox.appendChild(div);
});

// Reviews
const reviewsBox = document.getElementById('reviews-list');
reviewsBox.innerHTML = '';
app.reviews.forEach(r => {
    const div = document.createElement('div');
    div.className = 'review-item';
    div.innerHTML = `<strong>${r.username}</strong> <span>⭐ ${r.rating}</span> <p>${r.content}</p>`;
    reviewsBox.appendChild(div);
});

// Comunidades
const communityList = document.querySelector('.community-list');
communityList.innerHTML = '';
app.communities.forEach(c => {
    const li = document.createElement('li');
    li.textContent = c.name;
    communityList.appendChild(li);
});

      appDetailModal.classList.remove('hidden');

    } catch (err) {
      console.error(err);
      alert('Error cargando datos');
    }
  }

  /* ======================================================
     CERRAR MODAL DETALLE
  ====================================================== */
  closeAppDetail?.addEventListener('click', () => {
    appDetailModal.classList.add('hidden');
  });

  const createCommunityBtns = document.querySelectorAll('.create-community-btn');
  createCommunityBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const communityName = prompt('Nombre de la nueva comunidad:');
      if (!communityName) return;

      const appId = btn.closest('.modal-content').dataset.appId; // asegúrate de tener data-app-id
      try {
        const res = await fetch(`/apps/${appId}/create_community`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name: communityName })
        });
        const data = await res.json();
        if (data.success) {
          const communityList = btn.closest('.tab-content').querySelector('.community-list');
          const li = document.createElement('li');
          li.textContent = data.community.name;
          communityList.appendChild(li);
          alert('Comunidad creada correctamente ✅');
        } else {
          alert('Error: ' + data.error);
        }
      } catch (err) {
        console.error(err);
        alert('Error al crear la comunidad.');
      }
    });
  });

});
