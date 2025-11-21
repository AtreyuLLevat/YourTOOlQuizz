// chat.js
const messagesContainer = document.getElementById('messages');
const inputField = document.getElementById('input');

// Función para agregar mensaje al DOM
function appendMessage(text, sender, messageId = null) {
    const msg = document.createElement('div');
    msg.classList.add('message', sender);

    // Asignamos un id si lo recibimos
    if (messageId) msg.dataset.id = messageId;

    if (sender === 'admin') {
        msg.innerHTML = `${text} <span class='reaction' onclick='addReaction(this)' data-id='${messageId}'>👍</span>`;
    } else {
        msg.innerText = text;
    }

    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Enviar reacción al servidor
function addReaction(el) {
    const messageId = el.dataset.id || null;
    socket.emit("reaction", { message_id: messageId });
}

// Enviar mensaje
function sendMessage() {
    const text = inputField.value.trim();
    if (!text) return;

    // Append local user message
    appendMessage(text, 'user');

    // Emitir al servidor
    socket.emit("send_message", { text, sender: "user" });

    inputField.value = "";
}

// Calificar estrella
function rate(star) {
    // Emitimos al servidor la calificación
    socket.emit('rate', { value: star });
    // Feedback visual opcional
    alert(`Has dado ${star} estrella(s)`);
}

// Socket.IO
const socket = io();

// Recibir mensaje del servidor
socket.on("receive_message", data => {
    appendMessage(data.text, data.sender, data.id);
});

// Recibir actualización de reacción
socket.on("update_reaction", data => {
    console.log("Reacción actualizada:", data);
});

// Recibir actualización de rating
socket.on("update_rating", data => {
    console.log("Rating recibido:", data);
});

// Enviar mensaje con Enter
inputField.addEventListener('keypress', e => {
    if (e.key === 'Enter') sendMessage();
});
