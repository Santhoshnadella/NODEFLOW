export const PREMADE_PIPELINES = [
  {
    id: 'image-classifier',
    title: 'Image classifier (ResNet)',
    difficulty: 'Beginner',
    category: 'vision',
    description: 'Load image folder → augment → ResNet fine-tune → accuracy eval.',
    tags: ['CNN', 'Transfer learning', 'ResNet'],
    nodes: [
      { id: 'n1', type: 'baseNode', position: { x: 50, y: 100 }, data: { label: 'Load CSV', category: 'data' } },
      { id: 'n2', type: 'baseNode', position: { x: 300, y: 100 }, data: { label: 'Real-ESRGAN', category: 'cv' } },
      { id: 'n3', type: 'baseNode', position: { x: 550, y: 100 }, data: { label: 'Trainer', category: 'dl' } },
    ],
    edges: [{ id: 'e1-2', source: 'n1', target: 'n2' }, { id: 'e2-3', source: 'n2', target: 'n3' }]
  },
  {
    id: 'yolo-detection',
    title: 'YOLOv8 object detection',
    difficulty: 'Beginner',
    category: 'vision',
    description: 'Run YOLOv8 on images or webcam. Draws bounding boxes with class labels.',
    tags: ['YOLO', 'Detection', 'Real-time'],
    nodes: [
      { id: 'n1', type: 'baseNode', position: { x: 50, y: 100 }, data: { label: 'Load CSV', category: 'data' } },
      { id: 'n2', type: 'baseNode', position: { x: 300, y: 100 }, data: { label: 'YOLOv8', category: 'cv' } },
    ],
    edges: [{ id: 'e1-2', source: 'n1', target: 'n2' }]
  },
  {
    id: 'rag-pipeline',
    title: 'RAG pipeline (FAISS)',
    difficulty: 'Intermediate',
    category: 'nlp',
    description: 'Load docs → chunk → embed → FAISS → retrieve → LLM answer. Fully offline.',
    tags: ['RAG', 'FAISS', 'BERT'],
    nodes: [
      { id: 'n1', type: 'baseNode', position: { x: 50, y: 50 }, data: { label: 'Doc Chunker', category: 'nlp' } },
      { id: 'n2', type: 'baseNode', position: { x: 250, y: 50 }, data: { label: 'Text Embedder', category: 'nlp' } },
      { id: 'n3', type: 'baseNode', position: { x: 450, y: 50 }, data: { label: 'Vector Store (FAISS)', category: 'nlp' } },
      { id: 'n4', type: 'baseNode', position: { x: 650, y: 50 }, data: { label: 'LLM Loader', category: 'gen' } },
    ],
    edges: [
      { id: 'e1-2', source: 'n1', target: 'n2' },
      { id: 'e2-3', source: 'n2', target: 'n3' },
    ]
  },
  {
    id: 'rf-shap',
    title: 'Random forest + SHAP',
    difficulty: 'Beginner',
    category: 'ml',
    description: 'Train a random forest on any CSV. SHAP feature importance plots included.',
    tags: ['RF', 'XGBoost', 'SHAP'],
    nodes: [
      { id: 'n1', type: 'baseNode', position: { x: 50, y: 100 }, data: { label: 'Load CSV', category: 'data' } },
      { id: 'n2', type: 'baseNode', position: { x: 300, y: 100 }, data: { label: 'XGBoost', category: 'ml' } },
      { id: 'n3', type: 'baseNode', position: { x: 550, y: 100 }, data: { label: 'SHAP Explain', category: 'advanced' } },
    ],
    edges: [{ id: 'e1-2', source: 'n1', target: 'n2' }, { id: 'e2-3', source: 'n2', target: 'n3' }]
  },
  {
    id: 'cat-dog-kid',
    title: '"Is it a cat or dog?" 🐱',
    difficulty: 'Kid',
    category: 'kids',
    description: 'Load photos → predict with a confidence bar. Perfect for first-timers!',
    tags: ['Kids', 'Classification', 'Fun'],
    nodes: [
      { id: 'n1', type: 'baseNode', position: { x: 50, y: 100 }, data: { label: 'Load CSV', category: 'data' } },
      { id: 'n2', type: 'baseNode', position: { x: 300, y: 100 }, data: { label: 'Cat or Dog?', category: 'cv' } },
    ],
    edges: [{ id: 'e1-2', source: 'n1', target: 'n2' }]
  },
  {
    id: 'sd-local',
    title: 'Stable Diffusion (local)',
    difficulty: 'Beginner',
    category: 'genai',
    description: 'txt2img with full parameter control. Offline image generation.',
    tags: ['SD 1.5', 'SDXL', 'Diffusion'],
    nodes: [{ id: 'n1', type: 'baseNode', position: { x: 200, y: 100 }, data: { label: 'Stable Diffusion', category: 'genai' } }],
    edges: []
  }
];
