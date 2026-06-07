document.addEventListener("DOMContentLoaded", function () {
    const field = document.getElementById('att-field');
    const btnSubmit = document.getElementById('att-submit-btn');

    if (field) field.addEventListener('keydown', e => { if (e.key === 'Enter') Submit(); });
    if (btnSubmit) btnSubmit.addEventListener('click', () => Submit());

    InitClock();
    field.focus();
});

function InitClock() {
    Tick();
    setInterval(Tick, 1000);
}

function Tick() {
    const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    const now = new Date();
    const pad = n => String(n).padStart(2, '0');

    document.getElementById('att-date').textContent =
        `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`;
    document.getElementById('att-time').textContent =
        `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
}

async function Submit() {
    const field = document.getElementById('att-field');
    const val = field.value.trim();

    if (!val) {
        showToast("warning", 'Ingresa un número de empleado.');
        field.focus();
        return;
    }

    if (!/^\d{4,8}$/.test(val)) {
        showToast("warning", 'Número inválido — debe tener entre 4 y 8 dígitos.');
        field.select();
        field.value = '';
        field.focus();
        return;
    }

    try {
        const response = await fetch('/Attendances/Register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ Identifier: val })
        });

        field.value = '';
        field.focus();

        if (response.status >= 200 && response.status < 300) {
            const result = await response.json();
            showToast("success", result.message);
            AddLog(val, result.type);
        }

        if (response.status >= 400 && response.status < 500) {
            const error = await response.text();
            showToast("warning", error);
        }

        if (response.status >= 500 && response.status < 600) {
            const error = await response.text();
            showToast("danger", error);
        }
    }
    catch (error) {
        showToast("danger", error);
    }
}

function AddLog(emp, type) {
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const logSection = document.getElementById('att-log');
    const logList = document.getElementById('att-log-list');

    const badgeText = type === 'checkin' ? 'Check-in' : 'Check-out';
    const badgeClass = type === 'checkin' ? 'att-log-badge--in' : 'att-log-badge--out';

    logSection.style.display = 'block';

    const item = document.createElement('div');
    item.className = 'att-log-item';
    item.innerHTML = `
        <span class="att-log-emp">${emp}</span>
        <div class="att-log-meta">
            <span class="att-log-time">${time}</span>
            <span class="att-log-badge ${badgeClass}">${badgeText}</span>
        </div>`;

    logList.insertBefore(item, logList.firstChild);
    if (logList.children.length > 4) logList.removeChild(logList.lastChild);
}