// js/servicios.js
$(function () {
  const pageSize = 10;
  let currentPage = 1;

  const tbodyId = "tablaServicios";
  const paginationId = "paginationServicios";
  const placeholderId = "placeholder-servicio";

  // modal bootstrap
  const modalEl = document.getElementById("modalServicio");
  const modal = new bootstrap.Modal(modalEl);

  // Helpers
  function escapeHtml(str) {
    return String(str ?? "").replace(/[&<>"'`=\/]/g, function (s) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' })[s];
    });
  }
  function formatMoney(n) {
    if (n === null || n === undefined || n === "") return "—";
    const v = Number(n);
    return isNaN(v) ? "—" : v.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' });
  }

  // Cargar página paginada de servicios
  async function cargarServicios(page = 1) {
    const tbody = document.getElementById(tbodyId);
    const placeholder = document.getElementById(placeholderId);
    try {
      const res = await fetch(`/api/servicios?page=${page - 1}&size=${pageSize}`);
      if (!res.ok) throw new Error("Error al obtener servicios");
      const data = await res.json();
      const items = data.content ?? data;
      const totalPages = data.totalPages ?? Math.ceil((data.length || items.length) / pageSize);

      if (!items || items.length === 0) {
        // mantener placeholder row y cambiar texto
        tbody.innerHTML = "";
        if (placeholder) {
          tbody.appendChild(placeholder);
          placeholder.innerHTML = `<td colspan="4" class="text-center text-muted">No hay servicios</td>`;
        } else {
          tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No hay servicios</td></tr>`;
        }
        renderPagination(totalPages, page);
        return;
      }

      // render filas
      tbody.innerHTML = "";
      items.forEach(s => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${s.id ?? ''}</td>
          <td>${escapeHtml(s.nombre ?? s.name ?? '')}</td>
          <td>${formatMoney(s.precio ?? s.price ?? '')}</td>
          <td>
            <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${s.id}" title="Editar"><i class="fa fa-pen"></i></button>
            <button class="btn btn-sm btn-outline-danger btn-delete" data-id="${s.id}" title="Eliminar"><i class="fa fa-trash"></i></button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      renderPagination(totalPages, page);
      attachRowListeners();
    } catch (err) {
      console.error(err);
      // show error on placeholder
      const tbody = document.getElementById(tbodyId);
      tbody.innerHTML = "";
      const ph = document.createElement("tr");
      ph.innerHTML = `<td colspan="4" class="text-center text-danger">Error al cargar servicios. Reintente.</td>`;
      tbody.appendChild(ph);
    }
  }

  // Paginación
  function renderPagination(totalPages, activePage) {
    const pagination = document.getElementById(paginationId);
    pagination.innerHTML = "";
    if (totalPages <= 1) return;

    const prevLi = document.createElement("li");
    prevLi.className = `page-item ${activePage === 1 ? "disabled" : ""}`;
    prevLi.innerHTML = `<a class="page-link" href="#">«</a>`;
    prevLi.addEventListener("click", (e) => { e.preventDefault(); if (activePage > 1) { cargarServicios(activePage - 1); currentPage = activePage - 1; } });
    pagination.appendChild(prevLi);

    const maxButtons = 7;
    let start = Math.max(1, activePage - Math.floor(maxButtons / 2));
    let end = Math.min(totalPages, start + maxButtons - 1);
    if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);

    for (let i = start; i <= end; i++) {
      const li = document.createElement("li");
      li.className = `page-item ${i === activePage ? "active" : ""}`;
      li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
      li.addEventListener("click", (ev) => { ev.preventDefault(); cargarServicios(i); currentPage = i; });
      pagination.appendChild(li);
    }

    const nextLi = document.createElement("li");
    nextLi.className = `page-item ${activePage === totalPages ? "disabled" : ""}`;
    nextLi.innerHTML = `<a class="page-link" href="#">»</a>`;
    nextLi.addEventListener("click", (e) => { e.preventDefault(); if (activePage < totalPages) { cargarServicios(activePage + 1); currentPage = activePage + 1; } });
    pagination.appendChild(nextLi);
  }

  // Listeners para editar / borrar en filas
  function attachRowListeners() {
    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.removeEventListener && btn.removeEventListener("click", onDeleteClick); // safe detach if any
      btn.addEventListener("click", onDeleteClick);
    });
    document.querySelectorAll(".btn-edit").forEach(btn => {
      btn.removeEventListener && btn.removeEventListener("click", onEditClick);
      btn.addEventListener("click", onEditClick);
    });
  }

  async function onDeleteClick(e) {
    const id = e.currentTarget.getAttribute("data-id");
    if (!confirm("Eliminar servicio?")) return;
    try {
      const res = await fetch(`/api/servicios/${id}`, { method: "DELETE" });
      if (res.ok) cargarServicios(currentPage);
      else {
        const t = await res.text();
        alert("No se pudo eliminar: " + t);
      }
    } catch (err) {
      console.error(err);
      alert("Error al borrar");
    }
  }

  async function onEditClick(e) {
    const id = e.currentTarget.getAttribute("data-id");
    try {
      const res = await fetch(`/api/servicios/${id}`);
      if (!res.ok) throw new Error("No encontrado");
      const s = await res.json();
      // llenar modal con datos
      document.getElementById("servicioId").value = s.id ?? "";
      document.getElementById("servicioNombre").value = s.nombre ?? s.name ?? "";
      document.getElementById("servicioPrecio").value = s.precio ?? s.price ?? "";
      document.getElementById("modalServicioTitle").textContent = "Editar servicio";
      modal.show();
    } catch (err) {
      console.error(err);
      alert("No se pudo cargar el servicio para editar");
    }
  }

  // Nuevo servicio (abrir modal limpio)
  document.getElementById("btnNuevoServicio").addEventListener("click", () => {
    document.getElementById("formServicio").reset();
    document.getElementById("servicioId").value = "";
    document.getElementById("modalServicioTitle").textContent = "Nuevo servicio";
    modal.show();
  });

  // Guardar servicio (POST = crear, PUT = editar)
  document.getElementById("formServicio").addEventListener("submit", async (e) => {
    e.preventDefault();
    const id = document.getElementById("servicioId").value;
    const payload = {
      nombre: document.getElementById("servicioNombre").value.trim(),
      precio: parseFloat(document.getElementById("servicioPrecio").value)
    };
    try {
      const url = id ? `/api/servicios/${id}` : `/api/servicios`;
      const method = id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        modal.hide();
        cargarServicios(1);
      } else {
        const t = await res.text();
        console.error("Error guardando servicio:", t);
        alert("No se pudo guardar el servicio: " + t);
      }
    } catch (err) {
      console.error(err);
      alert("Error al guardar servicio");
    }
  });

  // Inicial
  cargarServicios(1);
});