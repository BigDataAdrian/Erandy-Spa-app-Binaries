document.addEventListener("DOMContentLoaded", function () {

    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });


    const switchDarkMode = document.getElementById("SwitchDarkMode");
    switchDarkMode.addEventListener("change", SwitchDarkMode);
    setActiveMenu();
    GetUserInfo();
    LoadSavedTheme();
});
async function GetUserInfo() {
    try {
        const response = await fetch("/Layout/GetUser");
        const data = await response.json();
        LoadModules(data.role);
        document.getElementById("UserName").textContent = data.name;
        document.getElementById("UserPosition").textContent = data.title;
        document.getElementById("UserDepartment").textContent = data.department;


    } catch (error) {
        showToast("danger", error);
    }
}
function LoadModules(userRole) {
    document.querySelectorAll("[data-role]").forEach(item => {
        const rolesAllowed = item.getAttribute("data-role").split(",").map(r => r.trim());
        if (!rolesAllowed.includes(userRole)) {
            item.style.display = "none";
        }
    });
}
async function setActiveMenu() {
    try {
        const currentPath = window.location.pathname.toLowerCase();
        const navLinks = document.querySelectorAll('#navigation .nav-link');
        let activeLink = null;

        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (!href || href === '#' || href === '') return;

            const linkPath = new URL(link.href, window.location.origin).pathname.toLowerCase();

            if (currentPath === linkPath) {
                activeLink = link;
            }
            else if (linkPath !== '/' && currentPath.startsWith(linkPath)) {
                if (!activeLink || linkPath.length > new URL(activeLink.href, window.location.origin).pathname.length) {
                    activeLink = link;
                }
            }
        });

        if (activeLink) {
            activeLink.classList.add('active');

            let parent = activeLink.closest('.nav-item');
            while (parent) {

                if (parent.querySelector('.nav-treeview')) {
                    parent.classList.add('menu-open');
                }

                const parentLink = parent.querySelector(':scope > .nav-link');
                if (parentLink) {
                    parentLink.classList.add('active');
                }

                const nextParentUl = parent.closest('ul.nav-treeview');
                parent = nextParentUl ? nextParentUl.closest('.nav-item') : null;
            }
        }
    } catch (error) {
        showToast("danger", error, "", 3000);
    }
}
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