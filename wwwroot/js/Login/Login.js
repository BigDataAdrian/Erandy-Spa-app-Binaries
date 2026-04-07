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
    const remember = loginForm.querySelector("input[name='remember']").checked;
    document.getElementById("SpinnerSend").style.display = "inline-flex";
    document.getElementById("SendButton").style.display = "none";

    try {
        const response = await fetch("Login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                Username: username,
                Password: password,
                Remember: remember
            })
        });

        document.getElementById("SpinnerSend").style.display = "none";
        document.getElementById("SendButton").style.display = "inline-flex";

        if (!response.ok) {
            const error = await response.text();
            showToast("warning", error);
            return;
        }


        const result = await response.text();
        window.location.href = "/home";
    } catch (error) {
        showToast("danger", error);
    }
}