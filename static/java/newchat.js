// multichat.js - Gestión completa de múltiples chats
document.addEventListener("DOMContentLoaded", () => {
    // Elementos del DOM
    const chatContainer = document.getElementById('chat');
    const chatList = document.getElementById('chat-list');
    const messagesContainer = document.getElementById('messages');
    const messagesArea = document.getElementById('messages-container');
    const noChatSelected = document.getElementById('no-chat-selected');
    const chatHeader = document.getElementById('chat-header');
    const inputField = document.getElementById('input');
    const sendBtn = document.getElementById('send-btn');
    const newChatBtn = document.getElementById('new-chat-btn');

    // Validación de elementos críticos
    if (!chatContainer || !chatList || !newChatBtn) {
        console.error("Elementos críticos del DOM no encontrados");
        return;
    }

    // Datos del usuario
    const CURRENT_USER_ID = chatContainer.dataset.userId;
    const CURRENT_USER_NAME = chatContainer.dataset.userName;

    // Estado de la aplicación
    let CURRENT_CHAT_ID = null;
    let CURRENT_CHAT_TITLE = null;
    const messagesMap = new Map();
    const userColors = {};

    // Inicializar Socket.IO
    const socket = io();

    // -------------------------------------------------------
    // INICIALIZACIÓN
    // -------------------------------------------------------
    async function initializeApp() {
        try {
            await loadChats();
            console.log("Aplicación multi-chat inicializada");
        } catch (error) {
            console.error("Error inicializando la app:", error);
        }
    }

    // -------------------------------------------------------
    // GESTIÓN DE CHATS
    // -------------------------------------------------------
    async function loadChats() {
        try {
            const res = await fetch("/chat/list");
            if (!res.ok) throw new Error("Error cargando chats");
            
            const chats = await res.json();
            chatList.innerHTML = "";
            
            if (chats.length === 0) {
                chatList.innerHTML = '<div style="text-align: center; color: #6b7280; padding: 20px;">No tienes chats aún</div>';
                showNoChatSelected();
            } else {
                chats.forEach(chat => addChatToSidebar(chat.id, chat.title));
                
                // Auto-seleccionar el primer chat
                if (chats.length > 0) {
                    loadChat(chats[0].id, chats[0].title);
                }
            }
        } catch (error) {
            console.error("Error cargando chats:", error);
            chatList.innerHTML = '<div style="color: #ef4444; padding: 20px; text-align: center;">Error cargando chats</div>';
        }
    }

    function addChatToSidebar(chatId, title) {
        const div = document.createElement("div");
        div.classList.add("chat-item");
        div.dataset.chatId = chatId;
        div.textContent = title;
        
        div.addEventListener("click", () => loadChat(chatId, title));
        chatList.appendChild(div);
    }

    function highlightActiveChat(chatId) {
        document.querySelectorAll(".chat-item").forEach(el => {
            el.classList.remove("active");
        });
        
        const activeChat = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
        if (activeChat) {
            activeChat.classList.add("active");
        }
    }

    async function createChat() {
        try {
            const title = `Chat ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
            
            const res = await fetch("/chat/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: title })
            });

            if (!res.ok) throw new Error("Error creando chat");
            
            const data = await res.json();
            
            if (data.chat_id) {
                addChatToSidebar(data.chat_id, data.title || title);
                loadChat(data.chat_id, data.title || title);
                return data.chat_id;
            } else {
                throw new Error("No se recibió chat_id");
            }
        } catch (error) {
            console.error("Error creando chat:", error);
            alert("Error al crear el chat. Intenta nuevamente.");
        }
    }

    // -------------------------------------------------------
    // GESTIÓN DE MENSAJES
    // -------------------------------------------------------
    async function loadChat(chatId, chatTitle = "Chat") {
        if (CURRENT_CHAT_ID === chatId) return;
        
        CURRENT_CHAT_ID = chatId;
        CURRENT_CHAT_TITLE = chatTitle;
        
        // Actualizar UI
        highlightActiveChat(chatId);
        chatHeader.textContent = chatTitle;
        showChatArea();
        
        // Limpiar mensajes anteriores
        messagesContainer.innerHTML = "";
        messagesMap.clear();
        
        // Unirse al room de Socket.IO
        socket.emit("join_chat", { chat_id: chatId });
        
        // Cargar mensajes del servidor
        try {
            const res = await fetch(`/chat/${chatId}/messages`);
            if (!res.ok) throw new Error("Error cargando mensajes");
            
            const messages = await res.json();
            messages.forEach(message => {
                const senderType = message.user_id == CURRENT_USER_ID ? 'user' : 'admin';
                appendMessage(
                    message.text, 
                    senderType, 
                    message.id, 
                    message.sender_name || "Usuario"
                );
            });
            
            // Scroll al final
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        } catch (error) {
            console.error("Error cargando mensajes:", error);
            appendMessage("❌ Error cargando mensajes", 'admin', null, "Sistema");
        }
    }

    function appendMessage(text, sender, messageId = null, senderName = null) {
        if (messageId && messagesMap.has(messageId)) return;
        if (messageId) messagesMap.set(messageId, true);
        
        if (!senderName) {
            senderName = sender === 'user' ? CURRENT_USER_NAME : "Admin";
        }

        const wrapper = document.createElement('div');
        wrapper.classList.add('message-wrapper', sender);
        if (messageId) wrapper.dataset.messageId = messageId;

        const nameEl = document.createElement('div');
        nameEl.classList.add('username');
        nameEl.textContent = senderName;
        nameEl.style.color = getColorForUser(senderName);

        const msgEl = document.createElement('div');
        msgEl.classList.add('message', sender);
        msgEl.textContent = text;

        wrapper.appendChild(nameEl);
        wrapper.appendChild(msgEl);
        messagesContainer.appendChild(wrapper);
        
        // Scroll automático al nuevo mensaje
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    function getColorForUser(username) {
        if (!userColors[username]) {
            const hue = Math.floor(Math.random() * 360);
            userColors[username] = `hsl(${hue}, 70%, 50%)`;
        }
        return userColors[username];
    }

    function sendMessage() {
        if (!CURRENT_CHAT_ID || !inputField) return;
        
        const text = inputField.value.trim();
        if (!text) return;

        // Generar ID temporal único
        const tempMessageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Mostrar mensaje inmediatamente
        appendMessage(text, 'user', tempMessageId, CURRENT_USER_NAME);
        
        // Enviar via Socket.IO
        socket.emit("send_message", {
            id: tempMessageId,
            chat_id: CURRENT_CHAT_ID,
            text: text,
            user_id: CURRENT_USER_ID,
            sender_name: CURRENT_USER_NAME,
            sender: 'user'
        });

        // Limpiar input
        inputField.value = "";
        inputField.focus();
    }

    // -------------------------------------------------------
    // VISUALIZACIÓN
    // -------------------------------------------------------
    function showChatArea() {
        if (messagesArea) messagesArea.style.display = 'flex';
        if (noChatSelected) noChatSelected.style.display = 'none';
    }

    function showNoChatSelected() {
        if (messagesArea) messagesArea.style.display = 'none';
        if (noChatSelected) noChatSelected.style.display = 'flex';
        chatHeader.textContent = "Selecciona un chat";
        CURRENT_CHAT_ID = null;
    }

    // -------------------------------------------------------
    // EVENT LISTENERS
    // -------------------------------------------------------
    sendBtn?.addEventListener("click", sendMessage);
    
    inputField?.addEventListener("keypress", (e) => {
        if (e.key === 'Enter' && CURRENT_CHAT_ID) {
            sendMessage();
        }
    });

    newChatBtn.addEventListener("click", createChat);

    // -------------------------------------------------------
    // SOCKET.IO HANDLERS
    // -------------------------------------------------------
    socket.on("receive_message", (data) => {
        if (data.chat_id !== CURRENT_CHAT_ID) return;
        
        const senderType = data.user_id == CURRENT_USER_ID ? 'user' : 'admin';
        appendMessage(data.text, senderType, data.id, data.sender_name);
    });

    socket.on("connect", () => {
        console.log("Conectado al servidor Socket.IO");
    });

    socket.on("disconnect", () => {
        console.log("Desconectado del servidor Socket.IO");
    });

    // -------------------------------------------------------
    // INICIAR APLICACIÓN
    // -------------------------------------------------------
    initializeApp();
});