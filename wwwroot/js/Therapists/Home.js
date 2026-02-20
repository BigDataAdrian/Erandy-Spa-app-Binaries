document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("TherapistsModule", "TherapistsModuleHome");

    LoadBranches();
    const branchesSelect = document.getElementById('branchesSelect');
    branchesSelect.addEventListener('change', async () => {
        LoadTherapists();
    });

    const BtnCreateTherapistModal = document.getElementById('BtnCreateTherapistModal');
    BtnCreateTherapistModal.addEventListener('click', async () => {
        await CreateTherapistModalOpen();
    });

    const BtnCreateTherapist = document.getElementById('BtnCreateTherapist');
    BtnCreateTherapist.addEventListener('click', async () => {
        await AddTherapist();
    });

    const BtnDeleteTherapist = document.getElementById('BtnDeleteTherapist');
    BtnDeleteTherapist.addEventListener('click', async () => {
        await DeleteTherapist();
    });

    const BtnUpdateTherapist = document.getElementById('BtnUpdateTherapist');
    BtnUpdateTherapist.addEventListener('click', async () => {
        await UpdateTherapist();
    });
});
function CreateTherapistModalOpen() {
    var CreateTherapistModal = new bootstrap.Modal(document.getElementById("CreateTherapistModal"));
    CreateTherapistModal.show();
}
async function LoadBranches() {
    try {
        const response = await fetch(`/Therapists/GetBranchesSelect`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            const select = document.getElementById("branchesSelect");

            select.innerHTML = '<option value="" selected disabled>Seleccione una sucursal...</option>';

            if (result && result.length > 0) {
                result.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.value;
                    option.textContent = item.description;
                    select.appendChild(option);
                });
            }
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
async function LoadTherapists() {
    try {
        const branchesSelect = document.getElementById('branchesSelect');
        const response = await fetch(`/Therapists/GetTherapists?BranchId=` + branchesSelect.value, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);
            document.getElementById('CardTherapists').style.display = "flex";
            const tbody = document.querySelector("#TherapistsTable tbody");

            tbody.innerHTML = "";
            result.forEach(c => {
                const tr = document.createElement("tr");

                let Check = "";
                if (c.enabled == true) {
                    Check = "checked";
                }

                tr.setAttribute("data-id", c.therapistId);
                tr.innerHTML = `
                    <td>${c.name}</td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="TherapistMode?${c.therapistId}" ${Check} disabled>
                            <label class="form-check-label" for="TherapistMode?${c.therapistId}"></label>
                        </div>
                    </td>
                    <td> 
                        <div class="btn-group float-end" role="group" aria-label="Acciones">
                            <button  onclick="DeleteTherapistModalOpen(${c.therapistId},'${c.name}')" class="btn btn-outline-danger">
                                <i class="bi bi-trash"></i>
                            </button>
                            <button onclick="UpdateTherapistModalOpen(${c.therapistId},'${c.name}',${c.enabled})" class="btn btn-outline-warning">
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
function DeleteTherapistModalOpen(Id, Therapist) {
    document.getElementById("LabelModalDeleteTherapist").innerText = Therapist;
    sessionStorage.setItem('TherapistIdSelected', Id);
    var DeleteTherapistModal = new bootstrap.Modal(document.getElementById("DeleteTherapistModal"));
    DeleteTherapistModal.show();
}
async function DeleteTherapist() {
    try {
        var Id = sessionStorage.getItem('TherapistIdSelected');
        const data = {
            TherapistId: Id
        };
        const response = await fetch("/Therapists/DeleteTherapist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const DeleteTherapistModal = document.getElementById('DeleteTherapistModal');
            const modalInstance = bootstrap.Modal.getInstance(DeleteTherapistModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }

            LoadTherapists();
        }

        if (response.status == 400 && response.status <= 499) {
            const result = await response.text().catch(() => null);
            showToast("warning", result);
        }

        if (response.status == 500 && response.status <= 599) {
            const result = await response.text().catch(() => null);

            showToast("danger", result);
        }
    } catch (error) {
        showToast("danger", error);
    }
}
async function AddTherapist() {
    try {
        const branchesSelect = document.getElementById('branchesSelect');
        const Name = document.getElementById("CreateModalName");
        const Enabled = document.getElementById("CreateModalEnabled");
        const data = {
            Name: Name.value,
            Enabled: Enabled.checked,
            BranchId: branchesSelect.value
        };
        const response = await fetch("/Therapists/AddTherapist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);

            document.getElementById("CreateModalName").value = "";
            document.getElementById("CreateModalEnabled").checked = false;

            showToast("success", result);
            const CreateTherapistModal = document.getElementById('CreateTherapistModal');
            const modalInstance = bootstrap.Modal.getInstance(CreateTherapistModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }
            LoadTherapists();

        }

        if (response.status == 400 && response.status <= 499) {
            const result = await response.text().catch(() => null);
            showToast("warning", result);
        }

        if (response.status == 500 && response.status <= 599) {
            const result = await response.text().catch(() => null);

            showToast("danger", result);
        }
    } catch (error) {
        showToast("danger", error);
    }
}
async function UpdateTherapist() {
    try {
        const Id = sessionStorage.getItem('TherapistIdSelected');
        const Name = document.getElementById("UpdateModalName");
        const Enabled = document.getElementById("UpdateEnabled");
        const data = {
            Id: Id,
            Name: Name.value,
            Enabled: Enabled.checked
        };
        const response = await fetch("/Therapists/UpdateTherapist", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const UpdateTherapistModal = document.getElementById('UpdateTherapistModal');
            const modalInstance = bootstrap.Modal.getInstance(UpdateTherapistModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }
            LoadTherapists();

        }

        if (response.status == 400 && response.status <= 499) {
            const result = await response.text().catch(() => null);
            showToast("warning", result);
        }

        if (response.status == 500 && response.status <= 599) {
            const result = await response.text().catch(() => null);

            showToast("danger", result);
        }
    } catch (error) {
        showToast("danger", error);
    }
}
function UpdateTherapistModalOpen(Id, Name, Enabled) {

    sessionStorage.setItem('TherapistIdSelected', Id);
    document.getElementById("UpdateModalName").value = Name;
    document.getElementById("UpdateEnabled").checked = Enabled;

    var UpdateTherapistModal = new bootstrap.Modal(document.getElementById("UpdateTherapistModal"));
    UpdateTherapistModal.show();
} 