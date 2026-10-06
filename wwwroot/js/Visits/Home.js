let VisitCatalogsReady;

document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("VisitsModule", "VisitsModuleHome");
    SetDefaultVisitDates();
    LoadVisits();
    VisitCatalogsReady = LoadVisitCatalogs();
    InitTooltips();

    const BtnFilterVisitsModal = document.getElementById("BtnFilterVisitsModal");
    BtnFilterVisitsModal.addEventListener("click", () => {
        FilterVisitsModalOpen();
    });

    const BtnApplyVisitFilter = document.getElementById("BtnApplyVisitFilter");
    BtnApplyVisitFilter.addEventListener("click", async () => {
        await ApplyVisitFilter();
    });

    const BtnCreateVisitModal = document.getElementById("BtnCreateVisitModal");
    BtnCreateVisitModal.addEventListener("click", () => {
        CreateVisitModalOpen();
    });

    const BtnCreateVisit = document.getElementById("BtnCreateVisit");
    BtnCreateVisit.addEventListener("click", async () => {
        await AddVisit();
    });

    const BtnUpdateVisit = document.getElementById("BtnUpdateVisit");
    BtnUpdateVisit.addEventListener("click", async () => {
        await UpdateVisit();
    });

    const BtnDeleteVisit = document.getElementById("BtnDeleteVisit");
    BtnDeleteVisit.addEventListener("click", async () => {
        await DeleteVisit();
    });

    document.getElementById("CreateModalCategory").addEventListener("change", async Event => {
        await LoadVisitServices("Create", Event.target.value);
    });
    document.getElementById("UpdateModalCategory").addEventListener("change", async Event => {
        await LoadVisitServices("Update", Event.target.value);
    });
});

async function LoadVisits(ButtonId = "") {
    const StartDate = document.getElementById("FilterModalStartDate").value;
    const EndDate = document.getElementById("FilterModalEndDate").value;

    if (!StartDate || !EndDate) {
        showToast("warning", "Seleccione la fecha inicial y la fecha final.");
        return false;
    }

    if (StartDate > EndDate) {
        showToast("warning", "La fecha inicial no puede ser mayor que la fecha final.");
        return false;
    }

    try {
        if (ButtonId) {
            SetButtonLoading(ButtonId, ButtonId === "BtnApplyVisitFilter" ? "SpinnerApplyVisitFilter" : "", ButtonId === "BtnApplyVisitFilter" ? "IconApplyVisitFilter" : "", "Cargando...");
        }

        const Url = `/Visits/GetVisits?StartDate=${encodeURIComponent(StartDate)}&EndDate=${encodeURIComponent(EndDate)}`;
        const Response = await fetch(Url);
        if (Response.status >= 200 && Response.status <= 299) {
            const Result = await Response.json().catch(() => []);
            const Tbody = document.querySelector("#VisitsTable tbody");
            Tbody.innerHTML = "";
            document.getElementById("VisitsCount").textContent = Result.length;

            if (!Result.length) {
                Tbody.innerHTML = '<tr><td colspan="5" class="text-center text-body-secondary">No hay visitas para el rango seleccionado.</td></tr>';
            }

            Result.forEach(Item => {
                const Row = document.createElement("tr");
                Row.innerHTML = `
                    <td>${FormatVisitDate(Item.createdDate)}</td>
                    <td>${EscapeVisitHtml(Item.customer)}</td>
                    <td><span class="badge text-bg-secondary">${EscapeVisitHtml(Item.category)}</span></td>
                    <td>${EscapeVisitHtml(Item.service)}</td>
                    <td class="text-end"></td>`;

                const Actions = document.createElement("div");
                Actions.className = "btn-group";
                Actions.setAttribute("role", "group");
                Actions.setAttribute("aria-label", "Acciones");

                const EditButton = CreateVisitActionButton("btn btn-sm btn-outline-warning", "bi-pencil", "Editar visita");
                EditButton.addEventListener("click", async () => {
                    await UpdateVisitModalOpen(Item.id, Item.customerId, Item.categoryId, Item.serviceId);
                });

                const DeleteButton = CreateVisitActionButton("btn btn-sm btn-outline-danger", "bi-trash", "Eliminar visita");
                DeleteButton.addEventListener("click", () => {
                    DeleteVisitModalOpen(Item.id, Item.customer);
                });

                Actions.appendChild(EditButton);
                Actions.appendChild(DeleteButton);
                Row.lastElementChild.appendChild(Actions);
                Tbody.appendChild(Row);
            });

            InitTooltips();
            return true;
        }

        if (Response.status >= 400 && Response.status <= 499) {
            showToast("warning", await Response.text().catch(() => "No fue posible cargar las visitas."));
        }
        if (Response.status >= 500 && Response.status <= 599) {
            showToast("danger", await Response.text().catch(() => "Ocurrió un error al cargar las visitas."));
        }
        return false;
    }
    catch (Error) {
        showToast("danger", Error.message || Error);
        return false;
    }
    finally {
        if (ButtonId) {
            ClearButtonLoading(ButtonId, ButtonId === "BtnApplyVisitFilter" ? "SpinnerApplyVisitFilter" : "", ButtonId === "BtnApplyVisitFilter" ? "IconApplyVisitFilter" : "");
        }
    }
}

