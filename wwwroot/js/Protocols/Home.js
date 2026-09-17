document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("ProtocolsModule", "ProtocolsModuleHome");
    InitTooltips();

    const CategoryId = sessionStorage.getItem('ProtocolCategoryIdSelected');
    const CategoryName = sessionStorage.getItem('ProtocolCategoryNameSelected');
    if (CategoryId && CategoryName) {
        document.getElementById("ProtocolsCategoryLabel").innerText = CategoryName;
        document.getElementById("BtnCreateProtocolModal").disabled = false;
        LoadProtocols();
    }

    const BtnSelectProtocolsCategoryModal = document.getElementById('BtnSelectProtocolsCategoryModal');
    BtnSelectProtocolsCategoryModal.addEventListener('click', async () => {
        await SelectProtocolsCategoryModalOpen();
    });

    const BtnDeleteProtocol = document.getElementById('BtnDeleteProtocol');
    BtnDeleteProtocol.addEventListener('click', async () => {
        await DeleteProtocol();
    });

    const BtnCreateProtocolModal = document.getElementById('BtnCreateProtocolModal');
    BtnCreateProtocolModal.addEventListener('click', async () => {
        await CreateProtocolModalOpen();
    });

    const BtnCreateProtocol = document.getElementById('BtnCreateProtocol');
    BtnCreateProtocol.addEventListener('click', async () => {
        await AddProtocol();
    });

    const BtnUpdateProtocol = document.getElementById('BtnUpdateProtocol');
    BtnUpdateProtocol.addEventListener('click', async () => {
        await UpdateProtocol();
    });
});

async function SelectProtocolsCategoryModalOpen() {
    const SelectProtocolsCategoryModal = new bootstrap.Modal(document.getElementById("SelectProtocolsCategoryModal"));
    SelectProtocolsCategoryModal.show();
    await LoadProtocolsCategories();
}

