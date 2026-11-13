from flask import Flask
from flask_cors import CORS

from src.config import settings
from src.db import init_db, seed_demo_data
from src.limiter import limiter
from src.routes.activity import activity_bp
from src.routes.auth import auth_bp
from src.routes.health import health_bp
from src.routes.orders import orders_bp

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False
app.config["SECRET_KEY"] = settings.JWT_SECRET

CORS(
    app,
    resources={r"/api/*": {"origins": settings.FRONTEND_ORIGINS}},
    supports_credentials=True,
)

limiter.init_app(app)

init_db()
seed_demo_data()

app.register_blueprint(health_bp, url_prefix="/api")
app.register_blueprint(auth_bp, url_prefix="/api/auth")
app.register_blueprint(orders_bp, url_prefix="/api")
app.register_blueprint(activity_bp, url_prefix="/api")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=settings.PORT, debug=settings.DEBUG)
