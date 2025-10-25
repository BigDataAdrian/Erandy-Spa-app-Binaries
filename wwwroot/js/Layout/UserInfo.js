document.addEventListener("DOMContentLoaded", () => {
    GetUserInfo();
});
async function GetUserInfo() {
    try {
        const response = await fetch("/Layout/GetUserInfo", {
            method: "GET"
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error);
        }

        const info = await response.json();
        document.getElementById("LayoutName").innerText = info.name;
        document.getElementById("LayoutUsername").innerText = info.username;
        document.getElementById("LayoutRole").innerText = info.role;
    } catch (error) {
        showToast("danger", error);
    }
}

async function setActiveMenu(menu, opcion) {
    try {
        const response = await fetch("/Layout/GetUserInfo");
        const data = await response.json();
        const userRole = data.role;

        document.querySelectorAll("[data-role]").forEach(item => {
            const rolesAllowed = item.getAttribute("data-role").split(",").map(r => r.trim());
            if (!rolesAllowed.includes(userRole)) {
                item.style.display = "none";
            }
        });

        // Remove 'menu-open' from all .nav-item elements
        document.querySelectorAll(".nav-item.menu-open").forEach(el => {
            el.classList.remove("menu-open");
        });

        // Add 'menu-open' to the one with the specified ID
        const target = document.getElementById(menu);
        if (target && target.classList.contains("nav-item")) {
            target.classList.add("menu-open");
        }

        // Remove 'active' from all links
        document.querySelectorAll(".nav-link.active").forEach(activeLink => {
            activeLink.classList.remove("active");
        });

        // Add 'active' class to the specified link
        let newActiveLink = document.getElementById(opcion);
        if (newActiveLink) {
            newActiveLink.classList.add("active");
        }
    } catch (error) {
        console.error("Error loading user:", error);
    }
}