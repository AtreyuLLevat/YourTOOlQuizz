from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy import event
import unicodedata, re

db = SQLAlchemy()

# -------------------------
# Funciones para slug
# -------------------------
def slugify(text):
    """Convierte texto a un slug web-friendly"""
    text = unicodedata.normalize('NFKD', text or '').encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^a-zA-Z0-9]+', '-', text).strip('-').lower()
    return text or 'item'

def unique_slug(model, base_slug):
    """Genera un slug único para un modelo dado"""
    slug = base_slug
    i = 2
    while model.query.filter_by(slug=slug).first() is not None:
        slug = f"{base_slug}-{i}"
        i += 1
    return slug

# -------------------------
# MODELO DE USUARIOS
# -------------------------
class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    otp_secret = db.Column(db.String(32), nullable=False)  # 🔐 Clave 2FA obligatoria
    quizzes = db.relationship("Quiz", backref="creator", lazy=True)
    results = db.relationship("Result", backref="user", lazy=True)

    def __repr__(self):
        return f"<User {self.email}>"

# -------------------------
# MODELO DE QUIZZES
# -------------------------
class Quiz(db.Model):
    __tablename__ = "quizzes"

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(150), nullable=False)
    contenido = db.Column(db.String(300))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    keywords = db.Column(db.String(300), nullable=True)
    slug = db.Column(db.String(200), unique=True, index=True, nullable=True)  # Nuevo campo slug

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    questions = db.relationship("Question", backref="quiz", lazy=True)
    results = db.relationship("Result", backref="quiz", lazy=True)

    def __repr__(self):
        return f"<Quiz {self.titulo}>"

# -------------------------
# MODELO DE PREGUNTAS
# -------------------------
class Question(db.Model):
    __tablename__ = "questions"

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False)
    answer = db.Column(db.String(200), nullable=False)

    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"), nullable=False)

    def __repr__(self):
        return f"<Question {self.text[:20]}...>"

# -------------------------
# MODELO DE RESULTADOS
# -------------------------
class Result(db.Model):
    __tablename__ = "results"

    id = db.Column(db.Integer, primary_key=True)
    score = db.Column(db.Integer, nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"), nullable=False)

    def __repr__(self):
        return f"<Result User={self.user_id} Quiz={self.quiz_id} Score={self.score}>"

# -------------------------
# MODELO DE BLOGS
# -------------------------
class Blog(db.Model):
    __tablename__ = 'blogst'
    
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    keywords = db.Column(db.String(300), nullable=True)  # Coma-separadas
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    slug = db.Column(db.String(200), unique=True, index=True, nullable=True)  # Nuevo campo slug

    
    autor = db.relationship('User', backref=db.backref('blogst', lazy=True))
    
    def __repr__(self):
        return f"<Blog {self.titulo}>"

# -------------------------
# EVENTOS PARA CREAR SLUGS AUTOMÁTICOS
# -------------------------
@event.listens_for(Quiz, "before_insert")
def quiz_before_insert(mapper, connection, target):
    if not getattr(target, "slug", None):
        base = slugify(target.titulo)
        target.slug = unique_slug(Quiz, base)

@event.listens_for(Blog, "before_insert")
def blog_before_insert(mapper, connection, target):
    if not getattr(target, "slug", None):
        base = slugify(target.titulo)
        target.slug = unique_slug(Blog, base)
