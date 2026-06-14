import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('nodeflowAPI', {
  wsToken: process.env.NODEFLOW_WS_TOKEN || '',
});
