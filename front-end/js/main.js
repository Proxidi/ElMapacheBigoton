$(function () {
    // --- tu código original para el sidebar responsive ---
    $(".navbar-toggler").on("click", function (e) {
        $(".tm-header").toggleClass("show");
        e.stopPropagation();
    });
    $("html").click(function (e) {
        var header = document.getElementById("tm-header");
        if (!header.contains(e.target)) {
            $(".tm-header").removeClass("show");
        }
    });
    $("#tm-nav .nav-link").click(function (e) {
        $(".tm-header").removeClass("show");
    });

    // --- Variables ---
    let currentPage = 1;
    const pageSize = 10;
    const tablaId = "tablaCitas";
    const paginationId = "pagination";

    // Bootstrap modal instance
    const modalEl = document.getElementById("modalNuevo");
    const modal = new bootstrap.Modal(modalEl);

    // --- Cargar página de citas desde el back (server-side pagination) ---
    async function cargarCitas(page = 1) {
        const tbody = document.getElementById("tablaCitas");
        const placeholder = document.getElementById("placeholder-row");
        try {
            const res = await fetch(`/api/citas?page=${page - 1}&size=10`);
            if (!res.ok) throw new Error("fetch error");
            const data = await res.json();
            const items = data.content ?? data;

            // si no hay items, dejamos placeholder (o mostramos "no hay citas")
            if (!items || items.length === 0) {
                placeholder && (placeholder.innerHTML = `<td colspan="7" class="text-center text-muted">No hay citas</td>`);
                return;
            }

            // reemplazar: limpiamos placeholder y añadimos filas
            tbody.innerHTML = ""; // sólo elimina las filas internas, la tabla sigue existiendo
            items.forEach(cita => {
                const tr = document.createElement("tr");
                tr.innerHTML = `
        <td>${cita.fecha ?? ''}</td>
        <td>${cita.hora ?? ''}</td>
        <td>${escapeHtml(cita.cliente ?? '')}</td>
        <td>${escapeHtml(cita.barbero?.nombre ?? cita.barberoNombre ?? '—')}</td>
        <td>${escapeHtml(cita.servicio?.nombre ?? cita.servicioNombre ?? '—')}</td>
        <td><span class="badge ${getStatusClass(cita.status ?? 'pendiente')}">${cita.status ?? 'pendiente'}</span></td>
        <td>...acciones...</td>
      `;
                tbody.appendChild(tr);
            });
        } catch (err) {
            console.error("No se pudieron cargar citas:", err);
            // si falla, dejamos el placeholder indicando error (sin romper todo)
            if (placeholder) placeholder.innerHTML = `<td colspan="7" class="text-center text-danger">Error al cargar. Reintenta.</td>`;
        }
    }


    // --- Render tabla ---
    function renderTable(items) {
        const tbody = document.getElementById(tablaId);
        tbody.innerHTML = "";

        if (!items || items.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" class="text-center">No hay citas</td></tr>`;
            return;
        }

        items.forEach(cita => {
            const tr = document.createElement("tr");
            // espera que el objeto tenga: fecha (YYYY-MM-DD), hora, cliente, barbero.nombre o barberoNombre,
            // servicio.nombre o servicioNombre, status
            const barberoNombre = (cita.barbero && (cita.barbero.nombre || cita.barberoNombre)) ?? "—";
            const servicioNombre = (cita.servicio && (cita.servicio.nombre || cita.servicioNombre)) ?? "—";
            const status = cita.status ?? cita.estatus ?? "pendiente";

            tr.innerHTML = `
        <td>${cita.fecha ?? ''}</td>
        <td>${cita.hora ?? ''}</td>
        <td>${escapeHtml(cita.cliente ?? '')}</td>
        <td>${escapeHtml(barberoNombre)}</td>
        <td>${escapeHtml(servicioNombre)}</td>
        <td><span class="badge ${getStatusClass(status)}">${status}</span></td>
        <td>
          <button class="btn-action btn-ver" data-id="${cita.id}"><i class="fa fa-eye"></i></button>
          <button class="btn-action btn-edit" data-id="${cita.id}"><i class="fa fa-pen"></i></button>
          <button class="btn-action btn-delete" data-id="${cita.id}"><i class="fa fa-trash"></i></button>
        </td>
      `;
            tbody.appendChild(tr);
        });

        // attach basic action listeners (example: borrar)
        document.querySelectorAll(".btn-delete").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                if (!confirm("Eliminar esta cita?")) return;
                try {
                    const res = await fetch(`/api/citas/${id}`, { method: "DELETE" });
                    if (res.ok) cargarCitas(currentPage);
                    else alert("No se pudo eliminar");
                } catch (err) { console.error(err); }
            });
        });

        // Edición y ver: aquí sólo muestro un ejemplo mínimo (puedes ampliar)
        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                // 1) obtener datos de back, 2) rellenar modal y mostrar
                try {
                    const res = await fetch(`/api/citas/${id}`);
                    if (!res.ok) throw new Error();
                    const c = await res.json();
                    // Rellenar formulario del modal (suponiendo mismos ids)
                    document.getElementById("fecha").value = c.fecha ?? "";
                    document.getElementById("hora").value = c.hora ?? "";
                    document.getElementById("cliente").value = c.cliente ?? "";
                    await cargarBarberos(); await cargarServicios();
                    document.getElementById("barbero").value = c.barbero?.id ?? c.barberoId ?? "";
                    document.getElementById("servicio").value = c.servicio?.id ?? c.servicioId ?? "";
                    // Para editar, podrías añadir un hidden input con id o usar una variable global
                    document.getElementById("formNuevo").dataset.editId = id;
                    modal.show();
                } catch (err) {
                    console.error("No se pudo cargar cita", err);
                }
            });
        });

        document.querySelectorAll(".btn-ver").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.currentTarget.getAttribute("data-id");
                // aquí podrías abrir un modal de solo lectura o una ruta /citas/{id}
                window.location.href = `/citas/${id}`; // ejemplo
            });
        });
    }

    // --- Helpers ---
    function getStatusClass(status) {
        const s = (status || "").toLowerCase();
        if (s.includes("pend")) return "bg-warning text-dark";
        if (s.includes("progr") || s.includes("en progreso")) return "bg-primary text-white";
        if (s.includes("term") || s.includes("final")) return "bg-success text-white";
        return "bg-secondary text-white";
    }

    function escapeHtml(str) {
        return String(str).replace(/[&<>"'`=\/]/g, function (s) {
            return ({
                '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;'
            })[s];
        });
    }

    // --- Render paginación (totalPages proviene del backend) ---
    function renderPagination(totalPages, activePage) {
        const pagination = document.getElementById(paginationId);
        pagination.innerHTML = "";

        if (totalPages <= 1) return;

        // Prev
        const prevLi = document.createElement("li");
        prevLi.className = `page-item ${activePage === 1 ? "disabled" : ""}`;
        prevLi.innerHTML = `<a class="page-link" href="#">«</a>`;
        prevLi.addEventListener("click", (e) => { e.preventDefault(); if (activePage > 1) cargarCitas(activePage - 1); });
        pagination.appendChild(prevLi);

        // páginas (limitado a rango de 7 para no saturar)
        const maxButtons = 7;
        let start = Math.max(1, activePage - Math.floor(maxButtons / 2));
        let end = Math.min(totalPages, start + maxButtons - 1);
        if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);

        for (let i = start; i <= end; i++) {
            const li = document.createElement("li");
            li.className = `page-item ${i === activePage ? "active" : ""}`;
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener("click", (ev) => { ev.preventDefault(); cargarCitas(i); });
            pagination.appendChild(li);
        }

        // Next
        const nextLi = document.createElement("li");
        nextLi.className = `page-item ${activePage === totalPages ? "disabled" : ""}`;
        nextLi.innerHTML = `<a class="page-link" href="#">»</a>`;
        nextLi.addEventListener("click", (e) => { e.preventDefault(); if (activePage < totalPages) cargarCitas(activePage + 1); });
        pagination.appendChild(nextLi);
    }

    // --- Cargar barberos y servicios (para selects) ---
    async function cargarBarberos() {
        try {
            const res = await fetch("/api/barberos");
            if (!res.ok) throw new Error();
            const data = await res.json();
            const sel = document.getElementById("barbero");
            sel.innerHTML = data.map(b => `<option value="${b.id}">${escapeHtml(b.nombre)}</option>`).join("");
        } catch (err) { console.error(err); }
    }

    async function cargarServicios() {
        try {
            const res = await fetch("/api/servicios");
            if (!res.ok) throw new Error();
            const data = await res.json();
            const sel = document.getElementById("servicio");
            sel.innerHTML = data.map(s => `<option value="${s.id}">${escapeHtml(s.nombre)}</option>`).join("");
        } catch (err) { console.error(err); }
    }

    // --- Guardar nueva cita (POST) ---
    document.getElementById("formNuevo").addEventListener("submit", async (e) => {
        e.preventDefault();
        // si editId está presente, haremos PUT
        const editId = e.currentTarget.dataset.editId ?? null;
        const payload = {
            fecha: document.getElementById("fecha").value,
            hora: document.getElementById("hora").value,
            cliente: document.getElementById("cliente").value,
            barbero: { id: parseInt(document.getElementById("barbero").value) },
            servicio: { id: parseInt(document.getElementById("servicio").value) }
            // NOTA: no incluimos status; lo establece el back al crear
        };

        try {
            const url = editId ? `/api/citas/${editId}` : `/api/citas`;
            const method = editId ? "PUT" : "POST";
            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                modal.hide();
                // limpiar formulario
                e.currentTarget.reset();
                delete e.currentTarget.dataset.editId;
                cargarCitas(1); // recargar primera página o currentPage
            } else {
                const text = await res.text();
                console.error("Error guardando:", text);
                alert("No se pudo guardar la cita");
            }
        } catch (err) {
            console.error(err);
            alert("Error al guardar");
        }
    });

    // --- Abrir modal Nuevo ---
    document.getElementById("btnNuevo").addEventListener("click", async () => {
        document.getElementById("formNuevo").reset();
        delete document.getElementById("formNuevo").dataset.editId;
        await Promise.all([cargarBarberos(), cargarServicios()]);
        modal.show();
    });

    // --- Inicial ---
    cargarCitas(1);
});
