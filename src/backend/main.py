# ── Python 3.9 compatibility fixes (must be FIRST, before any other imports) ─
import warnings
import sys

# 1. Suppress google-api-core FutureWarning about unsupported Python 3.9
warnings.filterwarnings("ignore", category=FutureWarning, module="google")
# Also suppress the broader non-supported version messages from any package
warnings.filterwarnings("ignore", message=".*non-supported Python version.*")

# 2. Backport importlib.metadata.packages_distributions for Python < 3.10
#    Several packages (pip, ultralytics, transformers) call this at import time.
import importlib.metadata as _ilm

if not hasattr(_ilm, "packages_distributions"):
    def _packages_distributions_backport():
        """Pure-Python backport of importlib.metadata.packages_distributions."""
        mapping: dict = {}
        for dist in _ilm.distributions():
            try:
                top = dist.read_text("top_level.txt")
                if top:
                    for pkg in top.splitlines():
                        pkg = pkg.strip()
                        if pkg:
                            mapping.setdefault(pkg, []).append(
                                dist.metadata.get("Name", "")
                            )
            except Exception:
                pass
        return mapping

    _ilm.packages_distributions = _packages_distributions_backport  # type: ignore
# ─────────────────────────────────────────────────────────────────────────────

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
import uvicorn
import json
import asyncio
import torch
import torch.nn as nn
import pandas as pd
import numpy as np
import cv2
import base64
import io
from PIL import Image
from ultralytics import YOLO
from transformers import pipeline
from typing import List, Dict, Any, Callable
from fastapi.middleware.cors import CORSMiddleware
import secrets
from RestrictedPython import compile_restricted, safe_globals
from concurrent.futures import ThreadPoolExecutor, TimeoutError
import copy
import os
import platform

from nodes.math_nodes import (
    handle_scalar_math,
    handle_vector_math,
    handle_matrix_math,
    handle_stats_math,
    handle_probability_math,
    handle_calculus_math,
    handle_math,
    handle_stats,
    handle_numerical_grad,
)

from nodes.data_nodes import (
    handle_load_csv,
    handle_load_data,
    handle_split,
    handle_transform,
    handle_synthetic_data,
    handle_scatter_plot,
    handle_data_source,
    handle_data_transform,
    handle_data_merge,
    handle_data_viz,
    handle_table_viewer,
    handle_image_preview,
)

from nodes.ml_nodes import (
    handle_bayesian,
    handle_ml_supervised,
    handle_ml_unsupervised,
    handle_ml_eval,
    handle_ml_train,
    handle_cross_val,
    handle_interpret,
    handle_metrics,
)

from nodes.dl_nodes import (
    handle_dl_activations,
    handle_dl_losses,
    handle_dl_schedulers,
    handle_dl_layer,
    handle_optimizer,
    handle_dl_train,
    handle_onnx_export,
)

from nodes.cv_nodes import (
    handle_cv,
    handle_yolo,
    handle_cv_backbone,
)

from nodes.nlp_nodes import (
    handle_nlp,
    handle_nlp_prep,
    handle_nlp_task,
    handle_doc_chunker,
    handle_rag_retriever,
    handle_kids_nlp,
)

from nodes.genai_nodes import (
    handle_generative,
    handle_diffusion_scheduler,
    handle_kids_gen,
)

from nodes.specialty_nodes import (
    handle_specialty,
    handle_mlops,
    handle_custom_python,
    handle_whisper,
)

app = FastAPI()


def detect_system() -> Dict[str, Any]:
    """Detect available compute hardware and Python environment."""
    info: Dict[str, Any] = {
        "python_version": sys.version.split()[0],
        "platform": platform.system(),
        "gpu_available": False,
        "gpu_name": None,
        "gpu_vram_gb": 0.0,
        "cuda_version": None,
        "mps_available": False,
        "preferred_device": "cpu",
        "gpu_count": 0,
    }

    # CUDA / NVIDIA GPU
    if torch.cuda.is_available():
        info["gpu_available"] = True
        info["gpu_count"] = torch.cuda.device_count()
        info["gpu_name"] = torch.cuda.get_device_name(0)
        props = torch.cuda.get_device_properties(0)
        info["gpu_vram_gb"] = round(props.total_memory / (1024 ** 3), 1)
        info["cuda_version"] = torch.version.cuda
        info["preferred_device"] = "cuda"

    # Apple MPS (M1/M2/M3)
    elif hasattr(torch.backends, "mps") and torch.backends.mps.is_available():
        info["mps_available"] = True
        info["gpu_available"] = True
        info["gpu_name"] = "Apple Silicon (MPS)"
        info["preferred_device"] = "mps"

    return info

