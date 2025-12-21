document.addEventListener("DOMContentLoaded", () => {
    // Obtener datos de la comunidad y usuario desde el HTML
    const communityData = document.getElementById('chat-container'); // div contenedor con data attributes
    if (!communityData) return console.error("No se encontró el contenedor de chat");

    const communityId = communityData.dataset.communityId;
    const userId = communityData.dataset.userId;
    const userName = communityData.dataset.userName;
    const isAdmin = communityData.dataset.isAdmin === 'true';

    if (!communityId) return console.error("No se encontró el ID de la comunidad");

    // Conexión socket.io
    const socket = io();

    const messagesContainer = document.getElementById("messages");
    const inputField = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");

    // Unirse a la comunidad
    socket.emit("join_community", { community_id: communityId });

    /* ============================
       RECIBIR MENSAJES
    ============================ */
    socket.on("new_message", data => {
        if (data.community_id !== communityId) return;

        const div = document.createElement("div");
        const isHighRole = ["owner", "admin"].includes(data.role);

        if (data.message_type === "poll") {
            div.className = "poll-message";
            let optionsHtml = "";
            (data.extra_data?.options || []).forEach(opt => {
                optionsHtml += `<div class="poll-option">${opt}</div>`;
            });

            div.innerHTML = `
                <div class="poll-question">${data.content}</div>
                <div class="poll-options">${optionsHtml}</div>
            `;
        } else if (isHighRole) {
            div.className = "admin-message role-message";
            div.innerHTML = `
                <div class="role-badge">${data.role}</div>
                <div class="admin-name">${data.user}</div>
                <div class="message-content">${data.content}</div>
            `;
        } else {
            div.className = "user-message";
            div.innerHTML = `
                <div class="user-name">${data.user}</div>
                <div class="message-content">${data.content}</div>
            `;
        }

        messagesContainer.appendChild(div);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    });

    /* ============================
       ENVIAR MENSAJES
    ============================ */
    const sendMessage = () => {
        const text = inputField.value.trim();
        if (!text) return;

        socket.emit("send_message", {
            community_id: communityId,
            content: text,
            message_type: isAdmin ? "admin" : "user",
            role: isAdmin ? "admin" : "user",
            user: userName
        });

        inputField.value = "";
    };

    sendBtn.addEventListener("click", sendMessage);
    inputField.addEventListener("keypress", e => {
        if (e.key === "Enter") sendMessage();
    });

    /* ============================
       ENVIAR ENCUESTA (ADMIN)
    ============================ */
    window.sendPoll = (question = "¿Te gusta la app?", options = ["Sí", "No"]) => {
        if (!isAdmin) return;

        socket.emit("send_message", {
            community_id: communityId,
            content: question,
            message_type: "poll",
            extra_data: { options },
            role: "admin",
            user: userName
        });
    };
});
