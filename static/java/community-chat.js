document.addEventListener("DOMContentLoaded", () => {
    // =========================
    // Obtener datos del contenedor
    // =========================
    const communityData = document.getElementById("chat-container");
    if (!communityData) {
        console.error("❌ chat-container no existe");
        return;
    }

    const { communityId, userId, userName, isAdmin, isOwner } = communityData.dataset;

    if (!communityId || !userId || !userName) {
        console.error("❌ Faltan atributos data en chat-container");
        return;
    }

    console.log("Datos del usuario y comunidad:", {
        communityId,
        userId,
        userName,
        isAdmin,
        isOwner
    });

    const messagesContainer = document.getElementById("messages");
    const inputField = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");

    if (!messagesContainer || !inputField || !sendBtn) {
        console.error("❌ Elementos del chat no encontrados");
        return;
    }

    // =========================
    // Conexión Socket.IO
    // =========================
    const socket = io();

    socket.on("connect", () => {
        console.log("✅ Conectado a Socket.IO:", socket.id);
        socket.emit("join_community", { community_id: communityId });
    });

    socket.on("disconnect", () => {
        console.log("⚠ Desconectado de Socket.IO");
    });

    // =========================
    // Renderizar mensajes (SOLO TIEMPO REAL) - NUEVA VERSIÓN
    // =========================
    const renderMessage = (data) => {
        if (!data || String(data.community_id) !== String(communityId)) return;

        const div = document.createElement("div");
        
        // Determinar el rol (ajustar según lo que envía tu backend)
        let roleClass = "user";
        let role = data.role || "user";
        
        // Si el backend no envía role, usar el mismo cálculo que usas en el envío
        if (!data.role) {
            role = data.message_type === "admin" ? "admin" : 
                   data.role === "owner" ? "owner" : "user";
        }
        
        // Establecer clase CSS según el rol
        if (role === "owner") {
            roleClass = "owner";
        } else if (role === "admin") {
            roleClass = "admin";
        } else {
            roleClass = "user";
        }

        // Crear HTML con la misma estructura que los mensajes históricos
        let badgeHtml = "";
        if (role === "owner") {
            badgeHtml = '<span class="badge owner">Owner</span>';
        } else if (role === "admin") {
            badgeHtml = '<span class="badge admin">Admin</span>';
        }

        div.className = `message ${roleClass}`;
        div.innerHTML = `
            <div class="message-header">
                <span class="username">${data.user || userName}</span>
                ${badgeHtml}
            </div>
            <div class="message-content">${data.content}</div>
        `;

        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    // =========================
    // Mensajes en tiempo real
    // =========================
    socket.on("new_message", renderMessage);

    // =========================
    // Enviar mensaje
    // =========================
    const sendMessage = () => {
        const text = inputField.value.trim();
        if (!text) return;

        // Nota: El rol se determina en el backend, no es necesario enviarlo desde aquí
        const msgData = {
            community_id: communityId,
            content: text
        };

        socket.emit("send_message", msgData);
        inputField.value = "";
    };

    sendBtn.addEventListener("click", sendMessage);
    inputField.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});