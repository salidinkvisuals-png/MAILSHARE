import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import {
  LayoutGrid, Mail, Filter, Share2, Inbox, Activity,
  LogOut, Menu, X, ChevronRight
} from "lucide-react";

const navItems = [
  { to: "/app", label: "Overview", icon: LayoutGrid, end: true },
  { to: "/app/accounts", label: "Accounts", icon: Mail },
  { to: "/app/filters", label: "Filters", icon: Filter },
  { to: "/app/shares", label: "My shares", icon: Share2 },
  { to: "/app/shared", label: "Shared with me", icon: Inbox },
  { to: "/app/activity", label: "Activity", icon: Activity },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    nav("/login");
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-14 flex items-center px-6 border-b border-black flex-shrink-0">
        <span className="font-heading font-black text-base tracking-tighter">MAILSHARE</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto" data-testid="sidebar-nav">
        <p className="overline px-6 mb-3">Workspace</p>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-black text-white"
                  : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
              }`
            }
            data-testid={`nav-${label.toLowerCase().replace(/\s+/g, "-")}`}
          >
            <Icon size={16} />
            {label}
            {({ isActive }) => isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-black p-4 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 border border-black bg-neutral-100 flex items-center justify-center font-mono text-xs font-bold">
            {(user?.name || user?.email || "U")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.name || "User"}</p>
            <p className="font-mono text-xs text-neutral-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-neutral-500 hover:text-black hover:bg-neutral-100 transition-colors border border-transparent hover:border-neutral-200"
          data-testid="btn-logout"
        >
          <LogOut size={13} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-50 font-body flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-black bg-white flex-shrink-0 fixed top-0 left-0 h-full z-40">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div className="w-56 bg-white border-r border-black flex flex-col">
            <SidebarContent />
          </div>
          <button
            className="flex-1 bg-black bg-opacity-40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
        </div>
      )}

      {/* Main */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden h-14 border-b border-black bg-white flex items-center px-4 gap-4 sticky top-0 z-30">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1"
            data-testid="mobile-menu-btn"
          >
            <Menu size={20} />
          </button>
          <span className="font-heading font-black text-base tracking-tighter">MAILSHARE</span>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
