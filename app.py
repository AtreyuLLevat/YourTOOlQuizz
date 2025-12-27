from gevent import monkey
monkey.patch_all() # debe ir **antes** de cualquier import de Flask
# app.py - Al inicio del archivo
from dotenv import load_dotenv
load_dotenv()  # Carga las variables del archivo .env


# ... resto del código
import traceback
import os
import json
import io
import pyotp
import qrcode
import stripe
import uuid
from flask import Flask, render_template, request, redirect, url_for, flash, current_app, jsonify, send_file, abort, Blueprint, render_template_string, send_from_directory
from flask_mail import Mail, Message
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
# En app.py - Actualiza los imports
from models import (
    User, Quiz, Question, Blog, Page, Plan, UserPlan, 
    App, GroupMember, GroupMessage, SecurityLog, Result, 
    Review, TeamMember, Tag, Community
)
from forms import RegisterForm, LoginForm, ContactForm
from flask_migrate import Migrate
from sqlalchemy.pool import NullPool
from sqlalchemy import or_
import base64
from tu_modulo_de_formularios import Quizzproductividad
from supabase import create_client, Client
from forms import ChangePasswordForm 
from supabase.lib.client_options import ClientOptions
from datetime import datetime, timedelta
from account_routes import account_bp
from itsdangerous import URLSafeTimedSerializer, SignatureExpired, BadSignature
from flask import render_template_string
from flask_bcrypt import Bcrypt
from apscheduler.schedulers.background import BackgroundScheduler
from extensions import mail
from flask_socketio import SocketIO, emit
from extensions import db, login_manager, bcrypt, mail, socketio
from blueprints.chat_bp.routes import chat_bp
from flask_socketio import join_room, leave_room, emit
from slugify import slugify
from models import unique_slug
from uuid import UUID
from sqlalchemy.orm import joinedload
from werkzeug.utils import secure_filename
from uuid import uuid4









load_dotenv()
print(f"MAIL_USERNAME: '{os.getenv('MAIL_USERNAME')}'")
print(f"MAIL_PASSWORD: '{os.getenv('MAIL_PASSWORD')}'")

def iniciar_tareas(app):
    """Inicializa las tareas automáticas de notificaciones con reglas específicas."""
    from apscheduler.schedulers.background import BackgroundScheduler
    from apscheduler.triggers.cron import CronTrigger
    from notifications_service import enviar_recordatorios, enviar_newsletters

    scheduler = BackgroundScheduler()

    if not scheduler.running:
        scheduler.start()
        print("🕒 Scheduler iniciado correctamente.")


    # --- Newsletter semanal ---
    # Se envía cada viernes a las 19:00
    trigger_newsletter = CronTrigger(day_of_week="fri", hour=19, minute=0)
    scheduler.add_job(lambda: enviar_newsletters(app), trigger_newsletter)

    print("🕒 Tareas configuradas: recordatorios diarios y newsletter semanal")
# Añade estas funciones después de las importaciones, antes de create_app()


# FACTORY DE LA APP
# -----------------------------
def create_app():
    app = Flask(__name__)
    api = Blueprint('api', __name__)
    name = User.name
    socketio = SocketIO(app, cors_allowed_origins="*")
    bcrypt = Bcrypt(app)
    app.register_blueprint(account_bp)
    stripe.api_key = os.getenv("STRIPE_API_KEY")
    YOUR_DOMAIN = "https://yourtoolquizz.site"
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"poolclass": NullPool}
    app.secret_key = os.getenv("SECRET_KEY", "dev-key-segura")

    # Configuración de correo
    app.config['MAIL_SERVER'] = 'smtp.hostinger.com'
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USE_SSL'] = True
    app.config['MAIL_USE_TLS'] = False
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']
    SUCCESS_URL = os.getenv("STRIPE_SUCCESS_URLpost")
    CANCEL_URL = os.getenv("STRIPE_CANCEL_URLpost")
    STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    AVATAR_UPLOAD_FOLDER = 'static/uploads/avatars'
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    


    
# Inicializar extensiones correctamente
    db.init_app(app)
    migrate = Migrate(app, db)        # Solo una vez, ya vinculado con db
    login_manager.init_app(app)
    bcrypt.init_app(app)
    mail.init_app(app)
    socketio.init_app(app, cors_allowed_origins="*")
 # Solo una vez, no redefinir socketio
















    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # -----------------------------
    # CONTEXTO DE LA APP
    # -----------------------------
    with app.app_context():
        db.create_all()  # Crea tablas si no existen

    iniciar_tareas(app)
    

    



    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")  # o SERVICE_ROLE_KEY si es backend seguro
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
    supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

    # Cliente admin (para actualizar usuarios, sin restricciones RLS)
    supabase_admin = create_client(
        SUPABASE_URL,
        SUPABASE_SERVICE_KEY,
        options=ClientOptions(
            auto_refresh_token=False,
            persist_session=False,
        )
    )

    # Cliente público (para operaciones normales de usuario)
    supabase_public = create_client(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    )

    @app.route('/<slug>')
    def page_por_slug(slug):
        # Buscar la página en la base de datos por su slug
        page = Page.query.filter_by(slug=slug).first()

        if not page:
            abort(404)  # si no existe, muestra error 404

        return render_template('page.html', page=page)
    

 

    @api.route('/api/quizzes-estadisticas/<user_id>')
    def quizzes_estadisticas(user_id):
        try:
            # Buscar quizzes asociados al usuario
            data = db.session.query(
                Quiz.id,
                Quiz.title,
                db.func.sum(QuizAnalytics.clicks).label("clicks"),
                db.func.sum(QuizAnalytics.impresiones).label("impresiones"),
                db.func.sum(QuizAnalytics.dinero_gastado).label("dinero"),
            ).join(QuizAnalytics, Quiz.id == QuizAnalytics.quiz_id) \
            .filter(QuizAnalytics.user_id == user_id) \
            .group_by(Quiz.id, Quiz.title) \
            .all()

            quizzes = []
            for q in data:
                ctr = round((q.clicks / q.impresiones) * 100, 2) if q.impresiones else 0
                quizzes.append({
                    "id": q.id,
                    "nombre": q.title,
                    "clicks": q.clicks or 0,
                    "impresiones": q.impresiones or 0,
                    "ctr": ctr,
                    "dinero": q.dinero or 0
                })

            return jsonify(quizzes)
        except Exception as e:
            print("Error:", e)
            return jsonify({"error": "No se pudieron obtener las estadísticas"}), 500

    app.register_blueprint(api)
    app.register_blueprint(chat_bp)




    @app.route('/logo.png')
    def logo():
        return send_from_directory(
            os.path.join(app.root_path, 'static/Imagenes'),
            'logo.png', mimetype='image/png'
        )

    serializer = URLSafeTimedSerializer(app.secret_key)

    @app.route("/create-checkout-session", methods=["POST"])
    def create_checkout_session():
        try:
            # Aquí defines los productos que se van a vender
            checkout_session = stripe.checkout.Session.create(
                line_items=[
                    {
                        # Price ID predefinido en Stripe
                        'price': 'price_1SP1CLR9XxliZcJ1F0edTxwl',
                        'quantity': 1,
                    },
                ],
                mode='subscription',  # pago único
                success_url=f"{YOUR_DOMAIN}/success.html?session_id={{CHECKOUT_SESSION_ID}}",
                cancel_url=f"{YOUR_DOMAIN}/cancel.html",

            )
                
            # Devuelve la URL de la sesión para redirigir al cliente
            return redirect(checkout_session.url, code=303)
        except Exception as e:
            return jsonify(error=str(e)), 400

    @app.route("/webhook-stripe", methods=["POST"])
    def stripe_webhook():
        payload = request.data
        sig_header = request.headers.get("Stripe-Signature")

        try:
            event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
        except ValueError:
            return jsonify({"success": False, "error": "Invalid payload"}), 400
        except stripe.error.SignatureVerificationError:
            return jsonify({"success": False, "error": "Invalid signature"}), 400

        # ----------------------------
        # ✅ Compra completada
        # ----------------------------
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            customer_email = session.get("customer_email")
            subscription_id = session.get("subscription")
            plan_stripe_price_id = session.get("metadata", {}).get("price_id")

            # Buscar el plan correspondiente al price_id de Stripe
            plan = Plan.query.filter_by(stripe_price_id=plan_stripe_price_id).first()

            if subscription_id and customer_email:
                subscription = stripe.Subscription.retrieve(subscription_id)
                fecha_inicio = datetime.fromtimestamp(subscription["current_period_start"])
                fecha_fin = datetime.fromtimestamp(subscription["current_period_end"])
                renewal_date = fecha_fin

                user = User.query.filter_by(email=customer_email).first()
                if user and plan:
                    existing_plan = UserPlan.query.filter_by(
                        stripe_subscription_id=subscription_id
                    ).first()

                    if existing_plan:
                        existing_plan.fecha_inicio = fecha_inicio
                        existing_plan.fecha_fin = fecha_fin
                        existing_plan.renewal_date = renewal_date
                        existing_plan.estado = "activo"
                    else:
                        new_plan = UserPlan(
                            user_id=user.id,
                            plan_id=plan.id,
                            stripe_subscription_id=subscription_id,
                            fecha_inicio=fecha_inicio,
                            fecha_fin=fecha_fin,
                            renewal_date=renewal_date,
                            dinero_gastado=plan.precio,
                            estado="activo",
                        )
                        db.session.add(new_plan)

                    # Actualizar plan actual del usuario
                    user.current_plan_id = plan.id
                    user.plan_expiration = fecha_fin

                    db.session.commit()
                    print(f"✅ Suscripción registrada para {user.email}")

        # ----------------------------
        # 🔁 Renovación automática
        # ----------------------------
        elif event["type"] == "invoice.payment_succeeded":
            subscription_id = event["data"]["object"]["subscription"]
            subscription = stripe.Subscription.retrieve(subscription_id)

            user_plan = UserPlan.query.filter_by(
                stripe_subscription_id=subscription_id
            ).first()
            if user_plan:
                user_plan.fecha_inicio = datetime.fromtimestamp(
                    subscription["current_period_start"]
                )
                user_plan.fecha_fin = datetime.fromtimestamp(
                    subscription["current_period_end"]
                )
                user_plan.renewal_date = datetime.fromtimestamp(
                    subscription["current_period_end"]
                )
                user_plan.estado = "activo"
                db.session.commit()
                print(f"🔁 Suscripción renovada: {subscription_id}")

        # ----------------------------
        # 🚫 Cancelación
        # ----------------------------
        elif event["type"] == "customer.subscription.deleted":
            subscription_id = event["data"]["object"]["id"]
            user_plan = UserPlan.query.filter_by(
                stripe_subscription_id=subscription_id
            ).first()
            if user_plan:
                user_plan.estado = "cancelado"
                db.session.commit()
                print(f"🚫 Suscripción cancelada: {subscription_id}")

        return jsonify({"success": True})



    def mark_plan_as_active(email, stripe_session_id, amount_paid):
        """
        Marca en tu DB que el usuario tiene un plan activo.
        """
        user = User.query.filter_by(email=email).first()

        if user:
            user.plan_active = True
            user.last_payment_id = stripe_session_id
            user.last_payment_amount = amount_paid
            user.last_payment_date = datetime.utcnow()
            # Guardar cambios en tu DB
            db.session.commit()


    def send_confirmation_email(email, session):
        """
        Envía un correo de confirmación al cliente.
        """
        subject = "Gracias por tu compra en YourToolQuizz"
        body = f"""
        Hola {email},

        Gracias por tu pago de {session['amount_total']/100} {session['currency'].upper()}.
        Tu plan ahora está activo.

        ID de sesión: {session['id']}

        Saludos,
        YourToolQuizz
        """
        # Aquí tu función de envío de correo
        send_email(email, subject, body)


    def allowed_file(filename):
        return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

    @app.after_request
    def add_security_headers(response):
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' https://cdn.socket.io https://cdn.jsdelivr.net 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://use.fontawesome.com; "
            "style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://use.fontawesome.com; "
            "font-src 'self' https://fonts.gstatic.com https://use.fontawesome.com; "
            "img-src 'self' https://images.unsplash.com https://i.pravatar.cc "
            "https://ouoodvqsezartigpzwke.supabase.co data:; "
            "connect-src 'self' https://cdn.socket.io "
            "https://db.ouoodvqsezartigpzwke.supabase.co https://cdn.jsdelivr.net; "
            "media-src 'self'; "
            "object-src 'none'; "
            "frame-src 'self';"
        )
        return response

