import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/api';

export default function Profile() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    managerName: 'Geen manager toegewezen'
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    api
      .getMe()
      .then((user) => {
        setFormData({
          username: user.username,
          fullName: user.fullName || '',
          email: user.email || '',
          managerName: user.manager ? user.manager.fullName || user.manager.username : 'Geen manager toegewezen'
        });
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.updateMe({ fullName: formData.fullName, email: formData.email });
      setSuccess('Profiel succesvol bijgewerkt.');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card shadow">
          <div className="card-header bg-success text-white">
            <h5 className="mb-0">Mijn Profiel</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Gebruikersnaam</label>
                <input type="text" className="form-control" value={formData.username} disabled />
              </div>
              <div className="mb-3">
                <label className="form-label">Volledige Naam</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Manager</label>
                <input type="text" className="form-control" value={formData.managerName} disabled />
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              {success && <div className="alert alert-success">{success}</div>}
              <div className="d-flex justify-content-end">
                <button type="submit" className="btn btn-success">
                  Opslaan
                </button>
                <button type="button" className="btn btn-secondary ms-2" onClick={() => navigate(-1)}>
                  Sluiten
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
