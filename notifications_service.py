from flask_mail import Message
from models import User, db
from flask import current_app
from datetime import datetime, timedelta
from flask_mail import Message
from extensions import mail  # 👈 crea este import (explicado abajo)
 # evitar circular import

# --- Recordatorios ---
def enviar_recordatorios(app, user=None):
    """Envía recordatorios a un usuario o a todos si user=None"""
    with app.app_context():
        if user:
            usuarios = [user]
        else:
            from models import User
            usuarios = User.query.filter(User.notifications['reminders'].as_boolean() == True).all()

        for u in usuarios:
            msg = Message(
                "Recordatorio YourToolQuizz",
                sender="support@yourtoolquizz.site",
                recipients=[u.email]
            )
            msg.body = "¡Hola! Tienes recordatorios pendientes en YourToolQuizz."
            from extensions import mail
            mail.send(msg)
            print(f"📧 Recordatorio enviado a {u.email}")

# --- Ofertas ---
def enviar_ofertas(app):
    with app.app_context():
        print("💸 Ejecutando tarea: enviar_ofertas")
        usuarios = User.query.filter(User.notifications['offers'].as_boolean() == True).all()
        for user in usuarios:
            msg = Message("Nuevas ofertas en YourToolQuizz",
                          sender="support@yourtoolquizz.site",
                          recipients=[user.email])
            msg.body = "Tenemos nuevas ofertas exclusivas para ti. ¡No te las pierdas!"
            mail.send(msg)
            print(f"📧 Oferta enviada a {user.email}")

# --- Newsletters ---
def enviar_newsletters(app):
    with app.app_context():
        print("📰 Ejecutando tarea: enviar_newsletters")
        usuarios = User.query.filter(User.notifications['newsletters'].as_boolean() == True).all()
        for user in usuarios:
            msg = Message("Boletín YourToolQuizz",
                          sender="support@yourtoolquizz.site",
                          recipients=[user.email])
            msg.body = "Este es tu boletín semanal con novedades y consejos de YourToolQuizz."
            mail.send(msg)
            print(f"📧 Newsletter enviado a {user.email}")
