document.addEventListener("DOMContentLoaded", () => {

    /* ============================
       DATOS INYECTADOS DESDE HTML
    ============================ */
    const communityData = document.getElementById("community-data");
    if (!communityData) return;

    const communityId = communityData.dataset.communityId;
    const userId = communityData.dataset.userId;
    const userName = communityData.dataset.userName;
    const isAdmin = communityData.dataset.isAdmin === "true"; // SOLO UI

    /* ============================
       SOCKET
    ============================ */
    const socket = io();

    socket.emit("join_community", {
        community_id: currentCommunityId
    });

    /* ============================
       ELEMENTOS DOM
    ============================ */
    const messagesContainer = document.getElementById("messages");
    const inputField = document.getElementById("message-input");
    const sendBtn = document.getElementById("send-btn");

    /* ============================
       RECIBIR MENSAJES
       (ÚNICO PUNTO DE RENDER)
    ============================ */
    socket.on("new_message", data => {
        if (data.community_id !== communityId) return;

        const div = document.createElement("div");

        const isHighRole = ["owner", "admin", "moderator"].includes(data.role);

        /* ---------- ENCUESTA ---------- */
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

        /* ---------- ROLES ALTOS ---------- */
        else if (data.role === "owner" || data.role === "admin") {
            // renderizar mensaje con estilo admin/owner
            div.className = "admin-message role-message";
            div.innerHTML = `
                <div class="role-badge">${data.role}</div>
                <div class="admin-name">${data.user}</div>
                <div class="message-content">${data.content}</div>
            `;
        }

        /* ---------- USUARIO NORMAL ---------- */
        else {
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
       ENVIAR MENSAJE
       (EL FRONT NO DECIDE ROL)
    ============================ */
    sendBtn.addEventListener("click", () => {
        const text = inputField.value.trim();
        if (!text) return;

        socket.emit("send_message", {
            community_id: communityId,
            content: text
        });

        inputField.value = "";
    });

    inputField.addEventListener("keypress", e => {
        if (e.key === "Enter") sendBtn.click();
    });

    /* ============================
       ENVIAR ENCUESTA (SOLO UI)
    ============================ */
    window.sendPoll = () => {
        if (!isAdmin) return;

        socket.emit("send_message", {
            community_id: communityId,
            content: "¿Te gusta la app?",
            message_type: "poll",
            extra_data: {
                options: ["Sí", "No"]
            }
        });
    };

});
