function showToast(type, message, title = "", delay = 1000) {
    const t = type.toLowerCase();

    // Bootstrap contextual classes
    const typeClass = {
        default: "toast",
        primary: "toast-primary",
        secondary: "toast-secondary",
        success: "toast-success",
        danger: "toast-danger",
        warning: "toast-warning",
        info: "toast-info",
        light: "toast-light",
        dark: "toast-dark",
    }[t] || "toast";

    // Bootstrap Icons per type
    const iconClass = {
        default: "bi-bell",
        primary: "bi-info-circle",
        secondary: "bi-circle",
        success: "bi-check-circle",
        danger: "bi-x-circle",
        warning: "bi-exclamation-triangle",
        info: "bi-info-circle",
        light: "bi-lightbulb",
        dark: "bi-moon-stars"
    }[t] || "bi-bell";

    // Unique id
    const toastId = `toast-${t}-${Date.now()}`;

    // Create toast element
    const toastEl = document.createElement("div");
    toastEl.className = `toast ${typeClass}`;
    toastEl.id = toastId;
    toastEl.setAttribute("role", "alert");
    toastEl.setAttribute("aria-live", "assertive");
    toastEl.setAttribute("aria-atomic", "true");

    // Build inner HTML
    toastEl.innerHTML = `
        <div class="toast-header">
            <i class="bi ${iconClass} me-2"></i>
            ${title ? `<strong class="me-auto">${title}</strong>` : `<div class="ms-auto"></div>`}
            <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body">${message}</div>
    `;

    // Append to container and show
    const container = document.getElementById("toastContainer");
    if (!container) {
        console.warn("Toast container not found");
        return;
    }
    container.appendChild(toastEl);

    const toast = new bootstrap.Toast(toastEl, { delay });
    toast.show();

    // Clean up when hidden
    toastEl.addEventListener("hidden.bs.toast", () => toastEl.remove());
}
