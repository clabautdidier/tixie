const Navbar = {
    render: function() {
        const navHtml = `
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="index.html">Tixie Admin</a>
                <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span class="navbar-toggler-icon"></span>
                </button>
                <div class="collapse navbar-collapse" id="navbarNav">
                    <ul class="navbar-nav me-auto">
                        <li class="nav-item dropdown" id="adminMenu" style="display: none;">
                            <a class="nav-link dropdown-toggle" href="#" id="adminDropdown" data-bs-toggle="dropdown">Admin</a>
                            <ul class="dropdown-menu dropdown-menu-dark">
                                <li><a class="dropdown-item" href="users.html">User Management</a></li>
                            </ul>
                        </li>
                        <li class="nav-item dropdown" id="configMenu" style="display: none;">
                            <a class="nav-link dropdown-toggle" href="#" id="configDropdown" data-bs-toggle="dropdown">Configuration Management</a>
                            <ul class="dropdown-menu dropdown-menu-dark">
                                <li><a class="dropdown-item" href="properties.html">Property Library</a></li>
                                <li><a class="dropdown-item" href="location-types.html">Location Types</a></li>
                                <li><a class="dropdown-item" href="locations.html">Locations</a></li>
                                <li><a class="dropdown-item" href="configuration-item-types.html">Configuration Item Types</a></li>
                                <li><a class="dropdown-item" href="configuration-items.html">Configuration Items</a></li>
                            </ul>
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
            this.applyPermissions();
        }
    },

    applyPermissions: function() {
        Auth.checkAuth();
        const isAdmin = Auth.hasRole('ROLE_ADMIN');
        const isLocAdmin = Auth.hasRole('ROLE_CONFIGLOCATIONADMIN') || isAdmin;

        if (isAdmin) document.getElementById('adminMenu').style.display = 'block';
        if (isLocAdmin) document.getElementById('configMenu').style.display = 'block';

        const user = Auth.getUser();
        if (user) document.getElementById('userDisplay').textContent = user.username;
    }
};

// Start de render zodra het script geladen is
document.addEventListener('DOMContentLoaded', () => {
    // 1. Controleer onmiddellijk de sessie
    if (Auth.checkAuth()) {
        // 2. Alleen als de sessie OK is, laden we de navbar
        Navbar.render();
    }
});