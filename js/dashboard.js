import { obtenerActividad, obtenerOrdenes } from "./api.js";

const SESSION_KEY = "tallerNorteSession";
const ROLE_LABELS = {
  mecanico: "Mecánico",
  cliente: "Cliente",
  proveedor: "Proveedor",
  administrador: "Administrador",
  propietario: "Propietario"
};
const ROLE_NAVIGATION = {
  mecanico: [
    { id: "resumen", label: "Resumen", icon: "⌂" },
    { id: "ordenes", label: "Mis órdenes", icon: "▤" },
    { id: "vehiculos", label: "Vehículos", icon: "▱" }
  ],
  cliente: [
    { id: "resumen", label: "Resumen", icon: "⌂" },
    { id: "estado", label: "Estado de mi vehículo", icon: "◉" },
    { id: "historial", label: "Historial de servicios", icon: "◷" }
  ],
  proveedor: [
    { id: "resumen", label: "Resumen", icon: "⌂" },
    { id: "solicitudes", label: "Solicitudes", icon: "▤" },
    { id: "catalogo", label: "Productos y catálogo", icon: "▦" }
  ],
  administrador: [
    { id: "resumen", label: "Resumen", icon: "⌂" },
    { id: "ordenes", label: "Órdenes de servicio", icon: "▤" },
    { id: "clientes", label: "Clientes", icon: "♙" },
    { id: "inventario", label: "Inventario", icon: "▦" },
    { id: "equipo", label: "Equipo", icon: "♧" }
  ],
  propietario: [
    { id: "resumen", label: "Resumen", icon: "⌂" },
    { id: "reportes", label: "Reportes financieros", icon: "▥" },
    { id: "ordenes", label: "Órdenes de servicio", icon: "▤" },
    { id: "equipo", label: "Equipo", icon: "♧" },
    { id: "inventario", label: "Inventario", icon: "▦" }
  ]
};

const session = readSession();
if (!session) {
  window.location.replace("login.html");
} else {
  initializeDashboard(session);
}

