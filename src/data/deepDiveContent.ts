export interface DeepDiveInfo {
  math?: string;
  concepts: string[];
  implementation: string;
}

export const DEEP_DIVE_CONTENT: Record<string, DeepDiveInfo> = {
  'YOLOv8': {
    math: 'Loss = λ_coord ∑ ∑ 1_obj [(x - x̂)² + (y - ŷ)²] + λ_noobj ∑ ∑ 1_noobj (C - Ĉ)²',
    concepts: ['Anchor-free detection', 'Spatial Attention', 'PANet Neck'],
    implementation: 'Uses Ultralytics PyTorch implementation. Optimized for real-time inference on GPU.'
  },
  'Load CSV': {
    math: 'T : S_csv -> D_pandas',
    concepts: ['Parsing', 'Schema Inference', 'Memory Mapping'],
    implementation: 'Uses pandas.read_csv() with automated separator detection and type inference.'
  },
  'Stable Diffusion': {
    math: 'L = E[||ε - ε_θ(x_t, t, c)||²]',
    concepts: ['Latent Space', 'Denoising U-Net', 'Cross-Attention'],
    implementation: 'Uses HuggingFace Diffusers. Runs local FP16 weights for VRAM efficiency.'
  },
  'Doc Chunker': {
    math: 'Chunks = { T[i:i+N] | i ∈ [0, len(T), N-O] }',
    concepts: ['Tokenization', 'Overlap handling', 'Recursive splitting'],
    implementation: 'Split documents into semantic chunks to fit LLM context windows.'
  },
  'Text Embedder': {
    math: 'v = BERT_encoder(tokens)',
    concepts: ['High-dimensional vectors', 'Cosine similarity', 'Sentence Transformers'],
    implementation: 'Converts text into 384 or 768 dimensional vectors using SentenceTransformers.'
  }
};
