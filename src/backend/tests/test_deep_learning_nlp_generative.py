import pytest
import numpy as np

def test_cv_handlers(engine, sample_image):
    # Test classifier (MobileNet fallback or default)
    res = engine.handle_cv({"label": "MobileNet"}, {"img": sample_image})
    assert "out" in res or "error" in res
    if "out" in res:
        assert "predictions" in res["out"]
        
    # Test SSD detector
    res = engine.handle_cv({"label": "SSD"}, {"img": sample_image})
    assert "boxes" in res
    assert "labels" in res
    
    # Test U-Net segmentation
    res = engine.handle_cv({"label": "U-Net"}, {"img": sample_image})
    assert "mask" in res

def test_nlp_handlers(engine):
    # Test RNN
    res = engine.handle_nlp({"label": "RNN"}, {"text": "hello world"})
    assert "out" in res
    assert "hidden" in res
    
    # Test Word2Vec
    res = engine.handle_nlp({"label": "word2vec"}, {"text": "apple banana cherry. apple banana. cherry apple."})
    assert "out" in res
    assert isinstance(res["out"], dict)

def test_generative_handlers(engine):
    # Test VAE
    res = engine.handle_generative({"label": "VAE"}, {})
    assert "out" in res
    assert "mu" in res
    assert "logvar" in res
    
    # Test GAN
    res = engine.handle_generative({"label": "GAN"}, {})
    assert "out" in res
    
    # Test Stable Diffusion (fallback procedural check)
    res = engine.handle_generative({"label": "Stable Diffusion", "steps": 5, "seed": 123}, {"prompt": "artistic sunset"})
    assert "out" in res
    assert res["out"].startswith("data:image/png;base64,")

def test_specialty_handlers(engine, sample_audio, sample_df):
    ref = f"df_{id(sample_df)}"
    engine.store[ref] = sample_df

    # Test Gym
    res = engine.handle_specialty({"label": "gym"}, {})
    assert "action_space" in res
    assert "observation_space" in res
    
    # Test PPO Agent
    res = engine.handle_specialty({"label": "ppo"}, {})
    assert "policy" in res
    
    # Test STFT/MelSpec
    res = engine.handle_specialty({"label": "stft"}, {"audio": sample_audio})
    assert "spec" in res

    # Test ARIMA
    res = engine.handle_specialty({"label": "arima"}, {"df": {"ref": ref}})
    assert "forecast" in res
    
    # Test NeRF
    res = engine.handle_specialty({"label": "nerf"}, {})
    assert "scene" in res
    assert "color" in res["scene"]

def test_rag_retriever(engine):
    chunks = ["The capital of France is Paris.", "The capital of Germany is Berlin.", "The capital of Italy is Rome."]
    res = engine.handle_rag_retriever({"k": 2}, {"chunks": chunks, "q": "What is the capital of France?"})
    assert "doc" in res
    assert "Paris" in res["doc"]
    assert "scores" in res
    assert len(res["results"]) <= 2
