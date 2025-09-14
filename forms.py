from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, TextAreaField, BooleanField
from wtforms.validators import DataRequired, Email, EqualTo, Length, ValidationError, Regexp
from models import User

class RegisterForm(FlaskForm):
    email = StringField("Correo electrónico", validators=[DataRequired(), Email(), Length(max=150)])
    password = PasswordField("Contraseña", validators=[
        DataRequired(),
        Length(min=8, max=150),
        Regexp(
            regex=r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&¿¡/|~=]).+$",
            message="Debe tener mayúscula, minúscula, número y símbolo:@$!%*?&¿¡/|~="
        )
    ])
    confirm_password = PasswordField("Confirmar Contraseña", validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField("Registrarse")

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('Email ya registrado')

class LoginForm(FlaskForm):
    email = StringField("Correo electrónico", validators=[DataRequired(), Email(), Length(max=150)])
    password = PasswordField("Contraseña", validators=[DataRequired()])
    otp_code = StringField("Código 2FA", validators=[DataRequired(), Length(min=6, max=6)])  # Nuevo
    remember_me = BooleanField("Recordarme")  # Nuevo
    submit = SubmitField("Iniciar sesión")

class ContactForm(FlaskForm):
    nombre = StringField('Nombre', validators=[DataRequired()])
    correo = StringField('Email', validators=[Email(), DataRequired()])
    mensaje = TextAreaField('Mensaje', validators=[DataRequired(), Length(min=10)])
    submit = SubmitField("Enviar")