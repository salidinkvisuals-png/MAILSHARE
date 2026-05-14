import React from "react";
import { NavLink, Outlet, Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { LayoutDashboard, Mail, Filter, Share2, Inbox, Activity, LogOut } from "lucide-react";

const NAV = [
  { to: "/app", label: "Overview", icon: LayoutDashboard, end: true, code: "00" },
  { to: "/app/accounts", label: "Accounts", icon: Mail, code: "01" },
  { to: "/app/filters", label: "Filters", icon: Filter, code: "02" },
  { to: "/app/shares", label: "Shared Access", icon: Share2, code: "03" },
  { to: "/app/shared", label: "Shared with me", icon: Inbox, code: "04" },
  { to: "/app/activity", label: "Activity Log", icon: Activity, code: "05" },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex bg-white text-neutral-950">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 border-r border-neutral-900 hidden lg:flex flex-col" data-testid="sidebar">
        <Link to="/" className="h-16 px-5 flex items-center gap-3 border-b border-neutral-900">
          <div className="w-7 h-7 bg-neutral-950 flex items-center justify-center">
            <span className="font-heading font-black text-white text-sm">M</span>
          </div>
          <span className="font-heading font-bold tracking-tight">MAILSHARE</span>
        </Link>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              data-testid={`nav-${n.label.toLowerCase().replace(/\s+/g, "-")}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 border border-transparent font-mono text-xs uppercase tracking-wider transition-colors ${
                  isActive
                    ? "bg-neutral-950 text-white"
                    : "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950"
                }`
              }
            >
              <span className="opacity-50">{n.code}</span>
              <n.icon size={15} strokeWidth={1.75} />
              <span>{n.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-neutral-900 p-3">
          <div className="px-3 py-2 mb-2">
            <div className="overline">Signed in</div>
            <div className="font-mono text-xs text-neutral-950 mt-1 truncate" data-testid="sidebar-user-email">{user?.email}</div>
          </div>
          <button
            onClick={onLogout}
            data-testid="sidebar-logout-button"
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 border border-neutral-950 font-mono text-xs uppercase tracking-wider hover:bg-neutral-950 hover:text-white transition-colors"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-white border-b border-neutral-900 px-4 flex items-center justify-between">
        <Link to="/app" className="font-heading font-bold tracking-tight">MAILSHARE</Link>
        <button onClick={onLogout} className="font-mono text-xs uppercase">Log out</button>
      </div>

      <main className="flex-1 min-w-0 lg:ml-0 mt-14 lg:mt-0">
        {/* Mobile nav strip */}
        <div className="lg:hidden border-b border-neutral-900 overflow-x-auto">
          <div className="flex">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({isActive}) => `whitespace-nowrap px-4 py-3 font-mono text-[11px] uppercase tracking-wider border-r border-neutral-300 ${isActive ? "bg-neutral-950 text-white" : ""}`}>
                {n.label}
              </NavLink>
            ))}
          </div>
        </div>
        <Outlet />
      </main>
    </div>
  );
}
