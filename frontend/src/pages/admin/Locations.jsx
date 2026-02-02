import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/api';

function fillParentOptions(nodes, select, level = 0, excludeUuid = null) {
  if (!nodes) return;
  nodes.forEach((node) => {
    if (node.uuid !== excludeUuid) {
      const opt = document.createElement('option');
      opt.value = node.uuid;
      opt.textContent = (level > 0 ? '—'.repeat(level) + ' ' : '') + node.name;
      select.appendChild(opt);
      if (node.children?.length) fillParentOptions(node.children, select, level + 1, excludeUuid);
    }
  });
}

function LocationModal({ show, onHide, location, parentUuid, onSaved }) {
  const [locationTypes, setLocationTypes] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    typeUuid: '',
    parentUuid: '',
    values: []
  });
  const [dynamicFields, setDynamicFields] = useState([]);

  const loadTypes = async () => {
    const data = await api.getLocationTypes();
    setLocationTypes(data);
  };

  const refreshParentDropdown = useCallback(async (excludeUuid = null) => {
    const tree = await api.getLocationsTree();
    const select = document.getElementById('locParentSelect');
    if (!select) return;
    select.innerHTML = '<option value="">-- Geen Parent (Hoofdlocatie) --</option>';
    fillParentOptions(tree, select, 0, excludeUuid);
  }, []);

  useEffect(() => {
    if (show) {
      loadTypes();
      if (location) {
        setFormData({
          name: location.name,
          typeUuid: location.typeUuid,
          parentUuid: location.parentUuid || '',
          values: location.values || []
        });
        const type = locationTypes.find((t) => t.uuid === location.typeUuid) || (async () => {
          const types = await api.getLocationTypes();
          return types.find((t) => t.uuid === location.typeUuid);
        })();
        Promise.resolve(type).then((t) => {
          if (t?.properties) setDynamicFields(t.properties.map((p) => ({ ...p, value: (location.values || []).find((v) => v.propertyUuid === p.propertyUuid)?.value })));
        });
        refreshParentDropdown(location.uuid);
      } else {
        setFormData({ name: '', typeUuid: '', parentUuid: parentUuid || '', values: [] });
        setDynamicFields([]);
        refreshParentDropdown();
      }
    }
  }, [show, location, parentUuid]);

  useEffect(() => {
    if (show && formData.typeUuid) {
      const type = locationTypes.find((t) => t.uuid === formData.typeUuid);
      if (type?.properties) {
        setDynamicFields(
          type.properties.map((p) => ({
            ...p,
            value: formData.values.find((v) => v.propertyUuid === p.propertyUuid)?.value ?? ''
          }))
        );
      }
    }
  }, [formData.typeUuid, locationTypes, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const values = dynamicFields.map((f) => {
      const input = document.querySelector(`[data-uuid="${f.propertyUuid}"]`);
      const val = input?.type === 'checkbox' ? input.checked.toString() : input?.value ?? '';
      return { propertyUuid: f.propertyUuid, value: val };
    });
    const payload = {
      name: formData.name,
      typeUuid: formData.typeUuid,
      parentUuid: formData.parentUuid || null,
      values
    };
    try {
      if (location) {
        await api.updateLocation(location.uuid, payload);
      } else {
        await api.createLocation(payload);
      }
      onSaved();
      onHide();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!show) return null;

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onHide}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Locatie Beheren</h3>
            <button type="button" className="text-gray-400 hover:text-gray-600 text-2xl" onClick={onHide}>×</button>
          </div>
          <div className="p-4 space-y-4 overflow-auto">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
              <input
                type="text"
                className={inputClass}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
              <select
                id="locTypeSelect"
                className={inputClass}
                  value={formData.typeUuid}
                  onChange={(e) => {
                    const typeUuid = e.target.value;
                    setFormData({ ...formData, typeUuid });
                    const type = locationTypes.find((t) => t.uuid === typeUuid);
                    setDynamicFields(
                      type?.properties?.map((p) => ({
                        ...p,
                        value: formData.values.find((v) => v.propertyUuid === p.propertyUuid)?.value ?? ''
                      })) ?? []
                    );
                  }}
                  required
                >
                  <option value="">Selecteer een type...</option>
                  {locationTypes.map((t) => (
                    <option key={t.uuid} value={t.uuid}>
                      {t.name}
                    </option>
                  ))}
                </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Locatie</label>
              <select id="locParentSelect" className={inputClass} value={formData.parentUuid} onChange={(e) => setFormData({ ...formData, parentUuid: e.target.value })}>
                <option value="">Geen (Hoofdniveau)</option>
              </select>
            </div>
            <hr />
            <div>
              {dynamicFields.length === 0 ? (
                <p className="text-sm text-gray-500">Kies eerst een type om extra velden te zien.</p>
              ) : (
                dynamicFields.map((f) => (
                  <div key={f.propertyUuid} className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">{f.name} {f.required && <span className="text-red-500">*</span>}</label>
                    {f.dataType === 'BOOLEAN' ? (
                      <input type="checkbox" className="rounded" data-uuid={f.propertyUuid} defaultChecked={f.value === 'true'} />
                    ) : f.dataType === 'INTEGER' ? (
                      <input type="number" className={inputClass} data-uuid={f.propertyUuid} defaultValue={f.value} required={f.required} />
                    ) : (
                      <input type="text" className={inputClass} data-uuid={f.propertyUuid} defaultValue={f.value} required={f.required} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
            <button type="button" className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300" onClick={onHide}>Annuleren</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Opslaan</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function filterTree(nodes, term) {
  return nodes
    .filter((node) => {
      const matches =
        node.name.toLowerCase().includes(term) ||
        (node.locationTypeName && node.locationTypeName.toLowerCase().includes(term));
      if (node.children?.length) {
        node.children = filterTree(node.children, term);
      }
      return matches || (node.children && node.children.length > 0);
    })
    .map((n) => ({ ...n }));
}

function renderTreeNodes(nodes, onAddChild, onEdit) {
  if (!nodes?.length) return null;
  return (
    <ul className="ml-4 mt-2 space-y-1">
      {nodes.map((node) => (
        <li key={node.uuid} className="py-1">
          <div className="flex justify-between items-center px-2 py-1 rounded hover:bg-gray-100 group">
            <div className="flex items-center min-w-0">
              <span className="text-gray-400 mr-2">{node.children?.length ? '▾' : '•'}</span>
              <span className="font-medium truncate">{node.name}</span>
              <span className="ml-2 inline-flex px-2 py-0.5 text-xs rounded border border-gray-300 bg-white text-gray-700">{node.locationTypeName}</span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100">
              <button className="text-green-600 hover:text-green-700 p-1" onClick={() => onAddChild(node.uuid)} title="Sublocatie toevoegen">+</button>
              <button className="text-blue-600 hover:text-blue-700 p-1" onClick={() => onEdit(node.uuid)} title="Bewerken">✎</button>
            </div>
          </div>
          {renderTreeNodes(node.children, onAddChild, onEdit)}
        </li>
      ))}
    </ul>
  );
}

export default function Locations() {
  const [view, setView] = useState('table');
  const [locations, setLocations] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name_asc');
  const [modal, setModal] = useState({ show: false, location: null, parentUuid: null });

  const openWithParent = (parentUuid) => setModal({ show: true, location: null, parentUuid });
  const editLocation = (uuid) => api.getLocation(uuid).then((loc) => setModal({ show: true, location: loc, parentUuid: null }));

  const load = useCallback(async () => {
    const [flat, tree] = await Promise.all([api.getLocations(), api.getLocationsTree()]);
    setLocations(flat);
    setTreeData(tree);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredFlat = locations.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.typeName && l.typeName.toLowerCase().includes(search.toLowerCase()))
  );

  const sorted = [...filteredFlat].sort((a, b) => {
    if (sort === 'name_asc') return a.name.localeCompare(b.name);
    if (sort === 'name_desc') return b.name.localeCompare(a.name);
    if (sort === 'type_asc') return (a.typeName || '').localeCompare(b.typeName || '');
    return 0;
  });

  const filteredTree = filterTree(JSON.parse(JSON.stringify(treeData)), search.toLowerCase());


  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
        <div className="flex gap-3">
          <div className="flex rounded overflow-hidden border border-gray-300">
            <button className={`px-4 py-2 text-sm ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} onClick={() => setView('table')}>Tabel</button>
            <button className={`px-4 py-2 text-sm ${view === 'tree' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} onClick={() => setView('tree')}>Boomstructuur</button>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={() => setModal({ show: true, location: null, parentUuid: null })}>+ Locatie Toevoegen</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">⌕</span>
            <input type="text" className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Zoek op naam of type..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="px-3 py-2 border border-gray-300 rounded-md" value={sort} onChange={e => setSort(e.target.value)}>
            <option value="name_asc">Naam (A-Z)</option>
            <option value="name_desc">Naam (Z-A)</option>
            <option value="type_asc">Type (A-Z)</option>
          </select>
        </div>
      </div>

      {view === 'table' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Naam</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acties</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sorted.map(l => (
                <tr key={l.uuid} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{l.name}</td>
                  <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-gray-200 text-gray-800">{l.typeName || 'N/A'}</span></td>
                  <td className="px-4 py-3 text-gray-500">{l.parentName || '-'}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50" onClick={() => editLocation(l.uuid)}>Bewerken</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'tree' && (
        <div className="bg-white rounded-lg shadow p-4">
          {renderTreeNodes(filteredTree, openWithParent, editLocation)}
        </div>
      )}

      <LocationModal
        show={modal.show}
        onHide={() => setModal({ show: false, location: null, parentUuid: null })}
        location={modal.location}
        parentUuid={modal.parentUuid}
        onSaved={load}
      />
    </>
  );
}
