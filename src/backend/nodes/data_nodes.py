import os
import io
import base64
import cv2
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from PIL import Image
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder, OrdinalEncoder

def validate_dataframe(df):
    if df.empty:
        raise ValueError("Loaded dataset is empty (zero rows).")
    numeric_cols = list(df.select_dtypes(include=[np.number]).columns)
    categorical_cols = list(df.select_dtypes(exclude=[np.number]).columns)
    missing_counts = df.isnull().sum().to_dict()
    missing_counts_serializable = {str(k): int(v) for k, v in missing_counts.items()}
    return {
        "is_empty": False,
        "rows": len(df),
        "cols": list(df.columns),
        "numeric_columns": numeric_cols,
        "categorical_columns": categorical_cols,
        "missing_values": missing_counts_serializable,
    }

def handle_load_csv(engine, params, inputs):
    path = params.get("filePath", "data.csv")
    if not engine._validate_file_path(path):
        return {"df": None, "error": "Access Denied: Path outside user home or workspace directory is restricted."}
    try:
        df = pd.read_csv(path)
        validation = validate_dataframe(df)
        ref = f"df_{id(df)}"
        engine.store[ref] = df
        return {
            "df": {"ref": ref, "cols": list(df.columns), "rows": len(df)},
            "validation": validation
        }
    except Exception as e:
        return {"df": None, "error": f"Error loading CSV: {str(e)}"}

def handle_load_data(engine, params, inputs):
    path = params.get("filePath", "data.parquet")
    if not engine._validate_file_path(path):
        return {"df": None, "error": "Access Denied: Path outside user home or workspace directory is restricted."}
    try:
        df = pd.read_parquet(path)
        validation = validate_dataframe(df)
        ref = f"df_{id(df)}"
        engine.store[ref] = df
        return {
            "df": {"ref": ref, "cols": list(df.columns), "rows": len(df)},
            "validation": validation
        }
    except Exception as e:
        return {"df": None, "error": f"Error loading Parquet: {str(e)}"}

def handle_split(engine, params, inputs):
    df_ref = inputs.get("in", {}).get("ref")
    if not df_ref or df_ref not in engine.store:
        return {"train": None, "test": None}
    df = engine.store[df_ref]
    train_df, test_df = train_test_split(
        df,
        train_size=float(params.get("train_ratio", 0.8)),
        random_state=int(params.get("seed", 42)),
    )
    train_ref = f"df_{id(train_df)}"
    test_ref = f"df_{id(test_df)}"
    engine.store[train_ref] = train_df
    engine.store[test_ref] = test_df
    return {"train": {"ref": train_ref}, "test": {"ref": test_ref}}

def handle_transform(engine, params, inputs):
    df_ref = inputs.get("in", {}).get("ref")
    if not df_ref or df_ref not in engine.store:
        return {"out": None}
    df = engine.store[df_ref].copy()
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = (df[numeric_cols] - df[numeric_cols].min()) / (
        df[numeric_cols].max() - df[numeric_cols].min()
    )
    ref = f"df_{id(df)}"
    engine.store[ref] = df
    return {"out": {"ref": ref}}

def handle_synthetic_data(engine, params, inputs):
    from sklearn.datasets import make_classification
    X, y = make_classification(
        n_samples=int(params.get("n_samples", 1000)),
        random_state=int(params.get("seed", 42)),
    )
    df = pd.DataFrame(X, columns=[f"feature_{i}" for i in range(X.shape[1])])
    df["target"] = y
    ref = f"df_{id(df)}"
    engine.store[ref] = df
    return {"df": {"ref": ref, "cols": list(df.columns), "rows": len(df)}}

def handle_scatter_plot(engine, params, inputs):
    df_ref = inputs.get("df", {}).get("ref")
    if not df_ref or df_ref not in engine.store:
        fig, ax = plt.subplots(figsize=(5, 4))
        ax.text(0.5, 0.5, "No Data Provided\nConnect a Dataframe", ha='center', va='center', fontsize=12, color='gray')
        ax.set_axis_off()
        return {"plot": engine._plot_to_b64(fig)}

    df = engine.store[df_ref]
    x_col = params.get("x", "")
    y_col = params.get("y", "")
    
    num_cols = df.select_dtypes(include=[np.number]).columns
    if not x_col and len(num_cols) > 0:
        x_col = num_cols[0]
    if not y_col and len(num_cols) > 1:
        y_col = num_cols[1]
        
    fig, ax = plt.subplots(figsize=(5, 4))
    try:
        if x_col in df.columns and y_col in df.columns:
            ax.scatter(df[x_col], df[y_col], alpha=0.7, c='royalblue', edgecolors='none')
            ax.set_xlabel(x_col)
            ax.set_ylabel(y_col)
            ax.set_title(f"Scatter Plot: {x_col} vs {y_col}")
            ax.grid(True, linestyle='--', alpha=0.6)
        else:
            ax.text(0.5, 0.5, f"Columns not found:\n{x_col}, {y_col}", ha='center', va='center', color='red')
            ax.set_axis_off()
    except Exception as e:
        ax.text(0.5, 0.5, f"Error: {str(e)}", ha='center', va='center', color='red')
        ax.set_axis_off()
        
    return {"plot": engine._plot_to_b64(fig)}

