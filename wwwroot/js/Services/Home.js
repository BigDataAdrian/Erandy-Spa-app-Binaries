document.addEventListener("DOMContentLoaded", () => {
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

    const Categories = document.getElementById('Categories');
    Categories.addEventListener('change', async () => {
        await LoadServices();
    });

    const uploadButton = document.getElementById('uploadButton');
    const fileInput = document.getElementById('picturereference');
    const pictureNameInput = document.getElementById('pictureNameInput');

    uploadButton.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length > 0) {
            const selectedFile = fileInput.files[0];
            pictureNameInput.value = selectedFile.name;

            UploadPicture(selectedFile);
        }
    });

    const UpdateuploadButton = document.getElementById('UpdateuploadButton');
    const UpdatefileInput = document.getElementById('Updatepicturereference');
    const UpdatepictureNameInput = document.getElementById('UpdatepictureNameInput');

    UpdateuploadButton.addEventListener('click', () => {
        UpdatefileInput.click();
    });

    UpdatefileInput.addEventListener('change', () => {
        if (UpdatefileInput.files.length > 0) {
            const selectedFile = UpdatefileInput.files[0];
            UpdatepictureNameInput.value = selectedFile.name;

            UploadPicture(selectedFile);
        }
    });

    const UpdateDeletePictureBtn = document.getElementById('UpdateDeletePictureBtn');
    UpdateDeletePictureBtn.addEventListener('click', async () => {
        document.getElementById('UpdatepictureNameInput').value="";
    });

    document.getElementById('AddPriceModal').addEventListener('hidden.bs.modal', () => {
        const pricesModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('PricesModal'));
        pricesModal.show();
    });

    document.getElementById('UpdatePriceModal').addEventListener('hidden.bs.modal', () => {
        const pricesModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('PricesModal'));
        pricesModal.show();
    });

    document.getElementById('DeletePriceModal').addEventListener('hidden.bs.modal', () => {
        const pricesModal = bootstrap.Modal.getOrCreateInstance(document.getElementById('PricesModal'));
        pricesModal.show();
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

            const selectCreate = document.getElementById("Categories");
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
        const Categories = document.getElementById("Categories");
        const response = await fetch(`/Services/GetServices?CategoryId=` + Categories.value, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);
            document.getElementById("CardData").style.display = "flex";
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
                    <td>${c.name}</td>
                    <td><button class="btn btn-outline-secondary" onclick="ShowTextModal(${c.id},'description','Descripción')"><i class="bi bi-file-text"></i></button></td>
                    <td><button class="btn btn-outline-secondary" onclick="ShowTextModal(${c.id},'benefit','Beneficio')"><i class="bi bi-heart-pulse"></i></button></td>
                    <td><button class="btn btn-outline-secondary" onclick="ShowTextModal(${c.id},'frequency','Frecuencia')"><i class="bi bi-arrow-repeat"></i></button></td>
                    <td><button class="btn btn-outline-warning" onclick="ShowTextModal(${c.id},'warning','Advertencia')"><i class="bi bi-exclamation-triangle"></i></button></td>
                    <td><button class="btn btn-outline-info" onclick="ImageModalOpen(${c.id})"><i class="bi bi-image"></i></button></td>
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
                        <button onclick="DeleteServiceModalOpen(${c.id},'${c.name}')" class="btn btn-outline-danger">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button onclick="UpdateServiceModalOpen(${c.id})" class="btn btn-outline-warning">
                            <i class="bi bi-pencil"></i>
                        </button>
                        <button onclick="PricesModalOpen(${c.id})" class="btn btn-outline-primary">
                            <i class="bi bi-cash"></i>
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
        const response = await fetch("/Services/DeleteService?ServiceId=" + Id, {
            method: "DELETE"
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
        const Category = document.getElementById("Categories");
        const Name = document.getElementById("CreateModalName");
        const Description = document.getElementById("CreateModalDescription");
        const Benefit = document.getElementById("CreateModalBenefit");
        const Warning = document.getElementById("CreateModalWarning");
        const Frequency = document.getElementById("CreateModalFrequency");
        const Duration = document.getElementById("CreateModalDuration");
        const Price = document.getElementById("CreateModalPrice");
        const Therapists = document.getElementById("CreateModalTherapists");
        const Enabled = document.getElementById("CreateModalEnabled");
        const pictureNameInput = document.getElementById('pictureNameInput');

        const data = {
            Name: Name.value,
            Category: Category.value,
            Description: Description.value,
            Duration: Duration.value,
            Price: Price.value,
            Therapists: Therapists.value,
            Enabled: Enabled.checked,
            Benefit: Benefit.value,
            Frequency: Frequency.value,
            Warning: Warning.value,
            Picture: pictureNameInput.value
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
            document.getElementById("CreateModalName").value = "";
            document.getElementById("CreateModalDescription").value = "";
            document.getElementById("CreateModalBenefit").value = "";
            document.getElementById("CreateModalWarning").value = "";
            document.getElementById("CreateModalFrequency").value = "";
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
        const Benefit = document.getElementById("UpdateModalBenefit");
        const Warning = document.getElementById("UpdateModalWarning");
        const Frequency = document.getElementById("UpdateModalFrequency");
        const Duration = document.getElementById("UpdateModalDuration");
        const Price = document.getElementById("UpdateModalPrice");
        const Therapists = document.getElementById("UpdateModalTherapists");
        const Enabled = document.getElementById("UpdateModalEnabled");
        const Picture = document.getElementById('UpdatepictureNameInput');

        const data = {
            Id: Id,
            Name: Name.value,
            Description: Description.value,
            Duration: Duration.value,
            Price: Price.value,
            Therapists: Therapists.value,
            Enabled: Enabled.checked,
            Benefit: Benefit.value,
            Frequency: Frequency.value,
            Warning: Warning.value,
            Picture: Picture.value
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
async function UpdateServiceModalOpen(ServiceId) {
    try {
        const Categories = document.getElementById("Categories");
        const response = await fetch(`/Services/GetService?ServiceId=` + ServiceId, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);
            sessionStorage.setItem('ServiceIdSelected', ServiceId);

            document.getElementById("UpdateModalName").value = result.name;
            document.getElementById("UpdateModalEnabled").checked = result.enabled;
            document.getElementById("UpdateModalDescription").value = result.description;
            document.getElementById("UpdateModalBenefit").value = result.benefit;
            document.getElementById("UpdateModalFrequency").value = result.frequency;
            document.getElementById("UpdateModalWarning").value = result.warning;
            document.getElementById("UpdateModalDuration").value = result.duration;
            document.getElementById("UpdateModalPrice").value = result.price;
            document.getElementById("UpdateModalTherapists").value = result.therapists;
            document.getElementById('UpdatepictureNameInput').value = result.picture;
            var UpdateServiceModal = new bootstrap.Modal(document.getElementById("UpdateServiceModal"));
            UpdateServiceModal.show();
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
async function ShowTextModal(id, field, label) {
    try {
        const response = await fetch(`/Services/GetService?ServiceId=` + id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const service = await response.json().catch(() => null);

            document.getElementById("TextViewModalLabel").innerText = label;
            document.getElementById("TextViewModalBody").innerText = service[field] && service[field].trim() !== ""
                ? service[field]
                : "Sin información";

            const TextViewModal = new bootstrap.Modal(document.getElementById("TextViewModal"));
            TextViewModal.show();
        }

        if (response.status >= 400 && response.status <= 499) {
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
async function ImageModalOpen(id) {
    try {
        const response = await fetch(`/Services/GetService?ServiceId=` + id, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const service = await response.json().catch(() => null);

            sessionStorage.setItem('ServiceIdSelected', id);

            const preview = document.getElementById("ImageServicePreview");
            preview.src = service.picture && service.picture.trim() !== "" ? "/assets/img/services/"+id +"/"+ service.picture : "/assets/img/warning/no-image.png";

            const ImageServiceModal = new bootstrap.Modal(document.getElementById("ImageServiceModal"));
            ImageServiceModal.show();
        }

        if (response.status >= 400 && response.status <= 499) {
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
async function UploadPicture(file) {
    try {
        if (!file) return;

        const formData = new FormData();
        formData.append('picture', file);

        const response = await fetch('/Services/UploadPicture', {
            method: 'POST',
            body: formData
        });

        if (response.status >= 200 && response.status < 300) {
            const result = await response.text();
            showToast("success", result);
        } else if (response.status >= 400 && response.status < 500) {
            const errorData = await response.json();
            showToast("warning", errorData.message || "Error en la solicitud");
        } else {
            const errorText = await response.text();
            showToast("danger", "Error del servidor: " + errorText);
        }

    } catch (error) {
        console.error(error);
        showToast("danger", "Ocurrió un error al intentar subir la imagen");
    }
}
async function PricesModalOpen(ServiceId) {
    try {
        sessionStorage.setItem('ServiceIdSelected', ServiceId);

        const response = await fetch("/Services/GetPrices?ServiceId=" + ServiceId, {
            method: "GET"
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            const tbody = document.getElementById("pricesTableBody");
            tbody.innerHTML = "";

            result.forEach(p => {
                const tr = document.createElement("tr");
                tr.setAttribute("data-id", p.id);

                tr.innerHTML = `
                    <td>${p.name}</td>
                    <td>${p.price}$</td>
                    <td class="text-end">
                        <div class="btn-group" role="group" aria-label="Acciones">
                           <button type="button" class="btn btn-outline-warning" onclick="UpdatePriceModalOpen(${p.id})">
                                <i class="bi bi-pencil"></i>
                            </button>
                            <button type="button" class="btn btn-outline-danger" onclick="DeletePriceModalOpen(${p.id},'${p.name}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </td>
                `;

                tbody.appendChild(tr);
            });

            const PricesModal = document.getElementById('PricesModal');
            const modalInstance = bootstrap.Modal.getInstance(PricesModal);

            if (!modalInstance) {
                new bootstrap.Modal(PricesModal).show();
            } else {
                modalInstance.show();
            }
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
function AddPriceModalOpen() {
    document.getElementById('AddPriceName').value = "";
    document.getElementById('AddPriceValue').value = "";

    const pricesModal = bootstrap.Modal.getInstance(document.getElementById('PricesModal'));
    pricesModal.hide();

    const modalEl = document.getElementById('AddPriceModal');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
    modalInstance.show();
}
async function UpdatePriceModalOpen(PriceId) {
    try {
        const response = await fetch("/Services/GetPrice?PriceId=" + PriceId, {
            method: "GET"
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            sessionStorage.setItem('PriceIdSelected', PriceId);
            document.getElementById('UpdatePriceName').value = result.name;
            document.getElementById('UpdatePriceValue').value = result.price;

            const pricesModal = bootstrap.Modal.getInstance(document.getElementById('PricesModal'));
            pricesModal.hide();

            const modalEl = document.getElementById('UpdatePriceModal');
            const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
            modalInstance.show();
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
function DeletePriceModalOpen(PriceId, PriceName) {
    sessionStorage.setItem('PriceIdSelected', PriceId);
    document.getElementById('DeletePriceName').innerText = PriceName;

    const pricesModal = bootstrap.Modal.getInstance(document.getElementById('PricesModal'));
    pricesModal.hide();

    const modalEl = document.getElementById('DeletePriceModal');
    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
    modalInstance.show();
}
async function AddPrice() {
    try {
        const ServiceId = sessionStorage.getItem('ServiceIdSelected');

        const body = {
            ServiceId: parseInt(ServiceId),
            Name: document.getElementById('AddPriceName').value,
            Price: parseFloat(document.getElementById('AddPriceValue').value)
        };

        const response = await fetch("/Services/AddPrice", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);

            const AddPriceModal = document.getElementById('AddPriceModal');
            const modalInstance = bootstrap.Modal.getInstance(AddPriceModal);

            if (!modalInstance) {
                new bootstrap.Modal(AddPriceModal).hide();
            } else {
                modalInstance.hide();
            }

            PricesModalOpen(ServiceId);
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
async function UpdatePrice() {
    try {
        const PriceId = sessionStorage.getItem('PriceIdSelected');
        const ServiceId = sessionStorage.getItem('ServiceIdSelected');

        const body = {
            PriceId: parseInt(PriceId),
            Name: document.getElementById('UpdatePriceName').value,
            Price: parseFloat(document.getElementById('UpdatePriceValue').value)
        };

        const response = await fetch("/Services/UpdatePrice", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);

            const UpdatePriceModal = document.getElementById('UpdatePriceModal');
            const modalInstance = bootstrap.Modal.getInstance(UpdatePriceModal);

            if (!modalInstance) {
                new bootstrap.Modal(UpdatePriceModal).hide();
            } else {
                modalInstance.hide();
            }

            PricesModalOpen(ServiceId);
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
async function DeletePrice() {
    try {
        var Id = sessionStorage.getItem('PriceIdSelected');
        const ServiceId = sessionStorage.getItem('ServiceIdSelected');

        const response = await fetch("/Services/DeletePrice?PriceId=" + Id, {
            method: "DELETE"
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);

            const DeletePriceModal = document.getElementById('DeletePriceModal');
            const modalInstance = bootstrap.Modal.getInstance(DeletePriceModal);

            if (!modalInstance) {
                new bootstrap.Modal(DeletePriceModal).hide();
            } else {
                modalInstance.hide();
            }

            PricesModalOpen(ServiceId);
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