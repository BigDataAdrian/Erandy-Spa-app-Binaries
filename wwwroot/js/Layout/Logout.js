document.getElementById('logout').addEventListener('click', function (event) {
    event.preventDefault();
    Logout();
});

function Logout() {
    const spinner = document.getElementById("spinnerOverlay");
    spinner.style.display = "flex";
    var apiUrl = "/Login/Logout";
    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
        .then(response => {
            if (!response.ok) {
                return response.text().then((errorText) => {
                    throw new Error(errorText);
                });
            }
        })
        .then(data => {
            setTimeout(function () {
                window.location.href = '/Login/index'
            }, 1000);
        })
        .catch(error => {

        });
}