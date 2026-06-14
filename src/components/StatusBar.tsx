import React from 'react';

interface StatusBarProps {
  isConnected?: boolean;
  stats?: any;
  nodeCount: number;
  edgeCount: number;
}

const StatusBar: React.FC<StatusBarProps> = ({ isConnected, stats, nodeCount, edgeCount }) => {
  return (
    <footer className="status-bar">
      <div className="status-item">
        <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></span>
        {isConnected ? 'Backend Connected' : 'Backend Disconnected'}
      </div>
      <div className="status-item">Device: {stats?.device || 'CPU'}</div>
      <div className="status-item">
        VRAM: {stats?.vram_used || '0.0'}GB / {stats?.vram_total || '8'}GB
      </div>
      <div className="status-item">Nodes: {nodeCount} · Edges: {edgeCount}</div>
      <div className="status-item" style={{ marginLeft: 'auto' }}>NodeFlow v1.0.0</div>
    </footer>
  );
};

export default StatusBar;


