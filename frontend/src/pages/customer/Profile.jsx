import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';

export default function Profile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', fullName: '', email: '', managerName: 'Geen manager toegewezen' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api.getMe().then((user) => {
      setFormData({
        username: user.username,
        fullName: user.fullName || '',
        email: user.email || '',
        managerName: user.manager ? user.manager.fullName || user.manager.username : 'Geen manager toegewezen'
      });
    }).catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.updateMe({ fullName: formData.fullName, email: formData.email });
      setSuccess('Profiel succesvol bijgewerkt.');
    } catch (err) { setError(err.message); }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-green-600 text-white px-4 py-3">
          <h2 className="text-xl font-semibold">Mijn Profiel</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gebruikersnaam</label>
              <input type="text" className={inputClass} value={formData.username} disabled />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Volledige Naam</label>
              <input type="text" className={inputClass} value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" className={inputClass} value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
              <input type="text" className={inputClass} value={formData.managerName} disabled />
            </div>
            {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
            {success && <div className="p-3 bg-green-50 text-green-700 rounded-md text-sm">{success}</div>}
            <div className="flex justify-end gap-2 pt-4">
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Opslaan</button>
              <button type="button" className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300" onClick={() => navigate(-1)}>Sluiten</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
