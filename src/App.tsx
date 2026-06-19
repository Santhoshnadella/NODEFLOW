import React, { useState, useCallback, useEffect } from 'react';
import {
  ReactFlow,
  addEdge,
  Controls,
  Connection,
  Edge,
  Node,
  useNodesState,
  useEdgesState,
  MiniMap,
  Background,
  BackgroundVariant
} from '@xyflow/react';
import { Database, Sparkles, Box, GraduationCap, Activity } from 'lucide-react';
import '@xyflow/react/dist/style.css';

import NodeLibrary from './components/NodeLibrary';
import BaseNode from './components/BaseNode';
import ChatNode from './components/ChatNode';
import Inspector from './components/Inspector';
import StatusBar from './components/StatusBar';
import ContextMenu from './components/ContextMenu';
import ErrorBoundary from './components/ErrorBoundary';
import NodeBuilder from './components/NodeBuilder';
import { useBackend } from './hooks/useBackend';
import { PREMADE_PIPELINES } from './data/premadePipelines';
import { NODE_TEMPLATES } from './data/nodeTemplates';
import { DEEP_DIVE_CONTENT } from './data/deepDiveContent';
import LossCurveNode from './components/LossCurveNode';
import './styles/App.css';

const nodeTypes = {
  baseNode: BaseNode,
  chatNode: ChatNode,
  lossCurveNode: LossCurveNode,
};

const initialNodes: Node<any>[] = [];
const initialEdges: Edge[] = [];

