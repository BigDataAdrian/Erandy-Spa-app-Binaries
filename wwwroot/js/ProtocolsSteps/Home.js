let SelectedProtocolId = null;
let SelectedStepId = null;
let SelectedStepFileId = null;
let SelectedStepFile = null;
let PendingFile = null;
let DraggedRow = null;

document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("ProtocolsStepsModule", "ProtocolsStepsModuleHome");
    InitTooltips();

    const ProtocolId = sessionStorage.getItem("ProtocolsStepsProtocolIdSelected");
    const ProtocolName = sessionStorage.getItem("ProtocolsStepsProtocolNameSelected");
    const CategoryName = sessionStorage.getItem("ProtocolsStepsCategoryNameSelected");
    if (ProtocolId && ProtocolName) {
        SelectedProtocolId = parseInt(ProtocolId);
        document.getElementById("ProtocolsStepsProtocolLabel").innerText = CategoryName ? `${CategoryName} · ${ProtocolName}` : ProtocolName;
        document.getElementById("BtnCreateProtocolStepModal").disabled = false;
        LoadProtocolsSteps();
    }

    document.getElementById("BtnSelectProtocolsStepsProtocolModal").addEventListener("click", SelectProtocolsStepsProtocolModalOpen);
    document.getElementById("BtnCreateProtocolStepModal").addEventListener("click", CreateProtocolStepModalOpen);
    document.getElementById("BtnCreateProtocolStep").addEventListener("click", AddProtocolStep);
    document.getElementById("BtnUpdateProtocolStep").addEventListener("click", UpdateProtocolStep);
    document.getElementById("BtnDeleteProtocolStep").addEventListener("click", DeleteProtocolStep);
    document.getElementById("BtnOpenProtocolStepFileUpload").addEventListener("click", OpenProtocolStepFileUpload);
    document.getElementById("BtnCancelProtocolStepFileUpload").addEventListener("click", ReturnToProtocolStepFiles);
    document.getElementById("BtnCloseProtocolStepFileUpload").addEventListener("click", ReturnToProtocolStepFiles);
    document.getElementById("BtnSaveProtocolStepFile").addEventListener("click", AddProtocolStepFile);
    document.getElementById("BtnDeleteProtocolStepFile").addEventListener("click", DeleteProtocolStepFile);
    document.getElementById("BtnCancelDeleteProtocolStepFile").addEventListener("click", ReturnToProtocolStepFiles);
    document.getElementById("BtnCloseDeleteProtocolStepFile").addEventListener("click", ReturnToProtocolStepFiles);

    const DropZone = document.getElementById("ProtocolStepFileDropZone");
    const FileInput = document.getElementById("ProtocolStepFileInput");
    DropZone.addEventListener("click", () => FileInput.click());
    DropZone.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") FileInput.click();
    });
    DropZone.addEventListener("dragover", event => {
        event.preventDefault();
        DropZone.classList.add("drag-over");
    });
    DropZone.addEventListener("dragleave", () => DropZone.classList.remove("drag-over"));
    DropZone.addEventListener("drop", event => {
        event.preventDefault();
        DropZone.classList.remove("drag-over");
        SetPendingFile(event.dataTransfer.files[0]);
    });
    FileInput.addEventListener("change", () => SetPendingFile(FileInput.files[0]));
});

async function SelectProtocolsStepsProtocolModalOpen() {
    ShowModal("SelectProtocolsStepsProtocolModal");
    await LoadProtocolsStepsProtocols();
}

