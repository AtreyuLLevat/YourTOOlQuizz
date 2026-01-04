document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando configuración de equipo (MODO DEBUG FORZADO)');
    
    function getSafeAvatar(url, name = '') {
        // Si no hay URL o es inválida, usar avatar por defecto
        if (!url || url.trim() === '' || url.includes('undefined') || url.includes('null')) {
            return DEFAULT_AVATAR_URL;
        }
        return url;
    }
    
    const chatContainer = document.getElementById('chat-container');
    // FORZAR VALORES PARA TESTING
    const communityId = chatContainer.dataset.communityId;
    const currentUserName = chatContainer.dataset.userName || 'Usuario';
    const userId = chatContainer.dataset.userId;
    
    console.log('🔧 FORZANDO isOwner = true para testing');
    const isOwner = true; // ← AQUÍ ESTÁ LA MAGIA
    const teamConfigured = chatContainer.dataset.teamConfigured === 'true';
    
    console.log('📊 Valores:', { isOwner, teamConfigured, communityId, userId });
    
    if (!isOwner || teamConfigured) {
        console.log('⚠️ No mostrar modal:', { isOwner, teamConfigured });
        return;
    }
    
    console.log('✅ Mostrando modal...');
    
    // Crear e insertar el HTML del modal
    createModalHTML();
    
    // Inicializar variables
    let currentMembers = [];
    let searchTimeout = null;
    
    // Añadir el owner actual a la lista
    addOwnerToMembers();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Mostrar el modal después de un pequeño delay
    setTimeout(() => {
        document.getElementById('teamSetupModal').style.display = 'flex';
        document.getElementById('teamSearchInput')?.focus();
    }, 500);
    
    /* ============================================
       FUNCIONES PRINCIPALES
    ============================================ */
        // URL DEL AVATAR POR DEFECTO DESDE SUPABASE (misma que backend)
    const DEFAULT_AVATAR_URL = "https://ouoodvqsezartigpzwke.supabase.co/storage/v1/object/public/images/avatars/default.png";
    
    // FUNCIÓN PARA OBTENER AVATAR SEGURO


