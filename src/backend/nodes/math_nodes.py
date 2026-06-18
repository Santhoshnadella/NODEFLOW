import math
import numpy as np
import scipy.stats as stats
import scipy.optimize
import scipy.integrate

def handle_scalar_math(engine, params, inputs):
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
            res = max(0, min(a, 1))
        else:
            res = 0
        return {"out": res}
    except Exception:
        return {"out": 0}

def handle_vector_math(engine, params, inputs):
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

def handle_matrix_math(engine, params, inputs):
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

def handle_stats_math(engine, params, inputs):
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

def handle_probability_math(engine, params, inputs):
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
            p_b_given_a = float(inputs.get("p_b_given_a", params.get("p_b_given_a", 0.5)))
            p_a = float(inputs.get("p_a", params.get("p_a", 0.5)))
            p_b = float(inputs.get("p_b", params.get("p_b", 0.5)))
            res = (p_b_given_a * p_a) / p_b if p_b > 0 else 0.0
        else:
            res = 0
        return {"out": res}
    except Exception:
        return {"out": 0}

def handle_calculus_math(engine, params, inputs):
    op = params.get("label", params.get("operation", "numerical gradient")).lower()
    fn_str = inputs.get("fn", "x**2")
    x0_val = inputs.get("x0", [1.0])
    if isinstance(x0_val, (int, float)):
        x0_val = [float(x0_val)]
    x0 = np.array(x0_val, dtype=float)
    
    def evaluate_fn(x_vec):
        local_env = {"np": np, "x": x_vec[0]}
        if len(x_vec) > 1:
            local_env["y"] = x_vec[1]
        if len(x_vec) > 2:
            local_env["z"] = x_vec[2]
        for idx, val in enumerate(x_vec):
            local_env[f"x{idx}"] = val
        try:
            if callable(fn_str):
                return fn_str(x_vec)
            return eval(str(fn_str), {"__builtins__": None, "math": np}, local_env)
        except Exception:
            return np.sum(x_vec**2)

    epsilon = float(params.get("epsilon", 1e-5))
    
    try:
        if "gradient" in op:
            grad = scipy.optimize.approx_fprime(x0, evaluate_fn, epsilon)
            return {"out": grad.tolist()}
        elif "jacobian" in op:
            jac = scipy.optimize.approx_fprime(x0, evaluate_fn, epsilon)
            return {"out": jac.tolist()}
        elif "hessian" in op:
            n = len(x0)
            hess = np.zeros((n, n))
            for i in range(n):
                x_plus = np.array(x0, dtype=float)
                x_minus = np.array(x0, dtype=float)
                x_plus[i] += epsilon
                x_minus[i] -= epsilon
                grad_plus = scipy.optimize.approx_fprime(x_plus, evaluate_fn, epsilon)
                grad_minus = scipy.optimize.approx_fprime(x_minus, evaluate_fn, epsilon)
                hess[:, i] = (grad_plus - grad_minus) / (2.0 * epsilon)
            return {"out": hess.tolist()}
        elif "integral" in op:
            a = float(params.get("a", 0.0))
            b = float(params.get("b", 1.0))
            res, err = scipy.integrate.quad(lambda x: evaluate_fn(np.array([x])), a, b)
            return {"out": float(res), "error": float(err)}
        elif "convex" in op:
            n = len(x0)
            hess = np.zeros((n, n))
            for i in range(n):
                x_plus = np.array(x0, dtype=float)
                x_minus = np.array(x0, dtype=float)
                x_plus[i] += epsilon
                x_minus[i] -= epsilon
                grad_plus = scipy.optimize.approx_fprime(x_plus, evaluate_fn, epsilon)
                grad_minus = scipy.optimize.approx_fprime(x_minus, evaluate_fn, epsilon)
                hess[:, i] = (grad_plus - grad_minus) / (2.0 * epsilon)
            eigenvals = np.linalg.eigvals(hess)
            is_convex = bool(np.all(eigenvals >= -1e-7))
            return {"out": is_convex, "eigenvalues": eigenvals.tolist()}
        elif "lagrange" in op:
            cons_fn_str = inputs.get("constraint", "x + y - 1")
            def constraint_fn(x_vec):
                local_env = {"np": np, "x": x_vec[0]}
                if len(x_vec) > 1:
                    local_env["y"] = x_vec[1]
                try:
                    return eval(str(cons_fn_str), {"__builtins__": None, "math": np}, local_env)
                except Exception:
                    return 0.0
            cons = ({'type': 'eq', 'fun': constraint_fn})
            res = scipy.optimize.minimize(evaluate_fn, x0, method='SLSQP', constraints=cons)
            return {"out": res.x.tolist(), "fun": float(res.fun)}
        elif "newton" in op:
            root = scipy.optimize.newton(lambda x: evaluate_fn(np.array([x])), x0[0])
            return {"out": float(root)}
        elif "condition number" in op:
            matrix = np.array(inputs.get("matrix", x0.reshape(1, -1)))
            cond = float(np.linalg.cond(matrix))
            return {"out": cond}
        elif "stability" in op:
            matrix = np.array(inputs.get("matrix", x0.reshape(1, -1)))
            cond = float(np.linalg.cond(matrix))
            stable = cond < float(params.get("threshold", 1e12))
            return {"out": stable, "condition_number": cond}
        return {"out": 0}
    except Exception as e:
        return {"out": 0, "error": str(e)}

def handle_math(engine, params, inputs):
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

def handle_stats(engine, params, inputs):
    df_ref = inputs.get("df", {}).get("ref")
    if not df_ref or df_ref not in engine.store:
        return {"mat": None}
    df = engine.store[df_ref]
    numeric_df = df.select_dtypes(include=[np.number])
    corr = numeric_df.corr().values.tolist()
    return {"mat": corr}

def handle_numerical_grad(engine, params, inputs):
    y = inputs.get("y", [])
    x = inputs.get("x", None)
    if not y:
        return {"g": []}
    try:
        y_arr = np.array(y, dtype=float)
        if x is not None:
            x_arr = np.array(x, dtype=float)
            grad = np.gradient(y_arr, x_arr)
        else:
            grad = np.gradient(y_arr)
        return {"g": grad.tolist()}
    except Exception as e:
        return {"g": [], "error": str(e)}
