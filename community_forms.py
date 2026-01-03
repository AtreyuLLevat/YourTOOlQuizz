from flask_wtf import FlaskForm
from wtforms import StringField, TextAreaField, FileField, SelectMultipleField, SelectField
from wtforms.validators import DataRequired, Length, Optional
from flask_wtf.file import FileAllowed

class CreateCommunityForm(FlaskForm):
    name = StringField('Nombre de la comunidad', 
                       validators=[DataRequired(message="El nombre es obligatorio"), 
                                   Length(min=3, max=200, message="El nombre debe tener entre 3 y 200 caracteres")])
    
    description = TextAreaField('Descripción', 
                                validators=[Optional(), 
                                           Length(max=500, message="La descripción no puede exceder 500 caracteres")])
    
    cover_image = FileField('Foto de portada', 
                            validators=[Optional(), 
                                       FileAllowed(['jpg', 'jpeg', 'png', 'gif'], 'Solo se permiten imágenes')])
    
    rules = TextAreaField('Reglas de la comunidad', 
                          validators=[Optional(), 
                                     Length(max=1000, message="Las reglas no pueden exceder 1000 caracteres")])
    
    is_public = SelectField('Visibilidad', 
                            choices=[('public', 'Pública - Cualquiera puede ver'), 
                                    ('private', 'Privada - Solo miembros')],
                            default='public')
    
    allow_public_join = SelectField('Permitir unirse', 
                                    choices=[('yes', 'Sí - Cualquiera puede solicitar unirse'), 
                                            ('no', 'No - Solo por invitación')],
                                    default='yes')