async function LoadProtocolsStepsProtocols() {
    const Container = document.getElementById("ProtocolsStepsProtocolsList");
    Container.innerHTML = '<div class="text-center text-body-secondary"><span class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></span></div>';
    try {
        const [CategoriesResponse, ProtocolsResponse] = await Promise.all([
            fetch("/ProtocolsSteps/GetCategoriesSelect"),
            fetch("/ProtocolsSteps/GetProtocolsSelect")
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
            const CollapseId = `ProtocolsStepsCategory${Category.id}`;
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
                    Button.addEventListener("click", () => SelectProtocolsStepsProtocol(Protocol.id, Category.name, Protocol.name));
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

function SelectProtocolsStepsProtocol(Id, CategoryName, ProtocolName) {
    SelectedProtocolId = Id;
    sessionStorage.setItem("ProtocolsStepsProtocolIdSelected", Id);
    sessionStorage.setItem("ProtocolsStepsProtocolNameSelected", ProtocolName);
    sessionStorage.setItem("ProtocolsStepsCategoryNameSelected", CategoryName);
    document.getElementById("ProtocolsStepsProtocolLabel").innerText = `${CategoryName} · ${ProtocolName}`;
    document.getElementById("BtnCreateProtocolStepModal").disabled = false;
    HideModal("SelectProtocolsStepsProtocolModal");
    LoadProtocolsSteps();
}

async function LoadProtocolsSteps() {
    if (!SelectedProtocolId) return;
    const Tbody = document.querySelector("#ProtocolsStepsTable tbody");
    Tbody.innerHTML = '<tr><td colspan="5" class="text-center text-body-secondary"><span class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></span></td></tr>';
    try {
        const Response = await fetch(`/ProtocolsSteps/GetProtocolsSteps?ProtocolId=${SelectedProtocolId}`);
        if (!Response.ok) throw new Error(await Response.text());
        const Result = await Response.json();
        Tbody.innerHTML = "";
        if (!Result.length) {
            Tbody.innerHTML = '<tr><td colspan="5" class="text-center text-body-secondary">No hay pasos en este protocolo.</td></tr>';
        } else {
            Result.forEach(Step => RenderProtocolStepRow(Tbody, Step));
            BindDragAndDrop(Tbody, SaveProtocolStepsOrder);
        }
        document.getElementById("ProtocolsStepsCount").innerText = Result.length;
        InitTooltips();
    } catch (Error) {
        Tbody.innerHTML = '<tr><td colspan="5" class="text-center text-danger">No fue posible cargar los pasos.</td></tr>';
        showToast("danger", Error.message || Error);
    }
}

function RenderProtocolStepRow(Tbody, Step) {
    const Row = document.createElement("tr");
    Row.draggable = true;
    Row.dataset.id = Step.id;
    const Instruction = EscapeHtml(Step.instruction).replaceAll("\r\n", "<br>").replaceAll("\n", "<br>");
    Row.innerHTML = `
        <td class="order-column"><span class="drag-handle" title="Arrastrar para reordenar"><i class="bi bi-grip-vertical"></i></span><span class="step-order">${Step.order}</span></td>
        <td>${EscapeHtml(Step.name)}</td>
        <td class="instruction-cell">${Instruction || '<span class="text-body-secondary">Sin instrucción</span>'}</td>
        <td><button type="button" class="btn btn-outline-info btn-sm" data-action="files" data-bs-toggle="tooltip" data-bs-title="Administrar archivos"><i class="bi bi-paperclip"></i></button></td>
        <td><div class="btn-group float-end" role="group" aria-label="Acciones">
            <button type="button" class="btn btn-outline-warning" data-action="edit" data-bs-toggle="tooltip" data-bs-title="Editar paso"><i class="bi bi-pencil"></i></button>
            <button type="button" class="btn btn-outline-danger" data-action="delete" data-bs-toggle="tooltip" data-bs-title="Eliminar paso"><i class="bi bi-trash"></i></button>
        </div></td>`;
    Row.querySelector('[data-action="files"]').addEventListener("click", () => OpenProtocolStepFiles(Step.id, Step.name));
    Row.querySelector('[data-action="edit"]').addEventListener("click", () => UpdateProtocolStepModalOpen(Step));
    Row.querySelector('[data-action="delete"]').addEventListener("click", () => DeleteProtocolStepModalOpen(Step.id, Step.name));
    Tbody.appendChild(Row);
}

function BindDragAndDrop(Tbody, SaveOrderFunction) {
    Tbody.querySelectorAll("tr[draggable='true']").forEach(Row => {
        Row.addEventListener("dragstart", event => {
            DraggedRow = Row;
            Row.classList.add("dragging-row");
            event.dataTransfer.effectAllowed = "move";
        });
        Row.addEventListener("dragend", () => {
            Row.classList.remove("dragging-row");
            Tbody.querySelectorAll(".drop-target").forEach(Item => Item.classList.remove("drop-target"));
            DraggedRow = null;
        });
        Row.addEventListener("dragover", event => {
            event.preventDefault();
            if (DraggedRow && DraggedRow !== Row) Row.classList.add("drop-target");
        });
        Row.addEventListener("dragleave", () => Row.classList.remove("drop-target"));
        Row.addEventListener("drop", async event => {
            event.preventDefault();
            if (!DraggedRow || DraggedRow === Row) return;
            const Before = event.clientY < Row.getBoundingClientRect().top + Row.offsetHeight / 2;
            Tbody.insertBefore(DraggedRow, Before ? Row : Row.nextSibling);
            Tbody.querySelectorAll(".step-order, .file-order").forEach((Element, Index) => Element.innerText = Index + 1);
            await SaveOrderFunction();
        });
    });
}

async function SaveProtocolStepsOrder() {
    const StepIds = [...document.querySelectorAll("#ProtocolsStepsTable tbody tr[data-id]")].map(Row => parseInt(Row.dataset.id));
    try {
        const Response = await fetch("/ProtocolsSteps/UpdateProtocolStepsOrder", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ProtocolId: SelectedProtocolId, StepIds })
        });
        if (!Response.ok) throw new Error(await Response.text());
        showToast("success", "Orden de pasos actualizado exitosamente");
    } catch (Error) {
        showToast("danger", Error.message || Error);
        LoadProtocolsSteps();
    }
}

function CreateProtocolStepModalOpen() {
    if (!SelectedProtocolId) {
        showToast("warning", "Seleccione un protocolo antes de agregar un paso");
        return;
    }
    document.getElementById("CreateProtocolStepModalName").value = "";
    document.getElementById("CreateProtocolStepModalInstruction").value = "";
    ShowModal("CreateProtocolStepModal");
}

async function AddProtocolStep() {
    try {
        SetButtonLoading("BtnCreateProtocolStep", "Guardando...");
        const Response = await fetch("/ProtocolsSteps/AddProtocolStep", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ProtocolId: SelectedProtocolId, Name: document.getElementById("CreateProtocolStepModalName").value, Instruction: document.getElementById("CreateProtocolStepModalInstruction").value })
        });
        if (!Response.ok) throw new Error(await Response.text());
        showToast("success", await Response.text());
        HideModal("CreateProtocolStepModal");
        LoadProtocolsSteps();
    } catch (Error) { showToast("warning", Error.message || Error); }
    finally { ClearButtonLoading("BtnCreateProtocolStep"); }
}

