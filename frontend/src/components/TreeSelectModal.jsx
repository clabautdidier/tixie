import { useState, useEffect } from 'react';
import { api } from '../api/api';

function TreeNode({ node, parentPath, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const currentPath = parentPath ? `${parentPath} > ${node.name}` : node.name;
  const hasChildren = node.children?.length > 0;

  return (
    <li>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <span
          className={hasChildren ? `caret ${expanded ? 'caret-down' : ''}` : ''}
          style={{ display: 'inline-block', width: 20, cursor: hasChildren ? 'pointer' : 'default' }}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setExpanded((x) => !x);
          }}
        />
        <span
          className="node-content"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(node, currentPath);
          }}
        >
          {node.name}
        </span>
      </div>
      {hasChildren && (
        <ul className={`nested ${expanded ? 'active' : ''}`} style={{ paddingLeft: 20, listStyle: 'none' }}>
          {node.children.map((child) => (
            <TreeNode key={child.uuid} node={child} parentPath={currentPath} onSelect={onSelect} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function TreeSelectModal({ show, onHide, title, loadData, onSelect }) {
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (show && loadData) {
      setLoading(true);
      loadData()
        .then(setNodes)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [show, loadData]);

  if (!show) return null;

  const handleSelect = (node, path) => {
    onSelect(node, path);
    onHide();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          <div className="modal-body">
            <div className="tree-view">
              {loading ? (
                <span>Laden...</span>
              ) : (
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                  {nodes.map((node) => (
                    <TreeNode key={node.uuid} node={node} onSelect={handleSelect} />
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
