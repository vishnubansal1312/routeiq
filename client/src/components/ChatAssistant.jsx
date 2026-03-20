import { useState, useRef, useEffect } from 'react'
import api from '../utils/api'

const QUICK = [
  "What's the best time to travel?",
  "How much will this trip cost?",
  "Which route do you recommend?",
  "Is it safe to drive today?",
]

function Msg({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{ display:'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', marginBottom:10 }}>
      {!isUser && (
        <div style={{ width:28, height:28, background:'#0ea5e9', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:10, fontWeight:900, marginRight:8, flexShrink:0, marginTop:2 }}>
          AI
        </div>
      )}
      <div style={{
        maxWidth:'85%', padding:'10px 12px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        background: isUser ? '#0ea5e9' : '#1e293b',
        color: isUser ? 'white' : '#e2e8f0',
        fontSize:12, lineHeight:1.6, whiteSpace:'pre-wrap',
        border: isUser ? 'none' : '1px solid #334155',
      }}>
        {msg.content}
      </div>
    </div>
  )
}

export default function ChatAssistant({ routeContext }) {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi! I am your RouteIQ AI Assistant.\n\nAsk me anything about your route — costs, weather, traffic, best time to travel, and more!",
  }])
  const [input,   setInput]   = useState('')
  const [loading, setLoading] = useState(false)
  const [unread,  setUnread]  = useState(0)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  const send = async (text) => {
    const t = (text || input).trim()
    if (!t) return
    setMessages(m => [...m, { role: 'user', content: t }])
    setInput('')
    setLoading(true)
    try {
      const res = await api.post('/api/assistant', { message: t, context: routeContext })
      setMessages(m => [...m, { role: 'assistant', content: res.data.reply }])
      if (!open) setUnread(n => n + 1)
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, something went wrong. Try again.' }])
    }
    setLoading(false)
  }

  const onKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
  }

  const btnStyle = {
    position:'fixed', bottom:24, right:24, width:56, height:56,
    borderRadius:'50%', border:'none', cursor:'pointer', zIndex:99999,
    background: open ? '#1e293b' : '#0ea5e9',
    boxShadow:'0 8px 32px rgba(14,165,233,0.4)',
    fontSize:24, display:'flex', alignItems:'center', justifyContent:'center',
    transition:'all 0.2s',
  }

  return (
    <div>
      {open && (
        <div style={{
          position:'fixed', bottom:88, right:24, width:300, height:460,
          background:'#0f172a', border:'1px solid #334155', borderRadius:20,
          display:'flex', flexDirection:'column', overflow:'hidden',
          zIndex:99999, boxShadow:'0 25px 60px rgba(0,0,0,0.6)',
        }}>

          {/* Header */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px', background:'#1e293b', borderBottom:'1px solid #334155' }}>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <div style={{ width:32, height:32, background:'#0ea5e9', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:11, fontWeight:900 }}>
                AI
              </div>
              <div>
                <div style={{ color:'white', fontSize:13, fontWeight:700 }}>RouteIQ Assistant</div>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <span style={{ width:6, height:6, background:'#22c55e', borderRadius:'50%', display:'inline-block' }} />
                  <span style={{ color:'#64748b', fontSize:11 }}>Always online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{ background:'none', border:'none', color:'#64748b', fontSize:16, cursor:'pointer', padding:'4px 8px', borderRadius:8 }}
            >
              X
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:12 }}>
            {messages.map((msg, i) => <Msg key={i} msg={msg} />)}
            {loading && (
              <div style={{ display:'flex', gap:8, alignItems:'center', marginBottom:10 }}>
                <div style={{ width:28, height:28, background:'#0ea5e9', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:10, fontWeight:900 }}>
                  AI
                </div>
                <div style={{ background:'#1e293b', border:'1px solid #334155', padding:'10px 14px', borderRadius:'16px 16px 16px 4px', display:'flex', gap:4 }}>
                  <span style={{ width:6, height:6, background:'#0ea5e9', borderRadius:'50%', animation:'bounce 1s infinite 0ms' }} />
                  <span style={{ width:6, height:6, background:'#0ea5e9', borderRadius:'50%', animation:'bounce 1s infinite 150ms' }} />
                  <span style={{ width:6, height:6, background:'#0ea5e9', borderRadius:'50%', animation:'bounce 1s infinite 300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          {messages.length <= 2 && (
            <div style={{ padding:'0 12px 8px' }}>
              <div style={{ color:'#475569', fontSize:11, marginBottom:6 }}>Quick questions:</div>
              {QUICK.map((q, i) => (
                <button
                  key={i}
                  onClick={() => send(q)}
                  style={{
                    display:'block', width:'100%', textAlign:'left',
                    padding:'6px 10px', marginBottom:4,
                    background:'rgba(14,165,233,0.1)',
                    border:'1px solid rgba(14,165,233,0.2)',
                    borderRadius:8, color:'#38bdf8', fontSize:11, cursor:'pointer',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:'10px 12px', borderTop:'1px solid #334155', display:'flex', gap:8 }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask about your route..."
              style={{
                flex:1, background:'#1e293b', border:'1px solid #334155',
                borderRadius:10, padding:'8px 12px', color:'#f1f5f9',
                fontSize:12, outline:'none',
              }}
            />
            <button
              onClick={() => send()}
              disabled={loading || !input.trim()}
              style={{
                width:34, height:34,
                background: (loading || !input.trim()) ? '#334155' : '#0ea5e9',
                border:'none', borderRadius:10, color:'white',
                fontSize:16, cursor:'pointer',
                display:'flex', alignItems:'center', justifyContent:'center',
                flexShrink:0,
              }}
            >
              ^
            </button>
          </div>
        </div>
      )}

      {/* Floating button */}
      <button onClick={() => setOpen(o => !o)} style={btnStyle}>
        {open ? (
          <span style={{ color:'#94a3b8', fontSize:18 }}>X</span>
        ) : (
          <span style={{ fontSize:24 }}>&#129302;</span>
        )}
        {unread > 0 && !open && (
          <span style={{
            position:'absolute', top:-4, right:-4, width:18, height:18,
            background:'#ef4444', borderRadius:'50%', color:'white',
            fontSize:10, fontWeight:700,
            display:'flex', alignItems:'center', justifyContent:'center',
          }}>
            {unread}
          </span>
        )}
      </button>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  )
}