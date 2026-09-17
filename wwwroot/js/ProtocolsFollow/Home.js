let SelectedProtocolId = null;
let SelectedProtocolIndications = "";
let SelectedProtocolWarnings = "";
let ProtocolFollowSteps = [];
let CurrentStepIndex = 0;
let StepImagesRequestId = 0;

document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("ProtocolsFollowModule", "ProtocolsFollowModuleHome");
    InitTooltips();

    document.getElementById("BtnSelectProtocolsFollowProtocolModal").addEventListener("click", SelectProtocolsFollowProtocolModalOpen);
    document.getElementById("BtnOpenProtocolsFollowSelector").addEventListener("click", SelectProtocolsFollowProtocolModalOpen);

    const ProtocolId = sessionStorage.getItem("ProtocolsFollowProtocolIdSelected");
    const ProtocolName = sessionStorage.getItem("ProtocolsFollowProtocolNameSelected");
    const CategoryName = sessionStorage.getItem("ProtocolsFollowCategoryNameSelected");
    const Indications = sessionStorage.getItem("ProtocolsFollowProtocolIndicationsSelected") || "";
    const Warnings = sessionStorage.getItem("ProtocolsFollowProtocolWarningsSelected") || "";
    SetProtocolsFollowInformation(Indications, Warnings);
    if (ProtocolId && ProtocolName) {
        SelectedProtocolId = parseInt(ProtocolId);
        SetProtocolsFollowTitle(CategoryName, ProtocolName);
        LoadProtocolsFollowSteps();
    }

    document.getElementById("BtnProtocolsFollowIndications").addEventListener("click", () => OpenProtocolsFollowTextModal(SelectedProtocolIndications, "Indicaciones"));
    document.getElementById("BtnProtocolsFollowWarnings").addEventListener("click", () => OpenProtocolsFollowTextModal(SelectedProtocolWarnings, "Advertencias"));
});

async function SelectProtocolsFollowProtocolModalOpen() {
    ShowModal("SelectProtocolsFollowProtocolModal");
    await LoadProtocolsFollowProtocols();
}

