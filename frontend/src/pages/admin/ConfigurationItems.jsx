import { useState, useEffect, useCallback } from 'react';
import { api } from '../../api/api';

function fillParentOptions(nodes, options, level = 0, excludeUuid = null) {
  if (!nodes) return;
  nodes.forEach((node) => {
    if (node.uuid !== excludeUuid) {
      options.push({ value: node.uuid, label: (level > 0 ? '—'.repeat(level) + ' ' : '') + node.name });
      if (node.children?.length) fillParentOptions(node.children, options, level + 1, excludeUuid);
    }
  });
}

function CIModal({ show, onHide, item, parentUuid, onSaved }) {
  const [ciTypes, setCiTypes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [parentOptions, setParentOptions] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    configurationItemTypeUuid: '',
    parentConfigurationItemUuid: '',
    status: 'ACTIVE',
    locationUuid: '',
    values: []
  });
  const [dynamicFields, setDynamicFields] = useState([]);

  const loadParents = useCallback(async (excludeUuid = null) => {
    const tree = await api.getConfigurationItemsTree();
    const opts = [{ value: '', label: '-- Geen Parent (Hoofditem) --' }];
    fillParentOptions(tree, opts, 0, excludeUuid);
    setParentOptions(opts);
  }, []);

  useEffect(() => {
    if (show) {
      Promise.all([
        api.getConfigurationItemTypes(),
        api.getLocations(),
        loadParents(item?.uuid)
      ]).then(([types, locs]) => {
        setCiTypes(types);
        setLocations(locs);
      });

      if (item) {
        setFormData({
          name: item.name,
          configurationItemTypeUuid: item.configurationItemTypeUuid,
          parentConfigurationItemUuid: item.parentConfigurationItemUuid || '',
          status: item.status,
          locationUuid: item.locationUuid || '',
          values: item.values || []
        });
        const type = (async () => {
          const t = await api.getConfigurationItemTypes();
          return t.find((x) => x.uuid === item.configurationItemTypeUuid);
        })();
        type.then((t) => {
          if (t?.properties)
            setDynamicFields(
              t.properties.map((p) => ({
                ...p,
                value: (item.values || []).find((v) => v.propertyDefinitionUuid === p.propertyUuid)?.value ?? ''
              }))
            );
        });
      } else {
        setFormData({
          name: '',
          configurationItemTypeUuid: '',
          parentConfigurationItemUuid: parentUuid || '',
          status: 'ACTIVE',
          locationUuid: '',
          values: []
        });
        setDynamicFields([]);
      }
    }
  }, [show, item, parentUuid, loadParents]);

  useEffect(() => {
    if (show && formData.configurationItemTypeUuid) {
      const type = ciTypes.find((t) => t.uuid === formData.configurationItemTypeUuid);
      if (type?.properties && !item) {
        setDynamicFields(type.properties.map((p) => ({ ...p, value: '' })));
      }
    }
  }, [formData.configurationItemTypeUuid, ciTypes, show, item]);

  const handleTypeChange = (typeUuid) => {
    const type = ciTypes.find((t) => t.uuid === typeUuid);
    setDynamicFields(
      type?.properties?.map((p) => ({
        ...p,
        value: formData.values.find((v) => v.propertyDefinitionUuid === p.propertyUuid)?.value ?? ''
      })) ?? []
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const values = dynamicFields.map((f) => {
      const input = document.querySelector(`[data-property-uuid="${f.propertyUuid}"]`);
      const val = input?.type === 'checkbox' ? input.checked.toString() : input?.value ?? '';
      return { propertyDefinitionUuid: f.propertyUuid, value: val };
    });
    const payload = {
      name: formData.name,
      configurationItemTypeUuid: formData.configurationItemTypeUuid,
      status: formData.status,
      locationUuid: formData.locationUuid || null,
      parentConfigurationItemUuid: formData.parentConfigurationItemUuid || null,
      values
    };
    try {
      if (item) {
        await api.updateConfigurationItem(item.uuid, payload);
      } else {
        await api.createConfigurationItem(payload);
      }
      onSaved();
      onHide();
    } catch (err) {
      alert(err.message);
    }
  };

  if (!show) return null;

  const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onHide}>
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold">Configuration Item Beheren</h3>
            <button type="button" className="text-gray-400 hover:text-gray-600 text-2xl" onClick={onHide}>×</button>
          </div>
          <div className="p-4 space-y-4 overflow-auto">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Naam *</label>
                <input type="text" className={inputClass} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                <select className={inputClass} value={formData.configurationItemTypeUuid} onChange={(e) => { const v = e.target.value; setFormData({ ...formData, configurationItemTypeUuid: v }); handleTypeChange(v); }} required disabled={!!item}>
                  <option value="">Selecteer een type...</option>
                  {ciTypes.map(t => <option key={t.uuid} value={t.uuid}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Parent Configuration Item</label>
              <select className={inputClass} value={formData.parentConfigurationItemUuid} onChange={(e) => setFormData({ ...formData, parentConfigurationItemUuid: e.target.value })}>
                {parentOptions.map(o => <option key={o.value || 'empty'} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select className={inputClass} value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  <option value="ACTIVE">Actief</option>
                  <option value="IN_REPAIR">In Reparatie</option>
                  <option value="RETIRED">Uitgefaseerd</option>
                  <option value="STOCK">In Voorraad</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Locatie</label>
                <select className={inputClass} value={formData.locationUuid} onChange={(e) => setFormData({ ...formData, locationUuid: e.target.value })}>
                  <option value="">Geen locatie</option>
                  {locations.map(l => <option key={l.uuid} value={l.uuid}>{l.name}</option>)}
                </select>
              </div>
            </div>
            <hr />
            <h4 className="font-medium">Specificaties (Dynamisch)</h4>
            {dynamicFields.map(f => (
              <div key={f.propertyUuid} className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.name}</label>
                {f.dataType === 'BOOLEAN' ? (
                  <input type="checkbox" className="rounded" data-property-uuid={f.propertyUuid} defaultChecked={f.value === 'true'} />
                ) : (
                  <input type="text" className={inputClass} data-property-uuid={f.propertyUuid} defaultValue={f.value} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
            <button type="button" className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300" onClick={onHide}>Annuleren</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Item Opslaan</button>
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
        (node.configurationItemTypeName && node.configurationItemTypeName.toLowerCase().includes(term));
      if (node.children?.length) node.children = filterTree(node.children, term);
      return matches || (node.children && node.children.length > 0);
    })
    .map((n) => ({ ...n }));
}

function renderTreeNodes(nodes, onAddChild, onEdit, onDelete) {
  if (!nodes?.length) return null;
  return (
    <ul className="ml-4 mt-1 space-y-1">
      {nodes.map(node => (
        <li key={node.uuid} className="py-1">
          <div className="flex justify-between items-center px-2 py-1 rounded hover:bg-gray-100 group">
            <div className="flex items-center min-w-0">
              <span className="text-gray-400 mr-2">{node.children?.length ? '◉' : '○'}</span>
              <span className="font-medium truncate">{node.name}</span>
              <span className="ml-2 inline-flex px-2 py-0.5 text-xs rounded border border-gray-300 bg-white text-gray-700">{node.configurationItemTypeName}</span>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100">
              <button className="text-green-600 hover:text-green-700 p-1" onClick={() => onAddChild(node.uuid)} title="Child toevoegen">+</button>
              <button className="text-blue-600 hover:text-blue-700 p-1" onClick={() => onEdit(node.uuid)}>✎</button>
              <button className="text-red-600 hover:text-red-700 p-1" onClick={() => onDelete(node.uuid)}>🗑</button>
            </div>
          </div>
          {renderTreeNodes(node.children, onAddChild, onEdit, onDelete)}
        </li>
      ))}
    </ul>
  );
}

export default function ConfigurationItems() {
  const [view, setView] = useState('table');
  const [items, setItems] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('name_asc');
  const [modal, setModal] = useState({ show: false, item: null, parentUuid: null });

  const load = useCallback(async () => {
    const [flat, tree] = await Promise.all([api.getConfigurationItems(), api.getConfigurationItemsTree()]);
    setItems(flat);
    setTreeData(tree);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filteredFlat = items.filter(
    (i) =>
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.configurationItemTypeName && i.configurationItemTypeName.toLowerCase().includes(search.toLowerCase())) ||
      (i.status && i.status.toLowerCase().includes(search.toLowerCase()))
  );

  const sorted = [...filteredFlat].sort((a, b) => {
    if (sort === 'name_asc') return a.name.localeCompare(b.name);
    if (sort === 'name_desc') return b.name.localeCompare(a.name);
    if (sort === 'type_asc') return (a.configurationItemTypeName || '').localeCompare(b.configurationItemTypeName || '');
    return 0;
  });

  const filteredTree = filterTree(JSON.parse(JSON.stringify(treeData)), search.toLowerCase());

  const openWithParent = (parentUuid) => setModal({ show: true, item: null, parentUuid });
  const editItem = (uuid) => api.getConfigurationItem(uuid).then((i) => setModal({ show: true, item: i, parentUuid: null }));
  const deleteItem = async (uuid) => {
    if (window.confirm('Item verwijderen?')) {
      await api.deleteConfigurationItem(uuid);
      load();
    }
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Configuration Items (CMDB)</h1>
        <div className="flex gap-3">
          <div className="flex rounded overflow-hidden border border-gray-300">
            <button className={`px-4 py-2 text-sm ${view === 'table' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} onClick={() => setView('table')}>Tabel</button>
            <button className={`px-4 py-2 text-sm ${view === 'tree' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`} onClick={() => setView('tree')}>Boomstructuur</button>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700" onClick={() => setModal({ show: true, item: null, parentUuid: null })}>+ Nieuw Item</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">⌕</span>
            <input type="text" className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Zoek op naam, type of status..." value={search} onChange={e => setSearch(e.target.value)} />
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acties</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sorted.map(i => (
                <tr key={i.uuid} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-medium text-gray-900">{i.name}</span>
                    <br />
                    <span className="text-sm text-gray-500">{i.parentConfigurationItemName ? `↳ ${i.parentConfigurationItemName}` : 'Hoofditem'}</span>
                  </td>
                  <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-cyan-100 text-cyan-800">{i.configurationItemTypeName}</span></td>
                  <td className="px-4 py-3"><span className="inline-flex px-2 py-0.5 rounded text-xs font-medium border border-gray-300 bg-white text-gray-700">{i.status}</span></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-2 justify-end">
                    <button className="px-3 py-1 text-sm text-blue-600 border border-blue-600 rounded hover:bg-blue-50" onClick={() => editItem(i.uuid)}>Bewerken</button>
                    <button className="px-3 py-1 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50" onClick={() => deleteItem(i.uuid)}>Verwijderen</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {view === 'tree' && (
        <div className="bg-white rounded-lg shadow p-4">
          {renderTreeNodes(filteredTree, openWithParent, editItem, deleteItem)}
        </div>
      )}

      <CIModal
        show={modal.show}
        onHide={() => setModal({ show: false, item: null, parentUuid: null })}
        item={modal.item}
        parentUuid={modal.parentUuid}
        onSaved={load}
      />
    </>
  );
}
