document.addEventListener("DOMContentLoaded", () => {
    const chatContainer = document.getElementById('chat');
    if (!chatContainer) return;

    const CURRENT_USER_ID = chatContainer.dataset.userId;
    const CURRENT_USER_NAME = chatContainer.dataset.userName;

    const messagesContainer = document.getElementById('messages') || (() => {
        const div = document.createElement('div');
        div.id = 'messages';
        div.classList.add('chat-messages');
        chatContainer.appendChild(div);
        return div;
    })();

    const chatList = document.getElementById('chat-list');
    const inputField = document.getElementById('input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');

    let CURRENT_CHAT_ID = null;
    const messagesMap = new Map();

    const socket = io();

    // ---------------------------------------------------
    // Cargar chats existentes
    // ---------------------------------------------------

    function addChatToSidebar(chatId, title) {
    if (!chatList) return;

    const div = document.createElement("div");
    div.classList.add("chat-item");
    div.dataset.chatId = chatId;
    div.textContent = title;
    div.addEventListener("click", () => loadChat(chatId));
    chatList.appendChild(div);
}

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

    // ---------------------------------------------------
    // Cargar un chat
    // ---------------------------------------------------
    async function loadChat(chatId) {
        CURRENT_CHAT_ID = chatId;
        highlightActiveChat(chatId);

        messagesContainer.innerHTML = "";
        messagesMap.clear();

        socket.emit("join_chat", { chat_id: chatId });

        const res = await fetch(`/chat/${chatId}/messages`);
        const messages = await res.json();

        messages.forEach(m => {
            const senderType = m.user_id == CURRENT_USER_ID ? 'user' : 'admin';
            appendMessage(m.text, senderType, m.id, m.sender_name);
        });
    }

    // ---------------------------------------------------
    // Crear chat nuevo
    // ---------------------------------------------------
    async function createChat() {
        if (!newChatBtn) return;
        newChatBtn.disabled = true;

        try {
            const res = await fetch("/chat/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "Nuevo chat" })
            });

            if (!res.ok) throw new Error(`Error creando chat: ${res.status}`);
            const data = await res.json();

            // Añadir al sidebar
            addChatToSidebar(data.chat_id, data.title);

            // Cargar inmediatamente el chat
            loadChat(data.chat_id);

        } catch (err) {
            console.error(err);
        } finally {
            newChatBtn.disabled = false;
        }
    }

    // ---------------------------------------------------
    // Añadir mensaje al DOM
    // ---------------------------------------------------
    function appendMessage(text, sender, messageId = null, senderName = null) {
        if (!text) return;
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

    // ---------------------------------------------------
    // Enviar mensaje
    // ---------------------------------------------------
    function sendMessage() {
        if (!inputField.value.trim() || !CURRENT_CHAT_ID) return;

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

    // ---------------------------------------------------
    // Listeners
    // ---------------------------------------------------
    sendBtn?.addEventListener("click", sendMessage);
    inputField?.addEventListener("keypress", e => { if(e.key === 'Enter') sendMessage(); });
    newChatBtn?.addEventListener("click", createChat);

    // Socket.IO events
    socket.on("receive_message", data => {
        if (data.chat_id !== CURRENT_CHAT_ID) return;
        const senderType = data.user_id == CURRENT_USER_ID ? 'user' : 'admin';
        appendMessage(data.text, senderType, data.id, data.sender_name);
    });

    // Inicializa lista de chats al cargar
    loadChats();
});

