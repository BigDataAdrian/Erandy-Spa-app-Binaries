let SelectedProtocolId = null;
let SelectedStepId = null;

document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("ProtocolsSearchModule", "ProtocolsSearchModuleHome");
    InitTooltips();

    const ProtocolId = sessionStorage.getItem("ProtocolsSearchProtocolIdSelected");
    const ProtocolName = sessionStorage.getItem("ProtocolsSearchProtocolNameSelected");
    const CategoryName = sessionStorage.getItem("ProtocolsSearchCategoryNameSelected");
    if (ProtocolId && ProtocolName) {
        SelectedProtocolId = parseInt(ProtocolId);
        document.getElementById("ProtocolsSearchProtocolLabel").innerText = CategoryName ? `${CategoryName} / ${ProtocolName}` : ProtocolName;
        LoadProtocolsSteps();
    }

    document.getElementById("BtnSelectProtocolsSearchProtocolModal").addEventListener("click", SelectProtocolsSearchProtocolModalOpen);
    document.getElementById("BtnBackToProtocolsSearchImages").addEventListener("click", ShowProtocolsSearchImagesGallery);
});

async function SelectProtocolsSearchProtocolModalOpen() {
    ShowModal("SelectProtocolsSearchProtocolModal");
    await LoadProtocolsSearchProtocols();
}

async function LoadProtocolsSearchProtocols() {
    const Container = document.getElementById("ProtocolsSearchProtocolsList");
    Container.innerHTML = '<div class="text-center text-body-secondary"><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cargando...</div>';
    try {
        const [CategoriesResponse, ProtocolsResponse] = await Promise.all([
            fetch("/ProtocolsSearch/GetCategoriesSelect"),
            fetch("/ProtocolsSearch/GetProtocolsSelect")
        ]);
        if (!CategoriesResponse.ok || !ProtocolsResponse.ok) {
            throw new Error("No fue posible cargar los protocolos");
        }

        const Categories = await CategoriesResponse.json();
        const Protocols = await ProtocolsResponse.json();
        Container.innerHTML = "";
        if (!Categories.length) {
            Container.innerHTML = '<div class="text-center text-body-secondary">No hay categorías activas disponibles.</div>';
            return;
        }

        Categories.forEach(Category => {
            const CategoryProtocols = Protocols.filter(Protocol => Protocol.categoryId === Category.id);
            const CollapseId = `ProtocolsSearchCategory${Category.id}`;
            const CategoryWrapper = document.createElement("div");
            CategoryWrapper.className = "category-selector-group";
            CategoryWrapper.innerHTML = `
                <button type="button" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center category-selector" data-bs-toggle="collapse" data-bs-target="#${CollapseId}" aria-expanded="false">
                    <span><i class="bi bi-folder2 me-2"></i>${EscapeHtml(Category.name)}</span><i class="bi bi-chevron-down"></i>
                </button>
                <div id="${CollapseId}" class="collapse protocol-selector-list"></div>`;
            const ProtocolList = CategoryWrapper.querySelector(`#${CollapseId}`);
            if (!CategoryProtocols.length) {
                ProtocolList.innerHTML = '<div class="text-body-secondary small p-3">No hay protocolos activos en esta categoría.</div>';
            } else {
                CategoryProtocols.forEach(Protocol => {
                    const Button = document.createElement("button");
                    Button.type = "button";
                    Button.className = "list-group-item list-group-item-action protocol-selector-item d-flex justify-content-between align-items-center";
                    Button.innerHTML = `<span><i class="bi bi-file-earmark-text me-2"></i>${EscapeHtml(Protocol.name)}</span><i class="bi bi-chevron-right"></i>`;
                    Button.addEventListener("click", () => SelectProtocolsSearchProtocol(Protocol.id, Category.name, Protocol.name));
                    ProtocolList.appendChild(Button);
                });
            }
            Container.appendChild(CategoryWrapper);
        });
        InitTooltips();
    } catch (Error) {
        Container.innerHTML = '<div class="text-center text-danger">No fue posible cargar las categorías y protocolos.</div>';
        showToast("danger", Error.message || Error);
    }
}

function SelectProtocolsSearchProtocol(Id, CategoryName, ProtocolName) {
    SelectedProtocolId = Id;
    sessionStorage.setItem("ProtocolsSearchProtocolIdSelected", Id);
    sessionStorage.setItem("ProtocolsSearchProtocolNameSelected", ProtocolName);
    sessionStorage.setItem("ProtocolsSearchCategoryNameSelected", CategoryName);
    document.getElementById("ProtocolsSearchProtocolLabel").innerText = `${CategoryName} / ${ProtocolName}`;
    HideModal("SelectProtocolsSearchProtocolModal");
    LoadProtocolsSteps();
}

async function LoadProtocolsSteps() {
    if (!SelectedProtocolId) return;
    const Tbody = document.querySelector("#ProtocolsSearchTable tbody");
    Tbody.innerHTML = '<tr><td colspan="4" class="text-center text-body-secondary"><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cargando...</td></tr>';
    try {
        const Response = await fetch(`/ProtocolsSearch/GetProtocolsSteps?ProtocolId=${SelectedProtocolId}`);
        if (!Response.ok) throw new Error(await Response.text());
        const Result = await Response.json();
        Tbody.innerHTML = "";
        if (!Result.length) {
            Tbody.innerHTML = '<tr><td colspan="4" class="text-center text-body-secondary">No hay pasos en este protocolo.</td></tr>';
        } else {
            Result.forEach(Step => RenderProtocolSearchStepRow(Tbody, Step));
        }
        document.getElementById("ProtocolsSearchCount").innerText = Result.length;
        InitTooltips();
    } catch (Error) {
        Tbody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">No fue posible cargar los pasos.</td></tr>';
        document.getElementById("ProtocolsSearchCount").innerText = "0";
        showToast("danger", Error.message || Error);
    }
}

