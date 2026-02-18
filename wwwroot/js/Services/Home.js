document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("ServicesModule", "ServicesModuleHome");
    LoadServices();
    LoadCategories();
    const BtnDeleteService = document.getElementById('BtnDeleteService');
    BtnDeleteService.addEventListener('click', async () => {
        await DeleteService();
    });

    const BtnCreateServiceModal = document.getElementById('BtnCreateServiceModal');
    BtnCreateServiceModal.addEventListener('click', async () => {
        await CreateServiceModalOpen();
    });

    const BtnCreateQuestion = document.getElementById('BtnCreateService');
    BtnCreateQuestion.addEventListener('click', async () => {
        await AddService();
    });

    const BtnUpdateService = document.getElementById('BtnUpdateService');
    BtnUpdateService.addEventListener('click', async () => {
        await UpdateService();
    });
});
async function LoadCategories() {
    try {
        const response = await fetch("/Services/GetCategories", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status < 300) {
            const categories = await response.json().catch(() => []);

            const selectCreate = document.getElementById("CreateModalCategory");
            selectCreate.innerHTML = "";

            const defaultOptionCreate = document.createElement("option");
            defaultOptionCreate.value = "0";
            defaultOptionCreate.textContent = "Seleccionar categoria...";
            defaultOptionCreate.disabled = true;
            defaultOptionCreate.selected = true;
            selectCreate.appendChild(defaultOptionCreate);

            categories.forEach(r => {
                const option = document.createElement("option");
                option.value = r.value;
                option.textContent = r.description;
                selectCreate.appendChild(option);
            });

            const selectUpdate = document.getElementById("UpdateModalCategory");
            selectUpdate.innerHTML = "";

            const defaultOptionUpdate = document.createElement("option");
            defaultOptionUpdate.value = "0";
            defaultOptionUpdate.textContent = "Seleccionar categoria...";
            defaultOptionUpdate.disabled = true;
            defaultOptionUpdate.selected = true;
            selectUpdate.appendChild(defaultOptionUpdate);

            categories.forEach(r => {
                const option = document.createElement("option");
                option.value = r.value;
                option.textContent = r.description;
                selectUpdate.appendChild(option);
            });
        }

        if (response.status >= 400 && response.status < 500) {
            const result = await response.text().catch(() => null);
            showToast("warning", result);
        }

        if (response.status >= 500) {
            const result = await response.text().catch(() => null);
            showToast("danger", result);
        }

    } catch (error) {
        showToast("danger", error.message || error);
    }
}
async function LoadServices() {
    try {
        const response = await fetch(`/Services/GetServices`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            const tbody = document.querySelector("#ServicesTable tbody");

            tbody.innerHTML = "";
            result.forEach(c => {
                const tr = document.createElement("tr");

                let Check = "";
                if (c.enabled == true) {
                    Check = "checked";
                }

                tr.setAttribute("data-id", c.id);
                tr.innerHTML = `
                    <td>${c.category}</td>
                    <td>${c.name}</td>
                    <td>${c.description}</td>
                    <td>${c.duration} Minutos</td>
                    <td>$${c.price}</td>
                    <td>${c.therapists}</td>
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="ServiceMode?${c.id}" ${Check} disabled>
                            <label class="form-check-label" for="ServiceMode?${c.id}"></label>
                        </div>
                    </td>
                    <td> 
                        <div class="btn-group float-end" role="group" aria-label="Acciones">
                            <button  onclick="DeleteServiceModalOpen(${c.id},'${c.name}')" class="btn btn-outline-danger">
                                <i class="bi bi-trash"></i>
                            </button>
                            <button onclick="UpdateServiceModalOpen(${c.id},${c.categoryId},'${c.name}','${c.description}',${c.duration},${c.price},${c.therapists},${c.enabled})" class="btn btn-outline-warning">
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
function DeleteServiceModalOpen(Id, Question) {
    document.getElementById("LabelModalDeleteService").innerText = Question;
    sessionStorage.setItem('ServiceIdSelected', Id);
    var DeleteServiceModal = new bootstrap.Modal(document.getElementById("DeleteServiceModal"));
    DeleteServiceModal.show();
}
async function DeleteService() {
    try {
        var Id = sessionStorage.getItem('ServiceIdSelected');
        const data = {
            ServiceId: Id
        };
        const response = await fetch("/Services/DeleteService", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const DeleteServiceModal = document.getElementById('DeleteServiceModal');
            const modalInstance = bootstrap.Modal.getInstance(DeleteServiceModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }

            LoadServices();
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
function CreateServiceModalOpen() {
    var CreateServiceModal = new bootstrap.Modal(document.getElementById("CreateServiceModal"));
    CreateServiceModal.show();
}
async function AddService() {
    try {
        const Category = document.getElementById("CreateModalCategory");
        const Name = document.getElementById("CreateModalName");
        const Description = document.getElementById("CreateModalDescription");
        const Duration = document.getElementById("CreateModalDuration");
        const Price = document.getElementById("CreateModalPrice");
        const Therapists = document.getElementById("CreateModalTherapists");
        const Enabled = document.getElementById("CreateModalEnabled");
        const data = {
            CategoryId: Category.value,
            Name: Name.value,
            Description: Description.value,
            Duration: Duration.value,
            Price: Price.value,
            Therapists: Therapists.value,
            Enabled: Enabled.checked
        };
        const response = await fetch("/Services/AddService", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            document.getElementById("CreateModalCategory").value = "0";
            document.getElementById("CreateModalName").value = "";
            document.getElementById("CreateModalDescription").value = "";
            document.getElementById("CreateModalDuration").value = "";
            document.getElementById("CreateModalPrice").value = "";
            document.getElementById("CreateModalTherapists").value = "";
            document.getElementById("CreateModalEnabled").checked = false;

            showToast("success", result);
            const CreateServiceModal = document.getElementById('CreateServiceModal');
            const modalInstance = bootstrap.Modal.getInstance(CreateServiceModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }
            LoadServices();

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
async function UpdateService() {
    try {
        const Id = sessionStorage.getItem('ServiceIdSelected');
        const Category = document.getElementById("UpdateModalCategory");
        const Name = document.getElementById("UpdateModalName");
        const Description = document.getElementById("UpdateModalDescription");
        const Duration = document.getElementById("UpdateModalDuration");
        const Price = document.getElementById("UpdateModalPrice");
        const Therapists = document.getElementById("UpdateModalTherapists");
        const Enabled = document.getElementById("UpdateModalEnabled");
        const data = {
            Id: Id,
            CategoryId: Category.value,
            Name: Name.value,
            Description: Description.value,
            Duration: Duration.value,
            Price: Price.value,
            Therapists: Therapists.value,
            Enabled: Enabled.checked
        };
        const response = await fetch("/Services/UpdateService", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const UpdateServiceModal = document.getElementById('UpdateServiceModal');
            const modalInstance = bootstrap.Modal.getInstance(UpdateServiceModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }
            LoadServices();

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
function UpdateServiceModalOpen(Id,CategoryId, Name, Description,Duration,Price,Therapists, Enabled) {

    sessionStorage.setItem('ServiceIdSelected', Id);
    document.getElementById("UpdateModalCategory").value = CategoryId;
    document.getElementById("UpdateModalName").value = Name;
    document.getElementById("UpdateModalEnabled").checked = Enabled;
    document.getElementById("UpdateModalDescription").value = Description;
    document.getElementById("UpdateModalDuration").value = Duration;
    document.getElementById("UpdateModalPrice").value = Price;
    document.getElementById("UpdateModalTherapists").value = Therapists;

    var UpdateServiceModal = new bootstrap.Modal(document.getElementById("UpdateServiceModal"));
    UpdateServiceModal.show();
}