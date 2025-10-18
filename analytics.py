from flask import Blueprint, request, jsonify
from models import db, QuizAnalytics, Quiz
from sqlalchemy import func

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route("/api/estadisticas-quizzes", methods=["POST"])
def estadisticas_quizzes():
    data = request.get_json()
    user_id = data.get("user_id")

    if not user_id:
        return jsonify({"error": "Falta user_id"}), 400

    # Consultar estadísticas agregadas por quiz
    resultados = (
        db.session.query(
            Quiz.id.label("quiz_id"),
            Quiz.titulo.label("quiz_titulo"),
            func.sum(QuizAnalytics.impresiones).label("impresiones"),
            func.sum(QuizAnalytics.clicks).label("clicks"),
            (func.sum(QuizAnalytics.clicks) / func.nullif(func.sum(QuizAnalytics.impresiones), 0) * 100).label("ctr")
        )
        .join(Quiz, Quiz.id == QuizAnalytics.quiz_id)
        .filter(QuizAnalytics.user_id == user_id)
        .group_by(Quiz.id, Quiz.titulo)
        .all()
    )

    data = [
        {
            "quiz_id": r.quiz_id,
            "titulo": r.quiz_titulo,
            "impresiones": int(r.impresiones or 0),
            "clicks": int(r.clicks or 0),
            "ctr": round(float(r.ctr or 0), 2),
        }
        for r in resultados
    ]

    return jsonify(data)