# -----------------------------

    # RUTAS
    # -----------------------------
    @app.route('/')
    def homepage():
        return render_template('homepage.html')

    @app.route("/account/get_app/<string:id>")
    def get_app(id):
        try:
            uuid_obj = UUID(id, version=4)
        except ValueError:
            return jsonify({"success": False, "error": "ID inválido"}), 400

        app_data = App.query.filter_by(id=uuid_obj).first()
        if not app_data:
            return jsonify({"success": False, "error": "App no encontrada"}), 404

        # Asegurar que las reviews se cargan
        reviews_data = Review.query.filter_by(app_id=app_data.id).order_by(Review.created_at.desc()).all()
        reviews = []
        for r in reviews_data:
            username = r.user.name if r.user else "Anónimo"
            reviews.append({
                "id": str(r.id),  # 🔥 Añadido
                "username": username, 
                "content": r.content, 
                "rating": r.rating,
                "created_at": r.created_at.isoformat() if r.created_at else None
            })


        # Asegurar que los team members se cargan
        team_members_data = TeamMember.query.filter_by(app_id=app_data.id).all()
        team_members = []
        for t in team_members_data:
            team_members.append({
                "name": t.name, 
                "role": t.role, 
                "avatar_url": t.avatar_url
            })

        # 🔥 CORRECCIÓN CLAVE: Asegurar que las comunidades se cargan correctamente
        communities_data = Community.query.filter_by(app_id=app_data.id).all()
        communities = []
        for c in communities_data:
            communities.append({
                "id": str(c.id),  # 🔥 Asegurar que es string
                "name": c.name,
                "description": c.description,
                "created_at": c.created_at.isoformat() if c.created_at else None
            })

        return jsonify({
            "success": True,
            "app": {
                "id": str(app_data.id),
                "name": app_data.name,
                "description": app_data.description,
                "creation_date": app_data.creation_date.isoformat() if app_data.creation_date else None,
                "theme": app_data.theme,
                "image_url": app_data.image_url or get_app_placeholder_url(),  # CORRECCIÓN
                "reviews": reviews,
                "team_members": team_members,
                "communities": communities
            }
        })





    @app.route("/account/get_all_apps")
    def get_all_apps():
        apps = App.query.all()
        apps_list = []
        for app_data in apps:
            # CORRECCIÓN: Usar placeholder si no hay imagen
            image_url = app_data.image_url or get_app_placeholder_url()
            
            apps_list.append({
                "id": str(app_data.id),
                "name": app_data.name,
                "image_url": image_url,  # Usa el helper
                "description": app_data.description,
                "theme": app_data.theme or "General",
                "creation_date": app_data.creation_date.isoformat() if app_data.creation_date else "Desconocida"
            })
        return jsonify({"success": True, "apps": apps_list})

    @app.route("/preview/<string:app_id>")
    def previewing(app_id):
        try:
            uuid_obj = UUID(app_id, version=4)
        except ValueError:
            abort(404)

        app_data = App.query.filter_by(id=uuid_obj).first()
        if not app_data:
            abort(404)

        # Reviews de la app
        reviews = Review.query.filter_by(app_id=app_data.id).order_by(Review.created_at.desc()).all()

        # Equipo de la app
        team_members = TeamMember.query.filter_by(app_id=app_data.id).all()

        # Tags asociados a la app (muchos a muchos)
        tags = app_data.tags

        return render_template(
            "Preview.html",
            app=app_data,
            reviews=reviews,
            team=team_members,
            tags=tags
        )

    @app.route("/app/<id>/team/add", methods=["POST"])
    @login_required
    def add_team_member(id):
        app_data = App.query.get(id)
        if not app_data:
            abort(404)

        member = TeamMember(
            app_id=id,
            name=request.form["name"],
            role=request.form["role"]
        )
        db.session.add(member)
        db.session.commit()
        return redirect(f"/preview/{id}")

    @app.route("/app/<id>/tags/add", methods=["POST"])
    @login_required
    def add_tag(id):
        app_data = App.query.get(id)
        if not app_data:
            abort(404)

        tag_name = request.form["name"].strip()
        if not tag_name:
            abort(400)

        # Buscar si el tag ya existe
        tag = Tag.query.filter_by(name=tag_name).first()
        if not tag:
            tag = Tag(name=tag_name)
            db.session.add(tag)
            db.session.commit()  # Necesario para obtener ID

        # Asociar tag a la app si aún no está
        if tag not in app_data.tags:
            app_data.tags.append(tag)
            db.session.commit()

        return redirect(f"/preview/{id}")

    @app.route("/app/<id>/reviews/add", methods=["POST"])
    @login_required
    def add_review(id):
        app_data = App.query.get(id)
        if not app_data:
            return jsonify({"success": False, "error": "App no encontrada"}), 404

        # Recoger datos correctos
        content = request.form.get("content", "").strip()
        rating = request.form.get("rating", "").strip()

        if not content or not rating:
            return jsonify({"success": False, "error": "Faltan campos"}), 400

        try:
            rating = int(rating)
        except ValueError:
            return jsonify({"success": False, "error": "Rating inválido"}), 400

        review = Review(
            app_id=id,
            user_id=current_user.id,
            content=content,
            rating=rating
        )

        db.session.add(review)
        db.session.commit()

        return jsonify({
            "success": True,
            "review": {
                "username": current_user.name,
                "rating": review.rating,
                "content": review.content
            }
        })

    @app.route("/account/review/<int:review_id>", methods=["DELETE"])
    @login_required
    def delete_review(review_id):
        review = Review.query.get_or_404(review_id)

        if review.user_id != current_user.id:
            return jsonify({"success": False, "error": "No tienes permisos para eliminar esta reseña"}), 403

        db.session.delete(review)
        db.session.commit()
        return jsonify({"success": True})



    @app.route('/apps/<string:app_id>/create_community', methods=['POST'])
    @login_required
    def create_community(app_id):
        try:
            uuid_obj = UUID(app_id, version=4)
        except ValueError:
            return jsonify({"success": False, "error": "ID inválido"}), 400

        app_obj = App.query.filter_by(id=uuid_obj).first()
        if not app_obj:
            return jsonify({"success": False, "error": "App no encontrada"}), 404

        data = request.json
        name = data.get('name', '').strip()

        if not name:
            return jsonify({"success": False, "error": "Nombre obligatorio"}), 400

        community = Community(
            name=name,
            app_id=app_obj.id
        )

        db.session.add(community)
        db.session.commit()

        return jsonify({
            "success": True,
            "community": {
                "id": str(community.id),
                "name": community.name
            }
        })

    @app.route("/community/<uuid:community_id>")
    @login_required
    def community_view(community_id):
        community = Community.query.get_or_404(community_id)

        # Asegurar que el usuario es miembro
        member = GroupMember.query.filter_by(
            community_id=community.id,
            user_id=current_user.id
        ).first()

        if not member:
            member = GroupMember(
                community_id=community.id,
                user_id=current_user.id,
                app_id=community.app_id,
                is_active=True
            )
            db.session.add(member)
            db.session.commit()

        # 🔹 Cargar mensajes (solo para HTML)
        messages = (
            GroupMessage.query
            .options(joinedload(GroupMessage.user))
            .filter_by(community_id=community.id)
            .order_by(GroupMessage.created_at.asc())
            .all()
        )

        return render_template(
            "community.html",
            community=community,
            messages=messages
            # ❌ NADA de historical_messages
        )


    @app.route("/account/community/<uuid:community_id>", methods=["DELETE"])
    @login_required
    def delete_community(community_id):
        community = Community.query.get_or_404(community_id)

        # Opcional: solo el creador o admin puede borrar
        # Aquí puedes definir: community.creator_id o solo admins
        # if community.creator_id != current_user.id:
        #     return jsonify({"success": False, "error": "No tienes permisos para eliminar esta comunidad"}), 403

        # Eliminar los miembros y mensajes asociados si quieres limpieza completa
        GroupMember.query.filter_by(community_id=community.id).delete()
        GroupMessage.query.filter_by(community_id=community.id).delete()

        db.session.delete(community)
        db.session.commit()
        return jsonify({"success": True})

    


    @socketio.on("join_community")
    def handle_join_community(data):
        community_id = data.get("community_id")
        if community_id:
            join_room(str(community_id))
            print(f"👤 Usuario {current_user.name} se unió a la sala {community_id}")


    @socketio.on("send_message")
    def send_message(data):
        community_id = data.get("community_id")
        content = data.get("content")

        print(f"🔹 Evento send_message recibido: community_id={community_id}, content={content}")

        if not community_id or not content:
            print("❌ Faltan datos")
            return

        # 1️⃣ Cargar comunidad
        community = Community.query.get(community_id)
        if not community:
            print("❌ Comunidad no encontrada")
            return

        # 2️⃣ Asociar comunidad al usuario (para is_owner)
        current_user.current_community = community

        # 3️⃣ Determinar rol
        role = (
            "owner"
            if current_user.is_owner
            else "admin"
            if current_user.role == "admin"
            else "user"
        )
        print(f"🔹 Rol del usuario: {role}")

        # 4️⃣ Crear mensaje (🔥 app_id OBLIGATORIO)
        msg = GroupMessage(
            community_id=community.id,
            app_id=community.app_id,  
            user_id=current_user.id,
            content=content,
            role=role,
            message_type="user"
        )
        db.session.add(msg)
        db.session.commit()
        print(f"🔹 Mensaje creado: id={msg.id}, contenido={msg.content}")

        # 5️⃣ Emitir a la sala
        socketio.emit(
            "new_message",
            {
                "id": str(msg.id),
                "community_id": str(community.id),
                "content": msg.content,
                "user": current_user.name,
                "role": msg.role,
                "message_type": msg.message_type,
                "extra_data": msg.extra_data or {},
                "created_at": msg.created_at.isoformat()
            },
            room=str(community.id)
        )
        print(f"🔹 Mensaje emitido a la sala {community.id}")

    @app.route("/search_users")
    @login_required
    def search_users():
        query = request.args.get("q", "").strip()
        if not query or len(query) < 2:
            return jsonify([])

        # Buscar usuarios por nombre o email
        users = User.query.filter(
            or_(
                User.name.ilike(f"%{query}%"),
                User.email.ilike(f"%{query}%")
            )
        ).limit(10).all()

        results = []
        for user in users:
            results.append({
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "avatar_url": user.avatar_url,
                "socials": user.socials or {}  # Añadir redes sociales
            })

        return jsonify(results)

    @app.route('/account/upload_avatar', methods=['POST'])
    @login_required
    def upload_avatar():
        if 'avatar' not in request.files:
            return jsonify({'success': False, 'message': 'No se seleccionó ningún archivo'}), 400

        file = request.files['avatar']
        if file.filename == '':
            return jsonify({'success': False, 'message': 'No se seleccionó ningún archivo'}), 400

        if file and allowed_file(file.filename):
            ext = file.filename.rsplit(".", 1)[1].lower()
            filename = f"avatars/{current_user.id}/{uuid4().hex}.{ext}"

            supabase.storage.from_("images").upload(
                filename,
                file.read(),
                {"content-type": file.mimetype}
            )

            # ✅ AQUÍ ESTÁ LA CORRECCIÓN
            avatar_url = supabase.storage.from_("images").get_public_url(filename)

            current_user.avatar_url = avatar_url
            db.session.commit()

            return jsonify({'success': True, 'avatar_url': avatar_url})

        return jsonify({'success': False, 'message': 'Formato de archivo no permitido'}), 400




    @app.route('/account/remove_avatar', methods=['POST'])
    @login_required
    def remove_avatar():
        # CORRECCIÓN: Usar logo.png que sí existe en lugar de default-avatar.png
        default_avatar = (
            "https://ouoodvqsezartigpzwke.supabase.co/storage/v1/object/public/images/avatars/default.png"
        )

        current_user.avatar_url = default_avatar
        db.session.commit()
        return jsonify({'success': True, 'avatar_url': default_avatar})

    @app.route("/apps/<uuid:app_id>/team")
    def get_team(app_id):
        members = TeamMember.query.filter_by(app_id=app_id).all()

        data = []
        for m in members:
            user = m.user

            data.append({
                "name": user.name if user else m.name,
                "role": m.role,
                "avatar": user.avatar_url if user else m.avatar_url,
                "socials": user.socials if user else {}
            })

        return jsonify(data)

    @app.route("/account/update_app/<uuid:app_id>", methods=["POST"])
    @login_required
    def update_app(app_id):
        app = App.query.get_or_404(app_id)
        if app.owner_id != current_user.id:
            return jsonify({"success": False, "message": "No autorizado"}), 403
        
        data = request.json
        app.name = data.get("name", app.name)
        app.description = data.get("description", app.description)
        app.creation_date = data.get("creation_date", app.creation_date)
        app.theme = data.get("theme", app.theme)
        db.session.commit()
        
        return jsonify({"success": True})

    @app.route("/account/update_app_image/<uuid:app_id>", methods=["POST"])
    @login_required
    def update_app_image(app_id):
        app = App.query.get_or_404(app_id)
        if app.owner_id != current_user.id:
            return jsonify({"success": False, "message": "No autorizado"}), 403
        
        image_file = request.files.get("appImage")
        if image_file:
            # Lógica para subir a Supabase (similar a create_app)
            ext = image_file.filename.rsplit(".", 1)[1].lower()
            filename = f"apps/{uuid4().hex}.{ext}"
            supabase.storage.from_("images").upload(filename, image_file.read(), {"content-type": image_file.mimetype})
            app.image_url = supabase.storage.from_("images").get_public_url(filename)
            db.session.commit()
            return jsonify({"success": True, "image_url": app.image_url})
        
        return jsonify({"success": False, "message": "No se proporcionó imagen"}), 400
