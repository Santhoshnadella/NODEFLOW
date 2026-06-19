import React from 'react';

interface StatusBarProps {
  isConnected?: boolean;
  stats?: any;
  systemInfo?: any;
  switchDevice?: (device: 'cuda' | 'mps' | 'cpu') => void;
  nodeCount: number;
  edgeCount: number;
}

const StatusBar: React.FC<StatusBarProps> = ({
  isConnected,
  stats,
  systemInfo,
  switchDevice,
  nodeCount,
  edgeCount,
}) => {
  const gpuAvailable = systemInfo?.gpu_available ?? false;
  const currentDevice = (systemInfo?.current_device || stats?.device || 'cpu').toLowerCase();
  const isGpuActive = currentDevice === 'cuda' || currentDevice === 'mps';
  const gpuName = systemInfo?.gpu_name;
  const vramUsed = stats?.vram_used ?? 0;
  const vramTotal = systemInfo?.gpu_vram_gb ?? stats?.vram_total ?? 0;
  const vramPct = vramTotal > 0 ? Math.min((vramUsed / vramTotal) * 100, 100) : 0;
  const cudaVersion = systemInfo?.cuda_version;
  const pythonVersion = systemInfo?.python_version;
  const mpsAvailable = systemInfo?.mps_available ?? false;

  // The GPU device key to toggle to (cuda or mps)
  const gpuDeviceKey: 'cuda' | 'mps' = mpsAvailable ? 'mps' : 'cuda';

  const handleToggle = () => {
    if (!gpuAvailable || !switchDevice) return;
    if (isGpuActive) {
      switchDevice('cpu');
    } else {
      switchDevice(gpuDeviceKey);
    }
  };

  const deviceLabel = isGpuActive
    ? (currentDevice === 'mps' ? 'MPS' : 'CUDA')
    : 'CPU';

  const toggleTitle = !gpuAvailable
    ? 'No GPU detected on this system'
    : isGpuActive
    ? `Switch to CPU`
    : `Switch to ${gpuDeviceKey.toUpperCase()}`;

  return (
    <footer className="status-bar" style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '0 14px',
      height: '30px',
      background: 'var(--bg2)',
      borderTop: '1px solid var(--border)',
      fontSize: '11px',
      color: 'var(--text3)',
      flexShrink: 0,
      overflow: 'hidden',
    }}>

      {/* Connection */}
      <div className="status-item" style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
        <span style={{
          width: '6px', height: '6px', borderRadius: '50%',
          background: isConnected ? '#4ade80' : '#f87171',
          boxShadow: isConnected ? '0 0 6px #4ade8088' : 'none',
          display: 'inline-block',
          flexShrink: 0,
        }} />
        {isConnected ? 'Backend Connected' : 'Backend Disconnected'}
      </div>

      <div style={{ width: '1px', height: '14px', background: 'var(--border)', flexShrink: 0 }} />

      {/* GPU / CPU Toggle Pill */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
        <span style={{ color: 'var(--text3)', fontSize: '10px', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase' }}>
          Device
        </span>
        <button
          id="device-toggle-btn"
          onClick={handleToggle}
          title={toggleTitle}
          disabled={!gpuAvailable}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0',
            background: 'var(--bg3)',
            border: `1px solid ${gpuAvailable ? (isGpuActive ? 'rgba(139,133,255,0.5)' : 'rgba(255,255,255,0.12)') : 'rgba(255,255,255,0.06)'}`,
            borderRadius: '20px',
            padding: '1px',
            cursor: gpuAvailable ? 'pointer' : 'not-allowed',
            opacity: gpuAvailable ? 1 : 0.5,
            transition: 'border-color 0.2s',
            height: '20px',
            overflow: 'hidden',
          }}
        >
          {/* CPU pill segment */}
          <span style={{
            padding: '0 8px',
            height: '16px',
            lineHeight: '16px',
            borderRadius: '14px',
            fontSize: '10px',
            fontWeight: 700,
            transition: 'background 0.2s, color 0.2s',
            background: !isGpuActive ? 'rgba(255,255,255,0.12)' : 'transparent',
            color: !isGpuActive ? '#fff' : 'var(--text3)',
          }}>
            CPU
          </span>
          {/* GPU pill segment */}
          <span style={{
            padding: '0 8px',
            height: '16px',
            lineHeight: '16px',
            borderRadius: '14px',
            fontSize: '10px',
            fontWeight: 700,
            transition: 'background 0.2s, color 0.2s',
            background: isGpuActive
              ? 'linear-gradient(90deg, var(--accent), var(--accent2))'
              : 'transparent',
            color: isGpuActive ? '#fff' : 'var(--text3)',
            boxShadow: isGpuActive ? '0 0 8px rgba(139,133,255,0.4)' : 'none',
          }}>
            {gpuAvailable ? (mpsAvailable ? 'MPS' : 'GPU') : 'GPU'}
          </span>
        </button>

        {/* Active device label */}
        <span style={{
          fontSize: '10px',
          fontWeight: 600,
          color: isGpuActive ? 'var(--accent2)' : 'var(--text3)',
          letterSpacing: '0.4px',
          textTransform: 'uppercase',
          minWidth: '30px',
        }}>
          {deviceLabel}
        </span>
      </div>

      {/* GPU Name */}
      {gpuAvailable && gpuName && (
        <>
          <div style={{ width: '1px', height: '14px', background: 'var(--border)', flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0, maxWidth: '160px', overflow: 'hidden' }}>
            <span style={{ fontSize: '10px', color: 'var(--text3)' }}>
              🎮
            </span>
            <span style={{
              fontSize: '10px',
              color: isGpuActive ? '#c4b5fd' : 'var(--text3)',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {gpuName}
            </span>
          </div>
        </>
      )}

      {/* VRAM Bar */}
      {gpuAvailable && vramTotal > 0 && (
        <>
          <div style={{ width: '1px', height: '14px', background: 'var(--border)', flexShrink: 0 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexShrink: 0 }}>
            <span style={{ fontSize: '10px', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
              VRAM {vramUsed.toFixed(1)}/{vramTotal}GB
            </span>
            <div style={{
              width: '50px', height: '4px', background: 'var(--bg4)',
              borderRadius: '2px', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%',
                width: `${vramPct}%`,
                background: vramPct > 85
                  ? 'linear-gradient(90deg, #f87171, #ef4444)'
                  : vramPct > 60
                  ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                  : 'linear-gradient(90deg, var(--accent), var(--accent2))',
                borderRadius: '2px',
                transition: 'width 0.4s ease',
              }} />
            </div>
          </div>
        </>
      )}

      {/* CUDA Version */}
      {cudaVersion && (
        <>
          <div style={{ width: '1px', height: '14px', background: 'var(--border)', flexShrink: 0 }} />
          <span style={{ fontSize: '10px', color: 'var(--text3)', flexShrink: 0 }}>
            CUDA {cudaVersion}
          </span>
        </>
      )}

      {/* Python Version */}
      {pythonVersion && (
        <>
          <div style={{ width: '1px', height: '14px', background: 'var(--border)', flexShrink: 0 }} />
          <span style={{ fontSize: '10px', color: 'var(--text3)', flexShrink: 0 }}>
            🐍 Python {pythonVersion}
          </span>
        </>
      )}

      <div style={{ width: '1px', height: '14px', background: 'var(--border)', flexShrink: 0 }} />

      {/* Node / Edge count */}
      <div style={{ flexShrink: 0 }}>
        Nodes: <span style={{ color: 'var(--text2)' }}>{nodeCount}</span>
        {' · '}
        Edges: <span style={{ color: 'var(--text2)' }}>{edgeCount}</span>
      </div>

      {/* Version */}
      <div style={{ marginLeft: 'auto', flexShrink: 0, color: 'var(--text3)', fontSize: '10px' }}>
        NodeFlow v1.0.0
      </div>
    </footer>
  );
};

export default StatusBar;
