import { useNavigate } from 'react-router-dom'
import { Brain, Zap, Shield, ArrowRight, BarChart3, FileText, CheckCircle, Star, Users, Clock, TrendingUp } from 'lucide-react'

const testimonials = [
  { name: 'Sarah Chen', role: 'Head of Talent @ Nexus', text: 'ScreenIQ cut our screening time from 3 days to 20 minutes. It\'s the first AI tool that actually works the way we think.', rating: 5 },
  { name: 'Marcus Reid', role: 'Recruiting Lead @ Orbit', text: 'The potential-first matching is a game changer. We hired two people ScreenIQ flagged that we would have passed on manually.', rating: 5 },
  { name: 'Priya Nair', role: 'HR Director @ Stackline', text: 'Onboarded in 10 minutes, processed 40 candidates in an afternoon. The PDF reports alone are worth it.', rating: 5 },
]

const tiers = [
  {
    name: 'Starter',
    price: 'Free',
    desc: 'Perfect for trying it out',
    features: ['10 screenings/month', 'PDF reports', 'Email notifications', 'Basic skill matching'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$49',
    period: '/mo',
    desc: 'For active recruiting teams',
    features: ['Unlimited screenings', 'AI interview module', 'Priority processing', 'Advanced gap analysis', 'Custom scoring rubric'],
    cta: 'Start Free Trial',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    desc: 'For large organizations',
    features: ['Everything in Pro', 'SSO & SAML', 'API access', 'Dedicated support', 'Custom integrations'],
    cta: 'Contact Sales',
    highlight: false,
  },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#03060F' }}>

      {/* Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{
          position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
          width: '1000px', height: '600px',
          background: 'radial-gradient(ellipse, rgba(59,130,246,0.1) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }} />
      </div>

      {/* Navbar */}
      <nav className="relative z-50 flex items-center justify-between px-8 py-4 sticky top-0 backdrop-blur-xl"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: 'rgba(3,6,15,0.85)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
            <Brain size={16} className="text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">ScreenIQ</span>
        </div>
        <div className="flex items-center gap-8">
          <a href="#features" className="text-sm font-medium transition-colors" style={{ color: '#64748B' }}
            onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#64748B'}>Features</a>
          <a href="#testimonials" className="text-sm font-medium transition-colors" style={{ color: '#64748B' }}
            onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#64748B'}>Testimonials</a>
          <a href="#pricing" className="text-sm font-medium transition-colors" style={{ color: '#64748B' }}
            onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#64748B'}>Pricing</a>
          <button onClick={() => navigate('/dashboard')}
            className="text-white text-sm font-semibold px-5 py-2 rounded-xl transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)', boxShadow: '0 0 20px rgba(59,130,246,0.25)' }}>
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center text-center px-6 pt-24 pb-16">
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full text-xs font-semibold"
            style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60A5FA' }}>
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            Powered by GPT-4o · 3 Specialized AI Agents
          </div>

          <h1 style={{ letterSpacing: '-0.03em', lineHeight: 1.05 }}
            className="text-6xl md:text-7xl font-black mb-6">
            The AI that screens
            <br />
            <span style={{
              background: 'linear-gradient(90deg, #60A5FA 0%, #818CF8 50%, #38BDF8 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              candidates for you
            </span>
          </h1>

          <p className="text-xl max-w-xl mx-auto mb-10 leading-relaxed font-light" style={{ color: '#64748B' }}>
            Upload a resume. Drop a job description. Get a full AI-powered evaluation, skill breakdown, and candidate verdict in under 30 seconds.
          </p>

          <div className="flex items-center justify-center gap-3 mb-4">
            <button onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl transition hover:opacity-90 text-sm"
              style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)', boxShadow: '0 8px 32px rgba(59,130,246,0.35)' }}>
              Start Screening Free <ArrowRight size={16} />
            </button>
            <a href="#how"
              className="flex items-center gap-2 font-semibold px-8 py-3.5 rounded-xl transition text-sm"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)', color: '#94A3B8' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}>
              See how it works
            </a>
          </div>
          <p className="text-xs mb-16" style={{ color: '#334155' }}>No credit card required · Free forever plan available</p>

          {/* Hero mockup */}
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute bottom-0 left-0 right-0 h-40 z-10 pointer-events-none"
              style={{ background: 'linear-gradient(to top, #03060F, transparent)' }} />
            <div className="absolute -inset-6 rounded-3xl opacity-20 blur-3xl"
              style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }} />
            <div className="relative rounded-2xl overflow-hidden"
              style={{ background: '#080F1E', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div className="flex items-center gap-2 px-4 py-3"
                style={{ background: '#050B16', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(239,68,68,0.5)' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(234,179,8,0.5)' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: 'rgba(34,197,94,0.5)' }} />
                <div className="flex-1 rounded-md h-5 mx-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }} />
              </div>
              <div className="p-6">
                <div className="rounded-xl p-5 mb-4 flex items-center justify-between"
                  style={{ background: 'rgba(34,197,94,0.07)', border: '1px solid rgba(34,197,94,0.15)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(34,197,94,0.15)' }}>
                      <CheckCircle size={22} style={{ color: '#4ADE80' }} />
                    </div>
                    <div className="text-left">
                      <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: '#475569' }}>Verdict</p>
                      <p className="font-black text-xl" style={{ color: '#4ADE80' }}>Selected</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-widest mb-0.5" style={{ color: '#475569' }}>Match Score</p>
                    <p className="font-black text-3xl" style={{
                      background: 'linear-gradient(90deg, #60A5FA, #818CF8)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
                    }}>85%</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Python', 'FastAPI', 'SQL', 'AWS', 'React', 'Machine Learning', 'Docker'].map(s => (
                    <span key={s} className="text-xs font-medium px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60A5FA' }}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}
        className="relative py-10">
        <div className="max-w-4xl mx-auto grid grid-cols-3 text-center">
          {[
            { value: '30s', label: 'Average screening time', icon: <Clock size={16} /> },
            { value: '85%', label: 'Reduction in manual review', icon: <TrendingUp size={16} /> },
            { value: '3x', label: 'Faster time to hire', icon: <Users size={16} /> },
          ].map((s, i) => (
            <div key={i} className="px-8 py-4"
              style={{ borderRight: i < 2 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
              <p className="text-4xl font-black mb-1" style={{
                background: 'linear-gradient(90deg, #60A5FA, #818CF8)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
              }}>{s.value}</p>
              <p className="text-sm" style={{ color: '#475569' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="relative px-8 py-28 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: '#3B82F6' }}>Features</p>
          <h2 className="text-4xl font-black tracking-tight mb-4">Built for serious recruiters</h2>
          <p className="text-sm max-w-md mx-auto leading-relaxed" style={{ color: '#475569' }}>
            Three specialized AI agents work in parallel to give you a complete picture of every candidate.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: <Zap size={18} />, title: 'Instant Analysis', desc: 'Get a full candidate evaluation in under 30 seconds. No waiting, no delays.' },
            { icon: <Brain size={18} />, title: 'Potential-First Matching', desc: 'Our AI finds bridgeable skill gaps — so you never miss a great hire due to minor mismatches.' },
            { icon: <Shield size={18} />, title: 'Automated Outreach', desc: 'Selected candidates get document requests and interview scheduling emails automatically.' },
          ].map((f, i) => (
            <div key={i} className="rounded-2xl p-7 transition-all duration-300 cursor-default"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => e.currentTarget.style.border = '1px solid rgba(59,130,246,0.3)'}
              onMouseLeave={e => e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 text-blue-400"
                style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}>
                {f.icon}
              </div>
              <h3 className="font-semibold mb-2 text-white">{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="relative px-8 py-28" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: '#3B82F6' }}>Process</p>
            <h2 className="text-4xl font-black tracking-tight">Three steps to a smarter hire</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { step: '01', icon: <FileText size={18} />, title: 'Upload Resume & JD', desc: 'Drop in the candidate resume and job description as PDFs.' },
              { step: '02', icon: <Brain size={18} />, title: 'AI Agents Analyze', desc: 'Three specialized agents extract, compare, and evaluate simultaneously.' },
              { step: '03', icon: <BarChart3 size={18} />, title: 'Get Your Report', desc: 'Receive a verdict, skill match score, and downloadable PDF report instantly.' }
            ].map((s, i) => (
              <div key={i}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-blue-400"
                    style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.15)' }}>
                    {s.icon}
                  </div>
                  <span className="text-xs font-bold tracking-widest" style={{ color: 'rgba(59,130,246,0.4)' }}>{s.step}</span>
                </div>
                <h3 className="font-semibold mb-2">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="relative px-8 py-28" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: '#3B82F6' }}>Testimonials</p>
            <h2 className="text-4xl font-black tracking-tight">Loved by recruiting teams</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <div key={i} className="rounded-2xl p-7"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} fill="#F59E0B" style={{ color: '#F59E0B' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: '#94A3B8' }}>"{t.text}"</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs" style={{ color: '#475569' }}>{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="relative px-8 py-28" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-bold uppercase tracking-[0.25em] mb-3" style={{ color: '#3B82F6' }}>Pricing</p>
            <h2 className="text-4xl font-black tracking-tight mb-4">Simple, transparent pricing</h2>
            <p className="text-sm" style={{ color: '#475569' }}>Start free. Scale when you're ready.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((tier, i) => (
              <div key={i} className="rounded-2xl p-7 relative"
                style={{
                  background: tier.highlight ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.02)',
                  border: tier.highlight ? '1px solid rgba(59,130,246,0.4)' : '1px solid rgba(255,255,255,0.06)',
                }}>
                {tier.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                    style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)', color: '#fff' }}>
                    Most Popular
                  </div>
                )}
                <p className="font-bold text-sm mb-1">{tier.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <p className="text-4xl font-black">{tier.price}</p>
                  {tier.period && <p className="text-sm mb-2" style={{ color: '#475569' }}>{tier.period}</p>}
                </div>
                <p className="text-xs mb-6" style={{ color: '#475569' }}>{tier.desc}</p>
                <ul className="space-y-2.5 mb-8">
                  {tier.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm" style={{ color: '#94A3B8' }}>
                      <CheckCircle size={14} style={{ color: tier.highlight ? '#60A5FA' : '#334155', flexShrink: 0 }} />
                      {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/dashboard')}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold transition hover:opacity-90"
                  style={{
                    background: tier.highlight ? 'linear-gradient(135deg, #2563EB, #4F46E5)' : 'rgba(255,255,255,0.06)',
                    color: tier.highlight ? '#fff' : '#94A3B8',
                    border: tier.highlight ? 'none' : '1px solid rgba(255,255,255,0.08)',
                  }}>
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative px-8 py-28" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-2xl mx-auto text-center">
          <div className="relative rounded-3xl p-14"
            style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(79,70,229,0.08))', border: '1px solid rgba(59,130,246,0.2)' }}>
            <div className="absolute inset-0 rounded-3xl blur-3xl opacity-20"
              style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }} />
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)', boxShadow: '0 8px 32px rgba(59,130,246,0.4)' }}>
                <Brain size={24} className="text-white" />
              </div>
              <h2 className="text-4xl font-black mb-4 tracking-tight">Ready to hire smarter?</h2>
              <p className="mb-8 text-sm leading-relaxed" style={{ color: '#64748B' }}>
                Join hundreds of recruiters saving hours every week.<br />Start free — no credit card required.
              </p>
              <button onClick={() => navigate('/dashboard')}
                className="inline-flex items-center gap-2 text-white font-semibold px-8 py-3.5 rounded-xl transition hover:opacity-90 text-sm"
                style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)', boxShadow: '0 8px 32px rgba(59,130,246,0.4)' }}>
                Get Started Free <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-8 flex items-center justify-between text-sm"
        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #2563EB, #4F46E5)' }}>
            <Brain size={14} className="text-white" />
          </div>
          <span className="font-bold" style={{ color: '#94A3B8' }}>ScreenIQ</span>
        </div>
        <div className="flex items-center gap-8">
          {['Features', 'Pricing', 'Privacy', 'Terms'].map(l => (
            <a key={l} href="#" className="text-xs transition-colors" style={{ color: '#334155' }}
              onMouseEnter={e => e.target.style.color = '#94A3B8'}
              onMouseLeave={e => e.target.style.color = '#334155'}>{l}</a>
          ))}
        </div>
        <span className="text-xs" style={{ color: '#1E293B' }}>© 2026 ScreenIQ</span>
      </footer>

    </div>
  )
}