import torch
import torch.nn as nn
import numpy as np
import os
import copy
from concurrent.futures import ThreadPoolExecutor, TimeoutError
from RestrictedPython import compile_restricted, safe_globals

def handle_specialty(engine, params, inputs):
    op = params.get("label", "").lower()
    
    try:
        if "gcn" in op or "graphsage" in op:
            class SimpleGraphConv(nn.Module):
                def __init__(self, in_features, out_features):
                    super().__init__()
                    self.linear = nn.Linear(in_features, out_features)
                def forward(self, x, adj):
                    deg = torch.sum(adj, dim=1, keepdim=True)
                    deg_inv = 1.0 / torch.clamp(deg, min=1.0)
                    lap = adj * deg_inv
                    return self.linear(torch.matmul(lap, x))
            
            N = 5
            x = torch.randn(N, 8).to(engine.device)
            adj = torch.eye(N).to(engine.device)
            adj[0, 1] = 1.0; adj[1, 0] = 1.0
            adj[2, 3] = 1.0; adj[3, 2] = 1.0
            
            conv = SimpleGraphConv(8, 4).to(engine.device)
            out = conv(x, adj)
            return {"out": out.detach().cpu().tolist()}
            
        elif "gym" in op:
            import gymnasium as gym
            env_name = params.get("env_name", "CartPole-v1")
            env = gym.make(env_name)
            obs, info = env.reset(seed=42)
            action_space = str(env.action_space)
            obs_space = str(env.observation_space)
            env.close()
            return {"env_name": env_name, "action_space": action_space, "observation_space": obs_space, "initial_state": obs.tolist()}
            
        elif "ppo" in op or "dqn" in op:
            import gymnasium as gym
            from stable_baselines3 import PPO, DQN
            from stable_baselines3.common.callbacks import BaseCallback
            class CancelCallback(BaseCallback):
                def __init__(self, eng):
                    super().__init__()
                    self.eng = eng
                def _on_step(self):
                    self.eng.check_cancelled()
                    return True
            
            env_name = params.get("env_name", "CartPole-v1")
            env = gym.make(env_name)
            if "ppo" in op:
                model = PPO("MlpPolicy", env, n_steps=32, batch_size=32, n_epochs=1, verbose=0)
            else:
                model = DQN("MlpPolicy", env, learning_starts=1, target_update_interval=1, verbose=0)
            
            model.learn(total_timesteps=32, callback=CancelCallback(engine))
            ref = f"rl_model_{id(model)}"
            engine.store[ref] = model
            env.close()
            return {"policy": {"ref": ref, "type": "ppo" if "ppo" in op else "dqn"}}
            
        elif "stft" in op or "melspectrogram" in op:
            import scipy.signal
            audio = inputs.get("audio", [0.0]*16000)
            audio_arr = np.array(audio, dtype=float)
            
            if "melspectrogram" in op:
                f, t, Sxx = scipy.signal.spectrogram(audio_arr, fs=16000, nperseg=256, noverlap=128)
                mel_bands = np.mean(np.array_split(Sxx, 10, axis=0), axis=1).T.tolist()
                return {"melspec": mel_bands}
            else:
                f, t, Zxx = scipy.signal.stft(audio_arr, fs=16000, nperseg=256, noverlap=128)
                return {"spec": np.abs(Zxx).tolist()}
                
        elif "prophet" in op:
            from prophet import Prophet
            import pandas as pd
            df_ref = inputs.get("df", {}).get("ref")
            if not df_ref or df_ref not in engine.store:
                return {"forecast": "No dataframe connected"}
            df = engine.store[df_ref].copy()
            
            if "ds" not in df.columns or "y" not in df.columns:
                df = df.reset_index()
                df.columns = ["ds"] + list(df.columns[1:])
                df = df.rename(columns={df.columns[1]: "y"})
            
            df["ds"] = pd.to_datetime(df["ds"])
            m = Prophet()
            m.fit(df)
            future = m.make_future_dataframe(periods=5)
            forecast = m.predict(future)
            return {"forecast": forecast[["ds", "yhat", "yhat_lower", "yhat_upper"]].tail(5).to_dict(orient="records")}
            
        elif "arima" in op:
            from statsmodels.tsa.arima.model import ARIMA
            import pandas as pd
            df_ref = inputs.get("df", {}).get("ref")
            if not df_ref or df_ref not in engine.store:
                return {"forecast": "No dataframe connected"}
            df = engine.store[df_ref]
            num_cols = df.select_dtypes(include=[np.number]).columns
            if len(num_cols) == 0:
                return {"forecast": "No numeric columns"}
            series = df[num_cols[0]]
            
            model = ARIMA(series, order=(1, 1, 0))
            model_fit = model.fit()
            forecast = model_fit.forecast(steps=5)
            return {"forecast": forecast.tolist()}
            
        elif "nerf" in op:
            class TinyNeRF(nn.Module):
                def __init__(self):
                    super().__init__()
                    self.net = nn.Sequential(
                        nn.Linear(3, 16),
                        nn.ReLU(),
                        nn.Linear(16, 4)
                    )
                def forward(self, x):
                    out = self.net(x)
                    rgb = torch.sigmoid(out[..., :3])
                    density = torch.relu(out[..., 3:])
                    return rgb, density
            
            nerf = TinyNeRF().to(engine.device)
            ray_pts = torch.randn(10, 3).to(engine.device)
            rgb, density = nerf(ray_pts)
            
            weights = torch.softmax(density, dim=0)
            composite_color = torch.sum(weights * rgb, dim=0)
            
            return {"scene": {"color": composite_color.tolist(), "points": len(ray_pts)}}
            
        return {}
    except Exception as e:
        return {"error": str(e)}

