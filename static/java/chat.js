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
// Cargar historial desde el backend
// -------------------------------------------------------
async function loadHistory() {
    try {
        const res = await fetch("/messages");
        const messages = await res.json();

        messages.forEach(m => {
            appendMessage(m.content, m.sender_id, m.id, m.sender_name);
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
function appendMessage(text, senderId, messageId = null, senderName = '') {
    if (messageId && messagesMap.has(messageId)) return;
    if (messageId) messagesMap.set(messageId, true);

    const msg = document.createElement('div');
    msg.classList.add('message');

    // Asignar clase según remitente
    if (senderId === CURRENT_USER_ID) {
        msg.classList.add('user'); // Tus mensajes
        msg.textContent = text;
    } else {
        msg.classList.add('admin'); // Mensajes de otros
        msg.textContent = senderName + ": " + text;
    }

    if (messageId) msg.dataset.id = messageId;

    messagesContainer.appendChild(msg);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// -------------------------------------------------------
// Enviar mensaje
// -------------------------------------------------------
function sendMessage() {
    const text = inputField.value.trim();
    if (!text) return;

    // ID temporal único
    const messageId = Date.now().toString() + Math.random().toString(36).substring(2, 5);

    appendMessage(text, CURRENT_USER_ID, messageId);

    socket.emit("send_message", {
        id: messageId,
        text: text,
        sender_id: CURRENT_USER_ID,
        sender_name: CURRENT_USER_NAME
    });

    inputField.value = "";
}

// -------------------------------------------------------
// Listeners de Socket.IO
// -------------------------------------------------------
socket.on("receive_message", data => {
    appendMessage(data.text, data.sender_id, data.id, data.sender_name);
});

// Reacciones y rating (opcional)
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