def handle_data_source(engine, params, inputs):
    op = params.get("label", "").lower()
    path = params.get("filePath", inputs.get("filePath", ""))
    try:
        if "json" in op:
            if not engine._validate_file_path(path):
                return {"df": None, "error": "Access Denied: Path outside user home or workspace directory is restricted."}
            df = pd.read_json(path)
            validation = validate_dataframe(df)
            ref = f"df_{id(df)}"
            engine.store[ref] = df
            return {
                "df": {"ref": ref, "cols": list(df.columns), "rows": len(df)},
                "validation": validation
            }
        elif "image folder" in op:
            if not engine._validate_file_path(path):
                return {"images": None, "error": "Access Denied: Path outside user home or workspace directory is restricted."}
            if not os.path.exists(path):
                return {"images": None, "error": "Directory does not exist"}
            images_list = []
            for f in os.listdir(path)[:5]:
                fpath = os.path.join(path, f)
                if f.lower().endswith(('.png', '.jpg', '.jpeg', '.webp', '.bmp')):
                    try:
                        img = Image.open(fpath).convert("RGB")
                        img = img.resize((224, 224))
                        arr = np.array(img).transpose(2, 0, 1)
                        images_list.append(arr.tolist())
                    except Exception:
                        continue
            return {"images": images_list}
        elif "text" in op:
            if not engine._validate_file_path(path):
                return {"text": None, "error": "Access Denied: Path outside user home or workspace directory is restricted."}
            if not os.path.exists(path):
                return {"text": None, "error": "File not found"}
            with open(path, "r", encoding="utf-8", errors="ignore") as f:
                content = f.read()
            return {"text": content}
        elif "webcam" in op:
            cap = cv2.VideoCapture(0)
            if not cap.isOpened():
                img_arr = np.zeros((224, 224, 3), dtype=np.uint8)
            else:
                ret, frame = cap.read()
                cap.release()
                if ret:
                    img_arr = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                    img_arr = cv2.resize(img_arr, (224, 224))
                else:
                    img_arr = np.zeros((224, 224, 3), dtype=np.uint8)
            img_pil = Image.fromarray(img_arr)
            buf = io.BytesIO()
            img_pil.save(buf, format="PNG")
            img_b64 = base64.b64encode(buf.getvalue()).decode()
            return {"img": f"data:image/png;base64,{img_b64}"}
        elif "microphone" in op:
            try:
                import sounddevice as sd
                duration = float(params.get("duration", 2.0))
                fs = 16000
                recording = sd.rec(int(duration * fs), samplerate=fs, channels=1, dtype='float32')
                sd.wait()
                audio_data = recording.flatten().tolist()
                return {"audio": audio_data}
            except Exception as e:
                return {"audio": [0.0]*16000, "info": f"Microphone capture fallback: {str(e)}"}
        return {"out": None}
    except Exception as e:
        return {"error": str(e)}

