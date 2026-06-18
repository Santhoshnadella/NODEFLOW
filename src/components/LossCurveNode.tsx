import React from 'react';
import { Handle, Position } from '@xyflow/react';

interface HistoryEntry {
  epoch: number;
  loss: number;
}

const LossCurveNode = ({ data, selected }: { data: any; selected: boolean }) => {
  const history: HistoryEntry[] = data.history || [];
  const status = data.status || 'idle';

  // Chart dimensions inside viewBox="0 0 240 120"
  const width = 240;
  const height = 120;
  const paddingLeft = 35;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 20;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  let pointsPath = '';
  let areaPath = '';
  let lastLossText = 'N/A';
  let lastEpochText = '0';

  if (history.length > 0) {
    const epochs = history.map((h) => h.epoch);
    const losses = history.map((h) => h.loss);

    const minEpoch = Math.min(...epochs);
    const maxEpoch = Math.max(...epochs);
    const minLoss = Math.min(...losses);
    const maxLoss = Math.max(...losses);

    const epochRange = maxEpoch - minEpoch || 1;
    const lossRange = maxLoss - minLoss || 1;

    // Scale function
    const getX = (epoch: number) => {
      const pct = epochRange === 0 ? 0.5 : (epoch - minEpoch) / epochRange;
      return paddingLeft + pct * chartWidth;
    };

    const getY = (loss: number) => {
      // Invert Y axis because SVG (0,0) is top-left
      const pct = lossRange === 0 ? 0.5 : (loss - minLoss) / lossRange;
      return paddingTop + (1 - pct) * chartHeight;
    };

    // Construct path points
    const points = history.map((h) => ({
      x: getX(h.epoch),
      y: getY(h.loss),
    }));

    pointsPath = `M ${points.map((p) => `${p.x} ${p.y}`).join(' L ')}`;
    areaPath = `${pointsPath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z`;

    const lastEntry = history[history.length - 1];
    lastLossText = lastEntry.loss.toFixed(4);
    lastEpochText = lastEntry.epoch.toString();
  }

  return (
    <div
      className={`relative rounded-xl border p-4 transition-all duration-300 ${
        selected
          ? 'border-indigo-500 shadow-lg shadow-indigo-500/10'
          : 'border-slate-800/80 hover:border-slate-700'
      }`}
      style={{
        width: '272px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(12px)',
        boxShadow: selected ? '0 0 20px rgba(99, 102, 241, 0.15)' : '0 10px 30px rgba(0, 0, 0, 0.3)',
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        id="in"
        style={{
          width: '8px',
          height: '8px',
          background: 'var(--accent)',
          border: '2px solid var(--bg1)',
        }}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse" />
          <span className="text-xs font-semibold tracking-wide text-slate-200 uppercase">
            Live Loss Curve
          </span>
        </div>
        <div className="px-2 py-0.5 rounded text-[10px] bg-pink-500/10 text-pink-400 border border-pink-500/20">
          Epoch: {lastEpochText}
        </div>
      </div>

      {/* Content Chart */}
      <div className="relative rounded-lg overflow-hidden bg-slate-950/60 border border-slate-900 p-1 mb-2.5">
        {history.length < 2 ? (
          <div
            className="flex items-center justify-center flex-col text-slate-500 text-xs text-center"
            style={{ height: `${height}px` }}
          >
            <span className="font-medium mb-1">Waiting for PyTorch...</span>
            <span className="text-[10px] opacity-70">Loss history will stream live here</span>
          </div>
        ) : (
          <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ec4899" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#ec4899" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line
              x1={paddingLeft}
              y1={paddingTop}
              x2={width - paddingRight}
              y2={paddingTop}
              stroke="#1e293b"
              strokeDasharray="2 2"
            />
            <line
              x1={paddingLeft}
              y1={height - paddingBottom}
              x2={width - paddingRight}
              y2={height - paddingBottom}
              stroke="#334155"
            />
            <line
              x1={paddingLeft}
              y1={paddingTop}
              x2={paddingLeft}
              y2={height - paddingBottom}
              stroke="#334155"
            />

            {/* Area under curve */}
            <path d={areaPath} fill="url(#areaGrad)" />

            {/* Curve path */}
            <path d={pointsPath} fill="none" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" />

            {/* Y Axis text label */}
            <text x={paddingLeft - 6} y={paddingTop + 4} fill="#64748b" fontSize="8" textAnchor="end">
              Max
            </text>
            <text
              x={paddingLeft - 6}
              y={height - paddingBottom + 2}
              fill="#64748b"
              fontSize="8"
              textAnchor="end"
            >
              Min
            </text>
          </svg>
        )}
      </div>

      {/* Footer Metrics */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-900 pt-2.5">
        <span>Current Loss</span>
        <span className="font-mono font-bold text-pink-400">{lastLossText}</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        id="out"
        style={{
          width: '8px',
          height: '8px',
          background: 'var(--accent)',
          border: '2px solid var(--bg1)',
        }}
      />
    </div>
  );
};

export default LossCurveNode;