async function LoadProtocolsCategories() {
    const CategoriesList = document.getElementById("ProtocolsCategoriesList");
    CategoriesList.innerHTML = `<div class="text-center"><div id="SpinnerProtocolsCategories" class="spinner-border text-primary" style="width: 18px; height: 18px; display: none; vertical-align: middle;" role="status"><span class="visually-hidden">Loading...</span></div></div>`;
    document.getElementById("SpinnerProtocolsCategories").style.display = "inline-flex";

    try {
        const response = await fetch(`/Protocols/GetCategoriesSelect`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);
            const CategoriesList = document.getElementById("ProtocolsCategoriesList");
            CategoriesList.innerHTML = "";

            if (result && result.length > 0) {
                result.forEach(c => {
                    const Button = document.createElement("button");
                    const EncodedName = encodeURIComponent(c.name ?? "");
                    Button.type = "button";
                    Button.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
                    Button.setAttribute("data-bs-toggle", "tooltip");
                    Button.setAttribute("data-bs-placement", "top");
                    Button.setAttribute("data-bs-title", "Seleccionar categoría");
                    Button.innerHTML = `<span>${EscapeHtml(c.name)}</span><i class="bi bi-chevron-right"></i>`;
                    Button.addEventListener("click", () => {
                        SelectProtocolsCategory(c.id, decodeURIComponent(EncodedName));
                    });
                    CategoriesList.appendChild(Button);
                });
            } else {
                CategoriesList.innerHTML = '<div class="text-center text-body-secondary">No hay categorías activas disponibles.</div>';
            }

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

function SelectProtocolsCategory(Id, Name) {
    sessionStorage.setItem('ProtocolCategoryIdSelected', Id);
    sessionStorage.setItem('ProtocolCategoryNameSelected', Name);
    document.getElementById("ProtocolsCategoryLabel").innerText = Name;
    document.getElementById("BtnCreateProtocolModal").disabled = false;

    const SelectProtocolsCategoryModalElement = document.getElementById('SelectProtocolsCategoryModal');
    const SelectProtocolsCategoryModal = bootstrap.Modal.getInstance(SelectProtocolsCategoryModalElement);
    if (SelectProtocolsCategoryModal) SelectProtocolsCategoryModal.hide();

    LoadProtocols();
}

async function LoadProtocols() {
    try {
        const CategoryId = sessionStorage.getItem('ProtocolCategoryIdSelected');
        if (!CategoryId) {
            return;
        }

        const tbody = document.querySelector("#ProtocolsTable tbody");
        tbody.innerHTML = '<tr><td colspan="6" class="text-center"><div id="SpinnerProtocolsTable" class="spinner-border text-primary" style="width: 18px; height: 18px; display: none; vertical-align: middle;" role="status"><span class="visually-hidden">Loading...</span></div></td></tr>';
        document.getElementById("SpinnerProtocolsTable").style.display = "inline-flex";

        const response = await fetch(`/Protocols/GetProtocols?CategoryId=${CategoryId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);
            tbody.innerHTML = "";

            if (result && result.length > 0) {
                result.forEach(c => {
                    const tr = document.createElement("tr");
                    const CheckEnabled = c.enabled ? "checked" : "";
                    const Name = EscapeHtml(c.name);
                    const Description = EscapeHtml(c.description);
                    const EncodedName = EncodeForHandler(c.name);
                    const EncodedDescription = EncodeForHandler(c.description);
                    const EncodedIndications = EncodeForHandler(c.indications);
                    const EncodedWarnings = EncodeForHandler(c.warnings);
                    const IndicationsButton = c.indications ? `<button onclick="ShowProtocolTextModal(decodeURIComponent('${EncodedIndications}'), 'Indicaciones')" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Consultar indicaciones" class="btn btn-outline-info"><i class="bi bi-clipboard2-check"></i></button>` : "";
                    const WarningsButton = c.warnings ? `<button onclick="ShowProtocolTextModal(decodeURIComponent('${EncodedWarnings}'), 'Advertencias')" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Consultar advertencias" class="btn btn-outline-warning"><i class="bi bi-exclamation-triangle"></i></button>` : "";

                    tr.setAttribute("data-id", c.id);
                    tr.innerHTML = `
                        <td>${Name}</td>
                        <td>${Description}</td>
                        <td>${IndicationsButton}</td>
                        <td>${WarningsButton}</td>
                        <td>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" role="switch" id="ProtocolMode?${c.id}" ${CheckEnabled} disabled>
                                <label class="form-check-label" for="ProtocolMode?${c.id}"></label>
                            </div>
                        </td>
                        <td>
                            <div class="btn-group float-end" role="group" aria-label="Acciones">
                                <button onclick="DeleteProtocolModalOpen(${c.id}, decodeURIComponent('${EncodedName}'))" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Eliminar protocolo" class="btn btn-outline-danger">
                                    <i class="bi bi-trash"></i>
                                </button>
                                <button onclick="UpdateProtocolModalOpen(${c.id}, decodeURIComponent('${EncodedName}'), decodeURIComponent('${EncodedDescription}'), decodeURIComponent('${EncodedIndications}'), decodeURIComponent('${EncodedWarnings}'), ${c.enabled})" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Editar protocolo" class="btn btn-outline-warning">
                                    <i class="bi bi-pencil"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="6" class="text-center text-body-secondary">No hay protocolos en esta categoría.</td></tr>';
            }

            document.getElementById("ProtocolsCount").innerText = result ? result.length : 0;
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

function EncodeForHandler(Value) {
    return encodeURIComponent(String(Value ?? "")).replaceAll("'", "%27");
}

function ShowProtocolTextModal(Text, Title) {
    document.getElementById("ProtocolTextViewModalLabel").innerText = Title;
    document.getElementById("ProtocolTextViewModalBody").value = Text ?? "";

    const ProtocolTextViewModal = new bootstrap.Modal(document.getElementById("ProtocolTextViewModal"));
    ProtocolTextViewModal.show();
}

function CreateProtocolModalOpen() {
    const CategoryId = sessionStorage.getItem('ProtocolCategoryIdSelected');
    if (!CategoryId) {
        showToast("warning", "Seleccione una categoría antes de agregar un protocolo");
        return;
    }

    const CreateProtocolModal = new bootstrap.Modal(document.getElementById("CreateProtocolModal"));
    CreateProtocolModal.show();
}

async function AddProtocol() {
    try {
        SetButtonLoading('BtnCreateProtocol');

        const CategoryId = sessionStorage.getItem('ProtocolCategoryIdSelected');
        const Name = document.getElementById("CreateModalName");
        const Description = document.getElementById("CreateModalDescription");
        const Indications = document.getElementById("CreateModalIndications");
        const Warnings = document.getElementById("CreateModalWarnings");
        const Enabled = document.getElementById("CreateModalEnabled");
        const data = {
            Name: Name.value,
            Description: Description.value,
            Indications: Indications.value,
            Warnings: Warnings.value,
            Enabled: Enabled.checked,
            CategoryId: parseInt(CategoryId)
        };

        const response = await fetch("/Protocols/AddProtocol", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            Name.value = "";
            Description.value = "";
            Indications.value = "";
            Warnings.value = "";
            Enabled.checked = false;
            showToast("success", result);

            const modalElement = document.getElementById('CreateProtocolModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            LoadProtocols();
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
        ClearButtonLoading('BtnCreateProtocol');
    }
}

function UpdateProtocolModalOpen(Id, Name, Description, Indications, Warnings, Enabled) {
    sessionStorage.setItem('ProtocolIdSelected', Id);
    document.getElementById("UpdateModalName").value = Name;
    document.getElementById("UpdateModalDescription").value = Description;
    document.getElementById("UpdateModalIndications").value = Indications;
    document.getElementById("UpdateModalWarnings").value = Warnings;
    document.getElementById("UpdateModalEnabled").checked = Enabled;

    const UpdateProtocolModal = new bootstrap.Modal(document.getElementById("UpdateProtocolModal"));
    UpdateProtocolModal.show();
}

async function UpdateProtocol() {
    try {
        SetButtonLoading('BtnUpdateProtocol');

        const Id = sessionStorage.getItem('ProtocolIdSelected');
        const Name = document.getElementById("UpdateModalName");
        const Description = document.getElementById("UpdateModalDescription");
        const Indications = document.getElementById("UpdateModalIndications");
        const Warnings = document.getElementById("UpdateModalWarnings");
        const Enabled = document.getElementById("UpdateModalEnabled");
        const data = {
            Id: parseInt(Id),
            Name: Name.value,
            Description: Description.value,
            Indications: Indications.value,
            Warnings: Warnings.value,
            Enabled: Enabled.checked
        };

        const response = await fetch("/Protocols/UpdateProtocol", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);

            const modalElement = document.getElementById('UpdateProtocolModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            LoadProtocols();
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
        ClearButtonLoading('BtnUpdateProtocol');
    }
}

function DeleteProtocolModalOpen(Id, ProtocolLabel) {
    document.getElementById("LabelModalDeleteProtocol").innerText = ProtocolLabel;
    sessionStorage.setItem('ProtocolIdSelected', Id);
    const DeleteProtocolModal = new bootstrap.Modal(document.getElementById("DeleteProtocolModal"));
    DeleteProtocolModal.show();
}

async function DeleteProtocol() {
    try {
        SetButtonLoading('BtnDeleteProtocol');

        const Id = sessionStorage.getItem('ProtocolIdSelected');
        const response = await fetch(`/Protocols/DeleteProtocol?ProtocolId=${Id}`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);

            const modalElement = document.getElementById('DeleteProtocolModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            LoadProtocols();
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
        ClearButtonLoading('BtnDeleteProtocol');
    }
}
