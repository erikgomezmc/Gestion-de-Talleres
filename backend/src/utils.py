from functools import wraps
from typing import Any, Callable

import jwt
from flask import g, jsonify, request

from src.config import settings
from src.db import get_user_by_username


def error_response(message: str, status_code: int):
    response = jsonify({"error": message})
    response.status_code = status_code
    return response


def create_token(user: dict) -> str:
    payload = {
        "sub": user["username"],
        "name": user["name"],
        "role": user["role"],
        "email": user["email"],
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm="HS256")


def get_token_from_request():
    authorization = request.headers.get("Authorization", "")
    if not authorization:
        return None
    parts = authorization.split(" ", 1)
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None
    return parts[1].strip()


def require_auth(permission_roles=None):
    permission_roles = permission_roles or []

    def decorator(func: Callable[..., Any]):
        @wraps(func)
        def wrapped(*args, **kwargs):
            token = get_token_from_request()
            if not token:
                return error_response("Se requiere un token de acceso.", 401)

            try:
                payload = jwt.decode(token, settings.JWT_SECRET, algorithms=["HS256"])
            except jwt.ExpiredSignatureError:
                return error_response("La sesión expiró. Inicia sesión nuevamente.", 401)
            except jwt.InvalidTokenError:
                return error_response("Token inválido.", 401)

            user = get_user_by_username(payload.get("sub", ""))
            if not user:
                return error_response("Usuario no encontrado.", 401)

            g.current_user = user
            if permission_roles and user["role"] not in permission_roles:
                return error_response("No tienes permisos para realizar esta acción.", 403)
            return func(*args, **kwargs)

        return wrapped

    return decorator
