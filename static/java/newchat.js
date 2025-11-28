document.addEventListener("DOMContentLoaded", () => {
    const chatContainer = document.getElementById('chat');
    if (!chatContainer) return console.error("No se encontró el contenedor de chat");

    const CURRENT_USER_ID = chatContainer.dataset.userId;
    const CURRENT_USER_NAME = chatContainer.dataset.userName;

    // Contenedor de mensajes
    const messagesContainer = document.getElementById('messages') || (() => {
        const div = document.createElement('div');
        div.id = 'messages';
        div.classList.add('chat-messages');
        chatContainer.appendChild(div);
        return div;
    })();

    // Input y botones
    const inputField = document.getElementById('input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById("new-chat-btn");

    let CURRENT_CHAT_ID = null;
    const messagesMap = new Map();

    // Inicializa socket
    const socket = io();

    // -----------------------------
    // Crear nuevo chat
    // -----------------------------
    async function createChat() {
        try {
            const res = await fetch("/chat/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "Nuevo chat" })
            });

            if (!res.ok) throw new Error(`Error creando chat: ${res.status}`);
            const data = await res.json();
            CURRENT_CHAT_ID = data.chat_id;

            // Limpiar mensajes anteriores
            messagesContainer.innerHTML = "";
            messagesMap.clear();

            // Unirse a la sala
            socket.emit("join_chat", { chat_id: CURRENT_CHAT_ID });
        } catch (err) {
            console.error(err);
        }
    }

    // -----------------------------
    // Añadir mensaje al DOM
    // -----------------------------
    function appendMessage(text, sender, messageId = null, senderName = null) {
        if (!text) return;
        if (messageId && messagesMap.has(messageId)) return;
        if (messageId) messagesMap.set(messageId, true);
        senderName = senderName || (sender === 'user' ? CURRENT_USER_NAME : "Otro");

        const wrapper = document.createElement('div');
        wrapper.classList.add('message-wrapper', sender);
        if (messageId) wrapper.dataset.id = messageId;

        const nameEl = document.createElement('div');
        nameEl.classList.add('username');
        nameEl.textContent = senderName;

        const msgEl = document.createElement('div');
        msgEl.classList.add('message');
        msgEl.textContent = text;
        msgEl.style.background = sender === 'user' ? '#2563eb' : '#fff';
        msgEl.style.color = sender === 'user' ? '#fff' : '#111827';

        wrapper.appendChild(nameEl);
        wrapper.appendChild(msgEl);
        messagesContainer.appendChild(wrapper);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // -----------------------------
    // Enviar mensaje
    // -----------------------------
    function sendMessage() {
        if (!inputField || !inputField.value.trim() || !CURRENT_CHAT_ID) return;

        const messageId = Date.now().toString() + Math.random().toString(36).substring(2,5);
        const text = inputField.value.trim();

        appendMessage(text, 'user', messageId, CURRENT_USER_NAME);

        socket.emit("send_message", {
            chat_id: CURRENT_CHAT_ID,
            text,
            sender: 'user',
            id: messageId,
            user_id: CURRENT_USER_ID,
            sender_name: CURRENT_USER_NAME
        });

        inputField.value = "";
    }

    // -----------------------------
    // Socket.IO events
    // -----------------------------
    socket.on("receive_message", data => {
        if (!CURRENT_CHAT_ID || data.chat_id !== CURRENT_CHAT_ID) return;
        const senderType = data.user_id == CURRENT_USER_ID ? 'user' : 'admin';
        appendMessage(data.text, senderType, data.id, data.sender_name);
    });

    // -----------------------------
    // Event listeners
    // -----------------------------
    sendBtn?.addEventListener("click", sendMessage);
    inputField?.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
    newChatBtn?.addEventListener("click", createChat);
});
