// community-setup.js - Archivo único para el modal de configuración de equipo
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando sistema de configuración de equipo');
    
    // Verificar si somos el owner y si el equipo no está configurado
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return;
    
    const communityId = chatContainer.dataset.communityId;
    const isOwner = chatContainer.dataset.isOwner === 'true';
    const teamConfigured = chatContainer.dataset.teamConfigured === 'true';
    const currentUserName = chatContainer.dataset.userName || 'Usuario';
    
    // Si no es owner o ya está configurado, no mostrar nada
    if (!isOwner || teamConfigured) {
        console.log('ℹ️ No se necesita configuración de equipo');
        return;
    }
    
    console.log('🎯 Mostrando modal de configuración para owner');
    
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
    
    function createModalHTML() {
        const modalHTML = `
        <div id="teamSetupModal" class="team-setup-modal" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.8);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(4px);
        ">
            <div style="
                background: white;
                border-radius: 20px;
                width: 90%;
                max-width: 1200px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                animation: slideUp 0.4s ease-out;
            ">
                <!-- Header -->
                <div style="
                    padding: 30px 40px 20px;
                    border-bottom: 1px solid #e5e7eb;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 20px 20px 0 0;
                ">
                    <h2 style="font-size: 28px; margin-bottom: 8px;">👥 Configurar Equipo</h2>
                    <p style="font-size: 16px; opacity: 0.9;">Asigna roles a los miembros de la comunidad</p>
                </div>
                
                <!-- Body -->
                <div style="padding: 30px 40px;">
                    <!-- Grid de roles -->
                    <div style="
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                        gap: 20px;
                        margin-bottom: 40px;
                    ">
                        <!-- Owner Card -->
                        <div style="
                            padding: 25px;
                            border-radius: 16px;
                            border: 1px solid #e5e7eb;
                            border-left: 5px solid #dc2626;
                            transition: all 0.3s ease;
                        ">
                            <div style="font-size: 40px; margin-bottom: 15px;">👑</div>
                            <div>
                                <h3 style="font-size: 18px; margin-bottom: 12px; color: #1e293b;">Owner / Creador</h3>
                                <ul style="list-style: none; padding: 0; margin: 0 0 15px 0;">
                                    <li style="font-size: 14px; color: #64748b; margin-bottom: 6px; padding-left: 20px; position: relative;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Control total de la comunidad
                                    </li>
                                    <li style="font-size: 14px; color: #64748b; margin-bottom: 6px; padding-left: 20px; position: relative;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Asigna y revoca roles
                                    </li>
                                    <li style="font-size: 14px; color: #64748b; margin-bottom: 6px; padding-left: 20px; position: relative;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Acceso completo a métricas
                                    </li>
                                </ul>
                                <div style="font-size: 13px; color: #6b7280; font-style: italic; padding-top: 10px; border-top: 1px dashed #e5e7eb;">
                                    👉 Solo debe haber 1
                                </div>
                            </div>
                        </div>
                        
                        <!-- Admin Card -->
                        <div style="
                            padding: 25px;
                            border-radius: 16px;
                            border: 1px solid #e5e7eb;
                            border-left: 5px solid #2563eb;
                            transition: all 0.3s ease;
                        ">
                            <div style="font-size: 40px; margin-bottom: 15px;">🛡️</div>
                            <div>
                                <h3 style="font-size: 18px; margin-bottom: 12px; color: #1e293b;">Administrador</h3>
                                <ul style="list-style: none; padding: 0; margin: 0 0 15px 0;">
                                    <li style="font-size: 14px; color: #64748b; margin-bottom: 6px; padding-left: 20px; position: relative;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Gestionan funcionamiento diario
                                    </li>
                                    <li style="font-size: 14px; color: #64748b; margin-bottom: 6px; padding-left: 20px; position: relative;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Publican anuncios oficiales
                                    </li>
                                    <li style="font-size: 14px; color: #64748b; margin-bottom: 6px; padding-left: 20px; position: relative;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Crean encuestas y fijan mensajes
                                    </li>
                                </ul>
                                <div style="font-size: 13px; color: #6b7280; font-style: italic; padding-top: 10px; border-top: 1px dashed #e5e7eb;">
                                    👉 1–3 máximo
                                </div>
                            </div>
                        </div>
                        
                        <!-- Moderator Card -->
                        <div style="
                            padding: 25px;
                            border-radius: 16px;
                            border: 1px solid #e5e7eb;
                            border-left: 5px solid #059669;
                            transition: all 0.3s ease;
                        ">
                            <div style="font-size: 40px; margin-bottom: 15px;">⚖️</div>
                            <div>
                                <h3 style="font-size: 18px; margin-bottom: 12px; color: #1e293b;">Moderador</h3>
                                <ul style="list-style: none; padding: 0; margin: 0 0 15px 0;">
                                    <li style="font-size: 14px; color: #64748b; margin-bottom: 6px; padding-left: 20px; position: relative;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Mantienen orden y calidad
                                    </li>
                                    <li style="font-size: 14px; color: #64748b; margin-bottom: 6px; padding-left: 20px; position: relative;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Borran mensajes inapropiados
                                    </li>
                                    <li style="font-size: 14px; color: #64748b; margin-bottom: 6px; padding-left: 20px; position: relative;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Silencian/expulsan temporalmente
                                    </li>
                                </ul>
                                <div style="font-size: 13px; color: #6b7280; font-style: italic; padding-top: 10px; border-top: 1px dashed #e5e7eb;">
                                    👉 Rol más importante día a día
                                </div>
                            </div>
                        </div>
                        
                        <!-- Collaborator Card -->
                        <div style="
                            padding: 25px;
                            border-radius: 16px;
                            border: 1px solid #e5e7eb;
                            border-left: 5px solid #7c3aed;
                            transition: all 0.3s ease;
                        ">
                            <div style="font-size: 40px; margin-bottom: 15px;">🤝</div>
                            <div>
                                <h3 style="font-size: 18px; margin-bottom: 12px; color: #1e293b;">Colaborador</h3>
                                <ul style="list-style: none; padding: 0; margin: 0 0 15px 0;">
                                    <li style="font-size: 14px; color: #64748b; margin-bottom: 6px; padding-left: 20px; position: relative;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Apoyo sin poder disciplinario
                                    </li>
                                    <li style="font-size: 14px; color: #64748b; margin-bottom: 6px; padding-left: 20px; position: relative;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Responden dudas y guían
                                    </li>
                                    <li style="font-size: 14px; color: #64748b; margin-bottom: 6px; padding-left: 20px; position: relative;">
                                        <span style="position: absolute; left: 0; color: #10b981; font-weight: bold;">✓</span>
                                        Marcan feedback útil
                                    </li>
                                </ul>
                                <div style="font-size: 13px; color: #6b7280; font-style: italic; padding-top: 10px; border-top: 1px dashed #e5e7eb;">
                                    👉 Ideal para no dar poder excesivo
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Formulario de configuración -->
                    <div style="margin-bottom: 30px;">
                        <!-- Buscar miembros del equipo -->
                        <div style="
                            margin-bottom: 30px;
                            padding: 25px;
                            background: #f8fafc;
                            border-radius: 12px;
                            border: 1px solid #e2e8f0;
                        ">
                            <h3 style="font-size: 18px; margin-bottom: 8px; color: #1e293b;">👥 Añadir Miembros del Equipo</h3>
                            <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">
                                Busca miembros que ya están en el equipo de la app
                            </p>
                            
                            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                                <input type="text" 
                                       id="teamSearchInput" 
                                       placeholder="Buscar por nombre o email..."
                                       style="flex: 1; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                                <select id="teamRoleSelect" style="width: 180px; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                                    <option value="admin">🛡️ Administrador</option>
                                    <option value="moderator">⚖️ Moderador</option>
                                    <option value="collaborator">🤝 Colaborador</option>
                                </select>
                                <button id="addTeamMemberBtn" style="padding: 12px 20px; background: #3b82f6; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                                    Añadir
                                </button>
                            </div>
                            <div id="teamSearchResults" style="
                                border: 1px solid #e5e7eb;
                                border-radius: 8px;
                                max-height: 200px;
                                overflow-y: auto;
                                background: white;
                                display: none;
                            "></div>
                        </div>
                        
                        <!-- Invitar usuarios externos -->
                        <div style="
                            margin-bottom: 30px;
                            padding: 25px;
                            background: #f8fafc;
                            border-radius: 12px;
                            border: 1px solid #e2e8f0;
                        ">
                            <h3 style="font-size: 18px; margin-bottom: 8px; color: #1e293b;">📧 Invitar Usuarios Externos</h3>
                            <p style="font-size: 14px; color: #64748b; margin-bottom: 20px;">
                                Invita a personas que no están en el equipo de la app
                            </p>
                            
                            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                                <input type="text" 
                                       id="externalUserName" 
                                       placeholder="Nombre del invitado"
                                       style="flex: 1; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                                <input type="email" 
                                       id="externalUserEmail" 
                                       placeholder="Email del invitado"
                                       style="flex: 1; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                                <select id="externalUserRole" style="width: 180px; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                                    <option value="admin">🛡️ Administrador</option>
                                    <option value="moderator">⚖️ Moderador</option>
                                    <option value="collaborator">🤝 Colaborador</option>
                                </select>
                                <button id="inviteUserBtn" style="padding: 12px 20px; background: #7c3aed; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;">
                                    Invitar
                                </button>
                            </div>
                            <p style="font-size: 13px; color: #6b7280; margin-top: 10px;">
                                El usuario recibirá un email de invitación
                            </p>
                        </div>
                        
                        <!-- Miembros actuales -->
                        <div style="
                            margin-bottom: 30px;
                            padding: 25px;
                            background: #f8fafc;
                            border-radius: 12px;
                            border: 1px solid #e2e8f0;
                        ">
                            <h3 style="font-size: 18px; margin-bottom: 8px; color: #1e293b;">✅ Miembros Configurados</h3>
                            <div id="currentMembersList" style="min-height: 150px; margin-bottom: 20px;">
                                <div id="noMembersMessage" style="text-align: center; padding: 40px 20px; color: #9ca3af;">
                                    <div style="font-size: 48px; margin-bottom: 10px; opacity: 0.5;">👤</div>
                                    <p>Añade miembros usando los formularios de arriba</p>
                                </div>
                            </div>
                            
                            <!-- Owner actual -->
                            <div id="ownerInfo" style="
                                display: flex;
                                align-items: center;
                                gap: 15px;
                                padding: 15px;
                                background: #fef3c7;
                                border-radius: 10px;
                                border: 1px solid #fbbf24;
                            ">
                                <div style="font-size: 24px;">👑</div>
                                <div style="flex: 1;">
                                    <strong>${currentUserName}</strong> (Tú)
                                    <div style="font-size: 13px; color: #92400e;">Owner de esta comunidad</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="
                    padding: 25px 40px;
                    background: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    border-radius: 0 0 20px 20px;
                ">
                    <button id="skipSetupBtn" style="
                        padding: 14px 28px;
                        border-radius: 10px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        background: white;
                        color: #64748b;
                        border: 1px solid #d1d5db;
                    ">
                        ⏭️ Configurar después
                    </button>
                    <button id="completeSetupBtn" style="
                        padding: 14px 28px;
                        border-radius: 10px;
                        font-size: 16px;
                        font-weight: 600;
                        cursor: pointer;
                        background: #9ca3af;
                        color: white;
                        border: none;
                        cursor: not-allowed;
                    " disabled>
                        ✅ Completar Configuración
                    </button>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Añadir animación CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideUp {
                from { opacity: 0; transform: translateY(30px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `;
        document.head.appendChild(style);
    }
    
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
        // Buscar miembros del equipo
        const searchInput = document.getElementById('teamSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', handleTeamSearch);
        }
        
        // Añadir miembro del equipo
        const addTeamBtn = document.getElementById('addTeamMemberBtn');
        if (addTeamBtn) {
            addTeamBtn.addEventListener('click', addTeamMember);
        }
        
        // Invitar usuario externo
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
        
        // Enter en inputs
        const inputs = ['teamSearchInput', 'externalUserName', 'externalUserEmail'];
        inputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (id === 'teamSearchInput') {
                            addTeamMember();
                        } else {
                            inviteExternalUser();
                        }
                    }
                });
            }
        });
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
                const response = await fetch(`/search_team_users/${communityId}?q=${encodeURIComponent(query)}`);
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
        fetch(`/search_team_users/${communityId}?q=${encodeURIComponent(query)}`)
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
        
        // Ocultar mensaje de "sin miembros"
        const noMembersMsg = document.getElementById('noMembersMessage');
        if (noMembersMsg) {
            noMembersMsg.style.display = 'none';
        }
        
        // Crear elemento
        const membersList = document.getElementById('currentMembersList');
        const memberDiv = document.createElement('div');
        memberDiv.className = 'member-item';
        memberDiv.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            margin-bottom: 10px;
        `;
        
        const roleColors = {
            'owner': { bg: '#fee2e2', color: '#dc2626', label: '👑 Owner' },
            'admin': { bg: '#dbeafe', color: '#2563eb', label: '🛡️ Admin' },
            'moderator': { bg: '#d1fae5', color: '#059669', label: '⚖️ Moderador' },
            'collaborator': { bg: '#f3e8ff', color: '#7c3aed', label: '🤝 Colaborador' }
        };
        
        const roleInfo = roleColors[member.role] || roleColors.collaborator;
        
        memberDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${member.avatar_url}" 
                     alt="${member.name}" 
                     style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI0U1RTVFNSIvPjx0ZXh0IHg9IjIwIiB5PSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgZm9udC1mYW1pbHk9IkFyaWFsIj4${btoa(member.name?.charAt(0) || 'U')}</dGV4dD48L3N2Zz4='">
                <div>
                    <h4 style="margin: 0; font-size: 16px;">${member.name}</h4>
                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #6b7280;">${member.email || 'Sin email'}</p>
                    ${member.needs_invitation ? 
                      '<span style="font-size: 12px; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; margin-top: 4px; display: inline-block;">Invitación pendiente</span>' : 
                      ''}
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 600; background: ${roleInfo.bg}; color: ${roleInfo.color};">
                    ${roleInfo.label}
                </span>
                ${member.role !== 'owner' ? 
                  `<button onclick="removeMember('${member.email}')" style="background: none; border: none; color: #ef4444; cursor: pointer; font-size: 20px; padding: 5px;">×</button>` : 
                  ''}
            </div>
        `;
        
        membersList.appendChild(memberDiv);
        
        // Añadir función removeMember al scope global temporalmente
        window.removeMember = function(email) {
            currentMembers = currentMembers.filter(m => m.email !== email);
            
            // Remover del DOM
            const memberDivs = document.querySelectorAll('.member-item');
            memberDivs.forEach(div => {
                if (div.querySelector('p')?.textContent.includes(email)) {
                    div.remove();
                }
            });
            
            // Mostrar mensaje si no hay miembros (excepto owner)
            if (currentMembers.length === 1) {
                if (noMembersMsg) {
                    noMembersMsg.style.display = 'block';
                }
            }
            
            updateCompleteButton();
        };
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
});