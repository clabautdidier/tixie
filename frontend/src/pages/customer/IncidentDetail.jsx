import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/api';
import TreeSelectModal from '../../components/TreeSelectModal';
import RichTextEditor from '../../components/RichTextEditor';

function getStatusBadge(status) {
  const map = {
    OPEN: <span className="badge bg-danger">Open</span>,
    IN_PROGRESS: <span className="badge bg-warning">In behandeling</span>,
    RESOLVED: <span className="badge bg-info">Opgelost</span>,
    CLOSED: <span className="badge bg-secondary">Gesloten</span>
  };
  return map[status] || status;
}

function getPriorityBadge(priority) {
  const map = {
    LOW: <span className="badge bg-secondary">Laag</span>,
    MEDIUM: <span className="badge bg-primary">Normaal</span>,
    HIGH: <span className="badge bg-warning">Hoog</span>,
    CRITICAL: <span className="badge bg-danger">Kritiek</span>
  };
  return map[priority] || priority;
}

export default function IncidentDetail() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    priority: '',
    description: '',
    locationUuid: '',
    locationName: '',
    configurationItemUuid: '',
    configurationItemName: ''
  });
  const [locationModal, setLocationModal] = useState(false);
  const [ciModal, setCiModal] = useState(false);
  const [ciLocationFilter, setCiLocationFilter] = useState(null);
  const [locationError, setLocationError] = useState(false);

  const loadIncident = async () => {
    try {
      const data = await api.getIncident(uuid);
      setIncident(data);
      setEditData({
        title: data.title,
        priority: data.priority,
        description: data.description || '',
        locationUuid: data.locationUuid || '',
        locationName: data.locationPath || data.locationName || '',
        configurationItemUuid: data.configurationItemUuid || '',
        configurationItemName: data.configurationItemPath || data.configurationItemName || ''
      });
      setCiLocationFilter(data.locationUuid || null);
    } catch (err) {
      setError('Fout bij het laden van incident: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uuid) loadIncident();
  }, [uuid]);

  const handleLocationSelect = (node, path) => {
    setEditData((prev) => ({
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
    setEditData((prev) => ({ ...prev, configurationItemUuid: node.uuid, configurationItemName: path }));
    setLocationError(false);
  };

  const loadLocations = () => api.getLocationsTree();
  const loadCIs = () => api.getConfigurationItemsTree(ciLocationFilter || undefined);

  const enableEditMode = () => setEditMode(true);
  const cancelEdit = () => {
    setEditMode(false);
    setEditData({
      title: incident.title,
      priority: incident.priority,
      description: incident.description || '',
      locationUuid: incident.locationUuid || '',
      locationName: incident.locationPath || incident.locationName || '',
      configurationItemUuid: incident.configurationItemUuid || '',
      configurationItemName: incident.configurationItemPath || incident.configurationItemName || ''
    });
    setLocationError(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editData.locationUuid && !editData.configurationItemUuid) {
      setLocationError(true);
      return;
    }
    setError('');
    try {
      await api.updateIncident(uuid, {
        title: editData.title,
        priority: editData.priority,
        description: editData.description,
        locationUuid: editData.locationUuid || undefined,
        configurationItemUuid: editData.configurationItemUuid || undefined
      });
      await loadIncident();
      setEditMode(false);
    } catch (err) {
      setError('Fout bij het bijwerken van incident: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Laden...</span>
        </div>
      </div>
    );
  }

  if (error && !incident) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!incident) {
    navigate('/incidents');
    return null;
  }

  const canEdit = incident.status === 'OPEN';

  return (
    <>
      <div className="mb-3">
        <Link to="/incidents" className="btn btn-secondary btn-sm">
          ← Terug naar overzicht
        </Link>
      </div>

      <div className="card">
        <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
          {!editMode ? (
            <h4 className="mb-0">{incident.title}</h4>
          ) : (
            <input
              type="text"
              className="form-control form-control-lg"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              style={{ maxWidth: 400 }}
            />
          )}
          {canEdit && !editMode && (
            <button className="btn btn-light btn-sm" onClick={enableEditMode}>
              Bewerken
            </button>
          )}
        </div>
        <div className="card-body">
          <form onSubmit={handleSave}>
            <div className="row mb-3">
              <div className="col-md-6">
                <p>
                  <strong>Status:</strong> {getStatusBadge(incident.status)}
                </p>
              </div>
              <div className="col-md-6">
                {!editMode ? (
                  <p>
                    <strong>Prioriteit:</strong> {getPriorityBadge(incident.priority)}
                  </p>
                ) : (
                  <div>
                    <label className="form-label"><strong>Prioriteit:</strong></label>
                    <select
                      className="form-select"
                      value={editData.priority}
                      onChange={(e) => setEditData({ ...editData, priority: e.target.value })}
                    >
                      <option value="LOW">Laag</option>
                      <option value="MEDIUM">Normaal</option>
                      <option value="HIGH">Hoog</option>
                      <option value="CRITICAL">Kritiek</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                <p>
                  <strong>Aangemaakt op:</strong> {new Date(incident.createdAt).toLocaleString('nl-NL')}
                </p>
              </div>
              <div className="col-md-6">
                <p>
                  <strong>Laatst bijgewerkt:</strong> {new Date(incident.updatedAt).toLocaleString('nl-NL')}
                </p>
              </div>
            </div>
            <div className="row mb-3">
              <div className="col-md-6">
                {!editMode ? (
                  <p>
                    <strong>Locatie:</strong> {incident.locationPath || incident.locationName || '-'}
                  </p>
                ) : (
                  <div>
                    <label className="form-label"><strong>Locatie:</strong></label>
                    <div className="input-group">
                      <input type="text" className="form-control" value={editData.locationName} readOnly />
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setLocationModal(true)}>
                        Kies
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <div className="col-md-6">
                {!editMode ? (
                  <p>
                    <strong>Configuratie Item:</strong> {incident.configurationItemPath || incident.configurationItemName || '-'}
                  </p>
                ) : (
                  <div>
                    <label className="form-label"><strong>Configuratie Item:</strong></label>
                    <div className="input-group">
                      <input type="text" className="form-control" value={editData.configurationItemName} readOnly />
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setCiModal(true)}>
                        Kies
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {editMode && locationError && (
                <div className="col-12">
                  <div className="form-text text-danger">
                    Vul minstens één van beide velden in (Locatie of Configuratie Item).
                  </div>
                </div>
              )}
            </div>
            {incident.assignedToFullName && (
              <div className="row mb-3">
                <div className="col-md-12">
                  <p>
                    <strong>Toegewezen aan:</strong> {incident.assignedToFullName}
                  </p>
                </div>
              </div>
            )}
            <hr />
            <div className="mb-3">
              <h5>Beschrijving</h5>
              {!editMode ? (
                <div
                  className="p-3 bg-light rounded ql-snow"
                  dangerouslySetInnerHTML={{
                    __html: incident.description || '<em class="text-muted">Geen beschrijving</em>'
                  }}
                />
              ) : (
                <RichTextEditor
                  value={editData.description}
                  onChange={(v) => setEditData({ ...editData, description: v })}
                />
              )}
            </div>
            {editMode && (
              <div className="mt-3">
                <button type="button" className="btn btn-secondary me-2" onClick={cancelEdit}>
                  Annuleren
                </button>
                <button type="submit" className="btn btn-success">
                  Opslaan
                </button>
              </div>
            )}
          </form>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
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
    </>
  );
}
