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
            max-width: 900px;
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
                    <h2 style="font-size: 24px; margin: 0; color: #1a1a1a; font-weight: 600;">Configure Team</h2>
                    <p style="font-size: 14px; color: #666; margin: 8px 0 0 0;">Assign roles to community members</p>
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
            
            <!-- Content -->
            <div style="padding: 0 40px 40px;">
                <!-- Role Selection -->
                <div style="margin: 32px 0;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                        <h3 style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin: 0;">SELECT ROLE</h3>
                        <button id="roleInfoBtn" style="
                            background: none;
                            border: none;
                            color: #0066ff;
                            cursor: pointer;
                            font-size: 14px;
                            display: flex;
                            align-items: center;
                            gap: 6px;
                            padding: 6px 12px;
                            border-radius: 4px;
                            transition: all 0.2s;
                        " onmouseover="this.style.background='#f0f7ff'"
                           onmouseout="this.style.background='none'">
                            <span style="font-size: 16px;">ℹ️</span>
                            Role Information
                        </button>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px;">
                        <!-- Owner -->
                        <div style="
                            padding: 16px;
                            border: 1px solid #eaeaea;
                            border-radius: 8px;
                            cursor: default;
                            position: relative;
                        ">
                            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <div style="width: 32px; height: 32px; background: #fef8e6; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #f0b90b;">
                                        <span style="font-size: 16px;">👑</span>
                                    </div>
                                    <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">Owner</h4>
                                </div>
                                <span style="
                                    font-size: 11px;
                                    font-weight: 500;
                                    color: #f0b90b;
                                    background: #fef8e6;
                                    padding: 2px 8px;
                                    border-radius: 10px;
                                ">You</span>
                            </div>
                            <div style="font-size: 13px; color: #666; line-height: 1.4;">
                                Full control over community
                            </div>
                        </div>
                        
                        <!-- Admin -->
                        <div style="
                            padding: 16px;
                            border: 1px solid #eaeaea;
                            border-radius: 8px;
                            cursor: default;
                        ">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                                <div style="width: 32px; height: 32px; background: #e6f0ff; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #0066ff;">
                                    <span style="font-size: 16px;">⚙️</span>
                                </div>
                                <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">Admin</h4>
                            </div>
                            <div style="font-size: 13px; color: #666; line-height: 1.4;">
                                Manages daily operations, posts official announcements
                            </div>
                        </div>
                        
                        <!-- Moderator -->
                        <div style="
                            padding: 16px;
                            border: 1px solid #eaeaea;
                            border-radius: 8px;
                            cursor: default;
                        ">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                                <div style="width: 32px; height: 32px; background: #e6f5ef; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #00a86b;">
                                    <span style="font-size: 16px;">👁️</span>
                                </div>
                                <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">Moderator</h4>
                            </div>
                            <div style="font-size: 13px; color: #666; line-height: 1.4;">
                                Maintains order and content quality
                            </div>
                        </div>
                        
                        <!-- Collaborator -->
                        <div style="
                            padding: 16px;
                            border: 1px solid #eaeaea;
                            border-radius: 8px;
                            cursor: default;
                        ">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
                                <div style="width: 32px; height: 32px; background: #f3e8ff; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #8a2be2;">
                                    <span style="font-size: 16px;">🤝</span>
                                </div>
                                <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #1a1a1a;">Collaborator</h4>
                            </div>
                            <div style="font-size: 13px; color: #666; line-height: 1.4;">
                                Support role without disciplinary power
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Team Members -->
                <div style="margin: 40px 0;">
                    <h3 style="font-size: 16px; font-weight: 600; color: #1a1a1a; margin-bottom: 20px;">TEAM MEMBERS</h3>
                    
                    <!-- Add Team Members -->
                    <div style="margin-bottom: 32px;">
                        <div style="
                            display: grid;
                            grid-template-columns: 1fr 180px auto;
                            gap: 12px;
                            margin-bottom: 20px;
                        ">
                            <input type="text" 
                                   id="teamSearchInput" 
                                   placeholder="Search by name or email..."
                                   style="
                                        padding: 12px 16px;
                                        border: 1px solid #ddd;
                                        border-radius: 6px;
                                        font-size: 14px;
                                        outline: none;
                                        transition: border-color 0.2s;
                                   " onfocus="this.style.borderColor='#0066ff'"
                                   onblur="this.style.borderColor='#ddd'">
                            <select id="teamRoleSelect" style="
                                padding: 12px 16px;
                                border: 1px solid #ddd;
                                border-radius: 6px;
                                font-size: 14px;
                                background: white;
                                color: #333;
                                outline: none;
                                cursor: pointer;
                            ">
                                <option value="admin">Admin</option>
                                <option value="moderator">Moderator</option>
                                <option value="collaborator">Collaborator</option>
                            </select>
                            <button id="addTeamMemberBtn" style="
                                padding: 12px 24px;
                                background: #0066ff;
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-weight: 500;
                                font-size: 14px;
                                transition: background 0.2s;
                            " onmouseover="this.style.background='#0052cc'"
                               onmouseout="this.style.background='#0066ff'">
                                Add Member
                            </button>
                        </div>
                        
                        <div id="teamSearchResults" style="
                            border: 1px solid #eaeaea;
                            border-radius: 6px;
                            max-height: 200px;
                            overflow-y: auto;
                            background: white;
                            display: none;
                            margin-top: 8px;
                        "></div>
                    </div>
                    
                    <!-- External Invite -->
                    <div style="
                        padding: 24px;
                        background: #f8f9fa;
                        border-radius: 8px;
                        border: 1px solid #eaeaea;
                        margin-bottom: 32px;
                    ">
                        <h4 style="margin: 0 0 16px 0; font-size: 15px; font-weight: 600; color: #1a1a1a;">Invite New Member</h4>
                        <div style="
                            display: grid;
                            grid-template-columns: 1fr 1fr 180px auto;
                            gap: 12px;
                        ">
                            <input type="text" 
                                   id="externalUserName" 
                                   placeholder="Name"
                                   style="
                                        padding: 12px 16px;
                                        border: 1px solid #ddd;
                                        border-radius: 6px;
                                        font-size: 14px;
                                        outline: none;
                                   ">
                            <input type="email" 
                                   id="externalUserEmail" 
                                   placeholder="Email"
                                   style="
                                        padding: 12px 16px;
                                        border: 1px solid #ddd;
                                        border-radius: 6px;
                                        font-size: 14px;
                                        outline: none;
                                   ">
                            <select id="externalUserRole" style="
                                padding: 12px 16px;
                                border: 1px solid #ddd;
                                border-radius: 6px;
                                font-size: 14px;
                                background: white;
                                color: #333;
                                cursor: pointer;
                            ">
                                <option value="admin">Admin</option>
                                <option value="moderator">Moderator</option>
                                <option value="collaborator">Collaborator</option>
                            </select>
                            <button id="inviteUserBtn" style="
                                padding: 12px 24px;
                                background: #1a1a1a;
                                color: white;
                                border: none;
                                border-radius: 6px;
                                cursor: pointer;
                                font-weight: 500;
                                font-size: 14px;
                                transition: background 0.2s;
                            " onmouseover="this.style.background='#333'"
                               onmouseout="this.style.background='#1a1a1a'">
                                Send Invite
                            </button>
                        </div>
                        <p style="font-size: 13px; color: #666; margin-top: 12px; margin-bottom: 0;">
                            An email invitation will be sent
                        </p>
                    </div>
                    
                    <!-- Current Members List -->
                    <div id="currentMembersList" style="
                        min-height: 100px;
                        margin-bottom: 32px;
                    ">
                        <div id="noMembersMessage" style="
                            text-align: center;
                            padding: 40px 20px;
                            color: #999;
                            border: 2px dashed #eaeaea;
                            border-radius: 8px;
                            background: #fafafa;
                        ">
                            <div style="font-size: 36px; margin-bottom: 16px; opacity: 0.5;">👥</div>
                            <p style="margin: 0; font-size: 14px;">Add team members using the forms above</p>
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
                    <span id="memberCount" style="font-weight: 600; color: #1a1a1a;">1</span> member configured
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
                        Configure Later
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
                        Complete Setup
                    </button>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Role Info Modal -->
    <div id="roleInfoModal" style="
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: none;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    ">
        <div style="
            background: white;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        ">
            <div style="
                padding: 24px;
                border-bottom: 1px solid #eaeaea;
                display: flex;
                justify-content: space-between;
                align-items: center;
            ">
                <h3 style="margin: 0; font-size: 18px; font-weight: 600; color: #1a1a1a;">Role Information</h3>
                <button onclick="document.getElementById('roleInfoModal').style.display='none'" style="
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
            
            <div style="padding: 24px;">
                <div style="display: grid; gap: 20px;">
                    <!-- Owner -->
                    <div style="padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                            <div style="width: 40px; height: 40px; background: #fef8e6; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #f0b90b;">
                                <span style="font-size: 20px;">👑</span>
                            </div>
                            <div>
                                <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">Owner</h4>
                                <p style="margin: 4px 0 0 0; font-size: 13px; color: #999;">Full control</p>
                            </div>
                        </div>
                        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #333; line-height: 1.6;">
                            <li style="margin-bottom: 8px;">Complete control over the community</li>
                            <li style="margin-bottom: 8px;">Assigns and revokes roles</li>
                            <li style="margin-bottom: 8px;">Access to all metrics and settings</li>
                            <li style="color: #f0b90b; font-weight: 500;">Only one owner per community</li>
                        </ul>
                    </div>
                    
                    <!-- Admin -->
                    <div style="padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                            <div style="width: 40px; height: 40px; background: #e6f0ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #0066ff;">
                                <span style="font-size: 20px;">⚙️</span>
                            </div>
                            <div>
                                <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">Admin</h4>
                                <p style="margin: 4px 0 0 0; font-size: 13px; color: #999;">Daily operations</p>
                            </div>
                        </div>
                        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #333; line-height: 1.6;">
                            <li style="margin-bottom: 8px;">Manages daily community operations</li>
                            <li style="margin-bottom: 8px;">Posts official announcements</li>
                            <li style="margin-bottom: 8px;">Creates polls and pins messages</li>
                            <li style="color: #0066ff; font-weight: 500;">Maximum 3 administrators</li>
                        </ul>
                    </div>
                    
                    <!-- Moderator -->
                    <div style="padding-bottom: 20px; border-bottom: 1px solid #eaeaea;">
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                            <div style="width: 40px; height: 40px; background: #e6f5ef; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #00a86b;">
                                <span style="font-size: 20px;">👁️</span>
                            </div>
                            <div>
                                <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">Moderator</h4>
                                <p style="margin: 4px 0 0 0; font-size: 13px; color: #999;">Content quality</p>
                            </div>
                        </div>
                        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #333; line-height: 1.6;">
                            <li style="margin-bottom: 8px;">Maintains order and quality standards</li>
                            <li style="margin-bottom: 8px;">Removes inappropriate messages</li>
                            <li style="margin-bottom: 8px;">Temporarily mutes or bans users</li>
                            <li style="color: #00a86b; font-weight: 500;">Most important day-to-day role</li>
                        </ul>
                    </div>
                    
                    <!-- Collaborator -->
                    <div>
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                            <div style="width: 40px; height: 40px; background: #f3e8ff; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #8a2be2;">
                                <span style="font-size: 20px;">🤝</span>
                            </div>
                            <div>
                                <h4 style="margin: 0; font-size: 16px; font-weight: 600; color: #1a1a1a;">Collaborator</h4>
                                <p style="margin: 4px 0 0 0; font-size: 13px; color: #999;">Support role</p>
                            </div>
                        </div>
                        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #333; line-height: 1.6;">
                            <li style="margin-bottom: 8px;">Support without disciplinary power</li>
                            <li style="margin-bottom: 8px;">Answers questions and guides users</li>
                            <li style="margin-bottom: 8px;">Flags useful feedback for review</li>
                            <li style="color: #8a2be2; font-weight: 500;">Ideal for limited access roles</li>
                        </ul>
                    </div>
                </div>
            </div>
            
            <div style="
                padding: 20px 24px;
                background: #f8f9fa;
                border-top: 1px solid #eaeaea;
                border-radius: 0 0 12px 12px;
                display: flex;
                justify-content: flex-end;
            ">
                <button onclick="document.getElementById('roleInfoModal').style.display='none'" style="
                    padding: 10px 24px;
                    background: #0066ff;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    font-weight: 500;
                    font-size: 14px;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#0052cc'"
                   onmouseout="this.style.background='#0066ff'">
                    Close
                </button>
            </div>
        </div>
    </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Añadir animación CSS
    const style = document.createElement('style');
    style.textContent = `
        @keyframes modalFadeIn {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        
        #teamSetupModal > div,
        #roleInfoModal > div {
            animation: modalFadeIn 0.3s ease-out;
        }
        
        .user-result:hover {
            background-color: #f8f9fa;
        }
        
        .member-item {
            transition: box-shadow 0.2s;
        }
        
        .member-item:hover {
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        
        #roleInfoModal {
            animation: fadeIn 0.2s ease-out;
        }
    `;
    document.head.appendChild(style);
    
    // Configurar evento para el botón de información de roles
    const roleInfoBtn = document.getElementById('roleInfoBtn');
    if (roleInfoBtn) {
        roleInfoBtn.addEventListener('click', () => {
            document.getElementById('roleInfoModal').style.display = 'flex';
        });
    }
    
    // Configurar evento para cerrar modal principal
    const closeModalBtn = document.getElementById('closeModalBtn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            if (currentMembers.length <= 1) {
                if (confirm('Are you sure? You haven\'t added any team members yet.')) {
                    closeModal();
                }
            } else {
                closeModal();
            }
        });
    }
    
    // Cerrar modal de información al hacer clic fuera
    const roleInfoModal = document.getElementById('roleInfoModal');
    if (roleInfoModal) {
        roleInfoModal.addEventListener('click', (e) => {
            if (e.target === roleInfoModal) {
                roleInfoModal.style.display = 'none';
            }
        });
    }
}