function InitTooltips() {
    const Tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    Tooltips.forEach(TooltipElement => {
        if (!bootstrap.Tooltip.getInstance(TooltipElement)) {
            new bootstrap.Tooltip(TooltipElement);
        }
    });

    const Popovers = document.querySelectorAll('[data-bs-toggle="popover"]');
    Popovers.forEach(PopoverElement => {
        if (!bootstrap.Popover.getInstance(PopoverElement)) {
            new bootstrap.Popover(PopoverElement);
        }
    });
}

function SetButtonLoading(ButtonId, SpinnerId, IconId, LoadingTitle) {
    const Button = document.getElementById(ButtonId);
    const Spinner = document.getElementById(SpinnerId);
    const Icon = document.getElementById(IconId);
    if (!Button || !Spinner || !Icon) return;

    Spinner.style.display = "inline-flex";
    Icon.style.display = "none";
    Button.disabled = true;
    Button.setAttribute("data-original-title", Button.getAttribute("data-bs-title") || "");
    Button.setAttribute("data-bs-title", LoadingTitle);

    const Tooltip = bootstrap.Tooltip.getInstance(Button);
    if (Tooltip) {
        Tooltip.setContent({ ".tooltip-inner": LoadingTitle });
    }
}

function ClearButtonLoading(ButtonId, SpinnerId, IconId) {
    const Button = document.getElementById(ButtonId);
    const Spinner = document.getElementById(SpinnerId);
    const Icon = document.getElementById(IconId);
    if (!Button || !Spinner || !Icon) return;

    Spinner.style.display = "none";
    Icon.style.display = "inline-flex";
    Button.disabled = false;
    const OriginalTitle = Button.getAttribute("data-original-title") || "";
    Button.setAttribute("data-bs-title", OriginalTitle);

    const Tooltip = bootstrap.Tooltip.getInstance(Button);
    if (Tooltip) {
        Tooltip.setContent({ ".tooltip-inner": OriginalTitle });
    }
}

function SetDefaultVisitDates() {
    const Today = new Date();
    const DateValue = `${Today.getFullYear()}-${String(Today.getMonth() + 1).padStart(2, "0")}-${String(Today.getDate()).padStart(2, "0")}`;
    document.getElementById("FilterModalStartDate").value = DateValue;
    document.getElementById("FilterModalEndDate").value = DateValue;
}

function FilterVisitsModalOpen() {
    const FilterVisitsModal = new bootstrap.Modal(document.getElementById("FilterVisitsModal"));
    FilterVisitsModal.show();
}

async function ApplyVisitFilter() {
    const Loaded = await LoadVisits("BtnApplyVisitFilter");
    if (Loaded) {
        const ModalElement = document.getElementById("FilterVisitsModal");
        const ModalInstance = bootstrap.Modal.getInstance(ModalElement);
        if (ModalInstance) ModalInstance.hide();
    }
}

async function CreateVisitModalOpen() {
    if (VisitCatalogsReady) {
        await VisitCatalogsReady;
    }

    document.getElementById("CreateModalCustomer").value = "";
    document.getElementById("CreateModalCategory").value = "";
    ResetVisitServices("Create");

    const CreateVisitModal = new bootstrap.Modal(document.getElementById("CreateVisitModal"));
    CreateVisitModal.show();
}

