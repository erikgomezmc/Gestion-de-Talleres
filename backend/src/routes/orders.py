from flask import Blueprint, g, jsonify, request

from src.db import get_orders_for_user
from src.utils import error_response, require_auth

orders_bp = Blueprint("orders", __name__)


@orders_bp.route("/ordenes", methods=["GET"])
@require_auth()
def list_orders():
    user = g.current_user
    orders = get_orders_for_user(user["role"], user["name"])
    return jsonify(orders)
