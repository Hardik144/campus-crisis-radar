import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { AlertTriangle, X, ArrowLeft, Phone, MapPin, Clock, Shield } from 'lucide-react'
import { api } from '../../api/api'

export default function PanicPage() {
  const navigate = useNavigate()
  const [state, setState] = useState('ready')
  const [countdown, setCountdown] = useState(3)
  const [coords, setCoords] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setCoords(null)
      )
    }
  }, [])

  useEffect(() => {
    if (state !== 'activating') return
    if (countdown === 0) {
      sendPanic()
      return
    }
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [state, countdown])

  const sendPanic = async () => {
    try {
      await api.post('/emergency/panic', {
        message: 'Emergency panic button activated. Immediate assistance required.',
        location: coords
          ? { latitude: coords.lat, longitude: coords.lng, address: 'GPS location captured' }
          : { address: 'Location unavailable' },
      })
      setState('activated')
    } catch (err) {
      setError(err.message || 'Failed to send alert. Call ext. 1800 immediately.')
      setState('ready')
    }
  }

  const cancel = () => {
    setState('ready')
    setCountdown(3)
    setError('')
  }

  if (state === 'activated') {
    return (
      <div className="min-h-screen bg-radar-red flex flex-col items-center justify-center p-6 animate-fade_up">
        <div className="max-w-md w-full space-y-5">
          <div className="flex justify-center">
            <div className="relative flex items-center justify-center w-20 h-20">
              <span className="absolute w-full h-full rounded-full bg-white opacity-20 animate-pulse_ring" />
              <span className="absolute w-full h-full rounded-full bg-white opacity-10 animate-pulse_ring" style={{ animationDelay: '0.4s' }} />
              <Shield size={32} className="text-white relative z-10" />
            </div>
          </div>
          <div className="text-center">
            <div className="font-display text-5xl tracking-widest text-white mb-2">ALERT SENT</div>
            <p className="text-white/80 font-body text-base">Help is on the way</p>
          </div>
          <div className="space-y-2">
            <div className="bg-white/10 border border-white/20 rounded p-4 flex items-center gap-3">
              <MapPin size={16} className="text-white shrink-0" />
              <div>
                <div className="text-xs font-mono text-white/60 uppercase tracking-widest">GPS Location</div>
                <div className="text-sm font-mono text-white">
                  {coords ? `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : 'Broadcasting...'}
                </div>
              </div>
            </div>
            <div className="bg-white/10 border border-white/20 rounded p-4 flex items-center gap-3">
              <Phone size={16} className="text-white shrink-0" />
              <div>
                <div className="text-xs font-mono text-white/60 uppercase tracking-widest">Emergency Services</div>
                <div className="text-sm font-mono text-white">Campus security notified</div>
              </div>
            </div>
            <div className="bg-white/10 border border-white/20 rounded p-4 flex items-center gap-3">
              <Clock size={16} className="text-white shrink-0" />
              <div>
                <div className="text-xs font-mono text-white/60 uppercase tracking-widest">Response Time</div>
                <div className="text-sm font-mono text-white">ETA ~3–5 minutes</div>
              </div>
            </div>
          </div>
          <div className="pt-2 space-y-2">
            <p className="text-center text-xs font-mono text-white/60 tracking-wider">STAY WHERE YOU ARE · HELP IS COMING</p>
            <button onClick={cancel} className="w-full py-3 border border-white/30 rounded text-white font-mono text-sm tracking-widest hover:bg-white/10 transition-all duration-200">
              CANCEL ALERT (FALSE ALARM)
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (state === 'activating') {
    return (
      <div className="min-h-screen bg-radar-bg flex flex-col items-center justify-center p-6">
        <div className="max-w-sm w-full text-center space-y-6 animate-fade_up">
          <div className="text-xs font-mono text-radar-red tracking-widest animate-blink">● ACTIVATING EMERGENCY ALERT</div>
          <div className="relative flex items-center justify-center mx-auto w-40 h-40">
            <span className="absolute w-full h-full rounded-full border-2 border-radar-red opacity-30 animate-pulse_ring" />
            <span className="absolute w-full h-full rounded-full border-2 border-radar-red opacity-20 animate-pulse_ring" style={{ animationDelay: '0.5s' }} />
            <div className="relative z-10 w-36 h-36 rounded-full border-2 border-radar-red bg-red-950 flex flex-col items-center justify-center">
              <span className="font-display text-6xl text-radar-red leading-none">{countdown}</span>
              <span className="text-xs font-mono text-red-400 tracking-widest">SECONDS</span>
            </div>
          </div>
          <div>
            <div className="font-display text-2xl tracking-widest text-radar-text mb-1">SENDING ALERT</div>
            <p className="text-sm font-body text-radar-dim">Alert will be sent in {countdown} second{countdown !== 1 ? 's' : ''}...</p>
          </div>
          <button onClick={cancel} className="w-full flex items-center justify-center gap-2 py-3 border border-radar-border rounded text-radar-dim hover:text-radar-text hover:border-radar-muted font-mono text-sm tracking-widest transition-all duration-200">
            <X size={14} />
            CANCEL
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-5 max-w-md mx-auto animate-fade_up">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/student')} className="p-2 rounded border border-radar-border text-radar-dim hover:text-radar-text hover:border-radar-muted transition-all">
          <ArrowLeft size={16} />
        </button>
        <div>
          <div className="text-xs font-mono text-radar-dim tracking-widest uppercase">Emergency System</div>
          <h1 className="font-display text-2xl tracking-widest text-radar-text">PANIC ALERT</h1>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950 border border-red-900 rounded mb-4 text-xs font-mono text-red-400">{error}</div>
      )}

      <div className="card p-4 border-amber-900 bg-amber-950 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-mono text-amber-400 tracking-widest uppercase mb-1">Warning</div>
            <p className="text-xs font-body text-amber-300/80 leading-relaxed">
              This button triggers an immediate emergency alert to campus security. Only use in genuine emergencies. False activations may result in disciplinary action.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center py-8 space-y-4">
        <div className="relative">
          <span className="absolute inset-0 rounded-full bg-radar-red opacity-10 scale-110" />
          <button
            onClick={() => setState('activating')}
            className="relative w-44 h-44 rounded-full bg-radar-red border-4 border-red-700 text-white font-display tracking-widest text-2xl hover:bg-radar-red-bright hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg shadow-red-900/50 flex flex-col items-center justify-center gap-1"
          >
            <AlertTriangle size={36} />
            <span className="text-lg tracking-[0.2em]">EMERGENCY</span>
          </button>
        </div>
        <p className="text-xs font-mono text-radar-dim tracking-wider text-center">TAP · 3-SECOND CONFIRMATION</p>
      </div>

      <div className="card p-5 space-y-3">
        <div className="text-xs font-mono text-radar-dim tracking-widest uppercase mb-3">What happens when you press:</div>
        {[
          '3-second countdown begins (can cancel)',
          'Your GPS location is captured and broadcast',
          'Campus security receives instant alert',
          'Incident is logged automatically as CRITICAL',
          'Security ETA: approximately 3–5 minutes',
        ].map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-xs font-mono text-radar-red w-4 shrink-0 mt-0.5">{String(i + 1).padStart(2, '0')}</span>
            <span className="text-xs font-body text-radar-dim leading-relaxed">{step}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 border border-radar-border rounded flex items-center justify-between">
        <span className="text-xs font-mono text-radar-dim tracking-wider">CAMPUS EMERGENCY LINE</span>
        <span className="text-sm font-mono text-radar-text font-bold">ext. 1800</span>
      </div>

      {coords && (
        <div className="mt-2 p-3 border border-green-900 bg-green-950 rounded flex items-center justify-between">
          <span className="text-xs font-mono text-green-400 tracking-wider">GPS READY</span>
          <span className="text-xs font-mono text-green-400">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
        </div>
      )}
    </div>
  )
}
