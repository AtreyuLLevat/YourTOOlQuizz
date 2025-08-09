from flask_wtf import FlaskForm
from wtforms import RadioField, SubmitField
from wtforms.validators import InputRequired

class Quizantivirus(FlaskForm):
    q1 = RadioField('1. ¿Qué nivel de protección buscas para tus datos y sistemas?', 
                    choices=[
                        ('panda', 'Protección básica contra virus y malware'),
                        ('x', 'Detección inteligente de amenazas en segundo plano'),
                        ('x', 'Protección contra ransomware y exploits avanzados'),
                        ('z', 'Módulos separados para banca, navegación y correos maliciosos'),
                        ('z', 'Protección completa con firewall, VPN y backup en la nube'),
                        ('z', 'Defensa contra suplantación de identidad y seguimiento online'),
                    ],
                    validators=[InputRequired()])
    
    q2 = RadioField('2. ¿Qué tanto te importa el efecto del antivirus al rendimiento de tu equipo?', 
                    choices=[
                        ('panda', 'Necesito que consuma lo mínimo posible'),
                        ('x', 'Busco el equilibrio entre protección y velocidad'),
                        ('z', 'Uso un equipo potente, así que no me importa si consume más'),
                    ],
                    validators=[InputRequired()])

    q3 = RadioField('3. ¿Te gustaría tener funciones extra integradas?', 
                    choices=[
                        ('panda', 'Solo quiero antivirus, lo más simple posible'),
                        ('x', 'Quiero protección contra ransomware y gestión de contraseñas'),
                        ('z', 'Quiero una VPN ilimitada, control parental y respaldo en la nube'),
                        ('z', 'Me interesa protección contra robo de identidad y monitoreo de la Dark Web'),
                    ],
                    validators=[InputRequired()])

    q4 = RadioField('4. ¿Qué tan preocupado estás por el secuestro o pérdida de datos (ransomware, borrado, etc.)?', 
                    choices=[
                        ('panda', 'No manejo información importante, así que confío en que el antivirus básico me protegerá'),
                        ('x', 'Me preocupa el ransomware y quiero una protección específica contra él'),
                        ('z', 'Quiero protección avanzada contra pérdida de datos con respaldo en la nube'),
                    ],
                    validators=[InputRequired()])

    q5 = RadioField('5. ¿Qué valoras más al elegir un antivirus?', 
                    choices=[
                        ('panda', 'Que lo pueda instalar y olvidar'),
                        ('x', 'Que me ofrezca defensa proactiva contra amenazas nuevas'),
                        ('z', 'Que me proteja incluso fuera del antivirus, como identidad y privacidad'),
                    ],
                    validators=[InputRequired()])
    
    submit = SubmitField('Ver mi resultado personalizado')
