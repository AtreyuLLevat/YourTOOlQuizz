// community-team-setup.js - VERSIÓN SIMPLIFICADA Y FUNCIONAL
(function() {
    'use strict';
    
    console.log('🚀 Iniciando sistema de configuración de equipo');
    
    // Esperar a que todo esté cargado
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 1000);
    }
    
    function init() {
        console.log('🔍 Buscando datos de comunidad...');
        
        // Verificar si estamos en una página de comunidad
        const chatContainer = document.getElementById('chat-container');
        const urlPath = window.location.pathname;
        const isCommunityPage = urlPath.includes('/community/');
        
        if (!isCommunityPage || !chatContainer) {
            console.log('ℹ️ No es página de comunidad o no hay chat container');
            return;
        }
        
        // Extraer datos
        const communityId = chatContainer.dataset.communityId;
        const isOwner = chatContainer.dataset.isOwner === 'true';
        const teamConfigured = chatContainer.dataset.teamConfigured === 'true';
        const currentUserId = chatContainer.dataset.userId;
        const currentUserName = chatContainer.dataset.userName || 'Usuario';
        
        console.log('📊 Datos de comunidad:', {
            communityId,
            isOwner,
            teamConfigured,
            currentUserId,
            currentUserName
        });
        
        // Solo mostrar si es owner y el equipo NO está configurado
        if (!isOwner || teamConfigured) {
            console.log('ℹ️ No se necesita configuración (no es owner o ya configurado)');
            return;
        }
        
        console.log('🎯 Mostrando modal de configuración de equipo');
        
        // Crear el modal (versión ultra-simplificada)
        createSimpleModal(communityId, currentUserId, currentUserName);
    }
    
    function createSimpleModal(communityId, userId, userName) {
        // Verificar si ya existe un modal
        if (document.getElementById('simpleTeamSetupModal')) {
            return;
        }
        
        console.log('🏗️ Creando modal simple...');
        
        const modalHTML = `
        <div id="simpleTeamSetupModal" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 99999;
            font-family: 'Inter', sans-serif;
        ">
            <div style="
                background: white;
                border-radius: 16px;
                width: 90%;
                max-width: 800px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: fadeIn 0.3s ease-out;
            ">
                <!-- Header -->
                <div style="
                    padding: 30px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    border-radius: 16px 16px 0 0;
                    text-align: center;
                ">
                    <h2 style="margin: 0 0 10px 0; font-size: 28px;">👥 Configurar Equipo</h2>
                    <p style="margin: 0; opacity: 0.9; font-size: 16px;">¡Primero configura quién ayudará a gestionar esta comunidad!</p>
                </div>
                
                <!-- Body -->
                <div style="padding: 30px;">
                    <!-- Información rápida -->
                    <div style="
                        background: #f0f9ff;
                        border: 2px solid #bae6fd;
                        border-radius: 12px;
                        padding: 20px;
                        margin-bottom: 25px;
                    ">
                        <h3 style="margin-top: 0; color: #0369a1;">📋 ¿Por qué configurar el equipo?</h3>
                        <p style="color: #1e293b; margin-bottom: 15px;">
                            Asigna roles a los miembros para que te ayuden a moderar y gestionar la comunidad.
                        </p>
                        
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
                            <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #dc2626;">
                                <strong>👑 Owner</strong>
                                <div style="font-size: 14px; color: #64748b;">Tú (${userName})</div>
                            </div>
                            <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #2563eb;">
                                <strong>🛡️ Admin</strong>
                                <div style="font-size: 14px; color: #64748b;">Máximo 3</div>
                            </div>
                            <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #059669;">
                                <strong>⚖️ Moderador</strong>
                                <div style="font-size: 14px; color: #64748b;">Sin límite</div>
                            </div>
                            <div style="padding: 15px; background: white; border-radius: 8px; border-left: 4px solid #7c3aed;">
                                <strong>🤝 Colaborador</strong>
                                <div style="font-size: 14px; color: #64748b;">Apoyo</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Formulario simple -->
                    <div style="margin-bottom: 30px;">
                        <h3 style="margin-bottom: 20px; color: #1e293b;">Añadir miembros</h3>
                        
                        <!-- Añadir por email (simple) -->
                        <div style="
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 10px;
                            padding: 25px;
                            margin-bottom: 20px;
                        ">
                            <h4 style="margin-top: 0; color: #374151;">📧 Invitar por email</h4>
                            <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                                <input type="text" 
                                       id="inviteName" 
                                       placeholder="Nombre del invitado"
                                       style="flex: 1; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
                                <input type="email" 
                                       id="inviteEmail" 
                                       placeholder="email@ejemplo.com"
                                       style="flex: 1; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
                            </div>
                            <div style="display: flex; gap: 10px; align-items: center;">
                                <select id="inviteRole" style="padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
                                    <option value="admin">🛡️ Administrador</option>
                                    <option value="moderator">⚖️ Moderador</option>
                                    <option value="collaborator" selected>🤝 Colaborador</option>
                                </select>
                                <button id="btnInvite" style="
                                    padding: 12px 24px;
                                    background: #7c3aed;
                                    color: white;
                                    border: none;
                                    border-radius: 8px;
                                    cursor: pointer;
                                    font-weight: 600;
                                ">Enviar Invitación</button>
                            </div>
                        </div>
                        
                        <!-- Miembros añadidos -->
                        <div style="
                            background: #f8fafc;
                            border: 1px solid #e2e8f0;
                            border-radius: 10px;
                            padding: 25px;
                        ">
                            <h4 style="margin-top: 0; color: #374151;">✅ Miembros actuales</h4>
                            <div id="membersList" style="min-height: 100px;">
                                <!-- Miembro 1: Owner (automático) -->
                                <div style="
                                    display: flex;
                                    justify-content: space-between;
                                    align-items: center;
                                    padding: 15px;
                                    background: white;
                                    border: 1px solid #e5e7eb;
                                    border-radius: 8px;
                                    margin-bottom: 10px;
                                ">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="
                                            width: 40px;
                                            height: 40px;
                                            border-radius: 50%;
                                            background: #dc2626;
                                            color: white;
                                            display: flex;
                                            align-items: center;
                                            justify-content: center;
                                            font-size: 18px;
                                            font-weight: bold;
                                        ">${userName.charAt(0)}</div>
                                        <div>
                                            <div style="font-weight: 600;">${userName}</div>
                                            <div style="font-size: 14px; color: #6b7280;">Tú</div>
                                        </div>
                                    </div>
                                    <span style="
                                        padding: 6px 12px;
                                        background: #fee2e2;
                                        color: #dc2626;
                                        border-radius: 20px;
                                        font-size: 14px;
                                        font-weight: 600;
                                    ">👑 Owner</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Mensaje de ayuda -->
                    <div style="
                        background: #fef3c7;
                        border: 1px solid #fbbf24;
                        border-radius: 8px;
                        padding: 15px;
                        margin-bottom: 20px;
                    ">
                        <p style="margin: 0; color: #92400e; font-size: 14px;">
                            💡 <strong>Consejo:</strong> Puedes añadir miembros más tarde desde la configuración de la comunidad.
                        </p>
                    </div>
                </div>
                
                <!-- Footer -->
                <div style="
                    padding: 25px 30px;
                    background: #f9fafb;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    border-radius: 0 0 16px 16px;
                ">
                    <button id="btnSkip" style="
                        padding: 14px 28px;
                        background: white;
                        color: #64748b;
                        border: 1px solid #d1d5db;
                        border-radius: 10px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 16px;
                    ">⏭️ Saltar por ahora</button>
                    <button id="btnComplete" style="
                        padding: 14px 28px;
                        background: #10b981;
                        color: white;
                        border: none;
                        border-radius: 10px;
                        cursor: pointer;
                        font-weight: 600;
                        font-size: 16px;
                    ">✅ Completar Configuración</button>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            #simpleTeamSetupModal input,
            #simpleTeamSetupModal select,
            #simpleTeamSetupModal button {
                font-family: 'Inter', sans-serif;
            }
            
            #simpleTeamSetupModal input:focus,
            #simpleTeamSetupModal select:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
        </style>
        `;
        
        // Insertar en el body
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Añadir animación CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        // Configurar event listeners
        setupModalListeners(communityId, userId, userName);
        
        console.log('✅ Modal creado correctamente');
    }
    
    function setupModalListeners(communityId, userId, userName) {
        console.log('🔗 Configurando event listeners...');
        
        const modal = document.getElementById('simpleTeamSetupModal');
        const btnInvite = document.getElementById('btnInvite');
        const btnSkip = document.getElementById('btnSkip');
        const btnComplete = document.getElementById('btnComplete');
        const inviteName = document.getElementById('inviteName');
        const inviteEmail = document.getElementById('inviteEmail');
        const inviteRole = document.getElementById('inviteRole');
        const membersList = document.getElementById('membersList');
        
        let addedMembers = [];
        
        // Añadir owner a la lista
        addedMembers.push({
            id: userId,
            name: userName,
            email: '',
            role: 'owner',
            is_external: false
        });
        
        // Invitar usuario
        btnInvite.addEventListener('click', async () => {
            const name = inviteName.value.trim();
            const email = inviteEmail.value.trim();
            const role = inviteRole.value;
            
            if (!name || !email) {
                alert('Por favor completa nombre y email');
                return;
            }
            
            if (!validateEmail(email)) {
                alert('Por favor ingresa un email válido');
                return;
            }
            
            console.log('📧 Invitando usuario:', { name, email, role });
            
            try {
                const response = await fetch(`/api/community/${communityId}/add_member_role`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: name,
                        email: email,
                        role: role
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Añadir a la lista visual
                    addMemberToList(data.member);
                    
                    // Limpiar formulario
                    inviteName.value = '';
                    inviteEmail.value = '';
                    
                    // Mostrar mensaje
                    showNotification('✅ Invitación enviada a ' + email, 'success');
                } else {
                    alert('Error: ' + data.error);
                }
            } catch (error) {
                console.error('Error invitando usuario:', error);
                alert('Error de conexión');
            }
        });
        
        // Saltar configuración
        btnSkip.addEventListener('click', async () => {
            if (confirm('¿Seguro que quieres saltar la configuración del equipo? Podrás añadir miembros más tarde.')) {
                await markAsConfigured(communityId);
                closeModal();
            }
        });
        
        // Completar configuración
        btnComplete.addEventListener('click', async () => {
            await markAsConfigured(communityId);
            closeModal();
        });
        
        // Cerrar con Escape
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal) {
                alert('Completa la configuración o haz clic en "Saltar por ahora"');
            }
        });
        
        function addMemberToList(member) {
            addedMembers.push(member);
            
            const memberDiv = document.createElement('div');
            memberDiv.style.cssText = `
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                margin-bottom: 10px;
                animation: slideIn 0.3s ease-out;
            `;
            
            const roleColors = {
                'owner': { bg: '#fee2e2', color: '#dc2626', label: '👑 Owner' },
                'admin': { bg: '#dbeafe', color: '#2563eb', label: '🛡️ Admin' },
                'moderator': { bg: '#d1fae5', color: '#059669', label: '⚖️ Moderador' },
                'collaborator': { bg: '#f3e8ff', color: '#7c3aed', label: '🤝 Colaborador' }
            };
            
            const roleInfo = roleColors[member.role] || roleColors.collaborator;
            
            const avatarText = member.name ? member.name.charAt(0).toUpperCase() : 'U';
            const avatarColor = getAvatarColor(member.email || member.name);
            
            memberDiv.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    <div style="
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: ${avatarColor};
                        color: white;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 18px;
                        font-weight: bold;
                    ">${avatarText}</div>
                    <div>
                        <div style="font-weight: 600;">${member.name}</div>
                        <div style="font-size: 14px; color: #6b7280;">${member.email || 'Sin email'}</div>
                        ${member.is_external ? '<span style="font-size: 12px; background: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px;">Invitado</span>' : ''}
                    </div>
                </div>
                <span style="
                    padding: 6px 12px;
                    background: ${roleInfo.bg};
                    color: ${roleInfo.color};
                    border-radius: 20px;
                    font-size: 14px;
                    font-weight: 600;
                ">${roleInfo.label}</span>
            `;
            
            membersList.appendChild(memberDiv);
            
            // Añadir animación CSS
            const animationStyle = document.createElement('style');
            animationStyle.textContent = `
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `;
            document.head.appendChild(animationStyle);
        }
        
        async function markAsConfigured(communityId) {
            console.log('📝 Marcando comunidad como configurada:', communityId);
            
            try {
                const response = await fetch(`/api/community/${communityId}/complete_setup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showNotification('✅ Configuración completada', 'success');
                    
                    // Recargar la página después de un momento
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                    
                    return true;
                } else {
                    throw new Error(data.error || 'Error al guardar');
                }
            } catch (error) {
                console.error('Error marcando como configurado:', error);
                showNotification('❌ Error: ' + error.message, 'error');
                return false;
            }
        }
        
        function closeModal() {
            if (modal) {
                modal.style.opacity = '0';
                modal.style.transition = 'opacity 0.3s ease';
                
                setTimeout(() => {
                    if (modal.parentNode) {
                        modal.remove();
                    }
                }, 300);
            }
        }
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function getAvatarColor(str) {
        const colors = [
            '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
            '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
        ];
        
        if (!str) return colors[0];
        
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const index = Math.abs(hash) % colors.length;
        return colors[index];
    }
    
    function showNotification(message, type = 'info') {
        // Eliminar notificaciones anteriores
        const oldNotifications = document.querySelectorAll('.simple-notification');
        oldNotifications.forEach(n => n.remove());
        
        // Crear nueva
        const notification = document.createElement('div');
        notification.className = 'simple-notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 100000;
            animation: slideInRight 0.3s ease-out;
            display: flex;
            align-items: center;
            gap: 10px;
            font-family: 'Inter', sans-serif;
        `;
        
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="
                background: rgba(255,255,255,0.2); 
                border: none; 
                color: white; 
                width: 24px;
                height: 24px;
                border-radius: 50%;
                cursor: pointer;
                font-size: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
            ">×</button>
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
        
        // Añadir animación
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
})();