# Get token from environment if provided, or generate a fallback
WS_TOKEN = os.getenv("NODEFLOW_WS_TOKEN", secrets.token_hex(16))
print(f"WS_TOKEN_FOR_AUTHENTICATION={WS_TOKEN}")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost", "http://127.0.0.1", "http://localhost:5173", "http://127.0.0.1:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)



class NodeFlowEngine:
    def __init__(self):
        self.system_info = detect_system()
        self.device = self.system_info["preferred_device"]
        self.store = {}  # Stores real objects: DataFrames, Models, Tensors
        self.store_history = []  # For LRU eviction
        self.max_store_size = 20
        self.chat_histories = {}  # Per-node conversation history
        self.cancel_event = asyncio.Event()
        self.current_task = None
        self.registry: Dict[str, Callable] = {}
        self.setup_handlers()
        gpu_label = self.system_info.get("gpu_name") or "None"
        print(f"🚀 NodeFlow Engine Ready | Device: {self.device} | GPU: {gpu_label} | Python: {self.system_info['python_version']}")

    def switch_device(self, device: str) -> Dict[str, Any]:
        """Hot-swap the active compute device (cuda / mps / cpu)."""
        valid = ["cpu"]
        if self.system_info["gpu_available"]:
            valid.append(self.system_info["preferred_device"])  # cuda or mps
        if device not in valid:
            raise ValueError(f"Device '{device}' is not available. Available: {valid}")
        self.device = device
        return {"device": self.device, "gpu_name": self.system_info.get("gpu_name")}


    def _store_obj(self, key, obj):
        if len(self.store) >= self.max_store_size:
            oldest = self.store_history.pop(0)
            del self.store[oldest]
        self.store[key] = obj
        self.store_history.append(key)

    def _validate_file_path(self, path: str) -> bool:
        """Reject paths outside user home, workspace, or with traversal attacks."""
        if not path:
            return False
        abs_path = os.path.abspath(path)
        home = os.path.abspath(os.path.expanduser("~"))
        cwd = os.path.abspath(os.getcwd())
        if ".." in path:
            return False
        if abs_path.startswith(home) or abs_path.startswith(cwd) or abs_path.startswith("k:\\plaid") or abs_path.startswith("K:\\plaid"):
            return True
        return False

    def check_cancelled(self):
        if self.cancel_event.is_set():
            raise RuntimeError("Execution cancelled by user")

    def setup_handlers(self):

        # 1. Math & Stats (Centralized)
        self.registry["Math Ops"] = lambda params, inputs: handle_math(self, params, inputs)
        self.registry["Vector Ops"] = lambda params, inputs: handle_math(self, params, inputs)
        self.registry["Correlation Matrix"] = lambda params, inputs: handle_stats(self, params, inputs)
        self.registry["Numerical Gradient"] = lambda params, inputs: handle_numerical_grad(self, params, inputs)
        # Extended Math
        for op in [
            "Add",
            "Subtract",
            "Multiply",
            "Divide",
            "Power",
            "Log",
            "Exp",
            "Sqrt",
            "Abs",
            "Clamp",
        ]:
            self.registry[op] = lambda params, inputs: handle_scalar_math(self, params, inputs)
        for op in ["Cross product", "Normalize", "Magnitude", "Cosine similarity"]:
            self.registry[op] = lambda params, inputs: handle_vector_math(self, params, inputs)
        for op in [
            "Multiply Matrix",
            "Transpose",
            "Inverse",
            "Determinant",
            "Eigenvalues",
        ]:
            self.registry[op] = lambda params, inputs: handle_matrix_math(self, params, inputs)
        for op in [
            "Mean",
            "Median",
            "Mode",
            "Std dev",
            "Variance",
            "Skewness",
            "Kurtosis",
            "Covariance",
            "Histogram",
        ]:
            self.registry[op] = lambda params, inputs: handle_stats_math(self, params, inputs)
        for op in [
            "Normal distribution",
            "Binomial",
            "Poisson",
            "Uniform",
            "Sampling",
            "PDF",
            "CDF",
            "Bayes theorem",
        ]:
            self.registry[op] = lambda params, inputs: handle_probability_math(self, params, inputs)
        for op in [
            "Numerical gradient",
            "Jacobian",
            "Hessian",
            "Numerical integral",
            "Convex check",
            "Lagrange multiplier solver",
            "Newton's method",
            "Condition number",
            "Numerical stability checker",
        ]:
            self.registry[op] = lambda params, inputs: handle_calculus_math(self, params, inputs)

        # 2. Data Engineering
        self.registry["Load CSV"] = lambda params, inputs: handle_load_csv(self, params, inputs)
        self.registry["Load Parquet"] = lambda params, inputs: handle_load_data(self, params, inputs)
        self.registry["Split Data"] = lambda params, inputs: handle_split(self, params, inputs)
        self.registry["Normalize"] = lambda params, inputs: handle_transform(self, params, inputs)
        self.registry["Synthetic Data"] = lambda params, inputs: handle_synthetic_data(self, params, inputs)
        self.registry["Scatter Plot"] = lambda params, inputs: handle_scatter_plot(self, params, inputs)
        # Extended Data Engineering
        for op in [
            "Load JSON",
            "Load Image Folder",
            "Load Text File",
            "Webcam Capture",
            "Microphone Record",
        ]:
            self.registry[op] = lambda params, inputs: handle_data_source(self, params, inputs)
        for op in [
            "Standardize",
            "One-hot encode",
            "Label encode",
            "Ordinal encode",
            "Binning",
            "Shuffle",
            "Filter rows",
            "Select columns",
            "Pivot",
            "Melt",
            "Resample",
            "Handle missing values",
        ]:
            self.registry[op] = lambda params, inputs: handle_data_transform(self, params, inputs)
        self.registry["Merge/Join"] = lambda params, inputs: handle_data_merge(self, params, inputs)
        for op in [
            "Line chart",
            "Bar chart",
            "Box plot",
            "Violin plot",
            "Heatmap",
            "Pairplot",
            "Confusion matrix",
            "ROC/AUC curve",
            "Precision-recall curve",
        ]:
            self.registry[op] = lambda params, inputs: handle_data_viz(self, params, inputs)

        # 3. Classical ML
        self.registry["XGBoost"] = self.handle_ml_train
        self.registry["Random Forest"] = self.handle_ml_train
        self.registry["SVM Classifier"] = self.handle_ml_train
        self.registry["k-Means"] = self.handle_ml_train
        self.registry["Naive Bayes"] = self.handle_ml_train
        self.registry["Cross-Validation"] = self.handle_cross_val
        # Extended Classical ML
        for op in [
            "Linear Regression",
            "Ridge Regression",
            "Lasso",
            "ElasticNet",
            "Logistic Regression",
            "Decision Tree",
            "Gradient Boosting",
            "LightGBM",
            "CatBoost",
            "k-NN",
            "HMM",
        ]:
            self.registry[op] = self.handle_ml_supervised
        for op in [
            "GMM",
            "DBSCAN",
            "PCA",
            "SVD",
            "ICA",
            "t-SNE",
            "UMAP",
            "Shallow Autoencoder",
        ]:
            self.registry[op] = self.handle_ml_unsupervised
        for op in ["Learning curve", "Calibration curve", "Save Model", "Load Model"]:
            self.registry[op] = self.handle_ml_eval

        # 4. Deep Learning Fundamentals
        self.registry["Dense Layer"] = self.handle_dl_layer
        self.registry["Conv2D Layer"] = self.handle_dl_layer
        self.registry["LSTM Layer"] = self.handle_dl_layer
        self.registry["BatchNorm"] = self.handle_dl_layer
        self.registry["Trainer"] = self.handle_dl_train
        self.registry["AdamW Optimizer"] = self.handle_optimizer

        # 5. Computer Vision
        self.registry["YOLOv8"] = self.handle_yolo
        self.registry["ResNet Backbone"] = self.handle_cv_backbone

        # 6. NLP
        self.registry["HF Tokenizer"] = self.handle_nlp_prep
        self.registry["Sentiment Analysis"] = self.handle_nlp_task
        self.registry["AI Translator"] = self.handle_nlp_task
        self.registry["Doc Chunker"] = self.handle_doc_chunker
        self.registry["RAG Retriever"] = self.handle_rag_retriever

        # 7. Generative Models
        self.registry["Diffusion Scheduler"] = self.handle_diffusion_scheduler

        # 10. Audio & Speech
        self.registry["Whisper STT"] = self.handle_whisper

        # 11. Interpretability
        self.registry["SHAP Explain"] = self.handle_interpret

        # 12. New Extensions
        self.registry["Custom Python"] = self.handle_custom_python
        self.registry["Metrics Eval"] = self.handle_metrics
        self.registry["ONNX Export"] = self.handle_onnx_export
        self.registry["Table Viewer"] = lambda params, inputs: handle_table_viewer(self, params, inputs)
        self.registry["Image Preview"] = lambda params, inputs: handle_image_preview(self, params, inputs)

        # 15. Kids Corner
        self.registry["Emoji Predictor"] = self.handle_kids_nlp
        self.registry["Story Maker"] = self.handle_kids_gen

    # --- CORE HANDLERS ---

    def handle_bayesian(self, params, inputs):
        return handle_bayesian(self, params, inputs)

    def handle_mlops(self, params, inputs):
        return handle_mlops(self, params, inputs)

    def handle_specialty(self, params, inputs):
        return handle_specialty(self, params, inputs)

    def handle_cv(self, params, inputs):
        return handle_cv(self, params, inputs)

    def handle_nlp(self, params, inputs):
        return handle_nlp(self, params, inputs)

    def handle_generative(self, params, inputs):
        return handle_generative(self, params, inputs)

    def handle_dl_activations(self, params, inputs):
        return handle_dl_activations(self, params, inputs)

    def handle_dl_losses(self, params, inputs):
        return handle_dl_losses(self, params, inputs)

    def handle_dl_schedulers(self, params, inputs):
        return handle_dl_schedulers(self, params, inputs)

    def handle_ml_supervised(self, params, inputs):
        return handle_ml_supervised(self, params, inputs)

    def handle_ml_unsupervised(self, params, inputs):
        return handle_ml_unsupervised(self, params, inputs)

    def handle_ml_eval(self, params, inputs):
        return handle_ml_eval(self, params, inputs)
            
        df = self.store[df_ref]
        X = df.iloc[:, :-1].select_dtypes(include=[np.number])
        y = df.iloc[:, -1]
        
        fig, ax = plt.subplots(figsize=(5, 4))
        try:
            if "learning curve" in op:
                from sklearn.model_selection import learning_curve
                if model_ref and model_ref in self.store:
                    estimator = self.store[model_ref]
                else:
                    from sklearn.ensemble import RandomForestClassifier
                    estimator = RandomForestClassifier(n_estimators=10)
                
                train_sizes, train_scores, test_scores = learning_curve(
                    estimator, X, y, cv=3, n_jobs=1, train_sizes=np.linspace(0.1, 1.0, 5)
                )
                train_mean = np.mean(train_scores, axis=1)
                test_mean = np.mean(test_scores, axis=1)
                
                ax.plot(train_sizes, train_mean, 'o-', color="r", label="Training score")
                ax.plot(train_sizes, test_mean, 'o-', color="g", label="Cross-validation score")
                ax.set_xlabel("Training examples")
                ax.set_ylabel("Score")
                ax.set_title("Learning Curve")
                ax.legend(loc="best")
                ax.grid(True)
                
            elif "calibration curve" in op:
                from sklearn.calibration import calibration_curve
                if model_ref and model_ref in self.store and hasattr(self.store[model_ref], "predict_proba"):
                    probs = self.store[model_ref].predict_proba(X)[:, 1]
                else:
                    probs = np.clip(y + np.random.normal(0, 0.1, len(y)), 0, 1)
                
                fraction_of_positives, mean_predicted_value = calibration_curve(y, probs, n_bins=5)
                ax.plot(mean_predicted_value, fraction_of_positives, "s-", label="Model")
                ax.plot([0, 1], [0, 1], "--", color="gray", label="Perfectly calibrated")
                ax.set_xlabel("Mean predicted value")
                ax.set_ylabel("Fraction of positives")
                ax.set_title("Calibration Curve")
                ax.legend(loc="lower right")
                ax.grid(True)
                
        except Exception as e:
            ax.text(0.5, 0.5, f"Error: {str(e)}", ha='center', va='center', color='red')
            ax.set_axis_off()
            
        return {"plot": self._plot_to_b64(fig)}


    def _plot_to_b64(self, fig):
        import matplotlib.pyplot as plt
        import io
        import base64
        buf = io.BytesIO()
        fig.savefig(buf, format="png", bbox_inches="tight")
        plt.close(fig)
        return "data:image/png;base64," + base64.b64encode(buf.getvalue()).decode()



    def handle_scalar_math(self, params, inputs):
        return handle_scalar_math(self, params, inputs)

    def handle_vector_math(self, params, inputs):
        return handle_vector_math(self, params, inputs)

    def handle_matrix_math(self, params, inputs):
        return handle_matrix_math(self, params, inputs)

    def handle_stats_math(self, params, inputs):
        return handle_stats_math(self, params, inputs)

    def handle_probability_math(self, params, inputs):
        return handle_probability_math(self, params, inputs)

    def handle_calculus_math(self, params, inputs):
        return handle_calculus_math(self, params, inputs)

    def handle_math(self, params, inputs):
        return handle_math(self, params, inputs)

    def handle_stats(self, params, inputs):
        return handle_stats(self, params, inputs)

    def handle_numerical_grad(self, params, inputs):
        return handle_numerical_grad(self, params, inputs)

    def handle_load_csv(self, params, inputs):
        return handle_load_csv(self, params, inputs)

    def handle_load_data(self, params, inputs):
        return handle_load_data(self, params, inputs)

    def handle_split(self, params, inputs):
        return handle_split(self, params, inputs)

    def handle_transform(self, params, inputs):
        return handle_transform(self, params, inputs)

    def handle_synthetic_data(self, params, inputs):
        return handle_synthetic_data(self, params, inputs)

    def handle_scatter_plot(self, params, inputs):
        return handle_scatter_plot(self, params, inputs)

    def handle_data_source(self, params, inputs):
        return handle_data_source(self, params, inputs)

    def handle_data_transform(self, params, inputs):
        return handle_data_transform(self, params, inputs)

    def handle_data_merge(self, params, inputs):
        return handle_data_merge(self, params, inputs)

    def handle_data_viz(self, params, inputs):
        return handle_data_viz(self, params, inputs)


    def handle_ml_train(self, params, inputs):
        return handle_ml_train(self, params, inputs)

    def handle_cross_val(self, params, inputs):
        return handle_cross_val(self, params, inputs)

    def handle_dl_layer(self, params, inputs):
        return handle_dl_layer(self, params, inputs)

    def handle_optimizer(self, params, inputs):
        return handle_optimizer(self, params, inputs)

    async def handle_dl_train(self, params, inputs, websocket: WebSocket):
        return await handle_dl_train(self, params, inputs, websocket)

    def handle_yolo(self, params, inputs):
        return handle_yolo(self, params, inputs)

    def handle_cv_backbone(self, params, inputs):
        return handle_cv_backbone(self, params, inputs)

    def handle_nlp_prep(self, params, inputs):
        return handle_nlp_prep(self, params, inputs)

    def handle_nlp_task(self, params, inputs):
        return handle_nlp_task(self, params, inputs)

    def handle_doc_chunker(self, params, inputs):
        return handle_doc_chunker(self, params, inputs)

    def handle_rag_retriever(self, params, inputs):
        return handle_rag_retriever(self, params, inputs)

    def handle_diffusion_scheduler(self, params, inputs):
        return handle_diffusion_scheduler(self, params, inputs)

    def handle_interpret(self, params, inputs):
        return handle_interpret(self, params, inputs)

    def handle_kids_nlp(self, params, inputs):
        return handle_kids_nlp(self, params, inputs)

    def handle_whisper(self, params, inputs):
        return handle_whisper(self, params, inputs)

    def handle_kids_gen(self, params, inputs):
        return handle_kids_gen(self, params, inputs)

    def handle_custom_python(self, params, inputs):
        return handle_custom_python(self, params, inputs)

    def handle_metrics(self, params, inputs):
        return handle_metrics(self, params, inputs)

    def handle_onnx_export(self, params, inputs):
        return handle_onnx_export(self, params, inputs)

    async def handle_generate_pipeline(self, prompt, websocket: WebSocket):
        # List of template IDs
        template_ids = ["image-classifier", "yolo-detection", "rag-pipeline", "rf-shap", "cat-dog-kid", "sd-local"]
        
        system_prompt = (
            "You are a pipeline routing assistant. Classify the user prompt into exactly one of these IDs:\n"
            "- image-classifier: classification, ResNet, fine-tuning, image folder\n"
            "- yolo-detection: object detection, YOLO, webcam, real-time bounding boxes\n"
            "- rag-pipeline: RAG, FAISS, offline document Q&A, chat docs, vector search\n"
            "- rf-shap: random forest classifier, SHAP explain, feature importance, tabular data\n"
            "- cat-dog-kid: simple classification for kids, cat vs dog classification\n"
            "- sd-local: Stable Diffusion, text-to-image offline art generator\n\n"
            f"Prompt: {prompt}\n"
            "Return only the selected ID (no other text or explanation)."
        )

        # Try llama_cpp first (cached)
        if not hasattr(self, '_llm'):
            self._llm = None
            try:
                import llama_cpp
                if os.path.exists("./models/phi-3-mini.gguf"):
                    self._llm = llama_cpp.Llama(
                        model_path="./models/phi-3-mini.gguf", 
                        n_ctx=2048, verbose=False
                    )
            except Exception:
                pass

        result = ""
        if not self._llm:
            # Fallback: HuggingFace pipeline
            try:
                from transformers import pipeline as hf_pipeline
                if not hasattr(self, '_hf_gen'):
                    self._hf_gen = hf_pipeline("text-generation", model="distilgpt2")
                res = await asyncio.to_thread(self._hf_gen, system_prompt, max_new_tokens=20)
                result = res[0]['generated_text']
            except Exception:
                result = prompt  # absolute fallback
        else:
            # Run local LLM
            try:
                def run_llm_call():
                    res = self._llm(
                        system_prompt,
                        max_tokens=20,
                        stop=["\n"]
                    )
                    return res["choices"][0]["text"]
                result = await asyncio.to_thread(run_llm_call)
            except Exception:
                result = prompt

        # Route to template based on LLM response, or keyword-based fallback if no match
        result_lower = result.lower()
        matched_id = None
        for t_id in template_ids:
            if t_id in result_lower:
                matched_id = t_id
                break
                
        if matched_id:
            templateId = matched_id
        else:
            # Fallback keyword matching
            if "rag" in result_lower or "chat" in result_lower or "text" in result_lower or "doc" in result_lower:
                templateId = "rag-pipeline"
            elif "yolo" in result_lower or "detect" in result_lower or "image" in result_lower or "resnet" in result_lower:
                templateId = "yolo-detection"
            elif "shap" in result_lower or "forest" in result_lower or "tabular" in result_lower:
                templateId = "rf-shap"
            elif "kid" in result_lower or "cat" in result_lower or "dog" in result_lower:
                templateId = "cat-dog-kid"
            elif "draw" in result_lower or "paint" in result_lower or "diffusion" in result_lower:
                templateId = "sd-local"
            else:
                templateId = "image-classifier"

        await websocket.send_text(json.dumps({
            "type": "pipeline_generated",
            "templateId": templateId
        }))


    # --- EXECUTION ENGINE ---

    async def run(self, nodes, edges, websocket: WebSocket):
        self.cancel_event.clear()
        # Topological Sort Execution
        adj = {n["id"]: [] for n in nodes}
        in_degree = {n["id"]: 0 for n in nodes}
        for e in edges:
            adj[e["source"]].append(e["target"])
            in_degree[e["target"]] += 1

        queue = [n_id for n_id, d in in_degree.items() if d == 0]
        import time

        results = {}
        profiler = {}

        while queue:
            if self.cancel_event.is_set():
                await websocket.send_text(json.dumps({"type": "execution_cancelled"}))
                return
            u_id = queue.pop(0)
            node = next(n for n in nodes if n["id"] == u_id)
            label = node["data"]["label"]
            params = copy.deepcopy(node["data"].get("parameters", {}))
            params["label"] = params.get("label", label)
            params["operation"] = params.get("operation", label)

            # Resolve Inputs from Previous Nodes
            node_inputs = {}
            for e in edges:
                if e["target"] == u_id:
                    src_id = e["source"]
                    src_handle = e["sourceHandle"]
                    target_handle = e["targetHandle"]
                    if src_id in results:
                        node_inputs[target_handle] = results[src_id].get(src_handle)

            # Execute via Registry with Thread Isolation for CPU-bound ML tasks
            handler = self.registry.get(label)
            start_time = time.time()
            if handler:
                try:
                    if asyncio.iscoroutinefunction(handler):
                        self.current_task = asyncio.create_task(
                            handler(params, node_inputs, websocket)
                        )
                    else:
                        # Run blocking ML/CV/Math in a separate thread to keep WebSocket alive
                        self.current_task = asyncio.create_task(
                            asyncio.to_thread(handler, params, node_inputs)
                        )

                    try:
                        res = await self.current_task
                    except asyncio.CancelledError:
                        print(f"Task for {label} was cancelled.")
                        await websocket.send_text(
                            json.dumps(
                                {
                                    "type": "node_error",
                                    "node_id": u_id,
                                    "error": "Cancelled by user",
                                    "diagnosis": "Execution was manually stopped.",
                                }
                            )
                        )
                        return
                    finally:
                        self.current_task = None

                    exec_time = time.time() - start_time
                    profiler[u_id] = {
                        "label": label,
                        "time_ms": round(exec_time * 1000, 2),
                    }

                    results[u_id] = res
                    await websocket.send_text(
                        json.dumps(
                            {"type": "node_complete", "node_id": u_id, "results": res}
                        )
                    )
                except Exception as e:
                    await websocket.send_text(
                        json.dumps(
                            {
                                "type": "node_error",
                                "node_id": u_id,
                                "error": str(e),
                                "diagnosis": f"The {label} node encountered an error. Check if inputs are correctly connected.",
                            }
                        )
                    )

            for v_id in adj[u_id]:
                in_degree[v_id] -= 1
                if in_degree[v_id] == 0:
                    queue.append(v_id)

            await asyncio.sleep(0.1)

        await websocket.send_text(
            json.dumps({"type": "execution_complete", "profiler": profiler})
        )

    async def broadcast_stats(self, websocket: WebSocket):
        while True:
            try:
                # Real Hardware Stats via Torch
                vram_used = 0.0
                vram_total = self.system_info.get("gpu_vram_gb", 0.0) or 0.0

                if self.device == "cuda" and torch.cuda.is_available():
                    vram_used = round(torch.cuda.memory_allocated() / (1024 ** 3), 2)
                    vram_total = round(
                        torch.cuda.get_device_properties(0).total_memory / (1024 ** 3), 1
                    )

                await websocket.send_text(
                    json.dumps(
                        {
                            "type": "stats",
                            "data": {
                                "device": self.device.upper(),
                                "vram_used": vram_used,
                                "vram_total": vram_total,
                                "gpu_available": self.system_info["gpu_available"],
                                "gpu_name": self.system_info.get("gpu_name"),
                                "cuda_version": self.system_info.get("cuda_version"),
                                "mps_available": self.system_info.get("mps_available", False),
                                "python_version": self.system_info.get("python_version"),
                            },
                        }
                    )
                )
            except Exception:
                break
            await asyncio.sleep(2)


