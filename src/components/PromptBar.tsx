import React, { useState } from 'react';
import { Send, Wand2, Loader2 } from 'lucide-react';

interface PromptBarProps {
  onGenerate: (prompt: string) => void;
  isGenerating: boolean;
}

const PromptBar: React.FC<PromptBarProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onGenerate(prompt);
      setPrompt('');
    }
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4">
      <form 
        onSubmit={handleSubmit}
        className="bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 rounded-full shadow-2xl shadow-indigo-500/10 p-2 flex items-center gap-2 transition-all hover:border-indigo-500/50 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20"
      >
        <div className="pl-4 text-indigo-400">
          <Wand2 size={20} />
        </div>
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
          placeholder="Describe a pipeline to generate (e.g. 'Build me a text classifier')"
          className="flex-1 bg-transparent border-none text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-0 text-sm px-2"
        />
        <button
          type="submit"
          disabled={!prompt.trim() || isGenerating}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-full p-2.5 transition-colors flex items-center justify-center min-w-[40px]"
        >
          {isGenerating ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>
    </div>
  );
};

export default PromptBar;
