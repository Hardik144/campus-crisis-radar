import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import {
  Shield,
  LayoutDashboard,
  FilePlus,
  AlertTriangle,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronRight,
  Activity,
} from "lucide-react";
import { connectSocket } from "../../api/socket";
function getUser() {
  try {
    return JSON.parse(localStorage.getItem("ccr_user"));
  } catch {
    return null;
  }
}

const studentNav = [
  { to: "/student", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/student/report", label: "Report Incident", icon: FilePlus },
  { to: "/student/panic", label: "Emergency Panic", icon: AlertTriangle },
];

const adminNav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
];

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const user = getUser();
  const navItems = user?.role === "admin" ? adminNav : studentNav;

  const handleLogout = () => {
    localStorage.removeItem("ccr_user");
    navigate("/login");
  };
  useEffect(() => {
    connectSocket();
  }, []);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="p-5 border-b border-radar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-radar-red flex items-center justify-center rounded shrink-0">
            <Shield size={15} className="text-white" />
          </div>
          <div>
            <div className="font-display text-base tracking-widest text-radar-text leading-none">
              CCR
            </div>
            <div className="text-[10px] font-mono text-radar-dim tracking-widest">
              CRISIS RADAR
            </div>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-radar-border">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-radar-muted flex items-center justify-center shrink-0">
            <span className="text-xs font-mono font-bold text-radar-text">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="min-w-0">
            <div className="text-sm font-body font-medium text-radar-text truncate">
              {user?.name || "User"}
            </div>
            <div className="text-[10px] font-mono text-radar-dim uppercase tracking-widest">
              {user?.role}
            </div>
          </div>
          <div className="ml-auto">
            <span className="flex items-center gap-1 text-[10px] font-mono text-green-400">
              <Activity size={8} className="animate-pulse" />
              LIVE
            </span>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="text-[10px] font-mono text-radar-dim tracking-widest px-3 py-2 uppercase">
          Navigation
        </div>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded text-sm font-body font-medium transition-all duration-150 group ${
                isActive
                  ? "bg-radar-red text-white"
                  : "text-radar-dim hover:text-radar-text hover:bg-radar-muted"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={15} className="shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <ChevronRight size={12} />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-radar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded text-sm font-body font-medium text-radar-dim hover:text-radar-red hover:bg-red-950 transition-all duration-150"
        >
          <LogOut size={15} />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-radar-bg overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-radar-border bg-radar-surface shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="relative z-10 flex flex-col w-64 bg-radar-surface border-r border-radar-border animate-slide_in">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-radar-dim hover:text-radar-text"
            >
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-radar-border bg-radar-surface shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-radar-dim hover:text-radar-text"
          >
            <Menu size={20} />
          </button>
          <span className="font-display text-lg tracking-widest">CCR</span>
          <Bell size={18} className="text-radar-dim" />
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
