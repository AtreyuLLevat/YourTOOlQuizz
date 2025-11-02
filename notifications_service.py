from flask_mail import Message
from models import User, db
from flask import current_app
from datetime import datetime, timedelta
from flask_mail import Message
from models import User
from extensions import mail  # 👈 crea este import (explicado abajo)


# ======= FUNCIONES DE ENVÍO ======= #

def enviar_email(destinatario, asunto, html):
    try:
        msg = Message(asunto, recipients=[destinatario])
        msg.html = html
        mail.send(msg)
        print(f"✅ Email enviado a {destinatario}")
    except Exception as e:
        print(f"❌ Error enviando correo a {destinatario}: {e}")


def enviar_recordatorios():
    """Envia recordatorios a los usuarios que tengan activadas las notificaciones de recordatorios."""
    usuarios = User.query.all()

    for user in usuarios:
        prefs = user.notifications or {}
        if prefs.get("reminders"):
            # Ejemplo: recordatorio sobre planes o renovación
            html = f"""
            <div style="font-family: Inter, sans-serif; background:#f9fafb; padding:30px;">
              <div style="max-width:480px;margin:auto;background:#fff;padding:24px;border-radius:12px;">
                <h2 style="color:#1e293b;">⏰ Recordatorio sobre tu plan</h2>
                <p>Hola <b>{user.name or user.email.split('@')[0]}</b>,</p>
                <p>Recuerda revisar tu plan o renovar antes de su fecha de expiración para seguir disfrutando de todas las herramientas de <b>YourToolQuizz</b>.</p>
                <a href="https://yourtoolquizz.site/account" style="background:#2563eb;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Revisar mi plan</a>
              </div>
            </div>
            """
            enviar_email(user.email, "⏰ Recordatorio: revisa tu plan", html)


def enviar_ofertas():
    """Envía promociones u ofertas a los usuarios con la opción de ofertas activada."""
    usuarios = User.query.all()

    for user in usuarios:
        prefs = user.notifications or {}
        if prefs.get("offers"):
            html = f"""
            <div style="font-family: Inter, sans-serif; background:#f9fafb; padding:30px;">
              <div style="max-width:480px;margin:auto;background:#fff;padding:24px;border-radius:12px;">
                <h2 style="color:#1e293b;">🎁 Nueva oferta disponible</h2>
                <p>¡Hola <b>{user.name or user.email.split('@')[0]}</b>!</p>
                <p>Por tiempo limitado, disfruta de un <b>20% de descuento</b> en tu próximo plan premium de YourToolQuizz.</p>
                <a href="https://yourtoolquizz.site/pricing" style="background:#d97706;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">Aprovechar oferta</a>
              </div>
            </div>
            """
            enviar_email(user.email, "🎁 Oferta especial para ti", html)
def enviar_newsletters():
    """Envia boletines informativos a los usuarios suscritos."""
    usuarios = User.query.all()

    for user in usuarios:
        prefs = user.notifications or {}
        if prefs.get("newsletters"):
            html = f"""
            <div style="font-family: Inter, sans-serif; background:#f9fafb; padding:30px;">
              <div style="max-width:480px;margin:auto;background:#fff;padding:24px;border-radius:12px;">
                <div style="text-align:center;margin-bottom:20px;">
                  <img src="https://yourtoolquizz.site/static/Imagenes/logo.png" alt="YourToolQuizz" style="width:100px;height:auto;" />
                </div>
                <h2 style="color:#1e293b;">📰 Tu boletín semanal de YourToolQuizz</h2>
                <p>¡Hola <b>{user.name or user.email.split('@')[0]}</b>!</p>
                <p>Esta semana tenemos novedades en la plataforma:</p>
                <ul style="color:#374151;line-height:1.6;">
                  <li>✨ Nuevos quizzes disponibles en el área premium.</li>
                  <li>⚙️ Mejoras de rendimiento y seguridad.</li>
                  <li>💡 Consejos personalizados para potenciar tus resultados.</li>
                </ul>
                <div style="text-align:center;margin-top:25px;">
                  <a href="https://yourtoolquizz.site" style="background:#2563eb;color:white;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;">
                    Ir a YourToolQuizz
                  </a>
                </div>
                <hr style="margin:30px 0;border:none;border-top:1px solid #e5e7eb;">
                <p style="font-size:12px;color:#9ca3af;text-align:center;">
                  Si no deseas recibir estos boletines, desactiva “Boletines informativos” en tu centro de cuenta.
                </p>
              </div>
            </div>
            """
            enviar_email(user.email, "📰 Novedades de la semana — YourToolQuizz", html)