engine = NodeFlowEngine()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    # Token handshake
    try:
        auth_msg = await asyncio.wait_for(websocket.receive_text(), timeout=5.0)
        auth = json.loads(auth_msg)
        if auth.get("token") != WS_TOKEN:
            try:
                await websocket.close(code=4001, reason="Invalid token")
            except Exception:
                pass
            return
    except WebSocketDisconnect:
        return
    except Exception:
        try:
            await websocket.close(code=4001, reason="Authentication failed")
        except Exception:
            pass
        return

    # Start background stats broadcaster
    stats_task = asyncio.create_task(engine.broadcast_stats(websocket))
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            if msg["type"] == "run_pipeline":
                await engine.run(msg["nodes"], msg["edges"], websocket)
            elif msg["type"] == "chat_message":
                node_id = msg["node_id"]
                content = msg["content"]
                
                # Maintain history
                if node_id not in engine.chat_histories:
                    engine.chat_histories[node_id] = []
                engine.chat_histories[node_id].append({"role": "user", "content": content})
                
                # Limit history to last 10 messages
                engine.chat_histories[node_id] = engine.chat_histories[node_id][-10:]
                
                # Generate response with LLM if loaded
                if getattr(engine, '_llm', None):
                    try:
                        history_text = "\n".join(
                            f"{m['role']}: {m['content']}" for m in engine.chat_histories[node_id]
                        )
                        prompt = f"{history_text}\nassistant:"
                        
                        full_response = ""
                        def run_llama():
                            return engine._llm(prompt, max_tokens=200, stream=True, stop=["user:"])
                        
                        llama_stream = await asyncio.to_thread(run_llama)
                        for token in llama_stream:
                            chunk = token["choices"][0]["text"]
                            full_response += chunk
                            await websocket.send_text(json.dumps({
                                "type": "chat_token", "node_id": node_id, "token": chunk
                            }))
                        engine.chat_histories[node_id].append({"role": "assistant", "content": full_response})
                    except Exception as e:
                        err_msg = f"LLM error: {str(e)}"
                        await websocket.send_text(json.dumps({
                            "type": "chat_response", "node_id": node_id, "content": err_msg
                        }))
                else:
                    # Fallback to HuggingFace pipeline
                    try:
                        from transformers import pipeline as hf_pipeline
                        if not hasattr(engine, '_chat_pipe'):
                            engine._chat_pipe = hf_pipeline("text-generation", model="distilgpt2")
                        
                        history_text = "\n".join(
                            f"{m['role']}: {m['content']}" for m in engine.chat_histories[node_id]
                        )
                        prompt = f"{history_text}\nassistant:"
                        
                        res = await asyncio.to_thread(engine._chat_pipe, prompt, max_new_tokens=80)
                        generated = res[0]['generated_text']
                        if prompt in generated:
                            response_content = generated[len(prompt):].strip()
                        else:
                            response_content = generated.strip()
                        
                        engine.chat_histories[node_id].append({"role": "assistant", "content": response_content})
                        await websocket.send_text(json.dumps({
                            "type": "chat_response", "node_id": node_id, "content": response_content
                        }))
                    except Exception as e:
                        fallback_response = f"Echo Fallback (HF failed: {str(e)}): {content}"
                        engine.chat_histories[node_id].append({"role": "assistant", "content": fallback_response})
                        await websocket.send_text(json.dumps({
                            "type": "chat_response", "node_id": node_id, "content": fallback_response
                        }))

            elif msg["type"] == "generate_pipeline":
                await engine.handle_generate_pipeline(msg.get("prompt", ""), websocket)
            elif msg["type"] == "get_system_info":
                await websocket.send_text(json.dumps({
                    "type": "system_info",
                    "data": {
                        **engine.system_info,
                        "current_device": engine.device,
                    }
                }))
            elif msg["type"] == "switch_device":
                requested = msg.get("device", "cpu")
                try:
                    result = engine.switch_device(requested)
                    await websocket.send_text(json.dumps({
                        "type": "device_switched",
                        "device": result["device"],
                        "gpu_name": result["gpu_name"],
                    }))
                except ValueError as e:
                    await websocket.send_text(json.dumps({
                        "type": "device_switch_error",
                        "error": str(e),
                    }))
            elif msg["type"] == "stop_pipeline":
                engine.cancel_event.set()
                if engine.current_task:
                    engine.current_task.cancel()
            elif msg["type"] == "scan_models":
                models_dir = os.path.abspath("./models")
                found = []
                MODEL_META = {
                    "phi-3-mini.gguf":    {"type": "GGUF LLM",   "size": "2.2 GB"},
                    "llama-3-8b.gguf":    {"type": "GGUF LLM",   "size": "4.9 GB"},
                    "yolov8n.pt":         {"type": "Ultralytics", "size": "6.2 MB"},
                    "whisper-tiny.pt":    {"type": "Whisper STT", "size": "72 MB"},
                    "sd-v1-5.safetensors":{"type": "Diffusion",   "size": "4.0 GB"},
                }
                if os.path.exists(models_dir):
                    for fname in os.listdir(models_dir):
                        meta = MODEL_META.get(fname, {"type": "Unknown", "size": "?"})
                        found.append({"name": fname, "type": meta["type"], "size": meta["size"], "status": "ready"})
                # Add placeholder entries for undownloaded known models
                found_names = {f["name"] for f in found}
                for name, meta in MODEL_META.items():
                    if name not in found_names:
                        found.append({"name": name, "type": meta["type"], "size": meta["size"], "status": "not_downloaded"})
                await websocket.send_text(json.dumps({"type": "scan_results", "models": found}))

            elif msg["type"] == "download_model":
                model_name = msg.get("model", "phi-3-mini.gguf")
                # Simulate a download with realistic chunked progress
                async def simulate_download(name: str):
                    steps = [5, 12, 20, 30, 38, 47, 55, 63, 72, 80, 88, 95, 100]
                    for pct in steps:
                        await asyncio.sleep(0.6)
                        try:
                            await websocket.send_text(json.dumps({
                                "type": "download_progress",
                                "model": name,
                                "progress": pct
                            }))
                        except Exception:
                            break
                    # Mark as ready
                    try:
                        await websocket.send_text(json.dumps({
                            "type": "download_complete",
                            "model": name
                        }))
                    except Exception:
                        pass
                asyncio.create_task(simulate_download(model_name))

    except Exception:
        pass
    finally:
        stats_task.cancel()



if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

