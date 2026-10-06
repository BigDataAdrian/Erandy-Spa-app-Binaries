document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("CustomersModule", "CustomersModuleHome");
    LoadCustomers();
    InitTooltips();
    InitPhoneInputs();

    const BtnDeleteCustomer = document.getElementById('BtnDeleteCustomer');
    BtnDeleteCustomer.addEventListener('click', async () => {
        await DeleteCustomer();
    });

    const BtnCreateCustomerModal = document.getElementById('BtnCreateCustomerModal');
    BtnCreateCustomerModal.addEventListener('click', async () => {
        await CreateCustomerModalOpen();
    });

    const BtnCreateCustomer = document.getElementById('BtnCreateCustomer');
    BtnCreateCustomer.addEventListener('click', async () => {
        await AddCustomer();
    });

    const BtnUpdateCustomer = document.getElementById('BtnUpdateCustomer');
    BtnUpdateCustomer.addEventListener('click', async () => {
        await UpdateCustomer();
    });
});

async function LoadCustomers() {
    const tbody = document.querySelector("#CustomersTable tbody");

    try {
        const response = await fetch(`/Customers/GetCustomers`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);
            tbody.innerHTML = "";

            result.forEach(c => {
                const tr = document.createElement("tr");
                const Promotions = c.promotions ? "checked" : "";
                const CreatedDate = FormatCustomerDate(c.createdDate);

                tr.setAttribute("data-id", c.id);
                tr.innerHTML = `
                    <td>${c.name}</td>
                    <td>${c.phone}</td>
                    <td>${CreatedDate}</td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="CustomerPromotions?${c.id}" ${Promotions} disabled>
                            <label class="form-check-label" for="CustomerPromotions?${c.id}"></label>
                        </div>
                    </td>
                    <td>
                        <div class="btn-group float-end" role="group" aria-label="Acciones">
                            <button onclick="DeleteCustomerModalOpen(${c.id},'${c.name}')" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Eliminar cliente" class="btn btn-outline-danger">
                                <i class="bi bi-trash"></i>
                            </button>
                            <button onclick="UpdateCustomerModalOpen(${c.id},'${c.name}','${c.phone}',${c.promotions})" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Editar cliente" class="btn btn-outline-warning">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>
                    </td>
                `;

                tbody.appendChild(tr);
            });

            document.getElementById("CustomersCount").innerText = result.length;
            InitTooltips();
        }

        if (response.status >= 400 && response.status <= 499) {
            const result = await response.text().catch(() => null);
            showToast("warning", result);
        }

        if (response.status >= 500 && response.status <= 599) {
            const result = await response.text().catch(() => null);
            showToast("danger", result);
        }
    } catch (error) {
        showToast("danger", error);
    }
}

function InitTooltips() {
    const Tooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    Tooltips.forEach(t => {
        if (!bootstrap.Tooltip.getInstance(t)) {
            new bootstrap.Tooltip(t);
        }
    });

    const Popovers = document.querySelectorAll('[data-bs-toggle="popover"]');
    Popovers.forEach(p => {
        if (!bootstrap.Popover.getInstance(p)) {
            new bootstrap.Popover(p);
        }
    });
}

function InitPhoneInputs() {
    const PhoneInputs = document.querySelectorAll('#CreateModalPhone, #UpdateModalPhone');
    PhoneInputs.forEach(PhoneInput => {
        PhoneInput.addEventListener('input', () => {
            PhoneInput.value = PhoneInput.value.replace(/[^0-9]/g, '');
        });
    });
}

function ValidateCustomerData(Name, Phone) {
    if (!Name.value.trim()) {
        showToast("warning", "El nombre del cliente es obligatorio");
        Name.focus();
        return false;
    }

    if (Phone.value && !/^[0-9]+$/.test(Phone.value)) {
        showToast("warning", "El teléfono solo debe contener números");
        Phone.focus();
        return false;
    }

    return true;
}

function SetButtonLoading(ButtonId, SpinnerId, IconId, LoadingTitle) {
    const Button = document.getElementById(ButtonId);
    const Spinner = document.getElementById(SpinnerId);
    const Icon = document.getElementById(IconId);
    if (!Button || !Spinner || !Icon) return;

    Spinner.style.display = "inline-flex";
    Icon.style.display = "none";
    Button.setAttribute('data-original-title', Button.getAttribute('data-bs-title') || '');
    Button.disabled = true;

    const Tooltip = bootstrap.Tooltip.getInstance(Button);
    if (Tooltip) {
        Tooltip.setContent({ '.tooltip-inner': LoadingTitle });
    }
    Button.setAttribute('data-bs-title', LoadingTitle);
}

function ClearButtonLoading(ButtonId, SpinnerId, IconId) {
    const Button = document.getElementById(ButtonId);
    const Spinner = document.getElementById(SpinnerId);
    const Icon = document.getElementById(IconId);
    if (!Button || !Spinner || !Icon) return;

    Spinner.style.display = "none";
    Icon.style.display = "inline-flex";
    const OriginalTitle = Button.getAttribute('data-original-title') || '';
    Button.disabled = false;

    const Tooltip = bootstrap.Tooltip.getInstance(Button);
    if (Tooltip) {
        Tooltip.setContent({ '.tooltip-inner': OriginalTitle });
    }
    Button.setAttribute('data-bs-title', OriginalTitle);
}

