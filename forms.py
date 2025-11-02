from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField, TextAreaField, BooleanField
from wtforms.validators import DataRequired, Email, EqualTo, Length, ValidationError, Regexp
from models import User

# (1) Mantenerlo, por si lo usas más adelante (no se usará en el flujo actual)
class RegisterForm(FlaskForm):
    name = StringField("Nombre", validators=[DataRequired(), Length(min=2, max=100)])
    email = StringField("Correo electrónico", validators=[DataRequired(), Email(), Length(max=150)])
    password = PasswordField("Contraseña", validators=[
        DataRequired(),
        Length(min=8, max=150),
        Regexp(
            regex=r"^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&¿¡/|~=]).+$",
            message="Debe tener mayúscula, minúscula, número y símbolo: @$!%*?&¿¡/|~="
        )
    ])
    confirm_password = PasswordField("Confirmar Contraseña", validators=[DataRequired(), EqualTo('password')])
    submit = SubmitField("Registrarse")

    def validate_email(self, email):
        user = User.query.filter_by(email=email.data).first()
        if user:
            raise ValidationError('Email ya registrado')

# (2) Login simplificado: eliminamos OTP, ya que el 2FA por QR fue reemplazado
class LoginForm(FlaskForm):
    email = StringField(
        "Correo electrónico",
        validators=[DataRequired(), Email(), Length(max=150)],
        render_kw={"type": "email", "placeholder": "Introduce tu correo"}
    )
    password = PasswordField(
        "Contraseña",
        validators=[DataRequired()],
        render_kw={"type": "password", "placeholder": "Introduce tu contraseña"}
    )
    remember_me = BooleanField("Recordarme")
    submit = SubmitField("Iniciar sesión")


# (3) Contacto (sin cambios)
class ContactForm(FlaskForm):
    nombre = StringField('Nombre', validators=[DataRequired()])
    correo = StringField('Email', validators=[Email(), DataRequired()])
    mensaje = TextAreaField('Mensaje', validators=[DataRequired(), Length(min=10)])
    submit = SubmitField("Enviar")

# (4) Cambio de contraseña (sin cambios)
class ChangePasswordForm(FlaskForm):
    current_password = PasswordField('Contraseña actual', validators=[DataRequired()])
    new_password = PasswordField(
        'Nueva contraseña',
        validators=[
            DataRequired(),
            Length(min=8, message='Debe tener al menos 8 caracteres'),
            Regexp(
                r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&¿¡?_\'-])',
                message='Debe incluir mayúscula, minúscula, número y símbolo'
            )
        ]
    )
    confirm_password = PasswordField(
        'Confirmar nueva contraseña',
        validators=[
            DataRequired(),
            EqualTo('new_password', message='Las contraseñas no coinciden')
        ]
    )
    submit = SubmitField('Actualizar contraseña')


class ContactForm(FlaskForm):
    nombre = StringField('Nombre', validators=[DataRequired()])
    correo = StringField('Email', validators=[Email(), DataRequired()])
    mensaje = TextAreaField('Mensaje', validators=[DataRequired(), Length(min=10)])
    submit = SubmitField("Enviar")

class ChangePasswordForm(FlaskForm):
    current_password = PasswordField('Contraseña actual', validators=[DataRequired()])
    new_password = PasswordField(
        'Nueva contraseña',
        validators=[
            DataRequired(),
            Length(min=8, message='Debe tener al menos 8 caracteres'),
            Regexp(
                r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&¿¡?_\'-])',
                message='Debe incluir mayúscula, minúscula, número y símbolo'
            )
        ]
    )
    confirm_password = PasswordField(
        'Confirmar nueva contraseña',
        validators=[
            DataRequired(),
            EqualTo('new_password', message='Las contraseñas no coinciden')
        ]
    )
    submit = SubmitField('Actualizar contraseña')