// debug-community.js - Depuración del modal de configuración
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔍 === INICIANDO DEPURACIÓN COMUNIDAD ===');
    
    // 1. Verificar elementos del DOM
    const chatContainer = document.getElementById('chat-container');
    console.log('📦 chat-container encontrado:', !!chatContainer);
    
    if (!chatContainer) {
        console.error('❌ chat-container NO encontrado en el DOM');
        console.log('📋 Buscando contenedores alternativos...');
        const containers = document.querySelectorAll('[id*="chat"], [id*="community"], [class*="chat"], [class*="community"]');
        containers.forEach(el => console.log(`   - ${el.tagName}#${el.id}.${el.className}`));
        return;
    }
    
    // 2. Extraer y mostrar todos los data attributes
    console.log('📊 DATA ATTRIBUTES de chat-container:');
    const attributes = chatContainer.dataset;
    Object.keys(attributes).forEach(key => {
        console.log(`   ✅ ${key}: "${attributes[key]}" (tipo: ${typeof attributes[key]})`);
    });
    
    // 3. Verificar condiciones clave
    const communityId = chatContainer.dataset.communityId;
    const isOwner = chatContainer.dataset.isOwner;
    const teamConfigured = chatContainer.dataset.teamConfigured;
    const currentUserName = chatContainer.dataset.userName;
    const userId = chatContainer.dataset.userId;
    
    console.log('\n🔑 VALORES CLAVE:');
    console.log(`   - communityId: ${communityId}`);
    console.log(`   - isOwner: ${isOwner} (valor crudo: "${chatContainer.getAttribute('data-is-owner')}")`);
    console.log(`   - teamConfigured: ${teamConfigured} (valor crudo: "${chatContainer.getAttribute('data-team-configured')}")`);
    console.log(`   - userId: ${userId}`);
    console.log(`   - userName: ${currentUserName}`);
    
    // 4. Convertir a boolean correctamente
    const isOwnerBool = isOwner === 'true';
    const teamConfiguredBool = teamConfigured === 'true';
    
    console.log('\n🔍 CONVERSIONES BOOLEANAS:');
    console.log(`   - isOwnerBool: ${isOwnerBool} (${typeof isOwnerBool})`);
    console.log(`   - teamConfiguredBool: ${teamConfiguredBool} (${typeof teamConfiguredBool})`);
    
    // 5. Verificar condiciones del popup
    console.log('\n🎯 CONDICIONES PARA POPUP:');
    console.log(`   ¿Tengo chat-container? ${!!chatContainer}`);
    console.log(`   ¿Soy owner? ${isOwnerBool}`);
    console.log(`   ¿Equipo ya configurado? ${teamConfiguredBool}`);
    console.log(`   ¿Debe mostrar popup? ${!!chatContainer && isOwnerBool && !teamConfiguredBool}`);
    
    // 6. Verificar si hay comunidad en el HTML
    console.log('\n🏘️ BUSCANDO ELEMENTOS DE COMUNIDAD:');
    const communityElements = document.querySelectorAll('[id*="community"], [class*="community"]');
    communityElements.forEach(el => {
        if (el.id || el.className.includes('community')) {
            console.log(`   - ${el.tagName}#${el.id}.${el.className}`);
        }
    });
    
    // 7. Verificar si el modal ya existe
    console.log('\n🎪 BUSCANDO MODAL EXISTENTE:');
    const existingModal = document.getElementById('teamSetupModal');
    console.log(`   ¿Modal ya existe en DOM? ${!!existingModal}`);
    
    // 8. Simular creación del modal (solo para depuración)
    if (chatContainer && isOwnerBool && !teamConfiguredBool) {
        console.log('\n✅ CONDICIONES CUMPLIDAS - Debería mostrar modal');
        console.log('🚀 Iniciando creación de modal en 2 segundos...');
        
        setTimeout(() => {
            console.log('🛠️ Creando modal de depuración...');
            createDebugModal();
        }, 2000);
    } else {
        console.log('\n❌ CONDICIONES NO CUMPLIDAS:');
        if (!chatContainer) console.log('   - Falta chat-container');
        if (!isOwnerBool) console.log('   - No soy owner');
        if (teamConfiguredBool) console.log('   - Equipo ya configurado');
    }
    
    // 9. Verificar conexión con Flask
    console.log('\n🌐 VERIFICANDO ENDPOINTS:');
    console.log(`   - Ruta comunidad: /community/${communityId}`);
    console.log(`   - API search: /search_team_users/${communityId}`);
    
    // 10. Probar fetch a API
    if (communityId) {
        console.log('\n📡 TESTEO DE API (solicitud simple):');
        fetch(`/search_team_users/${communityId}?q=test`)
            .then(response => {
                console.log(`   ✅ API respondió: ${response.status} ${response.statusText}`);
                return response.json();
            })
            .then(data => {
                console.log(`   📊 Datos recibidos:`, data);
                console.log(`   📈 Tipo de respuesta: ${Array.isArray(data) ? 'Array' : typeof data}`);
            })
            .catch(error => {
                console.error(`   ❌ Error en API: ${error.message}`);
            });
    }
    
    // 11. Verificar datos de usuario desde Flask
    console.log('\n👤 DATOS DESDE FLASK (si disponibles):');
    if (window.communityData) {
        console.log('   Datos en window.communityData:', window.communityData);
    }
    
    // 12. Buscar errores en consola anteriores
    console.log('\n📜 ÚLTIMOS ERRORES EN CONSOLA:');
    try {
        const errorLog = localStorage.getItem('community_errors') || '[]';
        const errors = JSON.parse(errorLog);
        errors.slice(-5).forEach((error, i) => {
            console.log(`   ${i+1}. ${error}`);
        });
    } catch (e) {
        console.log('   No hay errores previos guardados');
    }
    
    // Función para crear modal de depuración
    function createDebugModal() {
        console.log('🔧 Creando modal de depuración...');
        
        const modalHTML = `
        <div id="debugModal" style="
            position: fixed;
            top: 50px;
            right: 50px;
            background: #1e293b;
            color: white;
            padding: 20px;
            border-radius: 12px;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            border: 2px solid #3b82f6;
        ">
            <h3 style="margin-top:0; color:#60a5fa;">🔍 Debug Community</h3>
            <div style="font-family: monospace; font-size: 12px;">
                <div><strong>communityId:</strong> ${communityId || 'N/A'}</div>
                <div><strong>isOwner:</strong> ${isOwner} → ${isOwnerBool}</div>
                <div><strong>teamConfigured:</strong> ${teamConfigured} → ${teamConfiguredBool}</div>
                <div><strong>userId:</strong> ${userId}</div>
                <div><strong>userName:</strong> ${currentUserName}</div>
                <div><strong>Debe mostrar:</strong> ${!!chatContainer && isOwnerBool && !teamConfiguredBool ? '✅ SÍ' : '❌ NO'}</div>
            </div>
            <button onclick="document.getElementById('debugModal').remove()" 
                    style="margin-top:15px; padding:5px 10px; background:#ef4444; color:white; border:none; border-radius:4px; cursor:pointer;">
                Cerrar
            </button>
        </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        console.log('✅ Modal de depuración creado en esquina superior derecha');
    }
    
    // 13. Inyectar botón de depuración en la página
    setTimeout(() => {
        const debugBtn = document.createElement('button');
        debugBtn.innerHTML = '🐛 Debug';
        debugBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #3b82f6;
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            border: none;
            cursor: pointer;
            z-index: 9999;
            font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        debugBtn.onclick = () => {
            console.clear();
            console.log('=== RE-EJECUTANDO DEPURACIÓN ===');
            location.reload();
        };
        document.body.appendChild(debugBtn);
        console.log('🔘 Botón de debug añadido (esquina inferior derecha)');
    }, 1000);
    
    // 14. Capturar errores globales
    window.addEventListener('error', function(e) {
        console.error('🚨 ERROR GLOBAL CAPTURADO:', e.error);
        
        // Guardar error en localStorage
        try {
            const errorLog = JSON.parse(localStorage.getItem('community_errors') || '[]');
            errorLog.push({
                message: e.error.message,
                time: new Date().toISOString(),
                file: e.filename,
                line: e.lineno
            });
            localStorage.setItem('community_errors', JSON.stringify(errorLog.slice(-10))); // Mantener últimos 10
        } catch (storageError) {
            console.log('No se pudo guardar error en localStorage');
        }
    });
    
    console.log('\n=== FIN DEPURACIÓN ===\n\n');
});