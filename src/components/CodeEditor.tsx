import React, { useRef, useCallback } from 'react';

interface CodeEditorProps {
  value: string;
  onChange: (val: string) => void;
  language?: string;
  placeholder?: string;
}

// Very lightweight monokai-style keyword highlighting using regex + span injection
const KEYWORDS = ['def', 'return', 'import', 'from', 'if', 'else', 'elif', 'for', 'while', 'in', 'not', 'and', 'or', 'class', 'try', 'except', 'with', 'as', 'None', 'True', 'False', 'pass', 'break', 'continue', 'lambda', 'yield'];
const BUILTINS = ['print', 'len', 'range', 'int', 'float', 'str', 'list', 'dict', 'tuple', 'set', 'type', 'isinstance', 'enumerate', 'zip', 'map', 'filter', 'sorted', 'reversed', 'min', 'max', 'sum', 'abs', 'round', 'input', 'open'];

function highlightPython(code: string): string {
  // Escape HTML first
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Strings (single & double quoted)
  html = html.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, m => `<span style="color:#e6db74">${m}</span>`);
  // Comments
  html = html.replace(/(#[^\n]*)/g, m => `<span style="color:#75715e;font-style:italic">${m}</span>`);
  // Numbers
  html = html.replace(/\b(\d+\.?\d*)\b/g, m => `<span style="color:#ae81ff">${m}</span>`);
  // Keywords
  KEYWORDS.forEach(kw => {
    html = html.replace(new RegExp(`\\b(${kw})\\b`, 'g'), `<span style="color:#f92672;font-weight:600">$1</span>`);
  });
  // Builtins
  BUILTINS.forEach(b => {
    html = html.replace(new RegExp(`\\b(${b})\\b`, 'g'), `<span style="color:#66d9ef">$1</span>`);
  });
  // Function definitions
  html = html.replace(/(<span[^>]*>def<\/span>\s+)(\w+)/g, (_, kw, name) => `${kw}<span style="color:#a6e22e;font-weight:600">${name}</span>`);

  return html;
}

const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'python',
  placeholder = 'def main(input_data):\n    return input_data',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const lines = value.split('\n');

  // Synchronise scroll between overlay and textarea
  const syncScroll = useCallback(() => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
      overlayRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = textareaRef.current!;
    const { selectionStart, selectionEnd } = ta;
    const text = ta.value;

    // Tab → 4 spaces
    if (e.key === 'Tab') {
      e.preventDefault();
      const newVal = text.substring(0, selectionStart) + '    ' + text.substring(selectionEnd);
      onChange(newVal);
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = selectionStart + 4;
      });
    }
    // Enter → auto-indent
    else if (e.key === 'Enter') {
      const lineStart = text.lastIndexOf('\n', selectionStart - 1) + 1;
      const currentLine = text.substring(lineStart, selectionStart);
      const indent = currentLine.match(/^(\s+)/)?.[1] || '';
      const extraIndent = currentLine.trimEnd().endsWith(':') ? '    ' : '';
      e.preventDefault();
      const newVal = text.substring(0, selectionStart) + '\n' + indent + extraIndent + text.substring(selectionEnd);
      onChange(newVal);
      requestAnimationFrame(() => {
        const pos = selectionStart + 1 + indent.length + extraIndent.length;
        ta.selectionStart = ta.selectionEnd = pos;
      });
    }
  };

  const highlighted = language === 'python' ? highlightPython(value || placeholder) : (value || placeholder);

  return (
    <div style={{
      position: 'relative',
      border: '1px solid var(--accent)',
      borderRadius: '8px',
      overflow: 'hidden',
      background: '#1a1b26',
      boxShadow: '0 0 0 1px rgba(108,99,255,0.2), 0 4px 20px rgba(0,0,0,0.4)',
      fontFamily: 'var(--font-mono)',
      fontSize: '11px',
    }}>
      {/* Header bar */}
      <div style={{
        background: '#11121d',
        padding: '6px 12px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: '8px',
        fontSize: '10px', color: 'var(--text3)',
      }}>
        <span style={{ color: '#f92672', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase', fontWeight: 700 }}>
          {language}
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#febc2e' }} />
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#28c840' }} />
        </div>
      </div>

      {/* Editor body */}
      <div style={{ display: 'flex', maxHeight: '280px', overflow: 'hidden', position: 'relative' }}>
        {/* Line numbers gutter */}
        <div style={{
          background: '#11121d',
          padding: '10px 4px 10px 8px',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          userSelect: 'none',
          minWidth: '36px',
          textAlign: 'right',
          color: '#3b3d57',
          lineHeight: '1.6',
          fontSize: '10px',
          overflowY: 'hidden',
          flexShrink: 0,
        }}>
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Highlighted overlay (read-only visual layer) */}
        <div
          ref={overlayRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0, left: '36px', right: 0, bottom: 0,
            padding: '10px 10px 10px 10px',
            lineHeight: '1.6',
            whiteSpace: 'pre',
            overflowX: 'hidden',
            overflowY: 'hidden',
            pointerEvents: 'none',
            color: '#f8f8f2',
          }}
          dangerouslySetInnerHTML={{ __html: highlighted + '\n' }}
        />

        {/* Actual editable textarea (transparent on top) */}
        <textarea
          ref={textareaRef}
          value={value}
          placeholder={placeholder}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          style={{
            position: 'relative',
            flex: 1,
            background: 'transparent',
            color: 'transparent',
            caretColor: '#f8f8f2',
            border: 'none',
            outline: 'none',
            resize: 'none',
            padding: '10px 10px',
            lineHeight: '1.6',
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            whiteSpace: 'pre',
            overflowX: 'auto',
            overflowY: 'auto',
            minHeight: '160px',
            zIndex: 1,
            overflowWrap: 'normal',
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;