// Añadir esta función para actualizar el contador de miembros
function updateMemberCounter() {
    const memberCount = document.getElementById('memberCount');
    if (memberCount) {
        // Contar solo miembros que no sean el owner actual
        const additionalMembers = currentMembers.filter(m => !m.is_current_user).length;
        memberCount.textContent = additionalMembers + 1; // +1 para el owner
    }
}

// Llamar a updateMemberCounter después de añadir o remover miembros
// En la función addMemberToUI:
function addMemberToUI(member) {
    currentMembers.push(member);
    // ... resto del código ...
    updateMemberCounter(); // <-- Añadir esto
}

// En la función removeMember:
window.removeMember = function(email) {
    currentMembers = currentMembers.filter(m => m.email !== email);
    // ... resto del código ...
    updateMemberCounter(); // <-- Añadir esto
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

        const debugBtn = document.createElement('button');
    debugBtn.innerHTML = '🐛 Debug Info';
    debugBtn.style.cssText = 'position:fixed;bottom:20px;right:20px;background:red;color:white;padding:10px;z-index:99999;';
    debugBtn.onclick = () => {
        alert(`Debug:\nUser ID: ${userId}\nCommunity ID: ${communityId}\nisOwner: ${isOwner}\nteamConfigured: ${teamConfigured}`);
    };
    document.body.appendChild(debugBtn);
});
