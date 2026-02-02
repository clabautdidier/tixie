import { useState, useEffect } from 'react';
import { api } from '../../api/api';

function formatTarget(target) {
  if (target === 'LOCATION') return { label: 'Locaties', classes: 'bg-gray-500' };
  if (target === 'CONFIGURATION_ITEM') return { label: 'Assets (CI)', classes: 'bg-gray-800' };
  return { label: 'Beide', classes: 'bg-blue-600' };
}

function PropertyModal({ show, onHide, property, onSaved }) {
  const [formData, setFormData] = useState({ name: '', dataType: 'TEXT', target: 'ALL' });

  useEffect(() => {
    if (show) {
      if (property) {
        setFormData({ name: property.name, dataType: property.dataType, target: property.target || 'ALL' });
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

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onHide}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Eigenschap Definiëren</h3>
            <button type="button" className="text-gray-400 hover:text-gray-600 text-2xl" onClick={onHide}>×</button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
              <input type="text" className={inputClass} placeholder="bijv. IP Adres" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Datatype *</label>
              <select className={inputClass} value={formData.dataType} onChange={e => setFormData({ ...formData, dataType: e.target.value })} required>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Toepasbaar op: *</label>
              <select className={inputClass} value={formData.target} onChange={e => setFormData({ ...formData, target: e.target.value })} required>
                <option value="ALL">Locaties & Items</option>
                <option value="LOCATION">Enkel Locaties</option>
                <option value="CONFIGURATION_ITEM">Enkel Configuration Items</option>
              </select>
              <p className="mt-1 text-sm text-gray-500">Bepaalt in welke schermen deze eigenschap gekoppeld kan worden.</p>
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

export default function Properties() {
  const [properties, setProperties] = useState([]);
  const [modal, setModal] = useState({ show: false, property: null });

  const load = async () => {
    const data = await api.getProperties();
    setProperties(data);
  };

  useEffect(() => { load(); }, []);

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Property Library</h1>
          <p className="text-gray-500 mt-1">Definieer herbruikbare velden voor locaties en assets.</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={() => setModal({ show: true, property: null })}>
          + Nieuwe Eigenschap
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naam</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Toepasbaar op</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acties</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map(p => {
              const t = formatTarget(p.target);
              return (
                <tr key={p.uuid} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                  <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-cyan-100 text-cyan-800">{p.dataType}</span></td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium text-white ${t.classes}`}>{t.label}</span></td>
                  <td className="px-4 py-3 text-right">
                    <button className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50" onClick={() => setModal({ show: true, property: p })}>Bewerken</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <PropertyModal show={modal.show} onHide={() => setModal({ show: false, property: null })} property={modal.property} onSaved={load} />
    </>
  );
}
