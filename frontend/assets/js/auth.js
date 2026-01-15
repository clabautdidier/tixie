const Auth = {
    // Gebruik overal dezelfde key!
    getToken: function() { return localStorage.getItem('jwt_token'); },

    getUser: function() {
        const token = this.getToken();
        if (!token) return null;
        try {
            return JSON.parse(window.atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        } catch (e) { return null; }
    },

    isTokenExpired: function() {
        const user = this.getUser();
        if (!user || !user.exp) return true;
        return user.exp < Math.floor(Date.now() / 1000);
    },

    // Bepaal de context voor redirects
    getPathPrefix: function() {
        return window.location.pathname.includes('/admin/') ? '../' : './';
    },

    checkAuth: function() {
        const user = this.getUser();
        const isAdminPage = window.location.pathname.includes('/admin/');
        const isLoginPage = window.location.pathname.includes('login.html');

        // Als we op een login pagina zijn, niet redirecten (voorkomt infinite loop)
        if (isLoginPage) return true;

        if (!user || this.isTokenExpired()) {
            this.logout();
            return false;
        }

        if (isAdminPage && !user.roles.includes('ROLE_ADMIN')) {
            window.location.href = this.getPathPrefix() + 'index.html';
            return false;
        }
        return true;
    },

    logout: function() {
        localStorage.removeItem('jwt_token');
        window.location.href = 'login.html';
    },

    hasRole: function(role) {
        const user = this.getUser();
        return user && user.roles && user.roles.includes(role);
    }
};