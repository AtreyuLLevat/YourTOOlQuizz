# models.py
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f"<User {self.email}>"

        # models.py
from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime

db = SQLAlchemy()

# -------------------------
# MODELO DE USUARIOS
# -------------------------
class User(UserMixin, db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
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
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.String(300))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    questions = db.relationship("Question", backref="quiz", lazy=True)
    results = db.relationship("Result", backref="quiz", lazy=True)

    def __repr__(self):
        return f"<Quiz {self.title}>"


# -------------------------
# MODELO DE PREGUNTAS
# -------------------------
class Question(db.Model):
    __tablename__ = "questions"

    id = db.Column(db.Integer, primary_key=True)
    text = db.Column(db.String(500), nullable=False)
    answer = db.Column(db.String(200), nullable=False)  # respuesta correcta

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

