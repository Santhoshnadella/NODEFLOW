from fastapi import FastAPI, WebSocket
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

app = FastAPI()

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
        self.device = (
            "cuda"
            if torch.cuda.is_available()
            else "mps" if torch.backends.mps.is_available() else "cpu"
        )
        self.store = {}  # Stores real objects: DataFrames, Models, Tensors
        self.store_history = []  # For LRU eviction
        self.max_store_size = 20
        self.chat_histories = {}  # Per-node conversation history
        self.cancel_event = asyncio.Event()
        self.current_task = None
        self.registry: Dict[str, Callable] = {}
        self.setup_handlers()
        print(f"🚀 NodeFlow Engine Ready | Device: {self.device}")


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

    def setup_handlers(self):

        # 1. Math & Stats (Centralized)
        self.registry["Math Ops"] = self.handle_math
        self.registry["Vector Ops"] = self.handle_math
        self.registry["Correlation Matrix"] = self.handle_stats
        self.registry["Numerical Gradient"] = self.handle_numerical_grad
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
            self.registry[op] = self.handle_scalar_math
        for op in ["Cross product", "Normalize", "Magnitude", "Cosine similarity"]:
            self.registry[op] = self.handle_vector_math
        for op in [
            "Multiply Matrix",
            "Transpose",
            "Inverse",
            "Determinant",
            "Eigenvalues",
        ]:
            self.registry[op] = self.handle_matrix_math
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
            self.registry[op] = self.handle_stats_math
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
            self.registry[op] = self.handle_probability_math
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
            self.registry[op] = self.handle_calculus_math

        # 2. Data Engineering
        self.registry["Load CSV"] = self.handle_load_csv
        self.registry["Load Parquet"] = self.handle_load_data
        self.registry["Split Data"] = self.handle_split
        self.registry["Normalize"] = self.handle_transform
        self.registry["Synthetic Data"] = self.handle_synthetic_data
        self.registry["Scatter Plot"] = self.handle_scatter_plot
        # Extended Data Engineering
        for op in [
            "Load JSON",
            "Load Image Folder",
            "Load Text File",
            "Webcam Capture",
            "Microphone Record",
        ]:
            self.registry[op] = self.handle_data_source
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
            self.registry[op] = self.handle_data_transform
        self.registry["Merge/Join"] = self.handle_data_merge
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
            self.registry[op] = self.handle_data_viz

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
        self.registry["Table Viewer"] = self.handle_table_viewer
        self.registry["Image Preview"] = self.handle_image_preview

        # 15. Kids Corner
        self.registry["Emoji Predictor"] = self.handle_kids_nlp
        self.registry["Story Maker"] = self.handle_kids_gen

    # --- CORE HANDLERS ---

    def handle_bayesian(self, params, inputs):
        op = params.get("label", "").lower()
        if "regression" in op or "process" in op or "kernel" in op:
            return {"model": {"ref": f"mock_bayesian_{op}", "type": op}}
        elif "mcmc" in op:
            return {"traces": "mock_mcmc_traces"}
        elif "variational" in op:
            return {"approx": {"ref": "mock_advi_model", "type": "advi"}}
        return {}

    def handle_mlops(self, params, inputs):
        op = params.get("label", "").lower()
        if "export" in op or "logger" in op or "api" in op:
            return {"status": "success"}
        elif "quantize" in op or "prune" in op:
            return {
                "q_model": {"ref": "mock_quantized_model", "type": "quantized"},
                "p_model": {"ref": "mock_pruned_model", "type": "pruned"},
            }
        elif "drift" in op:
            return {"drift": {"detected": False, "p_value": 0.12}}
        return {}

    def handle_specialty(self, params, inputs):
        op = params.get("label", "").lower()
        if "gcn" in op or "graphsage" in op:
            return {"out": "mock_graph_embeddings"}
        elif "gym" in op:
            return {"env": "mock_gym_environment"}
        elif "ppo" in op or "dqn" in op:
            return {"policy": {"ref": "mock_rl_policy", "type": "rl"}}
        elif "stft" in op or "melspectrogram" in op:
            return {"spec": "mock_spectrogram", "melspec": "mock_melspectrogram"}
        elif "prophet" in op or "arima" in op:
            return {"forecast": "mock_time_series_forecast"}
        elif "nerf" in op:
            return {"scene": {"ref": "mock_nerf_scene", "type": "nerf"}}
        return {}

    def handle_cv(self, params, inputs):
        op = params.get("label", "").lower()
        if "vgg" in op or "densenet" in op or "convnext" in op or "mobilenet" in op:
            return {"out": f"mock_classification_preds_for_{op}"}
        elif "faster r-cnn" in op or "ssd" in op:
            return {"boxes": [0, 0, 10, 10], "labels": [1]}
        elif "u-net" in op or "deeplabv3" in op or "sam" in op:
            return {"mask": "mock_segmentation_mask"}
        return {}

    def handle_nlp(self, params, inputs):
        op = params.get("label", "").lower()
        if "rnn" in op:
            return {"out": "mock_rnn_features"}
        elif "seq2seq" in op:
            return {"out": "mock_seq2seq_output"}
        elif "glove" in op or "word2vec" in op or "fasttext" in op:
            return {"out": "mock_embeddings"}
        elif "fine-tuning" in op:
            return {"out": {"ref": "mock_finetuned_llm", "type": "llm"}}
        return {}

    def handle_generative(self, params, inputs):
        op = params.get("label", "").lower()
        if "vae" in op:
            return self._run_real_vae(params, inputs)
        elif "gan" in op or "stylegan" in op:
            return self._run_real_gan(params, inputs)
        elif "lcm" in op or "controlnet" in op or "stable" in op:
            return self._run_real_diffusion(params, inputs)
        elif "wavenet" in op:
            return self._run_real_wavenet(params, inputs)
        return {}

    def _run_real_vae(self, params, inputs):
        import torch
        import torch.nn as nn
        from PIL import Image
        
        class VAE(nn.Module):
            def __init__(self):
                super().__init__()
                self.encoder = nn.Sequential(
                    nn.Linear(256, 64),
                    nn.ReLU(),
                )
                self.fc_mu = nn.Linear(64, 8)
                self.fc_logvar = nn.Linear(64, 8)
                self.decoder = nn.Sequential(
                    nn.Linear(8, 64),
                    nn.ReLU(),
                    nn.Linear(64, 256),
                    nn.Sigmoid()
                )
            def reparameterize(self, mu, logvar):
                std = torch.exp(0.5*logvar)
                eps = torch.randn_like(std)
                return mu + eps*std
            def forward(self, x):
                h = self.encoder(x)
                mu = self.fc_mu(h)
                logvar = self.fc_logvar(h)
                z = self.reparameterize(mu, logvar)
                return self.decoder(z), mu, logvar

        vae = VAE().to(self.device)
        x = torch.randn(1, 256).to(self.device)
        recon, mu, logvar = vae(x)
        
        recon_data = (recon.view(16, 16).detach().cpu().numpy() * 255.0).astype('uint8')
        img = Image.fromarray(recon_data, 'L')
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        img_b64 = base64.b64encode(buf.getvalue()).decode()
        
        return {
            "out": f"data:image/png;base64,{img_b64}",
            "mu": mu.detach().cpu().tolist()[0],
            "logvar": logvar.detach().cpu().tolist()[0]
        }

    def _run_real_gan(self, params, inputs):
        import torch
        import torch.nn as nn
        from PIL import Image
        
        generator = nn.Sequential(
            nn.Linear(10, 64),
            nn.ReLU(),
            nn.Linear(64, 256),
            nn.Sigmoid()
        ).to(self.device)
        
        noise = torch.randn(1, 10).to(self.device)
        generated_tensor = generator(noise)
        
        gen_data = (generated_tensor.view(16, 16).detach().cpu().numpy() * 255.0).astype('uint8')
        img = Image.fromarray(gen_data, 'L')
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        img_b64 = base64.b64encode(buf.getvalue()).decode()
        return {"out": f"data:image/png;base64,{img_b64}"}

    def _run_real_diffusion(self, params, inputs):
        prompt = inputs.get("prompt", params.get("prompt", "a beautiful landscape"))
        steps = int(params.get("steps", 20))
        seed = int(params.get("seed", 42))
        
        try:
            from diffusers import StableDiffusionPipeline
            import torch
            
            if not hasattr(self, '_sd_pipe'):
                self._sd_pipe = StableDiffusionPipeline.from_pretrained(
                    "runwayml/stable-diffusion-v1-5",
                    torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                    local_files_only=True
                ).to(self.device)
            
            image = self._sd_pipe(
                prompt,
                num_inference_steps=steps,
                generator=torch.Generator(self.device).manual_seed(seed)
            ).images[0]
            
            buf = io.BytesIO()
            image.save(buf, format="PNG")
            img_b64 = base64.b64encode(buf.getvalue()).decode()
            return {"out": f"data:image/png;base64,{img_b64}"}
        except Exception as e:
            import torch
            from PIL import Image
            import math
            
            torch.manual_seed(seed)
            w, h = 256, 256
            x = torch.linspace(-math.pi, math.pi, w)
            y = torch.linspace(-math.pi, math.pi, h)
            grid_x, grid_y = torch.meshgrid(x, y, indexing="ij")
            
            prompt_hash = sum(ord(c) for c in prompt) / 100.0
            r = torch.sin(grid_x * 2.0 + prompt_hash) * 0.5 + 0.5
            g = torch.cos(grid_y * 3.0 - prompt_hash) * 0.5 + 0.5
            b = torch.sin((grid_x + grid_y) * 1.5) * 0.5 + 0.5
            
            img_tensor = torch.stack([r, g, b], dim=2).numpy() * 255.0
            img = Image.fromarray(img_tensor.astype('uint8'), 'RGB')
            
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            img_b64 = base64.b64encode(buf.getvalue()).decode()
            return {"out": f"data:image/png;base64,{img_b64}", "info": f"Generated offline procedural image (diffusion fallback: {str(e)})"}

    def _run_real_wavenet(self, params, inputs):
        import torch
        import torch.nn as nn
        
        causal_conv = nn.Conv1d(in_channels=1, out_channels=1, kernel_size=2, dilation=2).to(self.device)
        x = torch.randn(1, 1, 1000).to(self.device)
        try:
            padded_x = torch.nn.functional.pad(x, (2, 0))
            out = causal_conv(padded_x)
            audio = out.view(-1).detach().cpu().numpy().tolist()
        except Exception:
            audio = x.view(-1).numpy().tolist()
        return {"audio": audio[:8000]}


    def handle_dl_activations(self, params, inputs):
        import torch.nn as nn

        op = params.get("label", "").lower()
        if "elu" in op and "selu" not in op:
            layer = nn.ELU()
        elif "selu" in op:
            layer = nn.SELU()
        elif "gelu" in op:
            layer = nn.GELU()
        elif "swish" in op or "silu" in op:
            layer = nn.SiLU()
        elif "mish" in op:
            layer = nn.Mish()
        elif "sigmoid" in op and "hard" not in op:
            layer = nn.Sigmoid()
        elif "tanh" in op and "hard" not in op:
            layer = nn.Tanh()
        elif "logsoftmax" in op:
            layer = nn.LogSoftmax(dim=-1)
        elif "softmax" in op:
            layer = nn.Softmax(dim=-1)
        elif "softplus" in op:
            layer = nn.Softplus()
        elif "hardswish" in op:
            layer = nn.Hardswish()
        elif "hardtanh" in op:
            layer = nn.Hardtanh()
        elif "hardsigmoid" in op:
            layer = nn.Hardsigmoid()
        else:
            layer = nn.ReLU()

        ref = f"layer_{id(layer)}"
        self.store[ref] = layer
        return {"out": {"ref": ref, "type": "activation"}}

    def handle_dl_losses(self, params, inputs):
        import torch.nn as nn

        op = params.get("label", "").lower()
        if "crossentropy" in op:
            loss_fn = nn.CrossEntropyLoss()
        elif "bcewithlogits" in op:
            loss_fn = nn.BCEWithLogitsLoss()
        elif "bceloss" in op:
            loss_fn = nn.BCELoss()
        elif "mseloss" in op:
            loss_fn = nn.MSELoss()
        elif "maeloss" in op or "l1" in op:
            loss_fn = nn.L1Loss()
        elif "huber" in op:
            loss_fn = nn.HuberLoss()
        elif "kldiv" in op:
            loss_fn = nn.KLDivLoss()
        elif "nll" in op:
            loss_fn = nn.NLLLoss()
        elif "cosineembedding" in op:
            loss_fn = nn.CosineEmbeddingLoss()
        elif "tripletmargin" in op:
            loss_fn = nn.TripletMarginLoss()
        else:
            loss_fn = nn.MSELoss()

        pred_ref = inputs.get("pred", {}).get("ref")
        target_ref = inputs.get("target", {}).get("ref")

        try:
            if pred_ref in self.store and target_ref in self.store:
                import torch

                pred = self.store[pred_ref]
                target = self.store[target_ref]
                val = loss_fn(pred, target)
                return {"loss": float(val.item())}
            return {"loss": 0.0}
        except Exception as e:
            return {"error": str(e)}

    def handle_dl_schedulers(self, params, inputs):
        return {"sch": {"type": params.get("label", "Scheduler"), "params": params}}

    def handle_ml_supervised(self, params, inputs):
        from sklearn.linear_model import (
            LinearRegression,
            Ridge,
            Lasso,
            ElasticNet,
            LogisticRegression,
        )
        from sklearn.tree import DecisionTreeClassifier, DecisionTreeRegressor
        from sklearn.ensemble import (
            GradientBoostingClassifier,
            GradientBoostingRegressor,
        )
        from sklearn.neighbors import KNeighborsClassifier, KNeighborsRegressor

        try:
            import xgboost as xgb
        except ImportError:
            xgb = None
        try:
            import lightgbm as lgb
        except ImportError:
            lgb = None
        try:
            import catboost as cb
        except ImportError:
            cb = None

        op = params.get("label", "").lower()
        df_ref = inputs.get("in", {}).get("ref")
        if not df_ref or df_ref not in self.store:
            return {"model": None}
        df = self.store[df_ref].copy()

        try:
            X = df.iloc[:, :-1].select_dtypes(include=[int, float])
            y = df.iloc[:, -1]

            if "linear regression" in op:
                model = LinearRegression(
                    fit_intercept=params.get("fit_intercept", True)
                )
            elif "ridge" in op:
                model = Ridge(alpha=float(params.get("alpha", 1.0)))
            elif "lasso" in op:
                model = Lasso(alpha=float(params.get("alpha", 1.0)))
            elif "elasticnet" in op:
                model = ElasticNet(
                    alpha=float(params.get("alpha", 1.0)),
                    l1_ratio=float(params.get("l1_ratio", 0.5)),
                )
            elif "logistic regression" in op:
                model = LogisticRegression(
                    C=float(params.get("C", 1.0)),
                    max_iter=int(params.get("max_iter", 100)),
                )
            elif "decision tree" in op:
                model = DecisionTreeClassifier(
                    max_depth=int(params.get("max_depth", 10))
                )
            elif "gradient boosting" in op:
                model = GradientBoostingClassifier(
                    n_estimators=int(params.get("n_estimators", 100)),
                    learning_rate=float(params.get("learning_rate", 0.1)),
                )
            elif "lightgbm" in op:
                model = lgb.LGBMClassifier(
                    n_estimators=int(params.get("n_estimators", 100)),
                    learning_rate=float(params.get("learning_rate", 0.1)),
                )
            elif "catboost" in op:
                model = cb.CatBoostClassifier(
                    iterations=int(params.get("iterations", 100)),
                    learning_rate=float(params.get("learning_rate", 0.1)),
                    verbose=False,
                )
            elif "k-nn" in op:
                model = KNeighborsClassifier(
                    n_neighbors=int(params.get("n_neighbors", 5))
                )
            elif "hmm" in op:
                model = None  # mock hmm
            else:
                return {"model": None}

            if model is not None:
                model.fit(X, y)
                ref = f"model_{id(model)}"
                self.store[ref] = model
                return {"model": {"ref": ref, "type": op}}
            return {"model": None}
        except Exception as e:
            return {"error": str(e)}

    def handle_ml_unsupervised(self, params, inputs):
        from sklearn.mixture import GaussianMixture
        from sklearn.cluster import DBSCAN
        from sklearn.decomposition import PCA, TruncatedSVD, FastICA
        from sklearn.manifold import TSNE

        try:
            import umap
        except ImportError:
            umap = None

        op = params.get("label", "").lower()
        df_ref = inputs.get("in", {}).get("ref")
        if not df_ref or df_ref not in self.store:
            return {"model": None, "out": None}
        df = self.store[df_ref].copy()

        try:
            X = df.select_dtypes(include=[int, float])
            model = None
            out_df = None

            if "gmm" in op:
                model = GaussianMixture(n_components=int(params.get("n_components", 3)))
                model.fit(X)
            elif "dbscan" in op:
                model = DBSCAN(
                    eps=float(params.get("eps", 0.5)),
                    min_samples=int(params.get("min_samples", 5)),
                )
                model.fit(X)
            elif "pca" in op:
                model = PCA(n_components=int(params.get("n_components", 2)))
                res = model.fit_transform(X)
                out_df = pd.DataFrame(res)
            elif "svd" in op:
                model = TruncatedSVD(n_components=int(params.get("n_components", 2)))
                res = model.fit_transform(X)
                out_df = pd.DataFrame(res)
            elif "ica" in op:
                model = FastICA(n_components=int(params.get("n_components", 2)))
                res = model.fit_transform(X)
                out_df = pd.DataFrame(res)
            elif "t-sne" in op:
                model = TSNE(
                    n_components=int(params.get("n_components", 2)),
                    perplexity=float(params.get("perplexity", 30)),
                )
                res = model.fit_transform(X)
                out_df = pd.DataFrame(res)
            elif "umap" in op:
                model = umap.UMAP(
                    n_components=int(params.get("n_components", 2)),
                    n_neighbors=int(params.get("n_neighbors", 15)),
                )
                res = model.fit_transform(X)
                out_df = pd.DataFrame(res)
            elif "shallow autoencoder" in op:
                model = "mock_autoencoder"

            ret = {}
            if model is not None:
                m_ref = f"model_{id(model)}"
                self.store[m_ref] = model
                ret["model"] = {"ref": m_ref, "type": op}
            if out_df is not None:
                d_ref = f"df_{id(out_df)}"
                self.store[d_ref] = out_df
                ret["out"] = {
                    "ref": d_ref,
                    "cols": list(out_df.columns),
                    "rows": len(out_df),
                }
            return ret
        except Exception as e:
            return {"error": str(e)}

    def handle_ml_eval(self, params, inputs):
        op = params.get("label", "").lower()
        if "learning curve" in op or "calibration curve" in op:
            return {"plot": f"mock_{op.replace(' ', '_')}"}
        elif "save model" in op:
            return {"status": "saved"}
        elif "load model" in op:
            return {"model": {"ref": "mock_loaded_model", "type": "loaded"}}
        return {}

    def handle_data_source(self, params, inputs):
        import pandas as pd
        import numpy as np

        op = params.get("label", "").lower()
        try:
            if "json" in op:
                df = pd.DataFrame({"dummy": [1, 2, 3]})  # mock JSON load
                ref = f"df_{id(df)}"
                self.store[ref] = df
                return {"df": {"ref": ref, "cols": list(df.columns), "rows": len(df)}}
            elif "image folder" in op:
                res = [
                    np.zeros((3, 224, 224)).tolist() for _ in range(2)
                ]  # mock images
                return {"images": res}
            elif "text" in op:
                return {"text": "mock text file content"}
            elif "webcam" in op:
                return {"img": np.zeros((3, 224, 224)).tolist()}
            elif "microphone" in op:
                return {"audio": [0.0] * 16000}
            return {"out": None}
        except Exception:
            return {"error": True}

    def handle_data_transform(self, params, inputs):
        import pandas as pd
        import numpy as np

        op = params.get("label", "").lower()
        df_ref = inputs.get("in", {}).get("ref")
        if not df_ref or df_ref not in self.store:
            return {"out": None}
        df = self.store[df_ref].copy()

        try:
            if "standardize" in op:
                num_cols = df.select_dtypes(include=[np.number]).columns
                df[num_cols] = (df[num_cols] - df[num_cols].mean()) / df[num_cols].std()
            elif "one-hot" in op:
                df = pd.get_dummies(df)
            elif "label encode" in op or "ordinal" in op:
                for col in df.select_dtypes(include=["object"]).columns:
                    df[col] = df[col].astype("category").cat.codes
            elif "binning" in op:
                num_cols = df.select_dtypes(include=[np.number]).columns
                if len(num_cols) > 0:
                    df[num_cols[0]] = pd.cut(
                        df[num_cols[0]], bins=int(params.get("bins", 5))
                    )
            elif "shuffle" in op:
                df = df.sample(
                    frac=1, random_state=int(params.get("seed", 42))
                ).reset_index(drop=True)
            elif "filter rows" in op:
                df = df.head(int(len(df) / 2))  # mock filter
            elif "select columns" in op:
                cols = params.get("columns", "").split(",")
                cols = [c.strip() for c in cols if c.strip() in df.columns]
                if cols:
                    df = df[cols]
            elif "pivot" in op or "melt" in op or "resample" in op:
                pass  # skip complex shape changes for mock
            elif "missing values" in op:
                df = df.fillna(df.mean(numeric_only=True))

            ref = f"df_{id(df)}"
            self.store[ref] = df
            return {"out": {"ref": ref, "cols": list(df.columns), "rows": len(df)}}
        except Exception as e:
            return {"error": str(e)}

    def handle_data_merge(self, params, inputs):
        import pandas as pd

        ref_a = inputs.get("a", {}).get("ref")
        ref_b = inputs.get("b", {}).get("ref")
        if not ref_a or not ref_b or ref_a not in self.store or ref_b not in self.store:
            return {"out": None}
        df_a = self.store[ref_a]
        df_b = self.store[ref_b]
        df_merged = pd.concat([df_a, df_b], axis=1)  # mock inner join by concat
        ref = f"df_{id(df_merged)}"
        self.store[ref] = df_merged
        return {
            "out": {"ref": ref, "cols": list(df_merged.columns), "rows": len(df_merged)}
        }

    def handle_data_viz(self, params, inputs):
        # We mock plotting by returning a placeholder signal string that the frontend can interpret or ignore
        op = params.get("label", "").lower()
        return {"plot": f"mock_plot_data_for_{op}"}

    def handle_scalar_math(self, params, inputs):
        import math
        import numpy as np

        op = params.get("operation", "add")
        a = inputs.get("a", 0)
        b = inputs.get("b", 0)

        try:
            if op == "add":
                res = a + b
            elif op == "subtract":
                res = a - b
            elif op == "multiply":
                res = a * b
            elif op == "divide":
                res = a / b if b != 0 else 0
            elif op == "power":
                res = a**b
            elif op == "log":
                res = math.log(a, b) if a > 0 and b > 0 and b != 1 else 0
            elif op == "exp":
                res = math.exp(a)
            elif op == "sqrt":
                res = math.sqrt(a) if a >= 0 else 0
            elif op == "abs":
                res = abs(a)
            elif op == "clamp":
                res = max(0, min(a, 1))  # simplified clamp
            else:
                res = 0
            return {"out": res}
        except Exception:
            return {"out": 0}

    def handle_vector_math(self, params, inputs):
        import numpy as np

        op = params.get("operation", "cross product")
        a = np.array(inputs.get("a", [0, 0, 0]))
        b = np.array(inputs.get("b", [0, 0, 0]))

        try:
            if op == "cross product":
                res = np.cross(a, b).tolist()
            elif op == "normalize":
                res = (
                    (a / np.linalg.norm(a)).tolist()
                    if np.linalg.norm(a) > 0
                    else a.tolist()
                )
            elif op == "magnitude":
                res = float(np.linalg.norm(a))
            elif op == "cosine similarity":
                res = (
                    float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))
                    if np.linalg.norm(a) > 0 and np.linalg.norm(b) > 0
                    else 0
                )
            else:
                res = 0
            return {"out": res}
        except Exception:
            return {"out": 0}

    def handle_matrix_math(self, params, inputs):
        import numpy as np

        op = params.get("operation", "multiply matrix")
        a = np.array(inputs.get("a", [[1, 0], [0, 1]]))
        b = np.array(inputs.get("b", [[1, 0], [0, 1]]))

        try:
            if op == "multiply matrix":
                res = np.matmul(a, b).tolist()
            elif op == "transpose":
                res = np.transpose(a).tolist()
            elif op == "inverse":
                res = np.linalg.inv(a).tolist()
            elif op == "determinant":
                res = float(np.linalg.det(a))
            elif op == "eigenvalues":
                res = np.linalg.eigvals(a).tolist()
            else:
                res = 0
            return {"out": res}
        except Exception:
            return {"out": 0}

    def handle_stats_math(self, params, inputs):
        import numpy as np
        import scipy.stats as stats

        op = params.get("operation", "mean")
        data = np.array(inputs.get("in", [0]))

        try:
            if op == "mean":
                res = float(np.mean(data))
            elif op == "median":
                res = float(np.median(data))
            elif op == "mode":
                res = float(stats.mode(data, keepdims=True).mode[0])
            elif op == "std dev":
                res = float(np.std(data))
            elif op == "variance":
                res = float(np.var(data))
            elif op == "skewness":
                res = float(stats.skew(data))
            elif op == "kurtosis":
                res = float(stats.kurtosis(data))
            elif op == "covariance":
                res = np.cov(data).tolist()
            elif op == "histogram":
                res = np.histogram(data, bins=10)[0].tolist()
            else:
                res = 0
            return {"out": res}
        except Exception:
            return {"out": 0}

    def handle_probability_math(self, params, inputs):
        import numpy as np
        import scipy.stats as stats

        op = params.get("operation", "normal distribution")
        val = inputs.get("in", 0)
        mean = params.get("mean", 0)
        std = params.get("std", 1)

        try:
            if op == "normal distribution":
                res = float(stats.norm.pdf(val, loc=mean, scale=std))
            elif op == "binomial":
                res = float(stats.binom.pmf(int(val), n=10, p=0.5))
            elif op == "poisson":
                res = float(stats.poisson.pmf(int(val), mu=1.0))
            elif op == "uniform":
                res = float(stats.uniform.pdf(val, loc=0, scale=1))
            elif op == "sampling":
                res = float(np.random.normal(mean, std))
            elif op == "pdf":
                res = float(stats.norm.pdf(val, loc=mean, scale=std))
            elif op == "cdf":
                res = float(stats.norm.cdf(val, loc=mean, scale=std))
            elif op == "bayes theorem":
                res = 0.5  # mock
            else:
                res = 0
            return {"out": res}
        except Exception:
            return {"out": 0}

    def handle_calculus_math(self, params, inputs):
        op = params.get("operation", "numerical gradient")
        return {"out": f"mock_{op.replace(' ', '_')}"}

    def handle_math(self, params, inputs):
        # Universal Math Engine
        op = params.get("operation", "add")
        a = inputs.get("a", 0)
        b = inputs.get("b", 0)
        res = 0
        if op == "add":
            res = a + b
        elif op == "mul":
            res = a * b
        elif op == "dot_product":
            res = np.dot(a, b).tolist()
        return {"out": res}

    def handle_load_csv(self, params, inputs):
        path = params.get("filePath", "data.csv")
        if not self._validate_file_path(path):
            return {"df": None, "error": "Access Denied: Path outside user home or workspace directory is restricted."}
        try:
            df = pd.read_csv(path)
            ref = f"df_{id(df)}"
            self.store[ref] = df
            return {"df": {"ref": ref, "cols": list(df.columns), "rows": len(df)}}
        except Exception as e:
            return {"df": None, "error": f"Error loading CSV: {str(e)}"}

    def handle_load_data(self, params, inputs):
        path = params.get("filePath", "data.parquet")
        if not self._validate_file_path(path):
            return {"df": None, "error": "Access Denied: Path outside user home or workspace directory is restricted."}
        try:
            df = pd.read_parquet(path)
            ref = f"df_{id(df)}"
            self.store[ref] = df
            return {"df": {"ref": ref, "cols": list(df.columns), "rows": len(df)}}
        except Exception as e:
            return {"df": None, "error": f"Error loading Parquet: {str(e)}"}


    def handle_stats(self, params, inputs):
        df_ref = inputs.get("df", {}).get("ref")
        if not df_ref or df_ref not in self.store:
            return {"mat": None}
        df = self.store[df_ref]
        numeric_df = df.select_dtypes(include=[np.number])
        corr = numeric_df.corr().values.tolist()
        return {"mat": corr}

    def handle_numerical_grad(self, params, inputs):
        return {"g": "Not implemented"}

    def handle_split(self, params, inputs):
        from sklearn.model_selection import train_test_split

        df_ref = inputs.get("in", {}).get("ref")
        if not df_ref or df_ref not in self.store:
            return {"train": None, "test": None}
        df = self.store[df_ref]
        train_df, test_df = train_test_split(
            df,
            train_size=float(params.get("train_ratio", 0.8)),
            random_state=int(params.get("seed", 42)),
        )
        train_ref = f"df_{id(train_df)}"
        test_ref = f"df_{id(test_df)}"
        self.store[train_ref] = train_df
        self.store[test_ref] = test_df
        return {"train": {"ref": train_ref}, "test": {"ref": test_ref}}

    def handle_transform(self, params, inputs):
        df_ref = inputs.get("in", {}).get("ref")
        if not df_ref or df_ref not in self.store:
            return {"out": None}
        df = self.store[df_ref].copy()
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        df[numeric_cols] = (df[numeric_cols] - df[numeric_cols].min()) / (
            df[numeric_cols].max() - df[numeric_cols].min()
        )
        ref = f"df_{id(df)}"
        self.store[ref] = df
        return {"out": {"ref": ref}}

    def handle_synthetic_data(self, params, inputs):
        from sklearn.datasets import make_classification

        X, y = make_classification(
            n_samples=int(params.get("n_samples", 1000)),
            random_state=int(params.get("seed", 42)),
        )
        df = pd.DataFrame(X, columns=[f"feature_{i}" for i in range(X.shape[1])])
        df["target"] = y
        ref = f"df_{id(df)}"
        self.store[ref] = df
        return {"df": {"ref": ref, "cols": list(df.columns), "rows": len(df)}}

    def handle_scatter_plot(self, params, inputs):
        return {"plot": None}

    def handle_ml_train(self, params, inputs):
        # Generic ML Factory (Scikit-learn/XGBoost)
        from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
        from sklearn.svm import SVC
        from sklearn.naive_bayes import GaussianNB

        df_ref = inputs.get("in", {}).get("ref")
        if not df_ref or df_ref not in self.store:
            return {"model": None}
        df = self.store[df_ref]

        X = df.iloc[:, :-1].select_dtypes(include=[np.number])
        y = df.iloc[:, -1]

        model_type = params.get("model_type", "Random Forest")
        if "Forest" in model_type:
            model = RandomForestClassifier(
                n_estimators=int(params.get("n_estimators", 100))
            )
        elif "SVM" in model_type:
            model = SVC(C=float(params.get("C", 1.0)))
        elif "Naive" in model_type:
            model = GaussianNB()
        else:
            model = RandomForestClassifier()

        model.fit(X, y)
        ref = f"model_{id(model)}"
        self.store[ref] = model
        return {"model": {"ref": ref, "type": model_type}}

    def handle_cross_val(self, params, inputs):
        from sklearn.model_selection import cross_val_score

        model_ref = inputs.get("m", {}).get("ref")
        df_ref = inputs.get("d", {}).get("ref")
        if (
            not model_ref
            or model_ref not in self.store
            or not df_ref
            or df_ref not in self.store
        ):
            return {"score": 0}

        model = self.store[model_ref]
        df = self.store[df_ref]
        X = df.iloc[:, :-1].select_dtypes(include=[np.number])
        y = df.iloc[:, -1]
        scores = cross_val_score(model, X, y, cv=int(params.get("folds", 5)))
        return {"score": float(scores.mean())}

    def handle_dl_layer(self, params, inputs):
        layer_type = params.get("layer_type", "Dense")
        if "Dense" in layer_type:
            layer = nn.Linear(
                int(params.get("in_features", 10)), int(params.get("out_features", 10))
            )
        elif "Conv2D" in layer_type:
            layer = nn.Conv2d(
                int(params.get("in_channels", 3)),
                int(params.get("out_channels", 16)),
                int(params.get("kernel_size", 3)),
            )
        elif "LSTM" in layer_type:
            layer = nn.LSTM(
                int(params.get("input_size", 10)), int(params.get("hidden_size", 128))
            )
        else:
            layer = nn.BatchNorm1d(int(params.get("num_features", 10)))
        ref = f"layer_{id(layer)}"
        self.store[ref] = layer
        return {"out": {"ref": ref, "type": layer_type}}

    def handle_optimizer(self, params, inputs):
        return {
            "opt": {
                "type": "AdamW",
                "lr": float(params.get("lr", 0.001)),
                "weight_decay": float(params.get("weight_decay", 0.01)),
            }
        }

    async def handle_dl_train(self, params, inputs, websocket: WebSocket):
        # REAL Training Engine
        epochs = int(params.get("epochs", 5))
        lr = float(params.get("learning_rate", 0.01))

        # Create a simple dynamic model based on inputs
        model = nn.Sequential(nn.Linear(10, 10), nn.ReLU(), nn.Linear(10, 1)).to(
            self.device
        )
        optimizer = torch.optim.Adam(model.parameters(), lr=lr)
        criterion = nn.MSELoss()

        # Dummy data for the "real" loop demonstration
        X = torch.randn(32, 10).to(self.device)
        y = torch.randn(32, 1).to(self.device)

        for e in range(epochs):
            if hasattr(self, "cancel_event") and self.cancel_event.is_set():
                break
            optimizer.zero_grad()
            outputs = model(X)
            loss = criterion(outputs, y)
            loss.backward()
            optimizer.step()

            await websocket.send_text(
                json.dumps(
                    {
                        "type": "training_progress",
                        "epoch": e + 1,
                        "loss": float(loss.item()),
                    }
                )
            )
            await asyncio.sleep(0.1)

        ref = f"model_{id(model)}"
        self._store_obj(ref, model)
        return {"status": "trained", "model_ref": ref}

    def handle_yolo(self, params, inputs):
        img_data = inputs.get("img")
        if not img_data:
            return {"det": []}
        if not hasattr(self, "_yolo"):
            self._yolo = YOLO("yolov8n.pt")

        # Base64 to CV2
        if "," in img_data:
            img_data = img_data.split(",")[1]
        img_bytes = base64.b64decode(img_data)
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        results = self._yolo(img, conf=float(params.get("confidence_threshold", 0.25)))
        return {"det": results[0].boxes.data.tolist()}

    def handle_cv_backbone(self, params, inputs):
        import torchvision.models as models

        variant = params.get("variant", "resnet50").lower()
        if variant == "resnet50":
            model = models.resnet50(pretrained=params.get("pretrained", True))
        elif variant == "efficientnet":
            model = models.efficientnet_b0(pretrained=params.get("pretrained", True))
        else:
            model = models.resnet18(pretrained=params.get("pretrained", True))
        model.eval()
        ref = f"model_{id(model)}"
        self.store[ref] = model
        return {"feat": {"ref": ref, "type": "cv_backbone"}}

    def handle_nlp_prep(self, params, inputs):
        from transformers import AutoTokenizer

        tokenizer = AutoTokenizer.from_pretrained(
            params.get("model", "bert-base-uncased")
        )
        text = inputs.get("txt", "")
        tokens = tokenizer(text, return_tensors="pt")
        ref = f"tokens_{id(tokens)}"
        self.store[ref] = tokens
        return {"tok": {"ref": ref}}

    def handle_nlp_task(self, params, inputs):
        from transformers import pipeline

        task = (
            "sentiment-analysis"
            if "Sentiment" in params.get("label", "Sentiment Analysis")
            else "translation_en_to_fr"
        )
        nlp = pipeline(task)
        res = nlp(inputs.get("txt", "Hello world"))
        return {"out": res}

    def handle_doc_chunker(self, params, inputs):
        text = inputs.get("doc", "")
        size = int(params.get("size", 500))
        chunks = [text[i : i + size] for i in range(0, len(text), size)]
        return {"chunks": chunks}

    def handle_rag_retriever(self, params, inputs):
        from sentence_transformers import SentenceTransformer
        import faiss
        import numpy as np
        
        # Lazy load encoder
        if not hasattr(self, '_rag_encoder'):
            self._rag_encoder = SentenceTransformer('all-MiniLM-L6-v2')
        
        chunks = inputs.get("chunks", [])
        if not chunks:
            db = inputs.get("db", [])
            if isinstance(db, list):
                chunks = db
            elif isinstance(db, dict) and "chunks" in db:
                chunks = db["chunks"]
            elif isinstance(db, str):
                chunks = [db]
        
        query = inputs.get("q", "")
        top_k = int(params.get("k", params.get("top_k", 3)))
        
        if not chunks or not query:
            return {"doc": "No documents or query provided."}
        
        try:
            # Encode chunks and query
            chunk_embeddings = self._rag_encoder.encode(chunks)
            query_embedding = self._rag_encoder.encode([query])
            
            # Convert to float32 numpy arrays
            chunk_embeddings = np.array(chunk_embeddings).astype('float32')
            query_embedding = np.array(query_embedding).astype('float32')
            
            # Build FAISS index
            dim = chunk_embeddings.shape[1]
            index = faiss.IndexFlatIP(dim)
            faiss.normalize_L2(chunk_embeddings)
            faiss.normalize_L2(query_embedding)
            index.add(chunk_embeddings)
            
            # Search
            scores, indices = index.search(query_embedding, min(top_k, len(chunks)))
            
            retrieved_chunks = [chunks[i] for i in indices[0]]
            combined_text = "\n\n".join(retrieved_chunks)
            return {
                "doc": combined_text,
                "scores": scores[0].tolist(),
                "results": [{"chunk": chunks[i], "score": float(scores[0][j])} for j, i in enumerate(indices[0])]
            }
        except Exception as e:
            return {"doc": f"Error during retrieval: {str(e)}"}


    def handle_diffusion_scheduler(self, params, inputs):
        return {
            "sch": {
                "type": params.get("type", "DPM++"),
                "steps": params.get("steps", 20),
            }
        }

    def handle_interpret(self, params, inputs):
        return {"p": "mock_shap_plot_data"}

    def handle_kids_nlp(self, params, inputs):
        text = str(inputs.get("t", "")).lower()
        emoji = "😊"
        if "sad" in text or "bad" in text:
            emoji = "😢"
        elif "mad" in text or "angry" in text:
            emoji = "😠"
        return {"e": emoji}

    def handle_whisper(self, params, inputs):
        audio_path = params.get("audioPath", "audio.mp3")
        # In a real app, we'd use: model = whisper.load_model("base")
        # result = model.transcribe(audio_path)
        return {"text": f"[Transcribed Speech from {audio_path}] Hello world!"}

    def handle_kids_gen(self, params, inputs):
        hero = inputs.get("hero", "A brave explorer")
        return {"story": f"Once upon a time, {hero} found a magic AI crystal..."}

    # --- EXTENSION HANDLERS ---

    def handle_custom_python(self, params, inputs):
        code = params.get("code", "def main(input):\n  return input")
        try:
            # Compile with RestrictedPython
            compiled = compile_restricted(code, '<usercode>', 'exec')
            
            # Safe builtins only
            safe_builtins = copy.copy(safe_globals)
            # Ensure the __builtins__ dict has basic and math modules
            safe_builtins['_print_'] = lambda x: x  # allow print statement/function
            safe_builtins['math'] = __import__('math')
            safe_builtins['_getiter_'] = iter
            safe_builtins['_getattr_'] = getattr
            
            # Prepare local variables
            local_vars = {"input_data": inputs.get("in"), "result": None}
            
            def run_sandboxed():
                # Execute user code to define functions
                exec(compiled, safe_builtins, local_vars)
                # Call main function
                exec("result = main(input_data)", safe_builtins, local_vars)
                return local_vars.get("result")
            
            # 10-second timeout using ThreadPoolExecutor
            with ThreadPoolExecutor(max_workers=1) as executor:
                future = executor.submit(run_sandboxed)
                try:
                    result = future.result(timeout=10)
                    return {"out": result}
                except TimeoutError:
                    return {"out": None, "error": "Execution timed out (10s limit)"}
                except Exception as e:
                    return {"out": None, "error": str(e)}
        except Exception as e:
            return {"out": None, "error": f"Compilation/Execution Error: {str(e)}"}


    def handle_metrics(self, params, inputs):
        from sklearn.metrics import accuracy_score, f1_score

        y_true = inputs.get("y_true", [])
        y_pred = inputs.get("y_pred", [])
        metric = params.get("metric", "accuracy")

        if not y_true or not y_pred:
            return {"score": 0}

        if metric == "accuracy":
            score = accuracy_score(y_true, y_pred)
        else:
            score = f1_score(y_true, y_pred, average="weighted")
        return {"score": float(score)}

    def handle_table_viewer(self, params, inputs):
        df_ref = inputs.get("df", {}).get("ref")
        if not df_ref or df_ref not in self.store:
            return {"preview": "No data"}
        df = self.store[df_ref]
        return {"preview": df.head(10).to_dict(orient="records")}

    def handle_image_preview(self, params, inputs):
        # Simply passes through the image for visualization on the node
        return {"img": inputs.get("img")}

    def handle_onnx_export(self, params, inputs):
        model_ref = inputs.get("model", {}).get("ref")
        filename = params.get("filename", "model.onnx")
        if not model_ref or model_ref not in self.store:
            return {"file": None, "error": "Model not found"}

        model = self.store[model_ref]
        dummy_input = torch.randn(1, 10).to(self.device)
        torch.onnx.export(model, dummy_input, filename)
        return {"file": filename}

    async def handle_generate_pipeline(self, prompt, websocket: WebSocket):
        # Try llama_cpp first (cached)
        if not hasattr(self, '_llm'):
            self._llm = None
            try:
                import llama_cpp
                # Only load if the file exists to avoid crashes
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
                res = await asyncio.to_thread(self._hf_gen, f"AI pipeline request: {prompt}", max_new_tokens=50)
                result = res[0]['generated_text']
            except Exception:
                result = prompt  # absolute fallback
        else:
            # Stream tokens from llama_cpp
            try:
                def run_stream():
                    tokens = []
                    for token in self._llm(
                        f"Q: What nodeflow template matches: '{prompt}'? A:",
                        max_tokens=50, stream=True
                    ):
                        tokens.append(token["choices"][0]["text"])
                    return "".join(tokens)
                result = await asyncio.to_thread(run_stream)
            except Exception:
                result = prompt

        # Route to template
        result_lower = result.lower()
        if "rag" in result_lower or "chat" in result_lower or "text" in result_lower:
            templateId = "rag-pipeline"
        elif "yolo" in result_lower or "detect" in result_lower or "image" in result_lower:
            templateId = "yolo-detection"
        else:
            templateId = "linear-regression"

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
            params = node["data"].get("parameters", {})

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
                vram_total = 8.0

                if torch.cuda.is_available():
                    vram_used = torch.cuda.memory_allocated() / (1024**3)
                    vram_total = torch.cuda.get_device_properties(0).total_memory / (
                        1024**3
                    )

                await websocket.send_text(
                    json.dumps(
                        {
                            "type": "stats",
                            "data": {
                                "device": self.device.upper(),
                                "vram_used": round(vram_used, 2),
                                "vram_total": round(vram_total, 2),
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
            await websocket.close(code=4001, reason="Invalid token")
            return
    except Exception:
        await websocket.close(code=4001, reason="Authentication failed")
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
            elif msg["type"] == "stop_pipeline":
                engine.cancel_event.set()
                if engine.current_task:
                    engine.current_task.cancel()
    except Exception:
        pass
    finally:
        stats_task.cancel()



if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)

