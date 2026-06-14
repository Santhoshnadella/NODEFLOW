import pytest
import numpy as np
import pandas as pd
import torch
import os
import sys

# Add backend directory to path
sys.path.insert(0, os.path.abspath(os.path.dirname(os.path.dirname(__file__))))

from main import NodeFlowEngine

@pytest.fixture(scope="session")
def engine():
    return NodeFlowEngine()

@pytest.fixture
def sample_df():
    # A simple 10-row dataset for testing ML models
    np.random.seed(42)
    X = np.random.rand(10, 3)
    # y is a simple binary target: 1 if sum of features > 1.5 else 0
    y = (X.sum(axis=1) > 1.5).astype(int)
    df = pd.DataFrame(X, columns=["feat1", "feat2", "feat3"])
    df["target"] = y
    return df

@pytest.fixture
def sample_image():
    # A small 3x224x224 image tensor
    return np.random.rand(3, 224, 224).astype(np.float32).tolist()

@pytest.fixture
def sample_audio():
    # 2 seconds of 16kHz audio (silent sine wave)
    fs = 16000
    t = np.linspace(0, 2.0, int(2.0 * fs), endpoint=False)
    audio = 0.5 * np.sin(2 * np.pi * 440 * t)
    return audio.tolist()
