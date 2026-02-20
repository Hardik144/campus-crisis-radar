import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Search, ChevronRight, MapPin, User, Activity } from 'lucide-react'
import { api } from '../../api/api'
import { socket } from '../../api/socket'
import { StatusBadge, PriorityBadge } from '../../components/ui/Badges'
import { timeAgo } from '../../utils/helpers'

function getUser() {
  try { return JSON.parse(localStorage.getItem('ccr_user')) } catch { return null }
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const user = getUser()
  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [panicAlerts, setPanicAlerts] = useState([])

  useEffect(() => {
    fetchIncidents()
  }, [statusFilter])

  const fetchIncidents = () => {
    const query = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
    api.get(`/incidents${query}`)
      .then(data => setIncidents(data.incidents || []))
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    socket.emit('join_admin')

    socket.on('new_incident', (data) => {
      setIncidents(prev => [data.incident, ...prev])
    })

    socket.on('incident_update', (data) => {
      setIncidents(prev =>
        prev.map(i => (i._id === data.incidentId ? { ...i, status: data.newStatus } : i))
      )
    })

    socket.on('panic_alert', (data) => {
      setPanicAlerts(prev => [data, ...prev])
      setIncidents(prev => [data.incident, ...prev])
    })

    return () => {
      socket.off('new_incident')
      socket.off('incident_update')
      socket.off('panic_alert')
    }
  }, [])

  const filtered = incidents.filter(inc => {
    const q = search.toLowerCase()
    return !q ||
      inc.title?.toLowerCase().includes(q) ||
      inc.type?.toLowerCase().includes(q) ||
      inc.location?.address?.toLowerCase().includes(q) ||
      inc.reportedBy?.name?.toLowerCase().includes(q)
  })

  const liveAlerts = incidents.filter(i => i.priority === 'critical' && i.status !== 'resolved')

  const stats = {
    total: incidents.length,
    pending: incidents.filter(i => i.status === 'pending').length,
    investigating: incidents.filter(i => i.status === 'investigating').length,
    resolved: incidents.filter(i => i.status === 'resolved').length,
  }

  const statCards = [
    { label: 'TOTAL', value: stats.total, sub: 'all incidents', color: 'text-radar-text', border: 'border-radar-border' },
    { label: 'PENDING', value: stats.pending, sub: 'awaiting response', color: 'text-amber-400', border: 'border-amber-900' },
    { label: 'ACTIVE', value: stats.investigating, sub: 'under investigation', color: 'text-blue-400', border: 'border-blue-900' },
    { label: 'RESOLVED', value: stats.resolved, sub: 'cases closed', color: 'text-green-400', border: 'border-green-900' },
  ]

  return (
    <div className="p-5 space-y-6 animate-fade_up">
      <div className="border-b border-radar-border pb-5 flex items-start justify-between">
        <div>
          <div className="text-xs font-mono text-radar-dim tracking-widest uppercase mb-1">Admin Portal</div>
          <h1 className="font-display text-4xl tracking-widest text-radar-text">ADMIN DASHBOARD</h1>
          <p className="text-sm font-body text-radar-dim mt-1">{user?.name} · Campus incident command center</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Activity size={12} className="text-green-400 animate-pulse" />
          <span className="text-xs font-mono text-green-400">LIVE MONITORING</span>
        </div>
      </div>

      {/* Panic alerts from socket */}
      {panicAlerts.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-mono text-radar-red tracking-widest uppercase animate-blink">
            ● PANIC ALERTS — REQUIRES IMMEDIATE RESPONSE
          </div>
          {panicAlerts.map((alert, i) => (
            <div key={i} className="flex items-center gap-4 p-4 bg-red-950 border-2 border-radar-red rounded">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-radar-red opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-radar-red-bright" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono text-red-200 font-bold">PANIC ALERT — {alert.triggeredBy?.name}</div>
                <div className="text-xs font-mono text-red-400 mt-0.5">
                  {alert.location?.address || 'GPS broadcasting'} · {timeAgo(alert.timestamp)}
                </div>
              </div>
              <button
                onClick={() => navigate(`/admin/incident/${alert.incidentId}`)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-radar-red rounded text-white text-xs font-mono tracking-widest hover:bg-radar-red-bright transition-colors"
              >
                RESPOND <ChevronRight size={11} />
              </button>
              <button onClick={() => setPanicAlerts(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-200 text-xs font-mono">✕</button>
            </div>
          ))}
        </div>
      )}

      {/* Live critical alerts */}
      {liveAlerts.length > 0 && panicAlerts.length === 0 && (
        <div className="space-y-2">
          <div className="text-xs font-mono text-radar-red tracking-widest uppercase">● Live Alerts ({liveAlerts.length})</div>
          {liveAlerts.map(alert => (
            <div key={alert._id} className="flex items-center gap-4 p-4 bg-red-950 border border-radar-red rounded">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-radar-red opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-radar-red-bright" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono text-red-200 font-medium truncate">{alert.title}</div>
                <div className="flex items-center gap-1 text-xs font-mono text-red-400 mt-0.5">
                  <MapPin size={9} />
                  {alert.location?.address || alert.location} · {timeAgo(alert.createdAt)}
                </div>
              </div>
              <button
                onClick={() => navigate(`/admin/incident/${alert._id}`)}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-radar-red rounded text-white text-xs font-mono tracking-widest hover:bg-radar-red-bright transition-colors"
              >
                RESPOND <ChevronRight size={11} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map(s => (
          <div key={s.label} className={`card p-4 border ${s.border}`}>
            <div className="text-xs font-mono text-radar-dim tracking-widest uppercase mb-2">{s.label}</div>
            <div className={`font-display text-4xl tracking-wider ${s.color} mb-1`}>{s.value}</div>
            <div className="text-xs font-body text-radar-dim">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-radar-dim" />
          <input
            type="text"
            placeholder="Search by title, type, location, reporter..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field sm:w-40">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="investigating">Investigating</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Incidents table */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-mono text-radar-dim tracking-widest uppercase">
            Incidents — {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="hidden md:grid grid-cols-[80px_1fr_160px_120px_90px_120px_80px] gap-3 px-4 py-2.5 border-b border-radar-border bg-radar-bg">
            {['PRIORITY', 'INCIDENT', 'LOCATION', 'REPORTER', 'DATE', 'STATUS', ''].map(col => (
              <div key={col} className="text-[10px] font-mono text-radar-dim tracking-widest uppercase">{col}</div>
            ))}
          </div>

          {loading ? (
            <div className="p-10 text-center">
              <p className="text-radar-dim font-mono text-xs tracking-widest animate-blink">LOADING INCIDENTS...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-radar-dim font-body text-sm">No incidents match your filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-radar-border">
              {filtered.map(inc => (
                <div
                  key={inc._id}
                  onClick={() => navigate(`/admin/incident/${inc._id}`)}
                  className="group cursor-pointer hover:bg-radar-muted transition-colors duration-150"
                >
                  {/* Mobile */}
                  <div className="md:hidden p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <PriorityBadge priority={inc.priority} />
                      <StatusBadge status={inc.status} />
                    </div>
                    <div className="font-body font-medium text-sm text-radar-text">{inc.title}</div>
                    <div className="flex items-center gap-3 text-xs font-mono text-radar-dim">
                      <span className="flex items-center gap-1"><MapPin size={9} />{inc.location?.address || inc.location}</span>
                      <span>·</span>
                      <span>{timeAgo(inc.createdAt)}</span>
                    </div>
                  </div>

                  {/* Desktop */}
                  <div className="hidden md:grid grid-cols-[80px_1fr_160px_120px_90px_120px_80px] gap-3 items-center px-4 py-3">
                    <div><PriorityBadge priority={inc.priority} /></div>
                    <div>
                      <div className="text-sm font-body font-medium text-radar-text truncate">{inc.title}</div>
                      <div className="text-xs font-mono text-radar-dim">{inc.type}</div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-mono text-radar-dim truncate">
                      <MapPin size={9} className="shrink-0" />
                      <span className="truncate">{inc.location?.address || inc.location}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-body text-radar-dim truncate">
                      <User size={9} className="shrink-0" />
                      <span className="truncate">
                        {inc.isAnonymous ? 'Anonymous' : inc.reportedBy?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-radar-dim">{timeAgo(inc.createdAt)}</div>
                    <div><StatusBadge status={inc.status} /></div>
                    <div className="flex justify-end">
                      <ChevronRight size={14} className="text-radar-dim group-hover:text-radar-text transition-colors" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