function UpdateProtocolStepModalOpen(Step) {
    SelectedStepId = Step.id;
    document.getElementById("UpdateProtocolStepModalName").value = Step.name;
    document.getElementById("UpdateProtocolStepModalInstruction").value = Step.instruction;
    ShowModal("UpdateProtocolStepModal");
}

async function UpdateProtocolStep() {
    try {
        SetButtonLoading("BtnUpdateProtocolStep", "Actualizando...");
        const Response = await fetch("/ProtocolsSteps/UpdateProtocolStep", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ Id: SelectedStepId, Name: document.getElementById("UpdateProtocolStepModalName").value, Instruction: document.getElementById("UpdateProtocolStepModalInstruction").value })
        });
        if (!Response.ok) throw new Error(await Response.text());
        showToast("success", await Response.text());
        HideModal("UpdateProtocolStepModal");
        LoadProtocolsSteps();
    } catch (Error) { showToast("warning", Error.message || Error); }
    finally { ClearButtonLoading("BtnUpdateProtocolStep"); }
}

function DeleteProtocolStepModalOpen(Id, Name) {
    SelectedStepId = Id;
    document.getElementById("LabelModalDeleteProtocolStep").innerText = Name;
    ShowModal("DeleteProtocolStepModal");
}

async function DeleteProtocolStep() {
    try {
        SetButtonLoading("BtnDeleteProtocolStep", "Eliminando...");
        const Response = await fetch(`/ProtocolsSteps/DeleteProtocolStep?StepId=${SelectedStepId}`, { method: "DELETE" });
        if (!Response.ok) throw new Error(await Response.text());
        showToast("success", await Response.text());
        HideModal("DeleteProtocolStepModal");
        LoadProtocolsSteps();
    } catch (Error) { showToast("warning", Error.message || Error); }
    finally { ClearButtonLoading("BtnDeleteProtocolStep"); }
}

