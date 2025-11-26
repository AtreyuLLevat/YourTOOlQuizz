// chat.js
const chatContainer = document.getElementById('chat');
const CURRENT_USER_ID = chatContainer.dataset.userId;
const CURRENT_USER_NAME = chatContainer.dataset.userName;

// Crear contenedor de mensajes si no existe
const messagesContainer = document.getElementById('messages') || (() => {
    const div = document.createElement('div');
    div.id = 'messages';
    div.classList.add('chat-messages');
    chatContainer.appendChild(div);
    return div;
})();

const inputField = document.getElementById('input');
const sendBtn = document.getElementById('send-btn');

// IDs de mensajes para evitar duplicados
const messagesMap = new Map();

// Colores identificadores por usuario
const userColors = {};
function getColorForUser(username) {
    if (!userColors[username]) {
        const hue = Math.floor(Math.random() * 360);
        userColors[username] = `hsl(${hue}, 70%, 50%)`;
    }
    return userColors[username];
}

// -------------------------------------------------------
// SOCKET.IO
// -------------------------------------------------------
const socket = io();

// -------------------------------------------------------
// Cargar historial desde el backend
// -------------------------------------------------------
async function loadHistory() {
    try {
        const res = await fetch("/messages");
        const messages = await res.json();
        messages.forEach(m => {
            const senderType = m.user_id === CURRENT_USER_ID ? 'user' : 'admin';
            appendMessage(m.content, senderType, m.id, m.sender_name);
        });
        console.log("Historial cargado:", messages.length, "mensajes");
    } catch (err) {
        console.error("Error cargando historial:", err);
    }
}
loadHistory();

// -------------------------------------------------------
// Añadir mensaje al DOM
// -------------------------------------------------------
function appendMessage(text, sender, messageId = null, senderName = null) {
    if (messageId && messagesMap.has(messageId)) return;
    if (messageId) messagesMap.set(messageId, true);
    if (!senderName) senderName = sender === 'user' ? CURRENT_USER_NAME : "Otro";

    // Contenedor del mensaje
    const wrapper = document.createElement('div');
    wrapper.classList.add('message-wrapper', sender);
    if (messageId) wrapper.dataset.id = messageId;

    // Nombre encima del mensaje
    const nameEl = document.createElement('div');
    nameEl.classList.add('username');
    nameEl.textContent = senderName;
    nameEl.style.color = getColorForUser(senderName);

    // Burbuja del mensaje
    const msgEl = document.createElement('div');
    msgEl.classList.add('message');
    msgEl.textContent = text;
    msgEl.style.background = sender === 'user' ? '#2563eb' : '#fff';
    msgEl.style.color = sender === 'user' ? '#fff' : '#111827';

    // Reacción para mensajes admin
    if (sender === 'admin') {
        const reaction = document.createElement('span');
        reaction.classList.add('reaction');
        reaction.dataset.id = messageId;
        reaction.addEventListener("click", () => addReaction(reaction));
        msgEl.appendChild(reaction);
    }

    wrapper.appendChild(nameEl);
    wrapper.appendChild(msgEl);
    messagesContainer.appendChild(wrapper);

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// -------------------------------------------------------
// Enviar reacción
// -------------------------------------------------------
function addReaction(el) {
    const messageId = el.dataset.id || null;
    socket.emit("reaction", { message_id: messageId });
}

// -------------------------------------------------------
// Enviar mensaje
// -------------------------------------------------------
function sendMessage() {
    const text = inputField.value.trim();
    if (!text) return;

    const messageId = Date.now().toString() + Math.random().toString(36).substring(2, 5);
    appendMessage(text, 'user', messageId, CURRENT_USER_NAME);

    socket.emit("send_message", {
        text,
        sender: 'user',
        id: messageId,
        user_id: CURRENT_USER_ID,
        sender_name: CURRENT_USER_NAME
    });

    inputField.value = "";
}

// -------------------------------------------------------
// Rate (estrellas)
// -------------------------------------------------------
function rate(star) {
    socket.emit('rate', { value: star });
    alert(`Has dado ${star} estrella(s)`);
}

// -------------------------------------------------------
// Listeners de Socket.IO
// -------------------------------------------------------
socket.on("receive_message", data => {
    const senderType = data.user_id === CURRENT_USER_ID ? 'user' : 'admin';
    appendMessage(data.text, senderType, data.id, data.sender_name);
});

socket.on("update_reaction", data => {
    console.log("Reacción actualizada:", data);
});

socket.on("update_rating", data => {
    console.log("Rating recibido:", data);
});

// -------------------------------------------------------
// UI Listeners
// -------------------------------------------------------
sendBtn.addEventListener("click", sendMessage);
inputField.addEventListener('keypress', e => { if (e.key === 'Enter') sendMessage(); });

// Estrellas
document.querySelectorAll(".rate").forEach(star => {
    star.addEventListener("click", () => {
        const value = star.dataset.rate;
        rate(value);
    });
});

// Reacciones iniciales del HTML
document.querySelectorAll(".reaction").forEach(r => {
    r.addEventListener("click", () => addReaction(r));
});
