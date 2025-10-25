document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("QuestionsModule", "QuestionsModuleHome");
    LoadQuestions();
    GetIntentions();
    GetModules();

    const BtnDeleteQuestion = document.getElementById('BtnDeleteQuestion');
    BtnDeleteQuestion.addEventListener('click', async () => {
        await DeleteQuestion();
    });

    const BtnCreateQuestionModal = document.getElementById('BtnCreateQuestionModal');
    BtnCreateQuestionModal.addEventListener('click', async () => {
        await CreateQuestionModalOpen();
    });

    const BtnCreateQuestion = document.getElementById('BtnCreateQuestion');
    BtnCreateQuestion.addEventListener('click', async () => {
        await AddQuestion();
    });

    const BtnUpdateQuestion = document.getElementById('BtnUpdateQuestion');
    BtnUpdateQuestion.addEventListener('click', async () => {
        await UpdateQuestion();
    });
});

async function LoadQuestions() {
    try {
        const response = await fetch(`/Questions/GetQuestions`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);
           
            const tbody = document.querySelector("#QuestionsTable tbody");

            tbody.innerHTML = "";
            result.forEach(c => {
                const tr = document.createElement("tr");
                tr.setAttribute("data-id", c.id);
                tr.innerHTML = `
                <td>${c.question}</td>
                <td>${c.intention}</td>
                <td>${c.response}</td>
                <td>${c.module}</td>
                <td> 
                    <div class="btn-group float-end" role="group" aria-label="Acciones">
                        <button  onclick="DeleteQuestionModalOpen(${c.id},'${c.question}')" class="btn btn-outline-danger">
                            <i class="bi bi-trash"></i>
                        </button>
                        <button onclick="UpdateQuestionModalOpen(${c.id},'${c.question}','${c.response}',${c.intentionId},${c.moduleId})" class="btn btn-outline-warning">
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

        if (response.status >= 500 && response.status <=599) {
            const result = await response.text().catch(() => null);
            showToast("danger", result);
        }

    } catch (error) {
        showToast("danger", error);
    }
}
function DeleteQuestionModalOpen(Id,Question) {
    document.getElementById("LabelModalDeleteQuestion").innerText = Question;
    sessionStorage.setItem('QuestionIdSelected', Id);
    var DeleteQuestionModal = new bootstrap.Modal(document.getElementById("DeleteQuestionModal"));
    DeleteQuestionModal.show();
}
async function DeleteQuestion() {
    try {
        var Id = sessionStorage.getItem('QuestionIdSelected');
        const data = {
            QuestionId: Id
        };
        const response = await fetch("/Questions/DeleteQuestion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const DeleteQuestionModal = document.getElementById('DeleteQuestionModal');
            const modalInstance = bootstrap.Modal.getInstance(DeleteQuestionModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }

            LoadQuestions();
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
function CreateQuestionModalOpen() {
    var CreateQuestionModal = new bootstrap.Modal(document.getElementById("CreateQuestionModal"));
    CreateQuestionModal.show();
}
async function GetModules() {
    try {
        const response = await fetch("/Questions/GetModules", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });


        if (response.status >= 200 && response.status < 300) {
            const options = await response.json().catch(() => null);
            const CreateModalModule = document.getElementById("CreateModalModule");
            CreateModalModule.innerHTML = '<option value="0">Seleccionar...</option>';

            options.forEach(r => {
                const option = document.createElement("option");
                option.value = r.id;
                option.textContent = `${r.name}`;
                CreateModalModule.appendChild(option);
            });

            const UpdateModalModule = document.getElementById("UpdateModalModule");
            UpdateModalModule.innerHTML = '<option value="0">Seleccionar...</option>';

            options.forEach(r => {
                const option = document.createElement("option");
                option.value = r.id;
                option.textContent = `${r.name}`;
                UpdateModalModule.appendChild(option);
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
        showToast("danger", error);
    }
}
async function GetIntentions() {
    try {
        const response = await fetch("/Questions/GetIntentions", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });


        if (response.status >= 200 && response.status < 300) {
            const options = await response.json().catch(() => null);
            const CreateModalIntention = document.getElementById("CreateModalIntention");
            CreateModalIntention.innerHTML = '<option value="0">Seleccionar...</option>';

            options.forEach(r => {
                const option = document.createElement("option");
                option.value = r.id;
                option.textContent = `${r.name}`;
                CreateModalIntention.appendChild(option);
            });

            const UpdateModalIntention = document.getElementById("UpdateModalIntention");
            UpdateModalIntention.innerHTML = '<option value="0">Seleccionar...</option>';

            options.forEach(r => {
                const option = document.createElement("option");
                option.value = r.id;
                option.textContent = `${r.name}`;
                UpdateModalIntention.appendChild(option);
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
        showToast("danger", error);
    }
}
async function AddQuestion() {
    try {
        const Question = document.getElementById("CreateModalQuestion");
        const Response = document.getElementById("CreateModalResponse");
        const Intention = document.getElementById("CreateModalIntention");
        const Module = document.getElementById("CreateModalModule");

        const data = {
            Question: Question.value,
            Response: Response.value,
            Intention: Intention.value,
            Module: Module.value
        };
        const response = await fetch("/Questions/AddQuestion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const CreateQuestionModal = document.getElementById('CreateQuestionModal');
            const modalInstance = bootstrap.Modal.getInstance(CreateQuestionModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }
            LoadQuestions();
           
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
async function UpdateQuestion() {
    try {
        const Id = sessionStorage.getItem('QuestionIdSelected');
        const Question = document.getElementById("UpdateModalQuestion");
        const Response = document.getElementById("UpdateModalResponse");
        const Intention = document.getElementById("UpdateModalIntention");
        const Module = document.getElementById("UpdateModalModule");

        const data = {
            Id : Id,
            Question: Question.value,
            Response: Response.value,
            Intention: Intention.value,
            Module: Module.value
        };
        const response = await fetch("/Questions/UpdateQuestion", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
            const UpdateQuestionModal = document.getElementById('UpdateQuestionModal');
            const modalInstance = bootstrap.Modal.getInstance(UpdateQuestionModal);

            if (!modalInstance) {
                new bootstrap.Modal(modalElement).hide();
            } else {
                modalInstance.hide();
            }
            LoadQuestions();

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
function UpdateQuestionModalOpen(Id, Question, Response, Intention, Module) {

    sessionStorage.setItem('QuestionIdSelected', Id);
    document.getElementById("UpdateModalQuestion").value = Question;
    document.getElementById("UpdateModalResponse").value = Response;
    document.getElementById("UpdateModalIntention").value = Intention;
    document.getElementById("UpdateModalModule").value = Module;

    var UpdateQuestionModal = new bootstrap.Modal(document.getElementById("UpdateQuestionModal"));
    UpdateQuestionModal.show();
}