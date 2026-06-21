import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Brain, Upload, FileText, Loader2, CheckCircle, ArrowLeft, Trophy, Plus, X, AlertTriangle, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'

function ScoreBar({ label, value }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#475569' }}>{label}</span>
        <span style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8' }}>{value}%</span>
      </div>
      <div style={{ height: 4, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 4, width: `${value}%`, background: 'linear-gradient(90deg, #2563EB, #4F46E5)', transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

function CandidateCard({ c, index }) {
  const [expanded, setExpanded] = useState(index === 0)

  const confidenceColor = {
    High: { bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.2)', text: '#4ADE80' },
    Medium: { bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.2)', text: '#FBB042' },
    Low: { bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.2)', text: '#F87171' },
  }[c.hire_confidence] || { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)', text: '#94A3B8' }

  const rankColor = c.rank === 1 ? '#F59E0B' : c.rank === 2 ? '#94A3B8' : c.rank === 3 ? '#B45309' : '#334155'

  return (
    <div style={{ borderRadius: 18, background: 'rgba(255,255,255,0.02)', border: c.rank === 1 ? '1px solid rgba(245,158,11,0.25)' : '1px solid rgba(255,255,255,0.07)', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: rankColor, border: `1px solid ${rankColor}44`, background: `${rankColor}11`, flexShrink: 0 }}>
            #{c.rank}
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{c.name}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: '#475569' }}>{c.experience} yrs exp</span>
              {c.hire_confidence && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20, background: confidenceColor.bg, border: `1px solid ${confidenceColor.border}`, color: confidenceColor.text }}>
                  {c.hire_confidence} confidence
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: 26, fontWeight: 800, background: 'linear-gradient(90deg, #60A5FA, #818CF8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>{c.score}%</p>
            <p style={{ fontSize: 11, color: '#334155', marginTop: 2 }}>match</p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, background: c.verdict === 'Selected' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: c.verdict === 'Selected' ? '#4ADE80' : '#F87171', border: c.verdict === 'Selected' ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(239,68,68,0.2)' }}>
            {c.verdict}
          </span>
          {expanded ? <ChevronUp size={16} color="#334155" /> : <ChevronDown size={16} color="#334155" />}
        </div>
      </div>

      {expanded && (
        <div style={{ padding: '0 24px 24px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: 20 }}>

          {/* Decisive reason */}
          {c.decisive_reason && (
            <div style={{ padding: '12px 16px', borderRadius: 12, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)', marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#3B82F6', marginBottom: 4 }}>Recruiter take</p>
              <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6 }}>{c.decisive_reason}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

            {/* Scorecard */}
            {c.scorecard && Object.keys(c.scorecard).length > 0 && (
              <div>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Scorecard</p>
                <ScoreBar label="Technical" value={c.scorecard.technical_score ?? 0} />
                <ScoreBar label="Experience" value={c.scorecard.experience_score ?? 0} />
                <ScoreBar label="Growth" value={c.scorecard.growth_score ?? 0} />
                <ScoreBar label="Communication" value={c.scorecard.communication_score ?? 0} />
              </div>
            )}

            {/* Matched skills */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Matched skills</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {c.matched_skills?.slice(0, 8).map((s, i) => (
                  <span key={i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)', color: '#4ADE80' }}>{s}</span>
                ))}
                {c.matched_skills?.length > 8 && <span style={{ fontSize: 11, color: '#334155' }}>+{c.matched_skills.length - 8} more</span>}
                {!c.matched_skills?.length && <p style={{ fontSize: 12, color: '#334155' }}>None identified</p>}
              </div>

              {c.hard_gaps?.length > 0 && (
                <div style={{ marginTop: 14 }}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Hard gaps</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {c.hard_gaps.map((s, i) => (
                      <span key={i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)', color: '#F87171' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Red flags */}
          {c.red_flags?.length > 0 && (
            <div style={{ padding: '14px 16px', borderRadius: 12, background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.12)', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <AlertTriangle size={14} color="#F87171" />
                <p style={{ fontSize: 11, fontWeight: 600, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Red flags</p>
              </div>
              <ul style={{ margin: 0, paddingLeft: 16 }}>
                {c.red_flags.map((f, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Reasoning */}
          {c.reasoning && (
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Reasoning</p>
              <p style={{ fontSize: 13, color: '#64748B', lineHeight: 1.7 }}>{c.reasoning}</p>
            </div>
          )}

          {/* Interview questions */}
          {c.interview_questions?.length > 0 && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <MessageSquare size={14} color="#3B82F6" />
                <p style={{ fontSize: 11, fontWeight: 600, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Suggested interview questions</p>
              </div>
              <ol style={{ margin: 0, paddingLeft: 18 }}>
                {c.interview_questions.map((q, i) => (
                  <li key={i} style={{ fontSize: 13, color: '#64748B', lineHeight: 1.8 }}>{q}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Ranking() {
  const navigate = useNavigate()
  const [resumeFiles, setResumeFiles] = useState([])
  const [jdFile, setJdFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState(null)
  const [recruiterNote, setRecruiterNote] = useState('')
  const [error, setError] = useState(null)

  const addResumes = (files) => setResumeFiles(prev => [...prev, ...Array.from(files)])
  const removeResume = (i) => setResumeFiles(prev => prev.filter((_, idx) => idx !== i))

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
      setRecruiterNote(data.recruiter_note || '')
    } catch (err) {
      setError('Could not connect to the backend.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#03060F', minHeight: '100vh', color: 'white' }}>
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(3,6,15,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 50 }}>
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

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '48px 24px', position: 'relative', zIndex: 1 }}>

        {!results ? (
          <>
            <div style={{ marginBottom: 32 }}>
              <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Candidate Ranking</h1>
              <p style={{ fontSize: 14, color: '#475569' }}>Upload multiple resumes and one job description to get a ranked shortlist with head-to-head analysis.</p>
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

            <div style={{ marginBottom: 24 }} onClick={() => document.getElementById('jd-rank-input').click()}>
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
              {loading ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Ranking candidates...</> : <><Trophy size={16} /> Rank Candidates</>}
            </button>
            {loading && <p style={{ textAlign: 'center', fontSize: 12, color: '#334155', marginTop: 10 }}>Running individual evaluations then head-to-head comparison · May take 1–2 minutes</p>}
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>Ranked Shortlist</h1>
                <p style={{ fontSize: 14, color: '#475569' }}>{results.length} candidates · head-to-head analysis complete</p>
              </div>
              <button onClick={() => { setResults(null); setResumeFiles([]); setJdFile(null) }}
                style={{ fontSize: 13, padding: '8px 20px', borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: '#94A3B8', cursor: 'pointer' }}>
                New Ranking
              </button>
            </div>

            {recruiterNote && (
              <div style={{ padding: '16px 20px', borderRadius: 14, background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.15)', marginBottom: 24 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: '#3B82F6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6 }}>Recruiter summary</p>
                <p style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.7 }}>{recruiterNote}</p>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {results.map((c, i) => <CandidateCard key={i} c={c} index={i} />)}
            </div>
          </>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}