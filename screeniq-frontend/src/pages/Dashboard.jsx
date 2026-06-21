import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Upload, FileText, Loader2, CheckCircle, ArrowRight, LayoutDashboard, Clock, Settings, Plus, Trophy } from 'lucide-react'

export default function Dashboard() {
  const navigate = useNavigate()
  const [resumeFile, setResumeFile] = useState(null)
  const [jdFile, setJdFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('new')
  const [recentScreenings] = useState(() => {
    return JSON.parse(localStorage.getItem('screeniq_history') || '[]')
  })

  const handleSubmit = async () => {
    if (!resumeFile || !jdFile) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('resume', resumeFile)
      formData.append('job_description', jdFile)
      formData.append('role_name', jdFile.name.replace('.pdf', ''))
      const response = await fetch('https://agentic-ai-screening-app-1.onrender.com/screening/', {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      navigate('/results', { state: { result: data } })
    } catch (err) {
      setError('Could not connect to the backend. Make sure your FastAPI server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen text-white flex" style={{ background: '#03060F' }}>

      {/* Sidebar */}
      <aside className="w-60 shrink-0 flex flex-col sticky top-0 h-screen"
        style={{ borderRight: '1px solid rgba(255,255,255,0.06)', background: '#03060F' }}>
        <div className="flex items-center gap-2.5 px-5 py-5"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
            <Brain size={14} className="text-white" />
          </div>
          <span className="font-bold tracking-tight">ScreenIQ</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {[
            { icon: <LayoutDashboard size={16} />, label: 'Dashboard', id: 'new' },
            { icon: <Clock size={16} />, label: 'History', id: 'history' },
            { icon: <Settings size={16} />, label: 'Settings', id: 'settings' },
            { icon: <Trophy size={16} />, label: 'Rank Candidates', id: 'ranking' },
          ].map(item => (
            <button key={item.id} onClick={() => {
              if (item.id === 'ranking') { navigate('/ranking'); return }
                setActiveTab(item.id)
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                background: activeTab === item.id ? 'rgba(59,130,246,0.1)' : 'transparent',
                color: activeTab === item.id ? '#60A5FA' : '#475569',
                border: activeTab === item.id ? '1px solid rgba(59,130,246,0.15)' : '1px solid transparent',
              }}>
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
              R
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">Recruiter</p>
              <p className="text-xs truncate" style={{ color: '#334155' }}>Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-8 py-4 sticky top-0 z-10 backdrop-blur-xl"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(3,6,15,0.85)' }}>
          <div>
            <h1 className="text-base font-bold">
              {activeTab === 'new' ? 'New Screening' : activeTab === 'history' ? 'Screening History' : 'Settings'}
            </h1>
            <p className="text-xs" style={{ color: '#334155' }}>
              {activeTab === 'new' ? 'Evaluate a new candidate' : activeTab === 'history' ? 'View past screenings' : 'Manage your account'}
            </p>
          </div>
          <button onClick={() => setActiveTab('new')}
            className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl text-white transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
            <Plus size={14} /> New Screening
          </button>
        </div>

        <div className="px-8 py-8">

          {activeTab === 'new' && (
            <div className="max-w-xl">
              <div className="space-y-3 mb-6">
                <div onClick={() => document.getElementById('resume-input').click()}
                  className="cursor-pointer rounded-2xl p-6 transition-all duration-200"
                  style={{
                    background: resumeFile ? 'rgba(59,130,246,0.07)' : 'rgba(255,255,255,0.02)',
                    border: resumeFile ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  }}
                  onMouseEnter={e => { if (!resumeFile) e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)' }}
                  onMouseLeave={e => { if (!resumeFile) e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: resumeFile ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                        border: resumeFile ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(255,255,255,0.08)',
                      }}>
                      {resumeFile ? <CheckCircle size={20} style={{ color: '#60A5FA' }} /> : <Upload size={20} style={{ color: '#475569' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm mb-0.5">Candidate Resume</p>
                      <p className="text-xs truncate" style={{ color: resumeFile ? '#60A5FA' : '#475569' }}>
                        {resumeFile ? resumeFile.name : 'Click to upload PDF'}
                      </p>
                    </div>
                    {resumeFile && (
                      <span className="text-xs px-2.5 py-1 rounded-full shrink-0"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.2)' }}>
                        Ready
                      </span>
                    )}
                  </div>
                  <input id="resume-input" type="file" accept=".pdf" className="hidden"
                    onChange={e => setResumeFile(e.target.files[0])} />
                </div>

                <div onClick={() => document.getElementById('jd-input').click()}
                  className="cursor-pointer rounded-2xl p-6 transition-all duration-200"
                  style={{
                    background: jdFile ? 'rgba(59,130,246,0.07)' : 'rgba(255,255,255,0.02)',
                    border: jdFile ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  }}
                  onMouseEnter={e => { if (!jdFile) e.currentTarget.style.border = '1px solid rgba(255,255,255,0.15)' }}
                  onMouseLeave={e => { if (!jdFile) e.currentTarget.style.border = '1px solid rgba(255,255,255,0.07)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                      style={{
                        background: jdFile ? 'rgba(59,130,246,0.15)' : 'rgba(255,255,255,0.04)',
                        border: jdFile ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(255,255,255,0.08)',
                      }}>
                      {jdFile ? <CheckCircle size={20} style={{ color: '#60A5FA' }} /> : <FileText size={20} style={{ color: '#475569' }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm mb-0.5">Job Description</p>
                      <p className="text-xs truncate" style={{ color: jdFile ? '#60A5FA' : '#475569' }}>
                        {jdFile ? jdFile.name : 'Click to upload PDF'}
                      </p>
                    </div>
                    {jdFile && (
                      <span className="text-xs px-2.5 py-1 rounded-full shrink-0"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#4ADE80', border: '1px solid rgba(34,197,94,0.2)' }}>
                        Ready
                      </span>
                    )}
                  </div>
                  <input id="jd-input" type="file" accept=".pdf" className="hidden"
                    onChange={e => setJdFile(e.target.files[0])} />
                </div>
              </div>

              {error && (
                <div className="text-xs px-4 py-3 rounded-xl mb-4"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#F87171' }}>
                  {error}
                </div>
              )}

              <button onClick={handleSubmit} disabled={!resumeFile || !jdFile || loading}
                className="w-full flex items-center justify-center gap-2 text-white font-semibold py-3.5 rounded-2xl transition text-sm disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)', boxShadow: (!resumeFile || !jdFile) ? 'none' : '0 8px 32px rgba(59,130,246,0.25)' }}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <>Analyze Candidate Fit <ArrowRight size={16} /></>}
              </button>

              {loading && <p className="text-center text-xs mt-3" style={{ color: '#334155' }}>AI agents working · Usually 20–30 seconds</p>}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-3xl">
              {recentScreenings.length === 0 ? (
                <div className="rounded-2xl p-12 text-center"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Clock size={32} className="mx-auto mb-3" style={{ color: '#1E293B' }} />
                  <p className="text-sm font-semibold mb-1">No screenings yet</p>
                  <p className="text-xs" style={{ color: '#334155' }}>Your completed screenings will appear here.</p>
                </div>
              ) : (
                <div className="rounded-2xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="grid grid-cols-4 px-5 py-3 text-xs font-bold uppercase tracking-widest"
                    style={{ background: 'rgba(255,255,255,0.02)', color: '#334155', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <span>Candidate</span>
                    <span>Role</span>
                    <span>Score</span>
                    <span>Verdict</span>
                  </div>
                  {recentScreenings.map((s, i) => (
                    <div key={i} className="grid grid-cols-4 px-5 py-4 items-center transition-colors"
                      style={{ borderBottom: i < recentScreenings.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <div>
                        <p className="text-sm font-semibold">{s.name}</p>
                        <p className="text-xs" style={{ color: '#334155' }}>{s.time}</p>
                      </div>
                      <p className="text-sm" style={{ color: '#475569' }}>{s.role}</p>
                      <p className="text-sm font-bold" style={{
                        background: 'linear-gradient(90deg, #60A5FA, #818CF8)',
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                      }}>{s.score}%</p>
                      <span className="inline-flex text-xs font-semibold px-2.5 py-1 rounded-full w-fit"
                        style={{
                          background: s.verdict === 'Selected' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                          color: s.verdict === 'Selected' ? '#4ADE80' : '#F87171',
                          border: s.verdict === 'Selected' ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)',
                        }}>
                        {s.verdict}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="max-w-xl">
              <div className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-sm font-semibold mb-1">Account</p>
                <p className="text-xs mb-4" style={{ color: '#475569' }}>Manage your ScreenIQ account settings.</p>
                <div className="space-y-3">
                  {[
                    { label: 'Email', value: 'recruiter@company.com' },
                    { label: 'Plan', value: 'Free — 10 screenings/mo' },
                    { label: 'API Key', value: 'sk-••••••••••••••••' },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center justify-between py-3"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span className="text-xs" style={{ color: '#475569' }}>{f.label}</span>
                      <span className="text-xs font-medium">{f.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}