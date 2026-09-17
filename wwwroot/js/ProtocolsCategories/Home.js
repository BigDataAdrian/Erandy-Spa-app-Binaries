document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("ProtocolsCategoriesModule", "ProtocolsCategoriesModuleHome");
    LoadProtocolsCategories();
    InitTooltips();

    const BtnDeleteProtocolsCategory = document.getElementById('BtnDeleteProtocolsCategory');
    BtnDeleteProtocolsCategory.addEventListener('click', async () => {
        await DeleteProtocolsCategory();
    });

    const BtnCreateProtocolsCategoryModal = document.getElementById('BtnCreateProtocolsCategoryModal');
    BtnCreateProtocolsCategoryModal.addEventListener('click', async () => {
        await CreateProtocolsCategoryModalOpen();
    });

    const BtnCreateProtocolsCategory = document.getElementById('BtnCreateProtocolsCategory');
    BtnCreateProtocolsCategory.addEventListener('click', async () => {
        await AddProtocolsCategory();
    });

    const BtnUpdateProtocolsCategory = document.getElementById('BtnUpdateProtocolsCategory');
    BtnUpdateProtocolsCategory.addEventListener('click', async () => {
        await UpdateProtocolsCategory();
    });
});

async function LoadProtocolsCategories() {
    const Tbody = document.querySelector("#ProtocolsCategoriesTable tbody");
    Tbody.innerHTML = '<tr><td colspan="4" class="text-center"><div id="SpinnerProtocolsCategoriesTable" class="spinner-border text-primary" style="width: 18px; height: 18px; display: none; vertical-align: middle;" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>';
    document.getElementById("SpinnerProtocolsCategoriesTable").style.display = "inline-flex";

    try {
        const response = await fetch(`/ProtocolsCategories/GetProtocolsCategories`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);
            const tbody = document.querySelector("#ProtocolsCategoriesTable tbody");
            tbody.innerHTML = "";

            result.forEach(c => {
                const tr = document.createElement("tr");
                const CheckEnabled = c.enabled ? "checked" : "";
                const Name = EscapeHtml(c.name);
                const Description = EscapeHtml(c.description);
                const EncodedName = encodeURIComponent(c.name);
                const EncodedDescription = encodeURIComponent(c.description);

                tr.setAttribute("data-id", c.id);
                tr.innerHTML = `
                    <td>${Name}</td>
                    <td>${Description}</td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="ProtocolsCategoryMode?${c.id}" ${CheckEnabled} disabled>
                            <label class="form-check-label" for="ProtocolsCategoryMode?${c.id}"></label>
                        </div>
                    </td>
                    <td>
                        <div class="btn-group float-end" role="group" aria-label="Acciones">
                            <button onclick="DeleteProtocolsCategoryModalOpen(${c.id}, decodeURIComponent('${EncodedName}'))" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Eliminar categoría" class="btn btn-outline-danger">
                                <i class="bi bi-trash"></i>
                            </button>
                            <button onclick="UpdateProtocolsCategoryModalOpen(${c.id}, decodeURIComponent('${EncodedName}'), decodeURIComponent('${EncodedDescription}'), ${c.enabled})" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Editar categoría" class="btn btn-outline-warning">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });

            document.getElementById("ProtocolsCategoriesCount").innerText = result.length;
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

function SetButtonLoading(ButtonId) {
    const Button = document.getElementById(ButtonId);
    if (!Button) return;

    const Icon = Button.querySelector('i');
    const Spinner = Button.querySelector('.button-spinner');
    if (Icon) Icon.style.display = 'none';
    if (Spinner) Spinner.style.display = 'inline-flex';

    Button.setAttribute('data-original-title', Button.getAttribute('data-bs-title') || '');
    Button.setAttribute('aria-busy', 'true');
    Button.disabled = true;
}

function ClearButtonLoading(ButtonId) {
    const Button = document.getElementById(ButtonId);
    if (!Button) return;

    const Icon = Button.querySelector('i');
    const Spinner = Button.querySelector('.button-spinner');
    if (Icon) Icon.style.display = '';
    if (Spinner) Spinner.style.display = 'none';

    const OriginalTitle = Button.getAttribute('data-original-title') || '';
    Button.removeAttribute('aria-busy');
    Button.disabled = false;

    const Tooltip = bootstrap.Tooltip.getInstance(Button);
    if (Tooltip) {
        Tooltip.setContent({ '.tooltip-inner': OriginalTitle });
    }
    Button.setAttribute('data-bs-title', OriginalTitle);
}

function EscapeHtml(Value) {
    return String(Value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function CreateProtocolsCategoryModalOpen() {
    const CreateProtocolsCategoryModal = new bootstrap.Modal(document.getElementById("CreateProtocolsCategoryModal"));
    CreateProtocolsCategoryModal.show();
}

async function AddProtocolsCategory() {
    try {
        SetButtonLoading('BtnCreateProtocolsCategory');

        const Name = document.getElementById("CreateModalName");
        const Description = document.getElementById("CreateModalDescription");
        const Enabled = document.getElementById("CreateModalEnabled");
        const data = {
            Name: Name.value,
            Description: Description.value,
            Enabled: Enabled.checked
        };

        const response = await fetch("/ProtocolsCategories/AddProtocolsCategory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            Name.value = "";
            Description.value = "";
            Enabled.checked = false;
            showToast("success", result);

            const modalElement = document.getElementById('CreateProtocolsCategoryModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            LoadProtocolsCategories();
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
        ClearButtonLoading('BtnCreateProtocolsCategory');
    }
}

function UpdateProtocolsCategoryModalOpen(Id, Name, Description, Enabled) {
    sessionStorage.setItem('ProtocolsCategoryIdSelected', Id);
    document.getElementById("UpdateModalName").value = Name;
    document.getElementById("UpdateModalDescription").value = Description;
    document.getElementById("UpdateModalEnabled").checked = Enabled;

    const UpdateProtocolsCategoryModal = new bootstrap.Modal(document.getElementById("UpdateProtocolsCategoryModal"));
    UpdateProtocolsCategoryModal.show();
}

async function UpdateProtocolsCategory() {
    try {
        SetButtonLoading('BtnUpdateProtocolsCategory');

        const Id = sessionStorage.getItem('ProtocolsCategoryIdSelected');
        const Name = document.getElementById("UpdateModalName");
        const Description = document.getElementById("UpdateModalDescription");
        const Enabled = document.getElementById("UpdateModalEnabled");
        const data = {
            Id: Id,
            Name: Name.value,
            Description: Description.value,
            Enabled: Enabled.checked
        };

        const response = await fetch("/ProtocolsCategories/UpdateProtocolsCategory", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);

            const modalElement = document.getElementById('UpdateProtocolsCategoryModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            LoadProtocolsCategories();
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
        ClearButtonLoading('BtnUpdateProtocolsCategory');
    }
}

function DeleteProtocolsCategoryModalOpen(Id, ProtocolsCategoryLabel) {
    document.getElementById("LabelModalDeleteProtocolsCategory").innerText = ProtocolsCategoryLabel;
    sessionStorage.setItem('ProtocolsCategoryIdSelected', Id);
    const DeleteProtocolsCategoryModal = new bootstrap.Modal(document.getElementById("DeleteProtocolsCategoryModal"));
    DeleteProtocolsCategoryModal.show();
}

async function DeleteProtocolsCategory() {
    try {
        SetButtonLoading('BtnDeleteProtocolsCategory');

        const Id = sessionStorage.getItem('ProtocolsCategoryIdSelected');
        const response = await fetch(`/ProtocolsCategories/DeleteProtocolsCategory?ProtocolsCategoryId=${Id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);

            const modalElement = document.getElementById('DeleteProtocolsCategoryModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            LoadProtocolsCategories();
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
        ClearButtonLoading('BtnDeleteProtocolsCategory');
    }
}
