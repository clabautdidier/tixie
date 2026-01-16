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
                        <div class="dropdown">
                            <button class="btn btn-outline-light btn-sm dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                <span id="userDisplay">Gebruiker</span>
                            </button>
                            <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                <li><a class="dropdown-item" href="profile.html">Profiel</a></li>
                                <li><a class="dropdown-item" href="#" data-bs-toggle="modal" data-bs-target="#changePasswordModal">Wachtwoord wijzigen</a></li>
                                <li><hr class="dropdown-divider"></li>
                                <li><a class="dropdown-item" href="#" onclick="Auth.logout()">Uitloggen</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </nav>

        <!-- Change Password Modal -->
        <div class="modal fade" id="changePasswordModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Wachtwoord wijzigen</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <form id="changePasswordForm">
                            <div class="mb-3">
                                <label class="form-label">Huidig wachtwoord</label>
                                <input type="password" class="form-control" id="currentPassword" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Nieuw wachtwoord</label>
                                <input type="password" class="form-control" id="newPassword" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Bevestig nieuw wachtwoord</label>
                                <input type="password" class="form-control" id="confirmNewPassword" required>
                            </div>
                            <div id="passwordError" class="alert alert-danger d-none"></div>
                            <div id="passwordSuccess" class="alert alert-success d-none"></div>
                            <button type="submit" class="btn btn-primary w-100">Wijzigen</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>`;

        const header = document.getElementById('main-navbar');
        if (header) {
            header.innerHTML = navHtml;
            this.updateUserDisplay();
            this.setupPasswordModal();
        }
    },

    updateUserDisplay: function() {
        const user = Auth.getUser();
        if (user) {
            const displayName = user.fullName || user.username;
            document.getElementById('userDisplay').textContent = displayName;
        }
    },

    setupPasswordModal: function() {
        const form = document.getElementById('changePasswordForm');
        if (!form) return;

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const currentPassword = document.getElementById('currentPassword').value;
            const newPassword = document.getElementById('newPassword').value;
            const confirmNewPassword = document.getElementById('confirmNewPassword').value;
            const errorDiv = document.getElementById('passwordError');
            const successDiv = document.getElementById('passwordSuccess');

            errorDiv.classList.add('d-none');
            successDiv.classList.add('d-none');

            if (newPassword !== confirmNewPassword) {
                errorDiv.textContent = "Nieuwe wachtwoorden komen niet overeen.";
                errorDiv.classList.remove('d-none');
                return;
            }

            try {
                await API.call('/users/change-password', 'POST', {
                    currentPassword,
                    newPassword
                });
                
                successDiv.textContent = "Wachtwoord succesvol gewijzigd.";
                successDiv.classList.remove('d-none');
                form.reset();
                setTimeout(() => {
                    const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
                    modal.hide();
                    successDiv.classList.add('d-none');
                }, 2000);
            } catch (err) {
                errorDiv.textContent = err.message;
                errorDiv.classList.remove('d-none');
            }
        });
    }
};

// Start de render zodra het script geladen is
document.addEventListener('DOMContentLoaded', () => {
    if (Auth.checkAuth()) {
        CustomerNavbar.render();
    }
});