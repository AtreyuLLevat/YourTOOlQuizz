// newChat.js
document.addEventListener("DOMContentLoaded", () => {
    const newChatBtn = document.getElementById("new-chat-btn");
    if (!newChatBtn) return; // Si no existe el botón, salir

    const chatList = document.getElementById("chat-list"); // Contenedor de chats en el sidebar
    if (!chatList) console.warn("No se encontró el contenedor de chat-list");

    const chatContainer = document.getElementById("chat");
    const CURRENT_USER_ID = chatContainer ? chatContainer.dataset.userId : null;
    const CURRENT_USER_NAME = chatContainer ? chatContainer.dataset.userName : null;

    // Función para añadir un chat al sidebar
    function addChatToSidebar(chatId, title) {
        if (!chatList) return;
        const div = document.createElement("div");
        div.classList.add("chat-item");
        div.dataset.chatId = chatId;
        div.textContent = title;
        div.addEventListener("click", () => loadChat(chatId));
        chatList.appendChild(div);
    }

    // Función para cargar un chat (solo placeholder si no tienes todo el JS del chat)
    function loadChat(chatId) {
        console.log("Cargando chat con ID:", chatId);
        // Aquí podrías integrar el loadChat del chat.js completo si quieres
    }

    // Función para crear un nuevo chat
    async function createChat() {
        if (!CURRENT_USER_ID) {
            console.warn("Usuario no identificado, no se puede crear chat");
            return;
        }

        try {
            const res = await fetch("/chat/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: "Nuevo chat" })
            });

            if (!res.ok) {
                console.error("Error creando chat:", res.status, res.statusText);
                return;
            }

            const data = await res.json();
            if (data.chat_id && data.title) {
                addChatToSidebar(data.chat_id, data.title);
                loadChat(data.chat_id);
            } else {
                console.warn("Respuesta inesperada al crear chat:", data);
            }

        } catch (error) {
            console.error("Error de red al crear chat:", error);
        }
    }

    // Listener del botón
    newChatBtn.addEventListener("click", createChat);
});
