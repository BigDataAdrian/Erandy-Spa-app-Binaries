document.addEventListener("DOMContentLoaded", () => {
    const loginButton = document.querySelector("#loginForm button");
    loginButton.addEventListener("click", (e) => {
        e.preventDefault();
        Login();
    });
});

async function Login() {
    const loginForm = document.getElementById("loginForm");
    const username = loginForm.querySelector("input[name='username']").value;
    const password = loginForm.querySelector("input[name='password']").value;
    const rememberme = loginForm.querySelector("input[name='rememberme']").checked;
    const spinner = document.getElementById("spinnerOverlay");
    spinner.style.display = "flex";

    try {
        const response = await fetch("/Login/Login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                username: username,
                password: password,
                rememberMe: rememberme
            }),
        });
        if (response.status >= 200 && response.status <= 299) {
            window.location.href = "/Home/Index";
        }

        if (response.status >= 400 && response.status <= 499) {
            const result = await response.text();
            showToast("warning", result);
        }

        if (response.status >= 500 && response.status <= 599) {
            const result = await response.text();
            showToast("danger", result);
        }
        spinner.style.display = "none";     
    } catch (error) {
        showToast("danger", error);
    }
}