function createModalHTML() {
    const modalHTML = `
    <div id="teamSetupModal" class="team-setup-modal" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    ">
        <div style="
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 1000px;
            max-height: 90vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            border: 1px solid #e1e5e9;
        ">
            <!-- Header -->
            <div style="
                padding: 28px 40px;
                border-bottom: 1px solid #eaeaea;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <div>
                    <h2 style="font-size: 24px; margin: 0; color: #1a1a1a; font-weight: 600;">Configurar Equipo de Comunidad</h2>
                    <p style="font-size: 14px; color: #666; margin: 8px 0 0 0;">Asigna roles a los miembros del equipo</p>
                </div>
                <button id="closeModalBtn" style="
                    background: none;
                    border: none;
                    font-size: 24px;
                    color: #999;
                    cursor: pointer;
                    padding: 0;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                " onmouseover="this.style.background='#f5f5f5';this.style.color='#333'"
                   onmouseout="this.style.background='none';this.style.color='#999'">
                    ×
                </button>
            </div>
            
            <!-- Content - Dos columnas -->
            <div style="padding: 0; display: flex; min-height: 500px;">
                <!-- Columna izquierda: Miembros del equipo de la app -->
                <div style="flex: 1; padding: 32px; border-right: 1px solid #eaeaea;">
                    <div style="margin-bottom: 32px;">
                        <h3 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
                            <span>👥</span> Miembros del Equipo
                        </h3>
                        <p style="font-size: 14px; color: #666; margin: 0 0 24px 0;">
                            Usuarios que ya forman parte del equipo de tu aplicación.
                        </p>
                        
                        <!-- Lista de miembros del equipo -->
                        <div id="teamMembersList" style="
                            min-height: 200px;
                            margin-bottom: 24px;
                        ">
                            <div id="loadingTeamMembers" style="text-align: center; padding: 40px 0;">
                                <div style="display: inline-block; width: 30px; height: 30px; border: 3px solid #f3f3f3; border-top: 3px solid #3b82f6; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                                <p style="color: #666; margin-top: 10px;">Cargando miembros...</p>
                            </div>
                        </div>
                        
                        <!-- Contador de seleccionados -->
                        <div style="
                            padding: 12px 16px;
                            background: #f8f9fa;
                            border-radius: 8px;
                            border: 1px solid #eaeaea;
                            font-size: 14px;
                            color: #666;
                        ">
                            <span id="selectedCount">0</span> miembros seleccionados para la comunidad
                        </div>
                    </div>
                </div>
                
                <!-- Columna derecha: Búsqueda de usuarios externos -->
                <div style="flex: 1; padding: 32px;">
                    <div style="margin-bottom: 32px;">
                        <h3 style="font-size: 18px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
                            <span>🔍</span> Buscar Usuarios Externos
                        </h3>
                        <p style="font-size: 14px; color: #666; margin: 0 0 24px 0;">
                            Invita usuarios registrados en YourToolQuizz que no están en tu equipo.
                        </p>
                        
                        <!-- Campo de búsqueda -->
                        <div style="position: relative; margin-bottom: 20px;">
                            <input type="text" 
                                   id="externalUserSearch" 
                                   placeholder="Buscar por nombre o email..."
                                   style="
                                        width: 100%;
                                        padding: 14px 16px;
                                        border: 1px solid #ddd;
                                        border-radius: 8px;
                                        font-size: 14px;
                                        outline: none;
                                        transition: all 0.2s;
                                        padding-right: 50px;
                                   " onfocus="this.style.borderColor='#3b82f6';this.style.boxShadow='0 0 0 3px rgba(59, 130, 246, 0.1)'"
                                   onblur="this.style.borderColor='#ddd';this.style.boxShadow='none'">
                            <div style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af;">
                                🔍
                            </div>
                        </div>
                        
                        <!-- Resultados de búsqueda -->
                        <div id="externalSearchResults" style="
                            border: 1px solid #eaeaea;
                            border-radius: 8px;
                            max-height: 300px;
                            overflow-y: auto;
                            background: white;
                            display: none;
                            margin-bottom: 24px;
                        "></div>
                        
                        <!-- Roles disponibles -->
                        <div style="margin-bottom: 24px;">
                            <h4 style="font-size: 14px; font-weight: 600; color: #1a1a1a; margin: 0 0 12px 0;">Rol para nuevos miembros</h4>
                            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                                <button class="role-btn" data-role="admin" style="
                                    padding: 10px;
                                    border: 2px solid #dbeafe;
                                    background: #dbeafe;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-size: 13px;
                                    font-weight: 500;
                                    color: #1e40af;
                                    transition: all 0.2s;
                                " onmouseover="this.style.borderColor='#93c5fd'" 
                                   onmouseout="this.style.borderColor='#dbeafe'">
                                    👑 Admin
                                </button>
                                <button class="role-btn" data-role="moderator" style="
                                    padding: 10px;
                                    border: 2px solid #d1fae5;
                                    background: #d1fae5;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-size: 13px;
                                    font-weight: 500;
                                    color: #065f46;
                                    transition: all 0.2s;
                                " onmouseover="this.style.borderColor='#6ee7b7'" 
                                   onmouseout="this.style.borderColor='#d1fae5'">
                                    ⚖️ Moderador
                                </button>
                                <button class="role-btn active" data-role="collaborator" style="
                                    padding: 10px;
                                    border: 2px solid #3b82f6;
                                    background: #3b82f6;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-size: 13px;
                                    font-weight: 500;
                                    color: white;
                                    transition: all 0.2s;
                                ">
                                    🤝 Colaborador
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Miembros seleccionados para la comunidad -->
                    <div>
                        <h3 style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin: 0 0 16px 0;">Miembros de la Comunidad</h3>
                        
                        <div id="communityMembersList" style="
                            min-height: 100px;
                            margin-bottom: 24px;
                        ">
                            <div id="noCommunityMembers" style="
                                text-align: center;
                                padding: 40px 20px;
                                color: #999;
                                border: 2px dashed #eaeaea;
                                border-radius: 8px;
                                background: #fafafa;
                            ">
                                <div style="font-size: 36px; margin-bottom: 16px; opacity: 0.5;">👥</div>
                                <p style="margin: 0; font-size: 14px;">Añade miembros usando las opciones de la izquierda</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div style="
                padding: 24px 40px;
                background: #f8f9fa;
                border-top: 1px solid #eaeaea;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-radius: 0 0 12px 12px;
            ">
                <div style="font-size: 14px; color: #666;">
                    <span id="communityMemberCount" style="font-weight: 600; color: #1a1a1a;">0</span> miembros configurados para la comunidad
                </div>
                <div style="display: flex; gap: 12px;">
                    <button id="skipSetupBtn" style="
                        padding: 12px 28px;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        background: white;
                        color: #666;
                        border: 1px solid #ddd;
                        transition: all 0.2s;
                    " onmouseover="this.style.borderColor='#999';this.style.color='#333'"
                       onmouseout="this.style.borderColor='#ddd';this.style.color='#666'">
                        Configurar Después
                    </button>
                    <button id="completeSetupBtn" style="
                        padding: 12px 28px;
                        border-radius: 6px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: not-allowed;
                        background: #eaeaea;
                        color: #999;
                        border: none;
                        transition: all 0.2s;
                    " disabled>
                        Completar Configuración
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Estilos CSS adicionales -->
    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        #teamSetupModal > div {
            animation: modalFadeIn 0.3s ease-out;
        }
        
        .member-card {
            transition: all 0.2s;
            cursor: pointer;
        }
        
        .member-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
        }
        
        .member-card.selected {
            border-color: #3b82f6;
            background-color: #eff6ff;
        }
        
        .role-btn.active {
            transform: scale(0.98);
        }
        
        .user-result:hover {
            background-color: #f8f9fa;
        }
    </style>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Configurar eventos
    setupModalEvents();
}
/* ============================================
   NUEVA FUNCIÓN: Configurar eventos del modal
============================================ */
function setupModalEvents() {
    // Cerrar modal
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (currentMembers.length <= 1) {
                if (confirm('¿Seguro? No has añadido miembros a la comunidad.')) {
                    closeModal();
                }
            } else {
                closeModal();
            }
        });
    }
    
    // Botones de rol
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remover clase active de todos
            document.querySelectorAll('.role-btn').forEach(b => {
                b.classList.remove('active');
                b.style.background = b.dataset.role === 'admin' ? '#dbeafe' : 
                                   b.dataset.role === 'moderator' ? '#d1fae5' : '#f3e8ff';
                b.style.borderColor = b.dataset.role === 'admin' ? '#dbeafe' : 
                                    b.dataset.role === 'moderator' ? '#d1fae5' : '#f3e8ff';
                b.style.color = b.dataset.role === 'admin' ? '#1e40af' : 
                              b.dataset.role === 'moderator' ? '#065f46' : '#7c3aed';
            });
            
            // Añadir clase active al seleccionado
            this.classList.add('active');
            this.style.background = '#3b82f6';
            this.style.borderColor = '#3b82f6';
            this.style.color = 'white';
            
            // Guardar rol seleccionado
            selectedRole = this.dataset.role;
        });
    });
    
    // Búsqueda de usuarios externos
    const searchInput = document.getElementById('externalUserSearch');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                searchExternalUsers(e.target.value.trim());
            }, 300);
        });
    }
    
    // Cerrar modal al hacer clic fuera
    const modal = document.getElementById('teamSetupModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                showNotification('Completa la configuración o haz clic en "Configurar después"', 'warning');
            }
        });
    }
}

/* ============================================
   NUEVA FUNCIÓN: Cargar miembros del equipo
============================================ */
async function loadTeamMembers() {
    try {
        const appId = chatContainer.dataset.appId;
        if (!appId) {
            console.error('No se encontró appId');
            return;
        }
        
        // Obtener miembros del equipo de la app
        const response = await fetch(`/account/apps/${appId}`);
        const data = await response.json();
        
        const loadingDiv = document.getElementById('loadingTeamMembers');
        const teamList = document.getElementById('teamMembersList');
        
        if (data.success && data.app.team_members) {
            loadingDiv.style.display = 'none';
            
            // Filtrar para no incluir al owner actual
            const teamMembers = data.app.team_members.filter(member => 
                member.user_id && member.user_id != userId
            );
            
            if (teamMembers.length === 0) {
                teamList.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px; color: #999;">
                        <div style="font-size: 36px; margin-bottom: 16px; opacity: 0.5;">👥</div>
                        <p style="margin: 0; font-size: 14px;">No hay otros miembros en el equipo de la app</p>
                    </div>
                `;
                return;
            }
            
            // Crear tarjetas para cada miembro
            teamMembers.forEach(member => {
                const card = document.createElement('div');
                card.className = 'member-card';
                card.dataset.userId = member.user_id;
                card.dataset.userName = member.name;
                card.dataset.avatarUrl = member.avatar_url || '';
                
                card.innerHTML = `
                    <div style="
                        padding: 16px;
                        border: 1px solid #e5e7eb;
                        border-radius: 10px;
                        background: white;
                        margin-bottom: 12px;
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                    ">
        <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${getSafeAvatar(member.avatar_url, member.name)}" 
                 alt="${member.name}"  <!-- AQUÍ ESTÁ EL ERROR: debería ser member.name -->
                 style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;"
                 onerror="this.src='${DEFAULT_AVATAR_URL}'">
            <div>
                <div style="font-weight: 600; font-size: 14px;">${member.name}</div>
                <div style="font-size: 12px; color: #6b7280;">${member.source === 'team' ? 'Miembro del equipo' : 'Usuario externo'}</div>
            </div>
        </div>
                        <button class="select-member-btn" style="
                            padding: 8px 16px;
                            background: #10b981;
                            color: white;
                            border: none;
                            border-radius: 6px;
                            cursor: pointer;
                            font-size: 14px;
                            font-weight: 500;
                            transition: background 0.2s;
                        " onmouseover="this.style.background='#0da271'"
                           onmouseout="this.style.background='#10b981'">
                            Añadir
                        </button>
                    </div>
                `;
                
                // Evento para seleccionar miembro
                card.querySelector('.select-member-btn').addEventListener('click', function() {
                    selectTeamMember(
                        member.user_id,
                        member.name,
                        member.avatar_url || '',
                        getSelectedRole()
                    );
                    
                    // Marcar como seleccionado
                    card.classList.add('selected');
                    card.style.borderColor = '#3b82f6';
                    card.style.background = '#eff6ff';
                    this.textContent = '✓ Añadido';
                    this.style.background = '#6b7280';
                    this.disabled = true;
                    
                    updateSelectedCount();
                });
                
                teamList.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error cargando miembros del equipo:', error);
        const loadingDiv = document.getElementById('loadingTeamMembers');
        if (loadingDiv) {
            loadingDiv.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: #ef4444;">
                    <div style="font-size: 36px; margin-bottom: 16px;">❌</div>
                    <p style="margin: 0; font-size: 14px;">Error cargando miembros</p>
                </div>
            `;
        }
    }
}

/* ============================================
   NUEVA FUNCIÓN: Buscar usuarios externos
============================================ */
async function searchExternalUsers(query) {
    const resultsDiv = document.getElementById('externalSearchResults');
    
    if (!query || query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }
    
    try {
        // Buscar en TODOS los usuarios registrados
        const response = await fetch(`/search_users?q=${encodeURIComponent(query)}`);
        const users = await response.json();
        
        if (!users || users.length === 0) {
            resultsDiv.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #6b7280;">
                    <div style="font-size: 24px; margin-bottom: 8px;">🔍</div>
                    <p style="margin: 0; font-size: 14px;">No se encontraron usuarios</p>
                </div>
            `;
            resultsDiv.style.display = 'block';
            return;
        }
        
        // Filtrar usuarios que ya están en el equipo de la app
        const appId = chatContainer.dataset.appId;
        let teamUsers = [];
        if (appId) {
            const teamResponse = await fetch(`/account/apps/${appId}`);
            const teamData = await teamResponse.json();
            if (teamData.success) {
                teamUsers = teamData.app.team_members || [];
            }
        }
        
        const teamUserIds = teamUsers.map(m => m.user_id);
        
        resultsDiv.innerHTML = '';
        users.forEach(user => {
            // Omitir usuarios que ya están en el equipo
            if (teamUserIds.includes(user.id)) {
                return;
            }
            
            // Omitir usuario actual
            if (user.id == userId) {
                return;
            }
            
            const div = document.createElement('div');
            div.className = 'user-result';
            div.style.cssText = 'padding: 16px; border-bottom: 1px solid #f3f4f6; cursor: pointer;';
            div.innerHTML = `
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 12px;">
<img src="${getSafeAvatar(user.avatar_url, user.name)}" 
     style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"
     onerror="this.src='${DEFAULT_AVATAR_URL}'">
                        <div>
                            <div style="font-weight: 600; color: #1a1a1a;">${user.name || 'Usuario'}</div>
                            <div style="font-size: 14px; color: #6b7280;">${user.email || 'Sin email'}</div>
                        </div>
                    </div>
                    <button class="add-external-user-btn" data-user-id="${user.id}" style="
                        padding: 8px 16px;
                        background: #3b82f6;
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 500;
                        transition: background 0.2s;
                    " onmouseover="this.style.background='#2563eb'"
                       onmouseout="this.style.background='#3b82f6'">
                        Añadir
                    </button>
                </div>
            `;
            
            // Evento para añadir usuario externo
            div.querySelector('.add-external-user-btn').addEventListener('click', function(e) {
                e.stopPropagation();
                addExternalUser(
                    user.id,
                    user.name,
                    user.email,
                    user.avatar_url || '',
                    getSelectedRole()
                );
                
                // Ocultar resultados
                resultsDiv.style.display = 'none';
                document.getElementById('externalUserSearch').value = '';
            });
            
            // Evento para hacer clic en toda la tarjeta
            div.addEventListener('click', function(e) {
                if (!e.target.classList.contains('add-external-user-btn')) {
                    addExternalUser(
                        user.id,
                        user.name,
                        user.email,
                        user.avatar_url || '',
                        getSelectedRole()
                    );
                    
                    // Ocultar resultados
                    resultsDiv.style.display = 'none';
                    document.getElementById('externalUserSearch').value = '';
                }
            });
            
            resultsDiv.appendChild(div);
        });
        
        resultsDiv.style.display = 'block';
    } catch (error) {
        console.error('Error buscando usuarios externos:', error);
        resultsDiv.innerHTML = `
            <div style="padding: 20px; text-align: center; color: #ef4444;">
                <div style="font-size: 24px; margin-bottom: 8px;">❌</div>
                <p style="margin: 0; font-size: 14px;">Error en la búsqueda</p>
            </div>
        `;
        resultsDiv.style.display = 'block';
    }
}

