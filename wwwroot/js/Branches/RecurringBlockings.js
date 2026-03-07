document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("BranchesModule", "BranchesModuleRecurringBlockings");
    LoadBranches();
    LoadReasons();
    document.getElementById("brancheSelect").addEventListener("change", function () {
        LoadRecurringBlockings();
    });

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

    const BtnDeleteBlocking = document.getElementById('BtnDeleteBlocking');
    BtnDeleteBlocking.addEventListener('click', async () => {
        await DeleteRecurringBlocking();
    });

});

async function LoadBranches() {
    try {
        const response = await fetch(`/Branches/GetBranchesSelect`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            const select = document.getElementById("brancheSelect");

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
async function LoadReasons() {
    try {
        const response = await fetch(`/Branches/GetReasonsSelect`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            const createSelect = document.getElementById("CreateModalReason");
            const updateSelect = document.getElementById("UpdateReason");

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
async function LoadRecurringBlockings() {
    const Branch = document.getElementById("brancheSelect");
    document.getElementById('CardBlockings').style.display = "flex";
    try {
        const response = await fetch(`/Branches/GetRecurringBlockingsTable?BranchId=${Branch.value}`, {
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
                        <td>${item.startTime}</td>
                        <td>${item.endTime}</td>
                        <td>${item.rule}</td>
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
        const Branch = document.getElementById("brancheSelect");
        const StartDate = document.getElementById("StartDate").value;
        const StartTime = document.getElementById("StartTime").value;
        const EndDate = document.getElementById("EndDate").value;
        const EndTime = document.getElementById("EndTime").value;
        const Description = document.getElementById("CreateModalDescription").value;
        const Reason = document.getElementById("CreateModalReason").value;
        const Enabled = document.getElementById("availability").checked;

        const dayCodes = {
            "checkLunes": "MO",
            "checkMartes": "TU",
            "checkMiercoles": "WE",
            "checkJueves": "TH",
            "checkViernes": "FR",
            "checkSabado": "SA",
            "checkDomingo": "SU"
        };

        let selectedDays = [];
        for (const [id, code] of Object.entries(dayCodes)) {
            const el = document.getElementById(id);
            if (el && el.checked) {
                selectedDays.push(code);
            }
        }

        let recurringRule = "";
        if (selectedDays.length > 0) {
            recurringRule = `FREQ=WEEKLY;BYDAY=${selectedDays.join(",")}`;
        }

        const data = {
            BranchId: Branch.value,
            Description: Description,
            ReasonTypeId: parseInt(Reason),
            Enabled: Enabled,
            RecurringRule: recurringRule,
            RecurringStartDate: StartDate,
            RecurringEndDate: EndDate,
            StartTime: StartTime,
            EndTime: EndTime
        };

        const response = await fetch("/Branches/AddRecurringBlocking", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);

            ["StartDate", "StartTime", "EndDate", "EndTime", "CreateModalDescription", "CreateModalReason"].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = "";
            });

            Object.keys(dayCodes).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.checked = false;
            });

            document.getElementById("availability").checked = false;

            showToast("success", result);

            const modalEl = document.getElementById('CreateBlockingModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
            modalInstance.hide();

            LoadRecurringBlockings();
        } else {
            const result = await response.text().catch(() => "Error desconocido");
            showToast(response.status >= 500 ? "danger" : "warning", result);
        }
    } catch (error) {
        showToast("danger", error.message || error);
    }
}
async function UpdateBlockingModalOpen(BlockingId) {
    try {
        const response = await fetch(`/Branches/GetRecurringBlocking?BlockingId=${BlockingId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" }
        });

        if (response.ok) {
            const result = await response.json();
            sessionStorage.setItem("BlockingSelected", BlockingId);

            document.getElementById("UpdateStartDate").value = result.startDate;
            document.getElementById("UpdateEndDate").value = result.endDate;
            document.getElementById("UpdateStartTime").value = result.startTime.substring(0, 5);
            document.getElementById("UpdateEndTime").value = result.endTime.substring(0, 5);
            document.getElementById("UpdateDescription").value = result.description;
            document.getElementById("UpdateReason").value = result.reasonId;
            document.getElementById("UpdateAvailability").checked = result.enabled;

            const dayMap = {
                "MO": "UpdatecheckLunes",
                "TU": "UpdatecheckMartes",
                "WE": "UpdatecheckMiercoles",
                "TH": "UpdatecheckJueves",
                "FR": "UpdatecheckViernes",
                "SA": "UpdatecheckSabado",
                "SU": "UpdatecheckDomingo"
            };

            Object.values(dayMap).forEach(id => {
                const el = document.getElementById(id);
                if (el) el.checked = false;
            });

            if (result.rule && result.rule.includes("BYDAY=")) {
                const daysPart = result.rule.split("BYDAY=")[1];
                const daysArray = daysPart.split(",");

                daysArray.forEach(dayCode => {
                    const checkboxId = dayMap[dayCode];
                    if (checkboxId) {
                        const checkbox = document.getElementById(checkboxId);
                        if (checkbox) checkbox.checked = true;
                    }
                });
            }

            const modalElement = document.getElementById('UpdateBlockingModal');
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
            modalInstance.show();

        } else {
            const errorText = await response.text();
            showToast("warning", errorText);
        }

    } catch (error) {
        showToast("danger", "Error de conexión: " + error.message);
    }
}
async function UpdateBlocking() {
    try {
        const BlockingId = sessionStorage.getItem("BlockingSelected");
        const StartDate = document.getElementById("UpdateStartDate").value;
        const StartTime = document.getElementById("UpdateStartTime").value;
        const EndDate = document.getElementById("UpdateEndDate").value;
        const EndTime = document.getElementById("UpdateEndTime").value;
        const Description = document.getElementById("UpdateDescription").value;
        const Reason = document.getElementById("UpdateReason").value;
        const Enabled = document.getElementById("UpdateAvailability").checked;

        const dayCodes = {
            "UpdatecheckLunes": "MO",
            "UpdatecheckMartes": "TU",
            "UpdatecheckMiercoles": "WE",
            "UpdatecheckJueves": "TH",
            "UpdatecheckViernes": "FR",
            "UpdatecheckSabado": "SA",
            "UpdatecheckDomingo": "SU"
        };

        let selectedDays = [];
        for (const [id, code] of Object.entries(dayCodes)) {
            const el = document.getElementById(id);
            if (el && el.checked) {
                selectedDays.push(code);
            }
        }

        let recurringRule = "";
        if (selectedDays.length > 0) {
            recurringRule = `FREQ=WEEKLY;BYDAY=${selectedDays.join(",")}`;
        }

        const data = {
            Id: parseInt(BlockingId),
            Description: Description,
            ReasonId: parseInt(Reason),
            Enabled: Enabled,
            Rule: recurringRule,
            StartDate: StartDate,
            EndDate: EndDate,
            StartTime: StartTime,
            EndTime: EndTime
        };

        const response = await fetch("/Branches/UpdateRecurringBlocking", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            const result = await response.text();
            showToast("success", result || "Bloqueo actualizado correctamente");

            const modalEl = document.getElementById('UpdateBlockingModal');
            const modalInstance = bootstrap.Modal.getInstance(modalEl);
            if (modalInstance) modalInstance.hide();

            LoadRecurringBlockings();
        } else {
            const errorText = await response.text();
            showToast(response.status >= 500 ? "danger" : "warning", errorText);
        }

    } catch (error) {
        console.error(error);
        showToast("danger", "Error al procesar la solicitud");
    }
}
function DeleteBlockingModalOpen(Id, Description) {
    document.getElementById("LabelModalDeleteBlocking").innerText = Description;
    sessionStorage.setItem('BlockingIdSelected', Id);
    var DeleteBlockingModal = new bootstrap.Modal(document.getElementById("DeleteBlockingModal"));
    DeleteBlockingModal.show();
}
async function DeleteRecurringBlocking() {
    try {
            const Blocking = sessionStorage.getItem('BlockingIdSelected');

        const response = await fetch("/Branches/DeleteRecurringBlocking?BlockingId=" + Blocking, {
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
            LoadRecurringBlockings();
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