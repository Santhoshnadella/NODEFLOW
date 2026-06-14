import React from 'react';
import { Search } from 'lucide-react';
import { NODE_CATEGORIES, NODE_TEMPLATES } from '../data/nodeTemplates';

const NodeLibrary = () => {
  const onDragStart = (event: React.DragEvent, nodeType: string, template: any) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/nodeflow-template', JSON.stringify(template));
    event.dataTransfer.effectAllowed = 'move';
  };

  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredTemplates = NODE_TEMPLATES.filter(t => 
    t.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside className="sidebar">
      <div style={{ padding: '12px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '8px' }}>
          Node Library
        </div>
        <div style={{ position: 'relative' }}>
          <Search size={12} style={{ position: 'absolute', left: '10px', top: '9px', color: 'var(--text3)' }} />
          <input 
            type="text" 
            placeholder="Search nodes..." 
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '7px 10px 7px 30px',
              backgroundColor: 'var(--bg3)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--r-sm)',
              color: 'var(--text)',
              fontFamily: 'var(--font-mono)',
              fontSize: '11px',
              outline: 'none'
            }}
          />
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '8px', overflowY: 'auto', flex: 1 }}>
        {NODE_CATEGORIES.map(category => {
          const catNodes = filteredTemplates.filter(t => t.category === category.id);
          if (catNodes.length === 0) return null;

          return (
            <div key={category.id} style={{ marginBottom: '4px' }}>
              <div style={{ 
                fontSize: '10px', fontWeight: 600, color: 'var(--text3)', 
                textTransform: 'uppercase', letterSpacing: '1px', 
                padding: '8px 6px 4px', display: 'flex', alignItems: 'center', gap: '8px' 
              }}>
                {category.label}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                {catNodes.map((template, idx) => (
                  <div 
                    key={idx} 
                    draggable
                    onDragStart={(e) => onDragStart(e, template.type, template.data)}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      color: 'var(--text2)',
                      padding: '6px 10px',
                      borderRadius: 'var(--r-sm)',
                      cursor: 'grab',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'all 0.12s',
                      border: '1px solid transparent'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg4)';
                      e.currentTarget.style.color = 'var(--text)';
                      e.currentTarget.style.borderColor = 'var(--border)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text2)';
                      e.currentTarget.style.borderColor = 'transparent';
                    }}
                  >
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: category.color }} />
                    <span>{template.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default React.memo(NodeLibrary);