async function LoadProtocolsFollowProtocols() {
    const Container = document.getElementById("ProtocolsFollowProtocolsList");
    Container.innerHTML = '<div class="text-center text-body-secondary"><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cargando...</div>';
    try {
        const [CategoriesResponse, ProtocolsResponse] = await Promise.all([
            fetch("/ProtocolsFollow/GetCategoriesSelect"),
            fetch("/ProtocolsFollow/GetProtocolsSelect")
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
            const CollapseId = `ProtocolsFollowCategory${Category.id}`;
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
                    Button.addEventListener("click", () => SelectProtocolsFollowProtocol(Protocol.id, Category.name, Protocol.name, Protocol.indications, Protocol.warnings));
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

function SelectProtocolsFollowProtocol(Id, CategoryName, ProtocolName, Indications, Warnings) {
    SelectedProtocolId = Id;
    sessionStorage.setItem("ProtocolsFollowProtocolIdSelected", Id);
    sessionStorage.setItem("ProtocolsFollowProtocolNameSelected", ProtocolName);
    sessionStorage.setItem("ProtocolsFollowCategoryNameSelected", CategoryName);
    sessionStorage.setItem("ProtocolsFollowProtocolIndicationsSelected", Indications || "");
    sessionStorage.setItem("ProtocolsFollowProtocolWarningsSelected", Warnings || "");
    SetProtocolsFollowInformation(Indications, Warnings);
    SetProtocolsFollowTitle(CategoryName, ProtocolName);
    HideModal("SelectProtocolsFollowProtocolModal");
    LoadProtocolsFollowSteps();
}

function SetProtocolsFollowTitle(CategoryName, ProtocolName) {
    const Title = document.getElementById("ProtocolsFollowTitle");
    Title.innerText = CategoryName ? `${CategoryName} / ${ProtocolName}` : ProtocolName;
}

async function LoadProtocolsFollowSteps() {
    if (!SelectedProtocolId) return;

    ShowProtocolsFollowLoading();
    try {
        const Response = await fetch(`/ProtocolsFollow/GetProtocolSteps?ProtocolId=${SelectedProtocolId}`);
        if (!Response.ok) throw new Error(await Response.text());

        ProtocolFollowSteps = await Response.json();
        CurrentStepIndex = 0;
        document.getElementById("ProtocolsFollowCount").innerText = ProtocolFollowSteps.length;

        if (!ProtocolFollowSteps.length) {
            ShowProtocolsFollowEmpty("Este protocolo no tiene pasos disponibles.");
            return;
        }

        ShowProtocolsFollowViewer();
        RenderProtocolsFollowViewer();
    } catch (Error) {
        document.getElementById("ProtocolsFollowCount").innerText = "0";
        ShowProtocolsFollowEmpty("No fue posible cargar los pasos del protocolo.");
        showToast("danger", Error.message || Error);
    }
}

function RenderProtocolsFollowViewer() {
    RenderProtocolsFollowRail();
    RenderProtocolsFollowStep();
}

function RenderProtocolsFollowRail() {
    const Rail = document.getElementById("ProtocolsFollowStepsRail");
    Rail.innerHTML = "";

    ProtocolFollowSteps.forEach((Step, Index) => {
        const Item = document.createElement("button");
        Item.type = "button";
        Item.className = "protocols-follow-rail-item";
        if (Index === CurrentStepIndex) Item.classList.add("active");
        if (Index < CurrentStepIndex) Item.classList.add("done");
        Item.innerHTML = `<span class="protocols-follow-rail-number">${Index < CurrentStepIndex ? '<i class="bi bi-check"></i>' : Index + 1}</span><span class="protocols-follow-rail-label">${EscapeHtml(Step.name)}</span>`;
        Item.addEventListener("click", () => SelectProtocolsFollowStep(Index));
        Rail.appendChild(Item);
    });
}

function SelectProtocolsFollowStep(Index) {
    if (Index < 0 || Index >= ProtocolFollowSteps.length) return;
    CurrentStepIndex = Index;
    RenderProtocolsFollowViewer();
}

function RenderProtocolsFollowStep() {
    const Step = ProtocolFollowSteps[CurrentStepIndex];
    const Content = document.getElementById("ProtocolsFollowStepContent");
    const Instruction = Step.instruction || "Este paso no tiene instrucciones adicionales.";
    const HasPreviousStep = CurrentStepIndex > 0;
    const HasNextStep = CurrentStepIndex < ProtocolFollowSteps.length - 1;
    const PreviousButton = HasPreviousStep ? `
            <button type="button" id="BtnProtocolsFollowPrevious" class="btn btn-outline-secondary">
                <i class="bi bi-arrow-left"></i> Paso anterior
            </button>` : "";
    const NextButton = HasNextStep ? `
            <button type="button" id="BtnProtocolsFollowNext" class="btn btn-success">
                Siguiente paso <i class="bi bi-arrow-right"></i>
            </button>` : "";

    Content.innerHTML = `
        <div class="protocols-follow-step-main">
            <div class="protocols-follow-step-head">
                <div class="protocols-follow-step-tag">Paso ${CurrentStepIndex + 1} de ${ProtocolFollowSteps.length}</div>
                <h2 class="protocols-follow-step-title">${EscapeHtml(Step.name)}</h2>
            </div>
            <div class="protocols-follow-step-instruction"></div>
            <div id="ProtocolsFollowImageCarousel" class="protocols-follow-image-carousel">
                <div class="text-body-secondary"><span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cargando imágenes...</div>
            </div>
        </div>
        <div class="protocols-follow-step-navigation">
            ${PreviousButton}
            <span class="protocols-follow-progress">${CurrentStepIndex + 1} / ${ProtocolFollowSteps.length}</span>
            ${NextButton}
        </div>`;

    Content.querySelector(".protocols-follow-step-instruction").innerText = Instruction;
    if (HasPreviousStep) Content.querySelector("#BtnProtocolsFollowPrevious").addEventListener("click", GoToPreviousProtocolsFollowStep);
    if (HasNextStep) Content.querySelector("#BtnProtocolsFollowNext").addEventListener("click", GoToNextProtocolsFollowStep);
    LoadProtocolsFollowStepImages(Step.id);
}

async function LoadProtocolsFollowStepImages(StepId) {
    const RequestId = ++StepImagesRequestId;
    const Container = document.getElementById("ProtocolsFollowImageCarousel");
    try {
        const Response = await fetch(`/ProtocolsFollow/GetProtocolStepImages?StepId=${StepId}`);
        if (!Response.ok) throw new Error(await Response.text());
        const Images = await Response.json();
        if (RequestId !== StepImagesRequestId || !Container) return;
        RenderProtocolsFollowImages(Container, Images);
    } catch (Error) {
        if (RequestId !== StepImagesRequestId || !Container) return;
        Container.innerHTML = '<div class="text-body-secondary">No fue posible cargar las imágenes de este paso.</div>';
        showToast("warning", Error.message || Error);
    }
}

function RenderProtocolsFollowImages(Container, Images) {
    Container.innerHTML = "";
    if (!Images.length) {
        Container.innerHTML = '<div class="protocols-follow-no-images"><i class="bi bi-image"></i><span>Este paso no tiene imágenes disponibles.</span></div>';
        return;
    }

    const Thumbnails = document.createElement("div");
    Thumbnails.className = "protocols-follow-thumbnails";
    Images.forEach((Image, Index) => {
        const ThumbnailButton = document.createElement("button");
        ThumbnailButton.type = "button";
        ThumbnailButton.className = "protocols-follow-thumbnail";
        ThumbnailButton.title = Image.name || `Imagen ${Index + 1}`;
        ThumbnailButton.setAttribute("aria-label", `Abrir imagen ${Index + 1}`);

        const Thumbnail = document.createElement("img");
        Thumbnail.src = Image.path;
        Thumbnail.alt = Image.name || `Imagen ${Index + 1}`;
        Thumbnail.loading = "lazy";
        ThumbnailButton.appendChild(Thumbnail);
        ThumbnailButton.addEventListener("click", () => OpenProtocolsFollowImage(Image));
        Thumbnails.appendChild(ThumbnailButton);
    });
    Container.appendChild(Thumbnails);

    const Caption = document.createElement("div");
    Caption.className = "protocols-follow-image-caption";
    Caption.innerText = `${Images.length} imagen${Images.length === 1 ? "" : "es"} disponible${Images.length === 1 ? "" : "s"}`;
    Container.appendChild(Caption);
}

function OpenProtocolsFollowImage(Image) {
    const Preview = document.getElementById("ProtocolsFollowImagePreview");
    Preview.src = Image.path;
    Preview.alt = Image.name || "Imagen del paso";
    document.getElementById("ProtocolsFollowImageModalLabel").innerText = Image.name || "Imagen del paso";
    ShowModal("ProtocolsFollowImageModal");
}

function GoToPreviousProtocolsFollowStep() {
    SelectProtocolsFollowStep(CurrentStepIndex - 1);
}

function GoToNextProtocolsFollowStep() {
    if (CurrentStepIndex < ProtocolFollowSteps.length - 1) {
        SelectProtocolsFollowStep(CurrentStepIndex + 1);
    }
}

function ShowProtocolsFollowLoading() {
    document.getElementById("ProtocolsFollowEmptyState").classList.add("d-none");
    document.getElementById("ProtocolsFollowViewer").classList.add("d-none");
    document.getElementById("ProtocolsFollowLoadingState").classList.remove("d-none");
}

function ShowProtocolsFollowViewer() {
    document.getElementById("ProtocolsFollowEmptyState").classList.add("d-none");
    document.getElementById("ProtocolsFollowLoadingState").classList.add("d-none");
    document.getElementById("ProtocolsFollowViewer").classList.remove("d-none");
}

function ShowProtocolsFollowEmpty(Message) {
    document.getElementById("ProtocolsFollowLoadingState").classList.add("d-none");
    document.getElementById("ProtocolsFollowViewer").classList.add("d-none");
    const EmptyState = document.getElementById("ProtocolsFollowEmptyState");
    EmptyState.classList.remove("d-none");
    EmptyState.querySelector("p").innerText = Message;
}

function SetProtocolsFollowInformation(Indications, Warnings) {
    SelectedProtocolIndications = Indications || "";
    SelectedProtocolWarnings = Warnings || "";
    document.getElementById("BtnProtocolsFollowIndications").disabled = SelectedProtocolIndications.trim().length === 0;
    document.getElementById("BtnProtocolsFollowWarnings").disabled = SelectedProtocolWarnings.trim().length === 0;
}

function OpenProtocolsFollowTextModal(Text, Title) {
    document.getElementById("ProtocolsFollowTextModalLabel").innerText = Title;
    document.getElementById("ProtocolsFollowTextModalBody").value = Text || "";
    ShowModal("ProtocolsFollowTextModal");
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
