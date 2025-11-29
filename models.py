from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy import event
import unicodedata, re
from sqlalchemy.dialects.postgresql import UUID, JSON
import uuid
from extensions import db

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
# MODELO DE APLICACIONES/EMPRESAS
# -------------------------
class App(db.Model):
    __tablename__ = "apps"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(150), unique=True, index=True, nullable=False)
    description = db.Column(db.Text)
    website_url = db.Column(db.String(300))
    logo_url = db.Column(db.String(300))
    category = db.Column(db.String(50))  # 'app', 'extension', 'tool', 'service'
    verification_required = db.Column(db.Boolean, default=True)
    is_public = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    
    # Relación con el dueño (empresa/desarrollador)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    # Relaciones
    owner = db.relationship("User", backref=db.backref("owned_apps", lazy=True))
    group_members = db.relationship("GroupMember", backref="app", lazy=True)
    group_messages = db.relationship("GroupMessage", backref="app", lazy=True)
    app_ratings = db.relationship("AppRating", backref="app", lazy=True)
    app_analytics = db.relationship("AppAnalytics", backref="app", lazy=True)

    def __repr__(self):
        return f"<App {self.name}>"

    @property
    def member_count(self):
        return GroupMember.query.filter_by(app_id=self.id, is_active=True).count()

    @property
    def average_rating(self):
        from sqlalchemy import func
        avg_rating = db.session.query(func.avg(AppRating.rating)).filter(
            AppRating.app_id == self.id
        ).scalar()
        return round(avg_rating, 1) if avg_rating else 0

