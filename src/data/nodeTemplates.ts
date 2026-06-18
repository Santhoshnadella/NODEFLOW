import { 
  Calculator, Database, Cpu, Brain, Image as ImageIcon, MessageSquare, 
  Music, Binary, Sparkles, Activity, ShieldCheck, Box, Zap, BarChart3, 
  Layers, Settings, Share2, Search, Code, GraduationCap, Microscope,
  Dna, Speaker, TrendingUp, Wand2
} from 'lucide-react';

export const NODE_CATEGORIES = [
  { id: 'math', label: '1. CATEGORY A - Foundations & Math', icon: Calculator, color: '#eab308' },
  { id: 'data', label: '2. CATEGORY B - Data Engineering', icon: Database, color: '#3b82f6' },
  { id: 'ml', label: '3. CATEGORY C - Classical ML', icon: Cpu, color: '#22c55e' },
  { id: 'dl', label: '4. CATEGORY D - DL Fundamentals', icon: Brain, color: '#a855f7' },
  { id: 'cv', label: '5. CATEGORY E - Computer Vision', icon: ImageIcon, color: '#f43f5e' },
  { id: 'nlp', label: '6. CATEGORY F - Sequence & NLP', icon: MessageSquare, color: '#6366f1' },
  { id: 'gen', label: '7. CATEGORY G - Generative Models', icon: Wand2, color: '#ec4899' },
  { id: 'bayesian', label: '8. CATEGORY H - Probabilistic & Bayesian', icon: Activity, color: '#14b8a6' },
  { id: 'advanced', label: '9. CATEGORY I - Advanced Architectures', icon: Layers, color: '#f97316' },
  { id: 'explain', label: '10. CATEGORY J - Evaluation & Interpretability', icon: Search, color: '#8b5cf6' },
  { id: 'mlops', label: '11. CATEGORY K - MLOps & Production', icon: Share2, color: '#475569' },
  { id: 'specialty', label: '12. CATEGORY L - Specialty Domains', icon: Microscope, color: '#d946ef' },
  { id: 'scale', label: '13. Optimization & Scale', icon: Zap, color: '#06b6d4' },
  { id: 'kids', label: '14. Kids Corner', icon: Sparkles, color: '#f59e0b' }
];

