// chat.js

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
// Añadir mensaje al DOM
// -------------------------------------------------------
function appendMessage(text, sender, messageId = null) {
    // Evitar duplicados
    if (messageId && messagesMap.has(messageId)) return;
    if (messageId) messagesMap.set(messageId, true);

    const msg = document.createElement('div');
    msg.classList.add('message', sender);

    if (messageId) msg.dataset.id = messageId;

    if (sender === 'admin') {
        msg.textContent = text + " ";

        // Crear reacción sin inline JS
        const reaction = document.createElement('span');
        reaction.classList.add('reaction');
        reaction.dataset.id = messageId;
        reaction.textContent = "👍";

        reaction.addEventListener("click", () => addReaction(reaction));

        msg.appendChild(reaction);
    } else {
        msg.textContent = text;
    }

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

    // Crear ID único para el mensaje
    const messageId = Date.now().toString() + Math.random().toString(36).substring(2, 5);

    // Optimistic update: agregar localmente
    appendMessage(text, 'user', messageId);

    // Enviar al servidor
    socket.emit("send_message", { text, sender: "user", id: messageId });

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
    if (data.senderId === myUserId) return; // ignorar tu propio mensaje
    appendMessage(data.text, data.sender, data.id);
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

// Estrellas (rating)
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

