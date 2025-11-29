document.addEventListener("DOMContentLoaded", () => {
    // Contenedores principales
    const chatContainer = document.getElementById('chat');
    const chatList = document.getElementById('chat-list');
    const messagesContainer = document.getElementById('messages');
    const inputField = document.getElementById('input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');

    // Validación inicial
    if (!chatContainer || !chatList || !newChatBtn) {
        console.error("Faltan elementos necesarios en el DOM: #chat, #chat-list o #new-chat-btn");
        return;
    }

    const CURRENT_USER_ID = chatContainer.dataset.userId;
    const CURRENT_USER_NAME = chatContainer.dataset.userName;

    let CURRENT_CHAT_ID = null;
    const messagesMap = new Map();

    const socket = io();

    // -----------------------------
    // Crear un nuevo chat
    // -----------------------------
    async function createChat() {
        try {
            const res = await fetch("/chat/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "Nuevo chat" })
            });
            const data = await res.json();
            if (!data.chat_id) throw new Error("No se creó el chat");

            addChatToSidebar(data.chat_id, data.title);
            loadChat(data.chat_id); // Abrir automáticamente
        } catch (err) {
            console.error("Error creando chat:", err);
        }
    }

    // -----------------------------
    // Añadir chat al sidebar
    // -----------------------------
    function addChatToSidebar(chatId, title) {
        const div = document.createElement("div");
        div.classList.add("chat-item");
        div.dataset.chatId = chatId;
        div.textContent = title;
        div.addEventListener("click", () => loadChat(chatId));
        chatList.appendChild(div);
    }

    // -----------------------------
    // Cargar un chat existente
    // -----------------------------
    async function loadChat(chatId) {
        CURRENT_CHAT_ID = chatId;

        if (!messagesContainer || !inputField || !sendBtn) {
            console.warn("El contenedor de mensajes o los inputs no están disponibles aún.");
            return;
        }

        // Limpiar mensajes previos
        messagesContainer.innerHTML = "";
        messagesMap.clear();

        socket.emit("join_chat", { chat_id: chatId });

        try {
            const res = await fetch(`/chat/${chatId}/messages`);
            const messages = await res.json();
            messages.forEach(m => {
                const senderType = m.user_id == CURRENT_USER_ID ? 'user' : 'admin';
                appendMessage(m.text, senderType, m.id, m.sender_name);
            });
        } catch (err) {
            console.error("Error cargando mensajes:", err);
        }
    }

    // -----------------------------
    // Añadir mensaje al DOM
    // -----------------------------
    function appendMessage(text, sender, messageId = null, senderName = null) {
        if (!messagesContainer || !text) return;
        if (messageId && messagesMap.has(messageId)) return;
        if (messageId) messagesMap.set(messageId, true);

        const wrapper = document.createElement('div');
        wrapper.classList.add('message-wrapper', sender);
        if (messageId) wrapper.dataset.id = messageId;

        const nameEl = document.createElement('div');
        nameEl.classList.add('username');
        nameEl.textContent = senderName || (sender === 'user' ? CURRENT_USER_NAME : "Otro");

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
        if (!inputField || !CURRENT_CHAT_ID) return;
        const text = inputField.value.trim();
        if (!text) return;

        const messageId = Date.now().toString() + Math.random().toString(36).substring(2,5);
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
    // Listeners Socket.IO
    // -----------------------------
    socket.on("receive_message", data => {
        if (data.chat_id !== CURRENT_CHAT_ID) return;
        const senderType = data.user_id == CURRENT_USER_ID ? 'user' : 'admin';
        appendMessage(data.text, senderType, data.id, data.sender_name);
    });

    // -----------------------------
    // Event listeners UI
    // -----------------------------
    sendBtn?.addEventListener("click", sendMessage);
    inputField?.addEventListener("keypress", e => { if (e.key === 'Enter') sendMessage(); });
    newChatBtn.addEventListener("click", createChat);

});
