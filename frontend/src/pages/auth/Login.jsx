import { useState } from 'react'
import { useNavigate, Link } from 'react-router'
import { Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react'
import { api } from '../../api/api'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.email || !form.password) {
      setError('All fields are required.')
      return
    }
    setLoading(true)
    try {
      const data = await api.post('/auth/login', { email: form.email, password: form.password })
      localStorage.setItem('ccr_user', JSON.stringify({ ...data.user, token: data.token }))
      navigate(data.user.role === 'admin' ? '/admin' : '/student')
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
      setLoading(false)
    }
  }

  return (
    <div className="card p-8 border-radar-border">
      <div className="mb-6">
        <h1 className="font-display text-3xl tracking-widest text-radar-text mb-1">SIGN IN</h1>
        <p className="text-sm font-body text-radar-dim">Access your campus safety dashboard</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 mb-4 p-3 bg-red-950 border border-red-900 rounded text-red-400 text-sm font-mono">
          <AlertCircle size={14} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-radar-dim tracking-widest uppercase mb-1.5">Email</label>
          <div className="relative">
            <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-radar-dim" />
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="you@srmist.edu"
              className="input-field pl-9"
              autoComplete="email"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-radar-dim tracking-widest uppercase mb-1.5">Password</label>
          <div className="relative">
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-radar-dim" />
            <input
              type="password"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="••••••••"
              className="input-field pl-9"
              autoComplete="current-password"
            />
          </div>
        </div>

        <div className="pt-1">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 py-2.5"
          >
            {loading ? (
              <span className="font-mono text-sm tracking-widest">AUTHENTICATING...</span>
            ) : (
              <>
                <span className="font-mono text-sm tracking-widest">ACCESS SYSTEM</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </form>

      <div className="mt-6 pt-5 border-t border-radar-border">
        <p className="text-center text-sm font-body text-radar-dim">
          No account?{' '}
          <Link to="/register" className="text-radar-red hover:text-radar-red-bright font-medium transition-colors">
            Register here
          </Link>
        </p>
      </div>

    </div>
  )
}
