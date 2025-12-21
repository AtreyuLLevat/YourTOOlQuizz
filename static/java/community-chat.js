document.addEventListener("DOMContentLoaded", () => {
    const chatContainer = document.getElementById('chat-container');
    if (!chatContainer) return console.error("No se encontró el contenedor de chat");



    if (!communityId) return console.error("No se encontró el ID de la comunidad");

const socket = io();

const communityData = document.getElementById('chat-container');

const communityId = communityData.dataset.communityId;
const userId = communityData.dataset.userId;
const userName = communityData.dataset.userName;
const isAdmin = communityData.dataset.isAdmin === 'true';
const isOwner = communityData.dataset.isOwner === 'true';

socket.emit("join_community", { community_id: communityId });


    // Función para renderizar un mensaje
    const renderMessage = (data) => {
        if (!data || data.community_id !== communityId) return;

        const div = document.createElement("div");
        const role = data.role || "user";
        const isHighRole = ["owner", "admin"].includes(role);

        // Mensajes tipo encuesta
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
        }
        // Mensajes de admin/owner
        else if (isHighRole) {
            div.className = "admin-message role-message";
            div.innerHTML = `
                <div class="role-badge">${role}</div>
                <div class="admin-name">${data.user}</div>
                <div class="message-content">${data.content}</div>
            `;
        }
        // Mensajes de usuario normal
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

    // Recibir mensaje nuevo
    socket.on("new_message", renderMessage);

    // Renderizar mensajes históricos (si existen)
    const historicalMessagesElem = document.getElementById("historical-messages");
    if (historicalMessagesElem) {
        try {
            const historicalMessages = JSON.parse(historicalMessagesElem.textContent);
            historicalMessages.forEach(msg => {
                renderMessage({
                    community_id: communityId,
                    content: msg.content,
                    role: msg.user.is_owner ? "owner" : msg.user.is_admin ? "admin" : "user",
                    user: msg.user.name,
                    message_type: msg.message_type || "text",
                    extra_data: msg.extra_data || {}
                });
            });
        } catch (err) {
            console.error("Error al cargar mensajes históricos:", err);
        }
    }

    // Enviar mensaje
    const sendMessage = () => {
        const text = inputField.value.trim();
        if (!text) return;

        socket.emit("send_message", {
            community_id: communityId,
            content: text,
            message_type: isAdmin || isOwner ? "admin" : "user",
            role: isAdmin ? "admin" : isOwner ? "owner" : "user",
            user: userName
        });

        inputField.value = "";
    };

    sendBtn.addEventListener("click", sendMessage);
    inputField.addEventListener("keypress", e => {
        if (e.key === "Enter") sendMessage();
    });

    // Enviar encuesta (solo admin/owner)
    window.sendPoll = (question = "¿Te gusta la app?", options = ["Sí", "No"]) => {
        if (!(isAdmin || isOwner)) return;

        socket.emit("send_message", {
            community_id: communityId,
            content: question,
            message_type: "poll",
            extra_data: { options },
            role: isAdmin ? "admin" : "owner",
            user: userName
        });
    };
});
