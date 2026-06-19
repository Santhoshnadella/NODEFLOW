import { useEffect, useRef, useState, useCallback } from 'react';

export const useBackend = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<any>({ vram_used: 0, vram_total: 0 });
  const [systemInfo, setSystemInfo] = useState<any>({
    gpu_available: false,
    gpu_name: null,
    gpu_vram_gb: 0,
    cuda_version: null,
    mps_available: false,
    python_version: null,
    platform: null,
    current_device: 'cpu',
  });
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, 'idle' | 'running' | 'complete' | 'error'>>({});
  const [nodeResults, setNodeResults] = useState<Record<string, any>>({});
  const [chatHistories, setChatHistories] = useState<Record<string, any[]>>({});
  const [generatedPipelineId, setGeneratedPipelineId] = useState<string | null>(null);
  const [runHistory, setRunHistory] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('nodeflow_history') || '[]'); } catch { return []; }
  });
  const [profilerStats, setProfilerStats] = useState<any>(null);
  const [modelScanResults, setModelScanResults] = useState<any[]>([]);
  const [modelDownloadProgress, setModelDownloadProgress] = useState<Record<string, number>>({});
  const currentRunNodes = useRef<any[]>([]);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const socket = new WebSocket('ws://127.0.0.1:8000/ws');

    socket.onopen = () => {
      console.log('Connected to Backend');
      // Send handshake token from preload API
      const token = (window as any).nodeflowAPI?.wsToken || '';
      socket.send(JSON.stringify({ token }));
      setIsConnected(true);
      // Request full system info immediately after auth handshake
      setTimeout(() => {
        if (socket.readyState === WebSocket.OPEN) {
          socket.send(JSON.stringify({ type: 'get_system_info' }));
        }
      }, 200);
    };

    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);
      console.log('Message from backend:', message);

      if (message.type === 'node_complete') {
        setNodeStatuses(prev => ({ ...prev, [message.node_id]: 'complete' }));
        setNodeResults(prev => ({ ...prev, [message.node_id]: message.results }));
        setProgress((prev) => Math.min(prev + 15, 95));
      } else if (message.type === 'node_error') {
        setNodeStatuses(prev => ({ ...prev, [message.node_id]: 'error' }));
        setNodeResults(prev => ({ ...prev, [message.node_id]: { error: message.error, diagnosis: message.diagnosis } }));
        setIsRunning(false);
      } else if (message.type === 'chat_response') {
        setChatHistories(prev => ({
          ...prev,
          [message.node_id]: [...(prev[message.node_id] || []), { role: 'assistant', content: message.content }]
        }));
      } else if (message.type === 'chat_token') {
        setChatHistories(prev => {
          const hist = prev[message.node_id] || [];
          const last = hist[hist.length - 1];
          if (last && last.role === 'assistant') {
            return {
              ...prev,
              [message.node_id]: [...hist.slice(0, -1), { role: 'assistant', content: last.content + message.token }]
            };
          } else {
            return {
              ...prev,
              [message.node_id]: [...hist, { role: 'assistant', content: message.token }]
            };
          }
        });
      } else if (message.type === 'training_progress') {
        setStats((prev: any) => ({
          ...prev,
          last_epoch: message.epoch,
          last_loss: message.loss.toFixed(4),
          history: [...(prev.history || []), { epoch: message.epoch, loss: message.loss }]
        }));
      } else if (message.type === 'execution_complete') {
        setIsRunning(false);
        setProgress(100);
        setTimeout(() => setProgress(0), 3000);
        if (message.profiler) setProfilerStats(message.profiler);
        setNodeResults((prevResults) => {
          const entry = {
            id: Date.now(),
            date: new Date().toLocaleString(),
            nodesCount: currentRunNodes.current.length,
            scores: Object.keys(prevResults).map(k => prevResults[k]?.score).filter(s => s !== undefined)
          };
          setRunHistory(prev => {
            const h = [entry, ...prev].slice(0, 50);
            localStorage.setItem('nodeflow_history', JSON.stringify(h));
            return h;
          });
          return prevResults;
        });
      } else if (message.type === 'stats') {
        setStats(message.data);
        // Merge rich hardware info from stats broadcast into systemInfo
        setSystemInfo((prev: any) => ({
          ...prev,
          gpu_available: message.data.gpu_available ?? prev.gpu_available,
          gpu_name: message.data.gpu_name ?? prev.gpu_name,
          cuda_version: message.data.cuda_version ?? prev.cuda_version,
          mps_available: message.data.mps_available ?? prev.mps_available,
          python_version: message.data.python_version ?? prev.python_version,
          current_device: message.data.device?.toLowerCase() ?? prev.current_device,
        }));
      } else if (message.type === 'system_info') {
        setSystemInfo(message.data);
      } else if (message.type === 'device_switched') {
        setSystemInfo((prev: any) => ({ ...prev, current_device: message.device }));
        setStats((prev: any) => ({ ...prev, device: message.device.toUpperCase() }));
      } else if (message.type === 'pipeline_generated') {
        setGeneratedPipelineId(message.templateId);
      } else if (message.type === 'scan_results') {
        setModelScanResults(message.models || []);
      } else if (message.type === 'download_progress') {
        setModelDownloadProgress(prev => ({ ...prev, [message.model]: message.progress }));
      } else if (message.type === 'download_complete') {
        setModelDownloadProgress(prev => ({ ...prev, [message.model]: 100 }));
        setModelScanResults(prev => prev.map(m => m.name === message.model ? { ...m, status: 'ready' } : m));
      }
    };

    socket.onclose = (event) => {
      console.log('Disconnected from Backend', event.reason);
      setIsConnected(false);
      setIsRunning(false);
      if (event.code === 4001) {
        console.error('WebSocket Authentication Failed!');
      }
    };

    socketRef.current = socket;

    return () => {
      socket.close();
    };
  }, []);

  const runPipeline = useCallback((nodes: any[], edges: any[]) => {
    // Cycle detection
    const adj: Record<string, string[]> = {};
    nodes.forEach(n => adj[n.id] = []);
    edges.forEach(e => adj[e.source]?.push(e.target));

    const visited: Record<string, boolean> = {};
    const recStack: Record<string, boolean> = {};

    const isCyclic = (nodeId: string): boolean => {
      if (!visited[nodeId]) {
        visited[nodeId] = true;
        recStack[nodeId] = true;
        const neighbors = adj[nodeId] || [];
        for (const neighbor of neighbors) {
          if (!visited[neighbor] && isCyclic(neighbor)) return true;
          else if (recStack[neighbor]) return true;
        }
      }
      recStack[nodeId] = false;
      return false;
    };

    let hasCycle = false;
    for (const node of nodes) {
      if (!visited[node.id]) {
        if (isCyclic(node.id)) {
          hasCycle = true;
          break;
        }
      }
    }

    if (hasCycle) {
      alert("Cycle detected in the pipeline graph! Infinite loops are not allowed. Please fix the connections and try again.");
      return;
    }

    if (socketRef.current && isConnected) {
      currentRunNodes.current = nodes;
      setIsRunning(true);
      setProgress(0);
      // Reset statuses
      const initialStatuses: any = {};
      nodes.forEach(n => initialStatuses[n.id] = 'idle');
      setNodeStatuses(initialStatuses);
      setNodeResults({});

      socketRef.current.send(JSON.stringify({
        type: 'run_pipeline',
        nodes,
        edges
      }));
    }
  }, [isConnected]);

  const stopPipeline = useCallback(() => {
    if (socketRef.current && isConnected) {
      setIsRunning(false);
      socketRef.current.send(JSON.stringify({ type: 'stop_pipeline' }));
    }
  }, [isConnected]);

  const sendMessage = useCallback((msg: any) => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify(msg));
    }
  }, [isConnected]);

  const sendChatMessage = useCallback((nodeId: string, content: string) => {
    if (socketRef.current && isConnected) {
      setChatHistories(prev => ({
        ...prev,
        [nodeId]: [...(prev[nodeId] || []), { role: 'user', content }]
      }));
      socketRef.current.send(JSON.stringify({
        type: 'chat_message',
        node_id: nodeId,
        content
      }));
    }
  }, [isConnected]);

  const switchDevice = useCallback((device: 'cuda' | 'mps' | 'cpu') => {
    if (socketRef.current && isConnected) {
      socketRef.current.send(JSON.stringify({ type: 'switch_device', device }));
    }
  }, [isConnected]);

  const clearHistory = useCallback(() => {
    setRunHistory([]);
    localStorage.removeItem('nodeflow_history');
  }, []);

  return { isConnected, isRunning, progress, stats, systemInfo, switchDevice, nodeStatuses, nodeResults, chatHistories, generatedPipelineId, runHistory, profilerStats, clearHistory, runPipeline, stopPipeline, sendMessage, sendChatMessage, modelScanResults, modelDownloadProgress };
};


