// chat.js
const chatContainer = document.getElementById('chat');
const CURRENT_USER_ID = chatContainer.dataset.userId;
const CURRENT_USER_NAME = chatContainer.dataset.userName;

const messagesContainer = document.getElementById('messages');
const inputField = document.getElementById('input');
const sendBtn = document.getElementById('send-btn');

// Mantener IDs de mensajes para evitar duplicados
const messagesMap = new Map();

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
            // Determinar tipo de mensaje: user = yo, admin = otro
            const senderType = m.user_id === CURRENT_USER_ID ? 'user' : 'admin';
            appendMessage(m.content, senderType, m.id, m.sender_name);
        });

        console.log("Historial cargado:", messages.length, "mensajes");
    } catch (err) {
        console.error("Error cargando historial:", err);
    }
}

// Llamar al cargar la página
loadHistory();

// -------------------------------------------------------
// Añadir mensaje al DOM
// -------------------------------------------------------
function appendMessage(text, sender, messageId = null) {
    if (messageId && messagesMap.has(messageId)) return;
    if (messageId) messagesMap.set(messageId, true);

    const msg = document.createElement('div');

    // Establecer clase según sender
    if (sender === 'self') {
        msg.classList.add('message', 'user');  // tus mensajes
    } else if (sender === 'admin') {
        msg.classList.add('message', 'admin'); // admin
    } else {
        msg.classList.add('message', 'other'); // mensajes externos
    }

    if (messageId) msg.dataset.id = messageId;

    // Solo texto, sin emojis
    msg.textContent = text;

    messagesContainer.appendChild(msg);
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

    // Emitir al servidor
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

inputField.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});

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
