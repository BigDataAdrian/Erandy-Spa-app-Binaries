let calendar;
document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("AppointmentsModule", "AppointmentsModuleHome");

    Loadevents();
});
function Loadevents() {
    var calendarEl = document.getElementById('calendar');

    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'timeGridDay',
        editable: false,            // 🔥 Habilita drag & drop
        droppable: false,           // Permite soltar eventos externos (opcional)
        eventDurationEditable: false, // Habilita resize
        eventStartEditable: false,    // Habilita mover eventos
        selectable: false,
        themeSystem: 'bootstrap5',
        height: '100%',
        expandRows: true,
        locale: 'es',
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        allDayText: 'Todo el día',
        buttonText: {
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día'
        },
        slotLabelFormat: {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        },
        eventTimeFormat: {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        },
        //dateClick: function (info) {
        //    calendar.changeView('timeGridDay', info.dateStr);
        //},
        events: {
            url: '/Appointments/GetAppointments'
        }
    });

    calendar.render();
}

function AddEvent() {
    calendar.addEvent({
        title: 'Evento dinámico',
        start: '2025-11-21T14:00:00',
        end: '2025-11-21T15:00:00',
        color: 'green'
    });
}