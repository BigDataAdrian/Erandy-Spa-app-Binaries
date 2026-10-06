let LaserShotTherapists = [];
let LaserShotSearchControllers = {};

document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("LaserShotsModule", "LaserShotsModuleHome");
    LoadLaserShots();
    LoadLaserShotTherapists();
    InitTooltips();
    InitLaserShotCustomerSearch("CreateModal");
    InitLaserShotCustomerSearch("UpdateModal");

    document.getElementById("BtnCreateLaserShotModal").addEventListener("click", () => CreateLaserShotModalOpen());
    document.getElementById("BtnCreateLaserShot").addEventListener("click", () => AddLaserShot());
    document.getElementById("BtnUpdateLaserShot").addEventListener("click", () => UpdateLaserShot());
    document.getElementById("BtnDeleteLaserShot").addEventListener("click", () => DeleteLaserShot());
});

async function LoadLaserShots() {
    const Tbody = document.querySelector("#LaserShotsTable tbody");

    try {
        const Response = await fetch("/LaserShots/GetLaserShots", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (Response.status >= 200 && Response.status <= 299) {
            const Result = await Response.json().catch(() => []);
            Tbody.replaceChildren();

            Result.forEach(LaserShot => {
                const Row = document.createElement("tr");
                Row.appendChild(CreateLaserShotCell(FormatLaserShotDate(LaserShot.createdDate)));
                Row.appendChild(CreateLaserShotCell(LaserShot.customer));
                Row.appendChild(CreateLaserShotCell(LaserShot.therapist));
                Row.appendChild(CreateLaserShotCell(LaserShot.startShot));
                Row.appendChild(CreateLaserShotCell(LaserShot.endShot));

                const OptionsCell = document.createElement("td");
                const ButtonGroup = document.createElement("div");
                ButtonGroup.className = "btn-group float-end";
                ButtonGroup.setAttribute("role", "group");
                ButtonGroup.setAttribute("aria-label", "Acciones");

                const DeleteButton = document.createElement("button");
                DeleteButton.type = "button";
                DeleteButton.className = "btn btn-outline-danger";
                DeleteButton.setAttribute("data-bs-toggle", "tooltip");
                DeleteButton.setAttribute("data-bs-placement", "top");
                DeleteButton.setAttribute("data-bs-title", "Eliminar registro");
                DeleteButton.innerHTML = '<i class="bi bi-trash"></i>';
                DeleteButton.addEventListener("click", () => DeleteLaserShotModalOpen(LaserShot.id, LaserShot.customer));

                const UpdateButton = document.createElement("button");
                UpdateButton.type = "button";
                UpdateButton.className = "btn btn-outline-warning";
                UpdateButton.setAttribute("data-bs-toggle", "tooltip");
                UpdateButton.setAttribute("data-bs-placement", "top");
                UpdateButton.setAttribute("data-bs-title", "Editar registro");
                UpdateButton.innerHTML = '<i class="bi bi-pencil"></i>';
                UpdateButton.addEventListener("click", () => UpdateLaserShotModalOpen(LaserShot));

                ButtonGroup.appendChild(DeleteButton);
                ButtonGroup.appendChild(UpdateButton);
                OptionsCell.appendChild(ButtonGroup);
                Row.appendChild(OptionsCell);
                Tbody.appendChild(Row);
            });

            document.getElementById("LaserShotsCount").innerText = Result.length;
            InitTooltips();
        }

        if (Response.status >= 400 && Response.status <= 499) {
            showToast("warning", await Response.text().catch(() => null));
        }

        if (Response.status >= 500 && Response.status <= 599) {
            showToast("danger", await Response.text().catch(() => null));
        }
    } catch (Error) {
        showToast("danger", Error.message || Error);
    }
}

async function LoadLaserShotTherapists() {
    try {
        const Response = await fetch("/LaserShots/GetTherapists", {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (Response.status >= 200 && Response.status <= 299) {
            LaserShotTherapists = await Response.json().catch(() => []);
            PopulateLaserShotTherapists("CreateModal", "");
            PopulateLaserShotTherapists("UpdateModal", "");
        }

        if (Response.status >= 400 && Response.status <= 499) {
            showToast("warning", await Response.text().catch(() => null));
        }

        if (Response.status >= 500 && Response.status <= 599) {
            showToast("danger", await Response.text().catch(() => null));
        }
    } catch (Error) {
        showToast("danger", Error.message || Error);
    }
}

function InitTooltips() {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(TooltipElement => {
        if (!bootstrap.Tooltip.getInstance(TooltipElement)) {
            new bootstrap.Tooltip(TooltipElement);
        }
    });

    document.querySelectorAll('[data-bs-toggle="popover"]').forEach(PopoverElement => {
        if (!bootstrap.Popover.getInstance(PopoverElement)) {
            new bootstrap.Popover(PopoverElement);
        }
    });
}

function InitLaserShotCustomerSearch(Prefix) {
    const SearchInput = document.getElementById(`${Prefix}CustomerSearch`);
    const Suggestions = document.getElementById(`${Prefix}CustomerSuggestions`);
    let SearchTimer;

    SearchInput.addEventListener("input", () => {
        document.getElementById(`${Prefix}CustomerId`).value = "";
        document.getElementById(`${Prefix}CustomerSelection`).textContent = "Ningún cliente seleccionado.";
        PopulateLaserShotTherapists(Prefix, "");
        clearTimeout(SearchTimer);
        SearchTimer = setTimeout(() => SearchLaserShotCustomers(Prefix, SearchInput.value), 150);
    });

    SearchInput.addEventListener("focus", () => {
        if (SearchInput.value.trim()) {
            SearchLaserShotCustomers(Prefix, SearchInput.value);
        }
    });

    document.addEventListener("click", Event => {
        if (!Event.target.closest(`#${Prefix}CustomerSearch, #${Prefix}CustomerSuggestions`)) {
            Suggestions.replaceChildren();
        }
    });
}

async function SearchLaserShotCustomers(Prefix, Value) {
    const Query = Value.trim();
    const Suggestions = document.getElementById(`${Prefix}CustomerSuggestions`);
    Suggestions.replaceChildren();
    if (!Query) return;

    if (LaserShotSearchControllers[Prefix]) {
        LaserShotSearchControllers[Prefix].abort();
    }
    LaserShotSearchControllers[Prefix] = new AbortController();

    try {
        const Response = await fetch(`/LaserShots/SearchCustomers?Query=${encodeURIComponent(Query)}`, {
            signal: LaserShotSearchControllers[Prefix].signal
        });
        if (!Response.ok) {
            throw new Error(await Response.text());
        }

        const Customers = await Response.json();
        if (!Customers.length) {
            const Empty = document.createElement("div");
            Empty.className = "list-group-item text-body-secondary small";
            Empty.textContent = "No se encontraron coincidencias.";
            Suggestions.appendChild(Empty);
            return;
        }

        Customers.slice(0, 20).forEach(Customer => {
            const Option = document.createElement("button");
            Option.type = "button";
            Option.className = "list-group-item list-group-item-action";
            Option.setAttribute("role", "option");
            Option.textContent = Customer.name || "Sin nombre";
            Option.addEventListener("click", () => SelectLaserShotCustomer(Prefix, Customer));
            Suggestions.appendChild(Option);
        });
    } catch (Error) {
        if (Error.name !== "AbortError") {
            showToast("danger", Error.message || Error);
        }
    }
}

function SelectLaserShotCustomer(Prefix, Customer) {
    document.getElementById(`${Prefix}CustomerSearch`).value = Customer.name || "";
    document.getElementById(`${Prefix}CustomerId`).value = Customer.id;
    document.getElementById(`${Prefix}CustomerSelection`).textContent = `Cliente seleccionado: ${Customer.name || "Sin nombre"}`;
    document.getElementById(`${Prefix}CustomerSuggestions`).replaceChildren();
    PopulateLaserShotTherapists(Prefix, "");
}

function PopulateLaserShotTherapists(Prefix, SelectedId) {
    const Select = document.getElementById(`${Prefix}TherapistId`);
    const CustomerId = document.getElementById(`${Prefix}CustomerId`).value;
    Select.replaceChildren();

    const Placeholder = document.createElement("option");
    Placeholder.value = "";
    Placeholder.textContent = CustomerId ? "Seleccione un terapista" : "Seleccione un cliente primero";
    Select.appendChild(Placeholder);

    LaserShotTherapists.forEach(Therapist => {
        const Option = document.createElement("option");
        Option.value = Therapist.id;
        Option.textContent = Therapist.name || "Sin nombre";
        Option.selected = String(Therapist.id) === String(SelectedId);
        Select.appendChild(Option);
    });

    Select.disabled = !CustomerId;
}

function CreateLaserShotCell(Value) {
    const Cell = document.createElement("td");
    Cell.textContent = Value ?? "";
    return Cell;
}

function FormatLaserShotDate(DateValue) {
    if (!DateValue || DateValue === "0001-01-01T00:00:00") return "Sin fecha";
    return new Date(DateValue).toLocaleString("es-MX", { dateStyle: "short", timeStyle: "short" });
}

function SetButtonLoading(ButtonId, LoadingTitle) {
    const Button = document.getElementById(ButtonId);
    if (!Button) return;

    const ControlName = ButtonId.replace("Btn", "");
    const Icon = document.getElementById(`Icon${ControlName}`);
    const Spinner = document.getElementById(`Spinner${ControlName}`);
    if (Icon) Icon.style.display = "none";
    if (Spinner) Spinner.style.display = "inline-flex";

    Button.setAttribute("data-original-title", Button.getAttribute("data-bs-title") || "");
    Button.disabled = true;
    const Tooltip = bootstrap.Tooltip.getInstance(Button);
    if (Tooltip) Tooltip.setContent({ ".tooltip-inner": LoadingTitle });
    Button.setAttribute("data-bs-title", LoadingTitle);
}

function ClearButtonLoading(ButtonId) {
    const Button = document.getElementById(ButtonId);
    if (!Button) return;

    const ControlName = ButtonId.replace("Btn", "");
    const Icon = document.getElementById(`Icon${ControlName}`);
    const Spinner = document.getElementById(`Spinner${ControlName}`);
    if (Spinner) Spinner.style.display = "none";
    if (Icon) Icon.style.display = "inline-flex";

    Button.disabled = false;
    const OriginalTitle = Button.getAttribute("data-original-title") || "";
    const Tooltip = bootstrap.Tooltip.getInstance(Button);
    if (Tooltip) Tooltip.setContent({ ".tooltip-inner": OriginalTitle });
    Button.setAttribute("data-bs-title", OriginalTitle);
}

function CreateLaserShotModalOpen() {
    ResetLaserShotForm("CreateModal");
    bootstrap.Modal.getOrCreateInstance(document.getElementById("CreateLaserShotModal")).show();
}

function ResetLaserShotForm(Prefix) {
    document.getElementById(`${Prefix}CustomerSearch`).value = "";
    document.getElementById(`${Prefix}CustomerId`).value = "";
    document.getElementById(`${Prefix}CustomerSelection`).textContent = "Ningún cliente seleccionado.";
    document.getElementById(`${Prefix}CustomerSuggestions`).replaceChildren();
    document.getElementById(`${Prefix}StartShot`).value = "";
    document.getElementById(`${Prefix}EndShot`).value = "";
    PopulateLaserShotTherapists(Prefix, "");
}

function ValidateLaserShotForm(Prefix) {
    const CustomerId = Number.parseInt(document.getElementById(`${Prefix}CustomerId`).value, 10);
    const TherapistId = Number.parseInt(document.getElementById(`${Prefix}TherapistId`).value, 10);
    const StartShotValue = document.getElementById(`${Prefix}StartShot`).value.trim();
    const EndShotValue = document.getElementById(`${Prefix}EndShot`).value.trim();
    const StartShot = Number(StartShotValue);
    const EndShot = Number(EndShotValue);

    if (!Number.isInteger(CustomerId) || CustomerId <= 0) {
        showToast("warning", "Debe seleccionar un cliente");
        document.getElementById(`${Prefix}CustomerSearch`).focus();
        return null;
    }
    if (!Number.isInteger(TherapistId) || TherapistId <= 0) {
        showToast("warning", "Debe seleccionar un terapista");
        document.getElementById(`${Prefix}TherapistId`).focus();
        return null;
    }
    if (!StartShotValue || !Number.isInteger(StartShot) || StartShot < 0) {
        showToast("warning", "El disparo inicial debe ser un número entero mayor o igual a cero");
        document.getElementById(`${Prefix}StartShot`).focus();
        return null;
    }
    if (!EndShotValue || !Number.isInteger(EndShot) || EndShot < 0) {
        showToast("warning", "El disparo final debe ser un número entero mayor o igual a cero");
        document.getElementById(`${Prefix}EndShot`).focus();
        return null;
    }
    if (EndShot < StartShot) {
        showToast("warning", "El disparo final no puede ser menor que el disparo inicial");
        document.getElementById(`${Prefix}EndShot`).focus();
        return null;
    }

    return { CustomerId, TherapistId, StartShot, EndShot };
}

async function AddLaserShot() {
    try {
        const Data = ValidateLaserShotForm("CreateModal");
        if (!Data) return;

        SetButtonLoading("BtnCreateLaserShot", "Guardando...");
        const Response = await fetch("/LaserShots/AddLaserShot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Data)
        });

        if (Response.status >= 200 && Response.status <= 299) {
            const Result = await Response.text().catch(() => null);
            showToast("success", Result);
            bootstrap.Modal.getInstance(document.getElementById("CreateLaserShotModal"))?.hide();
            ResetLaserShotForm("CreateModal");
            LoadLaserShots();
        }
        if (Response.status >= 400 && Response.status <= 499) showToast("warning", await Response.text().catch(() => null));
        if (Response.status >= 500 && Response.status <= 599) showToast("danger", await Response.text().catch(() => null));
    } catch (Error) {
        showToast("danger", Error.message || Error);
    } finally {
        ClearButtonLoading("BtnCreateLaserShot");
    }
}

function UpdateLaserShotModalOpen(LaserShot) {
    sessionStorage.setItem("LaserShotIdSelected", LaserShot.id);
    document.getElementById("UpdateModalCustomerSearch").value = LaserShot.customer || "";
    document.getElementById("UpdateModalCustomerId").value = LaserShot.customerId;
    document.getElementById("UpdateModalCustomerSelection").textContent = `Cliente seleccionado: ${LaserShot.customer || "Sin cliente"}`;
    document.getElementById("UpdateModalStartShot").value = LaserShot.startShot;
    document.getElementById("UpdateModalEndShot").value = LaserShot.endShot;
    PopulateLaserShotTherapists("UpdateModal", LaserShot.therapistId);
    bootstrap.Modal.getOrCreateInstance(document.getElementById("UpdateLaserShotModal")).show();
}

async function UpdateLaserShot() {
    try {
        const Data = ValidateLaserShotForm("UpdateModal");
        if (!Data) return;

        SetButtonLoading("BtnUpdateLaserShot", "Actualizando...");
        Data.Id = Number.parseInt(sessionStorage.getItem("LaserShotIdSelected"), 10);
        const Response = await fetch("/LaserShots/UpdateLaserShot", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Data)
        });

        if (Response.status >= 200 && Response.status <= 299) {
            const Result = await Response.text().catch(() => null);
            showToast("success", Result);
            bootstrap.Modal.getInstance(document.getElementById("UpdateLaserShotModal"))?.hide();
            LoadLaserShots();
        }
        if (Response.status >= 400 && Response.status <= 499) showToast("warning", await Response.text().catch(() => null));
        if (Response.status >= 500 && Response.status <= 599) showToast("danger", await Response.text().catch(() => null));
    } catch (Error) {
        showToast("danger", Error.message || Error);
    } finally {
        ClearButtonLoading("BtnUpdateLaserShot");
    }
}

