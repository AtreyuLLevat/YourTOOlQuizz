from flask import Flask, render_template, request, redirect, url_for

app = Flask(__name__)

# Página principal: el quiz
@app.route('/')
def YourToolQuizz():
    return render_template('YourToolQuizz.html')

@app.route('/result', methods=['POST'])
def result():
    answers = [
        request.form.get('q1'),
        request.form.get('q2'),
        request.form.get('q3'),
        request.form.get('q4'),
        request.form.get('q5'),
        request.form.get('q6'),
    ]

    scores = {
        'todoist': 0,
        'systeme': 0,
        'semrush': 0,
        'notion': 0,
        'canva': 0
    }

    for answer in answers:
        if answer in scores:
            scores[answer] += 1

    best_tool = max(scores, key=scores.get)

    tool_data = {
        'todoist': {
            'name': 'Todoist',
            'url': 'https://affiliate.todoist.com',
            'features': [
                'Gestión de tareas sencilla',
                'Integración con apps de calendario',
                'App para móvil y escritorio',
                'Ideal para uso personal y trabajo',
                'Colaboración en equipo',
                'Interfaz limpia',
                'Soporte por etiquetas y prioridades',
                'Recordatorios inteligentes',
                'Automatización básica',
                'Sincronización en la nube'
            ]
        },
        'systeme': {
            'name': 'Systeme.io',
            'url': 'https://systeme.io/?ref=tu-link',
            'features': [
                'Plataforma todo en uno',
                'Automatizaciones de marketing',
                'Email marketing integrado',
                'Landing pages fáciles',
                'Gestión de cursos online',
                'CRM incluido',
                'Funnel builder',
                'Afiliación integrada',
                'Planes gratuitos disponibles',
                'Soporte técnico eficiente'
            ]
        },
        'semrush': {
            'name': 'Semrush',
            'url': 'https://es.semrush.com/?ref=afiliado',
            'features': [
                'Investigación de palabras clave',
                'Auditoría SEO completa',
                'Análisis de competencia',
                'Seguimiento de rankings',
                'Marketing de contenidos',
                'Publicidad de pago (PPC)',
                'Backlink analysis',
                'Informes automáticos',
                'Herramientas de redes sociales',
                'Datos en tiempo real'
            ]
        },
        'notion': {
            'name': 'Notion',
            'url': 'https://www.notion.so/product?ref=afiliado',
            'features': [
                'Organización de información',
                'Plantillas de productividad',
                'Gestión de proyectos',
                'Soporte para bases de datos',
                'Toma de notas integrada',
                'Colaboración en tiempo real',
                'Aplicaciones móviles',
                'Interfaz visual moderna',
                'Integraciones con terceros',
                'Versión gratuita completa'
            ]
        },
        'canva': {
            'name': 'Canva',
            'url': 'https://partner.canva.com/tu-link',
            'features': [
                'Diseño gráfico fácil',
                'Miles de plantillas',
                'Editor arrastrar y soltar',
                'Integración con redes sociales',
                'Creación de logos, posters, etc.',
                'Banco de imágenes gratuito',
                'Colaboración en equipo',
                'Exportación rápida',
                'Compatible con móviles',
                'Ideal para emprendedores'
            ]
        }
    }

    return render_template('result.html', tool=tool_data[best_tool])

# Sobre Nosotros
@app.route('/about')
def about():
    return render_template('about.html')

# Aviso Legal
@app.route('/legal')
def legal():
    return render_template('legal.html')

# Resultados posibles
@app.route('/Resultadosposibles')
def Resultadosposibles():
    return render_template('Resultadosposibles.html')

# Contáctanos - GET para mostrar formulario, POST para procesarlo
@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        nombre = request.form.get('nombre')
        correo = request.form.get('correo')
        mensaje = request.form.get('mensaje')
        print(f"Mensaje de {nombre} ({correo}): {mensaje}")
        return redirect(url_for('thank_you'))
    return render_template('contact.html')

# Página de agradecimiento después de enviar el formulario
@app.route('/thank-you')
def thank_you():
    return "<h1>¡Gracias por contactarnos! Te responderemos pronto.</h1>"

# Ejecutar la aplicación
if __name__ == '__main__':
    app.run(debug=True)
