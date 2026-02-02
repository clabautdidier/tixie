import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../api/api';
import TreeSelectModal from '../../components/TreeSelectModal';
import RichTextEditor from '../../components/RichTextEditor';

export default function NewIncident() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '', priority: 'MEDIUM', description: '',
    locationUuid: '', locationName: '', configurationItemUuid: '', configurationItemName: ''
  });
  const [locationModal, setLocationModal] = useState(false);
  const [ciModal, setCiModal] = useState(false);
  const [ciLocationFilter, setCiLocationFilter] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [locationError, setLocationError] = useState(false);

  const handleLocationSelect = (node, path) => {
    setFormData(prev => ({ ...prev, locationUuid: node.uuid, locationName: path, configurationItemUuid: '', configurationItemName: '' }));
    setCiLocationFilter(node.uuid);
    setLocationError(false);
  };
  const handleCISelect = (node, path) => {
    setFormData(prev => ({ ...prev, configurationItemUuid: node.uuid, configurationItemName: path }));
    setLocationError(false);
  };
  const loadLocations = () => api.getLocationsTree();
  const loadCIs = () => api.getConfigurationItemsTree(ciLocationFilter || undefined);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.locationUuid && !formData.configurationItemUuid) { setLocationError(true); return; }
    setLocationError(false);
    setError('');
    setSubmitting(true);
    try {
      const result = await api.createIncident({
        title: formData.title, priority: formData.priority, description: formData.description,
        locationUuid: formData.locationUuid || undefined, configurationItemUuid: formData.configurationItemUuid || undefined
      });
      navigate(`/incidents/${result.uuid}`);
    } catch (err) { setError('Fout bij het aanmaken van incident: ' + err.message); }
    finally { setSubmitting(false); }
  };

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500";

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-green-600 text-white px-4 py-3">
          <h2 className="text-xl font-semibold">Nieuw Incident Melden</h2>
        </div>
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Titel <span className="text-red-500">*</span></label>
              <input type="text" className={inputClass} placeholder="Korte beschrijving van het probleem" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Prioriteit <span className="text-red-500">*</span></label>
              <select className={inputClass} value={formData.priority} onChange={e => setFormData({ ...formData, priority: e.target.value })} required>
                <option value="LOW">Laag</option>
                <option value="MEDIUM">Normaal</option>
                <option value="HIGH">Hoog</option>
                <option value="CRITICAL">Kritiek</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locatie</label>
                <div className="flex">
                  <input type="text" className="flex-1 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50" value={formData.locationName} readOnly placeholder="Selecteer een locatie..." />
                  <button type="button" className="px-4 py-2 border border-gray-300 rounded-r-md hover:bg-gray-50" onClick={() => setLocationModal(true)}>Kies</button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Configuratie Item</label>
                <div className="flex">
                  <input type="text" className="flex-1 px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50" value={formData.configurationItemName} readOnly placeholder="Selecteer een item..." />
                  <button type="button" className="px-4 py-2 border border-gray-300 rounded-r-md hover:bg-gray-50" onClick={() => setCiModal(true)}>Kies</button>
                </div>
              </div>
              {locationError && <div className="col-span-2 text-sm text-red-600">Vul minstens één van beide velden in (Locatie of Configuratie Item).</div>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Beschrijving</label>
              <RichTextEditor value={formData.description} onChange={v => setFormData({ ...formData, description: v })} placeholder="Geef een gedetailleerde beschrijving van het probleem" />
              <p className="mt-1 text-sm text-gray-500">Geef zoveel mogelijk details over het probleem zodat we u beter kunnen helpen.</p>
            </div>
            {error && <div className="p-3 bg-red-50 text-red-700 rounded-md text-sm">{error}</div>}
            <div className="flex justify-between pt-4">
              <Link to="/incidents" className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300">Annuleren</Link>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50" disabled={submitting}>
                {submitting ? <><span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>Bezig met versturen...</> : 'Incident Melden'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <TreeSelectModal show={locationModal} onHide={() => setLocationModal(false)} title="Selecteer Locatie" loadData={loadLocations} onSelect={handleLocationSelect} />
      <TreeSelectModal show={ciModal} onHide={() => setCiModal(false)} title="Selecteer Configuratie Item" loadData={loadCIs} onSelect={handleCISelect} />
    </div>
  );
}
