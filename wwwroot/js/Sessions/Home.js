let sessionCustomerSearchController;
let sessionPendingCustomer;

document.addEventListener("DOMContentLoaded", () => {
    SetDefaultSessionDates();
    LoadSessions();
    LoadSessionServiceTree();
    InitSessionTooltips();
    InitSessionCustomerSearch();
    InitSessionPhoneInput();

    document.getElementById("BtnFilterSessionsModal").addEventListener("click", () => OpenSessionFilterModal());
    document.getElementById("BtnApplySessionFilter").addEventListener("click", () => ApplySessionFilter());
    document.getElementById("BtnCreateSessionModal").addEventListener("click", () => OpenCreateSessionModal());
    document.getElementById("BtnCreateSession").addEventListener("click", () => AddSession());
    document.getElementById("BtnOpenSessionCustomerModal").addEventListener("click", () => OpenSessionCustomerModal());
    document.getElementById("BtnCancelSessionCustomer").addEventListener("click", () => CloseSessionCustomerModal());
    document.getElementById("BtnCreateSessionCustomer").addEventListener("click", () => AddSessionCustomer());
    document.getElementById("SessionServiceTree").addEventListener("change", event => {
        if (!event.target.matches("input[name='SessionService']")) return;
        const service = event.target;
        document.getElementById("SessionCategoryId").value = service.dataset.categoryId;
        document.getElementById("SessionServiceId").value = service.value;
        document.getElementById("SessionServiceSelection").textContent = `Servicio seleccionado: ${service.dataset.serviceName}`;
    });
});

async function LoadSessions(buttonId = "") {
    const startDate = document.getElementById("FilterModalStartDate").value;
    const endDate = document.getElementById("FilterModalEndDate").value;
    if (!startDate || !endDate) return false;
    if (startDate > endDate) {
        ShowSessionToast("warning", "La fecha inicial no puede ser mayor que la fecha final.");
        return false;
    }

    try {
        if (buttonId) SetSessionButtonLoading(buttonId, "SpinnerApplySessionFilter", "IconApplySessionFilter", "Cargando...");
        const response = await fetch(`/Sessions/GetSessions?StartDate=${encodeURIComponent(startDate)}&EndDate=${encodeURIComponent(endDate)}`);
        if (!response.ok) {
            ShowSessionToast(response.status < 500 ? "warning" : "danger", await response.text());
            return false;
        }

        const result = await response.json().catch(() => []);
        const tbody = document.querySelector("#SessionsTable tbody");
        tbody.replaceChildren();
        document.getElementById("SessionsCount").textContent = result.length;
        if (!result.length) {
            tbody.innerHTML = '<tr><td colspan="4" class="text-center text-body-secondary">No hay sesiones para el rango seleccionado.</td></tr>';
            return true;
        }

        result.forEach(item => {
            const row = document.createElement("tr");
            row.innerHTML = `<td>${FormatSessionDate(item.createdDate)}</td><td></td><td><span class="badge text-bg-secondary"></span></td><td></td>`;
            row.children[1].textContent = item.customer || "Sin cliente";
            row.children[2].firstElementChild.textContent = item.category || "Sin categoría";
            row.children[3].textContent = item.service || "Sin servicio";
            tbody.appendChild(row);
        });
        return true;
    } catch (error) {
        ShowSessionToast("danger", error.message || error);
        return false;
    } finally {
        if (buttonId) ClearSessionButtonLoading(buttonId, "SpinnerApplySessionFilter", "IconApplySessionFilter");
    }
}

function SetDefaultSessionDates() {
    const today = new Date();
    const value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    document.getElementById("FilterModalStartDate").value = value;
    document.getElementById("FilterModalEndDate").value = value;
}

function OpenSessionFilterModal() {
    bootstrap.Modal.getOrCreateInstance(document.getElementById("FilterSessionsModal")).show();
}

async function ApplySessionFilter() {
    if (await LoadSessions("BtnApplySessionFilter")) {
        bootstrap.Modal.getOrCreateInstance(document.getElementById("FilterSessionsModal")).hide();
    }
}

function OpenCreateSessionModal() {
    ResetSessionForm();
    bootstrap.Modal.getOrCreateInstance(document.getElementById("CreateSessionModal")).show();
}

function ResetSessionForm() {
    document.getElementById("SessionCustomerSearch").value = "";
    document.getElementById("SessionCustomerId").value = "";
    document.getElementById("SessionCustomerSuggestions").replaceChildren();
    document.getElementById("SessionCustomerSelection").textContent = "Ningún cliente seleccionado.";
    document.getElementById("SessionCategoryId").value = "";
    document.getElementById("SessionServiceId").value = "";
    document.getElementById("SessionServiceSelection").textContent = "Ningún servicio seleccionado.";
    document.querySelectorAll("input[name='SessionService']").forEach(input => input.checked = false);
}

