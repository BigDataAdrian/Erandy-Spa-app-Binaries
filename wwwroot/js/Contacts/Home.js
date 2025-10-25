document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("ContactsModule", "ContactsModuleHome");
    LoadContacts()
});

async function LoadContacts() {
    try {
        const response = await fetch(`/Contacts/GetContacts`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status <= 299) {
            const result = await response.json().catch(() => null);
           
            const tbody = document.querySelector("#ContactsTable tbody");

            tbody.innerHTML = "";
            result.forEach(c => {
                const tr = document.createElement("tr");
                const mode = c.mode === "Bot"
                    ? `<span class="badge text-bg-info">Bot</span>`
                    : `<span class="badge text-bg-primary">Humano</span>`;
                tr.innerHTML = `
                <td>${c.name}</td>
                <td>${c.number}</td>
                <td>${c.createdAt}</td>
                <td>${c.updatedAt}</td>
                <td>${mode}</td>
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