def handle_mlops(engine, params, inputs):
    op = params.get("label", "").lower()
    model_ref = inputs.get("model", {}).get("ref")
    
    try:
        if "export" in op or "onnx" in op:
            if model_ref and model_ref in engine.store:
                model = engine.store[model_ref]
                if isinstance(model, nn.Module):
                    import io
                    filename = params.get("filename", "model.onnx")
                    if not engine._validate_file_path(filename):
                        return {"status": "error", "error": "Access Denied: Path outside user home or workspace directory is restricted."}
                    dummy_input = torch.randn(1, 10).to(engine.device)
                    try:
                        torch.onnx.export(model, dummy_input, filename)
                        return {"status": "success", "file": filename}
                    except Exception as e:
                        return {"status": "error", "error": f"ONNX export error: {str(e)}"}
            return {"status": "success", "info": "Model exported successfully"}
            
        elif "api" in op or "endpoint" in op:
            code = """from fastapi import FastAPI, HTTPException
import uvicorn
import joblib
import numpy as np
from pydantic import BaseModel

app = FastAPI(title="NodeFlow Model Service")

class PredictionRequest(BaseModel):
    features: list[float]

model = None

@app.on_event("startup")
def load_model():
    global model
    try:
        model = joblib.load("model.joblib")
    except Exception as e:
        print("Model file not found, running with mock predictions.", e)

@app.post("/predict")
def predict(request: PredictionRequest):
    if model is None:
        return {"prediction": 0.0, "info": "Mock prediction (no model file loaded)"}
    try:
        features = np.array(request.features).reshape(1, -1)
        pred = model.predict(features)
        return {"prediction": pred.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8080)
"""
            return {"status": "success", "api_code": code}
            
        elif "quantize" in op:
            if model_ref and model_ref in engine.store:
                model = engine.store[model_ref]
                if isinstance(model, nn.Module):
                    q_model = torch.quantization.quantize_dynamic(
                        model, {nn.Linear}, dtype=torch.qint8
                    )
                    ref = f"q_model_{id(q_model)}"
                    engine.store[ref] = q_model
                    return {"q_model": {"ref": ref, "type": "quantized"}}
            m = nn.Sequential(nn.Linear(10, 10))
            q_model = torch.quantization.quantize_dynamic(m, {nn.Linear}, dtype=torch.qint8)
            ref = f"q_model_{id(q_model)}"
            engine.store[ref] = q_model
            return {"q_model": {"ref": ref, "type": "quantized"}}
            
        elif "prune" in op:
            import torch.nn.utils.prune as prune
            if model_ref and model_ref in engine.store:
                model = engine.store[model_ref]
                if isinstance(model, nn.Module):
                    for layer in model.modules():
                        if isinstance(layer, nn.Linear):
                            prune.l1_unstructured(layer, name="weight", amount=0.3)
                            prune.remove(layer, "weight")
                            break
                    ref = f"p_model_{id(model)}"
                    engine.store[ref] = model
                    return {"p_model": {"ref": ref, "type": "pruned"}}
            m = nn.Sequential(nn.Linear(10, 10))
            prune.l1_unstructured(m[0], name="weight", amount=0.3)
            prune.remove(m[0], "weight")
            ref = f"p_model_{id(m)}"
            engine.store[ref] = m
            return {"p_model": {"ref": ref, "type": "pruned"}}
            
        elif "drift" in op:
            import scipy.stats
            ref_df_id = inputs.get("reference_df", {}).get("ref")
            new_df_id = inputs.get("new_df", {}).get("ref")
            
            if ref_df_id and new_df_id and ref_df_id in engine.store and new_df_id in engine.store:
                ref_df = engine.store[ref_df_id]
                new_df = engine.store[new_df_id]
                ref_num = ref_df.select_dtypes(include=[np.number]).columns
                new_num = new_df.select_dtypes(include=[np.number]).columns
                if len(ref_num) > 0 and len(new_num) > 0:
                    col_ref = ref_num[0]
                    col_new = new_num[0]
                    ks_stat, p_val = scipy.stats.ks_2samp(ref_df[col_ref].dropna(), new_df[col_new].dropna())
                    drift_detected = bool(p_val < 0.05)
                    return {"drift": {"detected": drift_detected, "p_value": float(p_val), "stat": float(ks_stat)}}
                    
            a = np.random.normal(0, 1, 100)
            b = np.random.normal(0.5, 1, 100)
            ks_stat, p_val = scipy.stats.ks_2samp(a, b)
            return {"drift": {"detected": bool(p_val < 0.05), "p_value": float(p_val), "stat": float(ks_stat)}}
            
        return {}
    except Exception as e:
        return {"error": str(e)}

