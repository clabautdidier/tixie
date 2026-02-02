import { useState, useEffect } from 'react';
import { api } from '../api/api';

function TreeNode({ node, parentPath, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const currentPath = parentPath ? `${parentPath} > ${node.name}` : node.name;
  const hasChildren = node.children?.length > 0;

  return (
    <li>
      <div className="flex items-center">
        <span
          className={`inline-block w-5 text-center ${hasChildren ? 'cursor-pointer select-none' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            if (hasChildren) setExpanded((x) => !x);
          }}
        >
          {hasChildren && (
            <span className={`inline-block transition-transform ${expanded ? 'rotate-90' : ''}`}>▶</span>
          )}
        </span>
        <span
          className="cursor-pointer px-1.5 py-0.5 rounded hover:bg-gray-100"
          onClick={(e) => {
            e.stopPropagation();
            onSelect(node, currentPath);
          }}
        >
          {node.name}
        </span>
      </div>
      {hasChildren && (
        <ul className={`pl-5 list-none ${expanded ? 'block' : 'hidden'}`}>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
            onClick={onHide}
          >
            ×
          </button>
        </div>
        <div className="p-4 overflow-auto flex-1">
          {loading ? (
            <span>Laden...</span>
          ) : (
            <ul className="list-none pl-0">
              {nodes.map((node) => (
                <TreeNode key={node.uuid} node={node} onSelect={handleSelect} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
