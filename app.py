# -*- coding: utf-8 -*-
from flask import Flask, render_template, request, redirect, url_for, flash
from flask_mail import Mail, Message
from email.header import Header

app = Flask(__name__)
app.secret_key = 'clave_secreta_segura'

# Configuración de Flask-Mail (ejemplo con Gmail)
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = 'tuemail@gmail.com'       # Sustituye por tu email
app.config['MAIL_PASSWORD'] = 'tu_contraseña_app'       # Sustituye por tu contraseña de aplicación

mail = Mail(app)

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
    ]

    scores = {
        'y': 0,
        'x': 0,
        'z': 0,
    }

    for answer in answers:
        if answer in scores:
            scores[answer] += 1

    best_tool = max(scores, key=scores.get)

    tool_data = {
        'y': {
            'name': 'y',
            'url': 'https://yourtoolquizz-5u2ht.ondigitalocean.app/',
            'features': [
                'Antivirus muy ligero y automatizado. Impacto bajo en el rendimiento',
                'Interfaz simple e intuitiva para principiantes',
                'Pocas opciones de configuración, personalización sencilla',
                'Modo de emergencia USB',
                'Protección a tiempo real',
                'Protección Wi-Fi',
                'VPN integrada (a partir del plan Advanced)',
                'Antiphishing y protección web',
                'Modo Gaming/Multimedia',
                'Dark Web Monitor (Plan Premium)',
            ]
        },
        'x': {
            'name': 'x',
            'url': 'https://yourtoolquizz-5u2ht.ondigitalocean.app/',
            'features': [
                'Altísima tasa de detección de malware y ransomware',
                'Protección en tiempo real avanzada con IA',
                'Impacto bajo en el rendimiento',
                'Múltiples capas de defensa contra ransomware',
                'Módulo de banca segura incluso en el navegador',
                'Gestor de contraseñas integrado',
                'Navegador protegido',
                'Firewall avanzado y control de red',
                'VPN integrada',
                'Protección de identidad',
                'Ad Blocker y anti-tracker en todo el sistema',
            ]
        },
        'z': {
            'name': 'z',
            'url': 'https://yourtoolquizz-5u2ht.ondigitalocean.app/',
            'features': [
                'Protección total todo en uno',
                'Dark web monitoring (a partir del plan Deluxe)',
                'Gestor de contraseñas',
                'Conexión VPN privada (desde plan Estándar)',
                'Copia de seguridad en la nube (10 GB)',
                'Asistencia para restauración de identidad (Plan Advanced)',
                'Asistencia por robo de billetera (Plan Advanced)',
                'Monitoreo de redes sociales (Plan Advanced)',
            ]
        },
    }

    return render_template('result.html', tool=tool_data[best_tool])

@app.route('/about')
def about():
    return render_template('about.html')

@app.route('/Inicio')
def Inicio():
    return render_template('Inicio.html')

@app.route('/legal')
def legal():
    return render_template('legal.html')

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        nombre = request.form.get('nombre')
        correo = request.form.get('correo')
        mensaje = request.form.get('mensaje')

        from email.header import Header
        subject = Header(f"Nuevo mensaje de {nombre}", 'utf-8').encode()



        msg = Message(
            subject=subject,
            sender=app.config['MAIL_USERNAME'],
            recipients=['atreyulaguilera@gmail.com']
        )
        msg.body = f"De: {nombre} <{correo}>\n\nMensaje:\n{mensaje}"

        try:
            mail.send(msg)
            flash('¡Mensaje enviado correctamente!', 'success')
            return redirect(url_for('thank_you'))
        except Exception as e:
            flash(f'Error al enviar el mensaje: {str(e)}', 'error')
            return redirect(url_for('thank_you'))

    return render_template('contact.html')

@app.route('/thank_you')
def thank_you():
    return render_template('Error.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))  # Puerto proporcionado por DigitalOcean
    app.run(host='0.0.0.0', port=port, debug=True)  # Acepta conexiones externas