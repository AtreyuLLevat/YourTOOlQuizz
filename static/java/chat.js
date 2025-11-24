// chat.js

const messagesContainer = document.getElementById('messages');
const inputField = document.getElementById('input');
const sendBtn = document.getElementById('send-btn');

// -------------------------------------------------------
// SOCKET.IO
// -------------------------------------------------------
const socket = io();

// -------------------------------------------------------
// Añadir mensaje al DOM (sin inline handlers)
// -------------------------------------------------------
function appendMessage(text, sender, messageId = null) {
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

    appendMessage(text, 'user');

    socket.emit("send_message", { text, sender: "user" });

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
