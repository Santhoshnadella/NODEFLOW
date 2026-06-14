import pytest
import pandas as pd
import numpy as np

def test_data_transforms(engine, sample_df):
    ref = f"df_{id(sample_df)}"
    engine.store[ref] = sample_df
    
    # Standardize
    res = engine.handle_data_transform({"label": "standardize"}, {"in": {"ref": ref}})
    assert res["out"] is not None
    standardized_df = engine.store[res["out"]["ref"]]
    assert np.isclose(standardized_df["feat1"].mean(), 0.0, atol=1e-7)

    # One-hot
    res = engine.handle_data_transform({"label": "one-hot"}, {"in": {"ref": ref}})
    assert res["out"] is not None

    # Shuffle
    res = engine.handle_data_transform({"label": "shuffle", "seed": 42}, {"in": {"ref": ref}})
    assert res["out"] is not None

    # Missing values
    sample_df.iloc[0, 0] = np.nan
    res = engine.handle_data_transform({"label": "missing values", "strategy": "mean"}, {"in": {"ref": ref}})
    assert res["out"] is not None
    assert not np.isnan(engine.store[res["out"]["ref"]].iloc[0, 0])

def test_data_merge(engine, sample_df):
    ref = f"df_{id(sample_df)}"
    engine.store[ref] = sample_df
    
    res = engine.handle_data_merge({"how": "inner"}, {"a": {"ref": ref}, "b": {"ref": ref}})
    assert res["out"] is not None
    assert res["out"]["rows"] == len(sample_df)

def test_ml_supervised(engine, sample_df):
    ref = f"df_{id(sample_df)}"
    engine.store[ref] = sample_df
    
    # Train random forest
    res = engine.handle_ml_train({"label": "random forest", "n_estimators": 5}, {"in": {"ref": ref}})
    assert res["model"] is not None
    model_ref = res["model"]["ref"]
    assert model_ref in engine.store
    
    # Train HMM
    res = engine.handle_ml_supervised({"label": "hmm", "n_components": 2}, {"in": {"ref": ref}})
    assert res["model"] is not None

def test_ml_unsupervised(engine, sample_df):
    ref = f"df_{id(sample_df)}"
    engine.store[ref] = sample_df
    
    # Shallow Autoencoder
    res = engine.handle_ml_unsupervised({"label": "shallow autoencoder", "n_components": 2}, {"in": {"ref": ref}})
    assert res["model"] is not None
    assert res["out"] is not None
    assert res["out"]["rows"] == len(sample_df)

def test_ml_eval(engine, sample_df):
    ref = f"df_{id(sample_df)}"
    engine.store[ref] = sample_df
    
    # Train model first
    rf_res = engine.handle_ml_train({"label": "random forest", "n_estimators": 5}, {"in": {"ref": ref}})
    model_ref = rf_res["model"]["ref"]
    
    # Learning curve
    res = engine.handle_ml_eval({"label": "learning curve"}, {"model": {"ref": model_ref}, "df": {"ref": ref}})
    assert "plot" in res
    assert res["plot"].startswith("data:image/png;base64,")

    # Calibration curve
    res = engine.handle_ml_eval({"label": "calibration curve"}, {"model": {"ref": model_ref}, "df": {"ref": ref}})
    assert "plot" in res
    assert res["plot"].startswith("data:image/png;base64,")

def test_mlops(engine, sample_df):
    ref = f"df_{id(sample_df)}"
    engine.store[ref] = sample_df
    
    # Drift
    res = engine.handle_mlops({"label": "drift"}, {"reference_df": {"ref": ref}, "new_df": {"ref": ref}})
    assert "drift" in res
    assert "detected" in res["drift"]
    
    # API Code Generation
    res = engine.handle_mlops({"label": "api endpoint"}, {})
    assert "api_code" in res
    assert "FastAPI" in res["api_code"]
