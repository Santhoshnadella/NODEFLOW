import React from 'react';
import { NODE_TEMPLATES } from '../data/nodeTemplates';

interface ContextMenuProps {
  x: number;
  y: number;
  onAddNode: (template: any) => void;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onAddNode, onClose }) => {
  const [search, setSearch] = React.useState('');

  const filtered = NODE_TEMPLATES.filter(t => 
    t.label.toLowerCase().includes(search.toLowerCase())
  ).slice(0, 10);

  return (
    <div 
      className="context-menu" 
      style={{ 
        position: 'fixed', left: x, top: y, zIndex: 2000,
        background: 'var(--bg2)', border: '1px solid var(--border2)', 
        borderRadius: '8px', width: '220px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        overflow: 'hidden'
      }}
      onMouseLeave={onClose}
    >
      <div style={{ padding: '8px', borderBottom: '1px solid var(--border)' }}>
        <input 
          autoFocus
          type="text" 
          placeholder="Search nodes..." 
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '4px', padding: '6px', fontSize: '11px', color: 'white', outline: 'none' }}
        />
      </div>
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {filtered.map(t => (
          <div 
            key={t.label} 
            className="menu-item"
            onClick={() => onAddNode(t)}
            style={{ padding: '8px 12px', fontSize: '11px', color: 'var(--text2)', cursor: 'pointer', borderBottom: '1px solid rgba(255,255,255,0.03)' }}
          >
            {t.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContextMenu;
