from flask import Blueprint, g, jsonify, request

from src.db import get_user_by_username
from src.limiter import limiter
from src.utils import create_token, error_response, require_auth

auth_bp = Blueprint("auth", __name__)


def serialize_user(user):
    return {
        "name": user["name"],
        "username": user["username"],
        "email": user["email"],
        "role": user["role"],
    }


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    payload = request.get_json(silent=True) or {}
    username = (payload.get("username") or "").strip()
    password = payload.get("password") or ""

    if not username or not password:
        return error_response("Ingresa tu usuario y contraseña para continuar.", 400)

    user = get_user_by_username(username)
    if not user:
        return error_response("Usuario o contraseña incorrectos.", 401)

    from src.db import _hash_password

    if _hash_password(password) != user["password_hash"]:
        return error_response("Usuario o contraseña incorrectos.", 401)

    user_data = serialize_user(user)
    user_data["token"] = create_token(user)
    return jsonify(user_data)


@auth_bp.route("/me", methods=["GET"])
@require_auth()
def me():
    return jsonify(serialize_user(g.current_user))


@auth_bp.route("/logout", methods=["POST"])
@require_auth()
def logout():
    return jsonify({"message": "Sesión cerrada correctamente."})
