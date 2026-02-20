import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router'
import { ArrowLeft, MapPin, User, Clock, MessageSquare, Send, AlertTriangle, Phone, Shield } from 'lucide-react'
import { api } from '../api/api'
import { socket, connectSocket } from '../api/socket'
import { StatusBadge, PriorityBadge } from '../components/ui/Badges'
import { formatDate, timeAgo } from '../utils/helpers'

function getUser() {
  try { return JSON.parse(localStorage.getItem('ccr_user')) } catch { return null }
}

const statusOptions = ['pending', 'investigating', 'resolved']

export default function IncidentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const user = getUser()
  const isAdmin = user?.role === 'admin'

  const [incident, setIncident] = useState(null)
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [submittingNote, setSubmittingNote] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get(`/incidents/${id}`)
      .then(data => {
        setIncident(data.incident)
        setNotes(data.notes || [])
      })
      .catch(() => setError('Failed to load incident.'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    connectSocket()
    socket.on('incident_update', (data) => {
      if (data.incidentId === id) {
        setIncident(prev => prev ? { ...prev, status: data.newStatus } : prev)
      }
    })
    return () => {
      socket.off('incident_update')
    }
  }, [id])

  const handleStatusUpdate = async (status) => {
    setUpdatingStatus(true)
    try {
      await api.put(`/incidents/${id}/status`, { status })
      setIncident(prev => ({ ...prev, status }))
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return
    setSubmittingNote(true)
    try {
      const data = await api.post(`/incidents/${id}/notes`, { note: newNote.trim() })
      setNotes(prev => [...prev, data.note])
      setNewNote('')
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmittingNote(false)
    }
  }

  const backPath = isAdmin ? '/admin' : '/student'

  if (loading) {
    return (
      <div className="p-5 flex items-center justify-center min-h-[60vh]">
        <p className="text-radar-dim font-mono text-xs tracking-widest animate-blink">LOADING INCIDENT...</p>
      </div>
    )
  }

  if (!incident) {
    return (
      <div className="p-5 flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="font-display text-4xl tracking-widest text-radar-dim mb-2">404</div>
          <p className="text-sm font-body text-radar-dim mb-4">{error || 'Incident not found.'}</p>
          <button onClick={() => navigate(backPath)} className="btn-ghost">Go Back</button>
        </div>
      </div>
    )
  }

  const locationAddress = incident.location?.address || incident.location || 'Unknown location'
  const reporterName = incident.isAnonymous && !isAdmin ? 'Anonymous' : incident.reportedBy?.name || 'Unknown'

  return (
    <div className="p-5 max-w-6xl mx-auto animate-fade_up">
      {error && (
        <div className="mb-4 p-3 bg-red-950 border border-red-900 rounded text-xs font-mono text-red-400">{error}</div>
      )}

      <div className="flex items-start gap-3 mb-6">
        <button onClick={() => navigate(backPath)} className="p-2 rounded border border-radar-border text-radar-dim hover:text-radar-text hover:border-radar-muted transition-all shrink-0 mt-1">
          <ArrowLeft size={16} />
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-radar-dim">{incident.type}</span>
          </div>
          <h1 className="font-display text-2xl tracking-widest text-radar-text leading-tight">{incident.title}</h1>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-5">
        {/* LEFT */}
        <div className="space-y-4 min-w-0">
          <div className="card p-5">
            <div className="flex flex-wrap gap-2 mb-4">
              <PriorityBadge priority={incident.priority} />
              <StatusBadge status={incident.status} />
              {incident.isAnonymous && (
                <span className="inline-flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">ANONYMOUS</span>
              )}
            </div>
            <p className="text-sm font-body text-radar-dim leading-relaxed mb-4">{incident.description}</p>
            <div className="grid sm:grid-cols-2 gap-3 pt-4 border-t border-radar-border">
              <div className="flex items-start gap-2">
                <MapPin size={13} className="text-radar-dim mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] font-mono text-radar-dim tracking-widest uppercase mb-0.5">Location</div>
                  <div className="text-sm font-body text-radar-text">{locationAddress}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <User size={13} className="text-radar-dim mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] font-mono text-radar-dim tracking-widest uppercase mb-0.5">Reporter</div>
                  <div className="text-sm font-body text-radar-text">{reporterName}</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Clock size={13} className="text-radar-dim mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] font-mono text-radar-dim tracking-widest uppercase mb-0.5">Reported</div>
                  <div className="text-sm font-mono text-radar-text">{formatDate(incident.createdAt)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Real Map */}
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-radar-border">
              <div className="text-xs font-mono text-radar-dim tracking-widest uppercase">Location Map</div>
              <span className="text-xs font-mono text-radar-dim">
                {incident.location?.latitude
                  ? `${Number(incident.location.latitude).toFixed(6)}, ${Number(incident.location.longitude).toFixed(6)}`
                  : locationAddress}
              </span>
            </div>
            <div className="h-64 w-full">
              {incident.location?.latitude && incident.location?.longitude ? (
                <iframe
                  title="incident-map"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(incident.location.longitude) - 0.003},${Number(incident.location.latitude) - 0.003},${Number(incident.location.longitude) + 0.003},${Number(incident.location.latitude) + 0.003}&layer=mapnik&marker=${incident.location.latitude},${incident.location.longitude}`}
                  allowFullScreen
                />
              ) : (
                <iframe
                  title="incident-map-default"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg)' }}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=80.0400,12.8200,80.0500,12.8270&layer=mapnik&marker=12.8234,80.0451"
                  allowFullScreen
                />
              )}
            </div>
            {!incident.location?.latitude && (
              <div className="px-4 py-2 border-t border-radar-border">
                <p className="text-[10px] font-mono text-radar-dim">
                  No GPS coordinates — showing default SRMIST campus location. GPS is captured when reporter uses the GPS button or panic alert.
                </p>
              </div>
            )}
          </div>

          {/* Notes Timeline */}
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={14} className="text-radar-dim" />
              <div className="text-xs font-mono text-radar-dim tracking-widest uppercase">
                Investigation Timeline ({notes.length})
              </div>
            </div>

            {notes.length === 0 ? (
              <p className="text-sm font-body text-radar-dim text-center py-6">No investigation notes yet.</p>
            ) : (
              <div className="relative">
                <div className="absolute left-3 top-0 bottom-0 w-px bg-radar-border" />
                <div className="space-y-5 pl-8">
                  {notes.map((note, idx) => (
                    <div key={note._id || note.id} className="relative animate-fade_up" style={{ animationDelay: `${idx * 0.1}s` }}>
                      <div className="absolute -left-8 top-1 w-2.5 h-2.5 rounded-full bg-radar-muted border border-radar-border" />
                      <div className="card p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded bg-radar-muted flex items-center justify-center">
                              <span className="text-[9px] font-mono font-bold text-radar-dim">
                                {(note.addedBy?.name || note.author || 'A')[0]?.toUpperCase()}
                              </span>
                            </div>
                            <span className="text-xs font-mono text-radar-text">{note.addedBy?.name || note.author}</span>
                            <span className="text-[10px] font-mono text-radar-dim uppercase tracking-widest">{note.addedBy?.role || 'admin'}</span>
                          </div>
                          <span className="text-[10px] font-mono text-radar-dim">{timeAgo(note.createdAt || note.timestamp)}</span>
                        </div>
                        <p className="text-sm font-body text-radar-dim leading-relaxed">{note.note || note.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {isAdmin && (
              <form onSubmit={handleAddNote} className="mt-5 pt-4 border-t border-radar-border">
                <div className="text-xs font-mono text-radar-dim tracking-widest uppercase mb-2">Add Note</div>
                <div className="flex gap-2">
                  <textarea
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    placeholder="Add investigation note..."
                    rows={2}
                    className="input-field resize-none flex-1 text-sm"
                  />
                  <button type="submit" disabled={submittingNote || !newNote.trim()} className="btn-primary px-3 flex items-center gap-1 self-start">
                    <Send size={13} />
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="space-y-4">
          {isAdmin && (
            <div className="card p-4">
              <div className="text-xs font-mono text-radar-dim tracking-widest uppercase mb-3">Update Status</div>
              <div className="space-y-2">
                {statusOptions.map(s => (
                  <button
                    key={s}
                    onClick={() => handleStatusUpdate(s)}
                    disabled={updatingStatus || incident.status === s}
                    className={`w-full py-2 rounded border text-xs font-mono tracking-widest uppercase transition-all duration-150 ${
                      incident.status === s
                        ? s === 'pending' ? 'bg-amber-950 border-amber-800 text-amber-400'
                          : s === 'investigating' ? 'bg-blue-950 border-blue-800 text-blue-400'
                          : 'bg-green-950 border-green-800 text-green-400'
                        : 'border-radar-border text-radar-dim hover:border-radar-muted hover:text-radar-text disabled:opacity-40'
                    }`}
                  >
                    {incident.status === s ? `● ${s}` : s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="card p-4">
              <div className="text-xs font-mono text-radar-dim tracking-widest uppercase mb-3">Quick Actions</div>
              <div className="space-y-2">
                {[
                  { icon: Shield, label: 'Dispatch Security' },
                  { icon: Phone, label: 'Contact Reporter' },
                  { icon: AlertTriangle, label: 'Escalate Priority' },
                ].map(({ icon: Icon, label }) => (
                  <button key={label} className="w-full flex items-center gap-3 px-3 py-2 rounded border border-radar-border text-radar-dim hover:border-radar-muted hover:text-radar-text transition-all text-xs font-mono tracking-wider">
                    <Icon size={12} />
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="card p-4">
            <div className="text-xs font-mono text-radar-dim tracking-widest uppercase mb-3">Reporter</div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded bg-radar-muted flex items-center justify-center shrink-0">
                <span className="text-sm font-mono font-bold text-radar-text">
                  {incident.isAnonymous ? '?' : reporterName[0]?.toUpperCase()}
                </span>
              </div>
              <div>
                <div className="text-sm font-body font-medium text-radar-text">{reporterName}</div>
                <div className="text-xs font-mono text-radar-dim">Student</div>
              </div>
            </div>
            {incident.isAnonymous && (
              <p className="text-xs font-mono text-radar-dim">Identity protected by anonymous report.</p>
            )}
          </div>

          <div className="card p-4">
            <div className="text-xs font-mono text-radar-dim tracking-widest uppercase mb-3">Emergency Contacts</div>
            <div className="space-y-2">
              {[['Campus Security', 'Ext. 1800'], ['Medical Center', 'Ext. 1822'], ['National Emergency', '112']].map(([label, num]) => (
                <div key={label} className="flex justify-between items-center">
                  <span className="text-xs font-body text-radar-dim">{label}</span>
                  <span className="text-xs font-mono text-radar-text">{num}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}