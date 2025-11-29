document.addEventListener("DOMContentLoaded", () => {
    const chatContainer = document.getElementById('chat');
    const chatList = document.getElementById('chat-list');
    const newChatBtn = document.getElementById('new-chat-btn');

    if (!chatContainer || !chatList || !newChatBtn) {
        return console.error("Faltan elementos necesarios en el DOM: #chat, #chat-list o #new-chat-btn");
    }

    const CURRENT_USER_ID = chatContainer.dataset.userId;
    const CURRENT_USER_NAME = chatContainer.dataset.userName;

    // -----------------------------
    // Cargar chats del usuario
    // -----------------------------
    async function loadChats() {
        try {
            const res = await fetch("/chat/list");
            if (!res.ok) throw new Error(`Error cargando chats: ${res.status}`);
            const chats = await res.json();
            chatList.innerHTML = "";
            chats.forEach(c => addChatToSidebar(c.id, c.title));
        } catch (err) {
            console.error(err);
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
        div.addEventListener("click", () => {
            // Abrir el chat en otra página/ventana
            window.location.href = `/chat/${chatId}`;
        });
        chatList.appendChild(div);
    }

    // -----------------------------
    // Crear nuevo chat
    // -----------------------------
    async function createChat() {
        try {
            const res = await fetch("/chat/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "Nuevo chat" })
            });
            if (!res.ok) throw new Error(`Error creando chat: ${res.status}`);
            const data = await res.json();
            if (!data.chat_id) throw new Error("No se devolvió chat_id");

            // Añadir a la lista
            addChatToSidebar(data.chat_id, data.title);

            // Abrir el chat automáticamente
            window.location.href = `/chat/${data.chat_id}`;
        } catch (err) {
            console.error("Error creando chat:", err);
        }
    }

    // -----------------------------
    // Listeners
    // -----------------------------
    newChatBtn.addEventListener("click", createChat);

    // Cargar chats al inicio
    loadChats();
});
