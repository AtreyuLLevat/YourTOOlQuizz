
from flask_wtf import FlaskForm
from wtforms import RadioField, SubmitField
from wtforms.validators import InputRequired


class Quizzproductividad(FlaskForm):


    q1 = RadioField(
        '1. ¿Para qué usarás principalmente la herramienta?',
        choices=[
            ('notion', 'Tomar notas, organizar ideas y crear bases de datos'),
            ('clickup', 'Coordinar tareas y proyectos con varias personas'),
            ('todoist', 'Hacer listas rápidas de pendientes y recordatorios'),
        ],
        validators=[InputRequired()]
    )

    q2 = RadioField(
        '2. ¿Cuánto te importa la personalización?',
        choices=[
            ('notion', 'Mucho, quiero diseñar mi espacio a mi manera'),
            ('clickup', 'Un poco, prefiero que ya esté estructurado'),
            ('todoist', 'Nada, solo quiero rapidez y simplicidad'),
        ],
        validators=[InputRequired()]
    )

    q3 = RadioField(
        '3. ¿Con cuántas personas trabajarás?',
        choices=[
            ('notion', 'Principalmente yo, quizá con alguien más'),
            ('clickup', 'Con un equipo grande de forma constante'),
            ('todoist', 'Solo yo'),
        ],
        validators=[InputRequired()]
    )

    q4 = RadioField(
        '4. ¿Qué tipo de vista prefieres para tus tareas?',
        choices=[
            ('notion', 'Tablas, páginas enlazadas y calendarios'),
            ('clickup', 'Tableros Kanban, diagramas de Gantt, listas y más'),
            ('todoist', 'Una lista simple con fechas y recordatorios'),
        ],
        validators=[InputRequired()]
    )

    q5 = RadioField(
        '5. ¿Qué tan detallado quieres que sea el seguimiento de tu trabajo?',
        choices=[
            ('notion', 'Quiero ver mis tareas con contexto y descripciones amplias'),
            ('clickup', 'Necesito medir progreso, plazos y responsables'),
            ('todoist', 'Solo quiero marcar tareas como hechas y seguir adelante'),
        ],
        validators=[InputRequired()]
    )

    submit = SubmitField('Enviar')
    submit = SubmitField('Ver mi resultado personalizado')
