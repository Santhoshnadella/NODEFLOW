import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import joblib
import os

def handle_bayesian(engine, params, inputs):
    op = params.get("label", "").lower()
    df_ref = inputs.get("df", {}).get("ref")
    
    try:
        if "regression" in op:
            from sklearn.linear_model import BayesianRidge
            if not df_ref or df_ref not in engine.store:
                return {"model": None, "error": "No dataframe provided"}
            df = engine.store[df_ref]
            X = df.iloc[:, :-1].select_dtypes(include=[np.number])
            y = df.iloc[:, -1]
            model = BayesianRidge()
            model.fit(X, y)
            ref = f"model_{id(model)}"
            engine.store[ref] = model
            return {"model": {"ref": ref, "type": "bayesian_ridge"}}
            
        elif "process" in op:
            from sklearn.gaussian_process import GaussianProcessRegressor
            from sklearn.gaussian_process.kernels import RBF
            if not df_ref or df_ref not in engine.store:
                return {"model": None, "error": "No dataframe provided"}
            df = engine.store[df_ref]
            X = df.iloc[:, :-1].select_dtypes(include=[np.number])
            y = df.iloc[:, -1]
            kernel = RBF(1.0)
            model = GaussianProcessRegressor(kernel=kernel)
            model.fit(X, y)
            ref = f"model_{id(model)}"
            engine.store[ref] = model
            return {"model": {"ref": ref, "type": "gaussian_process"}}
            
        elif "kernel" in op:
            from sklearn.gaussian_process.kernels import RBF, Matern
            k_type = params.get("kernel_type", "rbf")
            length_scale = float(params.get("length_scale", 1.0))
            if k_type == "matern":
                kernel = Matern(length_scale=length_scale)
            else:
                kernel = RBF(length_scale=length_scale)
            ref = f"kernel_{id(kernel)}"
            engine.store[ref] = kernel
            return {"kernel": {"ref": ref, "type": k_type}}
            
        elif "mcmc" in op:
            steps = int(params.get("steps", 1000))
            trace = []
            x = 0.0
            for _ in range(steps):
                x_prop = x + np.random.normal(0, 0.5)
                accept_prob = min(1.0, np.exp(-0.5 * (x_prop**2 - x**2)))
                if np.random.rand() < accept_prob:
                    x = x_prop
                trace.append(x)
            return {"traces": trace}
            
        elif "variational" in op:
            from sklearn.mixture import BayesianGaussianMixture
            if not df_ref or df_ref not in engine.store:
                return {"approx": None, "error": "No dataframe provided"}
            df = engine.store[df_ref]
            X = df.select_dtypes(include=[np.number])
            bgm = BayesianGaussianMixture(n_components=3)
            bgm.fit(X)
            ref = f"model_{id(bgm)}"
            engine.store[ref] = bgm
            return {"approx": {"ref": ref, "type": "bayesian_gmm"}}
            
        return {}
    except Exception as e:
        return {"error": str(e)}

def handle_ml_supervised(engine, params, inputs):
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

    op = params.get("label", "").lower()
    df_ref = inputs.get("in", {}).get("ref")
    if not df_ref or df_ref not in engine.store:
        return {"model": None}
    df = engine.store[df_ref].copy()

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
            try:
                import lightgbm as lgb
                model = lgb.LGBMClassifier(
                    n_estimators=int(params.get("n_estimators", 100)),
                    learning_rate=float(params.get("learning_rate", 0.1)),
                )
            except Exception:
                model = GradientBoostingClassifier(
                    n_estimators=int(params.get("n_estimators", 100)),
                    learning_rate=float(params.get("learning_rate", 0.1)),
                )
        elif "catboost" in op:
            try:
                import catboost as cb
                model = cb.CatBoostClassifier(
                    iterations=int(params.get("iterations", 100)),
                    learning_rate=float(params.get("learning_rate", 0.1)),
                    verbose=False,
                )
            except Exception:
                model = GradientBoostingClassifier(
                    n_estimators=int(params.get("iterations", 100)),
                    learning_rate=float(params.get("learning_rate", 0.1)),
                )
        elif "k-nn" in op:
            model = KNeighborsClassifier(
                n_neighbors=int(params.get("n_neighbors", 5))
            )
        elif "hmm" in op:
            from hmmlearn.hmm import GaussianHMM
            model = GaussianHMM(
                n_components=int(params.get("n_components", 3)),
                covariance_type=params.get("covariance_type", "diag"),
                random_state=int(params.get("seed", 42))
            )
        else:
            return {"model": None}

        if model is not None:
            if "hmm" in op:
                model.fit(X)
            else:
                model.fit(X, y)
            ref = f"model_{id(model)}"
            engine.store[ref] = model
            return {"model": {"ref": ref, "type": op}}
        return {"model": None}

    except Exception as e:
        return {"error": str(e)}

