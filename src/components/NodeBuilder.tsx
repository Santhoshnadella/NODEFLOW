import React, { useState } from 'react';
import { X, Check, Box } from 'lucide-react';

interface NodeBuilderProps {
  onClose: () => void;
  onSave: (nodeDef: any) => void;
}

const NodeBuilder: React.FC<NodeBuilderProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('advanced');
  const [description, setDescription] = useState('');

  const handleSave = () => {
    if (!name) return;
    const newNode = {
      type: 'baseNode',
      label: name,
      category,
      data: {
        label: name,
        category,
        inputs: [{ id: 'in', label: 'In', type: 'any' }],
        outputs: [{ id: 'out', label: 'Out', type: 'any' }],
        parameters: {},
        explanation: {
          what: description,
          how: "Custom built macro-node.",
          gives: "Custom output.",
          analogy: "Like a custom tool you built yourself."
        }
      }
    };
    onSave(newNode);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        backgroundColor: 'var(--bg2)',
        border: '1px solid var(--border2)',
        borderRadius: '16px',
        width: '500px',
        maxWidth: '90vw',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        fontFamily: 'var(--font-display)'
      }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          backgroundColor: 'var(--bg3)'
        }}>
          <h2 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Box size={18} color="var(--accent)" />
            Node Builder
          </h2>
          <button onClick={onClose} style={{
            background: 'transparent', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: '4px'
          }}>
            <X size={20} />
          </button>
        </div>
        
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ margin: 0, fontSize: '12px', color: 'var(--text2)' }}>
            Group your selected canvas nodes into a single reusable Macro Node.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Node Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{
                backgroundColor: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: '8px',
                padding: '10px 12px', color: 'var(--text)', outline: 'none', fontSize: '13px', fontFamily: 'var(--font-display)'
              }}
              placeholder="e.g. Awesome CV Block"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Category</label>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                backgroundColor: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: '8px',
                padding: '10px 12px', color: 'var(--text)', outline: 'none', fontSize: '13px', fontFamily: 'var(--font-display)'
              }}
            >
              <option value="math">Math & Stats</option>
              <option value="ml">Classical ML</option>
              <option value="dl">Deep Learning</option>
              <option value="cv">Computer Vision</option>
              <option value="nlp">NLP</option>
              <option value="advanced">Advanced (Custom)</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent2)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Description</label>
            <textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                backgroundColor: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: '8px',
                padding: '10px 12px', color: 'var(--text)', outline: 'none', fontSize: '13px', fontFamily: 'var(--font-display)',
                height: '80px', resize: 'none'
              }}
              placeholder="What does this custom node do?"
            />
          </div>
        </div>

        <div style={{
          padding: '16px 20px', borderTop: '1px solid var(--border)', backgroundColor: 'var(--bg3)',
          display: 'flex', justifyContent: 'flex-end', gap: '12px'
        }}>
          <button onClick={onClose} style={{
            padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
            background: 'transparent', border: '1px solid var(--border)', color: 'var(--text2)', cursor: 'pointer'
          }}>
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!name}
            style={{
              padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 600,
              background: 'var(--accent)', border: '1px solid var(--accent)', color: '#fff', cursor: name ? 'pointer' : 'not-allowed',
              opacity: name ? 1 : 0.5, display: 'flex', alignItems: 'center', gap: '8px'
            }}
          >
            <Check size={16} />
            Build Node
          </button>
        </div>
      </div>
    </div>
  );
};

export default NodeBuilder;

