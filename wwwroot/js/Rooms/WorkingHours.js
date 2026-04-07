document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("RoomsModule", "RoomsModuleWorkingHours");
    LoadRooms();

    document.getElementById("roomsSelect").addEventListener("change", function () {
        const roomId = this.value;
        if (roomId) {
            LoadWorkingHours(roomId);
        }
    });

    const btnUpdate = document.getElementById("btnUpdateZone");
    if (btnUpdate) {
        btnUpdate.addEventListener("click", UpdateWorkingTime);
    }
});

async function LoadRooms() {
    try {
        const Branch = document.getElementById('branchesSelect');
        const response = await fetch(`/Rooms/GetRoomsSelect`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            const select = document.getElementById("roomsSelect");

            select.innerHTML = '<option value="" selected disabled>Seleccione una habitacion...</option>';

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
async function LoadWorkingHours(roomId) {
    document.getElementById('CardRooms').style.display = "flex";
    try {
        const response = await fetch(`/Rooms/GetWorkingHoursTable?RoomId=${roomId}`, {
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

        const response = await fetch(`/Rooms/UpdateWorkingTime`, {
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

            const RoomId = document.getElementById("roomsSelect").value;
            LoadWorkingHours(RoomId);
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