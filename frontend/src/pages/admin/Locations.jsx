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

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">Locatie Beheren</h5>
              <button type="button" className="btn-close" onClick={onHide}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Naam *</label>
                <input
                  type="text"
                  className="form-control"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Type *</label>
                <select
                  id="locTypeSelect"
                  className="form-select"
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
              <div className="mb-3">
                <label className="form-label">Parent Locatie</label>
                <select
                  id="locParentSelect"
                  className="form-select"
                  value={formData.parentUuid}
                  onChange={(e) => setFormData({ ...formData, parentUuid: e.target.value })}
                >
                  <option value="">Geen (Hoofdniveau)</option>
                </select>
              </div>
              <hr />
              <div id="dynamicFieldsContainer">
                {dynamicFields.length === 0 ? (
                  <p className="text-muted small">Kies eerst een type om extra velden te zien.</p>
                ) : (
                  dynamicFields.map((f) => (
                    <div key={f.propertyUuid} className="mb-3">
                      <label className="form-label">
                        {f.name} {f.required && <span className="text-danger">*</span>}
                      </label>
                      {f.dataType === 'BOOLEAN' ? (
                        <input
                          type="checkbox"
                          className="form-check-input"
                          data-uuid={f.propertyUuid}
                          defaultChecked={f.value === 'true'}
                        />
                      ) : f.dataType === 'INTEGER' ? (
                        <input
                          type="number"
                          className="form-control"
                          data-uuid={f.propertyUuid}
                          defaultValue={f.value}
                          required={f.required}
                        />
                      ) : (
                        <input
                          type="text"
                          className="form-control"
                          data-uuid={f.propertyUuid}
                          defaultValue={f.value}
                          required={f.required}
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide}>
                Annuleren
              </button>
              <button type="submit" className="btn btn-primary">
                Opslaan
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
    <ul className="list-group list-group-flush ms-4 mt-2">
      {nodes.map((node) => (
        <li key={node.uuid} className="list-group-item border-0 py-1">
          <div className="tree-row">
            <div className="tree-content">
              <i className={`bi ${node.children?.length ? 'bi-chevron-down' : 'bi-dot'} me-2 text-muted`}></i>
              <span className="fw-bold text-truncate">{node.name}</span>
              <small className="badge bg-light text-dark ms-2 border">{node.locationTypeName}</small>
            </div>
            <div className="tree-actions opacity-75">
              <button
                className="btn btn-sm btn-link text-success p-0"
                onClick={() => onAddChild(node.uuid)}
                title="Sublocatie toevoegen"
              >
                <i className="bi bi-plus-circle"></i>
              </button>
              <button className="btn btn-sm btn-link text-primary p-0" onClick={() => onEdit(node.uuid)} title="Bewerken">
                <i className="bi bi-pencil-square"></i>
              </button>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Locations</h1>
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
          <button className="btn btn-primary" onClick={() => setModal({ show: true, location: null, parentUuid: null })}>
            <i className="bi bi-plus-lg"></i> Locatie Toevoegen
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
                  placeholder="Zoek op naam of type..."
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
        <div className="card shadow-sm">
          <div className="card-body">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Naam</th>
                  <th>Type</th>
                  <th>Parent</th>
                  <th className="text-end">Acties</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((l) => (
                  <tr key={l.uuid}>
                    <td><strong>{l.name}</strong></td>
                    <td><span className="badge bg-secondary">{l.typeName || 'N/A'}</span></td>
                    <td>{l.parentName || <span className="text-muted">-</span>}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary" onClick={() => editLocation(l.uuid)}>
                        Bewerken
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
            <div className="tree-container">{renderTreeNodes(filteredTree, openWithParent, editLocation)}</div>
          </div>
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
