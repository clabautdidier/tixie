import { useState, useEffect } from 'react';
import { api } from '../../api/api';

function TypeModal({ show, onHide, type, onSaved }) {
  const [formData, setFormData] = useState({ name: '', description: '', properties: [] });
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
    const select = document.getElementById('propertyLibrarySelect');
    const uuid = select?.value;
    if (!uuid || selectedProps.some(p => p.propertyUuid === uuid)) return;
    const prop = library.find(p => p.uuid === uuid);
    if (prop) setSelectedProps(prev => [...prev, { propertyUuid: prop.uuid, name: prop.name, dataType: prop.dataType, required: false }]);
  };

  const removeProp = (i) => setSelectedProps(prev => prev.filter((_, idx) => idx !== i));
  const setRequired = (i, v) => setSelectedProps(prev => prev.map((p, idx) => idx === i ? { ...p, required: v } : p));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: formData.name, description: formData.description, properties: selectedProps.map(p => ({ propertyUuid: p.propertyUuid, required: p.required })) };
    try {
      if (type) await api.updateLocationType(type.uuid, payload);
      else await api.createLocationType(payload);
      onSaved();
      onHide();
    } catch (err) { alert(err.message); }
  };

  if (!show) return null;

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onHide}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Locatietype Configureren</h3>
            <button type="button" className="text-gray-400 hover:text-gray-600 text-2xl" onClick={onHide}>×</button>
          </div>
          <div className="p-4 space-y-4 overflow-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
              <input type="text" className={inputClass} placeholder="bijv. ROOM" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Omschrijving</label>
              <textarea className={inputClass} rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <hr />
            <h4 className="font-medium">Eigenschappen uit Library</h4>
            <div className="space-y-2">
              {selectedProps.map((p, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 border rounded bg-gray-50">
                  <div><span className="font-medium">{p.name}</span> <span className="text-gray-500 text-sm">({p.dataType})</span></div>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 text-sm">
                      <input type="checkbox" checked={p.required} onChange={e => setRequired(idx, e.target.checked)} className="rounded" />
                      Verplicht
                    </label>
                    <button type="button" className="text-red-600 hover:text-red-700 text-sm" onClick={() => removeProp(idx)}>Verwijder</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <select id="propertyLibrarySelect" className="flex-1 px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Kies een eigenschap om toe te voegen...</option>
                {library.filter(p => !selectedProps.some(sp => sp.propertyUuid === p.uuid)).map(p => (
                  <option key={p.uuid} value={p.uuid}>{p.name} ({p.dataType})</option>
                ))}
              </select>
              <button type="button" className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50" onClick={addProperty}>Toevoegen</button>
            </div>
          </div>
          <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-lg">
            <button type="button" className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300" onClick={onHide}>Annuleren</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Type Opslaan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LocationTypes() {
  const [types, setTypes] = useState([]);
  const [modal, setModal] = useState({ show: false, type: null });

  const load = async () => { const data = await api.getLocationTypes(); setTypes(data); };
  useEffect(() => { load(); }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Location Types</h1>
        <button className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700" onClick={() => setModal({ show: true, type: null })}>+ Nieuw Type</button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naam</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Omschrijving</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gekoppelde Eigenschappen</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acties</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {types.map(t => (
              <tr key={t.uuid} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-gray-900">{t.name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">{t.description || '-'}</td>
                <td className="px-4 py-3">
                  {t.properties?.map(p => (
                    <span key={p.propertyUuid} className="inline-flex px-2 py-0.5 rounded text-xs font-medium border border-gray-300 bg-white text-gray-700 mr-1">
                      {p.name} {p.required && <span className="text-red-500">*</span>}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50" onClick={() => setModal({ show: true, type: t })}>Bewerken</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TypeModal show={modal.show} onHide={() => setModal({ show: false, type: null })} type={modal.type} onSaved={load} />
    </>
  );
}
