# -*- coding: utf-8 -*-
import os
import json
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_mail import Mail, Message
from email.header import Header
from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, PasswordField, SubmitField, validators
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_user, login_required, logout_user, current_user, UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from dotenv import load_dotenv
from tu_modulo_de_formularios import Quizantivirus
from tu_modulo_de_formularios import Quizzproductividad


# Cargar variables de entorno
load_dotenv()

app = Flask(__name__)
app.secret_key = os.getenv('SECRET_KEY') or 'dev-key-segura'  # Usar variable de entorno

# Configuración Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')  # Desde .env
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')  # Desde .env
app.config['WTF_CSRF_ENABLED'] = True  # Protección CSRF activada

# Configuración base de datos
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'  # Base datos local
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

mail = Mail(app)
db = SQLAlchemy(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'  # Redirige a login si no está autenticado

# Cargar antivirus
with open('data/quizzes.json', 'r', encoding='utf-8') as f:
    antivirus_data = json.load(f)

# Cargar productividad
with open('data/productividad.json', 'r', encoding='utf-8') as f:
    productividad_data = json.load(f)

# Combinar en un solo diccionario
quizzes_data = {
    "antivirus": antivirus_data.get("antivirus", {}),
    "herramientasproductivas": productividad_data.get("herramientasproductivas", {})
}

# Modelos de BD
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Formularios
class ContactForm(FlaskForm):
    nombre = StringField('Nombre', [validators.InputRequired()])
    correo = StringField('Email', [validators.Email(), validators.InputRequired()])
    mensaje = TextAreaField('Mensaje', [validators.InputRequired(), validators.Length(min=10)])

class RegisterForm(FlaskForm):
    email = StringField('Email', validators=[validators.InputRequired(), validators.Email(), validators.Length(max=150)])
    password = PasswordField('Contraseña', validators=[validators.InputRequired(), validators.Length(min=6, max=150)])
    confirm_password = PasswordField('Confirmar contraseña', validators=[validators.InputRequired(), validators.EqualTo('password', message='Las contraseñas deben coincidir')])
    submit = SubmitField('Registrarse')

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise validators.ValidationError('Email ya registrado')

class LoginForm(FlaskForm):
    email = StringField('Email', validators=[validators.InputRequired(), validators.Email(), validators.Length(max=150)])
    password = PasswordField('Contraseña', validators=[validators.InputRequired()])
    submit = SubmitField('Iniciar sesión')

# --------------------------
# RUTAS PRINCIPALES
# --------------------------

@app.route('/')
def homepage():
    """Página de inicio (homepage)"""
    return render_template('homepage.html')

@app.route('/quizzantivirus', methods=['GET', 'POST'])
def quizzantivirus():
    form = Quizantivirus()
    if form.validate_on_submit():
        # Procesar respuestas y redirigir a resultado
        answers = [form.q1.data, form.q2.data, form.q3.data, form.q4.data, form.q5.data]
        scores = {'panda': 0, 'x': 0, 'z': 0}
        for answer in answers:
            if answer in scores:
                scores[answer] += 1
        best_tool = max(scores, key=scores.get)
        tool_data = quizzes_data['herramientas'][best_tool]
        return render_template('result.html', tool=tool_data)
    return render_template('quizzantivirus.html', form=form)

@app.route('/quizzproductividad', methods=['GET', 'POST'])
def quizzproductividad():
    form = Quizzproductividad()
    if form.validate_on_submit():
        # Procesar respuestas y redirigir a resultado
        answers = [form.q1.data, form.q2.data, form.q3.data, form.q4.data, form.q5.data]
        scores = {'notion': 0, 'clickup': 0, 'todoist': 0}
        for answer in answers:
            if answer in scores:
                scores[answer] += 1
        best_tool = max(scores, key=scores.get)
        tool_data = quizzes_data['herramientasproductivas'][best_tool]
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
    query = request.args.get('q', '').strip().lower()
    resultados = []

    if query:
        for quiz in quizzes_data.get('quizzes', []):
            # Buscar en título, categoría y descripción (si existe)
            titulo = quiz.get('titulo', '').lower()
            categoria = quiz.get('categoria', '').lower()
            descripcion = quiz.get('descripcion', '').lower() if 'descripcion' in quiz else ''

            if query in titulo or query in categoria or query in descripcion:
                resultados.append(quiz)

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

@app.route('/register', methods=['GET', 'POST'])
def register():
    form = RegisterForm()
    if form.validate_on_submit():
        hashed_pw = generate_password_hash(form.password.data, method='sha256')
        new_user = User(email=form.email.data, password=hashed_pw)
        db.session.add(new_user)
        db.session.commit()
        flash('Cuenta creada con éxito. Ya puedes iniciar sesión.', 'success')
        return redirect(url_for('login'))
    return render_template('register.html', form=form)

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()
    if form.validate_on_submit():
        user = User.query.filter_by(email=form.email.data).first()
        if user and check_password_hash(user.password, form.password.data):
            login_user(user)
            flash('Has iniciado sesión correctamente', 'success')
            next_page = request.args.get('next')
            return redirect(next_page or url_for('dashboard'))
        else:
            flash('Correo o contraseña incorrectos', 'error')
    return render_template('login.html', form=form)

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html', email=current_user.email)

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Has cerrado sesión', 'info')
    return redirect(url_for('login'))

# --------------------------
# MANEJO DE ERRORES
# --------------------------

@app.errorhandler(404)
def page_not_found(e):
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(e):
    return render_template('500.html'), 500

# --------------------------
# INICIO DE LA APLICACIÓN
# --------------------------

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Crear tablas si no existen
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port, debug=True)
