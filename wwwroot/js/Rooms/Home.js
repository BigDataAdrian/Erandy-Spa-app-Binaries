document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("RoomsModule", "RoomsModuleHome");
    LoadRooms();

    const BtnCreateRoomModal = document.getElementById('BtnCreateRoomModal');
    BtnCreateRoomModal.addEventListener('click', async () => {
        await CreateRoomModalOpen();
    });

    const BtnCreateRoom = document.getElementById('BtnCreateRoom');
    BtnCreateRoom.addEventListener('click', async () => {
        await AddRoom();
    });

    const BtnUpdateRoom = document.getElementById('BtnUpdateRoom');
    BtnUpdateRoom.addEventListener('click', async () => {
        await UpdateRoom();
    });

    const BtnDeleteRoom = document.getElementById('BtnDeleteRoom');
    BtnDeleteRoom.addEventListener('click', async () => {
        await DeleteRoom();
    });
});
async function LoadRooms() {
    try {
        var Branch = sessionStorage.getItem('BranchSelected');
        const response = await fetch(`/Rooms/GetRooms`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            const tbody = document.querySelector("#RoomsTable tbody");

            tbody.innerHTML = "";
            result.forEach(c => {
                const tr = document.createElement("tr");

                let Check = "";
                if (c.enabled == true) {
                    Check = "checked";
                }

                tr.setAttribute("data-id", c.roomId);
                tr.innerHTML = `
                    <td>${c.name}</td>
                    <td>${c.capacity}</td>
                    <td>${c.cleaning}</td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="RoomMode?${c.roomId}" ${Check} disabled>
                            <label class="form-check-label" for="RoomMode?${c.roomId}"></label>
                        </div>
                    </td>
                    <td> 
                        <div class="btn-group float-end" role="group" aria-label="Acciones">
                            <button  onclick="DeleteRoomModalOpen(${c.roomId},'${c.name}')" class="btn btn-outline-danger">
                                <i class="bi bi-trash"></i>
                            </button>
                            <button onclick="UpdateRoomModalOpen(${c.roomId},'${c.name}','${c.capacity}','${c.cleaning}',${c.enabled})" class="btn btn-outline-warning">
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
function CreateRoomModalOpen() {
    var CreateRoomModal = new bootstrap.Modal(document.getElementById("CreateRoomModal"));
    CreateRoomModal.show();
}
async function AddRoom() {
    try {
        const Branch = sessionStorage.getItem('BranchSelected');
        const Name = document.getElementById("CreateModalName");
        const Capacity = document.getElementById("CreateModalCapacity");
        const Cleaning = document.getElementById("CreateModalCleaning");
        const Enabled = document.getElementById("CreateModalEnabled");
        const data = {
            BranchId: Branch,
            Name: Name.value,
            Capacity: Capacity.value,
            Cleaning: Cleaning.value,
            Enabled: Enabled.checked
        };
        const response = await fetch("/Rooms/CreateRoom", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);

            document.getElementById("CreateModalName").value = "";
            document.getElementById("CreateModalCapacity").value = "";
            document.getElementById("CreateModalCleaning").value = "";
            document.getElementById("CreateModalEnabled").checked = false;

            showToast("success", result);
            const CreateRoomModal = document.getElementById('CreateRoomModal');
            const modalInstance = bootstrap.Modal.getInstance(CreateRoomModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }
            LoadRooms();

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
async function UpdateRoom() {
    try {
        const Id = sessionStorage.getItem('BranchIdSelected');
        const Name = document.getElementById("UpdateModalName");
        const Capacity = document.getElementById("UpdateModalCapacity");
        const Cleaning = document.getElementById("UpdateModalCleaning");
        const Enabled = document.getElementById("UpdateModalEnabled");
        const data = {
            Id: Id,
            Name: Name.value,
            Capacity: Capacity.value,
            Cleaning: Cleaning.value,
            Enabled: Enabled.checked
        };
        const response = await fetch("/Rooms/UpdateRoom", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const UpdateRoomModal = document.getElementById('UpdateRoomModal');
            const modalInstance = bootstrap.Modal.getInstance(UpdateRoomModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }
            LoadRooms();

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
function UpdateRoomModalOpen(Id, Name, Capacity, Cleaning, Enabled) {

    sessionStorage.setItem('BranchIdSelected', Id);
    document.getElementById("UpdateModalName").value = Name;
    document.getElementById("UpdateModalCapacity").value = Capacity;
    document.getElementById("UpdateModalCleaning").value = Cleaning;
    document.getElementById("UpdateModalEnabled").checked = Enabled;

    var UpdateRoomModal = new bootstrap.Modal(document.getElementById("UpdateRoomModal"));
    UpdateRoomModal.show();
}
function DeleteRoomModalOpen(Id, Room) {
    document.getElementById("LabelModalDeleteRoom").innerText = Room;
    sessionStorage.setItem('RoomIdSelected', Id);
    var DeleteRoomModal = new bootstrap.Modal(document.getElementById("DeleteRoomModal"));
    DeleteRoomModal.show();
}
async function DeleteRoom() {
    try {
        var Id = sessionStorage.getItem('RoomIdSelected');
        const data = {
            RoomId: Id
        };
        const response = await fetch("/Rooms/DeleteRoom", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const DeleteRoomModal = document.getElementById('DeleteRoomModal');
            const modalInstance = bootstrap.Modal.getInstance(DeleteRoomModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }

            LoadRooms();
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