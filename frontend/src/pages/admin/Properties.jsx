import { useState, useEffect } from 'react';
import { api } from '../../api/api';

function formatTarget(target) {
  if (target === 'LOCATION') return { label: 'Locaties', badge: 'bg-secondary' };
  if (target === 'CONFIGURATION_ITEM') return { label: 'Assets (CI)', badge: 'bg-dark' };
  return { label: 'Beide', badge: 'bg-primary' };
}

function PropertyModal({ show, onHide, property, onSaved }) {
  const [formData, setFormData] = useState({
    name: '',
    dataType: 'TEXT',
    target: 'ALL'
  });

  useEffect(() => {
    if (show) {
      if (property) {
        setFormData({
          name: property.name,
          dataType: property.dataType,
          target: property.target || 'ALL'
        });
      } else {
        setFormData({ name: '', dataType: 'TEXT', target: 'ALL' });
      }
    }
  }, [show, property]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (property) {
        await api.updateProperty(property.uuid, formData);
      } else {
        await api.createProperty(formData);
      }
      onSaved();
      onHide();
    } catch (err) {
      alert('Fout bij het opslaan: ' + err.message);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Eigenschap Definiëren</h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Naam *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="bijv. IP Adres"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Datatype *</label>
                <select
                  className="form-select"
                  value={formData.dataType}
                  onChange={(e) => setFormData({ ...formData, dataType: e.target.value })}
                  required
                >
                  <option value="TEXT">Tekst</option>
                  <option value="INTEGER">Geheel getal</option>
                  <option value="DECIMAL">Kommagetal</option>
                  <option value="DATE">Datum</option>
                  <option value="BOOLEAN">Boolean (Ja/Nee)</option>
                  <option value="EMAIL">Emailadres</option>
                  <option value="PHONE">Telefoonnummer</option>
                  <option value="USER_REF">Verwijzing naar Gebruiker</option>
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Toepasbaar op: *</label>
                <select
                  className="form-select"
                  value={formData.target}
                  onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                  required
                >
                  <option value="ALL">Locaties & Items</option>
                  <option value="LOCATION">Enkel Locaties</option>
                  <option value="CONFIGURATION_ITEM">Enkel Configuration Items</option>
                </select>
                <div className="form-text">Bepaalt in welke schermen deze eigenschap gekoppeld kan worden.</div>
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

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [modal, setModal] = useState({ show: false, property: null });

  const load = async () => {
    const data = await api.getProperties();
    setProperties(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Property Library</h1>
          <p className="text-muted">Definieer herbruikbare velden voor locaties en assets.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({ show: true, property: null })}>
          + Nieuwe Eigenschap
        </button>
      </div>

      <div className="card shadow">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Naam</th>
                <th>Type</th>
                <th>Toepasbaar op</th>
                <th className="text-end">Acties</th>
              </tr>
            </thead>
            <tbody>
              {properties.map((p) => {
                const t = formatTarget(p.target);
                return (
                  <tr key={p.uuid}>
                    <td><strong>{p.name}</strong></td>
                    <td><span className="badge bg-info text-dark">{p.dataType}</span></td>
                    <td><span className={`badge ${t.badge}`}>{t.label}</span></td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setModal({ show: true, property: p })}
                      >
                        <i className="bi bi-pencil"></i> Bewerken
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <PropertyModal
        show={modal.show}
        onHide={() => setModal({ show: false, property: null })}
        property={modal.property}
        onSaved={load}
      />
    </>
  );
}