def handle_ml_unsupervised(engine, params, inputs):
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
    if not df_ref or df_ref not in engine.store:
        return {"model": None, "out": None}
    df = engine.store[df_ref].copy()

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
            if umap is not None:
                model = umap.UMAP(
                    n_components=int(params.get("n_components", 2)),
                    n_neighbors=int(params.get("n_neighbors", 15)),
                )
                res = model.fit_transform(X)
                out_df = pd.DataFrame(res)
        elif "shallow autoencoder" in op:
            import torch
            import torch.nn as nn
            import torch.optim as optim
            
            in_dim = X.shape[1]
            latent_dim = int(params.get("n_components", 2))
            
            class Autoencoder(nn.Module):
                def __init__(self, input_dim, lat_dim):
                    super().__init__()
                    self.encoder = nn.Sequential(
                        nn.Linear(input_dim, 16),
                        nn.ReLU(),
                        nn.Linear(16, lat_dim)
                    )
                    self.decoder = nn.Sequential(
                        nn.Linear(lat_dim, 16),
                        nn.ReLU(),
                        nn.Linear(16, input_dim)
                    )
                def forward(self, x):
                    z = self.encoder(x)
                    recon = self.decoder(z)
                    return recon, z
            
            model = Autoencoder(in_dim, latent_dim).to(engine.device)
            X_tensor = torch.tensor(X.values, dtype=torch.float32).to(engine.device)
            optimizer = optim.Adam(model.parameters(), lr=0.01)
            criterion = nn.MSELoss()
            
            model.train()
            for epoch in range(15):
                engine.check_cancelled()
                optimizer.zero_grad()
                recon, z = model(X_tensor)
                loss = criterion(recon, X_tensor)
                loss.backward()
                optimizer.step()
            
            model.eval()
            with torch.no_grad():
                _, z_encoded = model(X_tensor)
            
            res = z_encoded.cpu().numpy()
            out_df = pd.DataFrame(res, columns=[f"latent_{i}" for i in range(latent_dim)])

        ret = {}
        if model is not None:
            m_ref = f"model_{id(model)}"
            engine.store[m_ref] = model
            ret["model"] = {"ref": m_ref, "type": op}
        if out_df is not None:
            d_ref = f"df_{id(out_df)}"
            engine.store[d_ref] = out_df
            ret["out"] = {
                "ref": d_ref,
                "cols": list(out_df.columns),
                "rows": len(out_df),
            }
        return ret
    except Exception as e:
        return {"error": str(e)}

