import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { MessageSquare } from 'lucide-react';

const ChatNode = ({ data, selected }: { data: any, selected: boolean }) => {
  const [input, setInput] = React.useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    data.onSendMessage?.(input);
    setInput('');
  };

  return (
    <div className={`chat-node ${selected ? 'selected' : ''}`} style={{
      width: '240px',
      background: 'var(--bg2)',
      border: selected ? '1px solid var(--accent)' : '1px solid var(--border)',
      borderRadius: 'var(--r)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div className="node-header chat" style={{ padding: '8px 12px', background: 'var(--bg3)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <MessageSquare size={14} color="var(--accent)" />
        <div className="node-title" style={{ fontSize: '12px', fontWeight: 600 }}>Chat Preview</div>
      </div>
      
      <div className="chat-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '180px' }}>
        <div className="chat-messages" style={{ flex: 1, overflowY: 'auto', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.chatHistory?.length === 0 && (
            <div className="chat-placeholder" style={{ color: 'var(--text3)', fontSize: '10px', textAlign: 'center', marginTop: '20px' }}>No messages yet...</div>
          )}
          {data.chatHistory?.map((msg: any, i: number) => (
            <div key={i} className={`chat-msg ${msg.role}`} style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              background: msg.role === 'user' ? 'var(--accent)' : 'var(--bg4)',
              color: 'white',
              padding: '6px 10px',
              borderRadius: '10px',
              fontSize: '10px',
              maxWidth: '85%',
              wordBreak: 'break-word'
            }}>
              {msg.content}
            </div>
          ))}
        </div>
        <div className="chat-input-area" style={{ padding: '8px', borderTop: '1px solid var(--border)', display: 'flex', gap: '6px' }}>
          <input 
            type="text" 
            placeholder="Type to chat..." 
            className="chat-mini-input" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            style={{ flex: 1, background: 'var(--bg3)', border: '1px solid var(--border)', borderRadius: '4px', padding: '4px 8px', fontSize: '10px', color: 'white', outline: 'none' }}
          />
          <button 
            onClick={handleSend}
            style={{ background: 'var(--accent)', border: 'none', borderRadius: '4px', padding: '4px 8px', color: 'white', fontSize: '10px', cursor: 'pointer' }}
          >
            Send
          </button>
        </div>
      </div>

      <Handle type="target" position={Position.Left} id="response" className="port text" />
    </div>
  );
};

export default memo(ChatNode);
