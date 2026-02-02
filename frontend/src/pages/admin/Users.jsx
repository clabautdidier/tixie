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

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onHide}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">{isEdit ? 'Bewerken' : 'Nieuwe Gebruiker'}</h3>
            <button type="button" className="text-gray-400 hover:text-gray-600 text-2xl" onClick={onHide}>×</button>
          </div>
          <div className="p-4 space-y-4 overflow-auto max-h-[60vh]">
            {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
            <div>
              <label className={labelClass}>Gebruikersnaam *</label>
              <input type="text" className={inputClass} value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required disabled={isEdit} />
            </div>
            <div>
              <label className={labelClass}>Email *</label>
              <input type="email" className={inputClass} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div>
              <label className={labelClass}>Volledige Naam</label>
              <input type="text" className={inputClass} value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
            </div>
            {!isEdit && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Wachtwoord *</label>
                  <input type="password" className={inputClass} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required />
                </div>
                <div>
                  <label className={labelClass}>Bevestig Wachtwoord *</label>
                  <input type="password" className={inputClass} value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} required />
                </div>
              </div>
            )}
            <div>
              <label className={labelClass}>Manager</label>
              <select className={inputClass} value={formData.managerUuid} onChange={e => setFormData({ ...formData, managerUuid: e.target.value })}>
                <option value="">Geen Manager</option>
                {managers.filter(m => m.uuid !== user?.uuid).map(m => (
                  <option key={m.uuid} value={m.uuid}>{m.username}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Rollen *</label>
              <select className={inputClass} multiple size={6} value={formData.roles} onChange={e => setFormData({ ...formData, roles: Array.from(e.target.selectedOptions, o => o.value) })}>
                {ROLES.map(r => <option key={r} value={r}>{r.replace('ROLE_', '')}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg">
            <button type="button" className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300" onClick={onHide}>Annuleren</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Opslaan</button>
          </div>
        </form>
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

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-amber-500 focus:border-amber-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onHide}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Wachtwoord Wijzigen</h3>
            <button type="button" className="text-gray-400 hover:text-gray-600 text-2xl" onClick={onHide}>×</button>
          </div>
          <div className="p-4 space-y-4">
            {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
            <p>Wachtwoord wijzigen voor: <strong>{user.username}</strong></p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nieuw Wachtwoord *</label>
              <input type="password" className={inputClass} value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bevestig Wachtwoord *</label>
              <input type="password" className={inputClass} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
            </div>
          </div>
          <div className="flex justify-end p-4 border-t bg-gray-50 rounded-b-lg">
            <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-md hover:bg-amber-600">Wijzigen</button>
          </div>
        </form>
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gebruikersbeheer</h1>
        <div className="flex gap-2">
          <input
            type="text"
            className="w-64 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Zoek op naam..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700" onClick={() => setUserModal({ show: true, user: null })}>
            Nieuwe Gebruiker
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('username')}>Gebruikersnaam</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase cursor-pointer hover:bg-gray-100" onClick={() => toggleSort('fullName')}>Naam</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rollen</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manager</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acties</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sorted.map(u => (
                <tr key={u.uuid} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{u.username}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{u.fullName || '-'}</td>
                  <td className="px-4 py-3">
                    {u.roles?.map(r => (
                      <span key={r} className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-1">{r.replace('ROLE_', '')}</span>
                    ))}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${u.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.active ? 'Actief' : 'Inactief'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{u.managerName || '-'}</td>
                  <td className="px-4 py-3 flex gap-2">
                    <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700" onClick={() => setUserModal({ show: true, user: u })}>Bewerken</button>
                    <button className="px-3 py-1 text-sm bg-amber-500 text-white rounded hover:bg-amber-600" onClick={() => setPasswordModal({ show: true, user: u })}>Paswoord</button>
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
