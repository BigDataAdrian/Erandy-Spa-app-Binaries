document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("ChatsModule", "ChatsModuleHome");

    const SendMessageBtn = document.getElementById("MessageInput");
    SendMessageBtn.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            SendMessage();
        }
    });

    const input = document.getElementById('ContactsInput');
    input.addEventListener('input', async () => {
        await LoadContacts();
    });

    const btnCleanContact = document.getElementById("btnCleanContact");
    btnCleanContact.addEventListener("click", async (e) => {
        e.preventDefault();
        await CleanContact();
    });

    const btnSendMessage = document.getElementById("btnSendMessage");
    btnSendMessage.addEventListener("click", async (e) => {
        e.preventDefault();
        await SendMessage();
    });

    const BotMode = document.getElementById("BotMode");
    BotMode.addEventListener("change", function () {
        SwitchBot();
    });

    setInterval(LoadLastMessage, 1000);
});

async function LoadContacts() {
    const input = document.getElementById('ContactsInput');
    const suggestions = document.getElementById('ContactInputSuggestions');
    const term = input.value.trim();
    if (term.length < 2) {
        suggestions.style.display = 'none';
        return;
    }

    try {
        const response = await fetch(`/Chats/ContactsSearch?term=${encodeURIComponent(term)}`);
        suggestions.style.display = 'block';
        if (response.status >= 200 && response.status < 300) {
            const data = await response.json();

            suggestions.innerHTML = '';
            if (data.length === 0) {
                suggestions.style.display = 'none';
                return;
            }

            data.forEach(item => {
                const div = document.createElement('div');
                div.className = 'list-group-item suggestion-item';
                div.textContent = item.name + " (" + item.number + ")";

                div.addEventListener('click', () => {
                    input.value = item.name + " (" + item.number + ")";
                    sessionStorage.setItem('ContactSelected', item.id);
                    suggestions.innerHTML = '';
                    suggestions.style.display = 'none';
                    input.disabled = true;
                    LoadMessages();
                });

                suggestions.appendChild(div);
            });
        }

        if (response.status >= 400 && response.status < 500) {
            const result = await response.text();
            showToast("warning", result);
        }

        if (response.status >= 500) {
            const result = await response.text();
            showToast("danger", result);
        }
    } catch (error) {
        showToast("danger", error);
    }
}
function CleanContact() {
    const input = document.getElementById('ContactsInput');
    input.disabled = false;
    input.value = "";
    input.focus();

    document.getElementById("BotMode").disabled = true;
    document.getElementById("MessageInput").disabled = true;
    document.getElementById("btnSendMessage").disabled = true;
    const CardMessages = document.getElementById("CardMessages");
    CardMessages.style.display = "none";

    sessionStorage.removeItem("ContactSelected");
    sessionStorage.removeItem('LastMessage');
}
async function LoadMessages() {
    try {
        var Id = sessionStorage.getItem('ContactSelected');
        if (!Id) {
            return;
        }

        const response = await fetch(`/Chats/GetMessages?ContactId=${encodeURIComponent(Id)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);

            const input = document.getElementById('ContactsInput');
            input.value = result.name + " (" + result.number + ")";
            input.disabled = true;

            const CardMessages = document.getElementById("CardMessages");
            document.getElementById("MessageInput").disabled = false;
            document.getElementById("btnSendMessage").disabled = false;
            document.getElementById("BotMode").checked = result.botMode;
            CardMessages.style.display = "flex";
            const lastId = result.messages[0]?.id;
            sessionStorage.setItem('LastMessage', lastId);
            const tbody = document.querySelector("#MessagesTable tbody");

            tbody.innerHTML = "";
            result.messages.forEach(c => {
                const tr = document.createElement("tr");
                const badge = c.direction === "Enviado"
                    ? `<span class="badge text-bg-info">Enviado</span>`
                    : `<span class="badge text-bg-success">Recibido</span>`;
                tr.innerHTML = `
                <td><span class="badge text-bg-primary">${c.origin}</span></td>
                <td>${badge || ""}</td>
                <td>${c.text || ""}</td>
                <td>${c.createdDate || ""}</td>
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
async function SendMessage() {

    try {
        const spinner = document.getElementById("SpinnerSend");
        spinner.style.display = "inline-block";
        const Message = document.getElementById("MessageInput");
     
        var ContactId = sessionStorage.getItem('ContactSelected');
        const data = {
            ContactId: ContactId,
            Message: Message.value
        };

        const response = await fetch("/Chats/SendMessage", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });


        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            document.getElementById("MessageInput").value = '';
            showToast("success", result);
        }

        if (response.status >= 400 && response.status <= 499) {
            const result = await response.text().catch(() => null);
            showToast("warning", result);
        }

        if (response.status >= 500 && response.status <= 599) {
            const result = await response.text().catch(() => null);
            showToast("danger", result);
        }
        spinner.style.display = "none";
    } catch (error) {
        showToast("danger", error);
    }
}
async function LoadLastMessage() {
    try {
        const input = document.getElementById('ContactsInput');
        if (!input.value) {
            return;
        }

        const ContactId = sessionStorage.getItem('ContactSelected');
        const MessageId = sessionStorage.getItem('LastMessage');

        if (!ContactId || !MessageId || !input.value) {
            console.warn("Missing data:", { ContactId, MessageId, input: input.value });
            return;
        }

        const response = await fetch(`/Chats/GetLastMessages?ContactId=${encodeURIComponent(ContactId)}&MessageId=${encodeURIComponent(MessageId)}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);
            if (result.length > 0) {
                const firstId = result[0].id;

                sessionStorage.setItem('LastMessage', firstId);
            } else {
                return;
            }
            const tbody = document.querySelector("#MessagesTable tbody");

            result.forEach(c => {
                const tr = document.createElement("tr");
                const badge = c.direction === "Enviado"
                    ? `<span class="badge text-bg-info">Enviado</span>`
                    : `<span class="badge text-bg-success">Recibido</span>`;
                tr.innerHTML = `
                <td><span class="badge text-bg-primary">${c.origin}</span></td>
                <td>${badge || ""}</td>
                <td>${c.text || ""}</td>
                <td>${c.createdDate || ""}</td>
            `;

                tbody.prepend(tr);
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
async function SwitchBot() {

    try {
        var BotMode = document.getElementById("BotMode").checked;
        var ContactId = sessionStorage.getItem('ContactSelected');
        const data = {
            ContactId: ContactId,
            Bot: BotMode
        };

        const response = await fetch("/Chats/BotMode", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });


        if (response.status >= 200 && response.status <= 299) {
            const result = await response.text().catch(() => null);
            showToast("success", result);
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