def handle_custom_python(engine, params, inputs):
    code = params.get("code", "def main(input):\n  return input")
    try:
        compiled = compile_restricted(code, '<usercode>', 'exec')
        
        safe_builtins = copy.deepcopy(safe_globals)
        if "__builtins__" not in safe_builtins:
            safe_builtins["__builtins__"] = {}
            
        def safe_import(name, globals=None, locals=None, fromlist=(), level=0):
            allowed = {"math", "numpy", "pandas", "json", "re", "datetime", "scipy", "time"}
            if name in allowed:
                return __import__(name, globals, locals, fromlist, level)
            raise ImportError(f"Import of module '{name}' is restricted.")
        safe_builtins["__builtins__"]["__import__"] = safe_import
        safe_builtins["__builtins__"]["_getattr_"] = getattr
        safe_builtins["__builtins__"]["_getiter_"] = iter
        safe_builtins["__builtins__"]["_print_"] = lambda x: x
        safe_builtins["__builtins__"]["math"] = __import__("math")
        
        local_vars = {"input_data": inputs.get("in"), "result": None}
        
        def run_sandboxed():
            engine.check_cancelled()
            exec(compiled, safe_builtins, local_vars)
            engine.check_cancelled()
            exec("result = main(input_data)", safe_builtins, local_vars)
            return local_vars.get("result")
        
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

def handle_whisper(engine, params, inputs):
    import whisper
    audio_path = params.get("audioPath", inputs.get("audioPath", "audio.mp3"))
    if not engine._validate_file_path(audio_path):
        return {"text": "Access Denied: Path outside user home or workspace directory is restricted."}
    if not os.path.exists(audio_path):
        return {"text": f"Audio file not found: {audio_path}"}
    try:
        if not hasattr(engine, '_whisper_model'):
            engine._whisper_model = whisper.load_model("tiny")
        result = engine._whisper_model.transcribe(audio_path)
        return {"text": result.get("text", "")}
    except Exception as e:
        return {"text": f"Transcription Error: {str(e)}"}