/* ============================================
   FUNCIONES AUXILIARES
============================================ */
let selectedRole = 'collaborator';

function getSelectedRole() {
    return selectedRole;
}

function selectTeamMember(userId, userName, avatarUrl, role) {
    if (currentMembers.some(m => m.id === userId)) {
        showNotification('Este usuario ya está en la lista', 'warning');
        return;
    }
    
    const member = {
        id: userId,
        name: userName,
        email: '', // No tenemos email del team member
        avatar_url: avatarUrl,
        role: role,
        is_external: false,
        source: 'team'
    };
    
    addToCommunityList(member);
}

function addExternalUser(userId, userName, userEmail, avatarUrl, role) {
    if (currentMembers.some(m => m.id === userId)) {
        showNotification('Este usuario ya está en la lista', 'warning');
        return;
    }
    
    const member = {
        id: userId,
        name: userName,
        email: userEmail,
        avatar_url: avatarUrl,
        role: role,
        is_external: true,
        source: 'external'
    };
    
    addToCommunityList(member);
}

function addToCommunityList(member) {
    currentMembers.push(member);
    
    // Ocultar mensaje de "no miembros"
    const noMembersMsg = document.getElementById('noCommunityMembers');
    if (noMembersMsg) {
        noMembersMsg.style.display = 'none';
    }
    
    // Crear elemento en la lista de comunidad
    const communityList = document.getElementById('communityMembersList');
    const memberDiv = document.createElement('div');
    memberDiv.className = 'community-member-item';
    memberDiv.dataset.userId = member.id;
    
    const roleColors = {
        'owner': { bg: '#fee2e2', color: '#dc2626', label: '👑 Owner' },
        'admin': { bg: '#dbeafe', color: '#2563eb', label: '🛡️ Admin' },
        'moderator': { bg: '#d1fae5', color: '#059669', label: '⚖️ Moderador' },
        'collaborator': { bg: '#f3e8ff', color: '#7c3aed', label: '🤝 Colaborador' }
    };
    
    const roleInfo = roleColors[member.role] || roleColors.collaborator;
    
    memberDiv.innerHTML = `
        <div style="
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 8px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
        ">
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${getSafeAvatar(member.avatar_url, member.name)}" 
     alt="${member.name}"
     style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover;"
     onerror="this.src='${DEFAULT_AVATAR_URL}'">
                     alt="${member.name}"
                     style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
                <div>
                    <div style="font-weight: 600; font-size: 14px;">${member.name}</div>
                    <div style="font-size: 12px; color: #6b7280;">${member.source === 'team' ? 'Miembro del equipo' : 'Usuario externo'}</div>
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                    background: ${roleInfo.bg};
                    color: ${roleInfo.color};
                ">${roleInfo.label}</span>
                <button onclick="removeCommunityMember('${member.id}')" style="
                    background: none;
                    border: none;
                    color: #ef4444;
                    cursor: pointer;
                    font-size: 16px;
                    padding: 4px;
                ">×</button>
            </div>
        </div>
    `;
    
    communityList.appendChild(memberDiv);
    
    // Actualizar contadores
    updateSelectedCount();
    updateCommunityMemberCount();
    updateCompleteButton();
}