async function AddVisit() {
    try {
        const CustomerId = document.getElementById("CreateModalCustomer").value;
        const CategoryId = document.getElementById("CreateModalCategory").value;
        const ServiceId = document.getElementById("CreateModalService").value;
        if (!CustomerId || !CategoryId || !ServiceId) {
            showToast("warning", "Seleccione el cliente, la categoría y el servicio.");
            return;
        }

        SetButtonLoading("BtnCreateVisit", "SpinnerCreateVisit", "IconCreateVisit", "Guardando...");
        const Response = await fetch("/Visits/AddVisit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ CustomerId: CustomerId, CategoryId: CategoryId, ServiceId: ServiceId })
        });

        if (Response.status >= 200 && Response.status <= 299) {
            const Result = await Response.text().catch(() => "Visita registrada exitosamente");
            document.getElementById("CreateModalCustomer").value = "";
            document.getElementById("CreateModalCategory").value = "";
            ResetVisitServices("Create");
            showToast("success", Result);
            const ModalElement = document.getElementById("CreateVisitModal");
            const ModalInstance = bootstrap.Modal.getInstance(ModalElement);
            if (ModalInstance) ModalInstance.hide();
            await LoadVisits();
        }
        if (Response.status >= 400 && Response.status <= 499) {
            showToast("warning", await Response.text().catch(() => "No fue posible registrar la visita."));
        }
        if (Response.status >= 500 && Response.status <= 599) {
            showToast("danger", await Response.text().catch(() => "Ocurrió un error al registrar la visita."));
        }
    }
    catch (Error) {
        showToast("danger", Error.message || Error);
    }
    finally {
        ClearButtonLoading("BtnCreateVisit", "SpinnerCreateVisit", "IconCreateVisit");
    }
}

async function UpdateVisitModalOpen(Id, CustomerId, CategoryId, ServiceId) {
    if (VisitCatalogsReady) {
        await VisitCatalogsReady;
    }

    sessionStorage.setItem("VisitIdSelected", Id);
    document.getElementById("UpdateModalCustomer").value = CustomerId;
    document.getElementById("UpdateModalCategory").value = CategoryId;
    await LoadVisitServices("Update", CategoryId);
    document.getElementById("UpdateModalService").value = ServiceId;

    const UpdateVisitModal = new bootstrap.Modal(document.getElementById("UpdateVisitModal"));
    UpdateVisitModal.show();
}

async function UpdateVisit() {
    try {
        const Id = sessionStorage.getItem("VisitIdSelected");
        const CustomerId = document.getElementById("UpdateModalCustomer").value;
        const CategoryId = document.getElementById("UpdateModalCategory").value;
        const ServiceId = document.getElementById("UpdateModalService").value;
        if (!Id || !CustomerId || !CategoryId || !ServiceId) {
            showToast("warning", "Seleccione el cliente, la categoría y el servicio.");
            return;
        }

        SetButtonLoading("BtnUpdateVisit", "SpinnerUpdateVisit", "IconUpdateVisit", "Actualizando...");
        const Response = await fetch("/Visits/UpdateVisit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Id: Id, CustomerId: CustomerId, CategoryId: CategoryId, ServiceId: ServiceId })
        });

        if (Response.status >= 200 && Response.status <= 299) {
            const Result = await Response.text().catch(() => "Visita actualizada exitosamente");
            showToast("success", Result);
            const ModalElement = document.getElementById("UpdateVisitModal");
            const ModalInstance = bootstrap.Modal.getInstance(ModalElement);
            if (ModalInstance) ModalInstance.hide();
            await LoadVisits();
        }
        if (Response.status >= 400 && Response.status <= 499) {
            showToast("warning", await Response.text().catch(() => "No fue posible actualizar la visita."));
        }
        if (Response.status >= 500 && Response.status <= 599) {
            showToast("danger", await Response.text().catch(() => "Ocurrió un error al actualizar la visita."));
        }
    }
    catch (Error) {
        showToast("danger", Error.message || Error);
    }
    finally {
        ClearButtonLoading("BtnUpdateVisit", "SpinnerUpdateVisit", "IconUpdateVisit");
    }
}

function DeleteVisitModalOpen(Id, Customer) {
    document.getElementById("LabelModalDeleteVisit").textContent = Customer;
    sessionStorage.setItem("VisitIdSelected", Id);
    const DeleteVisitModal = new bootstrap.Modal(document.getElementById("DeleteVisitModal"));
    DeleteVisitModal.show();
}

