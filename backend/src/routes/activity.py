from flask import Blueprint, g, jsonify

from src.db import get_activities_for_user
from src.utils import require_auth

activity_bp = Blueprint("activity", __name__)


@activity_bp.route("/actividad", methods=["GET"])
@require_auth()
def list_activity():
    user = g.current_user
    activities = get_activities_for_user(user["role"])
    return jsonify(activities)
