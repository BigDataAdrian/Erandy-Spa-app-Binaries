document.addEventListener("DOMContentLoaded", function () {
    setActiveMenu("AttendancesModule", "AttendancesModuleHome");
    LoadTherapists();
    const btnSearch = document.getElementById('btnSearch');
    btnSearch.addEventListener('click', () => {
        LoadAttendances();
    });

    const BtnCreateAttendance = document.getElementById('BtnCreateAttendance');
    if (BtnCreateAttendance) {
        BtnCreateAttendance.addEventListener('click', async () => {
            await AddAttendance();
        });
    }

    const BtnUpdateAttendance = document.getElementById('BtnUpdateAttendance');
    if (BtnUpdateAttendance) {
        BtnUpdateAttendance.addEventListener('click', async () => {
            await UpdateAttendance();
        });
    }

    const BtnDeleteAttendance = document.getElementById('BtnDeleteAttendance');
    if (BtnDeleteAttendance) {
        BtnDeleteAttendance.addEventListener('click', async () => {
            await DeleteAttendance();
        });
    }
});

async function LoadAttendances() {
    const startDateInput = document.getElementById("startDate");
    const endDateInput = document.getElementById("endDate");

    const startDate = startDateInput ? startDateInput.value : "";
    const endDate = endDateInput ? endDateInput.value : "";

    if (!startDate || !endDate) {
        showToast("warning", "Por favor, seleccione ambas fechas para realizar la consulta.");
        return;
    }

    try {
        const url = `/Attendances/GetAttendances?StartDate=${encodeURIComponent(startDate)}&EndDate=${encodeURIComponent(endDate)}`;

        const response = await fetch(url);
        if (response.status >= 200 && response.status < 300) {
            const data = await response.json();
            document.getElementById("CardAttendance").style.display = "flex";
            const tableBody = document.querySelector("#TableAttendances tbody");
            tableBody.innerHTML = "";

            data.forEach(item => {
                const safeTherapistName = item.therapist.replace(/'/g, "\\'");

                let Options = `
                <div class="d-flex gap-2 justify-content-end">
                    <button onclick="UpdateAttendanceOpenModal(${item.id}, '${safeTherapistName}', '${item.checkin}', '${item.checkout}')" type="button" 
                            class="btn btn-sm btn-outline-primary" 
                            data-bs-toggle="tooltip" 
                            data-bs-placement="top" 
                            data-bs-title="Editar asistencia">
                        <i class="bi bi-sliders"></i>
                    </button>
                    <button onclick="DeleteAttendanceOpenModal(${item.id}, '${safeTherapistName}')" type="button" 
                            class="btn btn-sm btn-outline-danger" 
                            data-bs-toggle="tooltip" 
                            data-bs-placement="top" 
                            data-bs-title="Eliminar asistencia">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>`;

                const row = `
                <tr>
                    <td class="text-muted fw-semibold">${item.updated}</td>
                    <td class="fw-bold text-dark">${item.therapist}</td>
                    <td><span class="badge bg-light text-dark border"><i class="bi bi-clock me-1 text-primary"></i>${item.checkin}</span></td>
                    <td><span class="badge bg-light text-dark border"><i class="bi bi-clock-history me-1 text-secondary"></i>${item.checkout}</span></td>
                    <td>${Options}</td>
                </tr>`;

                tableBody.insertAdjacentHTML("beforeend", row);
            });

            const tableTooltips = tableBody.querySelectorAll('[data-bs-toggle="tooltip"]');
            tableTooltips.forEach(tooltipTriggerEl => {
                new bootstrap.Tooltip(tooltipTriggerEl);
            });
        }
        if (response.status >= 400 && response.status < 500) {
            const data = await response.text();
            showToast("warning", data);
        }

        if (response.status >= 500 && response.status < 600) {
            const data = await response.text();
            showToast("danger", data);
        }
    }
    catch (error) {
        showToast("danger", error);
    }
}
function CreateAttendanceModalOpen() {
    var CreateAttendanceModal = new bootstrap.Modal(document.getElementById("CreateAttendanceModal"));
    CreateAttendanceModal.show();
}

async function AddAttendance() {
    try {
        const Therapist = document.getElementById("CreateModalTherapist");
        const CheckIn = document.getElementById("CreateModalCheckIn");
        const CheckOut = document.getElementById("CreateModalCheckOut");

        const data = {
            TherapistId: Therapist.value,
            CheckIn: CheckIn.value,
            CheckOut: CheckOut.value
        };

        const response = await fetch("/Attendances/AddAttendance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);

            if (Therapist) Therapist.value = "";
            CheckIn.value = "";
            CheckOut.value = "";

            showToast("success", result);

            const modalElement = document.getElementById('CreateAttendanceModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();
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
function UpdateAttendanceOpenModal(Id, Therapist, CheckIn, CheckOut) {
    sessionStorage.setItem('AttendanceIdSelected', Id);

    document.getElementById("UpdateModalTherapist").value = Therapist;

    document.getElementById("UpdateModalCheckIn").value = formatDateTimeForInput(CheckIn);
    document.getElementById("UpdateModalCheckOut").value = formatDateTimeForInput(CheckOut);

    var UpdateAttendanceModal = new bootstrap.Modal(document.getElementById("UpdateAttendanceModal"));
    UpdateAttendanceModal.show();
}

function formatDateTimeForInput(dateTimeStr) {
    if (!dateTimeStr) return "";

    if (dateTimeStr.includes('T')) {
        return dateTimeStr.substring(0, 16);
    }
    let standardizedStr = dateTimeStr.replace(/\//g, '-').replace(' ', 'T');

    return standardizedStr.substring(0, 16);
}

async function UpdateAttendance() {
    try {
        const Id = sessionStorage.getItem('AttendanceIdSelected');
        const CheckIn = document.getElementById("UpdateModalCheckIn");
        const CheckOut = document.getElementById("UpdateModalCheckOut");

        const data = {
            Id: Id,
            CheckIn: CheckIn.value,
            CheckOut: CheckOut.value
        };

        const response = await fetch("/Attendances/UpdateAttendance", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);

            const modalElement = document.getElementById('UpdateAttendanceModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            LoadAttendances();
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
function DeleteAttendanceOpenModal(Id, Therapist) {
    document.getElementById("LabelModalDeleteAttendance").innerText = Therapist;
    sessionStorage.setItem('AttendanceIdSelected', Id);

    var DeleteAttendanceModal = new bootstrap.Modal(document.getElementById("DeleteAttendanceModal"));
    DeleteAttendanceModal.show();
}

async function DeleteAttendance() {
    try {
        const Id = sessionStorage.getItem('AttendanceIdSelected');

        if (!Id) {
            showToast("warning", "No se ha seleccionado ninguna asistencia para eliminar.");
            return;
        }

        const response = await fetch(`/Attendances/DeleteAttendance/${Id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);

            const modalElement = document.getElementById('DeleteAttendanceModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            if (modalInstance) modalInstance.hide();

            LoadAttendances();
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
        const response = await fetch(`/Attendances/GetTherapists`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            const select = document.getElementById("CreateModalTherapist");

            select.innerHTML = '<option value="" selected disabled>Seleccione un terapista...</option>';

            if (result && result.length > 0) {
                result.forEach(item => {
                    const option = document.createElement("option");
                    option.value = item.id;
                    option.textContent = item.name;
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