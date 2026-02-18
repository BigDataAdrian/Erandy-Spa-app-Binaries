document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("BranchesModule", "BranchesModuleHome");
    LoadBranches();

    const BtnCreateBranchModal = document.getElementById('BtnCreateBranchModal');
    BtnCreateBranchModal.addEventListener('click', async () => {
        await CreateBranchModalOpen();
    });

    const BtnCreateBranch = document.getElementById('BtnCreateBranch');
    BtnCreateBranch.addEventListener('click', async () => {
        await AddBranch();
    });

    const BtnDeleteBranch = document.getElementById('BtnDeleteBranch');
    BtnDeleteBranch.addEventListener('click', async () => {
        await DeleteBranch();
    });

    const BtnUpdateBranch = document.getElementById('BtnUpdateBranch');
    BtnUpdateBranch.addEventListener('click', async () => {
        await UpdateBranch();
    });
});
function CreateBranchModalOpen() {
    var CreateBranchModal = new bootstrap.Modal(document.getElementById("CreateBranchModal"));
    CreateBranchModal.show();
}
async function LoadBranches() {
    try {
        const response = await fetch(`/Branches/GetBranches`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            const tbody = document.querySelector("#BranchesTable tbody");

            tbody.innerHTML = "";
            result.forEach(c => {
                const tr = document.createElement("tr");

                let Check = "";
                if (c.enabled == true) {
                    Check = "checked";
                }

                tr.setAttribute("data-id", c.BranchId);
                tr.innerHTML = `
                    <td>${c.name}</td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="BranchMode?${c.branchId}" ${Check} disabled>
                            <label class="form-check-label" for="BranchMode?${c.branchId}"></label>
                        </div>
                    </td>
                    <td> 
                        <div class="btn-group float-end" role="group" aria-label="Acciones">
                            <button  onclick="DeleteBranchModalOpen(${c.branchId},'${c.name}')" class="btn btn-outline-danger">
                                <i class="bi bi-trash"></i>
                            </button>
                            <button onclick="UpdateBranchModalOpen(${c.branchId},'${c.name}',${c.enabled})" class="btn btn-outline-warning">
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
function DeleteBranchModalOpen(Id, Branch) {
    document.getElementById("LabelModalDeleteBranch").innerText = Branch;
    sessionStorage.setItem('BranchIdSelected', Id);
    var DeleteBranchModal = new bootstrap.Modal(document.getElementById("DeleteBranchModal"));
    DeleteBranchModal.show();
}
async function DeleteBranch() {
    try {
        var Id = sessionStorage.getItem('BranchIdSelected');
        const data = {
            CategoryId: Id
        };
        const response = await fetch("/Branches/DeleteBranch", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const DeleteBranchModal = document.getElementById('DeleteBranchModal');
            const modalInstance = bootstrap.Modal.getInstance(DeleteBranchModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }

            LoadBranches();
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
async function AddBranch() {
    try {
        const Name = document.getElementById("CreateModalName");
        const Enabled = document.getElementById("CreateModalEnabled");
        const data = {
            Name: Name.value,
            Enabled: Enabled.checked
        };
        const response = await fetch("/Branches/AddBranch", {
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
            const CreateBranchModal = document.getElementById('CreateBranchModal');
            const modalInstance = bootstrap.Modal.getInstance(CreateBranchModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }
            LoadBranches();

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
async function UpdateBranch() {
    try {
        const Id = sessionStorage.getItem('BranchIdSelected');
        const Name = document.getElementById("UpdateModalName");
        const Enabled = document.getElementById("UpdateEnabled");
        const data = {
            Id: Id,
            Name: Name.value,
            Enabled: Enabled.checked
        };
        const response = await fetch("/Branches/UpdateBranch", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const UpdateBranchModal = document.getElementById('UpdateBranchModal');
            const modalInstance = bootstrap.Modal.getInstance(UpdateBranchModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }
            LoadBranches();

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
function UpdateBranchModalOpen(Id, Name, Enabled) {

    sessionStorage.setItem('BranchIdSelected', Id);
    document.getElementById("UpdateModalName").value = Name;
    document.getElementById("UpdateEnabled").checked = Enabled;

    var UpdateBranchModal = new bootstrap.Modal(document.getElementById("UpdateBranchModal"));
    UpdateBranchModal.show();
}