# En app.py, después de la ruta /account/change_password, añade:

    @app.route("/account/update_socials", methods=["POST"])
    @login_required
    def update_socials():
        """Actualiza las redes sociales del usuario."""
        try:
            data = request.get_json()
            socials_data = data.get("socials", {})
            
            # Validar y limpiar URLs
            cleaned_socials = {}
            for platform, url in socials_data.items():
                if url:
                    # Añadir https:// si no está presente
                    if not url.startswith(('http://', 'https://', '@')):
                        url = f'https://{url}'
                    cleaned_socials[platform] = url
            
            # Actualizar en la base de datos
            if current_user.socials is None:
                current_user.socials = {}
            
            # Mantener otros campos que ya existan
            current_socials = current_user.socials.copy() if current_user.socials else {}
            current_socials.update(cleaned_socials)
            
            # Actualizar solo los campos proporcionados
            current_user.socials = current_socials
            db.session.commit()
            
            return jsonify({
                "success": True,
                "message": "Redes sociales actualizadas correctamente",
                "socials": current_user.socials
            })
            
        except Exception as e:
            print(f"❌ Error actualizando redes sociales: {e}")
            db.session.rollback()
            return jsonify({
                "success": False,
                "message": f"Error interno: {str(e)}"
            }), 500


# En app.py, añade esta ruta si quieres obtener las redes sociales vía API

    @app.route("/account/get_socials", methods=["GET"])
    @login_required
    def get_socials():
        """Obtiene las redes sociales del usuario."""
        return jsonify({
            "success": True,
            "socials": current_user.socials or {}
        })
    
    # Añade estas rutas en app.py después de las rutas existentes de team members

    @app.route("/account/delete_app/<uuid:app_id>", methods=["DELETE"])
    @login_required
    def delete_app(app_id):
        """Elimina una aplicación y todos sus datos asociados."""
        app = App.query.get_or_404(app_id)
        
        # Verificar que el usuario es el propietario
        if app.owner_id != current_user.id:
            return jsonify({"success": False, "message": "No autorizado"}), 403
        
        try:
            # Eliminar en cascada: primero datos relacionados
            Review.query.filter_by(app_id=app.id).delete()
            TeamMember.query.filter_by(app_id=app.id).delete()
            
            # Eliminar comunidades y sus mensajes/miembros
            communities = Community.query.filter_by(app_id=app.id).all()
            for community in communities:
                GroupMember.query.filter_by(community_id=community.id).delete()
                GroupMessage.query.filter_by(community_id=community.id).delete()
                db.session.delete(community)
            
            # Finalmente eliminar la app
            db.session.delete(app)
            db.session.commit()
            
            return jsonify({"success": True, "message": "Aplicación eliminada correctamente"})
        except Exception as e:
            db.session.rollback()
            print(f"❌ Error eliminando app: {e}")
            return jsonify({"success": False, "message": f"Error interno: {str(e)}"}), 500

    @app.route("/account/team_member/<int:member_id>", methods=["DELETE"])
    @login_required
    def delete_team_member(member_id):
        try:
            member = TeamMember.query.get_or_404(member_id)
            app = App.query.get_or_404(member.app_id)
            
            if app.owner_id != current_user.id:
                return jsonify({"success": False, "message": "No tienes permiso para eliminar este miembro"}), 403
            
            db.session.delete(member)
            db.session.commit()
            
            return jsonify({"success": True, "message": "Miembro eliminado correctamente"})
        except Exception as e:
            db.session.rollback()
            print(f"Error al eliminar miembro: {e}")
            return jsonify({"success": False, "message": "Error interno al eliminar"}), 500

    @app.route("/account/team_member/<int:member_id>", methods=["PATCH"])
    @login_required
    def update_team_member(member_id):
        try:
            member = TeamMember.query.get_or_404(member_id)
            app = App.query.get_or_404(member.app_id)
            
            if app.owner_id != current_user.id:
                return jsonify({"success": False, "message": "No tienes permiso para modificar este miembro"}), 403
            
            data = request.json
            if "role" not in data or not data["role"].strip():
                return jsonify({"success": False, "message": "El rol es obligatorio"}), 400
            
            member.role = data["role"].strip()
            db.session.commit()
            
            return jsonify({
                "success": True,
                "message": "Rol actualizado correctamente",
                "member": {
                    "id": member.id,
                    "role": member.role
                }
            })
        except Exception as e:
            db.session.rollback()
            print(f"Error al actualizar miembro: {e}")
            return jsonify({"success": False, "message": "Error interno al actualizar"}), 500

    @app.route("/account/apps/<uuid:app_id>", methods=["GET"])
    @login_required
    def get_app_details(app_id):
        """Obtiene detalles completos de una app, incluyendo team members con IDs."""
        app = App.query.get_or_404(app_id)
        
        # Verificar permisos (solo el dueño o miembros del equipo)
        if app.owner_id != current_user.id:
            # Verificar si el usuario es miembro del equipo
            is_team_member = TeamMember.query.filter_by(
                app_id=app.id, 
                user_id=current_user.id
            ).first()
            if not is_team_member:
                return jsonify({"success": False, "message": "No autorizado"}), 403
        
        # Cargar datos de la app
        reviews_data = Review.query.filter_by(app_id=app.id).order_by(Review.created_at.desc()).all()
        reviews = []
        for r in reviews_data:
            reviews.append({
                "id": str(r.id),
                "username": r.user.name if r.user else "Anónimo",
                "content": r.content,
                "rating": r.rating,
                "created_at": r.created_at.isoformat() if r.created_at else None
            })
        
        # Cargar team members CON SUS IDs
        team_members_data = TeamMember.query.filter_by(app_id=app.id).all()
        team_members = []
        for t in team_members_data:
            team_members.append({
                "id": str(t.id),
                "name": t.name,
                "role": t.role,
                "avatar_url": t.avatar_url,
                "user_id": t.user_id,
                "socials": t.socials or {}
            })
        
        # Cargar comunidades
        communities_data = Community.query.filter_by(app_id=app.id).all()
        communities = []
        for c in communities_data:
            communities.append({
                "id": str(c.id),
                "name": c.name,
                "description": c.description,
                "members_count": GroupMember.query.filter_by(community_id=c.id).count(),
                "created_at": c.created_at.isoformat() if c.created_at else None
            })
        
        return jsonify({
            "success": True,
            "app": {
                "id": str(app.id),
                "name": app.name,
                "description": app.description,
                "creation_date": app.creation_date.isoformat() if app.creation_date else None,
                "theme": app.theme,
                "image_url": app.image_url or get_app_placeholder_url(),
                "owner_id": str(app.owner_id),
                "reviews": reviews,
                "team_members": team_members,
                "communities": communities
            }
        })

    @app.route('/listadodecosas')
    def explorador():
        return render_template('listadodecosas.html')
    
    @app.route('/Servicio_1')
    def servicio():
        return render_template('Servicio_1.html')


    @app.route('/preview', endpoint='preview_static')
    def preview():
        return render_template('Preview.html')

    @app.route('/community')
    @login_required
    def community():
        return render_template('community.html')


    @app.route('/quizzproductividad', methods=['GET', 'POST'])
    def quizzproductividad():
        form = Quizzproductividad()
        keywords = ["Quiz, Quizdeejemplo, ejemplo, contratarQuiz, Quiz de ejemplo, contratar Quiz"]
        resultados = Quiz.query.filter(db.or_(*[Quiz.keywords.ilike(f"%{k}%") for k in keywords])).all()

        with open(os.path.join(app.root_path, 'data/productividad.json'), 'r', encoding='utf-8') as f:
            productividad_data = json.load(f)
        quizzes_data = productividad_data.get("herramientasproductivas", {})

        if form.validate_on_submit():
            answers = [form.q1.data, form.q2.data, form.q3.data, form.q4.data, form.q5.data]
            scores = {'notion': 0, 'clickup': 0, 'todoist': 0}
            for answer in answers:
                if answer in scores:
                    scores[answer] += 1
            best_tool = max(scores, key=scores.get)
            tool_data = quizzes_data[best_tool]
            return render_template('result.html', tool=tool_data)

        return render_template('quizzproductividad.html', form=form, relacionados=resultados)

    # -----------------------------
    # RUTAS DE BLOG Y CATEGORÍAS
    # -----------------------------

    @app.route('/Blogejemplo')
    def Blogejemplo():
        keywords = ["blog, blogdeejemplo, ejemplo, contratarblog, blog de ejemplo, contratar blog"]
        relacionados = Blog.query.filter(db.or_(*[Blog.keywords.ilike(f"%{k}%") for k in keywords])).all()
        return render_template('Blogejemplo.html', relacionados=relacionados)



    # -----------------------------
    # FUNCIONALIDADES CORE
    # -----------------------------
    @app.route('/result', methods=['POST'])
    def result():
        quiz_type = request.form.get('quiz_type')
        if quiz_type == 'antivirus':
            path = os.path.join(current_app.root_path, 'data/quizzes.json')
            key = 'herramientas'
        elif quiz_type == 'productividad':
            path = os.path.join(current_app.root_path, 'data/productividad.json')
            key = 'herramientasproductivas'
        else:
            flash("Tipo de quiz desconocido", "error")
            return redirect(url_for('homepage'))

        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        quizzes_data = data[key]
        answers = [request.form.get(f'q{i}') for i in range(1,6)]
        scores = {tool: 0 for tool in quizzes_data.keys()}
        for answer in answers:
            if answer in scores:
                scores[answer] += 1
        best_tool = max(scores, key=scores.get)
        tool_data = quizzes_data[best_tool]

        return render_template('result.html', tool=tool_data)

    @app.route('/buscar')
    def buscar():
        query = request.args.get('q', '').strip()

        resultados_quiz = []
        resultados_blog = []
        resultados_page = []  # 🔹 Inicializamos la lista

        if query:
            like = f"%{query}%"

            # Buscar en Quizzes: titulo, contenido, keywords y image_url
            resultados_quiz = Quiz.query.filter(
                (Quiz.titulo.ilike(like)) |
                (Quiz.contenido.ilike(like)) |
                (Quiz.keywords.ilike(like)) |
                (Quiz.image_url.ilike(like))
            ).all()

            # Buscar en Blogs: titulo, contenido, keywords y image_url
            resultados_blog = Blog.query.filter(
                (Blog.titulo.ilike(like)) |
                (Blog.contenido.ilike(like)) |
                (Blog.keywords.ilike(like)) |
                (Blog.image_url.ilike(like))
            ).all()

            # Buscar en Pages: title, description y content (sin imagen)
            resultados_page = Page.query.filter(
                (Page.title.ilike(like)) |
                (Page.description.ilike(like)) |
                (Page.content.ilike(like))
            ).all()

        # 🔹 Ahora sí, pasamos TODOS los resultados al template
        return render_template(
            'buscar.html',
            resultados_quiz=resultados_quiz,
            resultados_blog=resultados_blog,
            resultados_page=resultados_page,
            q=query
        )


    @app.route("/success.html")
    @login_required
    def success():
        user_email = current_user.email
        message = f"🎉 ¡Gracias por tu compra, {user_email}! Tu pago se ha procesado correctamente."

        # Enviar correo de confirmación
        try:
            subject = "🎉 Compra exitosa en YourToolQuizz"
            html_body = f"""
            <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 30px;">
            <div style="max-width: 480px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                <div style="text-align:center; margin-bottom: 25px;">
                <img src="https://yourtoolquizz.site/static/Imagenes/logo.png" alt="YourToolQuizz" style="width: 100px; height:auto;" />
                </div>
                <h2 style="color:#111827; text-align:center;">¡Gracias por tu compra!</h2>
                <p style="color:#374151; font-size:15px;">Hola {user_email}, tu pago se ha procesado correctamente y tu plan está activo.</p>
                <div style="text-align:center; margin:30px 0;">
                <a href="https://yourtoolquizz.site/account" style="background:#2563eb; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600;">
                    Ir a mi cuenta
                </a>
                </div>
                <p style="font-size:12px; color:#9ca3af; text-align:center;">
                © {datetime.utcnow().year} YourToolQuizz — Todos los derechos reservados.
                </p>
            </div>
            </div>
            """
            msg = Message(subject, recipients=[current_user.email])
            msg.html = html_body
            mail.send(msg)
            print(f"✅ Correo de éxito enviado a {current_user.email}")
        except Exception as e:
            print(f"❌ Error enviando correo de éxito: {e}")

        return render_template("success.html", message=message)


    @app.route("/cancel.html")
    @login_required
    def cancel():
        user_email = current_user.email
        message = f"⚠️ Hola {user_email}, tu pago ha sido cancelado. No se ha procesado ningún cargo."

        # Enviar correo de notificación de cancelación
        try:
            subject = "⚠️ Pago cancelado en YourToolQuizz"
            html_body = f"""
            <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 30px;">
            <div style="max-width: 480px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                <div style="text-align:center; margin-bottom: 25px;">
                <img src="https://yourtoolquizz.site/static/Imagenes/logo.png" alt="YourToolQuizz" style="width: 100px; height:auto;" />
                </div>
                <h2 style="color:#111827; text-align:center;">Pago cancelado</h2>
                <p style="color:#374151; font-size:15px;">Hola {user_email}, tu pago no se ha procesado. Si fue un error, intenta nuevamente o contáctanos.</p>
                <div style="text-align:center; margin:30px 0;">
                <a href="https://yourtoolquizz.site/account" style="background:#2563eb; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600;">
                    Ir a mi cuenta
                </a>
                </div>
                <p style="font-size:12px; color:#9ca3af; text-align:center;">
                © {datetime.utcnow().year} YourToolQuizz — Todos los derechos reservados.
                </p>
            </div>
            </div>
            """
            msg = Message(subject, recipients=[current_user.email])
            msg.html = html_body
            mail.send(msg)
            print(f"✅ Correo de cancelación enviado a {current_user.email}")
        except Exception as e:
            print(f"❌ Error enviando correo de cancelación: {e}")

        return render_template("cancel.html", message=message)


    # -----------------------------
    # FORMULARIOS Y CONTACTO
    # -----------------------------
    @app.route('/about')
    def about():
        return render_template('about.html')

    @app.route('/legal')
    def legal():
        return render_template('legal.html')
    @app.route('/contact', methods=['GET', 'POST'])
    def contact():
        form = ContactForm()
        if form.validate_on_submit():
            try:
                msg = Message(
                    subject=f"Nuevo mensaje de {form.nombre.data}",
                    sender=app.config['MAIL_USERNAME'],
                    recipients=[os.getenv('CONTACT_EMAIL')]
                )
                msg.body = f"De: {form.nombre.data} <{form.correo.data}>\n\nMensaje:\n{form.mensaje.data}"
                mail.send(msg)
                flash('¡Mensaje enviado correctamente!', 'success')
                print("✅ Correo enviado con éxito")  # <-- Para verificar en logs
                return redirect(url_for('thank_you'))
            except Exception as e:
                print(f"❌ Error enviando correo: {e}")  # <-- Para logs
                flash(f'Error al enviar: {str(e)}', 'error')
                return redirect(url_for('contact_error'))
        return render_template('contact.html', form=form)

    @app.route('/thank_you')
    def thank_you():
        return render_template('thank_you.html')

    @app.route('/Error')
    def contact_error():
        return render_template('Error.html')

    # -----------------------------
    # RUTAS DE USUARIOS (LOGIN)
    # -----------------------------
    @app.route('/register_email', methods=["GET", "POST"])
    def register_email():
        if current_user.is_authenticated:
            return redirect(url_for("dashboard"))

        if request.method == "POST":
            name = request.form.get("name", "").strip()
            email = request.form.get("email", "").strip()

            if not name:
                flash("Por favor introduce tu nombre.", "error")
                return redirect(url_for("register_email"))

            if not email:
                flash("Por favor introduce tu correo.", "error")
                return redirect(url_for("register_email"))

            # Comprobamos si ya existe
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                flash("Este correo ya está registrado. Inicia sesión.", "info")
                return redirect(url_for("login"))

            # Generamos token con email + name
            token = serializer.dumps({"email": email, "name": name}, salt="email-verify")
            verify_url = url_for("verify_email_step", token=token, _external=True)

            # Email HTML profesional (ahora saluda por nombre)
            html_body = render_template_string("""
            <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 30px;">
            <div style="max-width: 480px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                <div style="text-align:center; margin-bottom: 25px;">
                <img src="https://yourtoolquizz.site/static/Imagenes/logo.png" alt="YourToolQuizz" style="width: 100px; height:auto;" />
                </div>
                <h2 style="color:#111827; text-align:center;">Confirma tu correo</h2>
                <p style="color:#374151; font-size:15px;">¡Hola {{ name }}! Gracias por registrarte en <strong>YourToolQuizz</strong>. Haz clic en el botón de abajo para confirmar tu dirección de correo y continuar con la creación de tu cuenta.</p>
                <div style="text-align:center; margin:30px 0;">
                <a href="{{ verify_url }}" style="background:#2563eb; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600;">Verificar correo</a>
                </div>
                <p style="font-size:13px; color:#6b7280;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="font-size:13px; color:#2563eb;">{{ verify_url }}</p>
                <hr style="margin:25px 0; border:none; border-top:1px solid #e5e7eb;">
                <p style="font-size:12px; color:#9ca3af; text-align:center;">© {{ now.year }} YourToolQuizz. Todos los derechos reservados.</p>
            </div>
            </div>
            """, verify_url=verify_url, now=datetime.utcnow(), name=name)

            # Envío de correo
            try:
                msg = Message("Confirma tu correo en YourToolQuizz", recipients=[email])
                msg.html = html_body
                mail.send(msg)
                flash("Te hemos enviado un correo para verificar tu email.", "success")
            except Exception as e:
                current_app.logger.exception("Error enviando correo de verificación")
                flash("No se pudo enviar el correo de verificación. Intenta más tarde.", "error")

            return redirect(url_for("login"))

        # Si GET, renderiza template de registro (recuerda que tu template debe tener campos name y email)
        return render_template("register_email.html")


    # Paso 2 – Usuario hace clic en el enlace del correo
    @app.route("/verify_email/<token>")
    def verify_email_step(token):
        try:
            data = serializer.loads(token, salt="email-verify", max_age=3600)
            # data es dict: {"email": "...", "name": "..."}
            email = data.get("email")
            name = data.get("name")
        except SignatureExpired:
            flash("El enlace ha expirado. Vuelve a registrarte.", "error")
            return redirect(url_for("register_email"))
        except BadSignature:
            flash("Enlace inválido.", "error")
            return redirect(url_for("register_email"))

        # Redirigir al paso de crear contraseña, mantenemos el token para recuperar name/email luego
        return redirect(url_for("set_password", token=token))


    # Paso 3 – Crear contraseña y finalizar registro
    @app.route("/set_password/<token>", methods=["GET", "POST"])
    def set_password(token):
        try:
            data = serializer.loads(token, salt="email-verify", max_age=3600)
            email = data.get("email")
            name = data.get("name")
        except (SignatureExpired, BadSignature):
            flash("El enlace no es válido o ha expirado.", "error")
            return redirect(url_for("register_email"))

        if request.method == "POST":
            password = request.form.get("password")
            confirm = request.form.get("confirm")

            if not password or password != confirm:
                flash("Las contraseñas no coinciden.", "error")
                return redirect(url_for("set_password", token=token))

            hashed_pw = generate_password_hash(password)

            # Antes de crear, comprobar si ya existe (evita duplicados si el usuario hizo click varias veces)
            existing_user = User.query.filter_by(email=email).first()
            if existing_user:
                flash("Este correo ya fue registrado. Inicia sesión.", "info")
                return redirect(url_for("login"))

            # Crear usuario verificado directamente con name
            new_user = User(name=name, email=email, password=hashed_pw, is_verified=True)
            db.session.add(new_user)
            db.session.commit()

            login_user(new_user)
            flash("Cuenta creada con éxito. ¡Bienvenido!", "success")
            return redirect(url_for("dashboard"))

    # GET -> mostrar formulario para establecer contraseña
    # Asegúrate de que el template 'set_password.html' muestre el nombre si quieres:
        return render_template("set_password.html", name=name)
    # Nueva ruta: verificar el correo
    @app.route("/verify/<token>")
    def verify_email(token):
        s = URLSafeTimedSerializer(app.secret_key)
        try:
            email = s.loads(token, salt='email-confirm', max_age=3600)  # 1 hora de validez
        except SignatureExpired:
            flash("El enlace de verificación ha expirado. Regístrate nuevamente.", "error")
            return redirect(url_for("register"))
        except BadSignature:
            flash("Enlace de verificación inválido.", "error")
            return redirect(url_for("register"))

        user = User.query.filter_by(email=email).first_or_404()
        if user.is_verified:
            flash("Tu cuenta ya está verificada. Puedes iniciar sesión.", "info")
        else:
            user.is_verified = True
            db.session.commit()
            flash("Tu correo ha sido verificado correctamente. Ya puedes iniciar sesión.", "success")

        return redirect(url_for("login"))

    @app.route("/login", methods=["GET", "POST"])
    def login():
        if current_user.is_authenticated:
            return redirect(url_for("dashboard"))

        form = LoginForm()
        if form.validate_on_submit():
            user = User.query.filter_by(email=form.email.data).first()

            if not user or not check_password_hash(user.password, form.password.data):
                flash("Usuario o contraseña incorrectos", "error")
                return redirect(url_for("login"))


            login_user(user, remember=form.remember_me.data)
            return redirect(url_for("dashboard"))

        return render_template("login.html", form=form)

       # -----------------------------
