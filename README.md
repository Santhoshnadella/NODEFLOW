# 🌌 NodeFlow: Local-First, No-Code AI Platform

NodeFlow is a powerful, visually stunning desktop application designed for local-first AI and machine learning. Built for everyone from data scientists to students, it allows you to build complex AI pipelines using a drag-and-drop interface—**100% locally with zero cloud dependencies.**

## 🚀 Features

- **🎨 Premium Glassmorphism UI**: A state-of-the-art interface with backdrop blurs and vibrant aesthetics.
- **🧠 Local LLM & GenAI**: Run HuggingFace models and Stable Diffusion right on your machine.
- **🛠️ Classical ML & DL**: Full support for Scikit-learn and PyTorch nodes.
- **👶 Kid Mode**: A one-click toggle that transforms technical jargon into simplified, analogy-based learning.
- **🔌 Hardware Acceleration**: Automatic detection and utilization of NVIDIA CUDA and Apple Silicon (MPS).
- **📝 Python Export**: Turn your visual graph into a standalone, production-ready Python script.

## 🛠️ Technology Stack

- **Frontend**: Electron.js, React, XYFlow (React Flow), Vanilla CSS.
- **Backend**: Python (FastAPI Subprocess), PyTorch, Scikit-learn, Transformers.
- **Build System**: Electron Forge + Vite.

## 🏃 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)

### Installation
1. Clone the repository and enter the directory.
2. Install Node dependencies:
   ```bash
   npm install
   ```
3. Install Python requirements:
   ```bash
   pip install -r src/backend/requirements.txt
   ```
4. Start the application:
   ```bash
   npm start
   ```

## 🏗️ Architecture: "The Bridge"
NodeFlow uses a unique "Bridge" architecture. The Electron main process spawns a high-performance Python engine as a local subprocess. The React frontend communicates with this engine via a **real-time WebSocket connection**, ensuring that UI interactions are fluid while heavy AI computations happen in the background.

---

Built with ❤️ 
