<<<<<<< HEAD
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
=======
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
>>>>>>> ec1e43cfb7f709d6f69ef6f58ce66c05937cf404
    submit = SubmitField('Actualizar contraseña')