import pytest
import numpy as np

def test_scalar_math(engine):
    # 10 scalar operations + edge cases
    ops = ["add", "subtract", "multiply", "divide", "power", "log", "exp", "sqrt", "abs", "clamp"]
    for op in ops:
        res = engine.handle_scalar_math({"operation": op}, {"a": 4.0, "b": 2.0})
        assert "out" in res
        if op == "add": assert res["out"] == 6.0
        elif op == "subtract": assert res["out"] == 2.0
        elif op == "multiply": assert res["out"] == 8.0
        elif op == "divide": assert res["out"] == 2.0
        elif op == "power": assert res["out"] == 16.0
        elif op == "log": assert res["out"] == 2.0
        elif op == "exp": assert res["out"] > 0
        elif op == "sqrt": assert res["out"] == 2.0
        elif op == "abs": assert res["out"] == 4.0
        elif op == "clamp": assert res["out"] == 1.0

    # Div by zero
    assert engine.handle_scalar_math({"operation": "divide"}, {"a": 4.0, "b": 0.0})["out"] == 0
    # Negative sqrt
    assert engine.handle_scalar_math({"operation": "sqrt"}, {"a": -4.0, "b": 2.0})["out"] == 0
    # Log domain edge cases
    assert engine.handle_scalar_math({"operation": "log"}, {"a": -4.0, "b": 2.0})["out"] == 0

def test_vector_math(engine):
    # Cross, Normalize, Magnitude, Cosine
    v1 = [1.0, 0.0, 0.0]
    v2 = [0.0, 1.0, 0.0]
    
    # Cross product
    res = engine.handle_vector_math({"operation": "cross product"}, {"a": v1, "b": v2})
    assert res["out"] == [0.0, 0.0, 1.0]
    
    # Magnitude
    res = engine.handle_vector_math({"operation": "magnitude"}, {"a": [3.0, 4.0, 0.0]})
    assert res["out"] == 5.0
    
    # Normalize
    res = engine.handle_vector_math({"operation": "normalize"}, {"a": [3.0, 4.0, 0.0]})
    assert np.allclose(res["out"], [0.6, 0.8, 0.0])
    
    # Cosine similarity
    res = engine.handle_vector_math({"operation": "cosine similarity"}, {"a": v1, "b": v2})
    assert res["out"] == 0.0

def test_matrix_math(engine):
    # Multiply, Transpose, Inverse, Det, Eigenvals
    a = [[1, 2], [3, 4]]
    b = [[2, 0], [1, 2]]
    
    # Multiply
    res = engine.handle_matrix_math({"operation": "multiply matrix"}, {"a": a, "b": b})
    assert res["out"] == [[4, 4], [10, 8]]
    
    # Transpose
    res = engine.handle_matrix_math({"operation": "transpose"}, {"a": a})
    assert res["out"] == [[1, 3], [2, 4]]
    
    # Inverse
    res = engine.handle_matrix_math({"operation": "inverse"}, {"a": a})
    assert np.allclose(res["out"], [[-2.0, 1.0], [1.5, -0.5]])
    
    # Determinant
    res = engine.handle_matrix_math({"operation": "determinant"}, {"a": a})
    assert np.isclose(res["out"], -2.0)
    
    # Eigenvalues
    res = engine.handle_matrix_math({"operation": "eigenvalues"}, {"a": a})
    assert len(res["out"]) == 2

def test_stats_math(engine):
    # Mean, Median, Mode, Std, Var, Skew, Kurt, Cov, Hist
    data = [1, 2, 2, 3, 4]
    
    assert engine.handle_stats_math({"operation": "mean"}, {"in": data})["out"] == 2.4
    assert engine.handle_stats_math({"operation": "median"}, {"in": data})["out"] == 2.0
    assert engine.handle_stats_math({"operation": "mode"}, {"in": data})["out"] == 2.0
    assert engine.handle_stats_math({"operation": "std dev"}, {"in": data})["out"] > 0
    assert engine.handle_stats_math({"operation": "variance"}, {"in": data})["out"] > 0
    assert "out" in engine.handle_stats_math({"operation": "skewness"}, {"in": data})
    assert "out" in engine.handle_stats_math({"operation": "kurtosis"}, {"in": data})
    assert "out" in engine.handle_stats_math({"operation": "covariance"}, {"in": data})
    assert "out" in engine.handle_stats_math({"operation": "histogram"}, {"in": data})

def test_probability_math(engine):
    # Normal, Binom, Poisson, Uniform, Sampling, PDF, CDF, Bayes
    assert "out" in engine.handle_probability_math({"operation": "normal distribution"}, {"in": 0.0})
    assert "out" in engine.handle_probability_math({"operation": "binomial"}, {"in": 2})
    assert "out" in engine.handle_probability_math({"operation": "poisson"}, {"in": 1})
    assert "out" in engine.handle_probability_math({"operation": "uniform"}, {"in": 0.5})
    assert "out" in engine.handle_probability_math({"operation": "sampling"}, {})
    assert "out" in engine.handle_probability_math({"operation": "pdf"}, {"in": 0.0})
    assert "out" in engine.handle_probability_math({"operation": "cdf"}, {"in": 0.0})
    
    # Bayes theorem
    res = engine.handle_probability_math({"operation": "bayes theorem"}, {"p_b_given_a": 0.8, "p_a": 0.5, "p_b": 0.4})
    assert res["out"] == 1.0

def test_calculus_math(engine):
    # Gradient, Jacobian, Hessian, Integral, Convex, Lagrange, Newton, Cond, Stability
    assert "out" in engine.handle_calculus_math({"operation": "numerical gradient"}, {"fn": "x**2", "x0": [2.0]})
    assert "out" in engine.handle_calculus_math({"operation": "jacobian"}, {"fn": "x**2 + y**2", "x0": [1.0, 2.0]})
    assert "out" in engine.handle_calculus_math({"operation": "hessian"}, {"fn": "x**2 + y**2", "x0": [1.0, 2.0]})
    assert "out" in engine.handle_calculus_math({"operation": "numerical integral"}, {"fn": "x**2", "a": 0.0, "b": 3.0})
    assert "out" in engine.handle_calculus_math({"operation": "convex check"}, {"fn": "x**2 + y**2", "x0": [0.0, 0.0]})
    assert "out" in engine.handle_calculus_math({"operation": "lagrange multiplier solver"}, {"fn": "x**2 + y**2", "x0": [2.0, 2.0], "constraint": "x + y - 2"})
    assert "out" in engine.handle_calculus_math({"operation": "newton's method"}, {"fn": "x**2 - 4", "x0": [1.5]})
    assert "out" in engine.handle_calculus_math({"operation": "condition number"}, {"matrix": [[1.0, 2.0], [3.0, 4.0]]})
    assert "out" in engine.handle_calculus_math({"operation": "numerical stability checker"}, {"matrix": [[1.0, 2.0], [3.0, 4.0]], "threshold": 1000.0})
