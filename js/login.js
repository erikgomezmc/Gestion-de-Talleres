import { loginUsuario } from "./api.js";

const SESSION_KEY = "tallerNorteSession";
const form = document.querySelector("#login-form");
const errorMessage = document.querySelector("#login-error");
const passwordInput = document.querySelector("#password");
const passwordToggle = document.querySelector("#password-toggle");

if (localStorage.getItem(SESSION_KEY)) {
  window.location.replace("dashboard.html");
}

passwordToggle.addEventListener("click", () => {
  const shouldShow = passwordInput.type === "password";
  passwordInput.type = shouldShow ? "text" : "password";
  passwordToggle.textContent = shouldShow ? "Ocultar" : "Mostrar";
  passwordToggle.setAttribute("aria-label", shouldShow ? "Ocultar contraseña" : "Mostrar contraseña");
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  errorMessage.textContent = "";
  const submitButton = form.querySelector('button[type="submit"]');
  const username = form.elements.username.value;
  const password = form.elements.password.value;

  if (!username.trim() || !password) {
    errorMessage.textContent = "Ingresa tu usuario y contraseña para continuar.";
    return;
  }

  submitButton.disabled = true;
  submitButton.querySelector("span").textContent = "Validando...";
  try {
    const user = await loginUsuario(username, password);
    // Esta sesión local es solo para la demo; en producción debe usarse el token
    // seguro devuelto por el backend y seguir la política de autenticación acordada.
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    window.location.assign("dashboard.html");
  } catch (error) {
    errorMessage.textContent = error instanceof Error ? error.message : "No se pudo iniciar sesión.";
  } finally {
    submitButton.disabled = false;
    submitButton.querySelector("span").textContent = "Iniciar sesión";
  }
});
