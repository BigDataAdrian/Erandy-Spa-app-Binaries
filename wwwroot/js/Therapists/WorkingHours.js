document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("TherapistsModule", "TherapistsModuleWorkingHours");
    LoadBranches();

    document.getElementById("branchesSelect").addEventListener("change", function() {

        const select = document.getElementById("therapistsSelect");
        select.disabled = false;
        LoadTherapists();
    });

      document.getElementById("therapistsSelect").addEventListener("change", function() {
        const therapistId = this.value;
        if (therapistId) {
            LoadWorkingHours(therapistId);
        }
    });

    const btnUpdate = document.getElementById("btnUpdateZone");
    if (btnUpdate) {
        btnUpdate.addEventListener("click", UpdateWorkingTime);
    }
});

async function LoadBranches() {
    try {
        const response = await fetch(`/Rooms/GetBranchesSelect`, {
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
        const Branch = document.getElementById('branchesSelect');
        const response = await fetch(`/Therapists/GetTherapistsSelect?BranchId=` + Branch.value, {
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
async function LoadWorkingHours(therapistId) {
    document.getElementById('CardTherapists').style.display = "flex";
    try {
        const response = await fetch(`/Therapists/GetWorkingHoursTable?TherapistId=${therapistId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            const tableBody = document.querySelector("#HoursTable tbody");
            tableBody.innerHTML = "";

            if (result && result.length > 0) {
                result.forEach(item => {
                    const row = `
                    <tr>
                        <td>${item.day}</td>
                        <td>${item.start}</td>
                        <td>${item.end}</td>
                        <td class="text-end">
                            <button class="btn btn-sm btn-outline-secondary" 
                                onclick="EditHours(${item.id}, '${item.day}', '${item.start}', '${item.end}')">
                                <i class="bi bi-pencil"></i>
                            </button>
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
function EditHours(id, day, start, end) {
    const daySpan = document.getElementById('SelectedDayName');
    const inputStart = document.getElementById('UpdateStartTime');
    const inputEnd = document.getElementById('UpdateEndTime');
    const btnUpdate = document.getElementById('btnUpdateZone');
    
    daySpan.textContent = day;

    inputStart.value = (start === "No establecido") ? "" : start;
    inputEnd.value = (end === "No establecido") ? "" : end;

    btnUpdate.setAttribute('data-id', id);

    const modalInstance = new bootstrap.Modal(document.getElementById('UpdateHourModal'));
    modalInstance.show();
}
async function UpdateWorkingTime() {
    try {
        const id = document.getElementById("btnUpdateZone").getAttribute("data-id");
        const start = document.getElementById("UpdateStartTime").value;
        const end = document.getElementById("UpdateEndTime").value;

        if (!start || !end) {
            showToast("warning", "Por favor, complete ambos horarios.");
            return;
        }

        const data = {
            Id: parseInt(id),
            Start: start,
            End: end
        };

        const response = await fetch(`/Therapists/UpdateWorkingTime`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);

            const modalElement = document.getElementById('UpdateHourModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();

            const therapistsSelect = document.getElementById("therapistsSelect").value;
            LoadWorkingHours(therapistsSelect);
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