async function DeleteVisit() {
    try {
        const Id = sessionStorage.getItem("VisitIdSelected");
        if (!Id) {
            showToast("warning", "No se ha seleccionado ninguna visita para eliminar.");
            return;
        }

        SetButtonLoading("BtnDeleteVisit", "SpinnerDeleteVisit", "IconDeleteVisit", "Eliminando...");
        const Response = await fetch(`/Visits/DeleteVisit?VisitId=${encodeURIComponent(Id)}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (Response.status >= 200 && Response.status <= 299) {
            const Result = await Response.text().catch(() => "Visita eliminada exitosamente");
            showToast("success", Result);
            const ModalElement = document.getElementById("DeleteVisitModal");
            const ModalInstance = bootstrap.Modal.getInstance(ModalElement);
            if (ModalInstance) ModalInstance.hide();
            await LoadVisits();
        }
        if (Response.status >= 400 && Response.status <= 499) {
            showToast("warning", await Response.text().catch(() => "No fue posible eliminar la visita."));
        }
        if (Response.status >= 500 && Response.status <= 599) {
            showToast("danger", await Response.text().catch(() => "Ocurrió un error al eliminar la visita."));
        }
    }
    catch (Error) {
        showToast("danger", Error.message || Error);
    }
    finally {
        ClearButtonLoading("BtnDeleteVisit", "SpinnerDeleteVisit", "IconDeleteVisit");
    }
}

async function LoadVisitCatalogs() {
    await Promise.all([LoadVisitCustomers(), LoadVisitCategories()]);
}

async function LoadVisitCustomers() {
    try {
        const Response = await fetch("/Visits/GetCustomersCatalog");
        if (Response.status >= 200 && Response.status <= 299) {
            const Result = await Response.json().catch(() => []);
            ["CreateModalCustomer", "UpdateModalCustomer"].forEach(SelectId => {
                const Select = document.getElementById(SelectId);
                Select.innerHTML = '<option value="" selected disabled>Seleccione un cliente...</option>';
                Result.forEach(Item => {
                    const Option = document.createElement("option");
                    Option.value = Item.id;
                    Option.textContent = Item.name || "Sin nombre";
                    Select.appendChild(Option);
                });
            });
        }
        else {
            showToast(Response.status >= 500 ? "danger" : "warning", await Response.text().catch(() => "No fue posible cargar los clientes."));
        }
    }
    catch (Error) {
        showToast("danger", Error.message || Error);
    }
}

async function LoadVisitCategories() {
    try {
        const Response = await fetch("/Visits/GetCategoriesCatalog");
        if (Response.status >= 200 && Response.status <= 299) {
            const Result = await Response.json().catch(() => []);
            ["CreateModalCategory", "UpdateModalCategory"].forEach(SelectId => {
                const Select = document.getElementById(SelectId);
                Select.innerHTML = '<option value="" selected disabled>Seleccione una categoría...</option>';
                Result.forEach(Item => {
                    const Option = document.createElement("option");
                    Option.value = Item.id;
                    Option.textContent = Item.name || "Sin nombre";
                    Select.appendChild(Option);
                });
            });
        }
        else {
            showToast(Response.status >= 500 ? "danger" : "warning", await Response.text().catch(() => "No fue posible cargar las categorías."));
        }
    }
    catch (Error) {
        showToast("danger", Error.message || Error);
    }
}

async function LoadVisitServices(Prefix, CategoryId) {
    const Select = document.getElementById(`${Prefix}ModalService`);
    if (!CategoryId) {
        ResetVisitServices(Prefix);
        return;
    }

    Select.disabled = true;
    Select.innerHTML = '<option value="" selected disabled>Cargando servicios...</option>';
    try {
        const Response = await fetch(`/Visits/GetServicesCatalog?CategoryId=${encodeURIComponent(CategoryId)}`);
        if (Response.status >= 200 && Response.status <= 299) {
            const Result = await Response.json().catch(() => []);
            Select.innerHTML = '<option value="" selected disabled>Seleccione un servicio...</option>';
            Result.forEach(Item => {
                const Option = document.createElement("option");
                Option.value = Item.id;
                Option.textContent = Item.name || "Sin nombre";
                Select.appendChild(Option);
            });
            Select.disabled = Result.length === 0;
            if (!Result.length) {
                Select.innerHTML = '<option value="" selected disabled>No hay servicios para la categoría...</option>';
            }
        }
        else {
            ResetVisitServices(Prefix);
            showToast(Response.status >= 500 ? "danger" : "warning", await Response.text().catch(() => "No fue posible cargar los servicios."));
        }
    }
    catch (Error) {
        ResetVisitServices(Prefix);
        showToast("danger", Error.message || Error);
    }
}

function ResetVisitServices(Prefix) {
    const Select = document.getElementById(`${Prefix}ModalService`);
    Select.disabled = true;
    Select.innerHTML = '<option value="" selected disabled>Seleccione primero una categoría...</option>';
}

function CreateVisitActionButton(ButtonClass, IconClass, Title) {
    const Button = document.createElement("button");
    Button.type = "button";
    Button.className = ButtonClass;
    Button.setAttribute("data-bs-toggle", "tooltip");
    Button.setAttribute("data-bs-placement", "top");
    Button.setAttribute("data-bs-title", Title);
    const Icon = document.createElement("i");
    Icon.className = `bi ${IconClass}`;
    Button.appendChild(Icon);
    return Button;
}

function FormatVisitDate(Value) {
    if (!Value) return "";
    const DateValue = new Date(Value);
    if (Number.isNaN(DateValue.getTime())) return Value;
    return DateValue.toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
}

function EscapeVisitHtml(Value) {
    const Element = document.createElement("div");
    Element.textContent = Value || "";
    return Element.innerHTML;
}
