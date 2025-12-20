document.addEventListener("DOMContentLoaded", () => {
    const communityData = document.getElementById('community-data');
    const communityId = communityData.dataset.communityId;
    const userId = communityData.dataset.userId;
    const userName = communityData.dataset.userName;
    const isAdmin = communityData.dataset.isAdmin === 'true';

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

        if (data.message_type === "admin") {
            div.className = "admin-message";
            div.innerHTML = `
                <div class="admin-header">
                    <span class="admin-badge">ADMIN</span>
                    <span class="admin-name">${data.user}</span>
                </div>
                <div class="message-content">${data.content}</div>
            `;
        }

        else if (data.message_type === "poll") {
            div.className = "poll-message";

            let optionsHtml = "";
            (data.extra_data?.options || []).forEach((opt, idx) => {
                optionsHtml += `<div class="poll-option" data-option-id="${idx}">${opt}</div>`;
            });

            div.innerHTML = `
                <div class="poll-question">${data.content}</div>
                <div class="poll-options">${optionsHtml}</div>
            `;
        }

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
       ENVIAR MENSAJES
    ============================ */
    sendBtn.onclick = () => {
        const text = inputField.value.trim();
        if (!text) return;

        // Usuario normal
        socket.emit("send_message", {
            community_id: communityId,
            content: text,
            message_type: isAdmin ? "admin" : "user"
        });

        inputField.value = "";
    };

    inputField.addEventListener("keypress", e => {
        if (e.key === "Enter") sendBtn.click();
    });

    /* ============================
       ENVIAR ENCUESTA (ADMIN)
       (ejemplo, puedes llamarlo desde un botón)
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
