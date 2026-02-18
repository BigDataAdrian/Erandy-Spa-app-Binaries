document.addEventListener("DOMContentLoaded", () => {
    setActiveMenu("ConversationsModule", "ConversationsModuleHome");

    LoadContacts();
});
async function LoadContacts() {
    // Referencia al contenedor principal de la lista de usuarios
    const usersContainer = document.getElementById('Users');

    try {
        const response = await fetch(`/Conversations/GetContacts`);

        if (response.status >= 200 && response.status < 300) {
            const data = await response.json();

            // Limpiamos el contenedor antes de llenarlo
            usersContainer.innerHTML = '';

            data.forEach(item => {
                // Creamos el div principal del usuario
                const userDiv = document.createElement('div');
                userDiv.className = 'user';

                // Inyectamos el HTML interno respetando tus clases de CSS
                userDiv.innerHTML = `
                    <div class="pfp nopic">
                        <img src="/assets/waimg/icons8-account-96.png" alt="">
                    </div>
                    <div class="userinfo">
                        <div class="name">
                            <p>${item.name}</p>
                        </div>
                        <div class="message">
                            <div class="meicon">
                                <div>
                                    <img src="/assets/waimg/icons8-double-tick-96 (1).png" alt="">
                                </div>
                                <p>${item.lastMessage || 'Sin mensajes'}</p>
                                <div class="arrow">
                                    <img src="/assets/waimg/icons8-expand-arrow-96.png" alt="">
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="userdate">
                        <p>${item.date}</p>
                    </div>
                `;

                // Mantenemos tu lógica de clic
                userDiv.addEventListener('click', () => {
                    // Si usas el input anterior, puedes mantener estas líneas
                    // input.value = item.name; 
                    sessionStorage.setItem('ContactSelected', item.id);

                    // Lógica para cargar mensajes
                    LoadMessages();
                });

                // Agregamos el nuevo bloque al contenedor
                usersContainer.appendChild(userDiv);
            });
        }

        if (response.status >= 400 && response.status < 500) {
            const result = await response.text();
            showToast("warning", result);
        }

        if (response.status >= 500) {
            const result = await response.text();
            showToast("danger", result);
        }
    } catch (error) {
        showToast("danger", error);
    }
}
async function LoadMessages() {
    const contactId = sessionStorage.getItem('ContactSelected');
    const messagesContainer = document.getElementById('messages');

    if (!contactId) return;

    try {
        const response = await fetch(`/Conversations/GetMessages?ContactId=${contactId}`);

        if (response.status >= 200 && response.status < 300) {
            const data = await response.json();
            messagesContainer.innerHTML = ''; // Limpiar chat

            data.forEach(group => {
                // 1. Insertar el separador de fecha
                const dateDiv = document.createElement('div');
                dateDiv.className = 'dateofm middle';
                dateDiv.innerHTML = `<p>${group.date}</p>`;
                messagesContainer.appendChild(dateDiv);

                // 2. Agrupar mensajes seguidos de la misma dirección
                let lastDirection = null;
                let currentGroupContainer = null;

                group.messages.forEach(msg => {
                    const isSender = msg.direction === 'enviado';

                    // Si el mensaje actual tiene dirección diferente al anterior, creamos un nuevo contenedor
                    if (msg.direction !== lastDirection) {
                        currentGroupContainer = document.createElement('div');
                        currentGroupContainer.className = isSender ? 'senderContainer arrowm' : 'receiverContainer arrowm';
                        messagesContainer.appendChild(currentGroupContainer);
                        lastDirection = msg.direction;
                    }

                    // 3. Crear el globo del mensaje (mepop)
                    const messageBubble = document.createElement('div');
                    messageBubble.className = `${isSender ? 'sender' : 'reciver'} mepop`;

                    messageBubble.innerHTML = `
                        <div class="thereply">
                            <p>${msg.message}</p>
                            <div class="time">
                                <p>${msg.hour}</p>
                                ${isSender ? '<img src="/assets/waimg/icons8-double-tick-96.png" alt="">' : ''}
                            </div>
                            <div class="arrowhover ${isSender ? 'arrowG' : 'arrowW'}">
                                <img src="/assets/waimg/icons8-expand-arrow-96.png" alt="">
                            </div>
                            <div class="react ${isSender ? 'rightr' : 'leftr'}">
                                <img src="/assets/waimg/icons8-happy-96.png" alt="">
                            </div>
                        </div>
                    `;

                    currentGroupContainer.appendChild(messageBubble);
                });
            });

            // Scroll al final para ver el último mensaje
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Manejo de errores respetando tu estructura original
        if (response.status >= 400 && response.status < 500) {
            const result = await response.text();
            showToast("warning", result);
        }
        if (response.status >= 500) {
            const result = await response.text();
            showToast("danger", result);
        }
    } catch (error) {
        showToast("danger", error);
    }
}