document.addEventListener("DOMContentLoaded", () => {

    const LogoutButton = document.getElementById("Logout");
    LogoutButton.addEventListener("click", () => {
        Logout();
    });
});
async function Logout() {
    try {
        const response = await fetch("/Layout/Logout", {
            method: "POST"
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }

        // Redirige al login después de cerrar sesión
        const error = await response.text();
        window.location.href = "/login";
    } catch (error) {
        showToast("danger", error);
    }
}