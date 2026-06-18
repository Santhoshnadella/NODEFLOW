import torch
import torch.nn as nn
import json
import asyncio
from fastapi import WebSocket

def handle_dl_activations(engine, params, inputs):
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
    engine.store[ref] = layer
    return {"out": {"ref": ref, "type": "activation"}}

def handle_dl_losses(engine, params, inputs):
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
        if pred_ref in engine.store and target_ref in engine.store:
            pred = engine.store[pred_ref]
            target = engine.store[target_ref]
            val = loss_fn(pred, target)
            return {"loss": float(val.item())}
        return {"loss": 0.0}
    except Exception as e:
        return {"error": str(e)}

def handle_dl_schedulers(engine, params, inputs):
    return {"sch": {"type": params.get("label", "Scheduler"), "params": params}}

def handle_dl_layer(engine, params, inputs):
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
    engine.store[ref] = layer
    return {"out": {"ref": ref, "type": layer_type}}

def handle_optimizer(engine, params, inputs):
    return {
        "opt": {
            "type": "AdamW",
            "lr": float(params.get("lr", 0.001)),
            "weight_decay": float(params.get("weight_decay", 0.01)),
        }
    }

async def handle_dl_train(engine, params, inputs, websocket: WebSocket):
    epochs = int(params.get("epochs", 5))
    lr = float(params.get("learning_rate", 0.01))

    model = nn.Sequential(nn.Linear(10, 10), nn.ReLU(), nn.Linear(10, 1)).to(
        engine.device
    )
    optimizer = torch.optim.Adam(model.parameters(), lr=lr)
    criterion = nn.MSELoss()

    X = torch.randn(32, 10).to(engine.device)
    y = torch.randn(32, 1).to(engine.device)

    for e in range(epochs):
        if hasattr(engine, "cancel_event") and engine.cancel_event.is_set():
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
    engine._store_obj(ref, model)
    return {"status": "trained", "model_ref": ref}

def handle_onnx_export(engine, params, inputs):
    model_ref = inputs.get("model", {}).get("ref")
    filename = params.get("filename", "model.onnx")
    if not model_ref or model_ref not in engine.store:
        return {"file": None, "error": "Model not found"}

    model = engine.store[model_ref]
    dummy_input = torch.randn(1, 10).to(engine.device)
    torch.onnx.export(model, dummy_input, filename)
    return {"file": filename}
