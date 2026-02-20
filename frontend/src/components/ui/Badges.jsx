import { getStatusClass, getPriorityClass } from '../../utils/helpers'

export function StatusBadge({ status }) {
  const labels = { pending: 'PENDING', investigating: 'INVESTIGATING', resolved: 'RESOLVED' }
  return <span className={getStatusClass(status)}>{labels[status] || status.toUpperCase()}</span>
}

export function PriorityBadge({ priority }) {
  const labels = { critical: '● CRITICAL', high: '● HIGH', medium: '● MEDIUM', low: '● LOW' }
  return <span className={getPriorityClass(priority)}>{labels[priority] || priority.toUpperCase()}</span>
}
