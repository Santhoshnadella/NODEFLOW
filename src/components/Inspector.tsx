import React from 'react';
import { Node } from '@xyflow/react';
import { GraduationCap } from 'lucide-react';
import CodeEditor from './CodeEditor';

interface InspectorProps {
  selectedNode: Node<any> | null;
  onParameterChange: (nodeId: string, key: string, value: any) => void;
  onShowDeepDive: (node: Node<any>) => void;
}

const Inspector: React.FC<InspectorProps> = ({ selectedNode, onParameterChange, onShowDeepDive }) => {
  if (!selectedNode) {
    return (
      <aside className="inspector">
        <div style={{ color: 'var(--text3)', fontSize: '12px', padding: '20px 0', textAlign: 'center' }}>
          Select a node to configure it
        </div>
      </aside>
    );
  }

  const { data, id } = selectedNode;

  // Check if this is a Custom Python node
  const isCustomPython = data.label === 'Custom Python';

  return (
    <aside className="inspector">
      <div className="fade-in">
        <div className="inspector-title">{data.label}</div>
        <div className="inspector-sub">{id} · READY</div>
        
        <div className="inspector-section">
          <div className="inspector-section-title">Parameters</div>
          {Object.entries(data.parameters || {}).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '10px' }}>
              <label style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)', display: 'block', marginBottom: '4px' }}>
                {key}
              </label>
              {/* Use the CodeEditor for the 'code' parameter on Custom Python nodes */}
              {isCustomPython && key === 'code' ? (
                <CodeEditor
                  value={String(value)}
                  onChange={(val) => onParameterChange(id, key, val)}
                  language="python"
                  placeholder={'def main(input_data):\n    # Your code here\n    return input_data'}
                />
              ) : (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <input 
                    type="text" 
                    value={String(value)} 
                    className="search-input" 
                    style={{ flex: 1, background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: '4px', padding: '6px', fontSize: '11px', color: 'white' }} 
                    onChange={(e) => onParameterChange(id, key, e.target.value)}
                  />
                  {key.toLowerCase().includes('path') && (
                    <button 
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.onchange = (e: any) => {
                          const file = e.target.files[0];
                          if (file) onParameterChange(id, key, file.path || file.name);
                        };
                        input.click();
                      }}
                      style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '4px', color: 'white', padding: '0 8px', cursor: 'pointer', fontSize: '10px' }}
                    >
                      📂
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {!data.parameters && (
            <div style={{ color: 'var(--text3)', fontSize: '10px', fontStyle: 'italic' }}>No configurable parameters for this node</div>
          )}
        </div>

        {data.explanation && (
          <div className="inspector-section">
            <div className="inspector-section-title">Logic Explorer (Level 2)</div>
            <div className="explain-box">
              <div className="explain-item">
                <div className="explain-label">What it is</div>
                <div className="explain-text">{data.explanation?.what}</div>
              </div>
              <div className="explain-item">
                <div className="explain-label">How it works</div>
                <div className="explain-text">{data.explanation?.how}</div>
              </div>
              <div className="explain-item">
                <div className="explain-label">6yr Old Analogy</div>
                <div className="explain-text" style={{ color: 'var(--accent2)', fontStyle: 'italic' }}>
                  "{data.explanation?.analogy}"
                </div>
              </div>
              <button 
                className="deep-dive-btn"
                onClick={() => onShowDeepDive(selectedNode)}
              >
                <GraduationCap size={14} /> Deep Dive (Level 3)
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Inspector;
