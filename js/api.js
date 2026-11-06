// Capa de servicios de demostración. Al integrar el backend, sustituye estos
// mocks por fetch() y conserva las firmas exportadas para no acoplar la UI.
const DEMO_PASSWORD = "demo123";
const DEMO_USERS = [
  { username: "propietario", password: DEMO_PASSWORD, name: "Erik Gomez", role: "propietario", email: "erik@tallernorte.demo" },
  { username: "admin", password: DEMO_PASSWORD, name: "Juan Esteban", role: "administrador", email: "mariana@tallernorte.demo" },
  { username: "mecanico", password: DEMO_PASSWORD, name: "Jonathan Rojas", role: "mecanico", email: "jonathan@tallernorte.demo" },
  { username: "cliente", password: DEMO_PASSWORD, name: "Mario Sanchez", role: "cliente", email: "mario@tallernorte.demo" },
  { username: "proveedor", password: DEMO_PASSWORD, name: "Carlos Mendoza", role: "proveedor", email: "carlos@refacciones.demo" }
];

const DEMO_ORDERS = [
  { id: "OT-1048", vehicle: "Nissan Versa · 2021", customer: "Sofía Hernández", status: "En reparación", mechanic: "Diego Morales" },
  { id: "OT-1047", vehicle: "Toyota Corolla · 2019", customer: "Luis Castillo", status: "Esperando refacción", mechanic: "Diego Morales" },
  { id: "OT-1046", vehicle: "Honda Civic · 2022", customer: "Valeria Cruz", status: "Listo para entrega", mechanic: "Andrés López" }
];

const DEMO_ACTIVITIES = [
  { icon: "✓", title: "Orden OT-1046 lista para entrega", time: "Hace 18 minutos" },
  { icon: "＋", title: "Nueva orden de servicio OT-1048", time: "Hace 1 hora" },
  { icon: "↗", title: "Inventario actualizado", time: "Hoy, 9:42 a. m." }
];

function simulateRequest(data) {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(structuredClone(data)), 180);
  });
}

// Futuro backend: POST /api/auth/login. No se guarda la contraseña en sesión.
export async function loginUsuario(username, password) {
  const user = DEMO_USERS.find((item) =>
    item.username.toLowerCase() === username.trim().toLowerCase() && item.password === password
  );
  if (!user) {
    throw new Error("Usuario o contraseña incorrectos.");
  }
  const { password: _password, ...safeUser } = user;
  return simulateRequest(safeUser);
}

// Futuro backend: GET /api/ordenes (filtrado por el rol y usuario autenticado).
export async function obtenerOrdenes() {
  return simulateRequest(DEMO_ORDERS);
}

// Futuro backend: GET /api/actividad.
export async function obtenerActividad() {
  return simulateRequest(DEMO_ACTIVITIES);
}
