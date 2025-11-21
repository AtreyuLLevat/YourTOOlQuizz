# blueprints/chat_bp/routes.py
from flask import Blueprint, render_template
from extensions import socketio
from flask_socketio import emit

chat_bp = Blueprint("chat_bp", __name__, template_folder="templates")

@chat_bp.route("/chat")
def chat_page():
    return render_template("chat.html")

# Eventos de SocketIO
@socketio.on("send_message")
def handle_send_message(data):
    # data: { text: "...", sender: "user" }
    emit("receive_message", data, broadcast=True)

@socketio.on("reaction")
def handle_reaction(data):
    emit("update_reaction", data, broadcast=True)

@socketio.on("rating")
def handle_rating(data):
    emit("update_rating", data, broadcast=True)
