const API_BASE = '/api';

async function getToken() {
  return localStorage.getItem('jwt_token');
}

export async function apiCall(endpoint, method = 'GET', body = null) {
  const token = await getToken();

  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  };

  if (body) options.body = JSON.stringify(body);

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, options);
  } catch (e) {
    throw new Error("Kan de server niet bereiken.");
  }

  if (response.status === 401) {
    if (endpoint === '/auth/login') {
      throw new Error("Ongeldige gebruikersnaam of wachtwoord.");
    }
    localStorage.removeItem('jwt_token');
    window.dispatchEvent(new CustomEvent('auth:logout'));
    return null;
  }

  if (response.status === 403) {
    throw new Error("Onvoldoende rechten.");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Fout: ${response.status}`);
  }

  return response.status === 204 ? true : await response.json();
}

export const api = {
  login: (username, password) =>
    apiCall('/auth/login', 'POST', { username, password }),

  // Users
  getUsers: () => apiCall('/users'),
  getUser: (uuid) => apiCall(`/users/${uuid}`),
  createUser: (data) => apiCall('/users', 'POST', data),
  updateUser: (uuid, data) => apiCall(`/users/${uuid}`, 'PUT', data),
  updateUserPassword: (uuid, password) =>
    apiCall(`/users/${uuid}/password`, 'PUT', { password }),
  changePassword: (currentPassword, newPassword) =>
    apiCall('/users/change-password', 'POST', { currentPassword, newPassword }),

  // Users me (profile)
  getMe: () => apiCall('/users/me'),
  updateMe: (data) => apiCall('/users/me', 'PUT', data),

  // Properties
  getProperties: () => apiCall('/properties'),
  getProperty: (uuid) => apiCall(`/properties/${uuid}`),
  createProperty: (data) => apiCall('/properties', 'POST', data),
  updateProperty: (uuid, data) => apiCall(`/properties/${uuid}`, 'PUT', data),

  // Location Types
  getLocationTypes: () => apiCall('/location-types'),
  createLocationType: (data) => apiCall('/location-types', 'POST', data),
  updateLocationType: (uuid, data) =>
    apiCall(`/location-types/${uuid}`, 'PUT', data),

  // Locations
  getLocations: () => apiCall('/locations'),
  getLocation: (uuid) => apiCall(`/locations/${uuid}`),
  getLocationsTree: () => apiCall('/locations/tree'),
  createLocation: (data) => apiCall('/locations', 'POST', data),
  updateLocation: (uuid, data) => apiCall(`/locations/${uuid}`, 'PUT', data),

  // Configuration Item Types
  getConfigurationItemTypes: () => apiCall('/configuration-item-types'),
  createConfigurationItemType: (data) =>
    apiCall('/configuration-item-types', 'POST', data),
  updateConfigurationItemType: (uuid, data) =>
    apiCall(`/configuration-item-types/${uuid}`, 'PUT', data),

  // Configuration Items
  getConfigurationItems: () => apiCall('/configuration-items'),
  getConfigurationItem: (uuid) => apiCall(`/configuration-items/${uuid}`),
  getConfigurationItemsTree: (locationUuid) =>
    apiCall(
      locationUuid
        ? `/configuration-items/tree?locationUuid=${locationUuid}`
        : '/configuration-items/tree'
    ),
  createConfigurationItem: (data) =>
    apiCall('/configuration-items', 'POST', data),
  updateConfigurationItem: (uuid, data) =>
    apiCall(`/configuration-items/${uuid}`, 'PUT', data),
  deleteConfigurationItem: (uuid) =>
    apiCall(`/configuration-items/${uuid}`, 'DELETE'),

  // Incidents
  getIncidents: () => apiCall('/incidents'),
  getIncident: (uuid) => apiCall(`/incidents/${uuid}`),
  createIncident: (data) => apiCall('/incidents', 'POST', data),
  updateIncident: (uuid, data) => apiCall(`/incidents/${uuid}`, 'PUT', data),
};
