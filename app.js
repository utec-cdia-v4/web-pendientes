const API_BASE = "http://127.0.0.1:8000";

const listContainer = document.getElementById("pendientes-list");
const form = document.getElementById("pendiente-form");
const descInput = document.getElementById("descripcion");
const impSelect = document.getElementById("importancia");

async function cargarPendientes() {
  try {
    const res = await fetch(`${API_BASE}/pendientes`);
    const data = await res.json();
    renderPendientes(data);
  } catch (e) {
    console.error("Error cargando pendientes", e);
  }
}

function formatDate(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleString();
}

function renderPendientes(pendientes) {
  listContainer.innerHTML = "";
  if (pendientes.length === 0) {
    listContainer.innerHTML = "<p>No tienes pendientes registrados.</p>";
    return;
  }

  pendientes.forEach((p) => {
    const item = document.createElement("div");
    item.className = "pendiente-item" + (p.estado === "completado" ? " completado" : "");

    const header = document.createElement("div");
    header.className = "pendiente-header";

    const imp = document.createElement("span");
    imp.className = `badge ${p.importancia}`;
    imp.textContent = p.importancia.toUpperCase();

    const estado = document.createElement("span");
    estado.className = "estado";
    estado.textContent = p.estado === "pendiente" ? "Pendiente" : "Completado";

    header.appendChild(imp);
    header.appendChild(estado);

    const desc = document.createElement("div");
    desc.className = "descripcion";
    desc.textContent = p.descripcion;

    const meta = document.createElement("div");
    meta.className = "meta";
    meta.textContent =
      `Creado: ${formatDate(p.fecha_creacion)} | ` +
      `Atendido: ${formatDate(p.fecha_atencion)}`;

    const actions = document.createElement("div");
    actions.className = "actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.className = "btn-secondary";
    toggleBtn.textContent =
      p.estado === "pendiente" ? "Marcar completado" : "Marcar pendiente";
    toggleBtn.onclick = () => toggleEstado(p);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn-danger";
    deleteBtn.textContent = "Eliminar";
    deleteBtn.onclick = () => eliminarPendiente(p.id);

    actions.appendChild(toggleBtn);
    actions.appendChild(deleteBtn);

    item.appendChild(header);
    item.appendChild(desc);
    item.appendChild(meta);
    item.appendChild(actions);

    listContainer.appendChild(item);
  });
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const descripcion = descInput.value.trim();
  const importancia = impSelect.value;

  if (!descripcion) return;

  try {
    await fetch(`${API_BASE}/pendientes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ descripcion, importancia }),
    });
    descInput.value = "";
    impSelect.value = "media";
    cargarPendientes();
  } catch (err) {
    console.error("Error creando pendiente", err);
  }
});

async function toggleEstado(p) {
  const nuevoEstado = p.estado === "pendiente" ? "completado" : "pendiente";
  try {
    await fetch(`${API_BASE}/pendientes/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado: nuevoEstado }),
    });
    cargarPendientes();
  } catch (err) {
    console.error("Error cambiando estado", err);
  }
}

async function eliminarPendiente(id) {
  const confirmar = window.confirm("¿Eliminar este pendiente?");
  if (!confirmar) return;
  try {
    await fetch(`${API_BASE}/pendientes/${id}`, { method: "DELETE" });
    cargarPendientes();
  } catch (err) {
    console.error("Error eliminando pendiente", err);
  }
}

cargarPendientes();
