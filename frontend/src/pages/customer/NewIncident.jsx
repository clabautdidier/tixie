import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/api';
import TreeSelectModal from '../../components/TreeSelectModal';
import RichTextEditor from '../../components/RichTextEditor';

export default function NewIncident() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    priority: 'MEDIUM',
    description: '',
    locationUuid: '',
    locationName: '',
    configurationItemUuid: '',
    configurationItemName: ''
  });
  const [locationModal, setLocationModal] = useState(false);
  const [ciModal, setCiModal] = useState(false);
  const [ciLocationFilter, setCiLocationFilter] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState(false);

  const handleLocationSelect = (node, path) => {
    setFormData((prev) => ({
      ...prev,
      locationUuid: node.uuid,
      locationName: path,
      configurationItemUuid: '',
      configurationItemName: ''
    }));
    setCiLocationFilter(node.uuid);
    setLocationError(false);
  };

  const handleCISelect = (node, path) => {
    setFormData((prev) => ({ ...prev, configurationItemUuid: node.uuid, configurationItemName: path }));
    setLocationError(false);
  };

  const loadLocations = () => api.getLocationsTree();
  const loadCIs = () =>
    api.getConfigurationItemsTree(ciLocationFilter || undefined);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.locationUuid && !formData.configurationItemUuid) {
      setLocationError(true);
      return;
    }
    setLocationError(false);
    setError('');
    setSubmitting(true);

    try {
      const result = await api.createIncident({
        title: formData.title,
        priority: formData.priority,
        description: formData.description,
        locationUuid: formData.locationUuid || undefined,
        configurationItemUuid: formData.configurationItemUuid || undefined
      });
      navigate(`/incidents/${result.uuid}`);
    } catch (err) {
      setError('Fout bij het aanmaken van incident: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <div className="card">
          <div className="card-header bg-success text-white">
            <h4 className="mb-0">Nieuw Incident Melden</h4>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">
                  Titel <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Korte beschrijving van het probleem"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">
                  Prioriteit <span className="text-danger">*</span>
                </label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  required
                >
                  <option value="LOW">Laag</option>
                  <option value="MEDIUM">Normaal</option>
                  <option value="HIGH">Hoog</option>
                  <option value="CRITICAL">Kritiek</option>
                </select>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Locatie</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={formData.locationName}
                      readOnly
                      placeholder="Selecteer een locatie..."
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setLocationModal(true)}>
                      Kies
                    </button>
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Configuratie Item</label>
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      value={formData.configurationItemName}
                      readOnly
                      placeholder="Selecteer een item..."
                    />
                    <button type="button" className="btn btn-outline-secondary" onClick={() => setCiModal(true)}>
                      Kies
                    </button>
                  </div>
                </div>
                {locationError && (
                  <div className="form-text text-danger">
                    Vul minstens één van beide velden in (Locatie of Configuratie Item).
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label className="form-label">Beschrijving</label>
                <RichTextEditor
                  value={formData.description}
                  onChange={(v) => setFormData({ ...formData, description: v })}
                  placeholder="Geef een gedetailleerde beschrijving van het probleem"
                />
                <div className="form-text">Geef zoveel mogelijk details over het probleem zodat we u beter kunnen helpen.</div>
              </div>
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="d-flex justify-content-between">
                <Link to="/incidents" className="btn btn-secondary">
                  Annuleren
                </Link>
                <button type="submit" className="btn btn-success" disabled={submitting}>
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Bezig met versturen...
                    </>
                  ) : (
                    'Incident Melden'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <TreeSelectModal
        show={locationModal}
        onHide={() => setLocationModal(false)}
        title="Selecteer Locatie"
        loadData={loadLocations}
        onSelect={handleLocationSelect}
      />
      <TreeSelectModal
        show={ciModal}
        onHide={() => setCiModal(false)}
        title="Selecteer Configuratie Item"
        loadData={loadCIs}
        onSelect={handleCISelect}
      />
    </div>
  );
}
