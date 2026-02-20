import { Navigate } from 'react-router'

export default function ProtectedRoute({ children, requiredRole }) {
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('ccr_user')) } catch { return null }
  })()

  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/student'} replace />
  }
  return children
}