function InitSessionCustomerSearch() {
    const input = document.getElementById("SessionCustomerSearch");
    let timer;
    input.addEventListener("input", () => {
        clearTimeout(timer);
        document.getElementById("SessionCustomerId").value = "";
        document.getElementById("SessionCustomerSelection").textContent = "Ningún cliente seleccionado.";
        timer = setTimeout(() => SearchSessionCustomers(input.value), 150);
    });
    input.addEventListener("focus", () => {
        if (input.value.trim()) SearchSessionCustomers(input.value);
    });
    document.addEventListener("click", event => {
        if (!event.target.closest("#SessionCustomerSearch, #SessionCustomerSuggestions")) {
            document.getElementById("SessionCustomerSuggestions").replaceChildren();
        }
    });
}

async function SearchSessionCustomers(value) {
    const query = value.trim();
    const suggestions = document.getElementById("SessionCustomerSuggestions");
    suggestions.replaceChildren();
    if (!query) return;

    if (sessionCustomerSearchController) sessionCustomerSearchController.abort();
    sessionCustomerSearchController = new AbortController();
    try {
        const response = await fetch(`/Sessions/SearchCustomers?Query=${encodeURIComponent(query)}`, { signal: sessionCustomerSearchController.signal });
        if (!response.ok) throw new Error(await response.text());
        const customers = await response.json();
        if (!customers.length) {
            const empty = document.createElement("div");
            empty.className = "list-group-item text-body-secondary small";
            empty.textContent = "No se encontraron coincidencias.";
            suggestions.appendChild(empty);
            return;
        }

        customers.slice(0, 10).forEach(customer => {
            const option = document.createElement("button");
            option.type = "button";
            option.className = "list-group-item list-group-item-action";
            option.setAttribute("role", "option");
            option.textContent = customer.name || "Sin nombre";
            option.addEventListener("click", () => SelectSessionCustomer(customer));
            suggestions.appendChild(option);
        });
    } catch (error) {
        if (error.name !== "AbortError") ShowSessionToast("danger", error.message || error);
    }
}

function SelectSessionCustomer(customer) {
    document.getElementById("SessionCustomerSearch").value = customer.name || "";
    document.getElementById("SessionCustomerId").value = customer.id;
    document.getElementById("SessionCustomerSelection").textContent = `Cliente seleccionado: ${customer.name}`;
    document.getElementById("SessionCustomerSuggestions").replaceChildren();
}

async function LoadSessionServiceTree() {
    const tree = document.getElementById("SessionServiceTree");
    try {
        const response = await fetch("/Sessions/GetServiceTree");
        if (!response.ok) throw new Error(await response.text());
        const categories = await response.json();
        tree.replaceChildren();
        if (!categories.length) {
            tree.innerHTML = '<div class="text-body-secondary small p-3">No hay servicios disponibles.</div>';
            return;
        }

        categories.forEach((category, index) => {
            const item = document.createElement("div");
            item.className = "accordion-item";
            const headingId = `SessionServiceHeading${category.id}`;
            const collapseId = `SessionServiceCollapse${category.id}`;
            item.innerHTML = `<h2 class="accordion-header" id="${headingId}"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}"></button></h2><div id="${collapseId}" class="accordion-collapse collapse" aria-labelledby="${headingId}"><div class="accordion-body p-2"></div></div>`;
            item.querySelector(".accordion-button").textContent = category.name || "Sin categoría";
            const body = item.querySelector(".accordion-body");
            category.services.forEach(service => {
                const wrapper = document.createElement("div");
                wrapper.className = "form-check session-service-option";
                wrapper.innerHTML = `<input class="form-check-input" type="radio" name="SessionService" id="SessionService${service.id}" value="${service.id}"><label class="form-check-label" for="SessionService${service.id}"></label>`;
                const input = wrapper.querySelector("input");
                input.dataset.categoryId = category.id;
                input.dataset.serviceName = service.name || "Sin servicio";
                wrapper.querySelector("label").textContent = service.name || "Sin servicio";
                body.appendChild(wrapper);
            });
            tree.appendChild(item);
        });
    } catch (error) {
        tree.innerHTML = '<div class="text-danger small p-3">No fue posible cargar los servicios.</div>';
        ShowSessionToast("danger", error.message || error);
    }
}

function OpenSessionCustomerModal() {
    const main = document.getElementById("CreateSessionModal");
    const customerModal = document.getElementById("SessionCustomerModal");
    const showCustomer = () => bootstrap.Modal.getOrCreateInstance(customerModal).show();
    main.addEventListener("hidden.bs.modal", showCustomer, { once: true });
    bootstrap.Modal.getOrCreateInstance(main).hide();
}