# RESTABLECER CONTRASEÑA
# -----------------------------
    @app.route("/forgot_password", methods=["GET", "POST"])
    def forgot_password():
        if request.method == "POST":
            email = request.form.get("email").strip().lower()
            user = User.query.filter_by(email=email).first()

            if not user:
                flash("No existe ninguna cuenta con ese correo.", "error")
                return redirect(url_for("forgot_password"))

            # Generar token válido por 1 hora
            s = URLSafeTimedSerializer(app.secret_key)
            token = s.dumps(email, salt="password-reset-salt")

            reset_url = url_for("reset_password", token=token, _external=True)

            # Plantilla HTML profesional del correo
            html_body = """
            <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 30px;">
            <div style="max-width: 480px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                
                <div style="text-align:center; margin-bottom: 25px;">
                <img src="https://yourtoolquizz.site/static/Imagenes/logo.png" alt="YourToolQuizz" style="width: 100px; height:auto;" />
                </div>

                <h2 style="color:#111827; text-align:center;">Restablecer contraseña</h2>

                <p style="color:#374151; font-size:15px;">
                Hemos recibido una solicitud para restablecer tu contraseña en <strong>YourToolQuizz</strong>.
                Si no fuiste tú, ignora este mensaje.
                </p>

                <div style="text-align:center; margin:30px 0;">
                <a href="{{ reset_url }}" style="background:#2563eb; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600;">
                    Restablecer contraseña
                </a>
                </div>

                <p style="font-size:13px; color:#6b7280;">
                Si el botón no funciona, copia y pega este enlace en tu navegador:
                </p>

                <p style="font-size:13px; color:#2563eb; word-break:break-all;">
                {{ reset_url }}
                </p>

                <p style="font-size:12px; color:#6b7280; margin-top:20px;">
                Este enlace caducará en 1 hora por motivos de seguridad.
                </p>

                <hr style="margin:25px 0; border:none; border-top:1px solid #e5e7eb;">

                <p style="font-size:12px; color:#9ca3af; text-align:center;">
                © {{ now.year }} YourToolQuizz — Todos los derechos reservados.
                </p>

            </div>
            </div>
            """

            # Enviar correo
            try:
                msg = Message("Restablecer contraseña - YourToolQuizz", recipients=[email])
                msg.html = render_template_string(html_body, reset_url=reset_url, now=datetime.utcnow())
                mail = Mail(app)
                mail.send(msg)
                flash("Te hemos enviado un correo con instrucciones para restablecer tu contraseña.", "success")
            except Exception as e:
                print(f"❌ Error enviando correo: {e}")
                flash("No se pudo enviar el correo. Intenta más tarde.", "error")

            return redirect(url_for("login"))

        return render_template("forgot_password.html")


    @app.route("/reset_password/<token>", methods=["GET", "POST"])
    def reset_password(token):
        s = URLSafeTimedSerializer(app.secret_key)
        try:
            email = s.loads(token, salt="password-reset-salt", max_age=3600)
        except SignatureExpired:
            flash("El enlace ha expirado. Solicita uno nuevo.", "error")
            return redirect(url_for("forgot_password"))
        except BadSignature:
            flash("Enlace inválido.", "error")
            return redirect(url_for("forgot_password"))

        if request.method == "POST":
            password = request.form.get("password")
            confirm = request.form.get("confirm")

            if not password or password != confirm:
                flash("Las contraseñas no coinciden.", "error")
                return redirect(url_for("reset_password", token=token))

            user = User.query.filter_by(email=email).first()
            if not user:
                flash("Usuario no encontrado.", "error")
                return redirect(url_for("forgot_password"))

            user.password = generate_password_hash(password)
            db.session.commit()

            flash("Tu contraseña ha sido restablecida correctamente.", "success")
            return redirect(url_for("login"))

        return render_template("reset_password.html")


    @app.route("/Menúpublicitario")
    def menupublicitario():
        # Este endpoint sirve la página HTML / plantilla
        return render_template("Menúpublicitario.html")



    @app.route("/account", methods=["GET", "POST"])
    @login_required
    def dashboard():
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

        # --- Manejo POST para crear app ---
        if request.method == "POST":
            name = request.form.get("appName", "").strip()
            description = request.form.get("appDescription", "").strip()
            team = request.form.get("appTeam", "").strip()
            theme = request.form.get("appTheme", "").strip()
            creation_date_str = request.form.get("appCreationDate", "").strip()
            status = request.form.get("appStatus", "").strip()
            official_id = request.form.get("appOfficialId", "").strip()
            image_file = request.files.get("appImage")
            
            # Conversion fecha
            creation_date = datetime.strptime(creation_date_str, "%Y-%m-%d") if creation_date_str else None

            # Imagen
            image_url = None
            if image_file and image_file.filename:
                upload_path = os.path.join("static", "uploads", image_file.filename)
                os.makedirs(os.path.dirname(upload_path), exist_ok=True)
                image_file.save(upload_path)
                image_url = f"/{upload_path}"

            if not name:
                flash("El nombre de la app es obligatorio.", "error")
                return redirect(url_for("dashboard"))

            # Slug
            slug = f"{slugify(name)}-{int(datetime.utcnow().timestamp())}"

            # Guardar app
            new_app = App(
                name=name,
                description=description,
                team=team,
                theme=theme,
                creation_date=creation_date,
                status=status,
                official_id=official_id,
                image_url=image_url,
                slug=slug,
                owner_id=current_user.id,
                created_at=datetime.utcnow()
            )
            db.session.add(new_app)
            db.session.commit()
            flash("App creada correctamente", "success")
            return redirect(url_for("dashboard"))

        # --- GET: traer apps del usuario ---
        user_apps = App.query.filter_by(owner_id=current_user.id).order_by(App.created_at.desc()).all()

        return render_template(
            "account.html",
            usuario=current_user,
            apps=user_apps,
            SUPABASE_URL=SUPABASE_URL,
            SUPABASE_KEY=SUPABASE_ANON_KEY
        )


    @app.route("/account/create_app", methods=["POST"])
    @login_required
    def create_app_ajax():
        data = request.form

        name = data.get("appName", "").strip()
        description = data.get("appDescription", "").strip()
        theme = data.get("appTheme", "").strip()
        creation_date_str = data.get("appCreationDate", "").strip()
        status = data.get("appStatus", "").strip()
        official_id = data.get("appOfficialId", "").strip()
        image_file = request.files.get("appImage")

        members_json = data.get("members_json")

        if not name:
            return {"success": False, "message": "Nombre obligatorio"}, 400

        creation_date = None
        if creation_date_str:
            creation_date = datetime.strptime(creation_date_str, "%Y-%m-%d")

        image_url = None
        if image_file and image_file.filename:
            ext = image_file.filename.rsplit(".", 1)[1].lower()
            filename = f"apps/{uuid4().hex}.{ext}"


            supabase.storage.from_("images").upload(
                filename,
                image_file.read(),
                {"content-type": image_file.mimetype}
            )

            image_url = supabase.storage.from_("images").get_public_url(filename)


        slug = f"{slugify(name)}-{int(datetime.utcnow().timestamp())}"

        try:
            new_app = App(
                name=name,
                description=description,
                theme=theme,
                creation_date=creation_date,
                status=status,
                official_id=official_id,
                image_url=image_url,
                slug=slug,
                owner_id=current_user.id,
                created_at=datetime.utcnow()
            )

            db.session.add(new_app)
            db.session.flush()  # ⬅️ obtenemos new_app.id

            # =====================
            # TEAM MEMBERS (JSON)
            # =====================
            if members_json:
                members = json.loads(members_json)
                for m in members:
                    if not m.get("name"):
                        continue

                    member = TeamMember(
                        app_id=new_app.id,
                        name=m["name"],
                        role=m.get("role"),
                        avatar_url=m.get("avatar_url")
                    )
                    db.session.add(member)

            db.session.commit()

            return {
                "success": True,
                "app": {
                    "id": str(new_app.id),
                    "name": new_app.name,
                    "image_url": new_app.image_url or url_for("static", filename="Imagenes/logo.png")  # Cambiado
                }
            }
        except Exception as e:
            db.session.rollback()
            print("ERROR:", e)
            return {"success": False, "message": "Error interno"}, 500




    @app.route("/get_notifications", methods=["GET"])
    @login_required
    def get_notifications():
        try:
            SUPABASE_URL = os.getenv("SUPABASE_URL")
            SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

            response = supabase.table("users").select("notifications").eq("email", current_user.email).single().execute()
            print(f"📤 GET /get_notifications => {response.data}")  # 👀 Ver en logs

            if not response.data:
                return jsonify({"success": False, "message": "Usuario no encontrado."}), 404

            prefs = response.data.get("notifications") or {}
            if isinstance(prefs, str):  # a veces viene como texto JSON
                import json
                prefs = json.loads(prefs)

            return jsonify({"success": True, "notifications": prefs})
        except Exception as e:
            print(f"❌ Error al obtener notificaciones: {e}")
            return jsonify({"success": False, "message": "Error interno."}), 500


    @app.route("/save_notifications", methods=["POST"])
    @login_required
    def save_notifications():
        try:
            data = request.get_json(force=True)
            print(f"📥 POST /save_notifications => {data}")  # 👀 Ver en logs

            SUPABASE_URL = os.getenv("SUPABASE_URL")
            SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
            supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

            update = supabase.table("users").update({
                "notifications": json.dumps(data),
                "updated_at": datetime.utcnow().isoformat()
            }).eq("email", current_user.email).execute()

            print(f"📤 Resultado Supabase => {update.data}")  # 👀 Ver en logs

            if not update.data:
                return jsonify({"success": False, "message": "Error al guardar preferencias."}), 500

            return jsonify({"success": True})
        except Exception as e:
            print(f"❌ Error guardando notificaciones: {e}")
            return jsonify({"success": False, "message": "Error interno del servidor."}), 500


    @app.route("/change_password", methods=["POST"])
    @login_required
    def change_password():
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

        data = request.get_json()
        current_password = data.get("current_password")
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        if not current_password or not new_password or not confirm_password:
            return jsonify({"success": False, "message": "Faltan campos."}), 400
        if new_password != confirm_password:
            return jsonify({"success": False, "message": "Las contraseñas no coinciden."}), 400
        if len(new_password) < 8:
            return jsonify({"success": False, "message": "La nueva contraseña debe tener al menos 8 caracteres."}), 400

        response = supabase.table("users").select("password").eq("email", current_user.email).single().execute()
        if not response.data:
            return jsonify({"success": False, "message": "Usuario no encontrado."}), 404

        hashed_password = response.data["password"]
        if not check_password_hash(hashed_password, current_password):
            return jsonify({"success": False, "message": "La contraseña actual es incorrecta."}), 401

        new_hashed = generate_password_hash(new_password)
        update = supabase.table("users").update({
            "password": new_hashed,
            "updated_at": datetime.utcnow().isoformat()
        }).eq("email", current_user.email).execute()

        if not update.data:
            return jsonify({"success": False, "message": "Error al actualizar la contraseña."}), 500

        # 🔹 Enviar correo de confirmación
        try:
            s = URLSafeTimedSerializer(current_app.secret_key)
            token = s.dumps(current_user.email, salt="password-change-alert")

            subject = "🔒 Tu contraseña ha sido cambiada correctamente"
            html_body = render_template_string("""
            <div style="font-family: Arial, sans-serif; background: #f9fafb; padding: 30px;">
            <div style="max-width: 480px; margin: auto; background: #ffffff; border-radius: 12px; padding: 30px; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">
                
                <div style="text-align:center; margin-bottom: 25px;">
                <img src="https://yourtoolquizz.site/static/Imagenes/logo.png" alt="YourToolQuizz" style="width: 100px; height:auto;" />
                </div>

                <h2 style="color:#111827; text-align:center;">Contraseña actualizada</h2>

                <p style="color:#374151; font-size:15px;">
                Hola <strong>{{ email }}</strong>, tu contraseña de <strong>YourToolQuizz</strong> se ha cambiado correctamente.
                </p>

                <p style="color:#374151; font-size:15px;">
                Si fuiste tú, no necesitas hacer nada más.  
                Si no reconoces este cambio, haz clic en el botón siguiente para proteger tu cuenta:
                </p>

                <div style="text-align:center; margin:30px 0;">
                <a href="{{ url_for('not_me_password_change', token=token, _external=True) }}" 
                    style="background:#d97706; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:600;">
                    No he sido yo
                </a>
                </div>

                <p style="font-size:13px; color:#6b7280;">
                Si no realizaste este cambio, cerraremos tus sesiones y te guiaremos para restablecer tu contraseña.
                </p>

                <hr style="margin:25px 0; border:none; border-top:1px solid #e5e7eb;">
                <p style="font-size:12px; color:#9ca3af; text-align:center;">
                © {{ year }} YourToolQuizz — Todos los derechos reservados.
                </p>
            </div>
            </div>
            """, email=current_user.email, token=token, year=datetime.utcnow().year)

            msg = Message(subject, recipients=[current_user.email])
            msg.html = html_body
            mail = Mail(current_app)
            mail.send(msg)
            print(f"✅ Correo de confirmación de cambio de contraseña enviado a {current_user.email}")
        except Exception as e:
            print(f"❌ Error enviando correo de cambio de contraseña: {e}")

        return jsonify({
            "success": True,
            "message": "Contraseña actualizada correctamente. Te hemos enviado un correo de confirmación."
        })

    @app.route("/not_me_password_change/<token>")
    def not_me_password_change(token):
        s = URLSafeTimedSerializer(current_app.secret_key)
        try:
            email = s.loads(token, salt="password-change-alert", max_age=3600)
        except SignatureExpired:
            flash("El enlace ha expirado. Solicita un restablecimiento de contraseña.", "error")
            return redirect(url_for("forgot_password"))
        except BadSignature:
            flash("Enlace inválido.", "error")
            return redirect(url_for("forgot_password"))

        # 🔒 Cerrar sesión del usuario actual
        logout_user()
        print(f"⚠️ Usuario {email} ha reportado un cambio de contraseña no autorizado.")

        # 🔑 Generar nuevo token de restablecimiento
        reset_token = s.dumps(email, salt="password-reset-salt")

        # 🔁 Redirigir directamente al formulario de restablecer contraseña
        flash("Hemos cerrado todas tus sesiones por seguridad. Restablece tu contraseña ahora.", "error")
        return redirect(url_for("reset_password", token=reset_token))


    @app.route("/crear_app", methods=["POST"])
    @login_required
    def crear_app():
        data = request.json  # Espera un JSON con los datos de la app
        if not data.get("name"):
            return jsonify({"error": "El nombre de la app es obligatorio"}), 400

        nueva_app = App(
            name=data.get("name"),
            description=data.get("description"),
            image_url=data.get("image_url"),
            team=data.get("team"),
            theme=data.get("theme"),
            creation_date=data.get("creation_date"),
            status=data.get("status", "desarrollo"),
            official_id=data.get("official_id"),
            owner_id=current_user.id
        )
        db.session.add(nueva_app)
        db.session.commit()

        return jsonify({"success": True, "app_id": nueva_app.id}), 201




    @app.route("/logout")
    @login_required
    def logout():
        logout_user()
        return redirect(url_for("login"))
    
    @app.route("/quiz/<slug>")
    def quiz_por_slug(slug):
        rutas_quiz = {
            "quizzantivirus": "quizzantivirus",
            "quizzproductividad": "quizzproductividad",
        }
        if slug in rutas_quiz:
            return redirect(url_for(rutas_quiz[slug]))
        abort(404)



    @app.route("/blog/<slug>")
    def blog_por_slug(slug):
        rutas_blog = {
            "Tu marca tiene algo que contar. ": "Blogejemplo",
            # Añade aquí todos tus blogs con su slug y nombre de función real
        }
        if slug in rutas_blog:
            return redirect(url_for(rutas_blog[slug]))
        abort(404)




    # -----------------------------
    # Manejo de errores
    # -----------------------------
    @app.errorhandler(404)
    def page_not_found(e):
        return render_template('404.html'), 404

    @app.errorhandler(500)
    def internal_error(e):
        return render_template('500.html'), 500

    # -----------------------------
    # PROGRAMADOR AUTOMÁTICO DE NOTIFICACIONES
    # -----------------------------


    
    return app


