document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("TherapistsModule", "TherapistsModuleSingleBlockings");
    LoadTherapists();
    LoadReasons();

    const BtnCreateBlockingModal = document.getElementById('BtnCreateBlockingModal');
    BtnCreateBlockingModal.addEventListener('click', async () => {
        await CreateBlockingModalOpen();
    });

    const BtnCreateBlocking = document.getElementById('BtnCreateBlocking');
    BtnCreateBlocking.addEventListener('click', async () => {
        await AddBlocking();
    });

    const BtnUpdateBlocking = document.getElementById('BtnUpdateBlocking');
    BtnUpdateBlocking.addEventListener('click', async () => {
        await UpdateBlocking();
    });

    document.getElementById("therapistsSelect").addEventListener("change", function () {
        LoadSingleBlockings();
    });

    const BtnDeleteBlocking = document.getElementById('BtnDeleteBlocking');
    BtnDeleteBlocking.addEventListener('click', async () => {
        await DeleteSingleBlocking();
    });
});

async function LoadTherapists() {
    try {
        const Branch = document.getElementById('branchesSelect');
        const response = await fetch(`/Therapists/GetTherapistsSelect`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            const select = document.getElementById("therapistsSelect");

            select.innerHTML = '<option value="" selected disabled>Seleccione un terapista...</option>';

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
async function LoadReasons() {
    try {
        const response = await fetch(`/Therapists/GetReasonsSelect`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            const createSelect = document.getElementById("CreateModalReason");
            const updateSelect = document.getElementById("UpdateModalReason");

            const defaultOption = '<option value="" selected disabled>Seleccione una razon...</option>';
            if (createSelect) createSelect.innerHTML = defaultOption;
            if (updateSelect) updateSelect.innerHTML = defaultOption;

            if (result && result.length > 0) {
                result.forEach(item => {
                    if (createSelect) {
                        const optionCreate = document.createElement("option");
                        optionCreate.value = item.value;
                        optionCreate.textContent = item.description;
                        createSelect.appendChild(optionCreate);
                    }

                    if (updateSelect) {
                        const optionUpdate = document.createElement("option");
                        optionUpdate.value = item.value;
                        optionUpdate.textContent = item.description;
                        updateSelect.appendChild(optionUpdate);
                    }
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
async function LoadSingleBlockings() {
    const Therapists = document.getElementById("therapistsSelect");
    document.getElementById('CardBlockings').style.display = "flex";
    try {
        const response = await fetch(`/Therapists/GetSingleBlockingsTable?TherapistId=${Therapists.value}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            const tableBody = document.querySelector("#BlockingsTable tbody");
            tableBody.innerHTML = "";

            if (result && result.length > 0) {
                result.forEach(item => {

                    let Check = "";
                    if (item.enabled == true) {
                        Check = "checked";
                    }

                    let Status = "";
                    if (item.status == "Futuro") {
                        Status = `<span class="badge text-bg-primary">${item.status}</span>`
                    }
                    if (item.status == "Presente") {
                        Status = `<span class="badge text-bg-success">${item.status}</span>`
                    }
                    if (item.status == "Pasado") {
                        Status = `<span class="badge text-bg-secondary">${item.status}</span>`
                    }
                    const row = `
                    <tr>
                        <td>${item.description}</td>
                        <td>${item.startDate}</td>
                        <td>${item.endDate}</td>
                        <td>${item.reason}</td>
                        <td>${Status}</td>
                        <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="BlockingMode?${item.id}" ${Check} disabled>
                            <label class="form-check-label" for="BlockingMode?${item.id}"></label>
                        </div>
                        </td>
                        <td> 
                            <div class="btn-group float-end" role="group" aria-label="Acciones">
                                <button  onclick="DeleteBlockingModalOpen(${item.id},'${item.description}')" class="btn btn-outline-danger">
                                    <i class="bi bi-trash"></i>
                                </button>
                                <button onclick="UpdateBlockingModalOpen(${item.id})" class="btn btn-outline-warning">
                                    <i class="bi bi-pencil"></i>
                                </button>
                            </div>
                        </td>
                    </tr>`;
                    tableBody.innerHTML += row;
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
function CreateBlockingModalOpen() {
    var CreateBlockingModal = new bootstrap.Modal(document.getElementById("CreateBlockingModal"));
    CreateBlockingModal.show();
}
async function AddBlocking() {
    try {
        const Therapists = document.getElementById("therapistsSelect");
        const StartDate = document.getElementById("StartDate").value;
        const StartTime = document.getElementById("StartTime").value;
        const EndDate = document.getElementById("EndDate").value;
        const EndTime = document.getElementById("EndTime").value;
        const Description = document.getElementById("CreateModalDescription").value;
        const Reason = document.getElementById("CreateModalReason").value;
        const Enabled = document.getElementById("availability").checked;

        const data = {
            TherapistId: Therapists.value,
            Description: Description,
            StartDateTime: `${StartDate}T${StartTime}`,
            EndDateTime: `${EndDate}T${EndTime}`,
            ReasonTypeId: parseInt(Reason),
            Enabled: Enabled
        };

        const response = await fetch("/Therapists/AddBlocking", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);

            document.getElementById("StartDate").value = "";
            document.getElementById("StartTime").value = "";
            document.getElementById("EndDate").value = "";
            document.getElementById("EndTime").value = "";
            document.getElementById("CreateModalDescription").value = "";
            document.getElementById("CreateModalReason").value = "";

            showToast("success", result);

            const CreateBlockingModal = document.getElementById('CreateBlockingModal');
            const modalInstance = bootstrap.Modal.getInstance(CreateBlockingModal);

            if (!modalInstance) {
                new bootstrap.Modal(CreateBlockingModal).hide();
            } else {
                modalInstance.hide();
            }
            LoadSingleBlockings();
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
async function UpdateBlockingModalOpen(BlockingId) {
    try {
        const response = await fetch(`/Therapists/GetSingleBlocking?BlockingId=${BlockingId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);
            sessionStorage.setItem("BlockingSelected", BlockingId);
            const startDateTime = new Date(result.startDate);
            const endDateTime = new Date(result.endDate);

            const startDate = startDateTime.toISOString().split('T')[0];
            const endDate = endDateTime.toISOString().split('T')[0];

            const startTime = startDateTime.toTimeString().substring(0, 5);
            const endTime = endDateTime.toTimeString().substring(0, 5);

            document.getElementById("UpdateStartDate").value = startDate;
            document.getElementById("UpdateStartTime").value = startTime;
            document.getElementById("UpdateEndDate").value = endDate;
            document.getElementById("UpdateEndTime").value = endTime;
            document.getElementById("UpdateModalDescription").value = result.description;

            document.getElementById("UpdateModalReason").value = result.reasonId;

            document.getElementById("Updateavailability").checked = result.enabled;

            const modalElement = document.getElementById('UpdateBlockingModal');
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
            modalInstance.show();
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
async function UpdateBlocking() {
    try {
        const StartDate = document.getElementById("UpdateStartDate").value;
        const StartTime = document.getElementById("UpdateStartTime").value;
        const EndDate = document.getElementById("UpdateEndDate").value;
        const EndTime = document.getElementById("UpdateEndTime").value;
        const Description = document.getElementById("UpdateModalDescription").value;
        const Reason = document.getElementById("UpdateModalReason").value;
        const Enabled = document.getElementById("Updateavailability").checked;
        const BlockingSelected = sessionStorage.getItem("BlockingSelected");

        const data = {
            BlockingId: BlockingSelected,
            Description: Description,
            StartDateTime: `${StartDate}T${StartTime}`,
            EndDateTime: `${EndDate}T${EndTime}`,
            ReasonTypeId: parseInt(Reason),
            Enabled: Enabled
        };

        const response = await fetch("/Therapists/UpdateBlocking", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);

            document.getElementById("UpdateStartDate").value = "";
            document.getElementById("UpdateStartTime").value = "";
            document.getElementById("UpdateEndDate").value = "";
            document.getElementById("UpdateEndTime").value = "";
            document.getElementById("UpdateModalDescription").value = "";
            document.getElementById("UpdateModalReason").value = "";
            document.getElementById("Updateavailability").checked = false;

            showToast("success", result);

            const UpdateBlockingModal = document.getElementById('UpdateBlockingModal');
            const modalInstance = bootstrap.Modal.getInstance(UpdateBlockingModal);

            if (!modalInstance) {
                new bootstrap.Modal(UpdateBlockingModal).hide();
            } else {
                modalInstance.hide();
            }
            LoadSingleBlockings();
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
function DeleteBlockingModalOpen(Id, Description) {
    document.getElementById("LabelModalDeleteBlocking").innerText = Description;
    sessionStorage.setItem('BlockingIdSelected', Id);
    var DeleteBlockingModal = new bootstrap.Modal(document.getElementById("DeleteBlockingModal"));
    DeleteBlockingModal.show();
}
async function DeleteSingleBlocking() {
    try {
        const Blocking = sessionStorage.getItem('BlockingIdSelected');

        const response = await fetch("/Therapists/DeleteSingleBlocking?BlockingId=" + Blocking, {
            method: "DELETE"
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);

            showToast("success", result);

            const DeleteBlockingModal = document.getElementById('DeleteBlockingModal');
            const modalInstance = bootstrap.Modal.getInstance(DeleteBlockingModal);

            if (!modalInstance) {
                new bootstrap.Modal(DeleteBlockingModal).hide();
            } else {
                modalInstance.hide();
            }
            LoadSingleBlockings();
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