function OpenProtocolStepFiles(StepId, StepName) {
    SelectedStepId = StepId;
    document.getElementById("ProtocolStepFilesModalLabel").innerText = `Archivos del paso: ${StepName}`;
    ShowModal("ProtocolStepFilesModal");
    LoadProtocolStepFiles();
}

async function LoadProtocolStepFiles() {
    const Tbody = document.querySelector("#ProtocolStepFilesTable tbody");
    Tbody.innerHTML = '<tr><td colspan="3" class="text-center text-body-secondary"><span class="spinner-border spinner-border-sm" role="status"><span class="visually-hidden">Loading...</span></span></td></tr>';
    try {
        const Response = await fetch(`/ProtocolsSteps/GetProtocolStepFiles?StepId=${SelectedStepId}`);
        if (!Response.ok) throw new Error(await Response.text());
        const Result = await Response.json();
        Tbody.innerHTML = "";
        if (!Result.length) {
            Tbody.innerHTML = '<tr><td colspan="3" class="text-center text-body-secondary">No hay archivos cargados.</td></tr>';
        } else {
            Result.forEach(File => RenderProtocolStepFileRow(Tbody, File));
            BindDragAndDrop(Tbody, SaveProtocolStepFilesOrder);
        }
        InitTooltips();
    } catch (Error) {
        Tbody.innerHTML = '<tr><td colspan="3" class="text-center text-danger">No fue posible cargar los archivos.</td></tr>';
        showToast("danger", Error.message || Error);
    }
}

function RenderProtocolStepFileRow(Tbody, File) {
    const Row = document.createElement("tr");
    Row.draggable = true;
    Row.dataset.id = File.id;
    Row.innerHTML = `<td class="order-column"><span class="drag-handle" title="Arrastrar para reordenar"><i class="bi bi-grip-vertical"></i></span><span class="file-order">${File.order}</span></td><td><a href="${EscapeHtml(File.path)}" target="_blank" rel="noopener">${EscapeHtml(File.name)}</a></td><td><button type="button" class="btn btn-outline-danger btn-sm" data-bs-toggle="tooltip" data-bs-title="Eliminar archivo"><i class="bi bi-trash"></i></button></td>`;
    Row.querySelector("button").addEventListener("click", () => DeleteProtocolStepFileModalOpen(File.id, File.name));
    Tbody.appendChild(Row);
}

async function SaveProtocolStepFilesOrder() {
    const FileIds = [...document.querySelectorAll("#ProtocolStepFilesTable tbody tr[data-id]")].map(Row => parseInt(Row.dataset.id));
    try {
        const Response = await fetch("/ProtocolsSteps/UpdateProtocolStepFilesOrder", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ StepId: SelectedStepId, FileIds })
        });
        if (!Response.ok) throw new Error(await Response.text());
        showToast("success", "Orden de archivos actualizado exitosamente");
    } catch (Error) {
        showToast("danger", Error.message || Error);
        LoadProtocolStepFiles();
    }
}

function OpenProtocolStepFileUpload() {
    ResetFileUpload();
    SwitchModal("ProtocolStepFilesModal", "ProtocolStepFileUploadModal");
}

function ResetFileUpload() {
    PendingFile = null;
    document.getElementById("ProtocolStepFileInput").value = "";
    document.getElementById("ProtocolStepFileSelected").innerText = "";
    document.getElementById("ProtocolStepFileSelected").classList.add("d-none");
    document.getElementById("BtnSaveProtocolStepFile").disabled = true;
}

function SetPendingFile(File) {
    if (!File) return;
    PendingFile = File;
    const Selected = document.getElementById("ProtocolStepFileSelected");
    Selected.innerText = `${File.name} (${Math.ceil(File.size / 1024)} KB)`;
    Selected.classList.remove("d-none");
    document.getElementById("BtnSaveProtocolStepFile").disabled = false;
}

