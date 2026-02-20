import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { AlertTriangle, FilePlus, Bell, MapPin, CheckCircle, ChevronRight } from 'lucide-react'
import { api } from '../../api/api'
import { socket, connectSocket } from '../../api/socket'
import { safetyTips } from '../../data/mockData'
import { StatusBadge } from '../../components/ui/Badges'
import { timeAgo } from '../../utils/helpers'

function getUser() {
  try { return JSON.parse(localStorage.getItem('ccr_user')) } catch { return null }
}

export default function StudentDashboard() {
  const navigate = useNavigate()
  const user = getUser()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [panicAlert, setPanicAlert] = useState(null)

  useEffect(() => {
    api.get('/incidents')
      .then(data => setIncidents(data.incidents || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    connectSocket()
    socket.emit('join_campus')
    socket.on('panic_alert', (data) => {
      setPanicAlert(data)
      setTimeout(() => setPanicAlert(null), 10000)
    })
    socket.on('new_incident', (data) => {
      setIncidents(prev => [data.incident, ...prev])
    })
    return () => {
      socket.off('panic_alert')
      socket.off('new_incident')
    }
  }, [])

  const activeAlerts = incidents.filter(i => i.priority === 'critical' && i.status !== 'resolved')

  return (
    <div className="p-5 max-w-4xl mx-auto space-y-6 animate-fade_up">
      <div className="border-b border-radar-border pb-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs font-mono text-radar-dim tracking-widest uppercase mb-1">Student Portal</div>
            <h1 className="font-display text-4xl tracking-widest text-radar-text">WELCOME BACK</h1>
            <p className="text-sm font-body text-radar-dim mt-1">{user?.name} · Stay safe and informed on campus</p>
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-xs font-mono text-radar-dim">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
            <div className="flex items-center gap-1 justify-end mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs font-mono text-green-400">SYSTEM ACTIVE</span>
            </div>
          </div>
        </div>
      </div>

      {panicAlert && (
        <div className="flex items-center gap-3 p-4 bg-red-950 border-2 border-radar-red rounded animate-fade_up">
          <span className="relative flex h-3 w-3 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-radar-red opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-radar-red-bright" />
          </span>
          <div className="flex-1">
            <div className="text-xs font-mono text-red-300 font-bold tracking-widest">PANIC ALERT RECEIVED</div>
            <div className="text-xs font-mono text-red-400 mt-0.5">
              {panicAlert.triggeredBy?.name} · {panicAlert.location?.address || 'Location broadcasting...'}
            </div>
          </div>
        </div>
      )}

      {activeAlerts.length > 0 && (
        <button
          onClick={() => navigate(`/student/incident/${activeAlerts[0]._id}`)}
          className="w-full flex items-center gap-3 p-3 bg-red-950 border border-radar-red rounded hover:bg-red-900 hover:border-radar-red-bright transition-all duration-150 text-left"
        >
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-radar-red opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-radar-red-bright" />
          </span>
          <span className="text-xs font-mono text-red-300 flex-1">
            {activeAlerts.length} ACTIVE CRITICAL ALERT{activeAlerts.length > 1 ? 'S' : ''} ON CAMPUS — TAP TO VIEW
          </span>
          <ChevronRight size={14} className="text-red-400" />
        </button>
      )}

      <div>
        <div className="text-xs font-mono text-radar-dim tracking-widest uppercase mb-3">Quick Actions</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button onClick={() => navigate('/student/panic')} className="card p-5 text-left border-radar-red bg-red-950 hover:bg-red-900 hover:border-radar-red-bright transition-all duration-200 group hover:scale-[1.02] active:scale-95">
            <AlertTriangle size={22} className="text-radar-red mb-3 group-hover:text-radar-red-bright transition-colors" />
            <div className="font-display text-lg tracking-widest text-red-300 mb-0.5">EMERGENCY</div>
            <div className="text-xs font-body text-red-400">Trigger panic alert</div>
          </button>
          <button onClick={() => navigate('/student/report')} className="card p-5 text-left hover:border-radar-muted hover:bg-radar-muted transition-all duration-200 group hover:scale-[1.02] active:scale-95">
            <FilePlus size={22} className="text-radar-dim mb-3 group-hover:text-radar-text transition-colors" />
            <div className="font-display text-lg tracking-widest text-radar-text mb-0.5">REPORT</div>
            <div className="text-xs font-body text-radar-dim">File an incident report</div>
          </button>
          <div className="card p-5">
            <Bell size={22} className="text-radar-dim mb-3" />
            <div className="font-display text-lg tracking-widest text-radar-text mb-0.5">ALERTS</div>
            <div className="text-xs font-body text-radar-dim">
              {activeAlerts.length > 0 ? <span className="text-radar-red">{activeAlerts.length} active emergency</span> : 'No active emergencies'}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-mono text-radar-dim tracking-widest uppercase">My Reports</div>
          <span className="text-xs font-mono text-radar-dim">{incidents.length} total</span>
        </div>
        {loading ? (
          <div className="card p-8 text-center">
            <p className="text-radar-dim font-mono text-xs tracking-widest animate-blink">LOADING...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-radar-dim font-body text-sm">No incidents reported yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {incidents.slice(0, 5).map((inc) => (
              <button key={inc._id} onClick={() => navigate(`/student/incident/${inc._id}`)} className="card w-full p-4 text-left hover:border-radar-muted transition-all duration-150 group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-mono text-radar-dim mb-1">{inc.type}</div>
                    <div className="text-sm font-body font-medium text-radar-text mb-1 truncate">{inc.title}</div>
                    <div className="text-xs font-body text-radar-dim truncate mb-2">{inc.description}</div>
                    <div className="flex items-center gap-1 text-xs font-mono text-radar-dim">
                      <MapPin size={10} />
                      {inc.location?.address || inc.location}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={inc.status} />
                    <span className="text-xs font-mono text-radar-dim">{timeAgo(inc.createdAt)}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="card p-5 border-radar-border">
        <div className="text-xs font-mono text-radar-dim tracking-widest uppercase mb-4">Safety Guidelines</div>
        <div className="space-y-3">
          {safetyTips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3">
              <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
              <span className="text-sm font-body text-radar-dim leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}