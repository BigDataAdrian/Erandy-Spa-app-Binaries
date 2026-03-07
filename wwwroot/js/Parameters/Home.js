document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("ParametersModuleHome");
    LoadParametersSelect();

    const Parameters = document.getElementById("Parameters");
    Parameters.addEventListener("change", () => {
        LoadParameter();
    });

    const btnSaveParameter = document.getElementById("btnSaveParameter");
    btnSaveParameter.addEventListener("click", () => {
        SaveParameter();
    });
});

async function LoadParametersSelect() {
    try {
        const response = await fetch("/Parameters/GetParameters", {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status < 300) {
            const options = await response.json().catch(() => null);
            const select = document.getElementById("Parameters");

            select.innerHTML = '<option value="0">Seleccionar...</option>';

            options.forEach(r => {
                const option = document.createElement("option");
                option.value = r.id;
                option.textContent = `${r.value}`;
                select.appendChild(option);
            });

            return;
        }

        if (response.status >= 400 && response.status < 500) {

            const result = await response.text().catch(() => null);
            showToast("warning", result);
            return;
        }

        if (response.status >= 500) {

            const result = await response.text().catch(() => null);
            showToast("danger", result);
            return;
        }


    } catch (error) {
        showToast("danger", error);
    }
}
async function LoadParameter() {
    try {
        var Select = document.getElementById("Parameters");
        const response = await fetch("/Parameters/GetParameter?Parameter=" + Select.value, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });

        if (response.status >= 200 && response.status < 300) {
            const result = await response.json().catch(() => null);
            document.getElementById("Parameter").value = result.value;
            document.getElementById("CardMessages").style.display = "flex";
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
async function SaveParameter() {

    try {
        const Parameter = document.getElementById("Parameters");
        const Value = document.getElementById("Parameter");
        const data = {
            ParameterId: Parameter.value,
            Value: Value.value
        };

        const response = await fetch("/Parameters/UpdateParameter", {
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