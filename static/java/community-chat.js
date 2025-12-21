document.addEventListener("DOMContentLoaded", () => {
    const communityData = document.getElementById("chat-container");
    if (!communityData) {
        console.error("❌ chat-container no existe");
        return;
    }

    // Acceder a dataset de forma segura
    const { communityId, userId, userName, isAdmin, isOwner } = communityData.dataset;

    if (!communityId || !userId || !userName) {
        console.error("❌ Faltan atributos data en chat-container");
        return;
    }

    console.log({ communityId, userId, userName, isAdmin, isOwner });

    const socket = io();

    const messagesContainer = document.getElementById("messages");
    const inputField = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");

    // Unir a la comunidad
    socket.emit("join_community", { community_id: communityId });

    // Recibir mensajes
    socket.on("new_message", data => {
            console.log("Evento new_message recibido:", data);
        if (String(data.community_id) !== String(communityId)) return;


        const div = document.createElement("div");
        if(data.message_type === 'admin'){
            div.className = 'admin-message';
            div.innerHTML = `<div class="admin-header"><span class="admin-badge">ADMIN</span><span class="admin-name">${data.user}</span></div>
                             <div class="message-content">${data.content}</div>`;
        } else if(data.message_type === 'poll'){
            div.className = 'poll-message';
            let optionsHtml = '';
            data.options?.forEach((opt, idx) => {
                optionsHtml += `<div class="poll-option" data-poll-id="${data.id}" data-option-id="${idx}">${opt}</div>`;
            });
            div.innerHTML = `<div class="poll-question">${data.content}</div>
                             <div class="poll-options">${optionsHtml}</div>`;
        } else {
            div.className = 'user-message';
            div.innerHTML = `<div class="user-name">${data.user}</div><div class="message-content">${data.content}</div>`;
        }

        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    // Enviar mensaje
    sendBtn.onclick = () => {
        const text = inputField.value.trim();
        if (!text) return;

console.log("Socket conectado?", socket.connected);

socket.on("connect", () => {
    console.log("✅ Conectado a Socket.IO con id:", socket.id);
});

socket.on("disconnect", () => {
    console.log("⚠ Desconectado de Socket.IO");
});


        socket.emit("send_message", {
            community_id: communityId,
            content: text,
            message_type: 'user'
        });

        inputField.value = "";
    };

    inputField.addEventListener('keypress', e => {
        if (e.key === 'Enter') sendBtn.click();
    });
});