function updateSelectedCount() {
    const selectedCount = currentMembers.filter(m => m.source === 'team').length;
    document.getElementById('selectedCount').textContent = selectedCount;
}

function updateCommunityMemberCount() {
    document.getElementById('communityMemberCount').textContent = currentMembers.length;
}

// Añadir al scope global
window.removeCommunityMember = function(userId) {
    // Remover de la lista
    currentMembers = currentMembers.filter(m => m.id !== userId);
    
    // Remover del DOM
    const memberDivs = document.querySelectorAll('.community-member-item');
    memberDivs.forEach(div => {
        if (div.dataset.userId === userId) {
            div.remove();
        }
    });
    
    // Activar botón de añadir en la tarjeta correspondiente
    const teamCard = document.querySelector(`.member-card[data-user-id="${userId}"]`);
    if (teamCard) {
        teamCard.classList.remove('selected');
        teamCard.style.borderColor = '#e5e7eb';
        teamCard.style.background = 'white';
        const btn = teamCard.querySelector('.select-member-btn');
        if (btn) {
            btn.textContent = 'Añadir';
            btn.style.background = '#10b981';
            btn.disabled = false;
        }
    }
    
    // Actualizar contadores
    updateSelectedCount();
    updateCommunityMemberCount();
    updateCompleteButton();
    
    // Mostrar mensaje de "no miembros" si está vacío
    if (currentMembers.length === 0) {
        const noMembersMsg = document.getElementById('noCommunityMembers');
        if (noMembersMsg) {
            noMembersMsg.style.display = 'block';
        }
    }
};
    
    function addOwnerToMembers() {
        currentMembers.push({
            id: chatContainer.dataset.userId,
            name: currentUserName,
            email: '', // No tenemos email en los datos
            avatar_url: '',
            role: 'owner',
            is_external: false,
            is_current_user: true
        });
    }
    
 function setupEventListeners() {
    // Cargar miembros del equipo al inicio
    loadTeamMembers();
    
    // Buscar miembros del equipo (ya están listados)
    const searchInput = document.getElementById('teamSearchInput');
    if (searchInput) {
        searchInput.addEventListener('input', handleTeamSearch);
    }
    
    // Añadir miembro del equipo
    const addTeamBtn = document.getElementById('addTeamMemberBtn');
    if (addTeamBtn) {
        addTeamBtn.addEventListener('click', addTeamMember);
    }
    
    // Invitar usuario externo (busca en todos los usuarios)
    const inviteBtn = document.getElementById('inviteUserBtn');
    if (inviteBtn) {
        inviteBtn.addEventListener('click', inviteExternalUser);
    }
    
    // Botones del footer
    const skipBtn = document.getElementById('skipSetupBtn');
    if (skipBtn) {
        skipBtn.addEventListener('click', skipSetup);
    }
    
    const completeBtn = document.getElementById('completeSetupBtn');
    if (completeBtn) {
        completeBtn.addEventListener('click', completeSetup);
    }
    
    // Cerrar modal al hacer clic fuera
    const modal = document.getElementById('teamSetupModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                // No permitir cerrar sin completar
                showNotification('Completa la configuración o haz clic en "Configurar después"', 'warning');
            }
        });
    }
}