export const NODE_TEMPLATES = [
  // --- 1. MATH & STATISTICS ---
  { 
    type: 'baseNode', label: 'Vector Ops', category: 'math', 
    data: { 
      label: 'Vector Ops', category: 'math', 
      inputs: [{id:'a', label:'Vec A', type:'tensor'}, {id:'b', label:'Vec B', type:'tensor'}], 
      outputs: [{id:'out', label:'Result', type:'number'}],
      parameters: { operation: 'dot_product', normalize: false },
      explanation: {
        what: "Performs math between two lists of numbers.",
        how: "It can calculate the 'Dot Product' (similarity) or 'Magnitude' (size).",
        gives: "A single number representing the relationship between the vectors.",
        analogy: "Like comparing two recipes to see how similar they are!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'SVD Decomposition', category: 'math', 
    data: { 
      label: 'SVD Decomposition', category: 'math', 
      inputs: [{id:'in', label:'Matrix', type:'tensor'}], 
      outputs: [{id:'u', label:'U', type:'tensor'}, {id:'s', label:'S', type:'tensor'}, {id:'v', label:'V', type:'tensor'}],
      explanation: {
        what: "Breaks a complex grid of numbers into three simpler grids.",
        how: "It finds the most important 'patterns' inside a matrix.",
        gives: "Three matrices (U, S, V) that contain the core information.",
        analogy: "Like taking apart a Lego castle to see all the different types of bricks used to build it."
      }
    } 
  },

    { 
    type: 'baseNode', label: 'Add', category: 'math', 
    data: { 
      label: 'Add', category: 'math', 
      inputs: [{'id': 'a', 'label': 'A', 'type': 'number'}, {'id': 'b', 'label': 'B', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'number'}],
      parameters: {'operation': 'add'},
      explanation: {
        what: "Performs scalar add.",
        how: "Calculates using basic math.",
        gives: "A single number.",
        analogy: "Like using a calculator."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Subtract', category: 'math', 
    data: { 
      label: 'Subtract', category: 'math', 
      inputs: [{'id': 'a', 'label': 'A', 'type': 'number'}, {'id': 'b', 'label': 'B', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'number'}],
      parameters: {'operation': 'subtract'},
      explanation: {
        what: "Performs scalar subtract.",
        how: "Calculates using basic math.",
        gives: "A single number.",
        analogy: "Like using a calculator."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Multiply', category: 'math', 
    data: { 
      label: 'Multiply', category: 'math', 
      inputs: [{'id': 'a', 'label': 'A', 'type': 'number'}, {'id': 'b', 'label': 'B', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'number'}],
      parameters: {'operation': 'multiply'},
      explanation: {
        what: "Performs scalar multiply.",
        how: "Calculates using basic math.",
        gives: "A single number.",
        analogy: "Like using a calculator."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Divide', category: 'math', 
    data: { 
      label: 'Divide', category: 'math', 
      inputs: [{'id': 'a', 'label': 'A', 'type': 'number'}, {'id': 'b', 'label': 'B', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'number'}],
      parameters: {'operation': 'divide'},
      explanation: {
        what: "Performs scalar divide.",
        how: "Calculates using basic math.",
        gives: "A single number.",
        analogy: "Like using a calculator."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Power', category: 'math', 
    data: { 
      label: 'Power', category: 'math', 
      inputs: [{'id': 'a', 'label': 'A', 'type': 'number'}, {'id': 'b', 'label': 'B', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'number'}],
      parameters: {'operation': 'power'},
      explanation: {
        what: "Performs scalar power.",
        how: "Calculates using basic math.",
        gives: "A single number.",
        analogy: "Like using a calculator."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Log', category: 'math', 
    data: { 
      label: 'Log', category: 'math', 
      inputs: [{'id': 'a', 'label': 'A', 'type': 'number'}, {'id': 'b', 'label': 'B', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'number'}],
      parameters: {'operation': 'log'},
      explanation: {
        what: "Performs scalar log.",
        how: "Calculates using basic math.",
        gives: "A single number.",
        analogy: "Like using a calculator."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Exp', category: 'math', 
    data: { 
      label: 'Exp', category: 'math', 
      inputs: [{'id': 'a', 'label': 'A', 'type': 'number'}, {'id': 'b', 'label': 'B', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'number'}],
      parameters: {'operation': 'exp'},
      explanation: {
        what: "Performs scalar exp.",
        how: "Calculates using basic math.",
        gives: "A single number.",
        analogy: "Like using a calculator."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Sqrt', category: 'math', 
    data: { 
      label: 'Sqrt', category: 'math', 
      inputs: [{'id': 'a', 'label': 'A', 'type': 'number'}, {'id': 'b', 'label': 'B', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'number'}],
      parameters: {'operation': 'sqrt'},
      explanation: {
        what: "Performs scalar sqrt.",
        how: "Calculates using basic math.",
        gives: "A single number.",
        analogy: "Like using a calculator."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Abs', category: 'math', 
    data: { 
      label: 'Abs', category: 'math', 
      inputs: [{'id': 'a', 'label': 'A', 'type': 'number'}, {'id': 'b', 'label': 'B', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'number'}],
      parameters: {'operation': 'abs'},
      explanation: {
        what: "Performs scalar abs.",
        how: "Calculates using basic math.",
        gives: "A single number.",
        analogy: "Like using a calculator."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Clamp', category: 'math', 
    data: { 
      label: 'Clamp', category: 'math', 
      inputs: [{'id': 'a', 'label': 'A', 'type': 'number'}, {'id': 'b', 'label': 'B', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'number'}],
      parameters: {'operation': 'clamp'},
      explanation: {
        what: "Performs scalar clamp.",
        how: "Calculates using basic math.",
        gives: "A single number.",
        analogy: "Like using a calculator."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Cross product', category: 'math', 
    data: { 
      label: 'Cross product', category: 'math', 
      inputs: [{'id': 'a', 'label': 'Vec A', 'type': 'tensor'}, {'id': 'b', 'label': 'Vec B', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'cross product'},
      explanation: {
        what: "Performs vector cross product.",
        how: "Calculates vector operations.",
        gives: "A tensor or scalar.",
        analogy: "Like measuring directions."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Normalize', category: 'math', 
    data: { 
      label: 'Normalize', category: 'math', 
      inputs: [{'id': 'a', 'label': 'Vec A', 'type': 'tensor'}, {'id': 'b', 'label': 'Vec B', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'normalize'},
      explanation: {
        what: "Performs vector normalize.",
        how: "Calculates vector operations.",
        gives: "A tensor or scalar.",
        analogy: "Like measuring directions."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Magnitude', category: 'math', 
    data: { 
      label: 'Magnitude', category: 'math', 
      inputs: [{'id': 'a', 'label': 'Vec A', 'type': 'tensor'}, {'id': 'b', 'label': 'Vec B', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'magnitude'},
      explanation: {
        what: "Performs vector magnitude.",
        how: "Calculates vector operations.",
        gives: "A tensor or scalar.",
        analogy: "Like measuring directions."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Cosine similarity', category: 'math', 
    data: { 
      label: 'Cosine similarity', category: 'math', 
      inputs: [{'id': 'a', 'label': 'Vec A', 'type': 'tensor'}, {'id': 'b', 'label': 'Vec B', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'cosine similarity'},
      explanation: {
        what: "Performs vector cosine similarity.",
        how: "Calculates vector operations.",
        gives: "A tensor or scalar.",
        analogy: "Like measuring directions."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Multiply Matrix', category: 'math', 
    data: { 
      label: 'Multiply Matrix', category: 'math', 
      inputs: [{'id': 'a', 'label': 'Mat A', 'type': 'tensor'}, {'id': 'b', 'label': 'Mat B', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'multiply matrix'},
      explanation: {
        what: "Performs matrix multiply matrix.",
        how: "Calculates matrix operations.",
        gives: "A tensor or scalar.",
        analogy: "Like shifting grids."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Transpose', category: 'math', 
    data: { 
      label: 'Transpose', category: 'math', 
      inputs: [{'id': 'a', 'label': 'Mat A', 'type': 'tensor'}, {'id': 'b', 'label': 'Mat B', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'transpose'},
      explanation: {
        what: "Performs matrix transpose.",
        how: "Calculates matrix operations.",
        gives: "A tensor or scalar.",
        analogy: "Like shifting grids."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Inverse', category: 'math', 
    data: { 
      label: 'Inverse', category: 'math', 
      inputs: [{'id': 'a', 'label': 'Mat A', 'type': 'tensor'}, {'id': 'b', 'label': 'Mat B', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'inverse'},
      explanation: {
        what: "Performs matrix inverse.",
        how: "Calculates matrix operations.",
        gives: "A tensor or scalar.",
        analogy: "Like shifting grids."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Determinant', category: 'math', 
    data: { 
      label: 'Determinant', category: 'math', 
      inputs: [{'id': 'a', 'label': 'Mat A', 'type': 'tensor'}, {'id': 'b', 'label': 'Mat B', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'determinant'},
      explanation: {
        what: "Performs matrix determinant.",
        how: "Calculates matrix operations.",
        gives: "A tensor or scalar.",
        analogy: "Like shifting grids."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Eigenvalues', category: 'math', 
    data: { 
      label: 'Eigenvalues', category: 'math', 
      inputs: [{'id': 'a', 'label': 'Mat A', 'type': 'tensor'}, {'id': 'b', 'label': 'Mat B', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'eigenvalues'},
      explanation: {
        what: "Performs matrix eigenvalues.",
        how: "Calculates matrix operations.",
        gives: "A tensor or scalar.",
        analogy: "Like shifting grids."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Mean', category: 'math', 
    data: { 
      label: 'Mean', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'mean'},
      explanation: {
        what: "Calculates mean.",
        how: "Computes statistical properties.",
        gives: "A number or tensor.",
        analogy: "Like finding average scores."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Median', category: 'math', 
    data: { 
      label: 'Median', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'median'},
      explanation: {
        what: "Calculates median.",
        how: "Computes statistical properties.",
        gives: "A number or tensor.",
        analogy: "Like finding average scores."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Mode', category: 'math', 
    data: { 
      label: 'Mode', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'mode'},
      explanation: {
        what: "Calculates mode.",
        how: "Computes statistical properties.",
        gives: "A number or tensor.",
        analogy: "Like finding average scores."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Std dev', category: 'math', 
    data: { 
      label: 'Std dev', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'std dev'},
      explanation: {
        what: "Calculates std dev.",
        how: "Computes statistical properties.",
        gives: "A number or tensor.",
        analogy: "Like finding average scores."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Variance', category: 'math', 
    data: { 
      label: 'Variance', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'variance'},
      explanation: {
        what: "Calculates variance.",
        how: "Computes statistical properties.",
        gives: "A number or tensor.",
        analogy: "Like finding average scores."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Skewness', category: 'math', 
    data: { 
      label: 'Skewness', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'skewness'},
      explanation: {
        what: "Calculates skewness.",
        how: "Computes statistical properties.",
        gives: "A number or tensor.",
        analogy: "Like finding average scores."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Kurtosis', category: 'math', 
    data: { 
      label: 'Kurtosis', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'kurtosis'},
      explanation: {
        what: "Calculates kurtosis.",
        how: "Computes statistical properties.",
        gives: "A number or tensor.",
        analogy: "Like finding average scores."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Covariance', category: 'math', 
    data: { 
      label: 'Covariance', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'covariance'},
      explanation: {
        what: "Calculates covariance.",
        how: "Computes statistical properties.",
        gives: "A number or tensor.",
        analogy: "Like finding average scores."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Histogram', category: 'math', 
    data: { 
      label: 'Histogram', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'operation': 'histogram'},
      explanation: {
        what: "Calculates histogram.",
        how: "Computes statistical properties.",
        gives: "A number or tensor.",
        analogy: "Like finding average scores."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Normal distribution', category: 'math', 
    data: { 
      label: 'Normal distribution', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Input', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Prob', 'type': 'number'}],
      parameters: {'mean': 0.0, 'std': 1.0},
      explanation: {
        what: "Calculates normal distribution.",
        how: "Computes probability.",
        gives: "A probability value.",
        analogy: "Like rolling dice."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Binomial', category: 'math', 
    data: { 
      label: 'Binomial', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Input', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Prob', 'type': 'number'}],
      parameters: {'mean': 0.0, 'std': 1.0},
      explanation: {
        what: "Calculates binomial.",
        how: "Computes probability.",
        gives: "A probability value.",
        analogy: "Like rolling dice."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Poisson', category: 'math', 
    data: { 
      label: 'Poisson', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Input', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Prob', 'type': 'number'}],
      parameters: {'mean': 0.0, 'std': 1.0},
      explanation: {
        what: "Calculates poisson.",
        how: "Computes probability.",
        gives: "A probability value.",
        analogy: "Like rolling dice."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Uniform', category: 'math', 
    data: { 
      label: 'Uniform', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Input', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Prob', 'type': 'number'}],
      parameters: {'mean': 0.0, 'std': 1.0},
      explanation: {
        what: "Calculates uniform.",
        how: "Computes probability.",
        gives: "A probability value.",
        analogy: "Like rolling dice."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Sampling', category: 'math', 
    data: { 
      label: 'Sampling', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Input', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Prob', 'type': 'number'}],
      parameters: {'mean': 0.0, 'std': 1.0},
      explanation: {
        what: "Calculates sampling.",
        how: "Computes probability.",
        gives: "A probability value.",
        analogy: "Like rolling dice."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'PDF', category: 'math', 
    data: { 
      label: 'PDF', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Input', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Prob', 'type': 'number'}],
      parameters: {'mean': 0.0, 'std': 1.0},
      explanation: {
        what: "Calculates pdf.",
        how: "Computes probability.",
        gives: "A probability value.",
        analogy: "Like rolling dice."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'CDF', category: 'math', 
    data: { 
      label: 'CDF', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Input', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Prob', 'type': 'number'}],
      parameters: {'mean': 0.0, 'std': 1.0},
      explanation: {
        what: "Calculates cdf.",
        how: "Computes probability.",
        gives: "A probability value.",
        analogy: "Like rolling dice."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Bayes theorem', category: 'math', 
    data: { 
      label: 'Bayes theorem', category: 'math', 
      inputs: [{'id': 'in', 'label': 'Input', 'type': 'number'}], 
      outputs: [{'id': 'out', 'label': 'Prob', 'type': 'number'}],
      parameters: {'mean': 0.0, 'std': 1.0},
      explanation: {
        what: "Calculates bayes theorem.",
        how: "Computes probability.",
        gives: "A probability value.",
        analogy: "Like rolling dice."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Numerical gradient', category: 'math', 
    data: { 
      label: 'Numerical gradient', category: 'math', 
      inputs: [{'id': 'fn', 'label': 'Function', 'type': 'any'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'epsilon': 1e-05},
      explanation: {
        what: "Performs numerical gradient.",
        how: "Computes calculus or optimization.",
        gives: "A tensor or scalar.",
        analogy: "Like finding the steepest hill."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Jacobian', category: 'math', 
    data: { 
      label: 'Jacobian', category: 'math', 
      inputs: [{'id': 'fn', 'label': 'Function', 'type': 'any'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'epsilon': 1e-05},
      explanation: {
        what: "Performs jacobian.",
        how: "Computes calculus or optimization.",
        gives: "A tensor or scalar.",
        analogy: "Like finding the steepest hill."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Hessian', category: 'math', 
    data: { 
      label: 'Hessian', category: 'math', 
      inputs: [{'id': 'fn', 'label': 'Function', 'type': 'any'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'epsilon': 1e-05},
      explanation: {
        what: "Performs hessian.",
        how: "Computes calculus or optimization.",
        gives: "A tensor or scalar.",
        analogy: "Like finding the steepest hill."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Numerical integral', category: 'math', 
    data: { 
      label: 'Numerical integral', category: 'math', 
      inputs: [{'id': 'fn', 'label': 'Function', 'type': 'any'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'epsilon': 1e-05},
      explanation: {
        what: "Performs numerical integral.",
        how: "Computes calculus or optimization.",
        gives: "A tensor or scalar.",
        analogy: "Like finding the steepest hill."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Convex check', category: 'math', 
    data: { 
      label: 'Convex check', category: 'math', 
      inputs: [{'id': 'fn', 'label': 'Function', 'type': 'any'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'epsilon': 1e-05},
      explanation: {
        what: "Performs convex check.",
        how: "Computes calculus or optimization.",
        gives: "A tensor or scalar.",
        analogy: "Like finding the steepest hill."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Lagrange multiplier solver', category: 'math', 
    data: { 
      label: 'Lagrange multiplier solver', category: 'math', 
      inputs: [{'id': 'fn', 'label': 'Function', 'type': 'any'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'epsilon': 1e-05},
      explanation: {
        what: "Performs lagrange multiplier solver.",
        how: "Computes calculus or optimization.",
        gives: "A tensor or scalar.",
        analogy: "Like finding the steepest hill."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Condition number', category: 'math', 
    data: { 
      label: 'Condition number', category: 'math', 
      inputs: [{'id': 'fn', 'label': 'Function', 'type': 'any'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'epsilon': 1e-05},
      explanation: {
        what: "Performs condition number.",
        how: "Computes calculus or optimization.",
        gives: "A tensor or scalar.",
        analogy: "Like finding the steepest hill."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Numerical stability checker', category: 'math', 
    data: { 
      label: 'Numerical stability checker', category: 'math', 
      inputs: [{'id': 'fn', 'label': 'Function', 'type': 'any'}], 
      outputs: [{'id': 'out', 'label': 'Result', 'type': 'tensor'}],
      parameters: {'epsilon': 1e-05},
      explanation: {
        what: "Performs numerical stability checker.",
        how: "Computes calculus or optimization.",
        gives: "A tensor or scalar.",
        analogy: "Like finding the steepest hill."
      }
    } 
  },

  // --- 2. PYTHON & DATA ENGINEERING ---
  { 
    type: 'baseNode', label: 'Synthetic Data', category: 'data', 
    data: { 
      label: 'Synthetic Data', category: 'data', 
      inputs: [], 
      outputs: [{id:'df', label:'Data', type:'dataframe'}],
      parameters: { n_samples: 1000, noise: 0.1, distribution: 'normal', seed: 42 },
      explanation: {
        what: "Creates fake data for testing your AI models.",
        how: "It uses math formulas to generate random numbers that look like real-world data.",
        gives: "A table full of clean, predictable data.",
        analogy: "Like a practice test your teacher makes for you before the real exam!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Split Data', category: 'data', 
    data: { 
      label: 'Split Data', category: 'data', 
      inputs: [{id:'in', label:'Data', type:'dataframe'}], 
      outputs: [{id:'train', label:'Train', type:'dataframe'}, {id:'test', label:'Test', type:'dataframe'}],
      parameters: { train_ratio: 0.8, shuffle: true, seed: 42 },
      explanation: {
        what: "Divides your data into 'Learning' and 'Testing' groups.",
        how: "It randomly picks some rows for training and saves the rest to check if the AI really learned.",
        gives: "Two separate data tables.",
        analogy: "Like reading half a book to learn the story, and then being asked questions about the other half to see if you understood it!"
      }
    } 
  },

    { 
    type: 'baseNode', label: 'Load JSON', category: 'data', 
    data: { 
      label: 'Load JSON', category: 'data', 
      inputs: [], 
      outputs: [{'id': 'df', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {'filePath': 'data.json'},
      explanation: {
        what: "Loads Load JSON.",
        how: "Reads data from the system.",
        gives: "Raw data format.",
        analogy: "Like opening a new book."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Load Image Folder', category: 'data', 
    data: { 
      label: 'Load Image Folder', category: 'data', 
      inputs: [], 
      outputs: [{'id': 'images', 'label': 'Images', 'type': 'tensor'}],
      parameters: {'folderPath': './images'},
      explanation: {
        what: "Loads Load Image Folder.",
        how: "Reads data from the system.",
        gives: "Raw data format.",
        analogy: "Like opening a new book."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Load Text File', category: 'data', 
    data: { 
      label: 'Load Text File', category: 'data', 
      inputs: [], 
      outputs: [{'id': 'text', 'label': 'Text', 'type': 'any'}],
      parameters: {'filePath': 'text.txt'},
      explanation: {
        what: "Loads Load Text File.",
        how: "Reads data from the system.",
        gives: "Raw data format.",
        analogy: "Like opening a new book."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Webcam Capture', category: 'data', 
    data: { 
      label: 'Webcam Capture', category: 'data', 
      inputs: [], 
      outputs: [{'id': 'img', 'label': 'Image', 'type': 'tensor'}],
      parameters: {'deviceId': 0},
      explanation: {
        what: "Loads Webcam Capture.",
        how: "Reads data from the system.",
        gives: "Raw data format.",
        analogy: "Like opening a new book."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Microphone Record', category: 'data', 
    data: { 
      label: 'Microphone Record', category: 'data', 
      inputs: [], 
      outputs: [{'id': 'audio', 'label': 'Audio', 'type': 'audio'}],
      parameters: {'duration': 5.0},
      explanation: {
        what: "Loads Microphone Record.",
        how: "Reads data from the system.",
        gives: "Raw data format.",
        analogy: "Like opening a new book."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Standardize', category: 'data', 
    data: { 
      label: 'Standardize', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'out', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {},
      explanation: {
        what: "Transforms data using Standardize.",
        how: "Modifies the structure or values of data.",
        gives: "A modified dataframe.",
        analogy: "Like organizing your toys."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'One-hot encode', category: 'data', 
    data: { 
      label: 'One-hot encode', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'out', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {'column': 'category'},
      explanation: {
        what: "Transforms data using One-hot encode.",
        how: "Modifies the structure or values of data.",
        gives: "A modified dataframe.",
        analogy: "Like organizing your toys."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Label encode', category: 'data', 
    data: { 
      label: 'Label encode', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'out', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {'column': 'category'},
      explanation: {
        what: "Transforms data using Label encode.",
        how: "Modifies the structure or values of data.",
        gives: "A modified dataframe.",
        analogy: "Like organizing your toys."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Ordinal encode', category: 'data', 
    data: { 
      label: 'Ordinal encode', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'out', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {'column': 'category'},
      explanation: {
        what: "Transforms data using Ordinal encode.",
        how: "Modifies the structure or values of data.",
        gives: "A modified dataframe.",
        analogy: "Like organizing your toys."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Binning', category: 'data', 
    data: { 
      label: 'Binning', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'out', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {'bins': 5},
      explanation: {
        what: "Transforms data using Binning.",
        how: "Modifies the structure or values of data.",
        gives: "A modified dataframe.",
        analogy: "Like organizing your toys."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Shuffle', category: 'data', 
    data: { 
      label: 'Shuffle', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'out', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {'seed': 42},
      explanation: {
        what: "Transforms data using Shuffle.",
        how: "Modifies the structure or values of data.",
        gives: "A modified dataframe.",
        analogy: "Like organizing your toys."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Filter rows', category: 'data', 
    data: { 
      label: 'Filter rows', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'out', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {'condition': 'age > 18'},
      explanation: {
        what: "Transforms data using Filter rows.",
        how: "Modifies the structure or values of data.",
        gives: "A modified dataframe.",
        analogy: "Like organizing your toys."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Select columns', category: 'data', 
    data: { 
      label: 'Select columns', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'out', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {'columns': 'age, income'},
      explanation: {
        what: "Transforms data using Select columns.",
        how: "Modifies the structure or values of data.",
        gives: "A modified dataframe.",
        analogy: "Like organizing your toys."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Merge/Join', category: 'data', 
    data: { 
      label: 'Merge/Join', category: 'data', 
      inputs: [{'id': 'a', 'label': 'Data A', 'type': 'dataframe'}, {'id': 'b', 'label': 'Data B', 'type': 'dataframe'}], 
      outputs: [{'id': 'out', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {'on': 'id', 'how': 'inner'},
      explanation: {
        what: "Transforms data using Merge/Join.",
        how: "Modifies the structure or values of data.",
        gives: "A modified dataframe.",
        analogy: "Like organizing your toys."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Pivot', category: 'data', 
    data: { 
      label: 'Pivot', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'out', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {'index': 'date', 'columns': 'city', 'values': 'temp'},
      explanation: {
        what: "Transforms data using Pivot.",
        how: "Modifies the structure or values of data.",
        gives: "A modified dataframe.",
        analogy: "Like organizing your toys."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Melt', category: 'data', 
    data: { 
      label: 'Melt', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'out', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {'id_vars': 'date'},
      explanation: {
        what: "Transforms data using Melt.",
        how: "Modifies the structure or values of data.",
        gives: "A modified dataframe.",
        analogy: "Like organizing your toys."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Resample', category: 'data', 
    data: { 
      label: 'Resample', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'out', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {'rule': '1D'},
      explanation: {
        what: "Transforms data using Resample.",
        how: "Modifies the structure or values of data.",
        gives: "A modified dataframe.",
        analogy: "Like organizing your toys."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Handle missing values', category: 'data', 
    data: { 
      label: 'Handle missing values', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'out', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {'strategy': 'mean'},
      explanation: {
        what: "Transforms data using Handle missing values.",
        how: "Modifies the structure or values of data.",
        gives: "A modified dataframe.",
        analogy: "Like organizing your toys."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Line chart', category: 'data', 
    data: { 
      label: 'Line chart', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'plot', 'label': 'Plot', 'type': 'any'}],
      parameters: {'x': 'time', 'y': 'value'},
      explanation: {
        what: "Visualizes data with Line chart.",
        how: "Generates a graphical plot.",
        gives: "A plot image or object.",
        analogy: "Like drawing a picture of your data."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Bar chart', category: 'data', 
    data: { 
      label: 'Bar chart', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'plot', 'label': 'Plot', 'type': 'any'}],
      parameters: {'x': 'category', 'y': 'count'},
      explanation: {
        what: "Visualizes data with Bar chart.",
        how: "Generates a graphical plot.",
        gives: "A plot image or object.",
        analogy: "Like drawing a picture of your data."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Box plot', category: 'data', 
    data: { 
      label: 'Box plot', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'plot', 'label': 'Plot', 'type': 'any'}],
      parameters: {'y': 'value'},
      explanation: {
        what: "Visualizes data with Box plot.",
        how: "Generates a graphical plot.",
        gives: "A plot image or object.",
        analogy: "Like drawing a picture of your data."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Violin plot', category: 'data', 
    data: { 
      label: 'Violin plot', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'plot', 'label': 'Plot', 'type': 'any'}],
      parameters: {'y': 'value'},
      explanation: {
        what: "Visualizes data with Violin plot.",
        how: "Generates a graphical plot.",
        gives: "A plot image or object.",
        analogy: "Like drawing a picture of your data."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Heatmap', category: 'data', 
    data: { 
      label: 'Heatmap', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'tensor'}], 
      outputs: [{'id': 'plot', 'label': 'Plot', 'type': 'any'}],
      parameters: {'cmap': 'viridis'},
      explanation: {
        what: "Visualizes data with Heatmap.",
        how: "Generates a graphical plot.",
        gives: "A plot image or object.",
        analogy: "Like drawing a picture of your data."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Pairplot', category: 'data', 
    data: { 
      label: 'Pairplot', category: 'data', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'plot', 'label': 'Plot', 'type': 'any'}],
      parameters: {'hue': 'class'},
      explanation: {
        what: "Visualizes data with Pairplot.",
        how: "Generates a graphical plot.",
        gives: "A plot image or object.",
        analogy: "Like drawing a picture of your data."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Confusion matrix', category: 'data', 
    data: { 
      label: 'Confusion matrix', category: 'data', 
      inputs: [{'id': 'y_true', 'label': 'True', 'type': 'tensor'}, {'id': 'y_pred', 'label': 'Pred', 'type': 'tensor'}], 
      outputs: [{'id': 'plot', 'label': 'Plot', 'type': 'any'}],
      parameters: {},
      explanation: {
        what: "Visualizes data with Confusion matrix.",
        how: "Generates a graphical plot.",
        gives: "A plot image or object.",
        analogy: "Like drawing a picture of your data."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'ROC/AUC curve', category: 'data', 
    data: { 
      label: 'ROC/AUC curve', category: 'data', 
      inputs: [{'id': 'y_true', 'label': 'True', 'type': 'tensor'}, {'id': 'y_score', 'label': 'Scores', 'type': 'tensor'}], 
      outputs: [{'id': 'plot', 'label': 'Plot', 'type': 'any'}],
      parameters: {},
      explanation: {
        what: "Visualizes data with ROC/AUC curve.",
        how: "Generates a graphical plot.",
        gives: "A plot image or object.",
        analogy: "Like drawing a picture of your data."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Precision-recall curve', category: 'data', 
    data: { 
      label: 'Precision-recall curve', category: 'data', 
      inputs: [{'id': 'y_true', 'label': 'True', 'type': 'tensor'}, {'id': 'y_score', 'label': 'Scores', 'type': 'tensor'}], 
      outputs: [{'id': 'plot', 'label': 'Plot', 'type': 'any'}],
      parameters: {},
      explanation: {
        what: "Visualizes data with Precision-recall curve.",
        how: "Generates a graphical plot.",
        gives: "A plot image or object.",
        analogy: "Like drawing a picture of your data."
      }
    } 
  },

  // --- 3. CLASSICAL ML ---
  { 
    type: 'baseNode', label: 'Random Forest', category: 'ml', 
    data: { 
      label: 'Random Forest', category: 'ml', 
      inputs: [{id:'in', label:'Data', type:'dataframe'}], 
      outputs: [{id:'model', label:'Model', type:'model'}],
      parameters: { n_estimators: 100, max_depth: 10, criterion: 'gini', n_jobs: -1 },
      explanation: {
        what: "A smart model made of hundreds of 'Decision Trees' working together.",
        how: "Every tree makes a guess, and the forest picks the answer that most trees agree on.",
        gives: "A very robust and reliable prediction model.",
        analogy: "Like asking 100 friends what movie to watch and picking the one most of them like!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'SVM Classifier', category: 'ml', 
    data: { 
      label: 'SVM Classifier', category: 'ml', 
      inputs: [{id:'in', label:'Data', type:'dataframe'}], 
      outputs: [{id:'model', label:'Model', type:'model'}],
      parameters: { kernel: 'rbf', C: 1.0, gamma: 'scale', probability: true },
      explanation: {
        what: "Finds the best 'boundary' to separate different groups of data.",
        how: "It tries to leave as much space as possible between the groups (the margin).",
        gives: "A model that can classify new data based on which side of the boundary it falls on.",
        analogy: "Like a referee drawing a clear line on the field to separate two teams!"
      }
    } 
  },

    { 
    type: 'baseNode', label: 'Linear Regression', category: 'ml', 
    data: { 
      label: 'Linear Regression', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'fit_intercept': true, 'normalize': false},
      explanation: {
        what: "Trains a Linear Regression model.",
        how: "Learns patterns to predict answers.",
        gives: "A trained model.",
        analogy: "Like learning to guess a price based on rules."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Ridge Regression', category: 'ml', 
    data: { 
      label: 'Ridge Regression', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'alpha': 1.0},
      explanation: {
        what: "Trains a Ridge Regression model.",
        how: "Learns patterns to predict answers.",
        gives: "A trained model.",
        analogy: "Like learning to guess a price based on rules."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Lasso', category: 'ml', 
    data: { 
      label: 'Lasso', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'alpha': 1.0},
      explanation: {
        what: "Trains a Lasso model.",
        how: "Learns patterns to predict answers.",
        gives: "A trained model.",
        analogy: "Like learning to guess a price based on rules."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'ElasticNet', category: 'ml', 
    data: { 
      label: 'ElasticNet', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'alpha': 1.0, 'l1_ratio': 0.5},
      explanation: {
        what: "Trains a ElasticNet model.",
        how: "Learns patterns to predict answers.",
        gives: "A trained model.",
        analogy: "Like learning to guess a price based on rules."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Logistic Regression', category: 'ml', 
    data: { 
      label: 'Logistic Regression', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'C': 1.0, 'max_iter': 100},
      explanation: {
        what: "Trains a Logistic Regression model.",
        how: "Learns patterns to predict answers.",
        gives: "A trained model.",
        analogy: "Like learning to guess a price based on rules."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Decision Tree', category: 'ml', 
    data: { 
      label: 'Decision Tree', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'max_depth': 10},
      explanation: {
        what: "Trains a Decision Tree model.",
        how: "Learns patterns to predict answers.",
        gives: "A trained model.",
        analogy: "Like learning to guess a price based on rules."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Gradient Boosting', category: 'ml', 
    data: { 
      label: 'Gradient Boosting', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'n_estimators': 100, 'learning_rate': 0.1},
      explanation: {
        what: "Trains a Gradient Boosting model.",
        how: "Learns patterns to predict answers.",
        gives: "A trained model.",
        analogy: "Like learning to guess a price based on rules."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'LightGBM', category: 'ml', 
    data: { 
      label: 'LightGBM', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'n_estimators': 100, 'learning_rate': 0.1},
      explanation: {
        what: "Trains a LightGBM model.",
        how: "Learns patterns to predict answers.",
        gives: "A trained model.",
        analogy: "Like learning to guess a price based on rules."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'CatBoost', category: 'ml', 
    data: { 
      label: 'CatBoost', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'iterations': 100, 'learning_rate': 0.1},
      explanation: {
        what: "Trains a CatBoost model.",
        how: "Learns patterns to predict answers.",
        gives: "A trained model.",
        analogy: "Like learning to guess a price based on rules."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'k-NN', category: 'ml', 
    data: { 
      label: 'k-NN', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'n_neighbors': 5},
      explanation: {
        what: "Trains a k-NN model.",
        how: "Learns patterns to predict answers.",
        gives: "A trained model.",
        analogy: "Like learning to guess a price based on rules."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'HMM', category: 'ml', 
    data: { 
      label: 'HMM', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'n_components': 3},
      explanation: {
        what: "Trains a HMM model.",
        how: "Learns patterns to predict answers.",
        gives: "A trained model.",
        analogy: "Like learning to guess a price based on rules."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'GMM', category: 'ml', 
    data: { 
      label: 'GMM', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'n_components': 3},
      explanation: {
        what: "Trains a GMM model.",
        how: "Finds hidden structures in data without labels.",
        gives: "A model or transformed data.",
        analogy: "Like sorting toys without knowing their names."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'DBSCAN', category: 'ml', 
    data: { 
      label: 'DBSCAN', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'eps': 0.5, 'min_samples': 5},
      explanation: {
        what: "Trains a DBSCAN model.",
        how: "Finds hidden structures in data without labels.",
        gives: "A model or transformed data.",
        analogy: "Like sorting toys without knowing their names."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'PCA', category: 'ml', 
    data: { 
      label: 'PCA', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}, {'id': 'out', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {'n_components': 2},
      explanation: {
        what: "Trains a PCA model.",
        how: "Finds hidden structures in data without labels.",
        gives: "A model or transformed data.",
        analogy: "Like sorting toys without knowing their names."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'SVD', category: 'ml', 
    data: { 
      label: 'SVD', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'n_components': 2},
      explanation: {
        what: "Trains a SVD model.",
        how: "Finds hidden structures in data without labels.",
        gives: "A model or transformed data.",
        analogy: "Like sorting toys without knowing their names."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'ICA', category: 'ml', 
    data: { 
      label: 'ICA', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'n_components': 2},
      explanation: {
        what: "Trains a ICA model.",
        how: "Finds hidden structures in data without labels.",
        gives: "A model or transformed data.",
        analogy: "Like sorting toys without knowing their names."
      }
    } 
  },
  { 
    type: 'baseNode', label: 't-SNE', category: 'ml', 
    data: { 
      label: 't-SNE', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'out', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {'n_components': 2, 'perplexity': 30},
      explanation: {
        what: "Trains a t-SNE model.",
        how: "Finds hidden structures in data without labels.",
        gives: "A model or transformed data.",
        analogy: "Like sorting toys without knowing their names."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'UMAP', category: 'ml', 
    data: { 
      label: 'UMAP', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'out', 'label': 'Data', 'type': 'dataframe'}],
      parameters: {'n_components': 2, 'n_neighbors': 15},
      explanation: {
        what: "Trains a UMAP model.",
        how: "Finds hidden structures in data without labels.",
        gives: "A model or transformed data.",
        analogy: "Like sorting toys without knowing their names."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Shallow Autoencoder', category: 'ml', 
    data: { 
      label: 'Shallow Autoencoder', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'latent_dim': 2},
      explanation: {
        what: "Trains a Shallow Autoencoder model.",
        how: "Finds hidden structures in data without labels.",
        gives: "A model or transformed data.",
        analogy: "Like sorting toys without knowing their names."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Learning curve', category: 'ml', 
    data: { 
      label: 'Learning curve', category: 'ml', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}, {'id': 'model', 'label': 'Model', 'type': 'model'}], 
      outputs: [{'id': 'plot', 'label': 'Plot', 'type': 'any'}],
      parameters: {'cv': 5},
      explanation: {
        what: "Executes Learning curve.",
        how: "Evaluates or manages a model.",
        gives: "A plot or nothing.",
        analogy: "Like saving your progress in a game."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Calibration curve', category: 'ml', 
    data: { 
      label: 'Calibration curve', category: 'ml', 
      inputs: [{'id': 'y_true', 'label': 'True', 'type': 'tensor'}, {'id': 'y_prob', 'label': 'Prob', 'type': 'tensor'}], 
      outputs: [{'id': 'plot', 'label': 'Plot', 'type': 'any'}],
      parameters: {'n_bins': 10},
      explanation: {
        what: "Executes Calibration curve.",
        how: "Evaluates or manages a model.",
        gives: "A plot or nothing.",
        analogy: "Like saving your progress in a game."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Save Model', category: 'ml', 
    data: { 
      label: 'Save Model', category: 'ml', 
      inputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}], 
      outputs: [],
      parameters: {'format': 'pkl'},
      explanation: {
        what: "Executes Save Model.",
        how: "Evaluates or manages a model.",
        gives: "A plot or nothing.",
        analogy: "Like saving your progress in a game."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Load Model', category: 'ml', 
    data: { 
      label: 'Load Model', category: 'ml', 
      inputs: [], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'format': 'pkl'},
      explanation: {
        what: "Executes Load Model.",
        how: "Evaluates or manages a model.",
        gives: "A plot or nothing.",
        analogy: "Like saving your progress in a game."
      }
    } 
  },

  // --- 4. DEEP LEARNING FUNDAMENTALS ---
  { 
    type: 'baseNode', label: 'LSTM Layer', category: 'dl', 
    data: { 
      label: 'LSTM Layer', category: 'dl', 
      inputs: [{id:'in', label:'Seq', type:'tensor'}], 
      outputs: [{id:'out', label:'Out', type:'tensor'}],
      parameters: { hidden_size: 128, num_layers: 1, bidirectional: false, dropout: 0.2 },
      explanation: {
        what: "An AI 'memory' block that can remember things from a long time ago.",
        how: "It uses 'gates' to decide which information to keep and which to forget.",
        gives: "A processed sequence where important past info is preserved.",
        analogy: "Like a student taking notes in class — they write down the important stuff and ignore the chatter!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'BatchNorm', category: 'dl', 
    data: { 
      label: 'BatchNorm', category: 'dl', 
      inputs: [{id:'in', label:'In', type:'tensor'}], 
      outputs: [{id:'out', label:'Out', type:'tensor'}],
      parameters: { momentum: 0.1, eps: 1e-5, affine: true },
      explanation: {
        what: "Smooths out the numbers inside the AI to help it learn faster.",
        how: "It keeps the mean and variance of the data consistent across the whole model.",
        gives: "A more stable training process.",
        analogy: "Like a supervisor making sure every worker is doing the same amount of work so nobody gets overwhelmed!"
      }
    } 
  },

    { 
    type: 'baseNode', label: 'Conv1D', category: 'dl', 
    data: { 
      label: 'Conv1D', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'filters': 32, 'kernel_size': 3},
      explanation: {
        what: "Applies Conv1D.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Conv3D', category: 'dl', 
    data: { 
      label: 'Conv3D', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'filters': 32, 'kernel_size': 3},
      explanation: {
        what: "Applies Conv3D.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'ConvTranspose2D', category: 'dl', 
    data: { 
      label: 'ConvTranspose2D', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'filters': 32, 'kernel_size': 3},
      explanation: {
        what: "Applies ConvTranspose2D.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'MaxPool2D', category: 'dl', 
    data: { 
      label: 'MaxPool2D', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'pool_size': 2},
      explanation: {
        what: "Applies MaxPool2D.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'AvgPool2D', category: 'dl', 
    data: { 
      label: 'AvgPool2D', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'pool_size': 2},
      explanation: {
        what: "Applies AvgPool2D.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'GlobalAvgPool2D', category: 'dl', 
    data: { 
      label: 'GlobalAvgPool2D', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Applies GlobalAvgPool2D.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'GlobalMaxPool2D', category: 'dl', 
    data: { 
      label: 'GlobalMaxPool2D', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Applies GlobalMaxPool2D.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'AdaptiveAvgPool2D', category: 'dl', 
    data: { 
      label: 'AdaptiveAvgPool2D', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'output_size': 1},
      explanation: {
        what: "Applies AdaptiveAvgPool2D.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'LayerNorm', category: 'dl', 
    data: { 
      label: 'LayerNorm', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'normalized_shape': 128},
      explanation: {
        what: "Applies LayerNorm.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'GroupNorm', category: 'dl', 
    data: { 
      label: 'GroupNorm', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'num_groups': 8},
      explanation: {
        what: "Applies GroupNorm.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'RMSNorm', category: 'dl', 
    data: { 
      label: 'RMSNorm', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'normalized_shape': 128},
      explanation: {
        what: "Applies RMSNorm.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Dropout2D', category: 'dl', 
    data: { 
      label: 'Dropout2D', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'p': 0.5},
      explanation: {
        what: "Applies Dropout2D.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Spatial Dropout', category: 'dl', 
    data: { 
      label: 'Spatial Dropout', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'p': 0.5},
      explanation: {
        what: "Applies Spatial Dropout.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Flatten', category: 'dl', 
    data: { 
      label: 'Flatten', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Applies Flatten.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Reshape', category: 'dl', 
    data: { 
      label: 'Reshape', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'shape': '-1, 256'},
      explanation: {
        what: "Applies Reshape.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Embedding', category: 'dl', 
    data: { 
      label: 'Embedding', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'num_embeddings': 10000, 'embedding_dim': 256},
      explanation: {
        what: "Applies Embedding.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'GRU', category: 'dl', 
    data: { 
      label: 'GRU', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'hidden_size': 128},
      explanation: {
        what: "Applies GRU.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'MultiHeadAttention', category: 'dl', 
    data: { 
      label: 'MultiHeadAttention', category: 'dl', 
      inputs: [{'id': 'q', 'label': 'Q', 'type': 'tensor'}, {'id': 'k', 'label': 'K', 'type': 'tensor'}, {'id': 'v', 'label': 'V', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'embed_dim': 256, 'num_heads': 8},
      explanation: {
        what: "Applies MultiHeadAttention.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Transformer Encoder Layer', category: 'dl', 
    data: { 
      label: 'Transformer Encoder Layer', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'d_model': 256, 'nhead': 8},
      explanation: {
        what: "Applies Transformer Encoder Layer.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Transformer Decoder Layer', category: 'dl', 
    data: { 
      label: 'Transformer Decoder Layer', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}, {'id': 'mem', 'label': 'Memory', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {'d_model': 256, 'nhead': 8},
      explanation: {
        what: "Applies Transformer Decoder Layer.",
        how: "Performs a tensor transformation.",
        gives: "A new tensor.",
        analogy: "Like a filter shaping water."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'ELU', category: 'dl', 
    data: { 
      label: 'ELU', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Applies ELU activation.",
        how: "Passes data through a mathematical gate.",
        gives: "An activated tensor.",
        analogy: "Like opening or closing a valve based on pressure."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'SELU', category: 'dl', 
    data: { 
      label: 'SELU', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Applies SELU activation.",
        how: "Passes data through a mathematical gate.",
        gives: "An activated tensor.",
        analogy: "Like opening or closing a valve based on pressure."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'GELU', category: 'dl', 
    data: { 
      label: 'GELU', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Applies GELU activation.",
        how: "Passes data through a mathematical gate.",
        gives: "An activated tensor.",
        analogy: "Like opening or closing a valve based on pressure."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Swish', category: 'dl', 
    data: { 
      label: 'Swish', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Applies Swish activation.",
        how: "Passes data through a mathematical gate.",
        gives: "An activated tensor.",
        analogy: "Like opening or closing a valve based on pressure."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Mish', category: 'dl', 
    data: { 
      label: 'Mish', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Applies Mish activation.",
        how: "Passes data through a mathematical gate.",
        gives: "An activated tensor.",
        analogy: "Like opening or closing a valve based on pressure."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Sigmoid', category: 'dl', 
    data: { 
      label: 'Sigmoid', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Applies Sigmoid activation.",
        how: "Passes data through a mathematical gate.",
        gives: "An activated tensor.",
        analogy: "Like opening or closing a valve based on pressure."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Tanh', category: 'dl', 
    data: { 
      label: 'Tanh', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Applies Tanh activation.",
        how: "Passes data through a mathematical gate.",
        gives: "An activated tensor.",
        analogy: "Like opening or closing a valve based on pressure."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Softmax', category: 'dl', 
    data: { 
      label: 'Softmax', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Applies Softmax activation.",
        how: "Passes data through a mathematical gate.",
        gives: "An activated tensor.",
        analogy: "Like opening or closing a valve based on pressure."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'LogSoftmax', category: 'dl', 
    data: { 
      label: 'LogSoftmax', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Applies LogSoftmax activation.",
        how: "Passes data through a mathematical gate.",
        gives: "An activated tensor.",
        analogy: "Like opening or closing a valve based on pressure."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Softplus', category: 'dl', 
    data: { 
      label: 'Softplus', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Applies Softplus activation.",
        how: "Passes data through a mathematical gate.",
        gives: "An activated tensor.",
        analogy: "Like opening or closing a valve based on pressure."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Hardswish', category: 'dl', 
    data: { 
      label: 'Hardswish', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Applies Hardswish activation.",
        how: "Passes data through a mathematical gate.",
        gives: "An activated tensor.",
        analogy: "Like opening or closing a valve based on pressure."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Hardtanh', category: 'dl', 
    data: { 
      label: 'Hardtanh', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Applies Hardtanh activation.",
        how: "Passes data through a mathematical gate.",
        gives: "An activated tensor.",
        analogy: "Like opening or closing a valve based on pressure."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Hardsigmoid', category: 'dl', 
    data: { 
      label: 'Hardsigmoid', category: 'dl', 
      inputs: [{'id': 'in', 'label': 'In', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Out', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Applies Hardsigmoid activation.",
        how: "Passes data through a mathematical gate.",
        gives: "An activated tensor.",
        analogy: "Like opening or closing a valve based on pressure."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'CrossEntropyLoss', category: 'dl', 
    data: { 
      label: 'CrossEntropyLoss', category: 'dl', 
      inputs: [{'id': 'pred', 'label': 'Pred', 'type': 'tensor'}, {'id': 'target', 'label': 'Target', 'type': 'tensor'}], 
      outputs: [{'id': 'loss', 'label': 'Loss', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Computes CrossEntropyLoss.",
        how: "Measures how wrong the model is.",
        gives: "A loss value.",
        analogy: "Like scoring a test."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'BCELoss', category: 'dl', 
    data: { 
      label: 'BCELoss', category: 'dl', 
      inputs: [{'id': 'pred', 'label': 'Pred', 'type': 'tensor'}, {'id': 'target', 'label': 'Target', 'type': 'tensor'}], 
      outputs: [{'id': 'loss', 'label': 'Loss', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Computes BCELoss.",
        how: "Measures how wrong the model is.",
        gives: "A loss value.",
        analogy: "Like scoring a test."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'BCEWithLogitsLoss', category: 'dl', 
    data: { 
      label: 'BCEWithLogitsLoss', category: 'dl', 
      inputs: [{'id': 'pred', 'label': 'Pred', 'type': 'tensor'}, {'id': 'target', 'label': 'Target', 'type': 'tensor'}], 
      outputs: [{'id': 'loss', 'label': 'Loss', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Computes BCEWithLogitsLoss.",
        how: "Measures how wrong the model is.",
        gives: "A loss value.",
        analogy: "Like scoring a test."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'MSELoss', category: 'dl', 
    data: { 
      label: 'MSELoss', category: 'dl', 
      inputs: [{'id': 'pred', 'label': 'Pred', 'type': 'tensor'}, {'id': 'target', 'label': 'Target', 'type': 'tensor'}], 
      outputs: [{'id': 'loss', 'label': 'Loss', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Computes MSELoss.",
        how: "Measures how wrong the model is.",
        gives: "A loss value.",
        analogy: "Like scoring a test."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'MAELoss', category: 'dl', 
    data: { 
      label: 'MAELoss', category: 'dl', 
      inputs: [{'id': 'pred', 'label': 'Pred', 'type': 'tensor'}, {'id': 'target', 'label': 'Target', 'type': 'tensor'}], 
      outputs: [{'id': 'loss', 'label': 'Loss', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Computes MAELoss.",
        how: "Measures how wrong the model is.",
        gives: "A loss value.",
        analogy: "Like scoring a test."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'HuberLoss', category: 'dl', 
    data: { 
      label: 'HuberLoss', category: 'dl', 
      inputs: [{'id': 'pred', 'label': 'Pred', 'type': 'tensor'}, {'id': 'target', 'label': 'Target', 'type': 'tensor'}], 
      outputs: [{'id': 'loss', 'label': 'Loss', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Computes HuberLoss.",
        how: "Measures how wrong the model is.",
        gives: "A loss value.",
        analogy: "Like scoring a test."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'KLDivLoss', category: 'dl', 
    data: { 
      label: 'KLDivLoss', category: 'dl', 
      inputs: [{'id': 'pred', 'label': 'Pred', 'type': 'tensor'}, {'id': 'target', 'label': 'Target', 'type': 'tensor'}], 
      outputs: [{'id': 'loss', 'label': 'Loss', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Computes KLDivLoss.",
        how: "Measures how wrong the model is.",
        gives: "A loss value.",
        analogy: "Like scoring a test."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'NLLLoss', category: 'dl', 
    data: { 
      label: 'NLLLoss', category: 'dl', 
      inputs: [{'id': 'pred', 'label': 'Pred', 'type': 'tensor'}, {'id': 'target', 'label': 'Target', 'type': 'tensor'}], 
      outputs: [{'id': 'loss', 'label': 'Loss', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Computes NLLLoss.",
        how: "Measures how wrong the model is.",
        gives: "A loss value.",
        analogy: "Like scoring a test."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'CosineEmbeddingLoss', category: 'dl', 
    data: { 
      label: 'CosineEmbeddingLoss', category: 'dl', 
      inputs: [{'id': 'pred', 'label': 'Pred', 'type': 'tensor'}, {'id': 'target', 'label': 'Target', 'type': 'tensor'}], 
      outputs: [{'id': 'loss', 'label': 'Loss', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Computes CosineEmbeddingLoss.",
        how: "Measures how wrong the model is.",
        gives: "A loss value.",
        analogy: "Like scoring a test."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'TripletMarginLoss', category: 'dl', 
    data: { 
      label: 'TripletMarginLoss', category: 'dl', 
      inputs: [{'id': 'pred', 'label': 'Pred', 'type': 'tensor'}, {'id': 'target', 'label': 'Target', 'type': 'tensor'}], 
      outputs: [{'id': 'loss', 'label': 'Loss', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Computes TripletMarginLoss.",
        how: "Measures how wrong the model is.",
        gives: "A loss value.",
        analogy: "Like scoring a test."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'FocalLoss', category: 'dl', 
    data: { 
      label: 'FocalLoss', category: 'dl', 
      inputs: [{'id': 'pred', 'label': 'Pred', 'type': 'tensor'}, {'id': 'target', 'label': 'Target', 'type': 'tensor'}], 
      outputs: [{'id': 'loss', 'label': 'Loss', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Computes FocalLoss.",
        how: "Measures how wrong the model is.",
        gives: "A loss value.",
        analogy: "Like scoring a test."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'DiceLoss', category: 'dl', 
    data: { 
      label: 'DiceLoss', category: 'dl', 
      inputs: [{'id': 'pred', 'label': 'Pred', 'type': 'tensor'}, {'id': 'target', 'label': 'Target', 'type': 'tensor'}], 
      outputs: [{'id': 'loss', 'label': 'Loss', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Computes DiceLoss.",
        how: "Measures how wrong the model is.",
        gives: "A loss value.",
        analogy: "Like scoring a test."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'CTCLoss', category: 'dl', 
    data: { 
      label: 'CTCLoss', category: 'dl', 
      inputs: [{'id': 'pred', 'label': 'Pred', 'type': 'tensor'}, {'id': 'target', 'label': 'Target', 'type': 'tensor'}], 
      outputs: [{'id': 'loss', 'label': 'Loss', 'type': 'tensor'}],
      parameters: {},
      explanation: {
        what: "Computes CTCLoss.",
        how: "Measures how wrong the model is.",
        gives: "A loss value.",
        analogy: "Like scoring a test."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'SGD', category: 'dl', 
    data: { 
      label: 'SGD', category: 'dl', 
      inputs: [], 
      outputs: [{'id': 'opt', 'label': 'Optimizer', 'type': 'any'}],
      parameters: {'lr': 0.001},
      explanation: {
        what: "Creates SGD optimizer.",
        how: "Decides how to adjust model weights.",
        gives: "An optimizer object.",
        analogy: "Like a steering wheel for the model."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Adam', category: 'dl', 
    data: { 
      label: 'Adam', category: 'dl', 
      inputs: [], 
      outputs: [{'id': 'opt', 'label': 'Optimizer', 'type': 'any'}],
      parameters: {'lr': 0.001},
      explanation: {
        what: "Creates Adam optimizer.",
        how: "Decides how to adjust model weights.",
        gives: "An optimizer object.",
        analogy: "Like a steering wheel for the model."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'RMSProp', category: 'dl', 
    data: { 
      label: 'RMSProp', category: 'dl', 
      inputs: [], 
      outputs: [{'id': 'opt', 'label': 'Optimizer', 'type': 'any'}],
      parameters: {'lr': 0.001},
      explanation: {
        what: "Creates RMSProp optimizer.",
        how: "Decides how to adjust model weights.",
        gives: "An optimizer object.",
        analogy: "Like a steering wheel for the model."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Adagrad', category: 'dl', 
    data: { 
      label: 'Adagrad', category: 'dl', 
      inputs: [], 
      outputs: [{'id': 'opt', 'label': 'Optimizer', 'type': 'any'}],
      parameters: {'lr': 0.001},
      explanation: {
        what: "Creates Adagrad optimizer.",
        how: "Decides how to adjust model weights.",
        gives: "An optimizer object.",
        analogy: "Like a steering wheel for the model."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Adadelta', category: 'dl', 
    data: { 
      label: 'Adadelta', category: 'dl', 
      inputs: [], 
      outputs: [{'id': 'opt', 'label': 'Optimizer', 'type': 'any'}],
      parameters: {'lr': 0.001},
      explanation: {
        what: "Creates Adadelta optimizer.",
        how: "Decides how to adjust model weights.",
        gives: "An optimizer object.",
        analogy: "Like a steering wheel for the model."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'LAMB', category: 'dl', 
    data: { 
      label: 'LAMB', category: 'dl', 
      inputs: [], 
      outputs: [{'id': 'opt', 'label': 'Optimizer', 'type': 'any'}],
      parameters: {'lr': 0.001},
      explanation: {
        what: "Creates LAMB optimizer.",
        how: "Decides how to adjust model weights.",
        gives: "An optimizer object.",
        analogy: "Like a steering wheel for the model."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Lion', category: 'dl', 
    data: { 
      label: 'Lion', category: 'dl', 
      inputs: [], 
      outputs: [{'id': 'opt', 'label': 'Optimizer', 'type': 'any'}],
      parameters: {'lr': 0.001},
      explanation: {
        what: "Creates Lion optimizer.",
        how: "Decides how to adjust model weights.",
        gives: "An optimizer object.",
        analogy: "Like a steering wheel for the model."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Muon', category: 'dl', 
    data: { 
      label: 'Muon', category: 'dl', 
      inputs: [], 
      outputs: [{'id': 'opt', 'label': 'Optimizer', 'type': 'any'}],
      parameters: {'lr': 0.001},
      explanation: {
        what: "Creates Muon optimizer.",
        how: "Decides how to adjust model weights.",
        gives: "An optimizer object.",
        analogy: "Like a steering wheel for the model."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'StepLR', category: 'dl', 
    data: { 
      label: 'StepLR', category: 'dl', 
      inputs: [{'id': 'opt', 'label': 'Optimizer', 'type': 'any'}], 
      outputs: [{'id': 'sch', 'label': 'Scheduler', 'type': 'any'}],
      parameters: {},
      explanation: {
        what: "Creates StepLR scheduler.",
        how: "Adjusts learning rate over time.",
        gives: "A scheduler object.",
        analogy: "Like pressing the gas or brake over time."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'MultiStepLR', category: 'dl', 
    data: { 
      label: 'MultiStepLR', category: 'dl', 
      inputs: [{'id': 'opt', 'label': 'Optimizer', 'type': 'any'}], 
      outputs: [{'id': 'sch', 'label': 'Scheduler', 'type': 'any'}],
      parameters: {},
      explanation: {
        what: "Creates MultiStepLR scheduler.",
        how: "Adjusts learning rate over time.",
        gives: "A scheduler object.",
        analogy: "Like pressing the gas or brake over time."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'CosineAnnealingLR', category: 'dl', 
    data: { 
      label: 'CosineAnnealingLR', category: 'dl', 
      inputs: [{'id': 'opt', 'label': 'Optimizer', 'type': 'any'}], 
      outputs: [{'id': 'sch', 'label': 'Scheduler', 'type': 'any'}],
      parameters: {},
      explanation: {
        what: "Creates CosineAnnealingLR scheduler.",
        how: "Adjusts learning rate over time.",
        gives: "A scheduler object.",
        analogy: "Like pressing the gas or brake over time."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'CosineAnnealingWarmRestarts', category: 'dl', 
    data: { 
      label: 'CosineAnnealingWarmRestarts', category: 'dl', 
      inputs: [{'id': 'opt', 'label': 'Optimizer', 'type': 'any'}], 
      outputs: [{'id': 'sch', 'label': 'Scheduler', 'type': 'any'}],
      parameters: {},
      explanation: {
        what: "Creates CosineAnnealingWarmRestarts scheduler.",
        how: "Adjusts learning rate over time.",
        gives: "A scheduler object.",
        analogy: "Like pressing the gas or brake over time."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'OneCycleLR', category: 'dl', 
    data: { 
      label: 'OneCycleLR', category: 'dl', 
      inputs: [{'id': 'opt', 'label': 'Optimizer', 'type': 'any'}], 
      outputs: [{'id': 'sch', 'label': 'Scheduler', 'type': 'any'}],
      parameters: {},
      explanation: {
        what: "Creates OneCycleLR scheduler.",
        how: "Adjusts learning rate over time.",
        gives: "A scheduler object.",
        analogy: "Like pressing the gas or brake over time."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'ReduceLROnPlateau', category: 'dl', 
    data: { 
      label: 'ReduceLROnPlateau', category: 'dl', 
      inputs: [{'id': 'opt', 'label': 'Optimizer', 'type': 'any'}], 
      outputs: [{'id': 'sch', 'label': 'Scheduler', 'type': 'any'}],
      parameters: {},
      explanation: {
        what: "Creates ReduceLROnPlateau scheduler.",
        how: "Adjusts learning rate over time.",
        gives: "A scheduler object.",
        analogy: "Like pressing the gas or brake over time."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'WarmupScheduler', category: 'dl', 
    data: { 
      label: 'WarmupScheduler', category: 'dl', 
      inputs: [{'id': 'opt', 'label': 'Optimizer', 'type': 'any'}], 
      outputs: [{'id': 'sch', 'label': 'Scheduler', 'type': 'any'}],
      parameters: {},
      explanation: {
        what: "Creates WarmupScheduler scheduler.",
        how: "Adjusts learning rate over time.",
        gives: "A scheduler object.",
        analogy: "Like pressing the gas or brake over time."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'PolynomialLR', category: 'dl', 
    data: { 
      label: 'PolynomialLR', category: 'dl', 
      inputs: [{'id': 'opt', 'label': 'Optimizer', 'type': 'any'}], 
      outputs: [{'id': 'sch', 'label': 'Scheduler', 'type': 'any'}],
      parameters: {},
      explanation: {
        what: "Creates PolynomialLR scheduler.",
        how: "Adjusts learning rate over time.",
        gives: "A scheduler object.",
        analogy: "Like pressing the gas or brake over time."
      }
    } 
  },

  // --- 5. COMPUTER VISION ---
  { 
    type: 'baseNode', label: 'ResNet Backbone', category: 'cv', 
    data: { 
      label: 'ResNet Backbone', category: 'cv', 
      inputs: [{id:'img', label:'Img', type:'image'}], 
      outputs: [{id:'feat', label:'Feat', type:'tensor'}],
      parameters: { variant: 'resnet50', pretrained: true, freeze: false },
      explanation: {
        what: "A world-class 'vision' model that can recognize thousands of objects.",
        how: "It uses 'shortcut connections' to learn very deep patterns without getting confused.",
        gives: "High-level features of an image.",
        analogy: "Like a professional photographer who can look at any photo and instantly tell you what's in it!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Data Augment', category: 'cv', 
    data: { 
      label: 'Data Augment', category: 'cv', 
      inputs: [{id:'img', label:'In', type:'image'}], 
      outputs: [{id:'img', label:'Out', type:'image'}],
      parameters: { h_flip: true, rotation: 15, brightness: 0.2, contrast: 0.2 },
      explanation: {
        what: "Creates new versions of your photos to train a better AI.",
        how: "It flips, rotates, and changes the color of images so the AI sees the same thing from different angles.",
        gives: "A more diverse and challenging set of training photos.",
        analogy: "Like a soccer player practicing their kicks in the rain, sun, and wind to be ready for any game!"
      }
    } 
  },

  // --- 6. SEQUENCE & NLP ---
  { 
    type: 'baseNode', label: 'HF Tokenizer', category: 'nlp', 
    data: { 
      label: 'HF Tokenizer', category: 'nlp', 
      inputs: [{id:'txt', label:'Text', type:'text'}], 
      outputs: [{id:'tok', label:'Tokens', type:'tensor'}],
      parameters: { model: 'bert-base-uncased', max_length: 512, padding: true },
      explanation: {
        what: "Turns human words into numbers that a computer brain can understand.",
        how: "It breaks sentences into small pieces (tokens) and assigns a unique number to each piece.",
        gives: "A list of numbers (tensors) ready for an LLM.",
        analogy: "Like a translator who turns English words into a secret code that only a specific robot knows!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'RAG Retriever', category: 'nlp', 
    data: { 
      label: 'RAG Retriever', category: 'nlp', 
      inputs: [{id:'q', label:'Query', type:'text'}, {id:'db', label:'Store', type:'any'}], 
      outputs: [{id:'doc', label:'Docs', type:'text'}],
      parameters: { k: 4, search_type: 'similarity', score_threshold: 0.5 },
      explanation: {
        what: "Searches through a huge library of documents to find the best answer.",
        how: "It compares your question to every document and picks the most relevant ones.",
        gives: "The most helpful paragraphs to answer your question.",
        analogy: "Like a super-fast librarian who can find exactly the right page in 1,000 books in a split second!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Whisper STT', category: 'nlp', 
    data: { 
      label: 'Whisper STT', category: 'nlp', 
      inputs: [{id:'audio', label:'Audio', type:'audio'}], 
      outputs: [{id:'text', label:'Text', type:'text'}],
      parameters: { audioPath: 'input.mp3' },
      explanation: {
        what: "Turns spoken words into written text.",
        how: "It uses a deep neural network (Whisper) to listen to audio and type out what it hears.",
        gives: "A transcript of the audio.",
        analogy: "Like a very fast secretary who can write down exactly what you say!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Image Preview', category: 'cv', 
    data: { 
      label: 'Image Preview', category: 'cv', 
      inputs: [{id:'img', label:'Img', type:'image'}], 
      outputs: [],
      explanation: {
        what: "Displays the picture so you can see what the AI sees.",
        how: "It takes the processed image data and shows it on your screen.",
        gives: "A visual window into your data.",
        analogy: "Like a TV screen that shows you the movie the robot is watching!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Table Viewer', category: 'data', 
    data: { 
      label: 'Table Viewer', category: 'data', 
      inputs: [{id:'df', label:'Data', type:'dataframe'}], 
      outputs: [],
      explanation: {
        what: "Lets you look inside a table of data like an Excel sheet.",
        how: "It formats the numbers and text into a clean grid.",
        gives: "A detailed view of your dataset.",
        analogy: "Like opening a book to read exactly what's written inside!"
      }
    } 
  },

  // --- 7. GENERATIVE MODELS ---
  { 
    type: 'baseNode', label: 'Diffusion Scheduler', category: 'gen', 
    data: { 
      label: 'Diffusion Scheduler', category: 'gen', 
      inputs: [], 
      outputs: [{id:'sch', label:'Sched', type:'any'}],
      parameters: { type: 'DPM++ 2M Karras', steps: 20, beta_start: 0.00085, beta_end: 0.012 },
      explanation: {
        what: "Controls how 'Art Maker' AIs clean up noise to create a picture.",
        how: "It manages the math steps that slowly turn a fuzzy screen into a beautiful image.",
        gives: "A set of instructions for the image generation process.",
        analogy: "Like the 'timer' and 'temperature' settings on a magic oven that's baking a picture!"
      }
    } 
  },

  // --- 11. INTERPRETABILITY ---
  { 
    type: 'baseNode', label: 'SHAP Explain', category: 'explain', 
    data: { 
      label: 'SHAP Explain', category: 'explain', 
      inputs: [{id:'m', label:'Model', type:'model'}, {id:'d', label:'Data', type:'dataframe'}], 
      outputs: [{id:'p', label:'Plot', type:'image'}],
      parameters: { explainer: 'TreeExplainer', n_samples: 100, plot_type: 'beeswarm' },
      explanation: {
        what: "Shows exactly why an AI made a certain decision.",
        how: "It gives credit to each input (like age or income) for its contribution to the final answer.",
        gives: "A colorful chart showing which features were most important.",
        analogy: "Like a detective explaining exactly which clues led them to catch the thief!"
      }
    } 
  },
  { 
    type: 'lossCurveNode', label: 'Loss Curve Chart', category: 'explain', 
    data: { 
      label: 'Loss Curve Chart', category: 'explain', 
      inputs: [{id:'in', label:'Trainer', type:'any'}], 
      outputs: [],
      explanation: {
        what: "Visualizes the training loss over epochs.",
        how: "Renders a live line chart during model training.",
        gives: "A live loss chart plotted directly on the canvas.",
        analogy: "Like watching a runner's lap times get faster as they practice!"
      }
    } 
  },

  // --- 13. MLOPS & PRODUCTION ---
  { 
    type: 'baseNode', label: 'FastAPI Server', category: 'mlops', 
    data: { 
      label: 'FastAPI Server', category: 'mlops', 
      inputs: [{id:'m', label:'Model', type:'model'}], 
      outputs: [{id:'url', label:'Endpoint', type:'text'}],
      parameters: { host: '0.0.0.0', port: 8000, workers: 4, enable_docs: true },
      explanation: {
        what: "Turns your AI into a website that anyone in the world can use.",
        how: "It creates a digital door (API) that other computers can knock on to ask your AI questions.",
        gives: "A live URL address for your AI.",
        analogy: "Like opening a lemonade stand where people can come and buy your AI's smart answers!"
      }
    } 
  },

  // --- 15. KIDS CORNER ---
  { 
    type: 'baseNode', label: 'R-P-S Gesture', category: 'kids', 
    data: { 
      label: 'R-P-S Gesture', category: 'cv', 
      inputs: [{id:'i', label:'Hand', type:'image'}], 
      outputs: [{id:'m', label:'Move', type:'text'}],
      explanation: {
        what: "Plays Rock-Paper-Scissors with you using your webcam!",
        how: "It looks at the shape of your hand and figures out if you're making a Rock, Paper, or Scissor.",
        gives: "Your move as a text word.",
        analogy: "Like a magic friend who can see through your camera and play games with you!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Emoji Predictor', category: 'kids', 
    data: { 
      label: 'Emoji Predictor', category: 'nlp', 
      inputs: [{id:'t', label:'Text', type:'text'}], 
      outputs: [{id:'e', label:'Emoji', type:'text'}],
      explanation: {
        what: "Guesses the perfect emoji for any sentence you type.",
        how: "It looks for 'feeling' words and matches them to the right face.",
        gives: "A single emoji character.",
        analogy: "Like a magic mirror that makes a funny face based on what you say to it!"
      }
    } 
  },
  // --- 1. MATH & STATISTICS (GAPS) ---
  { 
    type: 'baseNode', label: 'Numerical Gradient', category: 'math', 
    data: { 
      label: 'Numerical Gradient', category: 'math', 
      inputs: [{id:'f', label:'Func', type:'any'}], outputs: [{id:'g', label:'Grad', type:'tensor'}],
      parameters: { step_size: 1e-4, method: 'central' },
      explanation: {
        what: "Calculates how steep a hill is at any point.",
        how: "It looks at a tiny step forward and backward to see how much the value changes.",
        gives: "The direction of the steepest climb (the gradient).",
        analogy: "Like a hiker using their feet to feel which way is up on a foggy mountain!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Correlation Matrix', category: 'math', 
    data: { 
      label: 'Correlation Matrix', category: 'math', 
      inputs: [{id:'df', label:'Data', type:'dataframe'}], outputs: [{id:'mat', label:'Matrix', type:'tensor'}],
      explanation: {
        what: "Shows how much different things 'move together'.",
        how: "It calculates a score from -1 to 1 for every pair of columns in your data.",
        gives: "A grid showing which columns are best friends and which are opposites.",
        analogy: "Like a chart showing that when it's sunny, ice cream sales and sunscreen sales both go up together!"
      }
    } 
  },

  // --- 2. PYTHON & DATA (GAPS) ---
  { 
    type: 'baseNode', label: 'Load Parquet', category: 'data', 
    data: { 
      label: 'Load Parquet', category: 'data', 
      inputs: [], outputs: [{id:'df', label:'Data', type:'dataframe'}],
      parameters: { filePath: '', columns: '*' },
      explanation: {
        what: "Opens a 'Parquet' file, which is a super-fast way to store big data.",
        how: "It reads data in columns instead of rows, which makes it much faster for AI.",
        gives: "A table ready for analysis.",
        analogy: "Like a magic bookshelf where you can pull out just the red books without touching the others!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Scatter Plot', category: 'data', 
    data: { 
      label: 'Scatter Plot', category: 'data', 
      inputs: [{id:'df', label:'Data', type:'dataframe'}], outputs: [{id:'plot', label:'Plot', type:'image'}],
      parameters: { x: '', y: '', color: '', size: '' },
      explanation: {
        what: "Draws a cloud of dots to show patterns in your data.",
        how: "It places each data point on a map based on two different values.",
        gives: "A beautiful chart that reveals clusters or trends.",
        analogy: "Like pinning todos on a map of your room to see where the mess is concentrated!"
      }
    } 
  },

  // --- 3. CLASSICAL ML (GAPS) ---
  { 
    type: 'baseNode', label: 'Naive Bayes', category: 'ml', 
    data: { 
      label: 'Naive Bayes', category: 'ml', 
      inputs: [{id:'in', label:'Data', type:'dataframe'}], outputs: [{id:'model', label:'Model', type:'model'}],
      parameters: { type: 'Gaussian', var_smoothing: 1e-9 },
      explanation: {
        what: "A simple but fast classifier based on probability.",
        how: "It assumes every feature is independent and uses math to guess the class.",
        gives: "A predictive model, often used for spam detection.",
        analogy: "Like a person who guesses if it will rain just by looking at the clouds, without checking the wind!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Cross-Validation', category: 'ml', 
    data: { 
      label: 'Cross-Validation', category: 'ml', 
      inputs: [{id:'m', label:'Model', type:'model'}, {id:'d', label:'Data', type:'dataframe'}], outputs: [{id:'score', label:'Score', type:'number'}],
      parameters: { folds: 5, scoring: 'accuracy' },
      explanation: {
        what: "Tests your AI multiple times to make sure it's actually smart.",
        how: "It splits the data into 5 pieces, trains on 4 and tests on 1, repeating this 5 times.",
        gives: "An average score that you can really trust.",
        analogy: "Like taking 5 different practice tests instead of just one to make sure you really know the subject!"
      }
    } 
  },

  // --- 4. DEEP LEARNING (GAPS) ---
  { 
    type: 'baseNode', label: 'AdamW Optimizer', category: 'dl', 
    data: { 
      label: 'AdamW Optimizer', category: 'dl', 
      inputs: [], outputs: [{id:'opt', label:'Optim', type:'any'}],
      parameters: { lr: 0.001, weight_decay: 0.01, beta1: 0.9, beta2: 0.999 },
      explanation: {
        what: "The 'Engine' that helps the AI learn from its mistakes.",
        how: "It adjusts the AI's weights using math that prevents it from over-learning (weight decay).",
        gives: "Optimization settings for your trainer.",
        analogy: "Like a coach who gives you tips after every move to help you get better at a game!"
      }
    } 
  },

  // --- 5. COMPUTER VISION (GAPS) ---
  { 
    type: 'baseNode', label: 'EfficientNet', category: 'cv', 
    data: { 
      label: 'EfficientNet', category: 'cv', 
      inputs: [{id:'img', label:'Img', type:'image'}], outputs: [{id:'feat', label:'Feat', type:'tensor'}],
      parameters: { variant: 'b0', pretrained: true },
      explanation: {
        what: "A super-efficient model that is both small and very smart.",
        how: "It scales width, depth, and resolution perfectly to get the best results.",
        gives: "Image features or classifications.",
        analogy: "Like a pocket-sized Swiss Army knife that has every tool you need!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Segmentation Mask', category: 'cv', 
    data: { 
      label: 'Segmentation Mask', category: 'cv', 
      inputs: [{id:'img', label:'Img', type:'image'}], outputs: [{id:'mask', label:'Mask', type:'image'}],
      parameters: { model: 'DeepLabV3', backbone: 'resnet50' },
      explanation: {
        what: "Colors in every single pixel of an image to show exactly where objects are.",
        how: "It classifies every dot in the photo as 'Person', 'Car', 'Tree', etc.",
        gives: "A colorful map showing the exact shapes of everything in the photo.",
        analogy: "Like a coloring book where the AI knows exactly which crayon to use for every tiny spot!"
      }
    } 
  },

  // --- 6. SEQUENCE & NLP (GAPS) ---
  { 
    type: 'baseNode', label: 'Doc Chunker', category: 'nlp', 
    data: { 
      label: 'Doc Chunker', category: 'nlp', 
      inputs: [{id:'doc', label:'Doc', type:'text'}], outputs: [{id:'chunks', label:'Chunks', type:'any'}],
      parameters: { size: 500, overlap: 50, strategy: 'recursive' },
      explanation: {
        what: "Cuts long books or files into bite-sized pieces for the AI.",
        how: "It splits text by paragraphs or sentences so the AI doesn't get overwhelmed.",
        gives: "A list of small text chunks.",
        analogy: "Like cutting a giant pizza into slices so you can eat it one bit at a time!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'AI Translator', category: 'nlp', 
    data: { 
      label: 'AI Translator', category: 'nlp', 
      inputs: [{id:'txt', label:'Source', type:'text'}], outputs: [{id:'txt', label:'Target', type:'text'}],
      parameters: { src_lang: 'en', tgt_lang: 'fr', model: 'Helsinki-NLP' },
      explanation: {
        what: "Turns words from one language into another perfectly.",
        how: "It understands the meaning of the sentence and finds the best words in the new language.",
        gives: "Translated text.",
        analogy: "Like a magic earbud that lets you understand anyone in the world!"
      }
    } 
  },

  // --- 9. ADVANCED ARCHITECTURES (GAPS) ---
  { 
    type: 'baseNode', label: 'CLIP Encoder', category: 'advanced', 
    data: { 
      label: 'CLIP Encoder', category: 'advanced', 
      inputs: [{id:'img', label:'Img', type:'image'}, {id:'txt', label:'Text', type:'text'}], outputs: [{id:'sim', label:'Sim', type:'number'}],
      explanation: {
        what: "Connects pictures and words together in the same 'brain space'.",
        how: "It learns that the word 'Dog' and a picture of a dog mean the same thing.",
        gives: "A score showing how well a caption matches an image.",
        analogy: "Like a game where you have to match a description to the right photo!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'MoE Layer', category: 'advanced', 
    data: { 
      label: 'MoE Layer', category: 'advanced', 
      inputs: [{id:'in', label:'In', type:'tensor'}], outputs: [{id:'out', label:'Out', type:'tensor'}],
      parameters: { experts: 8, top_k: 2 },
      explanation: {
        what: "A 'Team of Experts' where only the best ones work on each problem.",
        how: "It routes each piece of data to the 2 experts who know the most about it.",
        gives: "Highly efficient processed data.",
        analogy: "Like a hospital where a patient is sent only to the specific doctors who can help them!"
      }
    } 
  },

  // --- 13. MLOPS (GAPS) ---
  { 
    type: 'baseNode', label: 'Docker Exporter', category: 'mlops', 
    data: { 
      label: 'Docker Exporter', category: 'mlops', 
      inputs: [{id:'p', label:'Pipe', type:'any'}], outputs: [{id:'file', label:'Docker', type:'text'}],
      explanation: {
        what: "Packs your entire AI pipeline into a portable 'container'.",
        how: "It writes a special script (Dockerfile) that can run your AI on any computer in the world.",
        gives: "A ready-to-use deployment package.",
        analogy: "Like packing your whole room into a magic suitcase that you can unpack anywhere!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Loss Curve Chart', category: 'mlops', 
    data: { 
      label: 'Loss Curve Chart', category: 'mlops', 
      inputs: [{id:'model', label:'Model', type:'model'}], outputs: [],
      explanation: {
        what: "Visualizes the learning progress of your model.",
        how: "It plots the training loss over time (epochs).",
        gives: "A live chart of the training process.",
        analogy: "Like a graph showing your grades improving as you study!"
      }
    } 
  },

  // --- 15. KIDS CORNER (GAPS) ---
  { 
    type: 'baseNode', label: 'Draw & Teach', category: 'kids', 
    data: { 
      label: 'Draw & Teach', category: 'kids', 
      inputs: [{id:'draw', label:'Drawing', type:'image'}], outputs: [{id:'num', label:'Digit', type:'number'}],
      explanation: {
        what: "You draw a number, and the AI tries to guess what you wrote!",
        how: "It looks at the pixels you drew and compares them to thousands of other numbers it knows.",
        gives: "The AI's best guess (0-9).",
        analogy: "Like a smart friend who can read your handwriting, even if it's messy!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Story Maker', category: 'kids', 
    data: { 
      label: 'Story Maker', category: 'kids', 
      inputs: [{id:'hero', label:'Hero', type:'text'}], outputs: [{id:'story', label:'Story', type:'text'}],
      parameters: { genre: 'Fantasy', length: 'Short' },
      explanation: {
        what: "Writes a fun adventure story starring YOU!",
        how: "It uses a Large Language Model (LLM) to imagine a world based on your hero's name.",
        gives: "A fun bedtime story.",
        analogy: "Like a magic book that writes a new page every time you open it!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Custom Python', category: 'advanced', 
    data: { 
      label: 'Custom Python', category: 'advanced', 
      inputs: [{id:'in', label:'Input', type:'any'}], 
      outputs: [{id:'out', label:'Output', type:'any'}],
      parameters: { code: 'def main(input):\n  # Write your logic here\n  return input' },
      explanation: {
        what: "Lets you write your own secret instructions for the AI.",
        how: "It runs the Python code you type directly inside the node.",
        gives: "Whatever result your code produces.",
        analogy: "Like a magic blank scroll where you can write any spell you want!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Metrics Eval', category: 'ml', 
    data: { 
      label: 'Metrics Eval', category: 'ml', 
      inputs: [{id:'y_true', label:'Actual', type:'tensor'}, {id:'y_pred', label:'Pred', type:'tensor'}], 
      outputs: [{id:'score', label:'Score', type:'number'}],
      parameters: { metric: 'accuracy' },
      explanation: {
        what: "Scores the AI to see how many questions it got right.",
        how: "It compares the AI's guesses to the real answers.",
        gives: "A percentage score (like a grade on a test).",
        analogy: "Like a teacher grading your homework to see how much you learned!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'ONNX Export', category: 'mlops', 
    data: { 
      label: 'ONNX Export', category: 'mlops', 
      inputs: [{id:'model', label:'Model', type:'model'}], 
      outputs: [{id:'file', label:'File', type:'text'}],
      parameters: { filename: 'model.onnx' },
      explanation: {
        what: "Saves your AI in a universal format that can run anywhere.",
        how: "It converts the PyTorch model into an ONNX file.",
        gives: "A portable model file.",
        analogy: "Like putting your toys in a box so you can take them to a friend's house!"
      }
    } 
  },
  { 
    type: 'chatNode', label: 'Chat Interface', category: 'gen', 
    data: { 
      label: 'Chat Interface', category: 'gen', 
      inputs: [{id:'msg', label:'Input', type:'text'}], 
      outputs: [{id:'out', label:'Out', type:'text'}],
      chatHistory: [],
      explanation: {
        what: "A chat window that lets you talk to your AI model directly.",
        how: "It displays messages from you and responses from the AI in clean chat bubbles.",
        gives: "An interactive way to test and use your language models.",
        analogy: "Like a messaging app (WhatsApp/Discord) for your AI!"
      }
    } 
  },
  { 
    type: 'baseNode', label: 'VGG', category: 'cv', 
    data: { 
      label: 'VGG', category: 'cv', 
      inputs: [{'id': 'in', 'label': 'Image', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Preds', 'type': 'tensor'}],
      parameters: {'version': '16', 'pretrained': true},
      explanation: {
        what: "Runs VGG model.",
        how: "Analyzes image pixels.",
        gives: "Predictions or masks.",
        analogy: "Like a magnifying glass for computers."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'DenseNet', category: 'cv', 
    data: { 
      label: 'DenseNet', category: 'cv', 
      inputs: [{'id': 'in', 'label': 'Image', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Preds', 'type': 'tensor'}],
      parameters: {'version': '121', 'pretrained': true},
      explanation: {
        what: "Runs DenseNet model.",
        how: "Analyzes image pixels.",
        gives: "Predictions or masks.",
        analogy: "Like a magnifying glass for computers."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'ConvNeXt', category: 'cv', 
    data: { 
      label: 'ConvNeXt', category: 'cv', 
      inputs: [{'id': 'in', 'label': 'Image', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Preds', 'type': 'tensor'}],
      parameters: {'size': 'base', 'pretrained': true},
      explanation: {
        what: "Runs ConvNeXt model.",
        how: "Analyzes image pixels.",
        gives: "Predictions or masks.",
        analogy: "Like a magnifying glass for computers."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'MobileNet', category: 'cv', 
    data: { 
      label: 'MobileNet', category: 'cv', 
      inputs: [{'id': 'in', 'label': 'Image', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Preds', 'type': 'tensor'}],
      parameters: {'version': 'v3_small', 'pretrained': true},
      explanation: {
        what: "Runs MobileNet model.",
        how: "Analyzes image pixels.",
        gives: "Predictions or masks.",
        analogy: "Like a magnifying glass for computers."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Faster R-CNN', category: 'cv', 
    data: { 
      label: 'Faster R-CNN', category: 'cv', 
      inputs: [{'id': 'in', 'label': 'Image', 'type': 'tensor'}], 
      outputs: [{'id': 'boxes', 'label': 'Boxes', 'type': 'tensor'}, {'id': 'labels', 'label': 'Labels', 'type': 'tensor'}],
      parameters: {'backbone': 'resnet50'},
      explanation: {
        what: "Runs Faster R-CNN model.",
        how: "Analyzes image pixels.",
        gives: "Predictions or masks.",
        analogy: "Like a magnifying glass for computers."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'SSD', category: 'cv', 
    data: { 
      label: 'SSD', category: 'cv', 
      inputs: [{'id': 'in', 'label': 'Image', 'type': 'tensor'}], 
      outputs: [{'id': 'boxes', 'label': 'Boxes', 'type': 'tensor'}, {'id': 'labels', 'label': 'Labels', 'type': 'tensor'}],
      parameters: {'backbone': 'vgg16'},
      explanation: {
        what: "Runs SSD model.",
        how: "Analyzes image pixels.",
        gives: "Predictions or masks.",
        analogy: "Like a magnifying glass for computers."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'U-Net', category: 'cv', 
    data: { 
      label: 'U-Net', category: 'cv', 
      inputs: [{'id': 'in', 'label': 'Image', 'type': 'tensor'}], 
      outputs: [{'id': 'mask', 'label': 'Mask', 'type': 'tensor'}],
      parameters: {'classes': 2},
      explanation: {
        what: "Runs U-Net model.",
        how: "Analyzes image pixels.",
        gives: "Predictions or masks.",
        analogy: "Like a magnifying glass for computers."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'DeepLabV3+', category: 'cv', 
    data: { 
      label: 'DeepLabV3+', category: 'cv', 
      inputs: [{'id': 'in', 'label': 'Image', 'type': 'tensor'}], 
      outputs: [{'id': 'mask', 'label': 'Mask', 'type': 'tensor'}],
      parameters: {'backbone': 'resnet101'},
      explanation: {
        what: "Runs DeepLabV3+ model.",
        how: "Analyzes image pixels.",
        gives: "Predictions or masks.",
        analogy: "Like a magnifying glass for computers."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'SAM', category: 'cv', 
    data: { 
      label: 'SAM', category: 'cv', 
      inputs: [{'id': 'in', 'label': 'Image', 'type': 'tensor'}, {'id': 'pts', 'label': 'Points', 'type': 'tensor'}], 
      outputs: [{'id': 'mask', 'label': 'Mask', 'type': 'tensor'}],
      parameters: {'model_type': 'vit_h'},
      explanation: {
        what: "Runs SAM model.",
        how: "Analyzes image pixels.",
        gives: "Predictions or masks.",
        analogy: "Like a magnifying glass for computers."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'RNN', category: 'nlp', 
    data: { 
      label: 'RNN', category: 'nlp', 
      inputs: [{'id': 'in', 'label': 'Sequence', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Features', 'type': 'tensor'}],
      parameters: {'hidden_size': 128, 'num_layers': 1},
      explanation: {
        what: "Runs RNN.",
        how: "Processes sequences of text.",
        gives: "Vectors or language models.",
        analogy: "Like reading and translating."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Seq2Seq', category: 'nlp', 
    data: { 
      label: 'Seq2Seq', category: 'nlp', 
      inputs: [{'id': 'src', 'label': 'Source', 'type': 'tensor'}, {'id': 'tgt', 'label': 'Target', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Outputs', 'type': 'tensor'}],
      parameters: {'hidden_size': 256},
      explanation: {
        what: "Runs Seq2Seq.",
        how: "Processes sequences of text.",
        gives: "Vectors or language models.",
        analogy: "Like reading and translating."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'GloVe', category: 'nlp', 
    data: { 
      label: 'GloVe', category: 'nlp', 
      inputs: [{'id': 'in', 'label': 'Text', 'type': 'any'}], 
      outputs: [{'id': 'out', 'label': 'Embeddings', 'type': 'tensor'}],
      parameters: {'dim': 100},
      explanation: {
        what: "Runs GloVe.",
        how: "Processes sequences of text.",
        gives: "Vectors or language models.",
        analogy: "Like reading and translating."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Word2Vec', category: 'nlp', 
    data: { 
      label: 'Word2Vec', category: 'nlp', 
      inputs: [{'id': 'in', 'label': 'Text', 'type': 'any'}], 
      outputs: [{'id': 'out', 'label': 'Embeddings', 'type': 'tensor'}],
      parameters: {'vector_size': 100},
      explanation: {
        what: "Runs Word2Vec.",
        how: "Processes sequences of text.",
        gives: "Vectors or language models.",
        analogy: "Like reading and translating."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'FastText', category: 'nlp', 
    data: { 
      label: 'FastText', category: 'nlp', 
      inputs: [{'id': 'in', 'label': 'Text', 'type': 'any'}], 
      outputs: [{'id': 'out', 'label': 'Embeddings', 'type': 'tensor'}],
      parameters: {'dim': 300},
      explanation: {
        what: "Runs FastText.",
        how: "Processes sequences of text.",
        gives: "Vectors or language models.",
        analogy: "Like reading and translating."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'LLM Fine-Tuning', category: 'nlp', 
    data: { 
      label: 'LLM Fine-Tuning', category: 'nlp', 
      inputs: [{'id': 'model', 'label': 'Base LLM', 'type': 'model'}, {'id': 'data', 'label': 'Dataset', 'type': 'dataframe'}], 
      outputs: [{'id': 'out', 'label': 'Tuned LLM', 'type': 'model'}],
      parameters: {'method': 'LoRA', 'epochs': 3},
      explanation: {
        what: "Runs LLM Fine-Tuning.",
        how: "Processes sequences of text.",
        gives: "Vectors or language models.",
        analogy: "Like reading and translating."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'VAE', category: 'gen', 
    data: { 
      label: 'VAE', category: 'gen', 
      inputs: [{'id': 'in', 'label': 'Image', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Generated', 'type': 'tensor'}, {'id': 'mu', 'label': 'Latent', 'type': 'tensor'}],
      parameters: {'latent_dim': 128},
      explanation: {
        what: "Runs VAE.",
        how: "Generates new content.",
        gives: "Images or audio.",
        analogy: "Like an artist painting a picture."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'GAN', category: 'gen', 
    data: { 
      label: 'GAN', category: 'gen', 
      inputs: [{'id': 'noise', 'label': 'Noise', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Generated', 'type': 'tensor'}],
      parameters: {'z_dim': 100},
      explanation: {
        what: "Runs GAN.",
        how: "Generates new content.",
        gives: "Images or audio.",
        analogy: "Like an artist painting a picture."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'StyleGAN2', category: 'gen', 
    data: { 
      label: 'StyleGAN2', category: 'gen', 
      inputs: [{'id': 'noise', 'label': 'Noise', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Image', 'type': 'tensor'}],
      parameters: {'resolution': 1024},
      explanation: {
        what: "Runs StyleGAN2.",
        how: "Generates new content.",
        gives: "Images or audio.",
        analogy: "Like an artist painting a picture."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'LCM', category: 'gen', 
    data: { 
      label: 'LCM', category: 'gen', 
      inputs: [{'id': 'prompt', 'label': 'Prompt', 'type': 'any'}], 
      outputs: [{'id': 'out', 'label': 'Image', 'type': 'tensor'}],
      parameters: {'steps': 4},
      explanation: {
        what: "Runs LCM.",
        how: "Generates new content.",
        gives: "Images or audio.",
        analogy: "Like an artist painting a picture."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'ControlNet', category: 'gen', 
    data: { 
      label: 'ControlNet', category: 'gen', 
      inputs: [{'id': 'prompt', 'label': 'Prompt', 'type': 'any'}, {'id': 'cond', 'label': 'Condition', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Image', 'type': 'tensor'}],
      parameters: {'control_type': 'canny'},
      explanation: {
        what: "Runs ControlNet.",
        how: "Generates new content.",
        gives: "Images or audio.",
        analogy: "Like an artist painting a picture."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'WaveNet', category: 'gen', 
    data: { 
      label: 'WaveNet', category: 'gen', 
      inputs: [{'id': 'text', 'label': 'Text', 'type': 'any'}], 
      outputs: [{'id': 'audio', 'label': 'Audio', 'type': 'audio'}],
      parameters: {'voice': 'en-US'},
      explanation: {
        what: "Runs WaveNet.",
        how: "Generates new content.",
        gives: "Images or audio.",
        analogy: "Like an artist painting a picture."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Bayesian Regression', category: 'bayesian', 
    data: { 
      label: 'Bayesian Regression', category: 'bayesian', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'prior': 'normal'},
      explanation: {
        what: "Runs Bayesian Regression.",
        how: "Computes probabilities with uncertainty.",
        gives: "Distributions or models.",
        analogy: "Like guessing with a margin of error."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Gaussian Process', category: 'bayesian', 
    data: { 
      label: 'Gaussian Process', category: 'bayesian', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'kernel': 'RBF'},
      explanation: {
        what: "Runs Gaussian Process.",
        how: "Computes probabilities with uncertainty.",
        gives: "Distributions or models.",
        analogy: "Like guessing with a margin of error."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'MCMC Sampler', category: 'bayesian', 
    data: { 
      label: 'MCMC Sampler', category: 'bayesian', 
      inputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}], 
      outputs: [{'id': 'traces', 'label': 'Traces', 'type': 'tensor'}],
      parameters: {'draws': 1000},
      explanation: {
        what: "Runs MCMC Sampler.",
        how: "Computes probabilities with uncertainty.",
        gives: "Distributions or models.",
        analogy: "Like guessing with a margin of error."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Variational Inference', category: 'bayesian', 
    data: { 
      label: 'Variational Inference', category: 'bayesian', 
      inputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}], 
      outputs: [{'id': 'approx', 'label': 'Approximation', 'type': 'model'}],
      parameters: {'method': 'ADVI'},
      explanation: {
        what: "Runs Variational Inference.",
        how: "Computes probabilities with uncertainty.",
        gives: "Distributions or models.",
        analogy: "Like guessing with a margin of error."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Deep Kernel Learning', category: 'bayesian', 
    data: { 
      label: 'Deep Kernel Learning', category: 'bayesian', 
      inputs: [{'id': 'in', 'label': 'Data', 'type': 'dataframe'}], 
      outputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}],
      parameters: {'base_kernel': 'RBF'},
      explanation: {
        what: "Runs Deep Kernel Learning.",
        how: "Computes probabilities with uncertainty.",
        gives: "Distributions or models.",
        analogy: "Like guessing with a margin of error."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'TorchScript Export', category: 'mlops', 
    data: { 
      label: 'TorchScript Export', category: 'mlops', 
      inputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}], 
      outputs: [],
      parameters: {'path': 'model.pt'},
      explanation: {
        what: "Executes TorchScript Export.",
        how: "Manages models in production.",
        gives: "Exports or metrics.",
        analogy: "Like packing a product for shipping."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'ONNX Export', category: 'mlops', 
    data: { 
      label: 'ONNX Export', category: 'mlops', 
      inputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}], 
      outputs: [],
      parameters: {'path': 'model.onnx'},
      explanation: {
        what: "Executes ONNX Export.",
        how: "Manages models in production.",
        gives: "Exports or metrics.",
        analogy: "Like packing a product for shipping."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'TensorRT Quantize', category: 'mlops', 
    data: { 
      label: 'TensorRT Quantize', category: 'mlops', 
      inputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}], 
      outputs: [{'id': 'q_model', 'label': 'Quantized', 'type': 'model'}],
      parameters: {'precision': 'int8'},
      explanation: {
        what: "Executes TensorRT Quantize.",
        how: "Manages models in production.",
        gives: "Exports or metrics.",
        analogy: "Like packing a product for shipping."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Prune Model', category: 'mlops', 
    data: { 
      label: 'Prune Model', category: 'mlops', 
      inputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}], 
      outputs: [{'id': 'p_model', 'label': 'Pruned', 'type': 'model'}],
      parameters: {'amount': 0.3},
      explanation: {
        what: "Executes Prune Model.",
        how: "Manages models in production.",
        gives: "Exports or metrics.",
        analogy: "Like packing a product for shipping."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Drift Detector', category: 'mlops', 
    data: { 
      label: 'Drift Detector', category: 'mlops', 
      inputs: [{'id': 'ref', 'label': 'Reference', 'type': 'dataframe'}, {'id': 'cur', 'label': 'Current', 'type': 'dataframe'}], 
      outputs: [{'id': 'drift', 'label': 'Drift Info', 'type': 'any'}],
      parameters: {'p_value': 0.05},
      explanation: {
        what: "Executes Drift Detector.",
        how: "Manages models in production.",
        gives: "Exports or metrics.",
        analogy: "Like packing a product for shipping."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Flask API Generator', category: 'mlops', 
    data: { 
      label: 'Flask API Generator', category: 'mlops', 
      inputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}], 
      outputs: [],
      parameters: {'port': 5000},
      explanation: {
        what: "Executes Flask API Generator.",
        how: "Manages models in production.",
        gives: "Exports or metrics.",
        analogy: "Like packing a product for shipping."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'MLflow Logger', category: 'mlops', 
    data: { 
      label: 'MLflow Logger', category: 'mlops', 
      inputs: [{'id': 'model', 'label': 'Model', 'type': 'model'}, {'id': 'metrics', 'label': 'Metrics', 'type': 'any'}], 
      outputs: [],
      parameters: {'experiment_name': 'nodeflow'},
      explanation: {
        what: "Executes MLflow Logger.",
        how: "Manages models in production.",
        gives: "Exports or metrics.",
        analogy: "Like packing a product for shipping."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'GCN', category: 'specialty', 
    data: { 
      label: 'GCN', category: 'specialty', 
      inputs: [{'id': 'nodes', 'label': 'Nodes', 'type': 'tensor'}, {'id': 'edges', 'label': 'Edges', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Embeddings', 'type': 'tensor'}],
      parameters: {'hidden_dim': 64},
      explanation: {
        what: "Runs GCN.",
        how: "Executes domain-specific algorithms.",
        gives: "Domain-specific outputs.",
        analogy: "Like using a specialized tool."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'GraphSAGE', category: 'specialty', 
    data: { 
      label: 'GraphSAGE', category: 'specialty', 
      inputs: [{'id': 'nodes', 'label': 'Nodes', 'type': 'tensor'}, {'id': 'edges', 'label': 'Edges', 'type': 'tensor'}], 
      outputs: [{'id': 'out', 'label': 'Embeddings', 'type': 'tensor'}],
      parameters: {'aggregator': 'mean'},
      explanation: {
        what: "Runs GraphSAGE.",
        how: "Executes domain-specific algorithms.",
        gives: "Domain-specific outputs.",
        analogy: "Like using a specialized tool."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Gym Env', category: 'specialty', 
    data: { 
      label: 'Gym Env', category: 'specialty', 
      inputs: [], 
      outputs: [{'id': 'env', 'label': 'Environment', 'type': 'any'}],
      parameters: {'env_name': 'CartPole-v1'},
      explanation: {
        what: "Runs Gym Env.",
        how: "Executes domain-specific algorithms.",
        gives: "Domain-specific outputs.",
        analogy: "Like using a specialized tool."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'PPO', category: 'specialty', 
    data: { 
      label: 'PPO', category: 'specialty', 
      inputs: [{'id': 'env', 'label': 'Environment', 'type': 'any'}], 
      outputs: [{'id': 'policy', 'label': 'Policy', 'type': 'model'}],
      parameters: {'timesteps': 10000},
      explanation: {
        what: "Runs PPO.",
        how: "Executes domain-specific algorithms.",
        gives: "Domain-specific outputs.",
        analogy: "Like using a specialized tool."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'DQN', category: 'specialty', 
    data: { 
      label: 'DQN', category: 'specialty', 
      inputs: [{'id': 'env', 'label': 'Environment', 'type': 'any'}], 
      outputs: [{'id': 'policy', 'label': 'Policy', 'type': 'model'}],
      parameters: {'timesteps': 10000},
      explanation: {
        what: "Runs DQN.",
        how: "Executes domain-specific algorithms.",
        gives: "Domain-specific outputs.",
        analogy: "Like using a specialized tool."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'STFT', category: 'specialty', 
    data: { 
      label: 'STFT', category: 'specialty', 
      inputs: [{'id': 'audio', 'label': 'Audio', 'type': 'audio'}], 
      outputs: [{'id': 'spec', 'label': 'Spectrogram', 'type': 'tensor'}],
      parameters: {'n_fft': 2048},
      explanation: {
        what: "Runs STFT.",
        how: "Executes domain-specific algorithms.",
        gives: "Domain-specific outputs.",
        analogy: "Like using a specialized tool."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'MelSpectrogram', category: 'specialty', 
    data: { 
      label: 'MelSpectrogram', category: 'specialty', 
      inputs: [{'id': 'audio', 'label': 'Audio', 'type': 'audio'}], 
      outputs: [{'id': 'melspec', 'label': 'MelSpec', 'type': 'tensor'}],
      parameters: {'n_mels': 128},
      explanation: {
        what: "Runs MelSpectrogram.",
        how: "Executes domain-specific algorithms.",
        gives: "Domain-specific outputs.",
        analogy: "Like using a specialized tool."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'Prophet', category: 'specialty', 
    data: { 
      label: 'Prophet', category: 'specialty', 
      inputs: [{'id': 'in', 'label': 'TimeSeries', 'type': 'dataframe'}], 
      outputs: [{'id': 'forecast', 'label': 'Forecast', 'type': 'dataframe'}],
      parameters: {'periods': 30},
      explanation: {
        what: "Runs Prophet.",
        how: "Executes domain-specific algorithms.",
        gives: "Domain-specific outputs.",
        analogy: "Like using a specialized tool."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'ARIMA', category: 'specialty', 
    data: { 
      label: 'ARIMA', category: 'specialty', 
      inputs: [{'id': 'in', 'label': 'TimeSeries', 'type': 'dataframe'}], 
      outputs: [{'id': 'forecast', 'label': 'Forecast', 'type': 'dataframe'}],
      parameters: {'order': '1,1,1'},
      explanation: {
        what: "Runs ARIMA.",
        how: "Executes domain-specific algorithms.",
        gives: "Domain-specific outputs.",
        analogy: "Like using a specialized tool."
      }
    } 
  },
  { 
    type: 'baseNode', label: 'NeRF', category: 'specialty', 
    data: { 
      label: 'NeRF', category: 'specialty', 
      inputs: [{'id': 'images', 'label': 'Images', 'type': 'tensor'}, {'id': 'poses', 'label': 'Poses', 'type': 'tensor'}], 
      outputs: [{'id': 'scene', 'label': 'Scene', 'type': 'model'}],
      parameters: {'iters': 1000},
      explanation: {
        what: "Runs NeRF.",
        how: "Executes domain-specific algorithms.",
        gives: "Domain-specific outputs.",
        analogy: "Like using a specialized tool."
      }
    } 
  },
];









