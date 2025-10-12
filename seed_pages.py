
from app import create_app

from models import db, Page, slugify, unique_slug
app = create_app()

pages = [
    {
        "name": "about",
        "title": "Sobre Nosotros",
        "description": "¿Quién somos y por qué estamos aquí?",
        "content": "<p>Esta es la pagina que se describe lo que es la web.</p>"
    },

    {
        "name": "Servicio_1",
        "title": "Planes y precios",
        "description": "Consulta nuestras tarifas y opciones disponibles",
        "content": "<ul><li>Plan Básico</li><li>Plan Pro</li><li>Plan Empresarial</li></ul>"
    },
    {
        "name": "Contact",
        "title": "Contacto",
        "description": "Ponte en contacto con nosotros",
        "content": "<p>Correo: contacto@tuempresa.com<br>Teléfono: +34 600 000 000</p>"
    },
    {
        "name": "Legal",
        "title": "Aviso Legal y Política de Privacidad",
        "description": "Información legal y de privacidad",
        "content": "<p>Información legal y de privacidad.</p>"
    },

    {
        "name": "dashboard",
        "title": "Perfil",
        "description": "Tu perfil de usuario",
        "content": "<p>Tu perfil de usuario.</p>"
    },
]


with app.app_context():
    for p in pages:
        base = slugify(p["name"])
        slug = unique_slug(Page, base)
        if not Page.query.filter_by(slug=slug).first():
            page = Page(name=p["name"], slug=slug, title=p["title"],
                        description=p["description"], content=p["content"])
            db.session.add(page)
    db.session.commit()
=======
from app import create_app

from models import db, Page, slugify, unique_slug
app = create_app()

pages = [
    {
        "name": "about",
        "title": "Sobre Nosotros",
        "description": "¿Quién somos y por qué estamos aquí?",
        "content": "<p>Esta es la pagina que se describe lo que es la web.</p>"
    },
    {
        "name": "Blogejemplo",
        "title": "Blog de ejemplo",
        "description": "Blog de ejemplo para demostrar la funcionalidad del producto.",
        "content": "<p>Blog de ejemplo para demostrar la funcionalidad del producto.</p>"
    },
    {
        "name": "Servicio_1",
        "title": "Planes y precios",
        "description": "Consulta nuestras tarifas y opciones disponibles",
        "content": "<ul><li>Plan Básico</li><li>Plan Pro</li><li>Plan Empresarial</li></ul>"
    },
    {
        "name": "Contact",
        "title": "Contacto",
        "description": "Ponte en contacto con nosotros",
        "content": "<p>Correo: contacto@tuempresa.com<br>Teléfono: +34 600 000 000</p>"
    },
    {
        "name": "Legal",
        "title": "Aviso Legal y Política de Privacidad",
        "description": "Información legal y de privacidad",
        "content": "<p>Información legal y de privacidad.</p>"
    },
    {
        "name": "Quizz de ejemplo",
        "title": "Quizz de ejemplo",
        "description": "Evalúa nuestro producto estrella con nuestro quizz de ejemplo",
        "content": "<p>Evalúa nuestro producto estrella con nuestro quizz de ejemplo</p>"
    },
    {
        "name": "dashboard",
        "title": "Perfil",
        "description": "Tu perfil de usuario",
        "content": "<p>Tu perfil de usuario.</p>"
    },
]


with app.app_context():
    for p in pages:
        base = slugify(p["name"])
        slug = unique_slug(Page, base)
        if not Page.query.filter_by(slug=slug).first():
            page = Page(name=p["name"], slug=slug, title=p["title"],
                        description=p["description"], content=p["content"])
            db.session.add(page)
    db.session.commit()
>>>>>>> ec1e43cfb7f709d6f69ef6f58ce66c05937cf404
    print("✅ Páginas creadas correctamente en la base de datos.")