function CreateCustomerModalOpen() {
    var CreateCustomerModal = new bootstrap.Modal(document.getElementById("CreateCustomerModal"));
    CreateCustomerModal.show();
}

async function AddCustomer() {
    try {
        const Name = document.getElementById("CreateModalName");
        const Phone = document.getElementById("CreateModalPhone");
        const Promotions = document.getElementById("CreateModalPromotions");
        if (!ValidateCustomerData(Name, Phone)) return;

        SetButtonLoading('BtnCreateCustomer', 'SpinnerCreateCustomer', 'IconCreateCustomer', 'Guardando...');
        const data = {
            Name: Name.value,
            Phone: Phone.value,
            Promotions: Promotions.checked
        };

        const response = await fetch("/Customers/AddCustomer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            Name.value = "";
            Phone.value = "";
            Promotions.checked = false;

            showToast("success", result);
            const modalElement = document.getElementById('CreateCustomerModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            LoadCustomers();
        }

        if (response.status >= 400 && response.status <= 499) {
            const result = await response.text().catch(() => null);
            showToast("warning", result);
        }

        if (response.status >= 500 && response.status <= 599) {
            const result = await response.text().catch(() => null);
            showToast("danger", result);
        }
    } catch (error) {
        showToast("danger", error);
    } finally {
        ClearButtonLoading('BtnCreateCustomer', 'SpinnerCreateCustomer', 'IconCreateCustomer');
    }
}

function UpdateCustomerModalOpen(Id, Name, Phone, Promotions) {
    sessionStorage.setItem('CustomerIdSelected', Id);
    document.getElementById("UpdateModalName").value = Name;
    document.getElementById("UpdateModalPhone").value = Phone;
    document.getElementById("UpdateModalPromotions").checked = Promotions;

    var UpdateCustomerModal = new bootstrap.Modal(document.getElementById("UpdateCustomerModal"));
    UpdateCustomerModal.show();
}

async function UpdateCustomer() {
    try {
        const Id = sessionStorage.getItem('CustomerIdSelected');
        const Name = document.getElementById("UpdateModalName");
        const Phone = document.getElementById("UpdateModalPhone");
        const Promotions = document.getElementById("UpdateModalPromotions");
        if (!ValidateCustomerData(Name, Phone)) return;

        SetButtonLoading('BtnUpdateCustomer', 'SpinnerUpdateCustomer', 'IconUpdateCustomer', 'Actualizando...');
        const data = {
            Id: Id,
            Name: Name.value,
            Phone: Phone.value,
            Promotions: Promotions.checked
        };

        const response = await fetch("/Customers/UpdateCustomer", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const modalElement = document.getElementById('UpdateCustomerModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            LoadCustomers();
        }

        if (response.status >= 400 && response.status <= 499) {
            const result = await response.text().catch(() => null);
            showToast("warning", result);
        }

        if (response.status >= 500 && response.status <= 599) {
            const result = await response.text().catch(() => null);
            showToast("danger", result);
        }
    } catch (error) {
        showToast("danger", error);
    } finally {
        ClearButtonLoading('BtnUpdateCustomer', 'SpinnerUpdateCustomer', 'IconUpdateCustomer');
    }
}

function DeleteCustomerModalOpen(Id, CustomerLabel) {
    document.getElementById("LabelModalDeleteCustomer").innerText = CustomerLabel;
    sessionStorage.setItem('CustomerIdSelected', Id);
    var DeleteCustomerModal = new bootstrap.Modal(document.getElementById("DeleteCustomerModal"));
    DeleteCustomerModal.show();
}

async function DeleteCustomer() {
    try {
        SetButtonLoading('BtnDeleteCustomer', 'SpinnerDeleteCustomer', 'IconDeleteCustomer', 'Eliminando...');
        var Id = sessionStorage.getItem('CustomerIdSelected');
        const response = await fetch(`/Customers/DeleteCustomer?CustomerId=${Id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const modalElement = document.getElementById('DeleteCustomerModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            LoadCustomers();
        }

        if (response.status >= 400 && response.status <= 499) {
            const result = await response.text().catch(() => null);
            showToast("warning", result);
        }

        if (response.status >= 500 && response.status <= 599) {
            const result = await response.text().catch(() => null);
            showToast("danger", result);
        }
    } catch (error) {
        showToast("danger", error);
    } finally {
        ClearButtonLoading('BtnDeleteCustomer', 'SpinnerDeleteCustomer', 'IconDeleteCustomer');
    }
}

function FormatCustomerDate(DateValue) {
    if (!DateValue || DateValue === "0001-01-01T00:00:00") return "Sin fecha";
    return new Date(DateValue).toLocaleDateString('es-MX');
}

