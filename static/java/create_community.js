document.addEventListener('DOMContentLoaded', function() {
  let currentAppId = null;
  let addedMembers = [];
  
  // Elementos del DOM
  const modal = document.getElementById('createCommunityModal');
  const form = document.getElementById('createCommunityForm');
  const searchTeamUserInput = document.getElementById('searchTeamUser');
  const teamUserRoleSelect = document.getElementById('teamUserRole');
  const addTeamUserBtn = document.getElementById('addTeamUserBtn');
  const externalUserEmailInput = document.getElementById('externalUserEmail');
  const externalUserRoleSelect = document.getElementById('externalUserRole');
  const addExternalUserBtn = document.getElementById('addExternalUserBtn');
  const membersList = document.getElementById('communityMembersList');
  const cancelBtn = document.getElementById('cancelCommunityModal');
  
  // Función para abrir el modal
  window.openCreateCommunityModal = function(appId) {
    currentAppId = appId;
    addedMembers = [];
    updateMembersList();
    
    // El owner por defecto es el usuario actual
    const currentUserData = window.currentUserData;
    if (currentUserData) {
      addedMembers.push({
        user_id: currentUserData.id,
        name: currentUserData.name,
        email: currentUserData.email,
        avatar_url: currentUserData.avatar_url,
        role: 'owner',
        is_external: false
      });
      updateMembersList();
    }
    
    modal.classList.remove('hidden');
  };
  
  // Función para cerrar el modal
  function closeModal() {
    modal.classList.add('hidden');
    form.reset();
    addedMembers = [];
    currentAppId = null;
  }
  
  // Buscar usuarios del equipo
  searchTeamUserInput.addEventListener('input', async function(e) {
    const query = e.target.value.trim();
    
    if (query.length < 2) {
      document.getElementById('teamSearchResults').style.display = 'none';
      return;
    }
    
    try {
      const response = await fetch(`/search_team_users/${currentAppId}?q=${encodeURIComponent(query)}`);
      const users = await response.json();
      
      const resultsDiv = document.getElementById('teamSearchResults');
      resultsDiv.innerHTML = '';
      
      if (users.length === 0) {
        resultsDiv.style.display = 'none';
        return;
      }
      
      users.forEach(user => {
        const userDiv = document.createElement('div');
        userDiv.className = 'user-search-result';
        userDiv.style.cssText = 'padding: 10px; border-bottom: 1px solid #e2e8f0; cursor: pointer;';
        
        userDiv.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${user.avatar_url || '/static/images/default-avatar.png'}" 
                 style="width: 32px; height: 32px; border-radius: 50%;">
            <div>
              <div style="font-weight: 500;">${user.name}</div>
              <div style="font-size: 0.85rem; color: #64748b;">${user.email}</div>
              ${user.team_role ? `<div style="font-size: 0.8rem; color: #3b82f6;">${user.team_role}</div>` : ''}
            </div>
          </div>
        `;
        
        userDiv.addEventListener('click', () => {
          addTeamMember(user);
          searchTeamUserInput.value = '';
          resultsDiv.style.display = 'none';
        });
        
        resultsDiv.appendChild(userDiv);
      });
      
      resultsDiv.style.display = 'block';
    } catch (error) {
      console.error('Error buscando usuarios:', error);
    }
  });
  
  // Añadir usuario del equipo
  addTeamUserBtn.addEventListener('click', async function() {
    const query = searchTeamUserInput.value.trim();
    
    if (query) {
      try {
        const response = await fetch(`/search_team_users/${currentAppId}?q=${encodeURIComponent(query)}`);
        const users = await response.json();
        
        if (users.length > 0) {
          const user = users[0];
          addTeamMember(user);
          searchTeamUserInput.value = '';
          document.getElementById('teamSearchResults').style.display = 'none';
        }
      } catch (error) {
        console.error('Error buscando usuario:', error);
      }
    }
  });
  
  // Añadir usuario externo
  addExternalUserBtn.addEventListener('click', function() {
    const email = externalUserEmailInput.value.trim();
    const role = externalUserRoleSelect.value;
    
    if (!email || !validateEmail(email)) {
      alert('Por favor, introduce un email válido');
      return;
    }
    
    // Verificar si ya está en la lista
    if (addedMembers.some(m => m.email === email)) {
      alert('Este usuario ya está en la lista');
      return;
    }
    
    // Añadir usuario externo
    addedMembers.push({
      user_id: null,
      name: email.split('@')[0],
      email: email,
      avatar_url: null,
      role: role,
      is_external: true
    });
    
    externalUserEmailInput.value = '';
    updateMembersList();
  });
  
  // Función para añadir miembro del equipo
  function addTeamMember(user) {
    const role = teamUserRoleSelect.value;
    
    // Verificar límites de roles
    const owners = addedMembers.filter(m => m.role === 'owner');
    const admins = addedMembers.filter(m => m.role === 'admin');
    
    if (role === 'owner' && owners.length >= 1) {
      alert('Solo puede haber un owner en la comunidad');
      return;
    }
    
    if (role === 'admin' && admins.length >= 3) {
      alert('Máximo 3 administradores permitidos');
      return;
    }
    
    // Verificar si ya está en la lista
    if (addedMembers.some(m => m.user_id === user.id)) {
      alert('Este usuario ya está en la lista');
      return;
    }
    
    addedMembers.push({
      user_id: user.id,
      name: user.name,
      email: user.email,
      avatar_url: user.avatar_url,
      role: role,
      is_external: false
    });
    
    updateMembersList();
  }
  
  // Actualizar lista de miembros
  function updateMembersList() {
    membersList.innerHTML = '';
    
    if (addedMembers.length === 0) {
      membersList.innerHTML = `
        <div style="text-align: center; padding: 20px; color: #64748b; border: 1px dashed #e2e8f0; border-radius: 8px;">
          Añade miembros para configurar los roles
        </div>
      `;
      return;
    }
    
    // Ordenar por rol (owner primero, luego admin, etc.)
    const roleOrder = { owner: 1, admin: 2, moderator: 3, collaborator: 4 };
    addedMembers.sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);
    
    addedMembers.forEach((member, index) => {
      const memberDiv = document.createElement('div');
      memberDiv.className = 'team-member-card';
      memberDiv.style.cssText = 'margin-bottom: 10px; padding: 12px; border: 1px solid #e2e8f0; border-radius: 8px;';
      
      const roleBadgeColor = {
        owner: '#dc2626',
        admin: '#2563eb',
        moderator: '#059669',
        collaborator: '#7c3aed'
      }[member.role] || '#64748b';
      
      memberDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
            <img src="${member.avatar_url || '/static/images/default-avatar.png'}" 
                 style="width: 40px; height: 40px; border-radius: 50%;">
            <div style="flex: 1;">
              <div style="font-weight: 500;">${member.name}</div>
              <div style="font-size: 0.85rem; color: #64748b;">${member.email}</div>
              ${member.is_external ? '<span style="font-size: 0.7rem; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px;">Invitar por email</span>' : ''}
            </div>
          </div>
          
          <div style="display: flex; align-items: center; gap: 15px;">
            <select class="member-role-select" data-index="${index}" 
                    style="padding: 6px 10px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 0.9rem;">
              <option value="owner" ${member.role === 'owner' ? 'selected' : ''}>👑 Owner</option>
              <option value="admin" ${member.role === 'admin' ? 'selected' : ''}>🛡️ Admin</option>
              <option value="moderator" ${member.role === 'moderator' ? 'selected' : ''}>⚖️ Moderador</option>
              <option value="collaborator" ${member.role === 'collaborator' ? 'selected' : ''}>🤝 Colaborador</option>
            </select>
            
            <button type="button" class="remove-member-btn" data-index="${index}" 
                    style="background: #ef4444; color: white; border: none; border-radius: 6px; padding: 6px 12px; cursor: pointer; font-size: 0.85rem;">
              Eliminar
            </button>
          </div>
        </div>
      `;
      
      membersList.appendChild(memberDiv);
    });
    
    // Añadir event listeners para los selectores de rol
    document.querySelectorAll('.member-role-select').forEach(select => {
      select.addEventListener('change', function(e) {
        const index = parseInt(this.dataset.index);
        const newRole = this.value;
        
        // Validar límites
        const owners = addedMembers.filter(m => m.role === 'owner');
        const admins = addedMembers.filter(m => m.role === 'admin');
        
        if (newRole === 'owner' && owners.length >= 1 && addedMembers[index].role !== 'owner') {
          alert('Solo puede haber un owner en la comunidad');
          this.value = addedMembers[index].role; // Revertir cambio
          return;
        }
        
        if (newRole === 'admin' && admins.length >= 3 && addedMembers[index].role !== 'admin') {
          alert('Máximo 3 administradores permitidos');
          this.value = addedMembers[index].role; // Revertir cambio
          return;
        }
        
        addedMembers[index].role = newRole;
        updateMembersList();
      });
    });
    
    // Añadir event listeners para los botones de eliminar
    document.querySelectorAll('.remove-member-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const index = parseInt(this.dataset.index);
        const member = addedMembers[index];
        
        // No permitir eliminar al owner si es el usuario actual
        if (member.role === 'owner' && member.user_id === window.currentUserData?.id) {
          alert('No puedes eliminar al owner (tú mismo)');
          return;
        }
        
        addedMembers.splice(index, 1);
        updateMembersList();
      });
    });
  }
  
  // Enviar formulario
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Validar que hay al menos un owner
    const owners = addedMembers.filter(m => m.role === 'owner');
    if (owners.length !== 1) {
      alert('Debe haber exactamente un owner en la comunidad');
      return;
    }
    
    // Validar límites de administradores
    const admins = addedMembers.filter(m => m.role === 'admin');
    if (admins.length > 3) {
      alert('Máximo 3 administradores permitidos');
      return;
    }
    
    // Preparar datos
    const formData = {
      name: document.getElementById('communityName').value.trim(),
      description: document.getElementById('communityDescription').value.trim(),
      rules: document.getElementById('communityRules').value.trim(),
      is_public: document.getElementById('communityVisibility').value,
      allow_public_join: document.getElementById('communityJoinPolicy').value,
      members: addedMembers.map(member => ({
        user_id: member.user_id,
        email: member.email,
        role: member.role
      }))
    };
    
    try {
      const response = await fetch(`/apps/${currentAppId}/create_community_v2`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert('Comunidad creada exitosamente');
        closeModal();
        
        // Recargar la lista de comunidades si estamos en el modal de detalle
        if (window.renderCommunities) {
          window.renderCommunities();
        }
        
        // Opcional: redirigir a la nueva comunidad
        // window.location.href = `/community/${data.community.id}`;
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear la comunidad. Por favor, intenta de nuevo.');
    }
  });
  
  // Cerrar modal
  cancelBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Validar email
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  // Exportar función para uso global
  window.openCreateCommunityModal = openCreateCommunityModal;
});