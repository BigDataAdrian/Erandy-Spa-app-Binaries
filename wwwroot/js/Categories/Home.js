document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("CategoriesModule", "CategoriesModuleHome");
    LoadCategories();

    const BtnDeleteCategory = document.getElementById('BtnDeleteCategory');
    BtnDeleteCategory.addEventListener('click', async () => {
        await DeleteCategory();
    });

    const BtnCreateCategoryModal = document.getElementById('BtnCreateCategoryModal');
    BtnCreateCategoryModal.addEventListener('click', async () => {
        await CreateCategoryModalOpen();
    });

    const BtnCreateQuestion = document.getElementById('BtnCreateCategory');
    BtnCreateQuestion.addEventListener('click', async () => {
        await AddCategory();
    });

    const BtnUpdateCategory = document.getElementById('BtnUpdateCategory');
    BtnUpdateCategory.addEventListener('click', async () => {
        await UpdateCategory();
    });
});

async function LoadCategories() {
    try {
        const response = await fetch(`/Categories/GetCategories`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            const tbody = document.querySelector("#CategoriesTable tbody");

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
                    <td>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" role="switch" id="CategoryMode?${c.id}" ${Check} disabled>
                            <label class="form-check-label" for="CategoryMode?${c.id}"></label>
                        </div>
                    </td>
                    <td> 
                        <div class="btn-group float-end" role="group" aria-label="Acciones">
                            <button  onclick="DeleteCategoryModalOpen(${c.id},'${c.name}')" class="btn btn-outline-danger">
                                <i class="bi bi-trash"></i>
                            </button>
                            <button onclick="UpdateCategoryModalOpen(${c.id},'${c.name}','${c.description}',${c.enabled})" class="btn btn-outline-warning">
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
function DeleteCategoryModalOpen(Id, Question) {
    document.getElementById("LabelModalDeleteCategory").innerText = Question;
    sessionStorage.setItem('CategoryIdSelected', Id);
    var DeleteCategoryModal = new bootstrap.Modal(document.getElementById("DeleteCategoryModal"));
    DeleteCategoryModal.show();
}
async function DeleteCategory() {
    try {
        var Id = sessionStorage.getItem('CategoryIdSelected');
        const data = {
            CategoryId: Id
        };
        const response = await fetch("/Categories/DeleteCategory", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const DeleteCategoryModal = document.getElementById('DeleteCategoryModal');
            const modalInstance = bootstrap.Modal.getInstance(DeleteCategoryModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }

            LoadCategories();
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
function CreateCategoryModalOpen() {
    var CreateCategoryModal = new bootstrap.Modal(document.getElementById("CreateCategoryModal"));
    CreateCategoryModal.show();
}
async function AddCategory() {
    try {
        const Name = document.getElementById("CreateModalName");
        const Description = document.getElementById("CreateModalDescription");
        const Enabled = document.getElementById("CreateModalEnabled");
        const data = {
            Name: Name.value,
            Description: Description.value,
            Enabled: Enabled.checked
        };
        const response = await fetch("/Categories/AddCategory", {
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

            showToast("success", result);
            const CreateCategoryModal = document.getElementById('CreateCategoryModal');
            const modalInstance = bootstrap.Modal.getInstance(CreateCategoryModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }
            LoadCategories();

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
async function UpdateCategory() {
    try {
        const Id = sessionStorage.getItem('CategoryIdSelected');
        const Name = document.getElementById("UpdateModalName");
        const Description = document.getElementById("UpdateModalDescription");
        const Enabled = document.getElementById("UpdateEnabled");
        const data = {
            Id: Id,
            Name: Name.value,
            Description: Description.value,
            Enabled: Enabled.checked
        };
        const response = await fetch("/Categories/UpdateCategory", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const UpdateCategoryModal = document.getElementById('UpdateCategoryModal');
            const modalInstance = bootstrap.Modal.getInstance(UpdateCategoryModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }
            LoadCategories();

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
function UpdateCategoryModalOpen(Id, Name, Description, Enabled) {

    sessionStorage.setItem('CategoryIdSelected', Id);
    document.getElementById("UpdateModalName").value = Name;
    document.getElementById("UpdateEnabled").checked = Enabled;
    document.getElementById("UpdateModalDescription").value = Description;

    var UpdateCategoryModal = new bootstrap.Modal(document.getElementById("UpdateCategoryModal"));
    UpdateCategoryModal.show();
}