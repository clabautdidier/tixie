const CustomerNavbar = {
    render: function() {
        const navHtml = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-success">
            <div class="container-fluid">
                <a class="navbar-brand" href="index.html">Tixie Customer Portal</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item">
                            <a class="nav-link" href="index.html">Dashboard</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="incidents.html">Mijn Incidenten</a>
                        </li>
                        <li class="nav-item">
                            <a class="nav-link" href="new-incident.html">Nieuw Incident</a>
                        </li>
                    </ul>
                    <div class="d-flex align-items-center">
                        <span id="userDisplay" class="text-light me-3 small"></span>
                        <button class="btn btn-outline-light btn-sm" onclick="Auth.logout()">Uitloggen</button>
                    </div>
                </div>
            </div>
        </nav>`;

        const header = document.getElementById('main-navbar');
        if (header) {
            header.innerHTML = navHtml;
            this.updateUserDisplay();
        }
    },

    updateUserDisplay: function() {
        const user = Auth.getUser();
        if (user) {
            const displayName = user.fullName || user.username;
            document.getElementById('userDisplay').textContent = displayName;
        }
    }
};

// Start de render zodra het script geladen is
document.addEventListener('DOMContentLoaded', () => {
    if (Auth.checkAuth()) {
        CustomerNavbar.render();
    }
});
