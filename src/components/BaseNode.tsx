import React from 'react';
import { Handle, Position } from '@xyflow/react';

const BaseNode = ({ data, selected }: { data: any, selected: boolean }) => {
  const getKidFriendlyName = () => {
    if (!data.kidMode) return data.label;
    const mapping: Record<string, string> = {
      'Linear Regression': 'Predictor Machine',
      'Decision Tree': 'Decision Maker',
      'Load CSV': 'Open File',
      'dataframe': 'Table of Data',
      'tensor': 'Numbers Box',
      'Add': 'Plus (+)',
      'Multiply': 'Times (x)',
      'YOLOv8': 'Object Finder',
      'NeRF Trainer': '3D Scene Maker',
      'RL Agent (PPO)': 'Smart Gamer',
      'SHAP Explain': 'Mind Reader',
      'Stable Diffusion': 'Art Maker',
      'Whisper STT': 'Ear Bot',
      'Sentiment Analysis': 'Mood Reader',
      'Magic Sorting Hat': 'Toy Sorter',
      'Story Maker': 'Magic Book'
    };
    return mapping[data.label] || data.label;
  };

  const getCategoryColor = () => {
    const colors: Record<string, string> = {
      math: '#eab308',
      data: '#3b82f6',
      ml: '#22c55e',
      dl: '#a855f7',
      cv: '#f43f5e',
      nlp: '#6366f1',
      gen: '#ec4899',
      advanced: '#14b8a6',
      explain: '#8b5cf6',
      mlops: '#475569',
      kids: '#f59e0b',
    };
    return colors[data.category] || '#6c63ff';
  };

  const status = data.status || 'idle';
  const result = data.result;
  const color = getCategoryColor();

  return (
    <div className={`base-node ${selected ? 'selected' : ''} ${status} ${data.kidMode ? 'kid-mode' : ''}`} style={{ 
      border: status === 'complete' ? '1px solid var(--green)' : 
              status === 'running' ? '1px solid var(--teal)' :
              status === 'error' ? '1px solid var(--coral)' :
              selected ? `1px solid var(--accent)` : '1px solid var(--border2)',
      boxShadow: status === 'running' ? '0 0 15px var(--teal-dim)' :
                 selected ? '0 0 0 2px var(--accent-glow), 0 8px 32px rgba(0,0,0,0.5)' : 'none',
      borderRadius: data.kidMode ? '24px' : 'var(--r)',
      padding: data.kidMode ? '4px' : '0'
    }}>
      <div className="node-header" style={{ borderLeft: `3px solid ${color}` }}>
        <div className="node-icon" style={{ 
          width: '22px', height: '22px', borderRadius: '5px', 
          background: `${color}22`, color: color,
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px'
        }}>
          ⬡
        </div>
        <span className="node-title">{getKidFriendlyName()}</span>
        <div className={`node-status status-${status}`} style={{ 
          width: '7px', height: '7px', borderRadius: '50%', 
          background: status === 'complete' ? 'var(--green)' : 
                      status === 'running' ? 'var(--teal)' : 
                      status === 'error' ? 'var(--coral)' : 'var(--text3)',
          boxShadow: status === 'running' ? '0 0 8px var(--teal)' : 'none'
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0 4px' }}>
        <div className="ports-left" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {data.inputs?.map((input: any) => (
            <div key={input.id} className="port-group left" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '2px 10px', position: 'relative' }}>
              <Handle type="target" position={Position.Left} id={input.id} className={`port ${input.type || 'any'}`} />
              <span className="port-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)' }}>{input.label}</span>
            </div>
          ))}
        </div>

        <div className="ports-right" style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
          {data.outputs?.map((output: any) => {
            const portData = result ? result[output.id] : null;
            const shapeStr = portData?.shape ? `[${portData.shape.join(', ')}]` : (portData?.rows ? `(${portData.rows}, ${portData.cols?.length || 0})` : null);
            return (
              <div key={output.id} className="port-group right" style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '2px 10px', position: 'relative' }}>
                <span className="port-label" style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)' }}>{output.label}</span>
                {shapeStr && (
                  <span className="shape-badge" style={{ fontSize: '8px', background: 'var(--bg3)', padding: '2px 4px', borderRadius: '4px', color: 'var(--accent)', fontFamily: 'var(--font-mono)' }}>
                    {shapeStr}
                  </span>
                )}
                <Handle type="source" position={Position.Right} id={output.id} className={`port ${output.type || 'any'}`} />
              </div>
            );
          })}
        </div>
      </div>

      {result && (
        <div className="node-result-preview" style={{ 
          margin: '4px 8px 8px', padding: '6px', background: 'var(--bg4)', 
          borderRadius: 'var(--r-sm)', border: '1px solid var(--border)',
          fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text2)',
          maxHeight: data.label.includes('Viewer') || data.label.includes('Preview') ? '160px' : '60px', 
          overflow: 'auto'
        }}>
          <div style={{ color: 'var(--text3)', textTransform: 'uppercase', fontSize: '8px', marginBottom: '4px' }}>Result</div>
          
          {data.label === 'Image Preview' && result.img ? (
            <img src={result.img} style={{ width: '100%', borderRadius: '4px' }} alt="Preview" />
          ) : data.label === 'Table Viewer' && Array.isArray(result.preview) ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '8px' }}>
                <thead>
                  <tr>
                    {Object.keys(result.preview[0]).map(k => <th key={k} style={{ textAlign: 'left', padding: '2px', borderBottom: '1px solid var(--border)' }}>{k}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {result.preview.slice(0, 5).map((row: any, i: number) => (
                    <tr key={i}>
                      {Object.values(row).map((v: any, j: number) => <td key={j} style={{ padding: '2px', borderBottom: '1px solid var(--bg3)' }}>{String(v)}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : typeof result === 'object' ? (
            result.error ? (
              <div style={{ color: 'var(--coral)', marginTop: '4px' }}>
                <strong>Error:</strong> {result.error}<br/>
                {result.diagnosis && <span style={{ color: 'var(--coral-dim)', fontSize: '8px' }}>Diagnosis: {result.diagnosis}</span>}
              </div>
            ) : result.cols ? `DataFrame: ${result.rows} rows, ${result.cols.length} cols` :
            result.type ? `Model: ${result.type}` : 
            result.score !== undefined ? `Score: ${result.score}` :
            JSON.stringify(result).slice(0, 80) + (JSON.stringify(result).length > 80 ? '...' : '')
          ) : String(result)}
        </div>
      )}

      {data.label === 'Loss Curve Chart' && data.stats?.history && (
        <div className="node-result-preview" style={{ 
          margin: '4px 8px 8px', padding: '6px', background: 'var(--bg4)', 
          borderRadius: 'var(--r-sm)', border: '1px solid var(--border)'
        }}>
           <div style={{ color: 'var(--text3)', textTransform: 'uppercase', fontSize: '8px', marginBottom: '4px' }}>Training Loss</div>
           <div style={{ height: '60px', width: '100%' }}>
              {data.stats.history.length > 0 ? (
                <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polyline 
                    points={data.stats.history.map((h: any, i: number, arr: any[]) => `${(i / Math.max(1, arr.length - 1)) * 100},${100 - (h.loss / Math.max(...arr.map(a => a.loss))) * 100}`).join(' ')} 
                    fill="none" stroke="var(--teal)" strokeWidth="2" 
                  />
                </svg>
              ) : <span style={{fontSize: '9px', color: 'var(--text3)'}}>Waiting...</span>}
           </div>
        </div>
      )}

      {data.parameters && !result && data.selectedMode !== 'kid' && (
        <div style={{ padding: '8px 12px 10px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          {Object.entries(data.parameters).slice(0, data.selectedMode === 'dev' ? undefined : 2).map(([key, value]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text3)' }}>{key}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text2)', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {String(value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(BaseNode);


