import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { api } from '../../api/api'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'student', terms: false })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password || !form.confirm) return setError('All fields are required.')
    if (form.password !== form.confirm) return setError('Passwords do not match.')
    if (form.password.length < 6) return setError('Password must be at least 6 characters.')
    if (!form.terms) return setError('You must accept the terms.')
    setLoading(true)
    try {
      const data = await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      })
      localStorage.setItem('ccr_user', JSON.stringify({ ...data.user, token: data.token }))
      navigate(data.user.role === 'admin' ? '/admin' : '/student')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="card p-8 border-radar-border">
      <div className="mb-6">
        <h1 className="font-display text-3xl tracking-widest text-radar-text mb-1">REGISTER</h1>
        <p className="text-sm font-body text-radar-dim">Create your campus safety account</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-red-950 border border-red-900 rounded text-red-400 text-sm font-mono">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-radar-dim tracking-widest uppercase mb-1.5">Full Name</label>
          <div className="relative">
            <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-radar-dim" />
            <input type="text" value={form.name} onChange={set('name')} placeholder="Your full name" className="input-field pl-9" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-radar-dim tracking-widest uppercase mb-1.5">Email</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-radar-dim" />
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@srmist.edu" className="input-field pl-9" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-radar-dim tracking-widest uppercase mb-1.5">Password</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-radar-dim" />
            <input type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters" className="input-field pl-9" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-radar-dim tracking-widest uppercase mb-1.5">Confirm Password</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-radar-dim" />
            <input type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" className="input-field pl-9" />
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={form.terms}
            onChange={set('terms')}
            className="mt-0.5 accent-radar-red"
          />
          <span className="text-xs font-body text-radar-dim group-hover:text-radar-text transition-colors">
            I agree to the campus safety terms and acknowledge that false reports may result in disciplinary action.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 mt-2"
        >
          {loading ? (
            <span className="font-mono text-sm tracking-widest">CREATING ACCOUNT...</span>
          ) : (
            <>
              <span className="font-mono text-sm tracking-widest">CREATE ACCOUNT</span>
              <ArrowRight size={14} />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-5 border-t border-radar-border">
        <p className="text-center text-sm font-body text-radar-dim">
          Already registered?{' '}
          <Link to="/login" className="text-radar-red hover:text-radar-red-bright font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
