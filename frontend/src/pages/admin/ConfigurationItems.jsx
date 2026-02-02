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

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Configuration Item Beheren</h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Naam *</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Type *</label>
                  <select
                    className="form-select"
                    value={formData.configurationItemTypeUuid}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData({ ...formData, configurationItemTypeUuid: v });
                      handleTypeChange(v);
                    }}
                    required
                    disabled={!!item}
                  >
                    <option value="">Selecteer een type...</option>
                    {ciTypes.map((t) => (
                      <option key={t.uuid} value={t.uuid}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-12">
                  <label className="form-label">Parent Configuration Item</label>
                  <select
                    className="form-select"
                    value={formData.parentConfigurationItemUuid}
                    onChange={(e) => setFormData({ ...formData, parentConfigurationItemUuid: e.target.value })}
                  >
                    {parentOptions.map((o) => (
                      <option key={o.value || 'empty'} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-md-6">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="ACTIVE">Actief</option>
                    <option value="IN_REPAIR">In Reparatie</option>
                    <option value="RETIRED">Uitgefaseerd</option>
                    <option value="STOCK">In Voorraad</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Locatie</label>
                  <select
                    className="form-select"
                    value={formData.locationUuid}
                    onChange={(e) => setFormData({ ...formData, locationUuid: e.target.value })}
                  >
                    <option value="">Geen locatie</option>
                    {locations.map((l) => (
                      <option key={l.uuid} value={l.uuid}>
                        {l.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <hr />
              <h6 className="mb-3">Specificaties (Dynamisch)</h6>
              {dynamicFields.map((f) => (
                <div key={f.propertyUuid} className="mb-3">
                  <label className="form-label">{f.name}</label>
                  {f.dataType === 'BOOLEAN' ? (
                    <input
                      type="checkbox"
                      className="form-check-input"
                      data-property-uuid={f.propertyUuid}
                      defaultChecked={f.value === 'true'}
                    />
                  ) : (
                    <input
                      type="text"
                      className="form-control"
                      data-property-uuid={f.propertyUuid}
                      defaultValue={f.value}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide}>
                Annuleren
              </button>
              <button type="submit" className="btn btn-primary">
                Item Opslaan
              </button>
            </div>
          </form>
        </div>
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
    <ul className="list-group list-group-flush ms-4 mt-1">
      {nodes.map((node) => (
        <li key={node.uuid} className="list-group-item border-0 py-1">
          <div className="tree-row">
            <div className="tree-content">
              <i className={`bi ${node.children?.length ? 'bi-cpu-fill' : 'bi-cpu'} me-2 text-muted`}></i>
              <span className="fw-bold text-truncate">{node.name}</span>
              <small className="badge bg-light text-dark ms-2 border">{node.configurationItemTypeName}</small>
            </div>
            <div className="tree-actions opacity-75">
              <button
                className="btn btn-sm btn-link text-success p-0"
                onClick={() => onAddChild(node.uuid)}
                title="Child toevoegen"
              >
                <i className="bi bi-plus-circle"></i>
              </button>
              <button className="btn btn-sm btn-link text-primary p-0" onClick={() => onEdit(node.uuid)}>
                <i className="bi bi-pencil-square"></i>
              </button>
              <button className="btn btn-sm btn-link text-danger p-0" onClick={() => onDelete(node.uuid)}>
                <i className="bi bi-trash"></i>
              </button>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Configuration Items (CMDB)</h1>
        <div className="d-flex gap-3">
          <div className="btn-group">
            <button
              className={`btn btn-outline-primary ${view === 'table' ? 'active' : ''}`}
              onClick={() => setView('table')}
            >
              <i className="bi bi-table"></i> Tabel
            </button>
            <button
              className={`btn btn-outline-primary ${view === 'tree' ? 'active' : ''}`}
              onClick={() => setView('tree')}
            >
              <i className="bi bi-tree-fill"></i> Boomstructuur
            </button>
          </div>
          <button className="btn btn-primary" onClick={() => setModal({ show: true, item: null, parentUuid: null })}>
            + Nieuw Item
          </button>
        </div>
      </div>

      <div className="card mb-3 shadow-sm">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Zoek op naam, type of status..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select className="form-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="name_asc">Naam (A-Z)</option>
                <option value="name_desc">Naam (Z-A)</option>
                <option value="type_asc">Type (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {view === 'table' && (
        <div className="card shadow">
          <div className="card-body p-0">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>Naam</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th className="text-end">Acties</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((i) => (
                  <tr key={i.uuid}>
                    <td>
                      <strong>{i.name}</strong>
                      <br />
                      <small className="text-muted">
                        {i.parentConfigurationItemName ? `↳ ${i.parentConfigurationItemName}` : 'Hoofditem'}
                      </small>
                    </td>
                    <td><span className="badge bg-info text-dark">{i.configurationItemTypeName}</span></td>
                    <td><span className="badge bg-light text-dark border">{i.status}</span></td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-1" onClick={() => editItem(i.uuid)}>
                        Bewerken
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => deleteItem(i.uuid)}>
                        Verwijderen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {view === 'tree' && (
        <div className="card shadow-sm">
          <div className="card-body">
            <div className="tree-container">{renderTreeNodes(filteredTree, openWithParent, editItem, deleteItem)}</div>
          </div>
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
