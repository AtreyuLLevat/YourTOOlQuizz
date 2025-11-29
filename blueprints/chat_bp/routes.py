# blueprints/chat_bp/routes.py
import uuid
from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from flask_socketio import emit, join_room
from extensions import socketio
from supabase import create_client
import os


# -----------------------
# Inicializar Supabase
# -----------------------
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)


# -----------------------
# BLUEPRINT DEL CHAT
# -----------------------
chat_bp = Blueprint("chat_bp", __name__, template_folder="templates")


# ----------------------------------------------------
# 📌 1) Página principal del chat (chat.html)
# ----------------------------------------------------
@chat_bp.route("/chat")
@login_required
def chat_page():
    return render_template("chat.html")


# ----------------------------------------------------
# 📌 2) Crear un chat nuevo
@chat_bp.route("/chat/create", methods=["POST"])
@login_required
def create_chat():
    print("➡️ /chat/create fue llamado")
    try:
        data = request.json
        print("🟦 Datos recibidos:", data)

        chat_id = str(uuid.uuid4())

        print("🟪 Insertando en Supabase...")
        res = supabase.table("chats").insert({
            "id": chat_id,
            "user_id": str(current_user.id),
            "title": data.get("title", "Nuevo chat")
        }).execute()

        print("🟩 Resultado Supabase:", res)

        return jsonify({"chat_id": chat_id})

    except Exception as e:
        print("❌ ERROR:", e)
        return jsonify({"error": str(e)}), 500



# ----------------------------------------------------
# 📌 3) Listar los chats del usuario
# ----------------------------------------------------
@chat_bp.route("/chat/list", methods=["GET"])
@login_required
def list_chats():
    res = supabase.table("chats") \
        .select("*") \
        .eq("user_id", str(current_user.id)) \
        .order("created_at") \
        .execute()
    return jsonify(res.data)


# ----------------------------------------------------
# 📌 4) Obtener mensajes de un chat concreto
# ----------------------------------------------------
@chat_bp.route("/chat/<chat_id>/messages", methods=["GET"])
@login_required
def chat_messages(chat_id):
    res = supabase.table("messages") \
        .select("*") \
        .eq("chat_id", chat_id) \
        .order("created_at") \
        .execute()
    return jsonify(res.data)


# ----------------------------------------------------
# 📌 5) Enviar mensaje (SOLO API HTTP si lo usas)
# ----------------------------------------------------
@chat_bp.route("/messages/send", methods=["POST"])
@login_required
def send_message():
    try:
        data = request.json

        supabase.table("messages").insert({
            "id": data.get("id"),
            "chat_id": data.get("chat_id"),
            "user_id": str(current_user.id),
            "sender_name": current_user.name,
            "text": data.get("content")
        }).execute()

        return jsonify({"success": True})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ----------------------------------------------------
# 📡 6) Evento SocketIO: unirse a un chat
# ----------------------------------------------------
@socketio.on("join_chat")
def join_chat(data):
    chat_id = data.get("chat_id")
    if chat_id:
        join_room(chat_id)
        print(f"Usuario {request.sid} unido al chat {chat_id}")


# ----------------------------------------------------
# 📡 7) Evento SocketIO: enviar mensaje en tiempo real
# ----------------------------------------------------
@socketio.on("send_message")
def handle_send_message(data):
    chat_id = data.get("chat_id")

    if chat_id:
        # Guardar mensaje en Supabase
        supabase.table("messages").insert({
            "id": data.get("id"),
            "chat_id": chat_id,
            "user_id": data.get("user_id"),
            "sender_name": data.get("sender_name"),
            "text": data.get("text")
        }).execute()

        # Emitir solo a la sala correspondiente
        emit("receive_message", data, room=chat_id)


# ----------------------------------------------------
# 📡 8) Reacciones
# ----------------------------------------------------
@socketio.on("reaction")
def handle_reaction(data):
    emit("update_reaction", data, broadcast=True)


# ----------------------------------------------------
# 📡 9) Ratings
# ----------------------------------------------------
@socketio.on("rate")
def handle_rate(data):
    emit("update_rating", data, broadcast=True)
 