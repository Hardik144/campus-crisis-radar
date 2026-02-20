import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import AuthLayout from './components/layout/AuthLayout'
import MainLayout from './components/layout/MainLayout'
import ProtectedRoute from './components/ui/ProtectedRoute'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import StudentDashboard from './pages/student/StudentDashboard'
import ReportIncident from './pages/student/ReportIncident'
import PanicPage from './pages/student/PanicPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import IncidentDetail from './pages/IncidentDetail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Root redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Student routes */}
        <Route
          element={
            <ProtectedRoute requiredRole="student">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/student/report" element={<ReportIncident />} />
          <Route path="/student/panic" element={<PanicPage />} />
          <Route path="/student/incident/:id" element={<IncidentDetail />} />
        </Route>

        {/* Admin routes */}
        <Route
          element={
            <ProtectedRoute requiredRole="admin">
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/incident/:id" element={<IncidentDetail />} />
        </Route>

        {/* 404 fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
