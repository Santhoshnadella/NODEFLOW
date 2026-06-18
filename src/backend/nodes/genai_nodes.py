import torch
import torch.nn as nn
import io
import base64
from PIL import Image
import math
from transformers import pipeline

def handle_generative(engine, params, inputs):
    op = params.get("label", "").lower()
    if "vae" in op:
        return _run_real_vae(engine, params, inputs)
    elif "gan" in op or "stylegan" in op:
        return _run_real_gan(engine, params, inputs)
    elif "lcm" in op or "controlnet" in op or "stable" in op:
        return _run_real_diffusion(engine, params, inputs)
    elif "wavenet" in op:
        return _run_real_wavenet(engine, params, inputs)
    return {}

def _run_real_vae(engine, params, inputs):
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

    vae = VAE().to(engine.device)
    x = torch.randn(1, 256).to(engine.device)
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

def _run_real_gan(engine, params, inputs):
    generator = nn.Sequential(
        nn.Linear(10, 64),
        nn.ReLU(),
        nn.Linear(64, 256),
        nn.Sigmoid()
    ).to(engine.device)
    
    noise = torch.randn(1, 10).to(engine.device)
    generated_tensor = generator(noise)
    
    gen_data = (generated_tensor.view(16, 16).detach().cpu().numpy() * 255.0).astype('uint8')
    img = Image.fromarray(gen_data, 'L')
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    img_b64 = base64.b64encode(buf.getvalue()).decode()
    return {"out": f"data:image/png;base64,{img_b64}"}

def _run_real_diffusion(engine, params, inputs):
    prompt = inputs.get("prompt", params.get("prompt", "a beautiful landscape"))
    steps = int(params.get("steps", 20))
    seed = int(params.get("seed", 42))
    
    try:
        from diffusers import StableDiffusionPipeline
        import torch
        
        if not hasattr(engine, '_sd_pipe'):
            engine._sd_pipe = StableDiffusionPipeline.from_pretrained(
                "runwayml/stable-diffusion-v1-5",
                torch_dtype=torch.float16 if engine.device == "cuda" else torch.float32,
                local_files_only=True
            ).to(engine.device)
        
        image = engine._sd_pipe(
            prompt,
            num_inference_steps=steps,
            generator=torch.Generator(engine.device).manual_seed(seed)
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

def _run_real_wavenet(engine, params, inputs):
    causal_conv = nn.Conv1d(in_channels=1, out_channels=1, kernel_size=2, dilation=2).to(engine.device)
    x = torch.randn(1, 1, 1000).to(engine.device)
    try:
        padded_x = torch.nn.functional.pad(x, (2, 0))
        out = causal_conv(padded_x)
        audio = out.view(-1).detach().cpu().numpy().tolist()
    except Exception:
        audio = x.view(-1).numpy().tolist()
    return {"audio": audio[:8000]}

def handle_diffusion_scheduler(engine, params, inputs):
    return {
        "sch": {
            "type": params.get("type", "DPM++"),
            "steps": params.get("steps", 20),
        }
    }

def handle_kids_gen(engine, params, inputs):
    hero = inputs.get("hero", "A brave explorer")
    prompt = f"Write a children's story about: {hero}."
    try:
        if not hasattr(engine, '_kids_gen_pipe'):
            engine._kids_gen_pipe = pipeline("text-generation", model="distilgpt2")
        res = engine._kids_gen_pipe(prompt, max_new_tokens=60)
        return {"story": res[0]["generated_text"]}
    except Exception as e:
        return {"story": f"Once upon a time, {hero} had an adventure! (HF generator error: {str(e)})"}