function RenderProtocolSearchStepRow(Tbody, Step) {
    const Row = document.createElement("tr");
    const HasInstruction = String(Step.instruction ?? "").trim().length > 0;
    Row.innerHTML = `
        <td class="order-column">${Step.order}</td>
        <td>${EscapeHtml(Step.name)}</td>
        <td class="instruction-cell">${HasInstruction
            ? '<button type="button" class="btn btn-outline-secondary btn-sm" data-action="instruction" data-bs-toggle="tooltip" data-bs-title="Ver instrucción"><i class="bi bi-card-text"></i> Ver instrucción</button>'
            : '<span class="text-body-secondary">Sin instrucción</span>'}</td>
        <td><button type="button" class="btn btn-outline-info btn-sm" data-action="images" data-bs-toggle="tooltip" data-bs-title="Ver imágenes"><i class="bi bi-images"></i> Ver imágenes</button></td>`;

    const InstructionButton = Row.querySelector('[data-action="instruction"]');
    if (InstructionButton) InstructionButton.addEventListener("click", () => OpenProtocolSearchInstruction(Step));
    Row.querySelector('[data-action="images"]').addEventListener("click", () => OpenProtocolSearchImages(Step.id, Step.name));
    Tbody.appendChild(Row);
}

function OpenProtocolSearchInstruction(Step) {
    document.getElementById("ProtocolsSearchInstructionModalLabel").innerText = `Instrucción: ${Step.name}`;
    document.getElementById("ProtocolsSearchInstructionContent").innerText = Step.instruction || "Sin instrucción";
    ShowModal("ProtocolsSearchInstructionModal");
}

function OpenProtocolSearchImages(StepId, StepName) {
    SelectedStepId = StepId;
    ShowProtocolsSearchImagesGallery();
    document.getElementById("ProtocolsSearchImagesModalLabel").innerText = `Imágenes del paso: ${StepName}`;
    ShowModal("ProtocolsSearchImagesModal");
    LoadProtocolSearchImages();
}

async function LoadProtocolSearchImages() {
    const Container = document.getElementById("ProtocolsSearchImagesGrid");
    Container.innerHTML = '<div class="text-center text-body-secondary"><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cargando...</div>';
    try {
        const Response = await fetch(`/ProtocolsSearch/GetProtocolStepImages?StepId=${SelectedStepId}`);
        if (!Response.ok) throw new Error(await Response.text());
        const Result = await Response.json();
        Container.innerHTML = "";
        if (!Result.length) {
            Container.innerHTML = '<div class="text-center text-body-secondary">Este paso no tiene imágenes disponibles.</div>';
            return;
        }

        Result.forEach(Image => RenderProtocolSearchImage(Container, Image));
    } catch (Error) {
        Container.innerHTML = '<div class="text-center text-danger">No fue posible cargar las imágenes.</div>';
        showToast("danger", Error.message || Error);
    }
}

function RenderProtocolSearchImage(Container, Image) {
    const Button = document.createElement("button");
    Button.type = "button";
    Button.className = "protocol-search-image-button";
    Button.title = "Abrir imagen";

    const Thumbnail = document.createElement("img");
    Thumbnail.className = "protocol-search-image-thumbnail";
    Thumbnail.src = Image.path;
    Thumbnail.alt = Image.name || "Imagen del paso";
    Thumbnail.loading = "lazy";

    const Name = document.createElement("span");
    Name.className = "protocol-search-image-name small";
    Name.innerText = Image.name || "Imagen";

    Button.append(Thumbnail, Name);
    Button.addEventListener("click", () => OpenProtocolSearchImage(Image));
    Container.appendChild(Button);
}

function OpenProtocolSearchImage(Image) {
    const Preview = document.getElementById("ProtocolsSearchImagePreview");
    Preview.src = Image.path;
    Preview.alt = Image.name || "Imagen del paso";
    document.getElementById("ProtocolsSearchImagesModalLabel").innerText = Image.name || "Imagen";
    document.getElementById("ProtocolsSearchImagesGalleryView").classList.add("d-none");
    document.getElementById("ProtocolsSearchImagePreviewView").classList.remove("d-none");
    document.getElementById("BtnBackToProtocolsSearchImages").classList.remove("d-none");
}

function ShowProtocolsSearchImagesGallery() {
    document.getElementById("ProtocolsSearchImagePreviewView").classList.add("d-none");
    document.getElementById("ProtocolsSearchImagesGalleryView").classList.remove("d-none");
    document.getElementById("BtnBackToProtocolsSearchImages").classList.add("d-none");
    document.getElementById("ProtocolsSearchImagesModalLabel").innerText = "Imágenes del paso";
}

function ShowModal(Id) {
    bootstrap.Modal.getOrCreateInstance(document.getElementById(Id)).show();
}

function HideModal(Id) {
    const Modal = bootstrap.Modal.getInstance(document.getElementById(Id));
    if (Modal) Modal.hide();
}

function EscapeHtml(Value) {
    return String(Value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function InitTooltips() {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(Element => {
        if (!bootstrap.Tooltip.getInstance(Element)) {
            new bootstrap.Tooltip(Element);
        }
    });
}
