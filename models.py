from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from sqlalchemy import event
import unicodedata, re
from sqlalchemy.dialects.postgresql import UUID, JSON
import uuid
from extensions import db
from sqlalchemy import Column, String, Date, DateTime, ForeignKey, func

# -------------------------
# Funciones para slug
# -------------------------
def slugify(text):
    text = unicodedata.normalize('NFKD', text or '').encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^a-zA-Z0-9]+', '-', text).strip('-').lower()
    return text or 'item'

def unique_slug(model, base_slug):
    slug = base_slug
    i = 2
    while model.query.filter_by(slug=slug).first() is not None:
        slug = f"{base_slug}-{i}"
        i += 1
    return slug

# -------------------------
# MODELO DE USUARIOS (SIMPLIFICADO)
# -------------------------

class SupabaseApp(db.Model):
    __tablename__ = "supabase_apps"

    # Primary Key
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Campos de la app
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))
    team = db.Column(db.Text)
    theme = db.Column(db.String(100))
    creation_date = db.Column(Date)
    status = db.Column(db.String(50))
    official_id = db.Column(db.String(200))

    # Usuario que la creó (FK a supabase_id del usuario)
    created_by = db.Column(UUID(as_uuid=True), ForeignKey("users.supabase_id"), nullable=False)

    # Timestamp de creación
    created_at = db.Column(DateTime, server_default=func.now())

    def __repr__(self):
        return f"<SupabaseApp {self.name} (Created by {self.created_by})>"

class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    avatar_url = db.Column(db.String(300))
    role = db.Column(db.String(20), default='user')
    is_developer = db.Column(db.Boolean, default=False)
    supabase_id = db.Column(UUID(as_uuid=True), unique=True, nullable=True)
    stripe_customer_id = db.Column(db.String(100), unique=True)
    current_plan_id = db.Column(UUID(as_uuid=True), db.ForeignKey("plans.id"))
    plan_expiration = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notifications = db.Column(JSON, default=lambda: {
        "newsletters": True,
        "app_updates": True,
        "community_activity": False,
        "marketing": False
    })

    def __repr__(self):
        return f"<User {self.name} ({self.email})>"

# -------------------------
# MODELO DE APLICACIONES
# -------------------------
class App(db.Model):
    __tablename__ = "apps"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Campos del formulario
    name = db.Column(db.String(100), nullable=False)              # appName
    slug = db.Column(db.String(150), unique=True, index=True, nullable=False)
    description = db.Column(db.Text)                              # appDescription
    team = db.Column(db.String(200))                               # appTeam
    theme = db.Column(db.String(100))                              # appTheme
    creation_date = db.Column(db.DateTime)                         # appCreationDate
    status = db.Column(db.String(50))                              # appStatus
    official_id = db.Column(db.String(100))                        # appOfficialId
    image_url = db.Column(db.String(300)) 
    team_members = db.relationship("TeamMember", back_populates="app", cascade="all, delete-orphan")
    tags = db.relationship("Tag", backref="app", cascade="all, delete-orphan")
    reviews = db.relationship("Review", backref="app", cascade="all, delete-orphan")
                         # appImage

    # Campos adicionales de la tabla original
    verification_required = db.Column(db.Boolean, default=True)
    is_public = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)
    owner_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)

    # Relaciones
    owner = db.relationship("User", foreign_keys=[owner_id])
    group_members = db.relationship("GroupMember", back_populates="app")
    group_messages = db.relationship("GroupMessage", back_populates="app")

    def __repr__(self):
        return f"<App {self.name}>"

class TeamMember(db.Model):
    __tablename__ = "team_members"

    id = db.Column(db.Integer, primary_key=True)
    app_id = db.Column(UUID(as_uuid=True), db.ForeignKey("apps.id"), nullable=False)

    name = db.Column(db.String(100), nullable=False)
    role = db.Column(db.String(100))
    avatar_url = db.Column(db.String(300))

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    app = db.relationship("App", back_populates="team_members")


class Tag(db.Model):
    __tablename__ = "tags"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)


class AppTag(db.Model):
    __tablename__ = "app_tags"

    id = db.Column(db.Integer, primary_key=True)
    app_id = db.Column(UUID(as_uuid=True), db.ForeignKey("apps.id"), nullable=False)
    tag_id = db.Column(db.Integer, db.ForeignKey("tags.id"), nullable=False)

    app = db.relationship("App", backref="app_tags")
    tag = db.relationship("Tag")



class Review(db.Model):
    __tablename__ = "reviews"

    id = db.Column(db.Integer, primary_key=True)
    app_id = db.Column(UUID(as_uuid=True), db.ForeignKey("apps.id"))
    content = db.Column(db.Text)
    rating = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# -------------------------
# MODELO DE MIEMBROS DEL GRUPO
# -------------------------
class GroupMember(db.Model):
    __tablename__ = "group_members"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    app_id = db.Column(UUID(as_uuid=True), db.ForeignKey("apps.id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)
    verification_method = db.Column(db.String(50))
    account_username = db.Column(db.String(150))
    usage_count = db.Column(db.Integer, default=0)
    last_used_at = db.Column(db.DateTime)
    interests_data = db.Column(JSON)
    is_active = db.Column(db.Boolean, default=True)
    joined_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relaciones usando back_populates
    app = db.relationship("App", back_populates="group_members")
    user = db.relationship("User")

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
    content = db.Column(db.Text, nullable=False)
    message_type = db.Column(db.String(20), default='user')
    poll_question = db.Column(db.String(500))
    poll_options = db.Column(JSON)
    is_pinned = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    # Relaciones usando back_populates
    app = db.relationship("App", back_populates="group_messages")
    user = db.relationship("User")

    def __repr__(self):
        return f"<GroupMessage {self.id} Type={self.message_type}>"

# -------------------------
# MODELOS EXISTENTES (MANTENIDOS)
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

class Chat(db.Model):
    __tablename__ = "chats"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title = db.Column(db.String(200), default="Nuevo chat")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User")

    def __repr__(self):
        return f"<Chat {self.id} Title={self.title}>"

# -------------------------
# MODELO DE MENSAJES DEL CHAT
# -------------------------
class Message(db.Model):
    __tablename__ = "messages"

    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    chat_id = db.Column(UUID(as_uuid=True), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    sender_name = db.Column(db.String(150), nullable=False)
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, onupdate=datetime.utcnow)

    # Relación con usuario
    user = db.relationship("User")

    def __repr__(self):
        return f"<Message {self.id} Chat={self.chat_id} User={self.user_id}>"


# -------------------------
# EVENTOS PARA SLUGS
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