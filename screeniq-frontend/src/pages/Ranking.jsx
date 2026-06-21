import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Upload, FileText, Loader2, CheckCircle, ArrowLeft, Trophy, Plus, X } from 'lucide-react'

export default function Ranking() {
  const navigate = useNavigate()
  const [resumeFiles, setResumeFiles] = useState([])
  const [jdFile, setJdFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [error, setError] = useState(null)

  const addResumes = (files) => {
    setResumeFiles(prev => [...prev, ...Array.from(files)])
  }

  const removeResume = (i) => {
    setResumeFiles(prev => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async () => {
    if (resumeFiles.length < 2 || !jdFile) return
    setLoading(true)
    setError(null)
    try {
      const formData = new FormData()
      resumeFiles.forEach(f => formData.append('resumes', f))
      formData.append('job_description', jdFile)
      const res = await fetch('https://agentic-ai-screening-app-1.onrender.com/ranking/', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      setResults(data.ranked_candidates)
    } catch (err) {
      setError('Could not connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  const rankColor = (rank) => {
    if (rank === 1) return '#F59E0B'
    if (rank === 2) return '#94A3B8'
    if (rank === 3) return '#B45309'
    return '#334155'
  }

  return (
    <div style={{ background: '#03060F', minHeight: '100vh', color: 'white' }}>
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }} />

      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(3,6,15,0.85)', backdropFilter: 'blur(12px)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <a href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #2563EB, #4F46E5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Brain size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: 'white' }}>ScreenIQ</span>
        </a>
        <button onClick={() => navigate('/dashboard')} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#475569', background: 'none', border: 'none', cursor: 'pointer' }}>
          <ArrowLeft size={14} /> Dashboard
        </button>
      </nav>

      <div style={{ maxWidth: 760, margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 1 }}>

        {!results ? (
          <>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Candidate Ranking</h1>
              <p style={{ fontSize: 14, color: '#475569' }}>Upload multiple resumes and one job description to get a ranked shortlist.</p>
            </div>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Resumes ({resumeFiles.length} uploaded — min 2)</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {resumeFiles.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderRadius: 14, background: 'rgba(59,130,246,0.07)', border: '1px solid rgba(59,130,246,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <CheckCircle size={16} color="#60A5FA" />
                      <span style={{ fontSize: 13, color: '#60A5FA' }}>{f.name}</span>
                    </div>
                    <button onClick={() => removeResume(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#475569', display: 'flex' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
                <div onClick={() => document.getElementById('resumes-input').click()}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(255,255,255,0.1)', cursor: 'pointer' }}>
                  <Plus size={16} color="#475569" />
                  <span style={{ fontSize: 13, color: '#475569' }}>Add resume PDFs</span>
                  <input id="resumes-input" type="file" accept=".pdf" multiple hidden onChange={e => addResumes(e.target.files)} />
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 24 }}
              onClick={() => document.getElementById('jd-rank-input').click()}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Job Description</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px', borderRadius: 14, background: jdFile ? 'rgba(59,130,246,0.07)' : 'rgba(255,255,255,0.02)', border: jdFile ? '1px solid rgba(59,130,246,0.2)' : '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>
                {jdFile ? <CheckCircle size={18} color="#60A5FA" /> : <FileText size={18} color="#475569" />}
                <span style={{ fontSize: 13, color: jdFile ? '#60A5FA' : '#475569' }}>{jdFile ? jdFile.name : 'Click to upload JD PDF'}</span>
              </div>
              <input id="jd-rank-input" type="file" accept=".pdf" hidden onChange={e => setJdFile(e.target.files[0])} />
            </div>

            {error && <div style={{ fontSize: 13, padding: '12px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#F87171', marginBottom: 16 }}>{error}</div>}

            <button onClick={handleSubmit} disabled={resumeFiles.length < 2 || !jdFile || loading}
              style={{ width: '100%', padding: '14px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #2563EB, #4F46E5)', color: 'white', fontWeight: 600, fontSize: 14, cursor: resumeFiles.length < 2 || !jdFile || loading ? 'not-allowed' : 'pointer', opacity: resumeFiles.length < 2 || !jdFile ? 0.4 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <><Loader2 size={16} className="animate-spin" /> Ranking candidates...</> : <><Trophy size={16} /> Rank Candidates</>}
            </button>
            {loading && <p style={{ textAlign: 'center', fontSize: 12, color: '#334155', marginTop: 10 }}>Processing {resumeFiles.length} resumes · This may take a minute</p>}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Ranked Shortlist</h1>
                <p style={{ fontSize: 14, color: '#475569' }}>{results.length} candidates evaluated</p>
              </div>
              <button onClick={() => { setResults(null); setResumeFiles([]); setJdFile(null) }}
                style={{ fontSize: 13, padding: '8px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', cursor: 'pointer' }}>
                New Ranking
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.map((c, i) => (
                <div key={i} style={{ padding: '20px 24px', borderRadius: 16, background: 'rgba(255,255,255,0.02)', border: c.rank === 1 ? '1px solid rgba(245,158,11,0.3)' : '1px solid rgba(255,255,255,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14, color: rankColor(c.rank), border: `1px solid ${rankColor(c.rank)}33` }}>
                        #{c.rank}
                      </div>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: 15 }}>{c.name}</p>
                        <p style={{ fontSize: 12, color: '#475569' }}>{c.experience} yrs experience</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(90deg, #60A5FA, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{c.score}%</span>
                      <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: c.verdict === 'Selected' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: c.verdict === 'Selected' ? '#4ADE80' : '#F87171', border: c.verdict === 'Selected' ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)' }}>
                        {c.verdict}
                      </span>
                    </div>
                  </div>
                  <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.6, marginBottom: c.matched_skills.length ? 12 : 0 }}>{c.reasoning}</p>
                  {c.matched_skills.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {c.matched_skills.slice(0, 6).map((s, j) => (
                        <span key={j} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)', color: '#4ADE80' }}>{s}</span>
                      ))}
                      {c.matched_skills.length > 6 && <span style={{ fontSize: 11, color: '#334155' }}>+{c.matched_skills.length - 6} more</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}