import os
import json
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_mail import Mail, Message
from flask_login import LoginManager, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from models import db, User
from forms import RegisterForm, LoginForm, ContactForm
from tu_modulo_de_formularios import Quizantivirus, Quizzproductividad
from flask_migrate import Migrate
from models import Quiz, Question
from flask import render_template, request

mail = Mail()
login_manager = LoginManager()

def create_app():
    """Factory para crear la app Flask"""
    app = Flask(__name__)

    # -----------------------------
    # CONFIGURACIÓN
    # -----------------------------
    load_dotenv()
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///yourtoolquizz.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.secret_key = os.getenv('SECRET_KEY') or 'dev-key-segura'

    app.config['MAIL_SERVER'] = 'smtp.gmail.com'
    app.config['MAIL_PORT'] = 587
    app.config['MAIL_USE_TLS'] = True
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
    app.config['MAIL_DEFAULT_SENDER'] = app.config['MAIL_USERNAME']
    app.config['WTF_CSRF_ENABLED'] = True

    # Inicializar extensiones
    db.init_app(app)
    Migrate(app, db)
    mail.init_app(app)
    login_manager.init_app(app)
    login_manager.login_view = 'login'

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(int(user_id))

    # -----------------------------
    # RUTAS
    # -----------------------------

    @app.route('/')
    def homepage():
        return render_template('homepage.html')

    @app.route('/quizzantivirus', methods=['GET', 'POST'])
    def quizzantivirus():
        form = Quizantivirus()

        # Cargar JSON solo cuando se llama la ruta
        with open(os.path.join(app.root_path, 'data/quizzes.json'), 'r', encoding='utf-8') as f:
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
        return render_template('quizzantivirus.html', form=form)

    @app.route('/quizzproductividad', methods=['GET', 'POST'])
    def quizzproductividad():
        form = Quizzproductividad()

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
        return render_template('quizzproductividad.html', form=form)
      # --------------------------
# RUTAS DE CATEGORÍAS
# --------------------------

    @app.route('/diseño')
    def diseño():
        return render_template('Diseño.html')

    @app.route('/Blogs')
    def Blog():
        return render_template('Blogs.html')
    @app.route('/Blogs1antivirus')
    def Blog1antivirus():
        return render_template('Blogs1antivirus.html')
        
    @app.route('/Blogproductividad')
    def Blogproductividad():
        return render_template('Blogproductividad.html')

    @app.route('/productividad')
    def productividad():
        return render_template('productividad.html')

    @app.route('/seguridad')
    def seguridad():
        return render_template('Seguridad.html')

    @app.route('/Redes')
    def Redes():
        return render_template('Redes.html')

    @app.route('/Inteligenciasartificales')
    def Inteligenciasartificiales():
        return render_template('Inteligenciasartificiales.html')

    # --------------------------
    # FUNCIONALIDADES CORE
    # --------------------------

    @app.route('/result', methods=['POST'])
    def result():
        try:
            answers = [request.form.get(f'q{i}') for i in range(1, 6)]
            scores = {'panda': 0, 'x': 0, 'z': 0}
            for answer in answers:
                if answer in scores:
                    scores[answer] += 1

            best_tool = max(scores, key=scores.get)
            tool_data = quizzes_data['herramientas'][best_tool]
            return render_template('result.html', tool=tool_data)
        except Exception as e:
            flash('Error al procesar el quiz', 'error')
            return redirect(url_for('quiz'))

   @app.route('/buscar')
    def buscar():
        query = request.args.get('q', '').strip()
        resultados = []

        if query:
            # Buscar en títulos y descripciones usando SQLAlchemy
            resultados = Quiz.query.filter(
                (Quiz.title.ilike(f"%{query}%")) |
                (Quiz.description.ilike(f"%{query}%"))
            ).all()

        return render_template("buscar.html", resultados=resultados, query=query)

    # --------------------------
    # FORMULARIOS Y CONTACTO
    # --------------------------
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
                return redirect(url_for('thank_you'))
            except Exception as e:
                flash(f'Error al enviar: {str(e)}', 'error')
                return redirect(url_for('contact_error'))
        return render_template('contact.html', form=form)

    @app.route('/thank_you')
    def thank_you():
        return render_template('thank_you.html')

    @app.route('/Error')
    def contact_error():
        return render_template('Error.html')

    # --------------------------
    # RUTAS DE USUARIOS (SISTEMA DE LOGIN)
    # --------------------------

    # -----------------------------
    # LOGIN / USUARIOS
    # -----------------------------
    @app.route("/register", methods=["GET", "POST"])
    def register():
        form = RegisterForm()
        if form.validate_on_submit():
            hashed_pw = generate_password_hash(form.password.data)
            new_user = User(email=form.email.data, password=hashed_pw)
            db.session.add(new_user)
            db.session.commit()
            flash("Registro exitoso. Ahora puedes iniciar sesión.", "success")
            return redirect(url_for("login"))
        return render_template("register.html", form=form)

    @app.route("/login", methods=["GET", "POST"])
    def login():
        form = LoginForm()
        if form.validate_on_submit():
            user = User.query.filter_by(email=form.email.data).first()
            if user and check_password_hash(user.password, form.password.data):
                login_user(user)
                flash("Inicio de sesión exitoso", "success")
                return redirect(url_for("dashboard"))
            else:
                flash("Correo o contraseña incorrectos", "danger")
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

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)

