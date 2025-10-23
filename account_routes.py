from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from supabase import create_client
import os

account_bp = Blueprint("account", __name__, url_prefix="/account")

@account_bp.route("/", methods=["GET"])
@login_required
def dashboard():
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    response = supabase.table("users").select("*").eq("email", current_user.email).single().execute()
    usuario = response.data if response.data else {}
    return render_template("account.html", usuario=usuario)

@account_bp.route("/change_password", methods=["POST"])
@login_required
def change_password():
    data = request.get_json()
    current_password = data.get("current_password")
    new_password = data.get("new_password")

    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    try:
        # Verificar contraseña actual
        user = supabase.auth.sign_in_with_password({
            "email": current_user.email,
            "password": current_password
        })
    except Exception as e:
        print("❌ Error de autenticación:", e)
        return jsonify({"error": "Contraseña actual incorrecta"}), 400

    if not user.user:
        return jsonify({"error": "Contraseña actual incorrecta"}), 400

    # Actualizar contraseña usando el servicio admin
    try:
        result = supabase.auth.admin.update_user_by_id(user.user.id, {"password": new_password})
        if result.user:
            return jsonify({"message": "Contraseña actualizada correctamente"}), 200
        else:
            return jsonify({"error": "Error al actualizar la contraseña"}), 500
    except Exception as e:
        print("❌ Error al actualizar contraseña:", e)
        return jsonify({"error": "Error interno al actualizar la contraseña"}), 500
