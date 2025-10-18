from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy import event
import unicodedata, re
from sqlalchemy.dialects.postgresql import UUID
import uuid

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

class Page(db.Model):
    __tablename__ = "pages"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    slug = db.Column(db.String(150), unique=True, index=True, nullable=False)
    title = db.Column(db.String(200), nullable=True)
    description = db.Column(db.Text, nullable=True)
    content = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Page {self.name}>"

# -------------------------
# MODELO DE USUARIOS
# -------------------------
class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    supabase_id = db.Column(UUID(as_uuid=True), unique=True, nullable=True)
    otp_secret = db.Column(db.String(32), nullable=False)  # 🔐 Clave 2FA obligatoria
    stripe_customer_id = db.Column(db.String(100), unique=True)
    current_plan_id = db.Column(UUID(as_uuid=True), db.ForeignKey("plans.id"))
    plan_expiration = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    quizzes = db.relationship("Quiz", backref="creator", lazy=True)
    results = db.relationship("Result", backref="user", lazy=True)
    current_plan = db.relationship("Plan", foreign_keys=[current_plan_id])
    user_plans = db.relationship("UserPlan", backref="user", lazy=True)

    def __repr__(self):
        return f"<User {self.email}>"


class Plan(db.Model):
    __tablename__ = "plans"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = db.Column(db.String(100), nullable=False)
    stripe_price_id = db.Column(db.String(100), nullable=False)
    duracion_dias = db.Column(db.Integer, nullable=False)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    descripcion = db.Column(db.Text)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)

class UserPlan(db.Model):
    __tablename__ = "user_plans"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    plan_id = db.Column(UUID(as_uuid=True), db.ForeignKey("plans.id"), nullable=False)
    stripe_subscription_id = db.Column(db.String(100))
    fecha_inicio = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_fin = db.Column(db.DateTime)
    dinero_gastado = db.Column(db.Numeric(10, 2))
    estado = db.Column(db.String(20), default="activo")

class QuizAnalytics(db.Model):
    __tablename__ = "quiz_analytics"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"))
    plan_id = db.Column(UUID(as_uuid=True), db.ForeignKey("plans.id"))
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"))
    clicks = db.Column(db.Integer, default=0)
    impresiones = db.Column(db.Integer, default=0)
    ctr = db.Column(db.Numeric(5, 2))
    imagenes_usadas = db.Column(db.JSON)
    fecha = db.Column(db.DateTime, default=datetime.utcnow)

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
    image_url = db.Column(db.String(300), nullable=True)
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
    image_url = db.Column(db.String(300), nullable=True)
    
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
