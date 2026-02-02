import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/api';
import TreeSelectModal from '../../components/TreeSelectModal';
import RichTextEditor from '../../components/RichTextEditor';

function getStatusBadge(status) {
  const map = {
    OPEN: <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Open</span>,
    IN_PROGRESS: <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">In behandeling</span>,
    RESOLVED: <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Opgelost</span>,
    CLOSED: <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Gesloten</span>
  };
  return map[status] || status;
}

function getPriorityBadge(priority) {
  const map = {
    LOW: <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">Laag</span>,
    MEDIUM: <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">Normaal</span>,
    HIGH: <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">Hoog</span>,
    CRITICAL: <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Kritiek</span>
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
  const [editData, setEditData] = useState({ title: '', priority: '', description: '', locationUuid: '', locationName: '', configurationItemUuid: '', configurationItemName: '' });
  const [locationModal, setLocationModal] = useState(false);
  const [ciModal, setCiModal] = useState(false);
  const [ciLocationFilter, setCiLocationFilter] = useState(null);
  const [locationError, setLocationError] = useState(false);

  const loadIncident = async () => {
    try {
      const data = await api.getIncident(uuid);
      setIncident(data);
      setEditData({
        title: data.title, priority: data.priority, description: data.description || '',
        locationUuid: data.locationUuid || '', locationName: data.locationPath || data.locationName || '',
        configurationItemUuid: data.configurationItemUuid || '', configurationItemName: data.configurationItemPath || data.configurationItemName || ''
      });
      setCiLocationFilter(data.locationUuid || null);
    } catch (err) { setError('Fout bij het laden van incident: ' + err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { if (uuid) loadIncident(); }, [uuid]);

  const handleLocationSelect = (node, path) => {
    setEditData(prev => ({ ...prev, locationUuid: node.uuid, locationName: path, configurationItemUuid: '', configurationItemName: '' }));
    setCiLocationFilter(node.uuid);
    setLocationError(false);
  };
  const handleCISelect = (node, path) => {
    setEditData(prev => ({ ...prev, configurationItemUuid: node.uuid, configurationItemName: path }));
    setLocationError(false);
  };
  const loadLocations = () => api.getLocationsTree();
  const loadCIs = () => api.getConfigurationItemsTree(ciLocationFilter || undefined);

  const cancelEdit = () => {
    setEditMode(false);
    setEditData({
      title: incident.title, priority: incident.priority, description: incident.description || '',
      locationUuid: incident.locationUuid || '', locationName: incident.locationPath || incident.locationName || '',
      configurationItemUuid: incident.configurationItemUuid || '', configurationItemName: incident.configurationItemPath || incident.configurationItemName || ''
    });
    setLocationError(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editData.locationUuid && !editData.configurationItemUuid) { setLocationError(true); return; }
    setError('');
    try {
      await api.updateIncident(uuid, { title: editData.title, priority: editData.priority, description: editData.description, locationUuid: editData.locationUuid || undefined, configurationItemUuid: editData.configurationItemUuid || undefined });
      await loadIncident();
      setEditMode(false);
    } catch (err) { setError('Fout bij het bijwerken van incident: ' + err.message); }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500";

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>;
  if (error && !incident) return <div className="p-4 bg-red-50 text-red-700 rounded-md">{error}</div>;
  if (!incident) { navigate('/incidents'); return null; }

  const canEdit = incident.status === 'OPEN';

  return (
    <>
      <div className="mb-4">
        <Link to="/incidents" className="text-sm text-gray-600 hover:text-gray-900">← Terug naar overzicht</Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-green-600 text-white px-4 py-3 flex justify-between items-center">
          {!editMode ? <h2 className="text-xl font-semibold">{incident.title}</h2> : <input type="text" className="flex-1 max-w-md px-3 py-2 rounded text-gray-900" value={editData.title} onChange={e => setEditData({ ...editData, title: e.target.value })} />}
          {canEdit && !editMode && <button className="px-3 py-1 bg-white text-green-600 rounded text-sm hover:bg-gray-100" onClick={() => setEditMode(true)}>Bewerken</button>}
        </div>
        <div className="p-6">
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div><p className="text-sm text-gray-500">Status</p><div className="mt-1">{getStatusBadge(incident.status)}</div></div>
              <div>
                {!editMode ? <><p className="text-sm text-gray-500">Prioriteit</p><div className="mt-1">{getPriorityBadge(incident.priority)}</div></> : <><label className="block text-sm font-medium text-gray-700 mb-1">Prioriteit</label><select className={inputClass} value={editData.priority} onChange={e => setEditData({ ...editData, priority: e.target.value })}><option value="LOW">Laag</option><option value="MEDIUM">Normaal</option><option value="HIGH">Hoog</option><option value="CRITICAL">Kritiek</option></select></>}
              </div>
              <div><p className="text-sm text-gray-500">Aangemaakt op</p><p className="text-gray-900">{new Date(incident.createdAt).toLocaleString('nl-NL')}</p></div>
              <div><p className="text-sm text-gray-500">Laatst bijgewerkt</p><p className="text-gray-900">{new Date(incident.updatedAt).toLocaleString('nl-NL')}</p></div>
              <div>
                {!editMode ? <><p className="text-sm text-gray-500">Locatie</p><p className="text-gray-900">{incident.locationPath || incident.locationName || '-'}</p></> : <><label className="block text-sm font-medium text-gray-700 mb-1">Locatie</label><div className="flex"><input type="text" className="flex-1 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50" value={editData.locationName} readOnly /><button type="button" className="px-4 py-2 border border-gray-300 rounded-r-md hover:bg-gray-50" onClick={() => setLocationModal(true)}>Kies</button></div></>}
              </div>
              <div>
                {!editMode ? <><p className="text-sm text-gray-500">Configuratie Item</p><p className="text-gray-900">{incident.configurationItemPath || incident.configurationItemName || '-'}</p></> : <><label className="block text-sm font-medium text-gray-700 mb-1">Configuratie Item</label><div className="flex"><input type="text" className="flex-1 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50" value={editData.configurationItemName} readOnly /><button type="button" className="px-4 py-2 border border-gray-300 rounded-r-md hover:bg-gray-50" onClick={() => setCiModal(true)}>Kies</button></div></>}
              </div>
              {editMode && locationError && <div className="col-span-2 text-sm text-red-600">Vul minstens één van beide velden in.</div>}
            </div>
            {incident.assignedToFullName && <div className="mb-4"><p className="text-sm text-gray-500">Toegewezen aan</p><p className="text-gray-900">{incident.assignedToFullName}</p></div>}
            <hr className="my-4" />
            <div>
              <h4 className="font-medium mb-2">Beschrijving</h4>
              {!editMode ? <div className="p-4 bg-gray-50 rounded-md [&_ul]:list-disc [&_ol]:list-decimal [&_p]:mb-2" dangerouslySetInnerHTML={{ __html: incident.description || '<em class="text-gray-500">Geen beschrijving</em>' }} /> : <RichTextEditor value={editData.description} onChange={v => setEditData({ ...editData, description: v })} />}
            </div>
            {editMode && <div className="flex gap-2 mt-4"><button type="button" className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300" onClick={cancelEdit}>Annuleren</button><button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Opslaan</button></div>}
          </form>
          {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
        </div>
      </div>

      <TreeSelectModal show={locationModal} onHide={() => setLocationModal(false)} title="Selecteer Locatie" loadData={loadLocations} onSelect={handleLocationSelect} />
      <TreeSelectModal show={ciModal} onHide={() => setCiModal(false)} title="Selecteer Configuratie Item" loadData={loadCIs} onSelect={handleCISelect} />
    </>
  );
}