function CloseSessionCustomerModal() {
    sessionPendingCustomer = null;
    const customerModal = document.getElementById("SessionCustomerModal");
    customerModal.addEventListener("hidden.bs.modal", () => {
        bootstrap.Modal.getOrCreateInstance(document.getElementById("CreateSessionModal")).show();
    }, { once: true });
    bootstrap.Modal.getOrCreateInstance(customerModal).hide();
}

async function AddSessionCustomer() {
    const name = document.getElementById("SessionNewCustomerName");
    const phone = document.getElementById("SessionNewCustomerPhone");
    if (!name.value.trim()) {
        ShowSessionToast("warning", "El nombre del cliente es obligatorio.");
        name.focus();
        return;
    }

    try {
        SetSessionButtonLoading("BtnCreateSessionCustomer", "SpinnerCreateSessionCustomer", "IconCreateSessionCustomer", "Guardando...");
        const response = await fetch("/Sessions/AddCustomer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.value, phone: phone.value, promotions: document.getElementById("SessionNewCustomerPromotions").checked })
        });
        if (!response.ok) {
            ShowSessionToast(response.status < 500 ? "warning" : "danger", await response.text());
            return;
        }

        const customer = await response.json();
        sessionPendingCustomer = customer;
        name.value = "";
        phone.value = "";
        document.getElementById("SessionNewCustomerPromotions").checked = false;
        ShowSessionToast("success", "Cliente registrado exitosamente.");
        const customerModal = document.getElementById("SessionCustomerModal");
        customerModal.addEventListener("hidden.bs.modal", () => {
            SelectSessionCustomer(sessionPendingCustomer);
            sessionPendingCustomer = null;
            bootstrap.Modal.getOrCreateInstance(document.getElementById("CreateSessionModal")).show();
        }, { once: true });
        bootstrap.Modal.getOrCreateInstance(customerModal).hide();
    } catch (error) {
        ShowSessionToast("danger", error.message || error);
    } finally {
        ClearSessionButtonLoading("BtnCreateSessionCustomer", "SpinnerCreateSessionCustomer", "IconCreateSessionCustomer");
    }
}

async function AddSession() {
    const customerId = document.getElementById("SessionCustomerId").value;
    const categoryId = document.getElementById("SessionCategoryId").value;
    const serviceId = document.getElementById("SessionServiceId").value;
    if (!customerId || !categoryId || !serviceId) {
        ShowSessionToast("warning", "Seleccione un cliente y un servicio.");
        return;
    }

    try {
        SetSessionButtonLoading("BtnCreateSession", "SpinnerCreateSession", "IconCreateSession", "Guardando...");
        const response = await fetch("/Sessions/AddSession", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ customerId, categoryId, serviceId })
        });
        if (!response.ok) {
            ShowSessionToast(response.status < 500 ? "warning" : "danger", await response.text());
            return;
        }

        ShowSessionToast("success", await response.text());
        bootstrap.Modal.getOrCreateInstance(document.getElementById("CreateSessionModal")).hide();
        ResetSessionForm();
        await LoadSessions();
    } catch (error) {
        ShowSessionToast("danger", error.message || error);
    } finally {
        ClearSessionButtonLoading("BtnCreateSession", "SpinnerCreateSession", "IconCreateSession");
    }
}

function InitSessionPhoneInput() {
    document.getElementById("SessionNewCustomerPhone").addEventListener("input", event => {
        event.target.value = event.target.value.replace(/[^0-9]/g, "");
    });
}

function SetSessionButtonLoading(buttonId, spinnerId, iconId, title) {
    const button = document.getElementById(buttonId);
    const spinner = document.getElementById(spinnerId);
    const icon = document.getElementById(iconId);
    spinner.style.display = "inline-flex";
    icon.style.display = "none";
    button.disabled = true;
    button.dataset.originalTitle = button.getAttribute("data-bs-title") || "";
    button.setAttribute("data-bs-title", title);
}

function ClearSessionButtonLoading(buttonId, spinnerId, iconId) {
    const button = document.getElementById(buttonId);
    const spinner = document.getElementById(spinnerId);
    const icon = document.getElementById(iconId);
    spinner.style.display = "none";
    icon.style.display = "inline-flex";
    button.disabled = false;
    button.setAttribute("data-bs-title", button.dataset.originalTitle || "");
}

function InitSessionTooltips() {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(element => {
        if (!bootstrap.Tooltip.getInstance(element)) new bootstrap.Tooltip(element);
    });
}

function ShowSessionToast(type, message) {
    if (typeof showToast === "function") showToast(type, message);
}

function FormatSessionDate(value) {
    if (!value) return "";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value : date.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
}