def handle_data_transform(engine, params, inputs):
    op = params.get("label", "").lower()
    df_ref = inputs.get("in", {}).get("ref")
    if not df_ref or df_ref not in engine.store:
        return {"out": None, "error": "No dataframe provided"}
    df = engine.store[df_ref].copy()
    try:
        if "standardize" in op:
            num_cols = df.select_dtypes(include=[np.number]).columns
            if len(num_cols) > 0:
                scaler = StandardScaler()
                df[num_cols] = scaler.fit_transform(df[num_cols])
        elif "one-hot" in op:
            df = pd.get_dummies(df)
        elif "label encode" in op:
            le = LabelEncoder()
            for col in df.select_dtypes(include=['object', 'category']).columns:
                df[col] = le.fit_transform(df[col].astype(str))
        elif "ordinal encode" in op:
            oe = OrdinalEncoder()
            cat_cols = df.select_dtypes(include=['object', 'category']).columns
            if len(cat_cols) > 0:
                df[cat_cols] = oe.fit_transform(df[cat_cols].astype(str))
        elif "binning" in op:
            col = params.get("column", df.select_dtypes(include=[np.number]).columns[0] if len(df.select_dtypes(include=[np.number]).columns) > 0 else "")
            bins = int(params.get("bins", 5))
            if col in df.columns:
                df[col + "_binned"] = pd.cut(df[col], bins=bins).astype(str)
        elif "shuffle" in op:
            df = df.sample(frac=1, random_state=int(params.get("seed", 42))).reset_index(drop=True)
        elif "filter rows" in op:
            expr = params.get("expression", "")
            if expr:
                df = df.query(expr)
            else:
                df = df.dropna()
        elif "select columns" in op:
            cols = [c.strip() for c in params.get("columns", "").split(",") if c.strip()]
            if not cols:
                df = df.select_dtypes(include=[np.number])
            else:
                df = df[[c for c in cols if c in df.columns]]
        elif "pivot" in op:
            index = params.get("index", "")
            columns = params.get("columns_param", "")
            values = params.get("values", "")
            if index in df.columns and columns in df.columns:
                df = df.pivot_table(index=index, columns=columns, values=values if values in df.columns else None)
        elif "melt" in op:
            id_vars = [v.strip() for v in params.get("id_vars", "").split(",") if v.strip() in df.columns]
            value_vars = [v.strip() for v in params.get("value_vars", "").split(",") if v.strip() in df.columns]
            df = pd.melt(df, id_vars=id_vars if id_vars else None, value_vars=value_vars if value_vars else None)
        elif "resample" in op:
            rule = params.get("rule", "1D")
            date_col = params.get("date_column", "")
            if date_col in df.columns:
                df[date_col] = pd.to_datetime(df[date_col])
                df = df.set_index(date_col).resample(rule).mean().reset_index()
        elif "missing values" in op:
            strategy = params.get("strategy", "mean")
            if strategy == "mean":
                df = df.fillna(df.mean(numeric_only=True))
            elif strategy == "drop":
                df = df.dropna()
            elif strategy == "interpolate":
                df = df.interpolate(numeric_only=True)
        
        ref = f"df_{id(df)}"
        engine.store[ref] = df
        return {"out": {"ref": ref, "cols": list(df.columns), "rows": len(df)}}
    except Exception as e:
        return {"out": None, "error": str(e)}

def handle_data_merge(engine, params, inputs):
    ref_a = inputs.get("a", {}).get("ref")
    ref_b = inputs.get("b", {}).get("ref")
    if not ref_a or not ref_b or ref_a not in engine.store or ref_b not in engine.store: 
        return {"out": None, "error": "Missing input dataframes"}
    df_a = engine.store[ref_a]
    df_b = engine.store[ref_b]
    how = params.get("how", "inner")
    on = params.get("on", "")
    try:
        if on and on in df_a.columns and on in df_b.columns:
            df_merged = pd.merge(df_a, df_b, how=how, on=on)
        else:
            df_merged = pd.merge(df_a, df_b, how=how, left_index=True, right_index=True)
        ref = f"df_{id(df_merged)}"
        engine.store[ref] = df_merged
        return {"out": {"ref": ref, "cols": list(df_merged.columns), "rows": len(df_merged)}}
    except Exception as e:
        return {"out": None, "error": str(e)}

