import torch
import torch.nn as nn
from transformers import pipeline

def handle_nlp(engine, params, inputs):
    op = params.get("label", "").lower()
    text = inputs.get("txt", inputs.get("text", "The quick brown fox jumps over the lazy dog"))
    
    if not hasattr(engine, '_model_cache'):
        engine._model_cache = {}
        
    try:
        if "rnn" in op:
            words = text.split()
            vocab = {w: i for i, w in enumerate(set(words))}
            token_ids = [vocab[w] for w in words]
            
            embed = nn.Embedding(len(vocab) + 1, 8)
            rnn = nn.RNN(input_size=8, hidden_size=4, batch_first=True).to(engine.device)
            
            input_tensor = torch.tensor([token_ids], dtype=torch.long)
            embedded = embed(input_tensor).to(engine.device)
            out, h = rnn(embedded)
            
            return {
                "out": out.squeeze(0).tolist(),
                "hidden": h.squeeze(0).tolist()
            }
            
        elif "seq2seq" in op:
            model_name = "t5-small"
            if "seq2seq" not in engine._model_cache:
                engine._model_cache["seq2seq"] = pipeline("text-generation", model=model_name)
            
            pipe = engine._model_cache["seq2seq"]
            prompt = f"translate English to French: {text}"
            res = pipe(prompt, max_length=50)
            return {"out": res[0]["generated_text"]}
            
        elif "glove" in op or "word2vec" in op or "fasttext" in op:
            import gensim
            from gensim.models import Word2Vec
            sentences = [s.strip().split() for s in text.split(".") if s.strip()]
            if not sentences or len(sentences[0]) == 0:
                sentences = [["hello", "world"]]
            
            model = Word2Vec(sentences, vector_size=16, min_count=1, window=3, epochs=10)
            embeddings = {}
            for word in model.wv.index_to_key:
                embeddings[word] = model.wv[word].tolist()
                
            return {"out": embeddings}
            
        elif "fine-tuning" in op:
            from transformers import AutoModelForSequenceClassification, AutoTokenizer, Trainer, TrainingArguments
            tokenizer = AutoTokenizer.from_pretrained("distilbert-base-uncased")
            model = AutoModelForSequenceClassification.from_pretrained("distilbert-base-uncased", num_labels=2)
            
            encodings = tokenizer(text, truncation=True, padding=True, max_length=16, return_tensors="pt")
            
            class SmallDataset(torch.utils.data.Dataset):
                def __init__(self, enc):
                    self.enc = enc
                def __getitem__(self, idx):
                    item = {key: val[idx] for key, val in self.enc.items()}
                    item['labels'] = torch.tensor(1, dtype=torch.long)
                    return item
                def __len__(self):
                    return 1
            
            dataset = SmallDataset(encodings)
            training_args = TrainingArguments(
                output_dir='./results',
                num_train_epochs=1,
                per_device_train_batch_size=1,
                logging_steps=1,
                report_to="none"
            )
            trainer = Trainer(
                model=model,
                args=training_args,
                train_dataset=dataset,
            )
            trainer.train()
            ref = f"model_{id(model)}"
            engine.store[ref] = model
            return {"out": {"ref": ref, "type": "finetuned_llm"}}
            
        return {}
    except Exception as e:
        return {"error": str(e)}

def handle_nlp_prep(engine, params, inputs):
    from transformers import AutoTokenizer

    tokenizer = AutoTokenizer.from_pretrained(
        params.get("model", "bert-base-uncased")
    )
    text = inputs.get("txt", "")
    tokens = tokenizer(text, return_tensors="pt")
    ref = f"tokens_{id(tokens)}"
    engine.store[ref] = tokens
    return {"tok": {"ref": ref}}

def handle_nlp_task(engine, params, inputs):
    task = (
        "sentiment-analysis"
        if "Sentiment" in params.get("label", "Sentiment Analysis")
        else "translation_en_to_fr"
    )
    nlp = pipeline(task)
    res = nlp(inputs.get("txt", "Hello world"))
    return {"out": res}

def handle_doc_chunker(engine, params, inputs):
    text = inputs.get("doc", "")
    size = int(params.get("size", 500))
    chunks = [text[i : i + size] for i in range(0, len(text), size)]
    return {"chunks": chunks}

def handle_rag_retriever(engine, params, inputs):
    from sentence_transformers import SentenceTransformer
    import faiss
    import numpy as np
    
    if not hasattr(engine, '_rag_encoder'):
        engine._rag_encoder = SentenceTransformer('all-MiniLM-L6-v2')
    
    chunks = inputs.get("chunks", [])
    if not chunks:
        db = inputs.get("db", [])
        if isinstance(db, list):
            chunks = db
        elif isinstance(db, dict) and "chunks" in db:
            chunks = db["chunks"]
        elif isinstance(db, str):
            chunks = [db]
    
    query = inputs.get("q", "")
    top_k = int(params.get("k", params.get("top_k", 3)))
    
    if not chunks or not query:
        return {"doc": "No documents or query provided."}
    
    try:
        chunk_embeddings = engine._rag_encoder.encode(chunks)
        query_embedding = engine._rag_encoder.encode([query])
        
        chunk_embeddings = np.array(chunk_embeddings).astype('float32')
        query_embedding = np.array(query_embedding).astype('float32')
        
        dim = chunk_embeddings.shape[1]
        index = faiss.IndexFlatIP(dim)
        faiss.normalize_L2(chunk_embeddings)
        faiss.normalize_L2(query_embedding)
        index.add(chunk_embeddings)
        
        scores, indices = index.search(query_embedding, min(top_k, len(chunks)))
        
        retrieved_chunks = [chunks[i] for i in indices[0]]
        combined_text = "\n\n".join(retrieved_chunks)
        return {
            "doc": combined_text,
            "scores": scores[0].tolist(),
            "results": [{"chunk": chunks[i], "score": float(scores[0][j])} for j, i in enumerate(indices[0])]
        }
    except Exception as e:
        return {"doc": f"Error during retrieval: {str(e)}"}

def handle_kids_nlp(engine, params, inputs):
    text = str(inputs.get("t", "")).lower()
    emoji = "😊"
    if "sad" in text or "bad" in text:
        emoji = "😢"
    elif "mad" in text or "angry" in text:
        emoji = "😠"
    return {"e": emoji}
