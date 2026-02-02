import { useState, useEffect } from 'react';
import { api } from '../../api/api';

function TypeModal({ show, onHide, type, onSaved }) {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [library, setLibrary] = useState([]);
  const [selectedProps, setSelectedProps] = useState([]);

  useEffect(() => {
    if (show) {
      api.getProperties().then(setLibrary);
      if (type) {
        setFormData({ name: type.name, description: type.description || '' });
        setSelectedProps([...(type.properties || [])]);
      } else {
        setFormData({ name: '', description: '' });
        setSelectedProps([]);
      }
    }
  }, [show, type]);

  const addProperty = () => {
    const select = document.getElementById('propertyDefinitionSelect');
    const uuid = select?.value;
    if (!uuid || selectedProps.some((p) => p.propertyUuid === uuid)) return;
    const prop = library.find((p) => p.uuid === uuid);
    if (prop)
      setSelectedProps((prev) => [...prev, { propertyUuid: prop.uuid, name: prop.name, dataType: prop.dataType, required: false }]);
  };

  const removeProp = (index) => setSelectedProps((prev) => prev.filter((_, i) => i !== index));

  const setRequired = (index, required) =>
    setSelectedProps((prev) => prev.map((p, i) => (i === index ? { ...p, required } : p)));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      description: formData.description,
      properties: selectedProps.map((p) => ({ propertyUuid: p.propertyUuid, required: p.required }))
    };
    try {
      if (type) {
        await api.updateConfigurationItemType(type.uuid, payload);
      } else {
        await api.createConfigurationItemType(payload);
      }
      onSaved();
      onHide();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">CI Type Configureren</h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Naam *</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="bijv. LAPTOP"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Omschrijving</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <hr />
              <h6>Eigenschappen uit Bibliotheek</h6>
              <p className="text-muted small">Selecteer welke velden bij dit type horen.</p>
              <div className="mb-3">
                {selectedProps.map((p, idx) => (
                  <div key={idx} className="d-flex align-items-center justify-content-between border p-2 mb-2 rounded bg-light">
                    <div>
                      <strong>{p.name}</strong> <small className="text-muted">({p.dataType})</small>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={p.required}
                          onChange={(e) => setRequired(idx, e.target.checked)}
                        />
                        <label className="form-check-label">Verplicht</label>
                      </div>
                      <button type="button" className="btn btn-sm btn-link text-danger" onClick={() => removeProp(idx)}>
                        Verwijder
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="input-group">
                <select id="propertyDefinitionSelect" className="form-select">
                  <option value="">Kies een eigenschap om toe te voegen...</option>
                  {library.filter((p) => !selectedProps.some((sp) => sp.propertyUuid === p.uuid)).map((p) => (
                    <option key={p.uuid} value={p.uuid}>
                      {p.name} ({p.dataType})
                    </option>
                  ))}
                </select>
                <button type="button" className="btn btn-outline-primary" onClick={addProperty}>
                  Toevoegen
                </button>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide}>
                Annuleren
              </button>
              <button type="submit" className="btn btn-primary">
                Type Opslaan
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ConfigurationItemTypes() {
  const [types, setTypes] = useState([]);
  const [modal, setModal] = useState({ show: false, type: null });

  const load = async () => {
    const data = await api.getConfigurationItemTypes();
    setTypes(data);
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1>Configuration Item Types</h1>
          <p className="text-muted">Definieer blauwdrukken voor assets (bijv. Laptop, Server).</p>
        </div>
        <button className="btn btn-success" onClick={() => setModal({ show: true, type: null })}>
          + Nieuw Type
        </button>
      </div>

      <div className="card shadow">
        <div className="card-body p-0">
          <table className="table table-hover mb-0">
            <thead className="table-light">
              <tr>
                <th>Naam</th>
                <th>Omschrijving</th>
                <th>Gekoppelde Eigenschappen</th>
                <th className="text-end">Acties</th>
              </tr>
            </thead>
            <tbody>
              {types.map((t) => (
                <tr key={t.uuid}>
                  <td><strong>{t.name}</strong></td>
                  <td><small>{t.description || '-'}</small></td>
                  <td>
                    {t.properties?.map((p) => (
                      <span key={p.propertyUuid} className="badge border text-dark bg-light me-1">
                        {p.name} {p.required && <b className="text-danger">*</b>}
                      </span>
                    ))}
                  </td>
                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setModal({ show: true, type: t })}
                    >
                      Bewerken
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TypeModal show={modal.show} onHide={() => setModal({ show: false, type: null })} type={modal.type} onSaved={load} />
    </>
  );
}