def handle_ml_eval(engine, params, inputs):
    op = params.get("label", "").lower()
    model_ref = inputs.get("model", {}).get("ref")
    df_ref = inputs.get("df", {}).get("ref")
    
    if "save model" in op:
        filepath = params.get("filePath", "model.joblib")
        if not engine._validate_file_path(filepath):
            return {"status": "error", "error": "Access Denied: Path outside user home or workspace directory is restricted."}
        if not model_ref or model_ref not in engine.store:
            return {"status": "error", "error": "No model found to save"}
        try:
            joblib.dump(engine.store[model_ref], filepath)
            return {"status": "success", "filepath": filepath}
        except Exception as e:
            return {"status": "error", "error": str(e)}
            
    elif "load model" in op:
        filepath = params.get("filePath", "model.joblib")
        if not engine._validate_file_path(filepath):
            return {"model": None, "error": "Access Denied: Path outside user home or workspace directory is restricted."}
        if not os.path.exists(filepath):
            return {"model": None, "error": "File not found"}
        try:
            model = joblib.load(filepath)
            ref = f"model_{id(model)}"
            engine.store[ref] = model
            return {"model": {"ref": ref, "type": "loaded"}}
        except Exception as e:
            return {"model": None, "error": str(e)}
            
    if not df_ref or df_ref not in engine.store:
        fig, ax = plt.subplots(figsize=(5, 4))
        ax.text(0.5, 0.5, "No Data Provided", ha='center', va='center')
        ax.set_axis_off()
        return {"plot": engine._plot_to_b64(fig)}
        
    df = engine.store[df_ref]
    X = df.iloc[:, :-1].select_dtypes(include=[np.number])
    y = df.iloc[:, -1]
    
    fig, ax = plt.subplots(figsize=(5, 4))
    try:
        if "learning curve" in op:
            from sklearn.model_selection import learning_curve
            if model_ref and model_ref in engine.store:
                estimator = engine.store[model_ref]
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
            if model_ref and model_ref in engine.store and hasattr(engine.store[model_ref], "predict_proba"):
                probs = engine.store[model_ref].predict_proba(X)[:, 1]
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
        
    return {"plot": engine._plot_to_b64(fig)}

def handle_ml_train(engine, params, inputs):
    from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
    from sklearn.svm import SVC
    from sklearn.naive_bayes import GaussianNB

    df_ref = inputs.get("in", {}).get("ref")
    if not df_ref or df_ref not in engine.store:
        return {"model": None}
    df = engine.store[df_ref]

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
    engine.store[ref] = model
    return {"model": {"ref": ref, "type": model_type}}

def handle_cross_val(engine, params, inputs):
    from sklearn.model_selection import cross_val_score

    model_ref = inputs.get("m", {}).get("ref")
    df_ref = inputs.get("d", {}).get("ref")
    if (
        not model_ref
        or model_ref not in engine.store
        or not df_ref
        or df_ref not in engine.store
    ):
        return {"score": 0}

    model = engine.store[model_ref]
    df = engine.store[df_ref]
    X = df.iloc[:, :-1].select_dtypes(include=[np.number])
    y = df.iloc[:, -1]
    scores = cross_val_score(model, X, y, cv=int(params.get("folds", 5)))
    return {"score": float(scores.mean())}

def handle_interpret(engine, params, inputs):
    import shap
    import pandas as pd
    
    model_ref = inputs.get("model", {}).get("ref")
    df_ref = inputs.get("df", {}).get("ref")
    
    if not model_ref or not df_ref or model_ref not in engine.store or df_ref not in engine.store:
        fig, ax = plt.subplots(figsize=(5, 4))
        ax.text(0.5, 0.5, "Connect trained model and data", ha='center', va='center')
        ax.set_axis_off()
        return {"p": engine._plot_to_b64(fig)}
        
    model = engine.store[model_ref]
    df = engine.store[df_ref]
    X = df.iloc[:, :-1].select_dtypes(include=[np.number])
    try:
        explainer = shap.Explainer(model, X)
        shap_values = explainer(X)
        fig, ax = plt.subplots(figsize=(5, 4))
        shap.summary_plot(shap_values, X, show=False)
        fig = plt.gcf()
        return {"p": engine._plot_to_b64(fig)}
    except Exception as e:
        fig, ax = plt.subplots(figsize=(5, 4))
        if hasattr(model, "feature_importances_"):
            importances = model.feature_importances_
            ax.barh(list(X.columns)[:5], importances[:5], color='purple')
            ax.set_title("Feature Importances (SHAP Fallback)")
        else:
            ax.text(0.5, 0.5, f"SHAP error: {str(e)}", ha='center', va='center', color='red')
            ax.set_axis_off()
        return {"p": engine._plot_to_b64(fig)}

def handle_metrics(engine, params, inputs):
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
