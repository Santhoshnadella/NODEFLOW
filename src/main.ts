import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { spawn, ChildProcess } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// These are injected by Vite
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;


// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

import crypto from 'node:crypto';

let pythonProcess: ChildProcess | null = null;

// Generate token once at startup for WebSocket authentication
const WS_TOKEN = crypto.randomBytes(16).toString('hex');
process.env.NODEFLOW_WS_TOKEN = WS_TOKEN;

const startPythonBackend = () => {
  let scriptPath: string;
  let pythonExecutable: string;

  if (app.isPackaged) {
    scriptPath = path.join(process.resourcesPath, 'backend', 'main.py');
    const localPython = process.platform === 'win32'
      ? path.join(process.resourcesPath, 'python_env', 'python.exe')
      : path.join(process.resourcesPath, 'python_env', 'bin', 'python3');
      
    const fs = require('node:fs');
    if (fs.existsSync(localPython)) {
      pythonExecutable = localPython;
    } else {
      pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
    }
  } else {
    scriptPath = path.join(app.getAppPath(), 'src', 'backend', 'main.py');
    pythonExecutable = process.platform === 'win32' ? 'python' : 'python3';
  }
  
  const env = { 
    ...process.env, 
    PROTOCOL_BUFFERS_PYTHON_IMPLEMENTATION: 'python',
    NODEFLOW_WS_TOKEN: WS_TOKEN
  };
  pythonProcess = spawn(pythonExecutable, [scriptPath], { env });

  pythonProcess.stdout?.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  pythonProcess.stderr?.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    console.log(`Backend process exited with code ${code}`);
  });
};


const createWindow = () => {

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();
};

app.on('ready', () => {
  startPythonBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on('before-quit', () => {
  if (pythonProcess) {
    pythonProcess.kill();
  }
});

