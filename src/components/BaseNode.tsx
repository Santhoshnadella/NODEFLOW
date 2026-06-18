import React, { useState } from 'react';
import { Handle, Position, useReactFlow } from '@xyflow/react';

const BaseNode = ({ id, data, selected }: { id: string, data: any, selected: boolean }) => {
  const { setNodes } = useReactFlow();

  const handleParameterChange = (key: string, val: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              parameters: {
                ...(node.data.parameters || {}),
                [key]: val,
              },
            },
          };
        }
        return node;
      })
    );
  };

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

  const [validationHovered, setValidationHovered] = useState(false);

  const status = data.status || 'idle';
  const result = data.result;
  const color = getCategoryColor();

  // Extract validation metadata from result
  const validation = result?.validation;
  const hasWarning = validation && (
    Object.values(validation.missing_values || {}).some((v: any) => v > 0) ||
    (validation.rows === 0)
  );
  const totalMissing = validation
    ? Object.values(validation.missing_values || {}).reduce((a: number, b: any) => a + (b as number), 0)
    : 0;

  const renderEditableParam = (key: string, value: any) => {
    // Determine input type
    const isBool = typeof value === 'boolean';
    const keyLower = key.toLowerCase();

    // Select lists
    let opts: string[] | null = null;
    if (key === 'lr') opts = ['1e-4', '1e-3', '3e-3', '1e-2'];
    else if (key === 'optimizer') opts = ['SGD', 'Adam', 'AdamW', 'Lion'];
    else if (key === 'scheduler') opts = ['None', 'StepLR', 'CosineAnnealing', 'OneCycle'];
    else if (key === 'operation') {
      if (data.category === 'math') opts = ['add', 'subtract', 'multiply', 'divide', 'power', 'log', 'exp', 'sqrt', 'abs', 'clamp', 'dot_product', 'cross_product', 'magnitude', 'cosine_similarity', 'multiply_matrix', 'transpose', 'inverse', 'determinant', 'eigenvalues', 'mean', 'median', 'mode', 'std_dev', 'variance', 'skewness', 'kurtosis', 'covariance', 'histogram'];
      else opts = ['dot_product', 'normalize', 'magnitude'];
    } else if (key === 'variant') opts = ['resnet18', 'resnet34', 'resnet50', 'resnet101'];
    else if (key === 'metrics') opts = ['accuracy', 'f1', 'acc+f1', 'full_report'];

    if (isBool) {
      return (
        <label className="param-toggle" style={{ position: 'relative', width: '28px', height: '15px', display: 'block' }} onClick={e => e.stopPropagation()}>
          <input 
            type="checkbox" 
            checked={!!value} 
            style={{ opacity: 0, width: 0, height: 0 }}
            onChange={(e) => handleParameterChange(key, e.target.checked)} 
          />
          <div className="param-toggle-track" style={{
            position: 'absolute', inset: 0, background: value ? 'var(--accent)' : 'var(--bg4)', 
            borderRadius: '8px', cursor: 'pointer', transition: 'background 0.2s'
          }}>
            <div style={{
              position: 'absolute', left: '2px', top: '2px', width: '11px', height: '11px',
              borderRadius: '50%', background: 'white', transition: 'transform 0.2s',
              transform: value ? 'translateX(13px)' : 'none'
            }} />
          </div>
        </label>
      );
    }

    if (opts) {
      return (
        <select 
          className="param-select" 
          value={String(value)}
          style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', background: 'var(--bg4)', border: '1px solid var(--border)', color: 'var(--text2)', padding: '2px 4px', borderRadius: '3px', outline: 'none' }}
          onClick={e => e.stopPropagation()}
          onChange={(e) => handleParameterChange(key, e.target.value)}
        >
          {opts.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      );
    }

    if (typeof value === 'number') {
      let min = 0;
      let max = 100;
      let step = 1;
      if (key === 'epochs') { min = 1; max = 100; }
      else if (key === 'batch_size') { min = 1; max = 128; }
      else if (key === 'train_ratio') { min = 0.5; max = 0.95; step = 0.05; }
      else if (key === 'n_samples') { min = 10; max = 2000; step = 10; }
      else if (key === 'noise') { min = 0; max = 1; step = 0.05; }
      else if (key === 'epsilon') { min = 1e-6; max = 1e-3; step = 1e-6; }

      const useSlider = key === 'epochs' || key === 'batch_size' || key === 'train_ratio' || key === 'n_samples' || key === 'noise';

      if (useSlider) {
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={e => e.stopPropagation()}>
            <input 
              type="range" 
              min={min} 
              max={max} 
              step={step} 
              value={value} 
              style={{ width: '60px', height: '3px', accentColor: 'var(--accent)', cursor: 'pointer' }}
              onChange={(e) => handleParameterChange(key, Number(e.target.value))}
            />
            <span style={{ fontSize: '9px', fontFamily: 'var(--font-mono)', color: 'var(--text2)' }}>{value}</span>
          </div>
        );
      }

      return (
        <input 
          type="number" 
          value={value} 
          style={{ width: '50px', background: 'var(--bg4)', border: '1px solid var(--border)', color: 'white', fontSize: '9px', padding: '2px 4px', borderRadius: '3px' }}
          onClick={e => e.stopPropagation()}
          onChange={(e) => handleParameterChange(key, Number(e.target.value))}
        />
      );
    }

    return (
      <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }} onClick={e => e.stopPropagation()}>
        <input 
          type="text" 
          value={String(value)} 
          style={{ width: '70px', background: 'var(--bg4)', border: '1px solid var(--border)', color: 'white', fontSize: '9px', padding: '2px 4px', borderRadius: '3px' }}
          onChange={(e) => handleParameterChange(key, e.target.value)}
        />
        {keyLower.includes('path') && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              const input = document.createElement('input');
              input.type = 'file';
              input.onchange = (evt: any) => {
                const file = evt.target.files[0];
                if (file) handleParameterChange(key, file.path || file.name);
              };
              input.click();
            }}
            style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '3px', color: 'white', padding: '2px 4px', cursor: 'pointer', fontSize: '8px' }}
          >
            📂
          </button>
        )}
      </div>
    );
  };

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
      {validation && (
        <div
          style={{ position: 'relative' }}
          onMouseEnter={() => setValidationHovered(true)}
          onMouseLeave={() => setValidationHovered(false)}
        >
          {/* Validation badge strip */}
          <div style={{
            margin: '4px 8px 0',
            padding: '3px 8px',
            borderRadius: '5px',
            background: hasWarning ? 'rgba(245,158,11,0.15)' : 'rgba(74,222,128,0.1)',
            border: `1px solid ${hasWarning ? 'rgba(245,158,11,0.4)' : 'rgba(74,222,128,0.3)'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'default',
            fontSize: '9px',
            fontFamily: 'var(--font-mono)',
          }}>
            <span style={{ fontSize: '11px' }}>{hasWarning ? '⚠️' : '✅'}</span>
            <span style={{ color: hasWarning ? 'var(--amber)' : 'var(--green)' }}>
              {validation.rows} rows · {validation.cols?.length || 0} cols
              {hasWarning && totalMissing > 0 ? ` · ${totalMissing} NaN` : ''}
            </span>
          </div>

          {/* Stats hover tooltip */}
          {validationHovered && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '8px',
              zIndex: 9999,
              background: 'var(--bg4)',
              border: '1px solid var(--border2)',
              borderRadius: '8px',
              padding: '10px 12px',
              minWidth: '200px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
              fontSize: '10px',
              fontFamily: 'var(--font-mono)',
              pointerEvents: 'none',
            }}>
              <div style={{ color: 'var(--accent2)', fontWeight: 700, marginBottom: '8px', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '1px' }}>Dataset Stats</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 12px' }}>
                <div style={{ color: 'var(--text3)' }}>Rows</div>
                <div style={{ color: 'var(--text)' }}>{validation.rows}</div>
                <div style={{ color: 'var(--text3)' }}>Columns</div>
                <div style={{ color: 'var(--text)' }}>{validation.cols?.length || 0}</div>
                <div style={{ color: 'var(--text3)' }}>Numeric</div>
                <div style={{ color: 'var(--blue)' }}>{validation.numeric_columns?.length || 0}</div>
                <div style={{ color: 'var(--text3)' }}>Categorical</div>
                <div style={{ color: 'var(--pink)' }}>{validation.categorical_columns?.length || 0}</div>
                {totalMissing > 0 && (
                  <>
                    <div style={{ color: 'var(--text3)' }}>Missing</div>
                    <div style={{ color: 'var(--amber)' }}>{totalMissing} NaN</div>
                  </>
                )}
              </div>
              {hasWarning && totalMissing > 0 && (
                <div style={{ marginTop: '8px', padding: '5px 6px', background: 'var(--amber-dim)', borderRadius: '4px', color: 'var(--amber)', fontSize: '9px' }}>
                  ⚠️ Missing values detected — consider imputation
                </div>
              )}
              {validation.rows === 0 && (
                <div style={{ marginTop: '8px', padding: '5px 6px', background: 'var(--coral-dim)', borderRadius: '4px', color: 'var(--coral)', fontSize: '9px' }}>
                  🚫 Empty dataset — check file path
                </div>
              )}
            </div>
          )}
        </div>
      )}

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
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--text3)' }}>{key}</span>
              {renderEditableParam(key, value)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default React.memo(BaseNode);