# -------------------------
# MODELO DE MIEMBROS DEL GRUPO
# -------------------------
class GroupMember(db.Model):
    __tablename__ = "group_members"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    app_id = db.Column(UUID(as_uuid=True), db.ForeignKey("apps.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    # Verificación de uso real de la app
    is_verified = db.Column(db.Boolean, default=False)
    verification_method = db.Column(db.String(50))  # 'account_linking', 'cookie_tracking', 'manual'
    account_username = db.Column(db.String(150))  # Nombre de usuario en la app externa
    
    # Estadísticas de uso (provenientes de cookies/tracking)
    usage_count = db.Column(db.Integer, default=0)
    last_used_at = db.Column(db.DateTime)
    interests_data = db.Column(JSON)  # Datos de intereses del usuario
    
    is_active = db.Column(db.Boolean, default=True)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    user = db.relationship("User", backref=db.backref("group_memberships", lazy=True))

    def __repr__(self):
        return f"<GroupMember App={self.app_id} User={self.user_id}>"

# -------------------------
# MODELO DE MENSAJES GRUPALES
# -------------------------
class GroupMessage(db.Model):
    __tablename__ = "group_messages"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    app_id = db.Column(UUID(as_uuid=True), db.ForeignKey("apps.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    
    # Contenido del mensaje
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), default='user')  # 'user', 'admin', 'announcement', 'poll'
    
    # Para encuestas
    poll_question = db.Column(db.String(500))
    poll_options = db.Column(JSON)  # [{text: "Opción", votes: 0}, ...]
    
    # Metadatos
    is_pinned = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    
    # Relaciones
    user = db.relationship("User", backref=db.backref("group_messages", lazy=True))
    reactions = db.relationship("MessageReaction", backref="message", lazy=True)
    poll_votes = db.relationship("PollVote", backref="message", lazy=True)

    def __repr__(self):
        return f"<GroupMessage {self.id} Type={self.message_type}>"

# -------------------------
# MODELO DE REACCIONES A MENSAJES
# -------------------------
class MessageReaction(db.Model):
    __tablename__ = "message_reactions"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = db.Column(UUID(as_uuid=True), db.ForeignKey("group_messages.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    reaction_type = db.Column(db.String(20), nullable=False)  # 'like', 'love', 'helpful', 'question'
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación
    user = db.relationship("User", backref=db.backref("message_reactions", lazy=True))

    def __repr__(self):
        return f"<Reaction {self.reaction_type} on Message={self.message_id}>"

# -------------------------
# MODELO DE VOTOS EN ENCUESTAS
# -------------------------
class PollVote(db.Model):
    __tablename__ = "poll_votes"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    message_id = db.Column(UUID(as_uuid=True), db.ForeignKey("group_messages.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    option_index = db.Column(db.Integer, nullable=False)  # Índice de la opción seleccionada
    voted_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación
    user = db.relationship("User", backref=db.backref("poll_votes", lazy=True))

    def __repr__(self):
        return f"<PollVote User={self.user_id} Option={self.option_index}>"

# -------------------------
# MODELO DE VALORACIONES DE APPS
# -------------------------
class AppRating(db.Model):
    __tablename__ = "app_ratings"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    app_id = db.Column(UUID(as_uuid=True), db.ForeignKey("apps.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    rating = db.Column(db.Integer, nullable=False)  # 1-5 estrellas
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    
    # Relación
    user = db.relationship("User", backref=db.backref("app_ratings", lazy=True))

    def __repr__(self):
        return f"<AppRating {self.rating} stars for App={self.app_id}>"

# -------------------------
# MODELO DE ANALÍTICAS DE APPS
# -------------------------
class AppAnalytics(db.Model):
    __tablename__ = "app_analytics"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    app_id = db.Column(UUID(as_uuid=True), db.ForeignKey("apps.id"), nullable=False)
    date = db.Column(db.Date, nullable=False)
    
    # Métricas de engagement
    active_users = db.Column(db.Integer, default=0)
    new_members = db.Column(db.Integer, default=0)
    messages_sent = db.Column(db.Integer, default=0)
    polls_created = db.Column(db.Integer, default=0)
    total_reactions = db.Column(db.Integer, default=0)
    
    # Métricas de uso (de tracking)
    total_visits = db.Column(db.Integer, default=0)
    average_visit_duration = db.Column(db.Integer, default=0)  # en segundos
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<AppAnalytics App={self.app_id} Date={self.date}>"

# -------------------------
# MODELO DE USUARIOS (ACTUALIZADO)
# -------------------------
class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    avatar_url = db.Column(db.String(300))
    
    # Roles y permisos
    role = db.Column(db.String(20), default='user')  # 'user', 'admin', 'moderator'
    is_developer = db.Column(db.Boolean, default=False)
    
    # Autenticación externa
    supabase_id = db.Column(UUID(as_uuid=True), unique=True, nullable=True)
    stripe_customer_id = db.Column(db.String(100), unique=True)
    
    # Suscripción
    current_plan_id = db.Column(UUID(as_uuid=True), db.ForeignKey("plans.id"))
    plan_expiration = db.Column(db.DateTime)
    
    # Estado
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Preferencias
    notifications = db.Column(JSON, default=lambda: {
        "newsletters": True,
        "app_updates": True,
        "community_activity": False,
        "marketing": False
    })
    
    # Relaciones existentes (mantenidas para compatibilidad)
    quizzes = db.relationship("Quiz", backref="creator", lazy=True)
    results = db.relationship("Result", backref="user", lazy=True)
    current_plan = db.relationship("Plan", foreign_keys=[current_plan_id])
    user_plans = db.relationship("UserPlan", backref="user", lazy=True)
    
    # Nuevas relaciones para el sistema de grupos
    owned_apps = db.relationship("App", backref="owner_obj", lazy=True, foreign_keys=[App.owner_id])
    group_memberships = db.relationship("GroupMember", backref="member_user", lazy=True)
    group_messages = db.relationship("GroupMessage", backref="author", lazy=True)
    message_reactions = db.relationship("MessageReaction", backref="reacting_user", lazy=True)
    poll_votes = db.relationship("PollVote", backref="voting_user", lazy=True)
    app_ratings = db.relationship("AppRating", backref="rating_user", lazy=True)

    def __repr__(self):
        return f"<User {self.name} ({self.email})>"

    def is_app_admin(self, app_id):
        """Verifica si el usuario es admin de una app específica"""
        app = App.query.get(app_id)
        return app and app.owner_id == self.id

    def is_group_member(self, app_id):
        """Verifica si el usuario es miembro de un grupo"""
        return GroupMember.query.filter_by(
            app_id=app_id, 
            user_id=self.id, 
            is_active=True
        ).first() is not None

# -------------------------
# MODELOS EXISTENTES (MANTENIDOS PARA COMPATIBILIDAD)
# -------------------------

class SecurityLog(db.Model):
    __tablename__ = "security_logs"
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(255), nullable=False)
    event = db.Column(db.String(255), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    ip_address = db.Column(db.String(100))

class Plan(db.Model):
    __tablename__ = "plans"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = db.Column(db.String(100), nullable=False)
    stripe_price_id = db.Column(db.String(100), nullable=False)
    duracion_dias = db.Column(db.Integer, nullable=False)
    precio = db.Column(db.Numeric(10, 2), nullable=False)
    descripcion = db.Column(db.Text)
    creado_en = db.Column(db.DateTime, default=datetime.utcnow)
    user_plans = db.relationship("UserPlan", backref="plan", lazy=True)

    def __repr__(self):
        return f"<Plan {self.nombre}>"

class UserPlan(db.Model):
    __tablename__ = "user_plans"
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    plan_id = db.Column(UUID(as_uuid=True), db.ForeignKey("plans.id"), nullable=False)
    stripe_subscription_id = db.Column(db.String(100))
    fecha_inicio = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_fin = db.Column(db.DateTime)
    dinero_gastado = db.Column(db.Numeric(10, 2))
    renewal_date = db.Column(db.DateTime, nullable=False)
    estado = db.Column(db.String(20), default="activo")

    def __repr__(self):
        return f"<UserPlan User={self.user_id} Plan={self.plan_id}>"

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

    def __repr__(self):
        return f"<QuizAnalytics Quiz={self.quiz_id} User={self.user_id}>"

class Quiz(db.Model):
    __tablename__ = "quizzes"
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(150), nullable=False)
    contenido = db.Column(db.String(300))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    keywords = db.Column(db.String(300), nullable=True)
    slug = db.Column(db.String(200), unique=True, index=True, nullable=True)
    image_url = db.Column(db.String(300), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    questions = db.relationship("Question", backref="quiz", lazy=True)
    results = db.relationship("Result", backref="quiz", lazy=True)
    analytics = db.relationship("QuizAnalytics", backref="quiz", lazy=True)

    def __repr__(self):
        return f"<Quiz {self.titulo}>"

class Question(db.Model):
    __tablename__ = "questions"
    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False)
    answer = db.Column(db.String(200), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"), nullable=False)

    def __repr__(self):
        return f"<Question {self.text[:20]}...>"

class Result(db.Model):
    __tablename__ = "results"
    id = db.Column(db.Integer, primary_key=True)
    score = db.Column(db.Integer, nullable=False)
    completed_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey("quizzes.id"), nullable=False)

    def __repr__(self):
        return f"<Result User={self.user_id} Quiz={self.quiz_id} Score={self.score}>"

class Blog(db.Model):
    __tablename__ = "blogst"
    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(200), nullable=False)
    contenido = db.Column(db.Text, nullable=False)
    keywords = db.Column(db.String(300), nullable=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    slug = db.Column(db.String(200), unique=True, index=True, nullable=True)
    image_url = db.Column(db.String(300), nullable=True)
    autor = db.relationship("User", backref=db.backref("blogst", lazy=True))

    def __repr__(self):
        return f"<Blog {self.titulo}>"

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
# EVENTOS PARA SLUGS AUTOMÁTICOS
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

@event.listens_for(App, "before_insert")
def app_before_insert(mapper, connection, target):
    if not getattr(target, "slug", None):
        base = slugify(target.name)
        target.slug = unique_slug(App, base)