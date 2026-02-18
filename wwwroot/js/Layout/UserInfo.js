document.addEventListener("DOMContentLoaded", () => {
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
    const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

    const switchDarkMode = document.getElementById("SwitchDarkMode");
    switchDarkMode.addEventListener("change", SwitchDarkMode);

    GetUserInfo();
    LoadSavedTheme();
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
const SELECTOR_SIDEBAR_WRAPPER = ".sidebar-wrapper";
const Default = {
    scrollbarTheme: "os-theme-light",
    scrollbarAutoHide: "leave",
    scrollbarClickScroll: true
}

document.addEventListener("DOMContentLoaded", function () {
    const sidebarWrapper = document.querySelector(SELECTOR_SIDEBAR_WRAPPER);

    if (sidebarWrapper) {
        OverlayScrollbarsGlobal.OverlayScrollbars(sidebarWrapper, {
            scrollbars: {
                theme: Default.scrollbarTheme,
                autoHide: Default.scrollbarAutoHide,
                clickScroll: Default.scrollbarClickScroll
            }
        });
    }
});

function SwitchDarkMode() {
    const switchDarkMode = document.getElementById("SwitchDarkMode");
    const body = document.body;
    const aside = document.querySelector("aside");

    const newTheme = switchDarkMode.checked ? "dark" : "light";
    body.setAttribute("data-bs-theme", newTheme);
    aside.setAttribute("data-bs-theme", newTheme);
    localStorage.setItem("theme", newTheme);
}
function LoadSavedTheme() {
    const body = document.body;
    const aside = document.querySelector("aside");
    const switchDarkMode = document.getElementById("SwitchDarkMode");
    const savedTheme = localStorage.getItem("theme") || "light";
    body.setAttribute("data-bs-theme", savedTheme);
    aside.setAttribute("data-bs-theme", savedTheme);
    switchDarkMode.checked = savedTheme === "dark";
}