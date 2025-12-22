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
    // Renderizar mensajes (SOLO TIEMPO REAL)
    // =========================
    const renderMessage = (data) => {
        if (!data || String(data.community_id) !== String(communityId)) return;

        const div = document.createElement("div");

        // ADMIN
        if (data.message_type === "admin" || data.role === "admin") {
            div.className = "admin-message";
            div.innerHTML = `
                <div class="admin-header">
                    <span class="admin-badge">ADMIN</span>
                    <span class="admin-name">${data.user}</span>
                </div>
                <div class="message-content">${data.content}</div>
            `;
        }
        // OWNER
        else if (data.role === "owner") {
            div.className = "owner-message";
            div.innerHTML = `
                <div class="owner-name">${data.user}</div>
                <div class="message-content">${data.content}</div>
            `;
        }
        // POLL
        else if (data.message_type === "poll") {
            div.className = "poll-message";
            let optionsHtml = "";

            data.extra_data?.options?.forEach((opt, idx) => {
                optionsHtml += `
                    <div class="poll-option"
                         data-poll-id="${data.id}"
                         data-option-id="${idx}">
                        ${opt}
                    </div>
                `;
            });

            div.innerHTML = `
                <div class="poll-question">${data.content}</div>
                <div class="poll-options">${optionsHtml}</div>
            `;
        }
        // USER NORMAL
        else {
            div.className = "user-message";
            div.innerHTML = `
                <div class="user-name">${data.user}</div>
                <div class="message-content">${data.content}</div>
            `;
        }

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

        const msgData = {
            community_id: communityId,
            content: text,
            user: userName,
            role: isOwner === "true"
                ? "owner"
                : isAdmin === "true"
                ? "admin"
                : "user",
            message_type: isAdmin === "true" || isOwner === "true"
                ? "admin"
                : "user"
        };

        socket.emit("send_message", msgData);
        inputField.value = "";
    };

    sendBtn.addEventListener("click", sendMessage);
    inputField.addEventListener("keypress", (e) => {
        if (e.key === "Enter") sendMessage();
    });
});
