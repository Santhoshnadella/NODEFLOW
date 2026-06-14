import { useEffect, useRef, useState, useCallback } from 'react';

export const useBackend = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stats, setStats] = useState<any>({ vram_used: 0, vram_total: 8 });
  const [nodeStatuses, setNodeStatuses] = useState<Record<string, 'idle' | 'running' | 'complete' | 'error'>>({});
  const [nodeResults, setNodeResults] = useState<Record<string, any>>({});
  const [chatHistories, setChatHistories] = useState<Record<string, any[]>>({});
  const [generatedPipelineId, setGeneratedPipelineId] = useState<string | null>(null);
  const [runHistory, setRunHistory] = useState<any[]>(() => {
    try { return JSON.parse(localStorage.getItem('nodeflow_history') || '[]'); } catch { return []; }
  });
  const [profilerStats, setProfilerStats] = useState<any>(null);
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
      } else if (message.type === 'pipeline_generated') {
        setGeneratedPipelineId(message.templateId);
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

  const clearHistory = useCallback(() => {
    setRunHistory([]);
    localStorage.removeItem('nodeflow_history');
  }, []);

  return { isConnected, isRunning, progress, stats, nodeStatuses, nodeResults, chatHistories, generatedPipelineId, runHistory, profilerStats, clearHistory, runPipeline, stopPipeline, sendMessage, sendChatMessage };
};


