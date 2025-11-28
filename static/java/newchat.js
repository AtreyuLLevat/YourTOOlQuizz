document.addEventListener("DOMContentLoaded", () => {
    const newChatBtn = document.getElementById("new-chat-btn");
    if (newChatBtn) {
        newChatBtn.addEventListener("click", createChat);
    }

    const chatContainer = document.getElementById('chat');
    const CURRENT_USER_ID = chatContainer ? chatContainer.dataset.userId : null;
    const CURRENT_USER_NAME = chatContainer ? chatContainer.dataset.userName : null;

    if (!chatContainer) return;

    // Contenedor de mensajes
    const messagesContainer = document.getElementById('messages') || (() => {
        const div = document.createElement('div');
        div.id = 'messages';
        div.classList.add('chat-messages');
        chatContainer.appendChild(div);
        return div;
    })();

    const inputField = document.getElementById('input');
    const sendBtn = document.getElementById('send-btn');

    let CURRENT_CHAT_ID = null;
    const messagesMap = new Map();
    const userColors = {};

    function getColorForUser(username) {
        if (!userColors[username]) {
            const hue = Math.floor(Math.random() * 360);
            userColors[username] = `hsl(${hue}, 70%, 50%)`;
        }
        return userColors[username];
    }

    const socket = io();

    // -------------------------------------------------------
    // Crear nuevo chat
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
            messagesContainer.innerHTML = "";
            messagesMap.clear();
            socket.emit("join_chat", { chat_id: CURRENT_CHAT_ID });

        } catch (err) {
            console.error(err);
            alert("Error creando chat. Revisa la consola.");
        }
    }

    // -------------------------------------------------------
    // Añadir mensaje al DOM
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
    socket.on("receive_message", data => {
        if (data.chat_id !== CURRENT_CHAT_ID) return;
        const senderType = data.user_id === Number(CURRENT_USER_ID) ? 'user' : 'admin';
        appendMessage(data.text, senderType, data.id, data.sender_name);
    });

    sendBtn?.addEventListener("click", sendMessage);
    inputField?.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });
});
