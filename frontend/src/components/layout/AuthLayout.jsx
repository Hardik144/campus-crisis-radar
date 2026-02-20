import { Outlet } from 'react-router'
import { Shield } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-radar-bg flex items-center justify-center p-4">
      {/* Grid background */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#e53e3e 1px, transparent 1px), linear-gradient(90deg, #e53e3e 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Corner decoration */}
      <div className="fixed top-0 left-0 w-32 h-32 border-b border-r border-radar-border opacity-30" />
      <div className="fixed bottom-0 right-0 w-32 h-32 border-t border-l border-radar-border opacity-30" />

      <div className="relative w-full max-w-md">
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-radar-red flex items-center justify-center rounded">
              <Shield size={16} className="text-white" />
            </div>
            <span className="font-display text-2xl tracking-widest text-radar-text">
              CAMPUS CRISIS RADAR
            </span>
          </div>
          <div className="flex items-center gap-2 justify-center">
            <div className="h-px flex-1 bg-radar-border" />
            <span className="text-xs font-mono text-radar-dim tracking-widest">SECURE PORTAL</span>
            <div className="h-px flex-1 bg-radar-border" />
          </div>
        </div>

        <Outlet />

        <p className="text-center text-xs font-mono text-radar-dim mt-6 tracking-wider">
          SRMIST CAMPUS SAFETY SYSTEM · v2.4.1
        </p>
      </div>
    </div>
  )
}
