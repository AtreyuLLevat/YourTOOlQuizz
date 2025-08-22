from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, TextAreaField
from wtforms.validators import DataRequired, Email, EqualTo, Length, ValidationError
from models import User  # 👈 para validar email único en RegisterForm

class RegisterForm(FlaskForm):
    email = StringField("Correo electrónico", validators=[DataRequired(), Email(), Length(max=150)])
    password = PasswordField("Contraseña", validators=[DataRequired(), Length(min=6, max=150)])
    confirm_password = PasswordField("Confirmar Contraseña", validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField("Registrarse")

    # ✅ validación personalizada para evitar duplicados
    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('Email ya registrado')

class LoginForm(FlaskForm):
    email = StringField("Correo electrónico", validators=[DataRequired(), Email(), Length(max=150)])
    password = PasswordField("Contraseña", validators=[DataRequired()])
    submit = SubmitField("Iniciar sesión")

class ContactForm(FlaskForm):
    nombre = StringField('Nombre', validators=[DataRequired()])
    correo = StringField('Email', validators=[Email(), DataRequired()])
    mensaje = TextAreaField('Mensaje', validators=[DataRequired(), Length(min=10)])
    submit = SubmitField("Enviar")