async function AddProtocolStepFile() {
    if (!PendingFile) return;
    try {
        SetButtonLoading("BtnSaveProtocolStepFile", "Cargando...");
        const Form = new FormData();
        Form.append("StepId", SelectedStepId);
        Form.append("File", PendingFile);
        const Response = await fetch("/ProtocolsSteps/AddProtocolStepFile", { method: "POST", body: Form });
        if (!Response.ok) throw new Error(await Response.text());
        showToast("success", await Response.text());
        ResetFileUpload();
        SwitchModal("ProtocolStepFileUploadModal", "ProtocolStepFilesModal", LoadProtocolStepFiles);
    } catch (Error) { showToast("warning", Error.message || Error); }
    finally { ClearButtonLoading("BtnSaveProtocolStepFile"); }
}

function DeleteProtocolStepFileModalOpen(Id, Name) {
    SelectedStepFileId = Id;
    SelectedStepFile = Name;
    document.getElementById("LabelModalDeleteProtocolStepFile").innerText = Name;
    SwitchModal("ProtocolStepFilesModal", "DeleteProtocolStepFileModal");
}

async function DeleteProtocolStepFile() {
    try {
        SetButtonLoading("BtnDeleteProtocolStepFile", "Eliminando...");
        const Response = await fetch(`/ProtocolsSteps/DeleteProtocolStepFile?FileId=${SelectedStepFileId}`, { method: "DELETE" });
        if (!Response.ok) throw new Error(await Response.text());
        showToast("success", await Response.text());
        SwitchModal("DeleteProtocolStepFileModal", "ProtocolStepFilesModal", LoadProtocolStepFiles);
    } catch (Error) { showToast("warning", Error.message || Error); }
    finally { ClearButtonLoading("BtnDeleteProtocolStepFile"); }
}

function ReturnToProtocolStepFiles() {
    const UploadModal = document.getElementById("ProtocolStepFileUploadModal");
    const DeleteModal = document.getElementById("DeleteProtocolStepFileModal");
    if (UploadModal.classList.contains("show")) {
        SwitchModal("ProtocolStepFileUploadModal", "ProtocolStepFilesModal", LoadProtocolStepFiles);
    } else if (DeleteModal.classList.contains("show")) {
        SwitchModal("DeleteProtocolStepFileModal", "ProtocolStepFilesModal", LoadProtocolStepFiles);
    } else {
        ShowModal("ProtocolStepFilesModal");
        LoadProtocolStepFiles();
    }
}

function ShowModal(Id) { bootstrap.Modal.getOrCreateInstance(document.getElementById(Id)).show(); }
function HideModal(Id) { const Modal = bootstrap.Modal.getInstance(document.getElementById(Id)); if (Modal) Modal.hide(); }
function SwitchModal(FromId, ToId, Callback) {
    const FromElement = document.getElementById(FromId);
    const FromModal = bootstrap.Modal.getInstance(FromElement);
    const OpenNext = () => {
        ShowModal(ToId);
        if (Callback) Callback();
    };
    if (FromModal && FromElement.classList.contains("show")) {
        FromElement.addEventListener("hidden.bs.modal", OpenNext, { once: true });
        FromModal.hide();
    } else {
        OpenNext();
    }
}

function SetButtonLoading(ButtonId, LoadingTitle) {
    const Button = document.getElementById(ButtonId);
    if (!Button) return;
    const Icon = Button.querySelector("i");
    if (Icon) { Button.dataset.originalIcon = Icon.className; Icon.className = "spinner-border spinner-border-sm"; }
    Button.dataset.originalTitle = Button.getAttribute("data-bs-title") || "";
    Button.disabled = true;
    Button.setAttribute("data-bs-title", LoadingTitle);
}

function ClearButtonLoading(ButtonId) {
    const Button = document.getElementById(ButtonId);
    if (!Button) return;
    const Icon = Button.querySelector("i");
    if (Icon && Button.dataset.originalIcon) Icon.className = Button.dataset.originalIcon;
    Button.disabled = false;
    Button.setAttribute("data-bs-title", Button.dataset.originalTitle || "");
}

function EscapeHtml(Value) {
    return String(Value ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function InitTooltips() {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(Element => {
        if (!bootstrap.Tooltip.getInstance(Element)) {
            new bootstrap.Tooltip(Element);
        }
    });

    document.querySelectorAll('[data-bs-toggle="popover"]').forEach(Element => {
        if (!bootstrap.Popover.getInstance(Element)) {
            new bootstrap.Popover(Element);
        }
    });
}

