import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Send, Loader2, ArrowLeft } from 'lucide-react'

export default function Interview() {
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { startInterview() }, [])
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const startInterview = async () => {
    setLoading(true)
    try {
      const res = await fetch('https://agentic-ai-screening-app-1.onrender.com/interview/start', { method: 'POST' })
      const data = await res.json()
      setMessages([{ role: 'ai', content: data.question }])
    } catch {
      setMessages([{ role: 'ai', content: 'Welcome! Tell me about yourself and your relevant experience for this role.' }])
    } finally {
      setLoading(false)
    }
  }

  const sendAnswer = async () => {
    if (!input.trim() || loading) return
    const answer = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: answer }])
    setLoading(true)
    try {
      const res = await fetch('https://agentic-ai-screening-app-1.onrender.com/interview/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer })
      })
      const data = await res.json()
      if (data.done) {
        setMessages(prev => [...prev, { role: 'ai', content: 'Thank you for completing the interview! Your results are being processed.' }])
        setDone(true)
      } else {
        setMessages(prev => [...prev, { role: 'ai', content: data.next_question }])
      }
    } catch {
      setMessages(prev => [...prev, { role: 'ai', content: 'Something went wrong. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendAnswer()
    }
  }

  return (
    <div style={{ background: '#03060F', minHeight: '100vh', display: 'flex', flexDirection: 'column', color: 'white' }}>

      {/* Dot grid */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      {/* Navbar */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(3,6,15,0.85)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Brain size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: 'white' }}>ScreenIQ</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ADE80', animation: 'pulse 2s infinite' }} />
          <span style={{ fontSize: 12, color: '#64748B' }}>Interview in progress</span>
        </div>
      </nav>

      {/* Chat */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px', maxWidth: 760, width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', alignItems: 'flex-start', gap: 12 }}>
            {msg.role === 'ai' && (
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Brain size={16} color="white" />
              </div>
            )}
            <div style={{
              maxWidth: '72%',
              padding: '14px 18px',
              borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: msg.role === 'user'
                ? 'linear-gradient(135deg, #2563EB, #4F46E5)'
                : 'rgba(255,255,255,0.05)',
              border: msg.role === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
              color: 'white',
              fontSize: 14,
              lineHeight: 1.7,
              boxShadow: msg.role === 'user' ? '0 4px 20px rgba(37,99,235,0.3)' : 'none',
            }}>
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Brain size={16} color="white" />
            </div>
            <div style={{
              padding: '14px 18px', borderRadius: '18px 18px 18px 4px',
              background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
              display: 'flex', gap: 6, alignItems: 'center',
            }}>
              {[0, 1, 2].map(j => (
                <div key={j} style={{
                  width: 7, height: 7, borderRadius: '50%', background: '#3B82F6',
                  animation: `bounce 1.2s ease-in-out ${j * 0.2}s infinite`,
                }} />
              ))}
            </div>
          </div>
        )}

        {done && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <button onClick={() => navigate('/')}
              style={{
                background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
                color: 'white', fontWeight: 600, fontSize: 14,
                padding: '12px 32px', borderRadius: 14, border: 'none', cursor: 'pointer',
                boxShadow: '0 8px 32px rgba(59,130,246,0.3)',
              }}>
              Back to Home
            </button>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {!done && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '16px 24px',
          background: 'rgba(3,6,15,0.9)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', gap: 12, alignItems: 'flex-end' }}>
            <textarea
              rows={2}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your answer and press Enter to send..."
              style={{
                flex: 1,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 16,
                padding: '14px 18px',
                fontSize: 14,
                color: 'white',
                resize: 'none',
                outline: 'none',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.6,
              }}
              onFocus={e => e.target.style.border = '1px solid rgba(59,130,246,0.5)'}
              onBlur={e => e.target.style.border = '1px solid rgba(255,255,255,0.1)'}
            />
            <button
              onClick={sendAnswer}
              disabled={!input.trim() || loading}
              style={{
                width: 48, height: 48, borderRadius: 14, border: 'none',
                background: !input.trim() || loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #2563EB, #4F46E5)',
                color: 'white', cursor: !input.trim() || loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                boxShadow: !input.trim() || loading ? 'none' : '0 4px 20px rgba(37,99,235,0.3)',
                transition: 'all 0.2s',
              }}>
              <Send size={18} />
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#1E293B', marginTop: 8 }}>
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      )}

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}