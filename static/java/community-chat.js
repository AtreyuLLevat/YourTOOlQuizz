document.addEventListener("DOMContentLoaded", () => {
    // =========================
    // Obtener datos del contenedor
    // =========================
    const communityData = document.getElementById("chat-container");
    if (!communityData) return console.error("❌ chat-container no existe");

    const { communityId, userId, userName, isAdmin, isOwner } = communityData.dataset;
    if (!communityId || !userId || !userName) return console.error("❌ Faltan atributos data en chat-container");

    console.log("Datos del usuario y comunidad:", { communityId, userId, userName, isAdmin, isOwner });

    const messagesContainer = document.getElementById("messages");
    const inputField = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");
    if (!messagesContainer || !inputField || !sendBtn) return console.error("❌ Elementos del chat no encontrados");

    // =========================
    // Conexión Socket.IO
    // =========================
    const socket = io();
    socket.on("connect", () => console.log("✅ Conectado a Socket.IO con id:", socket.id));
    socket.on("disconnect", () => console.log("⚠ Desconectado de Socket.IO"));

    // Unir a la comunidad
    socket.emit("join_community", { community_id: communityId });
    console.log(`👤 Usuario ${userName} se unió a la comunidad ${communityId}`);

    // =========================
    // Función para renderizar mensajes
    // =========================
    const renderMessage = (data) => {
        if (!data || String(data.community_id) !== String(communityId)) return;

        const div = document.createElement("div");

        // Roles especiales
        if (data.message_type === "admin") {
            div.className = 'admin-message';
            div.innerHTML = `
                <div class="admin-header">
                    <span class="admin-badge">ADMIN</span>
                    <span class="admin-name">${data.user}</span>
                </div>
                <div class="message-content">${data.content}</div>
            `;
        } else if (data.role === "owner") {
            div.className = 'owner-message';
            div.innerHTML = `
                <div class="owner-name">${data.user}</div>
                <div class="message-content">${data.content}</div>
            `;
        } else if (data.message_type === "poll") {
            div.className = 'poll-message';
            let optionsHtml = '';
            data.extra_data?.options?.forEach((opt, idx) => {
                optionsHtml += `<div class="poll-option" data-poll-id="${data.id}" data-option-id="${idx}">${opt}</div>`;
            });
            div.innerHTML = `
                <div class="poll-question">${data.content}</div>
                <div class="poll-options">${optionsHtml}</div>
            `;
        } else {
            div.className = 'user-message';
            div.innerHTML = `
                <div class="user-name">${data.user}</div>
                <div class="message-content">${data.content}</div>
            `;
        }

        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    // =========================
    // Renderizar mensajes históricos
    // =========================
    const historicalMessagesElem = document.getElementById("historical-messages");
    if (historicalMessagesElem) {
        try {
            const historicalMessages = JSON.parse(historicalMessagesElem.textContent);
            historicalMessages.forEach(msg => renderMessage({
                community_id: communityId,
                content: msg.content,
                user: msg.user.name,
                role: msg.role,
                message_type: msg.message_type || "user",
                extra_data: msg.extra_data || {},
                id: msg.id
            }));
        } catch (err) {
            console.error("Error al cargar mensajes históricos:", err);
        }
    }

    // =========================
    // Recibir mensajes en tiempo real
    // =========================
    socket.on("new_message", renderMessage);

    // =========================
    // Enviar mensaje
    // =========================
    const sendMessage = () => {
        const text = inputField.value.trim();
        if (!text) return;

        const msgData = {
            community_id: communityId,
            content: text,
            message_type: isAdmin === "true" || isOwner === "true" ? "admin" : "user",
            role: isAdmin === "true" ? "admin" : isOwner === "true" ? "owner" : "user",
            user: userName
        };

        // Emitir mensaje al servidor
        socket.emit("send_message", msgData);

        // Limpiar input
        inputField.value = "";
    };

    sendBtn.addEventListener("click", sendMessage);
    inputField.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
});
