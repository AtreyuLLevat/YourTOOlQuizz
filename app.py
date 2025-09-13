# app.py
import os
import json
import io
import pyotp
import qrcode
from flask import Flask, render_template, request, redirect, url_for, flash, current_app, send_file
from flask_mail import Mail, Message
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from models import db, User, Quiz, Question, Blog
from forms import RegisterForm, LoginForm, ContactForm
from flask_migrate import Migrate
from sqlalchemy.pool import NullPool
import base64
from tu_modulo_de_formularios import Quizantivirus, Quizzproductividad


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
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']

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

    @app.after_request
    def add_csp(response):
        response.headers['Content-Security-Policy'] = "script-src 'self';"
        return response

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
    def Servicio_1():
        return render_template('Servicio_1.html')

    @app.route('/quizzantivirus', methods=['GET', 'POST'])
    def quizzantivirus():
        form = Quizantivirus()
        keywords = ["seguridad", "antivirus", "firewall", "malware", "virus", "protección", "ciberseguridad", "quiz"]
        resultados = Quiz.query.filter(db.or_(*[Quiz.keywords.ilike(f"%{k}%") for k in keywords])).all()

        with open(os.path.join(app.root_path, 'data/antivirus.json'), 'r', encoding='utf-8') as f:
            antivirus_data = json.load(f)
        quizzes_data = antivirus_data.get("herramientas", {})

        if form.validate_on_submit():
            answers = [form.q1.data, form.q2.data, form.q3.data, form.q4.data, form.q5.data]
            scores = {'panda': 0, 'x': 0, 'z': 0}
            for answer in answers:
                if answer in scores:
                    scores[answer] += 1
            best_tool = max(scores, key=scores.get)
            tool_data = quizzes_data[best_tool]
            return render_template('result.html', tool=tool_data)

        return render_template('quizzantivirus.html', form=form, relacionados=resultados)

    @app.route('/quizzproductividad', methods=['GET', 'POST'])
    def quizzproductividad():
        form = Quizzproductividad()
        keywords = ["productividad", "organización", "tiempo", "eficiencia", "hábitos", "concentración", "gestión", "quiz"]
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
    @app.route('/diseño')
    def diseño():
        return render_template('Diseño.html')

    @app.route('/blogs')
    def blog():
        return render_template('Blogs.html')

    @app.route('/Blogs1antivirus')
    def blog1antivirus():
        keywords = ["seguridad", "antivirus", "firewall", "malware", "virus", "protección", "ciberseguridad", "blog"]
        relacionados = Blog.query.filter(db.or_(*[Blog.keywords.ilike(f"%{k}%") for k in keywords])).all()
        return render_template('Blogs1antivirus.html', relacionados=relacionados)

    @app.route('/Blogproductividad')
    def blogproductividad():
        keywords = ["productividad", "gestión del tiempo", "hábitos", "organización", "eficiencia", "tareas", "planificación", "blog"]
        relacionados = Blog.query.filter(db.or_(*[Blog.keywords.ilike(f"%{k}%") for k in keywords])).all()
        return render_template('Blogproductividad.html', relacionados=relacionados)

    @app.route('/productividad')
    def productividad():
        return render_template('productividad.html')

    @app.route('/seguridad')
    def seguridad():
        return render_template('Seguridad.html')

    @app.route('/Redes')
    def Redes():
        return render_template('Redes.html')

    @app.route('/Inteligenciasartificiales')
    def Inteligenciasartificiales():
        return render_template('Inteligenciasartificiales.html')

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
        query = request.args.get('q', '')
        resultados_quiz = []
        resultados_blog = []

        if query:
            # Buscar en Quizzes: titulo, descripcion y keywords
            resultados_quiz = Quiz.query.filter(
                (Quiz.titulo.ilike(f'%{query}%')) |
                (Quiz.contenido.ilike(f'%{query}%')) |
                (Quiz.keywords.ilike(f'%{query}%'))
            ).all()

            # Buscar en Blogs: titulo, contenido y keywords
            resultados_blog = Blog.query.filter(
                (Blog.titulo.ilike(f'%{query}%')) |
                (Blog.contenido.ilike(f'%{query}%')) |
                (Blog.keywords.ilike(f'%{query}%'))
            ).all()

        return render_template(
            'buscar.html',
            resultados_quiz=resultados_quiz,
            resultados_blog=resultados_blog,
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

    @app.route("/dashboard")
    @login_required
    def dashboard():
        return render_template("dashboard.html", email=current_user.email)

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
            "encuentra-la-herramienta-de-seguridad-adecuada-con-este-blog": "blog1antivirus",
            "mejora-tu-productividad-notion-clickup-y-todoist": "blogproductividad",
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