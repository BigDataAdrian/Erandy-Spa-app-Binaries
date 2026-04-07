document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("PackagesModule", "PackagesModuleHome");
    LoadPackages();

    const BtnDeletePackage = document.getElementById('BtnDeletePackage');
    BtnDeletePackage.addEventListener('click', async () => {
        await DeletePackage();
    });

    const BtnCreatePackageModal = document.getElementById('BtnCreatePackageModal');
    BtnCreatePackageModal.addEventListener('click', async () => {
        await CreatePackageModalOpen();
    });

    const BtnCreatePackage = document.getElementById('BtnCreatePackage');
    BtnCreatePackage.addEventListener('click', async () => {
        await AddPackage();
    });

    const BtnUpdatePackage = document.getElementById('BtnUpdatePackage');
    BtnUpdatePackage.addEventListener('click', async () => {
        await UpdatePackage();
    });
});

async function LoadPackages() {
    try {
        const response = await fetch(`/Packages/GetPackages`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);
            const tbody = document.querySelector("#PackagesTable tbody");
            tbody.innerHTML = "";

            result.forEach(c => {
                const tr = document.createElement("tr");
                let CheckEnabled = c.enabled ? "checked" : "";
                let CheckGift = c.gift ? "checked" : "";

                tr.setAttribute("data-id", c.id);
                tr.innerHTML = `
                    <td>${c.sessions}</td>
                    <td>${c.discount}%</td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" ${CheckGift} disabled>
                        </div>
                    </td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="PackageMode?${c.id}" ${CheckEnabled} disabled>
                            <label class="form-check-label" for="PackageMode?${c.id}"></label>
                        </div>
                    </td>
                    <td> 
                        <div class="btn-group float-end" role="group" aria-label="Acciones">
                            <button onclick="DeletePackageModalOpen(${c.id},'${c.sessions} Sesiones')" class="btn btn-outline-danger">
                                <i class="bi bi-trash"></i>
                            </button>
                            <button onclick="UpdatePackageModalOpen(${c.id},'${c.sessions}','${c.discount}',${c.gift},${c.enabled})" class="btn btn-outline-warning">
                                <i class="bi bi-pencil"></i>
                            </button>
                        </div>
                    </td>
                `;
                tbody.appendChild(tr);
            });
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

function DeletePackageModalOpen(Id, PackageLabel) {
    document.getElementById("LabelModalDeletePackage").innerText = PackageLabel;
    sessionStorage.setItem('PackageIdSelected', Id);
    var DeletePackageModal = new bootstrap.Modal(document.getElementById("DeletePackageModal"));
    DeletePackageModal.show();
}

async function DeletePackage() {
    try {
        var Id = sessionStorage.getItem('PackageIdSelected');
        const data = { PackageId: Id };
        const response = await fetch("/Packages/DeletePackage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const modalElement = document.getElementById('DeletePackageModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            LoadPackages();
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

function CreatePackageModalOpen() {
    var CreatePackageModal = new bootstrap.Modal(document.getElementById("CreatePackageModal"));
    CreatePackageModal.show();
}

async function AddPackage() {
    try {
        const Sessions = document.getElementById("CreateModalSessions");
        const Enabled = document.getElementById("CreateModalEnabled");
        const Discount = document.getElementById("CreateModalDiscount");
        const Gift = document.getElementById("CreateModalGift");

        const data = {
            Sessions: Sessions.value,
            Discount: Discount.value,
            Gift: Gift.checked,
            Enabled: Enabled.checked
        };
        const response = await fetch("/Packages/AddPackage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            Sessions.value = "";
            Enabled.checked = false;
            Discount.value = "";
            Gift.checked = false;

            showToast("success", result);
            const modalElement = document.getElementById('CreatePackageModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            LoadPackages();
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

async function UpdatePackage() {
    try {
        const Id = sessionStorage.getItem('PackageIdSelected');
        const Sessions = document.getElementById("UpdateModalSessions");
        const Enabled = document.getElementById("UpdateModalEnabled");
        const Discount = document.getElementById("UpdateModalDiscount");
        const Gift = document.getElementById("UpdateModalGift");

        const data = {
            Id: Id,
            Sessions: Sessions.value,
            Discount: Discount.value,
            Gift: Gift.checked,
            Enabled: Enabled.checked
        };
        const response = await fetch("/Packages/UpdatePackage", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const modalElement = document.getElementById('UpdatePackageModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
            LoadPackages();
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

function UpdatePackageModalOpen(Id, Sessions, Discount, Gift, Enabled) {
    sessionStorage.setItem('PackageIdSelected', Id);
    document.getElementById("UpdateModalSessions").value = Sessions;
    document.getElementById("UpdateModalDiscount").value = Discount;
    document.getElementById("UpdateModalGift").checked = Gift;
    document.getElementById("UpdateModalEnabled").checked = Enabled;

    var UpdatePackageModal = new bootstrap.Modal(document.getElementById("UpdatePackageModal"));
    UpdatePackageModal.show();
}