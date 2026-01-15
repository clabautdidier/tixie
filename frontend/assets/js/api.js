const API = {
    baseUrl: "http://localhost:8080/api",

    async call(endpoint, method = 'GET', body = null) {
        const token = Auth.getToken(); // Gebruik de Auth helper!

        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token}` : ''
            }
        };

        if (body) options.body = JSON.stringify(body);

        const response = await fetch(`${this.baseUrl}${endpoint}`, options);

        if (response.status === 401) {
            Auth.logout();
            return null;
        }

        if (response.status === 403) {
            alert("403: Onvoldoende rechten voor deze actie.");
            return null;
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Fout: ${response.status}`);
        }

        return response.status === 204 ? true : await response.json();
    },

    login: async function(username, password) {
        return this.call('/auth/login', 'POST', { username, password });
    }
};