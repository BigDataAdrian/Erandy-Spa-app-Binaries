document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("AppointmentsModule", "AppointmentsModuleBlocked");

    const BtnCreateBlockModal = document.getElementById('BtnCreateBlockModal');
    BtnCreateBlockModal.addEventListener('click', async () => {
        await CreateQuestionModalOpen();
    });
});