import { useLocation, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Brain, CheckCircle, XCircle, Download, ArrowLeft, Mic, ArrowRight } from 'lucide-react'

function parseAgentField(value) {
  if (!value) return {}
  if (typeof value === 'object' && value.error && value.raw_payload) {
    try {
      return JSON.parse(value.raw_payload.replace(/```json\n?|```/g, '').trim())
    } catch { return {} }
  }
  if (typeof value === 'string') {
    try {
      return JSON.parse(value.replace(/```json\n?|```/g, '').trim())
    } catch { return {} }
  }
  return value
}

export default function Results() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const result = state?.result

  const resume = parseAgentField(result?.resume)
  const jd = parseAgentField(result?.jd)
  const evaluation = result?.evaluation || {}

  useEffect(() => {
    if (result) {
      const history = JSON.parse(localStorage.getItem('screeniq_history') || '[]')
      const entry = {
        name: resume.name || 'Unknown',
        role: jd.job_title || 'Unknown Role',
        verdict: evaluation.candidate_status,
        score: evaluation.match_score,
        time: new Date().toLocaleString(),
      }
      history.unshift(entry)
      localStorage.setItem('screeniq_history', JSON.stringify(history.slice(0, 20)))
    }
  }, [])

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: '#03060F' }}>
        <div className="text-center">
          <p className="mb-4" style={{ color: '#475569' }}>No results found. Please run a screening first.</p>
          <button onClick={() => navigate('/dashboard')}
            className="text-sm font-semibold px-6 py-2.5 rounded-xl text-white"
            style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const status = evaluation.candidate_status
  const selected = status === 'Selected'

  const handleDownload = () => {
    if (!result.pdf_base64) return
    const bytes = atob(result.pdf_base64)
    const arr = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
    const blob = new Blob([arr], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ScreenIQ_Report.pdf'
    a.click()
  }

  return (
    <div className="min-h-screen text-white" style={{ background: '#03060F' }}>

      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />
      <div className="fixed inset-0 pointer-events-none" style={{
        background: selected
          ? 'radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.06) 0%, transparent 50%)'
          : 'radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.06) 0%, transparent 50%)'
      }} />

      <nav className="relative z-50 flex items-center justify-between px-8 py-4 sticky top-0 backdrop-blur-xl"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(3,6,15,0.8)' }}>
        <a href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
            <Brain size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">ScreenIQ</span>
        </a>
        <button onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 text-xs font-medium transition-colors"
          style={{ color: '#475569' }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
          <ArrowLeft size={14} /> New Screening
        </button>
      </nav>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-14 space-y-4">

        <div className="rounded-2xl px-7 py-5 flex items-center gap-4"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-black shrink-0"
            style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
            {(resume.name || 'U')[0].toUpperCase()}
          </div>
          <div>
            <p className="text-base font-bold">{resume.name || 'Unknown Candidate'}</p>
            <p className="text-xs" style={{ color: '#475569' }}>{jd.job_title || 'Unknown Role'}</p>
          </div>
        </div>

        <div className="rounded-2xl p-7 flex items-center justify-between"
          style={{
            background: selected ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
            border: selected ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)',
          }}>
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: selected ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)' }}>
              {selected
                ? <CheckCircle size={28} style={{ color: '#4ADE80' }} />
                : <XCircle size={28} style={{ color: '#F87171' }} />
              }
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] mb-1" style={{ color: '#475569' }}>Verdict</p>
              <p className="text-3xl font-black" style={{ color: selected ? '#4ADE80' : '#F87171' }}>{status}</p>
            </div>
          </div>
          <button onClick={handleDownload}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl transition"
            style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94A3B8' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}>
            <Download size={14} /> Download Report
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#334155' }}>Match Score</p>
            <div className="flex items-end gap-2">
              <p className="text-6xl font-black" style={{
                background: 'linear-gradient(90deg, #60A5FA, #818CF8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                {evaluation.match_score ?? 0}
              </p>
              <p className="text-2xl font-bold mb-2" style={{ color: '#334155' }}>%</p>
            </div>
          </div>
          <div className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#334155' }}>Experience</p>
            <div className="flex items-end gap-2">
              <p className="text-6xl font-black" style={{
                background: 'linear-gradient(90deg, #60A5FA, #818CF8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>
                {resume.work_experience ?? 0}
              </p>
              <p className="text-2xl font-bold mb-2" style={{ color: '#334155' }}>yrs</p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-6"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-xs font-bold uppercase tracking-[0.2em] mb-3" style={{ color: '#334155' }}>Reasoning</p>
          <p className="text-sm leading-7" style={{ color: '#94A3B8' }}>
            {evaluation.reasoning ?? 'No reasoning provided.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#334155' }}>Matched Skills</p>
            <div className="flex flex-wrap gap-2">
              {evaluation.gap_analysis?.matched_skills?.length > 0
                ? evaluation.gap_analysis.matched_skills.map((s, i) => (
                    <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)', color: '#4ADE80' }}>
                      {s}
                    </span>
                  ))
                : <p className="text-xs" style={{ color: '#334155' }}>None identified</p>
              }
            </div>
          </div>
          <div className="rounded-2xl p-6"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p className="text-xs font-bold uppercase tracking-[0.2em] mb-4" style={{ color: '#334155' }}>Hard Gaps</p>
            <div className="flex flex-wrap gap-2">
              {evaluation.gap_analysis?.hard_gaps?.length > 0
                ? evaluation.gap_analysis.hard_gaps.map((s, i) => (
                    <span key={i} className="text-xs font-medium px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#F87171' }}>
                      {s}
                    </span>
                  ))
                : <p className="text-xs" style={{ color: '#334155' }}>None identified</p>
              }
            </div>
          </div>
        </div>

        {selected && (
          <button onClick={() => navigate('/interview')}
            className="w-full flex items-center justify-center gap-2 text-white font-semibold py-4 rounded-2xl transition text-sm hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)', boxShadow: '0 8px 32px rgba(59,130,246,0.3)' }}>
            <Mic size={16} /> Proceed to AI Interview <ArrowRight size={16} />
          </button>
        )}

      </div>
    </div>
  )
}