import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/api';

const ROLES = [
  'ROLE_USER',
  'ROLE_ADMIN',
  'ROLE_CONFIGADMIN',
  'ROLE_CONFIGLOCATIONADMIN',
  'ROLE_SERVICEDESK_AGENT',
  'ROLE_SUPPORT_AGENT'
];

function UserModal({ show, onHide, user, onSaved }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    confirmPassword: '',
    roles: [],
    managerUuid: ''
  });
  const [managers, setManagers] = useState([]);
  const [error, setError] = useState('');

  const isEdit = !!user;

  useEffect(() => {
    if (show) {
      api.getUsers().then(setManagers);
      if (user) {
        setFormData({
          username: user.username,
          email: user.email,
          fullName: user.fullName || '',
          password: '',
          confirmPassword: '',
          roles: user.roles || [],
          managerUuid: user.managerUuid || ''
        });
      } else {
        setFormData({
          username: '',
          email: '',
          fullName: '',
          password: '',
          confirmPassword: '',
          roles: [],
          managerUuid: ''
        });
      }
      setError('');
    }
  }, [show, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.roles.length === 0) {
      setError('Selecteer minstens één rol.');
      return;
    }
    if (!isEdit && (!formData.password || formData.password !== formData.confirmPassword)) {
      setError(isEdit ? '' : 'Wachtwoorden komen niet overeen of ontbreken.');
      if (!isEdit) return;
    }

    const payload = {
      username: formData.username,
      email: formData.email,
      fullName: formData.fullName || null,
      roles: formData.roles,
      managerUuid: formData.managerUuid || null
    };
    if (!isEdit) payload.password = formData.password;

    try {
      if (isEdit) {
        await api.updateUser(user.uuid, payload);
      } else {
        await api.createUser(payload);
      }
      onSaved();
      onHide();
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleRole = (role) => {
    setFormData((prev) => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles.filter((r) => r !== role) : [...prev.roles, role]
    }));
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{isEdit ? 'Bewerken' : 'Nieuwe Gebruiker'}</h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}

              <div className="mb-3">
                <label className="form-label">Gebruikersnaam *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                  disabled={isEdit}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email *</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Volledige Naam</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                />
              </div>
              {!isEdit && (
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Wachtwoord *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required={!isEdit}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Bevestig Wachtwoord *</label>
                    <input
                      type="password"
                      className="form-control"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required={!isEdit}
                    />
                  </div>
                </div>
              )}
              <div className="mb-3">
                <label className="form-label">Manager</label>
                <select
                  className="form-select"
                  value={formData.managerUuid}
                  onChange={(e) => setFormData({ ...formData, managerUuid: e.target.value })}
                >
                  <option value="">Geen Manager</option>
                  {managers.filter((m) => m.uuid !== user?.uuid).map((m) => (
                    <option key={m.uuid} value={m.uuid}>
                      {m.username}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Rollen *</label>
                <select
                  className="form-select"
                  multiple
                  size={6}
                  value={formData.roles}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      roles: Array.from(e.target.selectedOptions, (o) => o.value)
                    })
                  }
                >
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r.replace('ROLE_', '')}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide}>
                Annuleren
              </button>
              <button type="submit" className="btn btn-primary">
                Opslaan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function PasswordModal({ show, onHide, user, onSaved }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (show) {
      setPassword('');
      setConfirmPassword('');
      setError('');
    }
  }, [show, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Wachtwoorden matchen niet.');
      return;
    }
    try {
      await api.updateUserPassword(user.uuid, password);
      onSaved();
      onHide();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!show || !user) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Wachtwoord Wijzigen</h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <p>
                Wachtwoord wijzigen voor: <strong>{user.username}</strong>
              </p>
              <div className="mb-3">
                <label className="form-label">Nieuw Wachtwoord *</label>
                <input
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Bevestig Wachtwoord *</label>
                <input
                  type="password"
                  className="form-control"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-warning">
                Wijzigen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function Users() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState({ field: 'username', direction: 'asc' });
  const [userModal, setUserModal] = useState({ show: false, user: null });
  const [passwordModal, setPasswordModal] = useState({ show: false, user: null });

  const loadUsers = useCallback(async () => {
    const data = await api.getUsers();
    setUsers(data);
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sort.field] || '';
    const bVal = b[sort.field] || '';
    const cmp = String(aVal).localeCompare(String(bVal));
    return sort.direction === 'asc' ? cmp : -cmp;
  });

  const toggleSort = (field) => {
    setSort((prev) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Gebruikersbeheer</h1>
        <div className="d-flex gap-2">
          <input
            type="text"
            className="form-control"
            placeholder="Zoek op naam..."
            style={{ width: 300 }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className="btn btn-success" onClick={() => setUserModal({ show: true, user: null })}>
            Nieuwe Gebruiker
          </button>
        </div>
      </div>

      <div className="card shadow">
        <div className="card-body">
          <table className="table table-hover">
            <thead className="table-light">
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('username')}>
                  Gebruikersnaam
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => toggleSort('fullName')}>
                  Naam
                </th>
                <th>Rollen</th>
                <th>Status</th>
                <th>Manager</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((u) => (
                <tr key={u.uuid}>
                  <td>{u.username}</td>
                  <td>{u.fullName || '-'}</td>
                  <td>
                    {u.roles?.map((r) => (
                      <span key={r} className="badge bg-info text-dark me-1">
                        {r.replace('ROLE_', '')}
                      </span>
                    ))}
                  </td>
                  <td>
                    <span className={`badge ${u.active ? 'bg-success' : 'bg-danger'}`}>
                      {u.active ? 'Actief' : 'Inactief'}
                    </span>
                  </td>
                  <td>{u.managerName || '-'}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-primary me-1"
                      onClick={() => setUserModal({ show: true, user: u })}
                    >
                      Bewerken
                    </button>
                    <button
                      className="btn btn-sm btn-warning"
                      onClick={() => setPasswordModal({ show: true, user: u })}
                    >
                      Paswoord
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <UserModal
        show={userModal.show}
        onHide={() => setUserModal({ show: false, user: null })}
        user={userModal.user}
        onSaved={loadUsers}
      />
      <PasswordModal
        show={passwordModal.show}
        onHide={() => setPasswordModal({ show: false, user: null })}
        user={passwordModal.user}
        onSaved={loadUsers}
      />
    </>
  );
}