def handle_data_viz(engine, params, inputs):
    op = params.get("label", "").lower()
    df_ref = inputs.get("df", {}).get("ref")
    if not df_ref or df_ref not in engine.store:
        fig, ax = plt.subplots(figsize=(5, 4))
        ax.text(0.5, 0.5, f"No Data\nConnect a Dataframe to {params.get('label')}", ha='center', va='center', fontsize=12, color='gray')
        ax.set_axis_off()
        return {"plot": engine._plot_to_b64(fig)}
    df = engine.store[df_ref]
    num_cols = df.select_dtypes(include=[np.number]).columns
    fig, ax = plt.subplots(figsize=(5, 4))
    try:
        if "line" in op:
            if len(num_cols) > 0:
                y_col = num_cols[0]
                ax.plot(df.index, df[y_col], label=y_col, color='coral')
                ax.set_xlabel("Index")
                ax.set_ylabel(y_col)
                ax.set_title(f"Line Chart: {y_col}")
                ax.legend()
                ax.grid(True)
            else:
                ax.text(0.5, 0.5, "No numeric columns", ha='center', va='center')
                ax.set_axis_off()
        elif "bar" in op:
            cat_cols = df.select_dtypes(include=['object', 'category']).columns
            if len(cat_cols) > 0 and len(num_cols) > 0:
                cat_col = cat_cols[0]
                num_col = num_cols[0]
                grouped = df.groupby(cat_col)[num_col].mean().reset_index()
                ax.bar(grouped[cat_col], grouped[num_col], color='teal')
                ax.set_xlabel(cat_col)
                ax.set_ylabel(f"Mean of {num_col}")
                ax.set_title(f"Bar Chart: {num_col} by {cat_col}")
            elif len(num_cols) > 0:
                y_col = num_cols[0]
                subset = df[y_col].head(10)
                ax.bar(subset.index.astype(str), subset.values, color='teal')
                ax.set_title(f"Bar Chart: {y_col}")
            else:
                ax.text(0.5, 0.5, "No suitable columns", ha='center', va='center')
                ax.set_axis_off()
        elif "box" in op:
            if len(num_cols) > 0:
                ax.boxplot([df[c].dropna() for c in num_cols[:3]], labels=num_cols[:3])
                ax.set_title("Box Plot")
            else:
                ax.text(0.5, 0.5, "No numeric columns", ha='center', va='center')
                ax.set_axis_off()
        elif "violin" in op:
            if len(num_cols) > 0:
                sns.violinplot(data=df[num_cols[:2]], ax=ax)
                ax.set_title("Violin Plot")
            else:
                ax.text(0.5, 0.5, "No numeric columns", ha='center', va='center')
                ax.set_axis_off()
        elif "pairplot" in op:
            plt.close(fig)
            cols_to_plot = list(num_cols[:3])
            if cols_to_plot:
                g = sns.pairplot(df[cols_to_plot])
                fig = g.fig
            else:
                fig, ax = plt.subplots(figsize=(5, 4))
                ax.text(0.5, 0.5, "No numeric columns", ha='center', va='center')
                ax.set_axis_off()
        elif "histogram" in op:
            if len(num_cols) > 0:
                ax.hist(df[num_cols[0]].dropna(), bins=15, color='purple', alpha=0.7, edgecolor='black')
                ax.set_title(f"Histogram: {num_cols[0]}")
                ax.grid(True)
            else:
                ax.text(0.5, 0.5, "No numeric columns", ha='center', va='center')
                ax.set_axis_off()
        elif "heatmap" in op:
            numeric_df = df.select_dtypes(include=[np.number])
            if not numeric_df.empty:
                corr = numeric_df.corr()
                sns.heatmap(corr, annot=True, cmap='coolwarm', ax=ax, fmt=".2f")
                ax.set_title("Correlation Heatmap")
            else:
                ax.text(0.5, 0.5, "No numeric columns", ha='center', va='center')
                ax.set_axis_off()
        elif "density" in op or "kde" in op:
            if len(num_cols) > 0:
                sns.kdeplot(data=df[num_cols[0]].dropna(), fill=True, ax=ax, color='forestgreen')
                ax.set_title(f"Density Plot: {num_cols[0]}")
            else:
                ax.text(0.5, 0.5, "No numeric columns", ha='center', va='center')
                ax.set_axis_off()
        elif "pie" in op:
            cat_cols = df.select_dtypes(include=['object', 'category']).columns
            if len(cat_cols) > 0:
                counts = df[cat_cols[0]].value_counts().head(5)
                ax.pie(counts.values, labels=counts.index, autopct='%1.1f%%', colors=sns.color_palette('pastel'))
                ax.set_title(f"Pie Chart: {cat_cols[0]}")
            else:
                ax.text(0.5, 0.5, "No categorical columns", ha='center', va='center')
                ax.set_axis_off()
        else:
            ax.text(0.5, 0.5, f"Unknown plot type: {op}", ha='center', va='center')
            ax.set_axis_off()
    except Exception as e:
        ax.text(0.5, 0.5, f"Error: {str(e)}", ha='center', va='center', color='red')
        ax.set_axis_off()
    return {"plot": engine._plot_to_b64(fig)}

def handle_table_viewer(engine, params, inputs):
    df_ref = inputs.get("df", {}).get("ref")
    if not df_ref or df_ref not in engine.store:
        return {"preview": "No data"}
    df = engine.store[df_ref]
    return {"preview": df.head(10).to_dict(orient="records")}

def handle_image_preview(engine, params, inputs):
    return {"img": inputs.get("img")}