const App = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [kidMode, setKidMode] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showNodeBuilder, setShowNodeBuilder] = useState(false);
  const [telemetryEnabled, setTelemetryEnabled] = useState(false);
  const [communityPipelines, setCommunityPipelines] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [selectedMode, setSelectedMode] = useState('dev');
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; data: any }>({
    visible: false,
    x: 0,
    y: 0,
    data: null,
  });
  
  const { 
    runPipeline, stopPipeline, isRunning, progress, stats, systemInfo, switchDevice,
    nodeStatuses, nodeResults, chatHistories, generatedPipelineId, runHistory, clearHistory, isConnected, sendMessage, sendChatMessage, profilerStats,
    modelScanResults, modelDownloadProgress
  } = useBackend();

  const loadPipeline = useCallback((templateId: string) => {
    let pipeline = PREMADE_PIPELINES.find((p) => p.id === templateId);
    if (!pipeline) {
      pipeline = communityPipelines.find((p) => p.id === templateId);
    }
    if (!pipeline) return;

    if (telemetryEnabled) {
      console.log(`[Telemetry] Loaded pipeline template: ${templateId}`);
    }

    // Apply kidMode to each node's data and merge with official template data
    const nodesWithMode = pipeline.nodes.map(node => {
      const officialTemplate = NODE_TEMPLATES.find(t => t.label === node.data.label);
      return {
        ...node,
        data: {
          ...(officialTemplate?.data || {}),
          ...node.data,
          kidMode
        }
      };
    });

    setNodes(nodesWithMode);
    setEdges(pipeline.edges);
    setShowTemplates(false);
  }, [setNodes, setEdges, kidMode, communityPipelines, telemetryEnabled]);

  useEffect(() => {
    if (generatedPipelineId) {
      loadPipeline(generatedPipelineId);
    }
  }, [generatedPipelineId, loadPipeline]);

  // Sync node statuses, results and chat histories into the nodes state
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          status: nodeStatuses[node.id] || 'idle',
          result: nodeResults[node.id] || null,
          chatHistory: chatHistories[node.id] || node.data.chatHistory || [],
          onSendMessage: (content: string) => sendChatMessage(node.id, content),
          stats: node.data.label === 'Loss Curve Chart' ? stats : node.data.stats,
          history: node.type === 'lossCurveNode' ? (stats?.history || []) : (node.data.history || []),
        },
      }))
    );
  }, [nodeStatuses, nodeResults, chatHistories, stats, setNodes, sendChatMessage]);

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const isValidConnection = useCallback(
    (connection: any) => {
      const sourceNode = nodes.find(n => n.id === connection.source);
      const targetNode = nodes.find(n => n.id === connection.target);
      const sourcePort = sourceNode?.data.outputs?.find((o: any) => o.id === connection.sourceHandle);
      const targetPort = targetNode?.data.inputs?.find((i: any) => i.id === connection.targetHandle);
      // Allow connection if ports are missing definitions or either side is 'any'
      if (!sourcePort || !targetPort) return true;
      if (sourcePort.type === 'any' || targetPort.type === 'any') return true;
      return sourcePort.type === targetPort.type;
    },
    [nodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const type = event.dataTransfer.getData('application/reactflow');
      const templateStr = event.dataTransfer.getData('application/nodeflow-template');
      
      if (!type || !templateStr) return;

      const template = JSON.parse(templateStr);
      const position = { x: event.clientX - 300, y: event.clientY - 100 };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: { ...template, kidMode },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [setNodes, kidMode]
  );

  const onPaneContextMenu = useCallback(
    (event: any) => {
      event.preventDefault();
      setMenu({ x: event.clientX, y: event.clientY });
    },
    [setMenu]
  );

  const addNodeAtPos = useCallback((template: any) => {
    if (!menu) return;
    const newNode: Node = {
      id: `${template.type}-${Date.now()}`,
      type: template.type,
      position: { x: menu.x - 300, y: menu.y - 100 },
      data: { ...template.data, kidMode },
    };
    setNodes((nds) => nds.concat(newNode));
    setMenu(null);
  }, [menu, setNodes, kidMode]);



  const onNodeMouseEnter = useCallback((event: React.MouseEvent, node: Node) => {
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.right + 10,
      y: rect.top,
      data: node.data,
    });
  }, []);

  const onNodeMouseLeave = useCallback(() => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  }, []);

  const onParameterChange = useCallback((nodeId: string, key: string, value: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              parameters: {
                ...node.data.parameters,
                [key]: value,
              },
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const [aiRequirement, setAiRequirement] = useState('');
  const [showModelManager, setShowModelManager] = useState(false);
  const [showDeepDive, setShowDeepDive] = useState<any>(null);
  const [errorDiagnosis, setErrorDiagnosis] = useState<string | null>(null);

  const syncCommunityTemplates = async () => {
    setIsSyncing(true);
    try {
      await new Promise(r => setTimeout(r, 1500)); // Simulate network request
      const mockGitHubData = [
        {
          id: 'github-stable-diffusion',
          title: 'Stable Diffusion LoRA (Community)',
          description: 'Community contributed SD fine-tuning pipeline.',
          nodes: [
            { id: '1', type: 'baseNode', position: {x: 0, y: 0}, data: { label: 'Stable Diffusion', category: 'gen', parameters: {} } }
          ],
          edges: []
        }
      ];
      setCommunityPipelines(mockGitHubData);
      if (telemetryEnabled) {
         console.log("[Telemetry] Synced community templates from GitHub registry");
      }
    } catch (err) {
      console.error("Failed to sync", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const generatePipelineFromAI = () => {
    if (!aiRequirement.trim()) return;
    sendMessage({ type: 'generate_pipeline', prompt: aiRequirement });
    setAiRequirement('');
  };

  const startApp = (mode: string) => {
    setSelectedMode(mode);
    setKidMode(mode === 'kid');
    setShowWelcome(false);
    setOnboardingStep(1);
  };

  const savePipeline = () => {
    const data = JSON.stringify({ version: '2.0.0', selectedMode, kidMode, nodes, edges }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pipeline-${Date.now()}.nodeflow`;
    a.click();
  };

  const loadPipelineFromFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        let loadedNodes = parsed.nodes || [];
        let loadedEdges = parsed.edges || [];
        const version = parsed.version || '1.0.0';
        
        const modeToLoad = parsed.selectedMode || 'dev';
        const isKid = parsed.kidMode !== undefined ? parsed.kidMode : modeToLoad === 'kid';
        
        setSelectedMode(modeToLoad);
        setKidMode(isKid);
        
        // Ensure nodes have correct mode state
        loadedNodes = loadedNodes.map((n: any) => ({
          ...n,
          data: { ...n.data, kidMode: isKid, selectedMode: modeToLoad }
        }));

        // Migration logic
        if (version === '1.0.0') {
          console.log('Migrating pipeline from v1 to v2');
          loadedNodes = loadedNodes.map((n: any) => ({
            ...n,
            data: { ...n.data, schemaVersion: '2.0.0' }
          }));
        }

        setNodes(loadedNodes);
        setEdges(loadedEdges);
      } catch (err) {
        console.error('Failed to load pipeline:', err);
        alert('Invalid .nodeflow file');
      }
    };
    reader.readAsText(file);
  };

  const exportToPython = () => {
    if (telemetryEnabled) {
      console.log(`[Telemetry] Exported pipeline to Python. Node count: ${nodes.length}`);
    }

    // 1. Calculate Adjacency and Indegrees
    const adj: Record<string, string[]> = {};
    const inDegree: Record<string, number> = {};
    nodes.forEach(n => {
      adj[n.id] = [];
      inDegree[n.id] = 0;
    });

    edges.forEach(e => {
      adj[e.source]?.push(e.target);
      inDegree[e.target] = (inDegree[e.target] || 0) + 1;
    });

    // 2. Topological Sort (Kahn's Algorithm)
    const queue: string[] = [];
    nodes.forEach(n => {
      if (inDegree[n.id] === 0) {
        queue.push(n.id);
      }
    });

    const orderedNodeIds: string[] = [];
    while (queue.length > 0) {
      const u = queue.shift()!;
      orderedNodeIds.push(u);
      (adj[u] || []).forEach(v => {
        inDegree[v]--;
        if (inDegree[v] === 0) {
          queue.push(v);
        }
      });
    }

    if (orderedNodeIds.length < nodes.length) {
      alert("Cycle detected or disconnected components in pipeline! Cannot export to Python.");
      return;
    }

    // 3. Setup Python Script Header
    let script = `# --- Generated by NodeFlow ---
# Run: pip install pandas numpy torch scikit-learn diffusers transformers ultralytics xgboost

import pandas as pd
import numpy as np
import torch
import os

# Intermediate Variable Caches
`;

    // Map to find where an input port gets its value
    const getConnectedVar = (targetNodeId: string, portId: string): string => {
      const edge = edges.find(e => e.target === targetNodeId && e.targetHandle === portId);
      if (edge) {
        const cleanSrcId = edge.source.replace(/[^a-zA-Z0-9]/g, '_');
        return `var_${cleanSrcId}_${edge.sourceHandle || 'out'}`;
      }
      return 'None';
    };

    // 4. Generate Code for each Node in Topological Order
    orderedNodeIds.forEach(nodeId => {
      const node = nodes.find(n => n.id === nodeId)!;
      const cleanId = node.id.replace(/[^a-zA-Z0-9]/g, '_');
      const label = node.data.label;
      const params = node.data.parameters || {};

      script += `\n# --- Node: ${label} (${node.id}) ---\n`;

      if (label === 'Load CSV') {
        const filePath = params.filePath || 'data.csv';
        script += `var_${cleanId}_df = pd.read_csv("${filePath}")\n`;
      } 
      else if (label === 'Synthetic Data') {
        const samples = params.n_samples || 100;
        const noise = params.noise || 0.1;
        script += `from sklearn.datasets import make_regression
X, y = make_regression(n_samples=${samples}, noise=${noise}, random_state=42)
var_${cleanId}_df = pd.DataFrame(X)
var_${cleanId}_df['target'] = y
`;
      }
      else if (label === 'Normalize') {
        const inputDf = getConnectedVar(node.id, 'in');
        script += `var_${cleanId}_df = (${inputDf} - ${inputDf}.min()) / (${inputDf}.max() - ${inputDf}.min())\n`;
      }
      else if (label === 'Split Data') {
        const inputDf = getConnectedVar(node.id, 'in');
        const ratio = params.train_ratio || 0.8;
        const seed = params.seed || 42;
        script += `from sklearn.model_selection import train_test_split
var_${cleanId}_train, var_${cleanId}_test = train_test_split(${inputDf}, train_size=${ratio}, random_state=${seed})
`;
      }
      else if (label === 'Linear Regression') {
        const trainDf = getConnectedVar(node.id, 'train') || getConnectedVar(node.id, 'in');
        const testDf = getConnectedVar(node.id, 'test') || getConnectedVar(node.id, 'in');
        script += `from sklearn.linear_model import LinearRegression
X_train, y_train = ${trainDf}.iloc[:, :-1], ${trainDf}.iloc[:, -1]
X_test, y_test = ${testDf}.iloc[:, :-1], ${testDf}.iloc[:, -1]
var_${cleanId}_model = LinearRegression().fit(X_train, y_train)
print("Linear Regression Trained. Test Score:", var_${cleanId}_model.score(X_test, y_test))
`;
      }
      else if (label === 'Random Forest') {
        const trainDf = getConnectedVar(node.id, 'train') || getConnectedVar(node.id, 'in');
        const testDf = getConnectedVar(node.id, 'test') || getConnectedVar(node.id, 'in');
        script += `from sklearn.ensemble import RandomForestRegressor
X_train, y_train = ${trainDf}.iloc[:, :-1], ${trainDf}.iloc[:, -1]
X_test, y_test = ${testDf}.iloc[:, :-1], ${testDf}.iloc[:, -1]
var_${cleanId}_model = RandomForestRegressor(n_estimators=100, random_state=42).fit(X_train, y_train)
print("Random Forest Trained. Test Score:", var_${cleanId}_model.score(X_test, y_test))
`;
      }
      else if (label === 'XGBoost') {
        const trainDf = getConnectedVar(node.id, 'train') || getConnectedVar(node.id, 'in');
        const testDf = getConnectedVar(node.id, 'test') || getConnectedVar(node.id, 'in');
        script += `from xgboost import XGBRegressor
X_train, y_train = ${trainDf}.iloc[:, :-1], ${trainDf}.iloc[:, -1]
X_test, y_test = ${testDf}.iloc[:, :-1], ${testDf}.iloc[:, -1]
var_${cleanId}_model = XGBRegressor().fit(X_train, y_train)
print("XGBoost Trained. Test Score:", var_${cleanId}_model.score(X_test, y_test))
`;
      }
      else if (label === 'Vector Ops') {
        const vecA = getConnectedVar(node.id, 'a');
        const vecB = getConnectedVar(node.id, 'b');
        const op = params.operation || 'dot_product';
        script += `var_${cleanId}_out = np.dot(${vecA}, ${vecB}) if "${op}" == "dot_product" else np.cross(${vecA}, ${vecB})\n`;
      }
      else if (label === 'Add') {
        const a = getConnectedVar(node.id, 'a');
        const b = getConnectedVar(node.id, 'b');
        script += `var_${cleanId}_out = ${a} + ${b}\n`;
      }
      else if (label === 'Multiply') {
        const a = getConnectedVar(node.id, 'a');
        const b = getConnectedVar(node.id, 'b');
        script += `var_${cleanId}_out = ${a} * ${b}\n`;
      }
      else if (label === 'Stable Diffusion') {
        const prompt = params.prompt || 'A beautiful futuristic coding platform';
        script += `from diffusers import StableDiffusionPipeline
pipe = StableDiffusionPipeline.from_pretrained("runwayml/stable-diffusion-v1-5", torch_dtype=torch.float16)
if torch.cuda.is_available():
    pipe.to("cuda")
var_${cleanId}_out = pipe("${prompt}").images[0]
var_${cleanId}_out.save("output_sd_${cleanId}.png")
print("Stable Diffusion Image Saved as output_sd_${cleanId}.png")
`;
      }
      else if (label === 'YOLOv8') {
        script += `from ultralytics import YOLO
model = YOLO("yolov8n.pt")
var_${cleanId}_out = model("image.jpg")
print("YOLOv8 inference run completed.")
`;
      }
      else {
        // Fallback for visual nodes and other templates
        script += `# Executed live on backend; no equivalent standalone code template.
var_${cleanId}_out = None
print("Ran Node: ${label}")
`;
      }
    });

    const blob = new Blob([script], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'pipeline.py';
    a.click();
  };

  if (showWelcome) {
    return (
      <div className="welcome">
        <div className="welcome-logo"><div className="welcome-logo-dot" />NodeFlow</div>
        <p style={{ fontSize: '16px', color: '#8b90a8', textAlign: 'center', maxWidth: '480px', lineHeight: '1.6' }}>
          Build <span style={{ color: '#8b85ff', fontWeight: 600 }}>AI · ML · DL · NLP · CV · GenAI</span> pipelines visually.<br />
          No code required. 100% local. Runs on your machine.
        </p>
        <div className="welcome-modes">
          <div className="welcome-mode" onClick={() => startApp('kid')}>
            <div className="welcome-mode-icon">🧒</div>
            <div className="welcome-mode-title">Kid Mode</div>
            <div className="welcome-mode-sub">Grade 4–10<br />Guided & fun</div>
          </div>
          <div className="welcome-mode" onClick={() => startApp('student')}>
            <div className="welcome-mode-icon">🎓</div>
            <div className="welcome-mode-title">Student</div>
            <div className="welcome-mode-sub">Learn the concepts<br />Light math</div>
          </div>
          <div className="welcome-mode" onClick={() => startApp('dev')}>
            <div className="welcome-mode-icon">⚡</div>
            <div className="welcome-mode-title">Developer</div>
            <div className="welcome-mode-sub">Full control<br />All parameters</div>
          </div>
        </div>
        <div style={{ marginTop: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
          <button className="tb-btn primary" style={{ padding: '14px 40px', fontSize: '14px' }} onClick={() => startApp('dev')}>
            Open Platform →
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text3)', fontSize: '12px' }}>
            <input 
              type="checkbox" 
              id="telemetry" 
              checked={telemetryEnabled} 
              onChange={(e) => setTelemetryEnabled(e.target.checked)} 
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="telemetry" style={{ cursor: 'pointer' }}>Opt-in to anonymous telemetry to help improve NodeFlow</label>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {showNodeBuilder && (
        <NodeBuilder 
          onClose={() => setShowNodeBuilder(false)} 
          onSave={(nodeDef) => {
            console.log('Saved custom node:', nodeDef);
            // In a real app, this would be saved to a database or local storage
            // and appended to the NODE_TEMPLATES array dynamically.
            setShowNodeBuilder(false);
          }} 
        />
      )}
      <div className="nodeflow-app">
      <header className="app-header">
        <div className="topbar-left">
          <div className="logo">
            <div className="logo-dot" />
            NodeFlow
          </div>
          <div className="divider" />
          <button className="top-btn" onClick={() => setShowTemplates(true)}>
            <Box size={14} /> Templates
          </button>
          <button className="top-btn" onClick={() => setShowModelManager(true)}>
            <Database size={14} /> Models
          </button>
                    <button className="top-btn" onClick={() => setShowNodeBuilder(true)}>
            <Box size={14} /> Node Builder
          </button>
          <button className="top-btn" onClick={() => setShowHistory(true)}>
            <Activity size={14} /> History
          </button>
        </div>

        <div className="ai-requirement-bar">
          <Sparkles size={14} className="sparkle-icon" />
          <input 
            type="text" 
            placeholder="Describe your AI project (e.g., 'Detect cats in a video' or 'Build a chat bot')..." 
            value={aiRequirement}
            onChange={(e) => setAiRequirement(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && generatePipelineFromAI()}
          />
          <button className="ai-gen-btn" onClick={generatePipelineFromAI}>Generate</button>
        </div>

        <div className="topbar-right">
          <button className={`tb-btn run ${isRunning ? 'danger' : ''}`} onClick={isRunning ? stopPipeline : () => {
            if (telemetryEnabled) console.log(`[Telemetry] Running pipeline with ${nodes.length} nodes and ${edges.length} edges.`);
            runPipeline(nodes, edges);
          }}>
            {isRunning ? '■ Stop' : '▶ Run'}
          </button>
          <button className="tb-btn" onClick={savePipeline}>Save</button>
          <label className="tb-btn" style={{ cursor: 'pointer' }}>
            Load
            <input type="file" accept=".nodeflow" onChange={loadPipelineFromFile} style={{ display: 'none' }} />
          </label>
          <button className="tb-btn" onClick={exportToPython}>Export</button>
                    <select 
            className="tb-btn" 
            value={selectedMode} 
            onChange={(e) => {
              const mode = e.target.value;
              setSelectedMode(mode);
              setKidMode(mode === 'kid');
              setNodes(nds => nds.map(node => ({
                ...node,
                data: { ...node.data, kidMode: mode === 'kid', selectedMode: mode }
              })));
            }}
            style={{ appearance: 'none', background: 'var(--bg2)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 8px', cursor: 'pointer' }}
          >
            <option value="kid">Kid Mode</option>
            <option value="student">Student Mode</option>
            <option value="dev">Dev Mode</option>
          </select>
        </div>
      </header>

      <NodeLibrary />

      <main className="canvas-area" style={{ position: 'relative', height: '100%' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            isValidConnection={isValidConnection}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onNodeMouseEnter={onNodeMouseEnter}
            onNodeMouseLeave={onNodeMouseLeave}
            onPaneContextMenu={onPaneContextMenu}
            onPaneClick={() => setMenu(null)}
            nodeTypes={nodeTypes}
            fitView
            style={{ background: 'var(--bg1)' }}
          >
            <Background color="var(--border)" variant={BackgroundVariant.Dots} gap={20} size={1} />
            <MiniMap 
              style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: '8px' }}
              nodeColor={(n) => (n.data.category === 'cv' ? 'var(--cv)' : 'var(--accent)')}
              maskColor="rgba(0,0,0,0.3)"
            />
            <Controls />
          </ReactFlow>

          {!isConnected && (
            <div className="connection-overlay">
              <div className="loader"></div>
              <p>Connecting to Python Engine...</p>
            </div>
          )}

        {tooltip.visible && tooltip.data && (
          <div 
            className="tooltip visible" 
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="tt-name">{tooltip.data.label}</div>
            <div className="tt-summary">{tooltip.data.explanation?.what || "Advanced AI processing node."}</div>
            
            <div className="tt-section">How it works</div>
            <div className="tt-summary">{tooltip.data.explanation?.how || "Processes inputs through optimized local engines."}</div>
            
            <div className="tt-section">What it gives</div>
            <div className="tt-summary">{tooltip.data.explanation?.gives || "Refined data output."}</div>

            <div className="tt-section">Child Analogy 🧒</div>
            <div className="tt-analogy">
              {tooltip.data.explanation?.analogy || "Like a smart robot helping you with your tasks!"}
            </div>
          </div>
        )}

        {showTemplates && (
          <div className="template-gallery" style={{ 
            position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.85)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center' 
          }}>
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border2)', borderRadius: '16px', width: '800px', maxHeight: '80vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'white' }}>Template Library</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="tb-btn" onClick={syncCommunityTemplates} disabled={isSyncing}>
                    {isSyncing ? 'Syncing...' : 'Sync GitHub Registry'}
                  </button>
                  <button onClick={() => setShowTemplates(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text3)', fontSize: '18px', cursor: 'pointer' }}>✕</button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', padding: '20px 24px', overflowY: 'auto' }}>
                {[...communityPipelines, ...PREMADE_PIPELINES].map((t) => (
                  <div key={t.id} className="tg-card" style={{ background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '16px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'white', marginBottom: '8px' }}>{t.title}</div>
                    <div style={{ fontSize: '10px', color: 'var(--text3)', lineHeight: '1.5', marginBottom: '8px' }}>{t.description}</div>
                    <button className="tg-load-btn" onClick={() => loadPipeline(t.id)} style={{ width: '100%', padding: '7px', background: 'var(--bg4)', border: '1px solid var(--border)', borderRadius: 'var(--r-sm)', color: 'white', cursor: 'pointer' }}>Load template →</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <StatusBar 
          isConnected={isConnected} 
          stats={stats}
          systemInfo={systemInfo}
          switchDevice={switchDevice}
          nodeCount={nodes.length} 
          edgeCount={edges.length} 
        />
      </main>

      <Inspector 
        selectedNode={nodes.find(n => n.selected) || null} 
        onParameterChange={onParameterChange}
        onShowDeepDive={(node) => setShowDeepDive(node)}
      />

      {menu && (
        <ContextMenu 
          x={menu.x} 
          y={menu.y} 
          onAddNode={addNodeAtPos} 
          onClose={() => setMenu(null)} 
        />
      )}
      {/* Modals */}
      {onboardingStep > 0 && (
        <div className="onboarding-overlay" style={{
          position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="onboarding-modal" style={{
            background: 'var(--bg2)', border: '1px solid var(--accent)', borderRadius: '12px', padding: '24px', width: '400px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: 'white' }}>Create your first pipeline</h3>
              <span style={{ fontSize: '12px', color: 'var(--text3)' }}>Step {onboardingStep} of 3</span>
            </div>
            
            {onboardingStep === 1 && <p style={{ color: 'var(--text2)', lineHeight: '1.5' }}>Welcome to NodeFlow! Let's get started. You can build pipelines by dragging nodes from the library on the left.</p>}
            {onboardingStep === 2 && <p style={{ color: 'var(--text2)', lineHeight: '1.5' }}>Don't want to build from scratch? Click <strong>Templates</strong> in the top bar or use the AI generator to load a pre-made pipeline.</p>}
            {onboardingStep === 3 && <p style={{ color: 'var(--text2)', lineHeight: '1.5' }}>Once your pipeline is ready, click <strong>▶ Run</strong> in the top right to execute it. Happy building!</p>}
            
            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              {onboardingStep < 3 ? (
                 <button className="tb-btn primary" onClick={() => setOnboardingStep(prev => prev + 1)}>Next →</button>
              ) : (
                 <button className="tb-btn primary" onClick={() => setOnboardingStep(0)}>Get Started</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showDeepDive && (
        <div className="modal-overlay" onClick={() => setShowDeepDive(null)}>
          <div className="deep-dive-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GraduationCap size={18} color="var(--accent2)" />
                <h2 style={{ fontSize: '16px', margin: 0 }}>Level 3: Deep Dive — {showDeepDive.data.label}</h2>
              </div>
              <button className="close-btn" onClick={() => setShowDeepDive(null)}>×</button>
            </div>
            <div className="modal-content">
              <h3>Technical Overview</h3>
              <p>{showDeepDive.data.explanation?.how}</p>
              
              <div className="math-block" style={{ background: 'var(--bg4)', padding: '20px', borderRadius: '8px', fontFamily: 'var(--font-mono)', margin: '20px 0' }}>
                {DEEP_DIVE_CONTENT[showDeepDive.data.label]?.math || 'y = f(x, w, b)'}
              </div>

              <h3>Core Concepts</h3>
              <ul style={{ color: 'var(--text2)', fontSize: '12px', paddingLeft: '20px' }}>
                {DEEP_DIVE_CONTENT[showDeepDive.data.label]?.concepts.map((c: string) => <li key={c} style={{ marginBottom: '5px' }}>{c}</li>) || <li>Mathematical modeling</li>}
              </ul>

              <h3>Implementation Details</h3>
              <p>{DEEP_DIVE_CONTENT[showDeepDive.data.label]?.implementation || 'This node is implemented using optimized local C++ and Python routines.'}</p>
            </div>
          </div>
        </div>
      )}


      {showModelManager && (
        <div className="modal-overlay" onClick={() => setShowModelManager(false)}>
          <div className="deep-dive-modal" style={{ width: '680px', height: '520px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Database size={18} color="var(--accent2)" />
                <h2 style={{ fontSize: '16px', margin: 0 }}>Model Manager</h2>
                <span style={{ fontSize: '10px', color: 'var(--text3)', background: 'var(--bg4)', padding: '2px 8px', borderRadius: '10px' }}>
                  {modelScanResults.filter(m => m.status === 'ready').length} / {modelScanResults.length} ready
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button className="tb-btn" onClick={() => sendMessage({ type: 'scan_models' })} style={{ fontSize: '11px' }}>
                  🔍 Scan Local
                </button>
                <button className="close-btn" onClick={() => setShowModelManager(false)}>×</button>
              </div>
            </div>
            <div className="modal-content" style={{ padding: '16px' }}>
              {modelScanResults.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text3)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>🗄️</div>
                  <div style={{ fontSize: '13px', marginBottom: '8px' }}>No models scanned yet</div>
                  <div style={{ fontSize: '11px', marginBottom: '20px' }}>Click "Scan Local" to detect models in <code style={{ background: 'var(--bg4)', padding: '1px 5px', borderRadius: '3px' }}>./models/</code></div>
                  <button className="ai-gen-btn" onClick={() => sendMessage({ type: 'scan_models' })}>
                    🔍 Scan Now
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {modelScanResults.map((model: any) => {
                    const dlPct = modelDownloadProgress[model.name];
                    const isDownloading = dlPct !== undefined && dlPct < 100;
                    const isReady = model.status === 'ready' || dlPct === 100;
                    return (
                      <div key={model.name} style={{
                        background: 'var(--bg3)',
                        border: `1px solid ${isReady ? 'rgba(74,222,128,0.3)' : isDownloading ? 'rgba(108,99,255,0.4)' : 'var(--border)'}`,
                        borderRadius: '10px',
                        padding: '12px 14px',
                        transition: 'border-color 0.2s',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isDownloading ? '8px' : '0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '8px',
                              background: isReady ? 'rgba(74,222,128,0.12)' : 'var(--bg4)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px'
                            }}>
                              {model.type?.includes('LLM') || model.type?.includes('GGUF') ? '🧠' :
                               model.type?.includes('Ultralytics') ? '👁️' :
                               model.type?.includes('Diffusion') ? '🎨' :
                               model.type?.includes('Whisper') ? '🎤' : '📦'}
                            </div>
                            <div>
                              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>{model.name}</div>
                              <div style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '2px' }}>{model.type} · {model.size}</div>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            {isReady && (
                              <span style={{ fontSize: '10px', color: 'var(--green)', background: 'rgba(74,222,128,0.1)', padding: '3px 8px', borderRadius: '10px', border: '1px solid rgba(74,222,128,0.3)' }}>
                                ✓ Ready
                              </span>
                            )}
                            {isDownloading && (
                              <span style={{ fontSize: '10px', color: 'var(--accent2)', fontFamily: 'var(--font-mono)' }}>
                                {dlPct}%
                              </span>
                            )}
                            {!isReady && !isDownloading && (
                              <button
                                onClick={() => sendMessage({ type: 'download_model', model: model.name })}
                                style={{
                                  background: 'var(--accent)', color: 'white', border: 'none',
                                  borderRadius: '6px', padding: '5px 12px', fontSize: '10px', cursor: 'pointer',
                                  fontWeight: 600, transition: 'opacity 0.2s'
                                }}
                              >
                                ↓ Download
                              </button>
                            )}
                          </div>
                        </div>
                        {/* Download progress bar */}
                        {isDownloading && (
                          <div style={{ height: '4px', background: 'var(--bg4)', borderRadius: '2px', overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${dlPct}%`,
                              background: 'linear-gradient(90deg, var(--accent), var(--accent2))',
                              borderRadius: '2px',
                              transition: 'width 0.4s ease',
                              boxShadow: '0 0 8px var(--accent-glow)',
                            }} />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="modal-overlay" onClick={() => setShowHistory(false)}>
          <div className="deep-dive-modal" style={{ height: '500px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={18} color="var(--accent2)" />
                <h2 style={{ fontSize: '16px', margin: 0 }}>Experiment History</h2>
              </div>
              <button className="close-btn" onClick={() => setShowHistory(false)}>×</button>
            </div>
            <div className="modal-content" style={{ overflowY: 'auto' }}>
              {runHistory.length === 0 ? (
                <p style={{ color: 'var(--text3)', textAlign: 'center', marginTop: '40px' }}>No runs recorded yet.</p>
              ) : (
                <table className="model-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', fontSize: '12px' }}>
                      <th style={{ padding: '10px' }}>Date</th>
                      <th>Nodes</th>
                      <th>Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {runHistory.map((run: any) => (
                      <tr key={run.id} style={{ fontSize: '11px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '10px', color: 'var(--text2)' }}>{run.date}</td>
                        <td style={{ color: 'var(--text2)' }}>{run.nodesCount} nodes</td>
                        <td style={{ color: 'var(--green)' }}>
                          {run.scores && run.scores.length > 0 ? run.scores.map((s: number) => s.toFixed(4)).join(', ') : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {runHistory.length > 0 && (
                <button className="ai-gen-btn" style={{ marginTop: '20px', width: '100%' }} onClick={clearHistory}>
                  Clear History
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    </ErrorBoundary>
  );
};

export default App;