function readSession() {
  try {
    const storedSession = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!storedSession || !ROLE_LABELS[storedSession.role] || !storedSession.name) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return storedSession;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function initializeDashboard(user) {
  document.querySelector("#header-name").textContent = user.name;
  document.querySelector("#header-role").textContent = ROLE_LABELS[user.role];
  document.querySelector("#header-avatar").textContent = user.name.charAt(0).toUpperCase();
  renderNavigation(user.role);
  renderContent("resumen", user);

  document.querySelector("#logout-button").addEventListener("click", () => {
    localStorage.removeItem(SESSION_KEY);
    window.location.replace("login.html");
  });

  const shell = document.querySelector(".app-shell");
  const menuToggle = document.querySelector("#menu-toggle");
  const closeMenu = () => {
    shell.classList.remove("sidebar-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };
  menuToggle.addEventListener("click", () => {
    const isOpen = shell.classList.toggle("sidebar-open");
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  document.querySelector("#sidebar-backdrop").addEventListener("click", closeMenu);
}

function renderNavigation(role) {
  const navigation = document.querySelector("#main-navigation");
  navigation.replaceChildren();
  for (const item of ROLE_NAVIGATION[role]) {
    const link = document.createElement("a");
    link.className = "nav-item";
    link.href = `#${item.id}`;
    link.dataset.section = item.id;
    link.innerHTML = `<span class="nav-icon" aria-hidden="true">${item.icon}</span><span>${item.label}</span>`;
    link.addEventListener("click", (event) => {
      event.preventDefault();
      renderContent(item.id, session);
      document.querySelector(".app-shell").classList.remove("sidebar-open");
      document.querySelector("#menu-toggle").setAttribute("aria-expanded", "false");
    });
    navigation.append(link);
  }
}

async function renderContent(section, user) {
  const content = document.querySelector("#dashboard-content");
  const currentSection = (ROLE_NAVIGATION[user.role] || []).find((item) => item.id === section);
  if (!currentSection) return;

  document.querySelector("#current-section").textContent = currentSection.label;
  document.querySelectorAll(".nav-item").forEach((item) => {
    const isActive = item.dataset.section === section;
    item.classList.toggle("active", isActive);
    if (isActive) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
  content.setAttribute("aria-busy", "true");

  if (section !== "resumen") {
    content.innerHTML = `<section class="panel empty-panel"><div><span class="empty-panel-icon" aria-hidden="true">${currentSection.icon}</span><h2>${currentSection.label}</h2><p>Esta sección está lista para conectarse con la API del taller. Los datos se habilitarán cuando se integre el backend.</p></div></section>`;
    content.removeAttribute("aria-busy");
    content.focus({ preventScroll: true });
    return;
  }

  try {
    const [orders, activities] = await Promise.all([obtenerOrdenes(), obtenerActividad()]);
    content.innerHTML = renderSummary(user, orders, activities);
    content.removeAttribute("aria-busy");
  } catch (error) {
    content.innerHTML = `<section class="panel empty-panel"><div><span class="empty-panel-icon" aria-hidden="true">!</span><h2>No se pudo cargar el resumen</h2><p>${escapeHtml(error instanceof Error ? error.message : "Intenta de nuevo más tarde.")}</p></div></section>`;
    content.removeAttribute("aria-busy");
  }
  content.focus({ preventScroll: true });
}

function renderSummary(user, orders, activities) {
  const isClient = user.role === "cliente";
  const isMechanic = user.role === "mecanico";
  const visibleOrders = isClient
    ? orders.filter((order) => order.customer === user.name)
    : isMechanic
      ? orders.filter((order) => order.mechanic === user.name)
      : orders;
  const stats = isClient
    ? [
        { label: "Vehículos registrados", value: "1", icon: "▱", foot: "En tu cuenta" },
        { label: "Servicios en curso", value: String(visibleOrders.filter((order) => order.status !== "Listo para entrega").length), icon: "◷", foot: "Actualizado hoy" },
        { label: "Servicios completados", value: "8", icon: "✓", foot: "Historial total" },
        { label: "Próxima cita", value: "—", icon: "▦", foot: "Sin citas próximas" }
      ]
    : [
        { label: isMechanic ? "Mis órdenes activas" : "Órdenes activas", value: String(visibleOrders.filter((order) => order.status !== "Listo para entrega").length).padStart(2, "0"), icon: "▤", foot: '<span class="positive">+2</span> respecto a la semana pasada' },
        { label: "En reparación", value: String(visibleOrders.filter((order) => order.status === "En reparación").length).padStart(2, "0"), icon: "⚙", foot: "En proceso actualmente" },
        { label: "Listos para entrega", value: String(visibleOrders.filter((order) => order.status === "Listo para entrega").length).padStart(2, "0"), icon: "✓", foot: "Esperando al cliente" },
        { label: "Ingresos del mes", value: "$8,450", icon: "$", foot: '<span class="positive">↑ 12%</span> respecto al mes pasado' }
      ];

  return `
    <div class="welcome-row">
      <div><span class="eyebrow">PANEL DE CONTROL</span><h1>Hola, ${escapeHtml(user.name.split(" ")[0])} <span aria-hidden="true">👋</span></h1><p>${isClient ? "Aquí puedes consultar las novedades de tu vehículo." : "Aquí tienes lo más importante de tu taller hoy."}</p></div>
      <div class="date-pill"><span aria-hidden="true">◷</span>${new Intl.DateTimeFormat("es-MX", { dateStyle: "long" }).format(new Date())}</div>
    </div>
    <section class="stats-grid" aria-label="Indicadores">
      ${stats.map((stat) => `<article class="stat-card"><div class="stat-heading"><span>${stat.label}</span><span class="stat-icon" aria-hidden="true">${stat.icon}</span></div><div class="stat-value">${stat.value}</div><div class="stat-foot">${stat.foot}</div></article>`).join("")}
    </section>
    <div class="content-grid">
      <section class="panel">
        <div class="panel-header"><div><h2>${isClient ? "Estado de mi vehículo" : isMechanic ? "Mis órdenes de trabajo" : "Órdenes recientes"}</h2><p>${isClient ? "Seguimiento de tus servicios" : "Resumen de actividad del taller"}</p></div><button class="text-link" type="button" data-section-link="${isClient ? "estado" : "ordenes"}">Ver todas <span aria-hidden="true">→</span></button></div>
        <div class="table-wrap"><table class="orders-table"><thead><tr><th>ORDEN</th><th>VEHÍCULO</th><th>${isClient ? "SERVICIO" : "CLIENTE"}</th><th>ESTADO</th></tr></thead><tbody>${visibleOrders.length ? visibleOrders.map((order) => `<tr><td>${escapeHtml(order.id)}</td><td>${escapeHtml(order.vehicle)}</td><td>${isClient ? "Servicio general" : escapeHtml(order.customer)}</td><td><span class="status-badge ${statusClass(order.status)}">${escapeHtml(order.status)}</span></td></tr>`).join("") : `<tr><td class="table-empty" colspan="4">${isClient ? "No hay servicios registrados en este momento." : "No tienes órdenes asignadas en este momento."}</td></tr>`}</tbody></table></div>
      </section>
      <section class="panel">
        <div class="panel-header"><div><h2>Actividad reciente</h2><p>Lo que sucede en tu taller</p></div></div>
        <div class="activity-list">${activities.map((activity) => `<div class="activity-item"><span class="activity-icon" aria-hidden="true">${activity.icon}</span><div class="activity-copy"><strong>${escapeHtml(activity.title)}</strong><span>${escapeHtml(activity.time)}</span></div></div>`).join("")}</div>
      </section>
    </div>`;
}

function statusClass(status) {
  if (status === "Listo para entrega") return "status-ready";
  if (status === "En reparación") return "status-progress";
  return "";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-section-link]");
  if (target && session) renderContent(target.dataset.sectionLink, session);
});
