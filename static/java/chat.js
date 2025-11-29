document.addEventListener("DOMContentLoaded", () => {
    const chatContainer = document.getElementById('chat');
    if (!chatContainer) return console.error("No se encontró el contenedor de chat");

    const CURRENT_USER_ID = chatContainer.dataset.userId;
    const CURRENT_USER_NAME = chatContainer.dataset.userName;

    // Contenedores
    const messagesContainer = document.getElementById('messages') || (() => {
        const div = document.createElement('div');
        div.id = 'messages';
        div.classList.add('chat-messages');
        chatContainer.appendChild(div);
        return div;
    })();

    const chatList = document.getElementById('chat-list'); // sidebar para chats
    const inputField = document.getElementById('input');
    const sendBtn = document.getElementById('send-btn');

    // Variables
    let CURRENT_CHAT_ID = null;
    const messagesMap = new Map();
    const userColors = {};

    // Función para colores por usuario
    function getColorForUser(username) {
        if (!userColors[username]) {
            const hue = Math.floor(Math.random() * 360);
            userColors[username] = `hsl(${hue}, 70%, 50%)`;
        }
        return userColors[username];
    }

    // Inicializa Socket.IO
    const socket = io();

    // -------------------------------------------------------
    // Cargar chats existentes
    // -------------------------------------------------------
    async function loadChats() {
        const res = await fetch("/chat/list");
        const chats = await res.json();
        chatList.innerHTML = "";
        chats.forEach(c => addChatToSidebar(c.id, c.title));
    }

    function addChatToSidebar(chatId, title) {
        const div = document.createElement("div");
        div.classList.add("chat-item");
        div.dataset.chatId = chatId;
        div.textContent = title;
        div.addEventListener("click", () => loadChat(chatId));
        chatList.appendChild(div);
    }

    function highlightActiveChat(chatId) {
        document.querySelectorAll(".chat-item").forEach(el => el.classList.remove("active"));
        const active = document.querySelector(`.chat-item[data-chat-id='${chatId}']`);
        if (active) active.classList.add("active");
    }

    // -------------------------------------------------------
    // Cargar mensajes de un chat
    // -------------------------------------------------------
    async function loadChat(chatId) {
        CURRENT_CHAT_ID = chatId;
        highlightActiveChat(chatId);

        messagesContainer.innerHTML = "";
        messagesMap.clear();

        socket.emit("join_chat", { chat_id: chatId });

        const res = await fetch(`/chat/${chatId}/messages`);
        const messages = await res.json();

        messages.forEach(m => {
            const senderType = m.sender_id === Number(CURRENT_USER_ID) ? 'user' : 'admin';
            appendMessage(m.text, senderType, m.id, m.sender_name);
        });
    }

    // -------------------------------------------------------
    // Añadir mensaje al DOM
    // -------------------------------------------------------
    function appendMessage(text, sender, messageId = null, senderName = null) {
        if (messageId && messagesMap.has(messageId)) return;
        if (messageId) messagesMap.set(messageId, true);
        if (!senderName) senderName = sender === 'user' ? CURRENT_USER_NAME : "Otro";

        const wrapper = document.createElement('div');
        wrapper.classList.add('message-wrapper', sender);
        if (messageId) wrapper.dataset.id = messageId;

        const nameEl = document.createElement('div');
        nameEl.classList.add('username');
        nameEl.textContent = senderName;
        nameEl.style.color = getColorForUser(senderName);

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

    // -------------------------------------------------------
    // Enviar mensaje
    // -------------------------------------------------------
    function sendMessage() {
        const text = inputField.value.trim();
        if (!text || !CURRENT_CHAT_ID) return;

        const messageId = Date.now().toString() + Math.random().toString(36).substring(2, 5);
        appendMessage(text, 'user', messageId, CURRENT_USER_NAME);

        socket.emit("send_message", {
            text,
            sender: 'user',
            id: messageId,
            user_id: CURRENT_USER_ID,
            sender_name: CURRENT_USER_NAME,
            chat_id: CURRENT_CHAT_ID
        });

        inputField.value = "";
    }

    // -------------------------------------------------------
    // Listeners Socket.IO
    // -------------------------------------------------------
    socket.on("receive_message", data => {
        if (data.chat_id !== CURRENT_CHAT_ID) return;
        const senderType = data.user_id === Number(CURRENT_USER_ID) ? 'user' : 'admin';
        appendMessage(data.text, senderType, data.id, data.sender_name);
    });

    socket.on("update_reaction", data => console.log("Reacción actualizada:", data));
    socket.on("update_rating", data => console.log("Rating recibido:", data));

    // -------------------------------------------------------
    // UI Listeners
    // -------------------------------------------------------
    sendBtn.addEventListener("click", sendMessage);
    inputField.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

    // Inicializa chats existentes
    loadChats();
    
});