function DeleteLaserShotModalOpen(Id, CustomerLabel) {
    sessionStorage.setItem("LaserShotIdSelected", Id);
    document.getElementById("LabelModalDeleteLaserShot").textContent = CustomerLabel || "Sin cliente";
    bootstrap.Modal.getOrCreateInstance(document.getElementById("DeleteLaserShotModal")).show();
}

async function DeleteLaserShot() {
    try {
        SetButtonLoading("BtnDeleteLaserShot", "Eliminando...");
        const Id = Number.parseInt(sessionStorage.getItem("LaserShotIdSelected"), 10);
        const Response = await fetch(`/LaserShots/DeleteLaserShot?LaserShotId=${Id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (Response.status >= 200 && Response.status <= 299) {
            const Result = await Response.text().catch(() => null);
            showToast("success", Result);
            bootstrap.Modal.getInstance(document.getElementById("DeleteLaserShotModal"))?.hide();
            LoadLaserShots();
        }
        if (Response.status >= 400 && Response.status <= 499) showToast("warning", await Response.text().catch(() => null));
        if (Response.status >= 500 && Response.status <= 599) showToast("danger", await Response.text().catch(() => null));
    } catch (Error) {
        showToast("danger", Error.message || Error);
    } finally {
        ClearButtonLoading("BtnDeleteLaserShot");
    }
}
