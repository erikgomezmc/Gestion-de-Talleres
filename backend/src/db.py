import hashlib
import sqlite3
from pathlib import Path

from src.config import settings

DB_PATH = Path(settings.DB_PATH)
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_connection() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT NOT NULL UNIQUE,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                role TEXT NOT NULL,
                password_hash TEXT NOT NULL
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS orders (
                id TEXT PRIMARY KEY,
                vehicle TEXT NOT NULL,
                customer TEXT NOT NULL,
                status TEXT NOT NULL,
                mechanic TEXT NOT NULL,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
            """
        )
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS activities (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                icon TEXT NOT NULL,
                title TEXT NOT NULL,
                time TEXT NOT NULL
            )
            """
        )


def _hash_password(password: str) -> str:
    salt = b"taller-norte-demo"
    return hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, 200_000).hex()


def seed_demo_data():
    with get_connection() as conn:
        existing_users = conn.execute("SELECT COUNT(*) AS total FROM users").fetchone()["total"]
        if existing_users > 0:
            return

        demo_users = [
            {"username": "propietario", "name": "Erik Gomez", "email": "erik@tallernorte.demo", "role": "propietario"},
            {"username": "admin", "name": "Juan Esteban", "email": "mariana@tallernorte.demo", "role": "administrador"},
            {"username": "mecanico", "name": "Jonathan Rojas", "email": "jonathan@tallernorte.demo", "role": "mecanico"},
            {"username": "cliente", "name": "Mario Sanchez", "email": "mario@tallernorte.demo", "role": "cliente"},
            {"username": "proveedor", "name": "Carlos Mendoza", "email": "carlos@refacciones.demo", "role": "proveedor"},
        ]

        conn.executemany(
            "INSERT INTO users (username, name, email, role, password_hash) VALUES (?, ?, ?, ?, ?)",
            [
                (user["username"], user["name"], user["email"], user["role"], _hash_password("demo123"))
                for user in demo_users
            ],
        )

        demo_orders = [
            {"id": "OT-1048", "vehicle": "Nissan Versa · 2021", "customer": "Mario Sanchez", "status": "En reparación", "mechanic": "Jonathan Rojas"},
            {"id": "OT-1047", "vehicle": "Toyota Corolla · 2019", "customer": "Luis Castillo", "status": "Esperando refacción", "mechanic": "Jonathan Rojas"},
            {"id": "OT-1046", "vehicle": "Honda Civic · 2022", "customer": "Valeria Cruz", "status": "Listo para entrega", "mechanic": "Andrés López"},
        ]
        conn.executemany(
            "INSERT INTO orders (id, vehicle, customer, status, mechanic) VALUES (?, ?, ?, ?, ?)",
            [(order["id"], order["vehicle"], order["customer"], order["status"], order["mechanic"]) for order in demo_orders],
        )

        demo_activities = [
            {"icon": "✓", "title": "Orden OT-1046 lista para entrega", "time": "Hace 18 minutos"},
            {"icon": "＋", "title": "Nueva orden de servicio OT-1048", "time": "Hace 1 hora"},
            {"icon": "↗", "title": "Inventario actualizado", "time": "Hoy, 9:42 a. m."},
        ]
        conn.executemany(
            "INSERT INTO activities (icon, title, time) VALUES (?, ?, ?)",
            [(activity["icon"], activity["title"], activity["time"]) for activity in demo_activities],
        )


def get_user_by_username(username: str):
    with get_connection() as conn:
        row = conn.execute(
            "SELECT id, username, name, email, role, password_hash FROM users WHERE username = ?",
            (username.lower(),),
        ).fetchone()
        return dict(row) if row else None


def get_orders_for_user(user_role: str, user_name: str):
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT id, vehicle, customer, status, mechanic FROM orders ORDER BY id DESC"
        ).fetchall()

    orders = [dict(row) for row in rows]
    if user_role in {"propietario", "administrador"}:
        return orders
    if user_role == "mecanico":
        return [order for order in orders if order["mechanic"] == user_name]
    if user_role == "cliente":
        return [order for order in orders if order["customer"] == user_name]
    if user_role == "proveedor":
        return [order for order in orders if order["status"] in {"Esperando refacción", "En reparación"}]
    return []


def get_activities_for_user(user_role: str):
    with get_connection() as conn:
        rows = conn.execute(
            "SELECT icon, title, time FROM activities ORDER BY id DESC"
        ).fetchall()
    activities = [dict(row) for row in rows]
    if user_role == "proveedor":
        return [activity for activity in activities if "Inventario" in activity["title"] or "refacción" in activity["title"].lower() or "servicio" in activity["title"].lower()]
    return activities
