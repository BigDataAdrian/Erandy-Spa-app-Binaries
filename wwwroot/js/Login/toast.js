function showToast(type, message, title = "Notificación", label = "") {
    const toastId = {
        default: "toastDefault",
        primary: "toastPrimary",
        secondary: "toastSecondary",
        success: "toastSuccess",
        danger: "toastDanger",
        warning: "toastWarning",
        info: "toastInfo",
        light: "toastLight",
        dark: "toastDark",
    }[type.toLowerCase()] || "toastDefault";

    const toastEl = document.getElementById(toastId);
    if (!toastEl) return console.warn("Toast not found:", toastId);

    // Update title
    const titleEl = toastEl.querySelector(".toast-header .me-auto");
    if (titleEl) titleEl.textContent = title;

    // Update message
    const bodyEl = toastEl.querySelector(".toast-body");
    if (bodyEl) bodyEl.textContent = message;

    // Update label (e.g., category, timestamp, etc.)
    const labelEl = toastEl.querySelector(".toast-header small");
    if (labelEl) labelEl.textContent = label;

    // Show the toast
    const toast = bootstrap.Toast.getOrCreateInstance(toastEl);
    toast.show();
}