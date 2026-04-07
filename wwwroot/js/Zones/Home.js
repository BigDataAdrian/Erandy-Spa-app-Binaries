document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("ZonesModule", "ZonesModuleHome");
    LoadZones();

    const BtnDeleteZone = document.getElementById('BtnDeleteZone');
    BtnDeleteZone.addEventListener('click', async () => {
        await DeleteZone();
    });

    const BtnCreateZoneModal = document.getElementById('BtnCreateZoneModal');
    BtnCreateZoneModal.addEventListener('click', async () => {
        await CreateZoneModalOpen();
    });

    const BtnCreateQuestion = document.getElementById('BtnCreateZone');
    BtnCreateQuestion.addEventListener('click', async () => {
        await AddZone();
    });

    const BtnUpdateZone = document.getElementById('BtnUpdateZone');
    BtnUpdateZone.addEventListener('click', async () => {
        await UpdateZone();
    });
});

async function LoadZones() {
    try {
        const response = await fetch(`/Zones/GetZones`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            const tbody = document.querySelector("#ZonesTable tbody");

            tbody.innerHTML = "";
            result.forEach(c => {
                const tr = document.createElement("tr");

                let Check = "";
                if (c.enabled == true) {
                    Check = "checked";
                }

                tr.setAttribute("data-id", c.id);
                tr.innerHTML = `
                    <td>${c.name}</td>
                    <td>${c.description}</td>
                    <td>$${c.price}</td>
                    <td>${c.duration}</td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="ZoneMode?${c.id}" ${Check} disabled>
                            <label class="form-check-label" for="ZoneMode?${c.id}"></label>
                        </div>
                    </td>
                    <td> 
                        <div class="btn-group float-end" role="group" aria-label="Acciones">
                            <button  onclick="DeleteZoneModalOpen(${c.id},'${c.name}')" class="btn btn-outline-danger">
                                <i class="bi bi-trash"></i>
                            </button>
                            <button onclick="UpdateZoneModalOpen(${c.id},'${c.name}','${c.description}',${c.enabled},${c.price},${c.duration})" class="btn btn-outline-warning">
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
function DeleteZoneModalOpen(Id, Zone) {
    document.getElementById("LabelModalDeleteZone").innerText = Zone;
    sessionStorage.setItem('ZoneIdSelected', Id);
    var DeleteZoneModal = new bootstrap.Modal(document.getElementById("DeleteZoneModal"));
    DeleteZoneModal.show();
}
async function DeleteZone() {
    try {
        var Id = sessionStorage.getItem('ZoneIdSelected');
        const data = {
            ZoneId: Id
        };
        const response = await fetch("/Zones/DeleteZone", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const DeleteZoneModal = document.getElementById('DeleteZoneModal');
            const modalInstance = bootstrap.Modal.getInstance(DeleteZoneModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }

            LoadZones();
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
function CreateZoneModalOpen() {
    var CreateZoneModal = new bootstrap.Modal(document.getElementById("CreateZoneModal"));
    CreateZoneModal.show();
}
async function AddZone() {
    try {
        const Name = document.getElementById("CreateModalName");
        const Description = document.getElementById("CreateModalDescription");
        const Enabled = document.getElementById("CreateModalEnabled");
        const Price = document.getElementById("CreateModalPrice");
        const Duration = document.getElementById("CreateModalDuration");

        const data = {
            Name: Name.value,
            Description: Description.value,
            Enabled: Enabled.checked,
            Price: Price.value,
            Duration: Duration.value
        };
        const response = await fetch("/Zones/AddZone", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);

            document.getElementById("CreateModalName").value = "";
            document.getElementById("CreateModalDescription").value = "";
            document.getElementById("CreateModalEnabled").checked = false;
            document.getElementById("CreateModalPrice").value = "";
            document.getElementById("CreateModalDuration").value = "";

            showToast("success", result);
            const CreateZoneModal = document.getElementById('CreateZoneModal');
            const modalInstance = bootstrap.Modal.getInstance(CreateZoneModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }
            LoadZones();

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
async function UpdateZone() {
    try {
        const Id = sessionStorage.getItem('ZoneIdSelected');
        const Name = document.getElementById("UpdateModalName");
        const Description = document.getElementById("UpdateModalDescription");
        const Enabled = document.getElementById("UpdateEnabled");
        const Price = document.getElementById("UpdateModalPrice");
        const Duration = document.getElementById("UpdateModalDuration");

        const data = {
            Id: Id,
            Name: Name.value,
            Description: Description.value,
            Price: Price.value,
            Duration: Duration.value,
            Enabled: Enabled.checked
        };
        const response = await fetch("/Zones/UpdateZone", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const UpdateZoneModal = document.getElementById('UpdateZoneModal');
            const modalInstance = bootstrap.Modal.getInstance(UpdateZoneModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }
            LoadZones();

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
function UpdateZoneModalOpen(Id, Name, Description, Enabled,Price,Duration) {

    sessionStorage.setItem('ZoneIdSelected', Id);
    document.getElementById("UpdateModalName").value = Name;
    document.getElementById("UpdateEnabled").checked = Enabled;
    document.getElementById("UpdateModalDescription").value = Description;
    document.getElementById("UpdateModalPrice").value = Price;
    document.getElementById("UpdateModalDuration").value = Duration;

    var UpdateZoneModal = new bootstrap.Modal(document.getElementById("UpdateZoneModal"));
    UpdateZoneModal.show();
}