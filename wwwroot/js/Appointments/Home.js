document.addEventListener("DOMContentLoaded", function () {
    const btnUpdateAppointmentInProgress = document.getElementById('btnUpdateAppointmentInProgress');
    if (btnUpdateAppointmentInProgress) {
        btnUpdateAppointmentInProgress.addEventListener('click', () => {
            UpdateRequest(4);
        });
    }

    const btnUpdateAppointmentFinished = document.getElementById('btnUpdateAppointmentFinished');
    if (btnUpdateAppointmentFinished) {
        btnUpdateAppointmentFinished.addEventListener('click', () => {
            UpdateRequest(5);
        });
    }

    const btnUpdateAppointmentCanceled = document.getElementById('btnUpdateAppointmentCanceled');
    if (btnUpdateAppointmentCanceled) {
        btnUpdateAppointmentCanceled.addEventListener('click', () => {
            UpdateRequest(6); 
        });
    }

    const btnUpdateAppointmentMissed = document.getElementById('btnUpdateAppointmentMissed');
    if (btnUpdateAppointmentMissed) {
        btnUpdateAppointmentMissed.addEventListener('click', () => {
            UpdateRequest(7);
        });
    }
    LoadRequests();
});
async function LoadRequests() {
    try {
        const response = await fetch("/Appointments/GetAppointments");
        if (response.status >= 200 && response.status < 300) {
            const data = await response.json();

            const tableBody = document.querySelector("#TableRequests tbody");
            tableBody.innerHTML = "";

            data.forEach(item => {
                const created = getRelativeTime(item.created);
                const start = getRelativeTime(item.start);
                const end = getRelativeTime(item.end);
                const statusConfig = {
                    "Confirmada": { color: "bg-warning text-dark", icon: "bi bi-clipboard-plus" },
                    "En Curso": { color: "bg-primary text-white", icon: "bi bi-gear-wide-connected" },
                };
                const config = statusConfig[item.status] || { color: "bg-secondary", icon: "bi-question-circle" };
                const statusBadge = `<span class="badge ${config.color} d-inline-flex align-items-center">
                            <i class="${config.icon} me-1"></i> ${item.status}
                         </span>`;


                let Options = `
                        <button onclick="UpdateRequestOpenModal(${item.id})" type="button" class="btn btn-sm btn-outline-primary">
                            <i class="bi bi-sliders"></i>
                        </button>`;

                const row = `
                <tr>
                    <td>${item.contact}</td>
                    <td>${item.name}</td>
                    <td>${start}</td>
                    <td>${end}</td>
                    <td><span class="fw-bold">${item.duration}</span> <small class="text-muted"> Mins</small></td>
                    <td>${created}</td>
                    <td><span class="fw-bold">$${item.total}</span> <small class="text-muted"> MXN</small></td>
                    <td>
                        <a href="${item.payment}" target="_blank" class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-receipt"></i>
                        </a>
                    </td>
                    <td>${statusBadge}</td>
                    <td>${Options}</td>
                </tr>`;

                tableBody.insertAdjacentHTML("beforeend", row);
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
function getRelativeTime(dateString) {
    if (!dateString) return "Sin fecha";

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((date - now) / 1000);
    const absSeconds = Math.abs(diffInSeconds);
    const isFuture = diffInSeconds > 0;

    const format = (value, unit) => {
        return isFuture ? `en ${value} ${unit}` : `hace ${value} ${unit}`;
    };

    if (absSeconds < 10) return 'Justo ahora';

    if (absSeconds < 60) return format(absSeconds, "seg");

    const diffInMinutes = Math.floor(absSeconds / 60);
    if (diffInMinutes < 60) return format(diffInMinutes, "min");

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
        const unit = diffInHours > 1 ? 'hrs' : 'hr';
        return format(diffInHours, unit);
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return isFuture ? 'Mañana' : 'Ayer';

    if (diffInDays < 7) return format(diffInDays, "días");

    return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
function UpdateRequestOpenModal(id, status) {
    sessionStorage.setItem("UpdateAppointmentSelectedId", id);
    const ModalUpdateAppointment = document.getElementById('ModalUpdateAppointment');
    const modalInstance = bootstrap.Modal.getInstance(ModalUpdateAppointment) || new bootstrap.Modal(ModalUpdateAppointment);
    modalInstance.show();
    LoadItems();
}
async function LoadItems() {
    try {
        var Appointment = sessionStorage.getItem('UpdateAppointmentSelectedId');
        const response = await fetch("/Appointments/GetServices?AppointmentId=" + Appointment);
        if (response.status >= 200 && response.status < 300) {
            const data = await response.json();

            const tableBody = document.querySelector("#TableProducts tbody");
            tableBody.innerHTML = "";

            data.forEach(item => {
                const row = `
                    <tr>
                        <td>${item.service}</td>
                        <td>${item.room}</td>
                        <td>${item.therapists}</td>
                        <td>${item.start}</td>
                        <td>${item.end}</td>
                        <td>${item.duration}</td>
                    </tr>`;
                tableBody.insertAdjacentHTML("beforeend", row);
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
async function UpdateRequest(Status) {
    const url = '/Appointments/UpdateStatus';
    const ID = sessionStorage.getItem('UpdateAppointmentSelectedId');
    const body = {
        Id: ID,
        Status: Status
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (response.status >= 200 && response.status < 299) {
            const result = await response.text();
            showToast("success", result);
            LoadRequests();
            const ModalUpdateAppointment = document.getElementById('ModalUpdateAppointment');
            const ModalInstance = bootstrap.Modal.getInstance(ModalUpdateAppointment) || new bootstrap.Modal(ModalUpdateAppointment);
            ModalInstance.hide();
        }

        if (response.status >= 400 && response.status < 499) {
            const result = await response.text();
            showToast("warning", result);
        }

        if (response.status >= 500 && response.status < 599) {
            const result = await response.text();
            showToast("danger", result);
        }
    } catch (error) {
        showToast("danger", error);
    }
}