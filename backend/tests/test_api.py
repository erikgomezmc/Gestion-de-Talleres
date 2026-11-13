import json

import pytest

from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def login(client, username, password):
    response = client.post(
        "/api/auth/login",
        data=json.dumps({"username": username, "password": password}),
        content_type="application/json",
    )
    return response


def test_login_success(client):
    response = login(client, "cliente", "demo123")
    assert response.status_code == 200
    payload = response.get_json()
    assert payload["username"] == "cliente"
    assert payload["role"] == "cliente"
    assert "token" in payload
    assert payload["name"] == "Mario Sanchez"


def test_login_failure(client):
    response = login(client, "cliente", "incorrecta")
    assert response.status_code == 401
    assert response.get_json()["error"] == "Usuario o contraseña incorrectos."


def test_orders_filter_by_role_client(client):
    response = login(client, "cliente", "demo123")
    token = response.get_json()["token"]
    orders_response = client.get(
        "/api/ordenes",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert orders_response.status_code == 200
    orders = orders_response.get_json()
    assert len(orders) == 1
    assert orders[0]["customer"] == "Mario Sanchez"


def test_orders_filter_by_role_mechanic(client):
    response = login(client, "mecanico", "demo123")
    token = response.get_json()["token"]
    orders_response = client.get(
        "/api/ordenes",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert orders_response.status_code == 200
    orders = orders_response.get_json()
    assert all(order["mechanic"] == "Jonathan Rojas" for order in orders)
