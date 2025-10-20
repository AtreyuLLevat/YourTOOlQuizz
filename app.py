import os
import json
import io
import pyotp
import qrcode
import stripe
from flask import Flask, render_template, request, redirect, url_for, flash, current_app, jsonify, send_file, abort, Blueprint
from flask_mail import Mail, Message
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from models import db, User, Quiz, Question, Blog, Page, Plan, UserPlan, QuizAnalytics
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




load_dotenv()
print(f"MAIL_USERNAME: '{os.getenv('MAIL_USERNAME')}'")
print(f"MAIL_PASSWORD: '{os.getenv('MAIL_PASSWORD')}'")

# -----------------------------
# FACTORY DE LA APP
# -----------------------------
def create_app():
    app = Flask(__name__)
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {"poolclass": NullPool}
    app.secret_key = os.getenv("SECRET_KEY", "dev-key-segura")

    # Configuración de correo
    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 465
    app.config['MAIL_USE_SSL'] = True
    app.config['MAIL_USE_TLS'] = False
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']
    SUCCESS_URL = os.getenv("STRIPE_SUCCESS_URL")
    CANCEL_URL = os.getenv("STRIPE_CANCEL_URL")
    STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET")
    stripe.api_key = os.getenv("STRIPE_SECRET_KEY")



    db.init_app(app)
    mail = Mail(app)
    Migrate(app, db)
    login_manager = LoginManager(app)
    login_manager.login_view = 'login'

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    with app.app_context():
        db.create_all()

    # -----------------------------
    # CONTEXTO DE LA APP
    # -----------------------------
    with app.app_context():
        db.create_all()  # Crea tablas si no existen

    app.register_blueprint(account_bp)



    @app.after_request
    def add_csp(response):
        response.headers['Content-Security-Policy'] = (
            "default-src 'self'; "
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
            "font-src 'self' https://fonts.gstatic.com"
            "script-src 'self' https://cdn.jsdelivr.net;"
        )
        return response
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")

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
    
    @app.route("/api/crear-sesion", methods=["POST"])
    def crear_sesion():
        data = request.json
        user_id = data.get("userId")
        plan_id = data.get("planId")
        
        if not user_id or not plan_id:
            return jsonify({"error": "Faltan userId o planId"}), 400

        # Obtener stripe_price_id del plan
        plan_resp = supabase.table("plans").select("stripe_price_id, duration_days").eq("id", plan_id).single().execute()
        if plan_resp.error:
            return jsonify({"error": str(plan_resp.error)}), 400
        plan = plan_resp.data
        price_id = plan["stripe_price_id"]

        try:
            session = stripe.checkout.Session.create(
                payment_method_types=["card"],
                mode="subscription",  # o 'payment' si es one-time
                line_items=[{"price": price_id, "quantity": 1}],
                success_url=SUCCESS_URL,
                cancel_url=CANCEL_URL,
                client_reference_id=user_id
            )
            return jsonify({"url": session.url})
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # === Webhook de Stripe ===
    @app.route("/webhook-stripe", methods=["POST"])
    def webhook_stripe():
        payload = request.data
        sig_header = request.headers.get("stripe-signature")

        try:
            event = stripe.Webhook.construct_event(
                payload, sig_header, STRIPE_WEBHOOK_SECRET
            )
        except stripe.error.SignatureVerificationError:
            abort(400)

        # Eventos a manejar
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            user_id = session.get("client_reference_id")
            customer_id = session.get("customer")
            subscription_id = session.get("subscription")

            # Actualizar stripe_customer_id del usuario
            supabase.table("users").update({"stripe_customer_id": customer_id}).eq("id", user_id).execute()

            # Obtener plan por price_id
            price_id = session["display_items"][0]["price"]["id"] if "display_items" in session else None
            plan_resp = supabase.table("plans").select("id, duration_days").eq("stripe_price_id", price_id).single().execute()
            if plan_resp.data:
                plan = plan_resp.data
                fecha_inicio = datetime.utcnow()
                fecha_fin = fecha_inicio + timedelta(days=plan["duration_days"])
                
                supabase.table("user_plans").insert({
                    "user_id": user_id,
                    "plan_id": plan["id"],
                    "stripe_subscription_id": subscription_id,
                    "fecha_inicio": fecha_inicio.isoformat(),
                    "fecha_fin": fecha_fin.isoformat(),
                    "estado": "activo",
                    "dinero_gastado": session["amount_total"] / 100
                }).execute()

        return jsonify({"status": "ok"})

    @app.route("/api/cancelar-suscripcion", methods=["POST"])
    def cancelar_suscripcion():
        data = request.json
        user_id = data.get("userId")
        
        # Obtener la suscripción activa
        resp = supabase.table("user_plans").select("stripe_subscription_id").eq("user_id", user_id).eq("estado", "activo").single().execute()
        if not resp.data:
            return jsonify({"error": "No hay suscripción activa"}), 400
        
        subscription_id = resp.data["stripe_subscription_id"]
        stripe.Subscription.delete(subscription_id)  # Cancela en Stripe

        # Actualizar estado en Supabase
        supabase.table("user_plans").update({"estado": "cancelado"}).eq("stripe_subscription_id", subscription_id).execute()
        return jsonify({"status": "cancelada"})
        
    @app.route("/api/verificar-plan", methods=["POST"])
    def verificar_plan():
        user_id = request.json.get("userId")
        plan_resp = supabase.table("user_plans").select("fecha_fin, estado").eq("user_id", user_id).eq("estado", "activo").order("fecha_fin", desc=True).limit(1).execute()
        if not plan_resp.data:
            return jsonify({"activo": False})
        
        plan = plan_resp.data
        from datetime import datetime
        if datetime.fromisoformat(plan["fecha_fin"]) > datetime.utcnow():
            return jsonify({"activo": True})
        return jsonify({"activo": False})
    api = Blueprint('api', __name__)

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
# -----------------------------

    # RUTAS
    # -----------------------------
    @app.route('/')
    def homepage():
        return render_template('homepage.html')
  
    @app.route('/Servicio_2')
    def Servicio_2():
        return render_template('Servicio_2.html')
    
    @app.route('/Servicio_1')
    def servicio():
        return render_template('Servicio_1.html')


    @app.route('/serviciosblogs')
    def serviciosblogs():
        return render_template('serviciosblogs.html')
    @app.route('/serviciosquizz')
    def serviciosquizz():
        return render_template('serviciosquizz.html')


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
    @app.route("/register", methods=["GET", "POST"])
    def register():
        if current_user.is_authenticated:
            return redirect(url_for("dashboard"))

        form = RegisterForm()
        if form.validate_on_submit():
            hashed_pw = generate_password_hash(form.password.data)
            otp_secret = pyotp.random_base32()
            new_user = User(email=form.email.data, password=hashed_pw, otp_secret=otp_secret)
            db.session.add(new_user)
            db.session.commit()

            # Crear QR (otpauth://...)
            totp = pyotp.TOTP(otp_secret)
            otp_uri = totp.provisioning_uri(name=form.email.data, issuer_name="YourToolQuizz")
            qr_img = qrcode.make(otp_uri)
            img_bytes = io.BytesIO()
            qr_img.save(img_bytes, format='PNG')
            qr_b64 = base64.b64encode(img_bytes.getvalue()).decode("utf-8")

            # Intentar enviar email (pero no fallar si no se puede)
            try:
                msg = Message("Configura tu 2FA en YourToolQuizz", recipients=[form.email.data])
                msg.body = f"Hola, añade esta clave en tu app TOTP: {otp_secret}\nO escanea el QR adjunto."
                # adjunto
                img_bytes.seek(0)
                msg.attach("2fa_qr.png", "image/png", img_bytes.read())
                mail.send(msg)
                flash("Registro exitoso. Te enviamos el QR por email.", "success")
            except Exception as e:
                current_app.logger.exception("Fallo enviando email 2FA")
                flash("Registro exitoso. No pudimos enviar el email: configura tu 2FA con el QR mostrado abajo.", "error")

            # Mostrar en la misma página (una sola vez) el QR y la clave
            return render_template("register.html", form=RegisterForm(), qr_png=qr_b64, otp_secret=otp_secret)

        return render_template("register.html", form=form)

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

            # Verificación de OTP solo una vez
            totp = pyotp.TOTP(user.otp_secret)
            if not totp.verify(form.otp_code.data):
                flash("Código 2FA inválido", "error")
                return redirect(url_for("login"))

            login_user(user, remember=form.remember_me.data)
            flash("Sesión iniciada", "success")
            return redirect(url_for("dashboard"))

        return render_template("login.html", form=form)

        


    @app.route("/Menúpublicitario")
    def menupublicitario():
        # Este endpoint sirve la página HTML / plantilla
        return render_template("Menúpublicitario.html")

    @app.route("/account")
    @login_required
    def dashboard():
        SUPABASE_URL = os.getenv("SUPABASE_URL")
        SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

        response = supabase.table("users").select("*").eq("email", current_user.email).single().execute()
        usuario = response.data if response.data else {}
        return render_template("account.html", usuario=usuario)



    @app.route("/change_password", methods=["POST"])
    @login_required
    def change_password():
        data = request.get_json()
        new_password = data.get("new_password")

        if not new_password:
            return jsonify({"status":"error","error":"Contraseña vacía"})

        try:
            supabase_admin.auth.admin.update_user_by_id(
                str(current_user.supabase_id),
                {"password": new_password}
            )
            return jsonify({"status":"success"})
        except Exception as e:
            return jsonify({"status":"error","error": str(e)})







    @app.route("/logout")
    @login_required
    def logout():
        logout_user()
        flash("Sesión cerrada correctamente", "info")
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

    return app


# -----------------------------
# EJECUCIÓN PRINCIPAL
# -----------------------------
if __name__ == "__main__":
    app = create_app()
    try:
        with db.engine.connect() as conn:
            print("Conexión a la base de datos exitosa!")
    except Exception as e:
        print(f"Error de conexión: {e}")

    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)