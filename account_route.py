
from flask import Blueprint, render_template, request, jsonify
from flask_login import login_required, current_user
from supabase import create_client
import os
import supabase

account_bp = Blueprint("account", __name__, url_prefix="/account")


# si tienes el cliente supabase inicializado:
# from app import supabase_client

@account_bp.route('/api/sync-user', methods=['POST'])
def sync_user():
    data = request.json
    # procesar sincronización con base de datos local si la tienes
    return jsonify({"status": "ok"})

@account_bp.route("/")
@login_required
def dashboard():
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    response = supabase.table("users").select("*").eq("email", current_user.email).single().execute()
    usuario = response.data if response.data else {}

    return render_template("account.html", usuario=usuario)