/* ============================================
   NUEVA FUNCIÓN: Cargar miembros del equipo
============================================ */
async function loadTeamMembers() {
    try {
        // Obtener la app_id desde el chat container
        const appId = chatContainer.dataset.appId;
        if (!appId) {
            console.error('No se encontró appId');
            return;
        }
        
        // Obtener miembros del equipo de la app
        const response = await fetch(`/account/apps/${appId}`);
        const data = await response.json();
        
        if (data.success && data.app.team_members) {
            // Filtrar para no incluir al owner actual (ya está añadido)
            data.app.team_members.forEach(member => {
                if (member.user_id && member.user_id != userId) {
                    addTeamMemberFromResult({
                        id: member.user_id,
                        name: member.name,
                        email: '', // No tenemos email en team_members
                        avatar_url: member.avatar_url,
                        team_role: member.role
                    }, 'collaborator'); // Rol por defecto
                }
            });
        }
    } catch (error) {
        console.error('Error cargando miembros del equipo:', error);
    }
}

/* ============================================
   MODIFICAR FUNCIÓN handleTeamSearch
   (REEMPLAZA la función existente)
============================================ */
function handleTeamSearch(e) {
    const query = e.target.value.trim();
    const resultsDiv = document.getElementById('teamSearchResults');
    
    if (!query || query.length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
        try {
            // Buscar en los miembros del equipo
            const response = await fetch(`/search_team_users_c/${communityId}?q=${encodeURIComponent(query)}`);
            const users = await response.json();
            
            if (!users || users.length === 0) {
                resultsDiv.innerHTML = '<div style="padding: 12px 16px; color: #6b7280;">No se encontraron usuarios en el equipo</div>';
                resultsDiv.style.display = 'block';
                return;
            }
            
            resultsDiv.innerHTML = '';
            users.forEach(user => {
                const div = document.createElement('div');
                div.className = 'user-result';
                div.style.cssText = 'padding: 12px 16px; border-bottom: 1px solid #f3f4f6; cursor: pointer;';
                div.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 10px;">
                        ${user.avatar_url ? 
                          `<img src="${user.avatar_url}" style="width: 32px; height: 32px; border-radius: 50%;">` : 
                          `<div style="width: 32px; height: 32px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center;">${user.name?.charAt(0) || 'U'}</div>`
                        }
                        <div style="flex: 1;">
                            <div style="font-weight: 500;">${user.name || 'Sin nombre'}</div>
                            <div style="font-size: 13px; color: #6b7280;">${user.email || 'Sin email'}</div>
                            ${user.team_role ? `<div style="font-size: 12px; color: #3b82f6;">Rol actual: ${user.team_role}</div>` : ''}
                        </div>
                        <div>
                            <select class="user-role-select" data-user-id="${user.id}" style="padding: 4px 8px; border: 1px solid #ddd; border-radius: 4px;">
                                <option value="admin">Admin</option>
                                <option value="moderator">Moderator</option>
                                <option value="collaborator" selected>Collaborator</option>
                            </select>
                        </div>
                    </div>
                `;
                
                div.addEventListener('click', (e) => {
                    // Solo añadir si no se hace clic en el select
                    if (!e.target.classList.contains('user-role-select')) {
                        const roleSelect = div.querySelector('.user-role-select');
                        addTeamMemberFromResult(user, roleSelect.value);
                        searchInput.value = user.name || user.email || '';
                        resultsDiv.style.display = 'none';
                    }
                });
                
                resultsDiv.appendChild(div);
            });
            
            resultsDiv.style.display = 'block';
        } catch (error) {
            console.error('Error buscando usuarios:', error);
            resultsDiv.innerHTML = '<div style="padding: 12px 16px; color: #ef4444;">Error en la búsqueda</div>';
            resultsDiv.style.display = 'block';
        }
    }, 300);
}

/* ============================================
   MODIFICAR FUNCIÓN inviteExternalUser
   (REEMPLAZA la función existente)
============================================ */
async function inviteExternalUser() {
    const nameInput = document.getElementById('externalUserName');
    const emailInput = document.getElementById('externalUserEmail');
    const roleSelect = document.getElementById('externalUserRole');
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const role = roleSelect.value;
    
    if (!name && !email) {
        showNotification('Ingresa un nombre o email para buscar', 'warning');
        return;
    }
    
    try {
        // Buscar en TODOS los usuarios registrados
        const query = name || email;
        const response = await fetch(`/search_users?q=${encodeURIComponent(query)}`);
        const users = await response.json();
        
        if (users && users.length > 0) {
            // Mostrar resultados para seleccionar
            showUserSelectionModal(users, role);
        } else {
            // Si no existe, crear invitación
            createExternalInvitation(name, email, role);
        }
    } catch (error) {
        console.error('Error buscando usuario:', error);
        // Fallback: crear invitación
        createExternalInvitation(name, email, role);
    }
}

/* ============================================
   NUEVA FUNCIÓN: Mostrar selección de usuarios
============================================ */
function showUserSelectionModal(users, defaultRole) {
    const modal = document.createElement('div');
    modal.id = 'userSelectionModal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
    `;
    
    let usersHTML = '';
    users.forEach((user, index) => {
        usersHTML += `
            <div class="user-selection-item" style="
                padding: 12px 16px;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                margin-bottom: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: space-between;
            ">
                <div style="display: flex; align-items: center; gap: 12px;">
                    ${user.avatar_url ? 
                      `<img src="${user.avatar_url}" style="width: 40px; height: 40px; border-radius: 50%;">` : 
                      `<div style="width: 40px; height: 40px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-weight: 600;">${user.name?.charAt(0) || 'U'}</div>`
                    }
                    <div>
                        <div style="font-weight: 600;">${user.name || 'Usuario'}</div>
                        <div style="font-size: 13px; color: #6b7280;">${user.email || ''}</div>
                    </div>
                </div>
                <select class="selection-role-select" data-user-id="${user.id}" style="padding: 6px 10px; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="admin" ${defaultRole === 'admin' ? 'selected' : ''}>Admin</option>
                    <option value="moderator" ${defaultRole === 'moderator' ? 'selected' : ''}>Moderator</option>
                    <option value="collaborator" ${defaultRole === 'collaborator' ? 'selected' : ''}>Collaborator</option>
                </select>
            </div>
        `;
    });
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 500px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        ">
            <div style="
                padding: 20px;
                border-bottom: 1px solid #e5e7eb;
            ">
                <h3 style="margin: 0; font-size: 18px; font-weight: 600;">Seleccionar Usuario</h3>
                <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">
                    Se encontraron ${users.length} usuario(s). Selecciona uno:
                </p>
            </div>
            
            <div style="padding: 20px; max-height: 300px; overflow-y: auto;">
                ${usersHTML}
            </div>
            
            <div style="
                padding: 20px;
                border-top: 1px solid #e5e7eb;
                display: flex;
                justify-content: flex-end;
                gap: 12px;
            ">
                <button id="cancelSelection" style="
                    padding: 10px 20px;
                    border: 1px solid #ddd;
                    background: white;
                    border-radius: 6px;
                    cursor: pointer;
                ">Cancelar</button>
                <button id="inviteNewUser" style="
                    padding: 10px 20px;
                    border: none;
                    background: #666;
                    color: white;
                    border-radius: 6px;
                    cursor: pointer;
                ">Invitar Nuevo Usuario</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Configurar eventos
    modal.querySelectorAll('.user-selection-item').forEach(item => {
        item.addEventListener('click', (e) => {
            if (!e.target.classList.contains('selection-role-select')) {
                const userId = item.querySelector('.selection-role-select').dataset.userId;
                const user = users.find(u => u.id == userId);
                const role = item.querySelector('.selection-role-select').value;
                
                addTeamMemberFromResult(user, role);
                modal.remove();
                
                // Limpiar formulario
                document.getElementById('externalUserName').value = '';
                document.getElementById('externalUserEmail').value = '';
            }
        });
    });
    
    document.getElementById('cancelSelection').addEventListener('click', () => {
        modal.remove();
    });
    
    document.getElementById('inviteNewUser').addEventListener('click', () => {
        modal.remove();
        createExternalInvitation(
            document.getElementById('externalUserName').value.trim(),
            document.getElementById('externalUserEmail').value.trim(),
            defaultRole
        );
    });
}

/* ============================================
   NUEVA FUNCIÓN: Crear invitación externa
============================================ */
function createExternalInvitation(name, email, role) {
    if (!email) {
        showNotification('Email es requerido para invitaciones', 'warning');
        return;
    }
    
    if (!validateEmail(email)) {
        showNotification('Email inválido', 'warning');
        return;
    }
    
    // Verificar si ya existe
    if (currentMembers.some(m => m.email === email)) {
        showNotification('Este email ya está en la lista', 'warning');
        return;
    }
    
    // Validar límites para admin
    if (role === 'admin') {
        const adminCount = currentMembers.filter(m => m.role === 'admin').length;
        if (adminCount >= 3) {
            showNotification('Máximo 3 administradores permitidos', 'warning');
            return;
        }
    }
    
    const member = {
        id: null,
        name: name || email.split('@')[0],
        email: email,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name || email)}&background=random`,
        role: role,
        is_external: true,
        needs_invitation: true
    };
    
    addMemberToUI(member);
    updateCompleteButton();
    
    // Limpiar formulario
    document.getElementById('externalUserName').value = '';
    document.getElementById('externalUserEmail').value = '';
}
    
    /* ============================================
       FUNCIONES DE BÚSQUEDA Y AÑADIR MIEMBROS
    ============================================ */
    
    function handleTeamSearch(e) {
        const query = e.target.value.trim();
        const resultsDiv = document.getElementById('teamSearchResults');
        
        if (!query || query.length < 2) {
            resultsDiv.style.display = 'none';
            return;
        }
        
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            try {
                // Buscar en el equipo de la app
                const response = await fetch(`/search_team_users_c/${communityId}?q=${encodeURIComponent(query)}`);
                const users = await response.json();
                
                if (!users || users.length === 0) {
                    resultsDiv.innerHTML = '<div style="padding: 12px 16px; color: #6b7280;">No se encontraron usuarios</div>';
                    resultsDiv.style.display = 'block';
                    return;
                }
                
                resultsDiv.innerHTML = '';
                users.forEach(user => {
                    const div = document.createElement('div');
                    div.className = 'user-result';
                    div.style.cssText = 'padding: 12px 16px; border-bottom: 1px solid #f3f4f6; cursor: pointer;';
                    div.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 10px;">
                            ${user.avatar_url ? 
                              `<img src="${user.avatar_url}" style="width: 32px; height: 32px; border-radius: 50%;">` : 
                              `<div style="width: 32px; height: 32px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center;">${user.name?.charAt(0) || 'U'}</div>`
                            }
                            <div>
                                <div style="font-weight: 500;">${user.name || 'Sin nombre'}</div>
                                <div style="font-size: 13px; color: #6b7280;">${user.email || 'Sin email'}</div>
                                ${user.team_role ? `<div style="font-size: 12px; color: #3b82f6;">${user.team_role}</div>` : ''}
                            </div>
                        </div>
                    `;
                    
                    div.addEventListener('click', () => {
                        addTeamMemberFromResult(user);
                        searchInput.value = user.name || user.email || '';
                        resultsDiv.style.display = 'none';
                    });
                    
                    resultsDiv.appendChild(div);
                });
                
                resultsDiv.style.display = 'block';
            } catch (error) {
                console.error('Error buscando usuarios:', error);
                resultsDiv.innerHTML = '<div style="padding: 12px 16px; color: #ef4444;">Error en la búsqueda</div>';
                resultsDiv.style.display = 'block';
            }
        }, 300);
    }
    
    function addTeamMember() {
        const searchInput = document.getElementById('teamSearchInput');
        const roleSelect = document.getElementById('teamRoleSelect');
        const query = searchInput.value.trim();
        
        if (!query) {
            showNotification('Ingresa un nombre o email para buscar', 'warning');
            return;
        }
        
        // Buscar usuarios y añadir el primero
        fetch(`/search_team_users_c/${communityId}?q=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(users => {
                if (users && users.length > 0) {
                    addTeamMemberFromResult(users[0], roleSelect.value);
                    searchInput.value = '';
                    document.getElementById('teamSearchResults').style.display = 'none';
                } else {
                    showNotification('No se encontró el usuario', 'warning');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showNotification('Error al buscar usuario', 'error');
            });
    }
    
    function addTeamMemberFromResult(user, role = null) {
        if (!role) {
            role = document.getElementById('teamRoleSelect').value;
        }
        
        // Validar límites
        if (role === 'admin') {
            const adminCount = currentMembers.filter(m => m.role === 'admin').length;
            if (adminCount >= 3) {
                showNotification('Máximo 3 administradores permitidos', 'warning');
                return;
            }
        }
        
        // Verificar si ya existe
        if (currentMembers.some(m => m.id === user.id)) {
            showNotification('Este usuario ya está en la lista', 'warning');
            return;
        }
        
        const member = {
            id: user.id,
            name: user.name || 'Usuario',
            email: user.email || '',
            avatar_url: user.avatar_url || '',
            role: role,
            is_external: false
        };
        
        addMemberToUI(member);
        updateCompleteButton();
    }
    
    function inviteExternalUser() {
        const nameInput = document.getElementById('externalUserName');
        const emailInput = document.getElementById('externalUserEmail');
        const roleSelect = document.getElementById('externalUserRole');
        
        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const role = roleSelect.value;
        
        if (!name || !email) {
            showNotification('Completa todos los campos', 'warning');
            return;
        }
        
        if (!validateEmail(email)) {
            showNotification('Email inválido', 'warning');
            return;
        }
        
        // Verificar si ya existe
        if (currentMembers.some(m => m.email === email)) {
            showNotification('Este email ya está en la lista', 'warning');
            return;
        }
        
        // Validar límites para admin
        if (role === 'admin') {
            const adminCount = currentMembers.filter(m => m.role === 'admin').length;
            if (adminCount >= 3) {
                showNotification('Máximo 3 administradores permitidos', 'warning');
                return;
            }
        }
        
        const member = {
            id: null,
            name: name,
            email: email,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            role: role,
            is_external: true,
            needs_invitation: true
        };
        
        addMemberToUI(member);
        updateCompleteButton();
        
        // Limpiar formulario
        nameInput.value = '';
        emailInput.value = '';
    }
    
function addMemberToUI(member) {
    currentMembers.push(member);

    // Ocultar mensaje de "no miembros"
    const noMembersMsg = document.getElementById('noCommunityMembers');
    if (noMembersMsg) {
        noMembersMsg.style.display = 'none';
    }

    // CONTENEDOR CORRECTO
    const membersList = document.getElementById('communityMembersList');
    if (!membersList) {
        console.error('❌ communityMembersList no existe en el DOM');
        return;
    }

    const memberDiv = document.createElement('div');
    memberDiv.className = 'community-member-item';
    memberDiv.dataset.userId = member.id;

    const roleColors = {
        owner:        { bg: '#fee2e2', color: '#dc2626', label: '👑 Owner' },
        admin:        { bg: '#dbeafe', color: '#2563eb', label: '🛡️ Admin' },
        moderator:    { bg: '#d1fae5', color: '#059669', label: '⚖️ Moderador' },
        collaborator: { bg: '#f3e8ff', color: '#7c3aed', label: '🤝 Colaborador' }
    };

    const roleInfo = roleColors[member.role] || roleColors.collaborator;

    memberDiv.innerHTML = `
        <div style="
            padding: 12px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            margin-bottom: 8px;
            background: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
        ">
            <div style="display: flex; align-items: center; gap: 10px;">
                <img src="${getSafeAvatar(member.avatar_url, member.name)}"
                     alt="${member.name}"
                     style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;"
                     onerror="this.src='${DEFAULT_AVATAR_URL}'">
                <div>
                    <div style="font-weight: 600; font-size: 14px;">${member.name}</div>
                    <div style="font-size: 12px; color: #6b7280;">
                        ${member.source === 'team' ? 'Miembro del equipo' : 'Usuario externo'}
                    </div>
                </div>
            </div>

            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="
                    padding: 4px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                    background: ${roleInfo.bg};
                    color: ${roleInfo.color};
                ">${roleInfo.label}</span>

                ${member.role !== 'owner' ? `
                    <button onclick="removeCommunityMember('${member.id}')"
                            style="
                                background: none;
                                border: none;
                                color: #ef4444;
                                cursor: pointer;
                                font-size: 16px;
                            ">×</button>
                ` : ''}
            </div>
        </div>
    `;

    membersList.appendChild(memberDiv);

    updateSelectedCount();
    updateCommunityMemberCount();
    updateCompleteButton();
}

    
    /* ============================================
       FUNCIONES DE CONFIGURACIÓN
    ============================================ */
    
    function updateCompleteButton() {
        const completeBtn = document.getElementById('completeSetupBtn');
        if (!completeBtn) return;
        
        // Verificar que haya al menos un owner (siempre está)
        const owners = currentMembers.filter(m => m.role === 'owner');
        
        if (owners.length === 1 && currentMembers.length > 1) {
            completeBtn.disabled = false;
            completeBtn.style.background = '#10b981';
            completeBtn.style.cursor = 'pointer';
        } else {
            completeBtn.disabled = true;
            completeBtn.style.background = '#9ca3af';
            completeBtn.style.cursor = 'not-allowed';
        }
    }
    
    async function skipSetup() {
        if (confirm('¿Seguro que quieres configurar el equipo después? Podrás hacerlo desde la configuración de la comunidad.')) {
            closeModal();
        }
    }
    
    async function completeSetup() {
        const completeBtn = document.getElementById('completeSetupBtn');
        if (completeBtn.disabled) return;
        
        // Mostrar loading
        completeBtn.innerHTML = '⏳ Guardando...';
        completeBtn.disabled = true;
        
        try {
            // 1. Guardar cada miembro
            const savePromises = currentMembers.map(async (member) => {
                // No guardar al owner actual (ya está)
                if (member.is_current_user) return Promise.resolve();
                
                const data = {
                    user_id: member.id,
                    email: member.email,
                    role: member.role,
                    name: member.name
                };
                
                const response = await fetch(`/api/community/${communityId}/add_member_role`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                
                return response.json();
            });
            
            await Promise.all(savePromises);
            
            // 2. Marcar como configurado
            const completeResponse = await fetch(`/api/community/${communityId}/complete_setup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            const result = await completeResponse.json();
            
            if (result.success) {
                showNotification('✅ Equipo configurado exitosamente', 'success');
                closeModal();
                
                // Recargar la página para actualizar el estado
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                throw new Error(result.error || 'Error al completar configuración');
            }
            
        } catch (error) {
            console.error('Error completando configuración:', error);
            showNotification('❌ Error: ' + error.message, 'error');
            
            // Restaurar botón
            completeBtn.innerHTML = '✅ Completar Configuración';
            completeBtn.disabled = false;
        }
    }
    
    function closeModal() {
        const modal = document.getElementById('teamSetupModal');
        if (modal) {
            modal.style.display = 'none';
            // Opcional: remover del DOM después de animación
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
    }
    
    /* ============================================
       FUNCIONES AUXILIARES
    ============================================ */
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function showNotification(message, type = 'info') {
        // Crear notificación
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 10px;
        `;
        
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="
                background: transparent; 
                border: none; 
                color: white; 
                cursor: pointer;
                font-size: 18px;
                padding: 0 5px;
            ">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
        
        // Añadir animación CSS si no existe
        if (!document.querySelector('#notification-animation')) {
            const style = document.createElement('style');
            style.id = 'notification-animation';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Inicializar el botón de completar
    updateCompleteButton();

        const debugBtn = document.createElement('button');
    debugBtn.innerHTML = '🐛 Debug Info';
    debugBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;background:red;color:white;padding:10px;z-index:99999;';
    debugBtn.onclick = () => {
        alert(`Debug:\nUser ID: ${userId}\nCommunity ID: ${communityId}\nisOwner: ${isOwner}\nteamConfigured: ${teamConfigured}`);
    };
    document.body.appendChild(debugBtn);
});
