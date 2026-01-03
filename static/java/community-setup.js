document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Iniciando configuración de equipo (MODO DEBUG FORZADO)');
    
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) {
        console.error('❌ NO HAY chat-container');
        return;
    }
    
    // FORZAR VALORES PARA TESTING
    const communityId = chatContainer.dataset.communityId;
    const currentUserName = chatContainer.dataset.userName || 'Usuario';
    const userId = chatContainer.dataset.userId;
    const isPublic = chatContainer.dataset.communityType === 'public';
    
    console.log('🔧 FORZANDO isOwner = true para testing');
    const isOwner = true; // ← AQUÍ ESTÁ LA MAGIA
    const teamConfigured = chatContainer.dataset.teamConfigured === 'true';
    
    console.log('📊 Valores:', { isOwner, teamConfigured, communityId, userId, isPublic });
    
    if (!isOwner || teamConfigured) {
        console.log('⚠️ No mostrar modal:', { isOwner, teamConfigured });
        return;
    }
    
    console.log('✅ Mostrando modal...');
    
    // Crear e insertar el HTML del modal
    createModalHTML();
    
    // Inicializar variables
    let currentMembers = [];
    let appTeamMembers = [];
    let searchTimeout = null;
    const communityTypes = {
        'public': { icon: '🌐', label: 'Público', desc: 'Cualquiera puede unirse' },
        'private': { icon: '🔒', label: 'Privado', desc: 'Solo por invitación' }
    };
    
    // Añadir el owner actual a la lista
    addOwnerToMembers();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Cargar miembros del equipo de la app
    loadAppTeamMembers();
    
    // Mostrar el modal
    setTimeout(() => {
        document.getElementById('teamSetupModal').style.display = 'flex';
    }, 300);
    
    /* ============================================
       FUNCIONES PRINCIPALES
    ============================================ */
    
    function createModalHTML() {
        const communityType = isPublic ? 'public' : 'private';
        const typeInfo = communityTypes[communityType];
        
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
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        ">
            <div style="
                background: white;
                border-radius: 12px;
                width: 95%;
                max-width: 1000px;
                max-height: 90vh;
                overflow: hidden;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            ">
                <!-- Header -->
                <div style="
                    padding: 24px 32px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    position: relative;
                ">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <h2 style="font-size: 24px; font-weight: 600; margin: 0 0 8px 0;">Configurar Equipo Administrativo</h2>
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; opacity: 0.9;">
                                <span>${typeInfo.icon} ${typeInfo.label}</span>
                                <span style="opacity: 0.7;">•</span>
                                <span>${typeInfo.desc}</span>
                            </div>
                        </div>
                        <button id="closeModalBtn" style="
                            background: rgba(255,255,255,0.2);
                            border: none;
                            color: white;
                            width: 32px;
                            height: 32px;
                            border-radius: 50%;
                            cursor: pointer;
                            font-size: 18px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                        ">×</button>
                    </div>
                    
                    <!-- Progress steps -->
                    <div style="display: flex; margin-top: 24px; gap: 12px;">
                        <div style="flex: 1; padding: 8px 12px; background: rgba(255,255,255,0.2); border-radius: 6px; font-size: 13px;">
                            <div style="font-weight: 500;">1. Configurar Roles</div>
                            <div style="font-size: 12px; opacity: 0.8;">Define permisos del equipo</div>
                        </div>
                        <div style="flex: 1; padding: 8px 12px; background: rgba(255,255,255,0.1); border-radius: 6px; font-size: 13px;">
                            <div style="font-weight: 500;">2. Asignar Miembros</div>
                            <div style="font-size: 12px; opacity: 0.8;">Equipo interno y externo</div>
                        </div>
                        <div style="flex: 1; padding: 8px 12px; background: rgba(255,255,255,0.1); border-radius: 6px; font-size: 13px;">
                            <div style="font-weight: 500;">3. Revisar</div>
                            <div style="font-size: 12px; opacity: 0.8;">Confirmar configuración</div>
                        </div>
                    </div>
                </div>
                
                <!-- Body -->
                <div style="padding: 0; height: calc(90vh - 180px); overflow-y: auto;">
                    <!-- Tabs -->
                    <div style="
                        display: flex;
                        border-bottom: 1px solid #e5e7eb;
                        background: #f8fafc;
                        padding: 0 32px;
                    ">
                        <button class="tab-btn active" data-tab="roles" style="
                            padding: 16px 24px;
                            background: none;
                            border: none;
                            border-bottom: 2px solid #667eea;
                            color: #667eea;
                            font-weight: 500;
                            cursor: pointer;
                            font-size: 14px;
                        ">👥 Roles Disponibles</button>
                        <button class="tab-btn" data-tab="team" style="
                            padding: 16px 24px;
                            background: none;
                            border: none;
                            color: #64748b;
                            font-weight: 500;
                            cursor: pointer;
                            font-size: 14px;
                        ">👨‍💼 Equipo de la App</button>
                        <button class="tab-btn" data-tab="external" style="
                            padding: 16px 24px;
                            background: none;
                            border: none;
                            color: #64748b;
                            font-weight: 500;
                            cursor: pointer;
                            font-size: 14px;
                        ">📧 Usuarios Externos</button>
                        ${!isPublic ? `
                        <button class="tab-btn" data-tab="invitations" style="
                            padding: 16px 24px;
                            background: none;
                            border: none;
                            color: #64748b;
                            font-weight: 500;
                            cursor: pointer;
                            font-size: 14px;
                        ">✉️ Invitaciones</button>
                        ` : ''}
                    </div>
                    
                    <!-- Tab content -->
                    <div id="tabContent" style="padding: 32px;">
                        <!-- Roles Tab -->
                        <div id="tab-roles" class="tab-content active">
                            <div style="margin-bottom: 32px;">
                                <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 16px 0;">Estructura de Roles</h3>
                                <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">
                                    Define los permisos para cada rol en tu comunidad. El Owner (tú) tiene control total.
                                </p>
                            </div>
                            
                            <div style="
                                display: grid;
                                grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
                                gap: 20px;
                                margin-bottom: 40px;
                            ">
                                <!-- Owner Card -->
                                <div class="role-card" style="
                                    padding: 20px;
                                    border-radius: 8px;
                                    border: 1px solid #fecaca;
                                    background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
                                ">
                                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                                        <div style="
                                            width: 40px;
                                            height: 40px;
                                            background: #dc2626;
                                            border-radius: 8px;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            color: white;
                                            font-size: 20px;
                                        ">👑</div>
                                        <div>
                                            <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">Owner</h4>
                                            <p style="margin: 4px 0 0 0; font-size: 12px; color: #dc2626;">Máximo: 1</p>
                                        </div>
                                    </div>
                                    <ul style="margin: 0; padding-left: 20px;">
                                        <li style="font-size: 13px; color: #374151; margin-bottom: 6px;">Control total de la comunidad</li>
                                        <li style="font-size: 13px; color: #374151; margin-bottom: 6px;">Gestiona todos los roles</li>
                                        <li style="font-size: 13px; color: #374151; margin-bottom: 6px;">Acceso completo a métricas</li>
                                    </ul>
                                </div>
                                
                                <!-- Admin Card -->
                                <div class="role-card" style="
                                    padding: 20px;
                                    border-radius: 8px;
                                    border: 1px solid #bfdbfe;
                                    background: linear-gradient(135deg, #eff6ff 0%, #bfdbfe 100%);
                                ">
                                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                                        <div style="
                                            width: 40px;
                                            height: 40px;
                                            background: #2563eb;
                                            border-radius: 8px;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            color: white;
                                            font-size: 20px;
                                        ">🛡️</div>
                                        <div>
                                            <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">Administrador</h4>
                                            <p style="margin: 4px 0 0 0; font-size: 12px; color: #2563eb;">Máximo: 3</p>
                                        </div>
                                    </div>
                                    <ul style="margin: 0; padding-left: 20px;">
                                        <li style="font-size: 13px; color: #374151; margin-bottom: 6px;">Publican anuncios oficiales</li>
                                        <li style="font-size: 13px; color: #374151; margin-bottom: 6px;">Crean encuestas y eventos</li>
                                        <li style="font-size: 13px; color: #374151; margin-bottom: 6px;">Gestionan funcionalidades</li>
                                    </ul>
                                </div>
                                
                                <!-- Moderator Card -->
                                <div class="role-card" style="
                                    padding: 20px;
                                    border-radius: 8px;
                                    border: 1px solid #a7f3d0;
                                    background: linear-gradient(135deg, #ecfdf5 0%, #a7f3d0 100%);
                                ">
                                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                                        <div style="
                                            width: 40px;
                                            height: 40px;
                                            background: #059669;
                                            border-radius: 8px;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            color: white;
                                            font-size: 20px;
                                        ">⚖️</div>
                                        <div>
                                            <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">Moderador</h4>
                                            <p style="margin: 4px 0 0 0; font-size: 12px; color: #059669;">Sin límite</p>
                                        </div>
                                    </div>
                                    <ul style="margin: 0; padding-left: 20px;">
                                        <li style="font-size: 13px; color: #374151; margin-bottom: 6px;">Mantienen orden y calidad</li>
                                        <li style="font-size: 13px; color: #374151; margin-bottom: 6px;">Borran contenido inapropiado</li>
                                        <li style="font-size: 13px; color: #374151; margin-bottom: 6px;">Silencian/expulsan miembros</li>
                                    </ul>
                                </div>
                                
                                <!-- Collaborator Card -->
                                <div class="role-card" style="
                                    padding: 20px;
                                    border-radius: 8px;
                                    border: 1px solid #ddd6fe;
                                    background: linear-gradient(135deg, #f5f3ff 0%, #ddd6fe 100%);
                                ">
                                    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                                        <div style="
                                            width: 40px;
                                            height: 40px;
                                            background: #7c3aed;
                                            border-radius: 8px;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            color: white;
                                            font-size: 20px;
                                        ">🤝</div>
                                        <div>
                                            <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">Colaborador</h4>
                                            <p style="margin: 4px 0 0 0; font-size: 12px; color: #7c3aed;">Sin límite</p>
                                        </div>
                                    </div>
                                    <ul style="margin: 0; padding-left: 20px;">
                                        <li style="font-size: 13px; color: #374151; margin-bottom: 6px;">Apoyo sin poder disciplinario</li>
                                        <li style="font-size: 13px; color: #374151; margin-bottom: 6px;">Responden dudas y guían</li>
                                        <li style="font-size: 13px; color: #374151; margin-bottom: 6px;">Marcan feedback útil</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                                <h4 style="font-size: 14px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">Notas importantes:</h4>
                                <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #6b7280;">
                                    <li>El rol de Owner no puede ser asignado a otros usuarios</li>
                                    <li>Los Administradores pueden gestionar Moderadores y Colaboradores</li>
                                    <li>Puedes modificar estos roles en cualquier momento desde la configuración</li>
                                </ul>
                            </div>
                        </div>
                        
                        <!-- Team Tab -->
                        <div id="tab-team" class="tab-content">
                            <div style="margin-bottom: 24px;">
                                <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">Equipo de la Aplicación</h3>
                                <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">
                                    Usuarios que ya tienen cuenta en la plataforma. Selecciona su rol para esta comunidad.
                                </p>
                                
                                <div style="display: flex; gap: 12px; margin-bottom: 24px;">
                                    <input type="text" 
                                           id="teamSearchInput" 
                                           placeholder="Buscar por nombre o email..."
                                           style="flex: 1; padding: 10px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;">
                                    <select id="teamRoleSelect" style="width: 180px; padding: 10px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white;">
                                        <option value="">Seleccionar rol</option>
                                        <option value="admin">Administrador</option>
                                        <option value="moderator">Moderador</option>
                                        <option value="collaborator">Colaborador</option>
                                    </select>
                                </div>
                                
                                <div id="teamSearchResults" style="
                                    border: 1px solid #e5e7eb;
                                    border-radius: 8px;
                                    max-height: 300px;
                                    overflow-y: auto;
                                    background: white;
                                    display: none;
                                "></div>
                            </div>
                            
                            <div id="appTeamMembersList">
                                <div style="text-align: center; padding: 40px 20px; color: #9ca3af;">
                                    <div style="font-size: 32px; margin-bottom: 16px; opacity: 0.5;">👥</div>
                                    <p style="font-size: 14px;">Busca usuarios del equipo para asignarles roles</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- External Tab -->
                        <div id="tab-external" class="tab-content">
                            <div style="margin-bottom: 24px;">
                                <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">Usuarios Externos</h3>
                                <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">
                                    Invita a usuarios que no están en la aplicación. Recibirán un email de invitación.
                                </p>
                                
                                <div style="
                                    background: #f8fafc;
                                    padding: 24px;
                                    border-radius: 8px;
                                    border: 1px solid #e5e7eb;
                                    margin-bottom: 32px;
                                ">
                                    <h4 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 16px 0;">Nueva Invitación</h4>
                                    
                                    <div style="display: grid; grid-template-columns: 1fr 1fr 180px auto; gap: 12px; align-items: end;">
                                        <div>
                                            <label style="display: block; font-size: 13px; color: #6b7280; margin-bottom: 6px;">Nombre</label>
                                            <input type="text" 
                                                   id="externalUserName" 
                                                   placeholder="Ej: María González"
                                                   style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                        </div>
                                        <div>
                                            <label style="display: block; font-size: 13px; color: #6b7280; margin-bottom: 6px;">Email</label>
                                            <input type="email" 
                                                   id="externalUserEmail" 
                                                   placeholder="ejemplo@email.com"
                                                   style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px;">
                                        </div>
                                        <div>
                                            <label style="display: block; font-size: 13px; color: #6b7280; margin-bottom: 6px;">Rol</label>
                                            <select id="externalUserRole" style="width: 100%; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 14px; background: white;">
                                                <option value="admin">Administrador</option>
                                                <option value="moderator" selected>Moderador</option>
                                                <option value="collaborator">Colaborador</option>
                                            </select>
                                        </div>
                                        <button id="inviteUserBtn" style="
                                            padding: 10px 20px;
                                            background: #7c3aed;
                                            color: white;
                                            border: none;
                                            border-radius: 6px;
                                            cursor: pointer;
                                            font-weight: 500;
                                            font-size: 14px;
                                            height: 40px;
                                        ">
                                            Invitar
                                        </button>
                                    </div>
                                    
                                    <div style="margin-top: 16px;">
                                        <label style="display: flex; align-items: center; gap: 8px; font-size: 13px; color: #6b7280;">
                                            <input type="checkbox" id="sendCustomMessage" style="margin: 0;">
                                            <span>Enviar mensaje personalizado con la invitación</span>
                                        </label>
                                    </div>
                                </div>
                                
                                <div id="externalMembersList">
                                    <h4 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 16px 0;">Invitaciones Pendientes</h4>
                                    <div style="text-align: center; padding: 40px 20px; color: #9ca3af; border: 1px dashed #e5e7eb; border-radius: 8px;">
                                        <div style="font-size: 32px; margin-bottom: 16px; opacity: 0.5;">📧</div>
                                        <p style="font-size: 14px; margin-bottom: 8px;">No hay invitaciones pendientes</p>
                                        <p style="font-size: 12px; opacity: 0.7;">Los usuarios invitados aparecerán aquí</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Invitations Tab (solo para comunidades privadas) -->
                        ${!isPublic ? `
                        <div id="tab-invitations" class="tab-content">
                            <div style="margin-bottom: 24px;">
                                <h3 style="font-size: 18px; font-weight: 600; color: #1f2937; margin: 0 0 12px 0;">Mensaje de Invitación</h3>
                                <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px 0;">
                                    Personaliza el mensaje que recibirán los usuarios invitados a esta comunidad privada.
                                </p>
                            </div>
                            
                            <div style="
                                background: #f8fafc;
                                padding: 24px;
                                border-radius: 8px;
                                border: 1px solid #e5e7eb;
                                margin-bottom: 24px;
                            ">
                                <label style="display: block; font-size: 14px; font-weight: 500; color: #1f2937; margin-bottom: 12px;">
                                    Plantilla de Mensaje
                                </label>
                                <textarea id="invitationTemplate" style="
                                    width: 100%;
                                    min-height: 200px;
                                    padding: 16px;
                                    border: 1px solid #d1d5db;
                                    border-radius: 8px;
                                    font-size: 14px;
                                    font-family: inherit;
                                    resize: vertical;
                                    line-height: 1.5;
                                ">¡Hola! Te invito a unirte a mi comunidad "${chatContainer.dataset.communityName || 'Comunidad'}".

Como ${currentUserName}, me gustaría que formes parte de nuestro equipo con el rol de [ROL].

En esta comunidad podrás:
• Participar en discusiones exclusivas
• Colaborar con otros miembros
• Acceder a contenido especial

Haz clic en el siguiente enlace para unirte: [ENLACE_DE_INVITACIÓN]

¡Espero verte dentro!

Saludos,
${currentUserName}</textarea>
                                
                                <div style="display: flex; gap: 12px; margin-top: 16px; font-size: 13px; color: #6b7280;">
                                    <div style="display: flex; align-items: center; gap: 4px;">
                                        <span style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">[ROL]</span>
                                        <span>→ Se reemplazará por el rol asignado</span>
                                    </div>
                                    <div style="display: flex; align-items: center; gap: 4px;">
                                        <span style="background: #e5e7eb; padding: 2px 6px; border-radius: 4px;">[ENLACE_DE_INVITACIÓN]</span>
                                        <span>→ Enlace único para cada invitado</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div style="background: #ecfdf5; padding: 16px; border-radius: 8px; border: 1px solid #a7f3d0;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <div style="font-size: 20px; color: #059669;">💡</div>
                                    <div>
                                        <h4 style="font-size: 14px; font-weight: 600; color: #065f46; margin: 0 0 4px 0;">Sugerencia</h4>
                                        <p style="font-size: 13px; color: #047857; margin: 0;">
                                            Este mensaje solo se enviará a usuarios externos. Los miembros del equipo recibirán una notificación interna.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="
                    padding: 20px 32px;
                    background: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <div style="font-size: 14px; color: #6b7280;">
                        <strong>Owner:</strong> ${currentUserName}
                    </div>
                    
                    <div style="display: flex; gap: 12px;">
                        <button id="skipSetupBtn" style="
                            padding: 10px 24px;
                            border-radius: 8px;
                            font-size: 14px;
                            font-weight: 500;
                            cursor: pointer;
                            background: white;
                            color: #64748b;
                            border: 1px solid #d1d5db;
                            transition: all 0.2s;
                        ">
                            Configurar después
                        </button>
                        <button id="completeSetupBtn" style="
                            padding: 10px 24px;
                            border-radius: 8px;
                            font-size: 14px;
                            font-weight: 500;
                            cursor: pointer;
                            background: #9ca3af;
                            color: white;
                            border: none;
                            cursor: not-allowed;
                            transition: all 0.2s;
                        " disabled>
                            Completar Configuración
                        </button>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Current Members Sidebar -->
        <div id="membersSidebar" style="
            position: fixed;
            top: 50%;
            right: 20px;
            transform: translateY(-50%);
            width: 300px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            border: 1px solid #e5e7eb;
            z-index: 9998;
            overflow: hidden;
        ">
            <div style="
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            ">
                <h3 style="font-size: 16px; font-weight: 600; margin: 0;">Miembros Configurados</h3>
                <div id="membersCount" style="font-size: 12px; opacity: 0.9; margin-top: 4px;">1 miembro</div>
            </div>
            
            <div style="padding: 16px; max-height: 400px; overflow-y: auto;">
                <div id="currentMembersList">
                    <!-- Owner -->
                    <div class="member-item" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px;
                        background: #fef2f2;
                        border-radius: 8px;
                        margin-bottom: 8px;
                        border-left: 4px solid #dc2626;
                    ">
                        <div style="
                            width: 36px;
                            height: 36px;
                            background: #dc2626;
                            border-radius: 50%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            color: white;
                            font-size: 14px;
                        ">👑</div>
                        <div style="flex: 1;">
                            <div style="font-size: 14px; font-weight: 500;">${currentUserName}</div>
                            <div style="font-size: 12px; color: #dc2626;">Owner</div>
                        </div>
                    </div>
                </div>
                
                <div id="noOtherMembers" style="text-align: center; padding: 20px; color: #9ca3af; font-size: 13px;">
                    Añade miembros en las pestañas correspondientes
                </div>
            </div>
            
            <div style="padding: 16px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                    <span>Administradores:</span>
                    <span id="adminCount">0/3</span>
                </div>
                <div style="display: flex; justify-content: space-between;">
                    <span>Total miembros:</span>
                    <span id="totalCount">1</span>
                </div>
            </div>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Añadir estilos CSS
        const style = document.createElement('style');
        style.textContent = `
            .team-setup-modal {
                animation: fadeIn 0.3s ease-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .tab-content {
                display: none;
                animation: slideIn 0.3s ease-out;
            }
            
            .tab-content.active {
                display: block;
            }
            
            @keyframes slideIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .role-card {
                transition: all 0.3s ease;
            }
            
            .role-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
            }
            
            .member-item {
                transition: all 0.2s ease;
            }
            
            .member-item:hover {
                background: #f8fafc;
            }
        `;
        document.head.appendChild(style);
    }
    
    function addOwnerToMembers() {
        currentMembers.push({
            id: chatContainer.dataset.userId,
            name: currentUserName,
            email: '',
            avatar_url: '',
            role: 'owner',
            is_external: false,
            is_current_user: true
        });
    }
    
    function setupEventListeners() {
        // Cerrar modal
        const closeBtn = document.getElementById('closeModalBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', skipSetup);
        }
        
        // Tabs
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tab = this.dataset.tab;
                
                // Actualizar botones activos
                tabBtns.forEach(b => {
                    b.style.borderBottom = 'none';
                    b.style.color = '#64748b';
                });
                this.style.borderBottom = '2px solid #667eea';
                this.style.color = '#667eea';
                
                // Mostrar contenido activo
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(`tab-${tab}`).classList.add('active');
            });
        });
        
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
    
    async function loadAppTeamMembers() {
        try {
            const response = await fetch(`/api/community/${communityId}/app_team_members`);
            const members = await response.json();
            appTeamMembers = members || [];
            
            if (appTeamMembers.length > 0) {
                displayAppTeamMembers();
            }
        } catch (error) {
            console.error('Error cargando miembros del equipo:', error);
        }
    }
    
    function displayAppTeamMembers() {
        const container = document.getElementById('appTeamMembersList');
        if (!container) return;
        
        container.innerHTML = `
            <h4 style="font-size: 16px; font-weight: 600; color: #1f2937; margin: 0 0 16px 0;">Miembros Disponibles</h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">
                ${appTeamMembers.map(member => `
                    <div class="app-member-card" data-id="${member.id}" style="
                        padding: 16px;
                        border: 1px solid #e5e7eb;
                        border-radius: 8px;
                        background: white;
                        cursor: pointer;
                        transition: all 0.2s;
                    ">
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <img src="${member.avatar_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI0U1RTVFNSIvPjx0ZXh0IHg9IjIwIiB5PSIyNCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNiIgZmlsbD0iIzk5OSIgZm9udC1mYW1pbHk9IkFyaWFsIj4${btoa(member.name?.charAt(0) || 'U')}</dGV4dD48L3N2Zz4='}"
                                 alt="${member.name}"
                                 style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;">
                            <div style="flex: 1;">
                                <div style="font-size: 14px; font-weight: 500;">${member.name || 'Usuario'}</div>
                                <div style="font-size: 12px; color: #6b7280;">${member.email || ''}</div>
                            </div>
                        </div>
                        <div style="margin-top: 12px;">
                            <select class="member-role-select" data-user-id="${member.id}" style="
                                width: 100%;
                                padding: 8px 12px;
                                border: 1px solid #d1d5db;
                                border-radius: 6px;
                                font-size: 13px;
                                background: white;
                            ">
                                <option value="">Sin asignar</option>
                                <option value="admin">Administrador</option>
                                <option value="moderator">Moderador</option>
                                <option value="collaborator">Colaborador</option>
                            </select>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Añadir event listeners para los selects
        container.querySelectorAll('.member-role-select').forEach(select => {
            select.addEventListener('change', function() {
                const userId = this.dataset.userId;
                const role = this.value;
                const member = appTeamMembers.find(m => m.id == userId);
                
                if (role && member) {
                    addTeamMemberFromResult(member, role);
                    this.value = role;
                }
            });
        });
        
        // Añadir hover effect
        container.querySelectorAll('.app-member-card').forEach(card => {
            card.addEventListener('mouseenter', function() {
                this.style.borderColor = '#667eea';
                this.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.2)';
            });
            
            card.addEventListener('mouseleave', function() {
                this.style.borderColor = '#e5e7eb';
                this.style.boxShadow = 'none';
            });
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
                    resultsDiv.innerHTML = '<div style="padding: 16px; color: #6b7280; text-align: center; font-size: 14px;">No se encontraron usuarios</div>';
                    resultsDiv.style.display = 'block';
                    return;
                }
                
                resultsDiv.innerHTML = '';
                users.forEach(user => {
                    // No mostrar si ya está en currentMembers
                    if (currentMembers.some(m => m.id === user.id)) return;
                    
                    const div = document.createElement('div');
                    div.className = 'user-result';
                    div.style.cssText = 'padding: 12px 16px; border-bottom: 1px solid #f3f4f6; cursor: pointer; transition: background 0.2s;';
                    div.innerHTML = `
                        <div style="display: flex; align-items: center; gap: 12px;">
                            ${user.avatar_url ? 
                              `<img src="${user.avatar_url}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">` : 
                              `<div style="width: 36px; height: 36px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; color: #6b7280; font-size: 14px;">${user.name?.charAt(0) || 'U'}</div>`
                            }
                            <div style="flex: 1;">
                                <div style="font-weight: 500; font-size: 14px;">${user.name || 'Sin nombre'}</div>
                                <div style="font-size: 13px; color: #6b7280;">${user.email || 'Sin email'}</div>
                            </div>
                            <div style="font-size: 12px; color: #3b82f6; padding: 4px 8px; background: #eff6ff; border-radius: 4px;">
                                Añadir
                            </div>
                        </div>
                    `;
                    
                    div.addEventListener('click', () => {
                        addTeamMemberFromResult(user);
                        document.getElementById('teamSearchInput').value = '';
                        resultsDiv.style.display = 'none';
                    });
                    
                    div.addEventListener('mouseenter', () => {
                        div.style.background = '#f8fafc';
                    });
                    
                    div.addEventListener('mouseleave', () => {
                        div.style.background = 'white';
                    });
                    
                    resultsDiv.appendChild(div);
                });
                
                resultsDiv.style.display = 'block';
            } catch (error) {
                console.error('Error buscando usuarios:', error);
                resultsDiv.innerHTML = '<div style="padding: 16px; color: #ef4444; text-align: center; font-size: 14px;">Error en la búsqueda</div>';
                resultsDiv.style.display = 'block';
            }
        }, 300);
    }
    
    function addTeamMember() {
        const searchInput = document.getElementById('teamSearchInput');
        const roleSelect = document.getElementById('teamRoleSelect');
        const query = searchInput.value.trim();
        const role = roleSelect.value;
        
        if (!query) {
            showNotification('Ingresa un nombre o email para buscar', 'warning');
            return;
        }
        
        if (!role) {
            showNotification('Selecciona un rol para el usuario', 'warning');
            return;
        }
        
        // Buscar usuarios y añadir el primero
        fetch(`/search_team_users/${communityId}?q=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(users => {
                if (users && users.length > 0) {
                    addTeamMemberFromResult(users[0], role);
                    searchInput.value = '';
                    roleSelect.value = '';
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
        
        if (!role) {
            showNotification('Selecciona un rol para el usuario', 'warning');
            return;
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
            avatar_url: user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=random`,
            role: role,
            is_external: false
        };
        
        addMemberToUI(member);
        updateUI();
    }
    
    function inviteExternalUser() {
        const nameInput = document.getElementById('externalUserName');
        const emailInput = document.getElementById('externalUserEmail');
        const roleSelect = document.getElementById('externalUserRole');
        const sendCustomMessage = document.getElementById('sendCustomMessage')?.checked;
        
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
            id: `ext_${Date.now()}`,
            name: name,
            email: email,
            avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`,
            role: role,
            is_external: true,
            needs_invitation: true,
            invitation_message: sendCustomMessage ? document.getElementById('invitationTemplate')?.value : null
        };
        
        addMemberToUI(member);
        updateUI();
        
        // Limpiar formulario
        nameInput.value = '';
        emailInput.value = '';
    }
    
    function addMemberToUI(member) {
        currentMembers.push(member);
        
        // Actualizar sidebar
        updateMembersSidebar();
    }
    
    function updateMembersSidebar() {
        const membersList = document.getElementById('currentMembersList');
        const noOtherMembers = document.getElementById('noOtherMembers');
        
        if (!membersList) return;
        
        // Filtrar miembros que no sean el owner
        const otherMembers = currentMembers.filter(m => !m.is_current_user);
        
        if (otherMembers.length > 0) {
            if (noOtherMembers) {
                noOtherMembers.style.display = 'none';
            }
            
            // Añadir miembros al sidebar
            membersList.innerHTML = `
                <!-- Owner -->
                <div class="member-item" style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background: #fef2f2;
                    border-radius: 8px;
                    margin-bottom: 8px;
                    border-left: 4px solid #dc2626;
                ">
                    <div style="
                        width: 36px;
                        height: 36px;
                        background: #dc2626;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 14px;
                    ">👑</div>
                    <div style="flex: 1;">
                        <div style="font-size: 14px; font-weight: 500;">${currentMembers.find(m => m.is_current_user)?.name || currentUserName}</div>
                        <div style="font-size: 12px; color: #dc2626;">Owner</div>
                    </div>
                </div>
                
                <!-- Otros miembros -->
                ${otherMembers.map(member => {
                    const roleColors = {
                        'owner': { bg: '#fee2e2', color: '#dc2626', border: '#dc2626' },
                        'admin': { bg: '#dbeafe', color: '#2563eb', border: '#2563eb' },
                        'moderator': { bg: '#d1fae5', color: '#059669', border: '#059669' },
                        'collaborator': { bg: '#f3e8ff', color: '#7c3aed', border: '#7c3aed' }
                    };
                    
                    const roleInfo = roleColors[member.role] || roleColors.collaborator;
                    
                    return `
                    <div class="member-item" style="
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        padding: 12px;
                        background: white;
                        border-radius: 8px;
                        margin-bottom: 8px;
                        border-left: 4px solid ${roleInfo.border};
                        border: 1px solid #e5e7eb;
                    ">
                        <img src="${member.avatar_url}"
                             alt="${member.name}"
                             style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;"
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iMzYiIHZpZXdCb3g9IjAgMCAzNiAzNiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxOCIgY3k9IjE4IiByPSIxOCIgZmlsbD0iI0U1RTVFNSIvPjx0ZXh0IHg9IjE4IiB5PSIyMiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgZm9udC1mYW1pbHk9IkFyaWFsIj4${btoa(member.name?.charAt(0) || 'U')}</dGV4dD48L3N2Zz4='">
                        <div style="flex: 1;">
                            <div style="font-size: 14px; font-weight: 500;">${member.name}</div>
                            <div style="font-size: 12px; color: ${roleInfo.color};">${member.role === 'admin' ? 'Administrador' : member.role === 'moderator' ? 'Moderador' : member.role === 'collaborator' ? 'Colaborador' : 'Owner'}</div>
                        </div>
                        ${member.needs_invitation ? 
                          '<div style="font-size: 10px; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px;">Pendiente</div>' : 
                          ''}
                        <button onclick="removeMemberFromSidebar('${member.email}')" style="
                            background: none;
                            border: none;
                            color: #9ca3af;
                            cursor: pointer;
                            font-size: 18px;
                            padding: 0 4px;
                            opacity: 0.7;
                            transition: opacity 0.2s;
                        " title="Eliminar">×</button>
                    </div>
                    `;
                }).join('')}
            `;
        } else {
            if (noOtherMembers) {
                noOtherMembers.style.display = 'block';
            }
        }
        
        // Actualizar contadores
        updateCounters();
    }
    
    function updateCounters() {
        const adminCount = currentMembers.filter(m => m.role === 'admin').length;
        const totalCount = currentMembers.length;
        
        document.getElementById('membersCount').textContent = `${totalCount} miembro${totalCount !== 1 ? 's' : ''}`;
        document.getElementById('adminCount').textContent = `${adminCount}/3`;
        document.getElementById('totalCount').textContent = totalCount;
    }
    
    function removeMemberFromSidebar(email) {
        currentMembers = currentMembers.filter(m => m.email !== email);
        updateMembersSidebar();
        updateUI();
    }
    
    /* ============================================
       FUNCIONES DE CONFIGURACIÓN
    ============================================ */
    
    function updateUI() {
        updateCompleteButton();
        updateCounters();
    }
    
    function updateCompleteButton() {
        const completeBtn = document.getElementById('completeSetupBtn');
        if (!completeBtn) return;
        
        // Verificar que haya al menos un owner (siempre está) y algún otro miembro
        const hasOtherMembers = currentMembers.length > 1;
        
        if (hasOtherMembers) {
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
        const originalText = completeBtn.innerHTML;
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
                    name: member.name,
                    is_external: member.is_external,
                    invitation_message: member.invitation_message
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
            completeBtn.innerHTML = originalText;
            completeBtn.disabled = false;
            completeBtn.style.background = '#10b981';
        }
    }
    
    function closeModal() {
        const modal = document.getElementById('teamSetupModal');
        const sidebar = document.getElementById('membersSidebar');
        
        if (modal) {
            modal.style.display = 'none';
            setTimeout(() => {
                modal.remove();
            }, 300);
        }
        
        if (sidebar) {
            sidebar.remove();
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
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 12px;
            font-size: 14px;
        `;
        
        notification.innerHTML = `
            <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'}</span>
            <span style="flex: 1;">${message}</span>
            <button onclick="this.parentElement.remove()" style="
                background: transparent; 
                border: none; 
                color: white; 
                cursor: pointer;
                font-size: 18px;
                padding: 0 5px;
                opacity: 0.7;
                transition: opacity 0.2s;
            " title="Cerrar">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 4000);
        
        // Añadir animaciones CSS si no existen
        if (!document.querySelector('#notification-animations')) {
            const style = document.createElement('style');
            style.id = 'notification-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOutRight {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    // Añadir funciones globales para el sidebar
    window.removeMemberFromSidebar = removeMemberFromSidebar;
    
    // Inicializar UI
    updateUI();
});